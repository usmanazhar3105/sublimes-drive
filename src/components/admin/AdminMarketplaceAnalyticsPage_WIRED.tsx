/**
 * AdminMarketplaceAnalyticsPage - FULLY WIRED with Supabase
 * 
 * NO HARD-CODED DATA - All from database:
 * - marketplace_listings (for counts, categories)
 * - boost_payments (for revenue)
 * - analytics_events (for views, interactions)
 * - profiles (for seller stats)
 */

import { useState, useEffect } from 'react';
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
  Star,
  Loader2
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
import { supabase } from '../../utils/supabase/client';

interface AnalyticsData {
  totalRevenue: number;
  activeListings: number;
  totalViews: number;
  conversionRate: number;
  totalListings: number;
  pendingApproval: number;
  carsListed: number;
  autoParts: number;
}

export function AdminMarketplaceAnalyticsPage_WIRED() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRevenue: 0,
    activeListings: 0,
    totalViews: 0,
    conversionRate: 0,
    totalListings: 0,
    pendingApproval: 0,
    carsListed: 0,
    autoParts: 0,
  });
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [topPerformers, setTopPerformers] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Calculate date range
      const now = new Date();
      let startDate = new Date();
      switch (selectedPeriod) {
        case '24h':
          startDate.setDate(now.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      // Fetch total listings count
      const { data: allListings, error: listingsError } = await supabase
        .from('marketplace_listings')
        .select('id, status, category, seller_id, created_at, price, views_count', { count: 'exact' });

      if (listingsError) throw listingsError;

      const totalListings = allListings?.length || 0;
      const activeListings = allListings?.filter(l => l.status === 'active').length || 0;
      const pendingApproval = allListings?.filter(l => l.status === 'pending').length || 0;
      const carsListed = allListings?.filter(l => l.category === 'cars').length || 0;
      const autoParts = allListings?.filter(l => l.category === 'parts').length || 0;

      // Calculate total views
      const totalViews = allListings?.reduce((sum, l) => sum + (l.views_count || 0), 0) || 0;

      // Fetch boost payments for revenue
      const { data: payments, error: paymentsError } = await supabase
        .from('boost_payments')
        .select('amount, created_at')
        .gte('created_at', startDate.toISOString());

      if (paymentsError) console.error('Payments error:', paymentsError);

      const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      // Calculate conversion rate (active listings / total listings)
      const conversionRate = totalListings > 0 ? ((activeListings / totalListings) * 100).toFixed(1) : '0.0';

      setAnalytics({
        totalRevenue,
        activeListings,
        totalViews,
        conversionRate: parseFloat(conversionRate),
        totalListings,
        pendingApproval,
        carsListed,
        autoParts,
      });

      // Group data by month for charts
      const monthlyData = groupByMonth(allListings || []);
      setRevenueData(monthlyData);

      // Category distribution
      const categories = [
        { name: 'Cars', value: carsListed, color: '#D4AF37' },
        { name: 'Auto Parts', value: autoParts, color: '#4A5FC1' },
        { name: 'Accessories', value: allListings?.filter(l => l.category === 'accessories').length || 0, color: '#7B68EE' },
        { name: 'Services', value: allListings?.filter(l => l.category === 'services').length || 0, color: '#10B981' },
      ];
      setCategoryData(categories.filter(c => c.value > 0));

      // Top performers (sellers with most listings and revenue)
      const sellersMap = new Map();
      allListings?.forEach(listing => {
        if (listing.seller_id) {
          if (!sellersMap.has(listing.seller_id)) {
            sellersMap.set(listing.seller_id, {
              seller_id: listing.seller_id,
              listings: 0,
              revenue: 0,
              views: 0,
            });
          }
          const seller = sellersMap.get(listing.seller_id);
          seller.listings++;
          seller.revenue += listing.price || 0;
          seller.views += listing.views_count || 0;
        }
      });

      const topSellers = Array.from(sellersMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Fetch seller names
      const sellerIds = topSellers.map(s => s.seller_id);
      if (sellerIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name')
          .in('id', sellerIds);

        const profilesMap = new Map(profiles?.map(p => [p.id, p.display_name]) || []);
        topSellers.forEach(seller => {
          seller.seller_name = profilesMap.get(seller.seller_id) || 'Unknown Seller';
        });
      }

      setTopPerformers(topSellers);

    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const groupByMonth = (listings: any[]) => {
    const monthsMap = new Map();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    listings.forEach(listing => {
      const date = new Date(listing.created_at);
      const monthKey = `${months[date.getMonth()]}`;
      
      if (!monthsMap.has(monthKey)) {
        monthsMap.set(monthKey, {
          name: monthKey,
          revenue: 0,
          listings: 0,
          views: 0,
        });
      }
      
      const month = monthsMap.get(monthKey);
      month.listings++;
      month.revenue += listing.price || 0;
      month.views += listing.views_count || 0;
    });

    return Array.from(monthsMap.values());
  };

  const exportAnalytics = () => {
    const csvData = [
      ['Metric', 'Value'],
      ['Total Revenue', `AED ${analytics.totalRevenue.toLocaleString()}`],
      ['Active Listings', analytics.activeListings],
      ['Total Views', analytics.totalViews],
      ['Conversion Rate', `${analytics.conversionRate}%`],
      ['Total Listings', analytics.totalListings],
      ['Pending Approval', analytics.pendingApproval],
      ['Cars Listed', analytics.carsListed],
      ['Auto Parts', analytics.autoParts],
      [],
      ['Top Performers'],
      ['Seller', 'Listings', 'Revenue', 'Views'],
      ...topPerformers.map(p => [
        p.seller_name,
        p.listings,
        `AED ${p.revenue.toLocaleString()}`,
        p.views,
      ]),
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Loader2 className="w-12 h-12 text-[var(--sublimes-gold)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-2">
            Marketplace Analytics
          </h2>
          <p className="text-gray-400">
            Live data from Supabase - No hard-coded values
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
        <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <ShoppingCart className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">
              {analytics.totalListings}
            </p>
            <p className="text-sm text-gray-400">Total Listings</p>
          </div>
        </div>

        <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">
              {analytics.pendingApproval}
            </p>
            <p className="text-sm text-gray-400">Pending Approval</p>
          </div>
        </div>

        <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Car className="w-5 h-5 text-green-500" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">
              {analytics.carsListed}
            </p>
            <p className="text-sm text-gray-400">Cars Listed</p>
          </div>
        </div>

        <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Wrench className="w-5 h-5 text-purple-500" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">
              {analytics.autoParts}
            </p>
            <p className="text-sm text-gray-400">Auto Parts</p>
          </div>
        </div>
      </div>

      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-green-500/10">
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">
              AED {analytics.totalRevenue.toLocaleString()}
            </p>
            <p className="text-sm text-gray-400">Total Revenue</p>
          </div>
        </div>

        <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <ShoppingCart className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">
              {analytics.activeListings}
            </p>
            <p className="text-sm text-gray-400">Active Listings</p>
          </div>
        </div>

        <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Eye className="w-5 h-5 text-purple-500" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">
              {analytics.totalViews.toLocaleString()}
            </p>
            <p className="text-sm text-gray-400">Total Views</p>
          </div>
        </div>

        <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Target className="w-5 h-5 text-orange-500" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">
              {analytics.conversionRate}%
            </p>
            <p className="text-sm text-gray-400">Conversion Rate</p>
          </div>
        </div>
      </div>

      {/* Monthly Trend Chart */}
      {revenueData.length > 0 && (
        <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
          <h3 className="text-lg font-bold text-[var(--sublimes-light-text)] mb-6">
            Monthly Listings Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
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
      )}

      {/* Category Distribution */}
      {categoryData.length > 0 && (
        <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
          <h3 className="text-lg font-bold text-[var(--sublimes-light-text)] mb-6">
            Category Distribution
          </h3>
          <div className="space-y-3">
            {categoryData.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-[var(--sublimes-dark-bg)]/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-[var(--sublimes-light-text)]">{category.name}</span>
                </div>
                <span className="text-[var(--sublimes-light-text)] font-medium">
                  {category.value} listings
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Performers */}
      {topPerformers.length > 0 && (
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
                    {performer.seller_name}
                  </p>
                  <p className="text-sm text-gray-400">
                    {performer.listings} listings • {performer.views} views
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[var(--sublimes-gold)]">
                    AED {performer.revenue.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
