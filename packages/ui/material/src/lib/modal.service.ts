import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HdWalletModalComponent } from './modal.component';

@Injectable()
export class HdWalletModalService {
  private readonly _matDialog = inject(MatDialog);

  open() {
    this._matDialog.open(HdWalletModalComponent, {
      panelClass: ['wallet-modal'],
      maxWidth: '380px',
      maxHeight: '90vh',
    });
  }
}
