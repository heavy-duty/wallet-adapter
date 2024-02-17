import { WritableSignal, inject, signal } from '@angular/core';
import {
  Connection,
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  TransactionSignature,
  VersionedTransaction,
} from '@solana/web3.js';
import {
  Observable,
  catchError,
  concatMap,
  from,
  map,
  tap,
  throwError,
} from 'rxjs';
import { injectConnection } from './inject-connection';
import { injectPublicKey } from './inject-public-key';
import { WalletStore } from './wallet.store';

export type TransactionState =
  | {
      status: 'pending';
      signature: null;
      error: null;
    }
  | {
      status: 'sending';
      signature: null;
      error: null;
    }
  | {
      status: 'confirming';
      signature: TransactionSignature;
      error: null;
    }
  | {
      status: 'finalizing';
      signature: TransactionSignature;
      error: null;
    }
  | {
      status: 'finalized';
      signature: TransactionSignature;
      error: null;
    }
  | {
      status: 'failed';
      signature: null;
      error: string;
    };

export type TransactionStatus = TransactionState['status'];

export interface SendFunctionTransformParams {
  connection: Connection;
  publicKey: PublicKey;
}

export type SendFunctionTransform = (
  params: SendFunctionTransformParams
) => TransactionInstruction[];

export type SendFunction = (
  instructionsOrTransform: SendFunctionTransform | TransactionInstruction[]
) => Observable<TransactionSignature>;

export type TransactionSenderSignal = WritableSignal<TransactionState> & {
  send: SendFunction;
};

export function toTransactionSenderSignal(
  signal: WritableSignal<TransactionState>,
  sendFn: SendFunction
): TransactionSenderSignal {
  Object.defineProperty(signal, 'send', {
    value: sendFn,
    writable: false,
  });

  return signal as TransactionSenderSignal;
}

export function injectTransactionSender(): TransactionSenderSignal {
  const _walletStore = inject(WalletStore);
  const _publicKey = injectPublicKey();
  const _connection = injectConnection();
  const _state = signal<TransactionState>({
    status: 'pending',
    signature: null,
    error: null,
  });

  return toTransactionSenderSignal(
    _state,
    (
      instructionsOrTransform: SendFunctionTransform | TransactionInstruction[]
    ) => {
      const publicKey = _publicKey();

      if (!publicKey) {
        return throwError(() => new Error('Wallet not connected'));
      }

      const connection = _connection();

      if (!connection) {
        return throwError(() => new Error('Connection not found'));
      }

      _state.set({
        status: 'sending',
        signature: null,
        error: null,
      });

      return from(connection.getLatestBlockhash('confirmed')).pipe(
        concatMap((latestBlockhash) => {
          const instructions =
            instructionsOrTransform instanceof Array
              ? instructionsOrTransform
              : instructionsOrTransform({ connection, publicKey });
          const transactionMessage = new TransactionMessage({
            payerKey: publicKey,
            recentBlockhash: latestBlockhash.blockhash,
            instructions,
          }).compileToV0Message();
          const transaction = new VersionedTransaction(transactionMessage);

          return _walletStore
            .sendTransaction(transaction, connection, {
              maxRetries: 5,
            })
            .pipe(
              tap((signature) =>
                _state.set({
                  status: 'confirming',
                  signature,
                  error: null,
                })
              ),
              concatMap((signature) =>
                from(
                  connection.confirmTransaction({
                    signature,
                    blockhash: latestBlockhash.blockhash,
                    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
                  })
                ).pipe(
                  map((confirmationStatus) => {
                    if (confirmationStatus.value.err) {
                      throw new Error('Confirmation failed.');
                    }

                    return confirmationStatus;
                  }),
                  tap(() =>
                    _state.set({
                      status: 'finalizing',
                      signature,
                      error: null,
                    })
                  ),
                  concatMap(() =>
                    from(
                      connection.confirmTransaction(
                        {
                          signature,
                          blockhash: latestBlockhash.blockhash,
                          lastValidBlockHeight:
                            latestBlockhash.lastValidBlockHeight,
                        },
                        'finalized'
                      )
                    ).pipe(
                      map((confirmationStatus) => {
                        if (confirmationStatus.value.err) {
                          throw new Error('Finalization failed.');
                        }

                        return confirmationStatus;
                      })
                    )
                  ),
                  tap(() =>
                    _state.set({
                      status: 'finalized',
                      signature,
                      error: null,
                    })
                  ),
                  map(() => signature)
                )
              ),
              catchError((error) => {
                let errorMessage: string;

                if (typeof error === 'string') {
                  errorMessage = error;
                } else if (error instanceof Error) {
                  errorMessage = error.message;
                } else {
                  errorMessage = JSON.stringify(error);
                }

                _state.set({
                  status: 'failed',
                  signature: null,
                  error: errorMessage,
                });

                return throwError(() => new Error(errorMessage));
              })
            );
        })
      );
    }
  );
}
