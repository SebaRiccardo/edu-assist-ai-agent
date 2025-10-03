# Features Documentation

## 🎯 Core Features

### 1. AI-Powered Email Analysis

The system uses Google's Gemini 2.5 Flash model to intelligently analyze emails and determine their relevance to specific courses.

#### How it works:

1. **Context-Aware Analysis**: The AI receives the course context (name and description) along with the email content
2. **Multi-Factor Evaluation**: Considers:
   - Subject line keywords
   - Email body content
   - Sender information
   - Course-specific terminology
   - Question patterns
   - Administrative language

3. **Confidence Scoring**: Provides a 0-1 confidence score indicating how certain the AI is about its categorization

#### Example Prompt Structure:

```typescript
You are an intelligent email categorization assistant for university professors.

Course Context:
- Course Name: Algebra I
- Course Description: Introduction to algebraic concepts...

Email to Analyze:
- From: student@university.edu
- Subject: Question about polynomial factoring
- Content: I have a question about problem 3...

Your task:
1. Determine if this email is related to the course
2. Categorize the email type
3. Provide a confidence score
4. Explain your reasoning
```

### 2. Smart Email Categorization

Emails are automatically categorized into four types:

#### Student Question 🎓
- **Criteria**: 
  - Email from student addresses (.edu domains)
  - Contains question patterns ("how", "what", "why", "could you explain")
  - Mentions assignments, homework, or course material
  - Asks about grades or deadlines

- **Example**:
  ```
  From: john.student@university.edu
  Subject: Question about Algebra I homework
  Content: "I'm not sure how to approach factoring x^3 + 3x^2..."
  ```

#### Professor Inquiry 👨‍🏫
- **Criteria**:
  - Email from faculty addresses
  - Professional tone
  - Asks about course structure, materials, or collaboration
  - May reference teaching or curriculum

- **Example**:
  ```
  From: prof.smith@university.edu
  Subject: Linear Algebra textbook recommendation
  Content: "I'm teaching a similar course next semester..."
  ```

#### Administrative 📋
- **Criteria**:
  - From administrative emails
  - Contains logistics information
  - Mentions room changes, schedule updates, or policy changes
  - Official announcements

- **Example**:
  ```
  From: admin@university.edu
  Subject: Room change for Algebra I
  Content: "Please note: Algebra I lecture on Friday will be moved..."
  ```

#### General 📧
- **Criteria**:
  - Course-related but doesn't fit other categories
  - May be newsletters, general inquiries, or miscellaneous
  - Lower confidence scores typically

### 3. Course Context Management

Each course has a detailed context that helps the AI understand what's relevant.

#### Course Structure:

```typescript
interface Course {
  id: string;              // Unique identifier
  name: string;            // Display name (e.g., "Algebra I")
  professorId: string;     // Owner professor ID
  context: string;         // Detailed description
  createdAt: Date;         // Creation timestamp
}
```

#### Example Course Context:

```typescript
{
  name: 'Linear Algebra',
  context: `Study of vector spaces, linear transformations, 
            matrices, determinants, eigenvalues and eigenvectors. 
            Applications to computer science and engineering.`
}
```

**Why Context Matters**:
- More detailed contexts = better categorization accuracy
- Include topics, prerequisites, and key concepts
- Mention specific textbooks or materials if relevant

### 4. Visual Email Cards

Each categorized email is displayed in an intuitive card format.

#### Card Components:

1. **Header**:
   - Subject line
   - "New" badge for unread emails
   - Actions menu (three dots)

2. **Content**:
   - Sender information
   - Email snippet/preview
   - Labels section with:
     - Course badge (green)
     - Email type badge (colored by type)
     - Confidence score badge

3. **Footer**:
   - Received timestamp

4. **Actions Menu**:
   - Mark as read
   - Open in Gmail
   - Archive
   - Delete

### 5. Statistics Dashboard

Real-time statistics show the analysis results:

#### Metrics Tracked:

1. **Total Analyzed**:
   - Total number of unread emails checked
   - Displayed with mail icon
   - Blue theme

2. **Course Related**:
   - Number of emails related to selected course
   - Displayed with book icon
   - Green theme

### 6. Responsive UI

Built with modern design principles:

- **Mobile-First**: Works on all screen sizes
- **Dark Mode**: Supports system dark mode preference
- **Animations**: Smooth transitions and hover effects
- **Accessibility**: ARIA labels and keyboard navigation

## 🔄 Workflow

### Complete Email Checking Flow:

