import { importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideWalletAdapter } from '@heavy-duty/wallet-adapter';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom([BrowserAnimationsModule]),
    provideWalletAdapter({
      autoConnect: false,
      adapters: [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    }),
  ],
}).catch((err) => console.error(err));
