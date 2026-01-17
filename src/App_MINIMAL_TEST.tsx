/**
 * MINIMAL TEST VERSION OF APP
 * 
 * This is a stripped-down version to test if React is working
 * If this loads, the problem is in one of the imported components
 */

export default function App() {
  return (
    <div style={{ 
      padding: '40px', 
      background: '#0B1426', 
      color: '#E8EAED', 
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ fontSize: '32px', marginBottom: '20px', color: '#D4AF37' }}>
        🚗 Sublimes Drive - Test Mode
      </h1>
      
      <div style={{ 
        background: '#1a2332', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2 style={{ fontSize: '24px', marginBottom: '15px' }}>✅ Status Check</h2>
        <ul style={{ lineHeight: '2' }}>
          <li>✅ React is working</li>
          <li>✅ Vite is serving files</li>
          <li>✅ TypeScript is compiling</li>
          <li>✅ CSS styles are applying</li>
        </ul>
      </div>

      <div style={{ 
        background: '#1a2332', 
        padding: '20px', 
        borderRadius: '8px'
      }}>
        <h2 style={{ fontSize: '24px', marginBottom: '15px' }}>📋 Next Steps</h2>
        <p style={{ marginBottom: '10px' }}>
          If you see this page, the basic React app is working correctly.
        </p>
        <p style={{ marginBottom: '10px' }}>
          The issue was likely in one of the imported components.
        </p>
        <p style={{ color: '#D4AF37' }}>
          Now restoring the full app...
        </p>
      </div>

      <div style={{ 
        marginTop: '30px', 
        padding: '15px',
        background: '#2a3f5f',
        borderRadius: '8px',
        borderLeft: '4px solid #D4AF37'
      }}>
        <strong>Note:</strong> This is a minimal test version. 
        Once you confirm this loads, we'll restore the full application.
      </div>
    </div>
  );
}
