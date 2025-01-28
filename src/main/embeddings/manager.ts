import path from 'node:path';
import fs from 'node:fs/promises';
import { APP_CONFIG_PATH } from '../constants';
import type { KnowledgeSet } from '@shared/api-ipc/knowledge';
import { KnowledgeSetEmbedding, type SearchResult } from './knowledge-set-embedding';
import { logger } from '../core/logger';

const EMBEDDINGS_DIR = 'knowledge';

export class EmbeddingsManager {
  private instances: Map<string, KnowledgeSetEmbedding>;
  private embeddingsPath: string;

  constructor() {
    this.embeddingsPath = path.join(APP_CONFIG_PATH, EMBEDDINGS_DIR);
    this.instances = new Map();
  }

  private async ensureEmbeddingsDirectory() {
    await fs.mkdir(this.embeddingsPath, { recursive: true });
  }

  private getInstance(knowledgeSetId: string): KnowledgeSetEmbedding {
    if (!this.instances.has(knowledgeSetId)) {
      const instance = new KnowledgeSetEmbedding(
        knowledgeSetId,
        path.join(this.embeddingsPath, knowledgeSetId),
      );
      this.instances.set(knowledgeSetId, instance);
      return instance;
    }
    return this.instances.get(knowledgeSetId)!;
  }

  public async generateEmbeddings(knowledgeSet: KnowledgeSet): Promise<void> {
    await this.ensureEmbeddingsDirectory();
    const instance = this.getInstance(knowledgeSet.id);
    await instance.generateEmbeddings(knowledgeSet);
  }

  public async loadEmbeddings(knowledgeSetId: string): Promise<void> {
    const instance = this.getInstance(knowledgeSetId);
    await instance.loadEmbeddings();
  }

  public async search(
    query: string,
    knowledgeSetIds: string[],
    limit = 5,
  ): Promise<SearchResult[]> {
    // Search in all enabled knowledge sets
    const allResults: SearchResult[] = [];

    for (const knowledgeSetId of knowledgeSetIds) {
      try {
        const instance = this.getInstance(knowledgeSetId);
        const results = await instance.search(query, limit);
        allResults.push(...results);
      } catch (error) {
        logger(`Error searching knowledge set ${knowledgeSetId}:`, error);
      }
    }

    // Sort by distance and take top results
    return allResults.sort((a, b) => a.distance - b.distance).slice(0, limit);
  }
}

// Export singleton instance
export const embeddingsManager = new EmbeddingsManager();
