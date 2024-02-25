import { Directive, computed, inject } from '@angular/core';
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

  run() {
    this._walletStore.disconnect().subscribe();
  }
}
