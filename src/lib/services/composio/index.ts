import { Composio } from '@composio/core';
import { VercelProvider } from '@composio/vercel';
import {
  FetchEmailsParams,
  GmailFetchEmailsData,
  GmailFetchEmailsResponse,
  GmailMessageBody,
  TransformedEmail,
} from '@/types';

/**
 * Gmail Tool Names - Constants for available Gmail tools
 */
const GMAIL_TOOLS = {
  FETCH_EMAILS: 'GMAIL_FETCH_EMAILS',
  SEND_EMAIL: 'GMAIL_SEND_EMAIL',
  REPLY_TO_THREAD: 'GMAIL_REPLY_TO_THREAD',
  ADD_LABEL: 'GMAIL_ADD_LABEL_TO_EMAIL',
  CREATE_LABEL: 'GMAIL_CREATE_LABEL',
  REMOVE_LABEL: 'GMAIL_REMOVE_LABEL',
  SEARCH: 'GMAIL_SEARCH',
} as const;

const OUTLOOK_TOOLS = {
  FETCH_EMAILS: 'OUTLOOK_QUERY_EMAILS',
  SEND_EMAIL: 'OUTLOOK_SEND_EMAIL',
  REPLY_TO_THREAD: 'OUTLOOK_REPLY_EMAIL',
  SEARCH: 'OUTLOOK_SEARCH_MESSAGES',
} as const;

/**
 * Gmail Toolkits
 */
const GMAIL_TOOLKIT = 'GMAIL';

const OUTLOOK_TOOLKIT = 'OUTLOOK';

/**
 * Connection Status Types
 */
export type ConnectionStatus =
  | 'ACTIVE'
  | 'NOT_CONNECTED'
  | 'ERROR'
  | 'INACTIVE';

/**
 * Gmail Connection Details
 */
export interface GmailConnectedAccounts {
  accounts: any[];
}

/**
 * Fetch Emails with AI Options
 */
export interface FetchEmailsWithAIOptions {
  maxEmails?: number;
  includeRead?: boolean;
  searchQuery?: string;
  courseContext?: string;
  labelIds?: string[];
}

const authConfigMap = {
  gmail: process.env.GMAIL_AUTH_CONFIG_ID,
  outlook: process.env.OUTLOOK_AUTH_CONFIG_ID,
};

export class ComposioService {
  private static instance: Composio<VercelProvider> | null = null;

  /**
   * Get or create the Composio client instance (Singleton pattern)
   * This ensures we only have one instance throughout the application
   */
  private static getClient(): Composio<VercelProvider> {
    if (!this.instance) {
      if (!process.env.COMPOSIO_API_KEY) {
        throw new Error('COMPOSIO_API_KEY is not set in environment variables');
      }

      this.instance = new Composio<VercelProvider>({
        apiKey: process.env.COMPOSIO_API_KEY,
        provider: new VercelProvider(),
      });
    }

    return this.instance;
  }

  // ============================================================================
  // CONNECTION MANAGEMENT
  // ============================================================================

  private static async initConnection(userId: string, authConfig: string) {
    const client = this.getClient();
    const connectionRequest = await client.connectedAccounts.initiate(
      userId,
      authConfig,
      {
        allowMultiple: true,
        //callbackUrl,
      }
    );
    return connectionRequest;
  }

  static async waitForConnection(
    connectionId: string,
    timeoutMs: number = 120000
  ) {
    const client = this.getClient();
    return await client.connectedAccounts.waitForConnection(
      connectionId,
      timeoutMs
    );
  }

  /**
   * Initialize email connection for a user with Gmail or Outlook
   * @param userId - The user ID to initiate connection for
   * @param emailProvider - The email provider slug ('gmail' or 'outlook')
   * @returns Connection initiation response
   */
  static async initEmailConnection(
    userId: string,
    emailProvider: 'gmail' | 'outlook'
  ) {
    const authConfig =
      authConfigMap[
        emailProvider.toLocaleLowerCase() as keyof typeof authConfigMap
      ];

    if (!authConfig) {
      throw new Error(`Unsupported email provider: ${emailProvider}`);
    }

    return await this.initConnection(userId, authConfig);
  }

