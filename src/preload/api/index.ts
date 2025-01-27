/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ipcRenderer, webUtils } from 'electron';
import type { Conversation } from '../../main/api-ipc/conversation-history/validator';
import { OLLAMA_CHECK_EXISTS, OLLAMA_START_SERVER } from '@shared/api-ipc/ollama';
import type { IpcResult } from '@shared/api-ipc/types';
import { ApiIpcError } from '@shared/api-ipc/error';
import type { Configuration } from '@shared/api-ipc/configuration';
import { CONFIGURATION_GET, CONFIGURATION_WRITE } from '@shared/api-ipc/configuration';
import type { SystemGetDetails } from '@shared/api-ipc/system';
import { SYSTEM_GET_DETAILS } from '@shared/api-ipc/system';
import type { Persona } from '@shared/api-ipc/personas';
import { PERSONAS_GET, PERSONAS_WRITE } from '@shared/api-ipc/personas';
import type { KnowledgeSet, SourcePath } from '@shared/api-ipc/knowledge';
import {
  CREATE_KNOWLEDGE_SET,
  LIST_KNOWLEDGE_SETS,
  UPDATE_KNOWLEDGE_SET,
  DELETE_KNOWLEDGE_SET,
} from '@shared/api-ipc/knowledge';
import { OPEN_DIRECTORY_DIALOG } from '@shared/api-ipc/dialog';

function logger(..._arguments: unknown[]) {
  if (process.env['NODE_ENV'] === 'development') {
    // eslint-disable-next-line no-console
    console.log('IPC::', ..._arguments);
  }
}

async function invokeIpc<T>(method: string, ..._arguments: unknown[]): Promise<T> {
  logger('Invoking', method, ..._arguments);
  try {
    const result: IpcResult<T> = await ipcRenderer.invoke(method, ..._arguments);
    logger(method, ' result', result);
    if ('error' in result) {
      throw new ApiIpcError(result.error, result.code);
    }
    return result.data;
  } finally {
    logger('Completed', method, 'invocation');
  }
}

export async function saveConversation(conversation: Conversation): Promise<void> {
  await invokeIpc('conversation:save', conversation);
}

export async function getConversation(id: string): Promise<Conversation | null> {
  return await invokeIpc('conversation:get', id);
}

export async function listConversations(): Promise<Conversation[]> {
  return await invokeIpc('conversation:list');
}

export async function startOllamaServer(): Promise<void> {
  return await invokeIpc(OLLAMA_START_SERVER);
}

export async function checkOllamaExists(): Promise<boolean> {
  return await invokeIpc(OLLAMA_CHECK_EXISTS);
}

export async function getConfiguration(): Promise<Configuration | null> {
  return await invokeIpc(CONFIGURATION_GET);
}

export async function writeConfiguration(config: Configuration): Promise<void> {
  return await invokeIpc(CONFIGURATION_WRITE, config);
}

export async function getSystemDetails(): Promise<SystemGetDetails> {
  return await invokeIpc(SYSTEM_GET_DETAILS);
}

export async function getPersonas(): Promise<Persona[]> {
  return await invokeIpc(PERSONAS_GET);
}

export async function writePersonas(personas: Persona[]): Promise<void> {
  return await invokeIpc(PERSONAS_WRITE, personas);
}

export async function listKnowledgeSets(): Promise<KnowledgeSet[]> {
  return await invokeIpc(LIST_KNOWLEDGE_SETS);
}

export async function createKnowledgeSet(name: string, sources: SourcePath[]): Promise<void> {
  return await invokeIpc(CREATE_KNOWLEDGE_SET, name, sources);
}

export async function updateKnowledgeSet(
  id: string,
  name: string,
  sources: SourcePath[],
): Promise<void> {
  return await invokeIpc(UPDATE_KNOWLEDGE_SET, id, name, sources);
}

export async function deleteKnowledgeSet(id: string): Promise<void> {
  return await invokeIpc(DELETE_KNOWLEDGE_SET, id);
}

export async function openDirectoryDialog(): Promise<string[] | null> {
  return await invokeIpc(OPEN_DIRECTORY_DIALOG);
}

export function getFilePath(file: File): string {
  const result = webUtils.getPathForFile(file);
  return result;
}
