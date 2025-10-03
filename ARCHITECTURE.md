# System Architecture

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         User (Professor)                     │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ Interacts with
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Main Page (page.tsx)                    │   │
│  │  - Course Selection UI                               │   │
│  │  - Email Results Display                             │   │
│  │  - Statistics Dashboard                              │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │          Components (EmailCard, UI)                  │   │
│  │  - Email Cards with Actions                          │   │
│  │  - shadcn/ui Components                              │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ API Request (POST)
                  ▼
┌─────────────────────────────────────────────────────────────┐
│               API Route (/api/check-emails)                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │             Email Analysis Logic                     │   │
│  │  1. Fetch unread emails                              │   │
│  │  2. Get course context                               │   │
│  │  3. Analyze each email with AI                       │   │
│  │  4. Categorize & score                               │   │
│  │  5. Return results                                   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────┬───────────────────────────────┬─────────────────────┬─┘
      │                               │                     │
      │ AI Analysis                   │ Email Data          │ Course Data
      ▼                               ▼                     ▼
┌─────────────┐            ┌──────────────────┐   ┌─────────────────┐
│   Gemini    │            │   Composio       │   │   Mock Data     │
│  2.5 Flash  │            │   (Gmail API)    │   │   (Future DB)   │
│             │            │                  │   │                 │
│ - Analyzes  │            │ - Fetches emails │   │ - Courses       │
│   content   │            │ - Adds labels    │   │ - Professors    │
│ - Categorizes│           │ - Manages Gmail  │   │                 │
│ - Scores    │            │                  │   │                 │
└─────────────┘            └──────────────────┘   └─────────────────┘
```

## 🔄 Data Flow

### Email Checking Flow

```
1. User Action
   └─> Select Course (e.g., "Algebra I")
       └─> Click "Check Emails" button

2. Frontend Request
   └─> POST /api/check-emails
       Body: { courseId: "course-1", userId: "prof-123" }

3. API Processing
   ├─> Get course details from mock data
   ├─> Fetch unread emails (mock/real)
   └─> For each email:
       ├─> Create AI prompt with course context
       ├─> Call Gemini 2.5 Flash
       ├─> Receive analysis result
       │   ├─> isRelated: boolean
       │   ├─> emailType: enum
       │   ├─> confidence: 0-1
       │   └─> reasoning: string
       └─> If related, add to results

4. Response
   └─> Return categorized emails + statistics

5. UI Update
   ├─> Display statistics cards
   ├─> Render email cards
   └─> Enable actions menu
```

## 📦 Component Hierarchy

```
App Layout (layout.tsx)
│
└─> Page (page.tsx)
    ├─> Header Section
    │   ├─> Title: "EduAssist AI Email Agent"
    │   └─> Subtitle: Welcome message
    │
    ├─> Course Selection Card
    │   ├─> Card Header
    │   ├─> Course Grid
    │   │   ├─> Course Button 1 (Algebra I)
    │   │   ├─> Course Button 2 (Calculus II)
    │   │   └─> Course Button 3 (Linear Algebra)
    │   └─> Check Emails Button
    │
    ├─> Statistics Section (conditional)
    │   ├─> Total Analyzed Card
    │   │   ├─> Count
    │   │   └─> Mail Icon
    │   └─> Course Related Card
    │       ├─> Count
    │       └─> Book Icon
    │
    ├─> Email Results Section (conditional)
    │   ├─> Results Header
    │   └─> Email Grid
    │       └─> EmailCard (repeated)
    │           ├─> Card Header
    │           │   ├─> Mail Icon
    │           │   ├─> Subject
    │           │   ├─> "New" Badge
    │           │   └─> DropdownMenu
    │           │       ├─> Mark as read
    │           │       ├─> Open in Gmail
    │           │       ├─> Archive
    │           │       └─> Delete
    │           ├─> Card Content
    │           │   ├─> Sender info
    │           │   ├─> Snippet
    │           │   ├─> Labels Section
    │           │   │   ├─> Course Badge
    │           │   │   ├─> Type Badge
    │           │   │   └─> Confidence Badge
    │           │   └─> Timestamp
    │           └─> Card Footer
    │
    └─> Empty State (conditional)
        ├─> Mail Icon
        ├─> Title
        └─> Description
```

## 🗄️ Data Model

### TypeScript Interfaces

```typescript
Course
├─> id: string
├─> name: string
├─> professorId: string
├─> context: string
└─> createdAt: Date

Professor
├─> id: string
├─> name: string
└─> email: string

CategorizedEmail
├─> id: string
├─> from: string
├─> subject: string
├─> snippet: string
├─> body: string
├─> receivedAt: string
├─> isUnread: boolean
├─> courseId: string
├─> courseName: string
├─> emailType: 'student_question' | 'professor_inquiry' | 'general' | 'administrative'
├─> confidence: number
└─> labels: string[]

EmailAnalysisResult
├─> isRelated: boolean
├─> courseId: string
├─> courseName: string
├─> emailType: enum
├─> confidence: number
└─> reasoning: string
```

## 🔌 API Integration Points

```
┌─────────────────────────────────────┐
│      Application Backend            │
│                                     │
│  ┌───────────────────────────────┐ │
│  │   Email Analysis Agent        │ │
│  │                               │ │
│  │  Uses:                        │ │
│  │  - Vercel AI SDK              │ │
│  │  - generateObject()           │ │
│  │  - Structured output          │ │
│  └───────────────────────────────┘ │
│                                     │
└──────┬──────────────────┬───────────┘
       │                  │
       │                  │
       ▼                  ▼
