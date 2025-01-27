import type { ElectronAPI } from '@electron-toolkit/preload';
import type * as api from './api';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: typeof api;
  }
}
