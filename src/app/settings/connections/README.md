# Settings/Connections Page

## Overview

The Settings/Connections page (`/settings/connections`) allows users to manage their Gmail connections with Composio. Users can view all connected accounts, add new Gmail accounts, and remove existing connections.

## Features

### ✅ View Connected Accounts

- Display all Gmail accounts connected through Composio
- Show connection status (ACTIVE, INACTIVE, ERROR)
- Display email addresses and account details
- Show authorization status

### ✅ Add New Gmail Account

- Connect new Gmail accounts via Composio OAuth
- Real-time polling for connection status
- Toast notifications for success/error states
- Automatic account list refresh after connection

### ✅ Delete Connections

- Remove Gmail connections with confirmation dialog
- Safe deletion with error handling
- Immediate UI update after deletion
- Toast notifications for user feedback

### ✅ Handle Incomplete Authorizations

- Display accounts that need authorization completion
- Provide direct link to complete OAuth flow
- Visual indicators for authorization status

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── connections/
│   │       ├── route.ts              # List connections
│   │       ├── initiate/
│   │       │   └── route.ts          # Initiate new connection
│   │       └── delete/
│   │           └── route.ts          # Delete connection
│   └── settings/
│       ├── layout.tsx                # Settings layout
│       └── connections/
│           └── page.tsx              # Connections page
├── components/
│   ├── connections-page-content.tsx  # Main page component
│   ├── gmail-account-card.tsx        # Account display card
│   └── connect-gmail-dialog.tsx      # Connect dialog
├── hooks/
│   ├── use-connections.ts            # Connections hook
│   └── queries/
│       └── connections.ts            # Query functions
└── lib/
    └── services/
        └── composio/
            └── index.ts              # Composio service
```

## API Endpoints

### GET `/api/connections`

Fetches all connected Gmail accounts for the current user.

**Response:**

```json
{
  "success": true,
  "data": {
    "userId": "user123",
    "accounts": [
      {
        "id": "acc_123",
        "status": "ACTIVE",
        "toolkitSlug": "gmail",
        "email": "user@gmail.com",
        "name": "John Doe",
        "avatarUrl": "https://...",
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "count": 1
  }
}
```

### POST `/api/connections/initiate`

Initiates a new Gmail connection via Composio OAuth.

**Request Body:**

```json
{
  "courseId": "settings"
}
```

**Response:**

```json
{
  "redirectUrl": "https://composio.dev/auth/...",
  "connectionId": "conn_123"
}
```

### DELETE `/api/connections/delete`

Deletes an existing Gmail connection.

**Request Body:**

```json
{
  "connectionId": "acc_123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Connection deleted successfully"
}
```

## Components

### ConnectionsPageContent

Main page component that orchestrates the connections management.

**State Management:**

- `isDialogOpen` - Controls connect dialog visibility
- `isConnecting` - Loading state for connection initiation
- `deletingAccountId` - Tracks which account is being deleted
- `accountToDelete` - Account selected for deletion

**Key Functions:**

- `handleConnect()` - Initiates new Gmail connection
- `handleDeleteClick()` - Opens delete confirmation dialog
- `handleDeleteConfirm()` - Executes account deletion

### GmailAccountCard

Displays individual Gmail account information.

**Props:**

- `account` - ComposioConnectedAccount object
- `onAdd?` - Optional callback for adding to course (not used in settings)
- `isAdding?` - Loading state (not used in settings)
- `disabled?` - Disable interactions

**States Handled:**

- **Active with email** - Shows full account details
- **Inactive/No email** - Shows authorization required message

### ConnectGmailDialog

Dialog component for initiating new Gmail connections.

**Props:**

- `open` - Dialog visibility
- `onOpenChange` - Dialog state change callback
- `onConnect` - Connection initiation callback
- `triggerButton` - Custom trigger button component

## Usage Examples

### View Connections

```tsx
import { ConnectionsPageContent } from '@/components/connections-page-content';

export default function ConnectionsPage() {
  return <ConnectionsPageContent />;
}
```

### Use Connections Hook

```tsx
import { useConnections } from '@/hooks/use-connections';

function MyComponent() {
  const { data: accounts = [], isLoading, refetch } = useConnections();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {accounts.map(account => (
        <div key={account.id}>{account.email}</div>
      ))}
    </div>
  );
}
```

### Delete Connection

```tsx
const handleDelete = async (connectionId: string) => {
  try {
    const response = await fetch('/api/connections/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ connectionId }),
    });

    if (!response.ok) throw new Error('Failed to delete');

    toast.success('Connection deleted successfully');
    await refetch();
  } catch (error) {
    toast.error('Failed to delete connection');
  }
};
```

### Initiate Connection

```tsx
const handleConnect = async () => {
  try {
    const response = await fetch('/api/connections/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId: 'settings' }),
    });

    const data = await response.json();

    if (data.redirectUrl) {
      window.open(data.redirectUrl, '_blank');
      toast.success('Opening Gmail authorization...');
    }
  } catch (error) {
    toast.error('Failed to connect Gmail account');
  }
};
```

## User Flow

### Adding a Gmail Account

1. **User clicks "Connect new Gmail Account"** card
2. Dialog opens with authorization information
3. User clicks "Continue with Gmail"
4. API call to `/api/connections/initiate`
5. New tab opens with Composio OAuth flow
6. User authorizes Gmail access
7. Page polls for new connection (every 3 seconds)
8. Once detected, toast notification appears
9. Account list automatically updates
10. Polling stops after 5 minutes or successful connection

### Deleting a Connection

1. **User clicks trash icon** on account card
2. Confirmation dialog appears
3. User clicks "Delete Connection"
4. API call to `/api/connections/delete`
5. Loading state shown on button
6. On success, toast notification appears
7. Account list automatically updates
8. Deleted account removed from UI

### Completing Authorization

1. User sees "Authorization required" status
2. Clicks "Complete Authorization" button
3. New tab opens with Composio redirect URL
4. User completes OAuth authorization
5. Returns to settings page
6. Page automatically detects active connection
7. Account status updates to "ACTIVE"

## Polling Strategy

The page uses intelligent polling for new connections:

```tsx
// Start polling when connection initiated
const pollInterval = setInterval(async () => {
  const result = await refetch();
  const newAccounts = result.data || [];

  // Check if we have a new account
  if (newAccounts.length > accounts.length) {
    clearInterval(pollInterval);
    toast.success('Gmail account connected successfully!');
  }
}, 3000); // Poll every 3 seconds

