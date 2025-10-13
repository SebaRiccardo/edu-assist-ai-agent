# Course Details Page - Architecture Diagram

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Course Details Page                          │
│                 /dashboard/courses/[id]                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Data Fetching Layer                          │
├─────────────────────────────────────────────────────────────────┤
│  • useCourse(courseId)           → Course data                  │
│  • useConnections(false)         → Gmail accounts list          │
│  • useGmailConnection()          → OAuth flow management        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    State Management Layer                       │
├─────────────────────────────────────────────────────────────────┤
│  Account-Based State (Record/Map Pattern):                      │
│                                                                  │
│  emailsByAccount:        {                                      │
│    "acc_123": [email1, email2, ...],                           │
│    "acc_456": [email3, email4, ...]                            │
│  }                                                              │
│                                                                  │
│  statsByAccount:         {                                      │
│    "acc_123": { totalAnalyzed: 50, courseRelated: 25 },       │
│    "acc_456": { totalAnalyzed: 30, courseRelated: 15 }        │
│  }                                                              │
│                                                                  │
│  checkingAccounts:       Set(["acc_123"])                       │
│  replyingEmails:         Set(["email_789"])                     │
│  selectedAccountId:      "acc_123"                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    UI Components Layer                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
    ┌──────────────────────┐    ┌──────────────────────┐
    │ CourseDetailsHeader  │    │ ConnectionStatusCard │
    └──────────────────────┘    └──────────────────────┘
                              │
                              ▼
            ┌─────────────────────────────────┐
            │   Conditional Rendering:        │
            │                                  │
            │   No Connections?                │
            │   ├─ Yes → NoAccountsEmptyState │
            │   └─ No  → Tabs Component       │
            └─────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Tabs Component  │
                    └──────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
        ┌───────────────┐           ┌───────────────┐
        │   TabsList    │           │  TabsContent  │
        └───────────────┘           └───────────────┘
                │                           │
        ┌───────┴────────┐         ┌────────┴────────┐
        ▼                ▼         ▼                 ▼
   [TabTrigger]    [TabTrigger]  [EmailListStates] [EmailListStates]
   account@1.com   account@2.com  (Account 1 data)  (Account 2 data)
        │                              │
        └──────────┬───────────────────┘
                   ▼
           Selected Account Tab
```

## Component Hierarchy

```
CourseDetailsPage
│
├── CourseDetailsHeader
│   ├── Course name, description
│   └── (Analyze button removed - now per-tab)
│
├── ConnectionStatusCard
│   └── Shows Gmail OAuth status
│
└── Conditional Render
    │
    ├── [No Connections] → NoAccountsEmptyState
    │   ├── Connect Gmail button
    │   └── OAuth flow initiation
    │
    └── [Has Connections] → Tabs
        │
        ├── TabsList
        │   ├── TabsTrigger (Account 1)
        │   │   ├── Mail icon
        │   │   ├── Email address
        │   │   └── Status badge
        │   │
        │   └── TabsTrigger (Account 2)
        │       ├── Mail icon
        │       ├── Email address
        │       └── Status badge
        │
        └── TabsContent (per account)
            └── EmailListStates
                ├── AnalysisStatsBar
                ├── Analyze button
                │   └── onClick → handleAnalyzeInbox(accountId)
                │
                └── EmailCard[]
                    └── Auto-reply button
                        └── onClick → handleAutoReply(emailId, accountId)
```

## Handler Flow

### handleAnalyzeInbox(connectedAccountId)

```
User clicks "Analyze" on a specific tab
                │
                ▼
    handleAnalyzeInbox(connectedAccountId)
                │
                ├─ Add accountId to checkingAccounts Set
                │  (Shows loading state for this tab only)
                │
                ▼
    POST /api/check-emails
    {
      courseId: params.id,
      connectedAccountId: connectedAccountId
    }
                │
                ▼
    API fetches emails from Composio
    + Analyzes with Gemini AI
                │
                ▼
    Response: {
      emails: [...],
      analysis: { stats: {...} }
    }
                │
                ▼
    Update state:
    ├─ emailsByAccount[accountId] = emails
    ├─ statsByAccount[accountId] = stats
    └─ Remove accountId from checkingAccounts
                │
                ▼
    UI updates: Tab shows analyzed emails
