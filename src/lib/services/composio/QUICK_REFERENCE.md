# ComposioService - Quick Reference Guide

## 🚀 Quick Start

```typescript
import { ComposioService } from '@/lib/services/composio';
```

## 📋 Common Operations

### Check Gmail Connection

```typescript
const connection = await ComposioService.getGmailConnectionByUserId('user123');

if (connection.isConnected) {
  console.log(`✅ Connected: ${connection.email}`);
  // Use connection.connectionId for operations
} else {
  console.log(`❌ Not connected. Status: ${connection.status}`);
  // Redirect to OAuth flow
}
```

### Fetch Unread Emails

```typescript
const response = await ComposioService.fetchEmails(connectionId, {
  max_results: 20,
  query: 'is:unread',
});

const emails = ComposioService.transformGmailMessages(
  response.data.messages
);
```

### Build Search Query

```typescript
const query = ComposioService.buildSearchQuery({
  from: 'student@university.edu',
  subject: 'assignment',
  isUnread: true,
  hasAttachment: true,
});
// Result: "from:student@university.edu subject:assignment is:unread has:attachment"
```

### Validate Connection Before Operations

```typescript
try {
  await ComposioService.validateConnection(userId);
  // Connection is valid, proceed
} catch (error) {
  // Handle connection error
  console.error('Connection invalid:', error.message);
}
```

## 🎯 Method Categories

### 🔌 Connection Management

| Method                         | Purpose                          |
| ------------------------------ | -------------------------------- |
| `getGmailConnectionByUserId()` | Check user's Gmail connection    |
| `getConnectedAccountById()`    | Get account details by ID        |
| `listConnectedAccounts()`      | List all user's connections      |
| `validateConnection()`         | Validate connection is active    |

### 🛠️ Tools Management

| Method                            | Purpose                              |
| --------------------------------- | ------------------------------------ |
| `getGmailTools()`                 | Get all Gmail tools for AI           |
| `getSendEmailTools()`             | Get send/reply tools                 |
| `getGmailFetchAndLabelsTools()`   | Get fetch & label management tools   |
| `getFetchEmailsTool()`            | Get fetch tool only                  |
| `getAddLabelTool()`               | Get label tool only                  |

### 📧 Email Operations

| Method                | Purpose                           |
| --------------------- | --------------------------------- |
| `fetchEmails()`       | Fetch emails with parameters      |
| `fetchEmailsWithAI()` | Fetch with AI-ready configuration |

### 🔄 Data Transformation

| Method                     | Purpose                         |
| -------------------------- | ------------------------------- |
| `transformGmailMessage()`  | Transform single message        |
| `transformGmailMessages()` | Transform multiple messages     |
| `buildSearchQuery()`       | Build Gmail search query        |

## 📝 Common Patterns

### Pattern 1: Fetch Course-Related Emails

```typescript
async function fetchCourseEmails(userId: string, courseName: string) {
  // 1. Validate connection
  await ComposioService.validateConnection(userId);

  // 2. Get connection
  const connection = await ComposioService.getGmailConnectionByUserId(userId);

  // 3. Build query
  const query = ComposioService.buildSearchQuery({
    subject: courseName,
    isUnread: true,
  });

  // 4. Fetch emails
  const response = await ComposioService.fetchEmails(connection.connectionId!, {
    max_results: 50,
    query,
  });

  // 5. Transform
  return ComposioService.transformGmailMessages(response.data.messages);
}
```

### Pattern 2: Paginated Email Fetching

```typescript
async function fetchAllEmails(connectionId: string, maxEmails: number) {
  const allEmails = [];
  let pageToken: string | null = null;

  do {
    const response = await ComposioService.fetchEmails(connectionId, {
      max_results: 100,
      page_token: pageToken,
    });

    const transformed = ComposioService.transformGmailMessages(
      response.data.messages
    );
    allEmails.push(...transformed);

    pageToken = response.data.nextPageToken;
  } while (pageToken && allEmails.length < maxEmails);

  return allEmails;
}
```

### Pattern 3: AI Email Analysis

```typescript
async function analyzeEmailsWithAI(userId: string, courseContext: string) {
  const aiConfig = await ComposioService.fetchEmailsWithAI(userId, {
    maxEmails: 20,
    courseContext,
  });

  // Use with AI SDK
  const result = await generateObject({
    model: google('gemini-2.0-flash-exp'),
    tools: aiConfig.tools,
    prompt: `Analyze emails for: ${courseContext}`,
    // ... rest of configuration
  });

  return result;
}
```

