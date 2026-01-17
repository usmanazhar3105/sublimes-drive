/**
 * 🎯 OFFER ANALYTICS HOOK
 * 
 * Comprehensive analytics tracking for offers:
 * - Track impressions (when offer appears)
 * - Track clicks (when user clicks offer)
 * - Track views (when detail modal opens)
 * - Track claims (when user claims offer)
 * - Track shares (when user shares offer)
 * - Real-time statistics retrieval
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../utils/supabase/client';

interface AnalyticsEvent {
  offer_id: string;
  event_type: 'impression' | 'click' | 'view' | 'claim' | 'share';
  source?: string;
  session_id?: string;
}

interface OfferAnalytics {
  offer_id: string;
  total_impressions: number;
  total_clicks: number;
  total_views: number;
  total_claims: number;
  total_shares: number;
  unique_visitors: number;
  unique_sessions: number;
  click_through_rate: number;
  conversion_rate: number;
  impressions_24h: number;
  clicks_24h: number;
  views_24h: number;
  impressions_7d: number;
  clicks_7d: number;
  last_activity: string;
}

interface DailyAnalytics {
  date: string;
  impressions: number;
  clicks: number;
  views: number;
  claims: number;
  shares: number;
  unique_visitors: number;
  click_through_rate: number;
  conversion_rate: number;
}

// Session ID for tracking unique sessions
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('sublimes_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('sublimes_session_id', sessionId);
  }
  return sessionId;
};

// Debounce impressions to avoid duplicates
const impressionTracker = new Map<string, number>();
const IMPRESSION_DEBOUNCE_MS = 5000; // 5 seconds

export function useOfferAnalytics() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // TRACK ANALYTICS EVENT
  // ============================================================================

  const trackEvent = useCallback(async (event: AnalyticsEvent) => {
    try {
      // Validate offer_id exists
      if (!event.offer_id) {
        console.warn('Analytics tracking skipped: No offer_id provided');
        return;
      }

      // Debounce impressions
      if (event.event_type === 'impression') {
        const lastImpression = impressionTracker.get(event.offer_id);
        const now = Date.now();
        
        if (lastImpression && now - lastImpression < IMPRESSION_DEBOUNCE_MS) {
          return; // Skip duplicate impression
        }
        
        impressionTracker.set(event.offer_id, now);
      }

      // Verify offer exists before tracking
      const { data: offerExists, error: checkError } = await supabase
        .from('offers')
        .select('id')
        .eq('id', event.offer_id)
        .single();

      if (checkError || !offerExists) {
        // Silently skip tracking for non-existent offers (may be cached/stale data)
        if (process.env.NODE_ENV === 'development') {
          console.debug(`[Analytics] Skipped tracking for offer ${event.offer_id}: Offer not found in database`);
        }
        return;
      }

      const session_id = event.session_id || getSessionId();

      // Insert analytics event
      const { error } = await supabase
        .from('offer_analytics')
        .insert({
          offer_id: event.offer_id,
          event_type: event.event_type,
          source: event.source,
          session_id: session_id,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error tracking analytics:', error);
        return;
      }

      // Refresh materialized view periodically
      if (Math.random() < 0.1) { // 10% chance to refresh
        await supabase.rpc('refresh_offer_analytics_summary');
      }
    } catch (err) {
      console.error('Error in trackEvent:', err);
    }
  }, []);

  // ============================================================================
  // CONVENIENCE METHODS
  // ============================================================================

  const trackImpression = useCallback((offerId: string, source?: string) => {
    trackEvent({
      offer_id: offerId,
      event_type: 'impression',
      source
    });
  }, [trackEvent]);

  const trackClick = useCallback((offerId: string, source?: string) => {
    trackEvent({
      offer_id: offerId,
      event_type: 'click',
      source
    });
  }, [trackEvent]);

  const trackView = useCallback((offerId: string, source?: string) => {
    trackEvent({
      offer_id: offerId,
      event_type: 'view',
      source
    });
  }, [trackEvent]);

  const trackClaim = useCallback((offerId: string, source?: string) => {
    trackEvent({
      offer_id: offerId,
      event_type: 'claim',
      source
    });
  }, [trackEvent]);

  const trackShare = useCallback((offerId: string, source?: string) => {
    trackEvent({
      offer_id: offerId,
      event_type: 'share',
      source
    });
  }, [trackEvent]);

  // ============================================================================
  // GET ANALYTICS FOR SPECIFIC OFFER
  // ============================================================================

  const getOfferAnalytics = useCallback(async (offerId: string): Promise<OfferAnalytics | null> => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('offer_analytics_summary')
        .select('*')
        .eq('offer_id', offerId)
        .single();

      if (error) throw error;

      setError(null);
      return data;
    } catch (err) {
      console.error('Error getting offer analytics:', err);
      setError((err as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================================
  // GET ALL OFFERS ANALYTICS
  // ============================================================================

  const getAllOffersAnalytics = useCallback(async (): Promise<OfferAnalytics[]> => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('offer_analytics_summary')
        .select('*')
        .order('total_clicks', { ascending: false });

      if (error) throw error;

      setError(null);
      return data || [];
    } catch (err) {
      console.error('Error getting all offers analytics:', err);
      setError((err as Error).message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================================
  // GET DAILY ANALYTICS FOR OFFER
  // ============================================================================

  const getDailyAnalytics = useCallback(async (
    offerId: string,
    days: number = 30
  ): Promise<DailyAnalytics[]> => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('offer_daily_analytics')
        .select('*')
        .eq('offer_id', offerId)
        .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;

      setError(null);
      return data || [];
    } catch (err) {
      console.error('Error getting daily analytics:', err);
      setError((err as Error).message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================================
  // GET TOP PERFORMING OFFERS
  // ============================================================================

  const getTopPerformingOffers = useCallback(async (limit: number = 10) => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('offer_analytics_summary')
        .select(`
          *,
          offer:offers(
            id,
            title,
            category,
            offer_price,
            discount_percentage,
            is_featured
          )
        `)
        .order('total_clicks', { ascending: false })
        .limit(limit);

      if (error) throw error;

      setError(null);
      return data || [];
    } catch (err) {
      console.error('Error getting top performing offers:', err);
      setError((err as Error).message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================================
  // GET ANALYTICS BY SOURCE
  // ============================================================================

  const getAnalyticsBySource = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('offer_analytics')
        .select('source, event_type')
        .not('source', 'is', null);

      if (error) throw error;

      // Aggregate by source
      const sourceStats = data.reduce((acc: any, row: any) => {
        if (!acc[row.source]) {
          acc[row.source] = {
            impressions: 0,
            clicks: 0,
            views: 0,
            claims: 0,
            shares: 0
          };
        }
        acc[row.source][`${row.event_type}s`]++;
        return acc;
      }, {});

      setError(null);
      return sourceStats;
    } catch (err) {
      console.error('Error getting analytics by source:', err);
      setError((err as Error).message);
      return {};
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================================
  // GET REAL-TIME STATS (LAST HOUR)
  // ============================================================================

  const getRealTimeStats = useCallback(async () => {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('offer_analytics')
        .select('event_type, offer_id, created_at')
        .gte('created_at', oneHourAgo);

      if (error) throw error;

      const stats = {
        total_events: data.length,
        impressions: data.filter(e => e.event_type === 'impression').length,
        clicks: data.filter(e => e.event_type === 'click').length,
        views: data.filter(e => e.event_type === 'view').length,
        claims: data.filter(e => e.event_type === 'claim').length,
        shares: data.filter(e => e.event_type === 'share').length,
        active_offers: new Set(data.map(e => e.offer_id)).size
      };

      return stats;
    } catch (err) {
      console.error('Error getting real-time stats:', err);
      return null;
    }
  }, []);

  return {
    // Tracking methods
    trackEvent,
    trackImpression,
    trackClick,
    trackView,
    trackClaim,
    trackShare,
    
    // Analytics retrieval
    getOfferAnalytics,
    getAllOffersAnalytics,
    getDailyAnalytics,
    getTopPerformingOffers,
    getAnalyticsBySource,
    getRealTimeStats,
    
    // State
    loading,
    error
  };
}
