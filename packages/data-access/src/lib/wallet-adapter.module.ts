import { ModuleWithProviders, NgModule, Provider } from '@angular/core';
import { provideComponentStore } from '@ngrx/component-store';
import { ConnectionConfig } from '@solana/web3.js';
import {
  ConnectionStore,
  connectionConfigProviderFactory,
} from './connection.store';
import { StandardWalletAdaptersStore } from './standard-wallet-adapters.store';
import {
  WalletConfig,
  walletConfigProviderFactory,
  walletStoreProvider,
} from './wallet.store';

export function provideWalletAdapter(
  walletConfig?: Partial<WalletConfig>,
  connectionConfig?: ConnectionConfig
): Provider[] {
  return [
    walletConfigProviderFactory(walletConfig),
    connectionConfigProviderFactory(connectionConfig),
    provideComponentStore(ConnectionStore),
    provideComponentStore(StandardWalletAdaptersStore),
    walletStoreProvider,
  ];
}

@NgModule({})
export class HdWalletAdapterModule {
  static forRoot(
    walletConfig: Partial<WalletConfig>,
    connectionConfig?: ConnectionConfig
  ): ModuleWithProviders<HdWalletAdapterModule> {
    return {
      ngModule: HdWalletAdapterModule,
      providers: [
        walletConfigProviderFactory(walletConfig),
        connectionConfigProviderFactory(connectionConfig),
        provideComponentStore(ConnectionStore),
        provideComponentStore(StandardWalletAdaptersStore),
        walletStoreProvider,
      ],
    };
  }
}
