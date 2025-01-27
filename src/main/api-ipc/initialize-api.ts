/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { BrowserWindow, ipcMain } from 'electron';
import {
  getConversation,
  listConversations,
  saveConversation,
} from './conversation-history/history';
import { startOllamaServer, checkOllamaExists } from './ollama/start';
import { OLLAMA_START_SERVER, OLLAMA_CHECK_EXISTS } from '@shared/api-ipc/ollama';
import { CONFIGURATION_GET, CONFIGURATION_WRITE } from '@shared/api-ipc/configuration';
import { readConfiguration, writeConfiguration } from './configuration/read-write';
import { systemGetDetails } from './system/get-details';
import { readPersonas, writePersonas } from './personas/read-write';
import { PERSONAS_GET, PERSONAS_WRITE } from '@shared/api-ipc/personas';
import { SYSTEM_GET_DETAILS } from '@shared/api-ipc/system';
import type { SourcePath } from '@shared/api-ipc/knowledge';
import {
  CREATE_KNOWLEDGE_SET,
  DELETE_KNOWLEDGE_SET,
  UPDATE_KNOWLEDGE_SET,
} from '@shared/api-ipc/knowledge';
import { LIST_KNOWLEDGE_SETS } from '@shared/api-ipc/knowledge';
import {
  createKnowledgeSet,
  deleteKnowledgeSet,
  listKnowledgeSets,
  updateKnowledgeSet,
} from './knowledge/read-write';
import { OPEN_DIRECTORY_DIALOG } from '@shared/api-ipc/dialog';
import { showSelectDirectoryDialog } from './dialog/open';
import type { IpcResult } from '@shared/api-ipc/types';

export function initializeIpcApi() {
  ipcMain.handle('conversation:save', async (_, conversation) => saveConversation(conversation));
  ipcMain.handle('conversation:get', async (_, id) => getConversation(id));
  ipcMain.handle('conversation:list', async () => listConversations());
  ipcMain.handle(OLLAMA_START_SERVER, async () => startOllamaServer());
  ipcMain.handle(OLLAMA_CHECK_EXISTS, () => checkOllamaExists());
  ipcMain.handle(CONFIGURATION_GET, async () => readConfiguration());
  ipcMain.handle(CONFIGURATION_WRITE, async (_, config) => writeConfiguration(config));
  ipcMain.handle(SYSTEM_GET_DETAILS, async () => systemGetDetails());
  ipcMain.handle(PERSONAS_GET, async () => readPersonas());
  ipcMain.handle(PERSONAS_WRITE, async (_, personas) => writePersonas(personas));
  ipcMain.handle(LIST_KNOWLEDGE_SETS, async () => listKnowledgeSets());
  ipcMain.handle(CREATE_KNOWLEDGE_SET, async (_, name: string, sources: SourcePath[]) =>
    createKnowledgeSet(name, sources),
  );
  ipcMain.handle(UPDATE_KNOWLEDGE_SET, async (_, id: string, name: string, sources: SourcePath[]) =>
    updateKnowledgeSet(id, name, sources),
  );
  ipcMain.handle(DELETE_KNOWLEDGE_SET, async (_, id) => deleteKnowledgeSet(id));
  ipcMain.handle(OPEN_DIRECTORY_DIALOG, async (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (!window) {
      return { error: 'No window found' } satisfies IpcResult<void>;
    }
    return showSelectDirectoryDialog(window);
  });
}
