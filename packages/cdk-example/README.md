# CDK Example

By following this instructions you'll be able to set up the wallet-adapter into an angular application using the CDK.

## Pre-requisites

```
"@angular/core": "15.1.0",
"@angular/cdk": "15.1.0",
"@ngrx/component-store": "15.0.0",
"@solana/web3.js": "1.73.0",
"rxjs": "7.5.2",
"@solana/wallet-adapter-base": "0.9.20"
"@heavy-duty/wallet-adapter": "0.6.0"
"@heavy-duty/wallet-adapter-cdk": "0.6.0"
"@angular-builders/custom-webpack": "15.0.0"
```

NOTE: If you're using Nx you don't need `@angular-builders/custom-webpack`.

## Installation

### ng

```
$ ng add @heavy-duty/wallet-adapter
```

### npm

```
$ npm install --save @heavy-duty/wallet-adapter
```

## Development Configuration Setup

### Add `webpack.config.js` to the root of project folder and add the following inside the file

```js
module.exports = (config) => {
  config.resolve.fallback = {
    crypto: false,
    stream: false,
  };

  return config;
};
```

### Update `angular.json`

**Set `architect.build.builder` to `"@angular-builders/custom-webpack:browser"`**

```json
"architect": {
	"build": {
	 	"builder": "@angular-builders/custom-webpack:browser",
	 	...
 	},
 	...
 }
```

**In `architect.build.options`, add custom-webpack configuration**

```json
"architect": {
	...
	"build": {
		...
	 	"options": {
	 		...
	 		"customWebpackConfig": {
              "path": "<PATH_TO_THE_WEBPACK_CONFIG>"
            }
	 	}
 	},
 	...
 }
```

**Set `architect.serve.builder` to `"@angular-builders/custom-webpack:dev-server"`**

```json
"architect": {
	...
	"serve": {
	 	"builder": "@angular-builders/custom-webpack:dev-server",
	 	...
 	},
 	...
 }
```

### Update `project.json` (Nx workspace only)

**Set `architect.build.executor` to `"@nrwl/angular:webpack-browser"`**

```json
"architect": {
	"build": {
	 	"executor": "@nrwl/angular:webpack-browser",
	 	...
 	},
 	...
 }
```

**In `architect.build.options`, add custom-webpack configuration**

```json
"architect": {
	...
	"build": {
		...
	 	"options": {
	 		...
	 		"customWebpackConfig": {
        "path": "<PATH_TO_THE_WEBPACK_CONFIG>"
      }
	 	}
 	},
 	...
 }
```

**Set `architect.serve.executor` to `"@nrwl/angular:webpack-dev-server"`**

```json
"architect": {
	...
	"serve": {
	 	"executor": "@nrwl/angular:webpack-dev-server",
	 	...
 	},
 	...
 }
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
import { Component } from '@angular/core';
import { provideWalletAdapter } from '@heavy-duty/wallet-adapter';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';

@Component({
  standalone: true,
  selector: 'hd-root',
  // template: `your template`,
  providers: [
    provideWalletAdapter({
      autoConnect: false,
      adapters: [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    }),
  ],
})
export class AppComponent {}
```

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
      </section>
    </main>
  `,
  imports: [NgIf, HdWalletAdapterDirective, HdObscureAddressPipe],
  providers: [
    provideWalletAdapter({
      autoConnect: false,
      adapters: [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    }),
  ],
})
export class AppComponent {}
```

### Select wallet

At this moment there's no way for the user to select a wallet in our example. We have to give users a way to see the available wallets, then choose one and use that to connect. Step by step it looks like this:

- Display all wallets in a radio button group.
- Select the wallet and update store when the input changes.

A simplified version of this would end up like this:

```ts
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
} from '@heavy-duty/wallet-adapter/cdk';
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
      </section>
    </main>
  `,
  imports: [
    NgIf,
    NgFor,
    FormsModule,
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
  onWalletSelected(walletName: WalletName | null) {
    console.log(`Wallet selected: ${walletName}`);
  }
}
```

### Connect wallet

Now that users can finally select their wallet it's time for us to let them connect to it. For this we'll follow the next steps:

- Import and inject HdConnectWalletDirective.
- Use connect wallet directive in a button.
- Log events from connect wallet.

A simplified version of this would end up like this:

```ts
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
} from '@heavy-duty/wallet-adapter/cdk';
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
      </section>
    </main>
  `,
  imports: [
    NgIf,
    NgFor,
    FormsModule,
    HdConnectWalletDirective,
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

  onWalletSelected(walletName: WalletName | null) {
    console.log(`Wallet selected: ${walletName}`);
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
} from '@heavy-duty/wallet-adapter/cdk';
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
```

You can [access the final code](/packages/cdk-example/) if you'd rather copy the application.
