import { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  ShoppingCart,
  Car,
  Wrench,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  LineChart,
  Clock,
  Target,
  Zap,
  Star
} from 'lucide-react';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie as RechartsPie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { toast } from 'sonner';

export function AdminMarketplaceAnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  // Sample data - would come from API in real app
  const revenueData = [
    { name: 'Jan', revenue: 12500, listings: 145, views: 32500 },
    { name: 'Feb', revenue: 15800, listings: 167, views: 38900 },
    { name: 'Mar', revenue: 18200, listings: 189, views: 45200 },
    { name: 'Apr', revenue: 22100, listings: 201, views: 52800 },
    { name: 'May', revenue: 19500, listings: 178, views: 48600 },
    { name: 'Jun', revenue: 25300, listings: 223, views: 61200 },
    { name: 'Jul', revenue: 28900, listings: 256, views: 68500 }
  ];

  const categoryData = [
    { name: 'Cars', value: 65, revenue: 185000, color: '#D4AF37' },
    { name: 'Auto Parts', value: 25, revenue: 78000, color: '#4A5FC1' },
    { name: 'Accessories', value: 7, revenue: 23000, color: '#7B68EE' },
    { name: 'Services', value: 3, revenue: 12000, color: '#10B981' }
  ];

  const performanceMetrics = [
    {
      title: 'Total Revenue',
      value: 'AED 298,000',
      change: '+22.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Active Listings',
      value: '1,247',
      change: '+18.2%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Total Views',
      value: '68.5K',
      change: '+15.8%',
      trend: 'up',
      icon: Eye,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'Conversion Rate',
      value: '3.2%',
      change: '-0.3%',
      trend: 'down',
      icon: Target,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    }
  ];

  const topPerformers = [
    {
      seller: 'Dubai Motors Elite',
      listings: 23,
      revenue: 45600,
      views: 12500,
      rating: 4.9
    },
    {
      seller: 'Chinese Car Hub',
      listings: 18,
      revenue: 38900,
      views: 9800,
      rating: 4.8
    },
    {
      seller: 'BYD Parts Center',
      listings: 156,
      revenue: 28700,
      views: 15600,
      rating: 4.7
    },
    {
      seller: 'Tesla UAE Official',
      listings: 12,
      revenue: 67800,
      views: 8900,
      rating: 4.9
    }
  ];

  const marketTrends = [
    { category: 'Electric Vehicles', growth: '+45%', listings: 89 },
    { category: 'Hybrid Cars', growth: '+32%', listings: 156 },
    { category: 'Chinese Brands', growth: '+28%', listings: 234 },
    { category: 'Performance Parts', growth: '+18%', listings: 78 },
    { category: 'Luxury Cars', growth: '+15%', listings: 45 }
  ];

  const boostPerformance = [
    { package: 'Featured', sales: 89, revenue: 17800, conversion: '12.5%' },
    { package: 'Premium', sales: 156, revenue: 15600, conversion: '8.2%' },
    { package: 'Basic', sales: 234, revenue: 11700, conversion: '5.8%' }
  ];

  const exportAnalytics = () => {
    const data = {
      performanceMetrics,
      revenueData,
      categoryData,
      topPerformers,
      marketTrends,
      boostPerformance,
      exportDate: new Date().toISOString()
    };

    const csvData = [
      ['Metric', 'Value', 'Change', 'Period'],
      ...performanceMetrics.map(metric => [
        metric.title,
        metric.value,
        metric.change,
        selectedPeriod
      ]),
      [],
      ['Revenue Data'],
      ['Month', 'Revenue', 'Listings', 'Views'],
      ...revenueData.map(item => [
        item.name,
        item.revenue,
        item.listings,
        item.views
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `marketplace-analytics-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('✅ Analytics data exported successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-2">
            Marketplace Analytics
          </h2>
          <p className="text-gray-400">
            Comprehensive insights into marketplace performance and trends
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)]"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          
          <button
            onClick={exportAnalytics}
            className="flex items-center space-x-2 px-4 py-2 bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] rounded-lg hover:bg-[var(--sublimes-gold)]/90 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceMetrics.map((metric, index) => (
          <div
            key={index}
            className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <metric.icon className={`w-5 h-5 ${metric.color}`} />
              </div>
              <div className={`flex items-center space-x-1 ${metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {metric.trend === 'up' ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">{metric.change}</span>
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">
                {metric.value}
              </p>
              <p className="text-sm text-gray-400">{metric.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue and Listing Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[var(--sublimes-light-text)]">Revenue Trend</h3>
            <div className="flex items-center space-x-2">
              <LineChart className="w-5 h-5 text-[var(--sublimes-gold)]" />
              <span className="text-sm text-gray-400">Monthly Growth</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A3441" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--sublimes-card-bg)',
                  border: '1px solid var(--sublimes-border)',
                  borderRadius: '8px',
                  color: 'var(--sublimes-light-text)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#D4AF37" 
                fill="#D4AF37"
                fillOpacity={0.1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Listings Performance */}
        <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[var(--sublimes-light-text)]">Listings & Views</h3>
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-400">Performance</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A3441" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--sublimes-card-bg)',
                  border: '1px solid var(--sublimes-border)',
                  borderRadius: '8px',
                  color: 'var(--sublimes-light-text)'
                }}
              />
              <Bar dataKey="listings" fill="#4A5FC1" />
              <Bar dataKey="views" fill="#7B68EE" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Distribution & Market Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[var(--sublimes-light-text)]">Category Distribution</h3>
            <PieChart className="w-5 h-5 text-[var(--sublimes-gold)]" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={200}>
              <RechartsPieChart>
                <RechartsPie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </RechartsPie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--sublimes-card-bg)',
                    border: '1px solid var(--sublimes-border)',
                    borderRadius: '8px',
                    color: 'var(--sublimes-light-text)'
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {categoryData.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm text-[var(--sublimes-light-text)]">
                      {category.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-[var(--sublimes-light-text)]">
                      {category.value}%
                    </p>
                    <p className="text-xs text-gray-400">
                      AED {category.revenue.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Market Trends */}
        <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[var(--sublimes-light-text)]">Market Trends</h3>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="space-y-4">
            {marketTrends.map((trend, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-4 bg-[var(--sublimes-dark-bg)]/50 rounded-lg border border-[var(--sublimes-border)]/50"
              >
                <div>
                  <p className="font-medium text-[var(--sublimes-light-text)]">
                    {trend.category}
                  </p>
                  <p className="text-sm text-gray-400">
                    {trend.listings} listings
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center space-x-1 text-green-500 font-medium">
                    <ArrowUpRight className="w-4 h-4" />
                    <span>{trend.growth}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performers & Boost Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[var(--sublimes-light-text)]">Top Performers</h3>
            <Star className="w-5 h-5 text-[var(--sublimes-gold)]" />
          </div>
          <div className="space-y-4">
            {topPerformers.map((performer, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-4 bg-[var(--sublimes-dark-bg)]/50 rounded-lg border border-[var(--sublimes-border)]/50"
              >
                <div className="flex-1">
                  <p className="font-medium text-[var(--sublimes-light-text)]">
                    {performer.seller}
                  </p>
                  <p className="text-sm text-gray-400">
                    {performer.listings} listings • {performer.views} views
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[var(--sublimes-gold)]">
                    AED {performer.revenue.toLocaleString()}
                  </p>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-[var(--sublimes-gold)]" />
                    <span className="text-sm text-gray-400">{performer.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Boost Package Performance */}
        <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[var(--sublimes-light-text)]">Boost Performance</h3>
            <Zap className="w-5 h-5 text-[var(--sublimes-gold)]" />
          </div>
          <div className="space-y-4">
            {boostPerformance.map((boost, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-4 bg-[var(--sublimes-dark-bg)]/50 rounded-lg border border-[var(--sublimes-border)]/50"
              >
                <div>
                  <p className="font-medium text-[var(--sublimes-light-text)]">
                    {boost.package} Boost
                  </p>
                  <p className="text-sm text-gray-400">
                    {boost.sales} sales • {boost.conversion} conversion
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-500">
                    AED {boost.revenue.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
        <h3 className="text-lg font-bold text-[var(--sublimes-light-text)] mb-6">
          Key Insights & Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="font-medium text-green-500">Growth Opportunity</span>
            </div>
            <p className="text-sm text-[var(--sublimes-light-text)]">
              Electric vehicle listings are up 45%. Consider promoting EV categories to capitalize on this trend.
            </p>
          </div>
          
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-5 h-5 text-blue-500" />
              <span className="font-medium text-blue-500">User Engagement</span>
            </div>
            <p className="text-sm text-[var(--sublimes-light-text)]">
              Featured boost packages show 12.5% higher conversion rates. Encourage more sellers to upgrade.
            </p>
          </div>
          
          <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <span className="font-medium text-orange-500">Processing Time</span>
            </div>
            <p className="text-sm text-[var(--sublimes-light-text)]">
              Average listing approval time is 3.2 hours. Consider implementing auto-approval for verified sellers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}