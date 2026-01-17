/**
 * Admin Bid Repair Management - Real Database & Stripe Integration
 * Re-exports the complete implementation from AdminBidManagement_Complete
 */

// Re-export from complete implementation
export { AdminBidManagement_Complete as AdminBidManagement_Real } from './AdminBidManagement_Complete';
export { AdminBidManagement_Complete as default } from './AdminBidManagement_Complete';

// Legacy types kept for reference (implementation moved to AdminBidManagement_Complete)
interface Payment {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  type: string;
  description: string;
  stripe_payment_id?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  user?: {
    display_name?: string;
    email?: string;
  };
}

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  type: string;
  description: string;
  balance_after: number;
  status: string;
  created_at: string;
  user?: {
    display_name?: string;
    email?: string;
  };
}

interface Stats {
  totalRevenue: number;
  pendingPayments: number;
  failedPayments: number;
  refundsIssued: number;
  pendingCount: number;
  failedCount: number;
  refundCount: number;
}

// Legacy implementation - kept for reference only
function AdminBidManagement_Legacy() {
  const [selectedTab, setSelectedTab] = useState('payments');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    pendingPayments: 0,
    failedPayments: 0,
    refundsIssued: 0,
    pendingCount: 0,
    failedCount: 0,
    refundCount: 0,
  });
  const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [walletUsers, setWalletUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchAllData();
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchStats(),
        fetchPendingPayments(),
        fetchTransactions(),
        fetchWalletUsers(),
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    // Fetch wallet transactions for stats
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('amount, type, currency, created_at');

    if (error) {
      console.error('Error fetching stats:', error);
      return;
    }

    // Calculate stats
    const completed = data?.filter(t => t.type === 'credit' || t.type === 'topup') || [];
    const pending = data?.filter(t => t.type === 'pending') || [];
    const failed = data?.filter(t => t.type === 'failed') || [];
    const refunds = data?.filter(t => t.type === 'refund') || [];

    const totalRevenue = completed.reduce((sum, t) => sum + Number(t.amount), 0);
    const pendingPayments = pending.reduce((sum, t) => sum + Number(t.amount), 0);
    const failedPayments = failed.reduce((sum, t) => sum + Number(t.amount), 0);
    const refundsIssued = refunds.reduce((sum, t) => sum + Number(t.amount), 0);

    setStats({
      totalRevenue,
      pendingPayments,
      failedPayments,
      refundsIssued,
      pendingCount: pending.length,
      failedCount: failed.length,
      refundCount: refunds.length,
    });
  };

  const fetchPendingPayments = async () => {
    try {
      // Step 1: Fetch pending transactions (without FK join)
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('wallet_transactions')
        .select(`
          id,
          user_id,
          amount,
          currency,
          type,
          description,
          metadata,
          status,
          stripe_payment_id,
          created_at
        `)
        .or('type.eq.pending,type.eq.processing,status.eq.pending,status.eq.processing')
        .order('created_at', { ascending: false })
        .limit(10);

      if (transactionsError) {
        console.error('Error fetching pending payments:', transactionsError);
        return;
      }

      // Step 2: Get unique user IDs and fetch profiles separately
      const userIds = [...new Set((transactionsData || []).map(t => t.user_id).filter(Boolean))];
      let profilesMap: Record<string, { display_name?: string; email?: string }> = {};

      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, display_name, email')
          .in('id', userIds);

        if (profilesData) {
          profilesMap = profilesData.reduce((acc, profile) => {
            acc[profile.id] = { display_name: profile.display_name, email: profile.email };
            return acc;
          }, {} as Record<string, { display_name?: string; email?: string }>);
        }
      }

      // Step 3: Merge transactions with user profiles
      setPendingPayments((transactionsData || []).map((t: any) => ({
        id: t.id,
        user_id: t.user_id,
        amount: Number(t.amount) || 0,
        currency: t.currency || 'AED',
        type: t.type,
        description: t.description || '',
        stripe_payment_id: t.stripe_payment_id || t.metadata?.stripe_payment_id,
        status: t.status || t.type,
        created_at: t.created_at,
        user: profilesMap[t.user_id] || { display_name: 'Unknown User', email: '' },
      })));
    } catch (error) {
      console.error('Error fetching pending payments:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      // Step 1: Fetch transactions (without FK join)
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('wallet_transactions')
        .select(`
          id,
          user_id,
          amount,
          currency,
          type,
          description,
          balance_after,
          status,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (transactionsError) {
        console.error('Error fetching transactions:', transactionsError);
        return;
      }

      // Step 2: Get unique user IDs and fetch profiles separately
      const userIds = [...new Set((transactionsData || []).map(t => t.user_id).filter(Boolean))];
      let profilesMap: Record<string, { display_name?: string; email?: string }> = {};

      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, display_name, email')
          .in('id', userIds);

        if (profilesData) {
          profilesMap = profilesData.reduce((acc, profile) => {
            acc[profile.id] = { display_name: profile.display_name, email: profile.email };
            return acc;
          }, {} as Record<string, { display_name?: string; email?: string }>);
        }
      }

      // Step 3: Merge transactions with user profiles
      setTransactions((transactionsData || []).map((t: any) => {
        // Determine status
        let status = t.status || t.type;
        if (t.type === 'credit' || t.type === 'topup') {
          status = 'completed';
        }

        return {
          id: t.id,
          user_id: t.user_id,
          amount: Number(t.amount) || 0,
          currency: t.currency || 'AED',
          type: t.type,
          description: t.description || '',
          balance_after: Number(t.balance_after) || 0,
          status,
          created_at: t.created_at,
          user: profilesMap[t.user_id] || { display_name: 'Unknown User', email: '' },
        };
      }));
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchWalletUsers = async () => {
    try {
      // Fetch profiles - handle potentially missing wallet columns
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, email, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }

      // For each user, calculate their wallet balance from transactions
      const usersWithBalances = await Promise.all((profilesData || []).map(async (profile) => {
        // Get sum of credits minus debits for this user
        const { data: creditData } = await supabase
          .from('wallet_transactions')
          .select('amount')
          .eq('user_id', profile.id)
          .in('type', ['credit', 'topup', 'deposit']);

        const { data: debitData } = await supabase
          .from('wallet_transactions')
          .select('amount')
          .eq('user_id', profile.id)
          .in('type', ['debit', 'payment', 'withdrawal']);

        const totalCredits = (creditData || []).reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);
        const totalDebits = (debitData || []).reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);
        const walletBalance = totalCredits - totalDebits;

        // Get bid-related transactions
        const { data: bidCreditData } = await supabase
          .from('wallet_transactions')
          .select('amount')
          .eq('user_id', profile.id)
          .ilike('description', '%bid%')
          .eq('type', 'credit');

        const { data: bidDebitData } = await supabase
          .from('wallet_transactions')
          .select('amount')
          .eq('user_id', profile.id)
          .ilike('description', '%bid%')
          .eq('type', 'debit');

        const bidCredits = (bidCreditData || []).reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);
        const bidDebits = (bidDebitData || []).reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);
        const bidWalletBalance = bidCredits - bidDebits;

        return {
          ...profile,
          wallet_balance: walletBalance,
          bid_wallet_balance: bidWalletBalance,
        };
      }));

      // Sort by wallet balance
      usersWithBalances.sort((a, b) => (b.wallet_balance || 0) - (a.wallet_balance || 0));
      
      setWalletUsers(usersWithBalances);
    } catch (error) {
      console.error('Error fetching wallet users:', error);
    }
  };

  const approvePayment = async (payment: Payment) => {
    try {
      const now = new Date().toISOString();
      
      // Update transaction status to completed/credit
      const { error: txError } = await supabase
        .from('wallet_transactions')
        .update({ 
          type: 'credit',
          status: 'completed',
          updated_at: now,
          metadata: {
            approved_at: now,
            approved_by: 'admin',
          },
        })
        .eq('id', payment.id);

      if (txError) throw txError;

      toast.success('Payment approved successfully');
      fetchAllData();
    } catch (error: any) {
      console.error('Error approving payment:', error);
      toast.error(error.message || 'Failed to approve payment');
    }
  };

  const rejectPayment = async (payment: Payment) => {
    try {
      const now = new Date().toISOString();
      
      // If there's a Stripe payment, try to create a refund
      if (payment.stripe_payment_id) {
        try {
          const { error: stripeError } = await supabase.functions.invoke('stripe-webhook', {
            body: {
              action: 'refund',
              payment_intent: payment.stripe_payment_id,
              amount: Math.round(payment.amount * 100), // Convert to cents
            },
          });

          if (stripeError) {
            console.warn('Stripe refund failed, continuing with rejection:', stripeError);
            toast.warning('Payment rejected but Stripe refund may need manual processing');
          }
        } catch (stripeError) {
          console.warn('Stripe refund error:', stripeError);
        }
      }

      // Update transaction status to failed/rejected
      const { error } = await supabase
        .from('wallet_transactions')
        .update({ 
          type: 'failed',
          status: 'rejected',
          updated_at: now,
          metadata: {
            rejected_at: now,
            rejected_by: 'admin',
          },
        })
        .eq('id', payment.id);

      if (error) throw error;

      toast.success('Payment rejected');
      fetchAllData();
    } catch (error: any) {
      console.error('Error rejecting payment:', error);
      toast.error(error.message || 'Failed to reject payment');
    }
  };

  const exportData = () => {
    try {
      let csv = '';
      const filename = `bid_repair_${selectedTab}_${new Date().toISOString().split('T')[0]}.csv`;

      if (selectedTab === 'payments') {
        const headers = ['ID', 'User', 'Email', 'Amount', 'Currency', 'Type', 'Description', 'Status', 'Created At'];
        const rows = pendingPayments.map(p => [
          p.id,
          p.user?.display_name || 'N/A',
          p.user?.email || 'N/A',
          p.amount.toFixed(2),
          p.currency,
          p.type,
          `"${(p.description || '').replace(/"/g, '""')}"`,
          p.status,
          new Date(p.created_at).toLocaleString(),
        ].join(','));
        csv = [headers.join(','), ...rows].join('\n');
      } else if (selectedTab === 'transactions') {
        const headers = ['ID', 'User', 'Email', 'Amount', 'Currency', 'Type', 'Description', 'Balance After', 'Status', 'Created At'];
        const rows = transactions.map(t => [
          t.id,
          t.user?.display_name || 'N/A',
          t.user?.email || 'N/A',
          t.amount.toFixed(2),
          t.currency,
          t.type,
          `"${(t.description || '').replace(/"/g, '""')}"`,
          t.balance_after.toFixed(2),
          t.status,
          new Date(t.created_at).toLocaleString(),
        ].join(','));
        csv = [headers.join(','), ...rows].join('\n');
      } else {
        const headers = ['ID', 'User', 'Email', 'Wallet Balance', 'Bid Wallet Balance', 'Created At'];
        const rows = walletUsers.map(u => [
          u.id,
          u.display_name || 'N/A',
          u.email || 'N/A',
          (u.wallet_balance || 0).toFixed(2),
          (u.bid_wallet_balance || 0).toFixed(2),
          new Date(u.created_at).toLocaleString(),
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
      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color }: any) => (
    <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2 rounded-lg`} style={{ backgroundColor: `${color}20` }}>
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
          <Badge className="bg-[var(--sublimes-gold)]/10 text-[var(--sublimes-gold)] border-[var(--sublimes-gold)]/30">
            Live
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="text-2xl font-bold text-[var(--sublimes-light-text)]">{value}</div>
          <div className="text-sm text-gray-400">{title}</div>
          <div className="text-xs font-medium" style={{ color }}>{subtitle}</div>
        </div>
      </CardContent>
    </Card>
  );

  const PaymentItem = ({ payment }: { payment: Payment }) => (
    <div className="flex items-center justify-between p-4 border-t border-[var(--sublimes-border)]">
      <div className="flex items-center space-x-4">
        <div className="p-2 bg-[var(--sublimes-gold)]/10 rounded-lg">
          <CreditCard className="h-4 w-4 text-[var(--sublimes-gold)]" />
        </div>
        <div>
          <div className="font-medium text-[var(--sublimes-light-text)]">
            {payment.user?.display_name || payment.user?.email || 'Unknown User'}
          </div>
          <div className="text-sm text-gray-400">{payment.description}</div>
          <div className="text-xs text-gray-500">
            {new Date(payment.created_at).toLocaleString()}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <div className="font-bold text-[var(--sublimes-gold)]">
            {payment.currency} {payment.amount.toFixed(2)}
          </div>
          <Badge variant="outline" className="text-xs border-orange-500 text-orange-500">
            {payment.status}
          </Badge>
        </div>
        <div className="flex space-x-1">
          <Button 
            size="sm" 
            variant="outline" 
            className="p-1 h-8 w-8"
            onClick={() => approvePayment(payment)}
          >
            <Check className="h-3 w-3 text-green-500" />
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="p-1 h-8 w-8"
            onClick={() => rejectPayment(payment)}
          >
            <X className="h-3 w-3 text-red-500" />
          </Button>
        </div>
      </div>
    </div>
  );

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--sublimes-gold)]" />
      </div>
    );
  }

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
              className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] hover:bg-[var(--sublimes-gold)]/80"
              onClick={exportData}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button 
              variant="outline"
              className="border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
              onClick={fetchAllData}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={`AED ${stats.totalRevenue.toFixed(2)}`}
          subtitle="+12% vs last month"
          icon={TrendingUp}
          color="#4ade80"
        />
        <StatCard
          title="Pending Payments"
          value={`AED ${stats.pendingPayments.toFixed(2)}`}
          subtitle={`${stats.pendingCount} transactions`}
          icon={DollarSign}
          color="#f59e0b"
        />
        <StatCard
          title="Failed Payments"
          value={`AED ${stats.failedPayments.toFixed(2)}`}
          subtitle={`${stats.failedCount} transactions`}
          icon={AlertCircle}
          color="#ef4444"
        />
        <StatCard
          title="Refunds Issued"
          value={`AED ${stats.refundsIssued.toFixed(2)}`}
          subtitle={`${stats.refundCount} refunds`}
          icon={RefreshCw}
          color="#3b82f6"
        />
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)]">
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="wallet-users">Wallet Users</TabsTrigger>
        </TabsList>

        {/* Pending Payments Tab */}
        <TabsContent value="payments">
          <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-[var(--sublimes-light-text)]">
                  Pending Payments
                </CardTitle>
                <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/30">
                  {pendingPayments.length} Pending
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {pendingPayments.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  No pending payments
                </div>
              ) : (
                pendingPayments.map(payment => (
                  <PaymentItem key={payment.id} payment={payment} />
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
            <CardHeader>
              <CardTitle className="text-[var(--sublimes-light-text)]">
                All Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Transaction Table Header */}
              <div className="grid grid-cols-7 gap-4 p-4 border-b border-[var(--sublimes-border)] font-medium text-sm text-gray-400">
                <div>ID</div>
                <div>User</div>
                <div>Amount</div>
                <div>Type</div>
                <div>Date</div>
                <div className="text-center">Status</div>
                <div className="text-center">Actions</div>
              </div>

              {/* Transaction Rows */}
              {transactions.map((transaction) => (
                <div 
                  key={transaction.id}
                  className="grid grid-cols-7 gap-4 p-4 border-b border-[var(--sublimes-border)]/30 items-center"
                >
                  <div className="text-sm font-medium text-[var(--sublimes-light-text)] truncate">
                    {transaction.id.substring(0, 8)}...
                  </div>
                  <div className="text-sm text-[var(--sublimes-light-text)] truncate">
                    {transaction.user?.display_name || transaction.user?.email || 'Unknown'}
                  </div>
                  <div className="text-sm font-medium text-[var(--sublimes-gold)]">
                    {transaction.currency} {transaction.amount.toFixed(2)}
                  </div>
                  <div className="text-sm text-[var(--sublimes-light-text)] capitalize">
                    {transaction.type}
                  </div>
                  <div className="text-sm text-gray-400">
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </div>
                  <div className="text-center">
                    <Badge
                      className={`text-xs ${
                        transaction.status === 'completed' || transaction.status === 'credit'
                          ? 'bg-green-500/10 text-green-500 border-green-500/30'
                          : 'bg-red-500/10 text-red-500 border-red-500/30'
                      }`}
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                  <div className="flex space-x-1 justify-center">
                    <Button size="sm" variant="outline" className="p-1 h-6 w-6">
                      <Eye className="h-3 w-3 text-gray-400" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wallet Users Tab */}
        <TabsContent value="wallet-users">
          <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
            <CardHeader>
              <CardTitle className="text-[var(--sublimes-light-text)]">
                Wallet Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {walletUsers.map((user) => (
                  <div 
                    key={user.id}
                    className="flex items-center justify-between p-4 border border-[var(--sublimes-border)] rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-[var(--sublimes-light-text)]">
                        {user.display_name || user.email}
                      </div>
                      <div className="text-sm text-gray-400">{user.email}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[var(--sublimes-gold)]">
                        AED {(user.wallet_balance || 0).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-400">
                        Bid: AED {(user.bid_wallet_balance || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}





