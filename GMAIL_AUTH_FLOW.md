# Gmail Authentication Flow

## Overview
This document explains how the Gmail authentication flow works in the EduAssist AI Email Agent application.

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     User clicks "Analyze Emails"                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              POST /api/inbox/analyze                            │
│              { courseId, userId }                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│         Check Gmail Connection (Composio)                       │
│         checkGmailConnection(userId)                            │
└─────────┬──────────────────────────────────┬────────────────────┘
          │                                  │
          │ Connected                        │ Not Connected
          ▼                                  ▼
┌──────────────────────┐      ┌────────────────────────────────────┐
│  Fetch & Analyze     │      │  Return 401 Error                  │
│  Emails              │      │  {                                 │
│                      │      │    success: false,                 │
│  ✅ Success          │      │    error: 'Gmail not connected',   │
│                      │      │    authRequired: true,             │
│  Return emails       │      │    connectionStatus: {...}         │
│                      │      │  }                                 │
└──────────────────────┘      └──────────┬─────────────────────────┘
                                         │
                                         ▼
                        ┌────────────────────────────────────────┐
                        │  Frontend Detects authRequired=true   │
                        │  - Set gmailAuthRequired state         │
                        │  - Call handleGmailAuth()              │
                        └──────────┬─────────────────────────────┘
                                   │
                                   ▼
                        ┌────────────────────────────────────────┐
                        │  POST /api/gmail-auth                  │
                        │  { userId }                            │
                        └──────────┬─────────────────────────────┘
                                   │
                                   ▼
                        ┌────────────────────────────────────────┐
                        │  Composio checks existing connection   │
                        └──────┬───────────────┬─────────────────┘
                               │               │
        Already Connected      │               │  Not Connected
                               ▼               ▼
                    ┌─────────────────┐  ┌──────────────────────┐
                    │ Return:         │  │ Initiate OAuth Flow  │
                    │ {               │  │ composio.initiate()  │
                    │  isConnected:   │  │                      │
                    │    true,        │  │ Return:              │
                    │  connectionId,  │  │ {                    │
                    │  email          │  │  isConnected: false, │
                    │ }               │  │  redirectUrl,        │
                    │                 │  │  connectionId        │
                    │ ✅ Retry emails │  │ }                    │
                    └─────────────────┘  └──────┬───────────────┘
                                                │
                                                ▼
                                    ┌───────────────────────────┐
                                    │  Display Auth Card        │
                                    │  with "Connect Gmail"     │
                                    │  button                   │
                                    └──────┬────────────────────┘
                                           │
                                           │ User clicks button
                                           ▼
                                    ┌───────────────────────────┐
                                    │  Open OAuth popup         │
                                    │  window.open(redirectUrl) │
                                    └──────┬────────────────────┘
                                           │
                                           ▼
                                    ┌───────────────────────────┐
                                    │  User authorizes Gmail    │
                                    │  in Google OAuth flow     │
                                    └──────┬────────────────────┘
                                           │
                                           ▼
                                    ┌───────────────────────────┐
                                    │  Composio saves           │
                                    │  connection               │
                                    └──────┬────────────────────┘
                                           │
                                           ▼
                                    ┌───────────────────────────┐
                                    │  Frontend polls           │
                                    │  GET /api/gmail-auth      │
                                    │  ?userId={userId}         │
                                    │  (every 3 seconds)        │
                                    └──────┬────────────────────┘
                                           │
                                           │ isConnected=true
                                           ▼
                                    ┌───────────────────────────┐
                                    │  Auto-retry               │
                                    │  handleCheckEmails()      │
                                    │                           │
                                    │  ✅ Now succeeds!         │
                                    └───────────────────────────┘
