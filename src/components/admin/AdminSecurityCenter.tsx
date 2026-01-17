import { useState } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  Lock, 
  Eye,
  Users,
  Activity,
  Clock,
  Ban,
  CheckCircle,
  XCircle,
  Settings,
  Download,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ViewToggle } from '../ui/ViewToggle';

export function AdminSecurityCenter() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock security data
  const securityMetrics = {
    securityScore: '96/100',
    activeThreats: 3,
    blockedAttempts: 127,
    loggedUsers: 2456,
    suspiciousActivity: 8,
    lastScan: '2 minutes ago',
    securityIncidents: 0,
    twoFactorEnabled: '78%'
  };

  // Mock security logs
  const securityLogs = [
    {
      id: 'SEC-001',
      type: 'Failed Login',
      severity: 'Medium',
      user: 'admin@sublimes.com',
      ip: '192.168.1.100',
      timestamp: '2024-01-20 14:32:15',
      status: 'Blocked',
      location: 'Dubai, UAE'
    },
    {
      id: 'SEC-002',
      type: 'Suspicious API Access',
      severity: 'High',
      user: 'unknown',
      ip: '45.123.45.67',
      timestamp: '2024-01-20 14:28:42',
      status: 'Investigated',
      location: 'Unknown'
    },
    {
      id: 'SEC-003',
      type: 'Password Change',
      severity: 'Low',
      user: 'user@example.com',
      ip: '192.168.1.45',
      timestamp: '2024-01-20 14:15:33',
      status: 'Success',
      location: 'Abu Dhabi, UAE'
    },
    {
      id: 'SEC-004',
      type: 'Admin Access',
      severity: 'Medium',
      user: 'admin@sublimes.com',
      ip: '192.168.1.100',
      timestamp: '2024-01-20 13:45:21',
      status: 'Success',
      location: 'Dubai, UAE'
    }
  ];

  // Mock blocked IPs
  const blockedIPs = [
    { ip: '45.123.45.67', reason: 'Brute force attack', blockedAt: '2024-01-20 14:28:42', attempts: 15 },
    { ip: '192.168.1.999', reason: 'SQL injection attempt', blockedAt: '2024-01-20 13:15:30', attempts: 8 },
    { ip: '10.0.0.999', reason: 'Suspicious activity', blockedAt: '2024-01-20 12:45:15', attempts: 23 },
    { ip: '172.16.0.999', reason: 'Multiple failed logins', blockedAt: '2024-01-20 11:30:45', attempts: 12 }
  ];

  const StatCard = ({ title, value, subtitle, icon: Icon, color }: any) => (
    <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2 rounded-lg`} style={{ backgroundColor: `${color}20` }}>
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
          <Badge className="bg-[var(--sublimes-gold)]/10 text-[var(--sublimes-gold)] border-[var(--sublimes-gold)]/30">
            Live
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="text-2xl font-bold text-[var(--sublimes-light-text)]">{value}</div>
          <div className="text-sm text-gray-400">{title}</div>
          <div className="text-xs font-medium" style={{ color }}>{subtitle}</div>
        </div>
      </CardContent>
    </Card>
  );

  const SecurityLogCard = ({ log }: any) => {
    if (viewMode === 'list') {
      return (
        <div className="grid grid-cols-8 gap-4 p-4 border-b border-[var(--sublimes-border)]/30 items-center">
          <div className="font-medium text-[var(--sublimes-light-text)]">{log.type}</div>
          <div>
            <Badge 
              className={`text-xs ${
                log.severity === 'High' ? 'bg-red-500/10 text-red-500' :
                log.severity === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' :
                'bg-green-500/10 text-green-500'
              }`}
            >
              {log.severity}
            </Badge>
          </div>
          <div className="text-sm text-[var(--sublimes-light-text)]">{log.user}</div>
          <div className="text-sm text-gray-400">{log.ip}</div>
          <div className="text-sm text-gray-400">{log.timestamp}</div>
          <div>
            <Badge 
              className={log.status === 'Success' 
                ? 'bg-green-500/10 text-green-500' 
                : log.status === 'Blocked' 
                ? 'bg-red-500/10 text-red-500'
                : 'bg-yellow-500/10 text-yellow-500'
              }
            >
              {log.status}
            </Badge>
          </div>
          <div className="text-sm text-gray-400">{log.location}</div>
          <div className="flex space-x-1">
            <Button size="sm" variant="outline" className="p-1 h-6 w-6">
              <Eye className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" className="p-1 h-6 w-6">
              <Ban className="h-3 w-3 text-red-500" />
            </Button>
          </div>
        </div>
      );
    }

    return (
      <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-[var(--sublimes-light-text)]">{log.type}</CardTitle>
            <Badge 
              className={`text-xs ${
                log.severity === 'High' ? 'bg-red-500/10 text-red-500' :
                log.severity === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' :
                'bg-green-500/10 text-green-500'
              }`}
            >
              {log.severity}
            </Badge>
          </div>
          <div className="text-xs text-gray-400">{log.timestamp}</div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div>
                <span className="text-gray-400">User:</span> 
                <span className="text-[var(--sublimes-light-text)] ml-1">{log.user}</span>
              </div>
              <div>
                <span className="text-gray-400">IP:</span> 
                <span className="text-[var(--sublimes-light-text)] ml-1">{log.ip}</span>
              </div>
              <div>
                <span className="text-gray-400">Location:</span> 
                <span className="text-[var(--sublimes-light-text)] ml-1">{log.location}</span>
              </div>
            </div>
            <div>
              <Badge 
                className={log.status === 'Success' 
                  ? 'bg-green-500/10 text-green-500' 
                  : log.status === 'Blocked' 
                  ? 'bg-red-500/10 text-red-500'
                  : 'bg-yellow-500/10 text-yellow-500'
                }
              >
                {log.status}
              </Badge>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" className="flex-1">
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button size="sm" variant="outline" className="flex-1 text-red-500">
                <Ban className="h-4 w-4 mr-1" />
                Block
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Security Score"
          value={securityMetrics.securityScore}
          subtitle="Excellent protection"
          icon={Shield}
          color="#10B981"
        />
        <StatCard
          title="Active Threats"
          value={securityMetrics.activeThreats}
          subtitle="Being monitored"
          icon={AlertTriangle}
          color="#EF4444"
        />
        <StatCard
          title="Blocked Attempts"
          value={securityMetrics.blockedAttempts}
          subtitle="Today"
          icon={Ban}
          color="#F59E0B"
        />
        <StatCard
          title="Logged Users"
          value={securityMetrics.loggedUsers}
          subtitle="Currently active"
          icon={Users}
          color="#3B82F6"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardHeader>
            <CardTitle className="text-[var(--sublimes-light-text)]">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Firewall Status</span>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500">Active</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">SSL Certificate</span>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500">Valid</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Two-Factor Auth</span>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500">{securityMetrics.twoFactorEnabled}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Last Security Scan</span>
                <span className="text-sm text-[var(--sublimes-light-text)]">{securityMetrics.lastScan}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardHeader>
            <CardTitle className="text-[var(--sublimes-light-text)]">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {securityLogs.slice(0, 4).map((log, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-[var(--sublimes-light-text)]">{log.type}</div>
                    <div className="text-xs text-gray-400">{log.timestamp}</div>
                  </div>
                  <Badge 
                    className={`text-xs ${
                      log.severity === 'High' ? 'bg-red-500/10 text-red-500' :
                      log.severity === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' :
                      'bg-green-500/10 text-green-500'
                    }`}
                  >
                    {log.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderLogsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[var(--sublimes-light-text)]">Security Logs</h3>
          <p className="text-gray-400">Monitor security events and incidents</p>
        </div>
        <div className="flex items-center space-x-3">
          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          <Button className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]">
            <Download className="w-4 h-4 mr-2" />
            Export Logs
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search logs..."
              className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
            />
            <select className="px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] text-[var(--sublimes-light-text)] rounded-md">
              <option>All Types</option>
              <option>Failed Login</option>
              <option>Suspicious API Access</option>
              <option>Admin Access</option>
            </select>
            <select className="px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] text-[var(--sublimes-light-text)] rounded-md">
              <option>All Severities</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <Button className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]">
              <Search className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Logs */}
      {viewMode === 'list' && (
        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardContent className="p-0">
            <div className="grid grid-cols-8 gap-4 p-4 border-b border-[var(--sublimes-border)] bg-[var(--sublimes-dark-bg)]">
              <div className="text-sm font-medium text-gray-400">Type</div>
              <div className="text-sm font-medium text-gray-400">Severity</div>
              <div className="text-sm font-medium text-gray-400">User</div>
              <div className="text-sm font-medium text-gray-400">IP Address</div>
              <div className="text-sm font-medium text-gray-400">Timestamp</div>
              <div className="text-sm font-medium text-gray-400">Status</div>
              <div className="text-sm font-medium text-gray-400">Location</div>
              <div className="text-sm font-medium text-gray-400">Actions</div>
            </div>
            {securityLogs.map((log) => (
              <SecurityLogCard key={log.id} log={log} />
            ))}
          </CardContent>
        </Card>
      )}

      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {securityLogs.map((log) => (
            <SecurityLogCard key={log.id} log={log} />
          ))}
        </div>
      )}
    </div>
  );

  const renderBlockedTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[var(--sublimes-light-text)]">Blocked IPs</h3>
          <p className="text-gray-400">Manage blocked IP addresses and security restrictions</p>
        </div>
        <Button className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]">
          <Ban className="w-4 h-4 mr-2" />
          Add IP Block
        </Button>
      </div>

      <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
        <CardContent className="p-0">
          <div className="grid grid-cols-5 gap-4 p-4 border-b border-[var(--sublimes-border)] bg-[var(--sublimes-dark-bg)]">
            <div className="text-sm font-medium text-gray-400">IP Address</div>
            <div className="text-sm font-medium text-gray-400">Reason</div>
            <div className="text-sm font-medium text-gray-400">Blocked At</div>
            <div className="text-sm font-medium text-gray-400">Attempts</div>
            <div className="text-sm font-medium text-gray-400">Actions</div>
          </div>
          {blockedIPs.map((ip, index) => (
            <div key={index} className="grid grid-cols-5 gap-4 p-4 border-b border-[var(--sublimes-border)]/30 items-center">
              <div className="text-sm font-medium text-[var(--sublimes-light-text)]">{ip.ip}</div>
              <div className="text-sm text-gray-400">{ip.reason}</div>
              <div className="text-sm text-gray-400">{ip.blockedAt}</div>
              <div className="text-sm text-red-500">{ip.attempts}</div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" className="text-green-500">
                  Unblock
                </Button>
                <Button size="sm" variant="outline" className="text-blue-500">
                  Details
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-[var(--sublimes-light-text)]">Security Settings</h3>
        <p className="text-gray-400">Configure security policies and protection measures</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardHeader>
            <CardTitle className="text-[var(--sublimes-light-text)]">Authentication Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Session Timeout (minutes)</label>
              <Input 
                defaultValue="60"
                type="number"
                className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Max Login Attempts</label>
              <Input 
                defaultValue="5"
                type="number"
                className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Lockout Duration (minutes)</label>
              <Input 
                defaultValue="30"
                type="number"
                className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
              />
            </div>
            <Button className="w-full bg-green-500 text-white">
              Save Auth Settings
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardHeader>
            <CardTitle className="text-[var(--sublimes-light-text)]">Security Monitoring</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--sublimes-light-text)]">Real-time Monitoring</span>
              <div className="w-12 h-6 rounded-full p-1 cursor-pointer transition-colors bg-green-500">
                <div className="w-4 h-4 rounded-full bg-white transition-transform translate-x-6" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--sublimes-light-text)]">Auto IP Blocking</span>
              <div className="w-12 h-6 rounded-full p-1 cursor-pointer transition-colors bg-green-500">
                <div className="w-4 h-4 rounded-full bg-white transition-transform translate-x-6" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--sublimes-light-text)]">Email Alerts</span>
              <div className="w-12 h-6 rounded-full p-1 cursor-pointer transition-colors bg-green-500">
                <div className="w-4 h-4 rounded-full bg-white transition-transform translate-x-6" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--sublimes-light-text)]">SMS Alerts</span>
              <div className="w-12 h-6 rounded-full p-1 cursor-pointer transition-colors bg-gray-600">
                <div className="w-4 h-4 rounded-full bg-white transition-transform translate-x-0" />
              </div>
            </div>
            <Button className="w-full bg-green-500 text-white">
              Save Monitoring Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-[var(--sublimes-dark-bg)] min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--sublimes-light-text)] mb-2">Security Center</h1>
            <p className="text-gray-400">Monitor security threats, incidents, and system protection</p>
          </div>
          <Button className="bg-green-500 text-white">
            <RefreshCw className="w-4 h-4 mr-2" />
            Run Security Scan
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[var(--sublimes-gold)] data-[state=active]:text-[var(--sublimes-dark-bg)]">
            <Shield className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="logs" className="data-[state=active]:bg-[var(--sublimes-gold)] data-[state=active]:text-[var(--sublimes-dark-bg)]">
            <Activity className="h-4 w-4 mr-2" />
            Security Logs
          </TabsTrigger>
          <TabsTrigger value="blocked" className="data-[state=active]:bg-[var(--sublimes-gold)] data-[state=active]:text-[var(--sublimes-dark-bg)]">
            <Ban className="h-4 w-4 mr-2" />
            Blocked IPs
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-[var(--sublimes-gold)] data-[state=active]:text-[var(--sublimes-dark-bg)]">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">{renderOverviewTab()}</TabsContent>
        <TabsContent value="logs">{renderLogsTab()}</TabsContent>
        <TabsContent value="blocked">{renderBlockedTab()}</TabsContent>
        <TabsContent value="settings">{renderSettingsTab()}</TabsContent>
      </Tabs>
    </div>
  );
}