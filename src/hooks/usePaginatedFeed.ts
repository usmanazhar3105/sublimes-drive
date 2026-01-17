/**
 * USE PAGINATED FEED HOOK
 * 
 * Features:
 * - Cursor-based infinite scrolling
 * - Automatic data loading on scroll
 * - Stale-while-revalidate pattern
 * - Optimistic updates
 * - Deduplication
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { PostsApi, CommentsApi, MarketplaceApi, type Post, type Comment, type Listing, type PaginatedResponse, type ApiError } from '../lib/apiClient';
import { cache, CacheTags } from '../lib/cacheService';

// ============================================================================
// TYPES
// ============================================================================

export interface UsePaginatedFeedOptions<T> {
  initialData?: T[];
  enabled?: boolean;
  pageSize?: number;
  onError?: (error: ApiError) => void;
  dedupe?: boolean;
}

export interface UsePaginatedFeedResult<T> {
  data: T[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: ApiError | null;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export function usePaginatedFeed<T extends { id: string }>(
  fetcher: (cursor?: string, cursorId?: string, limit?: number) => Promise<{ data: PaginatedResponse<T> | null; error: ApiError | null }>,
  options: UsePaginatedFeedOptions<T> = {}
): UsePaginatedFeedResult<T> {
  const {
    initialData = [],
    enabled = true,
    pageSize = 20,
    onError,
    dedupe = true,
  } = options;

  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(enabled);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const cursorRef = useRef<string | undefined>(undefined);
  const cursorIdRef = useRef<string | undefined>(undefined);
  const seenIds = useRef<Set<string>>(new Set());
  const isInitialized = useRef(false);

  // Initial load
  useEffect(() => {
    if (!enabled || isInitialized.current) return;
    isInitialized.current = true;
    loadInitial();
  }, [enabled]);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    cursorRef.current = undefined;
    cursorIdRef.current = undefined;
    seenIds.current.clear();

    try {
      const result = await fetcher(undefined, undefined, pageSize);

      if (result.error) {
        setError(result.error);
        onError?.(result.error);
        return;
      }

      if (result.data) {
        const items = dedupe ? dedupeItems(result.data.data, seenIds.current) : result.data.data;
        setData(items);
        setHasMore(result.data.hasMore);
        cursorRef.current = result.data.cursor;
        cursorIdRef.current = result.data.cursorId;
      }
    } catch (err) {
      const apiError: ApiError = {
        code: 'FETCH_ERROR',
        message: err instanceof Error ? err.message : 'Failed to load data',
      };
      setError(apiError);
      onError?.(apiError);
    } finally {
      setLoading(false);
    }
  }, [fetcher, pageSize, dedupe, onError]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || loading) return;

    setLoadingMore(true);
    setError(null);

    try {
      const result = await fetcher(cursorRef.current, cursorIdRef.current, pageSize);

      if (result.error) {
        setError(result.error);
        onError?.(result.error);
        return;
      }

      if (result.data) {
        const newItems = dedupe ? dedupeItems(result.data.data, seenIds.current) : result.data.data;
        setData(prev => [...prev, ...newItems]);
        setHasMore(result.data.hasMore);
        cursorRef.current = result.data.cursor;
        cursorIdRef.current = result.data.cursorId;
      }
    } catch (err) {
      const apiError: ApiError = {
        code: 'FETCH_ERROR',
        message: err instanceof Error ? err.message : 'Failed to load more data',
      };
      setError(apiError);
      onError?.(apiError);
    } finally {
      setLoadingMore(false);
    }
  }, [fetcher, pageSize, loadingMore, hasMore, loading, dedupe, onError]);

  const refresh = useCallback(async () => {
    isInitialized.current = false;
    setData([]);
    cursorRef.current = undefined;
    cursorIdRef.current = undefined;
    seenIds.current.clear();
    await loadInitial();
  }, [loadInitial]);

  const reset = useCallback(() => {
    setData(initialData);
    setLoading(false);
    setLoadingMore(false);
    setHasMore(true);
    setError(null);
    cursorRef.current = undefined;
    cursorIdRef.current = undefined;
    seenIds.current.clear();
    isInitialized.current = false;
  }, [initialData]);

  return {
    data,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMore,
    refresh,
    reset,
  };
}

// ============================================================================
// HELPER: DEDUPE ITEMS
// ============================================================================

function dedupeItems<T extends { id: string }>(items: T[], seenIds: Set<string>): T[] {
  const unique: T[] = [];
  for (const item of items) {
    if (!seenIds.has(item.id)) {
      seenIds.add(item.id);
      unique.push(item);
    }
  }
  return unique;
}

// ============================================================================
// SPECIALIZED HOOKS
// ============================================================================

/**
 * Hook for posts feed with infinite scrolling
 */
export function usePostsFeed(options: {
  communityId?: string;
  userId?: string;
  enabled?: boolean;
  pageSize?: number;
} = {}) {
  const { communityId, userId, enabled = true, pageSize = 20 } = options;

  const fetcher = useCallback(
    (cursor?: string, cursorId?: string, limit?: number) =>
      PostsApi.getFeed({ cursor, cursorId, limit, communityId, userId }),
    [communityId, userId]
  );

  return usePaginatedFeed<Post>(fetcher, { enabled, pageSize });
}

/**
 * Hook for comments with infinite scrolling
 */
export function useCommentsFeed(postId: string, options: {
  enabled?: boolean;
  pageSize?: number;
} = {}) {
  const { enabled = true, pageSize = 20 } = options;

  const fetcher = useCallback(
    (cursor?: string, cursorId?: string, limit?: number) =>
      CommentsApi.getForPost(postId, { cursor, cursorId, limit }),
    [postId]
  );

  return usePaginatedFeed<Comment>(fetcher, { enabled, pageSize });
}

/**
 * Hook for marketplace listings with filters and infinite scrolling
 */
export function useMarketplaceFeed(options: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  search?: string;
  enabled?: boolean;
  pageSize?: number;
} = {}) {
  const { category, minPrice, maxPrice, location, search, enabled = true, pageSize = 20 } = options;

  const fetcher = useCallback(
    (cursor?: string, cursorId?: string, limit?: number) =>
      MarketplaceApi.getListings({
        cursor,
        cursorId,
        limit,
        category,
        minPrice,
        maxPrice,
        location,
        search,
      }),
    [category, minPrice, maxPrice, location, search]
  );

  const result = usePaginatedFeed<Listing>(fetcher, { enabled, pageSize });

  // Reset when filters change
  useEffect(() => {
    result.refresh();
  }, [category, minPrice, maxPrice, location, search]);

  return result;
}

// ============================================================================
// INTERSECTION OBSERVER HOOK
// ============================================================================

/**
 * Hook to trigger load more when element is visible
 */
export function useInfiniteScroll(
  loadMore: () => void,
  options: {
    enabled?: boolean;
    threshold?: number;
    rootMargin?: string;
  } = {}
) {
  const { enabled = true, threshold = 0.1, rootMargin = '100px' } = options;
  const ref = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!enabled) return;

    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.current.observe(ref.current);
    }

    return () => {
      observer.current?.disconnect();
    };
  }, [enabled, loadMore, threshold, rootMargin]);

  return ref;
}

export default {
  usePaginatedFeed,
  usePostsFeed,
  useCommentsFeed,
  useMarketplaceFeed,
  useInfiniteScroll,
};

