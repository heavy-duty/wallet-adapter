import { Dialog } from '@angular/cdk/dialog';
import { GlobalPositionStrategy } from '@angular/cdk/overlay';
import { Component, inject } from '@angular/core';
import {
  WalletStore,
  injectConnected,
  injectPublicKey,
  injectWallet,
} from '@heavy-duty/wallet-adapter';
import {
  HdConnectWalletDirective,
  HdDisconnectWalletDirective,
  HdWalletIconComponent,
} from '@heavy-duty/wallet-adapter-cdk';
import { WalletName } from '@solana/wallet-adapter-base';
import { EMPTY, concatMap } from 'rxjs';
import { WalletsModalComponent } from './wallets-modal.component';

@Component({
  selector: 'hd-wallet-multi-button',
  template: `
    @if (connected()) {
      <button
        [disabled]="
          disconnectWallet.disconnecting() || !disconnectWallet.wallet()
        "
        (click)="disconnectWallet.run()"
        hdDisconnectWallet
        #disconnectWallet="hdDisconnectWallet"
        class="flex justify-center items-center gap-2 px-4 py-2 bg-red-400 rounded-md disabled:cursor-not-allowed"
      >
        @if (wallet(); as wallet) {
          <hd-wallet-icon [hdWallet]="wallet"></hd-wallet-icon>
        }

        <span> {{ disconnectWallet.message() }} </span>
      </button>
    } @else if (wallet()) {
      <button
        [disabled]="
          connectWallet.connecting() ||
          !connectWallet.wallet() ||
          connectWallet.connected()
        "
        (click)="connectWallet.run()"
        hdConnectWallet
        #connectWallet="hdConnectWallet"
        class="flex gap-2 items-center px-4 py-2 bg-blue-500 rounded-md disabled:cursor-not-allowed"
      >
        @if (wallet(); as wallet) {
          <hd-wallet-icon [hdWallet]="wallet"></hd-wallet-icon>
        }

        <span> {{ connectWallet.message() }} </span>
      </button>
    } @else {
      <button
        class="flex gap-2 items-center px-4 py-2 bg-blue-500 rounded-md disabled:cursor-not-allowed"
        (click)="onSelectWallet()"
      >
        Select wallet
      </button>
    }
  `,
  imports: [
    HdDisconnectWalletDirective,
    HdConnectWalletDirective,
    HdWalletIconComponent,
  ],
  standalone: true,
})
export class WalletMultiButtonComponent {
  private readonly _dialog = inject(Dialog);
  private readonly _walletStore = inject(WalletStore);
  readonly wallet = injectWallet();
  readonly connected = injectConnected();
  readonly publicKey = injectPublicKey();

  onSelectWallet() {
    this._dialog
      .open<WalletName | undefined, unknown, WalletsModalComponent>(
        WalletsModalComponent,
        {
          positionStrategy: new GlobalPositionStrategy()
            .top('8rem')
            .centerHorizontally(),
        }
      )
      .closed.pipe(
        concatMap((walletName) => {
          if (!walletName) {
            return EMPTY;
          }

          this._walletStore.selectWallet(walletName);

          return this._walletStore.connect();
        })
      )
      .subscribe();
  }
}
