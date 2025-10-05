# Agent Extraction Complete - Reusable Agent Modules

## Overview

All agents have been extracted into individual, reusable modules in the `/src/agents/` directory. Each agent can now be used independently or combined in different workflows.

## 📦 Extracted Agents

### 1. Email Analysis Agent
**File:** `/src/agents/analyze-inbox.ts`  
**Function:** `analyzeInboxForCourse()`

Fetches and categorizes emails from Gmail using AI batch processing.

```typescript
import { analyzeInboxForCourse } from '@/agents/analyze-inbox';

const result = await analyzeInboxForCourse({
  userId: 'connection-id',
  courseId: '1',
  maxEmails: 30,
  includeRead: false,
  verbose: false
});
```

**Returns:**
- Categorized emails with confidence scores
- AI analysis summary
- Comprehensive statistics

---

### 2. Priority Classification Agent
**File:** `/src/agents/classify-priorities.ts`  
**Function:** `classifyEmailPriorities()`

Analyzes emails and assigns priority levels (critical, high, medium, low) with response deadlines.

```typescript
import { 
  classifyEmailPriorities,
  getPriorityStats,
  filterByPriority 
} from '@/agents/classify-priorities';

const prioritization = await classifyEmailPriorities({
  emails: categorizedEmails,
  courseName: 'CS 101: Introduction to Computer Science',
  analysisSummary: 'Most emails are from students...'
});

// Get statistics
const stats = getPriorityStats(prioritization);
console.log(`Critical: ${stats.critical}, High: ${stats.high}`);

// Filter by priority
const urgentEmails = filterByPriority(prioritization, ['critical', 'high']);
```

**Features:**
- Considers deadlines and time constraints
- Evaluates impact on student learning
- Suggests specific response deadlines
- Provides detailed reasoning

---

### 3. Response Generation Agent
**File:** `/src/agents/generate-responses.ts`  
**Functions:** `generateEmailResponse()`, `generateBatchResponses()`

Generates professional draft email responses based on priority and context.

```typescript
import {
  generateEmailResponse,
  generateBatchResponses,
  getResponseStats
} from '@/agents/generate-responses';

// Single response
const response = await generateEmailResponse({
  email: {
    id: 'msg_123',
    from: 'student@university.edu',
    subject: 'Question about Assignment 3',
    body: 'Hi Professor...',
    category: 'student_email'
  },
  priority: {
    priority: 'high',
    responseDeadline: '2025-10-05 5:00 PM',
    reasoning: 'Assignment due tomorrow'
  },
  courseName: 'CS 101'
});

// Batch responses
const responses = await generateBatchResponses(
  emailsWithPriorities,
  'CS 101',
  { maxResponses: 5 }
);

// Get statistics
const stats = getResponseStats(responses);
```

**Features:**
- Adjusts tone based on priority level
- Professional and academic appropriate
- Provides actionable information
- Maintains professor-student boundaries

---

### 4. Quality Review Agent
**File:** `/src/agents/review-quality.ts`  
**Functions:** `reviewEmailQuality()`, `reviewBatchQuality()`

Reviews draft responses and provides quality scores (0-100) with improvement suggestions.

```typescript
import {
  reviewEmailQuality,
  reviewBatchQuality,
  calculateQualityStats,
  filterByApproval,
  filterByScore
} from '@/agents/review-quality';

// Single review
const review = await reviewEmailQuality({
  draftResponse: {
    emailId: 'msg_123',
    originalEmail: { /*...*/ },
    priority: 'high',
    deadline: '2025-10-05 5:00 PM',
    draftResponse: 'Dear Student...'
  },
  courseName: 'CS 101'
});

// Batch review
const reviews = await reviewBatchQuality(draftResponses, 'CS 101');

// Calculate statistics
const stats = calculateQualityStats(reviews);
console.log(`Average score: ${stats.averageScore}/100`);
console.log(`Approval rate: ${stats.approvalRate}%`);

// Filter results
const approved = filterByApproval(reviews, true);
const highQuality = filterByScore(reviews, 85);
```

