import { NgModule } from '@angular/core';
import { HdConnectWalletDirective } from './connect-wallet.directive';
import { HdDisconnectWalletDirective } from './disconnect-wallet.directive';
import { HdWalletListItemComponent } from './list-item.component';
import { HdObscureAddressPipe } from './obscure-address.pipe';
import { HdSelectAndConnectWalletDirective } from './select-and-connect-wallet.directive';
import { HdSelectWalletDirective } from './select-wallet.directive';
import { HdWalletAdapterDirective } from './wallet-adapter.directive';
import { HdWalletIconComponent } from './wallet-icon.component';

@NgModule({
  imports: [
    HdObscureAddressPipe,
    HdWalletIconComponent,
    HdWalletAdapterDirective,
    HdWalletListItemComponent,
    HdSelectWalletDirective,
    HdConnectWalletDirective,
    HdDisconnectWalletDirective,
    HdSelectAndConnectWalletDirective,
  ],
  exports: [
    HdObscureAddressPipe,
    HdWalletIconComponent,
    HdWalletAdapterDirective,
    HdWalletListItemComponent,
    HdSelectWalletDirective,
    HdConnectWalletDirective,
    HdDisconnectWalletDirective,
    HdSelectAndConnectWalletDirective,
  ],
})
export class HdWalletAdapterCdkModule {}
