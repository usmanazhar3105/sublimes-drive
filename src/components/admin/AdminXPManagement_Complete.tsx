/**
 * Admin XP Management & Rewards - Complete Database Integration
 * Full-featured XP tracking, rewards, leaderboard, and settings
 * NO HARDCODED DATA - Everything from Supabase
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Download, 
  Star,
  Trophy,
  Users,
  TrendingUp,
  Settings,
  Eye,
  Edit,
  Award,
  Gift,
  Zap,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Loader2,
  Save,
  X,
  Truck,
  Package
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

interface XPStats {
  totalUsers: number;
  activeUsers: number;
  totalXPEarned: number;
  users100Plus: number;
  averageXP: number;
  pendingRewards: number;
  fulfilledRewards: number;
}

interface XPUser {
  id: string;
  user_id: string;
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  last_xp_earned_at: string | null;
  current_milestone: number;
  milestone_progress: number;
  posts_with_xp: number;
  rank_position: number | null;
  is_active: boolean;
  created_at: string;
  profile?: {
    display_name?: string;
    email?: string;
    avatar_url?: string;
    username?: string;
  };
}

interface MilestoneReward {
  id: string;
  xp_threshold: number;
  title: string;
  description: string;
  reward_type: string;
  reward_value: Record<string, any>;
  badge_icon?: string;
  badge_color?: string;
  is_active: boolean;
  claims_count: number;
  validity_months: number;
  sort_order: number;
}

interface RewardClaim {
  id: string;
  user_id: string;
  milestone_id: string;
  xp_at_claim: number;
  status: string;
  tracking_number?: string;
  notes?: string;
  claimed_at: string;
  fulfilled_at?: string;
  profile?: {
    display_name?: string;
    email?: string;
  };
  milestone?: {
    title?: string;
    xp_threshold?: number;
  };
}

interface XPSetting {
  id: string;
  setting_key: string;
  setting_value: Record<string, any>;
  description?: string;
  is_active: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function AdminXPManagement_Complete() {
  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data state
  const [stats, setStats] = useState<XPStats | null>(null);
  const [xpUsers, setXpUsers] = useState<XPUser[]>([]);
  const [milestones, setMilestones] = useState<MilestoneReward[]>([]);
  const [rewardClaims, setRewardClaims] = useState<RewardClaim[]>([]);
  const [settings, setSettings] = useState<XPSetting[]>([]);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  // Modal state
  const [showEditXPModal, setShowEditXPModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<XPUser | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneReward | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<RewardClaim | null>(null);
  
  // Form state
  const [editXPValue, setEditXPValue] = useState(0);
  const [milestoneForm, setMilestoneForm] = useState({
    xp_threshold: 0,
    title: '',
    description: '',
    reward_type: 'gift',
    is_active: true,
    validity_months: 6,
  });

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const fetchAllData = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchStats(),
        fetchXPUsers(),
        fetchMilestones(),
        fetchRewardClaims(),
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
      const { data: rpcData, error: rpcError } = await supabase.rpc('fn_get_xp_stats');
      
      if (!rpcError && rpcData && rpcData.length > 0) {
        const s = rpcData[0];
        setStats({
          totalUsers: Number(s.total_users) || 0,
          activeUsers: Number(s.active_users) || 0,
          totalXPEarned: Number(s.total_xp_earned) || 0,
          users100Plus: Number(s.users_100_plus) || 0,
          averageXP: Number(s.average_xp) || 0,
          pendingRewards: Number(s.pending_rewards) || 0,
          fulfilledRewards: Number(s.fulfilled_rewards) || 0,
        });
        return;
      }

      // Fallback: Calculate manually
      const { data: xpData } = await supabase.from('user_xp').select('total_xp, is_active');
      const { count: pendingCount } = await supabase
        .from('xp_reward_claims')
        .select('id', { count: 'exact', head: true })
        .in('status', ['pending', 'processing']);
      const { count: fulfilledCount } = await supabase
        .from('xp_reward_claims')
        .select('id', { count: 'exact', head: true })
        .in('status', ['delivered', 'completed']);

      const users = xpData || [];
      const activeUsers = users.filter(u => u.is_active && u.total_xp > 0);
      const totalXP = users.reduce((sum, u) => sum + (u.total_xp || 0), 0);

      setStats({
        totalUsers: users.length,
        activeUsers: activeUsers.length,
        totalXPEarned: totalXP,
        users100Plus: users.filter(u => u.total_xp >= 100).length,
        averageXP: activeUsers.length > 0 ? Math.round(totalXP / activeUsers.length) : 0,
        pendingRewards: pendingCount || 0,
        fulfilledRewards: fulfilledCount || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchXPUsers = async () => {
    try {
      const { data: xpData, error: xpError } = await supabase
        .from('user_xp')
        .select('*')
        .order('total_xp', { ascending: false });

      if (xpError) throw xpError;

      // Get user profiles
      const userIds = [...new Set((xpData || []).map(x => x.user_id).filter(Boolean))];
      let profilesMap: Record<string, any> = {};

      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, display_name, email, avatar_url, username')
          .in('id', userIds);

        if (profilesData) {
          profilesMap = profilesData.reduce((acc, p) => {
            acc[p.id] = p;
            return acc;
          }, {} as Record<string, any>);
        }
      }

      setXpUsers((xpData || []).map((x, idx) => ({
        ...x,
        rank_position: x.rank_position || idx + 1,
        profile: profilesMap[x.user_id] || { display_name: 'Unknown', email: '' },
      })));
    } catch (error) {
      console.error('Error fetching XP users:', error);
    }
  };

  const fetchMilestones = async () => {
    try {
      const { data, error } = await supabase
        .from('xp_milestone_rewards')
        .select('*')
        .order('xp_threshold', { ascending: true });

      if (error) throw error;
      setMilestones(data || []);
    } catch (error) {
      console.error('Error fetching milestones:', error);
    }
  };

  const fetchRewardClaims = async () => {
    try {
      const { data: claimsData, error: claimsError } = await supabase
        .from('xp_reward_claims')
        .select('*')
        .order('claimed_at', { ascending: false });

      if (claimsError) throw claimsError;

      // Get profiles and milestones
      const userIds = [...new Set((claimsData || []).map(c => c.user_id).filter(Boolean))];
      const milestoneIds = [...new Set((claimsData || []).map(c => c.milestone_id).filter(Boolean))];

      let profilesMap: Record<string, any> = {};
      let milestonesMap: Record<string, any> = {};

      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, display_name, email')
          .in('id', userIds);
        if (profilesData) {
          profilesMap = profilesData.reduce((acc, p) => { acc[p.id] = p; return acc; }, {} as Record<string, any>);
        }
      }

      if (milestoneIds.length > 0) {
        const { data: milestonesData } = await supabase
          .from('xp_milestone_rewards')
          .select('id, title, xp_threshold')
          .in('id', milestoneIds);
        if (milestonesData) {
          milestonesMap = milestonesData.reduce((acc, m) => { acc[m.id] = m; return acc; }, {} as Record<string, any>);
        }
      }

      setRewardClaims((claimsData || []).map(c => ({
        ...c,
        profile: profilesMap[c.user_id] || { display_name: 'Unknown', email: '' },
        milestone: milestonesMap[c.milestone_id] || { title: 'Unknown', xp_threshold: 0 },
      })));
    } catch (error) {
      console.error('Error fetching reward claims:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('xp_settings')
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

  const adjustUserXP = async () => {
    if (!selectedUser) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const now = new Date().toISOString();
      const xpDiff = editXPValue - selectedUser.total_xp;

      // Update user_xp
      const { error: updateError } = await supabase
        .from('user_xp')
        .update({
          total_xp: editXPValue,
          milestone_progress: editXPValue % 100,
          updated_at: now,
        })
        .eq('id', selectedUser.id);

      if (updateError) throw updateError;

      // Record transaction
      await supabase.from('xp_transactions').insert({
        user_id: selectedUser.user_id,
        amount: xpDiff,
        type: 'admin_adjust',
        source: 'admin',
        description: `XP adjusted by admin from ${selectedUser.total_xp} to ${editXPValue}`,
        balance_after: editXPValue,
      });

      toast.success('XP updated successfully');
      setShowEditXPModal(false);
      setSelectedUser(null);
      fetchAllData();
    } catch (error: any) {
      console.error('Error adjusting XP:', error);
      toast.error(error.message || 'Failed to update XP');
    }
  };

  const saveMilestone = async () => {
    try {
      const data = {
        xp_threshold: milestoneForm.xp_threshold,
        title: milestoneForm.title,
        description: milestoneForm.description,
        reward_type: milestoneForm.reward_type,
        is_active: milestoneForm.is_active,
        validity_months: milestoneForm.validity_months,
        updated_at: new Date().toISOString(),
      };

      if (selectedMilestone) {
        const { error } = await supabase
          .from('xp_milestone_rewards')
          .update(data)
          .eq('id', selectedMilestone.id);
        if (error) throw error;
        toast.success('Milestone updated');
      } else {
        const { error } = await supabase
          .from('xp_milestone_rewards')
          .insert({ ...data, sort_order: milestones.length + 1 });
        if (error) throw error;
        toast.success('Milestone created');
      }

      setShowMilestoneModal(false);
      setSelectedMilestone(null);
      setMilestoneForm({
        xp_threshold: 0,
        title: '',
        description: '',
        reward_type: 'gift',
        is_active: true,
        validity_months: 6,
      });
      fetchMilestones();
    } catch (error: any) {
      console.error('Error saving milestone:', error);
      toast.error(error.message || 'Failed to save milestone');
    }
  };

  const updateClaimStatus = async (claimId: string, newStatus: string, trackingNumber?: string) => {
    try {
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      if (trackingNumber) {
        updateData.tracking_number = trackingNumber;
      }

      if (['delivered', 'completed'].includes(newStatus)) {
        updateData.fulfilled_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('xp_reward_claims')
        .update(updateData)
        .eq('id', claimId);

      if (error) throw error;

      toast.success(`Claim status updated to ${newStatus}`);
      fetchRewardClaims();
    } catch (error: any) {
      console.error('Error updating claim:', error);
      toast.error(error.message || 'Failed to update claim');
    }
  };

  const updateSetting = async (settingKey: string, newValue: any) => {
    try {
      const { error } = await supabase
        .from('xp_settings')
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

  const exportData = (type: 'users' | 'claims') => {
    try {
      let csv = '';
      const filename = `xp_${type}_${new Date().toISOString().split('T')[0]}.csv`;

      if (type === 'users') {
        const headers = ['Rank', 'User', 'Email', 'Total XP', 'Streak', 'Last Activity', 'Status'];
        const rows = filteredUsers.map(u => [
          u.rank_position || 'N/A',
          u.profile?.display_name || 'N/A',
          u.profile?.email || 'N/A',
          u.total_xp,
          u.current_streak,
          u.last_xp_earned_at ? new Date(u.last_xp_earned_at).toLocaleDateString() : 'Never',
          u.is_active ? 'Active' : 'Inactive',
        ].join(','));
        csv = [headers.join(','), ...rows].join('\n');
      } else {
        const headers = ['User', 'Email', 'XP at Claim', 'Reward', 'Status', 'Claimed At', 'Tracking'];
        const rows = rewardClaims.map(c => [
          c.profile?.display_name || 'N/A',
          c.profile?.email || 'N/A',
          c.xp_at_claim,
          c.milestone?.title || 'N/A',
          c.status,
          new Date(c.claimed_at).toLocaleDateString(),
          c.tracking_number || 'N/A',
        ].join(','));
        csv = [headers.join(','), ...rows].join('\n');
      }

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Data exported');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  // ============================================================================
  // FILTERED DATA
  // ============================================================================

  const filteredUsers = xpUsers.filter(u => {
    const matchesSearch = searchQuery === '' ||
      u.profile?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.profile?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.profile?.username?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const leaderboardUsers = [...xpUsers]
    .filter(u => u.total_xp > 0)
    .sort((a, b) => b.total_xp - a.total_xp)
    .slice(0, 20);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-500/10 text-yellow-500',
      processing: 'bg-blue-500/10 text-blue-500',
      shipped: 'bg-purple-500/10 text-purple-500',
      delivered: 'bg-green-500/10 text-green-500',
      completed: 'bg-green-500/10 text-green-500',
      cancelled: 'bg-red-500/10 text-red-500',
    };
    return <Badge className={styles[status] || 'bg-gray-500/10 text-gray-500'}>{status}</Badge>;
  };

  const getDaysAgo = (date: string | null) => {
    if (!date) return 'Never';
    const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  const getSettingValue = (key: string) => {
    const setting = settings.find(s => s.setting_key === key);
    return setting?.setting_value?.value;
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
          <h1 className="text-2xl font-bold text-[var(--sublimes-light-text)]">XP Management & Rewards</h1>
          <p className="text-gray-400">Manage user experience points, rewards, and gamification settings.</p>
        </div>
        <Button
          onClick={fetchAllData}
          disabled={refreshing}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-[var(--sublimes-border)]">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'XP Overview', icon: Star },
            { id: 'rewards', label: 'Rewards', icon: Trophy },
            { id: 'leaderboard', label: 'Leaderboard', icon: Award },
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
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-400">Active XP Users</p>
                    <p className="text-2xl font-bold text-blue-400">{stats?.activeUsers || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-400">Total XP Earned</p>
                    <p className="text-2xl font-bold text-green-400">{stats?.totalXPEarned || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Trophy className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-400">100+ XP Users</p>
                    <p className="text-2xl font-bold text-purple-400">{stats?.users100Plus || 0}</p>
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
                    <p className="text-sm text-gray-400">Average XP</p>
                    <p className="text-2xl font-bold text-[var(--sublimes-gold)]">{stats?.averageXP || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User XP Management Table */}
          <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Star className="w-5 h-5 text-[var(--sublimes-gold)]" />
                  <CardTitle className="text-[var(--sublimes-light-text)]">User XP Management</CardTitle>
                </div>
                <Button variant="outline" onClick={() => exportData('users')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search users by name, email, or username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-[var(--sublimes-dark-bg)]"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--sublimes-border)]">
                      <th className="text-left p-4 text-[var(--sublimes-light-text)]">User</th>
                      <th className="text-left p-4 text-[var(--sublimes-light-text)]">XP Points</th>
                      <th className="text-left p-4 text-[var(--sublimes-light-text)]">Streak</th>
                      <th className="text-left p-4 text-[var(--sublimes-light-text)]">Last Activity</th>
                      <th className="text-left p-4 text-[var(--sublimes-light-text)]">Progress</th>
                      <th className="text-left p-4 text-[var(--sublimes-light-text)]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-[var(--sublimes-border)]/30 hover:bg-[var(--sublimes-dark-bg)]/50">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-[var(--sublimes-gold)] to-yellow-600 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-[var(--sublimes-dark-bg)]">
                                {user.profile?.display_name?.charAt(0)?.toUpperCase() || '?'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-[var(--sublimes-light-text)]">
                                {user.profile?.display_name || 'Unknown'}
                              </p>
                              <p className="text-sm text-gray-400">{user.profile?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <Star className="w-4 h-4 text-[var(--sublimes-gold)]" />
                            <span className="font-bold text-[var(--sublimes-gold)]">{user.total_xp}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <Zap className="w-4 h-4 text-orange-500" />
                            <span className="text-orange-500">{user.current_streak} days</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-gray-400">{getDaysAgo(user.last_xp_earned_at)}</span>
                        </td>
                        <td className="p-4">
                          <div className="w-32">
                            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                              <span>{user.milestone_progress || 0}/100</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-[var(--sublimes-gold)] h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(user.milestone_progress || 0, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(user);
                              setEditXPValue(user.total_xp);
                              setShowEditXPModal(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-400">
                          No users found
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

      {/* Rewards Tab */}
      {activeTab === 'rewards' && (
        <div className="space-y-6">
          {/* Milestone Rewards */}
          <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Trophy className="w-5 h-5 text-[var(--sublimes-gold)]" />
                  <CardTitle className="text-[var(--sublimes-light-text)]">Milestone Rewards</CardTitle>
                </div>
                <Button
                  className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]"
                  onClick={() => {
                    setSelectedMilestone(null);
                    setMilestoneForm({
                      xp_threshold: 0,
                      title: '',
                      description: '',
                      reward_type: 'gift',
                      is_active: true,
                      validity_months: 6,
                    });
                    setShowMilestoneModal(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Reward
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {milestones.map((milestone) => (
                  <div key={milestone.id} className="flex items-center justify-between p-4 bg-[var(--sublimes-dark-bg)] rounded-lg border border-[var(--sublimes-border)]">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-[var(--sublimes-gold)]/20 rounded-lg flex items-center justify-center">
                        <Trophy className="w-6 h-6 text-[var(--sublimes-gold)]" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-[var(--sublimes-gold)]">{milestone.xp_threshold} XP</span>
                          <span className="text-[var(--sublimes-light-text)]">→</span>
                          <span className="font-medium text-[var(--sublimes-light-text)]">{milestone.title}</span>
                        </div>
                        <p className="text-sm text-gray-400">{milestone.description}</p>
                        <p className="text-xs text-gray-500">{milestone.claims_count} claims</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={milestone.is_active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}>
                        {milestone.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedMilestone(milestone);
                          setMilestoneForm({
                            xp_threshold: milestone.xp_threshold,
                            title: milestone.title,
                            description: milestone.description || '',
                            reward_type: milestone.reward_type,
                            is_active: milestone.is_active,
                            validity_months: milestone.validity_months,
                          });
                          setShowMilestoneModal(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reward Claims */}
          <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Gift className="w-5 h-5 text-[var(--sublimes-gold)]" />
                  <div>
                    <CardTitle className="text-[var(--sublimes-light-text)]">Reward Claims</CardTitle>
                    <p className="text-sm text-gray-400">Track and manage reward fulfillment</p>
                  </div>
                </div>
                <Button variant="outline" onClick={() => exportData('claims')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--sublimes-border)]">
                      <th className="text-left p-4 text-[var(--sublimes-light-text)]">User</th>
                      <th className="text-left p-4 text-[var(--sublimes-light-text)]">XP</th>
                      <th className="text-left p-4 text-[var(--sublimes-light-text)]">Reward</th>
                      <th className="text-left p-4 text-[var(--sublimes-light-text)]">Status</th>
                      <th className="text-left p-4 text-[var(--sublimes-light-text)]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rewardClaims.map((claim) => (
                      <tr key={claim.id} className="border-b border-[var(--sublimes-border)]/30">
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-[var(--sublimes-light-text)]">{claim.profile?.display_name}</p>
                            <p className="text-sm text-gray-400">{claim.profile?.email}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <Star className="w-4 h-4 text-[var(--sublimes-gold)]" />
                            <span className="font-bold text-[var(--sublimes-gold)]">{claim.xp_at_claim}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-[var(--sublimes-light-text)]">{claim.milestone?.title}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(claim.status)}
                            {claim.tracking_number && (
                              <span className="text-xs text-gray-500">#{claim.tracking_number}</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            {claim.status === 'pending' && (
                              <Button
                                size="sm"
                                className="bg-blue-500 hover:bg-blue-600"
                                onClick={() => updateClaimStatus(claim.id, 'processing')}
                              >
                                <Package className="h-4 w-4" />
                              </Button>
                            )}
                            {claim.status === 'processing' && (
                              <Button
                                size="sm"
                                className="bg-purple-500 hover:bg-purple-600"
                                onClick={() => {
                                  const tracking = prompt('Enter tracking number:');
                                  if (tracking) updateClaimStatus(claim.id, 'shipped', tracking);
                                }}
                              >
                                <Truck className="h-4 w-4" />
                              </Button>
                            )}
                            {claim.status === 'shipped' && (
                              <Button
                                size="sm"
                                className="bg-green-500 hover:bg-green-600"
                                onClick={() => updateClaimStatus(claim.id, 'delivered')}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {rewardClaims.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-400">
                          No reward claims yet
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

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Trophy className="w-5 h-5 text-[var(--sublimes-gold)]" />
              <CardTitle className="text-[var(--sublimes-light-text)]">XP Leaderboard</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaderboardUsers.map((user, index) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-[var(--sublimes-dark-bg)] rounded-lg border border-[var(--sublimes-border)]">
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0 ? 'bg-yellow-500 text-black' :
                      index === 1 ? 'bg-gray-400 text-black' :
                      index === 2 ? 'bg-orange-600 text-white' :
                      'bg-[var(--sublimes-border)] text-gray-400'
                    }`}>
                      #{index + 1}
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-[var(--sublimes-gold)] to-yellow-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-[var(--sublimes-dark-bg)]">
                        {user.profile?.display_name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-[var(--sublimes-light-text)]">{user.profile?.display_name}</p>
                      <p className="text-sm text-gray-400">{user.profile?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-[var(--sublimes-gold)]" />
                    <span className="font-bold text-[var(--sublimes-gold)]">{user.total_xp} XP</span>
                  </div>
                </div>
              ))}
              {leaderboardUsers.length === 0 && (
                <div className="p-8 text-center text-gray-400">
                  <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No leaderboard data yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Settings className="w-5 h-5 text-[var(--sublimes-gold)]" />
              <CardTitle className="text-[var(--sublimes-light-text)]">XP Rules & Configuration</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Basic Rules */}
            <div>
              <h4 className="text-lg font-semibold text-[var(--sublimes-light-text)] mb-4">Basic Rules</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-[var(--sublimes-light-text)]">XP Per Post</Label>
                  <Input
                    type="number"
                    value={getSettingValue('xp_per_post') || 1}
                    onChange={(e) => updateSetting('xp_per_post', parseInt(e.target.value))}
                    className="mt-1 bg-[var(--sublimes-dark-bg)]"
                  />
                </div>
                <div>
                  <Label className="text-[var(--sublimes-light-text)]">Max Daily XP</Label>
                  <Input
                    type="number"
                    value={getSettingValue('max_daily_xp') || 10}
                    onChange={(e) => updateSetting('max_daily_xp', parseInt(e.target.value))}
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
                  { key: 'enable_streak_tracking', label: 'Enable Streak Tracking', desc: 'Track consecutive daily posting' },
                  { key: 'enable_leaderboards', label: 'Enable Leaderboards', desc: 'Show public XP rankings' },
                  { key: 'enable_xp_notifications', label: 'Enable XP Notifications', desc: 'Send milestone notifications' },
                  { key: 'require_image_for_xp', label: 'Require Image for XP', desc: 'Posts must include an image' },
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
          </CardContent>
        </Card>
      )}

      {/* Edit XP Modal */}
      <Dialog open={showEditXPModal} onOpenChange={setShowEditXPModal}>
        <DialogContent className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--sublimes-light-text)]">Adjust XP Points</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-[var(--sublimes-dark-bg)] rounded-lg">
              <p className="font-medium text-[var(--sublimes-light-text)]">{selectedUser?.profile?.display_name}</p>
              <p className="text-sm text-gray-400">Current XP: {selectedUser?.total_xp}</p>
            </div>
            <div>
              <Label className="text-[var(--sublimes-light-text)]">New XP Value</Label>
              <Input
                type="number"
                min="0"
                value={editXPValue}
                onChange={(e) => setEditXPValue(parseInt(e.target.value) || 0)}
                className="mt-1 bg-[var(--sublimes-dark-bg)]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditXPModal(false)}>Cancel</Button>
            <Button className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]" onClick={adjustUserXP}>
              Update XP
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Milestone Modal */}
      <Dialog open={showMilestoneModal} onOpenChange={setShowMilestoneModal}>
        <DialogContent className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--sublimes-light-text)]">
              {selectedMilestone ? 'Edit Milestone' : 'Create Milestone'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-[var(--sublimes-light-text)]">XP Threshold</Label>
              <Input
                type="number"
                value={milestoneForm.xp_threshold}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, xp_threshold: parseInt(e.target.value) || 0 })}
                className="mt-1 bg-[var(--sublimes-dark-bg)]"
              />
            </div>
            <div>
              <Label className="text-[var(--sublimes-light-text)]">Reward Title</Label>
              <Input
                value={milestoneForm.title}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                className="mt-1 bg-[var(--sublimes-dark-bg)]"
              />
            </div>
            <div>
              <Label className="text-[var(--sublimes-light-text)]">Description</Label>
              <Textarea
                value={milestoneForm.description}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
                className="mt-1 bg-[var(--sublimes-dark-bg)]"
                rows={2}
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={milestoneForm.is_active}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, is_active: e.target.checked })}
                  className="rounded"
                />
                <span className="text-[var(--sublimes-light-text)]">Active</span>
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMilestoneModal(false)}>Cancel</Button>
            <Button className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]" onClick={saveMilestone}>
              {selectedMilestone ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminXPManagement_Complete;



