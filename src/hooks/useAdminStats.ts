/**
 * ADMIN STATS HOOK
 * 
 * Provides optimized admin dashboard data using:
 * - Precomputed materialized views
 * - Cached responses
 * - Real-time health indicators
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../utils/supabase/client';
import { StatsApi, type DashboardStats, type PlatformStats, type ApiError } from '../lib/apiClient';
import { cache, CacheKeys, CacheTTL, CacheTags } from '../lib/cacheService';

// ============================================================================
// TYPES
// ============================================================================

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  timestamp: string;
  database: {
    connected: boolean;
    activeConnections: number;
    totalConnections: number;
  };
  tables: {
    profiles: number;
    posts: number;
    marketplaceListings: number;
  };
  queues: {
    pendingImages: number;
    failedImages: number;
  };
  materializedViews: {
    platformStatsAge: number;
  };
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId: string | null;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

// ============================================================================
// DASHBOARD STATS HOOK
// ============================================================================

export function useAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const result = await StatsApi.getDashboardStats();
      
      if (result.error) {
        setError(result.error);
      } else {
        setStats(result.data);
        setError(null);
      }
    } catch (err) {
      setError({
        code: 'FETCH_ERROR',
        message: err instanceof Error ? err.message : 'Failed to load dashboard stats',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    // Auto-refresh every 5 minutes
    refreshInterval.current = setInterval(fetchStats, 5 * 60 * 1000);

    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [fetchStats]);

  const refresh = useCallback(() => {
    cache.invalidateByTag(CacheTags.STATS);
    setLoading(true);
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refresh,
  };
}

// ============================================================================
// SYSTEM HEALTH HOOK
// ============================================================================

export function useSystemHealth() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      const { data, error: rpcError } = await supabase.rpc('fn_system_health_check');

      if (rpcError) throw rpcError;

      if (data) {
        setHealth({
          status: data.status,
          timestamp: data.timestamp,
          database: {
            connected: data.database?.connected ?? false,
            activeConnections: data.database?.active_connections ?? 0,
            totalConnections: data.database?.total_connections ?? 0,
          },
          tables: {
            profiles: data.tables?.profiles ?? 0,
            posts: data.tables?.posts ?? 0,
            marketplaceListings: data.tables?.marketplace_listings ?? 0,
          },
          queues: {
            pendingImages: data.queues?.pending_images ?? 0,
            failedImages: data.queues?.failed_images ?? 0,
          },
          materializedViews: {
            platformStatsAge: data.materialized_views?.platform_stats_age ?? 0,
          },
        });
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check system health');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();

    // Auto-refresh every 30 seconds
    refreshInterval.current = setInterval(fetchHealth, 30 * 1000);

    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [fetchHealth]);

  const refresh = useCallback(() => {
    setLoading(true);
    fetchHealth();
  }, [fetchHealth]);

  return {
    health,
    loading,
    error,
    refresh,
    isHealthy: health?.status === 'healthy',
    isDegraded: health?.status === 'degraded',
  };
}

// ============================================================================
// AUDIT LOGS HOOK
// ============================================================================

export function useAuditLogs(options: {
  actorId?: string;
  entityType?: string;
  action?: string;
  limit?: number;
} = {}) {
  const { actorId, entityType, action, limit = 50 } = options;

  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const offsetRef = useRef(0);

  const fetchLogs = useCallback(async (reset = false) => {
    if (reset) {
      offsetRef.current = 0;
      setLogs([]);
    }

    try {
      setLoading(true);

      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offsetRef.current, offsetRef.current + limit - 1);

      if (actorId) query = query.eq('actor_id', actorId);
      if (entityType) query = query.eq('entity_type', entityType);
      if (action) query = query.eq('action', action);

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const formattedLogs: AuditLogEntry[] = (data || []).map((log: any) => ({
        id: log.id,
        actorId: log.actor_id,
        actorEmail: log.actor_email,
        action: log.action,
        entityType: log.entity_type,
        entityId: log.entity_id,
        oldValues: log.old_values,
        newValues: log.new_values,
        ipAddress: log.ip_address,
        userAgent: log.user_agent,
        createdAt: log.created_at,
      }));

      if (reset) {
        setLogs(formattedLogs);
      } else {
        setLogs(prev => [...prev, ...formattedLogs]);
      }

      setHasMore(formattedLogs.length === limit);
      offsetRef.current += formattedLogs.length;
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [actorId, entityType, action, limit]);

  useEffect(() => {
    fetchLogs(true);
  }, [actorId, entityType, action]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchLogs(false);
    }
  }, [loading, hasMore, fetchLogs]);

  const refresh = useCallback(() => {
    fetchLogs(true);
  }, [fetchLogs]);

  return {
    logs,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
  };
}

// ============================================================================
// LOG ADMIN ACTION HELPER
// ============================================================================

export async function logAdminAction(
  action: string,
  entityType: string,
  options: {
    entityId?: string;
    oldValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
  } = {}
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.rpc('fn_log_admin_action', {
      p_action: action,
      p_entity_type: entityType,
      p_entity_id: options.entityId || null,
      p_old_values: options.oldValues || null,
      p_new_values: options.newValues || null,
      p_ip_address: null, // Server will get from request if needed
      p_user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    });

    if (error) throw error;
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to log action',
    };
  }
}

// ============================================================================
// MODERATION HELPERS
// ============================================================================

export async function moderateContent(
  entityType: 'post' | 'comment' | 'listing' | 'user',
  entityId: string,
  action: 'approve' | 'reject' | 'hide' | 'ban' | 'unban',
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    let table: string;
    let updates: Record<string, unknown> = {};

    switch (entityType) {
      case 'post':
        table = 'posts';
        updates = action === 'approve' 
          ? { status: 'active' }
          : action === 'reject' 
            ? { status: 'rejected', rejection_reason: reason }
            : { status: 'hidden' };
        break;
      case 'comment':
        table = 'comments';
        updates = { is_hidden: action === 'hide' };
        break;
      case 'listing':
        table = 'marketplace_listings';
        updates = action === 'approve'
          ? { status: 'approved' }
          : { status: 'rejected', rejection_reason: reason };
        break;
      case 'user':
        table = 'profiles';
        updates = { is_banned: action === 'ban' };
        break;
      default:
        throw new Error(`Unknown entity type: ${entityType}`);
    }

    // Get current values for audit log
    const { data: current } = await supabase
      .from(table)
      .select('*')
      .eq('id', entityId)
      .single();

    // Update entity
    const { error: updateError } = await supabase
      .from(table)
      .update(updates)
      .eq('id', entityId);

    if (updateError) throw updateError;

    // Log the action
    await logAdminAction(`${action}_${entityType}`, entityType, {
      entityId,
      oldValues: current,
      newValues: updates,
    });

    // Invalidate relevant caches
    if (entityType === 'post') {
      cache.invalidateByTag(CacheTags.POSTS);
    } else if (entityType === 'listing') {
      cache.invalidateByTag(CacheTags.LISTINGS);
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Moderation action failed',
    };
  }
}

export default {
  useAdminDashboard,
  useSystemHealth,
  useAuditLogs,
  logAdminAction,
  moderateContent,
};

