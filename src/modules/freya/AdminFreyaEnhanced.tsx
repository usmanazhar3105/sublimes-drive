import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, TestTube, Key, AlertCircle, CheckCircle2, TrendingUp, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const AdminFreyaEnhanced: React.FC = () => {
  const [settings, setSettings] = useState<any>(null);
  const [budget, setBudget] = useState<any>(null);
  const [runs, setRuns] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    
    
    const [settingsRes, budgetRes, runsRes, statsRes] = await Promise.all([
      supabase.from('freya_settings').select('*').limit(1).single(),
      supabase.from('freya_budget').select('*').eq('day', new Date().toISOString().split('T')[0]).maybeSingle(),
      supabase.from('freya_runs').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.rpc('fn_get_freya_stats').then(r => r.data || {})
    ]);

    setSettings(settingsRes.data);
    setBudget(budgetRes.data);
    setRuns(runsRes.data || []);
    setStats(statsRes);
    setLoading(false);
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      
      const { error } = await supabase.from('freya_settings').update(settings).eq('id', settings.id);
      
      if (error) throw error;
      
      // If API key provided, save via admin RPC
      if (apiKey) {
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/freya-admin-rpc`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'x-admin-token': import.meta.env.VITE_ADMIN_API_TOKEN || ''
          },
          body: JSON.stringify({
            action: 'set_api_key',
            provider: settings.provider,
            api_key: apiKey
          })
        });
        setApiKey('');
        setShowApiKey(false);
      }
      
      toast({
        title: '✅ Settings saved',
        description: 'Freya configuration updated successfully',
      });
    } catch (error: any) {
      toast({
        title: '❌ Save failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const testPrompt = async () => {
    setTesting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/freya-generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'x-admin-token': import.meta.env.VITE_ADMIN_API_TOKEN || ''
        },
        body: JSON.stringify({
          mode: 'auto',
          text: 'What are common issues with BYD Seal battery charging?',
          images: [],
          settings
        })
      });
      const result = await response.json();
      
      if (result.error) throw new Error(result.error);
      
      toast({
        title: '✅ Test successful',
        description: `Generated ${result.tokens_out} tokens: ${result.text?.substring(0, 80)}...`,
      });
    } catch (error: any) {
      toast({
        title: '❌ Test failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setTesting(false);
    }
  };

  const resetBudget = async () => {
    
    await supabase.from('freya_budget').delete().eq('day', new Date().toISOString().split('T')[0]);
    loadData();
    toast({ title: '✅ Budget reset', description: 'Daily token usage reset to 0' });
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="flex items-center gap-2 text-lg">
        <Loader2 className="w-6 h-6 animate-spin" /> 
        Loading Freya AI settings...
      </div>
    </div>
  );

  const tokensUsed = budget?.tokens_used || 0;
  const tokensCap = settings?.daily_token_cap || 300000;
  const usagePercent = (tokensUsed / tokensCap * 100).toFixed(1);
  const budgetRemaining = tokensCap - tokensUsed;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Usage</p>
                <p className="text-2xl font-bold">{usagePercent}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Comments Today</p>
                <p className="text-2xl font-bold">{stats.comments_today || 0}</p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{stats.success_rate || 0}%</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tokens Left</p>
                <p className="text-2xl font-bold">{budgetRemaining.toLocaleString()}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Provider Config */}
      <Card>
        <CardHeader>
          <CardTitle>Provider Configuration</CardTitle>
          <CardDescription>LLM provider and model settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="provider">Provider</Label>
              <Input 
                id="provider"
                value={settings?.provider || ''} 
                onChange={(e) => setSettings({...settings, provider: e.target.value})}
                placeholder="openai"
              />
            </div>
            <div>
              <Label htmlFor="model-text">Text Model</Label>
              <Input 
                id="model-text"
                value={settings?.model_text || ''} 
                onChange={(e) => setSettings({...settings, model_text: e.target.value})}
                placeholder="gpt-4o-mini"
              />
            </div>
            <div>
              <Label htmlFor="model-vision">Vision Model</Label>
              <Input 
                id="model-vision"
                value={settings?.model_vision || ''} 
                onChange={(e) => setSettings({...settings, model_vision: e.target.value})}
                placeholder="gpt-4o-mini"
              />
            </div>
            <div>
              <Label htmlFor="locale">Locale</Label>
              <Input 
                id="locale"
                value={settings?.locale || 'en'} 
                onChange={(e) => setSettings({...settings, locale: e.target.value})}
                placeholder="en"
              />
            </div>
          </div>

          {/* API Key Management */}
          <div className="border-t pt-4 mt-4">
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="api-key">API Key</Label>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? 'Hide' : 'Show'}
              </Button>
            </div>
            <div className="flex gap-2">
              <Input 
                id="api-key"
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-proj-...  (leave empty to keep current)"
              />
              <Button variant="outline" disabled>
                <Key className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Stored encrypted in Supabase secrets. Only update when changing providers.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Budget & Caps */}
      <Card>
        <CardHeader>
          <CardTitle>Budget & Limits</CardTitle>
          <CardDescription>Daily token budget and per-post caps</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Daily Token Cap</Label>
              <Input 
                type="number"
                value={settings?.daily_token_cap || 0} 
                onChange={(e) => setSettings({...settings, daily_token_cap: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <Label>Today's Usage</Label>
              <div className="text-2xl font-bold">
                {tokensUsed.toLocaleString()} / {tokensCap.toLocaleString()}
                <span className="text-sm text-muted-foreground ml-2">({usagePercent}%)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label>Image Annotation</Label>
            <Switch 
              checked={settings?.image_annotation_enabled || false}
              onCheckedChange={(checked) => setSettings({...settings, image_annotation_enabled: checked})}
            />
          </div>
        </CardContent>
      </Card>

      {/* Brand Whitelist */}
      <Card>
        <CardHeader>
          <CardTitle>Brand Whitelist (Chinese Brands Only)</CardTitle>
          <CardDescription>Comma-separated list of allowed car brands</CardDescription>
        </CardHeader>
        <CardContent>
          <Input 
            value={settings?.brand_whitelist || ''} 
            onChange={(e) => setSettings({...settings, brand_whitelist: e.target.value})}
            placeholder="BYD,Jetour,Changan,Geely,Haval,MG,Exeed,Chery,Hongqi,Zeekr,Ora"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Posts not mentioning these brands will be skipped (saves tokens)
          </p>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Settings
        </Button>
        <Button variant="outline" onClick={testPrompt} disabled={testing}>
          {testing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <TestTube className="w-4 h-4 mr-2" />}
          Test Prompt
        </Button>
        <Button variant="destructive" onClick={resetBudget}>
          Reset Daily Budget
        </Button>
      </div>

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity (Last 50 Runs)</CardTitle>
          <CardDescription>Real-time monitoring of Freya's actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {runs.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No activity yet. Freya will start responding once posts are created.
              </div>
            ) : (
              runs.map(run => (
                <div key={run.id} className="text-sm border-b pb-2 last:border-0">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        run.status === 'success' ? 'default' : 
                        run.status === 'skipped' ? 'secondary' : 
                        'destructive'
                      }>
                        {run.action}
                      </Badge>
                      <span className="font-medium text-xs text-muted-foreground">
                        {new Date(run.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <Badge variant={
                      run.status === 'success' ? 'default' : 
                      run.status === 'skipped' ? 'outline' : 
                      'destructive'
                    }>
                      {run.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                    <span>{run.reason || 'OK'}</span>
                    <span>{(run.tokens_input || 0) + (run.tokens_output || 0)} tokens</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
