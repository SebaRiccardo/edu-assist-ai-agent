/**
 * Advanced Multi-Agent Workflow Example
 *
 * This demonstrates a complete 4-agent workflow using individual agent modules:
 * 1. Email Analysis Agent (analyzeInboxForCourse)
 * 2. Priority Classification Agent (classifyEmailPriorities)
 * 3. Response Generation Agent (generateBatchResponses)
 * 4. Quality Review Agent (reviewBatchQuality)
 *
 * Each agent is now in its own reusable module and can be used independently
 * or combined in different workflows.
 */

import { inboxAnalyzerAgent } from '@/agents/inbox-analyzer';
import {
  classifyEmailPriorities,
  getPriorityStats,
  filterByPriority,
  type PriorityLevel,
} from '@/agents/classify-priorities';
import {
  generateBatchResponses,
  getResponseStats,
  type EmailInfo,
  type PriorityInfo,
} from '@/agents/generate-responses';
import {
  reviewBatchQuality,
  calculateQualityStats,
  filterByApproval,
  type DraftResponse,
} from '@/agents/review-quality';

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

  const emailAnalysis = await inboxAnalyzerAgent({
    userId,
    courseId,
    maxEmails,
    includeRead: false,
    verbose: true,
  });

  const analysisTime = Date.now() - startTime;

  console.log('✅ Results:');
  console.log(`   • Total emails: ${emailAnalysis.totalAnalyzed}`);
  console.log(
    `   • Course-related: ${emailAnalysis.analysis.stats.totalCourseRelated}`
  );
  console.log(
    `   • Avg confidence: ${emailAnalysis.analysis.stats.avgConfidence}%`
  );
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
    email => email.isRelated && email.confidence > 75
  );

  console.log(
    `\n   • Relevant emails (>75% confidence): ${relevantEmails.length}\n`
  );

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

  const prioritizationResult = await classifyEmailPriorities({
    emails: relevantEmails.map(e => ({
      id: e.id,
      from: e.from,
      subject: e.subject,
      body: e.body,
      category: e.category,
      reasoning: e.reasoning,
    })),
    courseName: emailAnalysis.courseName,
    analysisSummary: emailAnalysis.analysis.summary,
  });

  console.log('✅ Results:');
  const priorityCounts = getPriorityStats(prioritizationResult);

  console.log(`   • Critical: ${priorityCounts.critical}`);
  console.log(`   • High: ${priorityCounts.high}`);
  console.log(`   • Medium: ${priorityCounts.medium}`);
  console.log(`   • Low: ${priorityCounts.low}`);
  console.log(`\n   Summary: ${prioritizationResult.summary}\n`);

  // ========================================
  // AGENT 3: RESPONSE GENERATION
  // ========================================
  console.log('✍️  AGENT 3: RESPONSE GENERATION AGENT');
  console.log('─'.repeat(70));
  console.log('Task: Generate draft responses for high-priority emails\n');

  // Focus on critical and high priority emails
  const highPriorityList = filterByPriority(prioritizationResult, [
    'critical',
    'high',
  ] as PriorityLevel[]);

  console.log(
    `   Processing ${highPriorityList.length} high-priority emails...\n`
  );

  // Prepare emails with priority info for batch generation
  const emailsToRespond = highPriorityList
    .slice(0, 3) // Limit for demo
    .map(priorityInfo => {
      const email = relevantEmails.find(e => e.id === priorityInfo.emailId);
      if (!email) return null;

      return {
        email: {
          id: email.id,
          from: email.from,
          subject: email.subject,
          body: email.body,
          category: email.category,
          reasoning: email.reasoning,
        } as EmailInfo,
        priority: {
          priority: priorityInfo.priority,
          responseDeadline: priorityInfo.responseDeadline,
          reasoning: priorityInfo.reasoning,
        } as PriorityInfo,
      };
    })
    .filter(
      (item): item is { email: EmailInfo; priority: PriorityInfo } =>
        item !== null
    );

  const draftResponses = await generateBatchResponses(
    emailsToRespond,
    emailAnalysis.courseName,
    {
      maxResponses: 3,
    }
  );

  // ========================================
  // AGENT 4: QUALITY REVIEW
  // ========================================
  console.log('🔍 AGENT 4: QUALITY REVIEW AGENT');
  console.log('─'.repeat(70));
  console.log('Task: Review and score draft responses\n');

  const qualityReviews = await reviewBatchQuality(
    draftResponses as DraftResponse[],
    emailAnalysis.courseName
  );

  // Calculate statistics
  const qualityStats = calculateQualityStats(qualityReviews);
  console.log(`✅ Average quality score: ${qualityStats.averageScore}/100\n`);

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
  console.log(`  • Avg quality score: ${qualityStats.averageScore}/100`);
  console.log(
    `  • Approved: ${qualityStats.approvedCount}/${qualityReviews.length}\n`
  );

  console.log('🎉 Workflow Complete!\n');

  return {
    analysis: emailAnalysis,
    prioritization: prioritizationResult,
    responses: draftResponses,
    qualityReviews,
    qualityStats,
    summary: {
      totalEmails: emailAnalysis.totalAnalyzed,
      relevantEmails: relevantEmails.length,
      highPriorityCount: highPriorityList.length,
      responsesGenerated: draftResponses.length,
      avgQualityScore: qualityStats.averageScore,
      approvedResponses: qualityStats.approvedCount,
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
