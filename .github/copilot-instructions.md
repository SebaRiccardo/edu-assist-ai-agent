# EduAssist AI Email Agent - Copilot Instructions

## Project Overview
This is an AI-powered email management system for university professors that automatically categorizes and organizes student emails by course using Google's Gemini 2.5 Flash and Composio Gmail integration.

## Architecture & Key Concepts

### Core Flow
1. **Gmail Authentication** → Professor connects Gmail via `/api/gmail-auth` endpoint using Composio OAuth
2. **Course Selection** → Professor selects course from `mockCourses` in `/lib/mock-data.ts`
3. **Email Analysis** → POST to `/api/check-emails` fetches Gmail via Composio, analyzes with Gemini
4. **Categorization** → AI categorizes emails into 10 types with confidence scores and reasoning
5. **Display** → Results shown via `EmailCard` components with enhanced UI and statistics

### Data Layer Patterns
- **Mock Data**: Currently uses `mockCourses` and `mockProfessor` in `/lib/mock-data.ts` - replace with Supabase in production
- **Types**: Centralized in `/types/index.ts` - `Course`, `CategorizedEmail`, `EmailAnalysisResult`, `GmailConnection` interfaces
- **Course Context**: Each course has a `description` field that provides AI context for categorization

### AI Integration Patterns
- **Gemini**: Uses `@ai-sdk/google` with `generateObject()` and Zod schemas for structured output
- **Analysis Schema**: Located in `/api/check-emails/route.ts` - defines `emailAnalysisSchema` with `isRelated`, `emailType`, `confidence`, `reasoning`
- **Composio**: Gmail toolkit integration via `@composio/vercel` provider with real OAuth authentication

## Email Categorization System

### 10 Email Types
1. **student_question** - Questions about course material, assignments, concepts
2. **professor_inquiry** - Communications from academic colleagues  
3. **administrative** - Course logistics, room changes, schedules
4. **assignment_submission** - Assignment submissions, extension requests
5. **grade_inquiry** - Questions about grades and grading
6. **office_hours** - Meeting requests and scheduling
7. **course_feedback** - Student feedback and evaluations
8. **technical_support** - IT issues and platform problems
9. **parent_communication** - Communications from parents/guardians
10. **general** - Other course-related communications

### Adding New Email Types
1. Update `emailType` enum in `/types/index.ts`
2. Modify `emailAnalysisSchema` in `/api/check-emails/route.ts`
3. Add configuration in `emailTypeConfig` in `/components/email-card.tsx`

## Development Workflows

### Key Commands
```bash
npm run dev --turbopack    # Dev server with Turbopack
npm run build --turbopack  # Production build
npm run format            # Prettier formatting
```

### Environment Setup
Required vars in `.env.local`:
- `GOOGLE_GENERATIVE_AI_API_KEY` - Google AI Studio API key
- `COMPOSIO_API_KEY` - Composio dashboard API key
- `GMAIL_AUTH_CONFIG_ID` - Composio Gmail auth config ID (format: ac_xxxxx)

### Gmail Authentication Flow
1. User attempts to check emails → calls `checkGmailConnection(userId)`
2. If not connected → call `/api/gmail-auth` to get OAuth redirect URL
3. User completes OAuth flow → Composio stores connection
4. Return to app → connection now active, can fetch emails

## Component Architecture

### UI Components (shadcn/ui)
- **Style**: "new-york" variant with CSS variables
- **Icons**: Lucide React (`lucide-react`) + emoji icons for email types
- **Base Color**: neutral theme
- **Path Aliases**: `@/components`, `@/lib`, `@/hooks` configured in `components.json`

### Custom Components
- **EmailCard**: Enhanced email display with 10 category badges, collapsible reasoning, action menus
- **Gmail Auth**: Handles OAuth connection flow and status checking
- **Stats Display**: Shows comprehensive analysis statistics and confidence metrics

### Email Card Pattern
```tsx
// Supports all 10 email types with appropriate icons and styling
<EmailCard 
  email={categorizedEmail}
  onMarkAsRead={handleMarkAsRead}
  onArchive={handleArchive}
  onDelete={handleDelete}
/>
```

## Integration Points

### Gmail Integration (Composio)
- **Authentication**: `/api/gmail-auth` handles OAuth initiation and status checking
- **Email Fetching**: `searchCourseRelatedEmails()` in `/lib/composio-helpers.ts`
- **Production**: Uses real Composio Gmail toolkit with course-specific keyword searching
- **Mock Mode**: Falls back to enhanced mock data when Composio unavailable

### AI Analysis Flow
1. Check Gmail connection status via `checkGmailConnection(userId)`
2. Fetch course-related emails using keyword extraction from course description
3. For each email, call `generateObject()` with enhanced prompt including all 10 categories
4. Return `CategorizedEmail[]` with confidence scores and detailed reasoning
5. Generate comprehensive statistics including type breakdown and average confidence

### Composio Helper Functions
- **`checkGmailConnection(userId)`** - Verifies active Gmail connection
- **`searchCourseRelatedEmails(connectionId, courseName, courseDescription)`** - Fetches relevant emails
- **`extractCourseKeywords()`** - Generates search keywords from course context

## Code Conventions

### File Organization
- **API Routes**: `/app/api/[feature]/route.ts` with comprehensive error handling
- **Components**: Feature-based in `/components/` with enhanced UI primitives
- **Types**: Centralized in `/types/index.ts` with complete interface definitions
- **Utils**: Domain-specific helpers in `/lib/` including Composio integration

### Error Handling
- API routes return structured errors with appropriate HTTP status codes
- Gmail connection failures provide clear redirect URLs for authentication
- UI components handle loading states and display user-friendly error messages
- Use `maxDuration = 30` for AI API routes to handle longer processing times

### Styling Patterns
- Use `cn()` utility from `/lib/utils.ts` for conditional classes
- Badge variants: Enhanced with emoji icons for visual categorization
- EmailCard supports all 10 email types with appropriate styling
- Consistent use of confidence percentage displays and reasoning collapsibles

## Testing & Development Notes
- Mock data provides realistic course-related emails for UI testing
- Enhanced email analysis can be tested with different course contexts
- Gmail authentication flow can be tested with Composio sandbox
- AI categorization includes confidence scoring for reliability assessment
- Console logging provides detailed analysis steps for debugging

## Production Deployment
- Set up Composio Gmail auth config with proper OAuth credentials
- Configure Google Cloud Console with Gmail API access
- Replace mock data with Supabase database integration
- Implement user session management for professor accounts
- Add email label management and Gmail organization features