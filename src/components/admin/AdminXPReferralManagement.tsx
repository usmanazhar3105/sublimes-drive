/**
 * Admin XP & Referral Management - Complete Gamification System
 * 
 * Wired to Supabase:
 * - profiles (xp_points, referrals_count, referral_code, xp_level)
 * - referrals table
 * - xp_transactions table
 * - leaderboard view
 * - RPC functions: fn_award_xp, fn_deduct_xp, fn_ban_referral
 */

import { useState, useEffect } from 'react';
import {
  Trophy,
  TrendingUp,
  Users,
  Award,
  Ban,
  Plus,
  Minus,
  Eye,
  RefreshCw,
  Search,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { toast } from 'sonner';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

interface LeaderboardEntry {
  id: string;
  display_name: string;
  username: string;
  avatar_url: string;
  xp_points: number;
  xp_level: number;
  xp_level_name: string;
  referrals_count: number;
  badge_color: string;
  sub_role: string;
  rank: number;
  percentile: number;
}

interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  points_awarded: number;
  credit_awarded: boolean;
  status: 'pending' | 'completed' | 'cancelled';
  referral_source: string;
  created_at: string;
  referrer: {
    display_name: string;
    email: string;
  };
  referred: {
    display_name: string;
    email: string;
  };
}

interface XPTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'earned' | 'deducted' | 'bonus' | 'penalty';
  source: string;
  description: string;
  created_at: string;
  user: {
    display_name: string;
    email: string;
  };
}

