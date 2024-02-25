![Screenshot from 2023-01-18 17-17-53](https://user-images.githubusercontent.com/7496781/213252669-11daf2f3-008c-4251-8d09-2bc9cb84d744.png)

# Material Example

By following this instructions you'll be able to set up the wallet-adapter into an angular application using the material package.

## Pre-requisites

```
"rxjs": "~7.8.0",
"@angular/core": "^17.1.0"
"@angular/common": "^17.1.0"
"@angular/cdk": "^17.1.0"
"@angular/material": "^17.1.0"
"@ngrx/component-store": "^17.0.0"
"@solana/wallet-adapter-base": "^0.9.23"
"@heavy-duty/wallet-adapter": "0.8.4"
"@heavy-duty/wallet-adapter-cdk": "0.8.4"
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

NOTE: Don't forget to properly [setup Angular Material](https://material.angular.io/guide/getting-started).

### Integrate wallet logic

Now we have to add some wallet interactions, it would look something like this:

- Import and inject HdWalletAdapterDirective.
- Use HdWalletAdapterDirective structural directive to get access to the underlying state.

This will result in something like:

```ts
import { NgClass } from '@angular/common';
import { Component, computed } from '@angular/core';
import {
  injectConnected,
  injectPublicKey,
  injectWallet,
} from '@heavy-duty/wallet-adapter';
import { HdObscureAddressPipe } from '@heavy-duty/wallet-adapter-cdk';

@Component({
  standalone: true,
  selector: 'hd-root',
  template: `
    <header>
      <h1>Wallet Adapter Example (Material)</h1>
    </header>

    <main>
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
    </main>
  `,
  imports: [NgClass, HdObscureAddressPipe],
})
export class AppComponent {
  readonly wallet = injectWallet();
  readonly connected = injectConnected();
  readonly publicKey = injectPublicKey();
  readonly walletName = computed(() => this.wallet()?.adapter.name ?? 'None');
}
```

### Multi Button integration

At this moment there's no way for the user to select a wallet in our example. We have to give users a way to see the available wallets, then choose one and use that to connect. First we add the wallet-adapter material providers:

For module-based applications:

```ts
@NgModule({
  declarations: [
    ...
  ],
  imports: [
    ...,
    HdWalletAdapterMaterialModule
  ],
  providers: [
  	...
  ],
  bootstrap: [
  	...
  ]
}) export class AppModule {}
```

For standalone applications:

```ts
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideWalletAdapter } from '@heavy-duty/wallet-adapter';
import { HdWalletAdapterMaterialModule } from '@heavy-duty/wallet-adapter-material';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom([
      BrowserAnimationsModule,
      HdWalletAdapterMaterialModule,
    ]),
    provideWalletAdapter(),
  ],
};
```

Now we have to use the multi-button component following these steps:

- Import multi button from the material library.
- Add the multi button to the template.

A simplified version of this would end up like this:

```ts
import { NgClass } from '@angular/common';
import { Component, computed } from '@angular/core';
import {
  injectConnected,
  injectPublicKey,
  injectWallet,
} from '@heavy-duty/wallet-adapter';
import { HdObscureAddressPipe } from '@heavy-duty/wallet-adapter-cdk';
import { HdWalletMultiButtonComponent } from '@heavy-duty/wallet-adapter-material';

@Component({
  standalone: true,
  selector: 'hd-root',
  template: `
    <header>
      <h1>Wallet Adapter Example (Material)</h1>
    </header>

    <main>
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
  imports: [NgClass, HdObscureAddressPipe, HdWalletMultiButtonComponent],
})
export class AppComponent {
  readonly wallet = injectWallet();
  readonly connected = injectConnected();
  readonly publicKey = injectPublicKey();
  readonly walletName = computed(() => this.wallet()?.adapter.name ?? 'None');
}
```

You can [access the final code](/examples/material/) if you'd rather copy the application.
