# Using the Encapsulated Email Analysis Function

## Overview

The email analysis logic has been **encapsulated** into a reusable function `analyzeEmailsForCourse()` that can be called from anywhere in your application, including from other agents.

## Function Signature

```typescript
export async function analyzeEmailsForCourse(
    params: EmailAnalysisParams
): Promise<EmailAnalysisResult>
```

### Parameters

```typescript
interface EmailAnalysisParams {
    userId: string;          // Composio Gmail connection ID
    courseId: string;        // Course to analyze emails for
    maxEmails?: number;      // Max emails to fetch (default: 10)
    includeRead?: boolean;   // Include read emails (default: false)
    verbose?: boolean;       // Use verbose fetching (default: true)
}
```

### Return Type

```typescript
interface EmailAnalysisResult {
    emails: CategorizedEmail[];      // Array of categorized emails
    analysis: {
        summary: string;              // AI-generated summary
        stats: {
            totalAnalyzed: number;    // Total emails analyzed
            courseRelated: number;    // Course-related count
            avgConfidence: number;    // Average confidence score
            categoryBreakdown: Record<string, number>; // Count per category
        };
    };
    totalAnalyzed: number;
    courseName: string;
    courseId: string;
}
```

### CategorizedEmail Type

```typescript
interface CategorizedEmail extends TransformedEmail {
    category: 'course_related' | 'student_email' | 'staff_email' | 
              'administrative' | 'assignment' | 'grade_inquiry' | 'other';
    isRelated: boolean;
    suggestedLabel: string;
    confidence: number;      // 0-100
    reasoning: string;       // AI explanation
}
```

## Usage Examples

### 1. Basic Usage

```typescript
import { analyzeEmailsForCourse } from '@/app/api/get-emails/route';

const result = await analyzeEmailsForCourse({
    userId: 'gmail-connection-id',
    courseId: '1',
    maxEmails: 20,
    includeRead: false
});

console.log(`Analyzed ${result.totalAnalyzed} emails`);
console.log(`${result.analysis.stats.courseRelated} are course-related`);
```

### 2. Pass Results to Another Agent

```typescript
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { analyzeEmailsForCourse } from '@/app/api/get-emails/route';

// STEP 1: Get categorized emails
const emailAnalysis = await analyzeEmailsForCourse({
    userId: 'connection-id',
    courseId: '1',
    maxEmails: 30,
});

// STEP 2: Pass to another agent for further processing
const responseAgent = await generateText({
    model: google('gemini-2.0-flash'),
    prompt: `Based on these analyzed emails, draft responses for the most urgent student questions.

Email Analysis Summary:
${emailAnalysis.analysis.summary}

Statistics:
- Total: ${emailAnalysis.totalAnalyzed}
- Course-related: ${emailAnalysis.analysis.stats.courseRelated}
- Average Confidence: ${emailAnalysis.analysis.stats.avgConfidence}%

Student Emails (High Priority):
${JSON.stringify(
    emailAnalysis.emails
        .filter(e => e.category === 'student_email' && e.confidence > 80)
        .map(e => ({
            from: e.from,
            subject: e.subject,
            body: e.body,
            reasoning: e.reasoning
        })),
    null,
    2
)}

Draft professional, helpful responses for each student email.`
});

console.log(responseAgent.text);
```

### 3. Multi-Agent Workflow

```typescript
import { analyzeEmailsForCourse } from '@/app/api/get-emails/route';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

// Agent 1: Analyze emails
const emailAnalysis = await analyzeEmailsForCourse({
    userId: 'connection-id',
    courseId: '1',
    maxEmails: 50,
});

// Agent 2: Prioritize emails
const prioritizationSchema = z.object({
    urgentEmails: z.array(z.object({
        emailId: z.string(),
        priority: z.enum(['critical', 'high', 'medium', 'low']),
        responseDeadline: z.string(),
        reasoning: z.string(),
    })),
    summary: z.string(),
});

const prioritization = await generateObject({
    model: google('gemini-2.0-flash'),
    schema: prioritizationSchema,
    prompt: `Analyze these categorized emails and prioritize them based on urgency.