```

## Implementation Details

### 1. Frontend State Management

The course details page maintains several states:

```typescript
const [gmailAuthRequired, setGmailAuthRequired] = useState(false);
const [gmailAuthUrl, setGmailAuthUrl] = useState<string | null>(null);
const [authError, setAuthError] = useState<string | null>(null);
```

### 2. Error Detection

When the inbox analyze endpoint returns a 401 error:

```typescript
if (response.status === 401 && res.authRequired) {
  setGmailAuthRequired(true);
  setAuthError(res.error || 'Gmail connection required');
  await handleGmailAuth();
  return;
}
```

### 3. Auth Initiation

Request OAuth URL from backend:

```typescript
const handleGmailAuth = async () => {
  const response = await fetch('/api/gmail-auth', {
    method: 'POST',
    body: JSON.stringify({ userId: course.professorId }),
  });
  
  const data = await response.json();
  
  if (data.redirectUrl) {
    setGmailAuthUrl(data.redirectUrl);
  }
};
```

### 4. OAuth Popup

Open Google OAuth in popup window:

```typescript
const handleConnectGmail = () => {
  window.open(gmailAuthUrl, '_blank', 'width=600,height=700');
  
  // Poll for connection status every 3 seconds
  const pollInterval = setInterval(async () => {
    const response = await fetch(`/api/gmail-auth?userId=${userId}`);
    const data = await response.json();
    
    if (data.isConnected) {
      clearInterval(pollInterval);
      await handleCheckEmails(); // Auto-retry
    }
  }, 3000);
  
  // Stop polling after 2 minutes
  setTimeout(() => clearInterval(pollInterval), 120000);
};
```

### 5. UI Display

Show authentication card when required:

```typescript
{gmailAuthRequired && (
  <Card className="border-amber-200 bg-amber-50">
    <CardHeader>
      <CardTitle>Gmail Connection Required</CardTitle>
    </CardHeader>
    <CardContent>
      <Button onClick={handleConnectGmail} disabled={!gmailAuthUrl}>
        <Mail className="mr-2" />
        Connect Gmail Account
      </Button>
    </CardContent>
  </Card>
)}
```

## Backend Endpoints

### POST /api/inbox/analyze

**Request:**
```json
{
  "userId": "prof_123",
  "courseId": "1",
  "maxEmails": 10
}
```

**Response (Not Connected):**
```json
{
  "success": false,
  "error": "Gmail not connected",
  "authRequired": true,
  "connectionStatus": {
    "isConnected": false,
    "status": "NOT_CONNECTED"
  }
}
```
**Status:** 401 Unauthorized

**Response (Connected):**
```json
{
  "success": true,
  "data": {
    "emails": [...],
    "analysis": {...},
    "courseName": "CS 101"
  }
}
```
**Status:** 200 OK

---

### POST /api/gmail-auth

**Request:**
```json
{
  "userId": "prof_123"
}
```

**Response (Already Connected):**
```json
{
  "isConnected": true,
  "connectionId": "conn_xxx",
  "email": "professor@university.edu",
  "message": "Gmail account already connected"
}
```

**Response (Need Auth):**
```json
{
  "isConnected": false,
  "redirectUrl": "https://composio.dev/oauth/...",
  "connectionId": "conn_xxx",
  "message": "Please complete Gmail authentication"
}
```

---

### GET /api/gmail-auth?userId={userId}

**Response (Connected):**
```json
{
  "isConnected": true,
  "connectionId": "conn_xxx",
  "email": "professor@university.edu",
  "status": "ACTIVE"
}
```

**Response (Not Connected):**
```json
{
  "isConnected": false,
  "status": "NOT_CONNECTED"
}
```

## User Experience Flow

1. **Initial State**: User navigates to course details page
2. **Click Analyze**: User clicks "Analyze Emails" button
3. **Loading**: Loading spinner appears
4. **Auth Required**: If not connected, amber warning card appears
5. **Connect Button**: User clicks "Connect Gmail Account"
6. **OAuth Popup**: New window opens with Google OAuth
7. **Authorization**: User grants Gmail permissions
8. **Polling**: Frontend polls every 3 seconds for connection
9. **Auto-Retry**: Once connected, email analysis automatically retries
10. **Success**: Emails are analyzed and displayed

## Security Considerations

- ✅ OAuth 2.0 flow handled by Composio
- ✅ No credentials stored in frontend
- ✅ Connection status checked on every request
- ✅ Popup window isolates OAuth flow
- ✅ Polling timeout prevents infinite loops (2 minutes)

## Error Handling

### Network Errors
```typescript
catch (error) {
  console.error('Error checking emails:', error);
  setAuthError(error instanceof Error ? error.message : 'An error occurred');
}
```

### Auth Errors
```typescript
if (!data.redirectUrl) {
  setAuthError('Failed to initiate Gmail authentication');
}
```

### Timeout
```typescript
setTimeout(() => {
  clearInterval(pollInterval);
  // Polling stops after 2 minutes
}, 120000);
```

## Environment Variables

Required for Gmail authentication:

```env
COMPOSIO_API_KEY=your_composio_api_key
GMAIL_AUTH_CONFIG_ID=ac_xxxxx
```

## Testing

### Manual Testing Steps

1. **Test Not Connected**:
   - Clear Composio connections for test user
   - Click "Analyze Emails"
   - Verify amber card appears
   - Verify "Connect Gmail" button is enabled

2. **Test OAuth Flow**:
   - Click "Connect Gmail Account"
   - Verify popup opens with Google OAuth
   - Complete authorization
   - Verify auto-retry after connection

3. **Test Already Connected**:
   - With existing connection, click "Analyze Emails"
   - Verify emails are fetched without auth card

4. **Test Polling**:
   - Monitor network tab for GET /api/gmail-auth calls
   - Verify polling stops after connection or timeout

## Troubleshooting

### Auth Card Doesn't Appear
- Check browser console for errors
- Verify 401 response includes `authRequired: true`
- Check state updates in React DevTools

### Popup Blocked
- Inform user to allow popups for the site
- Provide fallback link: `<a href={gmailAuthUrl} target="_blank">`

### Polling Doesn't Stop
- Check clearInterval is called
- Verify timeout is set (120 seconds)
- Check for connection status response

### Auto-Retry Fails
- Verify `handleCheckEmails()` is called after connection
- Check if `gmailAuthRequired` state is reset
- Look for errors in email analysis

## Future Enhancements

- [ ] Add visual feedback during polling (e.g., "Checking connection...")
- [ ] Store connection status in localStorage to reduce checks
- [ ] Add manual refresh button if auto-retry fails
- [ ] Implement connection health check on page load
- [ ] Add reconnection flow for expired tokens
- [ ] Show connection status in user profile/settings
