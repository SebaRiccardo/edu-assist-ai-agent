'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent } from '@/components/ai-elements/message';
import { Response } from '@/components/ai-elements/response';
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputTools,
  PromptInputSubmit,

  type PromptInputMessage,
} from '@/components/ai-elements/prompt-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Mail, Loader2 } from 'lucide-react';
import { useConnections } from '@/hooks/use-connections';
import { ComposioConnectedAccount } from '@/app/api/connections/route';

interface InboxChatProps {
  userId: string;
}

interface ConnectedInbox {
  id: string;
  email: string;
}

export function InboxChat({ userId }: InboxChatProps) {
  const [input, setInput] = useState('');
  const [selectedInbox, setSelectedInbox] = useState<string>('');

  // Fetch connected inboxes using the existing hook
  const { data: connections, isLoading: loading } = useConnections();

  // Map connections to inbox format
  const inboxes: ConnectedInbox[] =
    connections?.map((account: ComposioConnectedAccount) => ({
      id: account.id,
      email: account?.email || account.id,
    })) || [];

  // Set initial inbox selection
  if (inboxes.length > 0 && !selectedInbox && !loading) {
    setSelectedInbox(inboxes[0].id);
  }

  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: {
        userId,
        connectionId: selectedInbox,
      },
    }),
    onError: (error) => {
      console.error('Chat error:', error);
    },
  });

  const handleSubmit = (message: PromptInputMessage) => {
    if (message.text?.trim() && selectedInbox) {
      sendMessage({
        text: message.text,
      });
      setInput('');
    }
  };

  const handleStop = () => {
    stop();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (inboxes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
        <Mail className="h-16 w-16 text-muted-foreground" />
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold">No Inboxes Connected</h2>
          <p className="text-muted-foreground">
            Please connect a Gmail account to start chatting with your inbox.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto py-10">
      {/* Inbox Selector */}
      <div className="border-b p-4">
        <div className="flex items-center gap-4">
          <Mail className="h-5 w-5 text-muted-foreground" />
          <Select value={selectedInbox} onValueChange={setSelectedInbox}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Select an inbox" />
            </SelectTrigger>
            <SelectContent>
              {inboxes.map((inbox) => (
                <SelectItem key={inbox.id} value={inbox.id}>
                  {inbox.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Chat Interface */}
      <Conversation>
        <ConversationContent>
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={<Mail className="h-12 w-12" />}
              title="Chat with Your Inbox"
              description="Ask me to fetch emails, search for specific messages, find emails related to your courses, or help you manage your inbox."
            >
              <Mail className="h-12 w-12 text-muted-foreground" />
              <div className="space-y-2 max-w-md">
                <h3 className="text-xl font-semibold">
                  Chat with Your Inbox
                </h3>
                <p className="text-sm text-muted-foreground">
                  Ask me to fetch emails, search for specific messages, find
                  emails related to your courses, or help you manage your inbox.
                </p>
                <div className="pt-4 space-y-2 text-xs text-left">
                  <p className="font-medium">Try asking:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• "Show me my latest 10 unread emails"</li>
                    <li>
                      • "Find emails related to my Machine Learning course"
                    </li>
                    <li>• "What emails did I receive today from my professor?"</li>
                    <li>• "List all my courses"</li>
                  </ul>
                </div>
              </div>
            </ConversationEmptyState>
          ) : (
            messages.map((message) => (
              <Message key={message.id} from={message.role}>
                <MessageContent variant="flat">
                  {message.parts.map((part, index) =>
                    part.type === 'text' ? (
                      <Response key={index}>{part.text}</Response>
                    ) : null
                  )}
                </MessageContent>
              </Message>
            ))
          )}
          {status === 'streaming' && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground px-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Thinking...</span>
            </div>
          )}
        </ConversationContent>
      </Conversation>

      {/* Input Area */}
      <PromptInput onSubmit={handleSubmit}>
        <PromptInputTextarea
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
          placeholder="Ask me anything about your emails..."
          disabled={!selectedInbox || status === 'streaming'}
        />
        <PromptInputTools>
          <span className="text-xs text-muted-foreground">
            {selectedInbox
              ? inboxes.find((i) => i.id === selectedInbox)?.email
              : 'Select an inbox'}
          </span>
        </PromptInputTools>
        <PromptInputSubmit
          disabled={!input.trim() || !selectedInbox}
          status={status}
          onClick={status === 'streaming' ? handleStop : undefined}
        />
      </PromptInput>
    </div>
  );
}
