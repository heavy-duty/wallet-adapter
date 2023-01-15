# Raw Example

By following this instructions you'll be able to set up the wallet-adapter into an angular application without any of the UI packages available.

## Pre-requisites

```
"@angular/core": "15.1.0",
"@ngrx/component-store": "15.0.0",
"@solana/web3.js": "1.73.0",
"rxjs": "7.5.2",
"@solana/wallet-adapter-base": "0.9.20"
"@heavy-duty/wallet-adapter": "0.5.1"
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

- Display wallet selected, it's public key and the status of it.
- Allow users to connect the selected wallet.
- Allow users to disconnect the wallet.

This will result in something like:

```ts
import { AsyncPipe, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { provideWalletAdapter, WalletStore } from '@heavy-duty/wallet-adapter';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';

@Component({
  standalone: true,
  selector: 'hd-root',
  template: `
    <main>
      <header>
        <h1>Wallet Adapter Example (Raw)</h1>
      </header>

      <section>
        <div>
          <p>
            Wallet:
            <ng-container *ngIf="wallet$ | async as wallet; else noneWallet">
              {{ wallet.adapter.name }}
            </ng-container>
            <ng-template #noneWallet> None </ng-template>
          </p>

          <p *ngIf="publicKey$ | async as publicKey">
            Public Key: {{ publicKey.toBase58() }}
          </p>

          <p>
            Status: {{ (connected$ | async) ? 'connected' : 'disconnected' }}
          </p>
        </div>

        <button
          (click)="onConnect()"
          [disabled]="connected$ | async || (wallet$ | async) === null"
        >
          Connect
        </button>
        <button
          (click)="onDisconnect()"
          [disabled]="(connected$ | async) === false"
        >
          Disconnect
        </button>
      </section>
    </main>
  `,
  imports: [NgIf, AsyncPipe]
  providers: [
    provideWalletAdapter({
      autoConnect: false,
      adapters: [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    }),
  ],
})
export class AppComponent {
  private readonly _walletStore = inject(WalletStore);

  readonly connected$ = this._walletStore.connected$;
  readonly publicKey$ = this._walletStore.publicKey$;
  readonly wallet$ = this._walletStore.wallet$;

  onConnect() {
    this._walletStore.connect().subscribe();
  }

  onDisconnect() {
    this._walletStore.disconnect().subscribe();
  }
}
```

### Select wallet

At this moment there's no way for the user to select a wallet in our example. We have to give users a way to see the available wallets, then choose one and use that to connect. Step by step it looks like this:

- Display all wallets in a radio button group.
- Add a `selectWalletControl` form control.
- Bind the wallet store and the form control.

A simplified version of this would end up like this:

```ts
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { provideWalletAdapter, WalletStore } from '@heavy-duty/wallet-adapter';
import { WalletName } from '@solana/wallet-adapter-base';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';

@Component({
  standalone: true,
  selector: 'hd-root',
  template: `
    <main>
      <header>
        <h1>Wallet Adapter Example (Raw)</h1>
      </header>

      <section>
        <div>
          <p>
            Wallet:
            <ng-container *ngIf="wallet$ | async as wallet; else noneWallet">
              {{ wallet.adapter.name }}
            </ng-container>
            <ng-template #noneWallet> None </ng-template>
          </p>

          <p *ngIf="publicKey$ | async as publicKey">
            Public Key: {{ publicKey.toBase58() }}
          </p>

          <p>
            Status: {{ (connected$ | async) ? 'connected' : 'disconnected' }}
          </p>
        </div>

        <fieldset>
          <legend>Select a wallet:</legend>

          <div>
            <input
              type="radio"
              id="select-wallet-empty"
              name="walletName"
              [formControl]="selectWalletControl"
              [value]="null"
            />
            <label for="select-wallet-empty">None</label>
          </div>

          <div *ngFor="let wallet of wallets$ | async; let i = index">
            <input
              type="radio"
              [id]="'select-wallet-' + i"
              name="walletName"
              [formControl]="selectWalletControl"
              [value]="wallet.adapter.name"
            />
            <label [for]="'select-wallet-' + i">
              {{ wallet.adapter.name }}
            </label>
          </div>
        </fieldset>

        <button
          (click)="onConnect()"
          [disabled]="connected$ | async || (wallet$ | async) === null"
        >
          Connect
        </button>
        <button
          (click)="onDisconnect()"
          [disabled]="(connected$ | async) === false"
        >
          Disconnect
        </button>
      </section>
    </main>
  `,
  imports: [NgIf, NgFor, AsyncPipe, ReactiveFormsModule],
  providers: [
    provideWalletAdapter({
      autoConnect: false,
      adapters: [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    }),
  ],
})
export class AppComponent implements OnInit {
  private readonly _walletStore = inject(WalletStore);
  private readonly _formBuilder = inject(FormBuilder);

  readonly selectWalletControl = this._formBuilder.control<WalletName | null>(
    null,
    [Validators.required]
  );

  readonly connected$ = this._walletStore.connected$;
  readonly publicKey$ = this._walletStore.publicKey$;
  readonly wallets$ = this._walletStore.wallets$;
  readonly wallet$ = this._walletStore.wallet$;

  ngOnInit() {
    this._walletStore.wallet$.subscribe((wallet) =>
      this.selectWalletControl.setValue(wallet?.adapter.name ?? null, {
        emitEvent: false,
      })
    );

    this.selectWalletControl.valueChanges.subscribe((wallet) => {
      this._walletStore.selectWallet(wallet);
    });
  }

  onConnect() {
    this._walletStore.connect().subscribe();
  }

  onDisconnect() {
    this._walletStore.disconnect().subscribe();
  }
}
```

You can [access the final code](/packages/raw-example/) if you'd rather copy the application.
