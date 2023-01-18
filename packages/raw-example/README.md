
![Screenshot from 2023-01-18 17-17-24](https://user-images.githubusercontent.com/7496781/213252348-41b145b0-3630-4f88-862e-140f160a9c53.png)

# Raw Example

By following this instructions you'll be able to set up the wallet-adapter into an angular application without any of the UI packages available.

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
$ npm install --save @heavy-duty/wallet-adapter
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

- Display wallet selected, it's public key and the status of it.
- Allow users to connect the selected wallet.
- Allow users to disconnect the wallet.

This will result in something like:

```ts
import { AsyncPipe, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { WalletStore } from '@heavy-duty/wallet-adapter';

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
          [disabled]="connected$ | async || (wallet$ | async) === null"
          (click)="onConnect()"
        >
          Connect
        </button>
        <button
          [disabled]="(connected$ | async) === false"
          (click)="onDisconnect()"
        >
          Disconnect
        </button>
      </section>
    </main>
  `,
  imports: [NgIf, AsyncPipe],
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
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { WalletName } from '@solana/wallet-adapter-base';

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
              id="select-wallet-empty"
              [formControl]="selectWalletControl"
              [value]="null"
              type="radio"
              name="walletName"
            />
            <label for="select-wallet-empty">None</label>
          </div>

          <div *ngFor="let wallet of wallets$ | async; let i = index">
            <input
              [id]="'select-wallet-' + i"
              [formControl]="selectWalletControl"
              [value]="wallet.adapter.name"
              type="radio"
              name="walletName"
            />
            <label [for]="'select-wallet-' + i">
              {{ wallet.adapter.name }}
            </label>
          </div>
        </fieldset>

        <button
          [disabled]="connected$ | async || (wallet$ | async) === null"
          (click)="onConnect()"
        >
          Connect
        </button>
        <button
          [disabled]="(connected$ | async) === false"
          (click)="onDisconnect()"
        >
          Disconnect
        </button>
      </section>
    </main>
  `,
  imports: [NgIf, NgFor, AsyncPipe, ReactiveFormsModule],
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
