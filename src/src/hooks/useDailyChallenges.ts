import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner';

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  challenge_type: 'post' | 'comment' | 'like' | 'share' | 'listing' | 'garage_visit' | 'event_attend';
  target_count: number;
  xp_reward: number;
  coin_reward: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  icon?: string;
  created_at: string;
}

export interface UserChallengeProgress {
  id: string;
  user_id: string;
  challenge_id: string;
  progress: number;
  completed: boolean;
  completed_at?: string | null;
  claimed: boolean;
  claimed_at?: string | null;
  created_at: string;
  challenge?: DailyChallenge;
}

export function useDailyChallenges() {
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [userProgress, setUserProgress] = useState<UserChallengeProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchChallenges();
    fetchUserProgress();
  }, []);

  async function fetchChallenges() {
    try {
      setLoading(true);

      const today = new Date().toISOString().split('T')[0];

      const { data, error: fetchError } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', today)
        .gte('end_date', today)
        .order('created_at', { ascending: false });

      if (fetchError) {
        // Handle permission denied, table missing, or column missing errors
        if (fetchError.code === '42501' || fetchError.code === '42P01' || fetchError.code === '42703') {
          console.warn('⚠️ daily_challenges table not set up properly. Returning empty array.');
          console.warn('⚠️ Run the SQL fix in Supabase to enable challenges functionality.');
          setChallenges([]);
          setError(null);
        } else {
          throw fetchError;
        }
      } else {
        setChallenges(data || []);
        setError(null);
      }
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching challenges:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUserProgress() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUserProgress([]);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('user_daily_progress')
        .select(`
          *,
          challenge:daily_challenges (*)
        `)
        .eq('user_id', user.id);

      if (fetchError) {
        if (fetchError.code === '42501' || fetchError.code === '42P01') {
          console.warn('⚠️ user_daily_progress table not available yet');
          setUserProgress([]);
        } else {
          throw fetchError;
        }
      } else {
        setUserProgress(data || []);
      }
    } catch (err) {
      console.error('Error fetching user progress:', err);
    }
  }

  async function updateProgress(challengeId: string, increment: number = 1) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { error: new Error('Not authenticated') };
      }

      // Check if progress record exists
      const { data: existing } = await supabase
        .from('user_daily_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('challenge_id', challengeId)
        .single();

      if (existing) {
        // Update existing progress
        const newProgress = existing.progress + increment;
        const challenge = challenges.find(c => c.id === challengeId);
        const completed = challenge ? newProgress >= challenge.target_count : false;

        const { error: updateError } = await supabase
          .from('user_daily_progress')
          .update({
            progress: newProgress,
            completed,
            completed_at: completed ? new Date().toISOString() : null,
          })
          .eq('id', existing.id);

        if (updateError) throw updateError;

        if (completed && !existing.completed) {
          toast.success('🎉 Challenge completed!', {
            description: `You earned ${challenge?.xp_reward} XP and ${challenge?.coin_reward} coins!`,
          });
        }
      } else {
        // Create new progress record
        const { error: insertError } = await supabase
          .from('user_daily_progress')
          .insert({
            user_id: user.id,
            challenge_id: challengeId,
            progress: increment,
            completed: false,
          });

        if (insertError) throw insertError;
      }

      await fetchUserProgress();
      return { error: null };
    } catch (err) {
      console.error('Error updating challenge progress:', err);
      return { error: err as Error };
    }
  }

  async function claimReward(challengeId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { error: new Error('Not authenticated') };
      }

      // Get progress
      const progress = userProgress.find(
        p => p.challenge_id === challengeId && p.completed && !p.claimed
      );

      if (!progress) {
        return { error: new Error('Challenge not completed or already claimed') };
      }

      const challenge = challenges.find(c => c.id === challengeId);
      if (!challenge) {
        return { error: new Error('Challenge not found') };
      }

      // Update progress as claimed
      const { error: updateError } = await supabase
        .from('user_daily_progress')
        .update({
          claimed: true,
          claimed_at: new Date().toISOString(),
        })
        .eq('id', progress.id);

      if (updateError) throw updateError;

      // Update user XP and coins
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          xp_points: supabase.raw(`xp_points + ${challenge.xp_reward}`),
          wallet_balance: supabase.raw(`wallet_balance + ${challenge.coin_reward}`),
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      await fetchUserProgress();
      
      toast.success('🎁 Reward claimed!', {
        description: `+${challenge.xp_reward} XP, +${challenge.coin_reward} coins`,
      });

      return { error: null };
    } catch (err) {
      console.error('Error claiming reward:', err);
      toast.error('Failed to claim reward');
      return { error: err as Error };
    }
  }

  // Get progress for a specific challenge
  function getChallengeProgress(challengeId: string): UserChallengeProgress | undefined {
    return userProgress.find(p => p.challenge_id === challengeId);
  }

  // Get challenges with progress combined
  const challengesWithProgress = challenges.map(challenge => {
    const progress = getChallengeProgress(challenge.id);
    return {
      ...challenge,
      progress: progress?.progress || 0,
      completed: progress?.completed || false,
      claimed: progress?.claimed || false,
      progressPercentage: Math.min(
        ((progress?.progress || 0) / challenge.target_count) * 100,
        100
      ),
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
    refetch: () => {
      fetchChallenges();
      fetchUserProgress();
    },
  };
}
