![Screenshot from 2023-01-18 17-17-53](https://user-images.githubusercontent.com/7496781/213252669-11daf2f3-008c-4251-8d09-2bc9cb84d744.png)

# Material Example

By following this instructions you'll be able to set up the wallet-adapter into an angular application using the material package.

## Pre-requisites

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
$ npm install --save @heavy-duty/wallet-adapter @heavy-duty/wallet-adapter-cdk @heavy-duty/wallet-adapter-material
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

NOTE: Don't forget to properly [setup Angular Material](https://material.angular.io/guide/getting-started).

### Integrate wallet logic

Now we have to add some wallet interactions, it would look something like this:

- Import and inject HdWalletAdapterDirective.
- Use HdWalletAdapterDirective structural directive to get access to the underlying state.

This will result in something like:

```ts
import { AsyncPipe, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { provideWalletAdapter, WalletStore } from '@heavy-duty/wallet-adapter';
import {
  HdWalletAdapterDirective,
  HdObscureAddressPipe,
} from '@heavy-duty/wallet-adapter/cdk';

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
      </section>
    </main>
  `,
  imports: [NgIf, HdWalletAdapterDirective, HdObscureAddressPipe],
})
export class AppComponent {}
```

### Multi Button integration

At this moment there's no way for the user to select a wallet in our example. We have to give users a way to see the available wallets, then choose one and use that to connect. Step by step it looks like this:

- Import multi button from the material library.

A simplified version of this would end up like this:

```ts
import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import {
  HdObscureAddressPipe,
  HdWalletAdapterDirective,
} from '@heavy-duty/wallet-adapter-cdk';
import { HdWalletMultiButtonComponent } from '@heavy-duty/wallet-adapter-material';

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

        <hd-wallet-multi-button></hd-wallet-multi-button>
      </section>
    </main>
  `,
  imports: [
    NgIf,
    HdWalletAdapterDirective,
    HdObscureAddressPipe,
    HdWalletMultiButtonComponent,
  ],
})
export class AppComponent {}
```

You can [access the final code](/packages/material-example/) if you'd rather copy the application.
