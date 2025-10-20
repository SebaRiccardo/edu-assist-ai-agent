/**
 * Email Labeling Agent
 *
 * Applies Gmail labels to categorized emails using AI-driven analysis.
 * This agent takes the output from inbox analysis and applies the suggested
 * labels to actual Gmail messages via Composio's Gmail API.
 */

import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { ComposioService } from '@/lib/services/composio';
import type { CategorizedEmail, CategorizedEmailWithPriority, GmailMessageBody } from '@/types';

export const maxDuration = 60;

/**
 * Result of labeling a single email
 */
export interface LabelResult {
    emailId: string;
    success: boolean;
    appliedLabel?: string;
    error?: string;
    labelId?: string;
}

/**
 * Complete labeling operation result
 */
export interface EmailLabelingResult {
    totalProcessed: number;
    successCount: number;
    failureCount: number;
    results: LabelResult[];
    summary: string;
}

/**
 * Input parameters for email labeling agent
 */
export interface EmailLabelingParams {
    userId: string
    connectedAccountId: string;
    emails: CategorizedEmailWithPriority[] | CategorizedEmail[];
    courseName: string;
    reasoningLanguage?: string;
    verbose?: boolean;
    createLabelsIfMissing?: boolean;
}

/**
 * Email Labeling Agent
 *
 * Takes categorized emails with priorities and applies the suggested labels to Gmail emails
 * using Composio's Gmail integration.
 *
 * @param params - Labeling parameters
 * @returns Result of the labeling operation
 *
 * @example
 * ```typescript
 * const result = await emailLabelingAgent({
 *   connectedAccountId: 'acc_123',
 *   emails: categorizedEmails,
 *   courseName: 'CS 101',
 *   createLabelsIfMissing: true
 * });
 *
 * console.log(`Successfully labeled ${result.successCount} emails`);
 * ```
 */