**Quality Criteria:**
- Professional tone (0-20 points)
- Content relevance (0-30 points)
- Clarity & actionability (0-20 points)
- Urgency appropriateness (0-15 points)
- Grammar & structure (0-15 points)

---

## 🔄 Using Agents in Workflows

### Complete 4-Agent Workflow

```typescript
import { analyzeInboxForCourse } from '@/agents/analyze-inbox';
import { classifyEmailPriorities, filterByPriority } from '@/agents/classify-priorities';
import { generateBatchResponses } from '@/agents/generate-responses';
import { reviewBatchQuality, calculateQualityStats } from '@/agents/review-quality';

export async function completeEmailWorkflow(userId: string, courseId: string) {
  // Agent 1: Analyze emails
  const analysis = await analyzeInboxForCourse({
    userId,
    courseId,
    maxEmails: 30,
  });

  // Agent 2: Classify priorities
  const prioritization = await classifyEmailPriorities({
    emails: analysis.emails.filter(e => e.isRelated && e.confidence > 75),
    courseName: analysis.courseName,
    analysisSummary: analysis.analysis.summary,
  });

  // Agent 3: Generate responses
  const highPriorityEmails = filterByPriority(prioritization, ['critical', 'high']);
  
  const emailsToRespond = highPriorityEmails.map(p => {
    const email = analysis.emails.find(e => e.id === p.emailId);
    return {
      email: { id: email.id, from: email.from, subject: email.subject, body: email.body },
      priority: { priority: p.priority, responseDeadline: p.responseDeadline, reasoning: p.reasoning }
    };
  });

  const responses = await generateBatchResponses(emailsToRespond, analysis.courseName);

  // Agent 4: Review quality
  const reviews = await reviewBatchQuality(responses, analysis.courseName);
  const qualityStats = calculateQualityStats(reviews);

  return {
    analysis,
    prioritization,
    responses,
    reviews,
    qualityStats
  };
}
```

### Custom Workflow Examples

#### 1. Quick Priority Triage
```typescript
import { analyzeInboxForCourse } from '@/agents/analyze-inbox';
import { classifyEmailPriorities, filterByPriority } from '@/agents/classify-priorities';

// Just analyze and prioritize
const analysis = await analyzeInboxForCourse({ userId, courseId, maxEmails: 50 });
const prioritization = await classifyEmailPriorities({
  emails: analysis.emails,
  courseName: analysis.courseName
});

const criticalEmails = filterByPriority(prioritization, ['critical']);
// Handle critical emails immediately
```

#### 2. Response Generation Only
```typescript
import { generateEmailResponse } from '@/agents/generate-responses';

// Generate response for a single email you already have
const response = await generateEmailResponse({
  email: existingEmail,
  priority: { priority: 'high', responseDeadline: 'Tomorrow 5pm', reasoning: 'Urgent' },
  courseName: 'CS 101'
});
```

#### 3. Quality Check Existing Drafts
```typescript
import { reviewBatchQuality, filterByScore } from '@/agents/review-quality';

// Review drafts you created manually
const reviews = await reviewBatchQuality(myDrafts, 'CS 101');
const needsWork = filterByScore(reviews, 70).filter(r => !r.approved);

// Revise low-scoring drafts
```

#### 4. Multi-Course Processing
```typescript
const courses = ['1', '2', '3'];

for (const courseId of courses) {
  const analysis = await analyzeInboxForCourse({ userId, courseId, maxEmails: 20 });
  
  if (analysis.analysis.stats.courseRelated > 0) {
    const prioritization = await classifyEmailPriorities({
      emails: analysis.emails.filter(e => e.isRelated),
      courseName: analysis.courseName
    });
    
    // Process critical emails for this course
    const critical = filterByPriority(prioritization, ['critical']);
    // ... handle critical emails
  }
}
```

---

## 🎯 Benefits of Extracted Agents

### 1. **Reusability**
- Use agents in multiple workflows
- Mix and match as needed
- Call from different API routes

