import { NgClass } from '@angular/common';
import { Component, OnInit, computed, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  WalletStore,
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
export class AppComponent implements OnInit {
  private readonly _walletStore = inject(WalletStore);
  private readonly _matSnackBar = inject(MatSnackBar);
  readonly wallet = injectWallet();
  readonly connected = injectConnected();
  readonly publicKey = injectPublicKey();
  readonly walletName = computed(() => this.wallet()?.adapter.name ?? 'None');

  ngOnInit() {
    this._walletStore.error$.subscribe((error) => {
      if (error) {
        this._matSnackBar.open(error?.message ?? 'Error occurred', 'close', {
          duration: 4000,
        });
      }
    });
  }
}
