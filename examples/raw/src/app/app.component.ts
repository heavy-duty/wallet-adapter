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
