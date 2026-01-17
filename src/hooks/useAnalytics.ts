import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface AnalyticsData {
  totalUsers: number;
  activeListings: number;
  totalRevenue: number;
  pendingVerifications: number;
  unreadReports: number;
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
}

export function useAnalytics() {
  const [data, setData] = useState<AnalyticsData>({
    totalUsers: 0,
    activeListings: 0,
    totalRevenue: 0,
    pendingVerifications: 0,
    unreadReports: 0,
    dailyActiveUsers: 0,
    weeklyActiveUsers: 0,
    monthlyActiveUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Get quick stats from RPC
      const { data: quickStats, error: quickError } = await supabase
        .rpc('fn_get_system_quick_stats');

      if (quickError) throw quickError;

      // Get revenue data
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'completed');

      const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      // Get active users
      const now = new Date();
      const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const { data: dailyUsers } = await supabase
        .from('analytics_events')
        .select('user_id', { count: 'exact', head: true })
        .gte('created_at', dayAgo.toISOString());

      const { data: weeklyUsers } = await supabase
        .from('analytics_events')
        .select('user_id', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString());

      const { data: monthlyUsers } = await supabase
        .from('analytics_events')
        .select('user_id', { count: 'exact', head: true })
        .gte('created_at', monthAgo.toISOString());

      setData({
        totalUsers: quickStats?.total_users || 0,
        activeListings: quickStats?.active_listings || 0,
        totalRevenue: totalRevenue / 100, // Convert from fils to AED
        pendingVerifications: quickStats?.pending_verifications || 0,
        unreadReports: quickStats?.unread_reports || 0,
        dailyActiveUsers: dailyUsers?.length || 0,
        weeklyActiveUsers: weeklyUsers?.length || 0,
        monthlyActiveUsers: monthlyUsers?.length || 0,
      });

    } catch (err: any) {
      console.error('Analytics fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // Refresh every 5 minutes
    const interval = setInterval(fetchAnalytics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchAnalytics,
  };
}
