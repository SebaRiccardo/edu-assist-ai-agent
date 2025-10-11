/**
 * Quality Review Agent
 *
 * Reviews draft email responses and provides quality scores,
 * approval recommendations, and improvement suggestions.
 */

import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

/**
 * Draft response to review
 */
export interface DraftResponse {
  emailId: string;
  originalEmail: {
    from: string;
    subject: string;
    category?: string;
  };
  priority: string;
  deadline: string;
  draftResponse: string;
}

/**
 * Quality review result for a single response
 */
export interface QualityReview {
  emailId: string;
  approved: boolean;
  qualityScore: number; // 0-100
  suggestions: string[];
  reasoning: string;
  reviewedAt: string;
}

/**
 * Parameters for quality review
 */
export interface QualityReviewParams {
  draftResponse: DraftResponse;
  courseName?: string;
  model?: string;
}

/**
 * Quality review statistics
 */
export interface QualityStats {
  totalReviewed: number;
  averageScore: number;
  approvedCount: number;
  approvalRate: number;
  scoreDistribution: {
    excellent: number; // 90-100
    good: number; // 70-89
    fair: number; // 50-69
    poor: number; // 0-49
  };
}

/**
 * Zod schema for quality review
 */
const qualityReviewSchema = z.object({
  emailId: z.string(),
  approved: z.boolean(),
  qualityScore: z.number().min(0).max(100),
  suggestions: z.array(z.string()),
  reasoning: z.string(),
});

/**
 * Review a draft email response for quality
 *
 * @param params - Review parameters including draft response
 * @returns Quality review with score and suggestions
 *
 * @example
 * ```typescript
 * const review = await reviewEmailQuality({
 *   draftResponse: {
 *     emailId: 'msg_123',
 *     originalEmail: {
 *       from: 'student@university.edu',
 *       subject: 'Question about Assignment 3',
 *       category: 'student_email'
 *     },
 *     priority: 'high',
 *     deadline: '2025-10-05 5:00 PM',
 *     draftResponse: 'Dear Student...'
 *   },
 *   courseName: 'CS 101'
 * });
 *
 * if (review.approved && review.qualityScore > 80) {
 *   await sendEmail(draftResponse);
 * }
 * ```
 */
export async function reviewEmailQuality(
  params: QualityReviewParams
): Promise<QualityReview> {
  const { draftResponse, courseName = '', model = 'gemini-2.0-flash' } = params;

  console.log(`🔍 Reviewing: ${draftResponse.originalEmail.subject}`);

  const result = await generateObject({
    model: google(model),
    schema: qualityReviewSchema,
    system: `You are an expert email quality reviewer ensuring responses are professional, accurate, and helpful. You evaluate university professor emails to students with high standards for academic communication.`,
    prompt: `Review this draft email response for quality and provide detailed feedback.

**Original Email:**
From: ${draftResponse.originalEmail.from}
Subject: ${draftResponse.originalEmail.subject}
Category: ${draftResponse.originalEmail.category || 'general'}
Priority: ${draftResponse.priority}
Deadline: ${draftResponse.deadline}
${courseName ? `Course: ${courseName}` : ''}

**Draft Response:**
${draftResponse.draftResponse}

**Quality Evaluation Criteria:**

1. **Professional Tone (0-20 points)**
   - Appropriate greeting and closing
   - Maintains professor-student boundaries
   - Warm but professional language
   - No informal or casual language

2. **Content Relevance (0-30 points)**
   - Directly addresses the student's question/concern
   - Provides specific, actionable information
   - Stays on topic
   - Doesn't make assumptions

3. **Clarity & Actionability (0-20 points)**
   - Clear, concise language
   - Easy to understand
   - Specific next steps provided
   - No ambiguity

4. **Urgency Appropriateness (0-15 points)**
   - Response matches priority level
   - Appropriate level of detail for urgency
   - Timeline expectations set if needed

5. **Grammar & Structure (0-15 points)**
   - No grammatical errors
   - Proper punctuation
   - Well-structured paragraphs
   - Professional formatting

**Approval Criteria:**
- Score ≥ 70: Generally approvable
- Score < 70: Needs revision
- Critical/High priority emails need score ≥ 75

Provide:
1. Overall quality score (0-100) - sum of all criteria
2. Approval recommendation (true/false)
3. Specific, actionable suggestions for improvement (even if approved)
4. Clear reasoning explaining the score and approval decision

Be thorough and constructive in your feedback.`,
  });

  const review: QualityReview = {
    ...result.object,
    reviewedAt: new Date().toISOString(),
  };

  const approvalIcon = review.approved ? '✅' : '⚠️';
  console.log(`   ${approvalIcon} Score: ${review.qualityScore}/100`);
  console.log(`   Approved: ${review.approved}`);
  if (!review.approved && review.suggestions.length > 0) {
    console.log(`   Suggestions: ${review.suggestions.slice(0, 2).join(', ')}`);
  }

  return review;
}

