/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { ipcMain } from 'electron';
import {
  getConversation,
  listConversations,
  saveConversation,
} from './conversation-history/history';

export function initializeIpcApi() {
  ipcMain.handle('conversation:save', async (_, conversation) => saveConversation(conversation));
  ipcMain.handle('conversation:get', async (_, id) => getConversation(id));
  ipcMain.handle('conversation:list', async () => listConversations());
}
