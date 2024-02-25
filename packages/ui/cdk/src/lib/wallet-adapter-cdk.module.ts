import { NgModule } from '@angular/core';
import { HdConnectWalletDirective } from './connect-wallet.directive';
import { HdDisconnectWalletDirective } from './disconnect-wallet.directive';
import { HdObscureAddressPipe } from './obscure-address.pipe';
import { HdWalletIconComponent } from './wallet-icon.component';

@NgModule({
  imports: [
    HdObscureAddressPipe,
    HdWalletIconComponent,
    HdConnectWalletDirective,
    HdDisconnectWalletDirective,
  ],
  exports: [
    HdObscureAddressPipe,
    HdWalletIconComponent,
    HdConnectWalletDirective,
    HdDisconnectWalletDirective,
  ],
})
export class HdWalletAdapterCdkModule {}
