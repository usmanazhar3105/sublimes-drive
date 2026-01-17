/**
 * Profile Creation Utility
 * 
 * Production-proven profile creation function.
 * Ensures ONLY id is sent - no role field (even undefined/null).
 * Database assigns DEFAULT role (subscriber).
 * 
 * @module lib/profileUtils
 */

import { supabase } from './supabase';

/**
 * Create profile if it doesn't exist
 * 
 * Uses upsert to handle both new users and existing profiles.
 * Only sends { id: user.id } - NO other fields.
 * Database trigger or DEFAULT value assigns role.
 * 
 * @param userId - The user ID from auth.users
 * @returns Promise with data and error
 */
export async function createProfileIfNotExists(userId: string) {
  // CRITICAL: Only id field - NO role, NO other fields
  // Even undefined/null role can override DB default
  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      { id: userId },
      { onConflict: 'id' } // Ensures it only inserts once, handles duplicates
    )
    .select('id, role')
    .maybeSingle();

  if (error) {
    console.error('Profile upsert failed:', error);
    return { data: null, error };
  }

  console.log('✅ Profile ready:', data);
  return { data, error: null };
}

