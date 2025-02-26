/* eslint-disable @typescript-eslint/no-misused-promises */
import {
  Group,
  Loader,
  Paper,
  Text,
  Checkbox,
  Stack,
  Title,
  Button,
  Collapse,
} from '@mantine/core';
import { useApiIpc } from '@renderer/hooks/use-api-ipc';
import { ConfigurationContainer } from '@renderer/state/configuration';
import { MemoryBar } from '@renderer/components/atom/memory-bar';
import { useState, useEffect } from 'react';
import type { Configuration } from '@shared/api-ipc/configuration';
import { useNavigate } from 'react-router-dom';

export function Configure() {
  const navigate = useNavigate();
  const { configuration, updateConfiguration, models, loading } =
    ConfigurationContainer.useContainer();
  const { data, loading: systemLoading, error } = useApiIpc(() => window.api.getSystemDetails());
  const [systemType, setSystemType] = useState<Configuration['system'] | undefined>();
  const [selectedTasks, setSelectedTasks] = useState<Configuration['tasks']>([]);

  const applySystemType = (systemType: Configuration['system']) => {
    setSystemType(systemType);
    if (!models || !systemType) {
      return;
    }

    const uniqueTasksForSystemType = [
      ...new Set(models[systemType].models.flatMap((model) => model.tasks)),
    ];
    setSelectedTasks(uniqueTasksForSystemType);
  };

  // Determine system type based on available memory
  useEffect(() => {
    if (configuration === undefined || !models) {
      return;
    }

    if (configuration?.system) {
      applySystemType(configuration.system);
      return;
    }

    if (!data?.totalMemory) {
      applySystemType('light');
      return;
    }

    if (data.totalMemory >= 75 * 1024 * 1024 * 1024) {
      applySystemType('heavy');
      return;
    }
    if (data.totalMemory >= 16 * 1024 * 1024 * 1024) {
      applySystemType('medium');
      return;
    }
    applySystemType('light');
  }, [data?.totalMemory, configuration?.system, models]);

  if (loading || systemLoading || !models) {
    return (
      <Group justify="center" h="100%">
        <Loader />
      </Group>
    );
  }

  if (error) {
    return (
      <Group justify="center" h="100%">
        <Text c="red">Error: {error}</Text>
      </Group>
    );
  }

  return (
    <Stack gap="md" p="md">
      <Title order={2}>Configure Local LLM Desktop</Title>
      <Text>Choose your system type based on available memory:</Text>
      <MemoryBar
        total={data?.totalMemory ?? null}
        free={data?.freeMemory ?? null}
        label="System Memory (RAM)"
      />
      <Stack gap="xs">
        {(['light', 'medium', 'heavy'] as const).map((type) => (
          <Paper
            key={type}
            withBorder
            p="md"
            onClick={() => applySystemType(type)}
            style={{ cursor: 'pointer' }}
          >
            <Stack gap="xs">
              <Group>
                <Checkbox
                  checked={systemType === type}
                  onChange={() => applySystemType(type)}
                  label={
                    <Text fw={500}>{type.charAt(0).toUpperCase() + type.slice(1)} System</Text>
                  }
                />
              </Group>
              <Text size="sm" c="dimmed">
                {models && models[type].description}
              </Text>
              <Collapse in={systemType === type}>
                <Stack gap="xs" mt="sm">
                  <Text size="sm" fw={500}>
                    Available Models:
                  </Text>
                  {models &&
                    models[type].models.map((model) => (
                      <Text key={model.modelTag} size="sm">
                        • {model.name} ({model.parameters} parameters)
                      </Text>
                    ))}
                </Stack>
              </Collapse>
            </Stack>
          </Paper>
        ))}
      </Stack>
      <Button
        onClick={async () => {
          if (!systemType) {
            return;
          }

          await updateConfiguration({
            system: systemType,
            tasks: selectedTasks,
          });
          void navigate('/');
        }}
        disabled={!systemType}
      >
        Save Configuration
      </Button>
    </Stack>
  );
}
