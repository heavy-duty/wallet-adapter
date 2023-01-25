import { Directive, EventEmitter, inject, Output } from '@angular/core';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { WalletError } from '@solana/wallet-adapter-base';

@Directive({
  selector: '[hdSignMessage]',
  standalone: true,
  exportAs: 'hdSignMessage',
})
export class HdSignMessageDirective {
  private readonly _walletStore = inject(WalletStore);

  @Output() hdMessageSigned = new EventEmitter<Uint8Array>();
  @Output() hdSignMessageStarts = new EventEmitter<void>();
  @Output() hdSignMessageError = new EventEmitter<string>();

  run(message: Uint8Array) {
    this.hdSignMessageStarts.emit();

    const signMessage$ = this._walletStore.signMessage(message);

    if (!signMessage$) {
      this.hdSignMessageError.emit('Wallet is not capable of message signing.');
    } else {
      signMessage$.subscribe({
        next: (signature) => this.hdMessageSigned.emit(signature),
        error: (error) => {
          if (typeof error === 'string') {
            this.hdSignMessageError.emit(error);
          } else if (error instanceof WalletError) {
            this.hdSignMessageError.emit(error.message);
          } else {
            this.hdSignMessageError.emit(JSON.stringify(error));
          }
        },
      });
    }
  }
}
