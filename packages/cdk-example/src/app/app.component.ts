import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { provideWalletAdapter } from '@heavy-duty/wallet-adapter';
import {
  HdConnectWalletDirective,
  HdDisconnectWalletDirective,
  HdObscureAddressPipe,
  HdSelectWalletDirective,
  HdWalletAdapterDirective,
} from '@heavy-duty/wallet-adapter-cdk';
import { WalletName } from '@solana/wallet-adapter-base';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';

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
    >
      <header>
        <h1>Wallet Adapter Example (CDK)</h1>
      </header>

      <section>
        <div>
          <p>
            Wallet:
            {{ wallet !== null ? wallet.adapter.name : 'None' }}
          </p>

          <p *ngIf="publicKey">
            Public Key: {{ publicKey.toBase58() | hdObscureAddress }}
          </p>

          <p>Status: {{ connected ? 'connected' : 'disconnected' }}</p>
        </div>

        <fieldset
          #selectWallet="hdSelectWallet"
          (walletSelected)="onWalletSelected($event)"
          hdSelectWallet
        >
          <legend>Select a wallet:</legend>

          <div>
            <input
              id="select-wallet-empty"
              [value]="null"
              [ngModel]="wallet?.adapter?.name ?? null"
              (ngModelChange)="selectWallet.run(null)"
              type="radio"
              name="walletName"
            />
            <label for="select-wallet-empty"> None </label>
          </div>

          <div *ngFor="let wallet of wallets; let i = index">
            <input
              [id]="'select-wallet-' + i"
              [value]="wallet.adapter.name"
              [ngModel]="wallet?.adapter?.name ?? null"
              (ngModelChange)="selectWallet.run(wallet.adapter.name)"
              type="radio"
              name="walletName"
            />
            <label [for]="'select-wallet-' + i">
              {{ wallet.adapter.name }}
            </label>
          </div>
        </fieldset>

        <button
          #connectWallet="hdConnectWallet"
          [disabled]="connected || wallet === null"
          (click)="connectWallet.run()"
          (connectWalletStarts)="onConnectWalletStarts()"
          (connectWalletError)="onConnectWalletError($event)"
          (walletConnected)="onWalletConnected()"
          hdConnectWallet
        >
          Connect
        </button>
        <button
          #disconnectWallet="hdDisconnectWallet"
          [disabled]="!connected"
          (click)="disconnectWallet.run()"
          (disconnectWalletStarts)="onDisconnectWalletStarts()"
          (disconnectWalletError)="onDisconnectWalletError($event)"
          (walletDisconnected)="onWalletDisconnected()"
          hdDisconnectWallet
        >
          Disconnect
        </button>
      </section>
    </main>
  `,
  imports: [
    NgIf,
    NgFor,
    FormsModule,
    HdConnectWalletDirective,
    HdDisconnectWalletDirective,
    HdSelectWalletDirective,
    HdWalletAdapterDirective,
    HdObscureAddressPipe,
  ],
  providers: [
    provideWalletAdapter({
      autoConnect: false,
      adapters: [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    }),
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

  onWalletSelected(walletName: WalletName | null) {
    console.log(`Wallet selected: ${walletName}`);
  }
}
