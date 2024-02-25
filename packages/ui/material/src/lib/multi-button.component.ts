import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ElementRef,
  inject,
  input,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import {
  injectConnected,
  injectPublicKey,
  injectWallet,
} from '@heavy-duty/wallet-adapter';
import {
  HdDisconnectWalletDirective,
  HdObscureAddressPipe,
  HdWalletIconComponent,
} from '@heavy-duty/wallet-adapter-cdk';
import { HdConnectWalletButtonComponent } from './connect-button.component';
import { HdWalletModalButtonComponent } from './modal-button.component';
import { HdWalletModalService } from './modal.service';
import { ButtonColor } from './types';

@Component({
  selector: 'hd-wallet-multi-button',
  template: `
    @if (connected()) {
      <button
        [color]="hdColor()"
        [matMenuTriggerFor]="walletMenu"
        mat-raised-button
        [disabled]="hdDisabled()"
      >
        <ng-content></ng-content>
        @if (!children) {
          <span class="button-content">
            @if (wallet(); as wallet) {
              <hd-wallet-icon [hdWallet]="wallet"></hd-wallet-icon>
            }
            @if (publicKey(); as publicKey) {
              <span>
                {{ publicKey.toBase58() | hdObscureAddress }}
              </span>
            }
          </span>
        }
      </button>
      <mat-menu #walletMenu="matMenu">
        @if (publicKey(); as publicKey) {
          <button [cdkCopyToClipboard]="publicKey.toBase58()" mat-menu-item>
            <mat-icon>content_copy</mat-icon>
            Copy address
          </button>
        }

        <button
          (click)="onOpenWalletModal()"
          mat-menu-item
          panelClass="mat-dialog"
        >
          <mat-icon>sync_alt</mat-icon>
          Connect a different wallet
        </button>
        <mat-divider></mat-divider>
        <button
          (click)="disconnectWallet.run()"
          mat-menu-item
          hdDisconnectWallet
          #disconnectWallet="hdDisconnectWallet"
        >
          <mat-icon>logout</mat-icon>
          Disconnect
        </button>
      </mat-menu>
    } @else if (wallet()) {
      <hd-connect-wallet-button
        [hdColor]="hdColor()"
        [hdDisabled]="hdDisabled()"
      ></hd-connect-wallet-button>
    } @else {
      <hd-wallet-modal-button
        [hdColor]="hdColor()"
        [hdDisabled]="hdDisabled()"
      ></hd-wallet-modal-button>
    }
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
    CdkCopyToClipboard,
    MatButton,
    MatDivider,
    MatIcon,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    HdWalletIconComponent,
    HdObscureAddressPipe,
    HdWalletModalButtonComponent,
    HdConnectWalletButtonComponent,
    HdDisconnectWalletDirective,
  ],
})
export class HdWalletMultiButtonComponent {
  private readonly _walletModalService = inject(HdWalletModalService);
  readonly wallet = injectWallet();
  readonly connected = injectConnected();
  readonly publicKey = injectPublicKey();

  @ContentChild('children') children: ElementRef | null = null;
  readonly hdColor = input<ButtonColor>('primary');
  readonly hdDisabled = input(false);

  onOpenWalletModal() {
    this._walletModalService.open();
  }
}
