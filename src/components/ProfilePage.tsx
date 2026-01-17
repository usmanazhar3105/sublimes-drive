import { useState, useEffect } from 'react';
import { Edit, Settings, Share2, Star, Trophy, Zap, Calendar, MapPin, Car, Users, Target, Award, Camera, ExternalLink, MessageCircle, HelpCircle, Shield, RefreshCw, ShoppingBag, Heart, Wrench, CalendarDays, Clock, Eye, DollarSign, UserPlus, Gift, Copy, FileText } from 'lucide-react';
import { ServiceLogPage } from './ServiceLogPage';
import { EditProfileModal } from './EditProfileModal';
import { MobileProfilePage } from './MobileProfilePage';
import { MyChallengesSection } from './MyChallengesSection';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface UserStats {
  posts: number;
  followers: number;
  following: number;
  garageVisits: number;
  meetupsAttended: number;
  carsOwned: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  progress: number;
  maxProgress: number;
  reward: string;
  category: string;
}

const userProfile = {
  name: 'Ahmed Hassan',
  username: '@ahmed_cars',
  bio: 'Passionate car enthusiast from Dubai 🇦🇪 • BYD Seal owner • Track day regular • Always looking for new driving routes and car meets!',
  location: 'Dubai, UAE',
  joinDate: 'March 2023',
  verified: true,
  xp: 1247,
  level: 8,
  nextLevelXp: 1500,
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face',
  coverImage: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=200&fit=crop',
  stats: {
    posts: 127,
    followers: 2834,
    following: 456,
    garageVisits: 43,
    meetupsAttended: 28,
    carsOwned: 3
  } as UserStats
};

const userBadges: Badge[] = [
  {
    id: '1',
    name: 'Admin',
    description: 'Community administrator with special privileges',
    icon: '👑',
    earned: true,
    earnedDate: 'March 2023',
    rarity: 'legendary'
  },
  {
    id: '2',
    name: 'Car Owner',
    description: 'Verified car owner in the community',
    icon: '🚗',
    earned: true,
    earnedDate: 'March 2023',
    rarity: 'common'
  }
];

const achievements: Achievement[] = [
  {
    id: '1',
    title: 'Garage Explorer',
    description: 'Visit 50 different garages',
    progress: 43,
    maxProgress: 50,
    reward: '200 XP + Mechanic Badge',
    category: 'Exploration'
  }
];

const recentActivity = [
  {
    id: '1',
    type: 'post',
    action: 'Posted a new photo of their BYD Seal',
    timestamp: '2 hours ago',
    xpGained: 25
  }
];

// Current user role and badge info
const currentUser = {
  role: 'car-owner', // 'car-owner', 'browser', 'garage-owner'
  badgeType: 'green', // 'yellow' for browser, 'green' for car-owner, 'blue' for garage-owner
  verified: true
};

// Referral system data with role-based rewards
const referralData = {
  referralCode: 'AHMED2024',
  referralLink: `https://sublimesdrive.com/invite/AHMED2024`,
  totalReferrals: 47,
  successfulReferrals: 34,
  pendingReferrals: 13,
  // Role-based rewards
  totalXPEarned: currentUser.role !== 'garage-owner' ? 170 : 0, // 34 successful * 5 XP (for car-owner/browser)
  pendingXP: currentUser.role !== 'garage-owner' ? 65 : 0, // 13 pending * 5 XP (for car-owner/browser)
  totalBidCredits: currentUser.role === 'garage-owner' ? 34 : 0, // Free bid credits for garage owners
  pendingBidCredits: currentUser.role === 'garage-owner' ? 13 : 0,
  rewardPerReferral: currentUser.role !== 'garage-owner' ? '5 XP' : '1 Free Bid Credit',
  recentReferrals: [
    {
      id: '1',
      name: 'Omar Abdullah',
      role: 'car-owner',
      badgeType: 'green',
      badgeIcon: '🛡️',
      badgeColor: 'text-green-500',
      status: 'completed',
      joinDate: '2024-01-15',
      reward: currentUser.role !== 'garage-owner' ? '5 XP' : '1 Bid Credit',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face'
    }
  ]
};

interface ProfilePageProps {
  onNavigate?: (page: string) => void;
}

