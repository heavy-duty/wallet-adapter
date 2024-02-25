![Screenshot from 2023-01-25 15-49-34](https://user-images.githubusercontent.com/7496781/214612489-be71f044-d5a4-4861-a4f8-0ff24cf36c5f.png)

# CDK Example

By following this instructions you'll be able to set up the wallet-adapter into an angular application using the headless UI package and tailwindcss.

## Pre-requisites

The application should have tailwindcss already configured.

```
"@angular/core": "^17.1.0"
"@angular/cdk": "^17.1.0"
"@angular/platform-browser": "^17.1.0"
"@angular/common": "^17.1.0"
"@ngrx/component-store": "^17.0.0"
"@solana/web3.js": "^1.87.6"
"@solana/wallet-adapter-base": "^0.9.23"
"rxjs": "~7.8.0"
"@heavy-duty/wallet-adapter": "0.8.4"
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

### Set up Tailwind CSS

The recommended way is using Nx's setup-tailwind generator.

### Add overlay styles

Go to the `styles.css` file and include the prebuilt overlay styles.

```css
/* ... */
@import '@angular/cdk/overlay-prebuilt.css';
```

### Create a Wallet Modal

The first step will be to create our custom modal to let users choose a wallet to connect. It will look like this:

```ts
import { DialogRef } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { injectWallets } from '@heavy-duty/wallet-adapter';
import { HdWalletIconComponent } from '@heavy-duty/wallet-adapter-cdk';
import { WalletName, WalletReadyState } from '@solana/wallet-adapter-base';

@Component({
  selector: 'hd-wallets-modal',
  template: `
    <div class="w-[450px] mx-auto border-2 border-black">
      <header class="p-16 relative">
        <h2 class="text-2xl text-center">
          {{ message() }}
        </h2>
        <button
          class="absolute top-2 right-2 hover:bg-zinc-200 p-2 border-2 border-black flex justify-center items-center"
          (click)="onClose()"
        >
          <span class="material-icons-outlined"> close </span>
        </button>
      </header>

      @if (installedWallets().length > 0) {
        <ul>
          @for (wallet of installedWallets(); track wallet.adapter.name) {
            <li>
              <button
                (click)="onSelectWallet(wallet.adapter.name)"
                class="flex items-center gap-4 px-8 py-4 w-full hover:bg-zinc-200"
              >
                <hd-wallet-icon [hdWallet]="wallet"></hd-wallet-icon>
                <span>{{ wallet.adapter.name }}</span>
              </button>
            </li>
          }
        </ul>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [HdWalletIconComponent],
})
export class WalletsModalComponent {
  private readonly _dialogRef = inject(DialogRef);
  private readonly _wallets = injectWallets();

  readonly installedWallets = computed(() =>
    this._wallets().filter(
      (wallet) => wallet.readyState === WalletReadyState.Installed
    )
  );
  readonly message = computed(() => {
    if (this.installedWallets().length > 0) {
      return 'Connect a wallet on Solana to continue';
    } else {
      return `You'll need a wallet on Solana to continue`;
    }
  });

  onSelectWallet(walletName: WalletName): void {
    this._dialogRef.close(walletName);
  }

  onClose(): void {
    this._dialogRef.close();
  }
}
```

### Create a Multi Button

Now that we have our custom modal, the next step is to create a multi-button that encapsulates the common logic:

- If there's a wallet connected show the disconnect button.
- If there's a wallet selected but not connected show the connect button.
- If there's no wallet selected show the select button.

This will look like this:

### Tie things together

We can use our newly created multi-button in our app component's like this:

```ts
import { NgClass } from '@angular/common';
import { Component, computed } from '@angular/core';
import {
  injectConnected,
  injectPublicKey,
  injectWallet,
} from '@heavy-duty/wallet-adapter';
import { HdObscureAddressPipe } from '@heavy-duty/wallet-adapter-cdk';
import { WalletMultiButtonComponent } from './wallet-multi-button.component';

@Component({
  standalone: true,
  selector: 'hd-root',
  template: `
    <header class="p-8">
      <h1 class="text-2xl text-center">Wallet Adapter Example (CDK)</h1>
    </header>

    <main class="max-w-[36rem] mx-auto border-2 border-black p-4">
      <section>
        <p>
          Wallet:
          {{ walletName() }}
        </p>

        <p>
          Public Key:

          @if (publicKey(); as publicKey) {
            <span>
              {{ publicKey.toBase58() | hdObscureAddress }}
            </span>
          } @else {
            <span> None </span>
          }
        </p>

        <p>
          Status:
          <span
            [ngClass]="{
              'text-red-600': !connected(),
              'text-green-600': connected()
            }"
          >
            {{ connected() ? 'Connected' : 'Disconnected' }}
          </span>
        </p>
      </section>

      <section>
        <hd-wallet-multi-button></hd-wallet-multi-button>
      </section>
    </main>
  `,
  imports: [NgClass, HdObscureAddressPipe, WalletMultiButtonComponent],
})
export class AppComponent {
  readonly wallet = injectWallet();
  readonly connected = injectConnected();
  readonly publicKey = injectPublicKey();
  readonly walletName = computed(() => this.wallet()?.adapter.name ?? 'None');
}
```

You can [access the final code](/examples/cdk-example/) if you'd rather copy the application.