  /**
   * Get Gmail connected accounts
   * @param userId - The user ID to check connection for
   * @returns Gmail connected accounts
   */
  static async getUserGmailConnections(
    userId: string
  ): Promise<GmailConnectedAccounts> {
    try {
      const client = this.getClient();
      const connectedAccounts = await client.connectedAccounts.list({
        userIds: [userId],
        toolkitSlugs: [GMAIL_TOOLKIT],
        statuses: ['ACTIVE'],
      });
      return {
        accounts: connectedAccounts.items,
      };
    } catch (error) {
      console.error('Error checking Gmail connection:', error);
      return {
        accounts: [],
      };
    }
  }

  /**
   * Get a connected account by its ID
   *
   * @param accountId - The connected account ID
   * @returns The connected account details
   */
  static async getConnectedAccountById(accountId: string) {
    const client = this.getClient();
    return await client.connectedAccounts.get(accountId);
  }

  /**
   * List all connected accounts for a user
   *
   * @param userId - The user ID
   * @returns List of connected accounts
   */
  static async getConnectedAccounts(userId: string, slug?: string) {
    const client = this.getClient();
    return await client.connectedAccounts.list({
      userIds: [userId],
      toolkitSlugs: slug ? [slug] : undefined,
    });
  }

  /**
   * List all connected email accounts for a user
   *
   * @param userId - The user ID
   * @returns List of connected email accounts
   */
  static async getConnectedEmailAccounts(userId: string) {
    const client = this.getClient();
    return await client.connectedAccounts.list({
      userIds: [userId],
      toolkitSlugs: [GMAIL_TOOLKIT, OUTLOOK_TOOLKIT],
    });
  }

  /**
   * Delete a connected account
   *
   * @param connectionId - The connected account ID to delete
   * @returns Promise that resolves when the account is deleted
   */
  static async deleteConnectedAccount(connectionId: string) {
    const client = this.getClient();
    return await client.connectedAccounts.delete(connectionId);
  }

  // ============================================================================
  // TOOLS MANAGEMENT
  // ============================================================================

  /**
   * Fetches Composio tools for a user based on enabled toolkits
   * This is used specifically for AI/LLM tool integration
   */
  static async getComposioTools(userId: string, toolkitSlugs: string[]) {
    if (!toolkitSlugs || toolkitSlugs.length === 0) {
      return {};
    }

    try {
      const tools = await this.getClient().tools.get(userId, {
        toolkits: toolkitSlugs,
      });
      return tools || {};
    } catch (error) {
      console.error('Failed to fetch Composio tools:', error);
      return {};
    }
  }

  static async getGmailTools(userId: string, limit?: number) {
    return await this.getClient().tools.get(userId, {
      toolkits: [GMAIL_TOOLKIT],
      limit,
    });
  }

  static async getOutlookTools(userId: string, limit?: number) {
    return await this.getClient().tools.get(userId, {
      toolkits: [OUTLOOK_TOOLKIT],
      limit,
    });
  }

  /**
   * Get specific Gmail tools for sending and replying to emails
   *
   * @param userId - The connected account ID
   * @returns Tools for sending and replying to emails
   */
  static async getSendEmailTools(userId: string) {
    const client = this.getClient();
    return await client.tools.get(userId, {
      tools: [GMAIL_TOOLS.REPLY_TO_THREAD, GMAIL_TOOLS.SEND_EMAIL],
    });
  }

  /**
   * Get Gmail tools for fetching and managing labels
   *
   * @param userId - The connected account ID
   * @returns Tools for fetching emails and managing labels
   */
  static async getGmailFetchAndLabelsTools(userId: string) {
    const client = this.getClient();
    return await client.tools.get(userId, {
      tools: [
        GMAIL_TOOLS.FETCH_EMAILS,
        GMAIL_TOOLS.ADD_LABEL,
        GMAIL_TOOLS.CREATE_LABEL,
      ],
    });
  }

