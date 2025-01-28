import type { SearchResult } from '@shared/api-ipc/embeddings';
import type { IpcResult } from '@shared/api-ipc/types';
import { logger } from '../../core/logger';
import { embeddingsManager } from '../../embeddings/manager';

export async function search(
  query: string,
  knowledgeSetIds: string[],
): Promise<IpcResult<SearchResult[]>> {
  try {
    const result = await embeddingsManager.search(query, knowledgeSetIds);

    return {
      data: result.map((record) => ({
        knowledgeSetId: record.object.knowledgeSetId,
        file: record.object.source,
        content: record.input,
      })),
    };
  } catch (error) {
    logger('Error searching embeddings:', error);
    return { error: 'Error searching embeddings.' };
  }
}
