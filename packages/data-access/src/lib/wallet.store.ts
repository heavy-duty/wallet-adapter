import { Inject, Injectable, InjectionToken } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import {
  SolanaMobileWalletAdapter,
  SolanaMobileWalletAdapterWalletName,
  createDefaultAddressSelector,
  createDefaultAuthorizationResultCache,
  createDefaultWalletNotFoundHandler,
} from '@solana-mobile/wallet-adapter-mobile';
import {
  Adapter,
  SendTransactionOptions,
  WalletError,
  WalletName,
  WalletNotConnectedError,
  WalletNotReadyError,
  WalletReadyState,
} from '@solana/wallet-adapter-base';
import {
  SolanaSignInInput,
  SolanaSignInOutput,
} from '@solana/wallet-standard-features';
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionSignature,
  VersionedTransaction,
} from '@solana/web3.js';
import {
  EMPTY,
  Observable,
  catchError,
  combineLatest,
  concatMap,
  defer,
  filter,
  finalize,
  first,
  firstValueFrom,
  from,
  fromEvent,
  map,
  merge,
  of,
  pairwise,
  switchMap,
  tap,
  throwError,
  withLatestFrom,
} from 'rxjs';
import { ConnectionStore } from './connection.store';
import {
  LocalStorageSubject,
  SignerWalletAdapterProps,
  WalletNotSelectedError,
  fromAdapterEvent,
  getInferredClusterFromEndpoint,
  getIsMobile,
  getUriForAppIdentity,
  handleEvent,
  signAllTransactions,
  signIn,
  signMessage,
  signTransaction,
} from './internals';
import { StandardWalletAdaptersStore } from './standard-wallet-adapters.store';

export interface Wallet {
  adapter: Adapter;
  readyState: WalletReadyState;
}

export interface AnchorWallet {
  publicKey: PublicKey;
  signTransaction<T extends Transaction | VersionedTransaction>(
    transaction: T
  ): Promise<T>;
  signAllTransactions<T extends Transaction | VersionedTransaction>(
    transactions: T[]
  ): Promise<T[]>;
}

export interface WalletConfig {
  localStorageKey: string;
  autoConnect: boolean;
  adapters: Adapter[];
}

export const WALLET_CONFIG = new InjectionToken<WalletConfig>('walletConfig');

export const walletConfigProviderFactory = (
  config?: Partial<WalletConfig>
) => ({
  provide: WALLET_CONFIG,
  useValue: {
    autoConnect: false,
    localStorageKey: 'walletName',
    adapters: [],
    ...(config ?? {}),
  },
});

interface WalletState {
  adapters: Adapter[];
  wallets: Wallet[];
  wallet: Wallet | null;
  adapter: Adapter | null;
  connecting: boolean;
  disconnecting: boolean;
  unloading: boolean;
  connected: boolean;
  readyState: WalletReadyState | null;
  publicKey: PublicKey | null;
  autoConnect: boolean;
  error: WalletError | null;
}

const initialState: {
  wallet: Wallet | null;
  adapter: Adapter | null;
  connected: boolean;
  publicKey: PublicKey | null;
  readyState: WalletReadyState | null;
} = {
  wallet: null,
  adapter: null,
  connected: false,
  publicKey: null,
  readyState: null,
};

@Injectable()
export class WalletStore extends ComponentStore<WalletState> {
  private readonly _name = new LocalStorageSubject<WalletName>(
    this._config.localStorageKey
  );
  private readonly _unloading$ = this.select(({ unloading }) => unloading);
  private readonly _adapters$ = this.select(({ adapters }) => adapters);
  private readonly _adapter$ = this.select(({ adapter }) => adapter);
  private readonly _name$ = this._name.asObservable();
  private readonly _readyState$ = this.select(({ readyState }) => readyState);