Emails to prioritize:
${JSON.stringify(emailAnalysis.emails, null, 2)}

Consider:
- Assignment deadlines
- Grade inquiries before exam dates
- Technical issues blocking students
- Administrative requirements

Assign priority levels and response deadlines.`
});

// Agent 3: Generate responses
const highPriorityEmails = prioritization.object.urgentEmails
    .filter(p => ['critical', 'high'].includes(p.priority));

for (const urgentEmail of highPriorityEmails) {
    const email = emailAnalysis.emails.find(e => e.id === urgentEmail.emailId);
    
    const response = await generateText({
        model: google('gemini-2.0-flash'),
        prompt: `Draft a professional response to this student email.

From: ${email?.from}
Subject: ${email?.subject}
Body: ${email?.body}

Priority: ${urgentEmail.priority}
Deadline: ${urgentEmail.responseDeadline}
Context: ${urgentEmail.reasoning}

Course: ${emailAnalysis.courseName}
`
    });
    
    console.log(`Response for ${email?.from}:`);
    console.log(response.text);
}
```

### 4. Chained Analysis

```typescript
import { analyzeEmailsForCourse } from '@/app/api/get-emails/route';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

// Analyze multiple courses
const courses = ['1', '2', '3']; // Course IDs
const allAnalyses = [];

for (const courseId of courses) {
    const analysis = await analyzeEmailsForCourse({
        userId: 'connection-id',
        courseId,
        maxEmails: 20,
    });
    allAnalyses.push(analysis);
}

// Aggregate results with another agent
const aggregateAnalysis = await generateText({
    model: google('gemini-2.0-flash'),
    prompt: `Analyze email patterns across multiple courses and provide insights.

Course Email Analyses:
${JSON.stringify(allAnalyses.map(a => ({
    course: a.courseName,
    total: a.totalAnalyzed,
    courseRelated: a.analysis.stats.courseRelated,
    breakdown: a.analysis.stats.categoryBreakdown,
    summary: a.analysis.summary
})), null, 2)}

Provide:
1. Cross-course patterns
2. Common student concerns
3. Time management recommendations
4. Resource allocation suggestions`
});

console.log(aggregateAnalysis.text);
```

### 5. Filter and Process Subset

```typescript
import { analyzeEmailsForCourse } from '@/app/api/get-emails/route';

const analysis = await analyzeEmailsForCourse({
    userId: 'connection-id',
    courseId: '1',
    maxEmails: 100,
});

// Filter high-confidence course-related emails
const relevantEmails = analysis.emails.filter(
    email => email.isRelated && email.confidence > 85
);

// Filter by category
const studentQuestions = analysis.emails.filter(
    email => email.category === 'student_email'
);

const assignmentEmails = analysis.emails.filter(
    email => email.category === 'assignment'
);

// Pass filtered results to specialized agents
// Agent for student questions
const questionResponses = await processStudentQuestions(studentQuestions);

// Agent for assignment tracking
const assignmentStatus = await trackAssignments(assignmentEmails);
```

## Error Handling

The function throws errors that you should catch:

```typescript
try {
    const result = await analyzeEmailsForCourse({
        userId: 'connection-id',
        courseId: '1',
    });
    
    // Process results
    console.log(result);
    
} catch (error) {
    if (error.message.includes('Gmail not connected')) {
        // Handle authentication error
        console.error('Please authenticate Gmail first');
        // Redirect to auth flow
    } else if (error.message.includes('Course not found')) {
        // Handle invalid course
        console.error('Invalid course ID');
    } else if (error.message.includes('Failed to fetch emails')) {
        // Handle Gmail API error
        console.error('Gmail API error');
    } else {
        // Generic error
        console.error('Analysis failed:', error.message);
    }
}
```

## Performance Considerations

### Batch Size
- **Small (1-10 emails)**: Fast, real-time response
- **Medium (10-30 emails)**: Optimal for most use cases
- **Large (30-100 emails)**: May require increased timeout
- **Very Large (>100)**: Consider chunking

