/**
 * ProfilePage - Fully Wired with Supabase Hooks
 * Complete profile with all tabs: Overview, Badges, Goals, Activity, Favorites, Referral, Service, Legal
 * 
 * Uses: useProfile, useRole, useAnalytics, useSocialInteractions
 */

import { useState, useEffect } from 'react';
import { 
  Edit, Settings, Share2, Trophy, Zap, Calendar, MapPin, 
  Car, Users, Award, Camera, MessageCircle, Shield, 
  ShoppingBag, Heart, Wrench, Eye, UserPlus, Copy, Loader2, X, User,
  Target, Gift, FileText, HelpCircle, ExternalLink, Star, Clock,
  TrendingUp, Activity as ActivityIcon, ChevronRight, CheckCircle, RefreshCw
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { toast } from 'sonner';

// Import Supabase hooks
import { useProfile, useXP, useAchievements, useFollows, useRole, useAnalytics, useSocialInteractions, useReferrals } from '../hooks';
import { supabase } from '../utils/supabase/client';

// Import ServiceLogPage, LegalTabContent, VerificationStatusCard, and ComprehensiveFavoritesSection
import { ServiceLogPage } from './ServiceLogPage';
import { LegalTabContent } from './legal/LegalTabContent';
import { VerificationStatusCard } from './profile/VerificationStatusCard';
import { ComprehensiveFavoritesSection } from './profile/ComprehensiveFavoritesSection';
import { ReferralWidget } from './ReferralWidget';

interface ProfilePageProps {
  onNavigate?: (page: string) => void;
  userId?: string; // If viewing another user's profile
}

interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  earned_at: string;
}

interface FavoriteItem {
  id: string;
  type: 'post' | 'listing' | 'garage';
  title: string;
  image_url?: string;
  created_at: string;
}

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  created_at: string;
}

