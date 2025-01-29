/* eslint-disable @typescript-eslint/no-misused-promises */
import type { FormEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Stack,
  ScrollArea,
  TextInput,
  ActionIcon,
  Paper,
  Box,
  Text,
  Group,
  NativeSelect,
} from '@mantine/core';
import { IconSend2 } from '@tabler/icons-react';
import { useChat } from '@renderer/hooks/use-chat';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from '@renderer/components/molecules/code-block';
import { BotIcon } from '@renderer/components/atom/bot-icon';
import { PersonasContainer } from '@renderer/state/personas';
import { NameAvatar } from '@renderer/components/atom/name-avatar';
import { ConfigurationContainer, MODELS } from '@renderer/state/configuration';
import { TASK_LABELS } from '@shared/api-ipc/configuration';
import { OllamaContainer } from '@renderer/state/ollama';
import { KnowledgeContainer } from '@renderer/state/knowledge';
import type { KnowledgeSet } from '@shared/api-ipc/knowledge';
import { KnowledgeSources } from '@renderer/components/organisms/knowledge-sources/knowledge-sources';

export default function Chat() {
  const { messages, sendMessage, typingEnabled, setSelectedModel, selectedModel } = useChat();
  const { configuration } = ConfigurationContainer.useContainer();
  const { models } = OllamaContainer.useContainer();
  const { activePersona } = PersonasContainer.useContainer();
  const { knowledgeSets } = KnowledgeContainer.useContainer();
  const viewportReference = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');

  const knowledgeSetMap: Map<string, KnowledgeSet> = useMemo(() => {
    if (!knowledgeSets) {
      return new Map<string, KnowledgeSet>();
    }
    return new Map(knowledgeSets.map((set) => [set.id, set]));
  }, [knowledgeSets]);

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
  }, [messages]);

  const taskOptions: { value: string; label: string }[] = useMemo(() => {
    if (!configuration) {
      return [];
    }

    const configurationDefinition = MODELS[configuration.system];

    const modelsToUse = configuration.tasks
      .map((task) => {
        const configurationModel = configurationDefinition.models.find((configurationModel) =>
          configurationModel.tasks.includes(task),
        );
        if (!configurationModel) {
          return;
        }
        return { value: configurationModel.modelTag, label: TASK_LABELS[task] };
      })
      .filter((modelName) => modelName !== undefined);
    return modelsToUse;
  }, [configuration, models]);

  useEffect(() => {
    if (!selectedModel && taskOptions.length > 0) {
      setSelectedModel(taskOptions[0].value);
    }
  }, [taskOptions, selectedModel]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (inputValue.trim() && typingEnabled) {
      await sendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <Stack h="100%" gap={0} pos="relative">
      <ScrollArea h="calc(100vh - 170px)" offsetScrollbars viewportRef={viewportReference}>
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
                p="xs"
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
                        p: ({ children }) => <Box mb={8}>{children}</Box>,
                        code: ({ children }) => <CodeBlock>{children}</CodeBlock>,
                        ul: ({ children }) => (
                          <Box component="ul" my={4} ml={16}>
                            {children}
                          </Box>
                        ),
                        li: ({ children }) => (
                          <Box component="li" mb={4}>
                            {children}
                          </Box>
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </Box>
                )}
                {message.streaming && (
                  <Text size="xs" c="dimmed" mt={4}>
                    typing...
                  </Text>
                )}
                {message.role === 'assistant' &&
                  message.documentsUsed &&
                  message.documentsUsed.length > 0 && (
                    <KnowledgeSources
                      documentsUsed={message.documentsUsed}
                      knowledgeSetMap={knowledgeSetMap}
                    />
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
        <Stack gap="xs">
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
                    <IconSend2 size={24} />
                  </ActionIcon>
                }
                rightSectionWidth={42}
              />
            </Group>
          </form>
          <NativeSelect
            aria-label="Select task"
            size="xs"
            value={selectedModel}
            onChange={(event) => setSelectedModel(event.currentTarget.value)}
            data={taskOptions}
            style={{ maxWidth: 200, alignSelf: 'flex-end' }}
          />
        </Stack>
      </Box>
    </Stack>
  );
}
