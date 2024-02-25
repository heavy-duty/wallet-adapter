import { inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { WalletStore } from './wallet.store';

export function injectDisconnecting() {
  const walletStore = inject(WalletStore);

  return toSignal(walletStore.disconnecting$, { initialValue: false });
}
