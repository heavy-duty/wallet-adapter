import { Directive, EventEmitter, inject, Output } from '@angular/core';
import { WalletStore } from '@heavy-duty/wallet-adapter';

@Directive({
  selector: '[hdDisconnectWallet]',
  standalone: true,
  exportAs: 'hdDisconnectWallet',
})
export class HdDisconnectWalletDirective {
  private readonly _walletStore = inject(WalletStore);

  @Output() hdWalletDisconnected = new EventEmitter();
  @Output() hdDisconnectWalletStarts = new EventEmitter();
  @Output() hdDisconnectWalletError = new EventEmitter();

  run() {
    this.hdDisconnectWalletStarts.emit();

    this._walletStore.disconnect().subscribe({
      next: () => this.hdWalletDisconnected.emit(),
      error: (error) => this.hdDisconnectWalletError.emit(error),
    });
  }
}
