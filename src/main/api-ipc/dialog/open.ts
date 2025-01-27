import type { IpcResult } from '@shared/api-ipc/types';
import type { BrowserWindow } from 'electron';
import { dialog } from 'electron';

export async function showSelectDirectoryDialog(
  window: BrowserWindow,
): Promise<IpcResult<string[] | null>> {
  try {
    const folders = await dialog.showOpenDialog(window, {
      properties: ['openDirectory', 'multiSelections'],
    });
    if (folders.canceled) {
      return { data: null };
    }
    return { data: folders.filePaths };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