  readonly autoConnect$ = this.select(({ autoConnect }) => autoConnect);
  readonly wallets$ = this.select(({ wallets }) => wallets);
  readonly wallet$ = this.select(({ wallet }) => wallet);
  readonly publicKey$ = this.select(({ publicKey }) => publicKey);
  readonly connecting$ = this.select(({ connecting }) => connecting);
  readonly connected$ = this.select(({ connected }) => connected);
  readonly disconnecting$ = this.select(({ disconnecting }) => disconnecting);
  readonly error$ = this.select(({ error }) => error);
  readonly anchorWallet$ = this.select(
    this.publicKey$,
    this._adapter$,
    this.connected$,
    (publicKey, adapter, connected) => {
      return publicKey &&
        adapter &&
        'signTransaction' in adapter &&
        'signAllTransactions' in adapter
        ? ({
            publicKey,
            signTransaction: <T extends Transaction | VersionedTransaction>(
              transaction: T
            ): Promise<T> =>
              firstValueFrom(
                signTransaction<T>(adapter, connected, (error) =>
                  this._setError(error)
                )(transaction)
              ),
            signAllTransactions: <T extends Transaction | VersionedTransaction>(
              transactions: T[]
            ): Promise<T[]> =>
              firstValueFrom(
                signAllTransactions<T>(adapter, connected, (error) =>
                  this._setError(error)
                )(transactions)
              ),
          } as AnchorWallet)
        : undefined;
    },
    { debounce: true }
  );

  constructor(
    @Inject(WALLET_CONFIG)
    private _config: WalletConfig
  ) {
    super({
      ...initialState,
      wallets: [],
      adapters: [],
      connecting: false,
      disconnecting: false,
      unloading: false,
      autoConnect: _config.autoConnect || false,
      readyState: null,
      error: null,
    });

    this.setAdapters(this._config.adapters);
  }

  // Set error
  private readonly _setError = this.updater((state, error: WalletError) => ({
    ...state,
    error: state.unloading ? state.error : error,
  }));

  // Set ready state
  private readonly _setReadyState = this.updater(
    (
      state,
      {
        readyState,
        walletName,
      }: { readyState: WalletReadyState; walletName: WalletName }
    ) => ({
      ...state,
      wallets: state.wallets.map((wallet) =>
        wallet.adapter.name === walletName ? { ...wallet, readyState } : wallet
      ),
      readyState:
        state.adapter?.name === walletName ? readyState : state.readyState,
    })
  );

  // Set adapters
  readonly setAdapters = this.updater((state, adapters: Adapter[]) => ({
    ...state,
    adapters,
    wallets: adapters.map((adapter) => ({
      adapter,
      readyState: adapter.readyState,
    })),
  }));

  // Update ready state for newly selected adapter
  readonly onAdapterChangeDisconnectPreviousAdapter = this.effect(() =>
    this._adapter$.pipe(
      pairwise(),
      concatMap(([adapter]) =>
        adapter && adapter.connected
          ? from(defer(() => adapter.disconnect()))
          : of(null)
      )
    )
  );

  // When the selected wallet changes, initialize the state
  readonly onWalletChanged = this.effect(() =>
    combineLatest([this._name$, this.wallets$]).pipe(
      tap(([name, wallets]) => {
        const wallet = wallets.find(({ adapter }) => adapter.name === name);

        if (wallet) {
          this.patchState({
            wallet,
            adapter: wallet.adapter,
            connected: wallet.adapter.connected,
            publicKey: wallet.adapter.publicKey,
            readyState: wallet.adapter.readyState,
          });
        } else {
          this.patchState(initialState);
        }
      })
    )
  );

  // If autoConnect is enabled, try to connect when the adapter changes and is ready
  readonly onAutoConnect = this.effect(() => {
    return combineLatest([
      this._adapter$,
      this._readyState$,
      this.autoConnect$,
      this.connecting$,
      this.connected$,
    ]).pipe(
      concatMap(([adapter, readyState, autoConnect, connecting, connected]) => {
        if (
          !autoConnect ||
          adapter == null ||
          (readyState !== WalletReadyState.Installed &&
            readyState !== WalletReadyState.Loadable) ||
          connecting ||
          connected
        ) {
          return EMPTY;
        }

        this.patchState({ connecting: true });
        return from(defer(() => adapter.connect())).pipe(
          catchError(() => {
            // Clear the selected wallet
            this.selectWallet(null);
            // Don't throw error, but onError will still be called
            return EMPTY;
          }),
          finalize(() => this.patchState({ connecting: false }))
        );
      })
    );
  });

