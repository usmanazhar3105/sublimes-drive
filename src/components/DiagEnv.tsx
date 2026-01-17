// TEMPORARY DIAGNOSTIC COMPONENT - Environment Verification
export function DiagEnv() {
  return (
    <div style={{ 
      position: 'fixed', 
      top: 10, 
      right: 10, 
      background: '#000', 
      color: '#0f0', 
      padding: '10px',
      fontFamily: 'monospace',
      fontSize: '11px',
      zIndex: 9999,
      maxWidth: '400px',
      border: '2px solid #0f0'
    }}>
      <pre style={{whiteSpace:'pre-wrap', margin: 0}}>
{`🔍 ENV DIAGNOSTICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VITE_SUPABASE_URL=${import.meta.env.VITE_SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${(import.meta.env.VITE_SUPABASE_ANON_KEY||'').slice(0,12)}...${(import.meta.env.VITE_SUPABASE_ANON_KEY||'').slice(-4)}
NODE_ENV=${import.meta.env.MODE}
BUILD_TIME=${new Date().toISOString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`}
      </pre>
    </div>
  );
}

