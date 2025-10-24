import { streamText, convertToModelMessages, stepCountIs } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { ComposioService } from '@/lib/services/composio';
import { createClient, getCurrentUser } from '@/lib/supabase/server';
import { getAllCoursesForProfessorFullTextSearch, getAllCoursesForProfessorQuery } from '@/hooks/queries/courses';
import { ChatSDKError } from '@/lib/errors';
import {
  findRelevantCourses,
  generateAndStoreCourseEmbedding,
  batchGenerateCourseEmbeddings
} from '@/lib/ai/embedding';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, connectionId, model } = await req.json();

    const user = await getCurrentUser();

    if (!user) {
      return new ChatSDKError('unauthorized:chat').toResponse();
    }

    if (!connectionId) {
      return new ChatSDKError('bad_request:api').toResponse();
    }

    // Get Gmail tools for the specific connection
    const gmailTools = await ComposioService.getGmailTools(user.id);

    // Get Supabase client to fetch courses
    const supabase = await createClient();

    // Define custom course and RAG tools
    const courseTools = {
      getUserCourses: {
        description: `Fetch all courses for the current user. Use this to get course information 
                     when the user asks about their courses or when you need course details.`,
        inputSchema: z.object({}),
        execute: async () => {
          try {
            const coursesQuery = getAllCoursesForProfessorQuery(supabase, user.id);
            const { data: courses, error } = await coursesQuery;

            if (error) {
              return {
                success: false,
                error: error.message,
                courses: [],
              };
            }

            return {
              success: true,
              courses: courses?.map(c => ({
                id: c.id,
                name: c.name,
                description: c.description,
                context: c.context,
                hasEmbedding: !!c.embedding,
              })) || [],
              count: courses?.length || 0,
            };
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : 'Failed to fetch courses',
              courses: [],
            };
          }
        },
      },
      getCourseDetails: {
        description:
          'Get detailed information about a specific course by its name. Use this when you need detailed course information.',
        inputSchema: z.object({
          courseIdentifier: z.string().describe('The course name to search for. Can be a partial match like "algebra" or "algebra 2".'),
        }),
        execute: async ({ courseIdentifier }: { courseIdentifier: string }) => {
          try {
            const coursesQuery = getAllCoursesForProfessorFullTextSearch(supabase, user.id, courseIdentifier);
            const { data: courses, error } = await coursesQuery;

            if (error) {
              return {
                success: false,
                error: error.message,
                course: null,
              };
            }

            const course = courses?.[0];

            if (!course) {
              return {
                success: false,
                error: 'Course not found',
                course: null,
              };
            }

            return {
              success: true,
              course: {
                id: course.id,
                name: course.name,
                description: course.description,
                context: course.context,
                year: course.year,
                startAt: course.start_at,
                endAt: course.end_at,
                studentCount: course.student_count,
                hasEmbedding: !!course.embedding,
              },
            };
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : 'Failed to fetch course details',
              course: null,
            };
          }
        },
      },
      generateCourseEmbedding: {
        description: `Generate and store semantic embedding for a specific course. 
                     Use this to prepare a course for RAG-based email matching. 
                     The embedding is generated from course name, description, and context.`,
        inputSchema: z.object({
          courseId: z.string().describe('The course ID to generate embedding for'),
          courseName: z.string().describe('The course name'),
          courseDescription: z.string().describe('The course description'),
          courseContext: z.string().describe('The course context/additional information'),
        }),
        execute: async ({
          courseId,
          courseName,
          courseDescription,
          courseContext
        }: {
          courseId: string;
          courseName: string;
          courseDescription: string;
          courseContext: string;
        }) => {
          try {
            const courseContent = `${courseName}. ${courseDescription}. ${courseContext}`;
            const result = await generateAndStoreCourseEmbedding(courseId, courseContent);

            if (result.success) {
              return {
                success: true,
                message: `Successfully generated embedding for course "${courseName}"`,
              };
            } else {
              return {
                success: false,
                error: result.error || 'Failed to generate embedding',
              };
            }
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : 'Failed to generate course embedding',
            };
          }
        },
      },
      generateAllCourseEmbeddings: {
        description: `Generate embeddings for all courses that don't have embeddings yet. 
                     Use this when the user wants to prepare all their courses for RAG-based matching.`,
        inputSchema: z.object({}),
        execute: async () => {
          try {
            const result = await batchGenerateCourseEmbeddings(user.id);
            return result;
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : 'Failed to generate embeddings',
              processed: 0,
            };
          }
        },
      },
      matchEmailsWithCourseUsingRAG: {
        description: `Advanced RAG-based email matching. Analyzes emails using semantic similarity against course embeddings.
                     This provides much more accurate matching than keyword-based approaches.
                     IMPORTANT: Use this AFTER fetching emails with EMAIL_FETCH_EMAILS tool.
                     Do NOT use course name as filter when fetching emails - fetch all unread emails first.`,
        inputSchema: z.object({
          emails: z
            .array(
              z.object({
                id: z.string().optional().describe('Email ID'),
                subject: z.string().describe('Email subject'),
                sender: z.string().describe('Email sender'),
                messageText: z.string().describe('Email body/message text'),
                date: z.string().optional().describe('Email date'),
              })
            )
            .describe('Array of emails to analyze against all courses'),
        }),
        execute: async ({
          emails
        }: {
          emails: Array<{
            id?: string;
            subject: string;
            sender: string;
            messageText: string;
            date?: string;
          }>;
        }) => {
          try {
            if (!emails || emails.length === 0) {
              return {
                success: false,
                error: 'No emails provided for analysis',
                matches: [],
              };
            }

            // Process each email
            const emailMatches = await Promise.all(
              emails.map(async (email) => {
                const emailContent = `Subject: ${email.subject}. From: ${email.sender}. Message: ${email.messageText}`;
                const relevantCourses = await findRelevantCourses(emailContent, user.id);

                return {
                  email: {
                    id: email.id,
                    subject: email.subject,
                    sender: email.sender,
                    date: email.date,
                  },
                  matchedCourses: relevantCourses.map(course => ({
                    id: course.id,
                    name: course.name,
                    similarity: Math.round(course.similarity * 100), // Convert to percentage
                  })),
                  hasMatch: relevantCourses.length > 0,
                  bestMatch: relevantCourses[0] || null,
                };
              })
            );

            const matchedEmails = emailMatches.filter(m => m.hasMatch);
            const unmatchedEmails = emailMatches.filter(m => !m.hasMatch);

            return {
              success: true,
              totalEmails: emails.length,
              matchedEmails: matchedEmails.length,
              unmatchedEmails: unmatchedEmails.length,
              matches: emailMatches,
              summary: {
                matched: matchedEmails.map(m => ({
                  subject: m.email.subject,
                  course: m.bestMatch?.name,
                  similarity: m.bestMatch?.similarity,
                })),
              },
            };
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : 'Failed to match emails with courses',
              matches: [],
            };
          }
        },
      },
    };

    // Combine Gmail tools with custom course tools
    const allTools = {
      ...gmailTools,
      ...courseTools,
    };

    const result = streamText({
      model: 'xai/grok-4-fast-reasoning',//google('gemini-2.0-flash'),
      messages: convertToModelMessages(messages),
      stopWhen: stepCountIs(10),
      tools: allTools,
      system: `You are an intelligent email assistant with advanced RAG (Retrieval-Augmented Generation) capabilities. 
You help professors manage and analyze their email inboxes by matching emails to courses using semantic similarity.

## Available Tools
### Email Tools (Composio Gmail/Outlook) 
### Course Tools
- getUserCourses: Get all courses for the current user
- getCourseDetails: Get detailed information about a specific course
- generateCourseEmbedding: Generate semantic embedding for a specific course
- generateAllCourseEmbeddings: Generate embeddings for all courses without embeddings
- matchEmailsWithCourseUsingRAG: Advanced RAG-based email-to-course matching using semantic similarity

## RAG-Based Email Matching Workflow

When a user asks about emails related to a specific course (e.g., "Show me emails about Algebra 2"):

### Step 1: Get Course Information
- Use getCourseDetails with the course name (e.g., "algebra 2") to find the course
- Check if the course has an embedding (hasEmbedding field)
- If no embedding exists, ask if they want to generate it using generateCourseEmbedding

### Step 2: Fetch Emails (CRITICAL)
- Use the composio tools to fetch recent unread emails
- **DO NOT use the course name or keywords as filters** - this would exclude emails that mention the course in different ways
- **ALWAYS fetch general unread emails** (e.g., maxResults: 20, labelIds: ["UNREAD"])
- Fetching broadly ensures you don't miss relevant emails

### Step 3: Match Using RAG
- Use matchEmailsWithCourseUsingRAG with the fetched emails
- This tool uses semantic similarity to match email content against course embeddings
- It returns similarity scores (0-100%) for each email-course pair
- Emails with similarity > 70% are considered relevant matches

### Step 4: Present Results
- Show matched emails with their similarity scores
- Summarize: "Found X emails related to [Course Name]"
- Display: sender, subject, similarity percentage, and date for each match
- Offer to show full content or perform actions on matched emails

## Example Conversation Flow

**User:** "Show me unread emails about Algebra 2"

**You (internal steps):**
1. getCourseDetails(courseIdentifier: "algebra 2" or "algebra-2" or "algebra_2" or "algebra" since the user could refer to it in different ways) → Get course info
2. Check if course.hasEmbedding is true
   - If false: Ask "I notice Algebra 2 doesn't have a semantic embedding yet. Should I generate one for better matching?"
3. EMAIL_FETCH_EMAILS(maxResults: 20, labelIds: ["UNREAD"]) → Fetch recent unread emails
4. matchEmailsWithCourseUsingRAG(emails: [...]) → Analyze all emails against course
5. Present results with similarity scores

**Your response:**
"I found 3 unread emails related to Algebra 2:

1. **From:** student@university.edu | **Subject:** Question about homework 5 | **Similarity:** 89%
2. **From:** parent@email.com | **Subject:** Meeting about exam | **Similarity:** 82%
3. **From:** ta@university.edu | **Subject:** Grading assistance needed | **Similarity:** 76%

Would you like me to show the full content of any of these emails?"

## Important Notes

- **Always fetch emails WITHOUT course-specific filters** - let RAG do the intelligent matching
- **Explain similarity scores** to users when showing results
- **Suggest generating embeddings** if a course doesn't have one
- **Be proactive**: If user has multiple courses and many emails, suggest batch processing
- **Handle edge cases**: What if no course has embeddings? Offer to generate them all at once

## Conversation Style

- Be conversational, helpful, and proactive
- Explain what you're doing when using RAG features
- Provide summaries and actionable insights
- Ask clarifying questions when needed
- Offer suggestions for efficiency (e.g., "Would you like me to generate embeddings for all your courses?")

Remember: The power of RAG is in semantic understanding, not keyword matching. Always use the RAG tools for course-email matching instead of keyword filters.
`,
      // onStepFinish: ({ toolResults }) => {
      //   if (toolResults.length > 0) {
      //     console.log('Tool results:');
      //     console.dir(toolResults, { depth: null });
      //   }
      // }
    });

    return result.toUIMessageStreamResponse({ sendReasoning: true });
  } catch (error) {
    return new ChatSDKError('bad_request:api').toResponse();
  }
}
