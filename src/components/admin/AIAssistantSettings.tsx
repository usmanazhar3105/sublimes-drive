import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bot, Activity, Settings, BarChart3 } from 'lucide-react';

const FREYA_ID = 'd8c1f7a7-9c89-4090-a0a6-b310120b190c';

interface AIAgent {
  id: string;
  name: string;
  handle: string;
  email: string;
  is_enabled: boolean;
  bio: string;
}

interface AISettings {
  id: number;
  agent_id: string;
  community_id: string | null;
  is_enabled: boolean;
  language_default: string;
  max_comment_len: number;
  rate_per_min: number;
  rate_per_hour: number;
  rate_per_day: number;
  safe_mode: boolean;
  source_attribution: boolean;
}

interface ActivityLog {
  id: number;
  event_type: string;
  post_id: string | null;
  comment_id: string | null;
  language: string | null;
  status: string;
  message: string | null;
  created_at: string;
}

export function AIAssistantSettings() {
  const [agent, setAgent] = useState<AIAgent | null>(null);
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    loadAgent();
    loadSettings();
    loadLogs();
  }, []);

  const loadAgent = async () => {
    const { data, error } = await supabase
      .from('ai_agents')
      .select('*')
      .eq('id', FREYA_ID)
      .single();

    if (data) setAgent(data);
  };

  const loadSettings = async () => {
    const { data, error } = await supabase
      .from('ai_agent_settings')
      .select('*')
      .eq('agent_id', FREYA_ID)
      .is('community_id', null)
      .single();

    if (data) setSettings(data);
    setLoading(false);
  };

  const loadLogs = async () => {
    const { data, error } = await supabase
      .from('ai_activity_log')
      .select('*')
      .eq('agent_id', FREYA_ID)
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) setLogs(data);
  };

  const handleToggleAgent = async (enabled: boolean) => {
    setSaving(true);
    const { error } = await supabase
      .from('ai_agents')
      .update({ is_enabled: enabled, updated_at: new Date().toISOString() })
      .eq('id', FREYA_ID);

    if (error) {
      setMessage({ type: 'error', text: 'Failed to update agent status' });
    } else {
      setAgent(prev => prev ? { ...prev, is_enabled: enabled } : null);
      setMessage({ type: 'success', text: `AI Assistant ${enabled ? 'enabled' : 'disabled'}` });
    }
    setSaving(false);
  };

  const handleUpdateSettings = async () => {
    if (!settings) return;

    setSaving(true);
    const { error } = await supabase
      .from('ai_agent_settings')
      .update({
        is_enabled: settings.is_enabled,
        language_default: settings.language_default,
        max_comment_len: settings.max_comment_len,
        rate_per_min: settings.rate_per_min,
        rate_per_hour: settings.rate_per_hour,
        rate_per_day: settings.rate_per_day,
        safe_mode: settings.safe_mode,
        source_attribution: settings.source_attribution,
        updated_at: new Date().toISOString()
      })
      .eq('id', settings.id);

    if (error) {
      setMessage({ type: 'error', text: 'Failed to update settings' });
    } else {
      setMessage({ type: 'success', text: 'Settings updated successfully' });
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  if (!agent || !settings) {
    return (
      <Alert>
        <AlertDescription>
          AI Assistant not configured. Please run the database migration first.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">AI Assistant - Freya</h2>
          <p className="text-muted-foreground">
            Manage your AI assistant settings and monitor activity
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Label htmlFor="agent-toggle">AI Assistant</Label>
          <Switch
            id="agent-toggle"
            checked={agent.is_enabled}
            onCheckedChange={handleToggleAgent}
            disabled={saving}
          />
        </div>
      </div>

      {/* Message */}
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <Bot className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Activity className="mr-2 h-4 w-4" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent Information</CardTitle>
              <CardDescription>Basic information about your AI assistant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-2xl font-bold">{agent.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Handle</Label>
                  <p className="text-2xl font-bold">{agent.handle}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-lg">{agent.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <p className={`text-lg font-semibold ${agent.is_enabled ? 'text-green-600' : 'text-red-600'}`}>
                    {agent.is_enabled ? 'Active' : 'Disabled'}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Bio</Label>
                <p className="text-sm text-muted-foreground mt-1">{agent.bio}</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{logs.filter(l => l.event_type === 'new_post').length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round((logs.filter(l => l.status === 'success').length / Math.max(logs.length, 1)) * 100)}%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last 24h</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {logs.filter(l => new Date(l.created_at) > new Date(Date.now() - 24*60*60*1000)).length}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>Adjust AI assistant behavior and limits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="settings-enabled">Enable Responses</Label>
                  <p className="text-sm text-muted-foreground">Allow AI to post comments</p>
                </div>
                <Switch
                  id="settings-enabled"
                  checked={settings.is_enabled}
                  onCheckedChange={(checked) => setSettings({...settings, is_enabled: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="safe-mode">Safe Mode</Label>
                  <p className="text-sm text-muted-foreground">Refuse high-risk medical/legal/financial advice</p>
                </div>
                <Switch
                  id="safe-mode"
                  checked={settings.safe_mode}
                  onCheckedChange={(checked) => setSettings({...settings, safe_mode: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="source-attribution">Source Attribution</Label>
                  <p className="text-sm text-muted-foreground">Include sources in responses</p>
                </div>
                <Switch
                  id="source-attribution"
                  checked={settings.source_attribution}
                  onCheckedChange={(checked) => setSettings({...settings, source_attribution: checked})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-len">Max Comment Length</Label>
                <Input
                  id="max-len"
                  type="number"
                  value={settings.max_comment_len}
                  onChange={(e) => setSettings({...settings, max_comment_len: parseInt(e.target.value)})}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rate-min">Rate/Minute</Label>
                  <Input
                    id="rate-min"
                    type="number"
                    value={settings.rate_per_min}
                    onChange={(e) => setSettings({...settings, rate_per_min: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rate-hour">Rate/Hour</Label>
                  <Input
                    id="rate-hour"
                    type="number"
                    value={settings.rate_per_hour}
                    onChange={(e) => setSettings({...settings, rate_per_hour: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rate-day">Rate/Day</Label>
                  <Input
                    id="rate-day"
                    type="number"
                    value={settings.rate_per_day}
                    onChange={(e) => setSettings({...settings, rate_per_day: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <Button onClick={handleUpdateSettings} disabled={saving}>
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Last 50 AI assistant actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between border-b pb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded ${
                          log.status === 'success' ? 'bg-green-100 text-green-800' :
                          log.status === 'error' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {log.event_type}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                      {log.message && (
                        <p className="text-sm mt-1">{log.message}</p>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {log.language || 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>AI assistant performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Event Distribution</h3>
                  <div className="mt-2 space-y-2">
                    {['new_post', 'reply', 'skip', 'error'].map(type => {
                      const count = logs.filter(l => l.event_type === type).length;
                      const percent = Math.round((count / Math.max(logs.length, 1)) * 100);
                      return (
                        <div key={type} className="flex items-center space-x-2">
                          <span className="w-24 text-sm capitalize">{type}</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-4">
                            <div 
                              className="bg-blue-600 h-4 rounded-full" 
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="w-12 text-sm text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

