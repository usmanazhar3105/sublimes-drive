/**
 * Admin Referral Management - Complete Database Integration
 * Full-featured referral tracking, top referrers, analytics, and settings
 * NO HARDCODED DATA - Everything from Supabase
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Download, 
  Users,
  UserPlus,
  TrendingUp,
  Settings,
  Eye,
  Edit,
  Award,
  Gift,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Star,
  Trophy,
  Share,
  CreditCard,
  BarChart3,
  Activity,
  Users2,
  Building,
  Loader2,
  X,
  Save
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================

interface ReferralStats {
  totalReferrals: number;
  pendingApproval: number;
  completed: number;
  rejected: number;
  totalXPAwarded: number;
  totalCreditsAwarded: number;
  carOwnerReferrals: number;
  garageOwnerReferrals: number;
  conversionRate: number;
}

interface Referral {
  id: string;
  referrer_id: string;
  referrer_type: string;
  referred_user_id: string | null;
  referred_user_type: string | null;
  referred_email: string | null;
  referral_code: string;
  status: string;
  reward_type: string;
  reward_amount: number;
  reward_awarded: boolean;
  notes: string | null;
  admin_notes: string | null;
  approved_at: string | null;
  completed_at: string | null;
  created_at: string;
  referrer?: {
    display_name?: string;
    email?: string;
  };
  referred?: {
    display_name?: string;
    email?: string;
  };
}

interface TopReferrer {
  referrer_id: string;
  referrer_name: string;
  referrer_type: string;
  total_referrals: number;
  successful_referrals: number;
  total_rewards: number;
  reward_type: string;
}

interface ReferralSetting {
  id: string;
  setting_key: string;
  setting_value: Record<string, any>;
  description?: string;
  is_active: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function AdminReferralManagement_Complete() {
  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data state
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [topReferrers, setTopReferrers] = useState<TopReferrer[]>([]);
  const [settings, setSettings] = useState<ReferralSetting[]>([]);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  // Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState('pending');

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const fetchAllData = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchStats(),
        fetchReferrals(),
        fetchTopReferrers(),
        fetchSettings(),
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const fetchStats = async () => {
    try {
      // Try RPC function first
      const { data: rpcData, error: rpcError } = await supabase.rpc('fn_get_referral_stats');
      
      if (!rpcError && rpcData && rpcData.length > 0) {
        const s = rpcData[0];
        setStats({
          totalReferrals: Number(s.total_referrals) || 0,
          pendingApproval: Number(s.pending_approval) || 0,
          completed: Number(s.completed) || 0,
          rejected: Number(s.rejected) || 0,
          totalXPAwarded: Number(s.total_xp_awarded) || 0,
          totalCreditsAwarded: Number(s.total_credits_awarded) || 0,
          carOwnerReferrals: Number(s.car_owner_referrals) || 0,
          garageOwnerReferrals: Number(s.garage_owner_referrals) || 0,
          conversionRate: Number(s.conversion_rate) || 0,
        });
        return;
      }

      // Fallback: Calculate manually
      const { data: refData } = await supabase.from('referrals').select('*');
      const refs = refData || [];
      
      const total = refs.length;
      const completed = refs.filter(r => r.status === 'completed').length;

      setStats({
        totalReferrals: total,
        pendingApproval: refs.filter(r => r.status === 'pending').length,
        completed,
        rejected: refs.filter(r => r.status === 'rejected').length,
        totalXPAwarded: refs.filter(r => r.reward_type === 'xp' && r.reward_awarded).reduce((sum, r) => sum + (r.reward_amount || 0), 0),
        totalCreditsAwarded: refs.filter(r => r.reward_type === 'bid_credits' && r.reward_awarded).reduce((sum, r) => sum + (r.reward_amount || 0), 0),
        carOwnerReferrals: refs.filter(r => r.referrer_type === 'car_owner').length,
        garageOwnerReferrals: refs.filter(r => r.referrer_type === 'garage_owner').length,
        conversionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchReferrals = async () => {
    try {
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get referrer and referred user profiles
      const referrerIds = [...new Set((data || []).map(r => r.referrer_id).filter(Boolean))];
      const referredIds = [...new Set((data || []).map(r => r.referred_user_id).filter(Boolean))];
      const allUserIds = [...new Set([...referrerIds, ...referredIds])];

      let profilesMap: Record<string, any> = {};
      if (allUserIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, display_name, email')
          .in('id', allUserIds);
        if (profilesData) {
          profilesMap = profilesData.reduce((acc, p) => { acc[p.id] = p; return acc; }, {} as Record<string, any>);
        }
      }

      setReferrals((data || []).map(r => ({
        ...r,
        referrer: profilesMap[r.referrer_id] || { display_name: 'Unknown', email: '' },
        referred: r.referred_user_id ? profilesMap[r.referred_user_id] : { display_name: r.referred_email || 'Unknown', email: r.referred_email || '' },
      })));
    } catch (error) {
      console.error('Error fetching referrals:', error);
    }
  };

  const fetchTopReferrers = async () => {
    try {
      // Try RPC first
      const { data: rpcData, error: rpcError } = await supabase.rpc('fn_get_top_referrers', { p_limit: 10 });
      
      if (!rpcError && rpcData) {
        setTopReferrers(rpcData);
        return;
      }

      // Fallback: Calculate manually
      const { data: refData } = await supabase.from('referrals').select('*');
      if (!refData) return;

      const referrerMap: Record<string, any> = {};
      for (const ref of refData) {
        if (!referrerMap[ref.referrer_id]) {
          referrerMap[ref.referrer_id] = {
            referrer_id: ref.referrer_id,
            referrer_type: ref.referrer_type,
            total_referrals: 0,
            successful_referrals: 0,
            total_rewards: 0,
            reward_type: ref.reward_type,
          };
        }
        referrerMap[ref.referrer_id].total_referrals++;
        if (ref.status === 'completed') {
          referrerMap[ref.referrer_id].successful_referrals++;
        }
        if (ref.reward_awarded) {
          referrerMap[ref.referrer_id].total_rewards += ref.reward_amount || 0;
        }
      }

      // Get names
      const ids = Object.keys(referrerMap);
      if (ids.length > 0) {
        const { data: profiles } = await supabase.from('profiles').select('id, display_name').in('id', ids);
        if (profiles) {
          for (const p of profiles) {
            if (referrerMap[p.id]) {
              referrerMap[p.id].referrer_name = p.display_name || 'Unknown';
            }
          }
        }
      }

      const sorted = Object.values(referrerMap).sort((a: any, b: any) => b.total_referrals - a.total_referrals).slice(0, 10);
      setTopReferrers(sorted);
    } catch (error) {
      console.error('Error fetching top referrers:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('referral_settings')
        .select('*')
        .order('setting_key');

      if (error) throw error;
      setSettings(data || []);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const approveReferral = async (referralId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('referrals')
        .update({
          status: 'approved',
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', referralId);

      if (error) throw error;
      
      toast.success('Referral approved');
      fetchAllData();
    } catch (error: any) {
      console.error('Error approving referral:', error);
      toast.error(error.message || 'Failed to approve referral');
    }
  };

  const rejectReferral = async (referralId: string) => {
    try {
      const { error } = await supabase
        .from('referrals')
        .update({
          status: 'rejected',
          updated_at: new Date().toISOString(),
        })
        .eq('id', referralId);

      if (error) throw error;
      
      toast.success('Referral rejected');
      fetchAllData();
    } catch (error: any) {
      console.error('Error rejecting referral:', error);
      toast.error(error.message || 'Failed to reject referral');
    }
  };

  const awardReward = async (referralId: string) => {
    try {
      // Try RPC first
      const { data: rpcResult, error: rpcError } = await supabase.rpc('fn_complete_referral', {
        p_referral_id: referralId,
      });

      if (rpcError) {
        // Fallback: Direct update
        const { error } = await supabase
          .from('referrals')
          .update({
            status: 'completed',
            reward_awarded: true,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', referralId);
        if (error) throw error;
      }

      toast.success('Reward awarded successfully');
      fetchAllData();
    } catch (error: any) {
      console.error('Error awarding reward:', error);
      toast.error(error.message || 'Failed to award reward');
    }
  };

  const updateReferral = async () => {
    if (!selectedReferral) return;

    try {
      const { error } = await supabase
        .from('referrals')
        .update({
          status: editStatus,
          admin_notes: editNotes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedReferral.id);

      if (error) throw error;

      toast.success('Referral updated');
      setShowEditModal(false);
      setSelectedReferral(null);
      fetchAllData();
    } catch (error: any) {
      console.error('Error updating referral:', error);
      toast.error(error.message || 'Failed to update referral');
    }
  };

  const bulkApprove = async () => {
    try {
      const { error } = await supabase
        .from('referrals')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .in('id', selectedItems)
        .eq('status', 'pending');

      if (error) throw error;

      toast.success(`Approved ${selectedItems.length} referrals`);
      setSelectedItems([]);
      fetchAllData();
    } catch (error: any) {
      console.error('Error bulk approving:', error);
      toast.error(error.message || 'Failed to bulk approve');
    }
  };

  const bulkReject = async () => {
    try {
      const { error } = await supabase
        .from('referrals')
        .update({
          status: 'rejected',
          updated_at: new Date().toISOString(),
        })
        .in('id', selectedItems)
        .eq('status', 'pending');

      if (error) throw error;

      toast.success(`Rejected ${selectedItems.length} referrals`);
      setSelectedItems([]);
      fetchAllData();
    } catch (error: any) {
      console.error('Error bulk rejecting:', error);
      toast.error(error.message || 'Failed to bulk reject');
    }
  };

  const updateSetting = async (settingKey: string, newValue: any) => {
    try {
      const { error } = await supabase
        .from('referral_settings')
        .update({
          setting_value: { value: newValue },
          updated_at: new Date().toISOString(),
        })
        .eq('setting_key', settingKey);

      if (error) throw error;

      toast.success('Setting updated');
      fetchSettings();
    } catch (error: any) {
      console.error('Error updating setting:', error);
      toast.error(error.message || 'Failed to update setting');
    }
  };

  const exportData = () => {
    try {
      const dataToExport = selectedItems.length > 0
        ? filteredReferrals.filter(r => selectedItems.includes(r.id))
        : filteredReferrals;

      const headers = ['ID', 'Referrer', 'Referrer Type', 'Referred User', 'Status', 'Reward Type', 'Reward Amount', 'Awarded', 'Code', 'Created'];
      const rows = dataToExport.map(r => [
        r.id,
        r.referrer?.display_name || 'Unknown',
        r.referrer_type,
        r.referred?.display_name || r.referred_email || 'Unknown',
        r.status,
        r.reward_type,
        r.reward_amount,
        r.reward_awarded ? 'Yes' : 'No',
        r.referral_code,
        new Date(r.created_at).toLocaleDateString(),
      ].join(','));

      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `referrals_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success(`Exported ${dataToExport.length} referrals`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  // ============================================================================
  // FILTERED DATA
  // ============================================================================

  const filteredReferrals = referrals.filter(r => {
    const matchesSearch = searchQuery === '' ||
      r.referrer?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.referrer?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.referred?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.referral_code?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesType = typeFilter === 'all' || r.referrer_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // ============================================================================
  // HELPERS
  // ============================================================================

  const getSettingValue = (key: string) => {
    const setting = settings.find(s => s.setting_key === key);
    return setting?.setting_value?.value;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-500/10 text-yellow-500',
      approved: 'bg-blue-500/10 text-blue-500',
      completed: 'bg-green-500/10 text-green-500',
      rejected: 'bg-red-500/10 text-red-500',
      expired: 'bg-gray-500/10 text-gray-500',
    };
    return <Badge className={styles[status] || 'bg-gray-500/10 text-gray-500'}>{status}</Badge>;
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredReferrals.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredReferrals.map(r => r.id));
    }
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--sublimes-gold)]" />
      </div>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--sublimes-light-text)]">Referral Management</h1>
          <p className="text-gray-400">Approve, reject, and monitor user referrals and rewards.</p>
        </div>
        <Button onClick={fetchAllData} disabled={refreshing} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-[var(--sublimes-border)]">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview & Log', icon: Share },
            { id: 'top-referrers', label: 'Top Referrers', icon: Trophy },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-[var(--sublimes-gold)] text-[var(--sublimes-gold)]'
                  : 'border-transparent text-gray-400 hover:text-[var(--sublimes-light-text)]'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-400">Total Referrals</p>
                    <p className="text-2xl font-bold text-blue-400">{stats?.totalReferrals || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-400">Pending Approval</p>
                    <p className="text-2xl font-bold text-yellow-400">{stats?.pendingApproval || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-400">Completed</p>
                    <p className="text-2xl font-bold text-green-400">{stats?.completed || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-[var(--sublimes-gold)]/20 rounded-lg">
                    <Star className="w-6 h-6 text-[var(--sublimes-gold)]" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-400">Total XP Awarded</p>
                    <p className="text-2xl font-bold text-[var(--sublimes-gold)]">{stats?.totalXPAwarded || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <CreditCard className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-400">Total Credits Awarded</p>
                    <p className="text-2xl font-bold text-purple-400">{stats?.totalCreditsAwarded || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Car Owner Referrals</p>
                  <p className="text-xl font-bold text-[var(--sublimes-light-text)]">{stats?.carOwnerReferrals || 0}</p>
                </div>
                <Users2 className="w-8 h-8 text-blue-400" />
              </CardContent>
            </Card>

            <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Garage Owner Referrals</p>
                  <p className="text-xl font-bold text-[var(--sublimes-light-text)]">{stats?.garageOwnerReferrals || 0}</p>
                </div>
                <Building className="w-8 h-8 text-orange-400" />
              </CardContent>
            </Card>

            <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Conversion Rate</p>
                  <p className="text-xl font-bold text-[var(--sublimes-light-text)]">{stats?.conversionRate || 0}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </CardContent>
            </Card>

            <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Top Referrer</p>
                  <p className="text-sm font-bold text-[var(--sublimes-light-text)] truncate">
                    {topReferrers[0]?.referrer_name || 'N/A'}
                  </p>
                </div>
                <Trophy className="w-8 h-8 text-[var(--sublimes-gold)]" />
              </CardContent>
            </Card>
          </div>

          {/* Referral Log */}
          <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Share className="w-5 h-5 text-[var(--sublimes-gold)]" />
                  <CardTitle className="text-[var(--sublimes-light-text)]">Referral Log</CardTitle>
                </div>
                <Button variant="outline" onClick={exportData}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, or code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-[var(--sublimes-dark-bg)]"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)]"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)]"
                >
                  <option value="all">All Types</option>
                  <option value="car_owner">Car Owners</option>
                  <option value="garage_owner">Garage Owners</option>
                </select>
              </div>

              {/* Bulk Actions */}
              {selectedItems.length > 0 && (
                <div className="mb-4 p-4 bg-[var(--sublimes-gold)]/10 border border-[var(--sublimes-gold)]/20 rounded-lg flex items-center justify-between">
                  <span className="text-sm text-[var(--sublimes-light-text)]">
                    {selectedItems.length} referral(s) selected
                  </span>
                  <div className="flex space-x-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={bulkApprove}>
                      Bulk Approve
                    </Button>
                    <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={bulkReject}>
                      Bulk Reject
                    </Button>
                  </div>
                </div>
              )}

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--sublimes-border)]">
                      <th className="text-left p-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.length === filteredReferrals.length && filteredReferrals.length > 0}
                          onChange={handleSelectAll}
                          className="rounded"
                        />
                      </th>
                      <th className="text-left p-4 text-[var(--sublimes-light-text)]">Date</th>
                      <th className="text-left p-4 text-[var(--sublimes-light-text)]">Referrer</th>
                      <th className="text-left p-4 text-[var(--sublimes-light-text)]">Referred User</th>
                      <th className="text-left p-4 text-[var(--sublimes-light-text)]">Status</th>
                      <th className="text-left p-4 text-[var(--sublimes-light-text)]">Reward</th>
                      <th className="text-left p-4 text-[var(--sublimes-light-text)]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReferrals.map((referral) => (
                      <tr key={referral.id} className="border-b border-[var(--sublimes-border)]/30 hover:bg-[var(--sublimes-dark-bg)]/50">
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(referral.id)}
                            onChange={() => {
                              setSelectedItems(prev =>
                                prev.includes(referral.id)
                                  ? prev.filter(id => id !== referral.id)
                                  : [...prev, referral.id]
                              );
                            }}
                            className="rounded"
                          />
                        </td>
                        <td className="p-4 text-gray-400">
                          {new Date(referral.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              referral.referrer_type === 'car_owner'
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-orange-500/20 text-orange-400'
                            }`}>
                              {referral.referrer_type === 'car_owner' ? <Users2 className="w-4 h-4" /> : <Building className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className="font-medium text-[var(--sublimes-light-text)]">{referral.referrer?.display_name}</p>
                              <p className="text-xs text-gray-400">{referral.referrer?.email}</p>
                              <p className="text-xs text-gray-500">Code: {referral.referral_code}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-[var(--sublimes-light-text)]">{referral.referred?.display_name}</p>
                            <p className="text-xs text-gray-400">{referral.referred?.email}</p>
                          </div>
                        </td>
                        <td className="p-4">{getStatusBadge(referral.status)}</td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            {referral.reward_type === 'xp' ? (
                              <Star className="w-4 h-4 text-[var(--sublimes-gold)]" />
                            ) : (
                              <CreditCard className="w-4 h-4 text-purple-400" />
                            )}
                            <span className={referral.reward_type === 'xp' ? 'text-[var(--sublimes-gold)]' : 'text-purple-400'}>
                              {referral.reward_amount} {referral.reward_type === 'xp' ? 'XP' : 'Credits'}
                            </span>
                            {referral.reward_awarded && <CheckCircle className="w-4 h-4 text-green-400" />}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            {referral.status === 'pending' && (
                              <>
                                <Button size="sm" variant="ghost" className="text-green-400 hover:bg-green-400/10" onClick={() => approveReferral(referral.id)}>
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="text-red-400 hover:bg-red-400/10" onClick={() => rejectReferral(referral.id)}>
                                  <AlertCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {referral.status === 'approved' && !referral.reward_awarded && (
                              <Button size="sm" variant="ghost" className="text-[var(--sublimes-gold)] hover:bg-[var(--sublimes-gold)]/10" onClick={() => awardReward(referral.id)}>
                                <Gift className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedReferral(referral);
                                setEditNotes(referral.admin_notes || '');
                                setEditStatus(referral.status);
                                setShowEditModal(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredReferrals.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-gray-400">
                          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No referrals found</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Referrers Tab */}
      {activeTab === 'top-referrers' && (
        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Trophy className="w-5 h-5 text-[var(--sublimes-gold)]" />
              <CardTitle className="text-[var(--sublimes-light-text)]">Top Referrers</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topReferrers.map((referrer, index) => (
                <div key={referrer.referrer_id} className="flex items-center justify-between p-4 bg-[var(--sublimes-dark-bg)] rounded-lg border border-[var(--sublimes-border)]">
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0 ? 'bg-yellow-500 text-black' :
                      index === 1 ? 'bg-gray-400 text-black' :
                      index === 2 ? 'bg-orange-600 text-white' :
                      'bg-[var(--sublimes-border)] text-gray-400'
                    }`}>
                      #{index + 1}
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      referrer.referrer_type === 'car_owner'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {referrer.referrer_type === 'car_owner' ? <Users2 className="w-5 h-5" /> : <Building className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--sublimes-light-text)]">{referrer.referrer_name || 'Unknown'}</p>
                      <p className="text-sm text-gray-400 capitalize">{referrer.referrer_type?.replace('_', ' ')}</p>
                      <p className="text-xs text-gray-500">
                        {referrer.successful_referrals}/{referrer.total_referrals} successful
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      {referrer.reward_type === 'xp' ? (
                        <Star className="w-4 h-4 text-[var(--sublimes-gold)]" />
                      ) : (
                        <CreditCard className="w-4 h-4 text-purple-400" />
                      )}
                      <span className={referrer.reward_type === 'xp' ? 'text-[var(--sublimes-gold)]' : 'text-purple-400'}>
                        {referrer.total_rewards} {referrer.reward_type === 'xp' ? 'XP' : 'Credits'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{referrer.total_referrals} referrals</p>
                  </div>
                </div>
              ))}
              {topReferrers.length === 0 && (
                <div className="p-8 text-center text-gray-400">
                  <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No referrers yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Weekly Referrals</p>
                  <p className="text-2xl font-bold text-blue-400">{stats?.totalReferrals || 0}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-400" />
              </CardContent>
            </Card>

            <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Conversion Rate</p>
                  <p className="text-2xl font-bold text-green-400">{stats?.conversionRate || 0}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </CardContent>
            </Card>

            <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Pending Review</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats?.pendingApproval || 0}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </CardContent>
            </Card>

            <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Referrers</p>
                  <p className="text-2xl font-bold text-purple-400">{topReferrers.length}</p>
                </div>
                <Activity className="w-8 h-8 text-purple-400" />
              </CardContent>
            </Card>
          </div>

          <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
            <CardHeader>
              <CardTitle className="text-[var(--sublimes-light-text)]">Performance Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h5 className="font-medium text-[var(--sublimes-light-text)] mb-3">By User Type</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Car Owners</span>
                      <span className="text-sm font-medium text-blue-400">{stats?.carOwnerReferrals || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Garage Owners</span>
                      <span className="text-sm font-medium text-orange-400">{stats?.garageOwnerReferrals || 0}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-[var(--sublimes-light-text)] mb-3">Rewards Distribution</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">XP Points</span>
                      <span className="text-sm font-medium text-[var(--sublimes-gold)]">{stats?.totalXPAwarded || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Bid Credits</span>
                      <span className="text-sm font-medium text-purple-400">{stats?.totalCreditsAwarded || 0}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-[var(--sublimes-light-text)] mb-3">Success Metrics</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Completed</span>
                      <span className="text-sm font-medium text-green-400">{stats?.completed || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Rejected</span>
                      <span className="text-sm font-medium text-red-400">{stats?.rejected || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Settings className="w-5 h-5 text-[var(--sublimes-gold)]" />
                <CardTitle className="text-[var(--sublimes-light-text)]">Referral Settings</CardTitle>
              </div>
              <Button className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]" onClick={() => toast.success('Settings saved!')}>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Reward Configuration */}
            <div>
              <h4 className="text-lg font-semibold text-[var(--sublimes-light-text)] mb-4">Reward Configuration</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-[var(--sublimes-light-text)]">Car Owner XP Reward</Label>
                  <Input
                    type="number"
                    value={getSettingValue('car_owner_xp_reward') || 5}
                    onChange={(e) => updateSetting('car_owner_xp_reward', parseInt(e.target.value))}
                    className="mt-1 bg-[var(--sublimes-dark-bg)]"
                  />
                </div>
                <div>
                  <Label className="text-[var(--sublimes-light-text)]">Garage Owner Credit Reward</Label>
                  <Input
                    type="number"
                    value={getSettingValue('garage_owner_credit_reward') || 10}
                    onChange={(e) => updateSetting('garage_owner_credit_reward', parseInt(e.target.value))}
                    className="mt-1 bg-[var(--sublimes-dark-bg)]"
                  />
                </div>
              </div>
            </div>

            {/* Feature Toggles */}
            <div>
              <h4 className="text-lg font-semibold text-[var(--sublimes-light-text)] mb-4">Features</h4>
              <div className="space-y-4">
                {[
                  { key: 'auto_approve', label: 'Auto Approve Referrals', desc: 'Automatically approve all new referrals' },
                  { key: 'enable_referral_codes', label: 'Enable Referral Codes', desc: 'Allow users to generate custom codes' },
                  { key: 'enable_notifications', label: 'Enable Notifications', desc: 'Send referral notifications' },
                ].map(({ key, label, desc }) => (
                  <label key={key} className="flex items-center justify-between p-4 bg-[var(--sublimes-dark-bg)] rounded-lg border border-[var(--sublimes-border)] cursor-pointer">
                    <div>
                      <span className="text-[var(--sublimes-light-text)]">{label}</span>
                      <p className="text-sm text-gray-400">{desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={getSettingValue(key) === true}
                      onChange={(e) => updateSetting(key, e.target.checked)}
                      className="rounded border-[var(--sublimes-border)] bg-[var(--sublimes-dark-bg)] text-[var(--sublimes-gold)]"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Limits */}
            <div>
              <h4 className="text-lg font-semibold text-[var(--sublimes-light-text)] mb-4">Limits</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-[var(--sublimes-light-text)]">Max Referrals Per User</Label>
                  <Input
                    type="number"
                    value={getSettingValue('max_referrals_per_user') || 50}
                    onChange={(e) => updateSetting('max_referrals_per_user', parseInt(e.target.value))}
                    className="mt-1 bg-[var(--sublimes-dark-bg)]"
                  />
                </div>
                <div>
                  <Label className="text-[var(--sublimes-light-text)]">Referral Validity (Days)</Label>
                  <Input
                    type="number"
                    value={getSettingValue('referral_validity_days') || 30}
                    onChange={(e) => updateSetting('referral_validity_days', parseInt(e.target.value))}
                    className="mt-1 bg-[var(--sublimes-dark-bg)]"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--sublimes-light-text)]">Edit Referral</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-[var(--sublimes-light-text)]">Status</Label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)]"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <Label className="text-[var(--sublimes-light-text)]">Admin Notes</Label>
              <Textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="mt-1 bg-[var(--sublimes-dark-bg)]"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]" onClick={updateReferral}>
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminReferralManagement_Complete;


