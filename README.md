# EduAssist AI Email Agent

An intelligent AI-powered email management system for university professors to automatically categorize and organize student emails by course.

## Features

- 🤖 **AI-Powered Email Analysis**: Uses Google's Gemini 2.5 Flash to intelligently analyze email content
- 📧 **Gmail Integration**: Connects to Gmail via Composio for seamless email access
- 🏷️ **Smart Categorization**: Automatically labels emails by course and type (student question, professor inquiry, etc.)
- 📊 **Course Context**: Uses professor-defined course descriptions for accurate categorization
- 🎯 **Confidence Scoring**: Provides confidence levels for each categorization
- 💳 **Beautiful UI**: Modern, responsive interface built with shadcn/ui components

## Email Types Detected

- **Student Question** 🎓: Questions about course material, assignments, or grades
- **Professor Inquiry** 👨‍🏫: Emails from academic colleagues about the course
- **Administrative** 📋: Course logistics, schedules, and administrative updates
- **General** 📧: Other course-related communications

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **AI/ML**: 
  - Vercel AI SDK
  - Google Gemini 2.5 Flash (via @ai-sdk/google)
  - Composio for Gmail integration
- **UI**: 
  - React 19
  - Tailwind CSS
  - shadcn/ui components
  - Lucide React icons
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- Google AI API key (get from [Google AI Studio](https://ai.google.dev/))
- Composio API key (get from [Composio Dashboard](https://app.composio.dev))

### Installation

1. Install dependencies:
```bash
npm install --legacy-peer-deps
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your API keys:
```env
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key_here
COMPOSIO_API_KEY=your_composio_api_key_here
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## How It Works

### 1. Course Selection
Professors select one of their courses from the dashboard. Each course has a context/description that helps the AI understand what topics are relevant.

### 2. Email Analysis
When checking emails, the system:
- Fetches unread emails from Gmail
- Analyzes each email's subject and content
- Compares against the selected course context
- Determines if the email is course-related
- Categorizes the email type
- Assigns confidence scores

### 3. Intelligent Categorization
The AI agent considers:
- Course-specific keywords
- Email sender information (.edu domains, etc.)
- Question patterns indicating student queries
- Context clues from course descriptions
- Administrative language patterns

### 4. Email Management
For categorized emails, professors can:
- View all course-related emails in one place
- See confidence scores for each categorization
- Mark emails as read
- Archive emails
- Delete emails
- Open emails directly in Gmail

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── check-emails/
│   │       └── route.ts          # API endpoint for email analysis
│   ├── page.tsx                   # Main UI page
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── email-card.tsx             # Email display component
│   └── ui/                        # shadcn/ui components
│       ├── card.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       └── dropdown-menu.tsx
├── lib/
│   ├── mock-data.ts               # Mock courses and professor data
│   └── utils.ts                   # Utility functions
└── types/
    └── index.ts                   # TypeScript type definitions
```

## Mock Data

Currently, the application uses mock data for:
- Professor authentication (Dr. Sarah Johnson)
- Course data (Algebra I, Calculus II, Linear Algebra)
- Email fetching (6 sample unread emails)

### Future Integration

When ready for production:
1. Replace mock professor data with Supabase Auth
2. Store courses in Supabase database
3. Use real Gmail API calls via Composio
4. Add label creation/management in Gmail

## API Endpoints

### POST /api/check-emails

Analyzes unread emails for a specific course.

**Request Body:**
```json
{
  "courseId": "course-1",
  "userId": "prof-123"
}
```

**Response:**
```json
{
  "success": true,
  "course": {
    "id": "course-1",
    "name": "Algebra I"
  },
  "emails": [...],
  "totalAnalyzed": 6,
  "totalCategorized": 4
}
```

## Development

### Adding a New Course

Edit `src/lib/mock-data.ts` to add new courses to the mock data.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google AI API key for Gemini | Yes |
| `COMPOSIO_API_KEY` | Composio API key for Gmail integration | Yes |
