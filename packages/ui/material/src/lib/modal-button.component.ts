import { NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ElementRef,
  Input,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import {
  HdSelectWalletDirective,
  HdWalletAdapterDirective,
  HdWalletIconComponent,
} from '@heavy-duty/wallet-adapter-cdk';
import {
  HdWalletModalComponent,
  HdWalletModalTriggerDirective,
} from './modal.component';
import { ButtonColor } from './types';

@Component({
  selector: 'hd-wallet-modal-button',
  template: `
    <button
      #hdWalletModalTrigger="hdWalletModalTrigger"
      #selectWallet="hdSelectWallet"
      *hdWalletAdapter="let wallets = wallets"
      [color]="color"
      (click)="hdWalletModalTrigger.open(wallets)"
      (selectWallet)="selectWallet.run($event)"
      mat-raised-button
      hdWalletModalTrigger
      hdSelectWallet
    >
      <ng-content></ng-content>
      <ng-container *ngIf="!children">Select Wallet</ng-container>
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
    MatButtonModule,
    MatDialogModule,
    HdWalletAdapterDirective,
    HdWalletIconComponent,
    HdWalletModalTriggerDirective,
    HdSelectWalletDirective,
    HdWalletModalComponent,
  ],
})
export class HdWalletModalButtonComponent {
  @ContentChild('children') children: ElementRef | null = null;
  @Input() color: ButtonColor = 'primary';
}
