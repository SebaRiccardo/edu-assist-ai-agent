/**
 * Send Email Agent
 *
 * Sends emails via Gmail using Composio's Gmail toolkit.
 */

import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { ComposioService } from '@/lib/services/composio';

/**
 * Parameters for sending an email
 */
export interface SendEmailParams {
  userId: string;
  to: string;
  subject?: string;
  draft: string;
  replyToMessageId?: string;
  threadId?: string;
  cc?: string[];
  bcc?: string[];
  model?: string;
}

/**
 * Result from sending an email
 */
export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  threadId?: string;
  error?: string;
  sentAt: string;
}

/**
 * Send an email using Gmail via Composio
 *
 * @param params - Email sending parameters
 * @returns Send email result with success status
 *
 * @example
 * ```typescript
 * const result = await sendEmail({
 *   userId: 'connection-id',
 *   to: 'student@university.edu',
 *   subject: 'Re: Question about Assignment 3',
 *   body: 'Dear Student, Thank you for your question...',
 * });
 * ```
 */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const { userId, to, subject, draft, cc = [], bcc = [], model = 'gemini-2.0-flash-lite', threadId } = params;

  console.log(`📧 Sending email to: ${to}`);
  console.log(`   Subject: ${subject}`);

  try {
    // Get Gmail send email tool from Composio
    const tools = await ComposioService.getSendEmailTools(userId);

    const prePropt = threadId ? `Reply to: ${to} using this threadId: ${threadId},` : `Send an email to ${to}`;
    // Use AI to execute the send email action
    const { text } = await generateText({
      model: google(model),
      system: `You are an AI assistant that helps send emails via Gmail. You have access to a tool that can send emails on behalf of the user. Use the tool to send the email with the provided details.`,
      prompt: `${prePropt} use the following draft ${draft}.

Rules:
- Always use the tool to send the email.
- Analyze the draft content and replace the placeholder values enclosed by square brackets and replace them for real values when necessary.
- If you don't know the value to replace the placeholders omit them and just rephrase the daft to not include the placeholder values. For example if you don't have a specific date to replace [DATE] just rephrase the draft to not include any date.
- Never include a sentence which will be left without any sense because you omitted a placeholder value.

${cc.length > 0 ? `- CC: ${cc.join(', ')}` : ''}
${bcc.length > 0 ? `- BCC: ${bcc.join(', ')}` : ''}
`,
      tools,
      toolChoice: 'required',
    });

    console.log(`   ✅ Email sent successfully`);

    return {
      success: true,
      messageId: extractMessageId(text),
      sentAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`   ❌ Failed to send email:`, error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      sentAt: new Date().toISOString(),
    };
  }
}

/**
 * Send multiple emails in batch
 *
 * @param emails - Array of email parameters
 * @returns Array of send results
 */
export async function sendBatchEmails(emails: SendEmailParams[]): Promise<SendEmailResult[]> {
  console.log(`\n📬 Sending ${emails.length} emails...`);

  const results: SendEmailResult[] = [];

  for (const emailParams of emails) {
    const result = await sendEmail(emailParams);
    results.push(result);

    // Add small delay between emails to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  const successful = results.filter(r => r.success).length;
  console.log(`✅ Sent ${successful}/${emails.length} emails successfully\n`);

  return results;
}

/**
 * Extract message ID from AI response text
 * This is a helper to parse the message ID if returned in the response
 */
function extractMessageId(text: string): string | undefined {
  // Try to extract message ID from common patterns
  const patterns = [/message[_\s]?id[:\s]+([a-zA-Z0-9]+)/i, /id[:\s]+([a-zA-Z0-9]+)/i];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return undefined;
}

/**
 * Get send statistics
 *
 * @param results - Array of send results
 * @returns Statistics about sent emails
 */
export function getSendStats(results: SendEmailResult[]) {
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  return {
    total: results.length,
    successful,
    failed,
    successRate: Math.round((successful / results.length) * 100),
  };
}
