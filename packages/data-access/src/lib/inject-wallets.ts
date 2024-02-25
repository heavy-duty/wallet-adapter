import { inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { WalletStore } from './wallet.store';

export function injectWallets() {
  const walletStore = inject(WalletStore);

  return toSignal(walletStore.wallets$, { initialValue: [] });
}
