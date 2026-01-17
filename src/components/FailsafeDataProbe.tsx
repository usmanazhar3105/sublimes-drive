import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function FailsafeDataProbe() {
  const [lines, setLines] = useState<string[]>([])

  useEffect(() => {
    (async () => {
      const out: string[] = []
      
      const s = await supabase.auth.getUser()
      out.push(`session: ${s.data.user?.email ?? 'null'}`)
      
      for (const q of [
        ['posts', 'community_posts', 'id'],
        ['comments', 'community_comments', 'id, post_id, author_id, body'],
        ['comment_likes', 'community_comment_likes', 'id, comment_id, user_id'],
      ]) {
        const { data, error, status } = await supabase
          .from(q[1] as any)
          .select(q[2])
          .limit(1)
        
        out.push(`${q[0]} -> ${error ? `FAIL ${status} ${error.message}` : `OK (${data?.length ?? 0})`}`)
      }
      
      setLines(out)
    })()
  }, [])

  if (import.meta.env.VITE_DEBUG_FAILSAFE !== '1') return null

  return (
    <div style={{
      position: 'fixed',
      right: 12,
      bottom: 12,
      background: '#000b',
      color: '#fff',
      padding: 12,
      borderRadius: 12,
      zIndex: 9999,
      fontSize: '12px',
      maxWidth: '300px'
    }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>Failsafe Probe</div>
      {lines.map((l, i) => (
        <div key={i} style={{ fontSize: 12, marginBottom: 4 }}>{l}</div>
      ))}
    </div>
  )
}
