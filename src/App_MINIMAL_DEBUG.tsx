import { useState, useEffect } from 'react';

export default function App() {
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      console.log('🚀 App Mounting...');
      setMounted(true);
      console.log('✅ App Mounted Successfully');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ Mount Error:', errorMsg);
      setError(errorMsg);
    }
  }, []);

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0B1426',
        color: '#E8EAED',
        fontFamily: 'system-ui, sans-serif',
        padding: '20px'
      }}>
        <div style={{ maxWidth: '600px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '16px', color: '#D4AF37' }}>
            ⚠️ App Error
          </h1>
          <p style={{ marginBottom: '16px', color: '#ff6b6b' }}>
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              backgroundColor: '#D4AF37',
              color: '#0B1426',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Reload App
          </button>
        </div>
      </div>
    );
  }

  if (!mounted) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0B1426',
        color: '#E8EAED'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #2A3441',
            borderTop: '4px solid #D4AF37',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p>Loading Sublimes Drive...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0B1426',
      color: '#E8EAED',
      fontFamily: 'system-ui, sans-serif',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '24px', color: '#D4AF37' }}>
          ✅ Sublimes Drive - Diagnostic Mode
        </h1>
        
        <div style={{
          backgroundColor: '#1A1F2E',
          padding: '24px',
          borderRadius: '12px',
          marginBottom: '24px',
          border: '1px solid #2A3441'
        }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px', color: '#E8EAED' }}>
            Status Check
          </h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '12px' }}>
              ✅ React App Mounted
            </li>
            <li style={{ marginBottom: '12px' }}>
              ✅ No Runtime Errors
            </li>
            <li style={{ marginBottom: '12px' }}>
              ✅ Basic Rendering Working
            </li>
          </ul>
        </div>

        <div style={{
          backgroundColor: '#1A1F2E',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid #2A3441'
        }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px', color: '#E8EAED' }}>
            Next Steps
          </h2>
          <p style={{ marginBottom: '12px', lineHeight: '1.6' }}>
            If you see this screen, it means:
          </p>
          <ol style={{ paddingLeft: '24px', lineHeight: '1.8' }}>
            <li>Vite is running correctly</li>
            <li>React is rendering successfully</li>
            <li>TypeScript is compiling without errors</li>
          </ol>
          <p style={{ marginTop: '16px', padding: '12px', backgroundColor: '#2A3441', borderRadius: '8px' }}>
            <strong>Action:</strong> Replace App_MINIMAL_DEBUG.tsx with the full App.tsx to test component imports.
          </p>
        </div>

        <div style={{
          marginTop: '24px',
          padding: '16px',
          backgroundColor: '#2A3441',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#8A92A6'
        }}>
          <strong>Console Instructions:</strong> Open Developer Tools (F12) and check the Console tab for any additional error messages.
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
