import { ModuleWithProviders, NgModule, Provider } from '@angular/core';
import { ConnectionConfig } from '@solana/web3.js';
import {
  connectionConfigProviderFactory,
  ConnectionStore,
} from './connection.store';
import {
  WalletConfig,
  walletConfigProviderFactory,
  WalletStore,
} from './wallet.store';

export function provideWalletAdapter(
  walletConfig: Partial<WalletConfig>,
  connectionConfig?: ConnectionConfig
): Provider[] {
  return [
    walletConfigProviderFactory(walletConfig),
    connectionConfigProviderFactory(connectionConfig),
    WalletStore,
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
        ConnectionStore,
        WalletStore,
      ],
    };
  }
}
