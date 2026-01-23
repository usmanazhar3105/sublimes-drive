import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner';

export interface DailyChallenge {
  id: string;
  title: string;
  description?: string;
  challenge_type: string;
  category?: string;
  difficulty?: string;
  target_count: number;
  requirement_count?: number;
  requirement_type?: string;
  xp_reward: number;
  reward_xp?: number;
  coins_reward?: number;
  coin_reward?: number;
  start_date?: string;
  end_date?: string;
  challenge_date?: string;
  starts_at?: string;
  ends_at?: string;
  active_date?: string;
  is_active: boolean;
  status?: string;
  icon?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserChallengeProgress {
  id?: string;
  challenge_id: string;
  user_id?: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
  started_at?: string;
  completed_at?: string | null;
  claimed_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export function useDailyChallenges() {
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [userProgress, setUserProgress] = useState<Record<string, UserChallengeProgress>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      setError(null);
      const today = new Date().toISOString().split('T')[0];

      // Fetch active challenges - RLS policy allows public read for active challenges
      // First, try to fetch all active challenges
      const { data: challengesData, error: challengesError } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (challengesError) {
        // Handle RLS or permission errors gracefully
        if (challengesError.code === '42501' || challengesError.code === '42P01') {
          console.warn('⚠️ daily_challenges table not accessible');
          setChallenges([]);
          setUserProgress({});
          return;
        }
        throw challengesError;
      }

      // Filter challenges that are actually active today
      const todayChallenges = (challengesData || []).filter((challenge: any) => {
        // Try different date field names
        const startDate = challenge.start_date || challenge.challenge_date || 
          (challenge.starts_at ? challenge.starts_at.split('T')[0] : null) ||
          (challenge.active_date ? challenge.active_date.split('T')[0] : null);
        const endDate = challenge.end_date || challenge.challenge_date || 
          (challenge.ends_at ? challenge.ends_at.split('T')[0] : null);
        
        // If no dates are set, include the challenge (assume it's always active)
        if (!startDate && !endDate) return true;
        
        // If only one date is set, use it for both
        const effectiveStartDate = startDate || endDate;
        const effectiveEndDate = endDate || startDate;
        
        return effectiveStartDate <= today && effectiveEndDate >= today;
      });
      
      setChallenges(todayChallenges);

      // Fetch user progress - RLS policy allows users to read their own progress
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const challengeIds = challenges.map(c => c.id);
        if (challengeIds.length > 0) {
          const { data: progressData, error: progressError } = await supabase
            .from('user_daily_progress')
            .select('*')
            .eq('user_id', user.id)
            .in('challenge_id', challengeIds);

          if (progressError) {
            // Handle RLS or missing table gracefully
            if (progressError.code === '42501' || progressError.code === '42P01') {
              console.warn('⚠️ user_daily_progress table not accessible');
              setUserProgress({});
            } else {
              console.error('Error fetching user progress:', progressError);
            }
          } else if (progressData) {
            const progressMap: Record<string, UserChallengeProgress> = {};
            progressData.forEach((p: any) => {
              progressMap[p.challenge_id] = {
                id: p.id,
                challenge_id: p.challenge_id,
                user_id: p.user_id,
                progress: p.progress || 0,
                completed: p.completed || false,
                claimed: p.claimed || false,
                started_at: p.started_at,
                completed_at: p.completed_at,
                claimed_at: p.claimed_at,
                created_at: p.created_at,
                updated_at: p.updated_at,
              };
            });
            setUserProgress(progressMap);
          }
        } else {
          setUserProgress({});
        }
      } else {
        setUserProgress({});
      }
    } catch (error: any) {
      console.error('Error fetching challenges:', error);
      setError(error);
      // Don't show toast for RLS/permission errors - they're expected for unauthenticated users
      if (error.code !== '42501' && error.code !== '42P01') {
        toast.error('Failed to load challenges');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (challengeId: string, increment: number = 1) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { error: new Error('Not authenticated') };
      }

      // Get existing progress or create new
      const existing = userProgress[challengeId];
      const challenge = challenges.find(c => c.id === challengeId);
      
      if (!challenge) {
        return { error: new Error('Challenge not found') };
      }

      const newProgress = (existing?.progress || 0) + increment;
      const targetCount = challenge.target_count || challenge.requirement_count || 1;
      const isCompleted = newProgress >= targetCount;

      if (existing?.id) {
        // Update existing progress - RLS allows users to update their own records
        const { error: updateError } = await supabase
          .from('user_daily_progress')
          .update({
            progress: newProgress,
            completed: isCompleted,
            completed_at: isCompleted && !existing.completed ? new Date().toISOString() : existing.completed_at,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (updateError) throw updateError;
      } else {
        // Create new progress record - RLS allows users to insert their own records
        const { error: insertError } = await supabase
          .from('user_daily_progress')
          .insert({
            user_id: user.id,
            challenge_id: challengeId,
            progress: newProgress,
            completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : null,
            claimed: false,
            started_at: new Date().toISOString(),
          });

        if (insertError) throw insertError;
      }

      if (isCompleted && !existing?.completed) {
        toast.success('🎉 Challenge completed!', {
          description: `You earned ${challenge.xp_reward || challenge.reward_xp || 0} XP!`,
        });
      }

      await fetchChallenges();
      return { error: null };
    } catch (error: any) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
      return { error };
    }
  };