```
1. Professor selects a course
   ↓
2. Clicks "Check Emails"
   ↓
3. System fetches unread emails
   ↓
4. For each email:
   a. AI analyzes content vs. course context
   b. Determines relevance
   c. Categorizes email type
   d. Assigns confidence score
   ↓
5. Related emails are displayed
   ↓
6. Labels are added to Gmail (in production)
   ↓
7. Professor can manage emails
```

## 🎨 UI Components

### Course Selection

- **Layout**: Grid of clickable cards
- **States**: 
  - Default: Gray border
  - Selected: Blue border + blue background
  - Hover: Border color change
- **Content**: Course name + truncated description

### Email Cards

- **Layout**: Stacked vertically
- **Hover Effect**: Shadow elevation
- **Badges**: 
  - Color-coded by type
  - Size-responsive
  - Icon + text

### Action Buttons

- **Primary**: Blue "Check Emails" button
- **Loading State**: Spinner + "Analyzing Emails..." text
- **Disabled State**: Grayed out when no course selected

## 🔐 Data Privacy

### Current Implementation:

- Uses mock data only
- No real emails accessed
- No data stored externally

### Production Considerations:

1. **OAuth 2.0**: Secure Gmail authentication via Composio
2. **Scopes**: Request minimal necessary Gmail permissions
3. **Data Handling**: 
   - Process emails in memory
   - Don't store email content
   - Only store metadata (IDs, labels)
4. **User Control**: Professors can disconnect at any time

## 🚀 Performance

### Optimization Strategies:

1. **Parallel Processing**: 
   - Could analyze multiple emails simultaneously
   - Currently sequential for better token management

2. **Caching**:
   - Course contexts cached in memory
   - Reduce redundant API calls

3. **Streaming**:
   - Could implement streaming responses for real-time updates
   - Show emails as they're analyzed

4. **Batch Processing**:
   - Handle large email volumes in batches
   - Prevent timeout issues

## 📊 Future Enhancements

### Planned Features:

1. **Email Threading**: Group related emails together
2. **Smart Replies**: AI-generated response suggestions
3. **Priority Scoring**: Flag urgent student questions
4. **Analytics**: 
   - Email volume trends
   - Response time tracking
   - Common question detection
5. **Multi-Course Analysis**: Check all courses at once
6. **Custom Email Types**: Professors define their own categories
7. **Auto-Responses**: Template responses for common questions
8. **Integration**: Calendar events, assignment deadlines

## 🛠️ Customization Guide

### Adding New Email Types:

Edit `src/components/email-card.tsx`:

```typescript
const emailTypeConfig = {
  // ... existing types
  urgent_question: {
    label: 'Urgent Question',
    variant: 'destructive' as const,
    icon: '🚨',
  },
}
```

Update the schema in `src/app/api/check-emails/route.ts`:

```typescript
emailType: z.enum([
  'student_question', 
  'professor_inquiry', 
  'general', 
  'administrative',
  'urgent_question' // Add here
])
```

### Adjusting AI Behavior:

Modify the prompt in `src/app/api/check-emails/route.ts`:

```typescript
prompt: `You are an intelligent email categorization assistant...
  
// Add custom instructions here
Consider urgency markers like "urgent", "ASAP", "emergency"
Prioritize emails with upcoming deadlines
...
`
```

### Changing Confidence Thresholds:

Filter low-confidence results:

```typescript
if (analysis.confidence < 0.7) {
  // Skip or flag for manual review
  continue;
}
```

## 📝 Best Practices

### For Professors:

1. **Write Detailed Course Contexts**: Include key topics, concepts, and terminology
2. **Review Low Confidence Emails**: Check emails with <70% confidence
3. **Update Contexts Regularly**: Add new topics as course progresses
4. **Use Consistent Terminology**: Help AI learn patterns

### For Developers:

1. **Monitor API Costs**: Track Gemini API usage
2. **Handle Rate Limits**: Implement exponential backoff
3. **Error Handling**: Graceful failures, retry logic
4. **Testing**: Test with various email patterns
5. **Logging**: Log categorization decisions for improvement

## 🐛 Known Limitations

1. **Mock Data**: Currently uses simulated emails
2. **No Real Gmail**: Composio integration not yet active
3. **English Only**: Optimized for English emails
4. **Single Course**: Can only check one course at a time
5. **No History**: Previous analyses not saved

## 💡 Tips & Tricks

1. **Better Contexts = Better Results**: Spend time writing good course descriptions
2. **Test Patterns**: Try different email phrasings to see how AI responds
3. **Use Feedback**: Low confidence scores indicate areas for improvement
4. **Regular Checks**: Run daily for best email organization
5. **Combine with Filters**: Use Gmail filters + AI for maximum efficiency
