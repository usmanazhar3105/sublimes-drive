import { useState, useEffect } from 'react';
import { PostCard } from './PostCard';
import { TrendingTopics } from './TrendingTopics';
import { DailyChallengeCard } from './DailyChallengeCard';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Sparkles, Star, Search, Users, Plus, Tag, Filter, ChevronDown, RefreshCw } from 'lucide-react';
import { DailyChallenge, getTodaysChallenges, getRandomChallenge, generateTodaysChallenges } from '../utils/dailyChallenges';
import { toast } from 'sonner';
import { useCommunityPosts } from '../hooks/useCommunities';

interface CommunitiesPageProps {
  onNavigate?: (page: string) => void;
}

export function CommunitiesPage({ onNavigate }: CommunitiesPageProps = {}) {
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState('');
  const [selectedUrgency, setSelectedUrgency] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([]);
  const [currentChallenge, setCurrentChallenge] = useState<DailyChallenge | null>(null);
  
  // 🔥 REAL DATA FROM DATABASE (not mock)
  const { posts, loading, createPost, likePost, commentOnPost, refetch } = useCommunityPosts();

  // Initialize daily challenges on component mount
  useEffect(() => {
    // Generate initial daily challenges
    const initialChallenges = generateTodaysChallenges();
    setDailyChallenges(initialChallenges);
    
    // Set the first challenge as current
    if (initialChallenges.length > 0) {
      setCurrentChallenge(initialChallenges[0]);
    }
  }, []);

  // Refresh challenges function
  const refreshChallenges = () => {
    const newChallenges = generateTodaysChallenges();
    setDailyChallenges(newChallenges);
    
    // Get a random challenge from the new set
    const randomChallenge = getRandomChallenge(newChallenges);
    setCurrentChallenge(randomChallenge);
    
    toast.success('Daily challenges refreshed!');
  };

  const popularTags = [
    { id: 'adventure', label: 'adventure' },
    { id: 'dubai', label: 'dubai' },
    { id: 'meetup', label: 'meetup' },
    { id: 'official', label: 'official' },
    { id: 'photography', label: 'photography' },
    { id: 'ras-al-khaimah', label: 'ras-al-khaimah' }
  ];

  const trendingTopics = [
    { period: 'Today', active: true },
    { period: 'Week', active: false },
    { period: 'Month', active: false }
  ];

  // ✅ REMOVED MOCK DATA - Using real database data from useCommunityPosts hook
  const samplePosts_LEGACY_BACKUP = [
    {
      postId: 'post_001',
      postType: 'poll' as const,
      user: {
        name: 'BYD Expert',
        username: 'byd_expert_uae',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        role: 'admin' as const,
        verified: true,
        isUrgent: false
      },
      content: {
        text: "Help us understand the community preferences! Your vote will help shape our future content and events. 🗳️",
        timestamp: '2h ago'
      },
      poll: {
        question: "Which Chinese EV brand offers the best value for money in UAE?",
        options: [
          { id: '1', text: 'BYD', votes: 45, percentage: 42.1 },
          { id: '2', text: 'NIO', votes: 32, percentage: 29.9 },
          { id: '3', text: 'XPeng', votes: 18, percentage: 16.8 },
          { id: '4', text: 'Li Auto', votes: 12, percentage: 11.2 }
        ],
        totalVotes: 107,
        userVotes: ['1'],
        allowMultipleChoice: false,
        endsAt: 'in 22h',
        hasEnded: false
      },
      engagement: {
        likes: 67,
        comments: 23,
        shares: 12,
        views: 1456
      },
      isLiked: true,
      isSaved: false
    },
    {
      postId: 'post_002',
      user: {
        name: 'Anonymous',
        username: 'anonymous',
        avatar: '',
        role: 'car-owner' as const,
        verified: false,
        isUrgent: true,
        isAnonymous: true
      },
      content: {
        text: "🚨 URGENT: Need advice on BYD Han brake issues! 🚨\n\nBrought my 2023 BYD Han to the dealer and they're saying it needs AED 3,500 worth of brake work. This seems excessive for a car that's barely 8 months old!\n\nHas anyone else experienced brake issues with their BYD Han? What was your experience with warranty claims?",
        tags: ['BYDHan', 'BrakeIssues', 'WarrantyClaim', 'UAECars'],
        mentions: ['byd_expert_uae', 'li_auto_service_dubai'],
        timestamp: '4h ago'
      },
      engagement: {
        likes: 156,
        comments: 42,
        shares: 28,
        views: 2834
      },
      isLiked: false,
      isSaved: true
    },
    {
      postId: 'post_003',
      user: {
        name: 'Zhang Wei',
        username: 'nio_enthusiast_dubai',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
        role: 'car-owner' as const,
        verified: true,
        isUrgent: false
      },
      content: {
        title: "NIO ET7 Road Trip: Dubai to Fujairah",
        text: "Just completed an amazing road trip in my NIO ET7 from Dubai to Fujairah! 🚗⚡\n\nTrip highlights:\n🔋 Started with 95% battery\n📍 Total distance: 320km round trip\n⚡ Used one battery swap in Fujairah\n🎯 Arrived back with 40% remaining\n\nThe battery swap experience was incredible - faster than filling up with petrol! The mountain roads were perfect for testing the ET7's handling. The adaptive air suspension made the winding roads feel like a dream.\n\nWho's interested in a NIO owners road trip meetup? 🏔️",
        images: [
          'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&h=400&fit=crop',
          'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600&h=400&fit=crop'
        ],
        tags: ['NIOET7', 'RoadTrip', 'BatterySwap', 'ElectricCars', 'UAE'],
        mentions: ['nio_uae_official'],
        timestamp: '6h ago'
      },
      engagement: {
        likes: 234,
        comments: 56,
        shares: 34,
        views: 4567
      },
      isLiked: false,
      isSaved: false
    },
    {
      postId: 'post_004',
      postType: 'poll' as const,
      user: {
        name: 'XPeng Community',
        username: 'xpeng_uae_official',
        avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=40&h=40&fit=crop&crop=face',
        role: 'editor' as const,
        verified: true,
        isUrgent: false
      },
      content: {
        text: "Planning our next community event! We want to make sure we're organizing something everyone will enjoy. Multiple choices allowed! 🎉",
        timestamp: '8h ago'
      },
      poll: {
        question: "What type of XPeng community events would you like to attend?",
        options: [
          { id: '1', text: 'Track Day Experience', votes: 28, percentage: 35.0 },
          { id: '2', text: 'Tech Workshop (NGP, OTA updates)', votes: 22, percentage: 27.5 },
          { id: '3', text: 'Photography Meetup', votes: 18, percentage: 22.5 },
          { id: '4', text: 'Family Fun Day', votes: 12, percentage: 15.0 }
        ],
        totalVotes: 80,
        userVotes: ['1', '2'],
        allowMultipleChoice: true,
        endsAt: 'in 16h',
        hasEnded: false
      },
      engagement: {
        likes: 89,
        comments: 34,
        shares: 19,
        views: 1678
      },
      isLiked: true,
      isSaved: true
    },
    {
      postId: 'post_005',
      user: {
        name: 'Li Auto Service Center',
        username: 'li_auto_service_dubai',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=40&h=40&fit=crop&crop=face',
        role: 'garage-owner' as const,
        verified: true,
        isUrgent: false
      },
      content: {
        title: "Li Auto L9 Maintenance Tips",
        text: "🔧 Essential Li Auto L9 maintenance tips for UAE conditions:\n\n🌡️ **Hot Weather Care:**\n• Check coolant levels monthly\n• Park in shade when possible\n• Use sun shades for interior protection\n\n🔋 **Battery Health:**\n• Avoid charging to 100% daily (80% is optimal)\n• Use scheduled charging during cooler hours\n• Keep battery between 20-80% for longevity\n\n🛠️ **Regular Checks:**\n• Tire pressure (check weekly in summer)\n• Air filter replacement every 6 months\n• Software updates - always keep current\n\nOur service center offers free battery health checks for Li Auto owners. Book your appointment today! 📞",
        images: [
          'https://images.unsplash.com/photo-1718824331840-399943ff5c1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhsdXh1cnklMjBjYXIlMjBnYXJhZ2UlMjB3b3Jrc2hvcHxlbnwxfHx8fDE3NTg1NDQzMDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
        ],
        tags: ['LiAuto', 'L9', 'MaintenanceTips', 'UAEService', 'HybridCars'],
        timestamp: '1d ago'
      },
      engagement: {
        likes: 178,
        comments: 67,
        shares: 45,
        views: 3245
      },
      isLiked: false,
      isSaved: false
    },
    {
      postId: 'post_006',
      user: {
        name: 'Geely Enthusiast',
        username: 'geely_fan_emirates',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face',
        role: 'car-owner' as const,
        verified: true,
        isUrgent: false
      },
      content: {
        title: "Geely Coolray vs Haval H6: Real Owner Comparison",
        text: "After owning both vehicles, here's my honest comparison for those deciding between these popular Chinese SUVs in UAE:\n\n**Geely Coolray (owned for 18 months):**\n✅ Excellent fuel efficiency (6.2L/100km)\n✅ Smooth CVT transmission\n✅ Great tech features for the price\n❌ Road noise at highway speeds\n❌ Limited rear seat space\n\n**Haval H6 (current vehicle, 8 months):**\n✅ Spacious interior\n✅ Superior build quality\n✅ Better highway stability\n❌ Higher fuel consumption (8.1L/100km)\n❌ DCT transmission can be jerky in traffic\n\n**Verdict:** Coolray for city driving, H6 for families and highway cruising.\n\nWhich one would you choose? 🤔",
        images: [
          'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&h=400&fit=crop'
        ],
        tags: ['GeelyVsHaval', 'ChineseCars', 'SUV', 'UAEReview', 'CarComparison'],
        mentions: ['geely_uae_official', 'haval_uae'],
        timestamp: '12h ago'
      },
      engagement: {
        likes: 145,
        comments: 38,
        shares: 22,
        views: 2156
      },
      isLiked: false,
      isSaved: true
    }
  ];

  const handlePostInteraction = (type: 'like' | 'comment' | 'share' | 'save' | 'report' | 'vote', postId: string, data?: any) => {
    console.log(`${type} action on post ${postId}`, data);
    
    switch (type) {
      case 'like':
        console.log(`Post ${postId} liked`);
        break;
      case 'comment':
        console.log(`Opening comments for post ${postId}`);
        break;
      case 'share':
        console.log(`Post ${postId} shared`);
        break;
      case 'save':
        console.log(`Post ${postId} saved`);
        break;
      case 'report':
        console.log(`Post ${postId} reported`);
        break;
      case 'vote':
        console.log(`Vote cast on poll ${postId}:`, data);
        break;
      default:
        console.log(`Unknown action: ${type}`);
    }
    
    // Here you would typically update the backend and local state
  };

  // Filter posts based on search and filters
  const filteredPosts = samplePosts.filter(post => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesText = post.content.text.toLowerCase().includes(query);
      const matchesUsername = post.user.username.toLowerCase().includes(query);
      const matchesTags = post.content.tags?.some(tag => tag.toLowerCase().includes(query)) || false;
      
      if (!matchesText && !matchesUsername && !matchesTags) {
        return false;
      }
    }

    // Brand filter
    if (selectedBrand && selectedBrand !== 'all') {
      const brandMatches = post.content.text.toLowerCase().includes(selectedBrand.toLowerCase()) ||
                          post.content.tags?.some(tag => tag.toLowerCase().includes(selectedBrand.toLowerCase())) || false;
      if (!brandMatches) {
        return false;
      }
    }

    // Urgency filter
    if (selectedUrgency && selectedUrgency !== 'all') {
      if (selectedUrgency === 'urgent' && !post.user.isUrgent) {
        return false;
      }
      if (selectedUrgency === 'normal' && post.user.isUrgent) {
        return false;
      }
    }

    // Tags filter
    if (selectedTags && selectedTags !== 'all') {
      const hasTag = post.content.tags?.some(tag => 
        tag.toLowerCase().includes(selectedTags.toLowerCase())
      ) || false;
      if (!hasTag) {
        return false;
      }
    }

    return true;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedBrand('all');
    setSelectedTags('');
    setSelectedUrgency('');
  };

  return (
    <div className="flex-1">
      {/* Mobile Header */}
      <div className="md:hidden bg-card border-b border-border p-3">
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-blue-400">Communities</h1>
            <p className="text-xs text-muted-foreground">Connect with fellow car enthusiasts</p>
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0">
            <div className="flex gap-1">
              <Button 
                variant="outline"
                size="sm"
                onClick={() => onNavigate?.('profile')}
                className="text-xs px-2"
              >
                <Users className="h-3 w-3 mr-1" />
                Posts
              </Button>
              <Button 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700 text-xs px-2"
              >
                <Plus className="h-3 w-3 mr-1" />
                Create
              </Button>
            </div>
            <Button 
              size="sm" 
              className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/80 text-xs px-2 w-full"
              onClick={() => onNavigate?.('leaderboard')}
            >
              <Star className="h-3 w-3 mr-1" />
              Leaderboard
            </Button>
          </div>
        </div>



        {/* Today's Challenge - Mobile - Compact */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 mb-3">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="bg-white/20 rounded-lg p-1.5">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-sm">Today's Challenge</h3>
                  <p className="text-xs opacity-90">
                    {currentChallenge ? currentChallenge.title : 'Loading challenge...'}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button 
                  variant="secondary" 
                  size="sm"
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-xs px-2"
                  onClick={() => toast.success('Challenge accepted! Create a post to participate.')}
                >
                  Post
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm"
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-xs px-1"
                  onClick={refreshChallenges}
                  title="Refresh challenges"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Filters - Compact */}
        <div className="space-y-2 overflow-hidden">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/50 h-9 w-full"
            />
          </div>

          {/* Stacked Filters for Mobile */}
          <div className="grid grid-cols-2 gap-2">
            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger className="bg-muted/50 h-9 text-xs w-full">
                <SelectValue placeholder="All Brands" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                <SelectItem value="all">All Brands</SelectItem>
                <SelectItem value="byd">BYD</SelectItem>
                <SelectItem value="hongqi">Hongqi</SelectItem>
                <SelectItem value="bestune">Bestune</SelectItem>
                <SelectItem value="mg">MG</SelectItem>
                <SelectItem value="haval">Haval</SelectItem>
                <SelectItem value="foton">Foton</SelectItem>
                <SelectItem value="geely">Geely</SelectItem>
                <SelectItem value="xpeng">Xpeng</SelectItem>
                <SelectItem value="jaecoo">Jaecoo</SelectItem>
                <SelectItem value="zeekr">Zeekr</SelectItem>
                <SelectItem value="jetour">Jetour</SelectItem>
                <SelectItem value="jac">Jac</SelectItem>
                <SelectItem value="gac">GAC</SelectItem>
                <SelectItem value="baic">BAIC</SelectItem>
                <SelectItem value="great-wall">Great Wall</SelectItem>
                <SelectItem value="chery">Chery</SelectItem>
                <SelectItem value="skywell">Skywell</SelectItem>
                <SelectItem value="riddara">Riddara</SelectItem>
                <SelectItem value="nio">NIO</SelectItem>
                <SelectItem value="tank">Tank</SelectItem>
                <SelectItem value="roewe">Roewe</SelectItem>
                <SelectItem value="li-auto">Li Auto</SelectItem>
                <SelectItem value="kaiyi">Kaiyi</SelectItem>
                <SelectItem value="dongfeng">Dongfeng</SelectItem>
                <SelectItem value="omoda">Omoda</SelectItem>
                <SelectItem value="soueast">Soueast</SelectItem>
                <SelectItem value="vgv">VGV</SelectItem>
                <SelectItem value="seres">Seres</SelectItem>
                <SelectItem value="avatr">Avatr</SelectItem>
                <SelectItem value="forthing">Forthing</SelectItem>
                <SelectItem value="changan">Changan</SelectItem>
                <SelectItem value="maxus">Maxus</SelectItem>
                <SelectItem value="exeed">Exeed</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedTags} onValueChange={setSelectedTags}>
              <SelectTrigger className="bg-black text-white h-9 text-xs w-full">
                <Tag className="h-3 w-3 mr-1" />
                <span>Tags</span>
              </SelectTrigger>
              <SelectContent>
                <div className="p-3">
                  <div className="text-sm font-medium mb-2">Popular tags:</div>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.map((tag) => (
                      <Badge 
                        key={tag.id}
                        variant="outline" 
                        className="cursor-pointer hover:bg-muted text-xs"
                        onClick={() => setSelectedTags(tag.id)}
                      >
                        {tag.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Select value={selectedUrgency} onValueChange={setSelectedUrgency}>
              <SelectTrigger className="bg-muted/50 h-9 text-xs w-full">
                <SelectValue placeholder="All Urgency..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">✓ All Urgency Levels</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="important">Important</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="ghost" size="sm" className="text-blue-400 h-9 text-xs w-full">
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-blue-400">Communities</h1>
            <p className="text-muted-foreground">Connect with fellow car enthusiasts</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => onNavigate?.('profile')}
            >
              <Users className="h-4 w-4 mr-2" />
              My Posts
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
            <Button 
              className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/80"
              onClick={() => onNavigate?.('leaderboard')}
            >
              <Star className="h-4 w-4 mr-2" />
              Leaderboard
            </Button>
          </div>
        </div>

        {/* Desktop Today's Challenge */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 rounded-lg p-2">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Today's Challenge</h3>
                  <p className="text-sm opacity-90">
                    {currentChallenge ? currentChallenge.description : 'Loading challenge...'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="secondary" 
                  size="sm"
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                  onClick={() => toast.success('Challenge accepted! Create a post to participate.')}
                >
                  Post
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm"
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                  onClick={refreshChallenges}
                  title="Refresh challenges"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Desktop Filters */}
        <div className="mb-6 space-y-4">
          {/* Search and Main Filters */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card"
              />
            </div>
            
            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger className="w-40 bg-card">
                <SelectValue placeholder="All Brands" />
                <ChevronDown className="h-4 w-4" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                <SelectItem value="all">All Brands</SelectItem>
                <SelectItem value="byd">BYD</SelectItem>
                <SelectItem value="hongqi">Hongqi</SelectItem>
                <SelectItem value="bestune">Bestune</SelectItem>
                <SelectItem value="mg">MG</SelectItem>
                <SelectItem value="haval">Haval</SelectItem>
                <SelectItem value="foton">Foton</SelectItem>
                <SelectItem value="geely">Geely</SelectItem>
                <SelectItem value="xpeng">Xpeng</SelectItem>
                <SelectItem value="jaecoo">Jaecoo</SelectItem>
                <SelectItem value="zeekr">Zeekr</SelectItem>
                <SelectItem value="jetour">Jetour</SelectItem>
                <SelectItem value="jac">Jac</SelectItem>
                <SelectItem value="gac">GAC</SelectItem>
                <SelectItem value="baic">BAIC</SelectItem>
                <SelectItem value="great-wall">Great Wall</SelectItem>
                <SelectItem value="chery">Chery</SelectItem>
                <SelectItem value="skywell">Skywell</SelectItem>
                <SelectItem value="riddara">Riddara</SelectItem>
                <SelectItem value="nio">NIO</SelectItem>
                <SelectItem value="tank">Tank</SelectItem>
                <SelectItem value="roewe">Roewe</SelectItem>
                <SelectItem value="li-auto">Li Auto</SelectItem>
                <SelectItem value="kaiyi">Kaiyi</SelectItem>
                <SelectItem value="dongfeng">Dongfeng</SelectItem>
                <SelectItem value="omoda">Omoda</SelectItem>
                <SelectItem value="soueast">Soueast</SelectItem>
                <SelectItem value="vgv">VGV</SelectItem>
                <SelectItem value="seres">Seres</SelectItem>
                <SelectItem value="avatr">Avatr</SelectItem>
                <SelectItem value="forthing">Forthing</SelectItem>
                <SelectItem value="changan">Changan</SelectItem>
                <SelectItem value="maxus">Maxus</SelectItem>
                <SelectItem value="exeed">Exeed</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedTags} onValueChange={setSelectedTags}>
              <SelectTrigger className="w-32 bg-black text-white">
                <Tag className="h-4 w-4" />
              </SelectTrigger>
              <SelectContent>
                <div className="p-3">
                  <div className="text-sm font-medium mb-2">Popular tags:</div>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.map((tag) => (
                      <Badge 
                        key={tag.id}
                        variant="outline" 
                        className="cursor-pointer hover:bg-muted"
                        onClick={() => setSelectedTags(tag.id)}
                      >
                        {tag.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </SelectContent>
            </Select>

            <Select value={selectedUrgency} onValueChange={setSelectedUrgency}>
              <SelectTrigger className="w-40 bg-card">
                <SelectValue placeholder="All Urgency Levels" />
                <ChevronDown className="h-4 w-4" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">✓ All Urgency Levels</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="important">Important</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="ghost" className="text-blue-400">
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-4">{/* Content Container */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-4">
            {filteredPosts.map((post, index) => (
              <PostCard 
                key={index} 
                {...post} 
                onInteraction={handlePostInteraction}
              />
            ))}
            
            {filteredPosts.length === 0 && (searchQuery || selectedBrand !== 'all' || selectedTags || selectedUrgency) && (
              <div className="text-center py-12">
                <div className="text-lg font-semibold mb-2">No posts found</div>
                <div className="text-muted-foreground mb-4">
                  Try adjusting your search terms or filters
                </div>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
            
            {/* Load More */}
            <div className="text-center py-4">
              <Button variant="outline">Load More Posts</Button>
            </div>
          </div>

          {/* Trending Topics Sidebar - Desktop Only */}
          <div className="hidden lg:block space-y-4">
            {/* Trending Topics */}
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-card-foreground flex items-center">
                    🔥 Trending Topics
                  </h3>
                </div>
                
                {/* Period Selector */}
                <div className="flex gap-1 mb-4">
                  {trendingTopics.map((topic) => (
                    <Button
                      key={topic.period}
                      variant={topic.active ? "default" : "ghost"}
                      size="sm"
                      className={topic.active ? "bg-[var(--sublimes-gold)] text-black" : ""}
                    >
                      ⭐ {topic.period}
                    </Button>
                  ))}
                </div>

                <div className="text-center text-muted-foreground py-8">
                  <div className="text-lg mb-2">No trends yet!</div>
                  <div className="text-sm">Start a conversation to get a topic trending.</div>
                </div>
              </CardContent>
            </Card>
            
            {/* Weekly Leaderboard */}
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center text-card-foreground">
                  <Star className="mr-2 h-5 w-5 text-[var(--sublimes-gold)]" />
                  Weekly Leaderboard
                </h3>
                <div className="space-y-3">
                  {[
                    { name: 'Ahmed Hassan', points: 2847, rank: 1 },
                    { name: 'Sarah Auto', points: 2156, rank: 2 },
                    { name: 'Mohammed Racing', points: 1934, rank: 3 },
                    { name: 'You', points: 1247, rank: 12 }
                  ].map((user) => (
                    <div key={user.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm w-6 ${
                          user.rank <= 3 ? 'text-[var(--sublimes-gold)]' : 'text-muted-foreground'
                        }`}>
                          #{user.rank}
                        </span>
                        <span className="text-sm text-card-foreground">{user.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{user.points} XP</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mobile Trending Topics */}
        <div className="md:hidden mt-6">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-card-foreground flex items-center">
                  🔥 Trending Topics
                </h3>
              </div>
              
              {/* Period Selector */}
              <div className="flex gap-1 mb-4">
                {trendingTopics.map((topic) => (
                  <Button
                    key={topic.period}
                    variant={topic.active ? "default" : "ghost"}
                    size="sm"
                    className={topic.active ? "bg-[var(--sublimes-gold)] text-black" : ""}
                  >
                    ⭐ {topic.period}
                  </Button>
                ))}
              </div>

              <div className="text-center text-muted-foreground py-8">
                <div className="text-lg mb-2">No trends yet!</div>
                <div className="text-sm">Start a conversation to get a topic trending.</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}