export async function emailLabelingAgent(
    params: EmailLabelingParams
): Promise<EmailLabelingResult> {
    const {
        connectedAccountId,
        emails,
        courseName,
        reasoningLanguage = 'English',
        verbose = true,
        createLabelsIfMissing = true,
        userId
    } = params;

    if (verbose) {
        console.log(`🏷️  Starting email labeling process...`);
        console.log(`   • Emails to label: ${emails.length}`);
        console.log(`   • Course: ${courseName}`);
    }

    const results: LabelResult[] = [];
    const labelCache = new Map<string, string>(); // Cache for label name -> label ID mapping
    const emailsMap = new Map<string, GmailMessageBody>(); // Cache for fetched emails

    try {
        const client = ComposioService.getClient();

        // STEP 1: Fetch all emails by ID to get current labels
        if (verbose) {
            console.log(`📥 Fetching ${emails.length} emails to check current labels...`);
        }

        for (const email of emails) {
            try {
                const fetchResponse = await client.tools.execute('GMAIL_FETCH_MESSAGE_BY_MESSAGE_ID', {
                    userId,
                    connectedAccountId,
                    arguments: {
                        user_id: 'me',
                        message_id: email.id,
                        format: 'full',
                    },
                });

                if (fetchResponse.successful && fetchResponse.data) {
                    emailsMap.set(email.id, fetchResponse.data as any as GmailMessageBody);
                    if (verbose) {
                        console.log(`   ✓ Fetched email: ${email.subject.substring(0, 50)}...`);
                    }
                }
            } catch (fetchError) {
                console.error(`   ✗ Failed to fetch email ${email.id}:`, fetchError);
            }
        }

        if (verbose) {
            console.log(`   • Successfully fetched ${emailsMap.size} of ${emails.length} emails`);
        }

        // STEP 2: Get existing Gmail labels
        if (verbose) {
            console.log(`📋 Fetching existing Gmail labels...`);
        }

        const existingLabelsResponse = await client.tools.execute('GMAIL_LIST_LABELS', {
            userId,
            connectedAccountId,
            arguments: {
                user_id: 'me',
            },
        });

        if (!existingLabelsResponse.successful) {
            throw new Error('Failed to fetch existing Gmail labels');
        }

        const existingLabels = (existingLabelsResponse.data as any)?.labels || [];

        // Build label cache (label name -> label ID)
        for (const label of existingLabels as Array<{ name: string; id: string }>) {
            labelCache.set(label.name, label.id);
        }

        if (verbose) {
            console.log(`   • Found ${existingLabels.length} existing labels`);
        }

        // STEP 3: Process each email and apply labels
        if (verbose) {
            console.log(`\n🏷️  Processing emails and applying labels...`);
        }

        for (const email of emails) {
            try {
                const fetchedEmail = emailsMap.get(email.id);

                if (!fetchedEmail) {
                    results.push({
                        emailId: email.id,
                        success: false,
                        error: 'Failed to fetch email details',
                    });
                    continue;
                }

                // Get current labels on the email
                const currentLabelIds = fetchedEmail.labelIds || [];

                // Get the suggested label ID
                let suggestedLabelId = labelCache.get(email.suggestedLabel);

                // STEP 4: Check if the label already exists on the email
                if (suggestedLabelId && currentLabelIds.includes(suggestedLabelId)) {
                    results.push({
                        emailId: email.id,
                        success: true,
                        appliedLabel: email.suggestedLabel,
                        labelId: suggestedLabelId,
                    });

                    if (verbose) {
                        console.log(`   ⏭️  Label "${email.suggestedLabel}" already applied to: ${email.subject.substring(0, 50)}...`);
                    }
                    continue;
                }

                // STEP 5: Create label if it doesn't exist
                if (!suggestedLabelId && createLabelsIfMissing) {
                    if (verbose) {
                        console.log(`   ➕ Creating new label: "${email.suggestedLabel}"`);
                    }

                    const createLabelResponse = await client.tools.execute('GMAIL_CREATE_LABEL', {
                        userId,
                        connectedAccountId,
                        arguments: {
                            user_id: 'me',
                            label_name: email.suggestedLabel,
                            label_list_visibility: 'labelShow',
                            message_list_visibility: 'show',
                        },
                    });

                    if (createLabelResponse.successful && (createLabelResponse.data as any)?.id) {
                        const createdLabelId = (createLabelResponse.data as any).id as string;
                        suggestedLabelId = createdLabelId;
                        labelCache.set(email.suggestedLabel, createdLabelId);

                        if (verbose) {
                            console.log(`   ✓ Label created successfully`);
                        }
                    } else {
                        results.push({
                            emailId: email.id,
                            success: false,
                            error: `Failed to create label: ${email.suggestedLabel}`,
                        });
                        continue;
                    }
                }

                // STEP 6: Apply label to email
                if (suggestedLabelId) {
                    const addLabelResponse = await client.tools.execute('GMAIL_ADD_LABEL_TO_EMAIL', {
                        userId,
                        connectedAccountId,
                        arguments: {
                            user_id: 'me',
                            message_id: email.id,
                            add_label_ids: [suggestedLabelId],
                        },
                    });

                    if (addLabelResponse.successful) {
                        results.push({
                            emailId: email.id,
                            success: true,
                            appliedLabel: email.suggestedLabel,
                            labelId: suggestedLabelId,
                        });

                        if (verbose) {
                            console.log(`   ✓ Applied "${email.suggestedLabel}" to: ${email.subject.substring(0, 50)}...`);
                        }
                    } else {
                        results.push({
                            emailId: email.id,
                            success: false,
                            error: addLabelResponse.error || 'Unknown error applying label',
                        });

                        if (verbose) {
                            console.log(`   ✗ Failed to apply label: ${addLabelResponse.error}`);
                        }
                    }
                } else {
                    results.push({
                        emailId: email.id,
                        success: false,
                        error: `Label "${email.suggestedLabel}" not found and creation is disabled`,
                    });
                }
            } catch (emailError) {
                results.push({
                    emailId: email.id,
                    success: false,
                    error: emailError instanceof Error ? emailError.message : 'Unknown error',
                });

                if (verbose) {
                    console.error(`   ✗ Error processing email ${email.id}:`, emailError);
                }
            }
        }

        // STEP 7: Generate AI summary of the labeling operation using generateText
        const successCount = results.filter(r => r.success).length;
        const failureCount = results.filter(r => !r.success).length;
        const skippedCount = results.filter(r => r.success && emailsMap.get(r.emailId)?.labelIds?.includes(r.labelId || '')).length;
        const appliedCount = successCount - skippedCount;

        if (verbose) {
            console.log(`\n🤖 Generating AI summary...`);
        }

        const { text: summary } = await generateText({
            model: google('gemini-2.0-flash'),
            system: `You are an assistant that provides concise summaries of email labeling operations.`,
            prompt: `Summarize this email labeling operation:

Total emails processed: ${results.length}
Successfully labeled: ${successCount}
Already had label: ${skippedCount}
Newly labeled: ${appliedCount}
Failed: ${failureCount}

Labels applied:
${Array.from(new Set(results.filter(r => r.success).map(r => r.appliedLabel)))
                    .map(label => `- ${label}`)
                    .join('\n')}

Course: ${courseName}

Provide a brief, professional summary in ${reasoningLanguage} highlighting:
1. Overall success rate and efficiency (skipped already-labeled emails)
2. Labels that were created/applied
3. Any issues encountered (if failures > 0)

Keep it concise (2-3 sentences).`,
        });

        if (verbose) {
            console.log(`\n📊 Labeling Complete!`);
            console.log(`   • Total processed: ${results.length}`);
            console.log(`   • Successful: ${successCount}`);
            console.log(`   • Already labeled: ${skippedCount}`);
            console.log(`   • Newly labeled: ${appliedCount}`);
            console.log(`   • Failed: ${failureCount}`);
            console.log(`   • Summary: ${summary}`);
        }

        return {
            totalProcessed: results.length,
            successCount,
            failureCount,
            results,
            summary: summary.trim(),
        };
    } catch (error) {
        console.error('❌ Error in email labeling agent:', error);

        return {
            totalProcessed: emails.length,
            successCount: 0,
            failureCount: emails.length,
            results: emails.map(email => ({
                emailId: email.id,
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            })),
            summary: `Failed to label emails: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
    }
}

/**
 * Get labeling statistics grouped by label
 *
 * @param result - Email labeling result
 * @returns Statistics by label
 */
export function getLabelingStats(result: EmailLabelingResult) {
    const labelCounts = result.results
        .filter(r => r.success && r.appliedLabel)
        .reduce((acc, r) => {
            acc[r.appliedLabel!] = (acc[r.appliedLabel!] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

    return {
        byLabel: labelCounts,
        totalLabelsCreated: Object.keys(labelCounts).length,
        successRate: result.totalProcessed > 0
            ? Math.round((result.successCount / result.totalProcessed) * 100)
            : 0,
    };
}