/**
 * Review multiple draft responses
 *
 * @param draftResponses - Array of draft responses to review
 * @param courseName - Course name for context
 * @param model - AI model to use
 * @returns Array of quality reviews
 *
 * @example
 * ```typescript
 * const reviews = await reviewBatchQuality(draftResponses, 'CS 101');
 * const approved = reviews.filter(r => r.approved);
 * ```
 */
export async function reviewBatchQuality(
  draftResponses: DraftResponse[],
  courseName?: string,
  model?: string
): Promise<QualityReview[]> {
  console.log(`\n🔍 Reviewing ${draftResponses.length} draft responses...`);

  const reviews: QualityReview[] = [];

  for (const draft of draftResponses) {
    const review = await reviewEmailQuality({
      draftResponse: draft,
      courseName,
      model,
    });

    reviews.push(review);
  }

  console.log(`✅ Reviewed ${reviews.length} responses\n`);

  return reviews;
}

/**
 * Calculate quality statistics from reviews
 *
 * @param reviews - Array of quality reviews
 * @returns Quality statistics
 */
export function calculateQualityStats(reviews: QualityReview[]): QualityStats {
  const totalReviewed = reviews.length;
  const averageScore =
    reviews.reduce((sum, r) => sum + r.qualityScore, 0) / totalReviewed;
  const approvedCount = reviews.filter(r => r.approved).length;
  const approvalRate = (approvedCount / totalReviewed) * 100;

  const scoreDistribution = {
    excellent: reviews.filter(r => r.qualityScore >= 90).length,
    good: reviews.filter(r => r.qualityScore >= 70 && r.qualityScore < 90)
      .length,
    fair: reviews.filter(r => r.qualityScore >= 50 && r.qualityScore < 70)
      .length,
    poor: reviews.filter(r => r.qualityScore < 50).length,
  };

  return {
    totalReviewed,
    averageScore: Math.round(averageScore * 10) / 10,
    approvedCount,
    approvalRate: Math.round(approvalRate * 10) / 10,
    scoreDistribution,
  };
}

/**
 * Filter reviews by approval status
 *
 * @param reviews - Array of quality reviews
 * @param approved - Filter by approval status
 * @returns Filtered reviews
 */
export function filterByApproval(
  reviews: QualityReview[],
  approved: boolean
): QualityReview[] {
  return reviews.filter(r => r.approved === approved);
}

/**
 * Filter reviews by minimum quality score
 *
 * @param reviews - Array of quality reviews
 * @param minScore - Minimum quality score threshold
 * @returns Filtered reviews
 */
export function filterByScore(
  reviews: QualityReview[],
  minScore: number
): QualityReview[] {
  return reviews.filter(r => r.qualityScore >= minScore);
}

/**
 * Get improvement suggestions for unapproved responses
 *
 * @param reviews - Array of quality reviews
 * @returns Map of emailId to suggestions
 */
export function getImprovementSuggestions(
  reviews: QualityReview[]
): Map<string, string[]> {
  const suggestions = new Map<string, string[]>();

  reviews
    .filter(r => !r.approved)
    .forEach(r => {
      suggestions.set(r.emailId, r.suggestions);
    });

  return suggestions;
}