  const claimReward = async (challengeId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to claim rewards');
        return { error: new Error('Not authenticated') };
      }

      const progress = userProgress[challengeId];
      if (!progress) {
        return { error: new Error('Progress not found') };
      }

      if (!progress.completed) {
        return { error: new Error('Challenge not completed yet') };
      }

      if (progress.claimed) {
        return { error: new Error('Reward already claimed') };
      }

      const challenge = challenges.find(c => c.id === challengeId);
      if (!challenge) {
        return { error: new Error('Challenge not found') };
      }

      // Update progress as claimed - RLS allows users to update their own records
      const { error: updateError } = await supabase
        .from('user_daily_progress')
        .update({
          claimed: true,
          claimed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', progress.id || challengeId)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Award XP - try different methods
      const xpReward = challenge.xp_reward || challenge.reward_xp || 0;
      if (xpReward > 0) {
        // Try RPC function first
        try {
          const { error: rpcError } = await supabase.rpc('fn_award_xp', {
            p_user_id: user.id,
            p_amount: xpReward,
            p_source: 'daily_challenge',
            p_related_id: challengeId,
          });
          
          if (rpcError) {
            // Fallback: Update profiles directly if RPC doesn't exist
            console.warn('RPC function not available, updating profile directly');
            const { data: profile } = await supabase
              .from('profiles')
              .select('xp_points')
              .eq('id', user.id)
              .single();
            
            if (profile) {
              await supabase
                .from('profiles')
                .update({
                  xp_points: (profile.xp_points || 0) + xpReward,
                })
                .eq('id', user.id);
            }
          }
        } catch (xpError) {
          console.warn('Could not award XP:', xpError);
        }
      }

      toast.success('🎁 Reward claimed!', {
        description: `+${xpReward} XP earned!`,
      });

      await fetchChallenges();
      return { error: null };
    } catch (error: any) {
      console.error('Error claiming reward:', error);
      toast.error('Failed to claim reward');
      return { error };
    }
  };

  // Get challenges with progress combined
  const getChallengeProgress = (challengeId: string): UserChallengeProgress | undefined => {
    return userProgress[challengeId];
  };

  const challengesWithProgress = challenges.map(challenge => {
    const progress = getChallengeProgress(challenge.id);
    const targetCount = challenge.target_count || challenge.requirement_count || 1;
    const currentProgress = progress?.progress || 0;
    
    return {
      ...challenge,
      target_count: targetCount, // Ensure target_count is always available
      progress: currentProgress,
      completed: progress?.completed || false,
      claimed: progress?.claimed || false,
      progressPercentage: Math.min((currentProgress / targetCount) * 100, 100),
      coin_reward: challenge.coin_reward || challenge.coins_reward || 0,
      xp_reward: challenge.xp_reward || challenge.reward_xp || 0,
      claimed_at: progress?.claimed_at,
    };
  });

  const activeChallenges = challengesWithProgress.filter(c => !c.completed);
  const completedChallenges = challengesWithProgress.filter(c => c.completed && !c.claimed);
  const claimedChallenges = challengesWithProgress.filter(c => c.claimed);

  return {
    challenges,
    userProgress,
    challengesWithProgress,
    activeChallenges,
    completedChallenges,
    claimedChallenges,
    loading,
    error,
    updateProgress,
    claimReward,
    getChallengeProgress,
    refetch: fetchChallenges,
  };
}


