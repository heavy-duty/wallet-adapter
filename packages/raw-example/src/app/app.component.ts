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
          [disabled]="(connected$ | async) || (wallet$ | async) === null"
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
