import path from 'node:path';
import { app } from 'electron';
import { is } from '@electron-toolkit/utils';

export const APP_CONFIG_PATH = path.join(
  app.getPath('userData'),
  is.dev ? 'local-llm-dev' : 'local-llm',
);
