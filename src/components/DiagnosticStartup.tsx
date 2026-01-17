/**
 * Diagnostic Startup Component
 * Tests all connectivity and displays actionable fixes
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase, API_BASE_URL } from '../utils/supabase/client';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/env';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning' | 'pending';
  message: string;
  fix?: string;
}

export function DiagnosticStartup() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [testing, setTesting] = useState(false);

  const runDiagnostics = async () => {
    setTesting(true);
    const diagnostics: DiagnosticResult[] = [];

    // Test 1: Check Supabase Project URL and Anon Key
    diagnostics.push({
      test: 'Supabase Configuration',
      status: SUPABASE_URL && SUPABASE_ANON_KEY ? 'success' : 'error',
      message: SUPABASE_URL && SUPABASE_ANON_KEY 
        ? `Project URL: ${SUPABASE_URL}` 
        : 'Missing Supabase credentials',
      fix: SUPABASE_URL && SUPABASE_ANON_KEY ? undefined : 'Check src/lib/env.ts variables'
    });

    // Test 2: Check Supabase Connection
    try {
      const { error } = await supabase.from('profiles').select('count').limit(1);
      diagnostics.push({
        test: 'Supabase Database Connection',
        status: error ? 'error' : 'success',
        message: error ? `Error: ${error.message}` : 'Database accessible',
        fix: error ? 'Run migrations in Supabase SQL Editor' : undefined
      });
    } catch (err) {
      diagnostics.push({
        test: 'Supabase Database Connection',
        status: 'error',
        message: `Connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
        fix: 'Check Supabase project status at supabase.com/dashboard'
      });
    }

    // Test 3: Check Edge Function (Server)
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        signal: controller.signal
      });
      
      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        diagnostics.push({
          test: 'Edge Function Server',
          status: 'success',
          message: `Server responding (${data.status})`,
        });
      } else {
        diagnostics.push({
          test: 'Edge Function Server',
          status: 'error',
          message: `Server error: ${response.status} ${response.statusText}`,
          fix: 'Deploy the Edge Function: supabase functions deploy server'
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      diagnostics.push({
        test: 'Edge Function Server',
        status: 'warning',
        message: errorMessage.includes('aborted') 
          ? 'Server timeout - not deployed or not responding' 
          : `Connection failed: ${errorMessage}`,
        fix: 'The Edge Function server is not needed for basic functionality. You can skip this.'
      });
    }

    // Test 4: Check marketplace_listings table
    try {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select('id')
        .limit(1);

      diagnostics.push({
        test: 'Marketplace Table',
        status: error ? 'error' : 'success',
        message: error 
          ? `Table error: ${error.message}` 
          : data && data.length > 0 ? 'Table exists with data' : 'Table exists (empty)',
        fix: error?.code === '42P01' 
          ? 'Run: /supabase/migrations/200_MARKETPLACE_COMPLETE_SCHEMA.sql' 
          : error?.code === '42501'
          ? 'Run: /supabase/migrations/201_marketplace_featured_system.sql'
          : undefined
      });
    } catch (err) {
      diagnostics.push({
        test: 'Marketplace Table',
        status: 'error',
        message: `Check failed: ${err instanceof Error ? err.message : 'Unknown'}`,
        fix: 'Run marketplace migrations in Supabase SQL Editor'
      });
    }

    // Test 5: Check offers table
    try {
      const { data, error } = await supabase
        .from('offers')
        .select('id')
        .limit(1);

      diagnostics.push({
        test: 'Offers Table',
        status: error ? 'error' : 'success',
        message: error 
          ? `Table error: ${error.message}` 
          : data && data.length > 0 ? 'Table exists with data' : 'Table exists (empty)',
        fix: error ? 'Run: /supabase/migrations/138_COMPLETE_OFFERS_SYSTEM_SETUP.sql' : undefined
      });
    } catch (err) {
      diagnostics.push({
        test: 'Offers Table',
        status: 'error',
        message: `Check failed: ${err instanceof Error ? err.message : 'Unknown'}`,
        fix: 'Run offers migrations in Supabase SQL Editor'
      });
    }

    // Test 6: Check Auth
    try {
      const { data } = await supabase.auth.getSession();
      diagnostics.push({
        test: 'Authentication',
        status: 'success',
        message: data.session ? `Logged in as ${data.session.user.email}` : 'Not logged in (OK)',
      });
    } catch (err) {
      diagnostics.push({
        test: 'Authentication',
        status: 'error',
        message: `Auth check failed: ${err instanceof Error ? err.message : 'Unknown'}`,
        fix: 'Check Supabase Auth configuration'
      });
    }

    setResults(diagnostics);
    setTesting(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
    }
  };

  const hasErrors = results.some(r => r.status === 'error');
  const allSuccess = results.every(r => r.status === 'success');

  return (
    <div className="min-h-screen bg-[#0B1426] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-[#0F1829] border-[#1A2332]">
          <CardHeader>
            <CardTitle className="text-[#E8EAED] flex items-center gap-2">
              <Loader2 className={`w-6 h-6 ${testing ? 'animate-spin' : ''}`} />
              System Diagnostics
            </CardTitle>
            <p className="text-[#8B92A7] text-sm">
              Checking Sublimes Drive connectivity and configuration
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Overall Status */}
            {!testing && (
              <Alert className={`border-2 ${
                allSuccess 
                  ? 'bg-green-500/10 border-green-500' 
                  : hasErrors 
                  ? 'bg-red-500/10 border-red-500'
                  : 'bg-yellow-500/10 border-yellow-500'
              }`}>
                <AlertDescription className="text-[#E8EAED]">
                  {allSuccess 
                    ? '✅ All systems operational!' 
                    : hasErrors
                    ? '⚠️ Critical issues detected - see fixes below'
                    : '⚠️ Some warnings - app should still work'}
                </AlertDescription>
              </Alert>
            )}

            {/* Diagnostic Results */}
            <div className="space-y-3">
              {results.map((result, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-4 bg-[#0B1426] rounded-lg border border-[#1A2332]"
                >
                  <div className="mt-0.5">
                    {getStatusIcon(result.status)}
                  </div>
                  <div className="flex-1">
                    <div className="text-[#E8EAED] mb-1">{result.test}</div>
                    <div className="text-sm text-[#8B92A7]">{result.message}</div>
                    {result.fix && (
                      <div className="mt-2 p-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded text-sm text-[#D4AF37]">
                        <strong>Fix:</strong> {result.fix}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-[#1A2332]">
              <Button
                onClick={runDiagnostics}
                disabled={testing}
                className="bg-[#D4AF37] text-[#0B1426] hover:bg-[#C4A027]"
              >
                {testing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Run Diagnostics Again'
                )}
              </Button>
              
              {allSuccess && (
                <Button
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  className="border-[#1A2332] text-[#E8EAED] hover:bg-[#1A2332]"
                >
                  Continue to App
                </Button>
              )}
            </div>

            {/* Quick Fix Guide */}
            {hasErrors && (
              <div className="mt-6 p-4 bg-[#1A2332] rounded-lg">
                <h3 className="text-[#E8EAED] mb-3">Quick Fix Steps:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-[#8B92A7]">
                  <li>Open Supabase Dashboard → SQL Editor</li>
                  <li>Run the migration files mentioned above in order</li>
                  <li>Wait for migrations to complete (check for success messages)</li>
                  <li>Click "Run Diagnostics Again" above</li>
                  <li>If still failing, check Supabase project status</li>
                </ol>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
