![Screenshot from 2023-01-25 15-48-58](https://user-images.githubusercontent.com/7496781/214612294-403ad4e6-0eeb-4b04-8c3a-17e1defb085c.png)

# Raw Example

By following this instructions you'll be able to set up the wallet-adapter into an angular application without any of the UI packages available.

## Pre-requisites

```
"@angular/core": "^17.1.0"
"@ngrx/component-store": "^17.0.0"
"@solana/web3.js": "^1.87.6"
"@solana/wallet-adapter-base": "^0.9.23"
"rxjs": "~7.8.0"
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

- Display wallet selected, it's public key and the status of it.
- Allow users to connect the selected wallet.
- Allow users to disconnect the wallet.

This will result in something like:

```ts
import { Component, computed, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  WalletStore,
  injectConnected,
  injectPublicKey,
  injectWallet,
} from '@heavy-duty/wallet-adapter';

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

            {{ walletName() }}
          </p>

          <p>Status: {{ connected() ? 'connected' : 'disconnected' }}</p>

          @if (publicKey(); as publicKey) {
            <p>Public Key: {{ publicKey.toBase58() }}</p>
          }
        </div>

        <button [disabled]="connected() || !wallet()" (click)="onConnect()">
          Connect
        </button>
        <button [disabled]="!connected()" (click)="onDisconnect()">
          Disconnect
        </button>
      </section>
    </main>
  `,
  imports: [ReactiveFormsModule],
})
export class AppComponent {
  private readonly _walletStore = inject(WalletStore);
  readonly wallet = injectWallet();
  readonly connected = injectConnected();
  readonly publicKey = injectPublicKey();
  readonly walletName = computed(() => this.wallet()?.adapter.name ?? 'None');

  onConnect() {
    console.log('Starting to connect wallet');

    this._walletStore.connect().subscribe({
      next: () => console.log('Wallet connected'),
      error: (error) => console.error(error),
    });
  }

  onDisconnect() {
    console.log('Starting to disconnect wallet');

    this._walletStore.disconnect().subscribe({
      next: () => console.log('Wallet disconnected'),
      error: (error) => console.error(error),
    });
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
import { Component, OnInit, computed, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  WalletStore,
  injectConnected,
  injectPublicKey,
  injectWallet,
  injectWallets,
} from '@heavy-duty/wallet-adapter';
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

            {{ walletName() }}
          </p>

          <p>Status: {{ connected() ? 'connected' : 'disconnected' }}</p>

          @if (publicKey(); as publicKey) {
            <p>Public Key: {{ publicKey.toBase58() }}</p>
          }
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

          @for (wallet of wallets(); track wallet.adapter.name) {
            <div>
              <input
                [id]="'select-wallet-' + wallet.adapter.name"
                [formControl]="selectWalletControl"
                [value]="wallet.adapter.name"
                type="radio"
                name="walletName"
              />
              <label [for]="'select-wallet-' + wallet.adapter.name">
                {{ wallet.adapter.name }}
              </label>
            </div>
          }
        </fieldset>

        <button [disabled]="connected() || !wallet()" (click)="onConnect()">
          Connect
        </button>
        <button [disabled]="!connected()" (click)="onDisconnect()">
          Disconnect
        </button>
      </section>
    </main>
  `,
  imports: [ReactiveFormsModule],
})
export class AppComponent implements OnInit {
  private readonly _walletStore = inject(WalletStore);
  private readonly _formBuilder = inject(FormBuilder);
  readonly wallet = injectWallet();
  readonly connected = injectConnected();
  readonly publicKey = injectPublicKey();
  readonly wallets = injectWallets();
  readonly walletName = computed(() => this.wallet()?.adapter.name ?? 'None');
  readonly selectWalletControl = this._formBuilder.control<WalletName | null>(
    null,
    [Validators.required]
  );

  ngOnInit() {
    this._walletStore.wallet$.subscribe((wallet) =>
      this.selectWalletControl.setValue(wallet?.adapter.name ?? null, {
        emitEvent: false,
      })
    );

    this.selectWalletControl.valueChanges.subscribe((walletName) => {
      this._walletStore.selectWallet(walletName);
      console.log(`Wallet selected: ${walletName}`);
    });
  }