  // If the window is closing or reloading, ignore disconnect and error events from the adapter
  readonly onWindowUnload = this.effect(() => {
    if (typeof window === 'undefined') {
      return of(null);
    }

    return fromEvent(window, 'beforeunload').pipe(
      tap(() => this.patchState({ unloading: true }))
    );
  });

  // Handle the adapter's connect event
  readonly onConnect = this.effect(() => {
    return this._adapter$.pipe(
      handleEvent((adapter) =>
        fromAdapterEvent(adapter, 'connect').pipe(
          tap(() =>
            this.patchState({
              connected: adapter.connected,
              publicKey: adapter.publicKey,
            })
          )
        )
      )
    );
  });

  // Handle the adapter's disconnect event
  readonly onDisconnect = this.effect(() => {
    return this._adapter$.pipe(
      handleEvent((adapter) =>
        fromAdapterEvent(adapter, 'disconnect').pipe(
          concatMap(() => of(null).pipe(withLatestFrom(this._unloading$))),
          filter(([, unloading]) => !unloading),
          tap(() => this.selectWallet(null))
        )
      )
    );
  });

  // Handle the adapter's error event
  readonly onError = this.effect(() => {
    return this._adapter$.pipe(
      handleEvent((adapter) =>
        fromAdapterEvent(adapter, 'error').pipe(
          tap((error) => this._setError(error))
        )
      )
    );
  });

  // Handle all adapters ready state change events
  readonly onReadyStateChanges = this.effect(() => {
    return this._adapters$.pipe(
      switchMap((adapters) =>
        merge(
          ...adapters.map((adapter) =>
            fromAdapterEvent(adapter, 'readyStateChange').pipe(
              tap((readyState) =>
                this._setReadyState({ readyState, walletName: adapter.name })
              )
            )
          )
        )
      )
    );
  });

  // Select a new wallet
  selectWallet(walletName: WalletName | null) {
    this._name.next(walletName);
  }

  // Connect the adapter to the wallet
  connect(): Observable<void> {
    return combineLatest([
      this.connecting$,
      this.disconnecting$,
      this.connected$,
      this._adapter$,
      this._readyState$,
    ]).pipe(
      first(),
      filter(
        ([connecting, disconnecting, connected]) =>
          !connected && !connecting && !disconnecting
      ),
      concatMap(([, , , adapter, readyState]) => {
        if (!adapter) {
          const error = new WalletNotSelectedError();
          this._setError(error);
          return throwError(() => error);
        }

        if (
          !(
            readyState === WalletReadyState.Installed ||
            readyState === WalletReadyState.Loadable
          )
        ) {
          this.selectWallet(null);

          if (typeof window !== 'undefined') {
            window.open(adapter.url, '_blank');
          }

          const error = new WalletNotReadyError();
          this._setError(error);
          return throwError(() => error);
        }

        this.patchState({ connecting: true });

        return from(defer(() => adapter.connect())).pipe(
          catchError((error) => {
            this.selectWallet(null);
            return throwError(() => error);
          }),
          finalize(() => this.patchState({ connecting: false }))
        );
      })
    );
  }

  // Disconnect the adapter from the wallet
  disconnect(): Observable<void> {
    return combineLatest([this.disconnecting$, this._adapter$]).pipe(
      first(),
      filter(([disconnecting]) => !disconnecting),
      concatMap(([, adapter]) => {
        if (!adapter) {
          this.selectWallet(null);
          return EMPTY;
        }

        this.patchState({ disconnecting: true });
        return from(defer(() => adapter.disconnect())).pipe(
          catchError((error) => {
            this.selectWallet(null);
            // Rethrow the error, and handleError will also be called
            return throwError(() => error);
          }),
          finalize(() => {
            this.patchState({ disconnecting: false });
          })
        );
      })
    );
  }

