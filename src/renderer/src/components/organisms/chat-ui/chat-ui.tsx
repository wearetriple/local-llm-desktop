/* eslint-disable @typescript-eslint/no-misused-promises */
import {
  MainContainer,
  MessageContainer,
  MessageInput,
  MessageList,
  MinChatUiProvider,
} from '@minchat/react-chat-ui';
import type MessageType from '@minchat/react-chat-ui/dist/types/MessageType';

import { useChat } from '@renderer/hooks/use-chat';
import { useMemo } from 'react';

export function ChatUI() {
  const { messages, sendMessage, typingEnabled } = useChat();

  const mappedMessages: MessageType[] = useMemo(
    () =>
      messages.map(
        (message): MessageType => ({
          user: {
            id: message.role === 'user' ? 'user' : 'ai',
            name: message.role === 'user' ? 'You' : 'AI',
          },
          text: message.content,
          loading: message.streaming,
        }),
      ),
    [messages],
  );

  return (
    <MinChatUiProvider theme="#6ea9d7">
      <MainContainer style={{ height: '100vh' }}>
        <MessageContainer>
          <MessageList currentUserId="user" messages={mappedMessages} />
          <MessageInput
            placeholder="Type message here"
            showAttachButton={false}
            showSendButton={typingEnabled}
            onSendMessage={sendMessage}
          />
        </MessageContainer>
      </MainContainer>
    </MinChatUiProvider>
  );
}
