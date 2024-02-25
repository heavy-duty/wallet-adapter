import {
  Directive,
  EventEmitter,
  Output,
  computed,
  inject,
} from '@angular/core';
import {
  WalletStore,
  injectConnected,
  injectConnecting,
  injectWallet,
} from '@heavy-duty/wallet-adapter';

@Directive({
  selector: '[hdConnectWallet]',
  standalone: true,
  exportAs: 'hdConnectWallet',
})
export class HdConnectWalletDirective {
  private readonly _walletStore = inject(WalletStore);
  readonly connecting = injectConnecting();
  readonly connected = injectConnected();
  readonly wallet = injectWallet();
  readonly message = computed(() => {
    if (this.connecting()) return 'Connecting...';
    if (this.connected()) return 'Connected';
    if (this.wallet()) return 'Connect';
    return 'Connect Wallet';
  });

  @Output() hdConnectWalletSuccess = new EventEmitter();
  @Output() hdConnectWalletStarts = new EventEmitter();
  @Output() hdConnectWalletError = new EventEmitter();
  @Output() hdConnectWalletEnds = new EventEmitter();

  run() {
    this.hdConnectWalletStarts.emit();

    this._walletStore.connect().subscribe({
      next: () => this.hdConnectWalletSuccess.emit(),
      error: (error) => this.hdConnectWalletError.emit(error),
      complete: () => this.hdConnectWalletEnds.emit(),
    });
  }
}
