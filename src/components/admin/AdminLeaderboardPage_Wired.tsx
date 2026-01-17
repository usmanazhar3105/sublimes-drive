/**
 * WiringDoc (auto)
 * Entities: [leaderboard_periods, leaderboard_snapshots]
 * Reads: leaderboard_periods(table), leaderboard_snapshots(table), all leaderboard views
 * Writes: fn.update_leaderboard_snapshot, fn.create_current_period
 * RLS: admin_all (periods/snapshots management)
 * Role UI: admin/editor only
 * Stripe: n/a
 * AI Bot: n/a
 * Telemetry: view:admin_leaderboard, action:update_snapshot
 * Last Verified: 2025-10-31
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { 
  Trophy, 
  RefreshCw,
  Calendar,
  Users,
  TrendingUp,
  Clock,
  Play,
  CheckCircle,
  AlertCircle,
  Database
} from 'lucide-react';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner';

interface LeaderboardPeriod {
  id: string;
  period_type: 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date: string;
  is_current: boolean;
  created_at: string;
}

interface LeaderboardStats {
  total_snapshots: number;
  unique_users: number;
  last_update: string | null;
  periods_count: number;
}

export function AdminLeaderboardPage_Wired() {
  const [periods, setPeriods] = useState<LeaderboardPeriod[]>([]);
  const [stats, setStats] = useState<LeaderboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchPeriods(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPeriods = async () => {
    const { data, error } = await supabase
      .from('leaderboard_periods')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    setPeriods(data || []);
  };

  const fetchStats = async () => {
    // Get total snapshots
    const { count: totalSnapshots } = await supabase
      .from('leaderboard_snapshots')
      .select('*', { count: 'exact', head: true });

    // Get unique users
    const { data: uniqueUsersData } = await supabase
      .from('leaderboard_snapshots')
      .select('user_id')
      .limit(1000);

    const uniqueUsers = new Set(uniqueUsersData?.map(s => s.user_id)).size;

    // Get last update from audit logs
    const { data: lastUpdate } = await supabase
      .from('audit_logs')
      .select('created_at')
      .eq('entity', 'leaderboard_snapshots')
      .eq('action', 'update')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Get periods count
    const { count: periodsCount } = await supabase
      .from('leaderboard_periods')
      .select('*', { count: 'exact', head: true });

    setStats({
      total_snapshots: totalSnapshots || 0,
      unique_users: uniqueUsers,
      last_update: lastUpdate?.created_at || null,
      periods_count: periodsCount || 0
    });
  };

  const handleUpdateSnapshots = async () => {
    setUpdating(true);
    try {
      const { error } = await supabase.rpc('update_leaderboard_snapshot');

      if (error) throw error;

      toast.success('Leaderboard snapshots updated successfully');
      
      // Refresh data
      await fetchData();
    } catch (error: any) {
      console.error('Error updating snapshots:', error);
      toast.error(error.message || 'Failed to update snapshots');
    } finally {
      setUpdating(false);
    }
  };

  const handleCreatePeriod = async (periodType: 'weekly' | 'monthly' | 'yearly') => {
    try {
      const { data, error } = await supabase.rpc('create_current_period', {
        period_type_param: periodType
      });

      if (error) throw error;

      toast.success(`${periodType.charAt(0).toUpperCase() + periodType.slice(1)} period created`);
      await fetchPeriods();
    } catch (error: any) {
      console.error('Error creating period:', error);
      toast.error(error.message || 'Failed to create period');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateShort = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeUntilEnd = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/30">
            <Trophy className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#E8EAED]">Leaderboard Management</h1>
            <p className="text-sm text-[#E8EAED]/60">
              Manage rankings, periods, and snapshots
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-[#0B1426] border-[#E8EAED]/10">
          <CardContent className="p-6">
            {loading ? (
              <Skeleton className="h-16 bg-[#E8EAED]/5" />
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-[#D4AF37]" />
                  <p className="text-xs text-[#E8EAED]/60">Total Snapshots</p>
                </div>
                <p className="text-2xl font-bold text-[#E8EAED]">
                  {stats?.total_snapshots.toLocaleString()}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#0B1426] border-[#E8EAED]/10">
          <CardContent className="p-6">
            {loading ? (
              <Skeleton className="h-16 bg-[#E8EAED]/5" />
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-[#D4AF37]" />
                  <p className="text-xs text-[#E8EAED]/60">Unique Users</p>
                </div>
                <p className="text-2xl font-bold text-[#E8EAED]">
                  {stats?.unique_users.toLocaleString()}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#0B1426] border-[#E8EAED]/10">
          <CardContent className="p-6">
            {loading ? (
              <Skeleton className="h-16 bg-[#E8EAED]/5" />
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-[#D4AF37]" />
                  <p className="text-xs text-[#E8EAED]/60">Active Periods</p>
                </div>
                <p className="text-2xl font-bold text-[#E8EAED]">
                  {stats?.periods_count}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#0B1426] border-[#E8EAED]/10">
          <CardContent className="p-6">
            {loading ? (
              <Skeleton className="h-16 bg-[#E8EAED]/5" />
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-[#D4AF37]" />
                  <p className="text-xs text-[#E8EAED]/60">Last Update</p>
                </div>
                <p className="text-sm font-medium text-[#E8EAED]">
                  {stats?.last_update ? formatDate(stats.last_update) : 'Never'}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card className="bg-[#0B1426] border-[#E8EAED]/10">
        <CardHeader>
          <CardTitle className="text-[#E8EAED]">Quick Actions</CardTitle>
          <CardDescription className="text-[#E8EAED]/60">
            Manage leaderboard data and periods
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleUpdateSnapshots}
              disabled={updating}
              className="bg-[#D4AF37] text-[#0B1426] hover:bg-[#D4AF37]/90"
            >
              {updating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Update All Snapshots
                </>
              )}
            </Button>

            <Button
              onClick={() => handleCreatePeriod('weekly')}
              variant="outline"
              className="border-[#E8EAED]/20 text-[#E8EAED] hover:bg-[#E8EAED]/5"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Weekly Period
            </Button>

            <Button
              onClick={() => handleCreatePeriod('monthly')}
              variant="outline"
              className="border-[#E8EAED]/20 text-[#E8EAED] hover:bg-[#E8EAED]/5"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Monthly Period
            </Button>
          </div>

          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-blue-400 font-medium mb-1">Auto-Update Schedule</p>
                <p className="text-[#E8EAED]/70">
                  Snapshots are automatically updated at the start of each new period. 
                  Manual updates can be triggered for immediate refresh.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Periods List */}
      <Card className="bg-[#0B1426] border-[#E8EAED]/10">
        <CardHeader>
          <CardTitle className="text-[#E8EAED]">Recent Periods</CardTitle>
          <CardDescription className="text-[#E8EAED]/60">
            Historical leaderboard periods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 bg-[#E8EAED]/5" />
              ))
            ) : periods.length === 0 ? (
              <div className="text-center py-8 text-[#E8EAED]/60">
                No periods found
              </div>
            ) : (
              periods.map((period) => (
                <div
                  key={period.id}
                  className={`p-4 rounded-lg border transition-all ${
                    period.is_current
                      ? 'border-[#D4AF37]/50 bg-[#D4AF37]/5'
                      : 'border-[#E8EAED]/10 hover:border-[#E8EAED]/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-[#E8EAED]/5">
                        <Calendar className="w-5 h-5 text-[#D4AF37]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-[#E8EAED] capitalize">
                            {period.period_type}
                          </p>
                          {period.is_current && (
                            <Badge variant="outline" className="text-xs border-[#D4AF37]/50 text-[#D4AF37]">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Current
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-[#E8EAED]/60">
                          <span>{formatDateShort(period.start_date)} - {formatDateShort(period.end_date)}</span>
                          {period.is_current && (
                            <span className="text-[#D4AF37]">
                              {getTimeUntilEnd(period.end_date)} remaining
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-[#E8EAED]/40 mb-1">Created</p>
                      <p className="text-xs text-[#E8EAED]/60">
                        {formatDate(period.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="bg-[#0B1426] border-[#E8EAED]/10">
        <CardHeader>
          <CardTitle className="text-[#E8EAED] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#D4AF37]" />
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-[#E8EAED]/70">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] text-xs font-bold">
              1
            </div>
            <div>
              <p className="font-medium text-[#E8EAED] mb-1">Real-time Views</p>
              <p className="text-xs">Leaderboard views calculate rankings in real-time from user data (XP, posts, events, etc.)</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] text-xs font-bold">
              2
            </div>
            <div>
              <p className="font-medium text-[#E8EAED] mb-1">Period Snapshots</p>
              <p className="text-xs">When a new period starts (weekly/monthly), snapshots capture rankings for historical comparison</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] text-xs font-bold">
              3
            </div>
            <div>
              <p className="font-medium text-[#E8EAED] mb-1">Auto-Updates</p>
              <p className="text-xs">Snapshots automatically update at period boundaries, but can be manually refreshed anytime</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] text-xs font-bold">
              4
            </div>
            <div>
              <p className="font-medium text-[#E8EAED] mb-1">Categories</p>
              <p className="text-xs">Overall (XP), Posts, Events, Marketplace, and Community engagement rankings</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
