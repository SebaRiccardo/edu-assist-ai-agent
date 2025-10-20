/**
 * Priority Classification Agent
 *
 * Analyzes categorized emails and assigns priority levels based on urgency,
 * impact, and deadline considerations.
 */

import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

/**
 * Priority level for an email
 */
export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low';

/**
 * Single email priority assessment
 */
export interface EmailPriority {
  emailId: string;
  priority: PriorityLevel;
  responseDeadline: string;
  reasoning: string;
}

/**
 * Complete prioritization result
 */
export interface PrioritizationResult {
  priorities: EmailPriority[];
  summary: string;
}

/**
 * Input parameters for priority classification
 */
export interface PriorityClassificationParams {
  emails: Array<{
    id: string;
    from: string;
    subject: string;
    body: string;
    category?: string;
    reasoning?: string;
  }>;
  language: string
  courseName: string;
  analysisSummary?: string;
  model?: string;
}

/**
 * Zod schemas for structured output
 */
const prioritySchema = z.object({
  emailId: z.string(),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
  responseDeadline: z.string().describe('Suggested response deadline'),
  reasoning: z.string(),
});

const priorityListSchema = z.object({
  priorities: z.array(prioritySchema),
  summary: z.string(),
});

/**
 * Classify email priorities using AI
 *
 * @param params - Classification parameters including emails and course context
 * @returns Prioritization result with priority levels and deadlines
 *
 * @example
 * ```typescript
 * const result = await classifyEmailPriorities({
 *   emails: categorizedEmails,
 *   courseName: 'CS 101: Introduction to Computer Science',
 *   analysisSummary: 'Most emails are from students...'
 * });
 *
 * const criticalEmails = result.priorities.filter(p => p.priority === 'critical');
 * ```
 */
export async function priorityClassificatorAgent(params: PriorityClassificationParams): Promise<PrioritizationResult> {
  const { emails, courseName, analysisSummary = '', language, model = 'gemini-2.0-flash' } = params;

  console.log(`⚡ Classifying priorities for ${emails.length} emails...`);

  const result = await generateObject({
    model: google(model),
    schema: priorityListSchema,
    system: `You are an expert at triaging university course emails and determining response priority based on urgency and importance.`,
    prompt: `Analyze these course-related emails and assign priority levels.

Course Name:
${courseName}

AI Analysis Summary:
${analysisSummary}

Emails to Prioritize:
${JSON.stringify(
      emails.map(e => ({
        id: e.id,
        from: e.from,
        subject: e.subject,
        body: e.body.substring(0, 300),
        category: e.category,
        aiReasoning: e.reasoning,
      })),
      null,
      2
    )}

**Priority Guidelines:**
- **CRITICAL**: Technical issues blocking work, urgent admin matters, emergencies
  - Response needed: Within 2-4 hours
  - Examples: System outage, exam access issues, urgent administrative deadline

- **HIGH**: Assignment questions near deadline, grade disputes, time-sensitive requests
  - Response needed: Within 24 hours
  - Examples: Assignment due tomorrow, grade appeal before deadline, office hours request

- **MEDIUM**: General course questions, clarifications, non-urgent admin
  - Response needed: Within 2-3 days
  - Examples: Concept clarification, general questions, schedule inquiries

- **LOW**: Thank you notes, general inquiries, FYI messages
  - Response needed: Within 1 week
  - Examples: Appreciation emails, informational updates, non-urgent questions

For each email, provide:
1. Priority level (critical/high/medium/low)
2. Suggested response deadline (specific date/time if possible)
3. Clear reasoning explaining the priority assignment

Consider:
- Deadlines and time constraints
- Impact on student learning and success
- Administrative requirements and policies
- Complexity of required response
- Number of students affected

Important:
- Be thorough but efficient in your analysis.
- Write the reasoning in ${language}.
`,
  });

  console.log(`✅ Prioritization complete`);
  console.log(`   Summary: ${result.object.summary}`);

  return result.object;
}

/**
 * Get priority statistics from prioritization result
 *
 * @param result - Prioritization result
 * @returns Count of emails by priority level
 */
export function getPriorityStats(result: PrioritizationResult) {
  return {
    critical: result.priorities.filter(p => p.priority === 'critical').length,
    high: result.priorities.filter(p => p.priority === 'high').length,
    medium: result.priorities.filter(p => p.priority === 'medium').length,
    low: result.priorities.filter(p => p.priority === 'low').length,
    total: result.priorities.length,
  };
}

/**
 * Filter emails by priority level
 *
 * @param result - Prioritization result
 * @param priorities - Priority levels to include
 * @returns Filtered email priorities
 */
export function filterByPriority(result: PrioritizationResult, priorities: PriorityLevel[]): EmailPriority[] {
  return result.priorities.filter(p => priorities.includes(p.priority));
}
