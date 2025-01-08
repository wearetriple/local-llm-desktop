// eslint-disable-next-line import/no-extraneous-dependencies
import { contextBridge } from 'electron';
// eslint-disable-next-line import/no-extraneous-dependencies
import { electronAPI } from '@electron-toolkit/preload';
import * as api from './api';

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  globalThis.electron = electronAPI;
  // @ts-ignore (define in dts)
  globalThis.api = api;
}
