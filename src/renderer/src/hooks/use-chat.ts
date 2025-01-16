import { ollamaApi } from '@renderer/services/ollama/api';
import { ConversationHistoryProvider, Message } from '@renderer/state/conversation-history';
import { OllamaContainer } from '@renderer/state/ollama';
import { useState } from 'react';

export function useChat() {
  const { models } = OllamaContainer.useContainer();
  const { messages, setMessages } = ConversationHistoryProvider.useContainer();
  const [streamingMessage, setStreamingMessage] = useState<boolean>(false);

  async function sendMessage(message: string) {
    setStreamingMessage(true);

    const newMessage: Message = { role: 'user', content: message, when: new Date() };
    setMessages((previous) => [...previous, newMessage]);
    const response = await ollamaApi.chat({
      model: models.values().next().value ?? '',
      messages: [
        ...messages.map((message) => ({ role: message.role, content: message.content })),
        { role: 'user', content: message },
      ],
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
        firstStreamInput = false;
        continue;
      }

      setMessages((previous) =>
        previous.map((message, index) =>
          index === previous.length - 1
            ? {
                ...message,
                content: `${message.content}${part.message.content}`,
                streaming: part.done,
              }
            : message,
        ),
      );
      if (part.done) {
        setStreamingMessage(false);
      }
    }
  }

  return {
    models,
    sendMessage,
    messages,
    typingEnabled: !streamingMessage,
    streamingMessage,
  };
}
