# Inbox Chat Feature

## Overview

The Inbox Chat feature allows users to interact with their connected Gmail inboxes using an AI-powered chatbot. The chatbot integrates with Composio's Gmail toolkit and provides custom tools for fetching user courses and matching emails with course context.

## Architecture

### Components

1. **Chat Page** (`/chat`)
   - Main route for the chat interface
   - Server-side authentication check
   - Renders the `InboxChat` component

2. **InboxChat Component** (`src/components/inbox-chat.tsx`)
   - Client-side chat interface
   - Inbox selector for multiple Gmail accounts
   - Message display with AI responses
   - Auto-scrolling conversation
   - Typing indicator

3. **AI Components** (`src/components/ai/`)
   - `message.tsx` - Message container with role-based styling
   - `conversation.tsx` - Auto-scrolling chat container
   - `response.tsx` - Markdown-enabled response renderer
   - `prompt-input.tsx` - Auto-resizing textarea with submit button

### API Route

**POST `/api/chat/route.ts`**

- Uses Vercel AI SDK's `streamText` with Google Gemini model
- Integrates Composio Gmail tools
- Includes custom course-related tools

### Tools Available

#### Gmail Tools (from Composio)

- `GMAIL_FETCH_EMAILS` - Fetch emails with advanced filtering
- `GMAIL_SEND_EMAIL` - Send new emails
- `GMAIL_REPLY_TO_THREAD` - Reply to existing threads
- `GMAIL_ADD_LABEL_TO_EMAIL` - Add labels to emails
- `GMAIL_CREATE_LABEL` - Create new labels
- `GMAIL_REMOVE_LABEL` - Remove labels
- `GMAIL_SEARCH` - Search emails

#### Custom Course Tools

- `getUserCourses` - Fetch all courses for the authenticated user
- `getCourseDetails` - Get detailed information about a specific course
- `matchEmailsWithCourse` - Analyze emails to determine course relevance

## Usage Examples

Users can ask questions like:

- "Show me my latest 10 unread emails"
- "Find emails related to my Machine Learning course"
- "What emails did I receive today from my professor?"
- "List all my courses"
- "Search for emails about assignments"

## Technical Details

### AI SDK Integration

The chat uses Vercel AI SDK v5 with the following pattern:

```tsx
const { messages, sendMessage, status, stop } = useChat({
  transport: new DefaultChatTransport({
    api: '/api/chat',
    body: { userId, connectionId },
  }),
});
```

### Message Structure

Messages use the new `parts` property for rendering:

```tsx
message.parts.map(part =>
  part.type === 'text' ? <Response>{part.text}</Response> : null
);
```

### Server-Side Implementation

```typescript
const result = streamText({
  model: google('gemini-2.0-flash-exp'),
  messages: convertToModelMessages(messages),
  tools: { ...gmailTools, ...courseTools },
  system: '...',
});

return result.toTextStreamResponse();
```

## Dependencies

- `@ai-sdk/react` - React hooks for AI chat
- `@ai-sdk/google` - Google Gemini integration
- `ai` - Core AI SDK utilities
- `@composio/core` & `@composio/vercel` - Gmail integration
- `react-markdown` - Markdown rendering
- `zod` - Schema validation for tools

## Environment Variables

Required:

- `COMPOSIO_API_KEY` - Composio API key for Gmail integration
- Supabase configuration (for courses database)

## Future Enhancements

1. Add support for email composition via chat
2. Implement email labeling and organization
3. Add attachment handling
4. Enable multi-inbox search
5. Add conversation history persistence
6. Implement suggested prompts based on context
7. Add email templates management
