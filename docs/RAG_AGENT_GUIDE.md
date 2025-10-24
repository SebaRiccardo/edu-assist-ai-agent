# RAG Agent for Email-Course Matching

## Overview

This document explains the advanced RAG (Retrieval-Augmented Generation) agent that matches emails with courses using semantic similarity and vector embeddings.

## What is RAG?

RAG stands for **Retrieval-Augmented Generation**. It's an AI technique that:

1. **Converts text to vectors** (embeddings) that capture semantic meaning
2. **Finds similar content** by comparing vector representations
3. **Augments AI responses** with relevant retrieved information

### Why RAG for Email Matching?

Traditional keyword matching has limitations:

❌ **Keyword Matching Problems:**
- Misses synonyms ("homework" vs "assignment")
- Fails with paraphrasing ("algebra exam" vs "test in mathematics")
- Ignores context and semantic relationships
- Requires exact word matches

✅ **RAG Advantages:**
- Understands semantic meaning
- Matches similar concepts even with different words
- Captures context and relationships
- Provides similarity scores (confidence levels)

### Example Comparison

**Email:** "Can you help me with the quadratic equation problem from yesterday?"

**Course:** "Algebra 2: Advanced algebraic concepts including polynomials and equations"

- **Keyword Match:** ❌ No match (different words)
- **RAG Match:** ✅ 87% similarity (understands "quadratic equation" relates to "Algebra 2")

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Request                            │
│         "Show me emails about Algebra 2"                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     AI Agent                                │
│  - Understands request                                      │
│  - Plans tool usage                                         │
│  - Orchestrates workflow                                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
              ┌───────────────┴───────────────┐
              ↓                               ↓
┌──────────────────────────┐    ┌──────────────────────────┐
│   Course Tools           │    │   Email Tools            │
│  - getCourseDetails      │    │  - EMAIL_FETCH_EMAILS    │
│  - generateEmbedding     │    │  - EMAIL_SEND            │
│  - getUserCourses        │    │  - EMAIL_REPLY           │
└──────────────────────────┘    └──────────────────────────┘
              ↓                               ↓
┌──────────────────────────┐    ┌──────────────────────────┐
│   Embedding Service      │    │   Composio Gmail/        │
│  - Generate embeddings   │    │   Outlook API            │
│  - Calculate similarity  │    │                          │
│  - Find matches          │    │                          │
└──────────────────────────┘    └──────────────────────────┘
              ↓                               ↓
┌──────────────────────────┐    ┌──────────────────────────┐
│   Supabase Database      │    │   Email Provider         │
│  - Store embeddings      │    │  - Gmail                 │
│  - Retrieve courses      │    │  - Outlook               │
└──────────────────────────┘    └──────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│                  RAG Matching Tool                          │
│  - Compares email embeddings with course embeddings         │
│  - Calculates cosine similarity                             │
│  - Returns matches with confidence scores                   │
└─────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Formatted Response                         │
│  "Found 3 emails related to Algebra 2:                      │
│  1. Subject: Homework help | Similarity: 89%"               │
└─────────────────────────────────────────────────────────────┘
```

## Workflow

### 1. Course Preparation Phase

```typescript
// User: "Prepare my courses for email matching"

1. getUserCourses()
   → Returns all courses for the professor

2. For each course without embedding:
   generateCourseEmbedding(courseId, courseName, courseDescription, courseContext)
   → Generates 768-dimensional vector
   → Stores in database as JSON string

3. Confirmation
   → "Generated embeddings for 5 courses successfully"
```

### 2. Email Matching Phase

```typescript
// User: "Show me emails about Algebra 2"

1. getCourseDetails("algebra 2")
   → Finds course by name
   → Checks if embedding exists
   → Returns course details

2. EMAIL_FETCH_EMAILS({ maxResults: 20, labelIds: ["UNREAD"] })
   → Fetches recent unread emails
   → NO course-specific filters
   → Returns raw email data

3. matchEmailsWithCourseUsingRAG({ emails: [...] })
   → Generates embedding for each email
   → Compares with all course embeddings
   → Calculates cosine similarity
   → Filters by threshold (>70%)
   → Returns matches with scores

4. Present results
   → Formatted list with similarity percentages
   → Actionable insights
