import { PropsWithChildren, useEffect, useState, createContext, useContext } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../utils/supabase/client'

// Create context for session
const SessionContext = createContext<{ session: Session | null }>({ session: null })

export function useSession() {
  return useContext(SessionContext)
}

export default function SupabaseProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null)
      setLoading(false)
      console.log('✅ Session loaded:', data.session?.user?.email || 'No session')
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null)
      console.log('🔄 Auth state changed:', newSession?.user?.email || 'Logged out')
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--sublimes-dark-bg)]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--sublimes-gold)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading session...</p>
        </div>
      </div>
    )
  }

  return (
    <SessionContext.Provider value={{ session }}>
      {children}
    </SessionContext.Provider>
  )
}

