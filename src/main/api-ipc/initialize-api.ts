/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { ipcMain } from 'electron';
import {
  getConversation,
  listConversations,
  saveConversation,
} from './conversation-history/history';
import { startOllamaServer, checkOllamaExists } from './ollama/start';
import { OLLAMA_START_SERVER, OLLAMA_CHECK_EXISTS } from '@shared/api-ipc/ollama';
import {
  CONFIGURATION_GET,
  CONFIGURATION_WRITE,
  SYSTEM_GET_DETAILS,
} from '@shared/api-ipc/configuration';
import { readConfiguration, writeConfiguration } from './configuration/read-write';
import { systemGetDetails } from './system/get-details';

export function initializeIpcApi() {
  ipcMain.handle('conversation:save', async (_, conversation) => saveConversation(conversation));
  ipcMain.handle('conversation:get', async (_, id) => getConversation(id));
  ipcMain.handle('conversation:list', async () => listConversations());
  ipcMain.handle(OLLAMA_START_SERVER, async () => startOllamaServer());
  ipcMain.handle(OLLAMA_CHECK_EXISTS, () => checkOllamaExists());
  ipcMain.handle(CONFIGURATION_GET, async () => readConfiguration());
  ipcMain.handle(CONFIGURATION_WRITE, async (_, config) => writeConfiguration(config));
  ipcMain.handle(SYSTEM_GET_DETAILS, async () => systemGetDetails());
}
