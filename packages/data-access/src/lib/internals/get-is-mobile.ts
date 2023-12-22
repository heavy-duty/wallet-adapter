import { Adapter } from '@solana/wallet-adapter-base';
import { Environment, getEnvironment } from './get-environment';

let _userAgent: string | null;
function getUserAgent() {
  if (_userAgent === undefined) {
    _userAgent = globalThis.navigator?.userAgent ?? null;
  }
  return _userAgent;
}

export function getIsMobile(adapters: Adapter[]) {
  const userAgentString = getUserAgent();
  return (
    getEnvironment({ adapters, userAgentString }) === Environment.MOBILE_WEB
  );
}
