import { Directive, computed, inject } from '@angular/core';
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

  run() {
    this._walletStore.connect().subscribe();
  }
}
