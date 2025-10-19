import { streamText, convertToModelMessages, stepCountIs } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { ComposioService } from '@/lib/services/composio';
import { createClient, getCurrentUser } from '@/lib/supabase/server';
import { getAllCoursesForProfessorQuery } from '@/hooks/queries/courses';
import { ChatSDKError } from '@/lib/errors';

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

    // Define custom course tools
    const courseTools = {
      getUserCourses: {
        description: `Fetch all courses for the current user. Use this to get course information 
                     when the user asks about their courses or when you need course details to filter emails.`,
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
              courses: courses || [],
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
          'Get detailed information about a specific course by its name or ID. Use this when you need detailed course information to match with emails.',
        inputSchema: z.object({
          courseIdentifier: z.string().describe('The course name or ID to search for. Can be a partial match.'),
        }),
        execute: async ({ courseIdentifier }: { courseIdentifier: string }) => {
          try {
            const coursesQuery = getAllCoursesForProfessorQuery(supabase, user.id);
            const { data: courses, error } = await coursesQuery;

            if (error) {
              return {
                success: false,
                error: error.message,
                course: null,
              };
            }

            // Search for course by name (case-insensitive) or ID
            const course = courses?.find(c => c.name.toLowerCase().includes(courseIdentifier.toLowerCase()) || c.id === courseIdentifier);

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
      matchEmailsWithCourse: {
        description:
          'Analyze emails to determine if they are related to a specific course. Use this after fetching emails to filter them by course relevance.',
        inputSchema: z.object({
          courseContext: z.string().describe('The course context, description, or keywords to match against'),
          emails: z
            .array(
              z.object({
                subject: z.string(),
                sender: z.string(),
                messageText: z.string(),
              })
            )
            .describe('Array of emails to analyze'),
        }),
        execute: async ({
          courseContext,
          emails,
        }: {
          courseContext: string;
          emails: Array<{
            subject: string;
            sender: string;
            messageText: string;
          }>;
        }) => {
          try {
            // Simple keyword matching algorithm
            const keywords = courseContext
              .toLowerCase()
              .split(/\s+/)
              .filter(word => word.length > 3);

            const matchedEmails = emails.map(email => {
              const emailContent = `${email.subject} ${email.sender} ${email.messageText}`.toLowerCase();

              const matches = keywords.filter(keyword => emailContent.includes(keyword));

              return {
                ...email,
                isRelated: matches.length > 0,
                matchCount: matches.length,
                matchedKeywords: matches,
              };
            });

            const relatedEmails = matchedEmails.filter(e => e.isRelated);

            return {
              success: true,
              totalEmails: emails.length,
              relatedEmails: relatedEmails.length,
              emails: relatedEmails,
            };
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : 'Failed to match emails with course',
              totalEmails: 0,
              relatedEmails: 0,
              emails: [],
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
      model: google('gemini-2.0-flash'),
      messages: convertToModelMessages(messages),
      //stopWhen: stepCountIs(5),
      tools: allTools,
      system: `You are an intelligent email assistant that helps users manage and analyze their Gmail inbox. 
You have access to:
1. Gmail tools to fetch, search, send, reply, and manage emails
2. Course tools to fetch user courses and match emails with specific courses

When a user asks about emails related to a course:
1. First, use getUserCourses or getCourseDetails to get course information
2. Then, use GMAIL_FETCH_EMAILS to fetch relevant emails, do not use course details in the query filters as they may not match the email content will discard important emails. Instead use general filters to fetch recent unread emails.
3. Once you have the emails, use matchEmailsWithCourse to determine which emails are actually related to the course

Be conversational and helpful. Provide summaries and insights about the emails. 
When showing email information, format it clearly with sender, subject, and relevant details.

Always consider the course context (description, keywords) when analyzing emails.
`,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    return new ChatSDKError('bad_request:api').toResponse();
  }
}
