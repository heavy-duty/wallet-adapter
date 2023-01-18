import { Directive, HostListener, inject } from '@angular/core';
import { WalletName } from '@solana/wallet-adapter-base';
import { HdConnectWalletDirective } from './connect-wallet.directive';
import { HdSelectWalletDirective } from './select-wallet.directive';

@Directive({
  selector: '[hdSelectAndConnectWallet]',
  standalone: true,
  exportAs: 'hdSelectAndConnectWallet',
  hostDirectives: [
    { directive: HdSelectWalletDirective, outputs: ['hdWalletSelected'] },
    {
      directive: HdConnectWalletDirective,
      outputs: [
        'hdWalletConnected',
        'hdConnectWalletStarts',
        'hdConnectWalletError',
      ],
    },
  ],
})
export class HdSelectAndConnectWalletDirective {
  private readonly _hdSelectWalletDirective = inject(HdSelectWalletDirective);
  private readonly _hdConnectWalletDirective = inject(HdConnectWalletDirective);

  @HostListener('hdWalletSelected') onWalletSelected() {
    this._hdConnectWalletDirective.run();
  }

  run(walletName: WalletName | null) {
    this._hdSelectWalletDirective.run(walletName);
  }
}
