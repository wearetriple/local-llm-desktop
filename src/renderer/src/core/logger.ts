import { isDevelopment } from './utils/is-devevelopment';

export function logger(..._arguments: unknown[]) {
  if (isDevelopment()) {
    console.log(..._arguments);
  }
}
