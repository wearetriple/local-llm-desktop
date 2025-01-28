import { ollamaApi } from '@renderer/services/ollama/api';
import type { Message } from '@renderer/state/conversation-history';
import { ConversationHistoryProvider } from '@renderer/state/conversation-history';
import { KnowledgeContainer } from '@renderer/state/knowledge';
import { OllamaContainer } from '@renderer/state/ollama';
import { PersonasContainer } from '@renderer/state/personas';
import { useRef, useState } from 'react';

async function requestReply(
  model: string,
  messages: { role: string; content: string }[],
  selectedKnowledgeSets: string[],
) {
  if (selectedKnowledgeSets.length === 0) {
    return ollamaApi.chat({
      model,
      messages,
      stream: true,
    });
  }
  const documents = await window.api.searchEmbeddings(
    messages.at(-1)?.content ?? '',
    selectedKnowledgeSets,
  );

  // Create a context string from the retrieved documents
  const contextString = documents
    .map(
      (document) =>
        `Content: ${document.content}\nSource: ${document.file} (Knowledge Set: ${document.knowledgeSetId})`,
    )
    .join('\n\n');

  // Add context and instructions to the messages
  const contextMessage = {
    role: 'system',
    content: `Below is relevant information from the knowledge base that you should use to help answer the user's question:\n\n${contextString}\n\nPlease formulate your response based primarily on this information. If the provided information is insufficient to fully answer the question, you may draw from your general knowledge but clearly indicate when you do so. Maintain a natural, conversational tone in your response.`,
  };

  // Insert the context message right before the user's last message
  messages.splice(-1, 0, contextMessage);

  return ollamaApi.chat({
    model,
    messages,
    stream: true,
  });
}

export function useChat() {
  const { models } = OllamaContainer.useContainer();
  const { messages, setMessages } = ConversationHistoryProvider.useContainer();
  const [streamingMessage, setStreamingMessage] = useState<boolean>(false);
  const { activePersona } = PersonasContainer.useContainer();
  const [selectedModel, setSelectedModel] = useState<string>('');
  const streamBuffer = useRef<string>('');
  const { selectedSets: selectedKnowledgeSets } = KnowledgeContainer.useContainer();

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

    const response = await requestReply(
      selectedModelReference.current,
      activePersona
        ? [{ role: 'system', content: activePersona.prompt }, ...messagesToSend]
        : messagesToSend,
      selectedKnowledgeSets,
    );

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
