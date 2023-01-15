# @heavy-duty/wallet-adapter

The official Angular library for integrating wallets from the Solana ecosystem.

@heavy-duty/wallet-adapter smooths over the rough edges an Angular developer might encounter when implementing the framework-agnostic @solana/wallet-adapter & aims to provide a more natural developer experience by conforming to Angular conventions.

Dependency injection - Provide and Inject Wallet services in your components
Observable based - Utilize RxJS rather than callbacks for realtime streams

## Example use

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
      </section>
    </main>
  `,
  imports: [NgIf, AsyncPipe],
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
}
```

## Compatibility

### Angular and @solana/wallet-adapter versions

@heavy-duty/wallet-adapter doesn't follow Angular's versioning as @solana/wallet-adapter also has breaking changes throughout the year. Instead we try to maintain compatibility with both @solana/wallet-adapter and Angular majors for as long as possible, only breaking when we need to support a new major of one or the other.

| Angular | @heavy-duty/wallet-adapter |
| ------- | -------------------------- |
| 15      | ^0.5                       |
| 14      | ^0.4                       |
| 13      | ^0.3                       |
| 12      | ^0.2                       |

<sub>Version combinations not documented here **may** work but are untested.</sub>

## Resources

[Quickstart](/packages/raw-example/README.md) - Let your users select a wallet and connect to it.
