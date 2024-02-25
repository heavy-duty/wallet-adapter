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
