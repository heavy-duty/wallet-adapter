import {
  MessageSignerWalletAdapter,
  SignInMessageSignerWalletAdapter,
  SignerWalletAdapter,
  TransactionOrVersionedTransaction,
  WalletAdapterProps,
  WalletError,
  WalletNotConnectedError,
} from '@solana/wallet-adapter-base';
import {
  SolanaSignInInput,
  SolanaSignInOutput,
} from '@solana/wallet-standard-features';
import { Transaction, VersionedTransaction } from '@solana/web3.js';
import { Observable, defer, from, throwError } from 'rxjs';

export interface SignerWalletAdapterProps<Name extends string = string>
  extends WalletAdapterProps<Name> {
  signTransaction<
    T extends TransactionOrVersionedTransaction<
      this['supportedTransactionVersions']
    >
  >(
    transaction: T
  ): Observable<T>;
  signAllTransactions<
    T extends TransactionOrVersionedTransaction<
      this['supportedTransactionVersions']
    >
  >(
    transactions: T[]
  ): Observable<T[]>;
}

export const signMessage = (
  adapter: MessageSignerWalletAdapter,
  connected: boolean,
  errorHandler: (error: WalletError) => unknown
): ((message: Uint8Array) => Observable<Uint8Array>) => {
  return (message: Uint8Array) => {
    if (!connected) {
      return throwError(() => errorHandler(new WalletNotConnectedError()));
    }

    return from(defer(() => adapter.signMessage(message)));
  };
};

export const signTransaction = <T extends Transaction | VersionedTransaction>(
  adapter: SignerWalletAdapter,
  connected: boolean,
  errorHandler: (error: WalletError) => unknown
): ((transaction: T) => Observable<T>) => {
  return (transaction: T) => {
    if (!connected) {
      return throwError(() => errorHandler(new WalletNotConnectedError()));
    }

    return from(defer(() => adapter.signTransaction(transaction)));
  };
};

export const signAllTransactions = <
  T extends Transaction | VersionedTransaction
>(
  adapter: SignerWalletAdapter,
  connected: boolean,
  errorHandler: (error: WalletError) => unknown
): ((transactions: T[]) => Observable<T[]>) => {
  return (transactions: T[]) => {
    if (!connected) {
      return throwError(() => errorHandler(new WalletNotConnectedError()));
    }

    return from(defer(() => adapter.signAllTransactions(transactions)));
  };
};

export const signIn = (
  adapter: SignInMessageSignerWalletAdapter,
  connected: boolean,
  errorHandler: (error: WalletError) => unknown
): ((
  input?: SolanaSignInInput | undefined
) => Observable<SolanaSignInOutput>) => {
  return (input?: SolanaSignInInput | undefined) => {
    if (!connected) {
      return throwError(() => errorHandler(new WalletNotConnectedError()));
    }

    return from(defer(() => adapter.signIn(input)));
  };
};
