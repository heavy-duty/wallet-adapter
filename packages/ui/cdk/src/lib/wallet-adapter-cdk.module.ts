import { NgModule } from '@angular/core';
import { HdConnectWalletDirective } from './connect-wallet.directive';
import { HdDisconnectWalletDirective } from './disconnect-wallet.directive';
import { HdEncodeTextPipe } from './encode-text.pipe';
import { HdWalletListItemComponent } from './list-item.component';
import { HdObscureAddressPipe } from './obscure-address.pipe';
import { HdSelectWalletDirective } from './select-wallet.directive';
import { HdSignMessageDirective } from './sign-message.directive';
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
    HdSignMessageDirective,
    HdEncodeTextPipe,
  ],
  exports: [
    HdObscureAddressPipe,
    HdWalletIconComponent,
    HdWalletAdapterDirective,
    HdWalletListItemComponent,
    HdSelectWalletDirective,
    HdConnectWalletDirective,
    HdDisconnectWalletDirective,
    HdSignMessageDirective,
    HdEncodeTextPipe,
  ],
})
export class HdWalletAdapterCdkModule {}
