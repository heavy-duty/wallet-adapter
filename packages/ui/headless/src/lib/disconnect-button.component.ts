import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ElementRef,
  input,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  HdDisconnectWalletDirective,
  HdWalletIconComponent,
} from '@heavy-duty/wallet-adapter-cdk';
import { ButtonColor } from './types';

@Component({
  selector: 'hd-disconnect-wallet-button',
  template: `
    <button
      [color]="color()"
      [disabled]="
        disconnectWallet.disconnecting() ||
        !disconnectWallet.wallet() ||
        disabled()
      "
      (click)="disconnectWallet.run()"
      mat-raised-button
      hdDisconnectWallet
      #disconnectWallet="hdDisconnectWallet"
    >
      <ng-content></ng-content>

      @if (!children) {
        <span class="button-content">
          @if (disconnectWallet.wallet(); as wallet) {
            <hd-wallet-icon *ngIf="wallet" [hdWallet]="wallet"></hd-wallet-icon>
          }

          {{ disconnectWallet.message() }}
        </span>
      }
    </button>
  `,
  styles: [
    `
      .button-content {
        display: flex;
        gap: 0.5rem;
        align-items: center;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatButton, HdWalletIconComponent, HdDisconnectWalletDirective],
})
export class HdDisconnectWalletButtonComponent {
  @ContentChild('children') children: ElementRef | null = null;

  readonly color = input<ButtonColor>('primary');
  readonly disabled = input(false);
}