export function ProfilePage({ onNavigate, userId }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [referralCode, setReferralCode] = useState('');
  const [referralStats, setReferralStats] = useState({ count: 0, earned: 0 });
  
  // 🔥 Stats from database
  const [profileStats, setProfileStats] = useState({
    postsCount: 0,
    visitsCount: 0,
    meetupsCount: 0,
    carsCount: 0
  });

  // 🔥 SUPABASE HOOKS
  const { 
    profile: viewedProfile, 
    loading: profileLoading, 
    error: profileError,
    refetch: refetchProfile
  } = useProfile(userId);

  // XP Hook
  const { 
    totalXP,
    getLevel,
    getXPForNextLevel,
    getLevelProgress
  } = useXP(userId);

  // Achievements Hook
  const { 
    allAchievements: achievements = []
  } = useAchievements();

  // Follows Hook
  const { 
    followers = [],
    following = [],
    followUser,
    unfollowUser,
    isFollowing
  } = useFollows();

  // Social Interactions (note: favorites now handled by ComprehensiveFavoritesSection)
  const { } = useSocialInteractions();

  // XP Data for display
  const xpData = {
    currentXP: totalXP,
    currentLevel: getLevel(),
    xpToNextLevel: getXPForNextLevel(),
    progress: getLevelProgress()
  };

  const { profile: currentUserProfile, isAdmin } = useRole();
  const analytics = useAnalytics();

  // Track page view
  useEffect(() => {
    analytics.trackPageView(`/profile${userId ? `/${userId}` : ''}`);
  }, [userId]);

  const isOwnProfile = !userId || userId === currentUserProfile?.id;
  const loading = profileLoading;
  const error = profileError;
  
  // 🔥 Define all fetch functions FIRST (before useEffect hooks)
  
  const fetchProfileStats = async (profileId: string) => {
    try {
      // Fetch posts count
      const { count: postsCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profileId);

      // Fetch user vehicles count
      const { count: carsCount } = await supabase
        .from('user_vehicles')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profileId);

      // Fetch events/meetups attended count
      const { count: meetupsCount } = await supabase
        .from('event_attendees')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profileId);

      // Fetch garage visits count (from service_logs or garage_visits table)
      const { count: visitsCount} = await supabase
        .from('service_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profileId);

      setProfileStats({
        postsCount: postsCount || 0,
        visitsCount: visitsCount || 0,
        meetupsCount: meetupsCount || 0,
        carsCount: carsCount || 0
      });
    } catch (error) {
      console.error('Error fetching profile stats:', error);
    }
  };

  const fetchBadges = async () => {
    try {
      // Get the user ID - prioritize viewedProfile if available
      const targetUserId = viewedProfile?.id || (isOwnProfile ? currentUserProfile?.id : userId);
      if (!targetUserId) {
        console.warn('No target user ID available for fetchBadges');
        return;
      }

      console.log('Fetching badges for user:', targetUserId, 'Role:', viewedProfile?.role);

      // First, check if user is admin and should have admin badge
      if (viewedProfile?.role === 'admin') {
        // Check if admin badge exists in badges table
        const { data: adminBadge, error: badgeError } = await supabase
          .from('badges')
          .select('id')
          .eq('name', 'Admin')
          .single();

        if (adminBadge?.id && !badgeError) {
          // Check if user already has the admin badge
          const { data: existingUserBadge } = await supabase
            .from('user_badges')
            .select('id')
            .eq('user_id', targetUserId)
            .eq('badge_id', adminBadge.id)
            .single();

          // If user doesn't have admin badge, award it
          if (!existingUserBadge) {
            await supabase
              .from('user_badges')
              .insert({
                user_id: targetUserId,
                badge_id: adminBadge.id,
                earned_at: new Date().toISOString()
              });
            console.log('Awarded admin badge to user');
          }
        } else {
          // Create admin badge if it doesn't exist
          const { data: newBadge, error: badgeError } = await supabase
            .from('badges')
            .insert({
              name: 'Admin',
              description: 'Platform Administrator',
              icon: '👑',
              rarity: 'legendary',
              category: 'special'
            })
            .select()
            .single();

          if (!badgeError && newBadge) {
            // Award the new badge to the admin user
            await supabase
              .from('user_badges')
              .insert({
                user_id: targetUserId,
                badge_id: newBadge.id,
                earned_at: new Date().toISOString()
              });
            console.log('Created and awarded admin badge');
          }
        }
      }

      // Fetch all user badges
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          id,
          earned_at,
          badges (
            id,
            name,
            description,
            icon,
            rarity
          )
        `)
        .eq('user_id', targetUserId)
        .order('earned_at', { ascending: false });

      if (error) {
        console.error('Error fetching user badges:', error);
        throw error;
      }
      
      const formattedBadges = data?.map(item => ({
        id: item.badges.id,
        name: item.badges.name,
        description: item.badges.description,
        icon: item.badges.icon,
        rarity: item.badges.rarity,
        earned_at: item.earned_at
      })) || [];
      
      console.log('Fetched badges:', formattedBadges.length, formattedBadges);
      setBadges(formattedBadges);
    } catch (error: any) {
      console.error('Error fetching badges:', error);
      setBadges([]); // Set empty array on error
    }
  };

  const fetchFavorites = async () => {
    try {
      // Favorites are now handled by ComprehensiveFavoritesSection component
      // This function is kept for backwards compatibility but doesn't need to do anything
      // as the comprehensive section handles its own data fetching
      setFavorites([]);
    } catch (error: any) {
      console.error('Error fetching favorites:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      const targetUserId = isOwnProfile ? currentUserProfile?.id : userId;
      if (!targetUserId) return;

      const activities: ActivityItem[] = [];

      // Fetch recent posts
      const { data: posts } = await supabase
        .from('posts')
        .select('id, content, created_at')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (posts) {
        posts.forEach(post => {
          activities.push({
            id: `post-${post.id}`,
            type: 'post',
            description: `Created a post: ${post.content?.substring(0, 100)}${post.content?.length > 100 ? '...' : ''}`,
            created_at: post.created_at
          });
        });
      }

      // Fetch recent likes
      const { data: likes } = await supabase
        .from('post_likes')
        .select('id, post_id, created_at, posts(content)')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (likes) {
        likes.forEach(like => {
          activities.push({
            id: `like-${like.id}`,
            type: 'like',
            description: `Liked a post: ${(like.posts as any)?.content?.substring(0, 80) || 'Post'}`,
            created_at: like.created_at
          });
        });
      }

      // Fetch recent comments
      const { data: comments } = await supabase
        .from('comments')
        .select('id, content, created_at, posts(content)')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (comments) {
        comments.forEach(comment => {
          activities.push({
            id: `comment-${comment.id}`,
            type: 'comment',
            description: `Commented: ${comment.content?.substring(0, 80)}${comment.content?.length > 80 ? '...' : ''}`,
            created_at: comment.created_at
          });
        });
      }

      // Fetch recent follows
      const { data: follows } = await supabase
        .from('follows')
        .select('id, created_at, followed:profiles!follows_followed_id_fkey(display_name)')
        .eq('follower_id', targetUserId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (follows) {
        follows.forEach(follow => {
          activities.push({
            id: `follow-${follow.id}`,
            type: 'follow',
            description: `Started following ${(follow.followed as any)?.display_name || 'a user'}`,
            created_at: follow.created_at
          });
        });
      }

      // Fetch recent event attendance
      const { data: events } = await supabase
        .from('event_attendees')
        .select('id, created_at, events(title)')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (events) {
        events.forEach(event => {
          activities.push({
            id: `event-${event.id}`,
            type: 'event',
            description: `Joined event: ${(event.events as any)?.title || 'Event'}`,
            created_at: event.created_at
          });
        });
      }

      // Sort all activities by date and limit to 20 most recent
      const sortedActivities = activities
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 20);

      setActivities(sortedActivities);
    } catch (error: any) {
      console.error('Error fetching activities:', error);
    }
  };

  const fetchReferralData = async () => {
    try {
      // Get the user ID - prioritize viewedProfile if available
      const targetUserId = viewedProfile?.id || (isOwnProfile ? currentUserProfile?.id : userId);
      if (!targetUserId) {
        console.warn('No user ID available for referral data');
        // Set fallback to prevent loading state
        const fallbackCode = `REF${Date.now().toString(36).toUpperCase()}`;
        setReferralCode(fallbackCode);
        return;
      }

      console.log('Fetching referral data for user:', targetUserId);

      // Get user's referral code
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('id', targetUserId)
        .single();

      if (profileError) {
        const code = (profileError as any)?.code || '';
        const msg = ((profileError as any)?.message || '').toLowerCase();
        const columnMissing = code === '42703' || code === 'PGRST204' || msg.includes('referral_code') || msg.includes('schema cache');
        const rlsRecursion = code === '42P17' || msg.includes('infinite recursion') || msg.includes('policy');
        if (!(columnMissing || rlsRecursion)) {
          console.error('Error fetching profile for referral code:', profileError);
        }
        // Generate fallback code (try auth email prefix, else timestamp)
        try {
          const { data: { user } } = await supabase.auth.getUser();
          const fallback = user?.email ? user.email.split('@')[0].toUpperCase() : `REF${Date.now().toString(36).toUpperCase()}`;
          setReferralCode(fallback);
        } catch {
          const fallbackCode = `REF${Date.now().toString(36).toUpperCase()}`;
          setReferralCode(fallbackCode);
        }
      } else if (profileData?.referral_code) {
        setReferralCode(profileData.referral_code);
        console.log('Referral code loaded:', profileData.referral_code);
      } else {
        // Generate a new referral code if one doesn't exist
        const newReferralCode = `REF${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ referral_code: newReferralCode })
          .eq('id', targetUserId);

        if (!updateError) {
          setReferralCode(newReferralCode);
          console.log('Generated new referral code:', newReferralCode);
        } else {
          const ucode = (updateError as any)?.code || '';
          const umsg = ((updateError as any)?.message || '').toLowerCase();
          const columnMissing = ucode === '42703' || ucode === 'PGRST204' || umsg.includes('referral_code') || umsg.includes('schema cache');
          const rlsRecursion = ucode === '42P17' || umsg.includes('infinite recursion') || umsg.includes('policy');
          if (!(columnMissing || rlsRecursion)) {
            console.error('Error generating referral code:', updateError);
          }
          // Set a fallback code to prevent showing "Loading..."
          setReferralCode(newReferralCode);
        }
      }

      // Get referral stats - XP REWARDS ONLY (not currency)
      const { data: referrals, error: referralsError } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', targetUserId);

      if (referralsError) {
        console.error('Error fetching referrals:', referralsError);
        setReferralStats({ count: 0, earned: 0 });
      } else {
        // Calculate XP earned from referrals (default 50 XP per referral if not specified)
        const DEFAULT_REFERRAL_XP = 50;
        setReferralStats({
          count: referrals?.length || 0,
          earned: referrals?.reduce((sum, ref) => sum + (ref.xp_reward || DEFAULT_REFERRAL_XP), 0) || 0
        });
        console.log('Referral stats:', { count: referrals?.length || 0 });
      }
    } catch (error: any) {
      console.error('Error fetching referral data:', error);
      // Set a fallback to prevent showing "Loading..." indefinitely
      const fallbackCode = `REF${Date.now().toString(36).toUpperCase()}`;
      setReferralCode(fallbackCode);
      setReferralStats({ count: 0, earned: 0 });
    }
  };

  // 🔥 Fetch badges when profile loads (for ANY profile, not just own)
  useEffect(() => {
    if (viewedProfile?.id) {
      console.log('Profile loaded, fetching badges for:', viewedProfile.id);
      fetchBadges();
    }
  }, [viewedProfile?.id, viewedProfile?.role]);

  // 🔥 Fetch real stats from database
  useEffect(() => {
    if (viewedProfile?.id) {
      fetchProfileStats(viewedProfile.id);
    }
  }, [viewedProfile?.id]);

  // Load additional data when viewing own profile
  useEffect(() => {
    if (isOwnProfile && viewedProfile?.id) {
      console.log('Own profile loaded, fetching additional data');
      fetchFavorites();
      fetchActivities();
      fetchReferralData();
    }
  }, [isOwnProfile, viewedProfile?.id]);

  // 🔥 Refresh data when switching tabs
  useEffect(() => {
    if (activeTab === 'badges' && viewedProfile?.id) {
      fetchBadges();
    } else if (activeTab === 'activity' && viewedProfile?.id) {
      fetchActivities();
    }
  }, [activeTab]);

  const handleFollow = async () => {
    if (!viewedProfile) return;
    
    const { error } = await followUser(viewedProfile.id);
    if (!error) {
      toast.success(`Following ${viewedProfile.display_name}`);
      analytics.trackFollow(viewedProfile.id);
      refetchProfile();
    } else {
      toast.error('Failed to follow user');
    }
  };

  const handleUnfollow = async () => {
    if (!viewedProfile) return;
    
    const { error } = await unfollowUser(viewedProfile.id);
    if (!error) {
      toast.success(`Unfollowed ${viewedProfile.display_name}`);
      refetchProfile();
    } else {
      toast.error('Failed to unfollow user');
    }
  };

  const handleShare = async () => {
    const profileUrl = `${window.location.origin}/profile/${viewedProfile?.id || currentUserProfile?.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${viewedProfile?.display_name || currentUserProfile?.display_name}'s Profile`,
          text: 'Check out this profile on Sublimes Drive!',
          url: profileUrl
        });
        analytics.trackEvent('profile_shared', { method: 'native' });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(profileUrl);
      toast.success('Profile link copied to clipboard!');
      analytics.trackEvent('profile_shared', { method: 'clipboard' });
    }
  };

  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success('Referral code copied!');
    analytics.trackEvent('referral_code_copied');
  };

  const handleCopyReferralLink = () => {
    const referralLink = `${window.location.origin}/signup?ref=${referralCode}`;
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied!');
    analytics.trackEvent('referral_link_copied');
  };

  const handleShareReferral = async () => {
    const referralLink = `${window.location.origin}/signup?ref=${referralCode}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Sublimes Drive',
          text: 'Join me on Sublimes Drive - the ultimate platform for car enthusiasts in UAE!',
          url: referralLink
        });
        analytics.trackEvent('referral_shared', { method: 'native' });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(referralLink);
      toast.success('Referral link copied!');
      analytics.trackEvent('referral_shared', { method: 'clipboard' });
    }
  };

  const levelProgress = getLevelProgress();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1426] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#D4AF37] mx-auto mb-4" />
          <p className="text-[#E8EAED]">Loading profile...</p>
        </div>
      </div>
    );
  }

  // If error fetching profile (but user is authenticated), show placeholder profile
  if (error || !viewedProfile) {
    // For own profile with DB error, show minimal profile instead of blocking
    if (isOwnProfile) {
      const placeholderProfile = {
        id: currentUserProfile?.id || '',
        email: currentUserProfile?.email || 'user@example.com',
        full_name: currentUserProfile?.full_name || 'User',
        display_name: currentUserProfile?.display_name || 'User',
        avatar_url: currentUserProfile?.avatar_url || null,
        cover_image: null,
        role: currentUserProfile?.role || 'browser',
        bio: 'Complete your profile setup',
        location: '',
        created_at: new Date().toISOString()
      };

      // Use placeholder and continue rendering
      const safeProfile = placeholderProfile;
      
      return (
        <div className="min-h-screen bg-[#0B1426] pb-20 lg:pb-8">
          <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
            <Card className="bg-[#FFA500] border-[#FF8C00] mb-4">
              <CardContent className="p-4 text-center">
                <p className="text-[#0B1426] font-semibold">⚠️ Profile data loading from database...</p>
                <p className="text-[#0B1426] text-sm mt-1">Database migrations pending. Showing placeholder profile.</p>
              </CardContent>
            </Card>
            
            <Card className="bg-[#0F1829] border-[#1A2332]">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="bg-[#D4AF37] text-[#0B1426]">
                      {safeProfile.display_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl text-[#E8EAED] font-semibold">{safeProfile.display_name}</h2>
                    <p className="text-[#8B92A7]">{safeProfile.email}</p>
                    <Badge className="mt-2 bg-[#D4AF37] text-[#0B1426]">{safeProfile.role}</Badge>
                  </div>
                </div>
                <p className="text-[#8B92A7] mb-4">{safeProfile.bio}</p>
                <Button onClick={() => onNavigate?.('home')} variant="outline">
                  Go Home
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }
    
    // For viewing other profiles with error, show error state
    return (
      <div className="min-h-screen bg-[#0B1426] flex items-center justify-center">
        <Card className="bg-[#0F1829] border-[#1A2332] max-w-md">
          <CardContent className="p-6 text-center">
            <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl text-[#E8EAED] mb-2">Profile Not Found</h2>
            <p className="text-[#8B92A7] mb-4">
              {error?.message || 'This profile could not be loaded.'}
            </p>
            <Button 
              onClick={() => onNavigate?.('home')}
              className="bg-[#D4AF37] text-[#0B1426] hover:bg-[#C19B2E]"
            >
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1426] pb-20 lg:pb-8">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Profile Header Card */}
        <Card className="bg-[#0F1829] border-[#1A2332] mb-4 sm:mb-6 overflow-hidden">
          {/* Cover Image Section */}
          <div className="relative h-32 sm:h-48 lg:h-64 bg-gradient-to-br from-[#1A2332] via-[#2A3342] to-[#1A2332] overflow-hidden">
            {viewedProfile?.cover_image ? (
              <img 
                src={viewedProfile.cover_image} 
                alt="Profile Cover" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <Car className="h-12 w-12 sm:h-16 sm:w-16 text-[#D4AF37]/20 mx-auto mb-2" />
                  <p className="text-[#8B92A7] text-xs sm:text-sm">
                    {isOwnProfile ? 'Add a cover image' : 'No cover image'}
                  </p>
                </div>
              </div>
            )}
            {/* Edit Cover Button */}
            {isOwnProfile && (
              <Button
                variant="outline"
                size="sm"
                className="absolute top-3 right-3 bg-[#0F1829]/90 backdrop-blur-sm border-[#2A3342] text-[#E8EAED] hover:bg-[#1A2332] text-xs"
                onClick={() => onNavigate?.('profile-settings')}
              >
                <Camera size={14} className="mr-1.5" />
                Edit Cover
              </Button>
            )}
          </div>

          <CardContent className="p-4 sm:p-6 pt-16 sm:pt-20">
            <div className="flex flex-col gap-4 sm:gap-6">
              {/* Top Section: Avatar + Name + Actions */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 -mt-20 sm:-mt-24">
                {/* Avatar Section */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <Avatar className="h-24 w-24 sm:h-28 sm:w-28 lg:h-32 lg:w-32 border-4 border-[#0F1829] shadow-lg ring-2 ring-[#D4AF37]">
                      <AvatarImage src={viewedProfile.avatar_url || undefined} alt={viewedProfile.display_name} />
                      <AvatarFallback className="bg-[#1A2332] text-[#D4AF37] text-2xl sm:text-3xl">
                        {viewedProfile.display_name?.charAt(0)?.toUpperCase() || <User />}
                      </AvatarFallback>
                    </Avatar>
                    {viewedProfile.is_verified && (
                      <div className="absolute -bottom-1 -right-1 bg-[#D4AF37] rounded-full p-1.5 shadow-lg">
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-[#0B1426]" />
                      </div>
                    )}
                  </div>
                  {isOwnProfile && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 border-[#2A3342] text-[#E8EAED] hover:bg-[#1A2332] text-xs"
                      onClick={() => onNavigate?.('profile-settings')}
                    >
                      <Camera size={14} className="mr-1.5" />
                      Edit Photo
                    </Button>
                  )}
                </div>

                {/* Profile Info + Actions */}
                <div className="flex-1 w-full text-center sm:text-left mt-4 sm:mt-0">
                  {/* Name and Badges */}
                  <div className="mb-3">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 mb-1">
                      <h1 className="text-xl sm:text-2xl lg:text-3xl text-[#E8EAED] font-semibold">{viewedProfile.display_name}</h1>
                      <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                        {viewedProfile.is_verified && (
                          <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37] text-xs">
                            <Shield size={12} className="mr-1" />
                            Verified
                          </Badge>
                        )}
                        {/* Show Admin Badge (and other top badges) */}
                        {badges.slice(0, 2).map((badge) => {
                          const isAdminBadge = badge.name === 'Admin';
                          const isLegendary = badge.rarity === 'legendary';
                          const isEpic = badge.rarity === 'epic';
                          
                          return (
                            <Badge 
                              key={badge.id}
                              className={`text-xs font-medium ${
                                isAdminBadge || isLegendary
                                  ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-purple-200 border-purple-400/60 shadow-lg shadow-purple-500/20' 
                                  : isEpic
                                  ? 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]'
                                  : 'bg-[#1A2332] text-[#E8EAED] border-[#2A3342]'
                              }`}
                              title={badge.description}
                            >
                              <span className="mr-1">{badge.icon}</span>
                              {badge.name}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                    {viewedProfile.username && (
                      <p className="text-sm sm:text-base text-[#8B92A7] mb-2">@{viewedProfile.username}</p>
                    )}
                  </div>

                  {/* Bio */}
                  {viewedProfile.bio && (
                    <p className="text-sm sm:text-base text-[#E8EAED] mb-3 max-w-2xl mx-auto sm:mx-0">{viewedProfile.bio}</p>
                  )}

                  {/* Location & Join Date */}
                  <div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-4 text-xs sm:text-sm text-[#8B92A7] mb-4">
                    {viewedProfile.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="flex-shrink-0" />
                        <span>{viewedProfile.location}</span>
                      </div>
                    )}
                    {viewedProfile.created_at && (
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="flex-shrink-0" />
                        <span>Joined {new Date(viewedProfile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    {isOwnProfile ? (
                      <>
                        <Button
                          onClick={() => onNavigate?.('profile-settings')}
                          variant="outline"
                          size="sm"
                          className="border-[#2A3342] text-[#E8EAED] hover:bg-[#1A2332] flex-1 sm:flex-initial min-w-[120px]"
                        >
                          <Edit size={14} className="mr-2" />
                          Edit Profile
                        </Button>
                        <Button
                          onClick={() => onNavigate?.('profile-settings')}
                          variant="outline"
                          size="sm"
                          className="border-[#2A3342] text-[#E8EAED] hover:bg-[#1A2332] px-3"
                        >
                          <Settings size={16} />
                        </Button>
                      </>
                    ) : (
                      <>
                        {isFollowing(viewedProfile.id) ? (
                          <Button
                            onClick={handleUnfollow}
                            variant="outline"
                            size="sm"
                            className="border-[#2A3342] text-[#E8EAED] hover:bg-[#1A2332] flex-1 sm:flex-initial"
                          >
                            <UserPlus size={14} className="mr-2" />
                            Following
                          </Button>
                        ) : (
                          <Button
                            onClick={handleFollow}
                            size="sm"
                            className="bg-[#D4AF37] hover:bg-[#C19B2E] text-[#0B1426] flex-1 sm:flex-initial"
                          >
                            <UserPlus size={14} className="mr-2" />
                            Follow
                          </Button>
                        )}
                        <Button
                          onClick={() => onNavigate?.(`messages/${viewedProfile.id}`)}
                          variant="outline"
                          size="sm"
                          className="border-[#2A3342] text-[#E8EAED] hover:bg-[#1A2332] px-3"
                        >
                          <MessageCircle size={16} />
                        </Button>
                      </>
                    )}
                    <Button
                      onClick={handleShare}
                      variant="outline"
                      size="sm"
                      className="border-[#2A3342] text-[#E8EAED] hover:bg-[#1A2332] px-3"
                    >
                      <Share2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Stats Grid - Enhanced for Mobile */}
              <Separator className="bg-[#1A2332]" />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                <div className="text-center p-3 rounded-lg bg-[#1A2332]/50 hover:bg-[#1A2332] transition-colors">
                  <div className="text-lg sm:text-xl lg:text-2xl text-[#E8EAED] font-semibold">{profileStats.postsCount}</div>
                  <div className="text-xs sm:text-sm text-[#8B92A7]">Posts</div>
                </div>
                <div 
                  className="text-center p-3 rounded-lg bg-[#1A2332]/50 hover:bg-[#1A2332] cursor-pointer transition-colors" 
                  onClick={() => onNavigate?.(`followers/${viewedProfile.id}`)}
                >
                  <div className="text-lg sm:text-xl lg:text-2xl text-[#E8EAED] font-semibold">{followers?.length || 0}</div>
                  <div className="text-xs sm:text-sm text-[#8B92A7]">Followers</div>
                </div>
                <div 
                  className="text-center p-3 rounded-lg bg-[#1A2332]/50 hover:bg-[#1A2332] cursor-pointer transition-colors" 
                  onClick={() => onNavigate?.(`following/${viewedProfile.id}`)}
                >
                  <div className="text-lg sm:text-xl lg:text-2xl text-[#E8EAED] font-semibold">{following?.length || 0}</div>
                  <div className="text-xs sm:text-sm text-[#8B92A7]">Following</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-[#1A2332]/50 hover:bg-[#1A2332] transition-colors">
                  <div className="text-lg sm:text-xl lg:text-2xl text-[#E8EAED] font-semibold">{profileStats.visitsCount}</div>
                  <div className="text-xs sm:text-sm text-[#8B92A7]">Visits</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-[#1A2332]/50 hover:bg-[#1A2332] transition-colors">
                  <div className="text-lg sm:text-xl lg:text-2xl text-[#E8EAED] font-semibold">{profileStats.meetupsCount}</div>
                  <div className="text-xs sm:text-sm text-[#8B92A7]">Meetups</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-[#1A2332]/50 hover:bg-[#1A2332] transition-colors">
                  <div className="text-lg sm:text-xl lg:text-2xl text-[#E8EAED] font-semibold">{profileStats.carsCount}</div>
                  <div className="text-xs sm:text-sm text-[#8B92A7]">Cars</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* XP & Level Progress - Enhanced */}
        <Card className="bg-gradient-to-br from-[#0F1829] to-[#1A2332] border-[#D4AF37]/30 mb-4 sm:mb-6 overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#D4AF37]/20 flex items-center justify-center shadow-lg">
                  <Trophy className="text-[#D4AF37]" size={28} />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-xl sm:text-2xl text-[#E8EAED] font-semibold">Level {xpData.currentLevel || 1}</h3>
                  <p className="text-sm sm:text-base text-[#8B92A7]">
                    {xpData.currentXP || 0} / {xpData.xpToNextLevel || 100} XP
                  </p>
                </div>
              </div>
              <Badge className="bg-[#D4AF37] text-[#0B1426] px-3 py-1.5 text-sm">
                <Zap size={14} className="mr-1.5" />
                {xpData.currentXP || 0} XP
              </Badge>
            </div>
            <div className="relative">
              <Progress value={levelProgress} className="h-3 bg-[#1A2332] shadow-inner" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-medium text-[#E8EAED] drop-shadow-lg">
                  {Math.round(levelProgress)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs - Enhanced Mobile Scrolling */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="mb-4 sm:mb-6 -mx-3 sm:mx-0 overflow-x-auto scrollbar-hide">
            <div className="px-3 sm:px-0 min-w-max sm:min-w-0">
              <TabsList className="bg-[#0F1829] border border-[#1A2332] w-full sm:w-auto inline-flex sm:flex-wrap gap-1">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426] whitespace-nowrap text-xs sm:text-sm px-2.5 sm:px-4 py-2 flex-shrink-0"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="badges" 
                className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426] whitespace-nowrap text-xs sm:text-sm px-2.5 sm:px-4 py-2 flex-shrink-0"
              >
                Badges
              </TabsTrigger>
              <TabsTrigger 
                value="goals" 
                className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426] whitespace-nowrap text-xs sm:text-sm px-2.5 sm:px-4 py-2 flex-shrink-0"
              >
                Goals
              </TabsTrigger>
              {isOwnProfile && (
                <>
                  <TabsTrigger 
                    value="activity" 
                    className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426] whitespace-nowrap text-xs sm:text-sm px-2.5 sm:px-4 py-2 flex-shrink-0"
                  >
                    Activity
                  </TabsTrigger>
                  <TabsTrigger 
                    value="favorites" 
                    className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426] whitespace-nowrap text-xs sm:text-sm px-2.5 sm:px-4 py-2 flex-shrink-0"
                  >
                    My Fav
                  </TabsTrigger>
                  <TabsTrigger 
                    value="referral" 
                    className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426] whitespace-nowrap text-xs sm:text-sm px-2.5 sm:px-4 py-2 flex-shrink-0"
                  >
                    Referral
                  </TabsTrigger>
                  <TabsTrigger 
                    value="service" 
                    className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426] whitespace-nowrap text-xs sm:text-sm px-2.5 sm:px-4 py-2 flex-shrink-0"
                  >
                    Service
                  </TabsTrigger>
                  <TabsTrigger 
                    value="legal" 
                    className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426] whitespace-nowrap text-xs sm:text-sm px-2.5 sm:px-4 py-2 flex-shrink-0"
                  >
                    Legal
                  </TabsTrigger>
                </>
              )}
              </TabsList>
            </div>
          </div>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview">
            <div className="space-y-4 sm:space-y-6">
              {/* Verification Status - Mobile Optimized */}
              {isOwnProfile && (
                <VerificationStatusCard
                  userRole={viewedProfile?.role || 'car_browser'}
                  isVerified={viewedProfile?.is_verified || false}
                  onNavigate={onNavigate}
                  onVerify={(type) => {
                    analytics.trackEvent('verification_started', { type });
                  }}
                />
              )}

              {/* Service Log CTA */}
              {isOwnProfile && (
                <Card className="bg-[#0F1829] border-[#1A2332] hover:border-[#D4AF37]/50 transition-colors">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-[#E8EAED] flex items-center gap-2 text-base sm:text-lg">
                      <Wrench className="h-5 w-5 text-[#D4AF37]" />
                      My Vehicle Service Log
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm sm:text-base text-[#8B92A7] mb-4">
                      Keep track of your vehicle maintenance and service history. Never miss an important service date again.
                    </p>
                    <Button 
                      onClick={() => setActiveTab('service')}
                      variant="outline"
                      className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0B1426] w-full sm:w-auto"
                    >
                      View Service Log
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Recent Badges */}
              {badges.length > 0 && (
                <Card className="bg-[#0F1829] border-[#1A2332]">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-[#E8EAED] text-base sm:text-lg">Recent Badges</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab('badges')}
                        className="text-[#D4AF37] hover:bg-[#D4AF37]/10 text-xs sm:text-sm"
                      >
                        View All
                        <ChevronRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                      {badges.slice(0, 4).map((badge) => (
                        <div key={badge.id} className="text-center p-3 sm:p-4 rounded-lg bg-[#1A2332] border border-[#2A3342] hover:border-[#D4AF37] transition-all hover:scale-105">
                          <div className="text-3xl sm:text-4xl mb-2">{badge.icon}</div>
                          <p className="text-xs sm:text-sm text-[#E8EAED] line-clamp-1">{badge.name}</p>
                          <Badge className="mt-2 text-xs" variant="outline">
                            {badge.rarity}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Active Goals */}
              {achievements.length > 0 && (
                <Card className="bg-[#0F1829] border-[#1A2332]">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-[#E8EAED] text-base sm:text-lg">Active Goals</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab('goals')}
                        className="text-[#D4AF37] hover:bg-[#D4AF37]/10 text-xs sm:text-sm"
                      >
                        View All
                        <ChevronRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 sm:space-y-4">
                      {achievements.slice(0, 3).map((achievement) => (
                        <div key={achievement.id} className="p-3 sm:p-4 rounded-lg bg-[#1A2332] border border-[#2A3342] hover:border-[#D4AF37]/50 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                            <h4 className="text-sm sm:text-base text-[#E8EAED]">{achievement.title}</h4>
                            <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] self-start sm:self-auto">
                              {achievement.xp_reward} XP
                            </Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-[#8B92A7] mb-3">{achievement.description}</p>
                          <Progress value={achievement.progress || 0} className="h-2 mb-2" />
                          <p className="text-xs text-[#8B92A7]">{achievement.progress || 0}% Complete</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}


            </div>
          </TabsContent>

          {/* BADGES TAB */}
          <TabsContent value="badges">
            <Card className="bg-[#0F1829] border-[#1A2332]">
              <CardHeader className="pb-3">
                <CardTitle className="text-[#E8EAED] text-base sm:text-lg">My Badges ({badges.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {badges.length === 0 ? (
                  <div className="text-center py-12 sm:py-16">
                    <Award className="h-12 w-12 sm:h-16 sm:w-16 text-[#8B92A7] mx-auto mb-4 opacity-50" />
                    <p className="text-sm sm:text-base text-[#8B92A7]">No badges earned yet</p>
                    <p className="text-xs sm:text-sm text-[#8B92A7] mt-2">Complete activities to earn badges!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                    {badges.map((badge) => (
                      <div key={badge.id} className="text-center p-3 sm:p-4 rounded-lg bg-[#1A2332] border border-[#2A3342] hover:border-[#D4AF37] hover:scale-105 transition-all">
                        <div className="text-4xl sm:text-5xl mb-2 sm:mb-3">{badge.icon}</div>
                        <p className="text-xs sm:text-sm text-[#E8EAED] mb-1 line-clamp-1">{badge.name}</p>
                        <p className="text-xs text-[#8B92A7] mb-2 line-clamp-2 min-h-[2.5rem]">{badge.description}</p>
                        <Badge className="text-xs mb-2" variant="outline">
                          {badge.rarity}
                        </Badge>
                        <p className="text-xs text-[#8B92A7]">
                          {new Date(badge.earned_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* GOALS TAB (Achievements) */}
          <TabsContent value="goals">
            <Card className="bg-[#0F1829] border-[#1A2332]">
              <CardHeader className="pb-3">
                <CardTitle className="text-[#E8EAED] text-base sm:text-lg">My Goals & Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                {achievements && achievements.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {achievements.map((achievement) => (
                      <div key={achievement.id} className="p-3 sm:p-4 rounded-lg bg-[#1A2332] border border-[#2A3342] hover:border-[#D4AF37]/50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
                            <Target className="text-[#D4AF37]" size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                              <h4 className="text-sm sm:text-base text-[#E8EAED] line-clamp-1">{achievement.title}</h4>
                              <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] self-start sm:self-auto text-xs">
                                {achievement.xp_reward} XP
                              </Badge>
                            </div>
                            <p className="text-xs sm:text-sm text-[#8B92A7] mb-3 line-clamp-2">{achievement.description}</p>
                            <Progress value={achievement.progress || 0} className="h-2 mb-2" />
                            <div className="flex items-center justify-between text-xs text-[#8B92A7]">
                              <span>{achievement.progress || 0}% Complete</span>
                              {achievement.category && (
                                <Badge variant="outline" className="text-xs">
                                  {achievement.category}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 sm:py-16">
                    <Trophy className="h-12 w-12 sm:h-16 sm:w-16 text-[#8B92A7] mx-auto mb-4 opacity-50" />
                    <p className="text-sm sm:text-base text-[#8B92A7]">No achievements yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ACTIVITY TAB */}
          {isOwnProfile && (
            <TabsContent value="activity">
              <Card className="bg-[#0F1829] border-[#1A2332]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-[#E8EAED] flex items-center gap-2 text-base sm:text-lg">
                    <ActivityIcon className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activities.length === 0 ? (
                    <div className="text-center py-12 sm:py-16">
                      <Clock className="h-12 w-12 sm:h-16 sm:w-16 text-[#8B92A7] mx-auto mb-4 opacity-50" />
                      <p className="text-sm sm:text-base text-[#8B92A7]">No recent activity</p>
                    </div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      {activities.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3 p-3 sm:p-4 rounded-lg bg-[#1A2332] border border-[#2A3342] hover:border-[#D4AF37]/50 transition-colors">
                          <ActivityIcon className="h-4 w-4 sm:h-5 sm:w-5 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[#E8EAED] text-xs sm:text-sm">{activity.description}</p>
                            <p className="text-xs text-[#8B92A7] mt-1">
                              {new Date(activity.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* FAVORITES TAB - Enhanced with ComprehensiveFavoritesSection */}
          {isOwnProfile && (
            <TabsContent value="favorites">
              <ComprehensiveFavoritesSection 
                userId={viewedProfile?.id || currentUserProfile?.id || ''} 
                isOwnProfile={isOwnProfile}
              />
            </TabsContent>
          )}

          {/* REFERRAL TAB - Using ReferralWidget Component */}
          {isOwnProfile && (
            <TabsContent value="referral">
              <ReferralWidget />
              {/* Legacy referral UI - kept for reference but replaced by ReferralWidget */}
              {false && <div className="space-y-4 sm:space-y-6">
                {/* Referral Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Card className="bg-gradient-to-br from-[#0F1829] to-[#1A2332] border-[#1A2332]">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
                          <Users className="text-[#D4AF37]" size={24} />
                        </div>
                        <div>
                          <p className="text-xl sm:text-2xl text-[#E8EAED] font-semibold">{referralStats.count}</p>
                          <p className="text-xs sm:text-sm text-[#8B92A7]">Referrals</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-[#0F1829] to-[#1A2332] border-[#1A2332]">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
                          <Zap className="text-[#D4AF37]" size={24} />
                        </div>
                        <div>
                          <p className="text-xl sm:text-2xl text-[#E8EAED] font-semibold">{referralStats.earned} XP</p>
                          <p className="text-xs sm:text-sm text-[#8B92A7]">XP Earned</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Referral Code */}
                <Card className="bg-[#0F1829] border-[#1A2332]">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-[#E8EAED] text-base sm:text-lg">Your Referral Code</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-[#8B92A7] mb-2 block text-xs sm:text-sm">Referral Code</Label>
                      <div className="flex gap-2">
                        <Input 
                          value={referralCode || 'Loading...'} 
                          readOnly 
                          className="bg-[#1A2332] border-[#2A3342] text-[#E8EAED] text-sm sm:text-base"
                        />
                        <Button
                          onClick={handleCopyReferralCode}
                          variant="outline"
                          size="sm"
                          className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0B1426] flex-shrink-0 px-3"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-[#8B92A7] mb-2 block text-xs sm:text-sm">Referral Link</Label>
                      <div className="flex gap-2">
                        <Input 
                          value={referralCode ? `${window.location.origin}/signup?ref=${referralCode}` : 'Loading...'} 
                          readOnly 
                          className="bg-[#1A2332] border-[#2A3342] text-[#E8EAED] text-xs sm:text-sm"
                        />
                        <Button
                          onClick={handleCopyReferralLink}
                          variant="outline"
                          size="sm"
                          className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0B1426] flex-shrink-0 px-3"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <Button 
                      onClick={handleShareReferral}
                      className="w-full bg-[#D4AF37] text-[#0B1426] hover:bg-[#C19B2E] mt-2"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Referral Link
                    </Button>

                    <div className="p-3 sm:p-4 bg-[#1A2332] rounded-lg border border-[#2A3342]">
                      <h4 className="text-[#E8EAED] mb-2 text-sm sm:text-base font-medium">How it works:</h4>
                      <ul className="text-xs sm:text-sm text-[#8B92A7] space-y-1.5 list-disc list-inside">
                        <li>Share your referral code or link with friends</li>
                        <li>They sign up using your code</li>
                        <li>You both earn XP rewards when they complete their first activity</li>
                        <li>Track your referrals and XP earnings here</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>}
            </TabsContent>
          )}

          {/* SERVICE TAB */}
          {isOwnProfile && (
            <TabsContent value="service">
              <ServiceLogPage />
            </TabsContent>
          )}

          {/* LEGAL TAB - Enhanced with LegalTabContent */}
          {isOwnProfile && (
            <TabsContent value="legal">
              <LegalTabContent onNavigate={onNavigate} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
