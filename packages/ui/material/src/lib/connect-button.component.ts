import { NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ElementRef,
  Input,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Wallet } from '@heavy-duty/wallet-adapter';
import {
  HdConnectWalletDirective,
  HdWalletAdapterDirective,
  HdWalletIconComponent,
} from '@heavy-duty/wallet-adapter-cdk';
import { ButtonColor } from './types';

@Component({
  selector: 'hd-wallet-connect-button',
  template: `
    <button
      #hdConnectWallet="hdConnectWallet"
      *hdWalletAdapter="
        let wallet = wallet;
        let connecting = connecting;
        let connected = connected
      "
      [color]="color"
      [disabled]="connecting || !wallet || connected || disabled"
      (click)="hdConnectWallet.run()"
      hdConnectWallet
      mat-raised-button
    >
      <ng-content></ng-content>
      <div *ngIf="!children" class="button-content">
        <hd-wallet-icon *ngIf="wallet" [hdWallet]="wallet"></hd-wallet-icon>
        {{ getMessage(connected, connecting, wallet) }}
      </div>
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
  imports: [
    NgIf,
    HdWalletAdapterDirective,
    HdWalletIconComponent,
    HdConnectWalletDirective,
    MatButtonModule,
  ],
})
export class HdWalletConnectButtonComponent {
  @ContentChild('children') children: ElementRef | null = null;
  @Input() color: ButtonColor = 'primary';
  @Input() disabled = false;

  getMessage(connected: boolean, connecting: boolean, wallet: Wallet | null) {
    if (connecting) return 'Connecting...';
    if (connected) return 'Connected';
    if (wallet) return 'Connect';
    return 'Connect Wallet';
  }
}
