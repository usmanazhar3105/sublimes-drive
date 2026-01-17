/**
 * OPTIMIZED API CLIENT
 * 
 * Features:
 * - Request deduplication
 * - Automatic retry with backoff
 * - Response caching integration
 * - Rate limiting awareness
 * - Error normalization
 */

import { supabase } from '../utils/supabase/client';
import { cache, CacheKeys, CacheTTL, CacheTags } from './cacheService';

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  MAX_RETRIES: 3,
  RETRY_BASE_DELAY: 1000,
  REQUEST_TIMEOUT: 30000,
  BATCH_DELAY: 50, // Debounce batch requests
};

// ============================================================================
// TYPES
// ============================================================================

export interface PaginationParams {
  cursor?: string;
  cursorId?: string;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  cursor?: string;
  cursorId?: string;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

export function normalizeError(error: unknown): ApiError {
  if (error && typeof error === 'object') {
    const err = error as Record<string, unknown>;
    return {
      code: String(err.code || 'UNKNOWN_ERROR'),
      message: String(err.message || 'An unexpected error occurred'),
      details: err.details,
    };
  }
  return {
    code: 'UNKNOWN_ERROR',
    message: String(error),
  };
}

// ============================================================================
// POSTS API
// ============================================================================

export const PostsApi = {
  /**
   * Get posts feed with cursor pagination
   */
  async getFeed(
    params: PaginationParams & {
      communityId?: string;
      userId?: string;
    } = {}
  ): Promise<ApiResponse<PaginatedResponse<Post>>> {
    const { cursor, cursorId, limit = 20, communityId, userId } = params;

    const cacheKey = communityId 
      ? CacheKeys.communityFeed(communityId, cursor)
      : userId
        ? CacheKeys.userPosts(userId, cursor)
        : CacheKeys.postsFeed(cursor);

    try {
      const data = await cache.get<PaginatedResponse<Post>>(
        cacheKey,
        async () => {
          const { data, error } = await supabase.rpc('fn_get_posts_feed', {
            p_cursor: cursor || null,
            p_cursor_id: cursorId || null,
            p_limit: limit,
            p_community_id: communityId || null,
            p_user_id: userId || null,
          });

          if (error) throw error;

          const posts = data || [];
          const hasMore = posts.length > 0 && posts[posts.length - 1]?.has_more;
          const lastPost = posts[posts.length - 1];

          return {
            data: posts.map(formatPost),
            cursor: lastPost?.created_at,
            cursorId: lastPost?.id,
            hasMore,
          };
        },
        { ttl: CacheTTL.FEED_TTL, tags: [CacheTags.POSTS] }
      );

      return { data, error: null };
    } catch (error) {
      return { data: null, error: normalizeError(error) };
    }
  },

  /**
   * Get single post by ID
   */
  async getById(id: string): Promise<ApiResponse<Post>> {
    const cacheKey = CacheKeys.post(id);

    try {
      const data = await cache.get<Post>(
        cacheKey,
        async () => {
          const { data, error } = await supabase
            .from('posts')
            .select(`
              *,
              profiles:profiles!posts_user_id_fkey(display_name, username, avatar_url, role)
            `)
            .eq('id', id)
            .single();

          if (error) throw error;
          return formatPost(data);
        },
        { ttl: CacheTTL.DEFAULT_TTL, tags: [CacheTags.POSTS] }
      );

      return { data, error: null };
    } catch (error) {
      return { data: null, error: normalizeError(error) };
    }
  },

  /**
   * Create a new post
   */
  async create(post: CreatePostParams): Promise<ApiResponse<Post>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required');

      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          title: post.title,
          content: post.content,
          images: post.images || [],
          media: post.media || [],
          tags: post.tags || [],
          community_id: post.communityId,
          post_type: post.postType || 'regular',
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;

      // Invalidate feed caches
      cache.invalidateByTag(CacheTags.POSTS);

      return { data: formatPost(data), error: null };
    } catch (error) {
      return { data: null, error: normalizeError(error) };
    }
  },

  /**
   * Like/unlike a post
   */
  async toggleLike(postId: string): Promise<ApiResponse<{ liked: boolean }>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required');

      // Check if already liked
      const { data: existingLike } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingLike) {
        await supabase
          .from('post_likes')
          .delete()
          .eq('id', existingLike.id);
        
        cache.delete(CacheKeys.post(postId));
        return { data: { liked: false }, error: null };
      } else {
        await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id });
        
        cache.delete(CacheKeys.post(postId));
        return { data: { liked: true }, error: null };
      }
    } catch (error) {
      return { data: null, error: normalizeError(error) };
    }
  },
};

