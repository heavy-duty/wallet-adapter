<p align="center">
<img src="https://user-images.githubusercontent.com/7496781/213251275-69e098db-a8cf-4e14-ba75-4a1c11dbe2ca.svg" width="200" height="200" />
</p>

# @heavy-duty/wallet-adapter

The official Angular library for integrating wallets from the Solana ecosystem.

@heavy-duty/wallet-adapter smooths over the rough edges an Angular developer might encounter when implementing the framework-agnostic @solana/wallet-adapter & aims to provide a more natural developer experience by conforming to Angular conventions.

- **Dependency injection** - Provide and Inject Wallet services in your components
- **Observable based** - Utilize RxJS rather than callbacks for realtime streams

## Example use

In your application configuration file:

```ts
import { ApplicationConfig } from '@angular/core';
import { provideWalletAdapter } from '@heavy-duty/wallet-adapter';

export const appConfig: ApplicationConfig = {
  providers: [provideWalletAdapter()],
};
```

Note: This file is usually located in `src/app/app.config.ts`.

```ts
import { Component, computed } from '@angular/core';
import {
  injectConnected,
  injectPublicKey,
  injectWallet,
} from '@heavy-duty/wallet-adapter';

@Component({
  standalone: true,
  selector: 'hd-root',
  template: `
    <header>
      <h1>Wallet Adapter Example (Raw)</h1>
    </header>

    <main>
      <section>
        <p>
          Wallet:

          {{ walletName() }}
        </p>

        <p>Status: {{ connected() ? 'connected' : 'disconnected' }}</p>

        @if (publicKey(); as publicKey) {
          <p>Public Key: {{ publicKey.toBase58() }}</p>
        }
      </section>
    </main>
  `,
})
export class AppComponent {
  readonly connected = injectConnected();
  readonly publicKey = injectPublicKey();
  readonly wallet = injectWallet();
  readonly walletName = computed(() => this.wallet()?.adapter.name ?? 'None');
}
```

## Compatibility

### Angular and @solana/wallet-adapter versions

@heavy-duty/wallet-adapter doesn't follow Angular's versioning as @solana/wallet-adapter also has breaking changes throughout the year. Instead we try to maintain compatibility with both @solana/wallet-adapter and Angular majors for as long as possible, only breaking when we need to support a new major of one or the other.

| Angular | @solana/web3.js | @heavy-duty/wallet-adapter |
| ------- | --------------- | -------------------------- |
| ^17.1.0 | 1.87.6          | ^0.8.4                     |
| ^17.0.0 | 1.87.6          | ^0.8.0                     |
| 16.2.7  | 1.78.5          | 0.7.3                      |
| 16.1.5  | 1.78.3          | 0.7.2                      |
| 16.1.5  | 1.78.0          | 0.7.1                      |
| 16.0.2  | -               | 0.7.0                      |
| 15.2.4  | -               | 0.6.4                      |
| 15.1.0  | -               | 0.6.0                      |
| 15.0.0  | -               | ^0.5                       |
| 14      | -               | ^0.4                       |
| 13      | -               | ^0.3                       |
| 12      | -               | ^0.2                       |

<sub>Version combinations not documented here **may** work but are untested.</sub>

## Testing

There's only a test suite for the logical layer of the wallet-adapter, also known as `data-access`. In order to run the tests just execute `nx test data-access` from the root folder.

NOTE: You'll need nx installed globally.

## Building

The three main packages `data-access`, `ui-cdk` and `ui-material` are publishable libraries. Each can be built with the following commands:

```bash
nx build data-access
```

```bash
nx build ui-cdk
```

```bash
nx build ui-material
```

## Resources

- [Quickstart](/examples/raw/README.md) - Let your users select a wallet and connect to it.
- [Quickstart CDK](/examples/cdk/README.md) - Let your users select a wallet and connect to it using the headless UI package.
- [Quickstart Material](/examples/material/README.md) - Let your users select a wallet and connect to it using Angular Material UI.

NOTE: Using the material package is the easiest way to get started, but it's less customizable, instead if you want a custom experience use the CDK or the base library.

## Authors

Made with <3 by [Heavy Duty Builders](https://github.com/heavy-duty).
