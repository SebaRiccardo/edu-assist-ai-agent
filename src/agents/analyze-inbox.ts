import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import {
  CategorizedEmail,
  InboxAnalysisParams,
  InboxAnalysisResult,
  GmailMessageBody,
  TransformedEmail,
} from '@/types';
import { ComposioService } from '@/lib/services/composio';
import { tr } from 'zod/v4/locales';

// Set max duration for this API route to handle AI processing
export const maxDuration = 60;

const categoryEnum = z
  .enum([
    'course_related', // Directly related to course content
    'student_email', // From students
    'staff_email', // From colleagues or staff
    'administrative', // Administrative matters
    'assignment', // Assignment submissions or questions
    'grade_inquiry',
    'other', // Not related to course
  ])
  .describe('The category of the email');

export type EmailCategoryType = z.infer<typeof categoryEnum>;
/**
 * Email Tag Schema - defines the structure for email categorization
 */
const emailTagSchema = z.object({
  emailId: z.string().describe('The ID of the email being analyzed'),
  isRelated: z.boolean().describe('Whether the email is related to the course'),
  category: categoryEnum,
  suggestedLabel: z.string().describe('Suggested Gmail label for this email'),
  confidence: z.number().min(0).max(100).describe('Confidence score (0-100)'),
  reasoning: z.string().describe('Brief explanation of the categorization'),
});

/**
 * Batch Email Analysis Schema - for analyzing multiple emails at once
 */
const batchEmailAnalysisSchema = z.object({
  results: z.array(emailTagSchema),
  summary: z.string().describe('Overall summary of the email batch analysis'),
});

/**
 * Transform Gmail message to application email format
 *
 * @param message - Gmail message body from Composio API
 * @returns Transformed email in application format
 */
function transformGmailMessage(message: GmailMessageBody): TransformedEmail {
  return {
    id: message.messageId || '',
    threadId: message.threadId || '',
    from: message.sender || 'Unknown',
    to: message.to || '',
    subject: message.subject || 'No Subject',
    snippet: extractSnippet(message),
    body: message.messageText || extractSnippet(message),
    receivedAt: message.messageTimestamp || new Date().toISOString(),
    isUnread: message.labelIds?.includes('UNREAD') || false,
    labels: message.labelIds || [],
    attachments: message.attachmentList || undefined,
  };
}

/**
 * Extract email snippet from message
 * Falls back to preview or truncated body if available
 */
function extractSnippet(message: GmailMessageBody): string {
  if (
    message.preview &&
    typeof message.preview === 'object' &&
    'snippet' in message.preview
  ) {
    return String(message.preview.snippet);
  }

  if (message.messageText) {
    return message.messageText.substring(0, 200);
  }

  return '';
}

