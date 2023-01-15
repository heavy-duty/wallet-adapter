import { Directive, EventEmitter, inject, Output } from '@angular/core';
import { WalletStore } from '@heavy-duty/wallet-adapter';

@Directive({
  selector: '[hdDisconnectWallet]',
  standalone: true,
  exportAs: 'hdDisconnectWallet',
})
export class HdDisconnectWalletDirective {
  private readonly _walletStore = inject(WalletStore);

  @Output() walletDisconnected = new EventEmitter();
  @Output() disconnectWalletStarts = new EventEmitter();
  @Output() disconnectWalletError = new EventEmitter();

  run() {
    this.disconnectWalletStarts.emit();

    this._walletStore.disconnect().subscribe({
      next: () => this.walletDisconnected.emit(),
      error: (error) => this.disconnectWalletError.emit(error),
    });
  }
}
