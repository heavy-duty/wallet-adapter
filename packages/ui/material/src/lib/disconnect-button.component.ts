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
        hdDisconnectWalletDirective.disconnecting() ||
        !hdDisconnectWalletDirective.wallet() ||
        disabled()
      "
      (click)="hdDisconnectWalletDirective.run()"
      mat-raised-button
    >
      <ng-content></ng-content>

      @if (!children) {
        <span class="button-content">
          @if (hdDisconnectWalletDirective.wallet(); as wallet) {
            <hd-wallet-icon *ngIf="wallet" [hdWallet]="wallet"></hd-wallet-icon>
          }

          {{ hdDisconnectWalletDirective.message() }}
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
  hostDirectives: [HdDisconnectWalletDirective],
})
export class HdDisconnectWalletButtonComponent {
  readonly hdDisconnectWalletDirective = inject(HdDisconnectWalletDirective);

  @ContentChild('children') children: ElementRef | null = null;
  readonly color = input<ButtonColor>('primary');
  readonly disabled = input(false);
}