```

## Technical Implementation

### Embedding Model

We use **Google's text-embedding-004** model:

```typescript
import { google } from '@ai-sdk/google';

const embeddingModel = google.textEmbeddingModel('text-embedding-004');
```

**Specifications:**
- **Dimensions:** 768
- **Max Input:** ~8000 tokens
- **Output:** Array of 768 floating-point numbers
- **Provider:** Google AI

### Embedding Generation

```typescript
export const generateEmbedding = async (value: string): Promise<number[]> => {
  const input = value.replaceAll('\\n', ' ');
  const { embedding } = await embed({
    model: embeddingModel,
    value: input,
  });
  return embedding;
};
```

**Process:**
1. Clean input text (remove newlines)
2. Send to embedding model
3. Receive 768-dimensional vector
4. Store as JSON string in database

### Similarity Calculation

```typescript
import { cosineSimilarity } from 'ai';

const similarity = cosineSimilarity(emailEmbedding, courseEmbedding);
// Returns value between -1 and 1
// Typically: 0.7+ = relevant match
```

**Cosine Similarity:**
- Measures angle between two vectors
- Range: -1 (opposite) to 1 (identical)
- 0.7+ = Strong semantic similarity
- 0.5-0.7 = Moderate similarity
- <0.5 = Low similarity

### Database Storage

**Current Implementation:**
```sql
-- Courses table
CREATE TABLE courses (
  id TEXT PRIMARY KEY,
  embedding TEXT, -- JSON string: "[0.123, -0.456, ...]"
  -- ... other columns
);
```

**Storage Format:**
```json
{
  "embedding": "[0.123, -0.456, 0.789, ..., -0.234]"
}
```

## AI Agent Tools

### Course Tools

#### 1. `getUserCourses`

Fetches all courses for the current user.

```typescript
{
  description: "Fetch all courses for the current user",
  inputSchema: z.object({}),
  execute: async () => {
    // Returns: { success, courses, count }
  }
}
```

**Use Cases:**
- List all available courses
- Check which courses have embeddings
- Prepare for batch operations

#### 2. `getCourseDetails`

Get detailed information about a specific course.

```typescript
{
  description: "Get detailed information about a specific course by its name",
  inputSchema: z.object({
    courseIdentifier: z.string()
  }),
  execute: async ({ courseIdentifier }) => {
    // Returns: { success, course }
  }
}
```

**Use Cases:**
- Find course by name (fuzzy match)
- Check if course has embedding
- Get course context for matching

#### 3. `generateCourseEmbedding`

Generate and store embedding for a specific course.

```typescript
{
  description: "Generate and store semantic embedding for a specific course",
  inputSchema: z.object({
    courseId: z.string(),
    courseName: z.string(),
    courseDescription: z.string(),
    courseContext: z.string()
  }),
  execute: async ({ courseId, courseName, courseDescription, courseContext }) => {
    // Returns: { success, message }
  }
}
```

**Process:**
1. Combine course name, description, and context
2. Generate 768-dimensional embedding
3. Store as JSON in database
4. Return success confirmation

#### 4. `generateAllCourseEmbeddings`

Batch generate embeddings for all courses without embeddings.

```typescript
{
  description: "Generate embeddings for all courses that don't have embeddings yet",
  inputSchema: z.object({}),
  execute: async () => {
    // Returns: { success, processed, failed, total, message }
  }
}
```

**Use Cases:**
- Initial setup
- Onboarding new professors
- Bulk updates

#### 5. `matchEmailsWithCourseUsingRAG`

Advanced RAG-based email matching using semantic similarity.

```typescript
{
  description: "Analyzes emails using semantic similarity against course embeddings",
  inputSchema: z.object({
    emails: z.array(z.object({
      id: z.string().optional(),
      subject: z.string(),
      sender: z.string(),
      messageText: z.string(),
      date: z.string().optional()
    }))
  }),
  execute: async ({ emails }) => {
    // Returns: { success, totalEmails, matchedEmails, matches, summary }
  }
}
```

**Process:**
1. For each email:
   - Generate embedding from subject + sender + body
   - Compare with all course embeddings
   - Calculate similarity scores
   - Filter by threshold (>70%)
2. Return matches sorted by similarity

**Output Example:**
```json
{
  "success": true,
  "totalEmails": 10,
  "matchedEmails": 3,
  "unmatchedEmails": 7,
  "matches": [
    {
      "email": {
        "subject": "Homework question",
        "sender": "student@edu.com"
      },
      "matchedCourses": [
        {
          "id": "course-123",
          "name": "Algebra 2",
          "similarity": 89
        }
      ],
      "hasMatch": true,
      "bestMatch": { "name": "Algebra 2", "similarity": 89 }
    }
  ]
}
```

## System Prompt

The AI agent uses a comprehensive system prompt that:

1. **Explains available tools** - What each tool does
2. **Defines the workflow** - Step-by-step process
3. **Provides examples** - Real conversation flows
4. **Sets constraints** - Important rules (e.g., don't filter emails by course)
5. **Establishes style** - Conversational and helpful tone

**Key Instructions:**

> "When a user asks about emails related to a course:
> 1. Get course details
> 2. Check if course has embedding
> 3. Fetch emails WITHOUT course filters
> 4. Use RAG to match semantically
> 5. Present results with similarity scores"

## Usage Examples

### Example 1: First Time Setup

```
User: "I want to match emails with my courses"

