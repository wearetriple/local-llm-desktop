import type { IpcResult } from '@shared/api-ipc/types';
import { totalmem, freemem } from 'node:os';
import { logger } from '../../core/logger';
import si from 'systeminformation';
import type { SystemGetDetails } from '@shared/api-ipc/system';

export async function systemGetDetails(): Promise<IpcResult<SystemGetDetails>> {
  try {
    // Get RAM information
    const totalMemory = totalmem();
    const freeMemory = freemem();

    // Get graphics information
    const graphics = await si.graphics();

    // Get the first GPU's VRAM info (if available)
    const gpu = graphics.controllers[0];
    const totalVRAM = gpu?.memoryTotal ? gpu.memoryTotal * 1024 * 1024 : null; // Convert MB to bytes
    const freeVRAM = gpu?.memoryFree ? gpu.memoryFree * 1024 * 1024 : null; // Convert MB to bytes

    return {
      data: {
        totalMemory,
        freeMemory,
        totalVRAM,
        freeVRAM,
      },
    };
  } catch (error) {
    logger(error);
    return { error: 'Failed to get system details' };
  }
}
