import { logger } from '@renderer/core/logger';
import { ollamaApi } from '@renderer/services/ollama/api';
import { useEffect, useState } from 'react';
import { createContainer } from 'unstated-next';

function useOllama() {
  const [online, setOnline] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [models, setModels] = useState<string[]>([]);

  useEffect(() => {
    async function checkStatus() {
      try {
        const response = await ollamaApi.list();
        setModels(response.models.map((model) => model.name));
        setOnline(true);
      } catch (error) {
        logger('Error fetching ollama status', error);
        setOnline(false);
      }
    }
    setInterval(() => void checkStatus(), 30_000);
    void checkStatus().finally(() => setInitializing(false));
  }, []);

  return {
    initializing,
    online,
    models,
  };
}

export const OllamaContainer = createContainer(useOllama);
