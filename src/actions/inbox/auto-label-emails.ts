'use server';

import { emailLabelingAgent, type EmailLabelingResult } from '@/agents/email-labaler';
import { ComposioService } from '@/lib/services/composio';
import { createClient, getCurrentUser } from '@/lib/supabase/server';
import type { CategorizedEmail, CategorizedEmailWithPriority } from '@/types';

interface LabelEmailsInput {
    connectedAccountId: string;
    emails: CategorizedEmailWithPriority[] | CategorizedEmail[];
    courseName: string;
    reasoningLanguage?: string;
    verbose?: boolean;
    createLabelsIfMissing?: boolean;
}

interface LabelEmailsResponse {
    success: boolean;
    data?: EmailLabelingResult;
    error?: string;
    details?: unknown;
    account?: {
        status: "INITIALIZING" | "INITIATED" | "FAILED" | "EXPIRED" | "INACTIVE" | "ACTIVE"
    };
}

/**
 * Server action to automatically label emails based on analysis result
 *
 * This action takes categorized emails with priorities and applies the suggested
 * Gmail labels using Composio's Gmail integration.
 *
 * @param input - Labeling parameters including connected account and emails
 * @returns Response with labeling operation results
 *
 * @example
 * ```typescript
 * const labelingResult = await labelEmails({
 *   connectedAccountId: 'acc_123',
 *   emails: categorizedEmails,
 *   courseName: 'CS 101',
 *   createLabelsIfMissing: true,
 *   reasoningLanguage: 'Spanish'
 * });
 *
 * if (labelingResult.success) {
 *   console.log(`Successfully labeled ${labelingResult.data.successCount} emails`);
 * }
 * ```
 */
export async function labelEmails(input: LabelEmailsInput): Promise<LabelEmailsResponse> {
    try {
        const {
            connectedAccountId,
            emails,
            courseName,
            reasoningLanguage = 'English',
            verbose = true,
            createLabelsIfMissing = true,
        } = input;

        const supabase = await createClient();
        const user = await getCurrentUser(supabase);

        // STEP 1: Validate user authentication
        if (!user) {
            return {
                success: false,
                error: 'unauthorized',
            };
        }

        // STEP 2: Validate required parameters
        if (!connectedAccountId) {
            return {
                success: false,
                error: 'Connected Account ID is required',
            };
        }

        if (!emails || emails.length === 0) {
            return {
                success: false,
                error: 'Emails array is required and cannot be empty',
            };
        }

        if (!courseName) {
            return {
                success: false,
                error: 'Course name is required',
            };
        }

        // STEP 3: Verify connected account
        const connectedEmail = await ComposioService.getConnectedAccountById(connectedAccountId);

        if (!connectedEmail) {
            return {
                success: false,
                error: 'Connected Account not found',
            };
        }

        if (connectedEmail.status !== 'ACTIVE') {
            return {
                success: false,
                error: `${connectedEmail.toolkit.slug} account is not active`,
                account: {
                    status: connectedEmail.status
                },
            };
        }

        // STEP 4: Execute email labeling agent
        const labelingResult = await emailLabelingAgent({
            connectedAccountId,
            emails, // Safe to cast after validation
            courseName,
            reasoningLanguage,
            verbose,
            createLabelsIfMissing,
        });

        // STEP 5: Return successful response
        return {
            success: true,
            data: labelingResult,
        };

    } catch (error) {
        console.error('❌ Error in label emails action:', error);

        return {
            success: false,
            error: 'Failed to label emails',
            details: process.env.NODE_ENV === 'development' ? error : undefined,
        };
    }
}

/**
 * Server action to label emails from a fresh inbox analysis
 *
 * This is a convenience action that combines inbox analysis with labeling.
 * Use this when you want to analyze and label in one operation.
 *
 * @deprecated Use analyzeInbox followed by labelEmails for better control
 * @param input - Parameters for analysis and labeling
 * @returns Response with both analysis and labeling results
 */
export async function analyzeAndLabelEmails(input: {
    courseId: string;
    connectedAccountId: string;
    maxEmails?: number;
    includeRead?: boolean;
    reasoningLanguage?: string;
    verbose?: boolean;
    createLabelsIfMissing?: boolean;
}): Promise<{
    success: boolean;
    emails?: CategorizedEmailWithPriority[];
    labelingResult?: EmailLabelingResult;
    error?: string;
}> {
    try {
        const supabase = await createClient();
        const user = await getCurrentUser(supabase);

        if (!user) {
            return {
                success: false,
                error: 'unauthorized',
            };
        }

        // Note: This would need the actual analyzeInbox action to be imported
        // For now, this is a placeholder structure showing how it could work
        // You would need to import and use the analyzeInbox action here

        return {
            success: false,
            error: 'Not yet implemented - use labelEmails with an existing analysis result',
        };
    } catch (error) {
        console.error('❌ Error in analyze and label emails action:', error);

        return {
            success: false,
            error: 'Failed to analyze and label emails',
        };
    }
}
