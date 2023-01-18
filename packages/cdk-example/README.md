![Screenshot from 2023-01-18 17-16-36](https://user-images.githubusercontent.com/7496781/213252495-cddbff02-f030-41dc-88da-e03d0735fdbd.png)

# CDK Example

By following this instructions you'll be able to set up the wallet-adapter into an angular application using the headless UI package and tailwindcss.

## Pre-requisites

The application should have tailwindcss already configured.

```
"rxjs": "7.5.2",
"@angular/core": "15.1.0",
"@ngrx/component-store": "15.0.0",
"@solana/web3.js": "1.73.0",
"@solana/wallet-adapter-base": "0.9.20",
"@solana/wallet-adapter-phantom": "0.9.19",
"@solana/wallet-adapter-solflare": "0.6.21",
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
    HdWalletAdapterModule.forRoot({ autoConnect: true })
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
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideWalletAdapter({
      autoConnect: false,
      adapters: [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    }),
  ],
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

You can [access the final code](/packages/cdk-example/) if you'd rather copy the application.
