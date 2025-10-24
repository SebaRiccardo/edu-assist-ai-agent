# Course Embeddings Migration Guide

## Overview

This guide explains how to set up the `courses` table for RAG-based email matching using vector embeddings.

## Database Schema

The `courses` table already has an `embedding` column (type: text/jsonb). This stores vector embeddings as JSON strings.

### Current Schema

```sql
-- The courses table already exists with:
CREATE TABLE courses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  context TEXT NOT NULL,
  embedding TEXT, -- Stores JSON array of numbers
  professor_id TEXT NOT NULL,
  -- ... other columns
);
```

## Optional: Using pgvector Extension (For Advanced Performance)

If you want to use Supabase's native vector operations for better performance, you can migrate the `embedding` column to use the `vector` type.

### Step 1: Enable pgvector Extension

Run this in your Supabase SQL Editor:

```sql
-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
```

### Step 2: Migrate Embedding Column (Optional)

**Warning:** This will require updating existing embeddings. Only do this if you need advanced vector operations.

```sql
-- 1. Add a new vector column
ALTER TABLE courses 
ADD COLUMN embedding_vector vector(768);

-- 2. Migrate existing embeddings from text/json to vector
-- (Run this after generating embeddings with the new system)
UPDATE courses 
SET embedding_vector = (embedding::text)::vector
WHERE embedding IS NOT NULL;

-- 3. Create an index for fast similarity search
CREATE INDEX courses_embedding_vector_idx 
ON courses 
USING ivfflat (embedding_vector vector_cosine_ops)
WITH (lists = 100);

-- 4. Optional: Drop old embedding column after migration
-- ALTER TABLE courses DROP COLUMN embedding;
-- ALTER TABLE courses RENAME COLUMN embedding_vector TO embedding;
```

### Step 3: Update Application Code (If Using pgvector)

If you migrate to pgvector, update the embedding service to use Supabase's vector operations:

```typescript
// In src/lib/ai/embedding.ts
export const findRelevantCoursesWithPgVector = async (emailContent: string, professorId: string) => {
  const supabase = await createClient();
  const emailEmbedding = await generateEmbedding(emailContent);
  
  // Use Supabase's native vector similarity search
  const { data: courses } = await supabase.rpc('match_courses', {
    query_embedding: emailEmbedding,
    match_threshold: 0.7,
    match_count: 5,
    professor_id: professorId,
  });
  
  return courses;
};
```

And create the RPC function:

```sql
CREATE OR REPLACE FUNCTION match_courses(
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  professor_id text
)
RETURNS TABLE (
  id text,
  name text,
  description text,
  context text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.name,
    c.description,
    c.context,
    1 - (c.embedding_vector <=> query_embedding) as similarity
  FROM courses c
  WHERE 
    c.professor_id = match_courses.professor_id
    AND c.embedding_vector IS NOT NULL
    AND 1 - (c.embedding_vector <=> query_embedding) > match_threshold
  ORDER BY c.embedding_vector <=> query_embedding
  LIMIT match_count;
END;
$$;
```

## Current Implementation (No Migration Needed)

The current implementation stores embeddings as JSON strings and performs cosine similarity calculations in JavaScript. This works well for:

- Small to medium datasets (< 1000 courses)
- Development and testing
- Simple deployments

**Advantages:**
- No database migration needed
- Works immediately
- Flexible embedding dimensions

**When to Consider pgvector:**
- Large datasets (> 1000 courses)
- Need extremely fast similarity search
- Want to leverage database-level optimizations

## Embedding Generation

### Automatic Embedding Generation

The system provides tools to generate embeddings:

1. **Single Course:** Use `generateCourseEmbedding` tool
2. **All Courses:** Use `generateAllCourseEmbeddings` tool

### Manual Embedding Generation

You can also generate embeddings via API:

```typescript
import { generateAndStoreCourseEmbedding } from '@/lib/ai/embedding';

// For a single course
await generateAndStoreCourseEmbedding(
  courseId,
  `${course.name}. ${course.description}. ${course.context}`
);

// For all courses
import { batchGenerateCourseEmbeddings } from '@/lib/ai/embedding';
await batchGenerateCourseEmbeddings(professorId);
```

## Testing the RAG System

### 1. Generate Embeddings

Ask the AI agent:
```
"Generate embeddings for all my courses"
```

### 2. Test Email Matching

Ask the AI agent:
```
"Show me emails about Algebra 2"
```

The agent will:
1. Fetch the Algebra 2 course
2. Check if it has an embedding
3. Fetch recent unread emails (without filters)
4. Use RAG to match emails semantically
5. Return matches with similarity scores

### 3. Verify Results

Expected output:
```
Found 3 emails related to Algebra 2:

1. From: student@edu.com | Subject: Homework question | Similarity: 89%
2. From: parent@email.com | Subject: Progress update | Similarity: 82%
3. From: admin@school.edu | Subject: Class schedule | Similarity: 76%
```

## Troubleshooting

### No Matches Found

**Possible causes:**
1. Course doesn't have an embedding
   - Solution: Generate embedding for the course
2. Emails don't semantically relate to the course
   - Solution: Adjust similarity threshold (currently 0.7 = 70%)
3. Email content is too short or vague
   - Solution: Ensure emails have meaningful subject lines and bodies

### Performance Issues

**If similarity matching is slow:**
1. Consider migrating to pgvector (see above)
2. Reduce the number of courses being matched
3. Add database indexes
4. Cache frequently accessed embeddings

### Embedding Errors

**If embedding generation fails:**
1. Check Google AI API credentials
2. Verify embedding model is available
3. Ensure content isn't too long (max ~8000 tokens)
4. Check error logs for specific issues

## Best Practices

1. **Generate embeddings for all courses upfront** - Better user experience
2. **Regenerate embeddings when course content changes significantly**
3. **Monitor similarity thresholds** - Adjust based on user feedback
4. **Use descriptive course contexts** - Better embeddings = better matches
5. **Consider batch operations** - More efficient for multiple courses

## Next Steps

1. Generate embeddings for all existing courses
2. Test the RAG matching system with real emails
3. Fine-tune similarity thresholds based on results
4. Consider migrating to pgvector if handling large datasets
5. Monitor and optimize performance as needed
