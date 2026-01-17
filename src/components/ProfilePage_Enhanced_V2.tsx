/**
 * Enhanced Profile Page - Matches Reference Design
 * Features:
 * - Cover image with edit capability
 * - Profile stats grid (Posts, Followers, Following, Garages, Meetups, Cars)
 * - Tab navigation: Overview, Badges, Goals, Activity, My Fav, Referral, Service, Legal
 * - Full database integration
 * - Mobile responsive
 */

import { useState, useEffect } from 'react';
import { 
  Edit, Settings, Share2, Trophy, MapPin, Calendar, 
  Car, Users, Award, Camera, MessageCircle, Shield, 
  Heart, Wrench, Eye, UserPlus, Copy, Loader2, X, 
  Target, Gift, FileText, HelpCircle, ExternalLink, Star, 
  TrendingUp, Activity as ActivityIcon, ChevronRight, CheckCircle,
  Upload, Image as ImageIcon, Info, Lock, RefreshCw, HelpCircleIcon
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { toast } from 'sonner';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { copyToClipboard } from '../utils/clipboard';
import { ServiceLogSection } from './profile/ServiceLogSection';

// Import Supabase hooks
import { 
  useProfile, 
  useXP, 
  useAchievements, 
  useFollows, 
  useRole, 
  useAnalytics, 
  useSocialInteractions, 
  useReferrals,
  usePosts,
  useListings,
  useGarages
} from '../hooks';
import { supabase } from '../utils/supabase/client';

interface ProfilePageProps {
  onNavigate?: (page: string) => void;
  userId?: string;
}

interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  earned_at: string;
}

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  created_at: string;
}

interface GoalData {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  reward_xp: number;
}

