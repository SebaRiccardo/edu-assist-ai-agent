/**
 * Response Generation Agent
 *
 * Generates professional draft email responses based on email content,
 * priority level, and course context.
 */

import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import z from 'zod';

/**
 * Email information for response generation
 */
export interface EmailInfo {
  id: string;
  from: string;
  subject: string;
  body: string;
  category?: string;
  reasoning?: string;
}

/**
 * Priority information for response
 */
export interface PriorityInfo {
  priority: 'critical' | 'high' | 'medium' | 'low';
  responseDeadline: string;
  reasoning: string;
}

/**
 * Parameters for response generation
 */
export interface ResponseGenerationParams {
  email: EmailInfo;
  priority: PriorityInfo;
  courseName: string;
  professorName?: string;
  additionalContext?: string;
  language?: string; // e.g., 'English', 'Spanish', 'French', 'German', etc.
  model?: string;
}

/**
 * Generated response with metadata
 */
export interface GeneratedResponse {
  emailId: string;
  originalEmail: {
    from: string;
    subject: string;
    category?: string;
  };
  priority: string;
  deadline: string;
  draftResponse: string;
  generatedAt: string;
}

/**
 * Generate a draft email response using AI
 *
 * @param params - Response generation parameters
 * @returns Generated response with metadata
 *
 * @example
 * ```typescript
 * const response = await generateEmailResponse({
 *   email: {
 *     id: 'msg_123',
 *     from: 'student@university.edu',
 *     subject: 'Question about Assignment 3',
 *     body: 'Hi Professor...',
 *     category: 'student_email'
 *   },
 *   priority: {
 *     priority: 'high',
 *     responseDeadline: '2025-10-05 5:00 PM',
 *     reasoning: 'Assignment due tomorrow'
 *   },
 *   courseName: 'CS 101: Introduction to Computer Science'
 * });
 * ```
 */
export async function generateEmailResponse(
  params: ResponseGenerationParams
): Promise<GeneratedResponse> {
  const {
    email,
    priority,
    courseName,
    professorName = 'Professor',
    additionalContext = '',
    language = 'English',
    model = 'gemini-2.0-flash-lite',
  } = params;

  console.log(`📝 Generating response for: "${email.subject}"`);
  console.log(`   Priority: ${priority.priority}`);
  console.log(`   Deadline: ${priority.responseDeadline}`);

  const responseResult = await generateText({
    model: google(model),
    system: `You are a university professor assistant drafting professional, helpful email responses. You understand academic contexts and student needs. You are fluent in multiple languages and can write responses in any requested language.`,
    prompt: `Draft a email response to this ${priority.priority} priority student email.

**IMPORTANT: Write the entire response in ${language}. All greetings, content, placeholder values and closing remarks must be in ${language}.**

**Email Details:**
From: ${email.from}
Subject: ${email.subject}
Body: ${email.body}

**Context:**
- Course: ${courseName}
- Email Category: ${email.category || 'general'}
- Priority Level: ${priority.priority}
- Response Deadline: ${priority.responseDeadline}
- Urgency Reason: ${priority.reasoning}
${email.reasoning ? `- AI Analysis: ${email.reasoning}` : ''}
${additionalContext ? `- Additional Context: ${additionalContext}` : ''}

**Response Guidelines:**
1. **Urgency Appropriateness**: Address the ${priority.priority} priority level appropriately
   - Critical/High: Acknowledge urgency, provide immediate actionable steps
   - Medium/Low: Professional but can be more comprehensive

2. **Professional Tone**:
   - Warm and approachable but maintain academic professionalism
   - Use appropriate greeting (Dear [Student Name], Hello [Name], etc.)
   - Sign off professionally (Best regards, Sincerely, etc.)

3. **Content Quality**:
   - Directly address the student's specific question or concern
   - Provide clear, actionable information
   - Include specific examples or references when helpful
   - Suggest resources if applicable (office hours, TA, documentation)

4. **Structure**:
   - Brief acknowledgment of their email
   - Main response addressing their concern
   - Clear next steps or call-to-action if needed
   - Closing with offer for further help

5. **Length**:
   - Critical/High priority: Concise (1-2 paragraphs), get to the point quickly
   - Medium priority: Balanced (1-3 paragraphs)
   - Low priority: Can be more detailed if needed

6. **Academic Boundaries**:
   - Maintain appropriate professor-student relationship
   - Don't provide direct assignment answers, guide to learning

7. **Language**:
   - Write the ENTIRE response in ${language}
   - Use natural, fluent ${language} appropriate for academic correspondence
   - Maintain cultural appropriateness for ${language}-speaking contexts

Draft the complete, ready-to-send email response in ${language}:`,
  });

  console.log(`   ✅ Draft generated (${responseResult.text.length} chars)`);

  return {
    emailId: email.id,
    originalEmail: {
      from: email.from,
      subject: email.subject,
      category: email.category,
    },
    priority: priority.priority,
    deadline: priority.responseDeadline,
    draftResponse: responseResult.text,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Generate responses for multiple emails
 *
 * @param emails - Array of emails with priority info
 * @param courseName - Course name for context
 * @param options - Additional options
 * @returns Array of generated responses
 *
 * @example
 * ```typescript
 * const responses = await generateBatchResponses(
 *   highPriorityEmails,
 *   'CS 101: Introduction to Computer Science',
 *   { maxResponses: 5, professorName: 'Dr. Smith' }
 * );
 * ```
 */
export async function generateBatchResponses(
  emails: Array<{ email: EmailInfo; priority: PriorityInfo }>,
  courseName: string,
  options: {
    maxResponses?: number;
    professorName?: string;
    additionalContext?: string;
    language?: string; // e.g., 'English', 'Spanish', 'French', 'German', etc.
    model?: string;
  } = {}
): Promise<GeneratedResponse[]> {
  const { maxResponses, professorName, additionalContext, language, model } =
    options;

  const emailsToProcess = maxResponses ? emails.slice(0, maxResponses) : emails;

  console.log(`\n✍️  Generating ${emailsToProcess.length} draft responses...`);

  const responses: GeneratedResponse[] = [];

  for (const { email, priority } of emailsToProcess) {
    const response = await generateEmailResponse({
      email,
      priority,
      courseName,
      professorName,
      additionalContext,
      language,
      model,
    });

    responses.push(response);
  }

  console.log(`✅ Generated ${responses.length} draft responses\n`);

  return responses;
}

/**
 * Get response statistics
 *
 * @param responses - Array of generated responses
 * @returns Response statistics
 */
export function getResponseStats(responses: GeneratedResponse[]) {
  const avgLength =
    responses.reduce((sum, r) => sum + r.draftResponse.length, 0) /
    responses.length;

  const byPriority = {
    critical: responses.filter(r => r.priority === 'critical').length,
    high: responses.filter(r => r.priority === 'high').length,
    medium: responses.filter(r => r.priority === 'medium').length,
    low: responses.filter(r => r.priority === 'low').length,
  };

  return {
    total: responses.length,
    averageLength: Math.round(avgLength),
    byPriority,
  };
}
