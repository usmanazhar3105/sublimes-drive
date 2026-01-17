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
        console.warn('Error fetching role:', error.message);
        // Try to create profile if it doesn't exist
        if (error.code === 'PGRST116' || error.message.includes('0 rows')) {
          await createProfileForUser(user);
        }
      } else if (data) {
        setRole(data.role);
        setIsAdmin(data.role === 'admin' || data.role === 'super-admin');
        setIsGarageOwner(data.role === 'garage_owner');
      } else {
        // Profile doesn't exist - create one
        await createProfileForUser(user);
      }
    } catch (err) {
      console.error('Error in loadRole:', err);
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
        console.warn('Could not create profile:', upsertError.message);
        // Still set default subscriber role for UI to work
        setRole('subscriber');
        setIsAdmin(false);
        setIsGarageOwner(false);
      } else if (newProfile) {
        setRole(newProfile.role);
        setIsAdmin(newProfile.role === 'admin' || newProfile.role === 'super-admin');
        setIsGarageOwner(newProfile.role === 'garage_owner');
      } else {
        // Fallback - wait for DB trigger to create profile
        setRole('subscriber');
      }
    } catch (err) {
      console.warn('Profile creation failed:', err);
      // Fallback - wait for DB trigger
      setRole('subscriber');
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
