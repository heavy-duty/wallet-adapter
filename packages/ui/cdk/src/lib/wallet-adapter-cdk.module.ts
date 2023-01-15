import { NgModule } from '@angular/core';
import { HdWalletConnectButtonDirective } from './connect-button.directive';
import { HdConnectWalletDirective } from './connect-wallet.directive';
import { HdWalletDisconnectButtonDirective } from './disconnect-button.directive';
import { HdDisconnectWalletDirective } from './disconnect-wallet.directive';
import { HdWalletListItemComponent } from './list-item.component';
import { HdObscureAddressPipe } from './obscure-address.pipe';
import { HdSelectWalletDirective } from './select-wallet.directive';
import { HdWalletAdapterDirective } from './wallet-adapter.directive';
import { HdWalletIconComponent } from './wallet-icon.component';

@NgModule({
  imports: [
    HdWalletConnectButtonDirective,
    HdWalletDisconnectButtonDirective,
    HdObscureAddressPipe,
    HdWalletIconComponent,
    HdWalletAdapterDirective,
    HdWalletListItemComponent,
    HdSelectWalletDirective,
    HdConnectWalletDirective,
    HdDisconnectWalletDirective,
  ],
  exports: [
    HdWalletConnectButtonDirective,
    HdWalletDisconnectButtonDirective,
    HdObscureAddressPipe,
    HdWalletIconComponent,
    HdWalletAdapterDirective,
    HdWalletListItemComponent,
    HdSelectWalletDirective,
    HdConnectWalletDirective,
    HdDisconnectWalletDirective,
  ],
})
export class HdWalletAdapterCdkModule {}
