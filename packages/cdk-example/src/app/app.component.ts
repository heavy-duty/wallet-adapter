import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import {
  HdDisconnectWalletDirective,
  HdObscureAddressPipe,
  HdSelectAndConnectWalletDirective,
  HdWalletAdapterDirective,
  HdWalletIconComponent,
} from '@heavy-duty/wallet-adapter-cdk';

@Component({
  standalone: true,
  selector: 'hd-root',
  template: `
    <main
      *hdWalletAdapter="
        let wallet = wallet;
        let connected = connected;
        let publicKey = publicKey;
        let wallets = wallets
      "
      class="max-w-[36rem] mx-auto my-16 border-2 border-black p-4"
    >
      <header>
        <h1 class="text-2xl text-center">Wallet Adapter Example (CDK)</h1>
      </header>

      <section>
        <div class="my-4">
          <p>
            Wallet:
            {{ wallet !== null ? wallet.adapter.name : 'None' }}
          </p>

          <p>
            Public Key:
            <span *ngIf="publicKey; else noWalletConnected">
              {{ publicKey.toBase58() | hdObscureAddress }}
            </span>
            <ng-template #noWalletConnected> None </ng-template>
          </p>

          <p>
            Status:
            <span
              [ngClass]="{
                'text-red-600': !connected,
                'text-green-600': connected
              }"
            >
              {{ connected ? 'Connected' : 'Disconnected' }}
            </span>
          </p>
        </div>

        <div class="flex gap-4">
          <button
            #hdSelectAndConnectWallet="hdSelectAndConnectWallet"
            *ngFor="let wallet of wallets; let i = index"
            class="flex justify-center items-center gap-2 px-4 py-2 bg-violet-800 text-white rounded-md disabled:cursor-not-allowed"
            [disabled]="connected || wallet === null"
            (click)="hdSelectAndConnectWallet.run(wallet.adapter.name)"
            (hdConnectWalletStarts)="onConnectWalletStarts()"
            (hdConnectWalletError)="onConnectWalletError($event)"
            (hdWalletConnected)="onWalletConnected()"
            hdSelectAndConnectWallet
          >
            <span> Connect </span>

            <hd-wallet-icon [hdWallet]="wallet"></hd-wallet-icon>
          </button>

          <button
            #hdDisconnectWallet="hdDisconnectWallet"
            *ngIf="wallet"
            class="flex justify-center items-center gap-2 px-4 py-2 bg-red-400 rounded-md disabled:cursor-not-allowed"
            [disabled]="!connected"
            (click)="hdDisconnectWallet.run()"
            (hdDisconnectWalletStarts)="onDisconnectWalletStarts()"
            (hdDisconnectWalletError)="onDisconnectWalletError($event)"
            (hdWalletDisconnected)="onWalletDisconnected()"
            hdDisconnectWallet
          >
            <span> Disconnect </span>

            <hd-wallet-icon [hdWallet]="wallet"></hd-wallet-icon>
          </button>
        </div>
      </section>
    </main>
  `,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    HdSelectAndConnectWalletDirective,
    HdDisconnectWalletDirective,
    HdWalletAdapterDirective,
    HdObscureAddressPipe,
    HdWalletIconComponent,
  ],
})
export class AppComponent {
  onWalletConnected() {
    console.log('Wallet connected');
  }

  onConnectWalletStarts() {
    console.log('Starting to connect wallet');
  }

  onConnectWalletError(error: unknown) {
    console.error(error);
  }

  onWalletDisconnected() {
    console.log('Wallet disconnected');
  }

  onDisconnectWalletStarts() {
    console.log('Starting to disconnect wallet');
  }

  onDisconnectWalletError(error: unknown) {
    console.error(error);
  }
}