Agent: "I'll help you set up RAG-based email matching. First, let me check your courses..."

[Agent calls: getUserCourses()]

Agent: "You have 5 courses. I notice none of them have embeddings yet. 
Would you like me to generate embeddings for all of them? This will enable 
accurate semantic matching of emails to courses."

User: "Yes, please"

Agent: [Calls: generateAllCourseEmbeddings()]

Agent: "✅ Successfully generated embeddings for 5 courses:
- Algebra 2
- Calculus I
- Statistics 101
- Linear Algebra
- Differential Equations

You're all set! Now you can ask me to find emails related to any course."
```

### Example 2: Finding Course Emails

```
User: "Show me emails about Algebra 2"

Agent: [Calls: getCourseDetails("algebra 2")]
Agent: "Found course: Algebra 2 (has embedding ✓)"

Agent: [Calls: EMAIL_FETCH_EMAILS({ maxResults: 20, labelIds: ["UNREAD"] })]
Agent: "Fetched 18 unread emails"

Agent: [Calls: matchEmailsWithCourseUsingRAG({ emails: [...] })]

Agent: "I found 4 unread emails related to Algebra 2:

📧 **High Relevance (85%+)**
1. **From:** alice.student@university.edu
   **Subject:** Question about quadratic equations homework
   **Similarity:** 91%
   **Date:** Today, 10:23 AM

2. **From:** bob.parent@email.com
   **Subject:** Meeting to discuss my son's progress in math class
   **Similarity:** 87%
   **Date:** Today, 9:15 AM

📧 **Moderate Relevance (70-85%)**
3. **From:** carol.ta@university.edu
   **Subject:** Grading assistance needed for problem set 3
   **Similarity:** 78%
   **Date:** Yesterday, 3:45 PM

4. **From:** admin@school.edu
   **Subject:** Classroom assignment for next semester
   **Similarity:** 72%
   **Date:** Yesterday, 1:20 PM

Would you like me to show the full content of any of these emails, 
or help you reply to them?"
```

### Example 3: No Matches

```
User: "Are there any emails about Physics?"

Agent: [Calls: getCourseDetails("physics")]

Agent: "I couldn't find a course called 'Physics' in your courses. 
Your current courses are:
- Algebra 2
- Calculus I
- Statistics 101
- Linear Algebra
- Differential Equations

Did you mean one of these, or would you like to search emails 
using different keywords?"
```

### Example 4: Course Without Embedding

```
User: "Show me emails about Calculus I"

Agent: [Calls: getCourseDetails("calculus i")]

Agent: "I found Calculus I, but it doesn't have a semantic embedding yet. 
Would you like me to generate one? This only takes a few seconds and 
will enable accurate email matching for this course."

User: "Yes"

Agent: [Calls: generateCourseEmbedding(...)]

Agent: "✅ Generated embedding for Calculus I successfully! 
Now let me find related emails..."

[Continues with email fetching and matching]
```

## Configuration & Tuning

### Similarity Threshold

Current threshold: **0.7 (70%)**

```typescript
const relevantCourses = coursesWithScores
  .filter(course => course.similarity > 0.7) // 70% threshold
  .sort((a, b) => b.similarity - a.similarity)
  .slice(0, 5); // Top 5 matches
