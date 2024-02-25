import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ElementRef,
  input,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  HdConnectWalletDirective,
  HdWalletIconComponent,
} from '@heavy-duty/wallet-adapter-cdk';
import { ButtonColor } from './types';

@Component({
  selector: 'hd-connect-wallet-button',
  template: `
    <button
      [color]="hdColor()"
      [disabled]="
        connectWallet.connecting() ||
        !connectWallet.wallet() ||
        connectWallet.connected() ||
        hdDisabled()
      "
      (click)="connectWallet.run()"
      mat-raised-button
      #connectWallet="hdConnectWallet"
      hdConnectWallet
    >
      <ng-content></ng-content>

      @if (!children) {
        <span class="button-content">
          @if (connectWallet.wallet(); as wallet) {
            <hd-wallet-icon [hdWallet]="wallet"></hd-wallet-icon>
          }

          {{ connectWallet.message() }}
        </span>
      }
    </button>
  `,
  styles: [
    `
      button {
        display: inline-block;
      }

      .button-content {
        display: flex;
        gap: 0.5rem;
        align-items: center;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatButton, HdWalletIconComponent, HdConnectWalletDirective],
})
export class HdConnectWalletButtonComponent {
  @ContentChild('children') children: ElementRef | null = null;
  readonly hdColor = input<ButtonColor>('primary');
  readonly hdDisabled = input(false);
}
