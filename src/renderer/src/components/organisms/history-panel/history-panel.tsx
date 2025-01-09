import { Button, Card, Group, Notification, ScrollArea, Stack, Text, Title } from '@mantine/core';
import { ConversationHistoryProvider } from '@renderer/state/conversation-history';
import { formatRelative } from 'date-fns';

export function HistoryPanel() {
  const { conversations, openConversation, newConversation } =
    ConversationHistoryProvider.useContainer();

  const now = new Date();

  return (
    <ScrollArea h="100vh" type="hover">
      <Group justify="space-between">
        <Title order={3} mb="md">
          History
        </Title>
        <Button size="lg" variant="transparent" onClick={() => newConversation()}>
          +
        </Button>
      </Group>
      {conversations.length === 0 && (
        <Notification color="gray" withCloseButton={false}>
          No conversations available.
        </Notification>
      )}

      {conversations.map((conversation) => (
        <Card key={conversation.id} mb="xs" onClick={() => openConversation(conversation.id)}>
          <Stack>
            <Text>{conversation.title ?? 'Untitled conversation'}</Text>
            <Text size="xs" c="dimmed" ta="right">
              {formatRelative(conversation.updatedAt, now)}
            </Text>
          </Stack>
        </Card>
      ))}
    </ScrollArea>
  );
}
