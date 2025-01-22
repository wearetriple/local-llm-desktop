import { logger } from '@renderer/core/logger';
import { ollamaApi } from '@renderer/services/ollama/api';
import { useEffect, useState } from 'react';
import { createContainer } from 'unstated-next';
import { ConfigurationContainer } from './configuration';
import { MODELS } from './configuration';
import type { ModelResponse } from 'ollama';

function useOllama() {
  const [online, setOnline] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [models, setModels] = useState<ModelResponse[]>([]);
  const { configuration } = ConfigurationContainer.useContainer();

  async function checkStatus() {
    try {
      const response = await ollamaApi.list();
      setModels(response.models);
      setOnline(true);
    } catch (error) {
      logger('Error fetching ollama status', error);
      setOnline(false);
    }
  }

  function areAllRequiredModelsAvailable(): boolean {
    if (!configuration) {
      return false;
    }

    const requiredModels = new Set(
      MODELS[configuration.system].models
        .filter((model) => model.tasks.some((task) => configuration.tasks.includes(task)))
        .map((model) => model.modelTag),
    );

    return [...requiredModels].every((model) => models.some((m) => m.name === model));
  }

  useEffect(() => {
    setInterval(() => void checkStatus(), 30_000);
    void checkStatus().finally(() => setInitializing(false));
  }, []);

  return {
    initializing,
    online,
    models,
    refresh: async () => await checkStatus(),
    areAllRequiredModelsAvailable,
  };
}

export const OllamaContainer = createContainer(useOllama);
