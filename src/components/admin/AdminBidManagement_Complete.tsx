/**
 * Admin Bid Repair Management - Complete Database & Stripe Integration
 * Full-featured payment, wallet, and bid credit management system
 * NO HARDCODED DATA - Everything from Supabase
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Settings,
  Download,
  Plus,
  Check,
  X,
  Eye,
  RefreshCw,
  CreditCard,
  AlertCircle,
  Wallet,
  Loader2,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Ban,
  CheckCircle,
  Clock,
  XCircle,
  Edit,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================

interface WalletStats {
  totalWallets: number;
  activeWallets: number;
  suspendedWallets: number;
  totalBalance: number;
  totalBidCredits: number;
  totalTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
  refundedTransactions: number;
  totalRevenue: number;
  pendingAmount: number;
  failedAmount: number;
  refundedAmount: number;
}

interface WalletUser {
  id: string;
  user_id: string;
  balance: number;
  bid_credits: number;
  currency: string;
  is_active: boolean;
  is_suspended: boolean;
  suspension_reason?: string;
  stripe_customer_id?: string;
  last_transaction_at?: string;
  created_at: string;
  profile?: {
    display_name?: string;
    email?: string;
    avatar_url?: string;
  };
}

interface Transaction {
  id: string;
  user_id: string;
  wallet_id?: string;
  amount: number;
  currency: string;
  type: string;
  status: string;
  description?: string;
  reference_type?: string;
  reference_id?: string;
  balance_before?: number;
  balance_after?: number;
  stripe_payment_intent_id?: string;
  stripe_charge_id?: string;
  stripe_refund_id?: string;
  metadata?: Record<string, any>;
  processed_by?: string;
  processed_at?: string;
  created_at: string;
  profile?: {
    display_name?: string;
    email?: string;
  };
}

interface BidCreditPackage {
  id: string;
  name: string;
  description?: string;
  credits: number;
  price: number;
  bonus_credits: number;
  currency: string;
  stripe_price_id?: string;
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
  valid_days: number;
}

interface WalletSetting {
  id: string;
  setting_key: string;
  setting_value: Record<string, any>;
  description?: string;
  is_active: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function AdminBidManagement_Complete() {
  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('payments');
  
  // Data state
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([]);
  const [walletUsers, setWalletUsers] = useState<WalletUser[]>([]);
  const [creditPackages, setCreditPackages] = useState<BidCreditPackage[]>([]);
  const [settings, setSettings] = useState<WalletSetting[]>([]);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  // Modal state
  const [showAddCreditModal, setShowAddCreditModal] = useState(false);
  const [showCreateWalletModal, setShowCreateWalletModal] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<WalletUser | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [editingPackage, setEditingPackage] = useState<BidCreditPackage | null>(null);
  
  // Form state
  const [creditAmount, setCreditAmount] = useState('');
  const [creditDescription, setCreditDescription] = useState('');
  const [newPackage, setNewPackage] = useState({
    name: '',
    description: '',
    credits: 0,
    price: 0,
    bonus_credits: 0,
    is_popular: false,
    is_active: true,
    valid_days: 365,
  });

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const fetchAllData = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchStats(),
        fetchTransactions(),
        fetchPendingTransactions(),
        fetchWalletUsers(),
        fetchCreditPackages(),
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
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  const fetchStats = async () => {
    try {
      // Try using the RPC function first
      const { data: rpcData, error: rpcError } = await supabase.rpc('fn_get_wallet_stats');
      
      if (!rpcError && rpcData && rpcData.length > 0) {
        const s = rpcData[0];
        setStats({
          totalWallets: Number(s.total_wallets) || 0,
          activeWallets: Number(s.active_wallets) || 0,
          suspendedWallets: Number(s.suspended_wallets) || 0,
          totalBalance: Number(s.total_balance) || 0,
          totalBidCredits: Number(s.total_bid_credits) || 0,
          totalTransactions: Number(s.total_transactions) || 0,
          pendingTransactions: Number(s.pending_transactions) || 0,
          failedTransactions: Number(s.failed_transactions) || 0,
          refundedTransactions: Number(s.refunded_transactions) || 0,
          totalRevenue: Number(s.total_revenue) || 0,
          pendingAmount: Number(s.pending_amount) || 0,
          failedAmount: Number(s.failed_amount) || 0,
          refundedAmount: Number(s.refunded_amount) || 0,
        });
        return;
      }

      // Fallback: Calculate stats manually
      const { data: walletsData } = await supabase
        .from('user_wallets')
        .select('balance, bid_credits, is_active, is_suspended');

      const { data: txData } = await supabase
        .from('wallet_transactions')
        .select('amount, type, status');

      const wallets = walletsData || [];
      const transactions = txData || [];

      const totalWallets = wallets.length;
      const activeWallets = wallets.filter(w => w.is_active && !w.is_suspended).length;
      const suspendedWallets = wallets.filter(w => w.is_suspended).length;
      const totalBalance = wallets.reduce((sum, w) => sum + Number(w.balance || 0), 0);
      const totalBidCredits = wallets.reduce((sum, w) => sum + Number(w.bid_credits || 0), 0);

      const completedCredits = transactions.filter(t => 
        t.status === 'completed' && ['credit', 'topup', 'deposit'].includes(t.type)
      );
      const pending = transactions.filter(t => t.status === 'pending');
      const failed = transactions.filter(t => t.status === 'failed');
      const refunded = transactions.filter(t => t.status === 'refunded' || t.type === 'refund');

      setStats({
        totalWallets,
        activeWallets,
        suspendedWallets,
        totalBalance,
        totalBidCredits,
        totalTransactions: transactions.length,
        pendingTransactions: pending.length,
        failedTransactions: failed.length,
        refundedTransactions: refunded.length,
        totalRevenue: completedCredits.reduce((sum, t) => sum + Math.abs(Number(t.amount || 0)), 0),
        pendingAmount: pending.reduce((sum, t) => sum + Math.abs(Number(t.amount || 0)), 0),
        failedAmount: failed.reduce((sum, t) => sum + Math.abs(Number(t.amount || 0)), 0),
        refundedAmount: refunded.reduce((sum, t) => sum + Math.abs(Number(t.amount || 0)), 0),
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data: txData, error: txError } = await supabase
        .from('wallet_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (txError) throw txError;

      // Get unique user IDs
      const userIds = [...new Set((txData || []).map(t => t.user_id).filter(Boolean))];
      let profilesMap: Record<string, { display_name?: string; email?: string }> = {};

      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, display_name, email')
          .in('id', userIds);

        if (profilesData) {
          profilesMap = profilesData.reduce((acc, p) => {
            acc[p.id] = { display_name: p.display_name, email: p.email };
            return acc;
          }, {} as Record<string, { display_name?: string; email?: string }>);
        }
      }

      setTransactions((txData || []).map(t => ({
        ...t,
        amount: Number(t.amount) || 0,
        balance_before: Number(t.balance_before) || 0,
        balance_after: Number(t.balance_after) || 0,
        profile: profilesMap[t.user_id] || { display_name: 'Unknown', email: '' },
      })));
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchPendingTransactions = async () => {
    try {
      const { data: txData, error: txError } = await supabase
        .from('wallet_transactions')
        .select('*')
        .in('status', ['pending', 'processing'])
        .order('created_at', { ascending: false });

      if (txError) throw txError;

      // Get unique user IDs
      const userIds = [...new Set((txData || []).map(t => t.user_id).filter(Boolean))];
      let profilesMap: Record<string, { display_name?: string; email?: string }> = {};

      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, display_name, email')
          .in('id', userIds);

        if (profilesData) {
          profilesMap = profilesData.reduce((acc, p) => {
            acc[p.id] = { display_name: p.display_name, email: p.email };
            return acc;
          }, {} as Record<string, { display_name?: string; email?: string }>);
        }
      }

      setPendingTransactions((txData || []).map(t => ({
        ...t,
        amount: Number(t.amount) || 0,
        profile: profilesMap[t.user_id] || { display_name: 'Unknown', email: '' },
      })));
    } catch (error) {
      console.error('Error fetching pending transactions:', error);
    }
  };

  const fetchWalletUsers = async () => {
    try {
      const { data: walletsData, error: walletsError } = await supabase
        .from('user_wallets')
        .select('*')
        .order('balance', { ascending: false })
        .limit(50);

      if (walletsError) throw walletsError;

      // Get unique user IDs
      const userIds = [...new Set((walletsData || []).map(w => w.user_id).filter(Boolean))];
      let profilesMap: Record<string, { display_name?: string; email?: string; avatar_url?: string }> = {};

      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, display_name, email, avatar_url')
          .in('id', userIds);

        if (profilesData) {
          profilesMap = profilesData.reduce((acc, p) => {
            acc[p.id] = { display_name: p.display_name, email: p.email, avatar_url: p.avatar_url };
            return acc;
          }, {} as Record<string, { display_name?: string; email?: string; avatar_url?: string }>);
        }
      }

      setWalletUsers((walletsData || []).map(w => ({
        ...w,
        balance: Number(w.balance) || 0,
        bid_credits: Number(w.bid_credits) || 0,
        profile: profilesMap[w.user_id] || { display_name: 'Unknown', email: '' },
      })));
    } catch (error) {
      console.error('Error fetching wallet users:', error);
    }
  };

  const fetchCreditPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('bid_credit_packages')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;

      setCreditPackages((data || []).map(p => ({
        ...p,
        credits: Number(p.credits) || 0,
        price: Number(p.price) || 0,
        bonus_credits: Number(p.bonus_credits) || 0,
        valid_days: Number(p.valid_days) || 365,
      })));
    } catch (error) {
      console.error('Error fetching credit packages:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('wallet_settings')
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

  const approveTransaction = async (transaction: Transaction) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const now = new Date().toISOString();

      // Update transaction
      const { error: txError } = await supabase
        .from('wallet_transactions')
        .update({
          status: 'completed',
          processed_by: user?.id,
          processed_at: now,
          updated_at: now,
        })
        .eq('id', transaction.id);

      if (txError) throw txError;

      // If it's a credit/topup, update wallet balance
      if (['credit', 'topup', 'deposit', 'bid_credit'].includes(transaction.type)) {
        // Get current wallet
        const { data: wallet } = await supabase
          .from('user_wallets')
          .select('id, balance, bid_credits')
          .eq('user_id', transaction.user_id)
          .single();

        if (wallet) {
          const isBidCredit = transaction.type === 'bid_credit';
          const updateData = isBidCredit
            ? { bid_credits: Number(wallet.bid_credits) + Math.abs(transaction.amount), updated_at: now }
            : { balance: Number(wallet.balance) + Math.abs(transaction.amount), updated_at: now };

          await supabase
            .from('user_wallets')
            .update(updateData)
            .eq('id', wallet.id);
        }
      }

      toast.success('Transaction approved');
      fetchAllData();
    } catch (error: any) {
      console.error('Error approving transaction:', error);
      toast.error(error.message || 'Failed to approve transaction');
    }
  };

  const rejectTransaction = async (transaction: Transaction) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const now = new Date().toISOString();

      // Try Stripe refund if applicable
      if (transaction.stripe_payment_intent_id) {
        try {
          await supabase.functions.invoke('stripe-webhook', {
            body: {
              action: 'refund',
              payment_intent: transaction.stripe_payment_intent_id,
              amount: Math.round(Math.abs(transaction.amount) * 100),
            },
          });
        } catch (stripeError) {
          console.warn('Stripe refund failed:', stripeError);
          toast.warning('Stripe refund may need manual processing');
        }
      }

      // Update transaction
      const { error } = await supabase
        .from('wallet_transactions')
        .update({
          status: 'failed',
          processed_by: user?.id,
          processed_at: now,
          updated_at: now,
          metadata: {
            ...(transaction.metadata || {}),
            rejection_reason: 'Admin rejected',
            rejected_at: now,
          },
        })
        .eq('id', transaction.id);

      if (error) throw error;

      toast.success('Transaction rejected');
      fetchAllData();
    } catch (error: any) {
      console.error('Error rejecting transaction:', error);
      toast.error(error.message || 'Failed to reject transaction');
    }
  };

  const addCreditsToUser = async () => {
    if (!selectedUser || !creditAmount) {
      toast.error('Please enter an amount');
      return;
    }

    try {
      const amount = parseFloat(creditAmount);
      if (isNaN(amount) || amount <= 0) {
        toast.error('Please enter a valid amount');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      const now = new Date().toISOString();

      // Create transaction
      const { error: txError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: selectedUser.user_id,
          wallet_id: selectedUser.id,
          amount: amount,
          currency: 'AED',
          type: 'credit',
          status: 'completed',
          description: creditDescription || 'Admin credit',
          processed_by: user?.id,
          processed_at: now,
        });

      if (txError) throw txError;

      // Update wallet balance
      const { error: walletError } = await supabase
        .from('user_wallets')
        .update({
          balance: Number(selectedUser.balance) + amount,
          last_transaction_at: now,
          updated_at: now,
        })
        .eq('id', selectedUser.id);

      if (walletError) throw walletError;

      toast.success(`Added ${amount} AED to wallet`);
      setShowAddCreditModal(false);
      setCreditAmount('');
      setCreditDescription('');
      setSelectedUser(null);
      fetchAllData();
    } catch (error: any) {
      console.error('Error adding credits:', error);
      toast.error(error.message || 'Failed to add credits');
    }
  };

  const suspendWallet = async (wallet: WalletUser, reason: string) => {
    try {
      const { error } = await supabase
        .from('user_wallets')
        .update({
          is_suspended: true,
          suspension_reason: reason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', wallet.id);

      if (error) throw error;

      toast.success('Wallet suspended');
      fetchAllData();
    } catch (error: any) {
      console.error('Error suspending wallet:', error);
      toast.error(error.message || 'Failed to suspend wallet');
    }
  };

  const unsuspendWallet = async (wallet: WalletUser) => {
    try {
      const { error } = await supabase
        .from('user_wallets')
        .update({
          is_suspended: false,
          suspension_reason: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', wallet.id);

      if (error) throw error;

      toast.success('Wallet unsuspended');
      fetchAllData();
    } catch (error: any) {
      console.error('Error unsuspending wallet:', error);
      toast.error(error.message || 'Failed to unsuspend wallet');
    }
  };

  const savePackage = async () => {
    try {
      const packageData = editingPackage ? {
        ...editingPackage,
        ...newPackage,
        updated_at: new Date().toISOString(),
      } : {
        ...newPackage,
        currency: 'AED',
        sort_order: creditPackages.length + 1,
      };

      if (editingPackage) {
        const { error } = await supabase
          .from('bid_credit_packages')
          .update(packageData)
          .eq('id', editingPackage.id);

        if (error) throw error;
        toast.success('Package updated');
      } else {
        const { error } = await supabase
          .from('bid_credit_packages')
          .insert(packageData);

        if (error) throw error;
        toast.success('Package created');
      }

      setShowPackageModal(false);
      setEditingPackage(null);
      setNewPackage({
        name: '',
        description: '',
        credits: 0,
        price: 0,
        bonus_credits: 0,
        is_popular: false,
        is_active: true,
        valid_days: 365,
      });
      fetchCreditPackages();
    } catch (error: any) {
      console.error('Error saving package:', error);
      toast.error(error.message || 'Failed to save package');
    }
  };

  const deletePackage = async (packageId: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return;

    try {
      const { error } = await supabase
        .from('bid_credit_packages')
        .delete()
        .eq('id', packageId);

      if (error) throw error;

      toast.success('Package deleted');
      fetchCreditPackages();
    } catch (error: any) {
      console.error('Error deleting package:', error);
      toast.error(error.message || 'Failed to delete package');
    }
  };

  const exportData = (type: 'transactions' | 'wallets' | 'packages') => {
    try {
      let csv = '';
      const filename = `bid_repair_${type}_${new Date().toISOString().split('T')[0]}.csv`;

      if (type === 'transactions') {
        const headers = ['ID', 'User', 'Amount', 'Currency', 'Type', 'Status', 'Description', 'Stripe PI', 'Created At'];
        const rows = transactions.map(t => [
          t.id,
          t.profile?.display_name || t.profile?.email || 'N/A',
          t.amount.toFixed(2),
          t.currency,
          t.type,
          t.status,
          `"${(t.description || '').replace(/"/g, '""')}"`,
          t.stripe_payment_intent_id || 'N/A',
          new Date(t.created_at).toLocaleString(),
        ].join(','));
        csv = [headers.join(','), ...rows].join('\n');
      } else if (type === 'wallets') {
        const headers = ['ID', 'User', 'Email', 'Balance', 'Bid Credits', 'Status', 'Stripe Customer', 'Created At'];
        const rows = walletUsers.map(w => [
          w.id,
          w.profile?.display_name || 'N/A',
          w.profile?.email || 'N/A',
          w.balance.toFixed(2),
          w.bid_credits.toFixed(2),
          w.is_suspended ? 'Suspended' : (w.is_active ? 'Active' : 'Inactive'),
          w.stripe_customer_id || 'N/A',
          new Date(w.created_at).toLocaleString(),
        ].join(','));
        csv = [headers.join(','), ...rows].join('\n');
      } else {
        const headers = ['ID', 'Name', 'Credits', 'Bonus', 'Price', 'Active', 'Popular'];
        const rows = creditPackages.map(p => [
          p.id,
          p.name,
          p.credits,
          p.bonus_credits,
          p.price.toFixed(2),
          p.is_active ? 'Yes' : 'No',
          p.is_popular ? 'Yes' : 'No',
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

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = searchTerm === '' ||
      t.profile?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.profile?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const filteredWallets = walletUsers.filter(w => {
    const matchesSearch = searchTerm === '' ||
      w.profile?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.profile?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: 'bg-green-500/10 text-green-500 border-green-500/30',
      pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
      processing: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
      failed: 'bg-red-500/10 text-red-500 border-red-500/30',
      cancelled: 'bg-gray-500/10 text-gray-500 border-gray-500/30',
      refunded: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
    };
    const icons: Record<string, any> = {
      completed: CheckCircle,
      pending: Clock,
      processing: Loader2,
      failed: XCircle,
      cancelled: Ban,
      refunded: RefreshCw,
    };
    const Icon = icons[status] || Clock;
    return (
      <Badge className={`${styles[status] || styles.pending} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      credit: 'bg-green-500/10 text-green-500',
      debit: 'bg-red-500/10 text-red-500',
      topup: 'bg-blue-500/10 text-blue-500',
      payment: 'bg-orange-500/10 text-orange-500',
      refund: 'bg-purple-500/10 text-purple-500',
      bid_credit: 'bg-yellow-500/10 text-yellow-500',
      bid_debit: 'bg-pink-500/10 text-pink-500',
    };
    return (
      <Badge className={styles[type] || 'bg-gray-500/10 text-gray-500'}>
        {type.replace('_', ' ')}
      </Badge>
    );
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
    <div className="p-6 bg-[var(--sublimes-dark-bg)] min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--sublimes-light-text)] mb-2">
              Bid Repair Management
            </h1>
            <p className="text-gray-400">Manage payments, transactions, and wallet system</p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => exportData(selectedTab === 'wallet-users' ? 'wallets' : selectedTab === 'settings' ? 'packages' : 'transactions')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button
              className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]"
              onClick={fetchAllData}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-green-500/20">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <Badge className="bg-[var(--sublimes-gold)]/10 text-[var(--sublimes-gold)]">Live</Badge>
            </div>
            <div className="text-2xl font-bold text-[var(--sublimes-light-text)]">
              AED {(stats?.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-gray-400">Total Revenue</div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <Badge className="bg-[var(--sublimes-gold)]/10 text-[var(--sublimes-gold)]">Live</Badge>
            </div>
            <div className="text-2xl font-bold text-[var(--sublimes-light-text)]">
              AED {(stats?.pendingAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-gray-400">Pending Payments</div>
            <div className="text-xs text-yellow-500 mt-1">{stats?.pendingTransactions || 0} transactions</div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-red-500/20">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
              <Badge className="bg-[var(--sublimes-gold)]/10 text-[var(--sublimes-gold)]">Live</Badge>
            </div>
            <div className="text-2xl font-bold text-[var(--sublimes-light-text)]">
              AED {(stats?.failedAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-gray-400">Failed Payments</div>
            <div className="text-xs text-red-500 mt-1">{stats?.failedTransactions || 0} transactions</div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <RefreshCw className="h-5 w-5 text-purple-500" />
              </div>
              <Badge className="bg-[var(--sublimes-gold)]/10 text-[var(--sublimes-gold)]">Live</Badge>
            </div>
            <div className="text-2xl font-bold text-[var(--sublimes-light-text)]">
              AED {(stats?.refundedAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-gray-400">Refunds Issued</div>
            <div className="text-xs text-purple-500 mt-1">{stats?.refundedTransactions || 0} refunds</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)]">
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="wallet-users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Wallet Users
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Payments Tab - Pending Transactions */}
        <TabsContent value="payments">
          <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-[var(--sublimes-light-text)]">Pending Payments</CardTitle>
                <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30">
                  {pendingTransactions.length} Pending
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {pendingTransactions.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No pending payments</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingTransactions.map(tx => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 border border-[var(--sublimes-border)] rounded-lg hover:border-[var(--sublimes-gold)]/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-yellow-500/10 rounded-lg">
                          <CreditCard className="h-5 w-5 text-yellow-500" />
                        </div>
                        <div>
                          <div className="font-medium text-[var(--sublimes-light-text)]">
                            {tx.profile?.display_name || tx.profile?.email || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-400">{tx.description || 'Payment'}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(tx.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-bold text-[var(--sublimes-gold)]">
                            {tx.currency} {Math.abs(tx.amount).toFixed(2)}
                          </div>
                          {getStatusBadge(tx.status)}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600"
                            onClick={() => approveTransaction(tx)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => rejectTransaction(tx)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-[var(--sublimes-light-text)]">All Transactions</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-48 bg-[var(--sublimes-dark-bg)]"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)]"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)]"
                  >
                    <option value="all">All Types</option>
                    <option value="credit">Credit</option>
                    <option value="debit">Debit</option>
                    <option value="topup">Top-up</option>
                    <option value="refund">Refund</option>
                    <option value="bid_credit">Bid Credit</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--sublimes-border)]">
                      <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">ID</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">User</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Amount</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Type</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Date</th>
                      <th className="text-center py-3 px-4 text-sm text-gray-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map(tx => (
                      <tr key={tx.id} className="border-b border-[var(--sublimes-border)]/30 hover:bg-[var(--sublimes-dark-bg)]/50">
                        <td className="py-3 px-4">
                          <span className="text-sm font-mono text-[var(--sublimes-light-text)]">
                            {tx.id.slice(0, 8)}...
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-[var(--sublimes-light-text)]">
                            {tx.profile?.display_name || 'Unknown'}
                          </div>
                          <div className="text-xs text-gray-500">{tx.profile?.email}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-medium ${tx.amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {tx.amount >= 0 ? '+' : ''}{tx.currency} {tx.amount.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-3 px-4">{getTypeBadge(tx.type)}</td>
                        <td className="py-3 px-4">{getStatusBadge(tx.status)}</td>
                        <td className="py-3 px-4 text-sm text-gray-400">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedTransaction(tx)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wallet Users Tab */}
        <TabsContent value="wallet-users">
          <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-[var(--sublimes-light-text)]">Wallet Users</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64 bg-[var(--sublimes-dark-bg)]"
                    />
                  </div>
                  <Button
                    className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]"
                    onClick={() => setShowCreateWalletModal(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Wallet
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Summary Stats */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-[var(--sublimes-dark-bg)] rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-400">Total Wallets</span>
                  </div>
                  <div className="text-2xl font-bold text-[var(--sublimes-light-text)]">
                    {stats?.totalWallets || 0}
                  </div>
                </div>
                <div className="p-4 bg-[var(--sublimes-dark-bg)] rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-400">Active</span>
                  </div>
                  <div className="text-2xl font-bold text-[var(--sublimes-light-text)]">
                    {stats?.activeWallets || 0}
                  </div>
                </div>
                <div className="p-4 bg-[var(--sublimes-dark-bg)] rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-[var(--sublimes-gold)]" />
                    <span className="text-sm text-gray-400">Total Balance</span>
                  </div>
                  <div className="text-2xl font-bold text-[var(--sublimes-gold)]">
                    AED {(stats?.totalBalance || 0).toLocaleString()}
                  </div>
                </div>
                <div className="p-4 bg-[var(--sublimes-dark-bg)] rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Ban className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-gray-400">Suspended</span>
                  </div>
                  <div className="text-2xl font-bold text-red-500">
                    {stats?.suspendedWallets || 0}
                  </div>
                </div>
              </div>

              {/* Users List */}
              <div className="space-y-3">
                {filteredWallets.map(wallet => (
                  <div
                    key={wallet.id}
                    className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                      wallet.is_suspended
                        ? 'border-red-500/30 bg-red-500/5'
                        : 'border-[var(--sublimes-border)] hover:border-[var(--sublimes-gold)]/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        wallet.is_suspended ? 'bg-red-500/20' : 'bg-[var(--sublimes-gold)]/20'
                      }`}>
                        <Users className={`h-6 w-6 ${wallet.is_suspended ? 'text-red-500' : 'text-[var(--sublimes-gold)]'}`} />
                      </div>
                      <div>
                        <div className="font-medium text-[var(--sublimes-light-text)]">
                          {wallet.profile?.display_name || wallet.profile?.email || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-400">{wallet.profile?.email}</div>
                        {wallet.is_suspended && (
                          <div className="text-xs text-red-500">Suspended: {wallet.suspension_reason}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="font-bold text-[var(--sublimes-gold)]">
                          AED {wallet.balance.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-400">
                          Bid Credits: {wallet.bid_credits.toFixed(2)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-500 text-green-500"
                          onClick={() => {
                            setSelectedUser(wallet);
                            setShowAddCreditModal(true);
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        {wallet.is_suspended ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-green-500 text-green-500"
                            onClick={() => unsuspendWallet(wallet)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500 text-red-500"
                            onClick={() => {
                              const reason = prompt('Suspension reason:');
                              if (reason) suspendWallet(wallet, reason);
                            }}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-2 gap-6">
            <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
              <CardHeader>
                <CardTitle className="text-[var(--sublimes-light-text)]">Revenue Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-[var(--sublimes-dark-bg)] rounded-lg">
                    <span className="text-gray-400">Total Revenue</span>
                    <span className="font-bold text-green-500">AED {(stats?.totalRevenue || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-[var(--sublimes-dark-bg)] rounded-lg">
                    <span className="text-gray-400">Pending Amount</span>
                    <span className="font-bold text-yellow-500">AED {(stats?.pendingAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-[var(--sublimes-dark-bg)] rounded-lg">
                    <span className="text-gray-400">Failed Amount</span>
                    <span className="font-bold text-red-500">AED {(stats?.failedAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-[var(--sublimes-dark-bg)] rounded-lg">
                    <span className="text-gray-400">Refunded Amount</span>
                    <span className="font-bold text-purple-500">AED {(stats?.refundedAmount || 0).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
              <CardHeader>
                <CardTitle className="text-[var(--sublimes-light-text)]">Transaction Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-[var(--sublimes-dark-bg)] rounded-lg">
                    <span className="text-gray-400">Total Transactions</span>
                    <span className="font-bold text-[var(--sublimes-light-text)]">{stats?.totalTransactions || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-[var(--sublimes-dark-bg)] rounded-lg">
                    <span className="text-gray-400">Pending</span>
                    <span className="font-bold text-yellow-500">{stats?.pendingTransactions || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-[var(--sublimes-dark-bg)] rounded-lg">
                    <span className="text-gray-400">Failed</span>
                    <span className="font-bold text-red-500">{stats?.failedTransactions || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-[var(--sublimes-dark-bg)] rounded-lg">
                    <span className="text-gray-400">Refunded</span>
                    <span className="font-bold text-purple-500">{stats?.refundedTransactions || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="grid grid-cols-2 gap-6">
            {/* Credit Packages */}
            <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[var(--sublimes-light-text)]">Bid Credit Packages</CardTitle>
                  <Button
                    size="sm"
                    className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]"
                    onClick={() => {
                      setEditingPackage(null);
                      setNewPackage({
                        name: '',
                        description: '',
                        credits: 0,
                        price: 0,
                        bonus_credits: 0,
                        is_popular: false,
                        is_active: true,
                        valid_days: 365,
                      });
                      setShowPackageModal(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Package
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {creditPackages.map(pkg => (
                    <div
                      key={pkg.id}
                      className={`p-4 border rounded-lg ${
                        pkg.is_popular ? 'border-[var(--sublimes-gold)]' : 'border-[var(--sublimes-border)]'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium text-[var(--sublimes-light-text)] flex items-center gap-2">
                            {pkg.name}
                            {pkg.is_popular && (
                              <Badge className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]">Popular</Badge>
                            )}
                            {!pkg.is_active && (
                              <Badge variant="outline" className="text-gray-500">Inactive</Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-400">{pkg.description}</div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingPackage(pkg);
                              setNewPackage({
                                name: pkg.name,
                                description: pkg.description || '',
                                credits: pkg.credits,
                                price: pkg.price,
                                bonus_credits: pkg.bonus_credits,
                                is_popular: pkg.is_popular,
                                is_active: pkg.is_active,
                                valid_days: pkg.valid_days,
                              });
                              setShowPackageModal(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500 text-red-500"
                            onClick={() => deletePackage(pkg.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-[var(--sublimes-gold)]">{pkg.credits} credits</span>
                        {pkg.bonus_credits > 0 && (
                          <span className="text-green-500">+{pkg.bonus_credits} bonus</span>
                        )}
                        <span className="text-gray-400">AED {pkg.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Wallet Settings */}
            <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
              <CardHeader>
                <CardTitle className="text-[var(--sublimes-light-text)]">Wallet Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {settings.map(setting => (
                    <div
                      key={setting.id}
                      className="flex justify-between items-center p-3 bg-[var(--sublimes-dark-bg)] rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-[var(--sublimes-light-text)]">
                          {setting.setting_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                        <div className="text-xs text-gray-400">{setting.description}</div>
                      </div>
                      <div className="text-[var(--sublimes-gold)] font-medium">
                        {typeof setting.setting_value.value === 'boolean'
                          ? (setting.setting_value.value ? 'Enabled' : 'Disabled')
                          : `${setting.setting_value.value} ${setting.setting_value.currency || ''}`}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Credit Modal */}
      <Dialog open={showAddCreditModal} onOpenChange={setShowAddCreditModal}>
        <DialogContent className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--sublimes-light-text)]">Add Credits to Wallet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-400">User</Label>
              <div className="p-3 bg-[var(--sublimes-dark-bg)] rounded-lg mt-1">
                <div className="font-medium text-[var(--sublimes-light-text)]">
                  {selectedUser?.profile?.display_name || selectedUser?.profile?.email}
                </div>
                <div className="text-sm text-gray-400">
                  Current Balance: AED {selectedUser?.balance.toFixed(2)}
                </div>
              </div>
            </div>
            <div>
              <Label className="text-gray-400">Amount (AED)</Label>
              <Input
                type="number"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                placeholder="Enter amount"
                className="mt-1 bg-[var(--sublimes-dark-bg)]"
              />
            </div>
            <div>
              <Label className="text-gray-400">Description</Label>
              <Textarea
                value={creditDescription}
                onChange={(e) => setCreditDescription(e.target.value)}
                placeholder="Reason for adding credits..."
                className="mt-1 bg-[var(--sublimes-dark-bg)]"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddCreditModal(false)}>Cancel</Button>
            <Button
              className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]"
              onClick={addCreditsToUser}
            >
              Add Credits
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Package Modal */}
      <Dialog open={showPackageModal} onOpenChange={setShowPackageModal}>
        <DialogContent className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--sublimes-light-text)]">
              {editingPackage ? 'Edit Package' : 'Create Package'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-400">Name</Label>
              <Input
                value={newPackage.name}
                onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
                className="mt-1 bg-[var(--sublimes-dark-bg)]"
              />
            </div>
            <div>
              <Label className="text-gray-400">Description</Label>
              <Textarea
                value={newPackage.description}
                onChange={(e) => setNewPackage({ ...newPackage, description: e.target.value })}
                className="mt-1 bg-[var(--sublimes-dark-bg)]"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-400">Credits</Label>
                <Input
                  type="number"
                  value={newPackage.credits}
                  onChange={(e) => setNewPackage({ ...newPackage, credits: Number(e.target.value) })}
                  className="mt-1 bg-[var(--sublimes-dark-bg)]"
                />
              </div>
              <div>
                <Label className="text-gray-400">Bonus Credits</Label>
                <Input
                  type="number"
                  value={newPackage.bonus_credits}
                  onChange={(e) => setNewPackage({ ...newPackage, bonus_credits: Number(e.target.value) })}
                  className="mt-1 bg-[var(--sublimes-dark-bg)]"
                />
              </div>
            </div>
            <div>
              <Label className="text-gray-400">Price (AED)</Label>
              <Input
                type="number"
                value={newPackage.price}
                onChange={(e) => setNewPackage({ ...newPackage, price: Number(e.target.value) })}
                className="mt-1 bg-[var(--sublimes-dark-bg)]"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newPackage.is_popular}
                  onChange={(e) => setNewPackage({ ...newPackage, is_popular: e.target.checked })}
                  className="rounded"
                />
                <span className="text-[var(--sublimes-light-text)]">Popular</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newPackage.is_active}
                  onChange={(e) => setNewPackage({ ...newPackage, is_active: e.target.checked })}
                  className="rounded"
                />
                <span className="text-[var(--sublimes-light-text)]">Active</span>
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPackageModal(false)}>Cancel</Button>
            <Button
              className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]"
              onClick={savePackage}
            >
              {editingPackage ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminBidManagement_Complete;



