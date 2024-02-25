import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { WalletName } from '@solana/wallet-adapter-base';
import { HdWalletModalComponent } from './modal.component';

@Injectable({ providedIn: 'root' })
export class HdWalletModalService {
  private readonly _matDialog = inject(MatDialog);
  private readonly _walletStore = inject(WalletStore);

  open() {
    this._matDialog
      .open<HdWalletModalComponent, undefined, WalletName>(
        HdWalletModalComponent,
        {
          panelClass: ['wallet-modal'],
          maxWidth: '380px',
          maxHeight: '90vh',
        }
      )
      .afterClosed()
      .subscribe((walletName) => {
        if (walletName) {
          this._walletStore.selectWallet(walletName);
          this._walletStore.connect().subscribe();
        }
      });
  }
}
