import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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
      const displayName = user.user_metadata?.full_name || 
                         user.user_metadata?.display_name || 
                         user.email?.split('@')[0] || 
                         'User';
      
      // Try to upsert profile
      const { data: newProfile, error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          display_name: displayName,
          role: 'user', // Default role for new users
          created_at: new Date().toISOString(),
        }, { onConflict: 'id' })
        .select('role')
        .maybeSingle();

      if (upsertError) {
        console.warn('Could not create profile:', upsertError.message);
        // Still set default user role for UI to work
        setRole('user');
        setIsAdmin(false);
        setIsGarageOwner(false);
      } else if (newProfile) {
        setRole(newProfile.role);
        setIsAdmin(newProfile.role === 'admin' || newProfile.role === 'super-admin');
        setIsGarageOwner(newProfile.role === 'garage_owner');
      } else {
        // Fallback
        setRole('user');
      }
    } catch (err) {
      console.warn('Profile creation failed:', err);
      setRole('user');
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