  // Send a transaction using the provided connection
  sendTransaction<T extends Transaction | VersionedTransaction>(
    transaction: T,
    connection: Connection,
    options?: SendTransactionOptions
  ): Observable<TransactionSignature> {
    return combineLatest([this._adapter$, this.connected$]).pipe(
      first(),
      concatMap(([adapter, connected]) => {
        if (!adapter) {
          const error = new WalletNotSelectedError();
          this._setError(error);
          return throwError(() => error);
        }

        if (!connected) {
          const error = new WalletNotConnectedError();
          this._setError(error);
          return throwError(() => error);
        }

        return from(
          defer(() => adapter.sendTransaction(transaction, connection, options))
        );
      })
    );
  }

  // Sign a transaction if the wallet supports it
  signTransaction<T extends Transaction | VersionedTransaction>(
    transaction: T
  ): ReturnType<SignerWalletAdapterProps['signTransaction']> | undefined {
    const { adapter, connected } = this.get();

    return adapter && 'signTransaction' in adapter
      ? signTransaction(adapter, connected, (error) => this._setError(error))(
          transaction
        )
      : undefined;
  }

  // Sign multiple transactions if the wallet supports it
  signAllTransactions<T extends Transaction | VersionedTransaction>(
    transactions: T[]
  ): ReturnType<SignerWalletAdapterProps['signAllTransactions']> | undefined {
    const { adapter, connected } = this.get();

    return adapter && 'signAllTransactions' in adapter
      ? signAllTransactions(adapter, connected, (error) =>
          this._setError(error)
        )(transactions)
      : undefined;
  }

  // Sign an arbitrary message if the wallet supports it
  signMessage(message: Uint8Array): Observable<Uint8Array> | undefined {
    const { adapter, connected } = this.get();

    return adapter && 'signMessage' in adapter
      ? signMessage(adapter, connected, (error) => this._setError(error))(
          message
        )
      : undefined;
  }

  // Sign in with Solana
  signIn(
    input?: SolanaSignInInput
  ): Observable<SolanaSignInOutput> | undefined {
    const { adapter, connected } = this.get();

    return adapter && 'signIn' in adapter
      ? signIn(adapter, connected, (error) => this._setError(error))(input)
      : undefined;
  }
}

export const walletStoreProvider = {
  provide: WalletStore,
  useFactory: (
    connectionStore: ConnectionStore,
    standardWalletAdaptersStore: StandardWalletAdaptersStore,
    config: WalletConfig
  ) => {
    const mobileWalletAdapter$ = combineLatest([
      connectionStore.connection$,
      standardWalletAdaptersStore.adapters$,
    ]).pipe(
      map(([connection, standardWalletAdapters]) => {
        if (!getIsMobile(standardWalletAdapters)) {
          return null;
        }

        const existingMobileWalletAdapter = standardWalletAdapters.find(
          (adapter) => adapter.name === SolanaMobileWalletAdapterWalletName
        );

        if (existingMobileWalletAdapter) {
          return existingMobileWalletAdapter;
        }

        return new SolanaMobileWalletAdapter({
          addressSelector: createDefaultAddressSelector(),
          appIdentity: {
            uri: getUriForAppIdentity(),
          },
          authorizationResultCache: createDefaultAuthorizationResultCache(),
          cluster: getInferredClusterFromEndpoint(connection?.rpcEndpoint),
          onWalletNotFound: createDefaultWalletNotFoundHandler(),
        });
      })
    );

    const adaptersWithMobileWalletAdapter$ = combineLatest([
      mobileWalletAdapter$,
      standardWalletAdaptersStore.adapters$,
    ]).pipe(
      map(([mobileWalletAdapter, standardWalletAdapters]) => {
        if (
          mobileWalletAdapter == null ||
          standardWalletAdapters.indexOf(mobileWalletAdapter) !== -1
        ) {
          return standardWalletAdapters;
        }
        return [mobileWalletAdapter, ...standardWalletAdapters];
      })
    );

    const walletStore = new WalletStore(config);

    walletStore.setAdapters(adaptersWithMobileWalletAdapter$);

    return walletStore;
  },
  deps: [ConnectionStore, StandardWalletAdaptersStore, WALLET_CONFIG],
};
