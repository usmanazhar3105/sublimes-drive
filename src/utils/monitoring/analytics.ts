// PostHog Analytics Configuration
// Install: npm install posthog-js

/*
import posthog from 'posthog-js';

export function initAnalytics() {
  if (import.meta.env.PROD && import.meta.env.VITE_POSTHOG_KEY) {
    posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
      api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
      
      // Privacy
      opt_out_capturing_by_default: false,
      respect_dnt: true,
      
      // Performance
      loaded: (posthog) => {
        if (import.meta.env.DEV) posthog.debug();
      },
      
      // Session recording
      session_recording: {
        maskAllInputs: true,
        maskTextSelector: '[data-sensitive]',
      },
      
      // Feature flags
      bootstrap: {
        featureFlags: {},
      },
    });
  }
}

// Track page view
export function trackPageView(path: string) {
  posthog.capture('$pageview', {
    $current_url: path,
  });
}

// Track event
export function trackEvent(
  eventName: string,
  properties?: Record<string, any>
) {
  posthog.capture(eventName, properties);
}

// Identify user
export function identifyUser(
  userId: string,
  traits?: Record<string, any>
) {
  posthog.identify(userId, traits);
}

// Reset user (on logout)
export function resetUser() {
  posthog.reset();
}

// Feature flags
export function isFeatureEnabled(flag: string): boolean {
  return posthog.isFeatureEnabled(flag) ?? false;
}

export function getFeatureFlag(flag: string): string | boolean | undefined {
  return posthog.getFeatureFlag(flag);
}

// A/B testing
export function getVariant(experiment: string): string {
  return posthog.getFeatureFlag(experiment) as string || 'control';
}

// Custom events for Sublimes Drive
export const analytics = {
  // Auth events
  signUp: (method: string) => 
    trackEvent('sign_up', { method }),
  
  signIn: (method: string) => 
    trackEvent('sign_in', { method }),
  
  signOut: () => 
    trackEvent('sign_out'),
  
  // Marketplace events
  viewListing: (listingId: string, category: string) =>
    trackEvent('view_listing', { listing_id: listingId, category }),
  
  createListing: (category: string, price: number) =>
    trackEvent('create_listing', { category, price }),
  
  contactSeller: (listingId: string) =>
    trackEvent('contact_seller', { listing_id: listingId }),
  
  // Community events
  createPost: (communityId: string) =>
    trackEvent('create_post', { community_id: communityId }),
  
  likePost: (postId: string) =>
    trackEvent('like_post', { post_id: postId }),
  
  commentPost: (postId: string) =>
    trackEvent('comment_post', { post_id: postId }),
  
  // Garage events
  viewGarage: (garageId: string) =>
    trackEvent('view_garage', { garage_id: garageId }),
  
  requestBid: (garageId: string, service: string) =>
    trackEvent('request_bid', { garage_id: garageId, service }),
  
  // Payment events
  initiatePayment: (amount: number, type: string) =>
    trackEvent('initiate_payment', { amount, type }),
  
  completePayment: (amount: number, type: string) =>
    trackEvent('complete_payment', { amount, type }),
  
  // Engagement events
  shareContent: (contentType: string, contentId: string) =>
    trackEvent('share_content', { content_type: contentType, content_id: contentId }),
  
  searchPerformed: (query: string, results: number) =>
    trackEvent('search', { query, results }),
};
*/

import { POSTHOG_KEY, POSTHOG_HOST } from '../../lib/env';

// Resolve host with safe fallback (keep key out of logs)
const resolvedPosthogHost = POSTHOG_HOST || 'https://app.posthog.com';

// Using browser console for now - will integrate full PostHog after npm install
export function initAnalytics() {
  if (!POSTHOG_KEY) {
    console.warn('📈 PostHog not configured (missing VITE_POSTHOG_KEY)');
    return;
  }

  console.log('📈 PostHog initialized:', { host: resolvedPosthogHost });
  
  // Track initial page load
  trackPageView(window.location.pathname);
}

export function trackPageView(path: string) {
  if (!POSTHOG_KEY) return;

  console.log('📄 [PostHog] Page view:', path, {
    timestamp: new Date().toISOString(),
    url: window.location.href,
  });
  
  // TODO: Send to PostHog after npm install posthog-js
}

export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (!POSTHOG_KEY) return;

  console.log('📊 [PostHog] Event:', eventName, {
    ...properties,
    timestamp: new Date().toISOString(),
  });
}

export function identifyUser(userId: string, traits?: Record<string, any>) {
  if (!POSTHOG_KEY) return;
  console.log('👤 [PostHog] Identify:', userId, traits);
}

export function resetUser() {
  if (!POSTHOG_KEY) return;
  console.log('🔓 [PostHog] User reset');
}

export function isFeatureEnabled(flag: string): boolean {
  if (!POSTHOG_KEY) return false;
  console.log('🚩 [PostHog] Feature flag:', flag);
  // Default feature flags (update as needed)
  const defaultFlags: Record<string, boolean> = {
    'new-search-ui': false,
    'ai-chat-beta': true,
    'enhanced-filters': true,
  };
  return defaultFlags[flag] || false;
}

export function getFeatureFlag(flag: string): string | boolean | undefined {
  console.log('🚩 [PostHog] Get flag:', flag);
  return isFeatureEnabled(flag);
}

export function getVariant(experiment: string): string {
  console.log('🧪 [PostHog] A/B test:', experiment);
  // Default to control group
  return 'control';
}

export const analytics = {
  signUp: (method: string) => trackEvent('sign_up', { method }),
  signIn: (method: string) => trackEvent('sign_in', { method }),
  signOut: () => trackEvent('sign_out'),
  viewListing: (listingId: string, category: string) => trackEvent('view_listing', { listing_id: listingId, category }),
  createListing: (category: string, price: number) => trackEvent('create_listing', { category, price }),
  contactSeller: (listingId: string) => trackEvent('contact_seller', { listing_id: listingId }),
  createPost: (communityId: string) => trackEvent('create_post', { community_id: communityId }),
  likePost: (postId: string) => trackEvent('like_post', { post_id: postId }),
  commentPost: (postId: string) => trackEvent('comment_post', { post_id: postId }),
  viewGarage: (garageId: string) => trackEvent('view_garage', { garage_id: garageId }),
  requestBid: (garageId: string, service: string) => trackEvent('request_bid', { garage_id: garageId, service }),
  initiatePayment: (amount: number, type: string) => trackEvent('initiate_payment', { amount, type }),
  completePayment: (amount: number, type: string) => trackEvent('complete_payment', { amount, type }),
  shareContent: (contentType: string, contentId: string) => trackEvent('share_content', { content_type: contentType, content_id: contentId }),
  searchPerformed: (query: string, results: number) => trackEvent('search', { query, results }),
};
