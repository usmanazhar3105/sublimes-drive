/**
 * LeaderboardPage_Wired - Database-connected Leaderboard
 * Uses: useProfile, useXP, real-time leaderboard data
 */

import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
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
  Loader2
} from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { useProfile } from '../hooks/useProfile';

interface LeaderboardEntry {
  id: string;
  display_name: string;
  email: string;
  avatar_url: string | null;
  role: string;
  xp_points: number;
  rank: number;
  post_count: number;
  streak_days: number;
}

export function LeaderboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('alltime');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useProfile();

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedPeriod]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      
      // Fetch from leaderboard view
      const { data, error } = await supabase
        .from('leaderboard_view')
        .select('*')
        .limit(100);

      if (error) {
        console.error('Error fetching leaderboard:', error);
        // Fallback to profiles table if view doesn't exist
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .order('xp_points', { ascending: false })
          .limit(100);

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          return;
        }

        // Map profiles to leaderboard format
        const mappedData = profilesData?.map((p, index) => ({
          id: p.id,
          display_name: p.display_name || p.email || 'User',
          email: p.email,
          avatar_url: p.avatar_url,
          role: p.role,
          xp_points: p.xp_points || 0,
          rank: index + 1,
          post_count: 0,
          streak_days: 0,
        })) || [];

        setLeaderboardData(mappedData);
      } else {
        setLeaderboardData(data || []);
      }
    } catch (err) {
      console.error('Unexpected error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getLevelBadge = (xpPoints: number) => {
    if (xpPoints >= 5000) return { level: 'Platinum', color: 'from-gray-300 to-gray-100' };
    if (xpPoints >= 2000) return { level: 'Gold', color: 'from-[#D4AF37] to-yellow-600' };
    if (xpPoints >= 1000) return { level: 'Silver', color: 'from-gray-400 to-gray-600' };
    if (xpPoints >= 500) return { level: 'Bronze', color: 'from-orange-600 to-orange-800' };
    return { level: 'Member', color: 'from-blue-500 to-blue-700' };
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-[#D4AF37]" />;
    if (rank === 2) return <Trophy className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-orange-600" />;
    return null;
  };

  // Find current user's rank
  const currentUserRank = leaderboardData.find(entry => entry.id === profile?.id);
  const topUsers = leaderboardData.slice(0, 10);

  return (
    <div className="min-h-screen bg-[#0B1426]">
      {/* Header */}
      <div className="bg-[#0F1829] border-b border-[#1A2332] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl text-[#E8EAED]" style={{ fontWeight: 600 }}>
                Leaderboard
              </h1>
              <p className="text-[#8B92A7] mt-1">
                Compete with fellow car enthusiasts and climb the ranks
              </p>
            </div>
            
            {currentUserRank && (
              <div className="flex items-center space-x-4 bg-[#0B1426] px-6 py-3 rounded-lg border border-[#1A2332]">
                <div className="text-center">
                  <div className="text-[#D4AF37] text-sm">Your Rank</div>
                  <div className="text-2xl text-[#E8EAED]" style={{ fontWeight: 600 }}>
                    #{currentUserRank.rank}
                  </div>
                </div>
                <div className="w-px h-10 bg-[#1A2332]" />
                <div className="text-center">
                  <div className="text-[#D4AF37] text-sm">Total XP</div>
                  <div className="text-2xl text-[#E8EAED]" style={{ fontWeight: 600 }}>
                    {currentUserRank.xp_points.toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leaderboard List */}
          <div className="lg:col-span-2">
            <Card className="bg-[#0F1829] border-[#1A2332]">
              <CardContent className="p-6">
                {/* Tabs */}
                <Tabs defaultValue="alltime" className="mb-6">
                  <TabsList className="bg-[#0B1426]">
                    <TabsTrigger value="weekly" onClick={() => setSelectedPeriod('weekly')}>
                      Weekly
                    </TabsTrigger>
                    <TabsTrigger value="monthly" onClick={() => setSelectedPeriod('monthly')}>
                      Monthly
                    </TabsTrigger>
                    <TabsTrigger value="alltime" onClick={() => setSelectedPeriod('alltime')}>
                      All Time
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Top 3 */}
                    {topUsers.slice(0, 3).map((user) => {
                      const level = getLevelBadge(user.xp_points);
                      const isCurrentUser = user.id === profile?.id;
                      
                      return (
                        <div
                          key={user.id}
                          className={`flex items-center space-x-4 p-4 rounded-lg transition-all ${
                            isCurrentUser
                              ? 'bg-[#D4AF37]/10 border-2 border-[#D4AF37]'
                              : 'bg-[#0B1426] hover:bg-[#0B1426]/80'
                          }`}
                        >
                          {/* Rank */}
                          <div className="flex items-center justify-center w-12 h-12">
                            {getRankIcon(user.rank) || (
                              <div className="text-[#E8EAED] text-xl" style={{ fontWeight: 600 }}>
                                #{user.rank}
                              </div>
                            )}
                          </div>

                          {/* Avatar */}
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={user.avatar_url || ''} />
                            <AvatarFallback className="bg-[#D4AF37]/20 text-[#D4AF37]">
                              {user.display_name?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>

                          {/* Info */}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-[#E8EAED]" style={{ fontWeight: 500 }}>
                                {user.display_name}
                                {isCurrentUser && ' (You)'}
                              </span>
                              {user.role === 'admin' && (
                                <Badge className="bg-[#D4AF37] text-black text-xs">
                                  <Star className="h-3 w-3 mr-1" />
                                  Admin
                                </Badge>
                              )}
                              {user.role === 'editor' && (
                                <Badge className="bg-purple-500 text-white text-xs">
                                  Editor
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-3 mt-1 text-xs text-[#8B92A7]">
                              <span className="flex items-center">
                                <Zap className="h-3 w-3 mr-1" />
                                {user.streak_days} day streak
                              </span>
                              <span className="flex items-center">
                                <Users className="h-3 w-3 mr-1" />
                                {user.post_count} posts
                              </span>
                            </div>
                          </div>

                          {/* Level Badge */}
                          <div className="text-center">
                            <div className={`bg-gradient-to-r ${level.color} text-white text-xs px-3 py-1 rounded-full mb-1`}>
                              {level.level}
                            </div>
                            <div className="text-[#D4AF37]" style={{ fontWeight: 600 }}>
                              {user.xp_points.toLocaleString()} XP
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Rest of the list */}
                    {topUsers.slice(3).map((user) => {
                      const level = getLevelBadge(user.xp_points);
                      const isCurrentUser = user.id === profile?.id;
                      
                      return (
                        <div
                          key={user.id}
                          className={`flex items-center space-x-4 p-3 rounded-lg transition-all ${
                            isCurrentUser
                              ? 'bg-[#D4AF37]/10 border-2 border-[#D4AF37]'
                              : 'bg-[#0B1426] hover:bg-[#0B1426]/80'
                          }`}
                        >
                          <div className="text-[#8B92A7] w-8 text-center">#{user.rank}</div>
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar_url || ''} />
                            <AvatarFallback className="bg-[#D4AF37]/20 text-[#D4AF37]">
                              {user.display_name?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="text-[#E8EAED]">
                              {user.display_name}
                              {isCurrentUser && ' (You)'}
                            </div>
                            <div className="text-xs text-[#8B92A7]">
                              {user.post_count} posts
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`bg-gradient-to-r ${level.color} text-white text-xs px-2 py-0.5 rounded-full mb-1`}>
                              {level.level}
                            </div>
                            <div className="text-[#D4AF37] text-sm">
                              {user.xp_points.toLocaleString()} XP
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Your Progress Sidebar */}
          <div className="space-y-6">
            {currentUserRank && (
              <Card className="bg-[#0F1829] border-[#1A2332]">
                <CardContent className="p-6">
                  <h3 className="text-lg text-[#E8EAED] mb-4" style={{ fontWeight: 600 }}>
                    🎯 Your Progress
                  </h3>
                  
                  <div className="text-center mb-6">
                    <div className="text-5xl text-[#D4AF37] mb-2" style={{ fontWeight: 600 }}>
                      {currentUserRank.xp_points.toLocaleString()}
                    </div>
                    <div className="text-[#8B92A7]">Total XP</div>
                  </div>

                  {/* Progress to next level */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-[#E8EAED]">To Silver Level</span>
                        <span className="text-[#D4AF37]">
                          {currentUserRank.xp_points >= 1000 
                            ? '✓ Complete' 
                            : `${1000 - currentUserRank.xp_points} XP left`}
                        </span>
                      </div>
                      <div className="h-2 bg-[#0B1426] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-gray-400 to-gray-600 transition-all"
                          style={{ width: `${Math.min((currentUserRank.xp_points / 1000) * 100, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-4">
                      <div className="text-center p-3 bg-[#0B1426] rounded-lg">
                        <div className="text-2xl text-[#E8EAED]" style={{ fontWeight: 600 }}>
                          #{currentUserRank.rank}
                        </div>
                        <div className="text-xs text-[#8B92A7]">Rank</div>
                      </div>
                      <div className="text-center p-3 bg-[#0B1426] rounded-lg">
                        <div className="text-2xl text-[#E8EAED]" style={{ fontWeight: 600 }}>
                          {currentUserRank.streak_days}
                        </div>
                        <div className="text-xs text-[#8B92A7]">Day Streak</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Achievements */}
            <Card className="bg-[#0F1829] border-[#1A2332]">
              <CardContent className="p-6">
                <h3 className="text-lg text-[#E8EAED] mb-4" style={{ fontWeight: 600 }}>
                  🏆 Achievements
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-[#0B1426] rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Award className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[#E8EAED] text-sm" style={{ fontWeight: 500 }}>
                        First Post
                      </div>
                      <div className="text-xs text-[#8B92A7]">
                        Share your first post with the community
                      </div>
                    </div>
                    <div className="text-green-400 text-sm">+150 XP</div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-[#0B1426] rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[#E8EAED] text-sm" style={{ fontWeight: 500 }}>
                        Community Helper
                      </div>
                      <div className="text-xs text-[#8B92A7]">
                        Help 10 community members
                      </div>
                    </div>
                    <div className="text-blue-400 text-sm">+200 XP</div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-[#0B1426] rounded-lg opacity-50">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Target className="h-5 w-5 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[#E8EAED] text-sm" style={{ fontWeight: 500 }}>
                        Streak Master
                      </div>
                      <div className="text-xs text-[#8B92A7]">
                        Maintain a 7-day streak
                      </div>
                    </div>
                    <div className="text-purple-400 text-sm">+130 XP</div>
                  </div>
                </div>

                <Button className="w-full mt-4 bg-[#D4AF37] text-[#0B1426] hover:bg-[#C4A037]">
                  View All Achievements
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
