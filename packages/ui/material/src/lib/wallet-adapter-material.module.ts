import { NgModule } from '@angular/core';
import { HdWalletConnectButtonComponent } from './connect-button.component';
import { HdWalletDisconnectButtonComponent } from './disconnect-button.component';
import { HdWalletModalButtonComponent } from './modal-button.component';
import {
  HdWalletModalComponent,
  HdWalletModalTriggerDirective,
} from './modal.component';
import { HdWalletMultiButtonComponent } from './multi-button.component';

@NgModule({
  imports: [
    HdWalletConnectButtonComponent,
    HdWalletDisconnectButtonComponent,
    HdWalletMultiButtonComponent,
    HdWalletModalButtonComponent,
    HdWalletModalComponent,
    HdWalletModalTriggerDirective,
  ],
  exports: [
    HdWalletConnectButtonComponent,
    HdWalletDisconnectButtonComponent,
    HdWalletMultiButtonComponent,
    HdWalletModalButtonComponent,
    HdWalletModalComponent,
    HdWalletModalTriggerDirective,
  ],
})
export class HdWalletAdapterMaterialModule {}