export function ProfilePage({ onNavigate }: ProfilePageProps = {}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showLegalHub, setShowLegalHub] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const earnedBadges = userBadges.filter(badge => badge.earned);
  const unearnedBadges = userBadges.filter(badge => !badge.earned);

  // Handler functions
  const handleEditCover = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          // Update cover image - in real app, upload to server
          console.log('New cover image:', imageUrl);
          // You would update the user profile here
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleMessageUser = () => {
    // Check if both users are verified car owners
    if (currentUser.role === 'car-owner' && currentUser.verified) {
      // Navigate to chat page or open messaging
      console.log('Opening message dialog...');
      // In real app: onNavigate('chat') or open modal
    } else {
      alert('Only verified car owners can message each other.');
    }
  };

  // Use mobile version on mobile devices
  if (isMobile) {
    return <MobileProfilePage onNavigate={onNavigate} />;
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Cover Image & Profile Header */}
      <div className="relative">
        <div className="h-32 sm:h-48 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
          <ImageWithFallback 
            src={userProfile.coverImage}
            alt="Cover"
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute top-4 right-4">
            <Button variant="secondary" size="sm" onClick={handleEditCover}>
              <Camera className="h-4 w-4 mr-2" />
              Edit Cover
            </Button>
          </div>
        </div>
        
        <div className="px-4 sm:px-6 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-12 sm:-mt-16">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-background">
                <AvatarImage src={userProfile.avatar} />
                <AvatarFallback>AH</AvatarFallback>
              </Avatar>
              
              <div className="pb-0 sm:pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold">{userProfile.name}</h1>
                  {userProfile.verified && (
                    <Badge className="bg-[var(--sublimes-gold)] text-black">
                      <Star className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground mb-2">{userProfile.username}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {userProfile.location}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Joined {userProfile.joinDate}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4 sm:mt-0">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              {/* Only show message button for verified car owners */}
              {currentUser.role === 'car-owner' && currentUser.verified && (
                <Button variant="outline" size="sm" onClick={() => handleMessageUser()}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message
                </Button>
              )}
              <Button size="sm" onClick={() => setShowEditProfile(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>
          
          {/* Bio */}
          {userProfile.bio && (
            <div className="mt-4">
              <p className="text-foreground max-w-2xl">{userProfile.bio}</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 sm:px-6 mb-6">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-4">
          <Card className="text-center">
            <CardContent className="p-3 sm:p-4">
              <div className="text-lg sm:text-2xl font-bold">{userProfile.stats.posts}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Posts</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-3 sm:p-4">
              <div className="text-lg sm:text-2xl font-bold">{userProfile.stats.followers.toLocaleString()}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Followers</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-3 sm:p-4">
              <div className="text-lg sm:text-2xl font-bold">{userProfile.stats.following}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Following</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-3 sm:p-4">
              <div className="text-lg sm:text-2xl font-bold">{userProfile.stats.garageVisits}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Garages</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-3 sm:p-4">
              <div className="text-lg sm:text-2xl font-bold">{userProfile.stats.meetupsAttended}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Meetups</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-3 sm:p-4">
              <div className="text-lg sm:text-2xl font-bold">{userProfile.stats.carsOwned}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Cars</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs Content */}
      <div className="px-4 sm:px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1">
            <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 py-2">Overview</TabsTrigger>
            <TabsTrigger value="badges" className="text-xs sm:text-sm px-2 py-2">Badges</TabsTrigger>
            <TabsTrigger value="achievements" className="text-xs sm:text-sm px-2 py-2">Goals</TabsTrigger>
            <TabsTrigger value="activity" className="text-xs sm:text-sm px-2 py-2">Activity</TabsTrigger>
            <TabsTrigger value="favorites" className="text-xs sm:text-sm px-2 py-2">My Fav</TabsTrigger>
            <TabsTrigger value="referral" className="text-xs sm:text-sm px-2 py-2">Referral</TabsTrigger>
            <TabsTrigger value="service-log" className="text-xs sm:text-sm px-2 py-2">Service</TabsTrigger>
            <TabsTrigger value="legal" className="text-xs sm:text-sm px-2 py-2">Legal</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6 space-y-6">
            {/* XP Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-[var(--sublimes-gold)]" />
                  Level Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-2xl font-bold">Level {userProfile.level}</div>
                    <div className="text-sm text-muted-foreground">{userProfile.xp} / {userProfile.nextLevelXp} XP</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-[var(--sublimes-gold)]">
                      {userProfile.nextLevelXp - userProfile.xp} XP to next level
                    </div>
                    <div className="text-sm text-muted-foreground">Keep earning XP!</div>
                  </div>
                </div>
                <Progress value={(userProfile.xp / userProfile.nextLevelXp) * 100} className="h-3" />
              </CardContent>
            </Card>

            {/* My Vehicle Service Log Card */}
            <Card className="border-2 border-dashed border-[var(--sublimes-border)] bg-gradient-to-r from-[var(--sublimes-gold)]/5 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-[var(--sublimes-gold)]" />
                  My Vehicle Service Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Keep a private log of your car's maintenance history and get timely reminders for upcoming services.
                </p>
                <Button 
                  onClick={() => setActiveTab('service-log')}
                  variant="outline"
                  className="w-full border-[var(--sublimes-gold)] text-[var(--sublimes-gold)] hover:bg-[var(--sublimes-gold)] hover:text-black"
                >
                  View My Service Log
                </Button>
              </CardContent>
            </Card>

            {/* Recent Badges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Recent Badges
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('badges')}>
                    View All
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {earnedBadges.slice(0, 4).map((badge) => (
                    <div key={badge.id} className="text-center">
                      <div className={`w-16 h-16 rounded-full ${getRarityColor(badge.rarity)} flex items-center justify-center text-2xl mx-auto mb-2`}>
                        {badge.icon}
                      </div>
                      <div className="text-sm font-medium">{badge.name}</div>
                      <div className="text-xs text-muted-foreground">{badge.earnedDate}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Active Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Active Goals
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('achievements')}>
                    View All
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {achievements.slice(0, 2).map((achievement) => (
                  <div key={achievement.id}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{achievement.title}</h4>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      </div>
                      <Badge variant="outline">{achievement.category}</Badge>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{achievement.progress} / {achievement.maxProgress}</span>
                      <span className="text-[var(--sublimes-gold)]">{achievement.reward}</span>
                    </div>
                    <Progress value={(achievement.progress / achievement.maxProgress) * 100} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="badges" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Earned Badges ({earnedBadges.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                    {earnedBadges.map((badge) => (
                      <div key={badge.id} className="text-center">
                        <div className={`w-20 h-20 rounded-full ${getRarityColor(badge.rarity)} flex items-center justify-center text-3xl mx-auto mb-3`}>
                          {badge.icon}
                        </div>
                        <h4 className="font-medium mb-1">{badge.name}</h4>
                        <p className="text-xs text-muted-foreground mb-2">{badge.description}</p>
                        <Badge variant="outline" className="text-xs">
                          {badge.earnedDate}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="achievements" className="mt-6">
            <div className="space-y-4">
              {achievements.map((achievement) => (
                <Card key={achievement.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{achievement.title}</h3>
                        <p className="text-muted-foreground">{achievement.description}</p>
                      </div>
                      <Badge variant="outline">{achievement.category}</Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress: {achievement.progress} / {achievement.maxProgress}</span>
                        <span className="text-[var(--sublimes-gold)]">{achievement.reward}</span>
                      </div>
                      <Progress value={(achievement.progress / achievement.maxProgress) * 100} className="h-3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="activity" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={activity.id}>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--sublimes-gold)] flex items-center justify-center flex-shrink-0">
                          {activity.type === 'post' && '📝'}
                          {activity.type === 'meetup' && '🚗'}
                          {activity.type === 'garage' && '🔧'}
                          {activity.type === 'achievement' && '🏆'}
                        </div>
                        <div className="flex-1">
                          <p>{activity.action}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{activity.timestamp}</span>
                            <span className="text-[var(--sublimes-gold)]">+{activity.xpGained} XP</span>
                          </div>
                        </div>
                      </div>
                      {index < recentActivity.length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favorites" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
                  <p className="text-muted-foreground">Start liking posts, cars, and garages to see them here!</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="referral" className="mt-6">
            <div className="space-y-6">
              {/* Role-Based Referral Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="text-center">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-[var(--sublimes-gold)]">{referralData.totalReferrals}</div>
                    <div className="text-sm text-muted-foreground">Total Referrals</div>
                  </CardContent>
                </Card>
                <Card className="text-center">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-500">{referralData.successfulReferrals}</div>
                    <div className="text-sm text-muted-foreground">Successful</div>
                  </CardContent>
                </Card>
                <Card className="text-center">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-orange-500">{referralData.pendingReferrals}</div>
                    <div className="text-sm text-muted-foreground">Pending</div>
                  </CardContent>
                </Card>
                <Card className="text-center">
                  <CardContent className="p-4">
                    {currentUser.role !== 'garage-owner' ? (
                      <>
                        <div className="text-2xl font-bold text-[var(--sublimes-gold)]">{referralData.totalXPEarned} XP</div>
                        <div className="text-sm text-muted-foreground">Total XP Earned</div>
                      </>
                    ) : (
                      <>
                        <div className="text-2xl font-bold text-[var(--sublimes-gold)]">{referralData.totalBidCredits}</div>
                        <div className="text-sm text-muted-foreground">Free Bid Credits</div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Referral Link & Code */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5 text-[var(--sublimes-gold)]" />
                    Share & Earn Rewards
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Referral Link */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Your Referral Link</label>
                    <div className="bg-card/50 p-3 rounded-lg border border-[var(--sublimes-border)] space-y-3">
                      <div className="text-sm font-mono text-[var(--sublimes-gold)] break-all overflow-hidden">
                        {referralData.referralLink}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Direct signup link - they don't need to enter a code!
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Link
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Referral Code */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Or Share Your Code</label>
                    <div className="bg-card/50 p-3 rounded-lg border-2 border-dashed border-[var(--sublimes-gold)] space-y-3">
                      <div className="text-xl font-mono font-bold text-[var(--sublimes-gold)]">{referralData.referralCode}</div>
                      <p className="text-xs text-muted-foreground">
                        Friends can enter this code during signup
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Code
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share Code
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="service-log" className="mt-6">
            <ServiceLogPage />
          </TabsContent>

          <TabsContent value="legal" className="mt-6">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Legal & Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    <Button 
                      variant="outline" 
                      className="justify-start h-auto p-4"
                      onClick={() => onNavigate('legal-hub')}
                    >
                      <div className="flex items-center space-x-3 w-full">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                          <HelpCircle className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="text-left flex-1">
                          <div className="font-medium">FAQ & Help</div>
                          <div className="text-sm text-muted-foreground">Get help and find answers</div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </Button>

                    <Button 
                      variant="outline" 
                      className="justify-start h-auto p-4"
                      onClick={() => onNavigate('terms-of-service')}
                    >
                      <div className="flex items-center space-x-3 w-full">
                        <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-green-500" />
                        </div>
                        <div className="text-left flex-1">
                          <div className="font-medium">Terms of Service</div>
                          <div className="text-sm text-muted-foreground">Our terms and conditions</div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </Button>

                    <Button 
                      variant="outline" 
                      className="justify-start h-auto p-4"
                      onClick={() => onNavigate('privacy-policy')}
                    >
                      <div className="flex items-center space-x-3 w-full">
                        <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                          <Shield className="w-5 h-5 text-purple-500" />
                        </div>
                        <div className="text-left flex-1">
                          <div className="font-medium">Privacy & Cookie Policy</div>
                          <div className="text-sm text-muted-foreground">How we protect your data</div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </Button>

                    <Button 
                      variant="outline" 
                      className="justify-start h-auto p-4"
                      onClick={() => onNavigate('refund-policy')}
                    >
                      <div className="flex items-center space-x-3 w-full">
                        <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                          <RefreshCw className="w-5 h-5 text-orange-500" />
                        </div>
                        <div className="text-left flex-1">
                          <div className="font-medium">Refund Policy</div>
                          <div className="text-sm text-muted-foreground">Information about refunds</div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </Button>

                    <Button 
                      variant="outline" 
                      className="justify-start h-auto p-4"
                      onClick={() => onNavigate('about-us')}
                    >
                      <div className="flex items-center space-x-3 w-full">
                        <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-indigo-500" />
                        </div>
                        <div className="text-left flex-1">
                          <div className="font-medium">About Us</div>
                          <div className="text-sm text-muted-foreground">Learn about Sublimes Drive</div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Support
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Email Support:</span>
                      <span className="text-[var(--sublimes-gold)]">support@sublimesdrive.com</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="text-[var(--sublimes-gold)]">+971 50 353 0121</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Response Time:</span>
                      <span className="text-green-500">Within 24h</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        onSave={(profileData) => {
          console.log('Saving profile data:', profileData);
          // Handle profile save logic here
        }}
      />
    </div>
  );
}