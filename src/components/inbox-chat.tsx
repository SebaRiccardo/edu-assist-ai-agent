'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Conversation, ConversationContent, ConversationEmptyState } from '@/components/ai-elements/conversation';
import { Message, MessageContent } from '@/components/ai-elements/message';
import { Response } from '@/components/ai-elements/response';
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputTools,
  PromptInputSubmit,
  type PromptInputMessage,
  PromptInputToolbar,
  PromptInputButton,
  PromptInputModelSelect,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputModelSelectItem,
  PromptInputModelSelectContent,
  PromptInputBody,
  PromptInputAttachments,
  PromptInputAttachment,
  PromptInputFooter,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
  PromptInputActionAddAttachments,
  PromptInputSpeechButton,
} from '@/components/ai-elements/prompt-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Loader2, PaperclipIcon, MicIcon, GlobeIcon } from 'lucide-react';
import { useConnections } from '@/hooks/use-connections';
import { ComposioConnectedAccount } from '@/app/api/connections/route';
import { Suggestion, Suggestions } from './ai-elements/suggestion';
import { InboxConnectionCards } from '@/components/inbox-connection-cards';
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from '@/components/ai-elements/tool';
import type { ToolUIPart } from 'ai';
import { Loader } from './ai-elements/loader';
import { GmailToolOutput, CourseToolOutput } from '@/components/tool-output-formatters';

interface InboxChatProps {
  userId: string;
}

interface ConnectedInbox {
  id: string;
  email: string;
  name?: string;
  status: string;
  avatarUrl?: string;
  createdAt: string;
}

const suggestions = [
  'What emails did I receive today from my algebra students?',
  'Find emails related to my Machine Learning course',
  'List all my courses',
];

