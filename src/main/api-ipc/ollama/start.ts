import { spawn } from 'node:child_process';
import { which } from 'shelljs';
import type { IpcResult } from '@shared/api-ipc/types';

export async function startOllamaServer(): Promise<IpcResult<void>> {
  try {
    // First check if ollama exists
    if (!which('ollama')) {
      return {
        error: 'Ollama is not installed. Please install it first: https://ollama.ai',
      };
    }

    // Spawn ollama serve as a detached process
    const process = spawn('ollama', ['serve'], {
      detached: true,
      stdio: 'ignore',
    });

    // Unref the process so it can run independently of the parent
    process.unref();

    // Wait a short time to see if the process fails immediately
    await new Promise((resolve, reject) => {
      process.on('error', reject);

      // If we get here, the process started successfully
      setTimeout(resolve, 1000);
    });

    return { data: undefined };
  } catch (error) {
    // If the error contains "address already in use", the server is already running
    if (error instanceof Error && error.message.includes('address already in use')) {
      return { data: undefined }; // Server is already running, that's fine
    }

    return {
      error: `Failed to start Ollama server: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

export function checkOllamaExists(): IpcResult<boolean> {
  try {
    const exists = Boolean(which('ollama'));
    return { data: exists };
  } catch (error) {
    return {
      error: `Failed to check if Ollama exists: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
