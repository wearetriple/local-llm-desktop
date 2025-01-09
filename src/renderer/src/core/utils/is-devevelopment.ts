export function isDevelopment() {
  return globalThis.location.port === '5173';
}
