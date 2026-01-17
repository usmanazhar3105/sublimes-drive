import { useState } from 'react';
import { 
  History, 
  Activity, 
  AlertTriangle, 
  Info,
  CheckCircle,
  XCircle,
  User,
  Database,
  Settings,
  Search,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  Clock
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ViewToggle } from '../ui/ViewToggle';

export function AdminLogsPage() {
  const [selectedTab, setSelectedTab] = useState('system');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Mock system logs
  const systemLogs = [
    {
      id: 'SYS-001',
      timestamp: '2024-01-20 15:30:45',
      level: 'INFO',
      category: 'System',
      event: 'User Login',
      user: 'admin@sublimes.com',
      ip: '192.168.1.100',
      details: 'Successful admin login from Dubai office',
      module: 'Authentication'
    },
    {
      id: 'SYS-002',
      timestamp: '2024-01-20 15:25:12',
      level: 'WARNING',
      category: 'Security',
      event: 'Failed Login Attempt',
      user: 'unknown',
      ip: '45.123.45.67',
      details: 'Multiple failed login attempts detected',
      module: 'Security'
    },
    {
      id: 'SYS-003',
      timestamp: '2024-01-20 15:20:33',
      level: 'ERROR',
      category: 'Database',
      event: 'Connection Timeout',
      user: 'system',
      ip: 'localhost',
      details: 'Database connection timeout after 30 seconds',
      module: 'Database'
    },
    {
      id: 'SYS-004',
      timestamp: '2024-01-20 15:15:08',
      level: 'INFO',
      category: 'API',
      event: 'Payment Processed',
      user: 'user@example.com',
      ip: '192.168.1.45',
      details: 'Payment of AED 150 processed successfully',
      module: 'Payment'
    }
  ];

  // Mock audit logs
  const auditLogs = [
    {
      id: 'AUD-001',
      timestamp: '2024-01-20 14:45:22',
      action: 'User Created',
      resource: 'users/12345',
      user: 'admin@sublimes.com',
      changes: 'Created new user account for ahmed@example.com',
      status: 'Success',
      ip: '192.168.1.100'
    },
    {
      id: 'AUD-002',
      timestamp: '2024-01-20 14:30:15',
      action: 'Listing Approved',
      resource: 'listings/BMW-2023-001',
      user: 'moderator@sublimes.com',
      changes: 'Approved BMW X5 listing after verification',
      status: 'Success',
      ip: '192.168.1.102'
    },
    {
      id: 'AUD-003',
      timestamp: '2024-01-20 14:20:33',
      action: 'Settings Updated',
      resource: 'settings/payment',
      user: 'admin@sublimes.com',
      changes: 'Updated payment gateway configuration',
      status: 'Success',
      ip: '192.168.1.100'
    }
  ];

  // Mock activity logs
  const activityLogs = [
    {
      id: 'ACT-001',
      timestamp: '2024-01-20 15:35:12',
      user: 'Ahmed Hassan',
      action: 'Created Listing',
      resource: 'BMW X3 2023',
      location: 'Dubai, UAE',
      device: 'iPhone 14'
    },
    {
      id: 'ACT-002',
      timestamp: '2024-01-20 15:30:45',
      user: 'Fatima Al-Zahra',
      action: 'Updated Profile',
      resource: 'User Profile',
      location: 'Abu Dhabi, UAE',
      device: 'Chrome Browser'
    }
  ];

  const logMetrics = {
    totalLogs: '45,230',
    errorLogs: '234',
    warningLogs: '1,567',
    infoLogs: '43,429',
    activeUsers: '2,456',
    systemUptime: '99.9%'
  };

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

  const LogCard = ({ log, type }: any) => {
    if (viewMode === 'list') {
      if (type === 'system') {
        return (
          <div className="grid grid-cols-8 gap-4 p-4 border-b border-[var(--sublimes-border)]/30 items-center">
            <div className="text-sm text-gray-400">{log.timestamp}</div>
            <div>
              <Badge 
                className={`text-xs ${
                  log.level === 'ERROR' ? 'bg-red-500/10 text-red-500' :
                  log.level === 'WARNING' ? 'bg-yellow-500/10 text-yellow-500' :
                  'bg-green-500/10 text-green-500'
                }`}
              >
                {log.level}
              </Badge>
            </div>
            <div className="text-sm text-[var(--sublimes-light-text)]">{log.category}</div>
            <div className="text-sm text-[var(--sublimes-light-text)]">{log.event}</div>
            <div className="text-sm text-gray-400">{log.user}</div>
            <div className="text-sm text-gray-400">{log.ip}</div>
            <div className="text-sm text-gray-400 truncate">{log.details}</div>
            <div className="flex space-x-1">
              <Button size="sm" variant="outline" className="p-1 h-6 w-6">
                <Info className="h-3 w-3" />
              </Button>
            </div>
          </div>
        );
      }
      
      if (type === 'audit') {
        return (
          <div className="grid grid-cols-7 gap-4 p-4 border-b border-[var(--sublimes-border)]/30 items-center">
            <div className="text-sm text-gray-400">{log.timestamp}</div>
            <div className="text-sm text-[var(--sublimes-light-text)]">{log.action}</div>
            <div className="text-sm text-gray-400 truncate">{log.resource}</div>
            <div className="text-sm text-[var(--sublimes-light-text)]">{log.user}</div>
            <div className="text-sm text-gray-400 truncate">{log.changes}</div>
            <div>
              <Badge className="bg-green-500/10 text-green-500 text-xs">
                {log.status}
              </Badge>
            </div>
            <div className="flex space-x-1">
              <Button size="sm" variant="outline" className="p-1 h-6 w-6">
                <Info className="h-3 w-3" />
              </Button>
            </div>
          </div>
        );
      }
    }

    return (
      <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-[var(--sublimes-light-text)]">
                {type === 'system' ? log.event : log.action}
              </div>
              <Badge 
                className={`text-xs ${
                  (type === 'system' && log.level === 'ERROR') || (type === 'audit' && log.status === 'Failed') ? 'bg-red-500/10 text-red-500' :
                  (type === 'system' && log.level === 'WARNING') ? 'bg-yellow-500/10 text-yellow-500' :
                  'bg-green-500/10 text-green-500'
                }`}
              >
                {type === 'system' ? log.level : log.status}
              </Badge>
            </div>
            <div className="text-xs text-gray-400">{log.timestamp}</div>
            <div className="text-xs text-[var(--sublimes-light-text)]">
              {type === 'system' ? log.details : log.changes}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
              <div>User: {log.user}</div>
              <div>IP: {log.ip}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSystemLogsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[var(--sublimes-light-text)]">System Logs</h3>
          <p className="text-gray-400">Monitor system events and performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          <Button className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
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
              <option>All Levels</option>
              <option>ERROR</option>
              <option>WARNING</option>
              <option>INFO</option>
            </select>
            <select className="px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] text-[var(--sublimes-light-text)] rounded-md">
              <option>All Categories</option>
              <option>System</option>
              <option>Security</option>
              <option>Database</option>
              <option>API</option>
            </select>
            <Button className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Logs */}
      {viewMode === 'list' && (
        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardContent className="p-0">
            <div className="grid grid-cols-8 gap-4 p-4 border-b border-[var(--sublimes-border)] bg-[var(--sublimes-dark-bg)]">
              <div className="text-sm font-medium text-gray-400">Timestamp</div>
              <div className="text-sm font-medium text-gray-400">Level</div>
              <div className="text-sm font-medium text-gray-400">Category</div>
              <div className="text-sm font-medium text-gray-400">Event</div>
              <div className="text-sm font-medium text-gray-400">User</div>
              <div className="text-sm font-medium text-gray-400">IP</div>
              <div className="text-sm font-medium text-gray-400">Details</div>
              <div className="text-sm font-medium text-gray-400">Actions</div>
            </div>
            {systemLogs.map((log) => (
              <LogCard key={log.id} log={log} type="system" />
            ))}
          </CardContent>
        </Card>
      )}

      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {systemLogs.map((log) => (
            <LogCard key={log.id} log={log} type="system" />
          ))}
        </div>
      )}
    </div>
  );

  const renderAuditLogsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[var(--sublimes-light-text)]">Audit Logs</h3>
          <p className="text-gray-400">Track administrative actions and changes</p>
        </div>
        <div className="flex items-center space-x-3">
          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          <Button className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]">
            <Download className="w-4 h-4 mr-2" />
            Export Audit
          </Button>
        </div>
      </div>

      {viewMode === 'list' && (
        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardContent className="p-0">
            <div className="grid grid-cols-7 gap-4 p-4 border-b border-[var(--sublimes-border)] bg-[var(--sublimes-dark-bg)]">
              <div className="text-sm font-medium text-gray-400">Timestamp</div>
              <div className="text-sm font-medium text-gray-400">Action</div>
              <div className="text-sm font-medium text-gray-400">Resource</div>
              <div className="text-sm font-medium text-gray-400">User</div>
              <div className="text-sm font-medium text-gray-400">Changes</div>
              <div className="text-sm font-medium text-gray-400">Status</div>
              <div className="text-sm font-medium text-gray-400">Actions</div>
            </div>
            {auditLogs.map((log) => (
              <LogCard key={log.id} log={log} type="audit" />
            ))}
          </CardContent>
        </Card>
      )}

      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {auditLogs.map((log) => (
            <LogCard key={log.id} log={log} type="audit" />
          ))}
        </div>
      )}
    </div>
  );

  const renderActivityTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[var(--sublimes-light-text)]">User Activity</h3>
          <p className="text-gray-400">Monitor user actions and engagement</p>
        </div>
        <Button className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]">
          <Download className="w-4 h-4 mr-2" />
          Export Activity
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {activityLogs.map((log) => (
          <Card key={log.id} className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-[var(--sublimes-light-text)]">{log.action}</div>
                  <Badge className="bg-blue-500/10 text-blue-500 text-xs">
                    Activity
                  </Badge>
                </div>
                <div className="text-xs text-gray-400">{log.timestamp}</div>
                <div className="space-y-1 text-xs">
                  <div><span className="text-gray-400">User:</span> <span className="text-[var(--sublimes-light-text)]">{log.user}</span></div>
                  <div><span className="text-gray-400">Resource:</span> <span className="text-[var(--sublimes-light-text)]">{log.resource}</span></div>
                  <div><span className="text-gray-400">Location:</span> <span className="text-gray-500">{log.location}</span></div>
                  <div><span className="text-gray-400">Device:</span> <span className="text-gray-500">{log.device}</span></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-[var(--sublimes-dark-bg)] min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--sublimes-light-text)] mb-2">System Logs</h1>
        <p className="text-gray-400">View system logs, audit trails, and activity monitoring</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
        <StatCard
          title="Total Logs"
          value={logMetrics.totalLogs}
          subtitle="All time"
          icon={History}
          color="#3B82F6"
        />
        <StatCard
          title="Error Logs"
          value={logMetrics.errorLogs}
          subtitle="Need attention"
          icon={XCircle}
          color="#EF4444"
        />
        <StatCard
          title="Warning Logs"
          value={logMetrics.warningLogs}
          subtitle="Monitor closely"
          icon={AlertTriangle}
          color="#F59E0B"
        />
        <StatCard
          title="Info Logs"
          value={logMetrics.infoLogs}
          subtitle="Normal activity"
          icon={CheckCircle}
          color="#10B981"
        />
        <StatCard
          title="Active Users"
          value={logMetrics.activeUsers}
          subtitle="Currently online"
          icon={User}
          color="#8B5CF6"
        />
        <StatCard
          title="System Uptime"
          value={logMetrics.systemUptime}
          subtitle="This month"
          icon={Activity}
          color="#D4AF37"
        />
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <TabsTrigger value="system" className="data-[state=active]:bg-[var(--sublimes-gold)] data-[state=active]:text-[var(--sublimes-dark-bg)]">
            <Database className="h-4 w-4 mr-2" />
            System Logs
          </TabsTrigger>
          <TabsTrigger value="audit" className="data-[state=active]:bg-[var(--sublimes-gold)] data-[state=active]:text-[var(--sublimes-dark-bg)]">
            <History className="h-4 w-4 mr-2" />
            Audit Logs
          </TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-[var(--sublimes-gold)] data-[state=active]:text-[var(--sublimes-dark-bg)]">
            <Activity className="h-4 w-4 mr-2" />
            User Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="system">{renderSystemLogsTab()}</TabsContent>
        <TabsContent value="audit">{renderAuditLogsTab()}</TabsContent>
        <TabsContent value="activity">{renderActivityTab()}</TabsContent>
      </Tabs>
    </div>
  );
}