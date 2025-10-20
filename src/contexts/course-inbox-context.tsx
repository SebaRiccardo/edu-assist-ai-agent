'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CategorizedEmail, CategorizedEmailWithPriority } from '@/types';

/**
 * Draft state for a specific email
 */
interface EmailDraftState {
    emailId: string;
    draftResponse: string | null;
    isGenerating: boolean;
    isEditing: boolean;
    editedDraft: string;
    error: string | null;
    isDraftOpen: boolean;
}

/**
 * Email state per account
 */
interface AccountEmailState {
    emails: (CategorizedEmail | CategorizedEmailWithPriority)[];
    isAnalyzing: boolean;
    stats: {
        totalAnalyzed: number;
        courseRelated: number;
    } | null;
    priorityStats?: {
        summary: string;
        critical: number;
        high: number;
        medium: number;
        low: number;
        total: number;
    } | null;
}/**
 * Reply state tracking
 */
interface ReplyState {
    emailId: string;
    isSending: boolean;
}

/**
 * Context state shape
 */
interface CourseInboxContextState {
    // Email data per account
    emailsByAccount: Record<string, AccountEmailState>;

    // Draft states per email (key: emailId)
    draftsByEmail: Record<string, EmailDraftState>;

    // Reply states per email
    repliesByEmail: Record<string, ReplyState>;

    // Selected email for viewing
    selectedEmailId: string | null;

    // Actions
    setAccountEmails: (accountId: string, emails: (CategorizedEmail | CategorizedEmailWithPriority)[]) => void;
    setAccountAnalyzing: (accountId: string, isAnalyzing: boolean) => void;
    setAccountStats: (accountId: string, stats: { totalAnalyzed: number; courseRelated: number }) => void;
    setAccountPriorityStats: (accountId: string, priorityStats: { summary: string; critical: number; high: number; medium: number; low: number; total: number }) => void;
    clearAccountData: (accountId: string) => void;

    // Draft actions
    initializeDraft: (emailId: string) => void;
    setDraftGenerating: (emailId: string, isGenerating: boolean) => void;
    setDraftResponse: (emailId: string, response: string) => void;
    setDraftEditing: (emailId: string, isEditing: boolean) => void;
    setDraftEditedContent: (emailId: string, content: string) => void;
    setDraftError: (emailId: string, error: string | null) => void;
    setDraftOpen: (emailId: string, isOpen: boolean) => void;
    getDraftState: (emailId: string) => EmailDraftState;

    // Reply actions
    setEmailReplying: (emailId: string, isSending: boolean) => void;
    isEmailReplying: (emailId: string) => boolean;

    // Selection actions
    selectEmail: (emailId: string | null) => void;
    getSelectedEmail: (accountId: string) => (CategorizedEmail | CategorizedEmailWithPriority) | null;

    // Helper getters
    getAccountEmails: (accountId: string) => (CategorizedEmail | CategorizedEmailWithPriority)[];
    getAccountStats: (accountId: string) => { totalAnalyzed: number; courseRelated: number } | null;
    getAccountPriorityStats: (accountId: string) => { summary: string; critical: number; high: number; medium: number; low: number; total: number } | null;
    isAccountAnalyzing: (accountId: string) => boolean;
}

const CourseInboxContext = createContext<CourseInboxContextState | undefined>(undefined);

/**
 * Provider component
 */
interface CourseInboxProviderProps {
    children: ReactNode;
}

