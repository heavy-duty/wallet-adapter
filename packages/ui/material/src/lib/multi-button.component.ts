import { ClipboardModule } from '@angular/cdk/clipboard';
import { CdkMenuModule } from '@angular/cdk/menu';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ElementRef,
  Input,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import {
  HdDisconnectWalletDirective,
  HdObscureAddressPipe,
  HdSelectAndConnectWalletDirective,
  HdWalletAdapterDirective,
  HdWalletIconComponent,
} from '@heavy-duty/wallet-adapter-cdk';
import { HdWalletConnectButtonComponent } from './connect-button.component';
import { HdWalletModalButtonComponent } from './modal-button.component';
import {
  HdWalletModalComponent,
  HdWalletModalTriggerDirective,
} from './modal.component';
import { ButtonColor } from './types';

@Component({
  selector: 'hd-wallet-multi-button',
  template: `
    <ng-container
      *hdWalletAdapter="
        let wallet = wallet;
        let wallets = wallets;
        let publicKey = publicKey;
        let connected = connected
      "
    >
      <hd-wallet-modal-button
        *ngIf="wallet === null"
        [color]="color"
      ></hd-wallet-modal-button>
      <hd-wallet-connect-button
        *ngIf="!connected && wallet"
        [color]="color"
      ></hd-wallet-connect-button>

      <ng-container *ngIf="connected">
        <button
          [color]="color"
          [matMenuTriggerFor]="walletMenu"
          mat-raised-button
        >
          <ng-content></ng-content>
          <div *ngIf="!children" class="button-content">
            <hd-wallet-icon *ngIf="wallet" [hdWallet]="wallet"></hd-wallet-icon>
            {{ publicKey?.toBase58() | hdObscureAddress }}
          </div>
        </button>
        <mat-menu #walletMenu="matMenu">
          <button
            *ngIf="publicKey"
            [cdkCopyToClipboard]="publicKey.toBase58()"
            mat-menu-item
          >
            <mat-icon>content_copy</mat-icon>
            Copy address
          </button>
          <button
            #hdWalletModalTrigger="hdWalletModalTrigger"
            #hdSelectAndConnectWallet="hdSelectAndConnectWallet"
            (click)="hdWalletModalTrigger.open(wallets)"
            (hdSelectWallet)="hdSelectAndConnectWallet.run($event)"
            mat-menu-item
            hdWalletModalTrigger
            hdSelectAndConnectWallet
            panelClass="mat-dialog"
          >
            <mat-icon>sync_alt</mat-icon>
            Connect a different wallet
          </button>
          <mat-divider></mat-divider>
          <button
            #hdDisconnectWallet="hdDisconnectWallet"
            (click)="hdDisconnectWallet.run()"
            mat-menu-item
            hdDisconnectWallet
          >
            <mat-icon>logout</mat-icon>
            Disconnect
          </button>
        </mat-menu>
      </ng-container>
    </ng-container>

    <ng-template #template>
      <hd-wallet-modal></hd-wallet-modal>
    </ng-template>
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
    CommonModule,
    ClipboardModule,
    CdkMenuModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
    HdWalletAdapterDirective,
    HdWalletIconComponent,
    HdWalletModalTriggerDirective,
    HdDisconnectWalletDirective,
    HdSelectAndConnectWalletDirective,
    HdObscureAddressPipe,
    HdWalletModalComponent,
    HdWalletModalButtonComponent,
    HdWalletConnectButtonComponent,
  ],
})
export class HdWalletMultiButtonComponent {
  @ContentChild('children') children: ElementRef | null = null;
  @Input() color: ButtonColor = 'primary';
}
