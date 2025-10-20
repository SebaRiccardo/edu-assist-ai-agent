# Email Labeling System

## Overview

The email labeling system automatically applies Gmail labels to categorized emails based on AI analysis. It consists of two main components:

1. **Email Labeling Agent** (`emailLabelingAgent`) - Core AI agent that applies labels
2. **Server Action** (`labelEmails`) - Server-side action for frontend integration

## Architecture

```
Frontend → labelEmails() → emailLabelingAgent() → Composio Gmail API
                                                 ↓
                                           Apply Labels
```

## Features

- ✅ Automatic label creation if labels don't exist
- ✅ Batch processing of multiple emails
- ✅ AI-generated summary of labeling operations
- ✅ Detailed success/failure tracking per email
- ✅ Support for internationalization
- ✅ Integration with existing inbox analysis

## Usage

### Basic Usage

```typescript
import { labelEmails } from '@/actions';
import type { CategorizedEmailWithPriority } from '@/types';

// After analyzing the inbox
const analysisResult = await analyzeInbox({
  course,
  connectedAccountId: 'acc_123',
  maxEmails: 50,
  withPriorityClassification: true
});

// Apply labels to analyzed emails
const labelingResult = await labelEmails({
  connectedAccountId: 'acc_123',
  emails: analysisResult.data!.emails as CategorizedEmailWithPriority[],
  courseName: analysisResult.data!.courseName,
  createLabelsIfMissing: true,
  reasoningLanguage: 'Spanish',
  verbose: true
});

if (labelingResult.success) {
  console.log(`✅ Successfully labeled ${labelingResult.data.successCount} emails`);
  console.log(`Summary: ${labelingResult.data.summary}`);
} else {
  console.error(`❌ Error: ${labelingResult.error}`);
}
```

### Complete Workflow Example

```typescript
'use client';

import { useState } from 'react';
import { analyzeInbox, labelEmails } from '@/actions';
import type { Course } from '@/lib/supabase/types/courses.types';

export function EmailLabelingWorkflow({ 
  course, 
  connectedAccountId 
}: { 
  course: Course; 
  connectedAccountId: string;
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<{
    analyzed: number;
    labeled: number;
    summary: string;
  } | null>(null);

  const handleAnalyzeAndLabel = async () => {
    setIsProcessing(true);
    
    try {
      // Step 1: Analyze inbox
      const analysisResponse = await analyzeInbox({
        course,
        connectedAccountId,
        maxEmails: 50,
        includeRead: false,
        reasoningLanguage: 'Spanish',
        withPriorityClassification: true
      });

      if (!analysisResponse.success) {
        throw new Error(analysisResponse.error);
      }

      // Step 2: Apply labels
      const labelingResponse = await labelEmails({
        connectedAccountId,
        emails: analysisResponse.data!.emails as CategorizedEmailWithPriority[],
        courseName: analysisResponse.data!.courseName,
        createLabelsIfMissing: true,
        reasoningLanguage: 'Spanish'
      });

      if (!labelingResponse.success) {
        throw new Error(labelingResponse.error);
      }

      // Step 3: Display results
      setResults({
        analyzed: analysisResponse.data!.totalAnalyzed,
        labeled: labelingResponse.data!.successCount,
        summary: labelingResponse.data!.summary
      });
    } catch (error) {
      console.error('Error in workflow:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleAnalyzeAndLabel}
        disabled={isProcessing}
        className="btn-primary"
      >
        {isProcessing ? 'Processing...' : 'Analyze & Label Emails'}
      </button>

      {results && (
        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold">Results</h3>
          <p>Analyzed: {results.analyzed} emails</p>
          <p>Labeled: {results.labeled} emails</p>
          <p className="mt-2 text-sm">{results.summary}</p>
        </div>
      )}
    </div>
  );
}
```

### Using the Agent Directly

```typescript
import { emailLabelingAgent } from '@/agents/email-labaler';
import type { CategorizedEmailWithPriority } from '@/types';

const result = await emailLabelingAgent({
  connectedAccountId: 'acc_123',
  emails: categorizedEmails as CategorizedEmailWithPriority[],
  courseName: 'CS 101',
  reasoningLanguage: 'English',
  verbose: true,
  createLabelsIfMissing: true
});

// Get detailed statistics
import { getLabelingStats } from '@/agents/email-labaler';
const stats = getLabelingStats(result);

console.log('Labels applied:', stats.byLabel);
console.log('Success rate:', stats.successRate + '%');
console.log('Total labels created:', stats.totalLabelsCreated);
```

## API Reference

### Server Action: `labelEmails()`

Apply Gmail labels to analyzed emails.

**Parameters:**

