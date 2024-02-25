import { NgModule } from '@angular/core';
import { HdConnectWalletButtonComponent } from './connect-button.component';
import { HdDisconnectWalletButtonComponent } from './disconnect-button.component';
import { HdWalletModalButtonComponent } from './modal-button.component';
import { HdWalletModalComponent } from './modal.component';
import { HdWalletModalService } from './modal.service';
import { HdWalletMultiButtonComponent } from './multi-button.component';

@NgModule({
  imports: [
    HdConnectWalletButtonComponent,
    HdDisconnectWalletButtonComponent,
    HdWalletMultiButtonComponent,
    HdWalletModalButtonComponent,
    HdWalletModalComponent,
  ],
  exports: [
    HdConnectWalletButtonComponent,
    HdDisconnectWalletButtonComponent,
    HdWalletMultiButtonComponent,
    HdWalletModalButtonComponent,
    HdWalletModalComponent,
  ],
  providers: [HdWalletModalService],
})
export class HdWalletAdapterMaterialModule {}
