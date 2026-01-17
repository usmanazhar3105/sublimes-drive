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
 * Uses INSERT with ON CONFLICT to handle both new users and existing profiles.
 * Only sends { id: user.id } - NO other fields.
 * Database trigger or DEFAULT value assigns role.
 * 
 * @param userId - The user ID from auth.users
 * @returns Promise with data and error
 */
export async function createProfileIfNotExists(userId: string) {
  if (!userId) {
    return { data: null, error: new Error('User ID is required') };
  }

  try {
    // CRITICAL: Only id field - NO role, NO other fields
    // Even undefined/null role can override DB default
    // Use INSERT with ON CONFLICT DO NOTHING (safer than upsert for RLS)
    const { data, error } = await supabase
      .from('profiles')
      .insert({ id: userId })
      .select('id, role')
      .maybeSingle();

    // If error is due to duplicate (profile already exists), that's OK
    if (error) {
      // Check if it's a unique constraint violation (profile already exists)
      if (error.code === '23505' || error.message?.includes('duplicate') || error.message?.includes('unique')) {
        // Profile already exists - fetch it instead
        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('id', userId)
          .maybeSingle();
        
        if (fetchError) {
          console.warn('Profile exists but fetch failed:', fetchError);
          return { data: null, error: fetchError };
        }
        
        console.log('✅ Profile already exists:', existingProfile);
        return { data: existingProfile, error: null };
      }
      
      // Other errors (RLS, etc.)
      console.error('Profile insert failed:', error);
      return { data: null, error };
    }

    console.log('✅ Profile created:', data);
    return { data, error: null };
  } catch (err) {
    console.error('Profile creation exception:', err);
    return { data: null, error: err as Error };
  }
}




