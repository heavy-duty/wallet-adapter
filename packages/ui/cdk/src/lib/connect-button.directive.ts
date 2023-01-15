import { Directive, HostListener, inject } from '@angular/core';
import { WalletStore } from '@heavy-duty/wallet-adapter';

@Directive({ selector: 'button[hdWalletConnectButton]', standalone: true })
export class HdWalletConnectButtonDirective {
  private readonly _walletStore = inject(WalletStore);

  @HostListener('click') onClick(): void {
    this._walletStore.connect().subscribe();
  }
}
