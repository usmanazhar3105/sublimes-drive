import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useChallenges(userId?: string) {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [myProgress, setMyProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    loadChallenges();
  }, [userId]);

  const loadChallenges = async () => {
    const { data: challengesData } = await supabase
      .from('daily_challenges')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    setChallenges(challengesData || []);

    if (userId) {
      const { data: progressData } = await supabase
        .from('challenge_progress')
        .select('*, daily_challenges(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      setMyProgress(progressData || []);
    }

    setLoading(false);
  };

  const startChallenge = async (challengeId: string) => {
    if (!userId) return;
    await supabase.from('challenge_progress').insert({
      challenge_id: challengeId,
      user_id: userId,
      status: 'in_progress'
    });
    loadChallenges();
  };

  const completeChallenge = async (challengeId: string) => {
    if (!userId) return;
    await supabase.rpc('fn_complete_challenge', {
      p_challenge_id: challengeId,
      p_user_id: userId
    });
    loadChallenges();
  };

  return { challenges, myProgress, loading, startChallenge, completeChallenge };
}
