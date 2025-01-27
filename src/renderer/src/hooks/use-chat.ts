import { ollamaApi } from '@renderer/services/ollama/api';
import type { Message } from '@renderer/state/conversation-history';
import { ConversationHistoryProvider } from '@renderer/state/conversation-history';
import { OllamaContainer } from '@renderer/state/ollama';
import { PersonasContainer } from '@renderer/state/personas';
import { useRef, useState } from 'react';

export function useChat() {
  const { models } = OllamaContainer.useContainer();
  const { messages, setMessages } = ConversationHistoryProvider.useContainer();
  const [streamingMessage, setStreamingMessage] = useState<boolean>(false);
  const { activePersona } = PersonasContainer.useContainer();
  const [selectedModel, setSelectedModel] = useState<string>('');
  const streamBuffer = useRef<string>('');

  const selectedModelReference = useRef<string>(selectedModel);
  selectedModelReference.current = selectedModel;

  async function sendMessage(message: string) {
    setStreamingMessage(true);
    streamBuffer.current = '';

    const newMessage: Message = { role: 'user', content: message, when: new Date() };
    setMessages((previous) => [...previous, newMessage]);

    const messagesToSend = [
      ...messages.map((message) => ({ role: message.role, content: message.content })),
      { role: 'user', content: message },
    ];

    const response = await ollamaApi.chat({
      model: selectedModelReference.current,
      messages: activePersona
        ? [{ role: 'system', content: activePersona.prompt }, ...messagesToSend]
        : messagesToSend,
      stream: true,
    });

    let firstStreamInput = true;
    for await (const part of response) {
      if (firstStreamInput) {
        setMessages((previous) => [
          ...previous,
          {
            role: 'assistant',
            content: part.message.content,
            streaming: true,
            when: new Date(part.created_at),
          },
        ]);
        streamBuffer.current = part.message.content;
        firstStreamInput = false;
        continue;
      }

      streamBuffer.current += part.message.content;
      setMessages((previous) =>
        previous.map((message, index) =>
          index === previous.length - 1
            ? {
                ...message,
                content: streamBuffer.current,
                streaming: !part.done,
              }
            : message,
        ),
      );

      if (part.done) {
        setStreamingMessage(false);
        streamBuffer.current = '';
      }
    }
  }

  return {
    models,
    sendMessage,
    messages,
    typingEnabled: !streamingMessage,
    streamingMessage,
    selectedModel,
    setSelectedModel,
  };
}
