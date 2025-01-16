import { isDebug } from './utils/is-debug';

export function logger(..._arguments: unknown[]) {
  if (isDebug()) {
    // eslint-disable-next-line no-console
    console.log(..._arguments);
  }
}
