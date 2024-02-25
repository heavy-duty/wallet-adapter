import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideWalletAdapter } from '@heavy-duty/wallet-adapter';
import { HdWalletAdapterMaterialModule } from '@heavy-duty/wallet-adapter-material';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom([
      BrowserAnimationsModule,
      MatSnackBarModule,
      HdWalletAdapterMaterialModule,
    ]),
    provideWalletAdapter(),
  ],
};
