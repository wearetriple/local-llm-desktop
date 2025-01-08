import { ElectronAPI } from '@electron-toolkit/preload';
import * as api from './api';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: typeof api;
  }
}
