import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/server';
import composio from '@/lib/services/composio';

// Types
interface GmailConnectionRequest {
  userId: string;
  courseId: string;
  gmailAddress: string;
}

// Helper Functions
const validateRequest = (data: Partial<GmailConnectionRequest>) => {
  if (!data.userId) {
    return { error: 'User ID is required', status: 400 };
  }
  if (!data.courseId) {
    return { error: 'Course ID is required', status: 400 };
  }
  return null;
};

export const findGmailConnection = async (userId: string) => {
  return await composio.connectedAccounts.list({
    userIds: [userId],
    toolkitSlugs: ['GMAIL'],
  });
};

// const upsertInbox = async (
//     supabase: SupabaseClient,
//     inboxData: Partial<InboxData>,
//     courseId: string,
// ) => {
//     const { data: existingInbox } = await supabase
//         .from('inbox')
//         .select('*')
//         .eq('course_id', courseId)
//         .maybeSingle();

//     if (existingInbox) {
//         const { data, error } = await supabase
//             .from('inbox')
//             .update({
//                 ...inboxData,
//                 updated_at: new Date().toISOString(),
//             })
//             .eq('course_id', courseId)
//             .eq('email', email)
//             .select()
//             .single();

//         if (error) {
//             throw new Error(`Failed to update inbox: ${error.message}`);
//         }
//         return data;
//     }

//     const { data, error } = await supabase
//         .from('inbox')
//         .insert({
//             ...inboxData,
//             course_id: courseId,
//             unread_count: 0,
//         })
//         .select()
//         .single();

//     if (error) {
//         throw new Error(`Failed to create inbox: ${error.message}`);
//     }
//     return data;
// };

// const handleExistingConnection = async (
//     gmailConnection: any,
//     courseId: string,
// ) => {
//     const supabase = await createClient();
//     const inbox = await upsertInbox(
//         supabase,
//         {
//             id: gmailConnection.id,
//             status: gmailConnection.status,
//         },
//         courseId
//     );

//     return NextResponse.json({
//         isConnected: true,
//         connectionId: gmailConnection.id,
//         email: gmailConnection.data?.email,
//         data: gmailConnection.data,
//         inbox,
//         message: 'Gmail account already connected',
//     });
// };

const initiateNewConnection = async (userId: string) => {
  const gmailAuthConfigId = process.env.GMAIL_AUTH_CONFIG_ID;

  if (!gmailAuthConfigId) {
    return NextResponse.json(
      { error: 'Gmail auth config not found' },
      { status: 500 }
    );
  }

  //const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  //const callbackUrl = `${baseUrl}/dashboard/courses/${courseId}`;

  const connectionRequest = await composio.connectedAccounts.initiate(
    userId,
    gmailAuthConfigId,
    {
      allowMultiple: true,
      //callbackUrl,
    }
  );

  return NextResponse.json(connectionRequest);
};

// Route Handlers
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
    }
    const { courseId } = await req.json();

    const validationError = validateRequest({ userId: user.id, courseId });

    if (validationError) {
      return NextResponse.json(
        { error: validationError.error },
        { status: validationError.status }
      );
    }

    const gmailConnection = await findGmailConnection(user.id);
    const hasActiveConnection =
      gmailConnection &&
      (gmailConnection.status === 'ACTIVE' ||
        gmailConnection.status === 'INITIATED');

    if (hasActiveConnection) {
      return NextResponse.json(
        {
          error: 'Connection already exists',
          details:
            'A connection is already exists with status: ' +
            gmailConnection.status,
        },
        { status: 429 }
      );
    }

    return await initiateNewConnection(user.id);
  } catch (error) {
    console.error('Error initiating Gmail connection:', error);
    return NextResponse.json(
      {
        error: 'Failed to initiate Gmail connection',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
