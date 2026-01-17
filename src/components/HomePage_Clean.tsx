import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { BannerSlider } from './BannerSlider';
import { toast } from 'sonner';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  Wrench, 
  Star, 
  Trophy, 
  Zap, 
  Calendar,
  MapPin,
  Plus,
  ChevronRight,
  Clock,
  Eye,
  MessageSquare,
  Heart,
  Car,
  Tag,
  ArrowRight
} from 'lucide-react';

interface HomePageProps {
  onNavigate?: (page: string) => void;
  onCreatePost?: () => void;
}

export function HomePage({ onNavigate, onCreatePost }: HomePageProps) {
  // Quick stats data
  const quickStats = [
    {
      title: 'Active Communities',
      value: '2.4K',
      change: '+12%',
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Marketplace Items',
      value: '1.8K',
      change: '+8%',
      icon: ShoppingBag,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Garage Partners',
      value: '340',
      change: '+15%',
      icon: Wrench,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    },
    {
      title: 'Your XP Points',
      value: '1,247',
      change: '+45 today',
      icon: Star,
      color: 'text-[var(--sublimes-gold)]',
      bgColor: 'bg-[var(--sublimes-gold)]/10'
    }
  ];

  // Featured shortcuts
  const featuredShortcuts = [
    {
      id: 'offers',
      title: 'Exclusive Offers',
      description: 'Hot deals & discounts',
      subtitle: '15 active offers',
      icon: Tag,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      gradient: 'from-green-500/20 to-emerald-500/20',
      borderColor: 'border-green-500/30'
    },
    {
      id: 'marketplace',
      title: 'Marketplace',
      description: 'Buy & sell car parts',
      subtitle: '1.8K items available',
      icon: ShoppingBag,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      gradient: 'from-blue-500/20 to-cyan-500/20',
      borderColor: 'border-blue-500/30'
    },
    {
      id: 'garage-hub',
      title: 'Garage Hub',
      description: 'Trusted service partners',
      subtitle: '340 verified garages',
      icon: Wrench,
      color: 'text-[var(--sublimes-gold)]',
      bgColor: 'bg-[var(--sublimes-gold)]/10',
      gradient: 'from-[var(--sublimes-gold)]/20 to-yellow-500/20',
      borderColor: 'border-[var(--sublimes-gold)]/30'
    }
  ];

  // Recent activity
  const recentActivity = [
    {
      type: 'post',
      user: 'Ahmed Al-Mahmoud',
      action: 'shared a new post',
      content: 'Check out my BMW M3 modification',
      time: '2h ago',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
    },
    {
      type: 'marketplace',
      user: 'Sarah Auto Lover',
      action: 'listed a new item',
      content: 'BMW Performance Exhaust System',
      time: '4h ago',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face'
    },
    {
      type: 'garage',
      user: 'Dubai Auto Center',
      action: 'posted a repair offer',
      content: 'Engine diagnostics - 50% off',
      time: '6h ago',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
    }
  ];

  // Trending topics
  const trendingTopics = [
    { tag: '#BMWLovers', posts: 234, trending: true },
    { tag: '#DubaiCars', posts: 189, trending: true },
    { tag: '#Modification', posts: 167, trending: false },
    { tag: '#TrackDay', posts: 145, trending: true },
    { tag: '#CarMeet', posts: 123, trending: false }
  ];

  return (
    <div className="flex-1">
      {/* Banner Slider - Shows on both mobile and desktop */}
      <div className="p-4 md:p-6">
        <BannerSlider />
      </div>

      {/* Mobile Header */}
      <div className="md:hidden bg-card border-b border-border p-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-[var(--sublimes-gold)] mb-2">Welcome back!</h1>
          <p className="text-muted-foreground mb-4">Ahmed Hassan</p>
          <Badge variant="outline" className="bg-[var(--sublimes-gold)]/10 text-[var(--sublimes-gold)] border-[var(--sublimes-gold)]/20 px-3 py-1">
            <Zap className="w-4 h-4 mr-2" />
            1,247 XP Points
          </Badge>
        </div>

        {/* Mobile Quick Actions */}
        <div className="flex justify-center space-x-3 mb-6">
          <Button 
            className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/80"
            onClick={onCreatePost}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Post
          </Button>
          <Button 
            variant="outline"
            onClick={() => onNavigate?.('communities')}
          >
            <Car className="h-4 w-4 mr-2" />
            Browse
          </Button>
        </div>

        {/* Mobile Featured Shortcuts */}
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="font-semibold text-foreground mb-2">Quick Access</h3>
            <p className="text-sm text-muted-foreground">Jump into your favorite sections</p>
          </div>
          <div className="space-y-3">
            {featuredShortcuts.map((shortcut) => (
              <div 
                key={shortcut.id}
                className={`flex items-center justify-between p-4 rounded-xl bg-gradient-to-r ${shortcut.gradient} border ${shortcut.borderColor} cursor-pointer group hover:shadow-lg transition-all duration-200`}
                onClick={() => onNavigate?.(shortcut.id)}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-xl ${shortcut.bgColor} flex items-center justify-center`}>
                    <shortcut.icon className={`h-5 w-5 ${shortcut.color}`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{shortcut.title}</h4>
                    <p className="text-sm text-muted-foreground">{shortcut.subtitle}</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all duration-200" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* Dynamic Banner Slider */}
        <BannerSlider />
        
        {/* Desktop Welcome Header */}
        <div className="hidden md:block">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[var(--sublimes-gold)] mb-2">
              Welcome back, Ahmed!
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Here's what's happening in your automotive community
            </p>
            <div className="flex items-center justify-center space-x-4 mt-6">
              <Badge variant="outline" className="bg-[var(--sublimes-gold)]/10 text-[var(--sublimes-gold)] border-[var(--sublimes-gold)]/20 px-4 py-2">
                <Zap className="w-4 h-4 mr-2" />
                1,247 XP Points
              </Badge>
              <Button 
                size="lg"
                className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/80 px-6"
                onClick={onCreatePost}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Post
              </Button>
            </div>
          </div>
        </div>

        {/* Featured Shortcuts Slider */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-foreground mb-2">Quick Access</h2>
            <p className="text-muted-foreground">Jump into your favorite sections</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredShortcuts.map((shortcut) => (
              <Card 
                key={shortcut.id} 
                className={`bg-gradient-to-br ${shortcut.gradient} border ${shortcut.borderColor} hover:shadow-lg transition-all duration-200 cursor-pointer group`}
                onClick={() => onNavigate?.(shortcut.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${shortcut.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                      <shortcut.icon className={`h-6 w-6 ${shortcut.color}`} />
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg text-foreground group-hover:text-foreground transition-colors">
                      {shortcut.title}
                    </h3>
                    <p className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors">
                      {shortcut.description}
                    </p>
                    <p className={`text-xs font-medium ${shortcut.color}`}>
                      {shortcut.subtitle}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-foreground mb-2">Platform Overview</h2>
            <p className="text-muted-foreground">Live statistics from our community</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {quickStats.map((stat, index) => (
              <Card key={index} className="bg-card border-border text-center hover:shadow-lg transition-all duration-200">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center mx-auto mb-4`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <h3 className="font-bold text-2xl mb-1">{stat.value}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{stat.title}</p>
                  <span className="text-xs text-green-500 font-medium">{stat.change}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Import Car Promotional Banner */}
        <Card className="bg-gradient-to-r from-[var(--sublimes-gold)] to-yellow-500 text-black mb-6">
          <CardContent className="p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Import Your Dream Car?</h2>
            <p className="text-lg mb-8 opacity-90">
              Submit an enquiry and our experts will provide you with a detailed quote and timeline.
            </p>
            <Button 
              size="lg" 
              className="bg-black text-white hover:bg-gray-800 px-8 py-4 text-lg"
              onClick={() => onNavigate?.('import-car')}
            >
              Start Your Import Journey
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Quick Actions */}
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center">
                  <Zap className="mr-2 h-5 w-5 text-[var(--sublimes-gold)]" />
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button 
                    variant="outline" 
                    className="h-16 flex flex-col space-y-1"
                    onClick={() => onNavigate?.('communities')}
                  >
                    <Users className="h-5 w-5" />
                    <span className="text-xs">Communities</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-16 flex flex-col space-y-1"
                    onClick={() => onNavigate?.('marketplace')}
                  >
                    <ShoppingBag className="h-5 w-5" />
                    <span className="text-xs">Marketplace</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-16 flex flex-col space-y-1"
                    onClick={() => onNavigate?.('garage-hub')}
                  >
                    <Wrench className="h-5 w-5" />
                    <span className="text-xs">Garage Hub</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-16 flex flex-col space-y-1"
                    onClick={() => onNavigate?.('events')}
                  >
                    <Calendar className="h-5 w-5" />
                    <span className="text-xs">Events</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center">
                    <Clock className="mr-2 h-5 w-5 text-blue-500" />
                    Recent Activity
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onNavigate?.('communities')}
                  >
                    View All
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={activity.avatar} />
                        <AvatarFallback>{activity.user[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-medium">{activity.user}</span>
                          <span className="text-muted-foreground"> {activity.action}</span>
                        </p>
                        <p className="text-sm text-muted-foreground truncate">{activity.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                      </div>
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Eye className="h-4 w-4" />
                        <MessageSquare className="h-4 w-4" />
                        <Heart className="h-4 w-4" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Trending Topics */}
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-green-500" />
                  Trending Now
                </h3>
                <div className="space-y-3">
                  {trendingTopics.map((topic, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-blue-400">{topic.tag}</span>
                        {topic.trending && (
                          <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-500">
                            Hot
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{topic.posts}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Personal Stats */}
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center">
                  <Trophy className="mr-2 h-5 w-5 text-[var(--sublimes-gold)]" />
                  Your Stats
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Posts this week</span>
                    <span className="font-medium">8</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Marketplace views</span>
                    <span className="font-medium">142</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Community rank</span>
                    <span className="font-medium text-[var(--sublimes-gold)]">#12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Streak</span>
                    <span className="font-medium">🔥 12 days</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-4"
                  onClick={() => onNavigate?.('leaderboard')}
                >
                  View Leaderboard
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-purple-500" />
                  Upcoming Events
                </h3>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg border border-border">
                    <h4 className="font-medium text-sm">Dubai Car Meet</h4>
                    <p className="text-xs text-muted-foreground">March 15, 2024 • Dubai Mall</p>
                    <div className="flex items-center mt-2 text-xs text-muted-foreground">
                      <Users className="h-3 w-3 mr-1" />
                      <span>234 attending</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border border-border">
                    <h4 className="font-medium text-sm">Track Day - Autodrome</h4>
                    <p className="text-xs text-muted-foreground">March 22, 2024 • Dubai Autodrome</p>
                    <div className="flex items-center mt-2 text-xs text-muted-foreground">
                      <Users className="h-3 w-3 mr-1" />
                      <span>89 attending</span>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-4"
                  onClick={() => onNavigate?.('events')}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  View All Events
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}