import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner';

export interface DailyChallenge {
  id: string;
  title: string;
  description?: string;
  challenge_type: string;
  target_count: number;
  xp_reward: number;
  coin_reward?: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  icon?: string;
}

export interface UserChallengeProgress {
  challenge_id: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
  completed_at?: string;
}

export function useDailyChallenges() {
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [userProgress, setUserProgress] = useState<Record<string, UserChallengeProgress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      // Fetch active challenges for today
      const { data: challengesData, error: challengesError } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', today)
        .gte('end_date', today)
        .order('created_at', { ascending: false });

      if (challengesError) throw challengesError;
      setChallenges(challengesData || []);

      // Fetch user progress
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const challengeIds = (challengesData || []).map(c => c.id);
        if (challengeIds.length > 0) {
          const { data: progressData, error: progressError } = await supabase
            .from('user_daily_progress')
            .select('*')
            .eq('user_id', user.id)
            .in('challenge_id', challengeIds);

          if (!progressError && progressData) {
            const progressMap: Record<string, UserChallengeProgress> = {};
            progressData.forEach((p: any) => {
              progressMap[p.challenge_id] = {
                challenge_id: p.challenge_id,
                progress: p.progress || 0,
                completed: p.completed || false,
                claimed: p.claimed || false,
                completed_at: p.completed_at,
              };
            });
            setUserProgress(progressMap);
          }
        }
      }
    } catch (error: any) {
      console.error('Error fetching challenges:', error);
      toast.error('Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  const startChallenge = async (challengeId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to start challenges');
        return { error: 'Not authenticated' };
      }

      // Create or update user progress
      const { error } = await supabase
        .from('user_daily_progress')
        .upsert({
          user_id: user.id,
          challenge_id: challengeId,
          progress: 0,
          completed: false,
          claimed: false,
        }, {
          onConflict: 'user_id,challenge_id',
        });

      if (error) throw error;
      await fetchChallenges();
      return { error: null };
    } catch (error: any) {
      console.error('Error starting challenge:', error);
      toast.error('Failed to start challenge');
      return { error };
    }
  };

  const claimReward = async (challengeId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to claim rewards');
        return { error: 'Not authenticated' };
      }

      // Mark reward as claimed
      const { error } = await supabase
        .from('user_daily_progress')
        .update({
          claimed: true,
          claimed_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('challenge_id', challengeId);

      if (error) throw error;

      // Award XP (handled by trigger or RPC)
      const challenge = challenges.find(c => c.id === challengeId);
      if (challenge && challenge.xp_reward > 0) {
        await supabase.rpc('fn_update_xp', {
          p_user_id: user.id,
          p_amount: challenge.xp_reward,
          p_reason: `Daily Challenge: ${challenge.title}`,
        });
      }

      toast.success('Reward claimed!');
      await fetchChallenges();
      return { error: null };
    } catch (error: any) {
      console.error('Error claiming reward:', error);
      toast.error('Failed to claim reward');
      return { error };
    }
  };

  return {
    challenges,
    userProgress,
    loading,
    refetch: fetchChallenges,
    startChallenge,
    claimReward,
  };
}


