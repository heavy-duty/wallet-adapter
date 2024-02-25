import { Dialog } from '@angular/cdk/dialog';
import { NgClass } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import {
  WalletStore,
  injectConnected,
  injectPublicKey,
  injectWallet,
} from '@heavy-duty/wallet-adapter';
import {
  HdConnectWalletDirective,
  HdDisconnectWalletDirective,
  HdObscureAddressPipe,
  HdWalletIconComponent,
} from '@heavy-duty/wallet-adapter-cdk';
import { WalletName } from '@solana/wallet-adapter-base';
import { EMPTY, concatMap } from 'rxjs';
import { WalletsModalComponent } from './wallets-modal.component';

@Component({
  standalone: true,
  selector: 'hd-root',
  template: `
    <header class="p-8">
      <h1 class="text-2xl text-center">Wallet Adapter Example (CDK)</h1>
    </header>

    <main class="max-w-[36rem] mx-auto border-2 border-black p-4">
      <section>
        <p>
          Wallet:
          {{ walletName() }}
        </p>

        <p>
          Public Key:

          @if (publicKey(); as publicKey) {
            <span>
              {{ publicKey.toBase58() | hdObscureAddress }}
            </span>
          } @else {
            <span> None </span>
          }
        </p>

        <p>
          Status:
          <span
            [ngClass]="{
              'text-red-600': !connected(),
              'text-green-600': connected()
            }"
          >
            {{ connected() ? 'Connected' : 'Disconnected' }}
          </span>
        </p>
      </section>

      <section>
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
      </section>
    </main>
  `,
  imports: [
    NgClass,
    HdDisconnectWalletDirective,
    HdConnectWalletDirective,
    HdWalletIconComponent,
    HdObscureAddressPipe,
    HdWalletIconComponent,
  ],
})
export class AppComponent {
  private readonly _dialog = inject(Dialog);
  private readonly _walletStore = inject(WalletStore);
  readonly wallet = injectWallet();
  readonly connected = injectConnected();
  readonly publicKey = injectPublicKey();
  readonly walletName = computed(() => this.wallet()?.adapter.name ?? 'None');

  onSelectWallet() {
    this._dialog
      .open<WalletName | undefined, unknown, WalletsModalComponent>(
        WalletsModalComponent
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
