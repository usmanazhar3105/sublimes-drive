import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase/client';

export type UserRole = 'admin' | 'editor' | 'car_owner' | 'garage_owner' | 'vendor' | 'browser';

export interface Profile {
  id: string;
  email: string;
  display_name?: string;
  username?: string;
  avatar_url?: string;
  cover_image?: string;
  role?: UserRole;
  wallet_balance?: number;
  bid_wallet_balance?: number;
  vehicles?: any[];
  phone?: string;
  bio?: string;
  location?: string;
  created_at?: string;
  updated_at?: string;
}

export function useRole() {
  const [role, setRole] = useState<UserRole>('browser');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchRole() {
      try {
        // 🧪 TEST BYPASS: Check for mock profile first (NO SUPABASE REQUIRED)
        const mockProfile = (window as any).__MOCK_PROFILE__;
        if (mockProfile) {
          console.log('🧪 Using mock role (test bypass mode):', mockProfile.role);
          if (mounted) {
            setRole((mockProfile.role as UserRole) || 'user');
            setUserId(mockProfile.id);
            setLoading(false);
          }
          return;
        }
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          if (mounted) {
            setRole('browser');
            setUserId(null);
            setLoading(false);
          }
          return;
        }

        if (mounted) {
          setUserId(user.id);
        }

        // Try role from auth metadata first
        const metaRoleRaw = ((user.app_metadata as any)?.user_role || (user.app_metadata as any)?.role) as string | undefined;
        const metaAdminFlag = (user.user_metadata as any)?.is_admin || (user.app_metadata as any)?.is_admin;
        const normalizedMetaRole = (['admin','editor','car_owner','garage_owner','vendor','browser'].includes((metaRoleRaw || '').toLowerCase()))
          ? (metaRoleRaw as UserRole)
          : undefined;

        // If explicit admin flag present, trust it
        if (metaAdminFlag) {
          if (mounted) {
            setRole('admin');
            setLoading(false);
          }
          return;
        }

        // If metadata states admin/editor, accept and return early
        if (normalizedMetaRole === 'admin' || normalizedMetaRole === 'editor') {
          if (mounted) {
            setRole(normalizedMetaRole);
            setLoading(false);
          }
          return;
        }

        // Authoritative backend check: public.is_admin()
        try {
          const { data: isAdminRpc } = await supabase.rpc('is_admin');
          if (isAdminRpc) {
            if (mounted) {
              setRole('admin');
              setLoading(false);
            }
            return;
          }
        } catch (_) {
          // ignore and continue fallbacks
        }

        // Try to get role from profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, user_role, is_admin')
          .eq('id', user.id)
          .maybeSingle();

        const profileRole = ((profile as any)?.role || (profile as any)?.user_role) as UserRole | undefined;
        const derivedFromFlag = (profile as any)?.is_admin ? ('admin' as UserRole) : undefined;
        const derivedProfileRole = (profileRole || derivedFromFlag) as UserRole | undefined;

        if (derivedProfileRole) {
          if (mounted) {
            setRole(derivedProfileRole);
            setLoading(false);
          }
          return;
        }

        // Fallback to user_profiles table (support both id=auth uid and auth_user_id=auth uid)
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('role, is_admin, auth_user_id')
          .or(`id.eq.${user.id},auth_user_id.eq.${user.id}`)
          .maybeSingle();

        const upRoleRaw = (userProfile as any)?.role as string | undefined;
        const upIsAdminFlag = !!(userProfile as any)?.is_admin;
        const normalizedUpRole = (['admin','editor','car_owner','garage_owner','vendor','browser'].includes((upRoleRaw || '').toLowerCase()))
          ? (upRoleRaw as UserRole)
          : undefined;

        if (upIsAdminFlag || normalizedUpRole === 'admin' || normalizedUpRole === 'editor') {
          if (mounted) {
            setRole(upIsAdminFlag ? 'admin' : (normalizedUpRole as UserRole));
            setLoading(false);
          }
          return;
        }

        // Fallback to user_roles table
        const { data: userRoles } = await supabase
          .from('user_roles')
          .select('role')
          .or(`user_id.eq.${user.id},uid.eq.${user.id}`)
          .limit(1);

        const fallbackRole = ((userRoles as any)?.[0]?.role as UserRole) || 'browser';
        
        if (mounted) {
          setRole(fallbackRole);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching role:', error);
        if (mounted) {
          setRole('browser');
          setLoading(false);
        }
      }
    }

    fetchRole();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchRole();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    role,
    userId,
    loading,
    isAdmin: role === 'admin',
    isEditor: role === 'editor',
    isAdminOrEditor: role === 'admin' || role === 'editor',
    isGarageOwner: role === 'garage_owner',
    isVendor: role === 'vendor',
    isCarOwner: role === 'car_owner',
    isBrowser: role === 'browser',
  };
}