  onConnect() {
    console.log('Starting to connect wallet');

    this._walletStore.connect().subscribe({
      next: () => console.log('Wallet connected'),
      error: (error) => console.error(error),
    });
  }

  onDisconnect() {
    console.log('Starting to disconnect wallet');

    this._walletStore.disconnect().subscribe({
      next: () => console.log('Wallet disconnected'),
      error: (error) => console.error(error),
    });
  }
}
```

### Sign message

Now that the user has connected a wallet, is time to do something with it. We'll start by signing a message. Step by step it looks like this:

- A message input for the user to write the message.
- Add a `messageControl` form control.
- Add a `onSignMessage` method that gets the raw message, encodes it and signs it.

A simplified version of this would end up like this:

```ts
import { Component, OnInit, computed, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  WalletStore,
  injectConnected,
  injectPublicKey,
  injectWallet,
  injectWallets,
} from '@heavy-duty/wallet-adapter';
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

            {{ walletName() }}
          </p>

          <p>Status: {{ connected() ? 'connected' : 'disconnected' }}</p>

          @if (publicKey(); as publicKey) {
            <p>Public Key: {{ publicKey.toBase58() }}</p>

            <label class="mr-2" for="message-form-content"
              >Sign Message:
            </label>
            <input
              id="message-form-content"
              class="px-2 py-1 border-2 border-black rounded-md mr-2"
              [formControl]="messageControl"
              type="text"
              name="content"
            />
            <button
              class="px-4 py-2 bg-violet-800 text-white rounded-md disabled:cursor-not-allowed"
              (click)="onSignMessage()"
              type="submit"
            >
              Sign
            </button>
          }
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

          @for (wallet of wallets(); track wallet.adapter.name) {
            <div>
              <input
                [id]="'select-wallet-' + wallet.adapter.name"
                [formControl]="selectWalletControl"
                [value]="wallet.adapter.name"
                type="radio"
                name="walletName"
              />
              <label [for]="'select-wallet-' + wallet.adapter.name">
                {{ wallet.adapter.name }}
              </label>
            </div>
          }
        </fieldset>

        <button [disabled]="connected() || !wallet()" (click)="onConnect()">
          Connect
        </button>
        <button [disabled]="!connected()" (click)="onDisconnect()">
          Disconnect
        </button>
      </section>
    </main>
  `,
  imports: [ReactiveFormsModule],
})
export class AppComponent implements OnInit {
  private readonly _walletStore = inject(WalletStore);
  private readonly _formBuilder = inject(FormBuilder);
  readonly wallet = injectWallet();
  readonly connected = injectConnected();
  readonly publicKey = injectPublicKey();
  readonly wallets = injectWallets();
  readonly walletName = computed(() => this.wallet()?.adapter.name ?? 'None');
  readonly selectWalletControl = this._formBuilder.control<WalletName | null>(
    null,
    [Validators.required]
  );
  readonly messageControl = this._formBuilder.control<string>('', {
    nonNullable: true,
  });

  ngOnInit() {
    this._walletStore.wallet$.subscribe((wallet) =>
      this.selectWalletControl.setValue(wallet?.adapter.name ?? null, {
        emitEvent: false,
      })
    );

    this.selectWalletControl.valueChanges.subscribe((walletName) => {
      this._walletStore.selectWallet(walletName);
      console.log(`Wallet selected: ${walletName}`);
    });
  }

  onConnect() {
    console.log('Starting to connect wallet');

    this._walletStore.connect().subscribe({
      next: () => console.log('Wallet connected'),
      error: (error) => console.error(error),
    });
  }

  onDisconnect() {
    console.log('Starting to disconnect wallet');

    this._walletStore.disconnect().subscribe({
      next: () => console.log('Wallet disconnected'),
      error: (error) => console.error(error),
    });
  }

  onSignMessage() {
    const message = this.messageControl.getRawValue();
    const encodedMessage = new TextEncoder().encode(message);
    const signMessage$ = this._walletStore.signMessage(encodedMessage);

    if (!signMessage$) {
      console.error('Wallet is not capable of message signing.');
    } else {
      signMessage$.subscribe({
        next: (signature) => console.log('Message signed', signature),
        error: (error) => console.error(error),
      });
    }
  }
}
```

You can [access the final code](/examples/raw/) if you'd rather copy the application.
