import { Directive, HostListener, inject } from '@angular/core';
import { WalletStore } from '@heavy-duty/wallet-adapter';

@Directive({ selector: 'button[hdWalletDisconnectButton]', standalone: true })
export class HdWalletDisconnectButtonDirective {
  private readonly _walletStore = inject(WalletStore);

  @HostListener('click') onClick(): void {
    this._walletStore.disconnect().subscribe();
  }
}
