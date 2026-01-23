import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { createProfileIfNotExists } from '@/lib/profileUtils';

export function useRole() {
  const [role, setRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isGarageOwner, setIsGarageOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    loadRole();
  }, []);

  const loadRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Use maybeSingle() to avoid 406 error when profile doesn't exist
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        // Only log unexpected errors
        if (error.code !== 'PGRST116' && !error.message.includes('0 rows') && !error.message.includes('not found')) {
          console.warn('Error fetching role:', error.message);
        }
        // Try to create profile if it doesn't exist (silently)
        if (error.code === 'PGRST116' || error.message.includes('0 rows') || error.message.includes('not found')) {
          // Silently try to create - don't spam errors if it fails
          createProfileForUser(user).catch(() => {
            // Silently fail - DB trigger will create profile
          });
        }
      } else if (data) {
        setRole(data.role);
        setIsAdmin(data.role === 'admin' || data.role === 'super-admin');
        setIsGarageOwner(data.role === 'garage_owner');
      } else {
        // Profile doesn't exist - try to create one (silently, non-blocking)
        // Don't await - let it run in background, DB trigger will handle it
        createProfileForUser(user).catch(() => {
          // Silently fail - DB trigger will create profile on next auth event
        });
      }
    } catch (err) {
      // Silently fail - set default role
      setRole('browser');
    } finally {
      setLoading(false);
    }
  };

  const createProfileForUser = async (user: any) => {
    try {
      // Use production-proven profile creation utility
      // Only sends { id: user.id } - NO role field
      const { data: newProfile, error: upsertError } = await createProfileIfNotExists(user.id);

      if (upsertError) {
        // Don't log errors for RLS/duplicate - these are expected
        // Only log unexpected errors
        if (!upsertError.message?.includes('duplicate') && 
            !upsertError.message?.includes('unique') &&
            !upsertError.message?.includes('policy')) {
          console.warn('Profile creation error:', upsertError.message);
        }
        // Set default subscriber role for UI to work
        // DB trigger will create profile eventually
        setRole('browser');
        setIsAdmin(false);
        setIsGarageOwner(false);
      } else if (newProfile) {
        setRole(newProfile.role);
        setIsAdmin(newProfile.role === 'admin' || newProfile.role === 'super-admin');
        setIsGarageOwner(newProfile.role === 'garage_owner');
      } else {
        // Fallback - wait for DB trigger to create profile
        setRole('browser');
      }
    } catch (err) {
      // Silently fail - DB trigger will handle profile creation
      setRole('browser');
    }
  };

  return { 
    role, 
    isAdmin, 
    isEditor: role === 'editor',
    isAdminOrEditor: role === 'admin' || role === 'editor',
    isGarageOwner, 
    loading 
  };
}
