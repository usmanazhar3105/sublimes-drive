/**
 * CommunitiesPage - Wired with Supabase Hooks
 * 
 * Uses: useCommunities, useCommunityPosts, useRole, useAnalytics
 */

import { useState, useEffect } from 'react';
import { PostCard_Wired as PostCard } from './PostCard_Wired';
import { TrendingTopics } from './TrendingTopics_Wired';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Sparkles, Star, Search, Users, Plus, Tag, Filter, ChevronDown, RefreshCw, Loader2, X } from 'lucide-react';
import { DailyChallenge, getTodaysChallenges, getRandomChallenge, generateTodaysChallenges } from '../utils/dailyChallenges';
import { toast } from 'sonner';
import { chineseCarBrands } from '../utils/chineseCarData';

// Import Supabase hooks
import { useCommunities, useCommunityPosts, useRole, useAnalytics, useProfile } from '../hooks';
import { supabase } from '../utils/supabase/client';

interface CommunitiesPageProps {
  onNavigate?: (page: string) => void;
}

export function CommunitiesPage({ onNavigate }: CommunitiesPageProps = {}) {
  // UI State
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [selectedUrgency, setSelectedUrgency] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([]);
  const [currentChallenge, setCurrentChallenge] = useState<DailyChallenge | null>(null);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);

  // 🔥 SUPABASE HOOKS
  const { communities, loading: communitiesLoading, error: communitiesError, joinCommunity, leaveCommunity, refetch: refetchCommunities } = useCommunities();
  const { posts, loading: postsLoading, error: postsError, createPost, likePost, unlikePost, refetch: refetchPosts } = useCommunityPosts(selectedCommunityId || undefined);
  const { profile } = useProfile();
  const { isAdmin } = useRole();
  const analytics = useAnalytics();

  // 🏆 LEADERBOARD STATE
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);

  // Track page view
  useEffect(() => {
    analytics.trackPageView('/communities');
  }, []);

  // Refetch posts when a new post is created (event from App modal)
  useEffect(() => {
    const onCreated = () => { try { refetchPosts(); } catch {} };
    window.addEventListener('post-created' as any, onCreated);
    return () => window.removeEventListener('post-created' as any, onCreated);
  }, [refetchPosts]);

  // Fetch leaderboard data
  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLeaderboardLoading(true);
      
      // Fetch top users by XP
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, email, avatar_url, xp_points')
        .order('xp_points', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching leaderboard:', error);
        setLeaderboardData([]);
        return;
      }

      // Map to leaderboard format
      const mappedData = data?.map((user, index) => ({
        name: user.display_name || user.email?.split('@')[0] || 'User',
        points: user.xp_points || 0,
        rank: index + 1,
        avatar: user.avatar_url,
        isCurrentUser: user.id === profile?.id,
      })) || [];

      setLeaderboardData(mappedData);
    } catch (err) {
      console.error('Unexpected error fetching leaderboard:', err);
      setLeaderboardData([]);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  // Initialize daily challenges
  useEffect(() => {
    const initialChallenges = generateTodaysChallenges();
    setDailyChallenges(initialChallenges);
    
    if (initialChallenges.length > 0) {
      setCurrentChallenge(initialChallenges[0]);
    }
  }, []);

  // Set first community as selected by default
  useEffect(() => {
    if (communities.length > 0 && !selectedCommunityId) {
      setSelectedCommunityId(communities[0].id);
    }
  }, [communities]);

  const refreshChallenges = () => {
    const newChallenges = generateTodaysChallenges();
    setDailyChallenges(newChallenges);
    
    const randomChallenge = getRandomChallenge(newChallenges);
    setCurrentChallenge(randomChallenge);
    
    toast.success('Daily challenges refreshed!');
    analytics.trackEvent('challenges_refreshed');
  };

  const handleJoinCommunity = async (communityId: string) => {
    const { error } = await joinCommunity(communityId);
    if (!error) {
      toast.success('Joined community!');
      analytics.trackCommunityJoined(communityId);
    } else {
      toast.error('Failed to join community');
    }
  };

  const handleLeaveCommunity = async (communityId: string) => {
    const { error } = await leaveCommunity(communityId);
    if (!error) {
      toast.success('Left community');
    } else {
      toast.error('Failed to leave community');
    }
  };

  const handleLikePost = async (postId: string) => {
    const { error } = await likePost(postId);
    if (error) {
      toast.error('Failed to like post');
    } else {
      analytics.trackLike('post', postId);
    }
  };

  const handleCreatePost = async (content: string) => {
    if (!selectedCommunityId) {
      toast.error('Please select a community');
      return;
    }

    const { data, error } = await createPost(content, []);

    if (!error && data) {
      toast.success('Post created!');
      analytics.trackPostCreated(data.id, selectedCommunityId);
    } else {
      toast.error('Failed to create post');
    }
  };

  const popularTags = [
    'Dubai',
    'Abu Dhabi',
    'Sharjah',
    'EV',
    'Meetup',
    'Photography',
    'Road Trip',
    'Maintenance',
    'Modification'
  ];

  const urgencyLevels = [
    { value: 'all', label: 'All Urgency Levels' },
    { value: 'normal', label: 'Normal' },
    { value: 'important', label: 'Important' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const allBrands = [
    { value: 'all', label: 'All Brands' },
    ...chineseCarBrands.map(brand => ({
      value: brand.id,
      label: brand.name
    }))
  ];

  const handleAddTag = (tag: string) => {
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleClearFilters = () => {
    setSelectedBrand('all');
    setSelectedTags([]);
    setTagInput('');
    setSelectedUrgency('all');
    setSearchQuery('');
    toast.success('Filters cleared');
  };

  const filteredPosts = posts.filter(post => {
    // Search query filter
    const text = (post.content || post.body || '').toLowerCase();
    if (searchQuery && !text.includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Brand filter
    if (selectedBrand !== 'all' && post.car_brand !== selectedBrand) {
      return false;
    }

    // Tags filter
    if (selectedTags.length > 0) {
      const postTags = post.tags || [];
      const hasMatchingTag = selectedTags.some(tag => 
        postTags.some((pt: string) => pt.toLowerCase() === tag.toLowerCase())
      );
      if (!hasMatchingTag) {
        return false;
      }
    }

    // Urgency filter (map UI terms to DB values)
    if (selectedUrgency !== 'all') {
      const mapUrg = (u: string) => u === 'important' ? 'high' : (u === 'normal' ? 'low' : u);
      const target = mapUrg(selectedUrgency);
      const postUrg = (post.urgency || '').toLowerCase();
      if (postUrg !== target) {
        return false;
      }
    }

    return true;
  });

  const selectedCommunity = communities.find(c => c.id === selectedCommunityId);
  const loading = communitiesLoading || postsLoading;
  const error = communitiesError || postsError;

  return (
    <div className="min-h-screen bg-[#0B1426]">
      {/* Header */}
      <div className="bg-[#0F1829] border-b border-[#1A2332]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl text-[#E8EAED] mb-2">Communities</h1>
              <p className="text-sm text-[#8B92A7]">
                Connect with fellow car enthusiasts
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button
                onClick={() => onNavigate?.('my-posts')}
                variant="outline"
                className="border-[#2A3342] text-[#E8EAED] hover:bg-[#2A3342] gap-2"
              >
                <Users size={18} />
                My Posts
              </Button>

              <Button
                onClick={() => onNavigate?.('create-post')}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                <Plus size={18} />
                Create Post
              </Button>

              <Button
                onClick={() => onNavigate?.('leaderboard')}
                className="bg-[#D4AF37] hover:bg-[#C19B2E] text-[#0B1426] gap-2"
              >
                <Star size={18} />
                Leaderboard
              </Button>

              <Button
                onClick={async () => {
                  try {
                    const params: any = {
                      search: searchQuery || null,
                      brand: selectedBrand !== 'all' ? selectedBrand : null,
                      tags: selectedTags.length ? selectedTags : null,
                      urgency: selectedUrgency !== 'all' ? selectedUrgency : null,
                    };
                    const { data, error } = await supabase.rpc('fn_export_run', {
                      kind: 'communities',
                      params
                    });
                    if (error) throw error;
                    toast.success('Export started');
                  } catch (e: any) {
                    toast.error(e?.message || 'Export failed');
                  }
                }}
                variant="outline"
                className="border-[#2A3342] text-[#E8EAED] hover:bg-[#2A3342]"
              >
                Export
              </Button>
            </div>
          </div>

          {/* Today's Challenge Banner */}
          {currentChallenge && (
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white mb-1">Today's Challenge</h3>
                    <p className="text-white/90 text-sm">{currentChallenge.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => onNavigate?.('create-post')}
                    className="bg-white text-purple-600 hover:bg-white/90"
                  >
                    Post
                  </Button>
                  <Button
                    onClick={refreshChallenges}
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                  >
                    <RefreshCw size={20} />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Search Bar and Filters */}
          <div className="space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B92A7]" size={20} />
              <Input
                placeholder="Search for posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#1A2332] border-[#2A3342] text-[#E8EAED] placeholder:text-[#8B92A7]"
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap gap-3">
              {/* Brand Filter */}
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger className="w-[180px] bg-[#1A2332] border-[#2A3342] text-[#E8EAED]">
                  <SelectValue placeholder="All Brands" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A2332] border-[#2A3342]">
                  {allBrands.map(brand => (
                    <SelectItem key={brand.value} value={brand.value} className="text-[#E8EAED]">
                      {brand.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Tags Filter with Input */}
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B92A7]" size={18} />
                  <Input
                    placeholder="Add tags (suggestions below)"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && tagInput.trim()) {
                        handleAddTag(tagInput.trim());
                      }
                    }}
                    className="pl-10 bg-[#1A2332] border-[#2A3342] text-[#E8EAED] placeholder:text-[#8B92A7]"
                  />
                </div>
                {/* Tag Suggestions */}
                {tagInput && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {popularTags
                      .filter(tag => tag.toLowerCase().includes(tagInput.toLowerCase()))
                      .slice(0, 5)
                      .map(tag => (
                        <Badge
                          key={tag}
                          onClick={() => handleAddTag(tag)}
                          className="cursor-pointer bg-[#2A3342] text-[#E8EAED] hover:bg-[#D4AF37] hover:text-[#0B1426] transition-colors"
                        >
                          {tag}
                        </Badge>
                      ))}
                  </div>
                )}
              </div>

              {/* Urgency Level Filter */}
              <Select value={selectedUrgency} onValueChange={setSelectedUrgency}>
                <SelectTrigger className="w-[200px] bg-[#1A2332] border-[#2A3342] text-[#E8EAED]">
                  <SelectValue placeholder="All Urgency Levels" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A2332] border-[#2A3342]">
                  {urgencyLevels.map(level => (
                    <SelectItem key={level.value} value={level.value} className="text-[#E8EAED]">
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Clear Filters Button */}
              <Button
                onClick={handleClearFilters}
                variant="outline"
                className="border-[#2A3342] text-[#8B92A7] hover:bg-[#2A3342] hover:text-[#E8EAED]"
              >
                Clear Filters
              </Button>
            </div>

            {/* Selected Tags Display */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedTags.map(tag => (
                  <Badge
                    key={tag}
                    className="bg-[#D4AF37] text-[#0B1426] pl-3 pr-1 py-1 flex items-center gap-2"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:bg-[#0B1426]/20 rounded-full p-0.5"
                    >
                      <X size={14} />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Posts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin mb-4" />
                <p className="text-[#8B92A7]">Loading posts...</p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <Card className="bg-red-500/10 border-red-500">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <X className="text-red-400 mt-1" size={20} />
                    <div>
                      <h3 className="text-red-400 font-semibold mb-1">Error Loading Posts</h3>
                      <p className="text-sm text-red-300">{error.message}</p>
                      <Button
                        onClick={() => {
                          refetchCommunities();
                          refetchPosts();
                        }}
                        variant="outline"
                        size="sm"
                        className="mt-3 border-red-400 text-red-400 hover:bg-red-400/10"
                      >
                        Try Again
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {!loading && !error && filteredPosts.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-xl text-[#E8EAED] mb-2">No posts yet</h3>
                <p className="text-[#8B92A7] mb-6">
                  Be the first to share something with the community!
                </p>
                {profile && (
                  <Button
                    onClick={() => onNavigate?.('create-post')}
                    className="bg-[#D4AF37] text-[#0B1426] hover:bg-[#C19B2E]"
                  >
                    Create First Post
                  </Button>
                )}
              </div>
            )}

            {/* Posts List */}
            {!loading && !error && filteredPosts.map((post) => {
              const isAnon = Boolean((post as any).is_anonymous || (post as any).anonymous);
              const baseName = post.profiles?.username
                || post.profiles?.display_name
                || post.profiles?.email?.split('@')[0]
                || 'User';
              const name = isAnon ? 'Anonymous' : baseName;
              const handle = isAnon ? '' : (post.profiles?.username || post.profiles?.email?.split('@')[0] || 'user').toLowerCase();
              return (
                <PostCard
                  key={post.id}
                  postId={post.id}
                  postType="regular"
                  ownerId={post.user_id}
                  user={{
                    name,
                    username: handle,
                    avatar: post.profiles?.avatar_url || '',
                    role: 'car-owner',
                    verified: false,
                    isUrgent: post.urgency === 'urgent',
                  }}
                  content={{
                    title: post.title || undefined,
                    text: post.content || post.body || '',
                    images: (() => {
                      const mediaField = post.images || post.media || [];
                      if (Array.isArray(mediaField) && mediaField.length > 0) {
                        if (typeof mediaField[0] === 'object' && mediaField[0]?.url) {
                          return mediaField.map((m: any) => m.url);
                        }
                        return mediaField;
                      }
                      return [];
                    })(),
                    timestamp: new Date(post.created_at).toLocaleDateString(),
                    tags: post.tags || [],
                    carBrand: post.car_brand || undefined,
                    carModel: post.car_model || undefined,
                    location: post.location || undefined,
                    urgency: post.urgency || undefined,
                  }}
                  engagement={{
                    likes: post.likes_count || 0,
                    comments: post.comments_count || 0,
                    shares: 0,
                    views: 0,
                  }}
                />
              );
            })}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Daily Challenge */}
            {currentChallenge && (
              <Card className="bg-gradient-to-br from-[#D4AF37]/20 to-[#1A2332] border-[#D4AF37]">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="text-[#D4AF37]" size={20} />
                      <h3 className="text-[#E8EAED] font-semibold">Daily Challenge</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={refreshChallenges}
                      className="text-[#D4AF37] hover:bg-[#D4AF37]/10"
                    >
                      <RefreshCw size={16} />
                    </Button>
                  </div>
                  
                  <p className="text-sm text-[#E8EAED] mb-4">{currentChallenge.title}</p>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-[#D4AF37] text-[#0B1426]">
                      +{currentChallenge.difficulty === 'hard' ? 75 : currentChallenge.difficulty === 'medium' ? 50 : 25} XP
                    </Badge>
                    <span className="text-xs text-[#8B92A7]">{currentChallenge.category}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Communities List */}
            <Card className="bg-[#0F1829] border-[#1A2332]">
              <CardContent className="p-6">
                <h3 className="text-[#E8EAED] font-semibold mb-4 flex items-center gap-2">
                  <Users size={20} className="text-[#D4AF37]" />
                  Communities
                </h3>
                <div className="space-y-2">
                  {communities.slice(0, 5).map((community) => (
                    <div
                      key={community.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-[#1A2332] hover:bg-[#2A3342] cursor-pointer transition-colors"
                      onClick={() => setSelectedCommunityId(community.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                          <span className="text-[#D4AF37]">{(community as any).name?.[0] || community.title?.[0] || 'C'}</span>
                        </div>
                        <div>
                          <p className="text-sm text-[#E8EAED]">{(community as any).name || community.title}</p>
                          <p className="text-xs text-[#8B92A7]">{(community as any).members_count || 0} members</p>
                        </div>
                      </div>
                      {selectedCommunityId === community.id && (
                        <Badge className="bg-[#D4AF37] text-[#0B1426]">Active</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Trending Topics */}
            <TrendingTopics />

            {/* Weekly Leaderboard */}
            <Card className="bg-[#0F1829] border-[#1A2332]">
              <CardContent className="p-6">
                <h3 className="text-[#E8EAED] font-semibold mb-4 flex items-center gap-2">
                  <Star size={20} className="text-[#D4AF37]" />
                  Weekly Leaderboard
                </h3>
                {leaderboardLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 text-[#D4AF37] animate-spin" />
                  </div>
                ) : leaderboardData.length === 0 ? (
                  <p className="text-sm text-[#8B92A7] text-center py-4">No leaderboard data yet</p>
                ) : (
                  <div className="space-y-3">
                    {leaderboardData.slice(0, 4).map((user) => (
                      <div key={user.rank} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm w-6 ${
                            user.rank <= 3 ? 'text-[#D4AF37]' : 'text-[#8B92A7]'
                          }`}>
                            #{user.rank}
                          </span>
                          <span className={`text-sm ${
                            user.isCurrentUser ? 'text-[#D4AF37] font-semibold' : 'text-[#E8EAED]'
                          }`}>
                            {user.isCurrentUser ? 'You' : user.name}
                          </span>
                        </div>
                        <span className="text-sm text-[#8B92A7]">{user.points} XP</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Popular Tags */}
            <Card className="bg-[#0F1829] border-[#1A2332]">
              <CardContent className="p-6">
                <h3 className="text-[#E8EAED] font-semibold mb-4 flex items-center gap-2">
                  <Tag size={20} className="text-[#D4AF37]" />
                  Popular Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer hover:bg-[#D4AF37]/10 border-[#2A3342] text-[#8B92A7]"
                      onClick={() => handleAddTag(tag)}
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Floating Create Post Button (Mobile & Desktop) */}
      <Button
        onClick={() => onNavigate?.('create-post')}
        className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-50 h-14 w-14 md:h-16 md:w-16 rounded-full bg-[#D4AF37] hover:bg-[#C19B2E] text-[#0B1426] shadow-2xl flex items-center justify-center group transition-all duration-300 hover:scale-110"
        size="icon"
        aria-label="Create new post"
      >
        <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
      </Button>
    </div>
  );
}