### 2. **Modularity**
- Each agent is independent
- Easy to test individually
- Simple to maintain and update

### 3. **Flexibility**
- Create custom workflows
- Skip unnecessary steps
- Combine in different orders

### 4. **Type Safety**
- Full TypeScript support
- Clear interfaces
- Autocomplete in IDE

### 5. **Testability**
- Unit test each agent
- Mock dependencies easily
- Isolated testing

---

## 📁 File Structure

```
src/
├── agents/
│   ├── analyze-inbox.ts           # Email analysis agent
│   ├── classify-priorities.ts     # Priority classification agent
│   ├── generate-responses.ts      # Response generation agent
│   └── review-quality.ts          # Quality review agent
├── workflows/
│   └── advanced-multi-agent-workflow.ts  # Example complete workflow
└── app/
    └── api/
        └── ... (API routes using agents)
```

---

## 🔧 Helper Functions

Each agent module includes helper functions:

### Priority Classification Helpers
- `getPriorityStats()` - Get count by priority level
- `filterByPriority()` - Filter by priority levels

### Response Generation Helpers
- `getResponseStats()` - Get response statistics

### Quality Review Helpers
- `calculateQualityStats()` - Calculate quality statistics
- `filterByApproval()` - Filter by approval status
- `filterByScore()` - Filter by minimum score
- `getImprovementSuggestions()` - Get suggestions for unapproved responses

---

## 🚀 Getting Started

### 1. Import the Agents You Need
```typescript
import { analyzeInboxForCourse } from '@/agents/analyze-inbox';
import { classifyEmailPriorities } from '@/agents/classify-priorities';
```

### 2. Call Them in Sequence
```typescript
const analysis = await analyzeInboxForCourse({...});
const prioritization = await classifyEmailPriorities({
  emails: analysis.emails,
  courseName: analysis.courseName
});
```

### 3. Use Helper Functions
```typescript
const stats = getPriorityStats(prioritization);
const urgent = filterByPriority(prioritization, ['critical', 'high']);
```

---

## 📝 Best Practices

1. **Chain Thoughtfully**: Only use agents you need
2. **Filter Early**: Reduce processing by filtering emails early
3. **Handle Errors**: Wrap agent calls in try-catch
4. **Log Progress**: Use console.log for workflow visibility
5. **Cache Results**: Store intermediate results when appropriate
6. **Set Timeouts**: Configure appropriate timeouts for your use case
7. **Validate Inputs**: Check parameters before passing to agents

---

## 🎨 Example Workflows

### Urgent Email Triage
```typescript
const analysis = await analyzeInboxForCourse({...});
const prioritization = await classifyEmailPriorities({...});
const critical = filterByPriority(prioritization, ['critical']);
// Alert professor immediately
```

### Batch Response Generation
```typescript
const analysis = await analyzeInboxForCourse({...});
const prioritization = await classifyEmailPriorities({...});
const responses = await generateBatchResponses(...);
const reviews = await reviewBatchQuality(responses);
// Send approved responses
```

### Quality Assurance Only
```typescript
const reviews = await reviewBatchQuality(existingDrafts);
const approved = filterByApproval(reviews, true);
const needsWork = filterByApproval(reviews, false);
// Revise unapproved drafts
```

---

## ✅ Status

- ✅ All 4 agents extracted into separate files
- ✅ Full TypeScript types and interfaces
- ✅ Helper functions for each agent
- ✅ Example workflow refactored to use modules
- ✅ No compilation errors
- ✅ Ready for production use

---

## 📚 Documentation Files

- **This File**: Agent extraction and usage guide
- `/src/agents/analyze-inbox.ts`: Email analysis agent
- `/src/agents/classify-priorities.ts`: Priority classification
- `/src/agents/generate-responses.ts`: Response generation
- `/src/agents/review-quality.ts`: Quality review
- `/src/workflows/advanced-multi-agent-workflow.ts`: Complete workflow example

---

**You now have a modular, reusable agent system!** 🎉

Each agent can be used independently or combined in custom workflows to suit your specific needs.