export async function analyzeInboxForCourse(
  params: InboxAnalysisParams
): Promise<InboxAnalysisResult> {
  const {
    course,
    connectedAccountId,
    maxEmails = 10,
    includeRead = false,
    reasoningLanguage = 'English',
    verbose = true,
  } = params;

  if (!course) throw new Error(`Course is required`);

  const gmailResponse = await ComposioService.fetchEmails(connectedAccountId, {
    query: includeRead ? 'in:inbox' : 'is:unread',
    verbose: verbose,
    max_results: maxEmails,
    include_payload: true,
    include_spam_trash: false,
  });

  if (!gmailResponse.successful) {
    throw new Error(gmailResponse.error || 'Failed to fetch emails');
  }

  const fetchedEmails = gmailResponse.data.messages;
  console.log(`📬 Successfully fetched ${fetchedEmails.length} emails`);

  if (fetchedEmails.length === 0) {
    return {
      emails: [],
      analysis: {
        summary: 'No emails found',
        stats: {
          totalAnalyzed: 0,
          courseRelated: 0,
          avgConfidence: 0,
          categoryBreakdown: {},
        },
      },
      totalAnalyzed: 0,
      courseName: course.name,
      courseId: course.id,
    };
  }

  // STEP 3: Prepare emails for batch AI analysis
  const emailsForAnalysis = fetchedEmails.map((email: GmailMessageBody) => ({
    id: email.messageId || 'unknown',
    subject: email.subject || 'No Subject',
    from: email.sender || 'Unknown',
    body: (email.messageText || '').substring(0, 500), // Truncate for efficiency
    timestamp: email.messageTimestamp || '',
  }));

  console.log(`🧠 Analyzing ${emailsForAnalysis.length} emails with AI...`);

  // STEP 4: Batch analyze all emails with a single AI call
  const analysisResult = await generateObject({
    model: google('gemini-2.0-flash'),
    schema: batchEmailAnalysisSchema,
    system: `You are an expert email assistant that helps categorize emails for university professors based on course context. You understand academic contexts and can identify different types of educational communications.`,
    prompt: `Analyze these emails to determine if they are related to the course and categorize their type.
                
Course Details:
    - Course Name: ${course.name}
    - Course Description: ${course.description}
    - Course Context: ${course.context}

Task:
   - Analyze the following ${emailsForAnalysis.length} emails and categorize each one.

Categorization Guidelines:
- **course_related**: Email directly discusses course content, lectures, materials
- **student_email**: From students asking questions or making requests
- **staff_email**: From academic colleagues, department staff, or administrators
- **administrative**: Course logistics, room changes, schedules, policies
- **assignment**: Assignment submissions, extensions, clarifications
- **grade_inquiry**: Questions about grades, grading, exam scores
- **other**: Unrelated to the course or spam

Label Suggestions:
- Suggest clear, descriptive Gmail labels (e.g., "CS101-Students", "Course-Assignments")
- Keep labels concise and consistent
- Use the course name in labels when relevant
 
Analysis Guidelines:
    1. Determine if this email is related to the course "${course.name}"
    2. Look for course-specific keywords, concepts, or topics mentioned in the course description and course context
    3. Consider the sender's email domain (students often use .edu addresses)
    4. Analyze the content context and intent
    5. Assign appropriate confidence score (0-1) based on how certain you are
    6. Provide clear reasoning for your categorization

Emails to Analyze:
 ${JSON.stringify(emailsForAnalysis, null, 2)}

Important:
- Be thorough but efficient in your analysis.
- Provide structured analysis for each email with confidence scores and reasoning.
- Write the reasoning in ${reasoningLanguage}.`,
  });

  console.log(`✨ Analysis complete!`);

  // STEP 5: Map analysis results back to original emails
  const categorizedEmails: CategorizedEmail[] =
    analysisResult.object.results.map(analysis => {
      const originalEmail = fetchedEmails.find(
        (e: GmailMessageBody) => e.messageId === analysis.emailId
      );
      return {
        ...transformGmailMessage(originalEmail!),
        category: analysis.category,
        isRelated: analysis.isRelated,
        suggestedLabel: analysis.suggestedLabel,
        confidence: analysis.confidence,
        reasoning: analysis.reasoning,
      };
    });

  // Calculate statistics
  const stats = {
    totalAnalyzed: categorizedEmails.length,
    courseRelated: categorizedEmails.filter(e => e.isRelated).length,
    avgConfidence: Math.round(
      categorizedEmails.reduce((sum, e) => sum + e.confidence, 0) /
        categorizedEmails.length
    ),
    categoryBreakdown: categorizedEmails.reduce(
      (acc: Record<string, number>, email) => {
        acc[email.category] = (acc[email.category] || 0) + 1;
        return acc;
      },
      {}
    ),
  };

  console.log(`📊 Stats:`, stats);

  return {
    emails: categorizedEmails.filter(e => e.isRelated),
    analysis: {
      summary: analysisResult.object.summary,
      stats,
    },
    totalAnalyzed: categorizedEmails.length,
    courseName: course.name,
    courseId: course.id,
  };
}
