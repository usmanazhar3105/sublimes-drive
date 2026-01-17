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

        // Get role from profiles table (only use existing columns)
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        // If profile exists and has a role, use it
        if (profile && profile.role) {
          const profileRole = profile.role as string;
          // Normalize role to match UserRole type
          const normalizedRole = (['admin','editor','car_owner','garage_owner','vendor','browser'].includes(profileRole.toLowerCase()))
            ? (profileRole.toLowerCase() as UserRole)
            : 'browser';
          
          if (mounted) {
            setRole(normalizedRole);
            setLoading(false);
          }
          return;
        }

        // If profile doesn't exist or has no role, default to browser
        // (Profile creation is handled by DB trigger)
        if (mounted) {
          setRole('browser');
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