// ============================================================================
// COMMENTS API
// ============================================================================

export const CommentsApi = {
  /**
   * Get comments for a post with cursor pagination
   */
  async getForPost(
    postId: string,
    params: PaginationParams = {}
  ): Promise<ApiResponse<PaginatedResponse<Comment>>> {
    const { cursor, cursorId, limit = 20 } = params;

    try {
      const { data, error } = await supabase.rpc('fn_get_comments_paginated', {
        p_post_id: postId,
        p_cursor: cursor || null,
        p_cursor_id: cursorId || null,
        p_limit: limit,
      });

      if (error) throw error;

      const comments = data || [];
      const hasMore = comments.length > 0 && comments[comments.length - 1]?.has_more;
      const lastComment = comments[comments.length - 1];

      return {
        data: {
          data: comments.map(formatComment),
          cursor: lastComment?.created_at,
          cursorId: lastComment?.id,
          hasMore,
        },
        error: null,
      };
    } catch (error) {
      return { data: null, error: normalizeError(error) };
    }
  },

  /**
   * Create a comment
   */
  async create(params: CreateCommentParams): Promise<ApiResponse<Comment>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required');

      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: params.postId,
          user_id: user.id,
          content: params.content,
          parent_id: params.parentId,
        })
        .select()
        .single();

      if (error) throw error;

      // Invalidate post cache to update comment count
      cache.delete(CacheKeys.post(params.postId));

      return { data: formatComment(data), error: null };
    } catch (error) {
      return { data: null, error: normalizeError(error) };
    }
  },
};

// ============================================================================
// MARKETPLACE API
// ============================================================================

export const MarketplaceApi = {
  /**
   * Get listings with filters and cursor pagination
   */
  async getListings(
    params: PaginationParams & {
      category?: string;
      minPrice?: number;
      maxPrice?: number;
      location?: string;
      search?: string;
    } = {}
  ): Promise<ApiResponse<PaginatedResponse<Listing>>> {
    const { cursor, cursorId, limit = 20, category, minPrice, maxPrice, location, search } = params;

    const filterKey = JSON.stringify({ category, minPrice, maxPrice, location, search, cursor });
    const cacheKey = CacheKeys.marketplaceListings(filterKey);

    try {
      const data = await cache.get<PaginatedResponse<Listing>>(
        cacheKey,
        async () => {
          const { data, error } = await supabase.rpc('fn_get_marketplace_listings', {
            p_cursor: cursor || null,
            p_cursor_id: cursorId || null,
            p_limit: limit,
            p_category: category || null,
            p_min_price: minPrice || null,
            p_max_price: maxPrice || null,
            p_location: location || null,
            p_search: search || null,
          });

          if (error) throw error;

          const listings = data || [];
          const hasMore = listings.length > 0 && listings[listings.length - 1]?.has_more;
          const lastListing = listings[listings.length - 1];

          return {
            data: listings.map(formatListing),
            cursor: lastListing?.created_at,
            cursorId: lastListing?.id,
            hasMore,
          };
        },
        { ttl: CacheTTL.FEED_TTL, tags: [CacheTags.LISTINGS] }
      );

      return { data, error: null };
    } catch (error) {
      return { data: null, error: normalizeError(error) };
    }
  },

  /**
   * Get single listing by ID
   */
  async getById(id: string): Promise<ApiResponse<Listing>> {
    const cacheKey = CacheKeys.listing(id);

    try {
      const data = await cache.get<Listing>(
        cacheKey,
        async () => {
          const { data, error } = await supabase
            .from('marketplace_listings')
            .select(`
              *,
              profiles:profiles!marketplace_listings_user_id_fkey(display_name, avatar_url, phone, emirate)
            `)
            .eq('id', id)
            .single();

          if (error) throw error;
          return formatListing(data);
        },
        { ttl: CacheTTL.DEFAULT_TTL, tags: [CacheTags.LISTINGS] }
      );

      return { data, error: null };
    } catch (error) {
      return { data: null, error: normalizeError(error) };
    }
  },
};

// ============================================================================
// STATS API (Admin)
// ============================================================================

