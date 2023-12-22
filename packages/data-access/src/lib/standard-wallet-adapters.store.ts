import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import {
  Adapter,
  isWalletAdapterCompatibleStandardWallet,
} from '@solana/wallet-adapter-base';
import { StandardWalletAdapter } from '@solana/wallet-standard-wallet-adapter-base';
import {
  DEPRECATED_getWallets,
  Wallets,
  WalletsEventsListeners,
} from '@wallet-standard/app';
import { Wallet } from '@wallet-standard/base';
import { fromEventPattern, pairwise, tap } from 'rxjs';

function wrapWalletsWithAdapters(
  wallets: readonly Wallet[]
): readonly StandardWalletAdapter[] {
  return wallets
    .filter(isWalletAdapterCompatibleStandardWallet)
    .map((wallet) => new StandardWalletAdapter({ wallet }));
}

interface StandardWalletAdaptersState {
  standardAdapters: readonly StandardWalletAdapter[];
  adapters: Adapter[];
}

function fromWalletStandardEvent(
  standardWallets: Wallets,
  eventName: keyof WalletsEventsListeners
) {
  return fromEventPattern<Wallet[]>(
    (handler) =>
      standardWallets.on(eventName, (...wallets: Wallet[]) => handler(wallets)),
    (teardown) => teardown()
  );
}

@Injectable()
export class StandardWalletAdaptersStore extends ComponentStore<StandardWalletAdaptersState> {
  private readonly _standardWallets = DEPRECATED_getWallets();
  private readonly _standardAdapters$ = this.select(
    ({ standardAdapters }) => standardAdapters
  );
  private readonly _adapters$ = this.select(({ adapters }) => adapters);

  readonly adapters$ = this.select(
    this._adapters$,
    this._standardAdapters$,
    (adapters, standardAdapters) => [
      ...standardAdapters,
      ...adapters.filter(
        ({ name }) =>
          !standardAdapters.some(
            (standardAdapter) => standardAdapter.name === name
          )
      ),
    ]
  );

  readonly warnings$ = this.select(
    this._adapters$,
    this._standardAdapters$,
    (adapters, standardAdapters) => [
      ...adapters
        .filter(({ name }) =>
          standardAdapters.some(
            (standardAdapter) => standardAdapter.name === name
          )
        )
        .map(({ name }) => name),
    ]
  );

  private readonly _addStandardAdapters = this.updater<Wallet[]>(
    (state, wallets) => ({
      ...state,
      standardAdapters: [
        ...state.standardAdapters,
        ...wrapWalletsWithAdapters(wallets),
      ],
    })
  );

  private readonly _removeStandardAdapters = this.updater<Wallet[]>(
    (state, wallets) => ({
      ...state,
      standardAdapters: state.standardAdapters.filter((standardAdapter) =>
        wallets.some((wallet) => wallet === standardAdapter.wallet)
      ),
    })
  );

  readonly setAdapters = this.updater((state, adapters: Adapter[]) => ({
    ...state,
    adapters,
  }));

  private readonly _handleStandardAdaptersChange = this.effect<
    [readonly StandardWalletAdapter[], readonly StandardWalletAdapter[]]
  >(
    tap(([previousStandardAdapters, standardAdapters]) => {
      // Destroy all removed adapter instances
      const currentAdapters = new Set(standardAdapters);
      const removedAdapters = new Set(
        previousStandardAdapters.filter(
          (previousAdapter) => !currentAdapters.has(previousAdapter)
        )
      );
      removedAdapters.forEach((adapter) => adapter.destroy());
    })
  );

  constructor() {
    super();

    const standardAdapters = wrapWalletsWithAdapters(
      this._standardWallets.get()
    );

    // Kill any adapter that could have been lingering (?)
    standardAdapters.forEach((adapter) => adapter.destroy());

    this.setState({
      adapters: [],
      standardAdapters,
    });

    this._addStandardAdapters(
      fromWalletStandardEvent(this._standardWallets, 'register')
    );
    this._removeStandardAdapters(
      fromWalletStandardEvent(this._standardWallets, 'unregister')
    );
    this._handleStandardAdaptersChange(
      this._standardAdapters$.pipe(pairwise())
    );
  }
}
