import { Directive, EventEmitter, inject, Output } from '@angular/core';
import { WalletStore } from '@heavy-duty/wallet-adapter';

@Directive({
  selector: '[hdConnectWallet]',
  standalone: true,
  exportAs: 'hdConnectWallet',
})
export class HdConnectWalletDirective {
  private readonly _walletStore = inject(WalletStore);

  @Output() hdWalletConnected = new EventEmitter();
  @Output() hdConnectWalletStarts = new EventEmitter();
  @Output() hdConnectWalletError = new EventEmitter();

  run() {
    this.hdConnectWalletStarts.emit();

    this._walletStore.connect().subscribe({
      next: () => this.hdWalletConnected.emit(),
      error: (error) => this.hdConnectWalletError.emit(error),
    });
  }
}
