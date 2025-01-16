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
import { ConfigurationContainer, MODELS } from '@renderer/state/configuration';
import { MemoryBar } from '@renderer/components/atom/memory-bar';
import { useState, useMemo, useEffect } from 'react';
import { Configuration } from '@shared/api-ipc/configuration';
import { useNavigate } from 'react-router-dom';

export function Configure() {
  const navigate = useNavigate();
  const { configuration, updateConfiguration } = ConfigurationContainer.useContainer();
  const { data, loading, error } = useApiIpc(() => window.api.getSystemDetails());
  const [systemType, setSystemType] = useState<Configuration['system'] | undefined>();
  const [selectedTasks, setSelectedTasks] = useState<Configuration['tasks']>([]);

  const applySystemType = (systemType: Configuration['system']) => {
    setSystemType(systemType);
    const uniqueTasksForSystemType = [
      ...new Set(MODELS[systemType].models.flatMap((model) => model.tasks)),
    ];
    setSelectedTasks(uniqueTasksForSystemType);
  };

  // Determine system type based on available memory
  useEffect(() => {
    if (configuration === undefined) {
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
  }, [data?.totalMemory, configuration?.system]);

  // Get all unique tasks from models for the determined system type
  const availableTasks: Configuration['tasks'] = useMemo(() => {
    if (!systemType) {
      return [];
    }

    const tasks = new Set<Configuration['tasks'][number]>();
    for (const model of MODELS[systemType].models) {
      for (const task of model.tasks) {
        tasks.add(task);
      }
    }
    return [...tasks];
  }, [systemType]);

  // Group models by task
  const modelsByTask = useMemo(() => {
    if (!systemType) {
      return {};
    }

    const grouped: Record<string, (typeof MODELS)[typeof systemType]['models']> = {};
    for (const task of availableTasks) {
      grouped[task] = MODELS[systemType].models.filter((model) => model.tasks.includes(task));
    }
    return grouped;
  }, [systemType, availableTasks]);

  // Add state for expanded panels
  const [expandedPanels, setExpandedPanels] = useState<string[]>([]);

  const togglePanel = (taskId: string) => {
    setExpandedPanels((current) =>
      current.includes(taskId) ? current.filter((id) => id !== taskId) : [...current, taskId],
    );
  };

  const handleContinue = async () => {
    if (!systemType) {
      return;
    }

    // Save the configuration
    const newConfig: Configuration = {
      system: systemType,
      tasks: selectedTasks,
    };

    await updateConfiguration(newConfig);

    // Navigate to download page
    await navigate('/download');
  };

  return (
    <>
      {loading && <Loader />}
      {error && <Text c="red">Failed to load system details</Text>}
      {data && (
        <>
          <Group p="md">
            <MemoryBar
              total={data.totalMemory}
              free={data.freeMemory}
              label="System Memory (RAM)"
            />
            {data.totalVRAM ? (
              <MemoryBar
                total={data.totalVRAM}
                free={data.freeVRAM}
                label="Graphics Memory (VRAM)"
              />
            ) : (
              <Paper withBorder p="lg">
                ⚠️ Could not determine GPU information
              </Paper>
            )}
          </Group>

          <Stack p="md" gap="md">
            <Title order={3}>
              We have analyzed your system, tagged it as <em>{systemType}</em> and have found the
              following tasks fit for local execution.
            </Title>
            <Text>Please pick the tasks you want to enable within the application.</Text>

            {availableTasks.map((task) => (
              <Paper key={task} withBorder p="md">
                <Group justify="space-between">
                  <Group>
                    <Checkbox
                      label={`${task.charAt(0).toUpperCase() + task.slice(1).replace('-', ' ')} (${modelsByTask[task].length} models)`}
                      checked={selectedTasks.includes(task)}
                      onChange={(event) => {
                        if (event.currentTarget.checked) {
                          setSelectedTasks([...selectedTasks, task]);
                        } else {
                          setSelectedTasks(selectedTasks.filter((t) => t !== task));
                        }
                      }}
                    />
                  </Group>
                  <Button
                    variant="subtle"
                    size="compact-sm"
                    onClick={() => togglePanel(task)}
                    leftSection={expandedPanels.includes(task) ? '⬇️' : '⬆️'}
                  >
                    {expandedPanels.includes(task) ? 'Hide details' : 'Show details'}
                  </Button>
                </Group>

                <Collapse in={expandedPanels.includes(task)}>
                  <Stack ml="xl" mt="xs">
                    {modelsByTask[task].map((model) => (
                      <Text key={model.modelTag} size="sm" c="dimmed">
                        {model.name} ({model.parameters} parameters, {model.size})
                      </Text>
                    ))}
                  </Stack>
                </Collapse>
              </Paper>
            ))}
            <Text>
              If you are confident about your selection, continue to start download the necessary
              models.
            </Text>
          </Stack>
          <Button ml="md" onClick={handleContinue} disabled={selectedTasks.length === 0}>
            Continue
          </Button>
          <Button.Group mt="md" ml="md">
            {systemType !== 'light' && (
              <Button mr="md" variant="outline" onClick={() => applySystemType('light')}>
                Override to Light
              </Button>
            )}
            {systemType !== 'medium' && (
              <Button mr="md" variant="outline" onClick={() => applySystemType('medium')}>
                Override to Medium
              </Button>
            )}
            {systemType !== 'heavy' && (
              <Button mr="md" variant="outline" onClick={() => applySystemType('heavy')}>
                Override to Heavy
              </Button>
            )}
          </Button.Group>
        </>
      )}
    </>
  );
}
