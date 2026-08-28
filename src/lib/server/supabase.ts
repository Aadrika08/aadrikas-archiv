import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { ConfigurationError, requireServerConfig } from './config';

/** This module is server-only; the service-role key must never enter a client bundle. */
export function getSupabaseAdmin(): SupabaseClient {
  const config = requireServerConfig();
  return createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

export type GuestbookEntry = {
  id: string;
  name: string;
  message: string;
  x: number;
  y: number;
  created_at: string;
};

export async function getApprovedGuestbookEntries(): Promise<GuestbookEntry[]> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('guestbook_entries')
      .select('id,name,message,x,y,created_at')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as GuestbookEntry[];
  } catch (error) {
    // Pages remain renderable in local previews/builds before Supabase is set up.
    if (error instanceof ConfigurationError) return [];
    throw error;
  }
}
