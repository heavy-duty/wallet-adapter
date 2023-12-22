import { ApplicationConfig } from '@angular/core';
import { provideWalletAdapter } from '@heavy-duty/wallet-adapter';

export const appConfig: ApplicationConfig = {
  providers: [provideWalletAdapter()],
};
