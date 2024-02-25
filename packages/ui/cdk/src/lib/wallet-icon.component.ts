import { Component, input } from '@angular/core';
import { Wallet } from '@heavy-duty/wallet-adapter';
import { HdSanitizeUrlPipe } from './internals';

@Component({
  selector: 'hd-wallet-icon',
  template: ` <img [src]="hdWallet().adapter.icon | hdSanitizeUrl" alt="" /> `,
  styles: [
    `
      :host {
        width: 1.75rem;
        height: 1.75rem;
      }

      img {
        width: inherit;
        height: inherit;
      }
    `,
  ],
  standalone: true,
  imports: [HdSanitizeUrlPipe],
})
export class HdWalletIconComponent {
  readonly hdWallet = input.required<Wallet>();
}