```

**Adjusting Thresholds:**

- **0.8-1.0 (80-100%)**: Very strict - Only highly relevant emails
- **0.7-0.8 (70-80%)**: Balanced - Good precision and recall
- **0.5-0.7 (50-70%)**: Permissive - More matches, some false positives
- **<0.5 (<50%)**: Too permissive - Many false positives

**When to Adjust:**
- Too many irrelevant matches → Increase threshold
- Missing relevant emails → Decrease threshold
- Different thresholds for different use cases

### Max Results

```typescript
.slice(0, 5); // Return top 5 matches
```

Adjust based on:
- User interface capacity
- Performance requirements
- Use case needs

### Embedding Model

Current: **text-embedding-004 (768 dimensions)**

Alternatives:
- `text-embedding-3-small` (1536 dims) - Higher quality, slower
- `text-embedding-3-large` (3072 dims) - Highest quality, slowest

**Trade-offs:**
- **Higher dimensions** = Better accuracy, more storage, slower
- **Lower dimensions** = Faster, less storage, slightly lower accuracy

## Performance Considerations

### Current Performance

- **Embedding Generation:** ~500ms per course
- **Similarity Calculation:** ~5ms per comparison
- **Total Matching (20 emails × 10 courses):** ~1 second

### Optimization Strategies

1. **Batch Embedding Generation**
   ```typescript
   // Generate all course embeddings at once
   await batchGenerateCourseEmbeddings(professorId);
   ```

2. **Cache Frequently Accessed Embeddings**
   ```typescript
   // Store in memory for repeated queries
   const embeddingCache = new Map<string, number[]>();
   ```

3. **Limit Email Batch Size**
   ```typescript
   // Process emails in chunks of 20
   EMAIL_FETCH_EMAILS({ maxResults: 20 })
   ```

4. **Use Database Indexes** (Future enhancement)
   ```sql
   CREATE INDEX ON courses USING ivfflat (embedding vector_cosine_ops);
   ```

### Scaling Considerations

**Current Implementation:**
- ✅ Works well for: <100 courses, <100 emails per query
- ⚠️ May be slow for: >1000 courses, >1000 emails per query
- ❌ Not suitable for: >10,000 courses, real-time requirements

**For Large Scale:**
1. Migrate to pgvector extension
2. Use database-level similarity search
3. Implement caching layers
4. Consider dedicated vector database (Pinecone, Weaviate)

## Monitoring & Debugging

### Key Metrics to Track

1. **Embedding Generation:**
   - Success rate
   - Average time per embedding
   - Failed generations

2. **Similarity Matching:**
   - Average similarity scores
   - Number of matches per query
   - False positive rate

3. **User Satisfaction:**
   - Match relevance feedback
   - Tool usage patterns
   - Error rates

### Debugging Tools

**Check Course Embeddings:**
```sql
SELECT 
  id,
  name,
  LENGTH(embedding) as embedding_length,
  CASE 
    WHEN embedding IS NULL THEN 'Missing'
    WHEN embedding = '' THEN 'Empty'
    ELSE 'Present'
  END as status
FROM courses
WHERE professor_id = 'user-id';
```

**Verify Similarity Calculation:**
```typescript
const testSimilarity = cosineSimilarity(
  embedding1,
  embedding2
);
console.log('Similarity:', testSimilarity);
```

**Test Embedding Service:**
```typescript
import { generateEmbedding } from '@/lib/ai/embedding';