### Pattern 4: Safe Error Handling

```typescript
async function safeEmailOperation(userId: string) {
  try {
    await ComposioService.validateConnection(userId);

    const connection = await ComposioService.getGmailConnectionByUserId(userId);

    const emails = await ComposioService.fetchEmails(connection.connectionId!, {
      max_results: 10,
    });

    return {
      success: true,
      data: ComposioService.transformGmailMessages(emails.data.messages),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
```

## 🔍 Search Query Examples

```typescript
// Unread emails
const query = ComposioService.buildSearchQuery({
  isUnread: true,
});

// From specific sender
const query = ComposioService.buildSearchQuery({
  from: 'professor@university.edu',
});

// With attachments
const query = ComposioService.buildSearchQuery({
  hasAttachment: true,
});

// Date range
const query = ComposioService.buildSearchQuery({
  after: '2024/01/01',
  before: '2024/12/31',
});

// Complex query
const query = ComposioService.buildSearchQuery({
  from: 'student@university.edu',
  subject: 'assignment',
  isUnread: true,
  hasAttachment: true,
  after: '2024/01/01',
});
```

## ⚡ Key Parameters

### FetchEmailsParams

```typescript
{
  user_id?: string;              // Default: 'me'
  max_results?: number;          // Default: 1, Max: 500
  query?: string | null;         // Gmail search query
  label_ids?: string[];          // Filter by labels
  include_spam_trash?: boolean;  // Default: false
  page_token?: string | null;    // Pagination token
  include_payload?: boolean;     // Default: true
  ids_only?: boolean;            // Default: false
  verbose?: boolean;             // Default: true
}
```

### FetchEmailsWithAIOptions

```typescript
{
  maxEmails?: number;        // Default: 10
  includeRead?: boolean;     // Default: false
  searchQuery?: string;      // Custom query
  courseContext?: string;    // Course context for AI
}
```

## 🎨 Best Practices

### ✅ DO

```typescript
// Use type-safe query builder
const query = ComposioService.buildSearchQuery({ isUnread: true });

// Validate connections before operations
await ComposioService.validateConnection(userId);

// Transform data consistently
const emails = ComposioService.transformGmailMessages(messages);

// Handle pagination properly
let pageToken = response.data.nextPageToken;
```

### ❌ DON'T

```typescript
// Don't build queries manually
const query = `is:unread from:${email}`; // ❌

// Don't assume connection is active
const emails = await fetchEmails(id, params); // ❌ No validation

// Don't manually transform
const email = { id: msg.messageId, ... }; // ❌ Use transformer

// Don't ignore pagination
const emails = await fetchEmails(id, { max_results: 1000 }); // ❌ Too many
```

## 🐛 Error Handling

### Connection Errors

```typescript
try {
  await ComposioService.validateConnection(userId);
} catch (error) {
  if (error.message.includes('not active')) {
    // Redirect to OAuth
  }
}
```

### Fetch Errors

```typescript
try {
  const emails = await ComposioService.fetchEmails(connectionId, params);
} catch (error) {
  console.error('Fetch failed:', error);
  // Handle fetch error
}
```

## 📚 Type Definitions

```typescript
// Connection Status
type ConnectionStatus = 'ACTIVE' | 'NOT_CONNECTED' | 'ERROR' | 'INACTIVE';

// Connection Details
interface GmailConnectionDetails {
  isConnected: boolean;
  connectionId?: string;
  email?: string;
  status: ConnectionStatus;
}

// Transformed Email
interface TransformedEmail {
  id: string;
  threadId: string;
  from: string;
  to: string;
  subject: string;
  snippet: string;
  body: string;
  receivedAt: string;
  isUnread: boolean;
  labels: string[];
  attachments?: GmailAttachment[];
}
```

## 🔗 Related Resources

- [Full API Documentation](./README.md)
- [Refactoring Summary](../../../COMPOSIO_SERVICE_REFACTORING.md)
- [Composio Docs](https://docs.composio.dev/)
- [Gmail Search Syntax](https://support.google.com/mail/answer/7190)

## 💡 Tips

1. **Always validate** connections before operations
2. **Use query builder** instead of manual strings
3. **Transform data** consistently with built-in methods
4. **Handle pagination** for large email sets
5. **Catch errors** and provide user-friendly messages
6. **Use type safety** - let TypeScript guide you
7. **Check connection status** before every operation

---

**Need help?** Check the [Full Documentation](./README.md) for detailed examples and advanced usage.
