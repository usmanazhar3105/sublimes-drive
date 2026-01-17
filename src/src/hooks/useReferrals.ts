import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase/client';

export interface Referral {
  id: string;
  referrer_id: string;
  referee_id: string;
  referral_code: string;
  email?: string;
  status: 'pending' | 'signed_up' | 'qualified' | 'rewarded';
  qualified_at?: string;
  rewarded_at?: string;
  created_at: string;
}

export function useReferrals(userId?: string) {
  const [referralCode, setReferralCode] = useState<string>('');
  const [myReferrals, setMyReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState({
    total_referrals: 0,
    qualified: 0,
    rewarded: 0,
    total_xp_earned: 0,
    total_credits_earned: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    const targetId = userId as string;

    async function fetchReferralData() {
      try {
        // 1. Get the user's referral code from profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('referral_code')
          .eq('id', userId)
          .single();

        console.log('📋 Profile data:', profile);

        if (profileError) {
          const code = (profileError as any)?.code || '';
          const msg = ((profileError as any)?.message || '').toLowerCase();
          const columnMissing = code === '42703' || code === 'PGRST204' || msg.includes('referral_code') || msg.includes('schema cache');
          const rlsRecursion = code === '42P17' || msg.includes('infinite recursion') || msg.includes('policy');
          if (!(columnMissing || rlsRecursion)) {
            console.error('❌ Error fetching profile:', profileError);
          }

          const { data: { user } } = await supabase.auth.getUser();
          let generated = '';
          if (user?.email) {
            generated = user.email.split('@')[0].toUpperCase();
          } else {
            generated = `USER${targetId.substring(0, 8).toUpperCase()}`;
          }
          setReferralCode(generated);
        } else if (!profile?.referral_code) {
          console.log('⚠️ No referral code found, generating one...');
          const { data: { user } } = await supabase.auth.getUser();
          let newReferralCode = '';
          if (user?.email) {
            newReferralCode = user.email.split('@')[0].toUpperCase();
            console.log('✅ Generated referral code from email:', newReferralCode);
          } else {
            newReferralCode = `USER${targetId.substring(0, 8).toUpperCase()}`;
            console.log('⚠️ Using fallback referral code:', newReferralCode);
          }

          const { error: updateError } = await supabase
            .from('profiles')
            .update({ referral_code: newReferralCode })
            .eq('id', targetId);

          if (updateError) {
            const ucode = (updateError as any)?.code || '';
            const umsg = ((updateError as any)?.message || '').toLowerCase();
            const columnMissing = ucode === '42703' || ucode === 'PGRST204' || umsg.includes('referral_code') || umsg.includes('schema cache');
            const rlsRecursion = ucode === '42P17' || umsg.includes('infinite recursion') || umsg.includes('policy');
            if (!(columnMissing || rlsRecursion)) {
              console.error('❌ Error updating referral code:', updateError);
            }
            setReferralCode(newReferralCode);
          } else {
            console.log('✅ Referral code saved to profile!');
            setReferralCode(newReferralCode);
          }
        } else {
          console.log('✅ Referral code found:', profile.referral_code);
          setReferralCode(profile.referral_code);
        }

        // 2. Fetch referrals made by this user (gracefully handle permission errors)
        const { data: referrals, error: referralsError } = await supabase
          .from('referrals')
          .select('*')
          .eq('referrer_id', userId)
          .order('created_at', { ascending: false });

        if (referralsError) {
          // Silently handle permission errors - referrals feature is optional
          if (referralsError.code === '42501') {
            console.warn('⚠️ Referrals table permissions not set up yet. Skipping referrals.');
          } else {
            console.error('❌ Error fetching referrals:', referralsError);
          }
          setMyReferrals([]); // Set empty array instead of failing
        } else {
          console.log('📊 Referrals:', referrals);
          setMyReferrals(referrals || []);
        }

        // 3. Calculate stats (only if referrals loaded successfully)
        const total = referrals?.length || 0;
        const qualified = referrals?.filter(r => ['qualified', 'rewarded'].includes(r.status)).length || 0;
        const rewarded = referrals?.filter(r => r.status === 'rewarded').length || 0;

        // Get XP/credits from referral rewards (optional - fail silently if table doesn't exist)
        let totalXp = 0;
        let totalCredits = 0;

        try {
          const { data: xpEvents } = await supabase
            .from('xp_events')
            .select('points')
            .eq('user_id', userId)
            .eq('type', 'referral_reward');

          const { data: transactions } = await supabase
            .from('wallet_transactions')
            .select('amount_cents')
            .eq('user_id', userId)
            .eq('ref_type', 'referral')
            .eq('type', 'credit');

          totalXp = xpEvents?.reduce((sum, e) => sum + e.points, 0) || 0;
          totalCredits = transactions?.reduce((sum, t) => sum + t.amount_cents, 0) || 0;
        } catch (err) {
          // Silently fail - XP/credits are optional
          console.warn('⚠️ Could not fetch XP/credits (tables may not exist)');
        }

        setStats({
          total_referrals: total,
          qualified,
          rewarded,
          total_xp_earned: totalXp,
          total_credits_earned: totalCredits
        });
      } catch (err) {
        console.error('❌ Error fetching referral data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchReferralData();
  }, [userId]);

  // Format stats for compatibility
  const referralStats = {
    count: stats.total_referrals,
    earned: stats.total_xp_earned
  };

  return {
    referralCode,
    myReferrals,
    stats,
    loading,
    referralStats
  };
}
