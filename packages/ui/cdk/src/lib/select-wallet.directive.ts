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

  @Output() hdWalletSelected = new EventEmitter<WalletName | null>();

  run(walletName: WalletName | null) {
    this._walletStore.selectWallet(walletName);
    this.hdWalletSelected.emit(walletName);
  }
}
