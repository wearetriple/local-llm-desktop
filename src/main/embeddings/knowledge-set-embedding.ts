/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import fs from 'node:fs/promises';
import path from 'node:path';
import { logger } from '../core/logger';
import type { KnowledgeSet } from '@shared/api-ipc/knowledge';
import { isValidFileExtension } from '@shared/files/info';
import officeParser from 'officeparser';
import { EmbeddingIndex, getEmbedding } from 'client-vector-search';
import { createOverlappingChunks } from './text-chunking';

export type EmbeddingData = {
  text: string;
  metadata: {
    source: string;
    knowledgeSetId: string;
  };
};

export type SearchResult = {
  input: string;
  chunk: string;
  distance: number;
  object: {
    source: string;
    knowledgeSetId: string;
  };
};

export type EmbeddingState = {
  isGenerating: boolean;
  isLoading: boolean;
  lastGeneratedAt: string | null;
  lastLoadedAt: string | null;
  entries: Array<{
    input: string;
    object: {
      source: string;
      knowledgeSetId: string;
    };
  }>;
};

export class KnowledgeSetEmbedding {
  private embeddingIndex: EmbeddingIndex;
  private knowledgeSetId: string;
  private embeddingsPath: string;
  private state: EmbeddingState;

  constructor(knowledgeSetId: string, embeddingsPath: string) {
    this.knowledgeSetId = knowledgeSetId;
    this.embeddingsPath = embeddingsPath;
    this.embeddingIndex = new EmbeddingIndex();
    this.state = {
      isGenerating: false,
      isLoading: false,
      lastGeneratedAt: null,
      lastLoadedAt: null,
      entries: [],
    };
  }

  private async scanDirectory(directory: string): Promise<string[]> {
    const contentFiles: string[] = [];
    const entries = await fs.readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        // Recursively scan subdirectories
        const subDirectoryFiles = await this.scanDirectory(fullPath);
        contentFiles.push(...subDirectoryFiles);
      } else if (entry.isFile() && isValidFileExtension(entry.name.split('.').pop() || '')) {
        contentFiles.push(fullPath);
      }
    }

    return contentFiles;
  }

  private async processFile(filePath: string): Promise<void> {
    try {
      logger(`Processing file ${filePath}`);

      const fileExtension = filePath.split('.').pop() || '';

      let content: string;
      try {
        const rawContent =
          fileExtension === 'txt'
            ? await fs.readFile(filePath, 'utf8')
            : await officeParser.parseOfficeAsync(filePath);

        // Ensure content is a string and handle potential null/undefined
        content = typeof rawContent === 'string' ? rawContent : String(rawContent || '');
      } catch (parseError) {
        logger(`Error parsing file ${filePath}:`, parseError);
        return;
      }

      if (!content.trim()) {
        logger(`No content found in file ${filePath}`);
        return;
      }

      logger('Read content', content.slice(0, 12).replaceAll('\n', ' '), '...');

      const chunks = createOverlappingChunks(content, {
        chunkSize: 1000,
        overlapPercentage: 0.1,
      });

      if (chunks.length === 0) {
        logger(`No valid chunks created for file ${filePath}`);
        return;
      }

      for (const chunk of chunks) {
        if (!chunk.trim()) {
          continue;
        }

        const embedding = await getEmbedding(chunk);
        this.embeddingIndex.add({
          embedding,
          source: filePath,
          knowledgeSetId: this.knowledgeSetId,
          chunk,
        });
      }
    } catch (error) {
      logger(`Error processing file ${filePath}:`, error);
    }
  }

  private getEmbeddingsFilePath(): string {
    return path.join(this.embeddingsPath, 'embeddings.json');
  }

  public getState(): EmbeddingState {
    return this.state;
  }

  public async generateEmbeddings(knowledgeSet: KnowledgeSet): Promise<void> {
    if (this.state.isGenerating) {
      throw new Error('Already generating embeddings');
    }

    this.state.isGenerating = true;
    await this.saveState();

    this.embeddingIndex.clear();

    try {
      // Process each source
      for (const source of knowledgeSet.sources) {
        try {
          if (source.type === 'file') {
            await this.processFile(source.path);
          } else if (source.type === 'directory') {
            const textFiles = await this.scanDirectory(source.path);
            for (const filePath of textFiles) {
              await this.processFile(filePath);
            }
          }
        } catch (error) {
          logger(`Error processing source ${source.path}:`, error);
        }
      }

      // Save embeddings to disk
      await this.saveEmbeddings();

      this.state.lastGeneratedAt = new Date().toISOString();
    } finally {
      this.state.isGenerating = false;
      await this.saveState();
    }
  }

  private async saveState(): Promise<void> {
    const filePath = this.getEmbeddingsFilePath();

    await fs.writeFile(filePath, JSON.stringify(this.state, null, 2), 'utf8');
  }

  private async saveEmbeddings(): Promise<void> {
    await this.saveState();
  }

  public async loadEmbeddings(): Promise<void> {
    if (this.state.isLoading) {
      throw new Error('Already loading embeddings');
    }

    this.state.isLoading = true;
    await this.saveState();

    try {
      const filePath = this.getEmbeddingsFilePath();
      const content = await fs.readFile(filePath, 'utf8');
      const savedState = JSON.parse(content) as EmbeddingState;

      this.state = {
        ...savedState,
        isGenerating: this.state.isGenerating,
        isLoading: false,
      };

      this.state.lastLoadedAt = new Date().toISOString();
    } catch (error) {
      logger(`Error loading embeddings for ${this.knowledgeSetId}:`, error);
    } finally {
      this.state.isLoading = false;
      await this.saveState();
    }
  }

  public async search(query: string, limit: number): Promise<SearchResult[]> {
    const queryEmbedding = await getEmbedding(query);

    const result = await this.embeddingIndex.search(queryEmbedding, { topK: limit });

    return result.map((r) => ({
      input: query,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      chunk: r.object.chunk,
      distance: r.similarity,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      object: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        source: r.object.source,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        knowledgeSetId: r.object.knowledgeSetId,
      },
    }));
  }
}
