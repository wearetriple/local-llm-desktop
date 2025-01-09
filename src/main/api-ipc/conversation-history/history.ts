import { app } from 'electron';
import fs from 'node:fs/promises';
import path from 'node:path';
import { conversationSchema, type Conversation } from './validator';
import { IpcResult } from '../types';

const BASE_PATH = path.join(app.getPath('userData'), 'local-llm/conversations');

async function initializeStore(): Promise<void> {
  await fs.mkdir(BASE_PATH, { recursive: true });
}

export async function saveConversation(conversation: Conversation): Promise<IpcResult<void>> {
  try {
    await initializeStore();
    const filePath = path.join(BASE_PATH, `${conversation.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(conversation), 'utf8');
    return { data: undefined };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getConversation(id: string): Promise<IpcResult<Conversation | null>> {
  try {
    await initializeStore();
    const filePath = path.join(BASE_PATH, `${id}.json`);
    const data = await fs.readFile(filePath, 'utf8');

    return { data: await conversationSchema.parseAsync(JSON.parse(data)) };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function listConversations(): Promise<IpcResult<Conversation[]>> {
  try {
    await initializeStore();
    const files = await fs.readdir(BASE_PATH);
    const conversations: Conversation[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const conversation = await getConversation(file.replace('.json', ''));
        if ('error' in conversation) {
          throw new Error(conversation.error);
        }
        if (conversation.data) {
          conversations.push(conversation.data);
        }
      }
    }

    return { data: conversations.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)) };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
