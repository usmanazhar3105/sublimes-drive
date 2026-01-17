// Re-export from unified supabase client
import { supabase as unifiedClient, getSupabaseClient } from './supabase';

export const supabase = unifiedClient;
export { getSupabaseClient };
export default unifiedClient;

// Also export createClient for compatibility
export function createClient() {
  return unifiedClient;
}

