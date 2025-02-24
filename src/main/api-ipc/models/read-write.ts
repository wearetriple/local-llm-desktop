import fs from 'node:fs/promises';
import path from 'node:path';
import { APP_CONFIG_PATH } from '../../constants';
import type { IpcResult } from '@shared/api-ipc/types';
import type { ModelsList } from '@shared/api-ipc/models';
import { ModelsListSchema, MODELS_URL } from '@shared/api-ipc/models';
import { logger } from '../../core/logger';
import { ZodError } from 'zod';

const MODELS_FILE_PATH = path.join(APP_CONFIG_PATH, 'models.json');

// Hardcoded fallback models in case both remote and local fetch fail
const FALLBACK_MODELS: ModelsList = {
  version: 1,
  models: {
    light: {
      description: 'Models with memory usage typically less than 8 GB of RAM',
      models: [
        {
          name: 'Llama 3.2',
          parameters: '1B',
          size: '1.3GB',
          tasks: ['general'],
          modelTag: 'llama3.2:1b',
        },
      ],
      minimumAvailableMemory: 16,
    },
    medium: {
      description: 'Models with memory usage typically from 8 GB to less than 16 GB of RAM',
      models: [
        {
          name: 'Llama 3.2',
          parameters: '3B',
          size: '2.0GB',
          tasks: ['general'],
          modelTag: 'llama3.2:3b',
        },
      ],
      minimumAvailableMemory: 16,
    },
    heavy: {
      description: 'Models with memory usage of 16 GB of RAM or more but less than 75 GB',
      models: [
        {
          name: 'Gemma 2',
          parameters: '27B',
          size: '16GB',
          tasks: ['general'],
          modelTag: 'gemma-2:27b',
        },
      ],

      minimumAvailableMemory: 16,
    },
  },
};

async function readLocalModels(): Promise<ModelsList | null> {
  try {
    const fileContent = await fs.readFile(MODELS_FILE_PATH, 'utf8');
    return await ModelsListSchema.parseAsync(JSON.parse(fileContent));
  } catch (error) {
    logger('Failed to read local models:', error);
    return null;
  }
}

async function writeModels(models: ModelsList): Promise<IpcResult<void>> {
  try {
    await fs.writeFile(MODELS_FILE_PATH, JSON.stringify(models, null, 2), 'utf8');
    return { data: undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger('Failed to write models:', message);
    return { error: message };
  }
}

async function fetchRemoteModels(): Promise<ModelsList | null> {
  try {
    const response = await fetch(MODELS_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }

    return await ModelsListSchema.parseAsync(await response.json());
  } catch (error) {
    if (error instanceof ZodError) {
      logger('Validation error for remote models:', error.issues);
    } else {
      logger('Failed to fetch remote models:', error);
    }
    return null;
  }
}

function isNewerVersion(remote: number, local: number): boolean {
  return remote > local;
}

export async function getModels(): Promise<IpcResult<ModelsList>> {
  try {
    // Try to fetch remote models first
    try {
      const remoteModels = await fetchRemoteModels();

      if (remoteModels) {
        // Read local models to compare versions
        const localModels = await readLocalModels();

        // Only update if remote version is newer or no local models exist
        if (!localModels || isNewerVersion(remoteModels.version, localModels.version)) {
          await writeModels(remoteModels);
          return { data: remoteModels };
        }

        // If local version is newer or same, use local models
        return { data: localModels };
      }
    } catch (error) {
      logger('Failed to fetch remote models:', error);
    }

    // If remote fetch fails, try to use local models
    const localModels = await readLocalModels();
    if (localModels) {
      return { data: localModels };
    }

    // If both remote and local fail, use fallback
    return { data: FALLBACK_MODELS };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger('Failed to get models:', message);
    return { data: FALLBACK_MODELS };
  }
}
