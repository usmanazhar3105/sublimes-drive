import { useEffect } from 'react';
// Analytics RPC functions are not deployed - disabled to prevent 404 errors
// import { supabase } from '../../utils/supabase/client';

export interface AnalyticsEvent {
  name: string;
  props?: Record<string, any>;
}

export function useAnalytics() {
  // Track page views automatically (local only - no RPC)
  useEffect(() => {
    trackPageView(window.location.pathname);
  }, []);

  async function trackEvent(name: string, props?: Record<string, any>) {
    // Analytics RPC disabled - functions not deployed in Supabase
    // Just log locally for debugging
    if (import.meta.env.DEV) {
      console.debug('[Analytics] Event:', name, props);
    }
  }

  async function trackPageView(path: string) {
    // Analytics RPC disabled - functions not deployed in Supabase
    // Just log locally for debugging
    if (import.meta.env.DEV) {
      console.debug('[Analytics] Page view:', path);
    }
  }

  async function trackSignup(method: string = 'email') {
    await trackEvent('signup_complete', { method });
  }

  async function trackLogin(method: string = 'email') {
    await trackEvent('login', { method });
  }

  async function trackListingCreated(listingId: string, category: string) {
    await trackEvent('listing_created', { listing_id: listingId, category });
  }

  async function trackListingViewed(listingId: string) {
    await trackEvent('listing_viewed', { listing_id: listingId });
  }

  async function trackOfferMade(offerId: string, listingId: string, amount: number) {
    await trackEvent('offer_made', {
      offer_id: offerId,
      listing_id: listingId,
      amount,
    });
  }

  async function trackBidCreated(bidId: string, garageId: string) {
    await trackEvent('bid_created', { bid_id: bidId, garage_id: garageId });
  }

  async function trackCheckoutStarted(amount: number, type: string = 'wallet') {
    await trackEvent('checkout_started', { amount, type });
  }

  async function trackCheckoutCompleted(
    amount: number,
    type: string = 'wallet',
    paymentMethod: string = 'stripe'
  ) {
    await trackEvent('checkout_completed', { amount, type, payment_method: paymentMethod });
  }

  async function trackLocaleChanged(locale: string) {
    await trackEvent('locale_changed', { locale });
  }

  async function trackSearch(query: string, filters?: Record<string, any>) {
    await trackEvent('search', { query, filters });
  }

  async function trackShare(type: string, id: string) {
    await trackEvent('share', { type, id });
  }

  async function trackPostCreated(postId: string, communityId: string) {
    await trackEvent('post_created', {
      post_id: postId,
      community_id: communityId,
    });
  }

  async function trackCommentCreated(commentId: string, postId: string) {
    await trackEvent('comment_created', {
      comment_id: commentId,
      post_id: postId,
    });
  }

  async function trackLike(type: string, id: string) {
    await trackEvent('like', { type, id });
  }

  async function trackCommunityJoined(communityId: string) {
    await trackEvent('community_joined', { community_id: communityId });
  }

  async function trackEventRSVP(eventId: string, status: string) {
    await trackEvent('event_rsvp', { event_id: eventId, status });
  }

  async function trackProfileUpdated() {
    await trackEvent('profile_updated');
  }

  async function trackError(error: string, context?: Record<string, any>) {
    // Analytics RPC disabled - functions not deployed in Supabase
    // Just log locally for debugging
    if (import.meta.env.DEV) {
      console.debug('[Analytics] Error:', error, context);
    }
  }

  return {
    trackEvent,
    trackPageView,
    trackSignup,
    trackLogin,
    trackListingCreated,
    trackListingViewed,
    trackOfferMade,
    trackBidCreated,
    trackCheckoutStarted,
    trackCheckoutCompleted,
    trackLocaleChanged,
    trackSearch,
    trackShare,
    trackPostCreated,
    trackCommentCreated,
    trackLike,
    trackCommunityJoined,
    trackEventRSVP,
    trackProfileUpdated,
    trackError,
  };
}

// Hook for analytics dashboard (admin only)
export function useAnalyticsDashboard(dateRange?: { start: Date; end: Date }) {
  // This would fetch aggregated analytics data
  // Implementation depends on your specific analytics needs
  // For now, returning a placeholder
  
  return {
    loading: false,
    error: null,
    data: {
      pageViews: 0,
      users: 0,
      signups: 0,
      listings: 0,
      offers: 0,
      // Add more metrics as needed
    },
  };
}
