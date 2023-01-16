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
  HdDisconnectWalletDirective,
  HdWalletAdapterDirective,
  HdWalletIconComponent,
} from '@heavy-duty/wallet-adapter-cdk';
import { ButtonColor } from './types';

@Component({
  selector: 'hd-wallet-disconnect-button',
  template: `
    <button
      #disconnectWallet="hdDisconnectWallet"
      *hdWalletAdapter="let wallet = wallet; let disconnecting = disconnecting"
      [color]="color"
      [disabled]="disconnecting || !wallet"
      (click)="disconnectWallet.run()"
      hdDisconnectWallet
      mat-raised-button
    >
      <ng-content></ng-content>
      <div *ngIf="!children" class="button-content">
        <hd-wallet-icon *ngIf="wallet" [wallet]="wallet"></hd-wallet-icon>
        {{ getMessage(disconnecting, wallet) }}
      </div>
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
  imports: [
    NgIf,
    MatButtonModule,
    HdWalletAdapterDirective,
    HdWalletIconComponent,
    HdDisconnectWalletDirective,
  ],
})
export class HdWalletDisconnectButtonComponent {
  @ContentChild('children') children: ElementRef | null = null;
  @Input() color: ButtonColor = 'primary';
  @Input() disabled = false;

  getMessage(disconnecting: boolean, wallet: Wallet | null) {
    if (disconnecting) return 'Disconnecting...';
    if (wallet) return 'Disconnect';
    return 'Disconnect Wallet';
  }
}
