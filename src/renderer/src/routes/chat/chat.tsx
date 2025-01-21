/* eslint-disable @typescript-eslint/no-misused-promises */
import { FormEvent, useEffect, useRef, useState } from 'react';
import { Stack, ScrollArea, TextInput, ActionIcon, Paper, Box, Text, Group } from '@mantine/core';
import { useChat } from '@renderer/hooks/use-chat';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from '@renderer/components/molecules/code-block';
import { BotIcon } from '@renderer/components/atom/bot-icon';
import { PersonasContainer } from '@renderer/state/personas';
import { NameAvatar } from '@renderer/components/atom/name-avatar';

export default function Chat() {
  const { messages, sendMessage, typingEnabled, streamingMessage } = useChat();
  const { activePersona } = PersonasContainer.useContainer();
  const viewportReference = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');

  // Update the scroll behavior to be more reliable
  useEffect(() => {
    if (viewportReference.current) {
      // Use requestAnimationFrame to ensure the DOM has updated
      requestAnimationFrame(() => {
        viewportReference.current?.scrollTo({
          top: viewportReference.current.scrollHeight,
          behavior: 'instant', // Changed from 'smooth' for better responsiveness
        });
      });
    }
  }, [messages, streamingMessage]); // Also trigger on streamingMessage changes

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (inputValue.trim() && typingEnabled) {
      await sendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <Stack h="100%" gap={0} pos="relative">
      <ScrollArea h="calc(100vh - 130px)" offsetScrollbars viewportRef={viewportReference}>
        <Stack gap="md" p="md">
          {messages.length === 0 ? (
            <Group align="center" preventGrowOverflow={false}>
              <BotIcon size={128} />
              <Stack align="center" justify="center" h="calc(100vh - 200px)" gap="xs">
                <Text size="xl" fw={600}>
                  Welcome to AI Chat
                </Text>
                <Text size="sm" c="dimmed" ta="center" maw={500}>
                  This is a new conversation. Feel free to ask me anything - I&apos;m here to help
                  with programming questions, code reviews, or any other technical topics you&apos;d
                  like to discuss.
                </Text>
              </Stack>
            </Group>
          ) : (
            messages.map((message, index) => (
              <Paper
                key={index}
                p="sm"
                radius="md"
                bg={message.role === 'user' ? 'blue.1' : 'gray.0'}
                style={{
                  alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                }}
              >
                {message.role === 'user' ? (
                  <Text size="sm" c="blue.9">
                    {message.content}
                  </Text>
                ) : (
                  <Box c="dark">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => <Text size="sm">{children}</Text>,
                        code: ({ children }) => <CodeBlock>{children}</CodeBlock>,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </Box>
                )}
                {streamingMessage && index === messages.length - 1 && (
                  <Text size="xs" c="dimmed" mt={4}>
                    typing...
                  </Text>
                )}
              </Paper>
            ))
          )}
        </Stack>
      </ScrollArea>

      <Box
        p="md"
        pos="sticky"
        bottom={0}
        left={0}
        right={0}
        style={{
          borderTop: '1px solid var(--mantine-color-gray-3)',
          backgroundColor: 'var(--mantine-color-body)',
          zIndex: 10,
        }}
      >
        <form onSubmit={handleSubmit}>
          <Group gap="sm" align="center">
            {activePersona && <NameAvatar name={activePersona.name} />}
            <TextInput
              value={inputValue}
              onChange={(event) => setInputValue(event.currentTarget.value)}
              placeholder="Type a message..."
              style={{ flex: 1 }}
              rightSection={
                <ActionIcon
                  size={32}
                  radius="xl"
                  color="blue"
                  variant="filled"
                  disabled={!typingEnabled || !inputValue.trim()}
                  type="submit"
                >
                  📤
                </ActionIcon>
              }
              rightSectionWidth={42}
            />
          </Group>
        </form>
      </Box>
    </Stack>
  );
}