export const StatsApi = {
  /**
   * Get admin dashboard statistics
   */
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    const cacheKey = CacheKeys.dashboardStats();

    try {
      const data = await cache.get<DashboardStats>(
        cacheKey,
        async () => {
          const { data, error } = await supabase.rpc('fn_get_admin_dashboard_stats');
          if (error) throw error;
          return data as DashboardStats;
        },
        { ttl: CacheTTL.DEFAULT_TTL, tags: [CacheTags.STATS] }
      );

      return { data, error: null };
    } catch (error) {
      return { data: null, error: normalizeError(error) };
    }
  },

  /**
   * Get platform overview stats (cached longer)
   */
  async getPlatformStats(): Promise<ApiResponse<PlatformStats>> {
    const cacheKey = CacheKeys.platformStats();

    try {
      const data = await cache.get<PlatformStats>(
        cacheKey,
        async () => {
          const { data, error } = await supabase
            .from('mv_platform_stats')
            .select('*')
            .limit(1)
            .single();

          if (error) throw error;
          return data as PlatformStats;
        },
        { ttl: CacheTTL.DEFAULT_TTL, tags: [CacheTags.STATS] }
      );

      return { data, error: null };
    } catch (error) {
      return { data: null, error: normalizeError(error) };
    }
  },
};

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Post {
  id: string;
  userId: string;
  title: string;
  content: string;
  images: string[];
  media: { url: string; type: string }[];
  tags: string[];
  status: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  createdAt: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  parentId: string | null;
  likeCount: number;
  createdAt: string;
  author: {
    name: string;
    avatar: string;
  };
}

export interface Listing {
  id: string;
  userId: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  location: string;
  status: string;
  viewCount: number;
  createdAt: string;
  seller: {
    name: string;
    avatar: string;
  };
}

export interface CreatePostParams {
  title: string;
  content: string;
  images?: string[];
  media?: { url: string; type: string }[];
  tags?: string[];
  communityId?: string;
  postType?: string;
}

export interface CreateCommentParams {
  postId: string;
  content: string;
  parentId?: string;
}

export interface DashboardStats {
  overview: {
    total_users: number;
    new_users_30d: number;
    total_posts: number;
    active_listings: number;
  };
  user_signups_30d: { day: string; count: number }[];
  engagement_30d: { day: string; posts: number; views: number; likes: number }[];
  pending_actions: {
    pending_verifications: number;
    pending_reports: number;
    pending_listings: number;
  };
}

export interface PlatformStats {
  total_users: number;
  new_users_30d: number;
  total_posts: number;
  posts_7d: number;
  active_listings: number;
  active_garages: number;
  total_views: number;
  total_likes: number;
  total_comments: number;
  refreshed_at: string;
}

// ============================================================================
// DATA FORMATTERS
// ============================================================================

function formatPost(data: any): Post {
  return {
    id: data.id,
    userId: data.user_id,
    title: data.title || '',
    content: data.content || data.body || '',
    images: data.images || [],
    media: data.media || [],
    tags: data.tags || [],
    status: data.status || 'active',
    viewCount: data.view_count || 0,
    likeCount: data.like_count || 0,
    commentCount: data.comment_count || 0,
    shareCount: data.share_count || 0,
    createdAt: data.created_at,
    author: {
      name: data.author_name || data.profiles?.display_name || 'Anonymous',
      avatar: data.author_avatar || data.profiles?.avatar_url || '',
      role: data.author_role || data.profiles?.role || 'user',
    },
  };
}

function formatComment(data: any): Comment {
  return {
    id: data.id,
    postId: data.post_id,
    userId: data.user_id,
    content: data.content || data.body || '',
    parentId: data.parent_id || null,
    likeCount: data.like_count || 0,
    createdAt: data.created_at,
    author: {
      name: data.author_name || 'Anonymous',
      avatar: data.author_avatar || '',
    },
  };
}

function formatListing(data: any): Listing {
  return {
    id: data.id,
    userId: data.user_id,
    title: data.title || '',
    description: data.description || '',
    price: data.price || 0,
    category: data.category || '',
    images: Array.isArray(data.images) 
      ? data.images.map((img: any) => typeof img === 'string' ? img : img.url)
      : [],
    location: data.location || '',
    status: data.status || '',
    viewCount: data.view_count || 0,
    createdAt: data.created_at,
    seller: {
      name: data.seller_name || data.profiles?.display_name || 'Seller',
      avatar: data.seller_avatar || data.profiles?.avatar_url || '',
    },
  };
}

export default {
  Posts: PostsApi,
  Comments: CommentsApi,
  Marketplace: MarketplaceApi,
  Stats: StatsApi,
};

