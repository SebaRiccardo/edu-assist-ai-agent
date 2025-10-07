import { createBrowserClient } from '@supabase/ssr';
import { Database } from './db';
import { useMemo } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';

export type TypedSupabaseClient = SupabaseClient<Database>;

let client: TypedSupabaseClient | undefined;

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
  );
}

function getSupabaseBrowserClient() {
  if (client) {
    return client;
  }
  client = createClient();
  return client;
}

function useSupabaseBrowser() {
  return useMemo(getSupabaseBrowserClient, []);
}

export default useSupabaseBrowser;