export function AdminXPReferralManagement() {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'referrals' | 'transactions'>('leaderboard');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [transactions, setTransactions] = useState<XPTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [showAdjustXPModal, setShowAdjustXPModal] = useState(false);
  const [showBanReferralModal, setShowBanReferralModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [xpAmount, setXpAmount] = useState('');
  const [xpReason, setXpReason] = useState('');
  const [adjustType, setAdjustType] = useState<'add' | 'deduct'>('add');
  const [banReason, setBanReason] = useState('');
  const [processing, setProcessing] = useState(false);

  // Statistics
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalXP: 0,
    totalReferrals: 0,
    activeReferrals: 0,
    bannedReferrals: 0
  });

  // Fetch leaderboard
  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('fn_get_top_leaderboard', { p_limit: 100 });

      if (error) throw error;

      setLeaderboard(data || []);

      // Calculate stats
      const totalXP = data?.reduce((sum: number, user: any) => sum + user.xp_points, 0) || 0;
      setStats(prev => ({
        ...prev,
        totalUsers: data?.length || 0,
        totalXP
      }));
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  // Fetch referrals
  const fetchReferrals = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('referrals')
        .select(`
          *,
          referrer:profiles!referrals_referrer_id_fkey(display_name, email),
          referred:profiles!referrals_referred_id_fkey(display_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      setReferrals(data || []);

      // Calculate stats
      const active = data?.filter(r => r.status === 'completed').length || 0;
      const banned = data?.filter(r => r.status === 'cancelled').length || 0;
      setStats(prev => ({
        ...prev,
        totalReferrals: data?.length || 0,
        activeReferrals: active,
        bannedReferrals: banned
      }));
    } catch (error) {
      console.error('Error fetching referrals:', error);
      toast.error('Failed to load referrals');
    } finally {
      setLoading(false);
    }
  };

  // Fetch XP transactions
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('xp_transactions')
        .select(`
          *,
          user:profiles!xp_transactions_user_id_fkey(display_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  // Award XP
  const awardXP = async () => {
    if (!selectedUser || !xpAmount || !xpReason.trim()) {
      toast.error('Please fill all fields');
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabase.rpc('fn_award_xp', {
        p_user_id: selectedUser.id,
        p_amount: parseInt(xpAmount),
        p_reason: xpReason
      });

      if (error) throw error;

      toast.success(`Awarded ${xpAmount} XP to ${selectedUser.display_name}`);
      setShowAdjustXPModal(false);
      setXpAmount('');
      setXpReason('');
      fetchLeaderboard();
      fetchTransactions();
    } catch (error) {
      console.error('Error awarding XP:', error);
      toast.error('Failed to award XP');
    } finally {
      setProcessing(false);
    }
  };

  // Deduct XP
  const deductXP = async () => {
    if (!selectedUser || !xpAmount || !xpReason.trim()) {
      toast.error('Please fill all fields');
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabase.rpc('fn_deduct_xp', {
        p_user_id: selectedUser.id,
        p_amount: parseInt(xpAmount),
        p_reason: xpReason
      });

      if (error) throw error;

      toast.success(`Deducted ${xpAmount} XP from ${selectedUser.display_name}`);
      setShowAdjustXPModal(false);
      setXpAmount('');
      setXpReason('');
      fetchLeaderboard();
      fetchTransactions();
    } catch (error) {
      console.error('Error deducting XP:', error);
      toast.error('Failed to deduct XP');
    } finally {
      setProcessing(false);
    }
  };

  // Ban referral
  const banReferral = async () => {
    if (!selectedReferral || !banReason.trim()) {
      toast.error('Please provide a reason');
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabase.rpc('fn_ban_referral', {
        p_referral_id: selectedReferral.id,
        p_reason: banReason
      });

      if (error) throw error;

      toast.success('Referral banned and rewards revoked');
      setShowBanReferralModal(false);
      setBanReason('');
      fetchReferrals();
      fetchLeaderboard();
    } catch (error) {
      console.error('Error banning referral:', error);
      toast.error('Failed to ban referral');
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'leaderboard') fetchLeaderboard();
    else if (activeTab === 'referrals') fetchReferrals();
    else if (activeTab === 'transactions') fetchTransactions();
  }, [activeTab]);

  // Filter data
  const filteredLeaderboard = leaderboard.filter(u =>
    u.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredReferrals = referrals.filter(r =>
    r.referrer?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.referred?.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTransactions = transactions.filter(t =>
    t.user?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">XP & Referral Management</h1>
          <p className="text-muted-foreground">Manage gamification and referral system</p>
        </div>
        <Button onClick={() => {
          if (activeTab === 'leaderboard') fetchLeaderboard();
          else if (activeTab === 'referrals') fetchReferrals();
          else fetchTransactions();
        }} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total XP</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalXP.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReferrals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Referrals</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeReferrals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Banned</CardTitle>
            <Ban className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bannedReferrals}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="leaderboard">
            <Trophy className="h-4 w-4 mr-2" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="referrals">
            <Users className="h-4 w-4 mr-2" />
            Referrals
          </TabsTrigger>
          <TabsTrigger value="transactions">
            <TrendingUp className="h-4 w-4 mr-2" />
            XP Transactions
          </TabsTrigger>
        </TabsList>

        {/* Search */}
        <div className="mt-4">
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLeaderboard.map((user) => (
                <Card key={user.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold text-muted-foreground w-8">
                          #{user.rank}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{user.display_name}</span>
                            <Badge variant="outline">{user.xp_level_name}</Badge>
                            <Badge className={`bg-${user.badge_color}-500`}>
                              {user.sub_role}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>{user.xp_points.toLocaleString()} XP</span>
                            <span>Level {user.xp_level}</span>
                            <span>{user.referrals_count} referrals</span>
                            <span>Top {(user.percentile * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedUser(user);
                          setAdjustType('add');
                          setShowAdjustXPModal(true);
                        }}
                      >
                        Adjust XP
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Referrals Tab */}
        <TabsContent value="referrals" className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              {filteredReferrals.map((referral) => (
                <Card key={referral.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{referral.referrer?.display_name}</span>
                          <span className="text-muted-foreground">→</span>
                          <span className="font-medium">{referral.referred?.display_name}</span>
                          <Badge className={
                            referral.status === 'completed' ? 'bg-green-500' :
                            referral.status === 'cancelled' ? 'bg-red-500' :
                            'bg-yellow-500'
                          }>
                            {referral.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>+{referral.points_awarded} XP</span>
                          {referral.credit_awarded && <span>+1 Credit</span>}
                          <span>{referral.referral_source}</span>
                          <span>{new Date(referral.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      {referral.status === 'completed' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedReferral(referral);
                            setShowBanReferralModal(true);
                          }}
                        >
                          <Ban className="h-4 w-4 mr-2" />
                          Ban
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTransactions.map((tx) => (
                <Card key={tx.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${
                          tx.type === 'earned' || tx.type === 'bonus' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {tx.type === 'earned' || tx.type === 'bonus' ? (
                            <Plus className="h-4 w-4 text-green-600" />
                          ) : (
                            <Minus className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{tx.user?.display_name}</p>
                          <p className="text-sm text-muted-foreground">{tx.description || tx.source}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          tx.type === 'earned' || tx.type === 'bonus' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {tx.type === 'earned' || tx.type === 'bonus' ? '+' : '-'}{tx.amount} XP
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Adjust XP Modal */}
      <Dialog open={showAdjustXPModal} onOpenChange={setShowAdjustXPModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust XP for {selectedUser?.display_name}</DialogTitle>
            <DialogDescription>
              Current XP: {selectedUser?.xp_points} | Level: {selectedUser?.xp_level}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={adjustType === 'add' ? 'default' : 'outline'}
                onClick={() => setAdjustType('add')}
                className="flex-1"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add XP
              </Button>
              <Button
                variant={adjustType === 'deduct' ? 'default' : 'outline'}
                onClick={() => setAdjustType('deduct')}
                className="flex-1"
              >
                <Minus className="h-4 w-4 mr-2" />
                Deduct XP
              </Button>
            </div>

            <Input
              type="number"
              placeholder="Amount"
              value={xpAmount}
              onChange={(e) => setXpAmount(e.target.value)}
            />

            <Textarea
              placeholder="Reason (required)"
              value={xpReason}
              onChange={(e) => setXpReason(e.target.value)}
              rows={3}
            />

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowAdjustXPModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={adjustType === 'add' ? awardXP : deductXP}
                disabled={processing || !xpAmount || !xpReason.trim()}
              >
                {processing ? 'Processing...' : 'Confirm'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ban Referral Modal */}
      <Dialog open={showBanReferralModal} onOpenChange={setShowBanReferralModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban Referral</DialogTitle>
            <DialogDescription>
              This will revoke XP and credits awarded for this referral.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Textarea
              placeholder="Reason for banning (required)"
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              rows={4}
            />

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowBanReferralModal(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={banReferral}
                disabled={processing || !banReason.trim()}
              >
                {processing ? 'Processing...' : 'Ban Referral'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
