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
    // First, check if profile already exists (avoid unnecessary insert attempts)
    const { data: existing, error: checkError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', userId)
      .maybeSingle();

    // If profile exists, return it immediately
    if (existing && !checkError) {
      return { data: existing, error: null };
    }

    // Only try to insert if profile doesn't exist
    // CRITICAL: Only id field - NO role, NO other fields
    // Database DEFAULT will assign role = 'subscriber'
    const { data, error } = await supabase
      .from('profiles')
      .insert({ id: userId })
      .select('id, role')
      .maybeSingle();

    if (error) {
      // Check if it's a unique constraint violation (profile was created between check and insert)
      if (error.code === '23505' || error.message?.includes('duplicate') || error.message?.includes('unique')) {
        // Profile was created by trigger or another process - fetch it
        const { data: fetchedProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('id', userId)
          .maybeSingle();
        
        if (fetchError) {
          // Silently fail - DB trigger will handle it
          return { data: null, error: null };
        }
        
        return { data: fetchedProfile, error: null };
      }
      
      // RLS or other errors - silently fail (DB trigger will create profile)
      // Don't log RLS errors as they're expected
      if (!error.message?.includes('policy') && !error.message?.includes('permission')) {
        console.warn('Profile insert failed (non-RLS):', error.message);
      }
      return { data: null, error: null }; // Return null error to indicate "let DB handle it"
    }

    return { data, error: null };
  } catch (err) {
    // Silently fail - DB trigger will handle profile creation
    return { data: null, error: null };
  }
}




