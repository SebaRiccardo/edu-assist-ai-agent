import { NextRequest, NextResponse } from 'next/server';
import { createClient, getCurrentUser } from '@/lib/supabase/server';
import { ComposioService } from '@/lib/services/composio';

/**
 * DELETE /api/connections/delete
 *
 * Deletes a connected account from Composio
 * Body params:
 * - connectionId: The connection ID to delete (required)
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const { connectionId } = await request.json();

    if (!connectionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter: connectionId',
        },
        { status: 400 }
      );
    }

    // Delete the connection using Composio
    await ComposioService.deleteConnectedAccount(connectionId);

    return NextResponse.json({
      success: true,
      message: 'Connection deleted successfully',
    });
  } catch (error) {
    console.error('❌ Error deleting connection:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to delete connection',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  }
}
