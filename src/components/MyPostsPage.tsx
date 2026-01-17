/**
 * MyPostsPage - User's Posts with Database Wiring
 * Shows all posts created by the current user
 */

import { useState, useEffect } from 'react';
import { PostCard } from './PostCard';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Loader2, Search, Filter, Plus, Edit, Trash2, Eye, MessageSquare, Heart, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../utils/supabase/client';
import { useRole, useAnalytics } from '../hooks';

interface MyPostsPageProps {
  onNavigate?: (page: string) => void;
}

export function MyPostsPage({ onNavigate }: MyPostsPageProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const { profile } = useRole();
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.trackPageView('/my-posts');
    fetchMyPosts();
  }, []);

  const fetchMyPosts = async () => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      let query = supabase
        .from('posts')
        .select(`
          *,
          author:profiles!posts_author_id_fkey (
            id,
            display_name,
            username,
            avatar_url
          ),
          community:communities (
            id,
            name
          )
        `)
        .eq('author_id', profile.id)
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      setPosts(data || []);
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('author_id', profile?.id); // Safety check

      if (error) throw error;

      toast.success('Post deleted');
      fetchMyPosts();
      analytics.trackEvent('post_deleted', { post_id: postId });
    } catch (error: any) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  // Filter posts
  const filteredPosts = posts.filter(post => {
    // Search filter
    if (searchQuery && !post.content?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Status filter
    if (statusFilter !== 'all' && post.status !== statusFilter) {
      return false;
    }

    return true;
  });

  // Stats
  const stats = {
    total: posts.length,
    approved: posts.filter(p => p.status === 'approved').length,
    pending: posts.filter(p => p.status === 'pending').length,
    rejected: posts.filter(p => p.status === 'rejected').length,
    totalLikes: posts.reduce((sum, p) => sum + (p.likes_count || 0), 0),
    totalComments: posts.reduce((sum, p) => sum + (p.comments_count || 0), 0),
  };

  return (
    <div className="min-h-screen bg-[#0B1426] pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-[#0F1829] border-b border-[#1A2332]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl text-[#E8EAED] mb-2">My Posts</h1>
              <p className="text-sm text-[#8B92A7]">
                Manage all your community posts
              </p>
            </div>
            
            <Button
              onClick={() => onNavigate?.('create-post')}
              className="bg-[#D4AF37] hover:bg-[#C19B2E] text-[#0B1426] gap-2"
            >
              <Plus size={18} />
              Create Post
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B92A7]" size={20} />
              <Input
                placeholder="Search your posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#1A2332] border-[#2A3342] text-[#E8EAED] placeholder:text-[#8B92A7]"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px] bg-[#1A2332] border-[#2A3342] text-[#E8EAED]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A2332] border-[#2A3342]">
                <SelectItem value="all" className="text-[#E8EAED]">All Status</SelectItem>
                <SelectItem value="approved" className="text-[#E8EAED]">Approved</SelectItem>
                <SelectItem value="pending" className="text-[#E8EAED]">Pending</SelectItem>
                <SelectItem value="rejected" className="text-[#E8EAED]">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card className="bg-[#0F1829] border-[#1A2332]">
            <CardContent className="p-4 text-center">
              <div className="text-3xl text-[#D4AF37] mb-1">{stats.total}</div>
              <div className="text-xs text-[#8B92A7]">Total Posts</div>
            </CardContent>
          </Card>

          <Card className="bg-[#0F1829] border-[#1A2332]">
            <CardContent className="p-4 text-center">
              <div className="text-3xl text-green-500 mb-1">{stats.approved}</div>
              <div className="text-xs text-[#8B92A7]">Approved</div>
            </CardContent>
          </Card>

          <Card className="bg-[#0F1829] border-[#1A2332]">
            <CardContent className="p-4 text-center">
              <div className="text-3xl text-yellow-500 mb-1">{stats.pending}</div>
              <div className="text-xs text-[#8B92A7]">Pending</div>
            </CardContent>
          </Card>

          <Card className="bg-[#0F1829] border-[#1A2332]">
            <CardContent className="p-4 text-center">
              <div className="text-3xl text-red-500 mb-1">{stats.rejected}</div>
              <div className="text-xs text-[#8B92A7]">Rejected</div>
            </CardContent>
          </Card>

          <Card className="bg-[#0F1829] border-[#1A2332]">
            <CardContent className="p-4 text-center">
              <div className="text-3xl text-pink-500 mb-1">{stats.totalLikes}</div>
              <div className="text-xs text-[#8B92A7]">Total Likes</div>
            </CardContent>
          </Card>

          <Card className="bg-[#0F1829] border-[#1A2332]">
            <CardContent className="p-4 text-center">
              <div className="text-3xl text-blue-500 mb-1">{stats.totalComments}</div>
              <div className="text-xs text-[#8B92A7]">Comments</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Posts List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin mb-4" />
            <p className="text-[#8B92A7]">Loading your posts...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl text-[#E8EAED] mb-2">
              {posts.length === 0 ? 'No posts yet' : 'No posts match your filters'}
            </h3>
            <p className="text-[#8B92A7] mb-6">
              {posts.length === 0 
                ? 'Start sharing with the community!' 
                : 'Try adjusting your search or filters'}
            </p>
            {posts.length === 0 && (
              <Button
                onClick={() => onNavigate?.('create-post')}
                className="bg-[#D4AF37] hover:bg-[#C19B2E] text-[#0B1426]"
              >
                <Plus size={18} className="mr-2" />
                Create Your First Post
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="bg-[#0F1829] border-[#1A2332]">
                <CardContent className="p-6">
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <Badge 
                      className={
                        post.status === 'approved' 
                          ? 'bg-green-500/20 text-green-400 border-green-500/50'
                          : post.status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                          : 'bg-red-500/20 text-red-400 border-red-500/50'
                      }
                    >
                      {post.status === 'approved' ? '✓ Approved' : 
                       post.status === 'pending' ? '⏳ Pending Review' : 
                       '✗ Rejected'}
                    </Badge>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeletePost(post.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>

                  {/* Community */}
                  {post.community && (
                    <div className="text-sm text-[#8B92A7] mb-2">
                      Posted in: <span className="text-[#D4AF37]">{post.community.name}</span>
                    </div>
                  )}

                  {/* Post Content */}
                  <div className="text-[#E8EAED] mb-4 whitespace-pre-wrap">
                    {post.content}
                  </div>

                  {/* Media */}
                  {post.media && post.media.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {post.media.slice(0, 4).map((mediaUrl: string, idx: number) => (
                        <div key={idx} className="relative aspect-video bg-[#1A2332] rounded-lg overflow-hidden">
                          <img 
                            src={mediaUrl} 
                            alt={`Post media ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-sm text-[#8B92A7] pt-4 border-t border-[#1A2332]">
                    <div className="flex items-center gap-2">
                      <Heart size={16} className="text-pink-500" />
                      <span>{post.likes_count || 0} likes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare size={16} className="text-blue-500" />
                      <span>{post.comments_count || 0} comments</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye size={16} className="text-green-500" />
                      <span>{post.views_count || 0} views</span>
                    </div>
                    <div className="flex-1" />
                    <div className="text-xs">
                      {new Date(post.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
