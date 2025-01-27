import { useApiIpc } from '@renderer/hooks/use-api-ipc';
import type { Configuration } from '@shared/api-ipc/configuration';
import { createContainer } from 'unstated-next';

export const MODELS: Record<
  Configuration['system'],
  {
    description: string;
    minimumAvailableMemory: number;
    models: {
      name: string;
      parameters: string;
      size: string;
      tasks: Configuration['tasks'];
      modelTag: string;
    }[];
  }
> = {
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
      {
        name: 'Gemma 2',
        parameters: '2B',
        size: '1.6GB',
        tasks: ['general'],
        modelTag: 'gemma2:2b',
      },
      {
        name: 'Moondream 2',
        parameters: '1.4B',
        size: '829MB',
        tasks: ['creative-writing'],
        modelTag: 'moondream:latest',
      },
      {
        name: 'Smollm',
        parameters: '0.135B',
        size: '92MB',
        tasks: ['general'],
        modelTag: 'smollm:135m',
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
      {
        name: 'Phi 3 Mini',
        parameters: '3.8B',
        size: '2.3GB',
        tasks: ['general'],
        modelTag: 'phi3:latest',
      },
      {
        name: 'Code Llama',
        parameters: '7B',
        size: '3.8GB',
        tasks: ['coding'],
        modelTag: 'codellama:latest',
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
};

export function useConfiguration() {
  const { data, error, loading, refresh } = useApiIpc(() => window.api.getConfiguration());

  async function updateConfiguration(configuration: Configuration) {
    await window.api.writeConfiguration(configuration);
    await refresh();
  }

  return {
    configuration: loading ? undefined : data,
    updateConfiguration,
    error,
    loading,
  };
}

export const ConfigurationContainer = createContainer(useConfiguration);
