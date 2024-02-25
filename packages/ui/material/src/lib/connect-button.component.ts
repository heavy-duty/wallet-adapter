import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ElementRef,
  inject,
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
      [color]="color()"
      [disabled]="
        hdConnectWalletDirective.connecting() ||
        !hdConnectWalletDirective.wallet() ||
        hdConnectWalletDirective.connected() ||
        disabled()
      "
      (click)="hdConnectWalletDirective.run()"
      mat-raised-button
    >
      <ng-content></ng-content>

      @if (!children) {
        <span class="button-content">
          @if (hdConnectWalletDirective.wallet(); as wallet) {
            <hd-wallet-icon [hdWallet]="wallet"></hd-wallet-icon>
          }

          {{ hdConnectWalletDirective.message() }}
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
  imports: [HdWalletIconComponent, MatButton],
  hostDirectives: [HdConnectWalletDirective],
})
export class HdConnectWalletButtonComponent {
  readonly hdConnectWalletDirective = inject(HdConnectWalletDirective);

  @ContentChild('children') children: ElementRef | null = null;
  readonly color = input<ButtonColor>('primary');
  readonly disabled = input(false);
}
