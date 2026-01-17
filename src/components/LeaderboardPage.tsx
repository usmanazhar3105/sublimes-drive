import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { DailyChallengeCard } from './DailyChallengeCard';
import { DailyChallengesWidget } from './DailyChallengesWidget';
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
  ChevronDown
} from 'lucide-react';

export function LeaderboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');
  const [selectedTab, setSelectedTab] = useState('leaderboard');

  // Leaderboard data
  const weeklyLeaderboard = [
    {
      rank: 1,
      name: 'Ahmed Hassan',
      username: '@ahmed_cars',
      points: 2847,
      change: '+12',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      badges: ['Admin', 'Car Owner'],
      streak: 15,
      posts: 23,
      level: 'Gold'
    },
    {
      rank: 2,
      name: 'Sarah Auto Lover',
      username: '@li_auto_lover',
      points: 2156,
      change: '+8',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face',
      badges: ['Editor', 'Garage Owner'],
      streak: 12,
      posts: 18,
      level: 'Gold'
    },
    {
      rank: 3,
      name: 'Mohammed Racing',
      username: '@mo_racing_uae',
      points: 1934,
      change: '+15',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
      badges: ['Car Owner'],
      streak: 8,
      posts: 15,
      level: 'Silver'
    },
    {
      rank: 4,
      name: 'Fatima Al-Zahra',
      username: '@fatima_motors',
      points: 1876,
      change: '+5',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
      badges: ['Mechanic'],
      streak: 6,
      posts: 12,
      level: 'Silver'
    },
    {
      rank: 5,
      name: 'Khalid Performance',
      username: '@khalid_perf',
      points: 1654,
      change: '+22',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
      badges: ['Tuner'],
      streak: 10,
      posts: 14,
      level: 'Silver'
    },
    // Current user
    {
      rank: 12,
      name: 'You',
      username: '@your_username',
      points: 1247,
      change: '+45',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face',
      badges: ['Member'],
      streak: 12,
      posts: 8,
      level: 'Bronze',
      isCurrentUser: true
    }
  ];

  const achievements = [
    {
      title: 'First Post',
      description: 'Share your first post with the community',
      icon: Star,
      completed: true,
      points: 50
    },
    {
      title: 'Community Helper',
      description: 'Help 10 community members',
      icon: Users,
      completed: true,
      points: 200
    },
    {
      title: 'Streak Master',
      description: 'Maintain a 7-day streak',
      icon: Target,
      completed: true,
      points: 150
    },
    {
      title: 'Marketplace Pro',
      description: 'Complete 5 successful transactions',
      icon: Award,
      completed: false,
      points: 300,
      progress: 60
    }
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-medium">#{rank}</span>;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Gold':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'Silver':
        return 'bg-gray-400/10 text-gray-400 border-gray-400/20';
      case 'Bronze':
        return 'bg-amber-600/10 text-amber-600 border-amber-600/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="flex-1">
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <div className="border-b border-border p-4">
          <TabsList>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="challenges">Daily Challenges</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="leaderboard" className="p-0">
      {/* Mobile Header */}
      <div className="md:hidden bg-card border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--sublimes-gold)]">Leaderboard</h1>
            <p className="text-sm text-muted-foreground">See how you stack up!</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-[var(--sublimes-gold)]/10 text-[var(--sublimes-gold)] border-[var(--sublimes-gold)]/20">
              <Trophy className="w-3 h-3 mr-1" />
              #12
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        
        {/* Desktop Header */}
        <div className="hidden md:block">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Leaderboard</h1>
              <p className="text-muted-foreground">Compete with fellow car enthusiasts and climb the ranks</p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="bg-[var(--sublimes-gold)]/10 text-[var(--sublimes-gold)] border-[var(--sublimes-gold)]/20">
                <Trophy className="w-4 h-4 mr-1" />
                Your Rank: #12
              </Badge>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                <Zap className="w-4 h-4 mr-1" />
                1,247 XP
              </Badge>
            </div>
          </div>
        </div>

        <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod} className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:w-auto md:grid-cols-3">
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="all-time">All Time</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Main Leaderboard */}
              <div className="lg:col-span-2">
                <Card className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-semibold text-xl flex items-center">
                        <Trophy className="mr-2 h-6 w-6 text-[var(--sublimes-gold)]" />
                        Weekly Rankings
                      </h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-1 h-4 w-4" />
                        Mar 11-17, 2024
                      </div>
                    </div>

                    {/* Top 3 Podium */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                      {weeklyLeaderboard.slice(0, 3).map((user, index) => (
                        <div key={user.rank} className={`text-center ${index === 0 ? 'order-2' : index === 1 ? 'order-1' : 'order-3'}`}>
                          <div className={`relative mb-3 ${index === 0 ? 'mt-0' : 'mt-4'}`}>
                            <Avatar className={`mx-auto ${index === 0 ? 'h-16 w-16' : 'h-12 w-12'}`}>
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>{user.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="absolute -top-2 -right-1">
                              {getRankIcon(user.rank)}
                            </div>
                          </div>
                          <h4 className={`font-medium ${index === 0 ? 'text-lg' : 'text-sm'}`}>{user.name}</h4>
                          <p className="text-xs text-muted-foreground">{user.username}</p>
                          <div className="mt-2">
                            <Badge variant="outline" className={getLevelColor(user.level)}>
                              {user.level}
                            </Badge>
                          </div>
                          <p className={`font-bold mt-1 ${index === 0 ? 'text-lg' : 'text-sm'} text-[var(--sublimes-gold)]`}>
                            {user.points.toLocaleString()} XP
                          </p>
                          <div className="flex items-center justify-center mt-1 text-xs text-green-500">
                            <ChevronUp className="h-3 w-3 mr-1" />
                            {user.change}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Rest of the leaderboard */}
                    <div className="space-y-3">
                      {weeklyLeaderboard.slice(3).map((user) => (
                        <div
                          key={user.rank}
                          className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                            user.isCurrentUser 
                              ? 'border-[var(--sublimes-gold)]/50 bg-[var(--sublimes-gold)]/5' 
                              : 'border-border hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-8 text-center">
                              {getRankIcon(user.rank)}
                            </div>
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>{user.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium">{user.name}</h4>
                                {user.isCurrentUser && (
                                  <Badge variant="secondary" className="text-xs">You</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{user.username}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="outline" className={`text-xs ${getLevelColor(user.level)}`}>
                                  {user.level}
                                </Badge>
                                {user.badges.map((badge, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {badge}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-[var(--sublimes-gold)]">
                              {user.points.toLocaleString()} XP
                            </p>
                            <div className="flex items-center text-xs text-green-500">
                              <ChevronUp className="h-3 w-3 mr-1" />
                              {user.change}
                            </div>
                            <div className="flex items-center justify-end space-x-3 mt-1 text-xs text-muted-foreground">
                              <span>🔥 {user.streak}</span>
                              <span>{user.posts} posts</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                
                {/* Your Progress */}
                <Card className="bg-card border-border">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4 flex items-center">
                      <TrendingUp className="mr-2 h-5 w-5 text-green-500" />
                      Your Progress
                    </h3>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[var(--sublimes-gold)]">1,247</div>
                        <div className="text-sm text-muted-foreground">Total XP</div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>To Silver Level</span>
                          <span>753 XP left</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-[var(--sublimes-gold)] h-2 rounded-full" style={{ width: '62%' }}></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-center text-sm">
                        <div>
                          <div className="font-medium">Rank</div>
                          <div className="text-[var(--sublimes-gold)]">#12</div>
                        </div>
                        <div>
                          <div className="font-medium">Streak</div>
                          <div className="text-orange-500">🔥 12</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Achievements */}
                <Card className="bg-card border-border">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4 flex items-center">
                      <Award className="mr-2 h-5 w-5 text-purple-500" />
                      Achievements
                    </h3>
                    <div className="space-y-3">
                      {achievements.map((achievement, index) => (
                        <div key={index} className={`p-3 rounded-lg border ${achievement.completed ? 'border-green-500/20 bg-green-500/5' : 'border-border'}`}>
                          <div className="flex items-start space-x-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              achievement.completed ? 'bg-green-500/20' : 'bg-muted'
                            }`}>
                              <achievement.icon className={`h-4 w-4 ${
                                achievement.completed ? 'text-green-500' : 'text-muted-foreground'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium">{achievement.title}</h4>
                              <p className="text-xs text-muted-foreground">{achievement.description}</p>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-xs text-[var(--sublimes-gold)]">+{achievement.points} XP</span>
                                {achievement.completed ? (
                                  <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-500">
                                    ✓ Complete
                                  </Badge>
                                ) : achievement.progress ? (
                                  <span className="text-xs text-muted-foreground">{achievement.progress}%</span>
                                ) : null}
                              </div>
                              {achievement.progress && !achievement.completed && (
                                <div className="w-full bg-muted rounded-full h-1 mt-2">
                                  <div 
                                    className="bg-[var(--sublimes-gold)] h-1 rounded-full" 
                                    style={{ width: `${achievement.progress}%` }}
                                  ></div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-4">
                      View All Achievements
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="monthly">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Monthly Leaderboard</h3>
                  <p className="text-muted-foreground">Coming soon! Monthly rankings will be available next month.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all-time">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <Crown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">All-Time Leaderboard</h3>
                  <p className="text-muted-foreground">Hall of Fame rankings coming soon!</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
        </TabsContent>
        
        <TabsContent value="challenges" className="p-4">
          <DailyChallengeCard showAll />
        </TabsContent>
      </Tabs>
    </div>
  );
}