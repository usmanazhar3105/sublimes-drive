/**
 * HomePage - Wired with Supabase Hooks
 * 
 * Uses: useListings, useCommunities, useEvents, useProfile, useAnalytics
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
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
  ArrowRight,
  Loader2,
  X
} from 'lucide-react';

// Import Supabase hooks
import { useListings, useCommunities, useEvents, useProfile, useAnalytics } from '../hooks';

// Import BannerSlider
import { BannerSlider } from './BannerSlider';
// Import Daily Challenge
import { DailyChallengeCard } from './DailyChallengeCard';

interface HomePageProps {
  onNavigate?: (page: string) => void;
  onCreatePost?: () => void;
}

export function HomePage({ onNavigate, onCreatePost }: HomePageProps) {
  // 🔥 SUPABASE HOOKS
  const { listings = [], loading: listingsLoading } = useListings({ limit: 6 }) || { listings: [], loading: false };
  const { communities = [], posts = [], loading: communitiesLoading, refetch: refetchCommunities } = (useCommunities({ limit: 5 }) as any) || { communities: [], posts: [], loading: false };
  const { events = [], loading: eventsLoading } = useEvents({ upcoming: true, limit: 3 }) || { events: [], loading: false };
  const { profile, xpData = { currentXP: 0, currentLevel: 1 } } = useProfile() || { profile: null, xpData: { currentXP: 0, currentLevel: 1 } };
  const analytics = useAnalytics();

  // Track page view
  useEffect(() => {
    analytics.trackPageView('/home');
  }, []);

  const loading = listingsLoading || communitiesLoading || eventsLoading;

  // Refetch posts when a new post is created (event from App modal)
  useEffect(() => {
    const onCreated = () => {
      try { refetchCommunities && refetchCommunities(); } catch {}
    };
    window.addEventListener('post-created' as any, onCreated);
    return () => window.removeEventListener('post-created' as any, onCreated);
  }, [refetchCommunities]);

  // Quick stats data - now with real data
  const quickStats = [
    {
      title: 'Active Communities',
      value: communities.length.toString(),
      change: '+12%',
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      onClick: () => onNavigate?.('communities')
    },
    {
      title: 'Marketplace Items',
      value: listings.length.toString() + '+',
      change: '+8%',
      icon: ShoppingBag,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      onClick: () => onNavigate?.('marketplace')
    },
    {
      title: 'Upcoming Events',
      value: events.length.toString(),
      change: '+15%',
      icon: Calendar,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      onClick: () => onNavigate?.('events')
    },
    {
      title: 'Your XP Points',
      value: (xpData.currentXP || profile?.user_xp || 0).toLocaleString(),
      change: `Level ${xpData.currentLevel || 1}`,
      icon: Star,
      color: 'text-[#D4AF37]',
      bgColor: 'bg-[#D4AF37]/10',
      onClick: () => onNavigate?.('profile')
    }
  ];

  // Featured shortcuts
  const featuredShortcuts = [
    {
      id: 'marketplace',
      title: 'Marketplace',
      description: 'Buy & sell car parts',
      subtitle: `${listings.length}+ items available`,
      icon: ShoppingBag,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      gradient: 'from-blue-500/20 to-cyan-500/20',
      borderColor: 'border-blue-500/30',
      onClick: () => {
        analytics.trackEvent('shortcut_clicked', { shortcut: 'marketplace' });
        onNavigate?.('marketplace');
      }
    },
    {
      id: 'garage-hub',
      title: 'Garage Hub',
      description: 'Trusted service partners',
      subtitle: 'Find verified garages',
      icon: Wrench,
      color: 'text-[#D4AF37]',
      bgColor: 'bg-[#D4AF37]/10',
      gradient: 'from-[#D4AF37]/20 to-yellow-500/20',
      borderColor: 'border-[#D4AF37]/30',
      onClick: () => {
        analytics.trackEvent('shortcut_clicked', { shortcut: 'garage-hub' });
        onNavigate?.('garage-hub');
      }
    },
    {
      id: 'events',
      title: 'Events & Meetups',
      description: 'Join car enthusiast events',
      subtitle: `${events.length} upcoming events`,
      icon: Calendar,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      gradient: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-500/30',
      onClick: () => {
        analytics.trackEvent('shortcut_clicked', { shortcut: 'events' });
        onNavigate?.('events');
      }
    },
    {
      id: 'communities',
      title: 'Communities',
      description: 'Connect with enthusiasts',
      subtitle: `${communities.length} active communities`,
      icon: Users,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      gradient: 'from-orange-500/20 to-red-500/20',
      borderColor: 'border-orange-500/30',
      onClick: () => {
        analytics.trackEvent('shortcut_clicked', { shortcut: 'communities' });
        onNavigate?.('communities');
      }
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B1426]">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#0F1829] to-[#1A2332] border-b border-[#1A2332]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl text-[#E8EAED] mb-2">
                Welcome back{profile?.display_name ? `, ${profile.display_name}` : ''}! 👋
              </h1>
              <p className="text-[#8B92A7]">
                Your UAE car enthusiast community hub
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={onCreatePost}
                className="bg-[#D4AF37] hover:bg-[#C19B2E] text-[#0B1426]"
              >
                <Plus size={20} className="mr-2" />
                Create Post
              </Button>
              <Button
                onClick={() => onNavigate?.('marketplace-create')}
                variant="outline"
                className="border-[#2A3342] text-[#E8EAED]"
              >
                <ShoppingBag size={20} className="mr-2" />
                List Item
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 🎨 BANNER SLIDER - Dynamic from Supabase */}
        <div className="mb-8">
          <BannerSlider />
        </div>
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card 
                key={index}
                className="bg-[#0F1829] border-[#1A2332] hover:border-[#D4AF37]/30 transition-all cursor-pointer"
                onClick={stat.onClick}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                      <Icon className={stat.color} size={24} />
                    </div>
                    <Badge className="bg-green-500/10 text-green-400 border-0">
                      {stat.change}
                    </Badge>
                  </div>
                  <h3 className="text-2xl text-[#E8EAED] mb-1">{stat.value}</h3>
                  <p className="text-sm text-[#8B92A7]">{stat.title}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Featured Shortcuts */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl text-[#E8EAED]">Quick Access</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredShortcuts.map((shortcut) => {
              const Icon = shortcut.icon;
              return (
                <Card 
                  key={shortcut.id}
                  className={`bg-gradient-to-br ${shortcut.gradient} border-[#1A2332] ${shortcut.borderColor} hover:border-[#D4AF37]/50 transition-all cursor-pointer group`}
                  onClick={shortcut.onClick}
                >
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-lg ${shortcut.bgColor} flex items-center justify-center mb-4`}>
                      <Icon className={shortcut.color} size={24} />
                    </div>
                    <h3 className="text-lg text-[#E8EAED] mb-1 group-hover:text-[#D4AF37] transition-colors">
                      {shortcut.title}
                    </h3>
                    <p className="text-sm text-[#8B92A7] mb-2">{shortcut.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#8B92A7]">{shortcut.subtitle}</span>
                      <ChevronRight className="text-[#8B92A7] group-hover:text-[#D4AF37] transition-colors" size={16} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Posts */}
          <div>
            <Card className="bg-[#0F1829] border-[#1A2332]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#E8EAED]">Recent Posts</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#D4AF37] hover:text-[#C19B2E]"
                    onClick={() => onNavigate?.('communities')}
                  >
                    View All
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {communitiesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
                  </div>
                ) : posts.length > 0 ? (
                  <div className="space-y-4">
                    {posts.slice(0, 5).map((post) => (
                      <div 
                        key={post.id}
                        className="flex gap-3 p-3 rounded-lg hover:bg-[#1A2332] transition-colors cursor-pointer"
                        onClick={() => onNavigate?.(`post-${post.id}`)}
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={post.author?.avatar_url} />
                          <AvatarFallback className="bg-[#D4AF37] text-[#0B1426]">
                            {post.author?.display_name?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm text-[#E8EAED] truncate">
                              {post.author?.display_name || 'Anonymous'}
                            </span>
                            <span className="text-xs text-[#8B92A7]">•</span>
                            <span className="text-xs text-[#8B92A7]">
                              {new Date(post.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-[#8B92A7] line-clamp-2">{post.content}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-[#8B92A7] flex items-center gap-1">
                              <Heart size={12} />
                              {post.likes_count || 0}
                            </span>
                            <span className="text-xs text-[#8B92A7] flex items-center gap-1">
                              <MessageSquare size={12} />
                              {post.comments_count || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="mx-auto mb-3 text-[#8B92A7]" size={32} />
                    <p className="text-[#8B92A7]">No posts yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Featured Listings */}
          <div>
            <Card className="bg-[#0F1829] border-[#1A2332]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#E8EAED]">Featured Listings</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#D4AF37] hover:text-[#C19B2E]"
                    onClick={() => onNavigate?.('marketplace')}
                  >
                    View All
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {listingsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
                  </div>
                ) : listings.length > 0 ? (
                  <div className="space-y-4">
                    {listings.slice(0, 5).map((listing) => (
                      <div 
                        key={listing.id}
                        className="flex gap-3 p-3 rounded-lg hover:bg-[#1A2332] transition-colors cursor-pointer"
                        onClick={() => {
                          analytics.trackEvent('listing_clicked', { listing_id: listing.id });
                          onNavigate?.(`listing-${listing.id}`);
                        }}
                      >
                        <div className="w-16 h-16 rounded-lg bg-[#1A2332] flex-shrink-0 overflow-hidden">
                          {listing.images?.[0] && (
                            <img 
                              src={listing.images[0]} 
                              alt={listing.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm text-[#E8EAED] mb-1 truncate">
                            {listing.title}
                          </h4>
                          <p className="text-xs text-[#8B92A7] mb-2 line-clamp-1">
                            {listing.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-[#D4AF37]">
                              AED {listing.price?.toLocaleString()}
                            </span>
                            <Badge className="bg-[#D4AF37]/10 text-[#D4AF37] border-0 text-xs">
                              {listing.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingBag className="mx-auto mb-3 text-[#8B92A7]" size={32} />
                    <p className="text-[#8B92A7]">No listings yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Upcoming Events */}
        <Card className="bg-[#0F1829] border-[#1A2332] mt-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-[#E8EAED]">Upcoming Events</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-[#D4AF37] hover:text-[#C19B2E]"
                onClick={() => onNavigate?.('events')}
              >
                View All
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {eventsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
              </div>
            ) : events.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {events.map((event) => (
                  <Card 
                    key={event.id}
                    className="bg-[#1A2332] border-[#2A3342] hover:border-[#D4AF37]/30 transition-all cursor-pointer"
                    onClick={() => {
                      analytics.trackEvent('event_clicked', { event_id: event.id });
                      onNavigate?.(`event-${event.id}`);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
                          <Calendar className="text-[#D4AF37]" size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm text-[#E8EAED] mb-1 line-clamp-2">
                            {event.title}
                          </h4>
                          <div className="flex items-center gap-1 text-xs text-[#8B92A7]">
                            <Calendar size={12} />
                            {new Date(event.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-[#8B92A7] mb-2">
                        <MapPin size={12} />
                        {event.location}
                      </div>
                      <Badge className="bg-[#D4AF37]/10 text-[#D4AF37] border-0 text-xs">
                        {event.current_participants || 0} attending
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="mx-auto mb-3 text-[#8B92A7]" size={32} />
                <p className="text-[#8B92A7]">No upcoming events</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
