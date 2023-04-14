import type {
  SendTransactionOptions,
  WalletName,
} from '@solana/wallet-adapter-base';
import {
  BaseMessageSignerWalletAdapter,
  WalletNotConnectedError,
  WalletNotReadyError,
  WalletReadyState,
} from '@solana/wallet-adapter-base';
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionSignature,
  TransactionVersion,
  VersionedTransaction,
} from '@solana/web3.js';

export const PhantomWalletName = 'Phantom' as WalletName<'Phantom'>;

export class PhantomWalletAdapter extends BaseMessageSignerWalletAdapter {
  name = PhantomWalletName;
  url = 'https://phantom.app';
  icon =
    'data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiBoZWlnaHQ9IjM0IiB3aWR0aD0iMzQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGxpbmVhckdyYWRpZW50IGlkPSJhIiB4MT0iLjUiIHgyPSIuNSIgeTE9IjAiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiM1MzRiYjEiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM1NTFiZjkiLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCBpZD0iYiIgeDE9Ii41IiB4Mj0iLjUiIHkxPSIwIiB5Mj0iMSI+PHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjZmZmIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjZmZmIiBzdG9wLW9wYWNpdHk9Ii44MiIvPjwvbGluZWFyR3JhZGllbnQ+PGNpcmNsZSBjeD0iMTciIGN5PSIxNyIgZmlsbD0idXJsKCNhKSIgcj0iMTciLz48cGF0aCBkPSJtMjkuMTcwMiAxNy4yMDcxaC0yLjk5NjljMC02LjEwNzQtNC45NjgzLTExLjA1ODE3LTExLjA5NzUtMTEuMDU4MTctNi4wNTMyNSAwLTEwLjk3NDYzIDQuODI5NTctMTEuMDk1MDggMTAuODMyMzctLjEyNDYxIDYuMjA1IDUuNzE3NTIgMTEuNTkzMiAxMS45NDUzOCAxMS41OTMyaC43ODM0YzUuNDkwNiAwIDEyLjg0OTctNC4yODI5IDEzLjk5OTUtOS41MDEzLjIxMjMtLjk2MTktLjU1MDItMS44NjYxLTEuNTM4OC0xLjg2NjF6bS0xOC41NDc5LjI3MjFjMCAuODE2Ny0uNjcwMzggMS40ODQ3LTEuNDkwMDEgMS40ODQ3LS44MTk2NCAwLTEuNDg5OTgtLjY2ODMtMS40ODk5OC0xLjQ4NDd2LTIuNDAxOWMwLS44MTY3LjY3MDM0LTEuNDg0NyAxLjQ4OTk4LTEuNDg0Ny44MTk2MyAwIDEuNDkwMDEuNjY4IDEuNDkwMDEgMS40ODQ3em01LjE3MzggMGMwIC44MTY3LS42NzAzIDEuNDg0Ny0xLjQ4OTkgMS40ODQ3LS44MTk3IDAtMS40OS0uNjY4My0xLjQ5LTEuNDg0N3YtMi40MDE5YzAtLjgxNjcuNjcwNi0xLjQ4NDcgMS40OS0xLjQ4NDcuODE5NiAwIDEuNDg5OS42NjggMS40ODk5IDEuNDg0N3oiIGZpbGw9InVybCgjYikiLz48L3N2Zz4K';
  supportedTransactionVersions: ReadonlySet<TransactionVersion> = new Set([
    'legacy',
    0,
  ]);

  private _connecting: boolean;
  private _keypair: Keypair | null;
  private _publicKey: PublicKey | null;
  private _readyState = WalletReadyState.Installed;

  constructor() {
    super();
    this._connecting = false;
    this._keypair = null;
    this._publicKey = null;
  }

  get publicKey() {
    return this._publicKey;
  }

  get connecting() {
    return this._connecting;
  }

  get readyState() {
    return this._readyState;
  }

  override async autoConnect(): Promise<void> {
    // Skip autoconnect in the Loadable state
    // We can't redirect to a universal link without user input
    if (this.readyState === WalletReadyState.Installed) {
      await this.connect();
    }
  }

  async connect(): Promise<void> {
    try {
      if (this.connected || this.connecting) return;

      if (this.readyState !== WalletReadyState.Installed)
        throw new WalletNotReadyError();

      this._connecting = true;
      this._keypair = Keypair.generate();
      this._publicKey = this._keypair.publicKey;

      this.emit('connect', this._keypair.publicKey);
    } catch (error: any) {
      this.emit('error', error);
      throw error;
    } finally {
      this._connecting = false;
    }
  }

  async disconnect(): Promise<void> {
    const keypair = this._keypair;
    if (keypair) {
      this._keypair = null;
      this._publicKey = null;
    }

    this.emit('disconnect');
  }

  override async sendTransaction<T extends Transaction | VersionedTransaction>(
    transaction: T,
    connection: Connection,
    options: SendTransactionOptions = {}
  ): Promise<TransactionSignature> {
    try {
      const keypair = this._keypair;
      if (!keypair) throw new WalletNotConnectedError();

      return 'signature';
    } catch (error: any) {
      this.emit('error', error);
      throw error;
    }
  }

  override async signTransaction<T extends Transaction | VersionedTransaction>(
    transaction: T
  ): Promise<T> {
    try {
      const keypair = this._keypair;
      if (!keypair) throw new WalletNotConnectedError();

      return transaction;
    } catch (error: any) {
      this.emit('error', error);
      throw error;
    }
  }

  override async signAllTransactions<
    T extends Transaction | VersionedTransaction
  >(transactions: T[]): Promise<T[]> {
    try {
      const keypair = this._keypair;
      if (!keypair) throw new WalletNotConnectedError();

      return transactions;
    } catch (error: any) {
      this.emit('error', error);
      throw error;
    }
  }

  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    try {
      const publicKey = this._publicKey;
      if (!publicKey) throw new WalletNotConnectedError();
      return new Uint8Array([]);
    } catch (error: any) {
      this.emit('error', error);
      throw error;
    }
  }
}
