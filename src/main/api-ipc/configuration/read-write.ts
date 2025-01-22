import { z } from 'zod';
import fs from 'node:fs/promises';
import path from 'node:path';
import { ConfigurationSchema, Configuration } from '../../../shared/api-ipc/configuration';
import { IpcResult } from '@shared/api-ipc/types';
import { APP_CONFIG_PATH } from '../../constants';

const CONFIG_FILE_PATH = path.join(APP_CONFIG_PATH, 'app-config.json');

/**
 * Reads the configuration from disk and validates it
 * @returns Promise<GetConfigurationResponse>
 */
export async function readConfiguration(): Promise<IpcResult<Configuration | null>> {
  try {
    const fileContent = await fs.readFile(CONFIG_FILE_PATH, 'utf8');
    return { data: await ConfigurationSchema.parseAsync(JSON.parse(fileContent)) };
  } catch {
    return { data: null };
  }
}

/**
 * Writes the configuration to disk
 * @param config Configuration to write
 * @returns Promise<void>
 */
export async function writeConfiguration(config: Configuration): Promise<IpcResult<undefined>> {
  try {
    // Validate the configuration before writing
    await ConfigurationSchema.parseAsync(config);

    await fs.writeFile(CONFIG_FILE_PATH, JSON.stringify(config, null, 2), 'utf8');
    return { data: undefined };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: `Invalid configuration: ${error.message}` };
    }
    return {
      error: `Failed to write configuration: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
