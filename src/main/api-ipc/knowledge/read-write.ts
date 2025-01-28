import path from 'node:path';
import fs from 'node:fs/promises';
import type { KnowledgeSet, SourcePath } from '@shared/api-ipc/knowledge';
import { APP_CONFIG_PATH } from '../../constants';
import type { IpcResult } from '@shared/api-ipc/types';
import { embeddingsManager } from '../../embeddings/manager';

const KNOWLEDGE_DIR = 'knowledge';

async function ensureKnowledgeDirectory() {
  const knowledgePath = path.join(APP_CONFIG_PATH, KNOWLEDGE_DIR);
  await fs.mkdir(knowledgePath, { recursive: true });
  return knowledgePath;
}

async function readKnowledgeInfo(knowledgePath: string): Promise<KnowledgeSet | null> {
  try {
    const infoPath = path.join(knowledgePath, 'info.json');
    const content = await fs.readFile(infoPath, 'utf8');
    return JSON.parse(content) as KnowledgeSet;
  } catch {
    return null;
  }
}

async function writeKnowledgeInfo(knowledgePath: string, info: KnowledgeSet): Promise<void> {
  const infoPath = path.join(knowledgePath, 'info.json');
  await fs.writeFile(infoPath, JSON.stringify(info, null, 2), 'utf8');
}

export async function listKnowledgeSets(): Promise<IpcResult<KnowledgeSet[]>> {
  try {
    const knowledgePath = await ensureKnowledgeDirectory();
    const entries = await fs.readdir(knowledgePath, { withFileTypes: true });

    const knowledgeSets: KnowledgeSet[] = [];
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const info = await readKnowledgeInfo(path.join(knowledgePath, entry.name));
        if (info) {
          knowledgeSets.push(info);
        }
      }
    }

    return { data: knowledgeSets };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function createKnowledgeSet(
  name: string,
  sources: SourcePath[],
): Promise<IpcResult<void>> {
  try {
    const knowledgePath = await ensureKnowledgeDirectory();

    const id = crypto.randomUUID();
    const setPath = path.join(knowledgePath, id);

    await fs.mkdir(setPath);

    const knowledgeSet: KnowledgeSet = {
      id,
      name,
      sources,
    };

    await writeKnowledgeInfo(setPath, knowledgeSet);

    // Generate embeddings for the new knowledge set
    await embeddingsManager.generateEmbeddings(knowledgeSet);

    return { data: undefined };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function updateKnowledgeSet(
  id: string,
  name: string,
  sources: SourcePath[],
): Promise<IpcResult<void>> {
  try {
    const knowledgePath = await ensureKnowledgeDirectory();
    const setPath = path.join(knowledgePath, id);

    const existingInfo = await readKnowledgeInfo(setPath);
    if (!existingInfo) {
      throw new Error('Knowledge set not found');
    }

    const updatedSet: KnowledgeSet = {
      ...existingInfo,
      name,
      sources,
    };

    await writeKnowledgeInfo(setPath, updatedSet);

    // Update embeddings for the modified knowledge set
    await embeddingsManager.generateEmbeddings(updatedSet);

    return { data: undefined };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function deleteKnowledgeSet(id: string): Promise<IpcResult<void>> {
  try {
    const knowledgePath = await ensureKnowledgeDirectory();
    const setPath = path.join(knowledgePath, id);

    await fs.rm(setPath, { recursive: true, force: true });
    return { data: undefined };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