// Stop polling after 5 minutes
setTimeout(() => clearInterval(pollInterval), 300000);
```

## Error Handling

### Connection Errors

- Network failures
- OAuth cancellation
- Composio API errors
- Invalid connection IDs

### Deletion Errors

- Account not found
- Network failures
- Permission errors

### Display Errors

- Loading failures
- Empty states
- Authorization pending

## Navigation

The page is accessible from:

- **Top Navigation** → User Menu → "Gmail Connections"
- **Direct URL** → `/settings/connections`

## Styling

The page uses the consistent app styling:

- Gradient background: `bg-gradient-to-bl from-pink-100 to-blue-200`
- Max width container: `max-w-7xl mx-auto`
- Responsive grid: `grid-cols-1 md:grid-cols-2 xl:grid-cols-3`
- Card-based layout with hover effects
- Toast notifications for user feedback

## Accessibility

- **Keyboard Navigation** - Full keyboard support
- **Screen Readers** - ARIA labels on all interactive elements
- **Focus Management** - Proper focus states
- **Loading States** - Clear loading indicators
- **Error Messages** - User-friendly error descriptions

## Testing

### Manual Testing Checklist

- [ ] Load page and see all connections
- [ ] Click "Connect new Gmail Account"
- [ ] Complete OAuth flow
- [ ] Verify new account appears
- [ ] Click delete on an account
- [ ] Confirm deletion
- [ ] Verify account removed
- [ ] Test with no connections (empty state)
- [ ] Test with incomplete authorization
- [ ] Test error scenarios

### Edge Cases

- No connections yet
- Multiple connections
- Failed authorization
- Network errors during delete
- Concurrent operations
- Page refresh during polling

## Future Enhancements

### Planned Features

- [ ] Account details page
- [ ] Connection health status
- [ ] Last sync time
- [ ] Email count per account
- [ ] Bulk operations
- [ ] Search/filter accounts
- [ ] Account nicknames
- [ ] Connection settings per account

### Improvements

- [ ] Optimistic UI updates
- [ ] Better error recovery
- [ ] Connection testing
- [ ] OAuth retry mechanism
- [ ] Account merging
- [ ] Export connection data

## Troubleshooting

### Connection Not Appearing

- Check OAuth completion
- Verify polling is active
- Check console for errors
- Refresh page manually

### Delete Not Working

- Verify connection ID
- Check network tab
- Ensure user permissions
- Try again after refresh

### Authorization Loop

- Clear browser cookies
- Try incognito mode
- Check Composio dashboard
- Contact support if persists

## Related Documentation

- [Composio Service Documentation](../../../lib/services/composio/README.md)
- [Composio Quick Reference](../../../lib/services/composio/QUICK_REFERENCE.md)
- [Gmail Account Card](../../../components/gmail-account-card.tsx)
- [Connect Gmail Dialog](../../../components/connect-gmail-dialog.tsx)

## Support

For issues or questions:

1. Check console for errors
2. Review Composio dashboard
3. Check API endpoint responses
4. Review this documentation
5. Contact development team
