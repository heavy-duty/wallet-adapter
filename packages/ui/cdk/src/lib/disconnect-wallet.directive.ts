import {
  Directive,
  EventEmitter,
  Output,
  computed,
  inject,
} from '@angular/core';
import {
  WalletStore,
  injectDisconnecting,
  injectWallet,
} from '@heavy-duty/wallet-adapter';

@Directive({
  selector: '[hdDisconnectWallet]',
  standalone: true,
  exportAs: 'hdDisconnectWallet',
})
export class HdDisconnectWalletDirective {
  private readonly _walletStore = inject(WalletStore);
  readonly disconnecting = injectDisconnecting();
  readonly wallet = injectWallet();
  readonly message = computed(() => {
    if (this.disconnecting()) return 'Disconnecting...';
    if (this.wallet()) return 'Disconnect';
    return 'Disconnect Wallet';
  });

  @Output() hdDisconnectWalletSuccess = new EventEmitter();
  @Output() hdDisconnectWalletStarts = new EventEmitter();
  @Output() hdDisconnectWalletError = new EventEmitter();
  @Output() hdDisconnectWalletEnds = new EventEmitter();

  run() {
    this.hdDisconnectWalletStarts.emit();

    this._walletStore.disconnect().subscribe({
      next: () => this.hdDisconnectWalletSuccess.emit(),
      error: (error) => this.hdDisconnectWalletError.emit(error),
      complete: () => this.hdDisconnectWalletEnds.emit(),
    });
  }
}
