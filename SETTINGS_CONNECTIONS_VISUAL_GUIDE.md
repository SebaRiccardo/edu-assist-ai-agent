# Settings/Connections Page - Visual Guide

## 🎨 Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                         TOP NAVIGATION                          │
│  Logo    Dashboard    Courses    [Search] [?] [🔔] [Avatar ▼]  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      Gmail Connections                          │
│  Manage your connected Gmail accounts. Connect new accounts     │
│  or remove existing ones.                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  🔴 Gmail Logo  │  │  🔴 Gmail Logo  │  │  🔴 Gmail Logo  │
│  Gmail Account  │  │  Gmail Account  │  │  Gmail Account  │
│  user@gmail.com │  │  prof@gmail.com │  │  admin@edu.com  │
│  ACTIVE ✓       │  │  ACTIVE ✓       │  │  ACTIVE ✓       │
│                 │  │                 │  │                 │
│ Use this email  │  │ Use this email  │  │ Use this email  │
│ account to      │  │ account to      │  │ account to      │
│ analyze course  │  │ analyze course  │  │ analyze course  │
│ emails.         │  │ emails.         │  │ emails.         │
│                 │  │                 │  │                 │
│    [🗑️ Delete]  │  │    [🗑️ Delete]  │  │    [🗑️ Delete]  │
└─────────────────┘  └─────────────────┘  └─────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                 Connect new Gmail Account                       │
│                      🔴 Gmail Logo                              │
│                                                                 │
│     Connect a new Gmail account to manage your emails          │
│     across multiple accounts.                                  │
│                                                                 │
│              [📧 Connect Account]                              │
└─────────────────────────────────────────────────────────────────┘
```

## 📱 Responsive Breakpoints

### Mobile (< 768px)
```
┌───────────────────┐
│   Account Card 1  │
├───────────────────┤
│   Account Card 2  │
├───────────────────┤
│   Account Card 3  │
├───────────────────┤
│  Connect New Card │
└───────────────────┘
```

### Tablet (768px - 1280px)
```
┌────────────┬────────────┐
│  Account 1 │  Account 2 │
├────────────┼────────────┤
│  Account 3 │ Connect New│
└────────────┴────────────┘
```

### Desktop (> 1280px)
```
┌─────────┬─────────┬─────────┐
│Account 1│Account 2│Account 3│
├─────────┴─────────┴─────────┤
│        Connect New          │
└─────────────────────────────┘
```

## 🎭 Component States

### Active Account Card
```
┌─────────────────────────────────┐
│ 🔴 Gmail Logo    ACTIVE ✓   [🗑️] │
│ Gmail Account                   │
│ user@gmail.com                  │
│                                 │
│ Use this email account to       │
│ analyze course emails.          │
└─────────────────────────────────┘
```

### Inactive Account Card (Needs Auth)
```
┌─────────────────────────────────┐
│ 🔴 Gmail Logo    INITIATED      │
│ Gmail Account                   │
│ Authorization required ⚠️       │
│                                 │
│ Complete the authorization to   │
│ activate this account.          │
│                                 │
│ [🔗 Complete Authorization]     │
└─────────────────────────────────┘
```

### Connect New Card
```
┌─────────────────────────────────┐
│        🔴 Gmail Logo            │
│   Connect new Gmail Account     │
│                                 │
│ Connect a new Gmail account to  │
│ manage your emails across       │
│ multiple accounts.              │
│                                 │
│    [📧 Connect Account]         │
└─────────────────────────────────┘
```

### Loading State
```
┌─────────────────────────────────┐
│ 🔴 Gmail Logo    ACTIVE ✓   [⏳] │
│ Gmail Account                   │
│ user@gmail.com                  │
│                                 │
│ Use this email account to       │
│ analyze course emails.          │
│                                 │
│      [⏳ Deleting...]           │
└─────────────────────────────────┘
```

## 💬 Dialogs

### Connect Gmail Dialog
```
┌───────────────────────────────────────┐
│  Connect Gmail Account            [×] │
├───────────────────────────────────────┤
│                                       │
│  You'll be redirected to Gmail to    │
│  authorize access to your account.   │
│                                       │
│  This allows EduAssist AI to:        │
│  • Read your emails                  │
│  • Organize by labels                │
│  • Send automated responses          │
│                                       │
│  Your email content is never stored. │
│                                       │
│     [Cancel]  [Continue with Gmail]  │
└───────────────────────────────────────┘
```

### Delete Confirmation Dialog
```
┌───────────────────────────────────────┐
│  Delete Gmail Connection?         [×] │
├───────────────────────────────────────┤
│                                       │
│  Are you sure you want to delete     │
│  the connection to user@gmail.com?   │
│                                       │
│  This action cannot be undone and    │
│  will remove access to this account. │
│                                       │
│     [Cancel]  [Delete Connection]    │
└───────────────────────────────────────┘
```

## 🎯 Interactive Elements

### Delete Button Hover
```
┌─────┐
│ 🗑️  │ → Hover → Red background
└─────┘            Cursor: pointer
```

### Connect Card Hover
```
┌─────────────────────┐
│  Connect New        │
│  ═══════════════    │ → Hover → Shadow increase
│  Border: Dashed     │            Scale: 1.02
└─────────────────────┘
```

### Account Card Hover
```
┌─────────────────────┐
│  Gmail Account      │
│  ───────────────    │ → Hover → Shadow effect
└─────────────────────┘            No scale
```

## 🎨 Color Scheme

### Status Badges
```
ACTIVE     → Green  (bg-green-100 text-green-700)
ERROR      → Red    (bg-red-100 text-red-700)
INACTIVE   → Gray   (bg-gray-100 text-gray-700)
INITIATED  → Yellow (bg-yellow-100 text-yellow-700)
```

### Buttons
```
Primary    → Blue gradient
Destructive→ Red gradient
Outline    → Border only
Ghost      → Transparent bg
```

### Cards
```
Default    → White with border
Connect New→ Blue tint (bg-blue-100)
            Dashed border (border-blue-500)
