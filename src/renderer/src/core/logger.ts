export function logger(..._arguments: unknown[]) {
  if (globalThis.location.port === '5173') {
    console.log(..._arguments);
  }
}
