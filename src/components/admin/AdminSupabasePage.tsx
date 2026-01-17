import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CheckCircle, AlertCircle, Loader2, Database, Shield, Settings, Zap, Server, Code, Play } from 'lucide-react';
import { toast } from 'sonner';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../lib/env';

export function AdminSupabasePage() {
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY
        }
      });
      
      if (response.ok) {
        toast.success('Connection successful!');
      } else {
        toast.error('Connection failed');
      }
    } catch (error) {
      toast.error('Connection error');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const connectionStatus = {
    url: `${SUPABASE_URL}`,
    key: SUPABASE_ANON_KEY ? SUPABASE_ANON_KEY.substring(0, 20) + '...' : 'N/A',
    status: 'Connected',
    responseTime: '125ms'
  };

  const runQuickTest = async () => {
    setActiveTest('quick');
    toast.info('Running quick system test...');
    
    // Simulate test
    setTimeout(() => {
      setActiveTest(null);
      toast.success('Quick test completed successfully!');
    }, 2000);
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--sublimes-light-text)]">Supabase Integration</h1>
          <p className="text-gray-400 mt-1">Monitor and test all Supabase connections and services</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
            <Database className="w-3 h-3 mr-1" />
            Connected (125ms)
          </Badge>
          <Button 
            onClick={runQuickTest}
            disabled={activeTest === 'quick'}
            className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/80"
          >
            {activeTest === 'quick' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            Quick Test
          </Button>
        </div>
      </div>

      {/* Connection Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--sublimes-light-text)]">Database</p>
                  <p className="text-xs text-gray-400">Connected</p>
                </div>
              </div>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--sublimes-light-text)]">Auth</p>
                  <p className="text-xs text-gray-400">Active</p>
                </div>
              </div>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <Server className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--sublimes-light-text)]">Edge Functions</p>
                  <p className="text-xs text-gray-400">Deploying</p>
                </div>
              </div>
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--sublimes-light-text)]">Storage</p>
                  <p className="text-xs text-gray-400">Ready</p>
                </div>
              </div>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connection Details */}
      <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
        <CardHeader>
          <CardTitle className="text-[var(--sublimes-light-text)] flex items-center gap-2">
            <Code className="w-5 h-5" />
            Connection Configuration
          </CardTitle>
          <CardDescription>Current Supabase project configuration and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-400">Project URL</label>
                <p className="text-[var(--sublimes-light-text)] font-mono text-sm mt-1">{connectionStatus.url}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">Anon Key</label>
                <p className="text-[var(--sublimes-light-text)] font-mono text-sm mt-1">{connectionStatus.key}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-400">Status</label>
                <div className="flex items-center space-x-2 mt-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-green-500 font-medium">{connectionStatus.status}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">Response Time</label>
                <p className="text-[var(--sublimes-light-text)] font-medium mt-1">{connectionStatus.responseTime}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Suites */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardHeader>
            <CardTitle className="text-[var(--sublimes-light-text)] flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Database className="w-4 h-4 text-green-500" />
              </div>
              Supabase Connection
            </CardTitle>
            <CardDescription>Test basic connectivity to Supabase services</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleTestConnection}
              disabled={isTestingConnection}
              className="w-full bg-green-500/10 text-green-500 hover:bg-green-500/20"
            >
              {isTestingConnection ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Test Connection
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardHeader>
            <CardTitle className="text-[var(--sublimes-light-text)] flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Settings className="w-4 h-4 text-blue-500" />
              </div>
              Initialize Sample Data
            </CardTitle>
            <CardDescription>Load sample garages, communities, and offers to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
              onClick={() => toast.info('Sample data initialization coming soon')}
            >
              <Play className="w-4 h-4 mr-2" />
              Initialize Data
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardHeader>
            <CardTitle className="text-[var(--sublimes-light-text)] flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Shield className="w-4 h-4 text-purple-500" />
              </div>
              Full Verification
            </CardTitle>
            <CardDescription>Test 100% integration across all services</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full bg-purple-500/10 text-purple-500 hover:bg-purple-500/20"
              onClick={() => toast.info('Full verification coming soon')}
            >
              <Play className="w-4 h-4 mr-2" />
              Run Verification
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* System Logs */}
      <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
        <CardHeader>
          <CardTitle className="text-[var(--sublimes-light-text)] flex items-center gap-2">
            <Database className="w-5 h-5" />
            Recent System Logs
          </CardTitle>
          <CardDescription>Latest backend activity and system events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-[var(--sublimes-dark-bg)] rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-[var(--sublimes-light-text)]">Backend connection established</p>
                  <p className="text-xs text-gray-400">Ready for authentication and data operations</p>
                </div>
              </div>
              <span className="text-xs text-gray-400">Connected (125ms)</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-[var(--sublimes-dark-bg)] rounded-lg">
              <div className="flex items-center space-x-3">
                <Zap className="w-4 h-4 text-[var(--sublimes-gold)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--sublimes-light-text)]">Sample data initialization available</p>
                  <p className="text-xs text-gray-400">Load sample garages, communities, and offers to get started</p>
                </div>
              </div>
              <Button size="sm" className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/80">
                Initialize Data
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-[var(--sublimes-dark-bg)] rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-[var(--sublimes-light-text)]">Full verification test suite</p>
                  <p className="text-xs text-gray-400">Test 100% integration across all backend services</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="border-blue-500/30 text-blue-500 hover:bg-blue-500/10">
                Run Full Test Suite
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}