import { useEffect } from 'react';
import { Stack, Title, Text, Progress, Paper, Group } from '@mantine/core';
import { ConfigurationContainer } from '@renderer/state/configuration';
import { useNavigate } from 'react-router-dom';
import { OllamaModelsContainer } from '@renderer/state/ollama-models';

export function Download() {
  const navigate = useNavigate();
  const { configuration } = ConfigurationContainer.useContainer();
  const { downloadStatus, initializeDownloadStatus, downloadModels } =
    OllamaModelsContainer.useContainer();

  useEffect(() => {
    (async function () {
      if (configuration === null) {
        await navigate('/configure');
        return;
      }
      if (configuration === undefined) {
        return; // Wait for configuration to be loaded
      }

      const taskStatus = await initializeDownloadStatus(configuration);
      void downloadModels(taskStatus);
    })();
  }, [configuration]);

  useEffect(() => {
    if (downloadStatus.length === 0) {
      return;
    }

    const allTasksComplete = downloadStatus.every((task) =>
      task.models.every((model) => model.status === 'completed'),
    );

    if (allTasksComplete) {
      void navigate('/chat');
    }
  }, [downloadStatus, navigate]);

  const getTaskProgress = (task: (typeof downloadStatus)[number]) => {
    if (task.models.length === 0) {
      return 0;
    }

    const totalProgress = task.models.reduce(
      (accumulator, model) => accumulator + model.progress,
      0,
    );
    return Math.round(totalProgress / task.models.length);
  };

  const overallProgress =
    downloadStatus.length > 0
      ? Math.round(
          downloadStatus.reduce((accumulator, task) => accumulator + getTaskProgress(task), 0) /
            downloadStatus.length,
        )
      : 0;

  const activeTasks = downloadStatus.filter((task) => task.models.length > 0);

  const formatProgress = (task: (typeof downloadStatus)[number]) => {
    const progress = getTaskProgress(task);
    return `${progress}%`;
  };

  const formatOverallProgress = () => {
    return `${overallProgress}%`;
  };

  return (
    <Stack p="md" gap="md">
      <Title order={3}>Downloading Required Models</Title>

      <Paper withBorder p="md">
        <Text size="sm">Overall Progress</Text>

        <Progress value={overallProgress} size="xl" />
        <Text size="sm" ta="right" mt={4}>
          {formatOverallProgress()}
        </Text>
      </Paper>

      {activeTasks.map((task) => (
        <Paper key={task.task} withBorder p="md">
          <Stack gap="xs">
            <Group justify="space-between">
              <Text fw={500}>{task.task.charAt(0).toUpperCase() + task.task.slice(1)}</Text>
              <Text size="sm">{formatProgress(task)}</Text>
            </Group>

            <Progress
              value={getTaskProgress(task)}
              c={
                task.models.some((m) => m.status === 'failed')
                  ? 'red'
                  : task.models.every((m) => m.status === 'completed')
                    ? 'green'
                    : // eslint-disable-next-line unicorn/no-nested-ternary
                      task.models.some((m) => m.status === 'downloading')
                      ? 'blue'
                      : 'gray'
              }
            />

            <Stack gap={4}>
              {task.models.map((model) => (
                <Group key={model.modelTag} justify="space-between" wrap="nowrap">
                  <Text size="sm" lineClamp={1} style={{ flex: 1 }}>
                    {model.name}
                  </Text>
                  <Text
                    size="sm"
                    c={
                      model.status === 'completed'
                        ? 'green'
                        : model.status === 'failed'
                          ? 'red'
                          : // eslint-disable-next-line unicorn/no-nested-ternary
                            model.status === 'downloading'
                            ? 'blue'
                            : 'gray'
                    }
                  >
                    {model.status === 'downloading'
                      ? `${model.progress}%`
                      : model.status.toUpperCase()}
                  </Text>
                </Group>
              ))}
            </Stack>

            {task.models.some((m) => m.error) && (
              <Text size="sm" c="red">
                Error: {task.models.find((m) => m.error)?.error}
              </Text>
            )}
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}
