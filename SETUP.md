# Quick Setup Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Set up API Keys

Before running the application, you need to obtain two API keys:

#### Google AI API Key (for Gemini)

1. Go to [Google AI Studio](https://ai.google.dev/)
2. Click "Get API Key"
3. Create a new API key or use an existing one
4. Copy the API key

#### Composio API Key (for Gmail Integration)

1. Go to [Composio Dashboard](https://app.composio.dev)
2. Sign up or log in
3. Navigate to Settings → API Keys
4. Create a new API key
5. Copy the API key

### Step 2: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your API keys:
   ```env
   GOOGLE_GENERATIVE_AI_API_KEY=your_actual_google_api_key
   COMPOSIO_API_KEY=your_actual_composio_api_key
   ```

### Step 3: Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Using the Application

### 1. Select a Course

On the main page, you'll see three mock courses:
- **Algebra I**: Introduction to algebraic concepts
- **Calculus II**: Advanced calculus topics
- **Linear Algebra**: Vector spaces and matrices

Click on any course card to select it.

### 2. Check Emails

Click the "Check Emails for Selected Course" button. The AI agent will:
- Fetch unread emails (currently using mock data)
- Analyze each email against the course context
- Categorize emails by type
- Assign confidence scores

### 3. Review Results

You'll see:
- **Total Analyzed**: Number of unread emails checked
- **Course Related**: Number of emails related to the selected course
- **Email Cards**: Each categorized email with:
  - Subject and sender
  - Email type badge (Student Question, Professor Inquiry, etc.)
  - Course label
  - Confidence score
  - Actions menu (⋮)

### 4. Email Actions

Click the three dots (⋮) on any email card to:
- Mark as read
- Open in Gmail
- Archive
- Delete

## 🔄 Mock Data vs. Production

### Current Implementation (Mock Data)

The application currently uses:
- **Mock Professor**: Dr. Sarah Johnson
- **Mock Courses**: 3 pre-defined courses
- **Mock Emails**: 6 sample unread emails

This allows you to test the application without connecting to a real Gmail account.

### Production Ready Features

When you're ready to connect to real data:

1. **Gmail Integration**: 
   - The Composio integration is already set up
   - Just uncomment the actual Gmail API calls in `src/app/api/check-emails/route.ts`
   - Connect your Gmail account through Composio

2. **Database Integration**:
   - Replace mock data in `src/lib/mock-data.ts` with Supabase queries
   - Set up authentication
   - Create database tables for courses and professors

## 🎨 Customization

### Adding New Courses

Edit `src/lib/mock-data.ts`:

```typescript
export const mockCourses: Course[] = [
  {
    id: 'course-4',
    name: 'Your Course Name',
    professorId: 'prof-123',
    context: 'Detailed course description to help AI understand the context...',
    createdAt: new Date('2024-09-01'),
  },
  // ... existing courses
];
```

### Customizing Email Types

Edit `src/components/email-card.tsx` to add new email type categories or modify existing ones.

## 🐛 Troubleshooting

### "Failed to check emails" Error

- Verify your API keys are correctly set in `.env.local`
- Make sure you've restarted the development server after adding environment variables
- Check the browser console for detailed error messages

### Emails Not Showing Up

- The application currently uses mock data for demonstration
- To see real emails, you need to integrate with actual Gmail API through Composio

### Styling Issues

- Make sure all dependencies are installed: `npm install --legacy-peer-deps`
- Clear your browser cache and reload

## 📚 Learn More

- [Vercel AI SDK Documentation](https://ai-sdk.dev/docs)
- [Google Gemini API](https://ai.google.dev/docs)
- [Composio Documentation](https://docs.composio.dev/)
- [Next.js Documentation](https://nextjs.org/docs)

## 💡 Tips

1. **Course Context is Key**: The more detailed your course context, the better the AI can categorize emails
2. **Test with Different Courses**: Try selecting different courses to see how the AI adapts
3. **Confidence Scores**: Pay attention to confidence scores - lower scores might need manual review
4. **Email Types**: The AI learns from patterns - consistent email formats help accuracy

## 🔐 Security Notes

- Never commit your `.env.local` file to version control
- Keep your API keys secure and rotate them regularly
- In production, use environment variables management (Vercel, Railway, etc.)
