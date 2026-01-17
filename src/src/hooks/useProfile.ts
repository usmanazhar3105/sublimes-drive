import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase/client';
import { Profile } from './useRole';

export interface XPEvent {
  id: string;
  user_id: string;
  type: string;
  points: number;
  ref: Record<string, any>;
  created_at: string;
}

export interface Achievement {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  created_at: string;
}

export interface UserAchievement {
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement?: Achievement;
}

export function useProfile(userId?: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchProfile();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchProfile();
    });
    return () => subscription.unsubscribe();
  }, [userId]);

  async function fetchProfile() {
    try {
      setLoading(true);
      
      // 🧪 TEST BYPASS: Check for mock profile first (NO SUPABASE REQUIRED)
      const mockProfile = (window as any).__MOCK_PROFILE__;
      if (mockProfile) {
        console.log('🧪 Using mock profile (test bypass mode)');
        setProfile(mockProfile as Profile);
        setLoading(false);
        return;
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;
      
      if (!targetUserId) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!data) {
        const { data: { user: authed } } = await supabase.auth.getUser();
        if (!authed) {
          setProfile(null);
          setLoading(false);
          return;
        }
        // Profile creation - ONLY id field (role assigned by database DEFAULT)
        const up = await supabase
          .from('profiles')
          .upsert({ id: targetUserId }, { onConflict: 'id' })
          .select('*')
          .single();
        if (!up.error) {
          setProfile(up.data as any);
        } else {
          // DEV fallback: if RLS recursion blocks upsert, synthesize a minimal profile so UI can load
          const errCode = (up.error as any)?.code || '';
          const errMsg = (up.error as any)?.message || '';
          if (errCode === '42P17' || errMsg.toLowerCase().includes('infinite recursion') || errMsg.toLowerCase().includes('policy')) {
            setProfile({
              id: targetUserId,
              email: authed.email || '',
              display_name: display,
              role: roleFromMeta || undefined,
              avatar_url: (authed.user_metadata as any)?.avatar_url || undefined,
              username: (authed.user_metadata as any)?.user_name || (authed.email?.split('@')[0]) || undefined,
            } as any);
          } else {
            setProfile(null);
          }
        }
      } else {
        setProfile(data as any);
      }
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching profile:', err);
      // DEV fallback for profiles RLS recursion: synthesize minimal profile from auth
      try {
        const anyErr = err as any;
        const code = anyErr?.code || '';
        const msg = (anyErr?.message || '').toLowerCase();
        if (code === '42P17' || msg.includes('infinite recursion') || msg.includes('policy for relation "profiles"')) {
          const { data: { user: authed } } = await supabase.auth.getUser();
          if (authed?.id) {
            const display = (authed.user_metadata as any)?.full_name || authed.email?.split('@')[0] || 'User';
            const roleFromMeta = ((authed.app_metadata as any)?.user_role || (authed.app_metadata as any)?.role) || null;
            setProfile({
              id: authed.id,
              email: authed.email || '',
              display_name: display,
              role: roleFromMeta || undefined,
              avatar_url: (authed.user_metadata as any)?.avatar_url || undefined,
              username: (authed.user_metadata as any)?.user_name || (authed.email?.split('@')[0]) || undefined,
            } as any);
          }
        }
      } catch {}
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile(updates: Partial<Profile>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;
      setProfile(data);
      return { data, error: null };
    } catch (err) {
      console.error('Error updating profile:', err);
      return { data: null, error: err as Error };
    }
  }

  async function addVehicle(vehicle: Record<string, any>) {
    try {
      if (!profile) throw new Error('Profile not loaded');

      const vehicles = [...(profile.vehicles || []), vehicle];
      return updateProfile({ vehicles });
    } catch (err) {
      console.error('Error adding vehicle:', err);
      return { data: null, error: err as Error };
    }
  }

  async function removeVehicle(index: number) {
    try {
      if (!profile) throw new Error('Profile not loaded');

      const vehicles = [...(profile.vehicles || [])];
      vehicles.splice(index, 1);
      return updateProfile({ vehicles });
    } catch (err) {
      console.error('Error removing vehicle:', err);
      return { data: null, error: err as Error };
    }
  }

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    updateProfile,
    addVehicle,
    removeVehicle,
  };
}