export function CourseInboxProvider({ children }: CourseInboxProviderProps) {
    const [emailsByAccount, setEmailsByAccount] = useState<Record<string, AccountEmailState>>({});
    const [draftsByEmail, setDraftsByEmail] = useState<Record<string, EmailDraftState>>({});
    const [repliesByEmail, setRepliesByEmail] = useState<Record<string, ReplyState>>({});
    const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);

    // Account email management
    const setAccountEmails = useCallback((accountId: string, emails: (CategorizedEmail | CategorizedEmailWithPriority)[]) => {
        setEmailsByAccount(prev => ({
            ...prev,
            [accountId]: {
                ...prev[accountId],
                emails,
            },
        }));
    }, []);

    const setAccountAnalyzing = useCallback((accountId: string, isAnalyzing: boolean) => {
        setEmailsByAccount(prev => ({
            ...prev,
            [accountId]: {
                ...prev[accountId],
                isAnalyzing,
                emails: prev[accountId]?.emails || [],
                stats: prev[accountId]?.stats || null,
                priorityStats: prev[accountId]?.priorityStats || null,
            },
        }));
    }, []);

    const setAccountStats = useCallback(
        (accountId: string, stats: { totalAnalyzed: number; courseRelated: number }) => {
            setEmailsByAccount(prev => ({
                ...prev,
                [accountId]: {
                    ...prev[accountId],
                    stats,
                    emails: prev[accountId]?.emails || [],
                    isAnalyzing: prev[accountId]?.isAnalyzing || false,
                    priorityStats: prev[accountId]?.priorityStats || null,
                },
            }));
        },
        []
    );

    const setAccountPriorityStats = useCallback(
        (accountId: string, priorityStats: { summary: string; critical: number; high: number; medium: number; low: number; total: number }) => {
            setEmailsByAccount(prev => ({
                ...prev,
                [accountId]: {
                    ...prev[accountId],
                    priorityStats,
                    emails: prev[accountId]?.emails || [],
                    isAnalyzing: prev[accountId]?.isAnalyzing || false,
                    stats: prev[accountId]?.stats || null,
                },
            }));
        },
        []
    );

    const clearAccountData = useCallback((accountId: string) => {
        setEmailsByAccount(prev => {
            const newState = { ...prev };
            delete newState[accountId];
            return newState;
        });
    }, []);

    // Draft management
    const initializeDraft = useCallback((emailId: string) => {
        setDraftsByEmail(prev => {
            if (prev[emailId]) return prev;
            return {
                ...prev,
                [emailId]: {
                    emailId,
                    draftResponse: null,
                    isGenerating: false,
                    isEditing: false,
                    editedDraft: '',
                    error: null,
                    isDraftOpen: false,
                },
            };
        });
    }, []);

    const setDraftGenerating = useCallback((emailId: string, isGenerating: boolean) => {
        setDraftsByEmail(prev => ({
            ...prev,
            [emailId]: {
                ...prev[emailId],
                emailId,
                isGenerating,
                error: isGenerating ? null : prev[emailId]?.error || null,
                draftResponse: prev[emailId]?.draftResponse || null,
                isEditing: prev[emailId]?.isEditing || false,
                editedDraft: prev[emailId]?.editedDraft || '',
                isDraftOpen: prev[emailId]?.isDraftOpen || false,
            },
        }));
    }, []);

    const setDraftResponse = useCallback((emailId: string, response: string) => {
        setDraftsByEmail(prev => ({
            ...prev,
            [emailId]: {
                ...prev[emailId],
                emailId,
                draftResponse: response,
                editedDraft: response,
                isGenerating: false,
                error: null,
                isDraftOpen: true,
                isEditing: false,
            },
        }));
    }, []);

    const setDraftEditing = useCallback((emailId: string, isEditing: boolean) => {
        setDraftsByEmail(prev => ({
            ...prev,
            [emailId]: {
                ...prev[emailId],
                emailId,
                isEditing,
                draftResponse: prev[emailId]?.draftResponse || null,
                editedDraft: prev[emailId]?.editedDraft || '',
                isGenerating: false,
                error: prev[emailId]?.error || null,
                isDraftOpen: prev[emailId]?.isDraftOpen || false,
            },
        }));
    }, []);

    const setDraftEditedContent = useCallback((emailId: string, content: string) => {
        setDraftsByEmail(prev => ({
            ...prev,
            [emailId]: {
                ...prev[emailId],
                emailId,
                editedDraft: content,
                draftResponse: prev[emailId]?.draftResponse || null,
                isGenerating: false,
                isEditing: prev[emailId]?.isEditing || false,
                error: prev[emailId]?.error || null,
                isDraftOpen: prev[emailId]?.isDraftOpen || false,
            },
        }));
    }, []);

    const setDraftError = useCallback((emailId: string, error: string | null) => {
        setDraftsByEmail(prev => ({
            ...prev,
            [emailId]: {
                ...prev[emailId],
                emailId,
                error,
                isGenerating: false,
                draftResponse: prev[emailId]?.draftResponse || null,
                isEditing: prev[emailId]?.isEditing || false,
                editedDraft: prev[emailId]?.editedDraft || '',
                isDraftOpen: prev[emailId]?.isDraftOpen || false,
            },
        }));
    }, []);

    const setDraftOpen = useCallback((emailId: string, isOpen: boolean) => {
        setDraftsByEmail(prev => ({
            ...prev,
            [emailId]: {
                ...prev[emailId],
                emailId,
                isDraftOpen: isOpen,
                draftResponse: prev[emailId]?.draftResponse || null,
                isGenerating: prev[emailId]?.isGenerating || false,
                isEditing: prev[emailId]?.isEditing || false,
                editedDraft: prev[emailId]?.editedDraft || '',
                error: prev[emailId]?.error || null,
            },
        }));
    }, []);

    const getDraftState = useCallback(
        (emailId: string): EmailDraftState => {
            return (
                draftsByEmail[emailId] || {
                    emailId,
                    draftResponse: null,
                    isGenerating: false,
                    isEditing: false,
                    editedDraft: '',
                    error: null,
                    isDraftOpen: false,
                }
            );
        },
        [draftsByEmail]
    );

    // Reply management
    const setEmailReplying = useCallback((emailId: string, isSending: boolean) => {
        setRepliesByEmail(prev => ({
            ...prev,
            [emailId]: {
                emailId,
                isSending,
            },
        }));
    }, []);

    const isEmailReplying = useCallback(
        (emailId: string): boolean => {
            return repliesByEmail[emailId]?.isSending || false;
        },
        [repliesByEmail]
    );

    // Selection management
    const selectEmail = useCallback((emailId: string | null) => {
        setSelectedEmailId(emailId);
    }, []);

    const getSelectedEmail = useCallback(
        (accountId: string): (CategorizedEmail | CategorizedEmailWithPriority) | null => {
            if (!selectedEmailId) return null;
            const emails = emailsByAccount[accountId]?.emails || [];
            return emails.find(e => e.id === selectedEmailId) || null;
        },
        [selectedEmailId, emailsByAccount]
    );

    // Helper getters
    const getAccountEmails = useCallback(
        (accountId: string): (CategorizedEmail | CategorizedEmailWithPriority)[] => {
            return emailsByAccount[accountId]?.emails || [];
        },
        [emailsByAccount]
    );

    const getAccountStats = useCallback(
        (accountId: string) => {
            return emailsByAccount[accountId]?.stats || null;
        },
        [emailsByAccount]
    );

    const getAccountPriorityStats = useCallback(
        (accountId: string) => {
            return emailsByAccount[accountId]?.priorityStats || null;
        },
        [emailsByAccount]
    );

    const isAccountAnalyzing = useCallback(
        (accountId: string): boolean => {
            return emailsByAccount[accountId]?.isAnalyzing || false;
        },
        [emailsByAccount]
    );

    const value: CourseInboxContextState = {
        emailsByAccount,
        draftsByEmail,
        repliesByEmail,
        selectedEmailId,
        setAccountEmails,
        setAccountAnalyzing,
        setAccountStats,
        setAccountPriorityStats,
        clearAccountData,
        initializeDraft,
        setDraftGenerating,
        setDraftResponse,
        setDraftEditing,
        setDraftEditedContent,
        setDraftError,
        setDraftOpen,
        getDraftState,
        setEmailReplying,
        isEmailReplying,
        selectEmail,
        getSelectedEmail,
        getAccountEmails,
        getAccountStats,
        getAccountPriorityStats,
        isAccountAnalyzing,
    };

    return <CourseInboxContext.Provider value={value}>{children}</CourseInboxContext.Provider>;
}

/**
 * Hook to use the context
 */
export function useCourseInbox() {
    const context = useContext(CourseInboxContext);
    if (context === undefined) {
        throw new Error('useCourseInbox must be used within a CourseInboxProvider');
    }
    return context;
}