const testText = "This is a test";
const embedding = await generateEmbedding(testText);
console.log('Dimensions:', embedding.length);
console.log('Sample values:', embedding.slice(0, 5));
```

## Best Practices

### 1. Prepare Courses Proactively

✅ **Do:**
```
- Generate embeddings for all courses during onboarding
- Regenerate embeddings when course content changes significantly
- Batch process during off-peak hours
```

❌ **Don't:**
```
- Generate embeddings on-demand during user queries
- Forget to regenerate after major course updates
- Process one course at a time manually
```

### 2. Optimize Course Content

✅ **Do:**
```
- Write descriptive course contexts
- Include key topics and concepts
- Use consistent terminology
```

❌ **Don't:**
```
- Use vague descriptions
- Leave context field empty
- Include irrelevant information
```

### 3. Handle Edge Cases

✅ **Do:**
```
- Check if course has embedding before matching
- Provide helpful messages when no matches found
- Offer to generate embeddings automatically
```

❌ **Don't:**
```
- Assume all courses have embeddings
- Return cryptic error messages
- Force users to manually set up everything
```

### 4. Monitor and Iterate

✅ **Do:**
```
- Track match relevance
- Adjust thresholds based on feedback
- Log and analyze errors
```

❌ **Don't:**
```
- Set and forget
- Ignore false positives
- Skip performance monitoring
```

## Future Enhancements

### Short Term

1. **Multi-Course Matching**
   - Match one email to multiple courses
   - Show all relevant courses with scores

2. **Improved Chunking**
   - Smart text chunking for long emails
   - Preserve context across chunks

3. **Confidence Indicators**
   - Visual indicators for similarity levels
   - Explanations for high/low scores

### Medium Term

1. **pgvector Migration**
   - Native vector operations in database
   - Faster similarity search
   - Advanced indexing

2. **Email Classification**
   - Automatic labeling
   - Priority detection
   - Sentiment analysis

3. **Learning System**
   - User feedback on matches
   - Adaptive thresholds
   - Personalized matching

### Long Term

1. **Real-Time Matching**
   - Automatic email categorization as they arrive
   - Push notifications for important matches
   - Smart inbox filtering

2. **Multi-Modal Embeddings**
   - Include email attachments
   - Parse PDF content
   - Extract text from images

3. **Advanced Analytics**
   - Course engagement metrics
   - Email response patterns
   - Student interaction insights

## Troubleshooting

### Problem: No Matches Found

**Possible Causes:**
1. Course doesn't have embedding
2. Similarity threshold too high
3. Email content doesn't relate to any course

**Solutions:**
```typescript
// 1. Generate course embedding
await generateCourseEmbedding(...);

// 2. Lower threshold temporarily
const threshold = 0.5; // Instead of 0.7

// 3. Check email content
console.log('Email content:', emailContent);
```

### Problem: Too Many False Positives

**Possible Causes:**
1. Similarity threshold too low
2. Course context too generic
3. Email content very short

**Solutions:**
```typescript
// 1. Increase threshold
const threshold = 0.8; // Instead of 0.7

// 2. Improve course context
// Add more specific details to course.context

// 3. Require minimum email length
if (emailContent.length < 50) {
  // Skip or handle differently
}
```

### Problem: Slow Performance

**Possible Causes:**
1. Too many courses to compare
2. Large email batch size
3. No embedding caching

**Solutions:**
```typescript
// 1. Limit course comparison
.slice(0, 20); // Only check top 20 courses

// 2. Reduce email batch
EMAIL_FETCH_EMAILS({ maxResults: 10 });

// 3. Implement caching
const cache = new Map<string, number[]>();
```

### Problem: Embedding Generation Fails

**Possible Causes:**
1. API quota exceeded
2. Content too long
3. Network issues

**Solutions:**
```typescript
// 1. Check API limits
// Monitor Google AI API dashboard

// 2. Truncate long content
const content = fullContent.substring(0, 8000);

// 3. Add retry logic
try {
  await generateEmbedding(content);
} catch (error) {
  // Retry after delay
  await new Promise(r => setTimeout(r, 1000));
  await generateEmbedding(content);
}
```

## Conclusion

This RAG agent provides powerful semantic matching between emails and courses, going far beyond simple keyword matching. By understanding the meaning and context of both emails and courses, it can accurately identify relevant communications even when they use different terminology.

**Key Takeaways:**

1. **RAG > Keywords:** Semantic understanding beats pattern matching
2. **Preparation Matters:** Generate embeddings proactively
3. **Tune as You Go:** Adjust thresholds based on real usage
4. **Monitor Performance:** Track metrics and optimize
5. **Think Scale:** Plan for growth from the start

For questions or issues, refer to the migration guide or check the implementation in:
- `src/lib/ai/embedding.ts`
- `src/app/api/chat/route.ts`
- `docs/COURSE_EMBEDDINGS_MIGRATION.md`
