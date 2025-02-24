import { getModels } from '../api-ipc/models/read-write';
import { logger } from '../core/logger';

export async function initialize() {
  try {
    logger('Checking for model updates...');
    const result = await getModels();
    if ('error' in result) {
      logger('Failed to check for model updates:', result.error);
      return;
    }
    logger('Model check complete. Version:', result.data.version);
  } catch (error) {
    logger('Error during model initialization:', error);
  }
}
