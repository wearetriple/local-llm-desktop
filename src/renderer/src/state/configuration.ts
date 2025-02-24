import { useApiIpc } from '@renderer/hooks/use-api-ipc';
import type { Configuration } from '@shared/api-ipc/configuration';
import { createContainer } from 'unstated-next';

export function useConfiguration() {
  const {
    data: configuration,
    error,
    loading,
    refresh,
  } = useApiIpc(() => window.api.getConfiguration());
  const { data: modelsList, loading: modelsLoading } = useApiIpc(() => window.api.getModels());

  async function updateConfiguration(configuration: Configuration) {
    await window.api.writeConfiguration(configuration);
    await refresh();
  }

  return {
    configuration: loading ? undefined : configuration,
    models: modelsLoading ? undefined : modelsList,
    updateConfiguration,
    error,
    loading: loading || modelsLoading,
  };
}

export const ConfigurationContainer = createContainer(useConfiguration);