export function ProfilePage({ onNavigate, userId }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [goals, setGoals] = useState<GoalData[]>([]);
  const [isEditingCover, setIsEditingCover] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);

  // 🔥 SUPABASE HOOKS
  const { 
    profile: viewedProfile, 
    loading: profileLoading, 
    error: profileError,
    refetch: refetchProfile,
    updateProfile
  } = useProfile(userId);

  const { 
    totalXP,
    getLevel,
    getXPForNextLevel,
    getLevelProgress
  } = useXP(userId);

  const { 
    allAchievements: achievements = []
  } = useAchievements();

  const { 
    followers = [],
    following = [],
    followUser,
    unfollowUser,
    isFollowing
  } = useFollows();

  const { savedPosts, savedListings } = useSocialInteractions();
  const { profile: currentUserProfile, isAdmin } = useRole();
  const analytics = useAnalytics();
  const { posts } = usePosts();
  const { listings } = useListings();
  const { garages } = useGarages();

  const isOwnProfile = !userId || userId === currentUserProfile?.id;
  const profile = viewedProfile || currentUserProfile;

  // Referral data - pass the correct user ID
  const { 
    referralCode, 
    referralStats, 
    generateReferralCode 
  } = useReferrals(profile?.id);

  // Load cover image
  useEffect(() => {
    if (profile?.cover_image_url) {
      setCoverImage(profile.cover_image_url);
    }
  }, [profile?.cover_image_url]);

  // Track page view
  useEffect(() => {
    analytics.trackPageView(`/profile${userId ? `/${userId}` : ''}`);
  }, [userId]);

  // Load additional data
  useEffect(() => {
    if (profile?.id) {
      fetchBadges();
      fetchActivities();
      fetchGoals();
    }
  }, [profile?.id]);

  const fetchBadges = async () => {
    try {
      // First, check if user is admin and should have admin badge
      if (profile?.role === 'admin' || isAdmin) {
        // Check if admin badge exists in badges table
        const { data: adminBadge } = await supabase
          .from('badges')
          .select('id')
          .eq('name', 'Admin')
          .single();

        if (adminBadge) {
          // Check if user already has the admin badge
          const { data: existingUserBadge } = await supabase
            .from('user_badges')
            .select('id')
            .eq('user_id', profile?.id)
            .eq('badge_id', adminBadge.id)
            .single();

          // If user doesn't have admin badge, award it
          if (!existingUserBadge) {
            await supabase
              .from('user_badges')
              .insert({
                user_id: profile?.id,
                badge_id: adminBadge.id,
                earned_at: new Date().toISOString()
              });
          }
        } else {
          // Create admin badge if it doesn't exist
          const { data: newBadge, error: badgeError } = await supabase
            .from('badges')
            .insert({
              name: 'Admin',
              description: 'Platform Administrator',
              icon: '👑',
              rarity: 'Legendary',
              category: 'special'
            })
            .select()
            .single();

          if (!badgeError && newBadge) {
            // Award the new badge to the admin user
            await supabase
              .from('user_badges')
              .insert({
                user_id: profile?.id,
                badge_id: newBadge.id,
                earned_at: new Date().toISOString()
              });
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
        .eq('user_id', profile?.id)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      
      const formattedBadges = data?.map((item: any) => ({
        id: item.badges.id,
        name: item.badges.name,
        description: item.badges.description,
        icon: item.badges.icon,
        rarity: item.badges.rarity,
        earned_at: item.earned_at
      })) || [];
      
      setBadges(formattedBadges);
    } catch (error: any) {
      console.error('Error fetching badges:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', profile?.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setActivities(data || []);
    } catch (error: any) {
      console.error('Error fetching activities:', error);
    }
  };

  const fetchGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', profile?.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error: any) {
      console.error('Error fetching goals:', error);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.id) return;

    setUploadingCover(true);
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
      const filePath = `covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      // Update profile
      await updateProfile({ cover_image_url: publicUrl });
      setCoverImage(publicUrl);
      toast.success('Cover image updated successfully!');
    } catch (error: any) {
      console.error('Error uploading cover:', error);
      toast.error('Failed to upload cover image');
    } finally {
      setUploadingCover(false);
      setIsEditingCover(false);
    }
  };

  const handleFollow = async () => {
    if (!profile?.id) return;
    try {
      if (isFollowing(profile.id)) {
        await unfollowUser(profile.id);
        toast.success('Unfollowed successfully');
      } else {
        await followUser(profile.id);
        toast.success('Following successfully');
      }
    } catch (error: any) {
      toast.error('Failed to update follow status');
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/profile/${profile?.id}`;
    const success = await copyToClipboard(url);
    if (success) {
      toast.success('Profile link copied to clipboard!');
    } else {
      toast.error('Failed to copy link');
    }
  };

  // Calculate stats
  const userPosts = posts?.filter(p => p.user_id === profile?.id) || [];
  const userListings = listings?.filter(l => l.seller_id === profile?.id) || [];
  const userGarages = garages?.filter(g => g.owner_id === profile?.id) || [];
  const userCars = profile?.cars || [];
  const meetupsCount = profile?.meetups_attended || 0;

  const stats = [
    { label: 'Posts', value: userPosts.length, icon: FileText },
    { label: 'Followers', value: followers.length, icon: Users },
    { label: 'Following', value: following.length, icon: UserPlus },
    { label: 'Garages', value: userGarages.length, icon: Wrench },
    { label: 'Meetups', value: meetupsCount, icon: Users },
    { label: 'Cars', value: userCars.length, icon: Car },
  ];

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0B1426]">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B1426] text-[#E8EAED] p-4">
        <p className="text-xl mb-4">Profile not found</p>
        <Button onClick={() => onNavigate?.('home')} variant="outline">
          Go Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1426] pb-20 lg:pb-8">
      {/* Cover Image Section */}
      <div className="relative w-full h-48 md:h-64 lg:h-80 bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-purple-900/20">
        {coverImage ? (
          <ImageWithFallback
            src={coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-purple-900/30 via-pink-900/30 to-purple-900/30" />
        )}
        
        {/* Edit Cover Button */}
        {isOwnProfile && (
          <div className="absolute top-4 right-4">
            <input
              type="file"
              id="cover-upload"
              accept="image/*"
              className="hidden"
              onChange={handleCoverUpload}
            />
            <Button
              onClick={() => document.getElementById('cover-upload')?.click()}
              disabled={uploadingCover}
              className="bg-[#0B1426]/80 hover:bg-[#0B1426] text-[#E8EAED] backdrop-blur-sm"
            >
              {uploadingCover ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Camera className="w-4 h-4 mr-2" />
              )}
              Edit Cover
            </Button>
          </div>
        )}
      </div>

      {/* Profile Info Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="bg-[#151B2E] rounded-lg border border-gray-800 p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-[#0B1426]">
                <AvatarImage src={profile.avatar_url || ''} alt={profile.full_name || 'User'} />
                <AvatarFallback className="bg-[#D4AF37] text-[#0B1426]">
                  {profile.full_name?.charAt(0) || profile.username?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Profile Details */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl text-[#E8EAED] mb-1">
                    @{profile.username || 'user'}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.location || 'Dubai, UAE'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {new Date(profile.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <p className="text-[#E8EAED] max-w-2xl">
                    {profile.bio || 'Passionate car enthusiast from Dubai 🚗 • BMW M3 owner • Track day regular • Always looking for new driving routes and car meets!'}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    size="sm"
                    className="border-gray-700 text-[#E8EAED] hover:bg-gray-800"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  {!isOwnProfile && (
                    <Button
                      onClick={handleFollow}
                      variant="outline"
                      size="sm"
                      className="border-gray-700 text-[#E8EAED] hover:bg-gray-800"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  )}
                  {isOwnProfile ? (
                    <Button
                      onClick={() => onNavigate?.('profile-settings')}
                      size="sm"
                      className="bg-[#D4AF37] hover:bg-[#B8941F] text-[#0B1426]"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <Button
                      onClick={handleFollow}
                      size="sm"
                      className="bg-[#D4AF37] hover:bg-[#B8941F] text-[#0B1426]"
                    >
                      {isFollowing(profile.id) ? 'Unfollow' : 'Follow'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-6">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-[#0B1426] border-gray-800 hover:border-[#D4AF37]/50 transition-colors">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl md:text-3xl text-[#E8EAED] mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-400">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto bg-[#151B2E] border-b border-gray-800 rounded-none h-auto p-0">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-[#D4AF37] data-[state=active]:text-[#D4AF37] text-gray-400 rounded-none px-6 py-3"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="badges" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-[#D4AF37] data-[state=active]:text-[#D4AF37] text-gray-400 rounded-none px-6 py-3"
              >
                Badges
              </TabsTrigger>
              <TabsTrigger 
                value="goals" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-[#D4AF37] data-[state=active]:text-[#D4AF37] text-gray-400 rounded-none px-6 py-3"
              >
                Goals
              </TabsTrigger>
              <TabsTrigger 
                value="activity" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-[#D4AF37] data-[state=active]:text-[#D4AF37] text-gray-400 rounded-none px-6 py-3"
              >
                Activity
              </TabsTrigger>
              <TabsTrigger 
                value="favorites" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-[#D4AF37] data-[state=active]:text-[#D4AF37] text-gray-400 rounded-none px-6 py-3"
              >
                My Fav
              </TabsTrigger>
              <TabsTrigger 
                value="referral" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-[#D4AF37] data-[state=active]:text-[#D4AF37] text-gray-400 rounded-none px-6 py-3"
              >
                Referral
              </TabsTrigger>
              <TabsTrigger 
                value="service" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-[#D4AF37] data-[state=active]:text-[#D4AF37] text-gray-400 rounded-none px-6 py-3"
              >
                Service
              </TabsTrigger>
              <TabsTrigger 
                value="legal" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-[#D4AF37] data-[state=active]:text-[#D4AF37] text-gray-400 rounded-none px-6 py-3"
              >
                Legal
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6">
              <div className="grid gap-6">
                {/* XP and Level Card */}
                <Card className="bg-[#151B2E] border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-[#E8EAED] flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-[#D4AF37]" />
                      Level & XP Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-3xl text-[#D4AF37]">Level {getLevel()}</div>
                          <div className="text-sm text-gray-400">{totalXP} XP</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-400">Next Level</div>
                          <div className="text-lg text-[#E8EAED]">{getXPForNextLevel()} XP</div>
                        </div>
                      </div>
                      <Progress value={getLevelProgress()} className="h-3" />
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Achievements */}
                <Card className="bg-[#151B2E] border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-[#E8EAED] flex items-center gap-2">
                      <Award className="w-5 h-5 text-[#D4AF37]" />
                      Recent Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {achievements.slice(0, 3).map((achievement: any) => (
                        <div key={achievement.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#0B1426] border border-gray-800">
                          <div className="text-3xl">{achievement.icon || '🏆'}</div>
                          <div className="flex-1">
                            <div className="text-[#E8EAED]">{achievement.name}</div>
                            <div className="text-sm text-gray-400">{achievement.description}</div>
                          </div>
                          <Badge className="bg-[#D4AF37] text-[#0B1426]">
                            +{achievement.reward_xp} XP
                          </Badge>
                        </div>
                      ))}
                      {achievements.length === 0 && (
                        <p className="text-gray-400 text-center py-4">No achievements yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Badges Tab */}
            <TabsContent value="badges" className="mt-6">
              <Card className="bg-[#151B2E] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-[#E8EAED]">Earned Badges</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {badges.map((badge) => (
                      <div key={badge.id} className="flex flex-col items-center gap-2 p-4 rounded-lg bg-[#0B1426] border border-gray-800 hover:border-[#D4AF37]/50 transition-colors">
                        <div className="text-4xl">{badge.icon || '🏅'}</div>
                        <div className="text-[#E8EAED] text-center text-sm">{badge.name}</div>
                        <Badge variant={badge.rarity === 'legendary' ? 'default' : 'secondary'} className="text-xs">
                          {badge.rarity}
                        </Badge>
                      </div>
                    ))}
                    {badges.length === 0 && (
                      <div className="col-span-full text-center py-8 text-gray-400">
                        No badges earned yet
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Goals Tab */}
            <TabsContent value="goals" className="mt-6">
              <Card className="bg-[#151B2E] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-[#E8EAED] flex items-center gap-2">
                    <Target className="w-5 h-5 text-[#D4AF37]" />
                    Active Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {goals.map((goal) => (
                      <div key={goal.id} className="p-4 rounded-lg bg-[#0B1426] border border-gray-800">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="text-[#E8EAED]">{goal.title}</div>
                            <div className="text-sm text-gray-400">{goal.description}</div>
                          </div>
                          <Badge className="bg-[#D4AF37] text-[#0B1426]">
                            +{goal.reward_xp} XP
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Progress</span>
                            <span className="text-[#E8EAED]">{goal.progress}/{goal.target}</span>
                          </div>
                          <Progress value={(goal.progress / goal.target) * 100} className="h-2" />
                        </div>
                      </div>
                    ))}
                    {goals.length === 0 && (
                      <p className="text-gray-400 text-center py-8">No active goals</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="mt-6">
              <Card className="bg-[#151B2E] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-[#E8EAED] flex items-center gap-2">
                    <ActivityIcon className="w-5 h-5 text-[#D4AF37]" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-[#0B1426] border border-gray-800">
                        <div className="flex-1">
                          <div className="text-[#E8EAED] text-sm">{activity.description}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(activity.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                    {activities.length === 0 && (
                      <p className="text-gray-400 text-center py-8">No recent activity</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Favorites Tab */}
            <TabsContent value="favorites" className="mt-6">
              <Card className="bg-[#151B2E] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-[#E8EAED] flex items-center gap-2">
                    <Heart className="w-5 h-5 text-[#D4AF37]" />
                    Saved Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {savedPosts?.map((post: any) => (
                      <div key={post.id} className="p-4 rounded-lg bg-[#0B1426] border border-gray-800 hover:border-[#D4AF37]/50 transition-colors cursor-pointer">
                        <div className="flex items-start gap-3">
                          {post.media_urls?.[0] && (
                            <ImageWithFallback
                              src={post.media_urls[0]}
                              alt="Post"
                              className="w-16 h-16 rounded object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-[#E8EAED] text-sm line-clamp-2">
                              {post.content}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {new Date(post.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!savedPosts || savedPosts.length === 0) && (
                      <div className="col-span-full text-center py-8 text-gray-400">
                        No saved items yet
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Referral Tab */}
            <TabsContent value="referral" className="mt-6">
              <Card className="bg-[#151B2E] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-[#E8EAED] flex items-center gap-2">
                    <Gift className="w-5 h-5 text-[#D4AF37]" />
                    Referral Program
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Referral Stats - Show at the top */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card className="bg-gradient-to-br from-[#0B1426] to-[#151B2E] border-gray-800">
                        <CardContent className="p-4 text-center">
                          <div className="text-3xl text-[#D4AF37] mb-1 font-bold">
                            {referralStats?.count || 0}
                          </div>
                          <div className="text-xs text-gray-400">Total Referrals</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-[#0B1426] to-[#151B2E] border-gray-800">
                        <CardContent className="p-4 text-center">
                          <div className="text-3xl text-green-500 mb-1 font-bold">
                            {referralStats?.count || 0}
                          </div>
                          <div className="text-xs text-gray-400">Successful</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-[#0B1426] to-[#151B2E] border-gray-800">
                        <CardContent className="p-4 text-center">
                          <div className="text-3xl text-orange-500 mb-1 font-bold">
                            0
                          </div>
                          <div className="text-xs text-gray-400">Pending</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-[#0B1426] to-[#151B2E] border-gray-800">
                        <CardContent className="p-4 text-center">
                          <div className="text-3xl text-[#D4AF37] mb-1 font-bold">
                            {referralStats?.earned || 0} XP
                          </div>
                          <div className="text-xs text-gray-400">Total XP Earned</div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Share & Earn Rewards Section */}
                    <div className="p-6 rounded-lg bg-[#0B1426] border border-gray-800">
                      <div className="flex items-center gap-2 mb-6">
                        <Gift className="w-5 h-5 text-[#D4AF37]" />
                        <h3 className="text-lg font-semibold text-[#E8EAED]">Share & Earn Rewards</h3>
                      </div>

                      {/* Referral Link */}
                      <div className="mb-6">
                        <div className="text-sm text-gray-400 mb-2">Your Referral Link</div>
                        <div className="text-xs text-gray-500 mb-3">
                          Direct signup link - they don't need to enter a code!
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 px-4 py-3 rounded bg-[#151B2E] border border-gray-700">
                            <div className="text-[#D4AF37] font-mono text-sm break-all">
                              {referralCode ? `https://sublimesdrive.com/invite/${referralCode}` : 'Loading...'}
                            </div>
                          </div>
                          <Button
                            onClick={async () => {
                              const link = referralCode ? `https://sublimesdrive.com/invite/${referralCode}` : '';
                              const success = await copyToClipboard(link);
                              if (success) {
                                toast.success('Referral link copied!');
                              } else {
                                toast.error('Failed to copy link');
                              }
                            }}
                            size="sm"
                            variant="outline"
                            className="border-gray-700 text-[#E8EAED] hover:bg-[#1A2332] hover:text-[#D4AF37]"
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            Copy Link
                          </Button>
                          <Button
                            onClick={async () => {
                              const link = referralCode ? `https://sublimesdrive.com/invite/${referralCode}` : '';
                              if (navigator.share) {
                                try {
                                  await navigator.share({
                                    title: 'Join Sublimes Drive',
                                    text: 'Join me on Sublimes Drive - the ultimate Chinese car community in UAE!',
                                    url: link
                                  });
                                } catch (error) {
                                  console.log('Share cancelled');
                                }
                              } else {
                                const success = await copyToClipboard(link);
                                if (success) {
                                  toast.success('Link copied to clipboard!');
                                }
                              }
                            }}
                            size="sm"
                            variant="outline"
                            className="border-gray-700 text-[#E8EAED] hover:bg-[#1A2332] hover:text-[#D4AF37]"
                          >
                            <Share2 className="w-4 h-4 mr-1" />
                            Share
                          </Button>
                        </div>
                      </div>

                      <Separator className="my-6 bg-gray-800" />

                      {/* Referral Code */}
                      <div>
                        <div className="text-sm text-gray-400 mb-2">Or Share Your Code</div>
                        <div className="text-xs text-gray-500 mb-3">
                          Friends can enter this code during signup
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 px-4 py-3 rounded bg-[#151B2E] border border-gray-700">
                            <div className="text-[#D4AF37] font-mono text-2xl font-bold tracking-wider text-center">
                              {referralCode || 'Loading...'}
                            </div>
                          </div>
                          <Button
                            onClick={async () => {
                              const success = await copyToClipboard(referralCode || '');
                              if (success) {
                                toast.success('Referral code copied!');
                              } else {
                                toast.error('Failed to copy code');
                              }
                            }}
                            size="sm"
                            variant="outline"
                            className="border-gray-700 text-[#E8EAED] hover:bg-[#1A2332] hover:text-[#D4AF37]"
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            Copy Code
                          </Button>
                          <Button
                            onClick={async () => {
                              if (navigator.share) {
                                try {
                                  await navigator.share({
                                    title: 'Sublimes Drive Referral Code',
                                    text: `Use my referral code ${referralCode} to join Sublimes Drive!`
                                  });
                                } catch (error) {
                                  console.log('Share cancelled');
                                }
                              } else {
                                const success = await copyToClipboard(referralCode || '');
                                if (success) {
                                  toast.success('Code copied to clipboard!');
                                }
                              }
                            }}
                            size="sm"
                            variant="outline"
                            className="border-gray-700 text-[#E8EAED] hover:bg-[#1A2332] hover:text-[#D4AF37]"
                          >
                            <Share2 className="w-4 h-4 mr-1" />
                            Share Code
                          </Button>
                        </div>
                      </div>

                      {/* How it works */}
                      <div className="mt-6 p-4 rounded-lg bg-[#151B2E] border border-gray-700">
                        <h4 className="text-[#E8EAED] font-medium mb-3 flex items-center gap-2">
                          <Info className="w-4 h-4 text-[#D4AF37]" />
                          How it works
                        </h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>Share your referral link or code with friends</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>They sign up using your link or enter your code</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>You both earn XP rewards when they verify their account</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>Track all your referrals and earnings here</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Service Tab */}
            <TabsContent value="service" className="mt-6">
              <ServiceLogSection userId={profile?.id || ''} isOwnProfile={isOwnProfile} />
            </TabsContent>

            {/* Legal Tab */}
            <TabsContent value="legal" className="mt-6">
              <div className="space-y-6">
                {/* Legal & Information Section */}
                <Card className="bg-[#151B2E] border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-[#E8EAED] flex items-center gap-2">
                      <Shield className="w-5 h-5 text-[#D4AF37]" />
                      Legal & Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {[
                        { icon: HelpCircleIcon, iconColor: 'text-blue-400', title: 'FAQ & Help', subtitle: 'Get help and find answers', page: 'faq-knowledge-base' },
                        { icon: FileText, iconColor: 'text-green-400', title: 'Terms of Service', subtitle: 'Our terms and conditions', page: 'terms-of-service' },
                        { icon: Shield, iconColor: 'text-purple-400', title: 'Privacy & Cookie Policy', subtitle: 'How we protect your data', page: 'privacy-policy' },
                        { icon: RefreshCw, iconColor: 'text-orange-400', title: 'Refund Policy', subtitle: 'Information about refunds', page: 'refund-policy' },
                        { icon: Info, iconColor: 'text-blue-400', title: 'About Us', subtitle: 'Learn about Sublimes Drive', page: 'about-us' },
                      ].map((item, index) => (
                        <button
                          key={index}
                          onClick={() => onNavigate?.(item.page)}
                          className="w-full flex items-center gap-4 p-4 rounded-lg hover:bg-[#0B1426] transition-colors group"
                        >
                          <div className={`w-10 h-10 rounded-lg bg-[#0B1426] flex items-center justify-center ${item.iconColor}`}>
                            <item.icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="text-[#E8EAED] group-hover:text-[#D4AF37] transition-colors">
                              {item.title}
                            </div>
                            <div className="text-sm text-gray-400">
                              {item.subtitle}
                            </div>
                          </div>
                          <ExternalLink className="w-5 h-5 text-gray-600 group-hover:text-[#D4AF37] transition-colors" />
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Support Section */}
                <Card className="bg-[#151B2E] border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-[#E8EAED] flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-[#D4AF37]" />
                      Support
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-gray-400">
                        Need help? Our support team is here to assist you.
                      </p>
                      <Button
                        onClick={() => onNavigate?.('support')}
                        className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-[#0B1426]"
                      >
                        Contact Support
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
