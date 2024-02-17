import { inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ConnectionStore } from './connection.store';

export function injectConnection() {
  const connectionStore = inject(ConnectionStore);

  return toSignal(connectionStore.connection$, { initialValue: null });
}
