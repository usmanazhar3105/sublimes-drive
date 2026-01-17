import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Trash2, RefreshCw } from 'lucide-react';

export const FreyaAdminPanel: React.FC = () => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    loadSettings();
    loadLogs();
  }, []);

  const loadSettings = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('ai_agent_settings_freya')
      .select('*')
      .is('community_id', null)
      .single();
    setSettings(data);
    setLoading(false);
  };

  const loadLogs = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('ai_activity_log_freya')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    setLogs(data || []);
  };

  const toggleEnabled = async () => {
    const supabase = createClient();
    await supabase
      .from('ai_agent_settings_freya')
      .update({ is_enabled: !settings.is_enabled })
      .eq('id', settings.id);
    loadSettings();
  };

  const flushRateLimits = async () => {
    const response = await fetch(`${process.env.VITE_SUPABASE_URL}/functions/v1/ai_admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': process.env.ADMIN_API_TOKEN || '',
      },
      body: JSON.stringify({ action: 'flush_rate_limits' })
    });
    if (response.ok) {
      alert('Rate limits flushed');
    }
  };

  if (loading) return <div className="flex items-center gap-2"><Loader2 className="animate-spin" /> Loading...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Freya AI Assistant</CardTitle>
          <CardDescription>Admin-controlled AI for community posts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Global Toggle</p>
              <p className="text-sm text-muted-foreground">Enable/disable Freya globally</p>
            </div>
            <Switch checked={settings?.is_enabled} onCheckedChange={toggleEnabled} />
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4">
            <div>
              <p className="text-sm text-muted-foreground">Rate Limit</p>
              <p className="font-medium">{settings?.rate_per_min}/min</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Max Length</p>
              <p className="font-medium">{settings?.max_comment_len} chars</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Safe Mode</p>
              <p className="font-medium">{settings?.safe_mode ? 'ON' : 'OFF'}</p>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" size="sm" onClick={flushRateLimits}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Flush Rate Limits
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {logs.map(log => (
              <div key={log.id} className="text-sm border-b pb-2">
                <div className="flex justify-between">
                  <span className="font-medium">{log.event_type}</span>
                  <span className="text-muted-foreground">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="text-muted-foreground">
                  Status: {log.status} • Language: {log.language}
                  {log.latency_ms && ` • ${log.latency_ms}ms`}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
