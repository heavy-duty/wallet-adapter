import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  HdDisconnectWalletDirective,
  HdEncodeTextPipe,
  HdObscureAddressPipe,
  HdSelectAndConnectWalletDirective,
  HdSignMessageDirective,
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
            <span *ngIf="publicKey !== null; else noWalletConnected">
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

          <div *ngIf="publicKey !== null">
            <p>Sign a Message</p>
            <form
              #hdSignMessage="hdSignMessage"
              *ngIf="message | hdEncodeText as encodedMessage"
              (ngSubmit)="hdSignMessage.run(encodedMessage)"
              (hdSignMessageStarts)="onSignMessageStarts()"
              (hdSignMessageError)="onSignMessageError($event)"
              (hdMessageSigned)="onMessageSigned($event)"
              hdSignMessage
            >
              <label class="mr-2" for="message-form-content">Message: </label>
              <input
                id="message-form-content"
                class="px-2 py-1 border-2 border-black rounded-md mr-2"
                [(ngModel)]="message"
                type="text"
                name="content"
              />
              <button
                class="px-4 py-2 bg-violet-800 text-white rounded-md disabled:cursor-not-allowed"
                type="submit"
              >
                Sign
              </button>
            </form>
          </div>
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
    FormsModule,
    HdSelectAndConnectWalletDirective,
    HdDisconnectWalletDirective,
    HdWalletAdapterDirective,
    HdObscureAddressPipe,
    HdWalletIconComponent,
    HdSignMessageDirective,
    HdEncodeTextPipe,
  ],
})
export class AppComponent {
  message = '';

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

  onMessageSigned(signature: Uint8Array) {
    console.log('Message signed', Buffer.from(signature).toString('base64'));
  }

  onSignMessageStarts() {
    console.log('Starting to sign message');
  }

  onSignMessageError(error: unknown) {
    console.error(error);
  }
}
