/**
 * 🚨 DIAGNOSTIC VERSION OF APP.TSX
 * 
 * This version will help identify WHY the app is not loading.
 * Replace App.tsx content with this temporarily to see the exact error.
 */

import { useState, useEffect } from 'react';

export default function App() {
  const [diagnosticResults, setDiagnosticResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [criticalError, setCriticalError] = useState<string | null>(null);

  useEffect(() => {
    async function runDiagnostics() {
      const results: string[] = [];

      try {
        results.push('✅ Step 1: React is rendering');

        // Test 1: Check if Supabase client can be imported
        try {
          const { supabase } = await import('./utils/supabase/client');
          results.push('✅ Step 2: Supabase client imported');

          // Test 2: Check if we can get session
          try {
            const { data, error } = await supabase.auth.getSession();
            if (error) {
              results.push(`⚠️  Step 3: Session check failed: ${error.message}`);
            } else {
              results.push('✅ Step 3: Session check passed');
            }
          } catch (err) {
            results.push(`❌ Step 3: Session error: ${err}`);
          }

          // Test 3: Try to query a simple table
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('count')
              .limit(1);

            if (error) {
              if (error.code === '42P01') {
                results.push(`❌ Step 4: Table 'profiles' does not exist`);
                results.push(`🔧 FIX: Run /supabase/migrations/100_comprehensive_refactor_schema.sql`);
              } else if (error.code === '42501') {
                results.push(`❌ Step 4: Permission denied (RLS blocking)`);
                results.push(`🔧 FIX: Run /supabase/migrations/103_comprehensive_rls_policies.sql`);
              } else {
                results.push(`❌ Step 4: Database error: ${error.message}`);
                results.push(`   Code: ${error.code}`);
              }
            } else {
              results.push('✅ Step 4: Database connection successful');
            }
          } catch (err) {
            results.push(`❌ Step 4: Database connection failed: ${err}`);
          }

          // Test 4: Check specific tables
          const tablesToCheck = [
            'marketplace_listings',
            'offers',
            'posts',
            'communities'
          ];

          for (const table of tablesToCheck) {
            try {
              const { error } = await supabase
                .from(table)
                .select('count')
                .limit(1);

              if (error) {
                if (error.code === '42P01') {
                  results.push(`❌ Table '${table}' missing`);
                } else {
                  results.push(`⚠️  Table '${table}': ${error.message}`);
                }
              } else {
                results.push(`✅ Table '${table}' exists`);
              }
            } catch (err) {
              results.push(`❌ Table '${table}' check failed: ${err}`);
            }
          }

        } catch (err) {
          results.push(`❌ Step 2: Failed to import Supabase client`);
          results.push(`   Error: ${err}`);
          results.push(`🔧 FIX: Check /utils/supabase/info.tsx exists with valid credentials`);
          setCriticalError(`Cannot import Supabase: ${err}`);
        }

      } catch (err) {
        results.push(`❌ CRITICAL: ${err}`);
        setCriticalError(String(err));
      }

      setDiagnosticResults(results);
      setLoading(false);
    }

    runDiagnostics();
  }, []);

  if (loading) {
    return (
      <div style={{
        background: '#0B1426',
        color: '#E8EAED',
        minHeight: '100vh',
        padding: '40px',
        fontFamily: 'monospace'
      }}>
        <h1 style={{ color: '#D4AF37', marginBottom: '20px' }}>
          🔍 Running Diagnostics...
        </h1>
        <div style={{ 
          width: '60px', 
          height: '60px', 
          border: '4px solid #D4AF37', 
          borderTop: '4px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      background: '#0B1426',
      color: '#E8EAED',
      minHeight: '100vh',
      padding: '40px',
      fontFamily: 'monospace',
      fontSize: '14px',
      lineHeight: '1.8'
    }}>
      <h1 style={{ color: '#D4AF37', marginBottom: '30px', fontSize: '28px' }}>
        🔍 Sublimes Drive - Startup Diagnostic Report
      </h1>

      {criticalError && (
        <div style={{
          background: '#ff4444',
          color: 'white',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px',
          border: '2px solid #ff0000'
        }}>
          <h2 style={{ margin: '0 0 10px 0' }}>🚨 CRITICAL ERROR</h2>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{criticalError}</pre>
        </div>
      )}

      <div style={{
        background: '#1A2332',
        padding: '30px',
        borderRadius: '12px',
        border: '1px solid #2A3441'
      }}>
        <h2 style={{ color: '#D4AF37', marginBottom: '20px' }}>
          Diagnostic Results:
        </h2>

        {diagnosticResults.map((result, index) => (
          <div 
            key={index}
            style={{
              padding: '10px 0',
              borderBottom: index < diagnosticResults.length - 1 ? '1px solid #2A3441' : 'none'
            }}
          >
            {result}
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '40px',
        background: '#2A3441',
        padding: '20px',
        borderRadius: '8px'
      }}>
        <h3 style={{ color: '#D4AF37', marginBottom: '15px' }}>
          📋 Next Steps:
        </h3>
        <ol style={{ paddingLeft: '20px' }}>
          <li style={{ marginBottom: '10px' }}>
            <strong>Take a screenshot</strong> of this page and share it
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong>Open browser DevTools</strong> (F12) → Console tab
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong>Copy any RED error messages</strong> from console
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong>Check Supabase Dashboard</strong> → SQL Editor
          </li>
          <li>
            <strong>Run the SQL fixes</strong> suggested above (if any)
          </li>
        </ol>
      </div>

      <div style={{
        marginTop: '30px',
        padding: '15px',
        background: '#D4AF37',
        color: '#0B1426',
        borderRadius: '8px',
        fontWeight: 'bold'
      }}>
        💡 TIP: Press F12 and check the Console tab for more detailed error messages
      </div>
    </div>
  );
}
