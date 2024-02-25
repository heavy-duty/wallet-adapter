import { DialogModule } from '@angular/cdk/dialog';
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideWalletAdapter } from '@heavy-duty/wallet-adapter';

export const appConfig: ApplicationConfig = {
  providers: [provideWalletAdapter(), importProvidersFrom([DialogModule])],
};