const models = [
  { id: 'gpt-4', name: 'GPT-4' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
  { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite' },
  { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
];

/**
 * Format tool name for display
 * Converts snake_case or SCREAMING_SNAKE_CASE to Title Case
 */
function formatToolName(toolName: string): string {
  return toolName.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Format tool output based on tool type
 * Returns a React component for custom formatted output or the raw output
 */
function formatToolOutput(toolName: string, output: any): React.ReactNode {
  // Gmail tools
  if (toolName.includes('GMAIL_FETCH_EMAILS') || toolName.includes('fetch_emails')) {
    return <GmailToolOutput output={output} />;
  }

  // Course tools
  if (toolName.includes('getUserCourses') || toolName.includes('getCourseDetails')) {
    return <CourseToolOutput output={output} />;
  }

  // Default: return raw output
  return output;
}

export function InboxChat({ userId }: InboxChatProps) {
  const t = useTranslations('InboxChat');
  const [input, setInput] = useState('');
  const [selectedInbox, setSelectedInbox] = useState<string | undefined>(undefined);
  const [model, setModel] = useState<string>(models[0].id);
  // Fetch connected inboxes using the existing hook
  const { data: connections, isLoading: loading } = useConnections();

  //Map connections to inbox format
  const inboxes: ConnectedInbox[] =
    connections?.map((account: ComposioConnectedAccount) => ({
      id: account.id,
      email: account?.email || account.id,
      name: account.name,
      status: account.status,
      avatarUrl: account.avatarUrl,
      createdAt: account.createdAt,
    })) || [];

  // Auto-select first inbox if none selected
  if (inboxes.length > 0 && !selectedInbox && !loading) {
    setSelectedInbox(inboxes[0].id);
  }

  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
    onError: error => {
      console.error('Chat error:', error);
    },
  });

  const handleSubmit = (message: PromptInputMessage) => {
    if (message.text?.trim() && selectedInbox) {
      sendMessage(
        {
          text: message.text,
        },
        {
          body: {
            connectionId: selectedInbox,
            model: model,
          },
        }
      );
      setInput('');
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSubmit({ text: suggestion });
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
          <p className="text-muted-foreground">Please connect a Gmail account to start chatting with your inbox.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full py-6 ">
      {/* Connection Cards */}
      {/* <InboxConnectionCards
        inboxes={inboxes}
        selectedInbox={selectedInbox}
        onSelectInbox={setSelectedInbox}
      /> */}

      <Conversation>
        <ConversationContent className="max-w-4xl mx-auto h-full">
          {!selectedInbox ? (
            <ConversationEmptyState
              icon={<Mail className="h-12 w-12" />}
              title="Select an Inbox to Start"
              description="Choose one of your connected Gmail accounts above to begin chatting with your emails."
            >
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
                <Mail className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-2 max-w-md text-center">
                <h3 className="text-xl font-semibold">{t('selectInboxTitle')}</h3>
                <p className="text-sm text-muted-foreground">{t('selectInboxDescription')}</p>
              </div>
            </ConversationEmptyState>
          ) : messages.length === 0 ? (
            <ConversationEmptyState icon={<Mail className="h-12 w-12" />} title={t('chatTitle')} description={t('chatDescription')}>
              <Mail className="h-12 w-12 text-muted-foreground" />
              <div className="space-y-2 max-w-md">
                <h3 className="text-xl font-semibold">{t('chatTitle')}</h3>
                <p className="text-sm text-muted-foreground">{t('chatDescription')}</p>
                {/* <div className="pt-4 space-y-2 text-xs text-left">
                  <p className="font-medium">Try asking:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• "Show me my latest 10 unread emails"</li>
                    <li>
                      • "Find emails related to my Machine Learning course"
                    </li>
                    <li>• "What emails did I receive today from my professor?"</li>
                    <li>• "List all my courses"</li>
                  </ul>
                </div> */}
              </div>
            </ConversationEmptyState>
          ) : (
            messages.map(message => (
              <Message key={message.id} from={message.role}>
                <MessageContent>
                  {message.parts.map((part, index) => {
                    switch (part.type) {
                      case 'text':
                        return <Response key={`${message.id}-${index}`}>{part.text}</Response>;

                      // Handle tool invocations dynamically
                      default:
                        // Check if it's a tool part (starts with 'tool-')
                        if (part.type.startsWith('tool-')) {
                          const toolPart = part as ToolUIPart;
                          const toolName = toolPart.type.replace('tool-', '');

                          // Determine if tool should be open by default
                          const defaultOpen = toolPart.state === 'output-available' || toolPart.state === 'output-error';

                          return (
                            <Tool key={`${message.id}-${index}`} defaultOpen={defaultOpen} className="my-2">
                              <ToolHeader title={formatToolName(toolName)} type={toolPart.type} state={toolPart.state} />
                              <ToolContent>
                                {(toolPart.state === 'input-available' ||
                                  toolPart.state === 'output-available' ||
                                  toolPart.state === 'output-error') && <ToolInput input={toolPart.input} />}
                                {(toolPart.state === 'output-available' || toolPart.state === 'output-error') && (
                                  <ToolOutput output={formatToolOutput(toolName, toolPart.output)} errorText={toolPart.errorText} />
                                )}
                              </ToolContent>
                            </Tool>
                          );
                        }
                        return null;
                    }
                  })}
                </MessageContent>
              </Message>
            ))
          )}
          {status === 'submitted' && <Loader />}
          {status === 'streaming' && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground px-4">
              <Loader />
              <span>Thinking...</span>
            </div>
          )}
        </ConversationContent>
      </Conversation>

      <Suggestions className="max-w-4xl mx-auto overflow-hidden bg-transparent">
        {suggestions.map(suggestion => (
          <Suggestion key={suggestion} onClick={handleSuggestionClick} suggestion={suggestion} />
        ))}
      </Suggestions>
      <PromptInput onSubmit={handleSubmit} className="mt-4 bg-transparent max-w-4xl mx-auto relative">
        <PromptInputBody>
          <PromptInputTextarea
            value={input}
            onChange={e => setInput(e.currentTarget.value)}
            placeholder="Ask me anything about your emails..."
            disabled={!selectedInbox || status === 'streaming'}
          />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputTools>
            <PromptInputActionMenu>
              <PromptInputActionMenuTrigger />
              <PromptInputActionMenuContent>
                <PromptInputActionAddAttachments />
              </PromptInputActionMenuContent>
            </PromptInputActionMenu>

            {/* <PromptInputModelSelect onValueChange={setModel} value={model}>
              <PromptInputModelSelectTrigger>
                <PromptInputModelSelectValue />
              </PromptInputModelSelectTrigger>
              <PromptInputModelSelectContent>
                {models.map((modelOption) => (
                  <PromptInputModelSelectItem
                    key={modelOption.id}
                    value={modelOption.id}
                  >
                    {modelOption.name}
                  </PromptInputModelSelectItem>
                ))}
              </PromptInputModelSelectContent>
            </PromptInputModelSelect> */}
          </PromptInputTools>
          <PromptInputSubmit disabled={!input.trim() || !selectedInbox} status={status} onClick={status === 'streaming' ? handleStop : undefined} />
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
}
