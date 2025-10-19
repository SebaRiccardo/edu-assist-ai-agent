'use client';

import { useDeleteMutation, useInsertMutation, useQuery, useUpdateMutation } from '@supabase-cache-helpers/postgrest-react-query';
import useSupabaseBrowser from '@/lib/supabase/client';
import { InsertInboxes } from '@/lib/supabase/types/inboxes.types';
import { getInboxesByCourseIdQuery } from './queries/inboxes';

interface CreateInboxParams {
  courseId: string;
  email: string;
  composioConnectionId: string;
}

interface DeleteInboxParams {
  inboxId: string;
}

/**
 * Hook to fetch inboxes for a specific course
 */
export function useInboxes(courseId: string) {
  const client = useSupabaseBrowser();
  return useQuery(getInboxesByCourseIdQuery(client, courseId), {
    enabled: !!courseId,
  });
}

export function useCreateInbox() {
  const client = useSupabaseBrowser();

  return useInsertMutation(client.from('inboxes'), ['id'], null, {
    onSuccess: () => {
      console.log('Inbox created successfully');
    },
  });
}

export function useUpdateInbox() {
  const client = useSupabaseBrowser();

  return useUpdateMutation(client.from('inboxes'), ['id'], null, {
    onSuccess: () => {
      console.log('Inbox updated successfully');
    },
  });
}

export function useDeleteInbox() {
  const client = useSupabaseBrowser();

  return useDeleteMutation(client.from('inboxes'), ['id'], null, {
    onSuccess: () => {
      console.log('Inbox deleted successfully');
    },
  });
}

/**
 * Hook to create a new inbox
 * Note: This uses the browser client directly for mutations since @supabase-cache-helpers
 * doesn't provide mutation helpers that fit our use case
 */
export async function createInbox(params: CreateInboxParams) {
  const client = useSupabaseBrowser();
  const { courseId, email, composioConnectionId } = params;

  // Check if inbox already exists for this course and email
  const { data: existingInbox } = await client.from('inboxes').select('*').eq('course_id', courseId).eq('email', email).maybeSingle();

  if (existingInbox) {
    // Update the existing inbox with the new connection ID
    const { data: updatedInbox, error: updateError } = await client
      .from('inboxes')
      .update({
        connected_account_id: composioConnectionId,
        updated_at: new Date().toISOString(),
      })
      .eq('course_id', courseId)
      .eq('email', email)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating inbox:', updateError);
      throw new Error(updateError.message || 'Failed to update inbox');
    }

    return { inbox: updatedInbox, message: 'Inbox updated successfully' };
  }

  // Create new inbox
  const newInbox: InsertInboxes = {
    connected_account_id: composioConnectionId,
    course_id: courseId,
    email: email,
    unread_count: 0,
  };

  const { data: inbox, error } = await client.from('inboxes').insert(newInbox).select().single();

  if (error) {
    console.error('Error creating inbox:', error);
    throw new Error(error.message || 'Failed to create inbox');
  }

  return { inbox, message: 'Inbox created successfully' };
}

/**
 * Hook to delete an inbox
 * Note: This uses the browser client directly for mutations
 */
export async function deleteInbox({ inboxId }: DeleteInboxParams) {
  const client = useSupabaseBrowser();

  const { error } = await client.from('inboxes').delete().eq('id', inboxId);

  if (error) {
    console.error('Error deleting inbox:', error);
    throw new Error(error.message || 'Failed to delete inbox');
  }

  return { message: 'Inbox deleted successfully' };
}
