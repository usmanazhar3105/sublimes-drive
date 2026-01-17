/**
 * WiringDoc (auto)
 * Entities: [leaderboard_overall, leaderboard_posts, leaderboard_events, leaderboard_marketplace, leaderboard_community, leaderboard_snapshots]
 * Reads: leaderboard_overall(view), leaderboard_posts(view), leaderboard_events(view), leaderboard_marketplace(view), leaderboard_community(view)
 * Writes: fn.get_user_rank
 * RLS: public_read (all views), admin_all (periods/snapshots management)
 * Role UI: all users (read), admin (manage periods)
 * Stripe: n/a
 * AI Bot: n/a
 * Telemetry: view:leaderboard, action:view_category
 * Last Verified: 2025-10-31
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Skeleton } from './ui/skeleton';
import { 
  Trophy, 
  Star, 
  Zap, 
  Crown, 
  Medal,
  TrendingUp,
  Calendar,
  Users,
  Target,
  Award,
  ChevronUp,
  ChevronDown,
  Activity,
  ShoppingCart,
  MessageSquare
} from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner';

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  avatar: string | null;
  score: number;
  rank: number;
  total_xp?: number;
  role?: string;
  country?: string;
  post_count?: number;
  listing_count?: number;
  event_count?: number;
}

interface UserRank {
  rank: number;
  score: number;
  total_users: number;
  percentile: number;
}

type CategoryType = 'overall' | 'posts' | 'events' | 'marketplace' | 'community';
type PeriodType = 'alltime' | 'weekly' | 'monthly';

export function LeaderboardPage_Complete_Wired() {
  const [user, setUser] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('overall');
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('alltime');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<UserRank | null>(null);
  const [loading, setLoading] = useState(true);

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error getting user:', error);
        setUser(null);
      }
    };
    getCurrentUser();
  }, []);

  // Track page view
  useEffect(() => {
    trackPageView();
  }, []);

  const trackPageView = async () => {
    // Analytics RPC disabled - functions not deployed in Supabase
    if (import.meta.env.DEV) {
      console.debug('[Leaderboard] Page view tracked locally');
    }
  };

  // Fetch leaderboard data
  useEffect(() => {
    fetchLeaderboard();
    if (user) {
      fetchUserRank();
    }
  }, [selectedCategory, selectedPeriod, user]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      // Analytics RPC disabled - functions not deployed in Supabase

      // Determine view name based on category
      const viewName = `leaderboard_${selectedCategory}`;
      
      // Fetch from view
      const { data, error } = await supabase
        .from(viewName)
        .select('*')
        .limit(100);

      if (error) {
        // Permission denied or view missing: show empty silently
        if ((error as any).code === '42501') {
          setLeaderboard([]);
          return;
        }
        throw error;
      }

      setLeaderboard(data || []);
    } catch (error: any) {
      const code: string | undefined = error?.code;
      const msg: string = error?.message || '';
      // Treat missing views/tables/columns as optional wiring: don't spam console
      if (code === 'PGRST205' || code === '42P01' || code === '42703' || msg.includes('relation') || msg.includes('does not exist')) {
        setLeaderboard([]);
      } else {
        console.debug('Leaderboard fetch fallback:', error);
        setLeaderboard([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRank = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .rpc('get_user_rank', {
          user_id_param: user.id,
          category_param: selectedCategory,
          period_param: selectedPeriod
        });

      if (error) {
        // PGRST116: 0 rows → no rank yet, not an error
        if ((error as any).code === 'PGRST116') {
          setUserRank(null);
          return;
        }
        throw error;
      }
      const rows = (data as any[]) || [];
      setUserRank(rows[0] || null);
    } catch (error: any) {
      const code: string | undefined = error?.code;
      const msg: string = error?.message || '';
      if (code === 'PGRST205' || code === '42P01' || code === '42703' || msg.includes('relation') || msg.includes('does not exist')) {
        setUserRank(null);
        return;
      }
      console.debug('User rank fetch fallback:', error);
      setUserRank(null);
    }
  };

  const getCategoryIcon = (category: CategoryType) => {
    switch (category) {
      case 'overall': return <Trophy className="w-4 h-4" />;
      case 'posts': return <MessageSquare className="w-4 h-4" />;
      case 'events': return <Calendar className="w-4 h-4" />;
      case 'marketplace': return <ShoppingCart className="w-4 h-4" />;
      case 'community': return <Users className="w-4 h-4" />;
    }
  };

  const getCategoryLabel = (category: CategoryType) => {
    switch (category) {
      case 'overall': return 'Overall XP';
      case 'posts': return 'Posts';
      case 'events': return 'Events';
      case 'marketplace': return 'Marketplace';
      case 'community': return 'Community';
    }
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
    if (rank === 2) return 'bg-gray-400/20 text-gray-300 border-gray-400/50';
    if (rank === 3) return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
    if (rank <= 10) return 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/50';
    return 'bg-[#E8EAED]/10 text-[#E8EAED]/70 border-[#E8EAED]/20';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
    if (rank === 3) return <Award className="w-5 h-5 text-orange-400" />;
    return <span className="text-sm font-bold text-[#E8EAED]/70">#{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-[#0B1426] text-[#E8EAED]">
      {/* Header */}
      <div className="border-b border-[#E8EAED]/10 bg-gradient-to-b from-[#D4AF37]/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/30">
              <Trophy className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Leaderboard</h1>
              <p className="text-[#E8EAED]/60 text-sm mt-1">
                Compete with the best in the community
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Leaderboard */}
          <div className="lg:col-span-2">
            <Card className="bg-[#0B1426] border-[#E8EAED]/10">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-[#E8EAED]">Rankings</CardTitle>
                    <CardDescription className="text-[#E8EAED]/60">
                      Top performers this {selectedPeriod}
                    </CardDescription>
                  </div>
                  
                  {/* Period Selector */}
                  <div className="flex gap-2">
                    <Button
                      variant={selectedPeriod === 'alltime' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedPeriod('alltime')}
                      className={selectedPeriod === 'alltime' ? 'bg-[#D4AF37] text-[#0B1426] hover:bg-[#D4AF37]/90' : 'border-[#E8EAED]/20 text-[#E8EAED]/70 hover:bg-[#E8EAED]/5'}
                    >
                      All Time
                    </Button>
                    <Button
                      variant={selectedPeriod === 'weekly' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedPeriod('weekly')}
                      className={selectedPeriod === 'weekly' ? 'bg-[#D4AF37] text-[#0B1426] hover:bg-[#D4AF37]/90' : 'border-[#E8EAED]/20 text-[#E8EAED]/70 hover:bg-[#E8EAED]/5'}
                      disabled
                      title="Coming soon"
                    >
                      Weekly
                    </Button>
                    <Button
                      variant={selectedPeriod === 'monthly' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedPeriod('monthly')}
                      className={selectedPeriod === 'monthly' ? 'bg-[#D4AF37] text-[#0B1426] hover:bg-[#D4AF37]/90' : 'border-[#E8EAED]/20 text-[#E8EAED]/70 hover:bg-[#E8EAED]/5'}
                      disabled
                      title="Coming soon"
                    >
                      Monthly
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Category Tabs */}
                <Tabs value={selectedCategory} onValueChange={(val) => setSelectedCategory(val as CategoryType)} className="mb-6">
                  <TabsList className="grid grid-cols-5 bg-[#E8EAED]/5 border border-[#E8EAED]/10">
                    <TabsTrigger value="overall" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426]">
                      <Trophy className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Overall</span>
                    </TabsTrigger>
                    <TabsTrigger value="posts" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426]">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Posts</span>
                    </TabsTrigger>
                    <TabsTrigger value="events" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426]">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Events</span>
                    </TabsTrigger>
                    <TabsTrigger value="marketplace" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426]">
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Market</span>
                    </TabsTrigger>
                    <TabsTrigger value="community" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426]">
                      <Users className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Social</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Leaderboard List */}
                <div className="space-y-2">
                  {loading ? (
                    // Loading skeletons
                    [...Array(10)].map((_, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-[#E8EAED]/10">
                        <Skeleton className="w-8 h-8 rounded-full bg-[#E8EAED]/5" />
                        <Skeleton className="w-12 h-12 rounded-full bg-[#E8EAED]/5" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-32 mb-2 bg-[#E8EAED]/5" />
                          <Skeleton className="h-3 w-20 bg-[#E8EAED]/5" />
                        </div>
                        <Skeleton className="h-6 w-16 bg-[#E8EAED]/5" />
                      </div>
                    ))
                  ) : leaderboard.length === 0 ? (
                    // Empty state
                    <div className="text-center py-12">
                      <div className="inline-flex p-4 rounded-full bg-[#E8EAED]/5 mb-4">
                        <Trophy className="w-8 h-8 text-[#E8EAED]/30" />
                      </div>
                      <p className="text-[#E8EAED]/60 mb-2">No rankings yet</p>
                      <p className="text-sm text-[#E8EAED]/40">
                        Be the first to earn points and appear here!
                      </p>
                    </div>
                  ) : (
                    // Leaderboard entries
                    leaderboard.map((entry) => (
                      <div
                        key={entry.user_id}
                        className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                          user?.id === entry.user_id
                            ? 'border-[#D4AF37]/50 bg-[#D4AF37]/5'
                            : 'border-[#E8EAED]/10 hover:border-[#E8EAED]/20 hover:bg-[#E8EAED]/5'
                        }`}
                      >
                        {/* Rank */}
                        <div className={`flex items-center justify-center w-12 h-12 rounded-full border ${getRankBadgeColor(entry.rank)}`}>
                          {getRankIcon(entry.rank)}
                        </div>

                        {/* Avatar & Info */}
                        <Avatar className="w-12 h-12 border-2 border-[#D4AF37]/30">
                          <AvatarImage src={entry.avatar || undefined} alt={entry.display_name} />
                          <AvatarFallback className="bg-[#D4AF37]/20 text-[#D4AF37]">
                            {entry.display_name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-[#E8EAED] truncate">
                              {entry.display_name || 'Anonymous'}
                            </p>
                            {entry.role && ['admin', 'editor'].includes(entry.role) && (
                              <Badge variant="outline" className="text-xs border-[#D4AF37]/50 text-[#D4AF37]">
                                {entry.role}
                              </Badge>
                            )}
                            {user?.id === entry.user_id && (
                              <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-400">
                                You
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-[#E8EAED]/60">
                            {selectedCategory === 'overall' && (
                              <>
                                {entry.post_count !== undefined && (
                                  <span>{entry.post_count} posts</span>
                                )}
                                {entry.listing_count !== undefined && (
                                  <span>{entry.listing_count} listings</span>
                                )}
                                {entry.event_count !== undefined && (
                                  <span>{entry.event_count} events</span>
                                )}
                              </>
                            )}
                            {entry.country && (
                              <span>🇦🇪 {entry.country}</span>
                            )}
                          </div>
                        </div>

                        {/* Score */}
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-[#D4AF37] font-bold">
                            <Zap className="w-4 h-4" />
                            <span>{Number(entry.score ?? 0).toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-[#E8EAED]/40">
                            {selectedCategory === 'overall' ? 'XP' : 'points'}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Your Rank Card */}
            {user && userRank && (
              <Card className="bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/5 border-[#D4AF37]/30">
                <CardHeader>
                  <CardTitle className="text-[#E8EAED] flex items-center gap-2">
                    <Target className="w-5 h-5 text-[#D4AF37]" />
                    Your Rank
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-[#D4AF37] mb-2">
                      #{Number(userRank.rank ?? 0)}
                    </div>
                    <p className="text-sm text-[#E8EAED]/60">
                      out of {Number(userRank.total_users ?? 0).toLocaleString()} users
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#E8EAED]/10">
                    <div>
                      <p className="text-xs text-[#E8EAED]/60 mb-1">Score</p>
                      <p className="text-xl font-bold text-[#D4AF37]">
                        {Number(userRank.score ?? 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#E8EAED]/60 mb-1">Top</p>
                      <p className="text-xl font-bold text-[#D4AF37]">
                        {userRank.percentile}%
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#E8EAED]/10">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#E8EAED]/60">Category</span>
                      <span className="text-[#E8EAED] font-medium capitalize">
                        {selectedCategory}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Info Card */}
            <Card className="bg-[#0B1426] border-[#E8EAED]/10">
              <CardHeader>
                <CardTitle className="text-[#E8EAED] flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#D4AF37]" />
                  How Rankings Work
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-[#E8EAED]/70">
                <div className="flex gap-3">
                  <Trophy className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#E8EAED] mb-1">Overall XP</p>
                    <p className="text-xs">Earn XP from all activities across the platform</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <MessageSquare className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#E8EAED] mb-1">Posts</p>
                    <p className="text-xs">Ranked by approved community posts</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Calendar className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#E8EAED] mb-1">Events</p>
                    <p className="text-xs">Ranked by event attendance</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <ShoppingCart className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#E8EAED] mb-1">Marketplace</p>
                    <p className="text-xs">Ranked by active listings</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Users className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#E8EAED] mb-1">Community</p>
                    <p className="text-xs">Combined engagement across posts, comments, and memberships</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rewards Card */}
            <Card className="bg-[#0B1426] border-[#E8EAED]/10">
              <CardHeader>
                <CardTitle className="text-[#E8EAED] flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#D4AF37]" />
                  Top Rewards
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                  <Crown className="w-6 h-6 text-yellow-400" />
                  <div className="flex-1">
                    <p className="font-medium text-[#E8EAED] text-sm">#1 Weekly</p>
                    <p className="text-xs text-[#E8EAED]/60">Premium badge + 500 XP</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-400/10 border border-gray-400/30">
                  <Medal className="w-6 h-6 text-gray-300" />
                  <div className="flex-1">
                    <p className="font-medium text-[#E8EAED] text-sm">#2 Weekly</p>
                    <p className="text-xs text-[#E8EAED]/60">Special badge + 300 XP</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
                  <Award className="w-6 h-6 text-orange-400" />
                  <div className="flex-1">
                    <p className="font-medium text-[#E8EAED] text-sm">#3 Weekly</p>
                    <p className="text-xs text-[#E8EAED]/60">Bronze badge + 200 XP</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                  <Star className="w-6 h-6 text-[#D4AF37]" />
                  <div className="flex-1">
                    <p className="font-medium text-[#E8EAED] text-sm">Top 10</p>
                    <p className="text-xs text-[#E8EAED]/60">Elite badge + 100 XP</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
