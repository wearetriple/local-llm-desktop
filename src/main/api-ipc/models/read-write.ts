import fs from 'node:fs/promises';
import path from 'node:path';
import { APP_CONFIG_PATH } from '../../constants';
import type { IpcResult } from '@shared/api-ipc/types';
import type { ModelsList } from '@shared/api-ipc/models';
import { ModelsListSchema, MODELS_URL } from '@shared/api-ipc/models';
import { logger } from '../../core/logger';
import { ZodError } from 'zod';
import fallbackModels from './fallback.json';

const MODELS_FILE_PATH = path.join(APP_CONFIG_PATH, 'models.json');

// Hardcoded fallback models in case both remote and local fetch fail
const FALLBACK_MODELS: ModelsList = fallbackModels as ModelsList;

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

export async function getModels(): Promise<IpcResult<ModelsList['models']>> {
  try {
    let remoteModels: ModelsList | null = null;
    let localModels: ModelsList | null = null;

    // Try to fetch remote models
    try {
      remoteModels = await fetchRemoteModels();
    } catch (error) {
      logger('Failed to fetch remote models:', error);
    }

    // Try to read local models
    try {
      localModels = await readLocalModels();
    } catch (error) {
      logger('Failed to read local models:', error);
    }

    // Check if fallback models have a newer version than both remote and local
    const fallbackVersion = FALLBACK_MODELS.version;
    const remoteVersion = remoteModels?.version ?? 0;
    const localVersion = localModels?.version ?? 0;

    // If fallback version is newer than both remote and local, use fallback
    if (
      isNewerVersion(fallbackVersion, remoteVersion) &&
      isNewerVersion(fallbackVersion, localVersion)
    ) {
      logger('Using fallback models as they have a newer version');

      // Write fallback models to local file for future use
      await writeModels(FALLBACK_MODELS);
      return { data: FALLBACK_MODELS.models };
    }

    // If remote models exist and are newer than local, use and save them
    if (
      remoteModels &&
      (!localModels || isNewerVersion(remoteModels.version, localModels.version))
    ) {
      await writeModels(remoteModels);
      return { data: remoteModels.models };
    }

    // If local models exist, use them
    if (localModels) {
      return { data: localModels.models };
    }

    // If all else fails, use fallback models
    return { data: FALLBACK_MODELS.models };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger('Failed to get models:', message);
    return { data: FALLBACK_MODELS.models };
  }
}
