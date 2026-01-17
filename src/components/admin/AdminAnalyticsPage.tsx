import { 
  TrendingUp, 
  Users, 
  Eye, 
  ShoppingCart, 
  Star,
  Download,
  Calendar,
  Filter
} from 'lucide-react';

export function AdminAnalyticsPage() {
  const analyticsData = {
    overview: [
      {
        title: 'Total Sessions',
        value: '45.2K',
        change: '+12.5%',
        changeType: 'positive',
        icon: Eye,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10'
      },
      {
        title: 'Active Users',
        value: '12.8K',
        change: '+8.2%',
        changeType: 'positive',
        icon: Users,
        color: 'text-green-500',
        bgColor: 'bg-green-500/10'
      },
      {
        title: 'Conversion Rate',
        value: '3.24%',
        change: '+0.5%',
        changeType: 'positive',
        icon: TrendingUp,
        color: 'text-[var(--sublimes-gold)]',
        bgColor: 'bg-[var(--sublimes-gold)]/10'
      },
      {
        title: 'Revenue',
        value: 'AED 89.5K',
        change: '+18.7%',
        changeType: 'positive',
        icon: ShoppingCart,
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10'
      }
    ],
    engagement: [
      { metric: 'Daily Active Users', current: '4.2K', previous: '3.8K', change: '+10.5%' },
      { metric: 'Session Duration', current: '8m 32s', previous: '7m 45s', change: '+10.1%' },
      { metric: 'Pages per Session', current: '4.8', previous: '4.2', change: '+14.3%' },
      { metric: 'Bounce Rate', current: '32.1%', previous: '38.5%', change: '-16.6%' },
    ],
    marketplace: [
      { metric: 'Listings Created', value: '156', change: '+23%' },
      { metric: 'Completed Sales', value: '89', change: '+18%' },
      { metric: 'Average Sale Price', value: 'AED 45.2K', change: '+12%' },
      { metric: 'Conversion Rate', value: '2.8%', change: '+0.4%' },
    ],
    topContent: [
      { title: 'BMW M3 2023 Review', views: '12.5K', engagement: '89%', category: 'Review' },
      { title: 'Oil Change Guide', views: '8.9K', engagement: '76%', category: 'Guide' },
      { title: 'Dubai Car Meet 2024', views: '7.2K', engagement: '92%', category: 'Event' },
      { title: 'Best Garages in UAE', views: '6.8K', engagement: '71%', category: 'Directory' },
    ],
    demographics: [
      { emirate: 'Dubai', percentage: 42, users: '5.4K' },
      { emirate: 'Abu Dhabi', percentage: 28, users: '3.6K' },
      { emirate: 'Sharjah', percentage: 15, users: '1.9K' },
      { emirate: 'Ajman', percentage: 8, users: '1.0K' },
      { emirate: 'Others', percentage: 7, users: '0.9K' },
    ]
  };

  return (
    <div className="p-6 bg-[var(--sublimes-dark-bg)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--sublimes-light-text)]">Analytics Dashboard</h1>
          <p className="text-gray-400 mt-1">Comprehensive insights into your platform performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 text-gray-400 hover:text-[var(--sublimes-light-text)] px-3 py-2 rounded-lg hover:bg-[var(--sublimes-card-bg)]">
            <Calendar className="w-4 h-4" />
            <span>Last 30 days</span>
          </button>
          <button className="flex items-center space-x-2 text-gray-400 hover:text-[var(--sublimes-light-text)] px-3 py-2 rounded-lg hover:bg-[var(--sublimes-card-bg)]">
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
          <button className="flex items-center space-x-2 bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] px-4 py-2 rounded-lg font-medium hover:bg-[var(--sublimes-gold)]/90">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {analyticsData.overview.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${item.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <div className="px-2 py-1 bg-green-500/10 text-green-500 text-xs font-bold rounded">
                  {item.change}
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">{item.value}</p>
                <p className="text-sm text-gray-400">{item.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Engagement Metrics */}
        <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
          <h3 className="text-lg font-bold text-[var(--sublimes-light-text)] mb-6">User Engagement</h3>
          <div className="space-y-4">
            {analyticsData.engagement.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[var(--sublimes-light-text)]">{item.metric}</p>
                  <p className="text-sm text-gray-400">Previous: {item.previous}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[var(--sublimes-light-text)]">{item.current}</p>
                  <p className="text-sm text-green-500 font-medium">{item.change}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Marketplace Analytics */}
        <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
          <h3 className="text-lg font-bold text-[var(--sublimes-light-text)] mb-6">Marketplace Performance</h3>
          <div className="space-y-4">
            {analyticsData.marketplace.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <p className="font-medium text-[var(--sublimes-light-text)]">{item.metric}</p>
                <div className="text-right">
                  <p className="text-lg font-bold text-[var(--sublimes-light-text)]">{item.value}</p>
                  <p className="text-sm text-green-500 font-medium">{item.change}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Content */}
        <div className="lg:col-span-2 bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
          <h3 className="text-lg font-bold text-[var(--sublimes-light-text)] mb-6">Top Performing Content</h3>
          <div className="space-y-4">
            {analyticsData.topContent.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-[var(--sublimes-dark-bg)] rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-[var(--sublimes-light-text)]">{item.title}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-sm text-gray-400">{item.category}</span>
                    <span className="text-sm text-gray-400">•</span>
                    <span className="text-sm text-[var(--sublimes-gold)]">{item.views} views</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[var(--sublimes-light-text)]">{item.engagement}</p>
                  <p className="text-xs text-gray-400">Engagement</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Demographics */}
        <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
          <h3 className="text-lg font-bold text-[var(--sublimes-light-text)] mb-6">User Demographics</h3>
          <div className="space-y-4">
            {analyticsData.demographics.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[var(--sublimes-light-text)]">{item.emirate}</span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-[var(--sublimes-light-text)]">{item.percentage}%</span>
                    <p className="text-xs text-gray-400">{item.users}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-[var(--sublimes-gold)] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Traffic Sources Chart Placeholder */}
      <div className="mt-8 bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-[var(--sublimes-light-text)]">Traffic Sources</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span>Last 30 days</span>
          </div>
        </div>
        
        <div className="h-64 bg-[var(--sublimes-dark-bg)] rounded-lg flex items-center justify-center">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-[var(--sublimes-light-text)] font-medium">Traffic Analytics Chart</p>
            <p className="text-sm text-gray-400 mt-1">Chart visualization would be implemented here</p>
          </div>
        </div>
      </div>

      {/* Device & Browser Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
          <h3 className="text-lg font-bold text-[var(--sublimes-light-text)] mb-6">Device Types</h3>
          <div className="space-y-4">
            {[
              { device: 'Mobile', percentage: 68, sessions: '30.7K' },
              { device: 'Desktop', percentage: 24, sessions: '10.8K' },
              { device: 'Tablet', percentage: 8, sessions: '3.6K' },
            ].map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[var(--sublimes-light-text)]">{item.device}</span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-[var(--sublimes-light-text)]">{item.percentage}%</span>
                    <p className="text-xs text-gray-400">{item.sessions}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
          <h3 className="text-lg font-bold text-[var(--sublimes-light-text)] mb-6">Top Browsers</h3>
          <div className="space-y-4">
            {[
              { browser: 'Chrome', percentage: 52, sessions: '23.4K' },
              { browser: 'Safari', percentage: 28, sessions: '12.7K' },
              { browser: 'Firefox', percentage: 12, sessions: '5.4K' },
              { browser: 'Edge', percentage: 8, sessions: '3.6K' },
            ].map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[var(--sublimes-light-text)]">{item.browser}</span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-[var(--sublimes-light-text)]">{item.percentage}%</span>
                    <p className="text-xs text-gray-400">{item.sessions}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}