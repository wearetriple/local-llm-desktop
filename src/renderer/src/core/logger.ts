import { isDevelopment } from './utils/is-devevelopment';

export function logger(..._arguments: unknown[]) {
  if (isDevelopment()) {
    // eslint-disable-next-line no-console
    console.log(..._arguments);
  }
}
