// TEMPORARY SMOKE TEST - Verifies end-to-end connectivity
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { STORAGE_BUCKETS } from '@/lib/storageBuckets';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export function SmokeTest() {
  const [results, setResults] = useState<any>({});
  const [running, setRunning] = useState(false);

  const runTests = async () => {
    setRunning(true);
    const testResults: any = {};

    // Test 1: Auth
    try {
      const { data: { user } } = await supabase.auth.getUser();
      testResults.auth = user ? `✅ Logged in as ${user.email}` : '⚠️ Not logged in';
    } catch (e: any) {
      testResults.auth = `❌ ${e.message}`;
    }

    // Test 2: Profiles table
    try {
      const { data, error } = await supabase.from('profiles').select('id').limit(1);
      testResults.profiles = error ? `❌ ${error.message}` : `✅ Profiles readable (${data?.length || 0} rows)`;
    } catch (e: any) {
      testResults.profiles = `❌ ${e.message}`;
    }

    // Test 3: Posts table
    try {
      const { data, error } = await supabase.from('posts').select('id').limit(1);
      testResults.posts = error ? `❌ ${error.message}` : `✅ Posts readable (${data?.length || 0} rows)`;
    } catch (e: any) {
      testResults.posts = `❌ ${e.message}`;
    }

    // Test 4: Comments table
    try {
      const { data, error } = await supabase.from('comments').select('id').limit(1);
      testResults.comments = error ? `❌ ${error.message}` : `✅ Comments readable (${data?.length || 0} rows)`;
    } catch (e: any) {
      testResults.comments = `❌ ${e.message}`;
    }

    // Test 5: Challenges table
    try {
      const { data, error } = await supabase.from('challenges').select('id').limit(1);
      testResults.challenges = error ? `❌ ${error.message}` : `✅ Challenges readable (${data?.length || 0} rows)`;
    } catch (e: any) {
      testResults.challenges = `❌ ${e.message}`;
    }

    // Test 6: XP Events table
    try {
      const { data, error } = await supabase.from('xp_events').select('id').limit(1);
      testResults.xp_events = error ? `❌ ${error.message}` : `✅ XP Events readable (${data?.length || 0} rows)`;
    } catch (e: any) {
      testResults.xp_events = `❌ ${e.message}`;
    }

    // Test 7: Analytics Events table
    try {
      const { data, error } = await supabase.from('analytics_events').select('id').limit(1);
      testResults.analytics = error ? `❌ ${error.message}` : `✅ Analytics readable (${data?.length || 0} rows)`;
    } catch (e: any) {
      testResults.analytics = `❌ ${e.message}`;
    }

    // Test 8: log_event RPC
    try {
      const { error } = await supabase.rpc('log_event', { 
        p_event_name: 'smoke_test',
        p_properties: { test: true }
      });
      testResults.log_event_rpc = error ? `❌ ${error.message}` : '✅ log_event RPC works';
    } catch (e: any) {
      testResults.log_event_rpc = `❌ ${e.message}`;
    }

    // Test 9: Storage bucket
    try {
      const { data, error } = await supabase.storage.from(STORAGE_BUCKETS.community).list('', { limit: 1 });
      testResults.storage = error ? `❌ ${error.message}` : '✅ Storage bucket accessible';
    } catch (e: any) {
      testResults.storage = `❌ ${e.message}`;
    }

    setResults(testResults);
    setRunning(false);
  };

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-96 max-h-96 overflow-auto">
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
          🔧 Smoke Test
          <Button size="sm" onClick={runTests} disabled={running}>
            {running ? 'Testing...' : 'Run Tests'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1 text-xs font-mono">
          {Object.keys(results).length === 0 ? (
            <p className="text-gray-500">Click "Run Tests" to verify database connectivity</p>
          ) : (
            Object.entries(results).map(([key, value]) => (
              <div key={key} className="py-1 border-b border-gray-700">
                <strong>{key}:</strong> {value as string}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

