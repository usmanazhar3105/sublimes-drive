import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anon) {
  // Make failures obvious in dev
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
  console.error('Current env:', { url, anon: anon ? `${anon.slice(0,20)}...` : 'missing' })
}

const supabaseClient = createClient(url!, anon!, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// 🧪 TEST BYPASS: Wrap Supabase client to return mock data when bypass is enabled
export const supabase = new Proxy(supabaseClient, {
  get(target, prop) {
    // Check if test bypass is enabled
    const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const testBypassFromUrl = urlParams.get('testBypass') === 'true';
    const testBypassFromEnv = import.meta.env.DEV && import.meta.env.VITE_TEST_BYPASS === 'true';
    const testBypassFromStorage = typeof window !== 'undefined' && localStorage.getItem('testBypass') === 'true';
    const TEST_BYPASS_ENABLED = import.meta.env.DEV && (testBypassFromUrl || testBypassFromEnv || testBypassFromStorage);
    
    if (TEST_BYPASS_ENABLED && prop === 'auth') {
      // Return mock auth object
      return {
        getSession: async () => ({
          data: {
            session: {
              access_token: 'test-bypass-token',
              refresh_token: 'test-bypass-refresh',
              expires_in: 3600,
              expires_at: Date.now() + 3600000,
              token_type: 'bearer',
              user: {
                id: 'test-bypass-car-owner-id',
                email: 'test-car-owner@sublimesdrive.com',
                user_metadata: {
                  display_name: 'Test Car Owner',
                  full_name: 'Test Car Owner'
                },
                app_metadata: {
                  provider: 'test-bypass',
                  role: 'user'
                }
              }
            }
          },
          error: null
        }),
        getUser: async () => ({
          data: {
            user: {
              id: 'test-bypass-car-owner-id',
              email: 'test-car-owner@sublimesdrive.com',
              user_metadata: {
                display_name: 'Test Car Owner',
                full_name: 'Test Car Owner'
              },
              app_metadata: {
                provider: 'test-bypass',
                role: 'user'
              }
            }
          },
          error: null
        }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: (callback: any) => {
          // Return a subscription that does nothing
          return {
            data: {
              subscription: {
                unsubscribe: () => {}
              }
            }
          };
        },
        signInWithPassword: async () => ({ data: null, error: null }),
        signInWithOAuth: async () => ({ data: null, error: null })
      };
    }
    
    return (target as any)[prop];
  }
})

// Also export as default and createClient for compatibility
export default supabase
export function getSupabaseClient() {
  return supabase
}

