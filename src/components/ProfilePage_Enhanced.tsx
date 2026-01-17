/**
 * ProfilePage_Enhanced - Complete Profile with Verification System
 * Matches Reference Design with Database Wiring
 */

import { useState, useEffect } from 'react';
import { 
  Edit, Share2, Trophy, Zap, Car, Users, Award, Camera, 
  Shield, Wrench, Eye, CheckCircle, XCircle, Loader2, 
  User, Star, Target, Activity, Heart, RefreshCw, Settings,
  AlertCircle, Info
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { toast } from 'sonner';
import { useProfile, useXP, useAchievements, useRole, useAnalytics } from '../hooks';
import { supabase } from '../utils/supabase/client';
import { LegalTabContent } from './legal/LegalTabContent';

interface ProfilePageProps {
  onNavigate?: (page: string) => void;
  userId?: string;
}

export function ProfilePage_Enhanced({ onNavigate, userId }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    posts: 0,
    followers: 0,
    following: 0,
    garages: 0,
    meetups: 0,
    cars: 0
  });
  const [badges, setBadges] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [serviceLog, setServiceLog] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // Hooks
  const { profile: viewedProfile, loading: profileLoading, refetch: refetchProfile } = useProfile(userId);
  const { totalXP, getLevel, getXPForNextLevel, getLevelProgress } = useXP(userId);
  const { allAchievements = [] } = useAchievements();
  const { profile: currentUserProfile, isAdmin } = useRole();
  const analytics = useAnalytics();

  const isOwnProfile = !userId || userId === currentUserProfile?.id;
  const loading = profileLoading;

  // XP Data
  const currentLevel = getLevel();
  const xpForNext = getXPForNextLevel();
  const levelProgress = getLevelProgress();

  // Track page view
  useEffect(() => {
    analytics.trackPageView(`/profile${userId ? `/${userId}` : ''}`);
  }, [userId]);

  // Fetch stats
  useEffect(() => {
    if (viewedProfile?.id) {
      fetchStats(viewedProfile.id);
      fetchBadges(viewedProfile.id);
      fetchGoals(viewedProfile.id);
      fetchServiceLog(viewedProfile.id);
    }
  }, [viewedProfile?.id]);

  const fetchStats = async (profileId: string) => {
    try {
      setLoadingStats(true);

      // Get posts count
      const { count: postsCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profileId);

      // Get followers count
      const { count: followersCount } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', profileId);

      // Get following count
      const { count: followingCount } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', profileId);

      // Get garages count (if garage owner)
      const { count: garagesCount } = await supabase
        .from('garages')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', profileId);

      // Get meetups count
      const { count: meetupsCount } = await supabase
        .from('event_attendees')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profileId);

      // Get cars count
      const { count: carsCount } = await supabase
        .from('user_vehicles')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profileId);

      setStats({
        posts: postsCount || 0,
        followers: followersCount || 0,
        following: followingCount || 0,
        garages: garagesCount || 0,
        meetups: meetupsCount || 0,
        cars: carsCount || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchBadges = async (profileId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', profileId)
        .order('earned_at', { ascending: false })
        .limit(6);

      if (!error && data) {
        setBadges(data);
      }
    } catch (error) {
      console.error('Error fetching badges:', error);
    }
  };

  const fetchGoals = async (profileId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', profileId)
        .eq('completed', false)
        .order('created_at', { ascending: false })
        .limit(3);

      if (!error && data) {
        setGoals(data);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  const fetchServiceLog = async (profileId: string) => {
    try {
      const { data, error } = await supabase
        .from('service_records')
        .select('*')
        .eq('user_id', profileId)
        .order('service_date', { ascending: false })
        .limit(5);

      if (!error && data) {
        setServiceLog(data);
      }
    } catch (error) {
      console.error('Error fetching service log:', error);
    }
  };

  const handleVerification = (type: 'car_owner' | 'garage_owner' | 'vendor') => {
    toast.info('Verification process starting...');
    analytics.trackEvent('verification_started', { type });
    
    if (type === 'car_owner') {
      onNavigate?.('verify-car-owner');
    } else if (type === 'garage_owner') {
      onNavigate?.('verify-garage-owner');
    } else {
      toast.info('Vendor verification coming soon!');
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/profile/${viewedProfile?.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Profile link copied!');
    analytics.trackShare('profile', viewedProfile?.id || '');
  };

  const handleEditCover = () => {
    toast.info('Cover photo upload coming soon!');
  };

  const handleEditProfile = () => {
    onNavigate?.('profile-settings');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B1426]">
        <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin mb-4" />
        <p className="text-[#8B92A7]">Loading profile...</p>
      </div>
    );
  }

  if (!viewedProfile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 bg-[#0B1426]">
        <Card className="bg-[#0F1829] border-[#1A2332]">
          <CardContent className="p-12 text-center">
            <User className="text-[#D4AF37] mx-auto mb-4" size={60} />
            <h3 className="text-xl text-[#E8EAED] mb-2">Profile Not Found</h3>
            <p className="text-[#8B92A7] mb-6">This profile doesn't exist.</p>
            <Button onClick={() => onNavigate?.('home')} className="bg-[#D4AF37] text-[#0B1426]">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userRole = viewedProfile.role || 'car_browser';

  return (
    <div className="min-h-screen bg-[#0B1426]">
      {/* Cover Photo */}
      <div className="relative h-64 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: viewedProfile.cover_url 
              ? `url(${viewedProfile.cover_url})` 
              : 'none'
          }}
        />
        {isOwnProfile && (
          <Button
            onClick={handleEditCover}
            className="absolute top-4 right-4 bg-[#1A1F2E] hover:bg-[#2A3441] text-white border border-[#2A3441]"
          >
            <Camera className="h-4 w-4 mr-2" />
            Edit Cover
          </Button>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-20">
        {/* Profile Header */}
        <div className="bg-[#0F1829] border border-[#1A2332] rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-[#0F1829]">
                  <AvatarImage src={viewedProfile.avatar_url || ''} />
                  <AvatarFallback className="bg-[#D4AF37] text-[#0B1426] text-2xl">
                    {viewedProfile.display_name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                {viewedProfile.verified && (
                  <div className="absolute -bottom-2 -right-2 bg-[#D4AF37] rounded-full p-2">
                    <CheckCircle className="h-5 w-5 text-[#0B1426]" />
                  </div>
                )}
              </div>

              {/* Name and Join Info */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl text-[#E8EAED]">
                    {viewedProfile.display_name || 'User'}
                  </h1>
                  {viewedProfile.verified && (
                    <Badge className="bg-[#D4AF37] text-[#0B1426]">
                      ⭐ Verified
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-[#8B92A7]">
                  <Users className="h-4 w-4" />
                  <span>
                    Joined {new Date(viewedProfile.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button
                onClick={handleShare}
                variant="outline"
                className="border-[#2A3441] text-[#E8EAED] hover:bg-[#2A3441]"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              {isOwnProfile && (
                <Button
                  onClick={handleEditProfile}
                  className="bg-[#D4AF37] hover:bg-[#C19B2E] text-[#0B1426]"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-6 pt-6 border-t border-[#1A2332]">
            <div className="text-center">
              <div className="text-2xl text-[#E8EAED] mb-1">
                {loadingStats ? '-' : stats.posts}
              </div>
              <div className="text-sm text-[#8B92A7]">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl text-[#E8EAED] mb-1">
                {loadingStats ? '-' : stats.followers}
              </div>
              <div className="text-sm text-[#8B92A7]">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl text-[#E8EAED] mb-1">
                {loadingStats ? '-' : stats.following}
              </div>
              <div className="text-sm text-[#8B92A7]">Following</div>
            </div>
            <div className="text-center">
              <div className="text-2xl text-[#E8EAED] mb-1">
                {loadingStats ? '-' : stats.garages}
              </div>
              <div className="text-sm text-[#8B92A7]">Garages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl text-[#E8EAED] mb-1">
                {loadingStats ? '-' : stats.meetups}
              </div>
              <div className="text-sm text-[#8B92A7]">Meetups</div>
            </div>
            <div className="text-center">
              <div className="text-2xl text-[#E8EAED] mb-1">
                {loadingStats ? '-' : stats.cars}
              </div>
              <div className="text-sm text-[#8B92A7]">Cars</div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="bg-[#0F1829] border border-[#1A2332] w-full justify-start overflow-x-auto">
            <TabsTrigger 
              value="overview"
              className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426]"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="badges"
              className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426]"
            >
              Badges
            </TabsTrigger>
            <TabsTrigger 
              value="goals"
              className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426]"
            >
              Goals
            </TabsTrigger>
            <TabsTrigger 
              value="activity"
              className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426]"
            >
              Activity
            </TabsTrigger>
            <TabsTrigger 
              value="my-fav"
              className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426]"
            >
              My Fav
            </TabsTrigger>
            <TabsTrigger 
              value="referral"
              className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426]"
            >
              Referral
            </TabsTrigger>
            <TabsTrigger 
              value="service"
              className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426]"
            >
              Service
            </TabsTrigger>
            <TabsTrigger 
              value="legal"
              className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426]"
            >
              Legal
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Level Progress */}
            <Card className="bg-[#0F1829] border-[#1A2332]">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="h-5 w-5 text-[#D4AF37]" />
                  <h3 className="text-[#E8EAED]">Level Progress</h3>
                </div>
                
                <div className="flex items-end justify-between mb-2">
                  <div>
                    <p className="text-2xl text-[#E8EAED]">Level {currentLevel}</p>
                    <p className="text-sm text-[#8B92A7]">
                      {totalXP} / {totalXP + xpForNext} XP
                    </p>
                  </div>
                  <p className="text-sm text-[#D4AF37]">
                    {xpForNext} XP to next level
                  </p>
                </div>

                <Progress value={levelProgress} className="h-3 bg-[#1A2332]" />
                <p className="text-xs text-[#8B92A7] mt-2">Keep earning XP!</p>
              </CardContent>
            </Card>

            {/* Verification Status */}
            {isOwnProfile && (
              <Card className="bg-[#0F1829] border-[#1A2332]">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="h-5 w-5 text-[#D4AF37]" />
                    <h3 className="text-[#E8EAED]">Verification Status</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Car Owner */}
                    <div className="bg-[#1A2332] rounded-lg p-4 border border-[#2A3441]">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Car className="h-5 w-5 text-blue-400" />
                          <span className="text-[#E8EAED]">Car Owner</span>
                        </div>
                        {userRole === 'car_owner' ? (
                          <Badge className="bg-green-600 text-white">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-red-500 text-red-400">
                            <XCircle className="h-3 w-3 mr-1" />
                            Not Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-[#8B92A7] mb-3">
                        Verify your car ownership to access exclusive features
                      </p>
                      {userRole !== 'car_owner' && (
                        <Button
                          onClick={() => handleVerification('car_owner')}
                          className="w-full bg-[#D4AF37] hover:bg-[#C19B2E] text-[#0B1426]"
                          size="sm"
                        >
                          Get Verified as Car Owner
                        </Button>
                      )}
                    </div>

                    {/* Garage Owner */}
                    <div className="bg-[#1A2332] rounded-lg p-4 border border-[#2A3441]">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Wrench className="h-5 w-5 text-orange-400" />
                          <span className="text-[#E8EAED]">Garage Owner</span>
                        </div>
                        {userRole === 'garage_owner' ? (
                          <Badge className="bg-green-600 text-white">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-red-500 text-red-400">
                            <XCircle className="h-3 w-3 mr-1" />
                            Not Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-[#8B92A7] mb-3">
                        Verify your garage business to list services
                      </p>
                      {userRole !== 'garage_owner' && (
                        <Button
                          onClick={() => handleVerification('garage_owner')}
                          className="w-full bg-[#D4AF37] hover:bg-[#C19B2E] text-[#0B1426]"
                          size="sm"
                        >
                          Get Verified as Garage Owner
                        </Button>
                      )}
                    </div>

                    {/* Vendor */}
                    <div className="bg-[#1A2332] rounded-lg p-4 border border-[#2A3441]">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-purple-400" />
                          <span className="text-[#E8EAED]">Vendor</span>
                        </div>
                        {userRole === 'vendor' ? (
                          <Badge className="bg-green-600 text-white">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-red-500 text-red-400">
                            <XCircle className="h-3 w-3 mr-1" />
                            Not Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-[#8B92A7] mb-3">
                        Verify your business to sell parts and accessories
                      </p>
                      {userRole !== 'vendor' && (
                        <Button
                          onClick={() => handleVerification('vendor')}
                          className="w-full bg-[#D4AF37] hover:bg-[#C19B2E] text-[#0B1426]"
                          size="sm"
                        >
                          Get Verified as Vendor
                        </Button>
                      )}
                    </div>

                    {/* Car Browser */}
                    <div className="bg-[#1A2332] rounded-lg p-4 border border-[#2A3441]">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Eye className="h-5 w-5 text-blue-400" />
                          <span className="text-[#E8EAED]">Car Browser</span>
                        </div>
                        {userRole === 'car_browser' ? (
                          <Badge className="bg-blue-600 text-white">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-[#2A3441] text-[#8B92A7]">
                            Available
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-[#8B92A7] mb-3">
                        Browse cars, parts, and services without verification
                      </p>
                      {userRole === 'car_browser' && (
                        <Button
                          variant="outline"
                          className="w-full border-[#2A3441] text-[#8B92A7]"
                          size="sm"
                          disabled
                        >
                          Stay as Car Browser
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Why Get Verified */}
                  <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-400 mt-0.5" />
                      <div>
                        <h4 className="text-sm text-blue-400 mb-2">Why Get Verified?</h4>
                        <ul className="text-sm text-blue-300 space-y-1">
                          <li>• Access exclusive features and perks</li>
                          <li>• Priority support and customer service</li>
                          <li>• Verified badge on your profile</li>
                          <li>• Enhanced trust from other users</li>
                          <li>• Increased visibility and promotions</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* My Vehicle Service Log */}
            {isOwnProfile && (
              <Card className="bg-[#0F1829] border-[#1A2332]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-5 w-5 text-[#D4AF37]" />
                      <h3 className="text-[#E8EAED]">My Vehicle Service Log</h3>
                    </div>
                    <Button
                      onClick={() => onNavigate?.('service-log')}
                      variant="outline"
                      size="sm"
                      className="border-[#2A3441] text-[#D4AF37] hover:bg-[#2A3441]"
                    >
                      View My Service Log
                    </Button>
                  </div>
                  <p className="text-sm text-[#8B92A7]">
                    Keep a private log of your car's maintenance history and get timely reminders for upcoming services.
                  </p>

                  {serviceLog.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {serviceLog.slice(0, 3).map((log) => (
                        <div key={log.id} className="bg-[#1A2332] rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-[#E8EAED]">{log.service_type}</span>
                            <span className="text-xs text-[#8B92A7]">
                              {new Date(log.service_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Recent Badges */}
            <Card className="bg-[#0F1829] border-[#1A2332]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-[#D4AF37]" />
                    <h3 className="text-[#E8EAED]">Recent Badges</h3>
                  </div>
                  <Button
                    onClick={() => setActiveTab('badges')}
                    variant="ghost"
                    size="sm"
                    className="text-[#D4AF37] hover:bg-[#D4AF37]/10"
                  >
                    View All →
                  </Button>
                </div>

                {badges.length === 0 ? (
                  <p className="text-sm text-[#8B92A7] text-center py-8">
                    No badges earned yet. Complete challenges to earn your first badge!
                  </p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {badges.slice(0, 6).map((badge) => (
                      <div 
                        key={badge.id}
                        className="bg-[#1A2332] rounded-lg p-4 text-center"
                      >
                        <div className="text-4xl mb-2">
                          {badge.achievement?.icon || '🏆'}
                        </div>
                        <p className="text-sm text-[#E8EAED] mb-1">
                          {badge.achievement?.name}
                        </p>
                        <p className="text-xs text-[#8B92A7]">
                          {new Date(badge.earned_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Goals */}
            <Card className="bg-[#0F1829] border-[#1A2332]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-[#D4AF37]" />
                    <h3 className="text-[#E8EAED]">Active Goals</h3>
                  </div>
                  <Button
                    onClick={() => setActiveTab('goals')}
                    variant="ghost"
                    size="sm"
                    className="text-[#D4AF37] hover:bg-[#D4AF37]/10"
                  >
                    View All →
                  </Button>
                </div>

                {goals.length === 0 ? (
                  <p className="text-sm text-[#8B92A7] text-center py-8">
                    No active goals. Set some goals to track your progress!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {goals.map((goal) => (
                      <div 
                        key={goal.id}
                        className="bg-[#1A2332] rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-[#E8EAED]">{goal.title}</span>
                          <Badge className="bg-[#D4AF37] text-[#0B1426]">
                            {goal.progress}%
                          </Badge>
                        </div>
                        <Progress value={goal.progress || 0} className="h-2" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other Tabs - Placeholder Content */}
          <TabsContent value="badges" className="mt-6">
            <Card className="bg-[#0F1829] border-[#1A2332]">
              <CardContent className="p-12 text-center">
                <Award className="h-16 w-16 text-[#D4AF37] mx-auto mb-4" />
                <h3 className="text-xl text-[#E8EAED] mb-2">All Badges</h3>
                <p className="text-[#8B92A7]">Badge collection coming soon!</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="mt-6">
            <Card className="bg-[#0F1829] border-[#1A2332]">
              <CardContent className="p-12 text-center">
                <Target className="h-16 w-16 text-[#D4AF37] mx-auto mb-4" />
                <h3 className="text-xl text-[#E8EAED] mb-2">My Goals</h3>
                <p className="text-[#8B92A7]">Goal tracking coming soon!</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <Card className="bg-[#0F1829] border-[#1A2332]">
              <CardContent className="p-12 text-center">
                <Activity className="h-16 w-16 text-[#D4AF37] mx-auto mb-4" />
                <h3 className="text-xl text-[#E8EAED] mb-2">Activity Feed</h3>
                <p className="text-[#8B92A7]">Activity history coming soon!</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-fav" className="mt-6">
            <Card className="bg-[#0F1829] border-[#1A2332]">
              <CardContent className="p-12 text-center">
                <Heart className="h-16 w-16 text-[#D4AF37] mx-auto mb-4" />
                <h3 className="text-xl text-[#E8EAED] mb-2">My Favorites</h3>
                <p className="text-[#8B92A7]">Favorites coming soon!</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referral" className="mt-6">
            <Card className="bg-[#0F1829] border-[#1A2332]">
              <CardContent className="p-12 text-center">
                <Users className="h-16 w-16 text-[#D4AF37] mx-auto mb-4" />
                <h3 className="text-xl text-[#E8EAED] mb-2">Referral Program</h3>
                <p className="text-[#8B92A7]">Referral system coming soon!</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="service" className="mt-6">
            <Card className="bg-[#0F1829] border-[#1A2332]">
              <CardContent className="p-12 text-center">
                <Wrench className="h-16 w-16 text-[#D4AF37] mx-auto mb-4" />
                <h3 className="text-xl text-[#E8EAED] mb-2">Service Log</h3>
                <Button 
                  onClick={() => onNavigate?.('service-log')}
                  className="bg-[#D4AF37] text-[#0B1426] mt-4"
                >
                  View Full Service Log
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="legal" className="mt-6">
            <LegalTabContent onNavigate={onNavigate} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
