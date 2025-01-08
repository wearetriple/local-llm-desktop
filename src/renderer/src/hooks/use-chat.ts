import { ollamaApi } from '@renderer/services/ollama/api';
import { OllamaContainer } from '@renderer/state/ollama';
import { useState } from 'react';

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  streaming?: boolean;
  when: Date;
};

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const { models } = OllamaContainer.useContainer();
  const [streamingMessage, setStreamingMessage] = useState<boolean>(false);

  async function sendMessage(message: string) {
    setStreamingMessage(true);

    const newMessage: Message = { role: 'user', content: message, when: new Date() };
    setMessages((previous) => [...previous, newMessage]);
    const response = await ollamaApi.chat({
      model: models[0],
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
  };
}