```

## 📊 Loading States

### Initial Page Load
```
┌─────────────────────────────────┐
│                                 │
│          [⏳ Spinner]           │
│                                 │
└─────────────────────────────────┘
```

### Connecting (in dialog)
```
[⏳ Connecting...]
```

### Deleting
```
[🗑️ → ⏳ Deleting...]
```

## 🔔 Toast Notifications

### Success Messages
```
┌─────────────────────────────────┐
│ ✅ Gmail account connected!     │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ ✅ Connection deleted            │
└─────────────────────────────────┘
```

### Error Messages
```
┌─────────────────────────────────┐
│ ❌ Failed to connect account    │
│    Please try again later.      │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ ❌ Failed to delete connection  │
│    Network error occurred.      │
└─────────────────────────────────┘
```

### Info Messages
```
┌─────────────────────────────────┐
│ ℹ️  Opening Gmail authorization │
│    Complete it in the new tab.  │
└─────────────────────────────────┘
```

## 🎬 Animation Flow

### Page Load
```
1. Fade in header (200ms)
   ↓
2. Slide in cards (300ms, staggered 100ms each)
   ↓
3. Ready for interaction
```

### Delete Action
```
1. Click delete button
   ↓
2. Dialog fade in (200ms)
   ↓
3. User confirms
   ↓
4. Dialog fade out (200ms)
   ↓
5. Card fade out (300ms)
   ↓
6. Grid reflow (200ms)
   ↓
7. Toast notification appears (200ms)
```

### Connect Action
```
1. Click connect card
   ↓
2. Dialog slide up (300ms)
   ↓
3. User clicks continue
   ↓
4. New tab opens
   ↓
5. Dialog closes (200ms)
   ↓
6. Polling starts (indicator in header)
   ↓
7. New card fade in when detected (400ms)
   ↓
8. Toast success notification (200ms)
```

## 📐 Dimensions

### Card Sizes
```
Min Width:  380px
Max Width:  380px
Height:     Auto (content-based)
Padding:    24px
Gap:        16px between cards
```

### Container
```
Max Width:  1280px (7xl)
Padding:    24px (6)
Margin:     Auto (centered)
```

### Grid Gaps
```
Row Gap:    16px (4)
Col Gap:    16px (4)
```

## 🎯 Click Targets

### Minimum Tap Targets (Mobile)
```
Delete Button:    44×44px
Connect Button:   Full card width
Card:            Entire card area
Avatar Menu:     44×44px
```

## 🔍 Empty State

### No Connections Yet
```
┌─────────────────────────────────────┐
│                                     │
│          📧 (large icon)            │
│                                     │
│    No Gmail accounts connected      │
│                                     │
│  Connect your first Gmail account   │
│  to get started with email          │
│  management.                        │
│                                     │
│   [📧 Connect Gmail Account]        │
│                                     │
└─────────────────────────────────────┘
```

## 🎨 Design Tokens

```css
/* Spacing */
--card-padding: 24px;
--card-gap: 16px;
--section-padding: 48px;

/* Border Radius */
--card-radius: 12px;
--button-radius: 8px;

/* Shadows */
--card-shadow: 0 1px 3px rgba(0,0,0,0.1);
--card-shadow-hover: 0 4px 12px rgba(0,0,0,0.15);

/* Transitions */
--transition-fast: 150ms;
--transition-base: 200ms;
--transition-slow: 300ms;
```

## 🎭 User Journey Map

```
Landing → Top Nav → User Avatar ▼ → Gmail Connections
                                         ↓
                              ┌──────────┴──────────┐
                              │                     │
                         View Accounts        Connect New
                              │                     │
                    ┌─────────┴────────┐           │
                    │                  │           │
              Active Account    Needs Auth         │
                    │                  │           │
                 Delete?    Complete Auth?    OAuth Flow
                    │                  │           │
                Confirm          Open Tab      Authorize
                    │                  │           │
                 Deleted          Activated    Connected
                    │                  │           │
                    └──────────────────┴───────────┘
                                       │
                              Toast Notification
                                       │
                              Updated Account List
```

## 📱 Accessibility Map

```
Keyboard Navigation:
Tab       → Next interactive element
Shift+Tab → Previous interactive element
Enter     → Activate button/link
Space     → Toggle checkbox/button
Esc       → Close dialog

Screen Reader Landmarks:
<header>  → "Site navigation"
<main>    → "Main content"
<section> → "Gmail connections"
<dialog>  → "Confirmation dialog"

ARIA Labels:
Button    → "Delete connection for [email]"
Card      → "Gmail account: [email], Status: [status]"
Dialog    → "Delete confirmation dialog"
```

This visual guide provides a complete reference for the page's appearance and behavior! 🎨
