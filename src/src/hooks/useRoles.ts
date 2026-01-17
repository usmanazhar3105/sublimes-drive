import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase/client';

export interface UserRole {
  role: 'browser' | 'owner' | 'garage' | 'vendor' | 'editor' | 'admin';
  status: 'pending' | 'approved' | 'rejected';
  applied_at: string;
  approved_at?: string;
  meta?: Record<string, any>;
}

export function useRoles(userId?: string) {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [badges, setBadges] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchRoles() {
      try {
        // user_roles table doesn't exist - use profiles table instead
        // Get role from profiles table
        const { data: profile, error: fetchError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .maybeSingle();

        if (fetchError) {
          // Silently fail - table might not exist
          setRoles([]);
          setBadges([]);
          setLoading(false);
          return;
        }

        // Convert profile role to UserRole format
        if (profile && profile.role) {
          const role: UserRole = {
            role: profile.role as any,
            status: 'approved',
            applied_at: new Date().toISOString(),
            approved_at: new Date().toISOString()
          };
          setRoles([role]);
          setBadges([profile.role]);
        } else {
          setRoles([]);
          setBadges([]);
        }
      } catch (err) {
        // Silently fail - user_roles table doesn't exist
        setRoles([]);
        setBadges([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRoles();

    // Subscribe to profile changes (instead of user_roles)
    const subscription = supabase
      .channel(`profiles:${userId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'profiles',
          filter: `id=eq.${userId}`
        },
        () => {
          fetchRoles();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const applyForRole = async (role: UserRole['role'], meta?: Record<string, any>) => {
    try {
      // user_roles table doesn't exist - update profiles table instead
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: new Error('Not authenticated') };
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: role as string })
        .eq('id', user.id);

      if (updateError) throw updateError;

      return { success: true };
    } catch (err) {
      console.error('Error applying for role:', err);
      return { success: false, error: err };
    }
  };

  const hasRole = (role: string) => badges.includes(role);
  const isPending = (role: string) => roles.some(r => r.role === role && r.status === 'pending');
  const isAdmin = hasRole('admin') || hasRole('editor');

  return {
    roles,
    badges,
    loading,
    error,
    applyForRole,
    hasRole,
    isPending,
    isAdmin
  };
}
