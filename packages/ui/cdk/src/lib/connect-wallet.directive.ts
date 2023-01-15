import { Directive, EventEmitter, inject, Output } from '@angular/core';
import { WalletStore } from '@heavy-duty/wallet-adapter';

@Directive({
  selector: '[hdConnectWallet]',
  standalone: true,
  exportAs: 'hdConnectWallet',
})
export class HdConnectWalletDirective {
  private readonly _walletStore = inject(WalletStore);

  @Output() walletConnected = new EventEmitter();
  @Output() connectWalletStarts = new EventEmitter();
  @Output() connectWalletError = new EventEmitter();

  run() {
    this.connectWalletStarts.emit();

    this._walletStore.connect().subscribe({
      next: () => this.walletConnected.emit(),
      error: (error) => this.connectWalletError.emit(error),
    });
  }
}
