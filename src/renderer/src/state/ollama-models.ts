import type { Configuration } from '@shared/api-ipc/configuration';
import { useRef, useState } from 'react';
import { createContainer } from 'unstated-next';
import { ollamaApi, pullModel } from '@renderer/services/ollama/api';
import type { ModelResponse } from 'ollama';
import type { ModelsList } from '@shared/api-ipc/models';

export interface ModelDownloadStatus {
  modelTag: string;
  name: string;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  progress: number;
  error?: string;
}

export interface TaskDownloadStatus {
  task: Configuration['tasks'][number];
  models: ModelDownloadStatus[];
}

interface PullProgress {
  status: string;
  digest?: string;
  total?: number;
  completed?: number;
  total_bytes?: number;
  completed_bytes?: number;
}

function useOllamaModels() {
  const [downloadStatus, setDownloadStatus] = useState<TaskDownloadStatus[]>([]);
  const [models, setModels] = useState<ModelResponse[]>([]);

  const modelsReference = useRef<ModelResponse[]>([]);
  modelsReference.current = models;

  const initializeDownloadStatus = async (
    configuration: Configuration,
    preselectedModels: ModelsList['models'],
  ) => {
    const listResponse = await ollamaApi.list();
    setModels(listResponse.models);
    modelsReference.current = listResponse.models;

    const taskStatus: TaskDownloadStatus[] = configuration.tasks.map((task) => {
      const taskModels = preselectedModels[configuration.system].models
        .filter((model) => model.tasks.includes(task))
        .map((model) => ({
          modelTag: model.modelTag,
          status: modelsReference.current.some((storedModel) => storedModel.name === model.modelTag)
            ? ('completed' as const)
            : ('pending' as const),
          progress: modelsReference.current.some(
            (storedModel) => storedModel.name === model.modelTag,
          )
            ? 100
            : 0,
          name: model.name,
        }));

      return {
        task,
        models: taskModels,
      };
    });

    setDownloadStatus(taskStatus);
    return taskStatus;
  };

  const downloadModels = async (taskStatus: TaskDownloadStatus[]) => {
    const getModelsResponse = await ollamaApi.list();
    for (const task of taskStatus) {
      for (const model of task.models) {
        if (getModelsResponse.models.some((ollamaModel) => model.modelTag === ollamaModel.name)) {
          continue;
        }

        try {
          setDownloadStatus((current) =>
            current.map((taskDownloadStatus) =>
              taskDownloadStatus.task === task.task
                ? {
                    ...taskDownloadStatus,
                    models: taskDownloadStatus.models.map((m) =>
                      m.modelTag === model.modelTag ? { ...m, status: 'downloading' } : m,
                    ),
                  }
                : taskDownloadStatus,
            ),
          );

          await pullModel(model.modelTag, {
            onProgress: (progress: PullProgress) => {
              setDownloadStatus((current) =>
                current.map((taskDownloadStatus) =>
                  taskDownloadStatus.task === task.task
                    ? {
                        ...taskDownloadStatus,
                        models: taskDownloadStatus.models.map((m) =>
                          m.modelTag === model.modelTag
                            ? {
                                ...m,
                                progress: Math.round(
                                  ((progress.completed ?? 0) / (progress.total ?? 1)) * 100,
                                ),
                              }
                            : m,
                        ),
                      }
                    : taskDownloadStatus,
                ),
              );
            },
          });

          setDownloadStatus((current) =>
            current.map((t) =>
              t.task === task.task
                ? {
                    ...t,
                    models: t.models.map((m) =>
                      m.modelTag === model.modelTag
                        ? { ...m, status: 'completed', progress: 100 }
                        : m,
                    ),
                  }
                : t,
            ),
          );
        } catch (error) {
          setDownloadStatus((current) =>
            current.map((t) =>
              t.task === task.task
                ? {
                    ...t,
                    models: t.models.map((m) =>
                      m.modelTag === model.modelTag
                        ? {
                            ...m,
                            status: 'failed',
                            error: error instanceof Error ? error.message : 'Unknown error',
                          }
                        : m,
                    ),
                  }
                : t,
            ),
          );
        }
      }
    }
  };

  return {
    initializeDownloadStatus,
    downloadStatus,
    downloadModels,
  };
}

export const OllamaModelsContainer = createContainer(useOllamaModels);
