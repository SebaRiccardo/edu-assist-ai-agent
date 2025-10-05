import { FetchEmailsParams, GmailFetchEmailsResponse } from '@/types';
import { Composio } from '@composio/core';
import { VercelProvider } from '@composio/vercel';



/**
 * Initialize Composio client
 */
export function getComposioClient() {
  return new Composio({
    provider: new VercelProvider(),
    apiKey: process.env.COMPOSIO_API_KEY,
  });
}

/**
 * Get Gmail tools for a specific user
 * 
 * @param userId - The connected account ID from Composio
 * @returns Gmail tools that can be used with AI SDK
 */
export async function getGmailTools(userId: string) {
  const composio = getComposioClient();
  return await composio.tools.get(userId, {
    toolkits: ['GMAIL'],
  });
}

export async function getSendEmailTool(userId: string) {
  const composio = getComposioClient();
  return await composio.tools.get(userId, {
    tools: [
      'GMAIL_REPLY_TO_THREAD',
      'GMAIL_SEND_EMAIL',
    ]
  });
}

export async function getGmailFetchAndLabelsTool(userId: string) {
  const composio = getComposioClient();
  return await composio.tools.get(userId, {
    tools: [
      "GMAIL_FETCH_EMAILS",
      "GMAIL_ADD_LABEL_TO_EMAIL",
      "GMAIL_CREATE_LABEL",
      // Add other Gmail tools as needed
    ],
  });
}

export async function getFetchEmailsTool(userId: string, options?: any) {
  const composio = getComposioClient();
  return await composio.tools.get(userId, 'GMAIL_FETCH_EMAILS', options);
}

export async function getAddLabelTool(userId: string, options?: any) {
  const composio = getComposioClient();
  return await composio.tools.get(userId, 'GMAIL_ADD_LABEL_TO_EMAIL', options);
}

export async function fetchEmails(userId: string, params: FetchEmailsParams = {}) {
  const composio = getComposioClient();

  // Set default values according to Gmail API spec
  const fetchParams: FetchEmailsParams = {
    user_id: params.user_id ?? 'me',
    max_results: params.max_results ?? 1,
    query: params.query ?? null,
    label_ids: params.label_ids ?? undefined,
    include_spam_trash: params.include_spam_trash ?? false,
    page_token: params.page_token ?? null,
    include_payload: params.include_payload ?? true,
    ids_only: params.ids_only ?? false,
    verbose: params.verbose ?? true,
  };

  const result = await composio.tools.execute('GMAIL_FETCH_EMAILS', {
    userId,
    arguments: fetchParams
  });

  return result as GmailFetchEmailsResponse;
}
/**
 * Fetch emails using AI agent with Composio and Google Gemini
 * 
 * @param userId - The connected account ID from Composio
 * @param options - Email fetching options
 * @returns Promise with fetched emails and AI insights
 */
export async function fetchEmailsWithAI(
  userId: string,
  options: {
    maxEmails?: number;
    includeRead?: boolean;
    searchQuery?: string;
    courseContext?: string;
  } = {}
) {
  const { maxEmails = 10, includeRead = false, searchQuery = '', courseContext = '' } = options;

  const composio = getComposioClient();

  // Get Gmail tools for the user
  const tools = await composio.tools.get(userId, {
    toolkits: ['GMAIL'],
  });

  console.log(`🔧 Loaded ${tools.length} Gmail tools for user ${userId}`);

  return {
    tools,
    searchQuery: searchQuery || (includeRead ? 'in:inbox' : 'is:unread'),
    maxResults: maxEmails,
    userId,
  };
}



/**
 * Check if user has an active Gmail connection
 * 
 * @param userId - The user ID
 * @returns Connection details if found, null otherwise
 */
export async function checkGmailConnection(userId: string) {
  const composio = getComposioClient();

  try {
    const connectedAccounts = await composio.connectedAccounts.list({
      userIds: [userId],
    });

    const gmailConnection = connectedAccounts.items.find(
      (account: any) => account.toolkit.slug.toUpperCase() === 'GMAIL'
    );

    if (gmailConnection && gmailConnection.status === 'ACTIVE') {
      return {
        isConnected: true,
        connectionId: gmailConnection.id,
        email: gmailConnection.data?.email,
        status: gmailConnection.status
      };
    }

    return {
      isConnected: false,
      status: gmailConnection?.status || 'NOT_CONNECTED'
    };
  } catch (error) {
    console.error('Error checking Gmail connection:', error);
    return {
      isConnected: false,
      status: 'ERROR'
    };
  }
}

/**
 * Transform Gmail API response to our email format
 */
function transformGmailToEmail(gmailMessage: any) {
  const headers = gmailMessage.payload?.headers || [];
  const fromHeader = headers.find((h: any) => h.name === 'From');
  const subjectHeader = headers.find((h: any) => h.name === 'Subject');
  const dateHeader = headers.find((h: any) => h.name === 'Date');

  // Extract body content
  let body = '';
  let snippet = gmailMessage.snippet || '';

  if (gmailMessage.payload?.body?.data) {
    body = Buffer.from(gmailMessage.payload.body.data, 'base64').toString();
  } else if (gmailMessage.payload?.parts) {
    // Handle multipart messages
    const textPart = gmailMessage.payload.parts.find((part: any) =>
      part.mimeType === 'text/plain' || part.mimeType === 'text/html'
    );
    if (textPart?.body?.data) {
      body = Buffer.from(textPart.body.data, 'base64').toString();
    }
  }

  return {
    id: gmailMessage.id,
    from: fromHeader?.value || 'Unknown',
    subject: subjectHeader?.value || 'No Subject',
    snippet: snippet,
    body: body || snippet,
    receivedAt: dateHeader?.value || new Date().toISOString(),
    isUnread: gmailMessage.labelIds?.includes('UNREAD') || false,
    labels: gmailMessage.labelIds || [],
  };
}

