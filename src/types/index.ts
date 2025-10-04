
/**
 * Gmail Message Attachment
 */
export interface GmailAttachment {
  attachmentId?: string;
  size?: number;
  mimeType?: string;
  filename?: string;
}

/**
 * Gmail Message Body
 * Represents a single email message from Gmail API via Composio
 */
export interface GmailMessageBody {
  /** The message ID of the message */
  messageId: string | null;
  /** The thread ID of the message */
  threadId: string | null;
  /** The sender of the message (email address with optional name) */
  sender: string | null;
  /** The recipient of the message */
  to: string | null;
  /** The subject of the message */
  subject: string | null;
  /** The text content of the message */
  messageText: string | null;
  /** The timestamp of the message (ISO 8601 format) */
  messageTimestamp: string | null;
  /** The label IDs of the message (e.g., 'INBOX', 'UNREAD', 'IMPORTANT') */
  labelIds: string[] | null;
  /** The list of attachments in the message */
  attachmentList: GmailAttachment[] | null;
  /** The full payload of the message (headers, body parts, etc.) */
  payload: Record<string, any> | null;
  /** Preview information for the message */
  preview: Record<string, any> | null;
}

/**
 * Gmail Fetch Emails Response Data
 * The data structure returned by the GMAIL_FETCH_EMAILS action
 */
export interface GmailFetchEmailsData {
  /** Token for the next page of results; use in subsequent page_token request. Empty if no more results. */
  nextPageToken: string;
  /** Estimated total messages matching the query (not just this page) */
  resultSizeEstimate: number;
  /** List of retrieved email messages. Includes full content if include_payload was true, otherwise metadata. */
  messages: GmailMessageBody[];
}

/**
 * Gmail Fetch Emails Response Wrapper
 * Complete response from Composio's GMAIL_FETCH_EMAILS tool execution
 */
export interface GmailFetchEmailsResponse {
  /** Whether or not the action execution was successful */
  successful: boolean;
  /** Data from the action execution */
  data: GmailFetchEmailsData;
  /** Error message if any occurred during the execution of the action */
  error?: string | null;
}

/**
 * Transformed Email for Application Use
 * Simplified email structure used throughout the application
 */
export interface TransformedEmail {
  id: string;
  threadId: string;
  from: string;
  to: string;
  subject: string;
  snippet: string;
  body: string;
  receivedAt: string;
  isUnread: boolean;
  labels: string[];
  attachments?: GmailAttachment[];
}

// ...existing code...
/**
 * Gmail Fetch Emails parameters interface
 */
export interface FetchEmailsParams {
  /** User's email address or 'me' for the authenticated user */
  user_id?: string;
  /** Maximum number of messages to retrieve per page (1-500) */
  max_results?: number;
  /** Gmail advanced search query (e.g., 'from:user subject:meeting') */
  query?: string | null;
  /** Filter by label IDs; only messages with all specified labels are returned */
  label_ids?: string[];
  /** Set to true to include messages from 'SPAM' and 'TRASH' */
  include_spam_trash?: boolean;
  /** Token for retrieving a specific page, obtained from a previous response's nextPageToken */
  page_token?: string | null;
  /** Set to true to include full message payload (headers, body, attachments); false for metadata only */
  include_payload?: boolean;
  /** If true, only returns message IDs from the list API without fetching individual message details */
  ids_only?: boolean;
  /** If false, uses optimized concurrent metadata fetching for faster performance (~75% improvement) */
  verbose?: boolean;
}

// Mock types for our application
export interface Course {
  id: string;
  name: string;
  title: string; // Display title
  description: string; // Full description/context about the course
  professorId: string;
  studentCount: number; // Number of students enrolled
  unreadEmailCount: number; // Number of unread course-related emails
  createdAt: Date;
  updatedAt: Date;
}

export interface Professor {
  id: string;
  name: string;
  email: string;
}


export interface GmailConnection {
  isConnected: boolean;
  connectionId?: string;
  email?: string;
}

export interface EmailFetchRequest {
  userId: string;
  maxEmails?: number;
  includeRead?: boolean;
  searchQuery?: string;
  courseContext?: string;
}

export interface EmailFetchResponse {
  success: boolean;
  data?: {
    emails: FetchedEmail[];
    summary: EmailSummary;
    aiResponse: string;
    toolResults?: any[];
  };
  error?: string;
  authRequired?: boolean;
  connectionStatus?: any;
}

export interface FetchedEmail {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  body: string;
  receivedAt: string;
  isUnread: boolean;
  labels: string[];
}

export interface EmailSummary {
  totalEmails: number;
  unreadCount: number;
  sources: string[];
  timeRange?: string;
  aiInsights?: string;
}

/**
 * Email Analysis Parameters
 */
export interface EmailAnalysisParams {
  userId: string;
  courseId: string;
  maxEmails?: number;
  includeRead?: boolean;
  verbose?: boolean;
}

/**
 * Categorized Email with Analysis
 */
export interface CategorizedEmail extends TransformedEmail {
  category: 'course_related' | 'student_email' | 'staff_email' | 'administrative' | 'assignment' | 'grade_inquiry' | 'other';
  isRelated: boolean;
  suggestedLabel: string;
  confidence: number;
  reasoning: string;
}

/**
 * Email Analysis Result
 */
export interface InboxAnalysisResult {
  emails: CategorizedEmail[];
  analysis: {
    summary: string;
    stats: {
      totalAnalyzed: number;
      courseRelated: number;
      avgConfidence: number;
      categoryBreakdown: Record<string, number>;
    };
  };
  totalAnalyzed: number;
  courseName: string;
  courseId: string;
}