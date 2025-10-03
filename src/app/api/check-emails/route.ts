import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { Composio } from '@composio/core';
import { VercelProvider } from '@composio/vercel';
import { getCourseById, mockCourses } from '@/lib/mock-data';
import { CategorizedEmail, EmailAnalysisResult } from '@/types';
// Initialize Composio with Vercel provider
const composio = new Composio({
  provider: new VercelProvider(),
  apiKey: process.env.COMPOSIO_API_KEY,
});

// Email analysis schema
const emailAnalysisSchema = z.object({
  isRelated: z.boolean().describe('Whether the email is related to the course'),
  emailType: z.enum(['student_question', 'professor_inquiry', 'general', 'administrative']).describe('Type of email based on sender and content'),
  confidence: z.number().min(0).max(1).describe('Confidence score of the analysis'),
  reasoning: z.string().describe('Brief explanation of why the email was categorized this way'),
});

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { courseId, userId } = await req.json();

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Get course details
    const course = getCourseById(courseId);
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }
   
    // In production, userId would be the connected account ID for Gmail
    // For now, we'll use a mock user ID
    const gmailUserId = userId || 'default-user';

    // Get Gmail tools from Composio
    const tools = await composio.tools.get(gmailUserId, {
      toolkits: ['GMAIL'],
    });

    // Search for unread emails using Composio Gmail tools
    // Note: This is a simplified version. In production, you'd use the actual Gmail search
    const searchQuery = 'is:unread';
    
    // For demonstration, we'll create a mock function to simulate email fetching
    // In production, this would use the Composio Gmail tools
    const mockEmails = await getMockUnreadEmails();

    // Analyze each email with AI
    const categorizedEmails: CategorizedEmail[] = [];

    for (const email of mockEmails) {
      try {
        // Use AI to analyze if the email is related to the course
        const { object: analysis } = await generateObject({
          model: google('gemini-2.5-flash'),
          schema: emailAnalysisSchema,
          system: `You are an expert assistant that helps categorize emails for university professors based on course context.`,
          prompt: `
          
Course Context:
- Course Name: ${course.name}
- Course Description: ${course.description}

Email to Analyze:
- From: ${email.from}
- Subject: ${email.subject}
- Content Preview: ${email.snippet}

Your task:
1. Determine if this email is related to the course "${course.name}" based on the subject and content.
2. Categorize the email type:
   - "student_question": Email from a student asking questions about course material, assignments, or grades
   - "professor_inquiry": Email from another professor or academic staff about the course
   - "general": General emails that might be related but don't fall into other categories
   - "administrative": Administrative emails about course logistics, schedules, etc.
3. Provide a confidence score (0-1) for your analysis.
4. Explain your reasoning briefly.

Consider:
- Course-specific keywords in subject/content
- Question patterns that indicate student queries
- Email sender domain (.edu, specific university domains)
- Context clues from the course description`,
        });

        if (analysis.isRelated) {
          categorizedEmails.push({
            ...email,
            courseId: course.id,
            courseName: course.name,
            emailType: analysis.emailType,
            confidence: analysis.confidence,
            labels: [course.name, analysis.emailType],
            reasoning: analysis.reasoning,
          });

          // In production, you would add labels to the actual Gmail message here
          // using Composio Gmail tools
          console.log(`Categorized email: ${email.subject} as ${analysis.emailType} for ${course.name}`);
        }
      } catch (error) {
        console.error('Error analyzing email:', error);
        // Continue with next email
      }
    }

    return NextResponse.json({
      success: true,
      course: {
        id: course.id,
        name: course.name,
      },
      emails: categorizedEmails,
      totalAnalyzed: mockEmails.length,
      totalCategorized: categorizedEmails.length,
    });

  } catch (error) {
    console.error('Error checking emails:', error);
    return NextResponse.json(
      { error: 'Failed to check emails', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Mock function to simulate fetching unread emails
// In production, this would use Composio Gmail tools
async function getMockUnreadEmails() {
  return [
    {
      id: 'email-1',
      from: 'john.student@university.edu',
      subject: 'Question about Algebra I homework',
      snippet: 'Hi Professor, I have a question about problem 3 on the polynomial factoring assignment...',
      body: 'Hi Professor, I have a question about problem 3 on the polynomial factoring assignment. I\'m not sure how to approach factoring x^3 + 3x^2 - 4x - 12. Could you provide some guidance?',
      receivedAt: new Date().toISOString(),
      isUnread: true,
      labels: [],
    },
    {
      id: 'email-2',
      from: 'sarah.martinez@university.edu',
      subject: 'Calculus II exam date clarification',
      snippet: 'Dear Dr. Johnson, I wanted to confirm the date for our midterm exam...',
      body: 'Dear Dr. Johnson, I wanted to confirm the date for our midterm exam. The syllabus shows October 15th, but I heard some students mention October 20th. Could you please clarify?',
      receivedAt: new Date(Date.now() - 3600000).toISOString(),
      isUnread: true,
      labels: [],
    },
    {
      id: 'email-3',
      from: 'prof.smith@university.edu',
      subject: 'Linear Algebra textbook recommendation',
      snippet: 'Hi Sarah, I\'m teaching a similar Linear Algebra course next semester...',
      body: 'Hi Sarah, I\'m teaching a similar Linear Algebra course next semester and was wondering which textbook you\'re using. I\'ve heard good things about your course structure.',
      receivedAt: new Date(Date.now() - 7200000).toISOString(),
      isUnread: true,
      labels: [],
    },
    {
      id: 'email-4',
      from: 'admin@university.edu',
      subject: 'Room change for Algebra I',
      snippet: 'Please note: Algebra I lecture on Friday will be moved to Room 305...',
      body: 'Please note: Algebra I lecture on Friday, October 10th will be moved to Room 305 due to maintenance in the usual classroom. All other sessions remain in Room 201.',
      receivedAt: new Date(Date.now() - 10800000).toISOString(),
      isUnread: true,
      labels: [],
    },
    {
      id: 'email-5',
      from: 'newsletter@math.org',
      subject: 'Monthly Math Education Newsletter',
      snippet: 'This month\'s highlights in mathematics education...',
      body: 'This month\'s highlights in mathematics education: new teaching strategies, upcoming conferences, and research papers in mathematics pedagogy.',
      receivedAt: new Date(Date.now() - 14400000).toISOString(),
      isUnread: true,
      labels: [],
    },
    {
      id: 'email-6',
      from: 'emily.chen@university.edu',
      subject: 'Office hours question - Linear Algebra',
      snippet: 'Hi Professor Johnson, I was hoping to meet during office hours tomorrow...',
      body: 'Hi Professor Johnson, I was hoping to meet during office hours tomorrow to discuss eigenvalues and eigenvectors. I\'m struggling with the geometric interpretation. Would 2 PM work for you?',
      receivedAt: new Date(Date.now() - 18000000).toISOString(),
      isUnread: true,
      labels: [],
    },
  ];
}
