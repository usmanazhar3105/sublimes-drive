import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner';

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  points_awarded: number;
  created_at: string;
}

export interface ReferralStats {
  totalReferrals: number;
  totalPoints: number;
  recentReferrals: Referral[];
}

export function useReferral() {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    totalPoints: 0,
    recentReferrals: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Get or create referral code
      const { data: profile } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('id', user.id)
        .single();

      let code = profile?.referral_code;
      if (!code) {
        // Generate referral code
        code = `REF-${user.id.substring(0, 8).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
        await supabase
          .from('profiles')
          .update({ referral_code: code })
          .eq('id', user.id);
      }
      setReferralCode(code);

      // Fetch referral stats
      const { data: referrals, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && referrals) {
        const totalPoints = referrals.reduce((sum, r) => sum + (r.points_awarded || 0), 0);
        setStats({
          totalReferrals: referrals.length,
          totalPoints,
          recentReferrals: referrals,
        });
      }
    } catch (error: any) {
      console.error('Error fetching referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyReferralCode = async (code: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to apply referral code');
        return { error: 'Not authenticated' };
      }

      // Find referrer by code
      const { data: referrer } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('referral_code', code.toUpperCase())
        .single();

      if (!referrer) {
        toast.error('Invalid referral code');
        return { error: 'Invalid code' };
      }

      if (referrer.id === user.id) {
        toast.error('You cannot use your own referral code');
        return { error: 'Self-referral not allowed' };
      }

      // Check if already referred
      const { data: existing } = await supabase
        .from('referrals')
        .select('id')
        .eq('referred_id', user.id)
        .maybeSingle();

      if (existing) {
        toast.error('You have already used a referral code');
        return { error: 'Already referred' };
      }

      // Create referral record
      const { error: referralError } = await supabase
        .from('referrals')
        .insert({
          referrer_id: referrer.id,
          referred_id: user.id,
          points_awarded: 5, // +5 XP for all users
        });

      if (referralError) throw referralError;

      // Award XP to both users
      await supabase.rpc('fn_update_xp', {
        p_user_id: user.id,
        p_amount: 5,
        p_reason: 'Referral signup bonus',
      });

      await supabase.rpc('fn_update_xp', {
        p_user_id: referrer.id,
        p_amount: 5,
        p_reason: 'Referral bonus',
      });

      // If referrer is garage owner, award bid credits (if enabled)
      if (referrer.role === 'garage_owner') {
        // TODO: Award bid credits via wallet
        // await supabase.rpc('fn_credit_wallet', { ... });
      }

      toast.success('Referral code applied! You both earned +5 XP!');
      await fetchReferralData();
      return { error: null };
    } catch (error: any) {
      console.error('Error applying referral code:', error);
      toast.error('Failed to apply referral code');
      return { error };
    }
  };

  return {
    referralCode,
    stats,
    loading,
    refetch: fetchReferralData,
    applyReferralCode,
  };
}


