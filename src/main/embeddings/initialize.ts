import { listKnowledgeSets } from '../api-ipc/knowledge/read-write';
import { embeddingsManager } from './manager';

export async function initialize() {
  const knowledgeSetList = await listKnowledgeSets();

  if ('error' in knowledgeSetList) {
    throw new Error(knowledgeSetList.error);
  }

  for (const knowledgeSet of knowledgeSetList.data) {
    await embeddingsManager.generateEmbeddings(knowledgeSet);
  }
}