### Timeout Configuration
```typescript
// In your API route or function
export const maxDuration = 60; // Adjust based on email count
```

### Caching Results
```typescript
import { analyzeEmailsForCourse } from '@/app/api/get-emails/route';

// Cache key based on parameters
const cacheKey = `emails-${userId}-${courseId}-${Date.now()}`;

// Check cache first
let result = cache.get(cacheKey);

if (!result) {
    result = await analyzeEmailsForCourse({
        userId,
        courseId,
        maxEmails: 50,
    });
    
    // Cache for 5 minutes
    cache.set(cacheKey, result, 5 * 60);
}

return result;
```

## Integration Patterns

### 1. Sequential Agents
```typescript
const analysis = await analyzeEmailsForCourse({...});
const prioritized = await prioritizeEmails(analysis);
const responses = await generateResponses(prioritized);
```

### 2. Parallel Processing
```typescript
const [analysis1, analysis2] = await Promise.all([
    analyzeEmailsForCourse({ courseId: '1', userId }),
    analyzeEmailsForCourse({ courseId: '2', userId }),
]);
```

### 3. Conditional Flow
```typescript
const analysis = await analyzeEmailsForCourse({...});

if (analysis.analysis.stats.courseRelated > 10) {
    // High volume - use batch processing
    await batchProcessEmails(analysis);
} else {
    // Low volume - individual processing
    await individualProcessing(analysis);
}
```

## Best Practices

1. **Always validate userId and courseId** before calling
2. **Handle errors gracefully** with try-catch
3. **Cache results** when appropriate
4. **Filter results** before passing to subsequent agents
5. **Monitor performance** with console logs
6. **Set appropriate timeouts** based on batch size
7. **Use type guards** for TypeScript safety

## Example: Complete Multi-Agent Workflow

```typescript
import { analyzeEmailsForCourse } from '@/app/api/get-emails/route';
import { generateText, generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

export async function processAndRespondToEmails(
    userId: string,
    courseId: string
) {
    try {
        // AGENT 1: Analyze emails
        console.log('🔍 Agent 1: Analyzing emails...');
        const analysis = await analyzeEmailsForCourse({
            userId,
            courseId,
            maxEmails: 30,
            includeRead: false,
        });

        console.log(`✅ Analyzed ${analysis.totalAnalyzed} emails`);

        // AGENT 2: Identify urgent emails
        console.log('⚡ Agent 2: Identifying urgent emails...');
        const urgentAnalysis = await generateObject({
            model: google('gemini-2.0-flash'),
            schema: z.object({
                urgentEmails: z.array(z.string()),
                reasoning: z.string(),
            }),
            prompt: `Identify urgent emails that need immediate response.
            
            Emails: ${JSON.stringify(analysis.emails, null, 2)}
            
            Return IDs of urgent emails.`
        });

        // AGENT 3: Generate responses
        console.log('✍️ Agent 3: Generating responses...');
        const responses = [];
        
        for (const emailId of urgentAnalysis.object.urgentEmails) {
            const email = analysis.emails.find(e => e.id === emailId);
            
            const response = await generateText({
                model: google('gemini-2.0-flash'),
                prompt: `Draft response for: ${email?.subject}\nFrom: ${email?.from}\n${email?.body}`
            });
            
            responses.push({
                emailId,
                response: response.text,
            });
        }

        return {
            analysis,
            urgentEmails: urgentAnalysis.object,
            responses,
        };

    } catch (error) {
        console.error('❌ Workflow failed:', error);
        throw error;
    }
}
```

## Next Steps

- Use `analyzeEmailsForCourse()` in your agent workflows
- Chain multiple agents for complex tasks
- Build specialized agents that consume the analysis results
- Implement error handling and retry logic
- Add caching for frequently accessed analyses

## Related Documentation

- **Main Agent**: `/src/app/api/get-emails/route.ts`
- **Types**: `/src/types/index.ts`
- **Helpers**: `/src/lib/composio-helpers.ts`
- **Architecture**: `ARCHITECTURE_DIAGRAM.md`
- **Full Docs**: `EMAIL_AGENT_REFACTORED.md`
