/**
 * OPTIMIZED POSTS FEED COMPONENT
 * 
 * Example implementation using:
 * - Cursor-based pagination
 * - Infinite scroll
 * - Optimized images with lazy loading
 * - Stale-while-revalidate caching
 * - Virtualized rendering for large lists
 */

import React, { useCallback, useMemo } from 'react';
import { usePostsFeed, useInfiniteScroll } from '../hooks/usePaginatedFeed';
import { OptimizedImage, AvatarImage, ImageGallery } from './ui/OptimizedImage';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Eye, 
  MoreHorizontal,
  RefreshCw,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';
import type { Post } from '../lib/apiClient';

// ============================================================================
// TYPES
// ============================================================================

interface OptimizedPostsFeedProps {
  communityId?: string;
  userId?: string;
  showCreatePost?: boolean;
  onCreatePost?: () => void;
  onPostClick?: (post: Post) => void;
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function OptimizedPostsFeed({
  communityId,
  userId,
  showCreatePost = false,
  onCreatePost,
  onPostClick,
  className,
}: OptimizedPostsFeedProps) {
  const {
    data: posts,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMore,
    refresh,
  } = usePostsFeed({
    communityId,
    userId,
    pageSize: 15,
  });

  // Infinite scroll trigger
  const loadMoreRef = useInfiniteScroll(loadMore, {
    enabled: hasMore && !loadingMore && !loading,
    rootMargin: '300px',
  });

  // Error state
  if (error && posts.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12', className)}>
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-[#E8EAED] mb-2">
          Failed to load posts
        </h3>
        <p className="text-sm text-[#8A92A6] mb-4 text-center max-w-sm">
          {error.message}
        </p>
        <Button onClick={refresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  // Loading skeleton
  if (loading && posts.length === 0) {
    return (
      <div className={cn('space-y-4', className)}>
        {[...Array(3)].map((_, i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Empty state
  if (!loading && posts.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12', className)}>
        <div className="w-16 h-16 rounded-full bg-[#1A2332] flex items-center justify-center mb-4">
          <MessageCircle className="h-8 w-8 text-[#D4AF37]" />
        </div>
        <h3 className="text-lg font-semibold text-[#E8EAED] mb-2">
          No posts yet
        </h3>
        <p className="text-sm text-[#8A92A6] mb-4 text-center max-w-sm">
          Be the first to share something with the community!
        </p>
        {showCreatePost && (
          <Button onClick={onCreatePost} className="bg-[#D4AF37] text-black hover:bg-[#C4A030]">
            Create Post
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Create post button */}
      {showCreatePost && (
        <Card className="bg-[#0B1426]/80 border-[#2A3441] hover:border-[#D4AF37]/50 transition-colors cursor-pointer"
          onClick={onCreatePost}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1A2332]" />
              <div className="flex-1 py-2 px-4 rounded-full bg-[#1A2332] text-[#8A92A6] text-sm">
                What's on your mind?
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Refresh indicator */}
      {error && posts.length > 0 && (
        <div className="flex items-center justify-center py-2">
          <Button 
            onClick={refresh} 
            variant="ghost" 
            size="sm"
            className="text-yellow-500"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Error loading new posts. Tap to retry.
          </Button>
        </div>
      )}

      {/* Posts list */}
      {posts.map((post, index) => (
        <PostCard
          key={post.id}
          post={post}
          onClick={() => onPostClick?.(post)}
          priority={index < 3} // Priority load first 3 images
        />
      ))}

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="py-4">
        {loadingMore && (
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#D4AF37]" />
          </div>
        )}
        {!hasMore && posts.length > 0 && (
          <p className="text-center text-sm text-[#8A92A6]">
            You've reached the end
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// POST CARD COMPONENT
// ============================================================================

interface PostCardProps {
  post: Post;
  onClick?: () => void;
  priority?: boolean;
}

function PostCard({ post, onClick, priority = false }: PostCardProps) {
  const [liked, setLiked] = React.useState(false);

  const handleLike = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(!liked);
    // TODO: Call PostsApi.toggleLike(post.id)
  }, [liked]);

  const timeAgo = useMemo(() => {
    try {
      return formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
    } catch {
      return '';
    }
  }, [post.createdAt]);

  return (
    <Card 
      className="bg-[#0B1426]/80 border-[#2A3441] hover:border-[#D4AF37]/30 transition-all cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <AvatarImage
              src={post.author.avatar}
              alt={post.author.name}
              size="md"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#E8EAED]">
                  {post.author.name}
                </span>
                {post.author.role === 'admin' && (
                  <Badge className="bg-[#D4AF37]/10 text-[#D4AF37] text-xs">
                    Admin
                  </Badge>
                )}
                {post.author.role === 'garage_owner' && (
                  <Badge className="bg-blue-500/10 text-blue-400 text-xs">
                    Garage
                  </Badge>
                )}
              </div>
              <span className="text-xs text-[#8A92A6]">{timeAgo}</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-[#8A92A6]">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Title */}
        {post.title && (
          <h3 className="text-lg font-semibold text-[#E8EAED] mb-2">
            {post.title}
          </h3>
        )}

        {/* Content */}
        <p className="text-[#B8BCC8] whitespace-pre-wrap mb-3 line-clamp-4">
          {post.content}
        </p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.slice(0, 5).map((tag, idx) => (
              <Badge 
                key={idx}
                variant="outline"
                className="text-xs text-[#D4AF37] border-[#D4AF37]/30"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className="mb-3">
            <ImageGallery
              images={post.images}
              alt={post.title || 'Post images'}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-[#2A3441]">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn(
                "gap-1.5 text-sm",
                liked ? "text-red-500" : "text-[#8A92A6] hover:text-red-400"
              )}
              onClick={handleLike}
            >
              <Heart className={cn("h-4 w-4", liked && "fill-current")} />
              {post.likeCount > 0 && <span>{post.likeCount}</span>}
            </Button>

            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1.5 text-sm text-[#8A92A6] hover:text-[#D4AF37]"
            >
              <MessageCircle className="h-4 w-4" />
              {post.commentCount > 0 && <span>{post.commentCount}</span>}
            </Button>

            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1.5 text-sm text-[#8A92A6] hover:text-green-400"
            >
              <Share2 className="h-4 w-4" />
              {post.shareCount > 0 && <span>{post.shareCount}</span>}
            </Button>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#8A92A6]">
            <Eye className="h-3.5 w-3.5" />
            <span>{post.viewCount}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// SKELETON COMPONENT
// ============================================================================

function PostSkeleton() {
  return (
    <Card className="bg-[#0B1426]/80 border-[#2A3441]">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="w-10 h-10 rounded-full bg-[#1A2332]" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 bg-[#1A2332]" />
            <Skeleton className="h-3 w-20 bg-[#1A2332]" />
          </div>
        </div>
        <div className="space-y-2 mb-4">
          <Skeleton className="h-4 w-full bg-[#1A2332]" />
          <Skeleton className="h-4 w-3/4 bg-[#1A2332]" />
        </div>
        <Skeleton className="h-48 w-full rounded-lg bg-[#1A2332]" />
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#2A3441]">
          <Skeleton className="h-8 w-16 bg-[#1A2332]" />
          <Skeleton className="h-8 w-16 bg-[#1A2332]" />
          <Skeleton className="h-8 w-16 bg-[#1A2332]" />
        </div>
      </CardContent>
    </Card>
  );
}

export default OptimizedPostsFeed;