export function useXP(userId?: string) {
  const [xpEvents, setXPEvents] = useState<XPEvent[]>([]);
  const [totalXP, setTotalXP] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchXP();
  }, [userId]);

  async function fetchXP() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;
      
      if (!targetUserId) {
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('xp_events')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        // Handle missing xp_events table gracefully (silently)
        if (fetchError.code === 'PGRST205' || fetchError.message.includes('xp_events')) {
          // XP system is optional - fail silently
          setXPEvents([]);
          setTotalXP(0);
          setError(null);
          return;
        }
        throw fetchError;
      }
      setXPEvents(data || []);
      
      const total = (data || []).reduce((sum, event) => sum + event.points, 0);
      setTotalXP(total);
      
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching XP:', err);
    } finally {
      setLoading(false);
    }
  }

  function getLevel(): number {
    // Simple level calculation: 100 XP per level
    return Math.floor(totalXP / 100) + 1;
  }

  function getXPForNextLevel(): number {
    const currentLevel = getLevel();
    const xpForCurrentLevel = (currentLevel - 1) * 100;
    const xpForNextLevel = currentLevel * 100;
    return xpForNextLevel - totalXP;
  }

  function getLevelProgress(): number {
    const currentLevel = getLevel();
    const xpForCurrentLevel = (currentLevel - 1) * 100;
    const xpInCurrentLevel = totalXP - xpForCurrentLevel;
    return (xpInCurrentLevel / 100) * 100;
  }

  return {
    xpEvents,
    totalXP,
    loading,
    error,
    refetch: fetchXP,
    getLevel,
    getXPForNextLevel,
    getLevelProgress,
  };
}

export function useAchievements() {
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchAchievements();
    fetchUserAchievements();
  }, []);

  async function fetchAchievements() {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('achievements')
        .select('*')
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;
      setAllAchievements(data || []);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching achievements:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUserAchievements() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error: fetchError } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', user.id);

      if (fetchError) throw fetchError;
      setUserAchievements(data || []);
    } catch (err) {
      console.error('Error fetching user achievements:', err);
    }
  }

  function hasAchievement(code: string): boolean {
    return userAchievements.some(
      (ua) => ua.achievement && 'code' in ua.achievement && ua.achievement.code === code
    );
  }

  function getUnlockedCount(): number {
    return userAchievements.length;
  }

  function getTotalCount(): number {
    return allAchievements.length;
  }

  function getProgress(): number {
    const total = getTotalCount();
    if (total === 0) return 0;
    return (getUnlockedCount() / total) * 100;
  }

  return {
    allAchievements,
    userAchievements,
    loading,
    error,
    refetch: fetchUserAchievements,
    hasAchievement,
    getUnlockedCount,
    getTotalCount,
    getProgress,
  };
}

export function useFollows() {
  const [followers, setFollowers] = useState<string[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchFollows();
  }, []);

  async function fetchFollows() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch followers
      const { data: followerData, error: followerError } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('followee_id', user.id);

      // If table doesn't exist, log a warning and set empty arrays
      if (followerError?.code === 'PGRST204' || followerError?.code === 'PGRST205' || followerError?.code === '42P01') {
        console.warn('%c⚠️ Follows table not found - follow functionality disabled', 'color: #ff9800; font-weight: bold; font-size: 14px;');
        console.info('%c🚀 QUICK FIX (2 minutes):', 'color: #4caf50; font-weight: bold; font-size: 13px;');
        console.info('%c1. Open file: 🎯_FIX_ALL_MISSING_TABLES_NOW.sql', 'color: #2196f3; font-size: 12px;');
        console.info('%c2. Copy all contents', 'color: #2196f3; font-size: 12px;');
        console.info('%c3. Paste in Supabase SQL Editor', 'color: #2196f3; font-size: 12px;');
        console.info('%c4. Click RUN', 'color: #2196f3; font-size: 12px;');
        console.info('%c5. Refresh this app', 'color: #2196f3; font-size: 12px;');
        console.info('%c📖 Detailed guide: 🚀_START_HERE_FIX_FOLLOWS.md', 'color: #9c27b0; font-size: 12px;');
        setFollowers([]);
        setFollowing([]);
        setError(null);
        setLoading(false);
        return;
      }

      if (followerError) throw followerError;
      setFollowers((followerData || []).map((f) => f.follower_id));

      // Fetch following
      const { data: followingData, error: followingError } = await supabase
        .from('follows')
        .select('followee_id')
        .eq('follower_id', user.id);

      if (followingError) throw followingError;
      setFollowing((followingData || []).map((f) => f.followee_id));

      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching follows:', err);
    } finally {
      setLoading(false);
    }
  }

  async function followUser(userId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error: followError } = await supabase
        .from('follows')
        .insert([
          {
            follower_id: user.id,
            followee_id: userId,
          },
        ]);

      if (followError) throw followError;
      await fetchFollows();
      return { error: null };
    } catch (err) {
      console.error('Error following user:', err);
      return { error: err as Error };
    }
  }

  async function unfollowUser(userId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error: unfollowError } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('followee_id', userId);

      if (unfollowError) throw unfollowError;
      await fetchFollows();
      return { error: null };
    } catch (err) {
      console.error('Error unfollowing user:', err);
      return { error: err as Error };
    }
  }

  function isFollowing(userId: string): boolean {
    return following.includes(userId);
  }

  return {
    followers,
    following,
    loading,
    error,
    refetch: fetchFollows,
    followUser,
    unfollowUser,
    isFollowing,
  };
}