  /**
   * Get the fetch emails tool specifically
   *
   * @param userId - The connected account ID
   * @param options - Additional options for the tool
   * @returns The fetch emails tool
   */
  static async getFetchEmailsTool(userId: string, options?: any) {
    const client = this.getClient();
    return await client.tools.get(userId, GMAIL_TOOLS.FETCH_EMAILS, options);
  }

  /**
   * Get the add label tool specifically
   *
   * @param userId - The connected account ID
   * @param options - Additional options for the tool
   * @returns The add label tool
   */
  static async getAddLabelTool(userId: string, options?: any) {
    const client = this.getClient();
    return await client.tools.get(userId, GMAIL_TOOLS.ADD_LABEL, options);
  }

  // ============================================================================
  // EMAIL OPERATIONS
  // ============================================================================

  /**
   * Fetch emails from Gmail with comprehensive parameter support
   *
   * @param accountId - The connected account ID
   * @param params - Fetch email parameters
   * @returns Gmail fetch emails response
   */
  static async fetchEmails(
    accountId: string,
    params: FetchEmailsParams = {}
  ): Promise<GmailFetchEmailsResponse> {
    const client = this.getClient();

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

    const result = await client.tools.execute(GMAIL_TOOLS.FETCH_EMAILS, {
      connectedAccountId: accountId,
      arguments: fetchParams as any,
    });

    const { data: mailsData } = result;
    return {
      ...result,
      data: mailsData as unknown as GmailFetchEmailsData,
    };
  }

  /**
   * Fetch emails with AI-ready tools and configuration
   *
   * @param userId - The connected account ID from Composio
   * @param options - Email fetching options
   * @returns Promise with tools and configuration for AI agent
   */
  static async fetchEmailsWithAI(
    userId: string,
    options: FetchEmailsWithAIOptions = {}
  ) {
    const {
      maxEmails = 10,
      includeRead = false,
      searchQuery = '',
      courseContext = '',
    } = options;

    // Get Gmail tools for the user
    const tools = await this.getGmailTools(userId);

    return {
      tools,
      searchQuery: searchQuery || (includeRead ? 'in:inbox' : 'is:unread'),
      maxResults: maxEmails,
      userId,
      courseContext,
    };
  }

  // ============================================================================
  // DATA TRANSFORMATION UTILITIES
  // ============================================================================

  /**
   * Transform Gmail message body to application email format
   *
   * @param message - Gmail message body from Composio API
   * @returns Transformed email in application format
   */
  static transformGmailMessage(message: GmailMessageBody): TransformedEmail {
    return {
      id: message.messageId || '',
      threadId: message.threadId || '',
      from: message.sender || 'Unknown',
      to: message.to || '',
      subject: message.subject || 'No Subject',
      snippet: message.preview?.snippet || '',
      body: message.messageText || '',
      receivedAt: message.messageTimestamp || new Date().toISOString(),
      isUnread: message.labelIds?.includes('UNREAD') || false,
      labels: message.labelIds || [],
      attachments: message.attachmentList || [],
    };
  }

  /**
   * Transform multiple Gmail messages to application email format
   *
   * @param messages - Array of Gmail message bodies
   * @returns Array of transformed emails
   */
  static transformGmailMessages(
    messages: GmailMessageBody[]
  ): TransformedEmail[] {
    return messages.map(message => this.transformGmailMessage(message));
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Build a Gmail search query from parameters
   *
   * @param params - Query parameters
   * @returns Formatted Gmail search query string
   */
  static buildSearchQuery(params: {
    from?: string;
    to?: string;
    subject?: string;
    hasAttachment?: boolean;
    isUnread?: boolean;
    after?: string;
    before?: string;
    label?: string;
  }): string {
    const queryParts: string[] = [];

    if (params.from) queryParts.push(`from:${params.from}`);
    if (params.to) queryParts.push(`to:${params.to}`);
    if (params.subject) queryParts.push(`subject:${params.subject}`);
    if (params.hasAttachment) queryParts.push('has:attachment');
    if (params.isUnread) queryParts.push('is:unread');
    if (params.after) queryParts.push(`after:${params.after}`);
    if (params.before) queryParts.push(`before:${params.before}`);
    if (params.label) queryParts.push(`label:${params.label}`);

    return queryParts.join(' ');
  }
}
