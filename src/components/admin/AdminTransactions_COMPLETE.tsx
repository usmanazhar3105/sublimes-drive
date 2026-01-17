/**
 * AdminTransactions_COMPLETE - Transactions Management Page
 * 
 * Features:
 * - View all wallet transactions
 * - Filter by type, status
 * - Search transactions
 * - Export to CSV
 * - Approve/Reject pending transactions
 * - Stripe payment integration
 * - Real-time stats
 */

import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  DollarSign, 
  Download, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle,
  RefreshCw,
  Loader2,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  XCircle
} from 'lucide-react';

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  type: string;
  description: string;
  status: string;
  reference_type?: string;
  reference_id?: string;
  stripe_payment_id?: string;
  balance_after?: number;
  metadata?: any;
  created_at: string;
  // Joined data
  user_email?: string;
  user_name?: string;
}

interface TransactionStats {
  total: number;
  completed: number;
  pending: number;
  failed: number;
  totalCredits: number;
  totalDebits: number;
  totalAmount: number;
}

export function AdminTransactions_COMPLETE() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState<TransactionStats>({
    total: 0,
    completed: 0,
    pending: 0,
    failed: 0,
    totalCredits: 0,
    totalDebits: 0,
    totalAmount: 0
  });

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  useEffect(() => {
    loadTransactions();
  }, [typeFilter, statusFilter]);

  const loadTransactions = async () => {
    try {
      setLoading(true);

      // First, fetch transactions without join
      let query = supabase
        .from('wallet_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (typeFilter !== 'all') {
        query = query.eq('type', typeFilter);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data: txData, error: txError } = await query;

      if (txError) {
        console.error('Error fetching transactions:', txError);
        toast.error('Failed to load transactions');
        setTransactions([]);
        return;
      }

      if (!txData || txData.length === 0) {
        setTransactions([]);
        calculateStats([]);
        return;
      }

      // Get unique user IDs
      const userIds = [...new Set(txData.map(t => t.user_id).filter(Boolean))];

      // Fetch user profiles separately
      let profilesMap: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, email, display_name, full_name')
          .in('id', userIds);

        if (profiles) {
          profilesMap = profiles.reduce((acc, p) => {
            acc[p.id] = p;
            return acc;
          }, {} as Record<string, any>);
        }
      }

      // Combine transactions with user data
      const enrichedTransactions: Transaction[] = txData.map(tx => ({
        ...tx,
        user_email: profilesMap[tx.user_id]?.email || 'Unknown',
        user_name: profilesMap[tx.user_id]?.display_name || profilesMap[tx.user_id]?.full_name || 'Unknown User'
      }));

      setTransactions(enrichedTransactions);
      calculateStats(enrichedTransactions);

    } catch (error: any) {
      console.error('Error loading transactions:', error);
      toast.error('Failed to load transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
    toast.success('Data refreshed');
  };

  const calculateStats = (txList: Transaction[]) => {
    const newStats: TransactionStats = {
      total: txList.length,
      completed: txList.filter(t => t.status === 'completed' || t.status === 'success').length,
      pending: txList.filter(t => t.status === 'pending' || t.status === 'processing').length,
      failed: txList.filter(t => t.status === 'failed' || t.status === 'rejected').length,
      totalCredits: txList
        .filter(t => t.type === 'credit' || t.type === 'topup' || t.type === 'deposit')
        .reduce((sum, t) => sum + (t.amount || 0), 0),
      totalDebits: txList
        .filter(t => t.type === 'debit' || t.type === 'withdrawal' || t.type === 'payment')
        .reduce((sum, t) => sum + (t.amount || 0), 0),
      totalAmount: txList
        .filter(t => t.status === 'completed' || t.status === 'success')
        .reduce((sum, t) => sum + (t.amount || 0), 0)
    };
    setStats(newStats);
  };

  // ============================================================================
  // TRANSACTION ACTIONS
  // ============================================================================

  const updateTransactionStatus = async (transactionId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('wallet_transactions')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId);

      if (error) throw error;

      toast.success(`Transaction ${newStatus === 'completed' ? 'approved' : 'rejected'}`);
      
      // Update local state
      setTransactions(prev => 
        prev.map(t => t.id === transactionId ? { ...t, status: newStatus } : t)
      );
      
      // Recalculate stats
      calculateStats(transactions.map(t => 
        t.id === transactionId ? { ...t, status: newStatus } : t
      ));

    } catch (error: any) {
      console.error('Error updating transaction:', error);
      toast.error('Failed to update transaction');
    }
  };

  const processStripeRefund = async (transaction: Transaction) => {
    if (!transaction.stripe_payment_id) {
      toast.error('No Stripe payment ID found');
      return;
    }

    const confirm = window.confirm(
      `Process refund for ${transaction.user_name}?\n\n` +
      `Amount: AED ${transaction.amount}\n` +
      `Stripe ID: ${transaction.stripe_payment_id}`
    );

    if (!confirm) return;

    try {
      // Call Stripe refund edge function
      const { data, error } = await supabase.functions.invoke('stripe-webhook', {
        body: {
          action: 'create_refund',
          payment_intent: transaction.stripe_payment_id,
          amount: Math.round(transaction.amount * 100), // Convert to cents
          reason: 'requested_by_customer',
          metadata: {
            transaction_id: transaction.id,
            admin_initiated: true
          }
        }
      });

      if (error) throw error;

      toast.success('Refund initiated successfully');
      await updateTransactionStatus(transaction.id, 'refunded');

    } catch (error: any) {
      console.error('Error processing refund:', error);
      toast.error('Failed to process refund: ' + (error.message || 'Unknown error'));
    }
  };

  // ============================================================================
  // EXPORT FUNCTIONALITY
  // ============================================================================

  const exportTransactions = () => {
    try {
      // Create CSV content
      const headers = ['ID', 'User', 'Email', 'Type', 'Amount', 'Currency', 'Status', 'Description', 'Date'];
      const csvContent = [
        headers.join(','),
        ...filteredTransactions.map(t => [
          t.id,
          `"${t.user_name}"`,
          t.user_email,
          t.type,
          t.amount,
          t.currency || 'AED',
          t.status,
          `"${(t.description || '').replace(/"/g, '""')}"`,
          new Date(t.created_at).toISOString()
        ].join(','))
      ].join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${filteredTransactions.length} transactions`);

    } catch (error: any) {
      console.error('Error exporting:', error);
      toast.error('Failed to export transactions');
    }
  };

  // ============================================================================
  // FILTERING
  // ============================================================================

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = searchQuery === '' ||
      t.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // ============================================================================
  // UI HELPERS
  // ============================================================================

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'credit':
      case 'topup':
      case 'deposit':
        return <ArrowUpRight className="w-5 h-5 text-green-500" />;
      case 'debit':
      case 'withdrawal':
      case 'payment':
        return <ArrowDownRight className="w-5 h-5 text-red-500" />;
      case 'refund':
        return <TrendingDown className="w-5 h-5 text-orange-500" />;
      default:
        return <DollarSign className="w-5 h-5 text-blue-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'credit':
      case 'topup':
      case 'deposit':
        return 'text-green-500';
      case 'debit':
      case 'withdrawal':
      case 'payment':
        return 'text-red-500';
      case 'refund':
        return 'text-orange-500';
      default:
        return 'text-blue-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'success':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/30">Completed</Badge>;
      case 'pending':
      case 'processing':
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30">Pending</Badge>;
      case 'failed':
      case 'rejected':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/30">Failed</Badge>;
      case 'refunded':
        return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/30">Refunded</Badge>;
      default:
        return <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/30">{status}</Badge>;
    }
  };

  const formatAmount = (amount: number, type: string) => {
    const isCredit = ['credit', 'topup', 'deposit', 'refund'].includes(type);
    const sign = isCredit ? '+' : '-';
    return `${sign}AED ${Math.abs(amount).toLocaleString()}`;
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading && transactions.length === 0) {
    return (
      <div className="p-6 bg-[var(--sublimes-dark-bg)] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[var(--sublimes-gold)] animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-[var(--sublimes-dark-bg)] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#E8EAED]">Transactions</h1>
          <p className="text-gray-400 mt-1">Manage wallet transactions and payments</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={refreshData} 
            variant="outline"
            disabled={refreshing}
            className="border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={exportTransactions} 
            className="bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#0F1829] border-[#1A2332]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#8B92A7]">Total Transactions</p>
                <p className="text-2xl font-bold text-[#E8EAED]">{stats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0F1829] border-[#1A2332]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#8B92A7]">Completed</p>
                <p className="text-2xl font-bold text-green-500">{stats.completed}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0F1829] border-[#1A2332]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#8B92A7]">Pending</p>
                <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0F1829] border-[#1A2332]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#8B92A7]">Total Amount</p>
                <p className="text-2xl font-bold text-[#D4AF37]">
                  AED {stats.totalAmount.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-[#D4AF37]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-[#0F1829] border-[#1A2332]">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#8B92A7]" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[#1A2332] border-[#2A3342] text-[#E8EAED]"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48 bg-[#1A2332] border-[#2A3342] text-[#E8EAED]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
                <SelectItem value="debit">Debit</SelectItem>
                <SelectItem value="topup">Top Up</SelectItem>
                <SelectItem value="payment">Payment</SelectItem>
                <SelectItem value="refund">Refund</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 bg-[#1A2332] border-[#2A3342] text-[#E8EAED]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card className="bg-[#0F1829] border-[#1A2332]">
        <CardHeader className="border-b border-[#1A2332]">
          <CardTitle className="text-[#E8EAED]">
            Transactions ({filteredTransactions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-16">
              <Wallet className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#E8EAED] mb-2">No transactions found</h3>
              <p className="text-[#8B92A7]">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <div className="divide-y divide-[#1A2332]">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 hover:bg-[#1A2332]/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      ['credit', 'topup', 'deposit'].includes(transaction.type) 
                        ? 'bg-green-500/20' 
                        : ['refund'].includes(transaction.type)
                          ? 'bg-orange-500/20'
                          : 'bg-red-500/20'
                    }`}>
                      {getTypeIcon(transaction.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#E8EAED] truncate">
                        {transaction.user_name}
                      </p>
                      <p className="text-sm text-[#8B92A7] truncate">
                        {transaction.user_email}
                      </p>
                      <p className="text-xs text-[#8B92A7] mt-1">
                        {transaction.description || 'No description'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className={`text-lg font-bold ${getTypeColor(transaction.type)}`}>
                        {formatAmount(transaction.amount, transaction.type)}
                      </p>
                      <p className="text-xs text-[#8B92A7]">
                        {new Date(transaction.created_at).toLocaleString()}
                      </p>
                    </div>

                    <div className="w-24">
                      {getStatusBadge(transaction.status)}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 w-48 justify-end">
                      {(transaction.status === 'pending' || transaction.status === 'processing') && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateTransactionStatus(transaction.id, 'completed')}
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateTransactionStatus(transaction.id, 'failed')}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      {transaction.stripe_payment_id && transaction.status === 'completed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => processStripeRefund(transaction)}
                          className="border-orange-500 text-orange-500 hover:bg-orange-500/10"
                        >
                          <CreditCard className="w-4 h-4 mr-1" />
                          Refund
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stripe Integration Info */}
      <Card className="bg-[#0F1829] border-[#1A2332]">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <h3 className="font-medium text-[#E8EAED]">Stripe Integration</h3>
              <p className="text-sm text-[#8B92A7]">
                Transactions with Stripe payment IDs can be refunded directly. 
                Refunds are processed through the stripe-webhook edge function.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
