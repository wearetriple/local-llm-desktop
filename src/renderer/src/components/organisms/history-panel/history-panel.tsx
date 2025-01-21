import { Button, Card, Notification, ScrollArea, Stack, Text } from '@mantine/core';
import { ConversationHistoryProvider } from '@renderer/state/conversation-history';
import { IconPlus } from '@tabler/icons-react';
import { formatRelative } from 'date-fns';

export function HistoryPanel() {
  const { conversations, openConversation, newConversation } =
    ConversationHistoryProvider.useContainer();

  const now = new Date();

  return (
    <ScrollArea h="100vh" type="hover">
      <Button
        variant="light"
        onClick={() => newConversation()}
        leftSection={<IconPlus size={16} />}
        mb="md"
        mt="xs"
      >
        New conversation
      </Button>

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
