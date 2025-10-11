# ComposioService - Gmail Integration Service

A comprehensive, well-organized service class for managing Gmail integration through Composio API. This service provides a clean interface for authentication, email fetching, tool management, and data transformation.

## 📋 Table of Contents

- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Usage Examples](#usage-examples)
- [Migration Guide](#migration-guide)
- [Best Practices](#best-practices)

## 🏗️ Architecture

### Design Principles

1. **Single Responsibility**: Each method has a clear, focused purpose
2. **DRY (Don't Repeat Yourself)**: Shared logic is centralized
3. **Type Safety**: Full TypeScript coverage with explicit interfaces
4. **Error Handling**: Comprehensive error catching with user-friendly messages
5. **Singleton Pattern**: Single Composio client instance across the application
6. **Backward Compatibility**: Legacy exports maintain existing integrations

### Class Structure

```
ComposioService
├── Connection Management
│   ├── getGmailConnectionByUserId()
│   ├── getConnectedAccountById()
│   ├── listConnectedAccounts()
│   └── validateConnection()
├── Tools Management
│   ├── getGmailTools()
│   ├── getSendEmailTools()
│   ├── getGmailFetchAndLabelsTools()
│   ├── getFetchEmailsTool()
│   └── getAddLabelTool()
├── Email Operations
│   ├── fetchEmails()
│   └── fetchEmailsWithAI()
└── Data Transformation
    ├── transformGmailMessage()
    ├── transformGmailMessages()
    └── buildSearchQuery()
```

## 🚀 Quick Start

### Prerequisites

```bash
# Environment variables required
COMPOSIO_API_KEY=your_composio_api_key
```

### Basic Usage

```typescript
import { ComposioService } from '@/lib/services/composio';

// 1. Check Gmail connection
const connection = await ComposioService.getGmailConnectionByUserId('user123');

if (!connection.isConnected) {
  // Handle authentication redirect
  console.log('User needs to connect Gmail');
  return;
}

// 2. Fetch emails
const emails = await ComposioService.fetchEmails(connection.connectionId!, {
  max_results: 10,
  query: 'is:unread',
});

// 3. Transform to application format
const transformedEmails = ComposioService.transformGmailMessages(
  emails.data.messages
);
```

## 📚 API Reference

### Connection Management

#### `getGmailConnectionByUserId(userId: string)`

Check if a user has an active Gmail connection.

**Parameters:**

- `userId` (string): The user ID to check

**Returns:** `Promise<GmailConnectionDetails>`

```typescript
interface GmailConnectionDetails {
  isConnected: boolean;
  connectionId?: string;
  email?: string;
  status: ConnectionStatus;
}
```

**Example:**

```typescript
const connection = await ComposioService.getGmailConnectionByUserId('user123');

if (connection.isConnected) {
  console.log(`Connected: ${connection.email}`);
  console.log(`Connection ID: ${connection.connectionId}`);
}
```

---

#### `getConnectedAccountById(accountId: string)`

Retrieve full details of a connected account.

**Parameters:**

- `accountId` (string): The connected account ID

**Returns:** `Promise<ConnectedAccount>`

**Example:**

```typescript
const account = await ComposioService.getConnectedAccountById('acc_123');
console.log(account.data.email);
```

---

#### `validateConnection(userId: string)`

Validate that a connection is active and ready to use. Throws an error if not.

**Parameters:**

- `userId` (string): The user ID to validate

**Throws:** `Error` if connection is not active

**Example:**

```typescript
try {
  await ComposioService.validateConnection('user123');
  // Connection is valid, proceed with operations
} catch (error) {
  console.error('Connection validation failed:', error.message);
}
```

---

### Tools Management

#### `getGmailTools(userId: string)`

Get all Gmail tools for AI agent integration.

**Parameters:**

- `userId` (string): The connected account ID

**Returns:** `Promise<GmailTools>`

**Example:**

```typescript
const tools = await ComposioService.getGmailTools('user123');
// Use with AI SDK
```

---

#### `getSendEmailTools(userId: string)`

Get tools specifically for sending and replying to emails.

**Parameters:**

- `userId` (string): The connected account ID

**Returns:** `Promise<SendEmailTools>`

**Example:**

```typescript
const sendTools = await ComposioService.getSendEmailTools('user123');
// Tools: GMAIL_SEND_EMAIL, GMAIL_REPLY_TO_THREAD
```

---

#### `getGmailFetchAndLabelsTools(userId: string)`

Get tools for fetching emails and managing labels.

**Parameters:**

- `userId` (string): The connected account ID

**Returns:** `Promise<FetchAndLabelTools>`

**Example:**

```typescript
const fetchTools = await ComposioService.getGmailFetchAndLabelsTools('user123');
// Tools: GMAIL_FETCH_EMAILS, GMAIL_ADD_LABEL, GMAIL_CREATE_LABEL
```

---

### Email Operations

#### `fetchEmails(connectedAccountId: string, params?: FetchEmailsParams)`

Fetch emails from Gmail with comprehensive parameter support.

**Parameters:**

- `connectedAccountId` (string): The connected account ID
- `params` (FetchEmailsParams): Optional fetch parameters

```typescript
interface FetchEmailsParams {
  user_id?: string; // Default: 'me'
  max_results?: number; // Default: 1, Max: 500
  query?: string | null; // Gmail search query
  label_ids?: string[]; // Filter by labels
  include_spam_trash?: boolean; // Default: false
  page_token?: string | null; // Pagination token
  include_payload?: boolean; // Default: true
  ids_only?: boolean; // Default: false
  verbose?: boolean; // Default: true
}
```

**Returns:** `Promise<GmailFetchEmailsResponse>`

**Example:**

```typescript
// Fetch unread emails from students
const emails = await ComposioService.fetchEmails('acc_123', {
  max_results: 20,
  query: 'is:unread from:*@university.edu',
  include_payload: true,
});

// Paginated fetching
let pageToken = null;
do {
  const response = await ComposioService.fetchEmails('acc_123', {
    max_results: 100,
    page_token: pageToken,
  });

  // Process emails...

  pageToken = response.data.nextPageToken;
} while (pageToken);
```

---

#### `fetchEmailsWithAI(userId: string, options?: FetchEmailsWithAIOptions)`

Fetch emails with AI-ready tools and configuration.

**Parameters:**

- `userId` (string): The connected account ID
- `options` (FetchEmailsWithAIOptions): Optional AI configuration

```typescript
interface FetchEmailsWithAIOptions {
  maxEmails?: number; // Default: 10
  includeRead?: boolean; // Default: false
  searchQuery?: string; // Custom search query
  courseContext?: string; // Course context for AI
}
```

**Returns:** `Promise<AIEmailConfig>`

**Example:**

```typescript
const aiConfig = await ComposioService.fetchEmailsWithAI('user123', {
  maxEmails: 50,
  includeRead: false,
  courseContext: 'Computer Science 101',
});

// Use with AI agent
const result = await generateObject({
  model: google('gemini-2.0-flash-exp'),
  tools: aiConfig.tools,
  // ... rest of AI configuration
});
```

---

### Data Transformation

#### `transformGmailMessage(message: GmailMessageBody)`

Transform a single Gmail message to application format.

**Parameters:**

- `message` (GmailMessageBody): Gmail message from Composio API

**Returns:** `TransformedEmail`

**Example:**

```typescript
const gmailMessage = emails.data.messages[0];
const transformed = ComposioService.transformGmailMessage(gmailMessage);

console.log(transformed.subject);
console.log(transformed.from);
console.log(transformed.isUnread);
```

---

#### `transformGmailMessages(messages: GmailMessageBody[])`

Transform multiple Gmail messages to application format.

**Parameters:**

- `messages` (GmailMessageBody[]): Array of Gmail messages

**Returns:** `TransformedEmail[]`

**Example:**

```typescript
const emails = await ComposioService.fetchEmails('acc_123', {
  max_results: 10,
});

const transformed = ComposioService.transformGmailMessages(
  emails.data.messages
);

transformed.forEach((email) => {
  console.log(`${email.from}: ${email.subject}`);
});
```

---

#### `buildSearchQuery(params: SearchQueryParams)`

Build a Gmail search query from parameters.

**Parameters:**

```typescript
interface SearchQueryParams {
  from?: string;
  to?: string;
  subject?: string;
  hasAttachment?: boolean;
  isUnread?: boolean;
  after?: string; // Format: YYYY/MM/DD
  before?: string; // Format: YYYY/MM/DD
  label?: string;
}
```

**Returns:** `string`

**Example:**

```typescript
// Build complex search query
const query = ComposioService.buildSearchQuery({
  from: 'student@university.edu',
  subject: 'assignment',
  isUnread: true,
  hasAttachment: true,
  after: '2024/01/01',
});

// Result: "from:student@university.edu subject:assignment is:unread has:attachment after:2024/01/01"

const emails = await ComposioService.fetchEmails('acc_123', {
  query,
  max_results: 50,
});
```

---

## 💡 Usage Examples

### Example 1: Course Email Analysis

```typescript
import { ComposioService } from '@/lib/services/composio';

async function analyzeCourseEmails(userId: string, courseName: string) {
  // 1. Validate connection
  await ComposioService.validateConnection(userId);

  // 2. Get connection details
  const connection = await ComposioService.getGmailConnectionByUserId(userId);

  // 3. Build search query for course-related emails
  const query = ComposioService.buildSearchQuery({
    subject: courseName,
    isUnread: true,
    after: '2024/01/01',
  });

  // 4. Fetch emails
  const response = await ComposioService.fetchEmails(connection.connectionId!, {
    max_results: 50,
    query,
  });

  // 5. Transform to application format
  const emails = ComposioService.transformGmailMessages(
    response.data.messages
  );

  // 6. Return analysis
  return {
    totalEmails: response.data.resultSizeEstimate,
    unreadCount: emails.filter((e) => e.isUnread).length,
    emails,
  };
}
```

### Example 2: AI-Powered Email Categorization

```typescript
import { ComposioService } from '@/lib/services/composio';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';

async function categorizeEmailsWithAI(
  userId: string,
  courseContext: string
) {
  // 1. Get AI-ready configuration
  const aiConfig = await ComposioService.fetchEmailsWithAI(userId, {
    maxEmails: 20,
    includeRead: false,
    courseContext,
  });

  // 2. Use AI to categorize
  const result = await generateObject({
    model: google('gemini-2.0-flash-exp'),
    tools: aiConfig.tools,
    prompt: `Analyze and categorize emails related to: ${courseContext}`,
    // ... schema and other config
  });

  return result;
}
```

### Example 3: Batch Email Processing

```typescript
import { ComposioService } from '@/lib/services/composio';

async function processBatchEmails(userId: string, maxEmails: number = 100) {
  const connection = await ComposioService.getGmailConnectionByUserId(userId);

  if (!connection.isConnected) {
    throw new Error('Gmail not connected');
  }

  const allEmails = [];
  let pageToken: string | null = null;
  let totalFetched = 0;

  do {
    const response = await ComposioService.fetchEmails(
      connection.connectionId!,
      {
        max_results: Math.min(100, maxEmails - totalFetched),
        page_token: pageToken,
        query: 'is:unread',
      }
    );

    const transformed = ComposioService.transformGmailMessages(
      response.data.messages
    );

    allEmails.push(...transformed);
    totalFetched += transformed.length;

    pageToken = response.data.nextPageToken;
  } while (pageToken && totalFetched < maxEmails);

  return allEmails;
}
```

### Example 4: Error Handling Pattern

```typescript
import { ComposioService } from '@/lib/services/composio';

async function safeEmailFetch(userId: string) {
  try {
    // Validate connection first
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
    console.error('Email fetch failed:', error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Unknown error occurred',
    };
  }
}
```

---

## 🔄 Migration Guide

### From Legacy Functions to ComposioService

The refactored service maintains backward compatibility, but it's recommended to migrate to the new class-based API:

#### Before (Legacy)

```typescript
import { getGmailTools, fetchEmails } from '@/lib/services/composio';

const tools = await getGmailTools(userId);
const emails = await fetchEmails(connectedAccountId, params);
```

#### After (Recommended)

```typescript
import { ComposioService } from '@/lib/services/composio';

const tools = await ComposioService.getGmailTools(userId);
const emails = await ComposioService.fetchEmails(connectedAccountId, params);
```

### Migration Benefits

1. **Better Organization**: All methods are namespaced under `ComposioService`
2. **Type Safety**: Improved TypeScript types and interfaces
3. **Error Handling**: Consistent error handling patterns
4. **Documentation**: Better IntelliSense and inline documentation
5. **Utility Methods**: Additional helper methods for common tasks

---

## ✅ Best Practices

### 1. Always Validate Connections

```typescript
// ❌ Bad: Don't assume connection is active
const emails = await ComposioService.fetchEmails(connectionId, params);

// ✅ Good: Validate first
await ComposioService.validateConnection(userId);
const connection = await ComposioService.getGmailConnectionByUserId(userId);
const emails = await ComposioService.fetchEmails(connection.connectionId!, params);
```

### 2. Use Type-Safe Query Building

```typescript
// ❌ Bad: Manual query string construction
const query = `from:${email} subject:${subject} is:unread`;

// ✅ Good: Use buildSearchQuery helper
const query = ComposioService.buildSearchQuery({
  from: email,
  subject: subject,
  isUnread: true,
});
```

### 3. Transform Data Consistently

```typescript
// ❌ Bad: Manual transformation
const emails = response.data.messages.map((msg) => ({
  id: msg.messageId,
  from: msg.sender,
  // ... manual mapping
}));

// ✅ Good: Use built-in transformer
const emails = ComposioService.transformGmailMessages(response.data.messages);
```

### 4. Handle Pagination Properly

```typescript
// ✅ Good: Proper pagination handling
let pageToken: string | null = null;
const allEmails = [];

do {
  const response = await ComposioService.fetchEmails(connectionId, {
    max_results: 100,
    page_token: pageToken,
  });

  allEmails.push(...response.data.messages);
  pageToken = response.data.nextPageToken;
} while (pageToken);
```

### 5. Use Appropriate Tool Methods

```typescript
// ✅ Good: Use specific tool methods for clarity
const sendTools = await ComposioService.getSendEmailTools(userId);
const fetchTools = await ComposioService.getFetchEmailsTool(userId);

// Instead of generic
const tools = await ComposioService.getGmailTools(userId);
```

---

## 🔍 Advanced Usage

### Custom Error Handling

```typescript
class EmailServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public userId?: string
  ) {
    super(message);
    this.name = 'EmailServiceError';
  }
}

async function robustEmailFetch(userId: string) {
  try {
    await ComposioService.validateConnection(userId);
    // ... rest of logic
  } catch (error) {
    throw new EmailServiceError(
      'Failed to fetch emails',
      'FETCH_ERROR',
      userId
    );
  }
}
```

### Connection Status Monitoring

```typescript
async function monitorConnection(userId: string) {
  const connection = await ComposioService.getGmailConnectionByUserId(userId);

  return {
    isHealthy: connection.isConnected && connection.status === 'ACTIVE',
    requiresAction: !connection.isConnected,
    details: connection,
  };
}
```

---

## 📝 Type Definitions

### Key Interfaces

```typescript
// Connection Status
type ConnectionStatus = 'ACTIVE' | 'NOT_CONNECTED' | 'ERROR' | 'INACTIVE';

// Gmail Connection Details
interface GmailConnectionDetails {
  isConnected: boolean;
  connectionId?: string;
  email?: string;
  status: ConnectionStatus;
}

// Fetch Email Parameters
interface FetchEmailsParams {
  user_id?: string;
  max_results?: number;
  query?: string | null;
  label_ids?: string[];
  include_spam_trash?: boolean;
  page_token?: string | null;
  include_payload?: boolean;
  ids_only?: boolean;
  verbose?: boolean;
}

// AI Options
interface FetchEmailsWithAIOptions {
  maxEmails?: number;
  includeRead?: boolean;
  searchQuery?: string;
  courseContext?: string;
}
```

---

## 🐛 Troubleshooting

### Common Issues

1. **"COMPOSIO_API_KEY is not set"**

   - Ensure `.env.local` has `COMPOSIO_API_KEY`
   - Restart Next.js dev server after adding env vars

2. **"Gmail connection not active"**

   - User needs to complete OAuth flow
   - Check connection status with `getGmailConnectionByUserId()`

3. **"No emails returned"**
   - Verify Gmail API scopes are properly configured
   - Check if query syntax is correct
   - Ensure `include_payload` is `true` for full email content

---

## 📚 Additional Resources

- [Composio Documentation](https://docs.composio.dev/)
- [Gmail API Search Syntax](https://support.google.com/mail/answer/7190)
- [Project Copilot Instructions](/.github/copilot-instructions.md)

---

## 🎯 Summary

The `ComposioService` class provides:

- ✅ Clean, organized Gmail integration
- ✅ Type-safe API with comprehensive documentation
- ✅ Singleton pattern for efficient resource usage
- ✅ Backward compatibility with legacy code
- ✅ Built-in error handling and validation
- ✅ Utility methods for common tasks
- ✅ AI-ready email fetching capabilities

Use this service as the single source of truth for all Gmail operations in your application.
