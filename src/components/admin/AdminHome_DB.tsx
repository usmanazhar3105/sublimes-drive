import { 
  Users, 
  UserCheck, 
  MessageSquare, 
  DollarSign, 
  Car, 
  Eye, 
  Gamepad2, 
  Shield,
  Download,
  Send,
  Play,
  Settings,
  History,
  Database,
  Bot,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAdminSettings } from './AdminSettingsContext';


interface AdminHomeProps {
  onNavigate?: (section: string) => void;
}

export function AdminHome({ onNavigate }: AdminHomeProps = {}) {
  const { autoApprovalSettings, isAutoApprovalEnabled } = useAdminSettings();
  const kpiData = [
    {
      title: 'New Signups',
      value: '247',
      subtitle: '+12% vs last week',
      icon: Users,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Verified Users',
      value: '1,834',
      subtitle: '94% verification rate',
      icon: UserCheck,
      color: 'text-[var(--sublimes-gold)]',
      bgColor: 'bg-[var(--sublimes-gold)]/10'
    },
    {
      title: 'Active Posts',
      value: '892',
      subtitle: '23 urgent posts',
      icon: MessageSquare,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Revenue',
      value: 'AED 45.2K',
      subtitle: '+18% this month',
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Listings',
      value: '1,247',
      subtitle: '156 cars, 1091 parts',
      icon: Car,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    },
    {
      title: 'Ad Impressions',
      value: '89.4K',
      subtitle: '2.3% CTR',
      icon: Eye,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'Game Plays',
      value: '3,421',
      subtitle: '67% completion rate',
      icon: Gamepad2,
      color: 'text-teal-500',
      bgColor: 'bg-teal-500/10'
    },
    {
      title: 'System Health',
      value: '99.8%',
      subtitle: 'All systems operational',
      icon: Shield,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    }
  ];

  const quickActions = [
    { label: 'Export CSV', icon: Download, color: 'bg-blue-500', action: () => exportData() },
    { label: 'Broadcast Push', icon: Send, color: 'bg-orange-500', action: () => onNavigate?.('notifications') },
    { label: 'Run Cron Jobs', icon: Play, color: 'bg-green-500', action: () => runCronJobs() },
    { label: 'Maintenance Mode', icon: Settings, color: 'bg-red-500', action: () => toggleMaintenance() },
    { label: 'View Audit Logs', icon: History, color: 'bg-gray-500', action: () => onNavigate?.('logs') },
    { label: 'System Backup', icon: Database, color: 'bg-purple-500', action: () => createBackup() }
  ];

  const exportData = () => {
    // Show export options
    const option = window.confirm('Export all platform data? This will generate a CSV file with all users, posts, and listings.');
    if (option) {
      alert('Data export started. You will receive an email when complete.');
    }
  };

  const runCronJobs = () => {
    alert('Running maintenance cron jobs...');
  };

  const toggleMaintenance = () => {
    const confirm = window.confirm('Enable maintenance mode? This will temporarily disable the platform for all users.');
    if (confirm) {
      alert('Maintenance mode enabled. Platform is now offline for users.');
    }
  };

  const createBackup = () => {
    alert('Creating system backup...');
  };

  const systemHealth = [
    { service: 'Database', status: 'Operational', color: 'text-green-500' },
    { service: 'Storage', status: 'Operational', color: 'text-green-500' },
    { service: 'Search Engine', status: 'Operational', color: 'text-green-500' },
    { service: 'Push Notifications', status: 'Warning', color: 'text-orange-500' },
    { service: 'Payment Gateway', status: 'Operational', color: 'text-green-500' },
    { service: 'AI Services', status: 'Operational', color: 'text-green-500' }
  ];

  const recentActivity = [
    {
      title: 'User Registration',
      description: 'Ahmed Hassan registered as Car Owner',
      time: '2 minutes ago',
      icon: Users,
      iconColor: 'text-green-500'
    },
    {
      title: 'Listing Approved',
      description: '2023 BMW M3 listing approved',
      time: '5 minutes ago',
      icon: Car,
      iconColor: 'text-blue-500'
    },
    {
      title: 'Payment Received',
      description: 'AED 50 listing fee payment',
      time: '12 minutes ago',
      icon: DollarSign,
      iconColor: 'text-[var(--sublimes-gold)]'
    },
    {
      title: 'Urgent Post',
      description: 'Emergency: Car breakdown on E11',
      time: '18 minutes ago',
      icon: MessageSquare,
      iconColor: 'text-red-500'
    }
  ];

  return (
    <div className="p-6 bg-[var(--sublimes-dark-bg)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--sublimes-light-text)]">Command Center</h1>
          <p className="text-gray-400 mt-1">Overview of your Sublimes Drive platform</p>
        </div>
        <button className="flex items-center space-x-2 bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] px-4 py-2 rounded-lg font-medium hover:bg-[var(--sublimes-gold)]/90 transition-colors">
          <Download className="w-4 h-4" />
          <span>Export Data</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div key={index} className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${kpi.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${kpi.color}`} />
                </div>
                <div className="px-2 py-1 bg-[var(--sublimes-gold)]/10 text-[var(--sublimes-gold)] text-xs font-bold rounded">
                  Live
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">{kpi.value}</p>
                <p className="text-sm text-gray-400 mb-2">{kpi.title}</p>
                <p className={`text-xs font-medium ${kpi.color}`}>{kpi.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-[var(--sublimes-light-text)] mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={action.action}
                className={`flex items-center space-x-2 ${action.color} text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity`}
              >
                <Icon className="w-4 h-4" />
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Auto-Approval Status */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[var(--sublimes-light-text)]">🤖 Auto-Approval Status</h2>
          <button
            onClick={() => onNavigate?.('auto-approval')}
            className="text-[var(--sublimes-gold)] hover:text-[var(--sublimes-gold)]/80 text-sm font-medium"
          >
            Manage Settings →
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-xs text-green-500 font-medium bg-green-500/10 px-2 py-1 rounded">ACTIVE</span>
            </div>
            <h3 className="font-medium text-[var(--sublimes-light-text)] mb-1">Auto-Approved</h3>
            <p className="text-2xl font-bold text-green-500">
              {Object.values(autoApprovalSettings).filter(Boolean).length}
            </p>
            <p className="text-xs text-gray-400">Categories enabled</p>
          </div>
          
          <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-orange-500" />
              </div>
              <span className="text-xs text-orange-500 font-medium bg-orange-500/10 px-2 py-1 rounded">MANUAL</span>
            </div>
            <h3 className="font-medium text-[var(--sublimes-light-text)] mb-1">Manual Review</h3>
            <p className="text-2xl font-bold text-orange-500">
              {Object.values(autoApprovalSettings).filter(v => !v).length}
            </p>
            <p className="text-xs text-gray-400">Categories pending</p>
          </div>
          
          <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-xs text-blue-500 font-medium bg-blue-500/10 px-2 py-1 rounded">TOTAL</span>
            </div>
            <h3 className="font-medium text-[var(--sublimes-light-text)] mb-1">Total Categories</h3>
            <p className="text-2xl font-bold text-blue-500">
              {Object.keys(autoApprovalSettings).length}
            </p>
            <p className="text-xs text-gray-400">Available options</p>
          </div>
        </div>
        
        {/* Quick Status Overview */}
        <div className="mt-4 bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-4">
          <h3 className="font-medium text-[var(--sublimes-light-text)] mb-3">Quick Status</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries({
              'Garage Verifications': 'garageVerifications',
              'Marketplace Listings': 'marketplaceListings',
              'Community Posts': 'communityPosts',
              'Vehicle Verifications': 'vehicleVerifications'
            }).map(([label, key]) => (
              <div
                key={key}
                className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
                  isAutoApprovalEnabled(key as any)
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-gray-500/10 text-gray-400'
                }`}
              >
                {isAutoApprovalEnabled(key as any) ? (
                  <Bot className="w-3 h-3" />
                ) : (
                  <AlertCircle className="w-3 h-3" />
                )}
                <span>{label}</span>
                <span className="opacity-75">
                  {isAutoApprovalEnabled(key as any) ? '🤖' : '👤'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Health & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
          <h3 className="text-lg font-bold text-[var(--sublimes-light-text)] mb-4">System Health</h3>
          <div className="space-y-4">
            {systemHealth.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${item.color.replace('text-', 'bg-')}`}></div>
                  <span className="text-[var(--sublimes-light-text)]">{item.service}</span>
                </div>
                <span className={`text-sm font-medium ${item.color}`}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
          <h3 className="text-lg font-bold text-[var(--sublimes-light-text)] mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-8 h-8 ${activity.iconColor.replace('text-', 'bg-')}/10 rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${activity.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--sublimes-light-text)]">{activity.title}</p>
                    <p className="text-xs text-gray-400">{activity.description}</p>
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0">{activity.time}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}