/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ipcRenderer } from 'electron';
import type { Conversation } from '../../main/api-ipc/conversation-history/validator';

function logger(..._arguments: unknown[]) {
  if (process.env['NODE_ENV'] === 'development') {
    console.log('IPC::', ..._arguments);
  }
}

type IpcResult<T> =
  | {
      error: string;
    }
  | {
      data: T;
    };

async function invokeIpc<T>(method: string, ..._arguments: unknown[]): Promise<T> {
  logger('Invoking', method, ..._arguments);
  const result: IpcResult<T> = await ipcRenderer.invoke(method, ..._arguments);
  logger('Invoking result', result);
  if ('error' in result) {
    throw new Error(result.error);
  }
  return result.data;
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
