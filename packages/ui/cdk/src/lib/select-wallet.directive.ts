import { Directive, EventEmitter, inject, Output } from '@angular/core';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { WalletName } from '@solana/wallet-adapter-base';

@Directive({
  selector: '[hdSelectWallet]',
  standalone: true,
  exportAs: 'hdSelectWallet',
})
export class HdSelectWalletDirective {
  private readonly _walletStore = inject(WalletStore);

  @Output() walletSelected = new EventEmitter<WalletName | null>();

  run(walletName: WalletName | null) {
    this._walletStore.selectWallet(walletName);
    this.walletSelected.emit(walletName);
  }
}
