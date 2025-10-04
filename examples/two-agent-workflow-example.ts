/**
 * Example: Two-Agent Workflow
 * 
 * Agent 1: Analyze and categorize emails (using encapsulated function)
 * Agent 2: Generate draft responses for student emails
 * 
 * This demonstrates how to pass results from the email analysis agent
 * to another agent for further processing.
 */

import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { analyzeInboxForCourse } from '@/app/api/inbox/analyze/route';
import type { CategorizedEmail } from '@/app/api/inbox/analyze/route';

/**
 * Two-agent workflow: Analyze emails + Generate responses
 */
export async function analyzeAndRespondToEmails(
    userId: string,
    courseId: string,
    maxEmails: number = 20
) {
    console.log('🚀 Starting two-agent workflow...\n');

    // ========================================
    // AGENT 1: EMAIL ANALYSIS AGENT
    // ========================================
    console.log('📧 AGENT 1: Analyzing emails...');
    console.log('─'.repeat(60));

    const analysisResult = await analyzeInboxForCourse({
        userId,
        courseId,
        maxEmails,
        includeRead: false,
        verbose: false, // Fast mode
    });

    console.log(`✅ Analysis complete!`);
    console.log(`   Total analyzed: ${analysisResult.totalAnalyzed}`);
    console.log(`   Course-related: ${analysisResult.analysis.stats.courseRelated}`);
    console.log(`   Avg confidence: ${analysisResult.analysis.stats.avgConfidence}%`);
    console.log(`   Course: ${analysisResult.courseName}\n`);

    // Filter student emails with high confidence
    const studentEmails = analysisResult.emails.filter(
        (email: CategorizedEmail) =>
            email.category === 'student_email' &&
            email.confidence > 80 &&
            email.isRelated
    );

    console.log(`📚 Found ${studentEmails.length} high-confidence student emails\n`);

    if (studentEmails.length === 0) {
        console.log('No student emails to process. Workflow complete.');
        return {
            analysis: analysisResult,
            responses: [],
        };
    }

    // ========================================
    // AGENT 2: RESPONSE GENERATION AGENT
    // ========================================
    console.log('✍️  AGENT 2: Generating draft responses...');
    console.log('─'.repeat(60));

    const responses = [];

    for (const email of studentEmails.slice(0, 5)) {
        // Limit to first 5 for demo
        console.log(`\n📝 Processing: "${email.subject}"`);
        console.log(`   From: ${email.from}`);
        console.log(`   Category: ${email.category}`);
        console.log(`   Confidence: ${email.confidence}%`);

        const responseResult = await generateText({
            model: google('gemini-2.0-flash'),
            system: `You are a helpful university professor assistant that drafts professional, friendly email responses to students.`,
            prompt: `Draft a professional email response to this student.

**Course Context:**
- Course: ${analysisResult.courseName}
- Email Category: ${email.category}
- AI Reasoning: ${email.reasoning}

**Student Email:**
From: ${email.from}
Subject: ${email.subject}
Body: ${email.body}

**Instructions:**
1. Be professional but warm and approachable
2. Address the student's specific question or concern
3. Provide helpful information or guidance
4. Maintain appropriate academic boundaries
5. Keep response concise (2-3 paragraphs)
6. Include a clear call-to-action if needed

Draft the response email:`,
        });

        responses.push({
            originalEmail: {
                id: email.id,
                from: email.from,
                subject: email.subject,
                category: email.category,
                confidence: email.confidence,
            },
            draftResponse: responseResult.text,
        });

        console.log(`   ✅ Draft generated (${responseResult.text.length} chars)`);
    }

    console.log('\n' + '═'.repeat(60));
    console.log('🎉 Two-agent workflow complete!\n');

    return {
        analysis: analysisResult,
        studentEmailsFound: studentEmails.length,
        responsesGenerated: responses.length,
        responses,
    };
}

/**
 * Example usage in an API route
 */
export async function POST(request: Request) {
    try {
        const { userId, courseId, maxEmails } = await request.json();

        const result = await analyzeAndRespondToEmails(userId, courseId, maxEmails);

        return Response.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error('❌ Workflow failed:', error);
        return Response.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

// ========================================
// EXAMPLE OUTPUT
// ========================================

/*
🚀 Starting two-agent workflow...

📧 AGENT 1: Analyzing emails...
────────────────────────────────────────────────────────────
✅ Analysis complete!
   Total analyzed: 15
   Course-related: 12
   Avg confidence: 87%
   Course: CS 101: Introduction to Computer Science

📚 Found 8 high-confidence student emails

✍️  AGENT 2: Generating draft responses...
────────────────────────────────────────────────────────────

📝 Processing: "Question about Assignment 3"
   From: student1@university.edu
   Category: student_email
   Confidence: 95%
   ✅ Draft generated (847 chars)

📝 Processing: "Help with recursion concept"
   From: student2@university.edu
   Category: student_email
   Confidence: 92%
   ✅ Draft generated (923 chars)

📝 Processing: "Office hours availability"
   From: student3@university.edu
   Category: student_email
   Confidence: 88%
   ✅ Draft generated (621 chars)

════════════════════════════════════════════════════════════
🎉 Two-agent workflow complete!

Response:
{
  "analysis": {
    "totalAnalyzed": 15,
    "courseName": "CS 101: Introduction to Computer Science",
    "analysis": {
      "summary": "Most emails are from students asking about assignments...",
      "stats": {
        "courseRelated": 12,
        "avgConfidence": 87
      }
    }
  },
  "studentEmailsFound": 8,
  "responsesGenerated": 5,
  "responses": [
    {
      "originalEmail": {
        "from": "student1@university.edu",
        "subject": "Question about Assignment 3"
      },
      "draftResponse": "Dear Student,\n\nThank you for reaching out..."
    }
  ]
}
*/
