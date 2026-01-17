/**
 * Enhanced Profile Page V3 - With Verification Status & Role Badges
 * Features:
 * - Role-based badges (Admin, Car Owner, Garage Owner, Vendor, Browser)
 * - Car brand/model badges for car owners
 * - Verification Status section with verification buttons
 * - Connected to Admin Panel verification workflows
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
  Upload, Image as ImageIcon, Info, Lock, RefreshCw, HelpCircleIcon,
  AlertCircle, BadgeCheck, Crown, Store, Clock
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
import { ComprehensiveFavoritesSection } from './profile/ComprehensiveFavoritesSection';

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

interface VerificationStatus {
  car_owner: 'not_verified' | 'pending' | 'verified' | 'rejected';
  garage_owner: 'not_verified' | 'pending' | 'verified' | 'rejected';
  vendor: 'not_verified' | 'pending' | 'verified' | 'rejected';
}

interface UserCar {
  brand: string;
  model: string;
  year: string;
}

export function ProfilePage({ onNavigate, userId }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [goals, setGoals] = useState<GoalData[]>([]);
  const [isEditingCover, setIsEditingCover] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    car_owner: 'not_verified',
    garage_owner: 'not_verified',
    vendor: 'not_verified'
  });
  const [userCars, setUserCars] = useState<UserCar[]>([]);

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

  // Referral data
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

  // Load verification status and user data
  useEffect(() => {
    if (profile?.id) {
      fetchBadges();
      fetchActivities();
      fetchGoals();
      fetchVerificationStatus();
      fetchUserCars();
    }
  }, [profile?.id]);

  const fetchVerificationStatus = async () => {
    if (!profile?.id) return;

    try {
      // Check car owner verification
      const { data: carVerification } = await supabase
        .from('car_owner_verifications')
        .select('status')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Check garage owner verification
      const { data: garageVerification } = await supabase
        .from('garage_verifications')
        .select('status')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Check vendor verification
      const { data: vendorVerification } = await supabase
        .from('vendor_verifications')
        .select('status')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      setVerificationStatus({
        car_owner: carVerification?.status || 'not_verified',
        garage_owner: garageVerification?.status || 'not_verified',
        vendor: vendorVerification?.status || 'not_verified'
      });
    } catch (error: any) {
      console.error('Error fetching verification status:', error);
    }
  };

  const fetchUserCars = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_cars')
        .select('brand, model, year')
        .eq('user_id', profile.id);

      if (error) throw error;
      setUserCars(data || []);
    } catch (error: any) {
      console.error('Error fetching user cars:', error);
    }
  };

  // Handle verification clicks
  const handleVerificationClick = (type: 'car_owner' | 'garage_owner' | 'vendor') => {
    if (!isOwnProfile) {
      toast.error('You can only verify your own profile');
      return;
    }

    switch (type) {
      case 'car_owner':
        onNavigate?.('verify-car-owner');
        break;
      case 'garage_owner':
        onNavigate?.('verify-garage-owner');
        break;
      case 'vendor':
        onNavigate?.('verify-vendor');
        break;
    }
  };

  const fetchBadges = async () => {
    try {
      // Auto-award admin badge if user is admin
      if (profile?.role === 'admin' || isAdmin) {
        const { data: adminBadge } = await supabase
          .from('badges')
          .select('id')
          .eq('name', 'Admin')
          .single();

        if (adminBadge) {
          const { data: existingUserBadge } = await supabase
            .from('user_badges')
            .select('id')
            .eq('user_id', profile?.id)
            .eq('badge_id', adminBadge.id)
            .single();

          if (!existingUserBadge) {
            await supabase
              .from('user_badges')
              .insert({
                user_id: profile?.id,
                badge_id: adminBadge.id,
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
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
      const filePath = `covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

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
  const meetupsCount = profile?.meetups_attended || 0;

  const stats = [
    { label: 'Posts', value: userPosts.length, icon: FileText },
    { label: 'Followers', value: followers.length, icon: Users },
    { label: 'Following', value: following.length, icon: UserPlus },
    { label: 'Garages', value: userGarages.length, icon: Wrench },
    { label: 'Meetups', value: meetupsCount, icon: Users },
    { label: 'Cars', value: userCars.length, icon: Car },
  ];

  // Get role badges to display
  const getRoleBadges = () => {
    const roleBadges = [];

    // Admin badge
    if (profile?.role === 'admin' || isAdmin) {
      roleBadges.push({
        label: 'Admin',
        icon: Crown,
        color: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
        textColor: 'text-white'
      });
    }

    // Car Owner badge
    if (verificationStatus.car_owner === 'verified') {
      roleBadges.push({
        label: 'Car Owner',
        icon: Car,
        color: 'bg-gradient-to-r from-blue-500 to-blue-600',
        textColor: 'text-white'
      });
    }

    // Garage Owner badge
    if (verificationStatus.garage_owner === 'verified') {
      roleBadges.push({
        label: 'Garage Owner',
        icon: Wrench,
        color: 'bg-gradient-to-r from-orange-500 to-orange-600',
        textColor: 'text-white'
      });
    }

    // Vendor badge
    if (verificationStatus.vendor === 'verified') {
      roleBadges.push({
        label: 'Vendor',
        icon: Store,
        color: 'bg-gradient-to-r from-purple-500 to-purple-600',
        textColor: 'text-white'
      });
    }

    // Browser badge (default)
    if (roleBadges.length === 1 && roleBadges[0].label === 'Admin') {
      // Admin can also be a browser
      roleBadges.push({
        label: 'Car Browser',
        icon: Eye,
        color: 'bg-gradient-to-r from-gray-500 to-gray-600',
        textColor: 'text-white'
      });
    } else if (roleBadges.length === 0) {
      // Default browser badge
      roleBadges.push({
        label: 'Car Browser',
        icon: Eye,
        color: 'bg-gradient-to-r from-blue-400 to-blue-500',
        textColor: 'text-white',
        isActive: true
      });
    }

    return roleBadges;
  };

  // Get car brand badges
  const getCarBadges = () => {
    return userCars.map(car => ({
      label: `${car.brand} ${car.model}`,
      icon: Car,
      color: 'bg-gradient-to-r from-[#D4AF37] to-[#FFD700]',
      textColor: 'text-[#0B1426]'
    }));
  };

  const getVerificationStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getVerificationStatusText = (status: string) => {
    switch (status) {
      case 'verified':
        return 'Verified';
      case 'pending':
        return 'Pending';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Not Verified';
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--sublimes-gold)]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The profile you're looking for doesn't exist.
            </p>
            <Button onClick={() => onNavigate?.('home')}>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentLevel = getLevel();
  const nextLevelXP = getXPForNextLevel();
  const levelProgress = getLevelProgress();
  const roleBadges = getRoleBadges();
  const carBadges = getCarBadges();

  return (
    <div className="min-h-screen bg-background">
      {/* Cover Image Section */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-[#0B1426] to-[#1a2332] overflow-hidden">
        {coverImage && (
          <ImageWithFallback
            src={coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Cover Edit Button */}
        {isOwnProfile && (
          <div className="absolute top-4 right-4">
            {isEditingCover ? (
              <div className="flex items-center space-x-2">
                <label htmlFor="cover-upload">
                  <Button
                    size="sm"
                    disabled={uploadingCover}
                    className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/90"
                  >
                    {uploadingCover ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </>
                    )}
                  </Button>
                </label>
                <input
                  id="cover-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="hidden"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditingCover(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditingCover(true)}
                className="bg-black/50 border-white/20 hover:bg-black/70"
              >
                <Camera className="w-4 h-4 mr-2" />
                Edit Cover
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Profile Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <Avatar className="w-32 h-32 border-4 border-background">
              <AvatarImage src={profile.avatar_url || ''} alt={profile.full_name || 'User'} />
              <AvatarFallback className="text-3xl bg-[var(--sublimes-gold)] text-black">
                {profile.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-[var(--sublimes-light-text)]">
                  {profile.full_name || 'Anonymous User'}
                </h1>
                {profile.is_verified && (
                  <BadgeCheck className="w-6 h-6 text-blue-500" />
                )}
              </div>

              {/* Role Badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                {roleBadges.map((badge, index) => {
                  const Icon = badge.icon;
                  return (
                    <div
                      key={index}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full ${badge.color} ${badge.textColor} text-sm font-medium ${badge.isActive ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-background' : ''}`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{badge.label}</span>
                    </div>
                  );
                })}

                {/* Car Brand Badges */}
                {carBadges.map((badge, index) => {
                  const Icon = badge.icon;
                  return (
                    <div
                      key={`car-${index}`}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full ${badge.color} ${badge.textColor} text-sm font-medium`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{badge.label}</span>
                    </div>
                  );
                })}
              </div>

              {profile.bio && (
                <p className="text-muted-foreground mb-3">{profile.bio}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {profile.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.created_at && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-2 w-full md:w-auto">
              {isOwnProfile ? (
                <>
                  <Button
                    onClick={() => onNavigate?.('profile-settings')}
                    className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/90"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleShare}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleFollow}
                    className={isFollowing(profile.id) 
                      ? 'bg-[var(--sublimes-border)] hover:bg-[var(--sublimes-border)]/90' 
                      : 'bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/90'
                    }
                  >
                    {isFollowing(profile.id) ? 'Following' : 'Follow'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => onNavigate?.('chat')}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* XP Level Section */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-[var(--sublimes-gold)]" />
              <span>Level {currentLevel}</span>
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              {totalXP} / {nextLevelXP} XP
            </span>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={levelProgress} className="h-2" />
              <p className="text-xs text-right text-muted-foreground">
                {nextLevelXP - totalXP} XP to next level
              </p>
              <p className="text-xs text-muted-foreground">
                Keep earning XP! • {levelProgress.toFixed(1)}% complete
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Verification Status Section */}
        {isOwnProfile && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-[var(--sublimes-gold)]" />
                <span>Verification Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Car Owner Verification */}
                <div className="flex items-center justify-between p-4 border border-[var(--sublimes-border)] rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Car className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium text-[var(--sublimes-light-text)]">Car Owner</p>
                      <p className="text-xs text-muted-foreground">
                        Verify your car ownership to access exclusive features
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      {getVerificationStatusIcon(verificationStatus.car_owner)}
                      <span className="text-xs">{getVerificationStatusText(verificationStatus.car_owner)}</span>
                    </div>
                    {verificationStatus.car_owner === 'not_verified' && (
                      <Button
                        size="sm"
                        onClick={() => handleVerificationClick('car_owner')}
                        className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/90"
                      >
                        Get Verified as Car Owner
                      </Button>
                    )}
                  </div>
                </div>

                {/* Garage Owner Verification */}
                <div className="flex items-center justify-between p-4 border border-[var(--sublimes-border)] rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                      <Wrench className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="font-medium text-[var(--sublimes-light-text)]">Garage Owner</p>
                      <p className="text-xs text-muted-foreground">
                        Verify your garage business to list services
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      {getVerificationStatusIcon(verificationStatus.garage_owner)}
                      <span className="text-xs">{getVerificationStatusText(verificationStatus.garage_owner)}</span>
                    </div>
                    {verificationStatus.garage_owner === 'not_verified' && (
                      <Button
                        size="sm"
                        onClick={() => handleVerificationClick('garage_owner')}
                        className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/90"
                      >
                        Get Verified as Garage Owner
                      </Button>
                    )}
                  </div>
                </div>

                {/* Vendor Verification */}
                <div className="flex items-center justify-between p-4 border border-[var(--sublimes-border)] rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                      <Store className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="font-medium text-[var(--sublimes-light-text)]">Vendor</p>
                      <p className="text-xs text-muted-foreground">
                        Verify your business to sell parts and accessories
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      {getVerificationStatusIcon(verificationStatus.vendor)}
                      <span className="text-xs">{getVerificationStatusText(verificationStatus.vendor)}</span>
                    </div>
                    {verificationStatus.vendor === 'not_verified' && (
                      <Button
                        size="sm"
                        onClick={() => handleVerificationClick('vendor')}
                        className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/90"
                      >
                        Get Verified as Vendor
                      </Button>
                    )}
                  </div>
                </div>

                {/* Car Browser (Active by default) */}
                <div className="flex items-center justify-between p-4 border-2 border-blue-500/50 bg-blue-500/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Eye className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium text-[var(--sublimes-light-text)] flex items-center space-x-2">
                        <span>Car Browser</span>
                        <Badge variant="secondary" className="bg-blue-500 text-white">Active</Badge>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Browse cars, parts, and services without verification
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled
                  >
                    Stay as Car Browser
                  </Button>
                </div>
              </div>

              {/* Why Get Verified Info */}
              <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-[var(--sublimes-light-text)] mb-2">Why Get Verified?</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Access to exclusive features and content</li>
                      <li>• Priority support and customer service</li>
                      <li>• Verified badge on your profile</li>
                      <li>• Enhanced trust from community</li>
                      <li>• Listing and selling capabilities</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:border-[var(--sublimes-gold)] transition-colors cursor-pointer">
                <CardContent className="pt-6 text-center">
                  <Icon className="w-6 h-6 mx-auto mb-2 text-[var(--sublimes-gold)]" />
                  <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-8 gap-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="favorites">My Fav</TabsTrigger>
            <TabsTrigger value="referral">Referral</TabsTrigger>
            <TabsTrigger value="service">Service</TabsTrigger>
            <TabsTrigger value="legal">Legal</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                {activities.length > 0 ? (
                  <div className="space-y-3">
                    {activities.slice(0, 5).map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <ActivityIcon className="w-5 h-5 text-[var(--sublimes-gold)] mt-0.5" />
                        <div>
                          <p className="text-sm text-[var(--sublimes-light-text)]">
                            {activity.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <ActivityIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-[var(--sublimes-gold)]" />
                  <span>Earned Badges ({badges.length})</span>
                </h3>
                {badges.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {badges.map((badge) => (
                      <div
                        key={badge.id}
                        className="flex flex-col items-center p-4 border border-[var(--sublimes-border)] rounded-lg hover:border-[var(--sublimes-gold)] transition-colors"
                      >
                        <div className="text-4xl mb-2">{badge.icon}</div>
                        <h4 className="font-medium text-sm text-center mb-1">{badge.name}</h4>
                        <p className="text-xs text-center text-muted-foreground mb-2">
                          {badge.description}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {badge.rarity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Award className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No badges earned yet</p>
                    <p className="text-sm">Complete activities to earn badges!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <Target className="w-5 h-5 text-[var(--sublimes-gold)]" />
                  <span>Active Goals ({goals.length})</span>
                </h3>
                {goals.length > 0 ? (
                  <div className="space-y-4">
                    {goals.map((goal) => (
                      <div
                        key={goal.id}
                        className="p-4 border border-[var(--sublimes-border)] rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium">{goal.title}</h4>
                            <p className="text-sm text-muted-foreground">{goal.description}</p>
                          </div>
                          <Badge variant="secondary" className="ml-2">
                            +{goal.reward_xp} XP
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">
                              {goal.progress} / {goal.target}
                            </span>
                          </div>
                          <Progress 
                            value={(goal.progress / goal.target) * 100} 
                            className="h-2"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No active goals</p>
                    <p className="text-sm">Set goals to track your progress!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">All Activity</h3>
                {activities.length > 0 ? (
                  <div className="space-y-2">
                    {activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <ActivityIcon className="w-5 h-5 text-[var(--sublimes-gold)] mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-[var(--sublimes-light-text)]">
                            {activity.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <ActivityIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No activity recorded yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites">
            <Card>
              <CardContent className="pt-6">
                <ComprehensiveFavoritesSection 
                  userId={profile.id} 
                  isOwnProfile={isOwnProfile} 
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Referral Tab */}
          <TabsContent value="referral">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <Gift className="w-5 h-5 text-[var(--sublimes-gold)]" />
                  <span>Referral Program</span>
                </h3>
                
                {referralCode ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-[var(--sublimes-gold)]/10 border border-[var(--sublimes-gold)]/20 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Your Referral Code</p>
                      <div className="flex items-center justify-between">
                        <code className="text-lg font-mono font-bold text-[var(--sublimes-gold)]">
                          {referralCode}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(referralCode)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                    </div>

                    {referralStats && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 border border-[var(--sublimes-border)] rounded-lg">
                          <p className="text-2xl font-bold text-[var(--sublimes-light-text)]">
                            {referralStats.total_referrals || 0}
                          </p>
                          <p className="text-sm text-muted-foreground">Total Referrals</p>
                        </div>
                        <div className="p-4 border border-[var(--sublimes-border)] rounded-lg">
                          <p className="text-2xl font-bold text-[var(--sublimes-gold)]">
                            {referralStats.total_rewards || 0}
                          </p>
                          <p className="text-sm text-muted-foreground">Rewards Earned</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Button
                      onClick={generateReferralCode}
                      className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/90"
                    >
                      Generate Referral Code
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Service Log Tab */}
          <TabsContent value="service">
            <ServiceLogSection userId={profile.id} isOwnProfile={isOwnProfile} />
          </TabsContent>

          {/* Legal Tab */}
          <TabsContent value="legal">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Legal & Policies</h3>
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-between"
                    onClick={() => onNavigate?.('terms-of-service')}
                  >
                    <span className="flex items-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <span>Terms of Service</span>
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-between"
                    onClick={() => onNavigate?.('privacy-policy')}
                  >
                    <span className="flex items-center space-x-2">
                      <Lock className="w-4 h-4" />
                      <span>Privacy Policy</span>
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-between"
                    onClick={() => onNavigate?.('refund-policy')}
                  >
                    <span className="flex items-center space-x-2">
                      <RefreshCw className="w-4 h-4" />
                      <span>Refund Policy</span>
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-between"
                    onClick={() => onNavigate?.('faq-knowledge-base')}
                  >
                    <span className="flex items-center space-x-2">
                      <HelpCircleIcon className="w-4 h-4" />
                      <span>Help & FAQ</span>
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
