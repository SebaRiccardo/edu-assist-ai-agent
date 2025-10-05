import { NextRequest, NextResponse } from 'next/server';
import { generateEmailResponse } from '@/agents/generate-responses';
import { checkGmailConnection } from '@/lib/composio';

export const maxDuration = 60;

/**
 * POST /api/email/draft
 * 
 * Generate a draft email response without sending
 */
export async function POST(request: NextRequest) {
    try {
        const {
            userId,
            email,
            priority,
            courseName,
            professorName,
            language = 'English',
        } = await request.json();

        // Validation
        if (!userId) {
            return NextResponse.json(
                { error: 'Missing required parameter: userId' },
                { status: 400 }
            );
        }

        if (!email || !email.id || !email.from || !email.subject || !email.body) {
            return NextResponse.json(
                { error: 'Missing required email information' },
                { status: 400 }
            );
        }

        if (!priority) {
            return NextResponse.json(
                { error: 'Missing required priority information' },
                { status: 400 }
            );
        }

        if (!courseName) {
            return NextResponse.json(
                { error: 'Missing required courseName' },
                { status: 400 }
            );
        }

        // Check Gmail connection before processing
        console.log('🔍 Checking Gmail connection...');
        const connectionStatus = await checkGmailConnection(userId);

        if (!connectionStatus.isConnected) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Gmail not connected',
                    authRequired: true,
                    connectionStatus,
                },
                { status: 401 }
            );
        }

        console.log('✅ Gmail connection verified');

        // Generate draft response using AI
        console.log('\n📝 Generating draft response...');
        const draftResponse = await generateEmailResponse({
            email: {
                id: email.id,
                from: email.from,
                subject: email.subject,
                body: email.body,
                category: email.category,
                reasoning: email.reasoning,
            },
            priority: {
                priority: priority.priority,
                responseDeadline: priority.responseDeadline,
                reasoning: priority.reasoning,
            },
            courseName,
            professorName,
            language,
        });

        console.log('✅ Draft response generated');

        return NextResponse.json({
            success: true,
            data: draftResponse,
        });

    } catch (error) {
        console.error('❌ Error generating draft:', error);

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                details: process.env.NODE_ENV === 'development' ? error : undefined,
            },
            { status: 500 }
        );
    }
}
