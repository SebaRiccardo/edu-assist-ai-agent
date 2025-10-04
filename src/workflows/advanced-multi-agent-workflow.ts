/**
 * Advanced Multi-Agent Workflow Example
 * 
 * This demonstrates a complete 4-agent workflow:
 * 1. Email Analysis Agent (encapsulated function)
 * 2. Priority Classification Agent
 * 3. Response Generation Agent
 * 4. Quality Review Agent
 */

import { generateText, generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { analyzeInboxForCourse } from '@/agents/analyze-inbox';

/**
 * Priority levels for emails
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
 * Response quality assessment
 */
const qualityReviewSchema = z.object({
    emailId: z.string(),
    approved: z.boolean(),
    qualityScore: z.number().min(0).max(100),
    suggestions: z.array(z.string()),
    reasoning: z.string(),
});

/**
 * Complete multi-agent email processing workflow
 */
export async function advancedEmailWorkflow(
    userId: string,
    courseId: string,
    maxEmails: number = 30
) {
    console.log('🚀 Starting Advanced 4-Agent Workflow\n');
    console.log('═'.repeat(70) + '\n');

    // ========================================
    // AGENT 1: EMAIL ANALYSIS
    // ========================================
    console.log('📧 AGENT 1: EMAIL ANALYSIS AGENT');
    console.log('─'.repeat(70));
    console.log('Task: Fetch and categorize emails from Gmail\n');

    const startTime = Date.now();

    const emailAnalysis = await analyzeInboxForCourse({
        userId,
        courseId,
        maxEmails,
        includeRead: false,
        verbose: true,
    });

    const analysisTime = Date.now() - startTime;

    console.log('✅ Results:');
    console.log(`   • Total emails: ${emailAnalysis.totalAnalyzed}`);
    console.log(`   • Course-related: ${emailAnalysis.analysis.stats.courseRelated}`);
    console.log(`   • Avg confidence: ${emailAnalysis.analysis.stats.avgConfidence}%`);
    console.log(`   • Processing time: ${analysisTime}ms`);
    console.log(`   • Course: ${emailAnalysis.courseName}`);

    console.log('\n   Category breakdown:');
    Object.entries(emailAnalysis.analysis.stats.categoryBreakdown).forEach(
        ([category, count]) => {
            console.log(`     - ${category}: ${count}`);
        }
    );

    // Filter course-related emails with good confidence
    const relevantEmails = emailAnalysis.emails.filter(
        (email) => email.isRelated && email.confidence > 75
    );

    console.log(`\n   • Relevant emails (>75% confidence): ${relevantEmails.length}\n`);

    if (relevantEmails.length === 0) {
        console.log('No relevant emails found. Workflow complete.\n');
        return { analysis: emailAnalysis, stages: [] };
    }

    // ========================================
    // AGENT 2: PRIORITY CLASSIFICATION
    // ========================================
    console.log('⚡ AGENT 2: PRIORITY CLASSIFICATION AGENT');
    console.log('─'.repeat(70));
    console.log('Task: Determine urgency and response deadlines\n');

    const prioritizationResult = await generateObject({
        model: google('gemini-2.0-flash'),
        schema: priorityListSchema,
        system: `You are an expert at triaging university course emails and determining response priority based on urgency and importance.`,
        prompt: `Analyze these course-related emails and assign priority levels.

**Course Context:**
${emailAnalysis.courseName}

**AI Analysis Summary:**
${emailAnalysis.analysis.summary}

**Emails to Prioritize:**
${JSON.stringify(
            relevantEmails.map((e) => ({
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
- CRITICAL: Technical issues blocking work, urgent admin matters, emergencies
- HIGH: Assignment questions near deadline, grade disputes, time-sensitive requests
- MEDIUM: General course questions, clarifications, non-urgent admin
- LOW: Thank you notes, general inquiries, FYI messages

For each email, provide:
1. Priority level
2. Suggested response deadline
3. Clear reasoning

Consider:
- Deadlines and time constraints
- Impact on student learning
- Administrative requirements
- Complexity of required response`,
    });

    console.log('✅ Results:');
    const priorityCounts = {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
    };

    prioritizationResult.object.priorities.forEach((p) => {
        priorityCounts[p.priority]++;
    });

    console.log(`   • Critical: ${priorityCounts.critical}`);
    console.log(`   • High: ${priorityCounts.high}`);
    console.log(`   • Medium: ${priorityCounts.medium}`);
    console.log(`   • Low: ${priorityCounts.low}`);
    console.log(`\n   Summary: ${prioritizationResult.object.summary}\n`);

    // ========================================
    // AGENT 3: RESPONSE GENERATION
    // ========================================
    console.log('✍️  AGENT 3: RESPONSE GENERATION AGENT');
    console.log('─'.repeat(70));
    console.log('Task: Generate draft responses for high-priority emails\n');

    // Focus on critical and high priority emails
    const highPriorityEmails = prioritizationResult.object.priorities.filter(
        (p) => ['critical', 'high'].includes(p.priority)
    );

    console.log(`Processing ${highPriorityEmails.length} high-priority emails...\n`);

    const draftResponses = [];

    for (const priorityInfo of highPriorityEmails.slice(0, 3)) {
        // Limit for demo
        const email = relevantEmails.find((e) => e.id === priorityInfo.emailId);
        if (!email) continue;

        console.log(`   📝 Drafting response for: "${email.subject}"`);
        console.log(`      Priority: ${priorityInfo.priority}`);
        console.log(`      Deadline: ${priorityInfo.responseDeadline}`);

        const responseResult = await generateText({
            model: google('gemini-2.0-flash'),
            system: `You are a university professor assistant drafting professional, helpful email responses.`,
            prompt: `Draft a response to this ${priorityInfo.priority} priority email.

**Email Details:**
From: ${email.from}
Subject: ${email.subject}
Body: ${email.body}

**Context:**
- Course: ${emailAnalysis.courseName}
- Category: ${email.category}
- Priority: ${priorityInfo.priority}
- Deadline: ${priorityInfo.responseDeadline}
- Urgency Reason: ${priorityInfo.reasoning}
- AI Analysis: ${email.reasoning}

**Response Guidelines:**
1. Address urgency appropriately (this is ${priorityInfo.priority} priority)
2. Be professional, clear, and helpful
3. Provide specific, actionable information
4. Include next steps if applicable
5. Maintain appropriate tone for urgency level
6. Keep response concise but thorough

Draft the complete email response:`,
        });

        draftResponses.push({
            emailId: email.id,
            originalEmail: {
                from: email.from,
                subject: email.subject,
                category: email.category,
            },
            priority: priorityInfo.priority,
            deadline: priorityInfo.responseDeadline,
            draftResponse: responseResult.text,
        });

        console.log(`      ✅ Draft generated (${responseResult.text.length} chars)\n`);
    }

    console.log(`✅ Generated ${draftResponses.length} draft responses\n`);

    // ========================================
    // AGENT 4: QUALITY REVIEW
    // ========================================
    console.log('🔍 AGENT 4: QUALITY REVIEW AGENT');
    console.log('─'.repeat(70));
    console.log('Task: Review and score draft responses\n');

    const qualityReviews = [];

    for (const draft of draftResponses) {
        const review = await generateObject({
            model: google('gemini-2.0-flash'),
            schema: qualityReviewSchema,
            system: `You are an expert email quality reviewer ensuring responses are professional, accurate, and helpful.`,
            prompt: `Review this draft email response for quality.

**Original Email:**
From: ${draft.originalEmail.from}
Subject: ${draft.originalEmail.subject}
Category: ${draft.originalEmail.category}
Priority: ${draft.priority}

**Draft Response:**
${draft.draftResponse}

**Quality Criteria:**
1. Professional tone (0-20 points)
2. Addresses student's question/concern (0-30 points)
3. Clear and actionable information (0-20 points)
4. Appropriate for urgency level (0-15 points)
5. Grammar and clarity (0-15 points)

Provide:
- Overall quality score (0-100)
- Approval recommendation (true/false)
- Specific suggestions for improvement
- Reasoning for your assessment`,
        });

        qualityReviews.push({
            ...review.object,
        });

        const approvalIcon = review.object.approved ? '✅' : '⚠️';
        console.log(`   ${approvalIcon} Email: ${draft.originalEmail.subject}`);
        console.log(`      Quality Score: ${review.object.qualityScore}/100`);
        console.log(`      Approved: ${review.object.approved}`);
        if (!review.object.approved) {
            console.log(`      Suggestions: ${review.object.suggestions.join(', ')}`);
        }
        console.log();
    }

    const avgQualityScore =
        qualityReviews.reduce((sum, r) => sum + r.qualityScore, 0) /
        qualityReviews.length;

    console.log(`✅ Average quality score: ${avgQualityScore.toFixed(1)}/100\n`);

    // ========================================
    // WORKFLOW SUMMARY
    // ========================================
    console.log('═'.repeat(70));
    console.log('📊 WORKFLOW SUMMARY');
    console.log('═'.repeat(70) + '\n');

    console.log('Agent 1 (Analysis):');
    console.log(`  • Analyzed ${emailAnalysis.totalAnalyzed} emails`);
    console.log(`  • Found ${relevantEmails.length} relevant emails\n`);

    console.log('Agent 2 (Prioritization):');
    console.log(`  • Critical: ${priorityCounts.critical}`);
    console.log(`  • High: ${priorityCounts.high}`);
    console.log(`  • Medium: ${priorityCounts.medium}`);
    console.log(`  • Low: ${priorityCounts.low}\n`);

    console.log('Agent 3 (Response Generation):');
    console.log(`  • Generated ${draftResponses.length} draft responses\n`);

    console.log('Agent 4 (Quality Review):');
    console.log(`  • Reviewed ${qualityReviews.length} responses`);
    console.log(`  • Avg quality score: ${avgQualityScore.toFixed(1)}/100`);
    console.log(
        `  • Approved: ${qualityReviews.filter((r) => r.approved).length}/${qualityReviews.length
        }\n`
    );

    console.log('🎉 Workflow Complete!\n');

    return {
        analysis: emailAnalysis,
        prioritization: prioritizationResult.object,
        responses: draftResponses,
        qualityReviews,
        summary: {
            totalEmails: emailAnalysis.totalAnalyzed,
            relevantEmails: relevantEmails.length,
            highPriorityCount: highPriorityEmails.length,
            responsesGenerated: draftResponses.length,
            avgQualityScore,
            approvedResponses: qualityReviews.filter((r) => r.approved).length,
        },
    };
}

/**
 * API Route handler
 */
export async function POST(request: Request) {
    try {
        const { userId, courseId, maxEmails } = await request.json();

        const result = await advancedEmailWorkflow(userId, courseId, maxEmails);

        return Response.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error('❌ Advanced workflow failed:', error);
        return Response.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
