# Email Auto-Reply Workflow

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Email Card Component                        │
│                  User clicks "Auto Reply"                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Course Details Page Handler                        │
│              handleAutoReply(emailId)                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              POST /api/email/reply                              │
│              { userId, email, priority, courseName }            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                  ┌──────────┴──────────┐
                  │                     │
                  ▼                     ▼
     ┌────────────────────┐  ┌────────────────────┐
     │ Check Gmail        │  │ Validate Request   │
     │ Connection         │  │ Parameters         │
     └─────────┬──────────┘  └────────┬───────────┘
               │                      │
               └──────────┬───────────┘
                          ▼
              ┌────────────────────────┐
              │ AGENT 1:               │
              │ Generate Response      │
              │ (generate-responses.ts)│
              └─────────┬──────────────┘
                        │
                        ▼
              ┌────────────────────────┐
              │ Draft Response Created │
              │ - Professional tone    │
              │ - Context-aware        │
              │ - Multi-language       │
              └─────────┬──────────────┘
                        │
                        ▼
              ┌────────────────────────┐
              │ AGENT 2:               │
              │ Send Email             │
              │ (send-email.ts)        │
              └─────────┬──────────────┘
                        │
                        ▼
              ┌────────────────────────┐
              │ Execute Gmail Tool     │
              │ - Send via Composio    │
              │ - Reply to original    │
              │ - Return messageId     │
              └─────────┬──────────────┘
                        │
                        ▼
              ┌────────────────────────┐
              │ Return Result          │
              │ { success, draft,      │
              │   sent: { messageId }} │
              └─────────┬──────────────┘
                        │
                        ▼
              ┌────────────────────────┐
              │ Show Success Alert     │
              │ "Email sent!"          │
              └────────────────────────┘
```

## File Structure

```
src/
├── agents/
│   ├── generate-responses.ts    # ✅ Agent 1: Draft generator
│   ├── send-email.ts            # ✅ Agent 2: Email sender (NEW)
│   ├── analyze-inbox.ts
│   ├── classify-priorities.ts
│   └── review-quality.ts
│
├── app/
│   └── api/
│       └── email/
│           └── reply/
│               └── route.ts     # ✅ Workflow endpoint (NEW)
│
├── components/
│   ├── email-card.tsx           # ✅ Auto Reply button
│   └── email-list-states.tsx    # ✅ Passes callback
│
└── app/dashboard/courses/[id]/
    └── page.tsx                 # ✅ handleAutoReply handler
```

## Implementation Details

### 1. Send Email Agent (`/src/agents/send-email.ts`)

**Functions:**
- `sendEmail()` - Send single email via Composio Gmail
- `sendBatchEmails()` - Send multiple emails
- `getSendStats()` - Get sending statistics

**Features:**
- Uses Composio's `GMAIL_SEND_EMAIL` tool
- AI-powered execution with Google Gemini
- Supports CC, BCC, reply-to threading
- Extracts message ID from response
- Error handling and logging

### 2. API Route (`/src/app/api/email/reply/route.ts`)

**Workflow Steps:**
1. Validate request parameters
2. Check Gmail connection
3. Generate draft with `generateEmailResponse()`
4. Send email with `sendEmail()`
5. Return combined result

**Request Body:**
```typescript
{
  userId: string;
  email: {
    id: string;
    from: string;
    subject: string;
    body: string;
    category?: string;
    reasoning?: string;
  };
  priority: {
    priority: 'critical' | 'high' | 'medium' | 'low';
    responseDeadline: string;
    reasoning: string;
  };
  courseName: string;
  professorName?: string;
  language?: string; // Default: 'English'
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    draft: {
      emailId: string;
      draftResponse: string;
      generatedAt: string;
    };
    sent: {
      success: true;
      messageId: string;
      sentAt: string;
    };
  };
}
```

### 3. Email Card Component (`/src/components/email-card.tsx`)

**Added:**
- "Auto Reply" button with Mail icon
- Blue styling for primary action
- Calls `onAutoReply(email.id)` on click

**UI:**
```tsx
<Button
  variant="default"
  size="sm"
  onClick={() => onAutoReply(email.id)}
  className="bg-blue-600 hover:bg-blue-700"
>
  <Mail className="h-4 w-4 mr-1" />
  Auto Reply
</Button>
```

### 4. Email List States (`/src/components/email-list-states.tsx`)

**Added:**
- `onAutoReply` prop
- Passes callback to each EmailCard

### 5. Course Details Page (`/src/app/dashboard/courses/[id]/page.tsx`)

**Added Function:**
```typescript
const handleAutoReply = async (emailId: string) => {
  // Find email by ID
  // Call /api/email/reply endpoint
  // Show success/error alert
};
```

**Default Values:**
- Priority: 'medium'
- Deadline: 'Within 24 hours'
- Language: 'English'

## Usage Flow

1. **User Action**: Professor clicks "Auto Reply" on email card
2. **Find Email**: Handler finds email data by ID
3. **API Call**: POST to `/api/email/reply` with email + context
4. **Generate Draft**: AI creates professional response
5. **Send Email**: Composio sends via Gmail
6. **Confirmation**: Success alert shown to user

## Features

✅ **Two-Agent Workflow**: Draft generation → Email sending
✅ **Full Gmail Integration**: Via Composio toolkit
✅ **Context-Aware**: Uses course info for better responses
✅ **Multi-Language**: Support for any language
✅ **Error Handling**: Graceful failures with error messages
✅ **Reply Threading**: Maintains email conversation threads
✅ **Professional Tone**: Academic-appropriate responses

## Testing

### Manual Test Steps

1. Navigate to course details page
2. Click "Analyze Inbox" to load emails
3. Find an email card
4. Click "Auto Reply" button
5. Check browser console for workflow logs
6. Verify success alert
7. Check Gmail sent folder for sent email

### Expected Logs
```
🤖 Starting auto-reply workflow for: Question about Assignment 3
📝 Generating response for: "Question about Assignment 3"
   Priority: medium
   Deadline: Within 24 hours
   ✅ Draft generated (450 chars)
📧 Sending email to: student@university.edu
   Subject: Re: Question about Assignment 3
   ✅ Email sent successfully
```

## Error Handling

### Gmail Not Connected
```json
{
  "success": false,
  "error": "Gmail not connected",
  "authRequired": true
}
```
→ Returns 401, triggers auth flow

### Failed to Generate Draft
- Catches AI generation errors
- Returns 500 with error details

### Failed to Send Email
- Returns draft even if send fails
- User can copy draft manually
- Error message includes details

## Security

- ✅ Validates all request parameters
- ✅ Checks Gmail connection before processing
- ✅ Uses authenticated Composio connection
- ✅ No credentials in frontend code
- ✅ Error messages don't leak sensitive info

## Future Enhancements

- [ ] Draft preview before sending
- [ ] Save drafts without sending
- [ ] Batch auto-reply for multiple emails
- [ ] Custom reply templates
- [ ] Schedule send time
- [ ] Add attachments
- [ ] Track sent emails
- [ ] Reply analytics
