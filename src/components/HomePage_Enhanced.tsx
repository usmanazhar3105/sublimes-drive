import { useState, useEffect } from 'react';
import { Plus, TrendingUp, Flame, Tag, ShoppingBag, Wrench, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { PostCardEnhanced } from './PostCard_Enhanced';
import { CreatePostModal } from './CreatePostModal_Full';
import { TrendingTopics } from './TrendingTopics';
import { BannerSlider } from './BannerSlider';
import { DailyChallengesWidget } from './DailyChallengesWidget';
import { usePosts, useProfile } from '../hooks';
import { toast } from 'sonner';

interface HomePageEnhancedProps {
  onNavigate?: (page: string) => void;
  onCreatePost?: () => void;
}

// Main HomePage component
export function HomePage({ onNavigate }: HomePageEnhancedProps) {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [activeTab, setActiveTab] = useState('for-you');
  
  const { posts, loading, createPost, refetch } = usePosts();
  const { profile } = useProfile();

  const handlePostCreated = async (postData: any) => {
    const { post, error } = await createPost({
      content: postData.content,
      images: postData.images || [],
      tags: postData.tags || [],
      location: postData.location,
    });

    if (!error) {
      toast.success('Post created successfully!');
      setShowCreatePost(false);
      refetch();
    }
  };

  // Listen for global post-created events dispatched by App modal
  useEffect(() => {
    const onCreated = () => { try { refetch(); } catch {} };
    window.addEventListener('post-created' as any, onCreated);
    return () => window.removeEventListener('post-created' as any, onCreated);
  }, [refetch]);

  const handleReport = (postId: string) => {
    toast.info('Report submitted. Our team will review it shortly.');
    console.log('Report post:', postId);
  };

  const handleBlock = (userId: string) => {
    toast.info('User blocked successfully');
    console.log('Block user:', userId);
  };

  return (
    <div className="min-h-screen bg-[#0B1426]">
      {/* Banner Slider */}
      <BannerSlider />

      {/* Quick Action Cards */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Exclusive Offers Card */}
          <button
            onClick={() => onNavigate?.('offers')}
            className="relative group bg-gradient-to-br from-emerald-600/80 to-emerald-800/80 rounded-xl p-6 border border-emerald-500/30 hover:border-emerald-400/50 transition-all duration-300 text-left overflow-hidden"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />
            
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg">
                  <Tag className="h-6 w-6 text-white" />
                </div>
                <ArrowRight className="h-5 w-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
              </div>
              
              <h3 className="text-xl text-white mb-2">Exclusive Offers</h3>
              <p className="text-emerald-100 text-sm mb-3">Hot deals & discounts</p>
              <p className="text-emerald-200 text-sm">
                <span className="text-white">15</span> active offers
              </p>
            </div>
          </button>

          {/* Marketplace Card */}
          <button
            onClick={() => onNavigate?.('marketplace')}
            className="relative group bg-gradient-to-br from-blue-600/80 to-blue-800/80 rounded-xl p-6 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 text-left overflow-hidden"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />
            
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg">
                  <ShoppingBag className="h-6 w-6 text-white" />
                </div>
                <ArrowRight className="h-5 w-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
              </div>
              
              <h3 className="text-xl text-white mb-2">Marketplace</h3>
              <p className="text-blue-100 text-sm mb-3">Buy & sell car parts</p>
              <p className="text-blue-200 text-sm">
                <span className="text-white">1.8K</span> items available
              </p>
            </div>
          </button>

          {/* Garage Hub Card */}
          <button
            onClick={() => onNavigate?.('garage')}
            className="relative group bg-gradient-to-br from-amber-700/80 to-amber-900/80 rounded-xl p-6 border border-amber-600/30 hover:border-amber-500/50 transition-all duration-300 text-left overflow-hidden"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />
            
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg">
                  <Wrench className="h-6 w-6 text-white" />
                </div>
                <ArrowRight className="h-5 w-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
              </div>
              
              <h3 className="text-xl text-white mb-2">Garage Hub</h3>
              <p className="text-amber-100 text-sm mb-3">Trusted service partners</p>
              <p className="text-amber-200 text-sm">
                <span className="text-white">340</span> verified garages
              </p>
            </div>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-8 space-y-6">
            {/* Create Post Button */}
            <div className="bg-[#1A1F2E] rounded-lg border border-[#2A3441] p-4">
              <Button
                onClick={() => setShowCreatePost(true)}
                className="w-full bg-gradient-to-r from-[#D4AF37] to-[#DAA520] hover:from-[#DAA520] hover:to-[#D4AF37] text-black"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Post
              </Button>
            </div>

            {/* Feed Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-[#1A1F2E] border border-[#2A3441] w-full grid grid-cols-3">
                <TabsTrigger 
                  value="for-you"
                  className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black"
                >
                  <Flame className="h-4 w-4 mr-2" />
                  For You
                </TabsTrigger>
                <TabsTrigger 
                  value="trending"
                  className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Trending
                </TabsTrigger>
                <TabsTrigger 
                  value="following"
                  className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black"
                >
                  Following
                </TabsTrigger>
              </TabsList>

              <TabsContent value="for-you" className="space-y-4 mt-6">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="h-8 w-8 border-4 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
                  </div>
                ) : posts.length > 0 ? (
                  posts.map((post) => (
                    <PostCardEnhanced
                      key={post.id}
                      postId={post.id}
                      user={{
                        id: post.user_id,
                        name: post.user?.display_name || 'Unknown User',
                        username: post.user?.display_name?.toLowerCase().replace(/\s+/g, '_') || 'user',
                        avatar: post.user?.avatar_url || '',
                        role: (['admin','editor','car_owner','garage_owner','car_browser'].includes(String(post.user?.role))
                          ? (post.user?.role as 'admin' | 'editor' | 'car_owner' | 'garage_owner' | 'car_browser')
                          : 'car_browser'),
                        verified: post.user?.verified || false,
                      }}
                      content={{
                        text: post.content,
                        images: post.images || [],
                        tags: post.tags || [],
                        timestamp: new Date(post.created_at).toLocaleString(),
                        carBrand: post.car_brand || undefined,
                        carModel: post.car_model || undefined,
                        location: post.location || undefined,
                        urgency: post.urgency || undefined,
                      }}
                      views={post.views_count || 0}
                      onReport={handleReport}
                      onBlock={handleBlock}
                    />
                  ))
                ) : (
                  <div className="text-center py-12 bg-[#1A1F2E] rounded-lg border border-[#2A3441]">
                    <h3 className="text-xl text-[#E8EAED] mb-2">No posts yet</h3>
                    <p className="text-[#8A92A6] mb-4">
                      Be the first to share something with the community!
                    </p>
                    <Button
                      onClick={() => setShowCreatePost(true)}
                      className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Post
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="trending" className="space-y-4 mt-6">
                <div className="text-center py-12 bg-[#1A1F2E] rounded-lg border border-[#2A3441]">
                  <TrendingUp className="h-12 w-12 text-[#8A92A6] mx-auto mb-4" />
                  <h3 className="text-xl text-[#E8EAED] mb-2">Trending Posts</h3>
                  <p className="text-[#8A92A6]">
                    Check back later for trending content
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="following" className="space-y-4 mt-6">
                <div className="text-center py-12 bg-[#1A1F2E] rounded-lg border border-[#2A3441]">
                  <h3 className="text-xl text-[#E8EAED] mb-2">Following Feed</h3>
                  <p className="text-[#8A92A6]">
                    Posts from users you follow will appear here
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Trending Topics */}
            <TrendingTopics />

            {/* Quick Stats Card */}
            <div className="bg-[#1A1F2E] rounded-lg border border-[#2A3441] p-6">
              <h3 className="text-[#E8EAED] mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#D4AF37]" />
                Community Stats
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#8A92A6] text-sm">Total Posts</span>
                  <span className="text-[#E8EAED]">{posts.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8A92A6] text-sm">Active Users</span>
                  <span className="text-[#E8EAED]">2.4K</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8A92A6] text-sm">Today's Posts</span>
                  <span className="text-[#E8EAED]">142</span>
                </div>
              </div>
            </div>

            {/* Suggested Actions */}
            <div className="bg-gradient-to-br from-[#D4AF37]/10 to-[#1A1F2E] rounded-lg border border-[#D4AF37]/30 p-6">
              <h3 className="text-[#E8EAED] mb-4">Get Started</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start border-[#2A3441] text-[#E8EAED] hover:bg-[#2A3441]"
                  onClick={() => onNavigate?.('challenges')}
                >
                  🎯 Daily Challenges
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-[#2A3441] text-[#E8EAED] hover:bg-[#2A3441]"
                  onClick={() => onNavigate?.('marketplace')}
                >
                  🚗 Browse Marketplace
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-[#2A3441] text-[#E8EAED] hover:bg-[#2A3441]"
                  onClick={() => onNavigate?.('events')}
                >
                  📅 Upcoming Events
                </Button>
              </div>
            </div>

            {/* Daily Challenges Widget */}
            <div className="mt-6">
              <DailyChallengesWidget />
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {profile && (
        <CreatePostModal
          isOpen={showCreatePost}
          onClose={() => setShowCreatePost(false)}
          onPostCreated={() => {
            setShowCreatePost(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}
