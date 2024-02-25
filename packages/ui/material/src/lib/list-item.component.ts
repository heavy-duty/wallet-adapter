import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Wallet } from '@heavy-duty/wallet-adapter';
import { HdWalletIconComponent } from '@heavy-duty/wallet-adapter-cdk';
import { WalletReadyState } from '@solana/wallet-adapter-base';

@Component({
  selector: 'hd-wallet-list-item',
  template: `
    <div *ngIf="hdWallet" class="wallet-name">
      <hd-wallet-icon [hdWallet]="hdWallet"></hd-wallet-icon>
      <span>{{ hdWallet.adapter.name }}</span>
    </div>

    <span *ngIf="isDetected()" class="wallet-detected">Detected</span>
  `,
  styles: [
    `
      :host {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 1rem !important;
      }

      .wallet-name {
        display: flex;
        align-items: center;
      }

      .wallet-name span {
        margin-left: 1rem;
      }

      .wallet-detected {
        font-size: 0.8rem;
        opacity: 0.5;
      }
    `,
  ],
  standalone: true,
  imports: [NgIf, HdWalletIconComponent],
})
export class HdWalletListItemComponent {
  @Input() hdWallet: Wallet | null = null;

  isDetected() {
    return (
      this.hdWallet?.readyState &&
      this.hdWallet.readyState === WalletReadyState.Installed
    );
  }
}