┌──────────────┐   ┌─────────────────┐
│ Google AI    │   │   Composio      │
│ (Gemini)     │   │   Platform      │
│              │   │                 │
│ - Model:     │   │ - Gmail Toolkit │
│   gemini-    │   │ - OAuth Handler │
│   2.5-flash  │   │ - Email Fetcher │
│              │   │ - Label Manager │
└──────────────┘   └─────────────────┘
```

## 🎯 AI Analysis Pipeline

```
Input Email
│
├─> Subject: "Question about Algebra I homework"
├─> From: "john.student@university.edu"
└─> Content: "I have a question about problem 3..."

                    ↓

Course Context Injection
│
└─> Course: "Algebra I"
    └─> Context: "Introduction to algebraic concepts including
                  linear equations, polynomials, factoring..."

                    ↓

AI Prompt Construction
│
├─> System Instructions
├─> Course Context
├─> Email Details
└─> Analysis Requirements

                    ↓

Gemini 2.5 Flash Processing
│
├─> Natural Language Understanding
├─> Context Matching
├─> Pattern Recognition
└─> Confidence Calculation

                    ↓

Structured Output (Zod Schema)
│
├─> isRelated: true
├─> emailType: "student_question"
├─> confidence: 0.95
└─> reasoning: "Email from student asking about
                specific algebra homework problem"

                    ↓

Result Processing
│
└─> Add to categorized emails list
    └─> Apply labels: ["Algebra I", "student_question"]
```

## 🔐 Security Architecture

```
┌─────────────────────────────────────┐
│         Environment Variables        │
│  (Stored in .env.local)             │
│                                     │
│  - GOOGLE_GENERATIVE_AI_API_KEY    │
│  - COMPOSIO_API_KEY                │
└─────────────────────────────────────┘
                  │
                  │ Accessed only by
                  ▼
┌─────────────────────────────────────┐
│        Server-Side Code             │
│  (API Routes)                       │
│                                     │
│  - Never exposed to client          │
│  - Secure API calls                 │
└─────────────────────────────────────┘
                  │
                  │ OAuth 2.0 (Future)
                  ▼
┌─────────────────────────────────────┐
│        External Services            │
│                                     │
│  - Google AI (Gemini)               │
│  - Composio (Gmail)                 │
└─────────────────────────────────────┘
```

## 📊 State Management

```
Client State (React useState)
│
├─> selectedCourseId: string
├─> emails: CategorizedEmail[]
├─> isLoading: boolean
├─> error: string | null
└─> stats: {
    ├─> totalAnalyzed: number
    └─> totalCategorized: number
}

Server State (API Route)
│
├─> Course data (mock/database)
├─> Professor data (mock/auth)
└─> Email data (Composio/Gmail)
```

## 🚀 Deployment Architecture (Future)

```
┌─────────────────────────────────────┐
│          Vercel Platform            │
│                                     │
│  ┌───────────────────────────────┐ │
│  │   Next.js Application         │ │
│  │   - Static Pages              │ │
│  │   - API Routes (Serverless)   │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │   Environment Variables       │ │
│  │   - API Keys (Encrypted)      │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
             │
             │ Connects to
             ▼
┌─────────────────────────────────────┐
│       External Services             │
│                                     │
│  ┌─────────────┐  ┌──────────────┐ │
│  │  Supabase   │  │  Composio    │ │
│  │  (Database) │  │  (Gmail)     │ │
│  └─────────────┘  └──────────────┘ │
│                                     │
│  ┌─────────────┐                   │
│  │  Google AI  │                   │
│  │  (Gemini)   │                   │
│  └─────────────┘                   │
└─────────────────────────────────────┘
```

## 📱 Client-Server Communication

```
Browser (Client)
│
├─> React Components
│   └─> Event Handlers
│       └─> fetch('/api/check-emails', {...})
│
│           ↓ HTTP POST
│
Server (Next.js API)
│
├─> Route Handler (route.ts)
│   ├─> Validate request
│   ├─> Process with AI
│   └─> Return JSON response
│
│           ↓ HTTP Response
│
Browser (Client)
│
└─> Update UI State
    ├─> Display emails
    ├─> Show statistics
    └─> Handle errors
```

## 🔄 Future Architecture (with Real Data)

```
┌─────────────────────────────────────┐
│            Frontend                 │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│         Supabase Auth               │
│  - Professor login                  │
│  - Session management               │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│         API Routes                  │
│  - /api/check-emails                │
│  - /api/courses (CRUD)              │
│  - /api/gmail/connect               │
└─────┬──────────────┬────────────────┘
      │              │
      ▼              ▼
┌──────────┐  ┌────────────────┐
│ Supabase │  │   Composio     │
│ Database │  │   Gmail API    │
│          │  │                │
│ - Courses│  │ - Real emails  │
│ - Profs  │  │ - Labels       │
│ - Logs   │  │ - Actions      │
└──────────┘  └────────────────┘
```

This architecture provides a scalable, maintainable foundation for the EduAssist AI Email Agent!
