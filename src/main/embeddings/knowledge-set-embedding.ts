/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import fs from 'node:fs/promises';
import path from 'node:path';
import { Worker } from 'node:worker_threads';
import { logger } from '../core/logger';
import type { KnowledgeSet } from '@shared/api-ipc/knowledge';
import { isValidFileExtension } from '@shared/files/info';
import { EmbeddingIndex, getEmbedding } from 'client-vector-search';
import embeddingWorker from './embedding.worker?modulePath';

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
  progress: {
    [filePath: string]: number;
  };
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
      progress: {},
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

  private processFilesWithWorker(files: Array<{ filePath: string; knowledgeSetId: string }>) {
    logger('Starting worker at path:', embeddingWorker);

    const worker = new Worker(embeddingWorker, {
      workerData: { files },
    });

    worker.on(
      'message',
      (message: {
        type: 'result' | 'progress' | 'error' | 'complete';
        filePath?: string;
        results?: Array<{
          chunk: string;
          embedding: number[];
          source: string;
          knowledgeSetId: string;
        }>;
        progress?: number;
        error?: string;
      }) => {
        switch (message.type) {
          case 'result': {
            if (message.results && message.filePath) {
              for (const result of message.results) {
                this.embeddingIndex.add({
                  embedding: result.embedding,
                  source: result.source,
                  knowledgeSetId: result.knowledgeSetId,
                  chunk: result.chunk,
                });
              }
              this.state.progress[message.filePath] = 100;
              void this.saveState();
            }
            break;
          }

          case 'progress': {
            if (message.filePath && typeof message.progress === 'number') {
              this.state.progress[message.filePath] = message.progress;
              void this.saveState();
            }
            break;
          }

          case 'error': {
            if (message.filePath) {
              logger(`Error processing file ${message.filePath}:`, message.error);
              this.state.progress[message.filePath] = 100; // Mark as complete even if error
              void this.saveState();
            }
            break;
          }

          case 'complete': {
            logger('Worker complete');
            break;
          }
        }
      },
    );
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
    this.state.progress = {};
    await this.saveState();

    this.embeddingIndex.clear();

    try {
      const filesToProcess: Array<{ filePath: string; knowledgeSetId: string }> = [];

      // Collect all files to process
      for (const source of knowledgeSet.sources) {
        try {
          if (source.type === 'file') {
            filesToProcess.push({
              filePath: source.path,
              knowledgeSetId: this.knowledgeSetId,
            });
          } else if (source.type === 'directory') {
            const textFiles = await this.scanDirectory(source.path);
            filesToProcess.push(
              ...textFiles.map((filePath) => ({
                filePath,
                knowledgeSetId: this.knowledgeSetId,
              })),
            );
          }
        } catch (error) {
          logger(`Error collecting files from source ${source.path}:`, error);
        }
      }

      // Process all files with a single worker
      this.processFilesWithWorker(filesToProcess);

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
        progress: this.state.progress,
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
