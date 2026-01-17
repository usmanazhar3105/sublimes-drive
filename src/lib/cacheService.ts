/**
 * CACHE SERVICE
 * 
 * Client-side caching layer with:
 * - Memory cache with TTL
 * - IndexedDB for persistence
 * - Cache invalidation strategies
 * - Stale-while-revalidate pattern
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
  SHORT_TTL: 60 * 1000, // 1 minute
  LONG_TTL: 30 * 60 * 1000, // 30 minutes
  FEED_TTL: 2 * 60 * 1000, // 2 minutes for feeds
  STATIC_TTL: 24 * 60 * 60 * 1000, // 24 hours for static data
  MAX_CACHE_SIZE: 100, // Maximum items in memory cache
  DB_NAME: 'sublimes_cache',
  DB_VERSION: 1,
  STORE_NAME: 'cache_entries',
};

// ============================================================================
// TYPES
// ============================================================================

interface CacheEntry<T = unknown> {
  key: string;
  data: T;
  timestamp: number;
  ttl: number;
  tags?: string[];
}

interface CacheOptions {
  ttl?: number;
  tags?: string[];
  staleWhileRevalidate?: boolean;
}

type CacheEventListener = (key: string, data: unknown) => void;

// ============================================================================
// MEMORY CACHE
// ============================================================================

class MemoryCache {
  private cache: Map<string, CacheEntry> = new Map();
  private accessOrder: string[] = [];

  set<T>(key: string, data: T, ttl: number, tags?: string[]): void {
    // Evict oldest if at capacity
    if (this.cache.size >= CONFIG.MAX_CACHE_SIZE && !this.cache.has(key)) {
      const oldestKey = this.accessOrder.shift();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      key,
      data,
      timestamp: Date.now(),
      ttl,
      tags,
    });

    // Update access order
    const idx = this.accessOrder.indexOf(key);
    if (idx > -1) {
      this.accessOrder.splice(idx, 1);
    }
    this.accessOrder.push(key);
  }

  get<T>(key: string): { data: T; isStale: boolean } | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    const isStale = age > entry.ttl;

    // Update access order
    const idx = this.accessOrder.indexOf(key);
    if (idx > -1) {
      this.accessOrder.splice(idx, 1);
      this.accessOrder.push(key);
    }

    return {
      data: entry.data as T,
      isStale,
    };
  }

  delete(key: string): void {
    this.cache.delete(key);
    const idx = this.accessOrder.indexOf(key);
    if (idx > -1) {
      this.accessOrder.splice(idx, 1);
    }
  }

  invalidateByTag(tag: string): string[] {
    const invalidated: string[] = [];
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags?.includes(tag)) {
        this.delete(key);
        invalidated.push(key);
      }
    }
    return invalidated;
  }

  invalidateByPrefix(prefix: string): string[] {
    const invalidated: string[] = [];
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.delete(key);
        invalidated.push(key);
      }
    }
    return invalidated;
  }

  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
  }

  size(): number {
    return this.cache.size;
  }

  stats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// ============================================================================
// INDEXEDDB CACHE (Persistent)
// ============================================================================

class PersistentCache {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        resolve();
        return;
      }

      const request = indexedDB.open(CONFIG.DB_NAME, CONFIG.DB_VERSION);

      request.onerror = () => {
        console.warn('IndexedDB not available');
        resolve();
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(CONFIG.STORE_NAME)) {
          const store = db.createObjectStore(CONFIG.STORE_NAME, { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp');
          store.createIndex('tags', 'tags', { multiEntry: true });
        }
      };
    });

    return this.initPromise;
  }

  async set<T>(key: string, data: T, ttl: number, tags?: string[]): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CONFIG.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(CONFIG.STORE_NAME);
      
      const entry: CacheEntry<T> = {
        key,
        data,
        timestamp: Date.now(),
        ttl,
        tags,
      };

      const request = store.put(entry);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async get<T>(key: string): Promise<{ data: T; isStale: boolean } | null> {
    await this.init();
    if (!this.db) return null;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([CONFIG.STORE_NAME], 'readonly');
      const store = transaction.objectStore(CONFIG.STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        const entry = request.result as CacheEntry<T> | undefined;
        if (!entry) {
          resolve(null);
          return;
        }

        const age = Date.now() - entry.timestamp;
        const isStale = age > entry.ttl;

        // Delete if expired (background)
        if (isStale) {
          this.delete(key).catch(() => {});
        }

        resolve({ data: entry.data, isStale });
      };

      request.onerror = () => resolve(null);
    });
  }

  async delete(key: string): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([CONFIG.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(CONFIG.STORE_NAME);
      store.delete(key);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => resolve();
    });
  }

  async clear(): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([CONFIG.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(CONFIG.STORE_NAME);
      store.clear();
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => resolve();
    });
  }
}

// ============================================================================
// CACHE SERVICE
// ============================================================================

class CacheService {
  private memory: MemoryCache;
  private persistent: PersistentCache;
  private listeners: Map<string, Set<CacheEventListener>> = new Map();
  private pendingRequests: Map<string, Promise<unknown>> = new Map();

  constructor() {
    this.memory = new MemoryCache();
    this.persistent = new PersistentCache();
  }

  /**
   * Get item from cache with stale-while-revalidate support
   */
  async get<T>(
    key: string,
    fetcher?: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T | null> {
    const { ttl = CONFIG.DEFAULT_TTL, tags, staleWhileRevalidate = true } = options;

    // Try memory cache first
    const memoryResult = this.memory.get<T>(key);
    if (memoryResult && !memoryResult.isStale) {
      return memoryResult.data;
    }

    // Try persistent cache
    const persistentResult = await this.persistent.get<T>(key);
    if (persistentResult && !persistentResult.isStale) {
      // Promote to memory cache
      this.memory.set(key, persistentResult.data, ttl, tags);
      return persistentResult.data;
    }

    // Return stale data while revalidating in background
    if (staleWhileRevalidate && (memoryResult || persistentResult) && fetcher) {
      const staleData = memoryResult?.data ?? persistentResult?.data;
      
      // Revalidate in background (deduped)
      if (!this.pendingRequests.has(key)) {
        const revalidatePromise = fetcher()
          .then(freshData => {
            this.set(key, freshData, { ttl, tags });
            return freshData;
          })
          .finally(() => {
            this.pendingRequests.delete(key);
          });
        
        this.pendingRequests.set(key, revalidatePromise);
      }

      return staleData as T;
    }

    // No cache, fetch fresh
    if (fetcher) {
      // Dedupe concurrent requests
      if (this.pendingRequests.has(key)) {
        return this.pendingRequests.get(key) as Promise<T>;
      }

      const fetchPromise = fetcher()
        .then(data => {
          this.set(key, data, { ttl, tags });
          return data;
        })
        .finally(() => {
          this.pendingRequests.delete(key);
        });

      this.pendingRequests.set(key, fetchPromise);
      return fetchPromise;
    }

    return null;
  }

  /**
   * Set item in cache
   */
  async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    const { ttl = CONFIG.DEFAULT_TTL, tags } = options;

    // Set in memory
    this.memory.set(key, data, ttl, tags);

    // Set in persistent storage (async, don't await)
    this.persistent.set(key, data, ttl, tags).catch(() => {});

    // Notify listeners
    this.notifyListeners(key, data);
  }

  /**
   * Delete item from cache
   */
  async delete(key: string): Promise<void> {
    this.memory.delete(key);
    await this.persistent.delete(key);
  }

  /**
   * Invalidate cache by tag
   */
  invalidateByTag(tag: string): string[] {
    return this.memory.invalidateByTag(tag);
  }

  /**
   * Invalidate cache by key prefix
   */
  invalidateByPrefix(prefix: string): string[] {
    return this.memory.invalidateByPrefix(prefix);
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    this.memory.clear();
    await this.persistent.clear();
  }

  /**
   * Subscribe to cache updates
   */
  subscribe(key: string, listener: CacheEventListener): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.get(key)?.delete(listener);
    };
  }

  private notifyListeners(key: string, data: unknown): void {
    // Exact key listeners
    this.listeners.get(key)?.forEach(listener => listener(key, data));

    // Prefix listeners (for patterns like "posts:*")
    for (const [pattern, listeners] of this.listeners.entries()) {
      if (pattern.endsWith(':*') && key.startsWith(pattern.slice(0, -1))) {
        listeners.forEach(listener => listener(key, data));
      }
    }
  }

  /**
   * Get cache statistics
   */
  stats(): { memorySize: number; keys: string[] } {
    return this.memory.stats();
  }
}