```typescript
interface LabelEmailsInput {
  connectedAccountId: string;              // Composio connected account ID
  emails: CategorizedEmailWithPriority[];  // Emails to label (from analyzeInbox)
  courseName: string;                      // Name of the course
  reasoningLanguage?: string;              // Language for AI summaries (default: 'English')
  verbose?: boolean;                       // Enable detailed logging (default: true)
  createLabelsIfMissing?: boolean;         // Create labels if they don't exist (default: true)
}
```

**Returns:**

```typescript
interface LabelEmailsResponse {
  success: boolean;
  data?: EmailLabelingResult;
  error?: string;
  account?: {
    status: "INITIALIZING" | "INITIATED" | "FAILED" | "EXPIRED" | "INACTIVE" | "ACTIVE"
  };
}
```

### Agent: `emailLabelingAgent()`

Core agent that applies labels to emails.

**Parameters:**

```typescript
interface EmailLabelingParams {
  connectedAccountId: string;
  emails: CategorizedEmailWithPriority[];
  courseName: string;
  reasoningLanguage?: string;
  verbose?: boolean;
  createLabelsIfMissing?: boolean;
}
```

**Returns:**

```typescript
interface EmailLabelingResult {
  totalProcessed: number;
  successCount: number;
  failureCount: number;
  results: LabelResult[];
  summary: string; // AI-generated summary
}

interface LabelResult {
  emailId: string;
  success: boolean;
  appliedLabel?: string;
  error?: string;
  labelId?: string;
}
```

### Utility: `getLabelingStats()`

Get statistics from labeling results.

```typescript
const stats = getLabelingStats(result);
// Returns:
{
  byLabel: Record<string, number>;  // Count of emails per label
  totalLabelsCreated: number;       // Number of unique labels
  successRate: number;              // Success rate percentage
}
```

## Gmail Label Management

### Label Creation

Labels are automatically created if they don't exist when `createLabelsIfMissing: true`:

```typescript
await labelEmails({
  connectedAccountId: 'acc_123',
  emails: categorizedEmails,
  courseName: 'CS 101',
  createLabelsIfMissing: true // Creates missing labels
});
```

### Label Format

Labels are created based on the `suggestedLabel` field from the inbox analysis:

- Course-specific: `"CS101-Students"`, `"Math202-Assignments"`
- Category-based: `"Course-Related"`, `"Administrative"`
- Custom: Based on AI analysis context

## Error Handling

The system provides comprehensive error handling:

```typescript
const result = await labelEmails({
  connectedAccountId,
  emails: analysisResult.data!.emails,
  courseName: analysisResult.data!.courseName
});

if (!result.success) {
  // Handle different error types
  if (result.error === 'unauthorized') {
    // Redirect to login
  } else if (result.account?.status !== 'ACTIVE') {
    // Show reconnection dialog
  } else {
    // Generic error handling
  }
}

// Check individual email failures
if (result.data) {
  const failures = result.data.results.filter(r => !r.success);
  failures.forEach(failure => {
    console.log(`Failed to label ${failure.emailId}: ${failure.error}`);
  });
}
```

## Integration with Inbox Analysis

The labeling system is designed to work seamlessly with the inbox analyzer:

```typescript
// Step 1: Analyze inbox with priority classification
const analysis = await analyzeInbox({
  course,
  connectedAccountId,
  maxEmails: 50,
  withPriorityClassification: true, // Important for better labeling
  reasoningLanguage: 'Spanish'
});

// Step 2: Apply labels
if (analysis.success && analysis.data) {
  const labeling = await labelEmails({
    connectedAccountId,
    emails: analysis.data.emails as CategorizedEmailWithPriority[],
    courseName: analysis.data.courseName,
    reasoningLanguage: 'Spanish'
  });
}
```

## Best Practices

1. **Always enable priority classification** when analyzing for better label suggestions
2. **Use verbose mode** during development for debugging
3. **Handle errors gracefully** with user-friendly messages
4. **Check account status** before attempting to label
5. **Use the same language** for both analysis and labeling
6. **Monitor success rates** to identify issues with specific labels
7. **Create labels proactively** during first run with `createLabelsIfMissing: true`

## Performance Considerations

- Labeling is performed sequentially to avoid API rate limits
- Each email label application is a separate API call
- Label creation adds overhead on first run
- Consider batching large operations (>100 emails) into chunks

## Troubleshooting

### Labels not being applied

```typescript
// Check if labels exist first
const stats = getLabelingStats(result);
console.log('Labels created:', stats.byLabel);

// Verify account status
if (result.account?.status !== 'ACTIVE') {
  console.log('Account needs reconnection');
}
```

### High failure rate

```typescript
// Review individual failures
const failures = result.data?.results.filter(r => !r.success);
failures?.forEach(f => {
  console.log(`Email ${f.emailId}: ${f.error}`);
});
```

## Future Enhancements

- [ ] Batch label operations for better performance
- [ ] Label color customization
- [ ] Label hierarchy support
- [ ] Undo labeling operations
- [ ] Schedule automatic labeling
- [ ] Label templates
