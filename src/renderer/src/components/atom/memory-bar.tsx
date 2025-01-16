import { Progress, Text, Stack, Paper, Group } from '@mantine/core';
import prettyBytes from 'pretty-bytes';

type Properties = {
  total: number | null;
  free: number | null;
  label: string;
};

export function MemoryBar({ total, free, label }: Properties) {
  if (!total || !free) {
    return null;
  }

  const used = total - free;
  const usedPercentage = (used / total) * 100;

  return (
    <Paper p="md" withBorder>
      <Stack gap="xs">
        <Group justify="apart">
          <Text size="sm" fw={500}>
            {label}
          </Text>
          <Text size="sm" c="dimmed">
            {prettyBytes(used)} / {prettyBytes(total)}
          </Text>
        </Group>
        <Progress
          size="xl"
          value={usedPercentage}
          // eslint-disable-next-line unicorn/no-nested-ternary
          color={usedPercentage > 90 ? 'red' : usedPercentage > 70 ? 'yellow' : 'blue'}
        />
      </Stack>
    </Paper>
  );
}
