export function getUriForAppIdentity() {
  const location = globalThis.location;
  if (!location) return;
  return `${location.protocol}//${location.host}`;
}
