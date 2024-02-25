import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { EMPTY, concatMap } from 'rxjs';
import { HdWalletModalComponent } from './modal.component';

@Injectable()
export class HdWalletModalService {
  private readonly _matDialog = inject(MatDialog);
  private readonly _walletStore = inject(WalletStore);

  open() {
    this._matDialog
      .open(HdWalletModalComponent, {
        panelClass: ['wallet-modal'],
        maxWidth: '380px',
        maxHeight: '90vh',
      })
      .afterClosed()
      .pipe(
        concatMap((walletName) => {
          if (!walletName) {
            return EMPTY;
          }

          this._walletStore.selectWallet(walletName);

          return this._walletStore.connect();
        })
      )
      .subscribe();
  }
}
