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

          <div *ngIf="publicKey$ | async as publicKey">
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
          </div>
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
          [disabled]="(connected$ | async) || (wallet$ | async) === null"
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
  readonly messageControl = this._formBuilder.control<string>('', {
    nonNullable: true,
  });

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