/**
 * Extract course-related keywords from course description
 */
function extractCourseKeywords(courseName: string, courseDescription: string): string[] {
  const keywords = [];

  // Add course name
  keywords.push(courseName);

  // Extract key terms from description
  const commonTerms = courseDescription.toLowerCase()
    .split(/[\s,\.\!\?\;]+/)
    .filter(word => word.length > 3)
    .filter(word => !['this', 'that', 'with', 'from', 'they', 'them', 'will', 'have', 'been', 'more', 'some', 'what', 'when', 'where', 'than', 'also', 'each', 'which', 'their', 'would', 'there', 'could', 'other'].includes(word))
    .slice(0, 10); // Take first 10 relevant terms

  keywords.push(...commonTerms);

  return keywords;
}

/**
 * Mock function that simulates fetching course-related emails
 * This will be replaced with actual Composio calls once authentication is set up
 */
async function getMockCourseEmails(courseName: string, courseDescription: string) {
  // Simulate different types of course-related emails
  const mockEmails = [
    {
      id: 'email-1',
      from: 'john.student@university.edu',
      subject: `Question about ${courseName} homework`,
      snippet: `Hi Professor, I have a question about the latest assignment in ${courseName}...`,
      body: `Hi Professor, I have a question about the latest assignment in ${courseName}. I'm struggling with the concepts we covered in class. Could you provide some guidance?`,
      receivedAt: new Date(Date.now() - 1800000).toISOString(),
      isUnread: true,
      labels: ['UNREAD'],
    },
    {
      id: 'email-2',
      from: 'sarah.martinez@university.edu',
      subject: `${courseName} exam date clarification`,
      snippet: `Dear Professor, I wanted to confirm the date for our ${courseName} exam...`,
      body: `Dear Professor, I wanted to confirm the date for our ${courseName} exam. The syllabus shows one date, but I heard different information. Could you please clarify?`,
      receivedAt: new Date(Date.now() - 3600000).toISOString(),
      isUnread: true,
      labels: ['UNREAD'],
    },
    {
      id: 'email-3',
      from: 'prof.smith@university.edu',
      subject: `${courseName} textbook recommendation`,
      snippet: `Hi colleague, I'm teaching a similar ${courseName} course next semester...`,
      body: `Hi colleague, I'm teaching a similar ${courseName} course next semester and was wondering which textbook you're using. I've heard good things about your course structure.`,
      receivedAt: new Date(Date.now() - 7200000).toISOString(),
      isUnread: true,
      labels: ['UNREAD'],
    },
    {
      id: 'email-4',
      from: 'admin@university.edu',
      subject: `Room change for ${courseName}`,
      snippet: `Please note: ${courseName} lecture on Friday will be moved to a different room...`,
      body: `Please note: ${courseName} lecture on Friday will be moved to Room 305 due to maintenance in the usual classroom. All other sessions remain in the original location.`,
      receivedAt: new Date(Date.now() - 10800000).toISOString(),
      isUnread: true,
      labels: ['UNREAD'],
    },
    {
      id: 'email-5',
      from: 'emily.chen@university.edu',
      subject: `Office hours question - ${courseName}`,
      snippet: `Hi Professor, I was hoping to meet during office hours to discuss ${courseName}...`,
      body: `Hi Professor, I was hoping to meet during office hours tomorrow to discuss some concepts from ${courseName}. I'm struggling with understanding the material. Would 2 PM work for you?`,
      receivedAt: new Date(Date.now() - 14400000).toISOString(),
      isUnread: true,
      labels: ['UNREAD'],
    },
    {
      id: 'email-6',
      from: 'parent@email.com',
      subject: `Parent conference request - ${courseName}`,
      snippet: `Dear Professor, I'm the parent of a student in your ${courseName} class...`,
      body: `Dear Professor, I'm the parent of a student in your ${courseName} class and would like to schedule a conference to discuss my child's progress. When would be a good time?`,
      receivedAt: new Date(Date.now() - 18000000).toISOString(),
      isUnread: true,
      labels: ['UNREAD'],
    },
    {
      id: 'email-7',
      from: 'help.desk@university.edu',
      subject: `Technical issues with ${courseName} online platform`,
      snippet: `We've received reports of technical issues affecting the ${courseName} course platform...`,
      body: `We've received reports of technical issues affecting the ${courseName} course platform. Our team is working to resolve this. We'll update you when it's fixed.`,
      receivedAt: new Date(Date.now() - 21600000).toISOString(),
      isUnread: true,
      labels: ['UNREAD'],
    },
    {
      id: 'email-8',
      from: 'mike.student@university.edu',
      subject: `Grade inquiry for ${courseName} midterm`,
      snippet: `Professor, I received my ${courseName} midterm grade and have some questions...`,
      body: `Professor, I received my ${courseName} midterm grade and have some questions about the grading rubric. Could we schedule a time to discuss this?`,
      receivedAt: new Date(Date.now() - 25200000).toISOString(),
      isUnread: true,
      labels: ['UNREAD'],
    }
  ];

  // Return emails that seem relevant to the course
  const keywords = extractCourseKeywords(courseName, courseDescription);
  return mockEmails.filter(email =>
    email.subject.includes(courseName) ||
    email.body.includes(courseName) ||
    keywords.some(keyword =>
      email.subject.toLowerCase().includes(keyword.toLowerCase()) ||
      email.body.toLowerCase().includes(keyword.toLowerCase())
    )
  );
}


