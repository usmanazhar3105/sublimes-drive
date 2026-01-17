// RE-EXPORT FROM UNIFIED CLIENT TO PREVENT DUPLICATE INSTANCES
// This file now just re-exports the singleton from lib/supabase.ts
export { supabase, getSupabaseClient } from '../../lib/supabase'

import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../lib/env'
import { supabase } from '../../lib/supabase'

// API endpoints for our server functions
// Use the functions domain to avoid path mapping issues
const projectHost = new URL(SUPABASE_URL).host
export const API_BASE_URL = `https://${projectHost.replace('.supabase.co', '.functions.supabase.co')}/make-server-97527403`
const API_BASE_URL_FALLBACK = `${SUPABASE_URL}/functions/v1/make-server-97527403`

// Helper function to make API calls (with optional authentication)
export const apiCall = async (endpoint: string, options: RequestInit = {}, requireAuth = true) => {
  const url = `${API_BASE_URL}${endpoint}`
  const fallbackUrl = `${API_BASE_URL_FALLBACK}${endpoint}`
  const baseHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
  }
  const normalizedOptionHeaders: Record<string, string> = options.headers
    ? Object.fromEntries(new Headers(options.headers as HeadersInit))
    : {}
  const headers: Record<string, string> = { ...baseHeaders, ...normalizedOptionHeaders }

  if (requireAuth) {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw new Error('Failed to get session: ' + sessionError.message)
      if (!session || !session.access_token) throw new Error('Sign in required - no active session')
      headers['Authorization'] = `Bearer ${session.access_token}`
      headers['x-client-authorization'] = `Bearer ${session.access_token}`
    } catch (error) {
      if (error instanceof Error) throw error
      throw new Error('Authentication failed')
    }
  } else {
    headers['Authorization'] = `Bearer ${SUPABASE_ANON_KEY}`
    headers['x-client-authorization'] = `Bearer ${SUPABASE_ANON_KEY}`
  }

  const doFetch = async (u: string) => fetch(u, { ...options, headers, cache: 'no-store' })
  let lastErr: any = null

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      let response = await doFetch(url)
      if (response.status === 404) {
        const r2 = await doFetch(fallbackUrl)
        if (!r2.ok) {
          const body = await r2.text().catch(() => '')
          throw new Error(`HTTP ${r2.status}: ${r2.statusText}${body ? ` - ${body.slice(0,200)}` : ''}`)
        }
        return r2.json()
      }
      if (response.ok) return response.json()
      if (response.status >= 500 || response.status === 429) {
        await new Promise(r => setTimeout(r, 250 * Math.pow(2, attempt)))
        continue
      }
      const body = await response.text().catch(() => '')
      throw new Error(`HTTP ${response.status}: ${response.statusText}${body ? ` - ${body.slice(0,200)}` : ''}`)
    } catch (e: any) {
      lastErr = e
      try {
        const r3 = await doFetch(fallbackUrl)
        if (r3.ok) return r3.json()
      } catch (_) {}
      if (attempt < 2) await new Promise(r => setTimeout(r, 250 * Math.pow(2, attempt)))
    }
  }
  if (lastErr instanceof Error) throw lastErr
  throw new Error('Request failed')
}

// Helper function for public API calls (no auth required)
export const publicApiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  const fallbackUrl = `${API_BASE_URL_FALLBACK}${endpoint}`
  const baseHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'apikey': SUPABASE_ANON_KEY,
  }
  const normalizedOptionHeaders: Record<string, string> = options.headers
    ? Object.fromEntries(new Headers(options.headers as HeadersInit))
    : {}
  const headers: Record<string, string> = { ...baseHeaders, ...normalizedOptionHeaders }

  const doFetch = async (u: string) => fetch(u, { ...options, headers, cache: 'no-store' })
  let lastErr: any = null

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await doFetch(url)
      if (response.status === 404) {
        const r2 = await doFetch(fallbackUrl)
        if (!r2.ok) {
          const body = await r2.text().catch(() => '')
          throw new Error(`HTTP ${r2.status}: ${r2.statusText}${body ? ` - ${body.slice(0,200)}` : ''}`)
        }
        return r2.json()
      }
      if (response.ok) return response.json()
      if (response.status >= 500 || response.status === 429) {
        await new Promise(r => setTimeout(r, 250 * Math.pow(2, attempt)))
        continue
      }
      const body = await response.text().catch(() => '')
      throw new Error(`HTTP ${response.status}: ${response.statusText}${body ? ` - ${body.slice(0,200)}` : ''}`)
    } catch (e: any) {
      lastErr = e
      try {
        const r3 = await doFetch(fallbackUrl)
        if (r3.ok) return r3.json()
      } catch (_) {}
      if (attempt < 2) await new Promise(r => setTimeout(r, 250 * Math.pow(2, attempt)))
    }
  }
  if (lastErr instanceof Error) throw lastErr
  throw new Error('Request failed')
}

// Authentication helpers
export const authService = {
  signUp: async (email: string, password: string, userData: any) => {
    return publicApiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, userData }),
    })
  },

  signIn: async (email: string, password: string) => {
    return publicApiCall('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  signOut: async () => {
    return supabase.auth.signOut()
  },

  getSession: async () => {
    return supabase.auth.getSession()
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback)
  },
}

// Data services
export const dataService = {
  // Health check (public)
  healthCheck: () => publicApiCall('/health'),

  // Listings (public read, auth required for write)
  getListings: () => publicApiCall('/listings'),
  createListing: (listingData: any) => apiCall('/listings', {
    method: 'POST',
    body: JSON.stringify(listingData),
  }),

  // Garages (public)
  getGarages: () => publicApiCall('/garages'),

  // Communities (public)
  getCommunities: () => publicApiCall('/communities'),

  // Events (public)
  getEvents: () => publicApiCall('/events'),

  // Offers (public)
  getOffers: () => publicApiCall('/offers'),

  // Repair Bids (public)
  getRepairBids: () => publicApiCall('/repair-bids'),

  // Profile (auth required)
  getProfile: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        // Handle permission errors gracefully
        if (error.code === '42501') {
          console.error('Error fetching profile:', {
            code: error.code,
            details: error.details,
            hint: error.hint,
            message: error.message
          });
          console.warn('⚠️ Database permissions not configured yet.');
          console.warn('👉 Run: 🚨_FIX_ALL_PERMISSIONS_AND_TABLES.sql in Supabase SQL Editor');
        } else {
          console.warn('Profile fetch error:', error.message);
        }
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (err) {
      console.warn('Profile fetch failed:', err);
      return { data: null, error: err };
    }
  },
  updateProfile: (profileData: any) => apiCall('/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  }),

  // Notifications (auth required)
  getNotifications: () => apiCall('/notifications'),

  // Search (public)
  search: (query: string, type?: string) => {
    const params = new URLSearchParams({ q: query })
    if (type) params.append('type', type)
    return publicApiCall(`/search?${params.toString()}`)
  },

  // Initialize sample data (public)
  initSampleData: () => publicApiCall('/init-sample-data', { method: 'POST' }),

  // Auth methods for compatibility
  signup: (userData: { email: string; password: string; fullName: string }) =>
    authService.signUp(userData.email, userData.password, { full_name: userData.fullName }),
  
  login: (credentials: { email: string; password: string }) =>
    authService.signIn(credentials.email, credentials.password),
}