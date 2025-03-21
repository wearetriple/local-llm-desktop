import { useCallback, useEffect, useState, useRef } from 'react';
import { createContainer } from 'unstated-next';
import type { Conversation as StoredConversation } from 'src/main/api-ipc/conversation-history/validator';
import { logger } from '@renderer/core/logger';
import { ConfigurationContainer } from './configuration';
import type { ErrorResponse, GenerateTitleResponse } from '../worker';

export type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  streaming?: boolean;
  when: Date;
  documentsUsed?: Array<{ knowledgeSetId: string; file: string }>;
};

export type Conversation = {
  id: string;
  title?: string | undefined;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
};

function mapConversationToStoredConversation(conversation: Conversation): StoredConversation {
  return {
    id: conversation.id,
    title: conversation.title,
    messages: conversation.messages.map((message) => ({
      role: message.role,
      content: message.content,
      timestamp: message.when.toISOString(),
      documentsUsed: message.documentsUsed,
    })),
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
  };
}

function useConversationHistory() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const { configuration, models: applicationModelsList } = ConfigurationContainer.useContainer();

  const currentConversationReference = useRef(currentConversation);
  const messagesReference = useRef<Message[]>(messages);

  useEffect(() => {
    currentConversationReference.current = currentConversation;
  }, [currentConversation]);
  useEffect(() => {
    messagesReference.current = messages;
  }, [messages]);

  useEffect(() => {
    // Only update the conversation if it's not streaming a new reply
    if (!currentConversation || currentConversation.messages.some((message) => message.streaming)) {
      return;
    }

    // update the conversation in the conversations array
    setConversations((previousConversations) => {
      const hasConversation = previousConversations.some(
        (conversation) => conversation.id === currentConversation.id,
      );
      return hasConversation
        ? previousConversations.map((conversation) =>
            conversation.id === currentConversation.id ? currentConversation : conversation,
          )
        : [currentConversation, ...previousConversations];
    });
    if (!currentConversation.messages.some((message) => message.streaming)) {
      void saveConversation(currentConversation);
    }
  }, [currentConversation]);

  useEffect(() => {
    void window.api.listConversations().then((storedConversations) =>
      setConversations(
        storedConversations.map((storedConversation) => ({
          id: storedConversation.id,
          title: storedConversation.title,
          messages: storedConversation.messages.map((storedMessage) => ({
            role: storedMessage.role,
            content: storedMessage.content,
            when: new Date(storedMessage.timestamp),
            documentsUsed: storedMessage.documentsUsed,
          })),
          createdAt: new Date(storedConversation.createdAt),
          updatedAt: new Date(storedConversation.updatedAt),
        })),
      ),
    );
  }, []);

  async function saveConversation(conversation: Conversation) {
    await window.api.saveConversation(mapConversationToStoredConversation(conversation));
  }

  const setMessagesOnConversation = useCallback(
    (newMessages: Message[] | ((currentMessages: Message[]) => Message[])) => {
      const updatedMessages =
        typeof newMessages === 'function' ? newMessages(messagesReference.current) : newMessages;

      setMessages(updatedMessages);
      messagesReference.current = updatedMessages;
      if (updatedMessages.length === 0) {
        return;
      }

      if (currentConversationReference.current) {
        setCurrentConversation({
          ...currentConversationReference.current,
          messages: updatedMessages,
          updatedAt: new Date(),
        });
      } else {
        const newConversation: Conversation = {
          id: crypto.randomUUID(),
          messages: updatedMessages,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        logger('Creating new conversation', newConversation);
        setCurrentConversation(newConversation);
        currentConversationReference.current = newConversation;

        if (configuration && applicationModelsList && updatedMessages[0]) {
          const generalModel = applicationModelsList[configuration.system].models.find((model) =>
            model.tasks.includes('general'),
          );
          if (generalModel) {
            // Initialize the web worker
            const titleWorker = new Worker(new URL('../worker.ts', import.meta.url), {
              type: 'module',
            });

            // eslint-disable-next-line unicorn/prefer-add-event-listener
            titleWorker.onmessage = (
              event: MessageEvent<GenerateTitleResponse | ErrorResponse>,
            ) => {
              titleWorker.terminate();
              if (event.data.type === 'titleGenerated') {
                const { title } = event.data;
                if (currentConversationReference.current) {
                  setCurrentConversation((previous) => (previous ? { ...previous, title } : null));
                }
                return;
              }
              logger('Error generating title:', event.data);
            };

            titleWorker.postMessage({
              type: 'generateTitle',
              message: updatedMessages[0].content,
              modelTag: generalModel.modelTag,
            });
          }
          logger(
            'No general model found for the current system configuration, not summarizing the conversation.',
          );
        } else {
          logger('No configuration found; or no message: not summarizing the conversation.');
        }

        void saveConversation(newConversation);
      }
    },
    [messages, setMessages, saveConversation, configuration],
  );

  const openConversation = useCallback(
    (conversationId: string) => {
      const conversation = conversations.find((conversation) => conversation.id === conversationId);
      if (!conversation) {
        return;
      }
      setCurrentConversation(conversation);
      currentConversationReference.current = conversation;
      setMessages(conversation.messages);
    },
    [conversations, setCurrentConversation, setMessages],
  );

  const newConversation = () => {
    setCurrentConversation(null);
    setMessages([]);
  };

  return {
    conversations,
    saveConversation,
    messages,
    setMessages: setMessagesOnConversation,
    openConversation,
    newConversation,
  };
}

export const ConversationHistoryProvider = createContainer(useConversationHistory);