// ============================================================================
// CACHE KEY BUILDERS
// ============================================================================

export const CacheKeys = {
  // Feed keys
  postsFeed: (cursor?: string) => `posts:feed:${cursor || 'initial'}`,
  communityFeed: (communityId: string, cursor?: string) => 
    `posts:community:${communityId}:${cursor || 'initial'}`,
  userPosts: (userId: string, cursor?: string) => 
    `posts:user:${userId}:${cursor || 'initial'}`,

  // Single item keys
  post: (id: string) => `post:${id}`,
  profile: (id: string) => `profile:${id}`,
  listing: (id: string) => `listing:${id}`,

  // List keys
  marketplaceListings: (filters: string) => `marketplace:${filters}`,
  garages: (filters: string) => `garages:${filters}`,
  notifications: (userId: string) => `notifications:${userId}`,

  // Stats keys
  platformStats: () => 'stats:platform',
  userStats: (userId: string) => `stats:user:${userId}`,
  dashboardStats: () => 'stats:dashboard',

  // Static data
  carBrands: () => 'static:car_brands',
  emirates: () => 'static:emirates',
  categories: () => 'static:categories',
};

export const CacheTags = {
  POSTS: 'posts',
  PROFILES: 'profiles',
  LISTINGS: 'listings',
  STATS: 'stats',
  NOTIFICATIONS: 'notifications',
};

export const CacheTTL = CONFIG;

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const cache = new CacheService();

export default cache;

