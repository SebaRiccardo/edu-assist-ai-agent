import { analyzeInboxForCourse } from "@/agents/analyze-inbox";
import { checkGmailConnection } from "@/lib/composio";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
    try {
        const { userId, maxEmails = 10, includeRead = false, reasoningLanguage, verbose, courseId } = await request.json();

        // Validation
        if (!userId) {
            return NextResponse.json(
                { error: 'Missing required parameter: userId' },
                { status: 400 }
            );
        }

        if (!courseId) {
            return NextResponse.json(
                { error: 'Course ID is required' },
                { status: 400 }
            );
        }

        // Check Gmail connection before processing
        const connectionStatus = await checkGmailConnection(userId);

        if (!connectionStatus.isConnected) {
            return NextResponse.json({
                success: false,
                error: 'Gmail not connected',
                authRequired: true,
                connectionStatus,
            }, { status: 401 });
        }

        // Call the encapsulated analysis function
        const result = await analyzeInboxForCourse({
            userId,
            courseId,
            maxEmails,
            includeRead,
            reasoningLanguage,
            verbose: verbose ?? true,
        });

        return NextResponse.json({
            success: true,
            data: result,
        });

    } catch (error) {
        console.error('❌ Error in email analysis:', error);

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            details: process.env.NODE_ENV === 'development' ? error : undefined,
        }, { status: 500 });
    }
}

