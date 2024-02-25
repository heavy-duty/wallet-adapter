![Screenshot from 2023-01-25 15-49-34](https://user-images.githubusercontent.com/7496781/214612489-be71f044-d5a4-4861-a4f8-0ff24cf36c5f.png)

# CDK Example

By following this instructions you'll be able to set up the wallet-adapter into an angular application using the headless UI package and tailwindcss.

## Pre-requisites

The application should have tailwindcss already configured.

```
"rxjs": "~7.8.0",
"@angular/core": "^17.0.0",
"@ngrx/component-store": "^17.0.1",
"@solana/web3.js": "1.87.6",
"@solana/wallet-adapter-base": "0.9.23",
```

## Installation

```
$ npm install --save @heavy-duty/wallet-adapter @heavy-duty/wallet-adapter-cdk
```

## Usage

### Add wallet adapter module in `app.module.ts`

For Angular applications using modules:

```ts
@NgModule({
  declarations: [
    ...
  ],
  imports: [
    ... ,
    HdWalletAdapterModule.forRoot()
  ],
  providers: [
  	...
  ],
  bootstrap: [
  	...
  ]
}) export class AppModule {}
```

For Angular applications using standalone:

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideWalletAdapter } from '@heavy-duty/wallet-adapter';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [provideWalletAdapter()],
}).catch((err) => console.error(err));
```

### Integrate wallet logic

Now we have to add some wallet interactions, it would look something like this:

- Import and inject HdWalletAdapterDirective.
- Use HdWalletAdapterDirective structural directive to get access to the underlying state.

This will result in something like:

```ts
import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import {
  HdObscureAddressPipe,
  HdWalletAdapterDirective,
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
      </section>
    </main>
  `,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    HdWalletAdapterDirective,
    HdObscureAddressPipe,
  ],
})
export class AppComponent {}
```

### Select and connect wallet

At this moment there's no way for the user to select a wallet in our example. We have to give users a way to see the available wallets, then choose one and use that to connect. Step by step it looks like this:

- Display a connect button per wallet.
- Clicking a button selects the wallet and connects to it.

A simplified version of this would end up like this:

```ts
import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import {
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
        </div>
      </section>
    </main>
  `,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    HdSelectAndConnectWalletDirective,
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
}
```

### Disconnect wallet

Now that users can finally select and connect their wallet it's time for us to let them disconnect. For this we'll follow the next steps:

- Import and inject HdDisconnectWalletDirective.
- Use disconnect wallet directive in a button.
- Log events from disconnect wallet.

A simplified version of this would end up like this:

```ts
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
```

### Sign message

Now that the user has connected a wallet, is time to do something with it. We'll start by signing a message. Step by step it looks like this:

- A message input for the user to write the message.
- Add a `message` property to hold the message.
- Use the `HdEncodeText` pipe to transform the message into an encoded message.
- Run the `HdSignMessage` action and pass in the encoded message.
- Set up handler methods for the action start, success and error.

A simplified version of this would end up like this:

```ts
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
    console.log('Message signed', signature);
  }

  onSignMessageStarts() {
    console.log('Starting to sign message');
  }

  onSignMessageError(error: unknown) {
    console.error(error);
  }
}
```

You can [access the final code](/packages/cdk-example/) if you'd rather copy the application.
