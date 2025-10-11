import { Composio } from '@composio/core';
import { VercelProvider } from '@composio/vercel';
import {
    FetchEmailsParams,
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

/**
 * Gmail Toolkits
 */
const GMAIL_TOOLKIT = 'GMAIL';

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
export interface GmailConnectionDetails {
    isConnected: boolean;
    connectionId?: string;
    email?: string;
    status: ConnectionStatus;
}

/**
 * Fetch Emails with AI Options
 */
export interface FetchEmailsWithAIOptions {
    maxEmails?: number;
    includeRead?: boolean;
    searchQuery?: string;
    courseContext?: string;
}

/**
 * ComposioService - Comprehensive service for Composio Gmail integration
 *
 * This service provides a clean, organized interface for interacting with
 * Gmail through Composio's API. It handles authentication, email fetching,
 * tool management, and data transformation.
 *
 * @example
 * ```typescript
 * // Get Gmail connection status
 * const connection = await ComposioService.getGmailConnectionByUserId('user123');
 *
 * // Fetch emails
 * if (connection.isConnected) {
 *   const emails = await ComposioService.fetchEmails(connection.connectionId!, {
 *     max_results: 10,
 *     query: 'is:unread'
 *   });
 * }
 * ```
 */
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

    /**
     * Get Gmail connection details for a specific user
     *
     * @param userId - The user ID to check connection for
     * @returns Gmail connection details with status and email
     */
    static async getGmailConnectionByUserId(
        userId: string
    ): Promise<GmailConnectionDetails> {
        try {
            const client = this.getClient();
            const connectedAccounts = await client.connectedAccounts.list({
                userIds: [userId],
            });

            const gmailConnection = connectedAccounts.items.find(
                (account: any) => account.toolkit.slug.toUpperCase() === GMAIL_TOOLKIT
            );

            if (gmailConnection && gmailConnection.status === 'ACTIVE') {
                return {
                    isConnected: true,
                    connectionId: gmailConnection.id,
                    email: gmailConnection.data?.email,
                    status: 'ACTIVE',
                };
            }

            return {
                isConnected: false,
                status:
                    (gmailConnection?.status as ConnectionStatus) || 'NOT_CONNECTED',
            };
        } catch (error) {
            console.error('Error checking Gmail connection:', error);
            return {
                isConnected: false,
                status: 'ERROR',
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
    static async listConnectedAccounts(userId: string, slug?: string) {
        const client = this.getClient();
        return await client.connectedAccounts.list({
            userIds: [userId],
            toolkitSlugs: slug ? [slug] : undefined,
        });
    }

    // ============================================================================
    // TOOLS MANAGEMENT
    // ============================================================================

    /**
     * Get all Gmail tools for a specific user
     *
     * @param userId - The connected account ID from Composio
     * @returns Gmail tools that can be used with AI SDK
     */
    static async getGmailTools(userId: string) {
        const client = this.getClient();
        return await client.tools.get(userId, {
            toolkits: [GMAIL_TOOLKIT],
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
     * @param connectedAccountId - The connected account ID
     * @param params - Fetch email parameters
     * @returns Gmail fetch emails response
     */
    static async fetchEmails(
        connectedAccountId: string,
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
            connectedAccountId,
            arguments: fetchParams,
        });

        return result as GmailFetchEmailsResponse;
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

    /**
     * Validate that a connection is active and ready to use
     *
     * @param userId - The user ID to validate
     * @throws Error if connection is not active
     */
    static async validateConnection(userId: string): Promise<void> {
        const connection = await this.getGmailConnectionByUserId(userId);

        if (!connection.isConnected) {
            throw new Error(
                `Gmail connection not active for user ${userId}. Status: ${connection.status}`
            );
        }
    }
}

