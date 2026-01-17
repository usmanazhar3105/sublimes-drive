/**
 * AdminHome_Wired - Database-connected Admin Home Dashboard
 * Uses: useProfile, useListings, useAnalytics
 */

import { useEffect, useState } from 'react';
import { Users, UserCheck, MessageSquare, DollarSign, Car, Eye, Shield, TrendingUp, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useProfile, useListings } from '../../src/hooks';
import { supabase } from '../../utils/supabase/client';

// Real-time Recent Activity Component
function RecentActivityList() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        // Fetch recent audit logs
        const { data, error } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;

        // Format for display
        const formatted = (data || []).map(log => ({
          action: log.action || 'Activity',
          user: log.metadata?.user_name || log.metadata?.title || 'System',
          time: formatTimeAgo(log.created_at),
        }));

        setActivities(formatted.slice(0, 4)); // Show top 4
      } catch (error) {
        console.error('Error fetching recent activity:', error);
        // Fallback to empty state
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivity();

    // Refresh every 30 seconds
    const interval = setInterval(fetchRecentActivity, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTimeAgo = (timestamp: string) => {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-[#8B92A7] text-sm">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, idx) => (
        <div key={idx} className="flex items-center justify-between py-2 border-b border-[#1A2332] last:border-0">
          <div>
            <p className="text-sm text-[#E8EAED]">{activity.action}</p>
            <p className="text-xs text-[#8B92A7]">{activity.user}</p>
          </div>
          <p className="text-xs text-[#8B92A7]">{activity.time}</p>
        </div>
      ))}
    </div>
  );
}

interface AdminHomeProps {
  onNavigate?: (section: string) => void;
}

export function AdminHome_Wired({ onNavigate }: AdminHomeProps) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    verifiedUsers: 0,
    totalPosts: 0,
    totalRevenue: 0,
    totalListings: 0,
    totalViews: 0,
  });

  const { profile } = useProfile();
  const { loading: listingsLoading } = useListings();
  
  // Safely track page view without crashing
  useEffect(() => {
    try {
      console.log('📊 Admin Home - Page viewed');
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }, []);

  // Calculate stats from database
  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        // Fetch total users count
        const { count: totalUsersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Fetch verified users count
        const { count: verifiedUsersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .or('verification_status.eq.approved,car_owner_verified.eq.true,garage_owner_verified.eq.true');

        // Fetch posts count
        const { count: postsCount } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'approved');

        // Fetch total revenue from wallet_transactions
        const { data: payments } = await supabase
          .from('wallet_transactions')
          .select('amount')
          .eq('type', 'credit')
          .eq('status', 'completed');
        
        const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

        // Fetch total listings
        const { count: listingsCount } = await supabase
          .from('market_listings')
          .select('*', { count: 'exact', head: true });

        // Fetch total views from post_stats
        const { data: postStats } = await supabase
          .from('post_stats')
          .select('view_count');
        
        const totalViews = postStats?.reduce((sum, s) => sum + (s.view_count || 0), 0) || 0;

        setStats({
          totalUsers: totalUsersCount || 0,
          verifiedUsers: verifiedUsersCount || 0,
          totalPosts: postsCount || 0,
          totalRevenue,
          totalListings: listingsCount || 0,
          totalViews,
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      }
    };

    fetchAdminStats();
  }, []);

  const kpiData = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      subtitle: 'Registered accounts',
      icon: Users,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Verified Users',
      value: stats.verifiedUsers.toLocaleString(),
      subtitle: stats.totalUsers > 0 ? `${Math.round((stats.verifiedUsers / stats.totalUsers) * 100)}% verification rate` : '0%',
      icon: UserCheck,
      color: 'text-[#D4AF37]',
      bgColor: 'bg-[#D4AF37]/10'
    },
    {
      title: 'Active Posts',
      value: stats.totalPosts.toLocaleString(),
      subtitle: 'Approved community posts',
      icon: MessageSquare,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Revenue',
      value: `AED ${stats.totalRevenue >= 1000 ? (stats.totalRevenue / 1000).toFixed(1) + 'K' : stats.totalRevenue}`,
      subtitle: 'From boost payments',
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Listings',
      value: stats.totalListings.toLocaleString(),
      subtitle: 'Marketplace listings',
      icon: Car,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    },
    {
      title: 'Total Views',
      value: stats.totalViews >= 1000 ? `${(stats.totalViews / 1000).toFixed(1)}K` : stats.totalViews.toString(),
      subtitle: 'Listing views',
      icon: Eye,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    }
  ];

  if (listingsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-[#D4AF37]/20 to-transparent border border-[#D4AF37]/30 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-3">
          <Shield className="text-[#D4AF37]" size={32} />
          <div>
            <h2 className="text-2xl text-[#E8EAED]" style={{ fontWeight: 600 }}>
              Welcome back, {profile?.display_name || 'Admin'}!
            </h2>
            <p className="text-[#8B92A7]">Here's what's happening with Sublimes Drive today</p>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="bg-[#0F1829] border-[#1A2332] rounded-xl hover:border-[#D4AF37]/30 transition-all cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg ${kpi.bgColor} flex items-center justify-center`}>
                    <Icon className={kpi.color} size={24} />
                  </div>
                  <TrendingUp className="text-green-500" size={16} />
                </div>
                <h3 className="text-sm text-[#8B92A7] mb-1">{kpi.title}</h3>
                <p className="text-3xl text-[#E8EAED] mb-2" style={{ fontWeight: 600 }}>
                  {kpi.value}
                </p>
                <p className="text-xs text-[#8B92A7]">{kpi.subtitle}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="bg-[#0F1829] border-[#1A2332] rounded-xl">
        <CardHeader>
          <CardTitle className="text-xl text-[#E8EAED]">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => onNavigate?.('users')}
              className="w-full text-left bg-[#0B1426] border border-[#1A2332] hover:border-[#D4AF37]/30 rounded-lg p-4 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Users className="text-[#D4AF37]" size={20} />
                <div>
                  <p className="text-sm text-[#E8EAED]" style={{ fontWeight: 600 }}>Manage Users</p>
                  <p className="text-xs text-[#8B92A7]">View and manage user accounts</p>
                </div>
              </div>
            </button>
            <button
              onClick={() => onNavigate?.('verification')}
              className="w-full text-left bg-[#0B1426] border border-[#1A2332] hover:border-[#D4AF37]/30 rounded-lg p-4 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Shield className="text-[#D4AF37]" size={20} />
                <div>
                  <p className="text-sm text-[#E8EAED]" style={{ fontWeight: 600 }}>Review Verifications</p>
                  <p className="text-xs text-[#8B92A7]">Approve pending verifications</p>
                </div>
              </div>
            </button>
            <button
              onClick={() => onNavigate?.('analytics')}
              className="w-full text-left bg-[#0B1426] border border-[#1A2332] hover:border-[#D4AF37]/30 rounded-lg p-4 transition-colors"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="text-purple-500" size={20} />
                <div>
                  <p className="text-sm text-[#E8EAED]" style={{ fontWeight: 600 }}>View Analytics</p>
                  <p className="text-xs text-[#8B92A7]">Check platform statistics</p>
                </div>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity - REAL DATA FROM AUDIT LOGS */}
      <Card className="bg-[#0F1829] border-[#1A2332]">
        <CardHeader>
          <CardTitle className="text-xl text-[#E8EAED]">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentActivityList />
        </CardContent>
      </Card>
    </div>
  );
}
