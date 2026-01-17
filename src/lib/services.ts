/**
 * Services Configuration
 * 
 * Centralized configuration for all external services.
 * All service credentials should be accessed through this module.
 * 
 * @module lib/services
 */

import { 
  SUPABASE_URL, 
  SUPABASE_ANON_KEY, 
  STRIPE_PUBLISHABLE_KEY, 
  GOOGLE_MAPS_API_KEY,
  SENTRY_DSN,
  POSTHOG_KEY,
  POSTHOG_HOST,
  IS_PRODUCTION,
} from './env';

// =============================================================================
// SERVICE STATUS
// =============================================================================

export interface ServiceStatus {
  name: string;
  configured: boolean;
  required: boolean;
  docs?: string;
}

export function getServicesStatus(): ServiceStatus[] {
  return [
    {
      name: 'Supabase',
      configured: !!(SUPABASE_URL && SUPABASE_ANON_KEY),
      required: true,
      docs: 'https://supabase.com/docs',
    },
    {
      name: 'Stripe',
      configured: !!STRIPE_PUBLISHABLE_KEY,
      required: false,
      docs: 'https://stripe.com/docs',
    },
    {
      name: 'Google Maps',
      configured: !!GOOGLE_MAPS_API_KEY,
      required: false,
      docs: 'https://developers.google.com/maps/documentation',
    },
    {
      name: 'Sentry',
      configured: !!SENTRY_DSN,
      required: false,
      docs: 'https://docs.sentry.io/',
    },
    {
      name: 'PostHog',
      configured: !!POSTHOG_KEY,
      required: false,
      docs: 'https://posthog.com/docs',
    },
  ];
}

export function logServicesStatus(): void {
  if (!IS_PRODUCTION) {
    console.log('🔧 Services Status:');
    getServicesStatus().forEach(service => {
      const icon = service.configured ? '✅' : (service.required ? '❌' : '⚠️');
      const status = service.configured ? 'Configured' : (service.required ? 'MISSING (Required)' : 'Not configured');
      console.log(`  ${icon} ${service.name}: ${status}`);
    });
  }
}

// =============================================================================
// SUPABASE
// =============================================================================

export const supabaseConfig = {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
  // Project Reference (extracted from URL)
  projectRef: SUPABASE_URL?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || '',
  
  // Edge Functions base URL
  get functionsUrl() {
    return `${this.url}/functions/v1`;
  },
  
  // Storage URL
  get storageUrl() {
    return `${this.url}/storage/v1`;
  },
};

// =============================================================================
// STRIPE
// =============================================================================

export const stripeConfig = {
  publishableKey: STRIPE_PUBLISHABLE_KEY,
  isConfigured: !!STRIPE_PUBLISHABLE_KEY,
  
  // Currency settings for UAE
  currency: 'aed',
  currencyDisplay: 'AED',
  
  // Minimum amounts (in minor units - fils)
  minimums: {
    wallet: 1000, // AED 10
    listing: 5000, // AED 50
    boost: 2500, // AED 25
  },
  
  // Test cards for development
  testCards: {
    success: '4242 4242 4242 4242',
    decline: '4000 0000 0000 0002',
    requiresAuth: '4000 0025 0000 3155',
  },
  
  // Webhook endpoint
  get webhookEndpoint() {
    return `${supabaseConfig.functionsUrl}/stripe-webhook`;
  },
  
  // Checkout edge function
  get checkoutEndpoint() {
    return `${supabaseConfig.functionsUrl}/stripe-create-checkout`;
  },
};

// =============================================================================
// GOOGLE MAPS & TRANSLATE
// =============================================================================

export const googleConfig = {
  mapsApiKey: GOOGLE_MAPS_API_KEY,
  isConfigured: !!GOOGLE_MAPS_API_KEY,
  
  // Map defaults for UAE
  defaultCenter: { lat: 25.2048, lng: 55.2708 }, // Dubai
  defaultZoom: 12,
  
  // Country restrictions
  countryRestrictions: ['ae'], // UAE only
  
  // Libraries to load
  libraries: ['places', 'geometry'] as const,
  
  // Dark theme styles
  mapStyles: [
    { elementType: 'geometry', stylers: [{ color: '#0B1426' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#0B1426' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#8B92A7' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#1A2332' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1A2332' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#2A3442' }] },
  ],
};

// =============================================================================
// ANALYTICS & MONITORING
// =============================================================================

export const analyticsConfig = {
  // Sentry
  sentry: {
    dsn: SENTRY_DSN,
    isConfigured: !!SENTRY_DSN,
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  },
  
  // PostHog
  posthog: {
    key: POSTHOG_KEY,
    host: POSTHOG_HOST || 'https://app.posthog.com',
    isConfigured: !!POSTHOG_KEY,
  },
};

// =============================================================================
// FEE CALCULATION (Per Project Rules)
// =============================================================================

export const feeConfig = {
  // Car listings: AED 50 flat + 5% VAT
  car: {
    base: 50,
    vatRate: 0.05,
    calculate: (amount?: number) => {
      const base = 50;
      const vat = base * 0.05;
      return { base, vat, total: base + vat };
    },
  },
  
  // Parts listings: 8% of amount + 5% VAT
  parts: {
    rate: 0.08,
    vatRate: 0.05,
    calculate: (amount: number) => {
      const base = amount * 0.08;
      const vat = base * 0.05;
      return { base, vat, total: base + vat };
    },
  },
  
  // Garage services: AED 100 flat + 5% VAT
  garage: {
    base: 100,
    vatRate: 0.05,
    calculate: (amount?: number) => {
      const base = 100;
      const vat = base * 0.05;
      return { base, vat, total: base + vat };
    },
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if all required services are configured
 */
export function areRequiredServicesConfigured(): boolean {
  return getServicesStatus()
    .filter(s => s.required)
    .every(s => s.configured);
}

/**
 * Get missing required services
 */
export function getMissingRequiredServices(): string[] {
  return getServicesStatus()
    .filter(s => s.required && !s.configured)
    .map(s => s.name);
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency = 'AED'): string {
  return `${currency} ${amount.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Convert minor units (fils) to major units (AED)
 */
export function filsToAed(fils: number): number {
  return fils / 100;
}

/**
 * Convert major units (AED) to minor units (fils)
 */
export function aedToFils(aed: number): number {
  return Math.round(aed * 100);
}