```

### handleAutoReply(emailId, connectedAccountId)

```
User clicks "Reply" on an email
                │
                ▼
    handleAutoReply(emailId, connectedAccountId)
                │
                ├─ Add emailId to replyingEmails Set
                │  (Shows loading state on email card)
                │
                ▼
    Find email from: emailsByAccount[connectedAccountId]
                │
                ▼
    POST /api/generate-response
    {
      courseId: params.id,
      email: emailData,
      connectedAccountId: connectedAccountId
    }
                │
                ▼
    API generates response with Gemini
    + Sends via Composio Gmail
                │
                ▼
    Update email in emailsByAccount[accountId]
    └─ Mark as replied
                │
                ▼
    Remove emailId from replyingEmails
                │
                ▼
    UI updates: Email card shows "Replied" status
```

## State Transitions

### Page Load

```
1. Mount → Loading state
   │
   ▼
2. Fetch course data (useCourse)
   │
   ▼
3. Fetch connections (useConnections)
   │
   ▼
4. Set default tab (first active connection)
   │
   ▼
5. Render UI with empty email arrays
```

### Analyze Emails

```
Initial State:
├─ emailsByAccount: {}
├─ checkingAccounts: Set([])
└─ statsByAccount: {}

User clicks "Analyze" on Tab 1 (acc_123):
├─ emailsByAccount: {}
├─ checkingAccounts: Set(["acc_123"]) ← Loading
└─ statsByAccount: {}

API responds:
├─ emailsByAccount: { "acc_123": [email1, email2] }
├─ checkingAccounts: Set([]) ← Loading complete
└─ statsByAccount: { "acc_123": { totalAnalyzed: 2, courseRelated: 1 } }
```

### Switch Tabs

```
Current Tab: acc_123 (has data)
Switch to: acc_456 (no data yet)

State remains:
├─ emailsByAccount: { "acc_123": [email1, email2] }
├─ checkingAccounts: Set([])
└─ statsByAccount: { "acc_123": {...} }

Tab 2 shows: Empty state (no emails)
Tab 1 cached: Still has [email1, email2]

No refetching needed - data persists!
```

## Key Differences from Previous Architecture

### Before (Inbox-based)

```
Single Inbox Flow:
User → Select Inbox → Fetch Emails → Display
       └─ Inbox lost on tab switch
       └─ Must refetch when returning
```

### After (Account-based with Tabs)

```
Multi-Account Flow:
User → All Accounts in Tabs → Fetch per Account → Cache in State
       └─ Data persists across tab switches
       └─ No refetching needed
       └─ Independent operations per account
```

## Benefits Visualization

```
┌─────────────────────────────────────────────────────────────┐
│               BEFORE (Inbox-based)                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Select Inbox ▼]  →  Fetch  →  Display                    │
│                          ↓                                   │
│                    Switch Inbox                             │
│                          ↓                                   │
│                    Fetch Again  ❌                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│               AFTER (Tab-based)                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Tab1] [Tab2] [Tab3]                                       │
│    ↓      ↓      ↓                                          │
│  Cache  Cache  Cache  ✅                                    │
│    ↓      ↓      ↓                                          │
│  No refetch on switch!                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Performance Comparison

| Metric                    | Before (Inbox) | After (Tabs) |
|---------------------------|----------------|--------------|
| Switch time               | ~2-3s          | Instant ✅   |
| API calls per switch      | 1 API call     | 0 (cached)   |
| Memory usage              | Low            | Medium       |
| User experience           | Loading wait   | Seamless     |
| Multi-account support     | Limited        | Native ✅    |
| State complexity          | Low            | Medium       |
| Scalability               | Poor           | Excellent ✅ |

## Error Handling

```
┌─────────────────────────────────────────────────────────────┐
│                   Error Scenarios                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. No Gmail Connections                                    │
│     └→ Show NoAccountsEmptyState                           │
│        └→ Prompt to connect Gmail                          │
│                                                              │
│  2. All Connections Inactive                                │
│     └→ Filter to activeConnections = []                    │
│        └→ Show NoAccountsEmptyState                        │
│                                                              │
│  3. API Error During Analysis                               │
│     └→ Remove from checkingAccounts                        │
│        └→ Show error toast                                 │
│        └→ Don't update emailsByAccount                     │
│                                                              │
│  4. Network Error                                           │
│     └→ Graceful failure                                    │
│        └→ Keep existing cached data                        │
│        └→ Allow retry                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```
