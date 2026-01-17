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
        const { data, error: fetchError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', userId);

        if (fetchError) throw fetchError;

        setRoles(data || []);
        
        // Extract approved badges
        const approvedBadges = (data || [])
          .filter(r => r.status === 'approved')
          .map(r => r.role);
        setBadges(approvedBadges);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching roles:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchRoles();

    // Subscribe to role changes
    const subscription = supabase
      .channel(`user_roles:${userId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'user_roles',
          filter: `user_id=eq.${userId}`
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
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role,
          status: 'pending',
          applied_at: new Date().toISOString(),
          meta: meta || {}
        });

      if (insertError) throw insertError;

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
