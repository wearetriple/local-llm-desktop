import { parentPort, workerData } from 'node:worker_threads';
import fs from 'node:fs/promises';
import { logger } from '../core/logger';
import officeParser from 'officeparser';
import { getEmbedding } from 'client-vector-search';
import { createOverlappingChunks } from './text-chunking';

type WorkerData = {
  files: Array<{
    filePath: string;
    knowledgeSetId: string;
  }>;
};

type WorkerResult = {
  chunk: string;
  embedding: number[];
  source: string;
  knowledgeSetId: string;
};

type WorkerMessage =
  | {
      type: 'result';
      filePath: string;
      results: WorkerResult[];
    }
  | {
      type: 'progress';
      filePath: string;
      progress: number;
    }
  | {
      type: 'error';
      filePath: string;
      error: string;
    }
  | {
      type: 'complete';
    };

async function processFile(filePath: string, knowledgeSetId: string): Promise<WorkerResult[]> {
  try {
    logger(`Worker processing file ${filePath}`);

    const fileExtension = filePath.split('.').pop() || '';

    let content: string;
    try {
      const rawContent =
        fileExtension === 'txt'
          ? await fs.readFile(filePath, 'utf8')
          : await officeParser.parseOfficeAsync(filePath);

      content = typeof rawContent === 'string' ? rawContent : String(rawContent || '');
    } catch (parseError) {
      logger(`Error parsing file ${filePath}:`, parseError);
      return [];
    }

    if (!content.trim()) {
      logger(`No content found in file ${filePath}`);
      return [];
    }

    logger('Read content', content.slice(0, 12).replaceAll('\n', ' '), '...');

    const chunks = createOverlappingChunks(content, {
      chunkSize: 1000,
      overlapPercentage: 0.1,
    });

    if (chunks.length === 0) {
      logger(`No valid chunks created for file ${filePath}`);
      return [];
    }

    const results: WorkerResult[] = [];
    let processedChunks = 0;

    for (const chunk of chunks) {
      if (!chunk.trim()) {
        continue;
      }

      const embedding = await getEmbedding(chunk);
      results.push({
        chunk,
        embedding,
        source: filePath,
        knowledgeSetId,
      });

      processedChunks++;
      if (parentPort) {
        parentPort.postMessage({
          type: 'progress',
          filePath,
          progress: (processedChunks / chunks.length) * 100,
        } satisfies WorkerMessage);
      }
    }

    return results;
  } catch (error) {
    logger(`Error in worker processing file ${filePath}:`, error);
    return [];
  }
}

// Make sure we're in a worker context
if (parentPort === undefined) {
  throw new TypeError('This file must be run as a worker');
}

// Ensure we have a valid parent port
if (!parentPort) {
  throw new Error('Parent port is not available');
}

// Get the worker data
const { files } = workerData as WorkerData;

// Main worker function
async function run() {
  try {
    for (const { filePath, knowledgeSetId } of files) {
      try {
        const results = await processFile(filePath, knowledgeSetId);
        parentPort!.postMessage({
          type: 'result',
          filePath,
          results,
        } satisfies WorkerMessage);
      } catch (error) {
        parentPort!.postMessage({
          type: 'error',
          filePath,
          error: error instanceof Error ? error.message : String(error),
        } satisfies WorkerMessage);
      }
    }

    parentPort!.postMessage({
      type: 'complete',
    } satisfies WorkerMessage);
  } catch (error) {
    logger('Worker error:', error);
    parentPort!.postMessage({
      type: 'error',
      filePath: 'unknown',
      error: error instanceof Error ? error.message : String(error),
    } satisfies WorkerMessage);
  }
}

// Start the worker
run().catch((error) => {
  logger('Worker fatal error:', error);
});
