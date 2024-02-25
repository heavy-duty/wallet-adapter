import { Directive, computed, inject } from '@angular/core';
import { WalletStore, injectWallets } from '@heavy-duty/wallet-adapter';
import { WalletName, WalletReadyState } from '@solana/wallet-adapter-base';
import { HdConnectWalletDirective } from './connect-wallet.directive';

@Directive({
  selector: '[hdSelectWallet]',
  standalone: true,
  exportAs: 'hdSelectWallet',
  hostDirectives: [
    {
      directive: HdConnectWalletDirective,
      outputs: [
        'hdConnectWalletSuccess',
        'hdConnectWalletError',
        'hdConnectWalletStarts',
        'hdConnectWalletEnds',
      ],
    },
  ],
})
export class HdSelectWalletDirective {
  private readonly _walletStore = inject(WalletStore);
  private readonly _wallets = injectWallets();
  private readonly _hdConnectWalletDirective = inject(HdConnectWalletDirective);

  readonly installedWallets = computed(() =>
    this._wallets().filter(
      (wallet) => wallet.readyState === WalletReadyState.Installed
    )
  );
  readonly otherWallets = computed(() => [
    ...this._wallets().filter(
      (wallet) => wallet.readyState === WalletReadyState.Loadable
    ),
    ...this._wallets().filter(
      (wallet) => wallet.readyState === WalletReadyState.NotDetected
    ),
  ]);
  readonly getStartedWallet = computed(() =>
    this.installedWallets().length
      ? this.installedWallets()[0]
      : this._wallets().find(
          (wallet: { adapter: { name: WalletName } }) =>
            wallet.adapter.name === 'Backpack'
        ) ||
        this._wallets().find(
          (wallet: { adapter: { name: WalletName } }) =>
            wallet.adapter.name === 'Phantom'
        ) ||
        this._wallets().find(
          (wallet: { readyState: WalletReadyState }) =>
            wallet.readyState === WalletReadyState.Loadable
        ) ||
        this.otherWallets()[0]
  );
  readonly message = computed(() => {
    if (this.installedWallets().length > 0) {
      return 'Connect a wallet on Solana to continue';
    } else {
      return `You'll need a wallet on Solana to continue`;
    }
  });

  run(walletName: WalletName) {
    this._walletStore.selectWallet(walletName);
    this._hdConnectWalletDirective.run();
  }
}
