import { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, CreditCard, Calendar, DollarSign, User, Search, Filter, Activity, Settings, TrendingUp, CheckCircle, AlertCircle, RefreshCw, Download, Check, Eye } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Checkbox } from '../ui/checkbox';
import { Switch } from '../ui/switch';
import { toast } from 'sonner';

interface BidTransaction {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: 'credit' | 'debit' | 'refund' | 'bonus';
  amount: number;
  balance: number;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  referenceId?: string;
  createdAt: string;
  updatedAt?: string;
  adminNotes?: string;
}

interface PaymentRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  paymentMethod: string;
  createdAt: string;
  description: string;
}

interface UserWallet {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  currentBalance: number;
  totalCredits: number;
  totalDebits: number;
  status: 'active' | 'suspended' | 'frozen';
  lastActivity: string;
}

export function AdminRepairBidCreditsPage() {
  const [activeTab, setActiveTab] = useState<'payments' | 'transactions' | 'wallets' | 'analytics' | 'settings'>('payments');
  
  // Mock data
  const [payments, setPayments] = useState<PaymentRecord[]>([
    {
      id: 'pay_001',
      userId: 'user_001',
      userName: 'Ahmed Hassan',
      userEmail: 'ahmed@email.com',
      amount: 50,
      currency: 'AED',
      status: 'pending',
      paymentMethod: 'Credit Card',
      createdAt: '2 minutes ago',
      description: 'Wallet Top-up'
    },
    {
      id: 'pay_002',
      userId: 'user_002',
      userName: 'Sara Al-Rashid',
      userEmail: 'sara@email.com',
      amount: 100,
      currency: 'AED',
      status: 'processing',
      paymentMethod: 'Bank Transfer',
      createdAt: '15 minutes ago',
      description: 'Wallet Top-up'
    }
  ]);

  const [transactions, setTransactions] = useState<BidTransaction[]>([
    {
      id: 'TXN-001',
      userId: 'user_001',
      userName: 'Ahmed Hassan',
      userEmail: 'ahmed@email.com',
      type: 'credit',
      amount: 50.00,
      balance: 225.50,
      description: 'Top-up',
      status: 'completed',
      referenceId: 'stripe_pi_123',
      createdAt: '2024-01-15'
    },
    {
      id: 'TXN-002',
      userId: 'user_002',
      userName: 'Sara Al-Rashid',
      userEmail: 'sara@email.com',
      type: 'credit',
      amount: 100.00,
      balance: 325.50,
      description: 'Top-up',
      status: 'completed',
      referenceId: 'stripe_pi_124',
      createdAt: '2024-01-14'
    },
    {
      id: 'TXN-003',
      userId: 'user_003',
      userName: 'Mohammed Ali',
      userEmail: 'mohammed@email.com',
      type: 'refund',
      amount: 25.00,
      balance: 125.50,
      description: 'Refund',
      status: 'completed',
      referenceId: 'refund_123',
      createdAt: '2024-01-13'
    },
    {
      id: 'TXN-004',
      userId: 'user_004',
      userName: 'Fatima Ahmed',
      userEmail: 'fatima@email.com',
      type: 'credit',
      amount: 75.00,
      balance: 275.50,
      description: 'Top-up',
      status: 'failed',
      referenceId: 'stripe_pi_125',
      createdAt: '2024-01-12'
    }
  ]);

  const [wallets, setWallets] = useState<UserWallet[]>([
    {
      id: 'wallet_001',
      userId: 'user_001',
      userName: 'Ahmed Hassan',
      userEmail: 'ahmed@email.com',
      currentBalance: 125.50,
      totalCredits: 500.00,
      totalDebits: 374.50,
      status: 'active',
      lastActivity: '2024-01-15T10:30:00Z'
    }
  ]);

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showDateRange, setShowDateRange] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isAddCreditDialogOpen, setIsAddCreditDialogOpen] = useState(false);
  const [isViewDetailsDialogOpen, setIsViewDetailsDialogOpen] = useState(false);
  const [selectedItemDetails, setSelectedItemDetails] = useState<any>(null);

  // Credit form state
  const [creditForm, setCreditForm] = useState({
    userId: '',
    userName: '',
    userEmail: '',
    amount: '',
    type: 'credit' as 'credit' | 'bonus',
    description: '',
    adminNotes: ''
  });

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case 'payments': return payments;
      case 'transactions': return transactions;
      case 'wallets': return wallets;
      default: return [];
    }
  };

  // Filter data
  const filteredData = getCurrentData().filter(item => {
    const matchesSearch = 
      (item as any).userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item as any).userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item as any).description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const status = (item as any).status;
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Bulk selection handlers
  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(filteredData.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const isSelectAllChecked = selectedItems.length === filteredData.length && filteredData.length > 0;

  // Export functionality
  const handleExportSelected = () => {
    if (selectedItems.length === 0) {
      toast.error('Please select at least one item to export');
      return;
    }

    const itemsToExport = filteredData.filter(item => selectedItems.includes(item.id));
    
    // Apply date filter if provided
    let filteredItems = itemsToExport;
    if (dateFrom || dateTo) {
      filteredItems = itemsToExport.filter(item => {
        const itemDate = new Date(item.createdAt || (item as any).lastActivity);
        const fromDate = dateFrom ? new Date(dateFrom) : null;
        const toDate = dateTo ? new Date(dateTo) : null;
        
        if (fromDate && itemDate < fromDate) return false;
        if (toDate && itemDate > toDate) return false;
        return true;
      });
    }

    // Create CSV content based on active tab
    let headers: string[] = [];
    let csvRows: string[] = [];

    if (activeTab === 'payments') {
      headers = ['Payment ID', 'User Name', 'Email', 'Amount', 'Currency', 'Status', 'Payment Method', 'Description', 'Created At'];
      csvRows = filteredItems.map(item => {
        const payment = item as PaymentRecord;
        return [
          payment.id,
          payment.userName,
          payment.userEmail,
          payment.amount.toString(),
          payment.currency,
          payment.status,
          payment.paymentMethod,
          `"${payment.description}"`,
          payment.createdAt
        ].join(',');
      });
    } else if (activeTab === 'wallets') {
      headers = ['User ID', 'User Name', 'Email', 'Current Balance', 'Total Credits', 'Total Debits', 'Status', 'Last Activity'];
      csvRows = filteredItems.map(item => {
        const wallet = item as UserWallet;
        return [
          wallet.userId,
          wallet.userName,
          wallet.userEmail,
          wallet.currentBalance.toString(),
          wallet.totalCredits.toString(),
          wallet.totalDebits.toString(),
          wallet.status,
          new Date(wallet.lastActivity).toLocaleDateString()
        ].join(',');
      });
    } else {
      headers = ['Transaction ID', 'User Name', 'Email', 'Type', 'Amount', 'Balance', 'Description', 'Status', 'Date'];
      csvRows = filteredItems.map(item => {
        const transaction = item as BidTransaction;
        return [
          transaction.id,
          transaction.userName,
          transaction.userEmail,
          transaction.type,
          transaction.amount.toString(),
          transaction.balance.toString(),
          `"${transaction.description}"`,
          transaction.status,
          transaction.createdAt
        ].join(',');
      });
    }

    const csvContent = [headers.join(','), ...csvRows].join('\\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `repair_bid_credits_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success(`Exported ${filteredItems.length} items successfully`);
  };

  const handleExportAll = () => {
    const allItems = filteredData;
    
    // Apply date filter if provided
    let filteredItems = allItems;
    if (dateFrom || dateTo) {
      filteredItems = allItems.filter(item => {
        const itemDate = new Date(item.createdAt || (item as any).lastActivity);
        const fromDate = dateFrom ? new Date(dateFrom) : null;
        const toDate = dateTo ? new Date(dateTo) : null;
        
        if (fromDate && itemDate < fromDate) return false;
        if (toDate && itemDate > toDate) return false;
        return true;
      });
    }

    // Create CSV content
    let headers: string[] = [];
    let csvRows: string[] = [];

    if (activeTab === 'payments') {
      headers = ['Payment ID', 'User Name', 'Email', 'Amount', 'Currency', 'Status', 'Payment Method', 'Description', 'Created At'];
      csvRows = filteredItems.map(item => {
        const payment = item as PaymentRecord;
        return [
          payment.id,
          payment.userName,
          payment.userEmail,
          payment.amount.toString(),
          payment.currency,
          payment.status,
          payment.paymentMethod,
          `"${payment.description}"`,
          payment.createdAt
        ].join(',');
      });
    } else if (activeTab === 'wallets') {
      headers = ['User ID', 'User Name', 'Email', 'Current Balance', 'Total Credits', 'Total Debits', 'Status', 'Last Activity'];
      csvRows = filteredItems.map(item => {
        const wallet = item as UserWallet;
        return [
          wallet.userId,
          wallet.userName,
          wallet.userEmail,
          wallet.currentBalance.toString(),
          wallet.totalCredits.toString(),
          wallet.totalDebits.toString(),
          wallet.status,
          new Date(wallet.lastActivity).toLocaleDateString()
        ].join(',');
      });
    } else {
      headers = ['Transaction ID', 'User Name', 'Email', 'Type', 'Amount', 'Balance', 'Description', 'Status', 'Date'];
      csvRows = filteredItems.map(item => {
        const transaction = item as BidTransaction;
        return [
          transaction.id,
          transaction.userName,
          transaction.userEmail,
          transaction.type,
          transaction.amount.toString(),
          transaction.balance.toString(),
          `"${transaction.description}"`,
          transaction.status,
          transaction.createdAt
        ].join(',');
      });
    }

    const csvContent = [headers.join(','), ...csvRows].join('\\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `repair_bid_credits_all_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success(`Exported all ${filteredItems.length} items successfully`);
  };

  // Payment action handlers
  const handleApprovePayment = (paymentId: string) => {
    setPayments(prev => prev.map(payment => 
      payment.id === paymentId 
        ? { ...payment, status: 'completed' as const }
        : payment
    ));
    toast.success('Payment approved successfully');
  };

  const handleRejectPayment = (paymentId: string) => {
    setPayments(prev => prev.map(payment => 
      payment.id === paymentId 
        ? { ...payment, status: 'failed' as const }
        : payment
    ));
    toast.error('Payment rejected');
  };

  const handleCancelPayment = (paymentId: string) => {
    setPayments(prev => prev.filter(payment => payment.id !== paymentId));
    toast.success('Payment cancelled and removed');
  };

  const handleDeleteTransaction = (transactionId: string) => {
    setTransactions(prev => prev.filter(transaction => transaction.id !== transactionId));
    toast.success('Transaction deleted successfully');
  };

  const handleViewDetails = (item: any) => {
    setSelectedItemDetails(item);
    setIsViewDetailsDialogOpen(true);
  };

  // Add credit functionality
  const handleAddCredit = () => {
    if (!creditForm.userId || !creditForm.userName || !creditForm.userEmail || !creditForm.amount || !creditForm.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(creditForm.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Amount must be a valid number greater than 0');
      return;
    }

    // Create new transaction
    const newTransaction: BidTransaction = {
      id: `TXN-${Date.now()}`,
      userId: creditForm.userId,
      userName: creditForm.userName,
      userEmail: creditForm.userEmail,
      type: creditForm.type,
      amount,
      balance: 0,
      description: creditForm.description,
      status: 'completed',
      createdAt: new Date().toLocaleDateString(),
      adminNotes: creditForm.adminNotes
    };

    // Update wallet balance
    setWallets(prev => prev.map(wallet => {
      if (wallet.userId === creditForm.userId) {
        const newBalance = wallet.currentBalance + amount;
        newTransaction.balance = newBalance;
        return {
          ...wallet,
          currentBalance: newBalance,
          totalCredits: wallet.totalCredits + amount,
          lastActivity: new Date().toISOString()
        };
      }
      return wallet;
    }));

    // If wallet doesn't exist, create new one
    const existingWallet = wallets.find(w => w.userId === creditForm.userId);
    if (!existingWallet) {
      const newWallet: UserWallet = {
        id: `wallet_${Date.now()}`,
        userId: creditForm.userId,
        userName: creditForm.userName,
        userEmail: creditForm.userEmail,
        currentBalance: amount,
        totalCredits: amount,
        totalDebits: 0,
        status: 'active',
        lastActivity: new Date().toISOString()
      };
      setWallets(prev => [...prev, newWallet]);
      newTransaction.balance = amount;
    }

    // Add transaction
    setTransactions(prev => [newTransaction, ...prev]);

    // Reset form
    setCreditForm({
      userId: '',
      userName: '',
      userEmail: '',
      amount: '',
      type: 'credit',
      description: '',
      adminNotes: ''
    });

    setIsAddCreditDialogOpen(false);
    toast.success(`Successfully added ${amount} AED credit to ${creditForm.userName}'s wallet`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-500';
      case 'pending': return 'bg-yellow-500/10 text-yellow-500';
      case 'processing': return 'bg-blue-500/10 text-blue-500';
      case 'failed': return 'bg-red-500/10 text-red-500';
      case 'active': return 'bg-green-500/10 text-green-500';
      case 'suspended': return 'bg-yellow-500/10 text-yellow-500';
      case 'frozen': return 'bg-red-500/10 text-red-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--sublimes-light-text)]">Bid Repair Management</h1>
          <p className="text-gray-400">Manage payments, transactions, and wallet system</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            onClick={handleExportAll}
            variant="outline"
            className="border-[var(--sublimes-border)]"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button 
            onClick={() => setIsAddCreditDialogOpen(true)}
            className="bg-green-500 text-white hover:bg-green-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Credit
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <div className="px-2 py-1 bg-green-500/10 text-green-500 text-xs font-bold rounded">+12% vs last month</div>
            </div>
            <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">AED 24,890</p>
            <p className="text-sm text-gray-400">Total Revenue</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-500" />
              </div>
              <div className="px-2 py-1 bg-yellow-500/10 text-yellow-500 text-xs font-bold rounded">Live</div>
            </div>
            <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">AED 2,340</p>
            <p className="text-sm text-gray-400">Pending Payments</p>
            <p className="text-xs text-yellow-500 mt-1">{payments.filter(p => p.status === 'pending').length} transactions</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
                <X className="w-6 h-6 text-red-500" />
              </div>
              <div className="px-2 py-1 bg-red-500/10 text-red-500 text-xs font-bold rounded">Live</div>
            </div>
            <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">AED 156</p>
            <p className="text-sm text-gray-400">Failed Payments</p>
            <p className="text-xs text-red-500 mt-1">{payments.filter(p => p.status === 'failed').length} transactions</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-blue-500" />
              </div>
              <div className="px-2 py-1 bg-blue-500/10 text-blue-500 text-xs font-bold rounded">Live</div>
            </div>
            <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">AED 340</p>
            <p className="text-sm text-gray-400">Refunds Issued</p>
            <p className="text-xs text-blue-500 mt-1">3 refunds</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <TabsTrigger value="payments" className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4" />
            <span>Payments</span>
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4" />
            <span>Transactions</span>
          </TabsTrigger>
          <TabsTrigger value="wallets" className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Wallet Users</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* Pending Payments Section */}
        <TabsContent value="payments" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-[var(--sublimes-light-text)]">Pending Payments</h3>
            <Button variant="outline" className="text-sm">View All</Button>
          </div>
          
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-[var(--sublimes-gold)]/10 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-[var(--sublimes-gold)]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-[var(--sublimes-light-text)]">{payment.userName}</h4>
                    <p className="text-sm text-gray-400">{payment.description} • {payment.paymentMethod}</p>
                    <p className="text-xs text-gray-500">{payment.createdAt}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-[var(--sublimes-gold)]">AED {payment.amount}</p>
                    <Badge className={getStatusColor(payment.status)}>
                      {payment.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="w-8 h-8 p-0 text-green-500 hover:text-green-400 hover:bg-green-500/10"
                      onClick={() => handleApprovePayment(payment.id)}
                      title="Approve Payment"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="w-8 h-8 p-0 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                      onClick={() => handleRejectPayment(payment.id)}
                      title="Reject Payment"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="w-8 h-8 p-0 text-gray-400 hover:text-[var(--sublimes-light-text)] hover:bg-gray-500/10"
                      onClick={() => handleViewDetails(payment)}
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Recent Payment History */}
        <TabsContent value="transactions" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-[var(--sublimes-light-text)]">Recent Payment History</h3>
          </div>
          
          <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-lg overflow-hidden">
            <div className="grid grid-cols-7 gap-4 p-4 border-b border-[var(--sublimes-border)] bg-[var(--sublimes-dark-bg)] text-sm font-medium text-gray-400">
              <div>Transaction ID</div>
              <div>User</div>
              <div>Amount</div>
              <div>Type</div>
              <div>Date</div>
              <div>Status</div>
              <div>Actions</div>
            </div>
            
            {transactions.map((transaction) => (
              <div key={transaction.id} className="grid grid-cols-7 gap-4 p-4 border-b border-[var(--sublimes-border)] hover:bg-[var(--sublimes-dark-bg)]/50">
                <div className="font-medium text-[var(--sublimes-light-text)]">{transaction.id}</div>
                <div className="text-[var(--sublimes-light-text)]">{transaction.userName}</div>
                <div className="text-[var(--sublimes-gold)] font-medium">AED {transaction.amount}</div>
                <div className="capitalize">{transaction.description}</div>
                <div className="text-gray-400">{transaction.createdAt}</div>
                <div>
                  <Badge className={getStatusColor(transaction.status)}>
                    {transaction.status}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="w-6 h-6 p-0 text-gray-400 hover:text-[var(--sublimes-light-text)]"
                    onClick={() => handleViewDetails(transaction)}
                    title="View Details"
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="w-6 h-6 p-0 text-blue-400 hover:text-blue-300"
                    title="Refund"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="wallets" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-[var(--sublimes-light-text)]">Wallet Users</h3>
            <div className="flex items-center space-x-3">
              <Button variant="outline" className="text-sm">
                <Search className="w-4 h-4 mr-2" />
                Search Users
              </Button>
              <Button className="bg-blue-500 text-white hover:bg-blue-600">
                <Plus className="w-4 h-4 mr-2" />
                Create Wallet
              </Button>
            </div>
          </div>

          {/* Wallet Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-[var(--sublimes-light-text)]">1,247</p>
                    <p className="text-sm text-gray-400">Total Wallets</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-[var(--sublimes-light-text)]">1,189</p>
                    <p className="text-sm text-gray-400">Active Wallets</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-[var(--sublimes-gold)]">AED 45,892</p>
                    <p className="text-sm text-gray-400">Total Balance</p>
                  </div>
                  <div className="w-12 h-12 bg-[var(--sublimes-gold)]/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-[var(--sublimes-gold)]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-red-500">58</p>
                    <p className="text-sm text-gray-400">Suspended</p>
                  </div>
                  <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Wallet Users Table */}
          <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-lg overflow-hidden">
            <div className="grid grid-cols-6 gap-4 p-4 border-b border-[var(--sublimes-border)] bg-[var(--sublimes-dark-bg)] text-sm font-medium text-gray-400">
              <div>User</div>
              <div>Email</div>
              <div>Balance</div>
              <div>Total Credits</div>
              <div>Status</div>
              <div>Actions</div>
            </div>
            
            {wallets.map((wallet) => (
              <div key={wallet.id} className="grid grid-cols-6 gap-4 p-4 border-b border-[var(--sublimes-border)] hover:bg-[var(--sublimes-dark-bg)]/50">
                <div className="font-medium text-[var(--sublimes-light-text)]">{wallet.userName}</div>
                <div className="text-gray-400">{wallet.userEmail}</div>
                <div className="text-[var(--sublimes-gold)] font-medium">AED {wallet.currentBalance.toFixed(2)}</div>
                <div className="text-green-500">AED {wallet.totalCredits.toFixed(2)}</div>
                <div>
                  <Badge className={getStatusColor(wallet.status)}>
                    {wallet.status}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="w-6 h-6 p-0 text-gray-400 hover:text-[var(--sublimes-light-text)]"
                    onClick={() => handleViewDetails(wallet)}
                    title="View Details"
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="w-6 h-6 p-0 text-blue-400 hover:text-blue-300"
                    title="Edit Wallet"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="w-6 h-6 p-0 text-red-400 hover:text-red-300"
                    title="Suspend Wallet"
                  >
                    <AlertCircle className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-[var(--sublimes-light-text)]">Analytics Dashboard</h3>
            <div className="flex items-center space-x-3">
              <Select defaultValue="7days">
                <SelectTrigger className="w-32 bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                  <SelectItem value="1year">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="text-sm">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Analytics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-500" />
                  </div>
                  <div className="px-2 py-1 bg-green-500/10 text-green-500 text-xs font-bold rounded">+23.5%</div>
                </div>
                <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">AED 89,420</p>
                <p className="text-sm text-gray-400">Revenue This Month</p>
              </CardContent>
            </Card>

            <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="px-2 py-1 bg-blue-500/10 text-blue-500 text-xs font-bold rounded">+15.2%</div>
                </div>
                <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">2,847</p>
                <p className="text-sm text-gray-400">Total Transactions</p>
              </CardContent>
            </Card>

            <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <User className="w-6 h-6 text-purple-500" />
                  </div>
                  <div className="px-2 py-1 bg-purple-500/10 text-purple-500 text-xs font-bold rounded">+8.1%</div>
                </div>
                <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">1,247</p>
                <p className="text-sm text-gray-400">Active Users</p>
              </CardContent>
            </Card>

            <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-[var(--sublimes-gold)]/10 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-[var(--sublimes-gold)]" />
                  </div>
                  <div className="px-2 py-1 bg-red-500/10 text-red-500 text-xs font-bold rounded">-2.3%</div>
                </div>
                <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">AED 47.2</p>
                <p className="text-sm text-gray-400">Avg. Transaction</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
              <CardHeader>
                <CardTitle className="text-[var(--sublimes-light-text)]">Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <Activity className="w-12 h-12 mx-auto mb-4" />
                    <p>Revenue chart will be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
              <CardHeader>
                <CardTitle className="text-[var(--sublimes-light-text)]">Transaction Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-[var(--sublimes-light-text)]">Credits</span>
                    </div>
                    <div className="text-right">
                      <p className="text-[var(--sublimes-light-text)] font-medium">1,892</p>
                      <p className="text-sm text-gray-400">66.4%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-[var(--sublimes-light-text)]">Debits</span>
                    </div>
                    <div className="text-right">
                      <p className="text-[var(--sublimes-light-text)] font-medium">723</p>
                      <p className="text-sm text-gray-400">25.4%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-[var(--sublimes-light-text)]">Refunds</span>
                    </div>
                    <div className="text-right">
                      <p className="text-[var(--sublimes-light-text)] font-medium">232</p>
                      <p className="text-sm text-gray-400">8.2%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
            <CardHeader>
              <CardTitle className="text-[var(--sublimes-light-text)]">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-[var(--sublimes-dark-bg)] rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        transaction.type === 'credit' ? 'bg-green-500/10' : 
                        transaction.type === 'debit' ? 'bg-red-500/10' : 'bg-blue-500/10'
                      }`}>
                        {transaction.type === 'credit' ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : transaction.type === 'debit' ? (
                          <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />
                        ) : (
                          <RefreshCw className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-[var(--sublimes-light-text)] font-medium">{transaction.userName}</p>
                        <p className="text-sm text-gray-400">{transaction.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${
                        transaction.type === 'credit' ? 'text-green-500' : 
                        transaction.type === 'debit' ? 'text-red-500' : 'text-blue-500'
                      }`}>
                        {transaction.type === 'debit' ? '-' : '+'}AED {transaction.amount}
                      </p>
                      <p className="text-sm text-gray-400">{transaction.createdAt}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-[var(--sublimes-light-text)]">System Settings</h3>
              <p className="text-gray-400">Configure payment system and wallet settings</p>
            </div>
            <Button className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] hover:bg-[var(--sublimes-gold)]/90">
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Settings */}
            <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
              <CardHeader>
                <CardTitle className="text-[var(--sublimes-light-text)] flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-[var(--sublimes-light-text)]">Minimum Top-up Amount (AED)</Label>
                  <Input
                    type="number"
                    defaultValue="20"
                    className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                  />
                </div>
                <div>
                  <Label className="text-[var(--sublimes-light-text)]">Maximum Top-up Amount (AED)</Label>
                  <Input
                    type="number"
                    defaultValue="1000"
                    className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                  />
                </div>
                <div>
                  <Label className="text-[var(--sublimes-light-text)]">Transaction Fee (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    defaultValue="2.5"
                    className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-[var(--sublimes-light-text)]">Auto-approve payments under AED 100</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-[var(--sublimes-light-text)]">Enable instant refunds</Label>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Wallet Settings */}
            <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
              <CardHeader>
                <CardTitle className="text-[var(--sublimes-light-text)] flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Wallet Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-[var(--sublimes-light-text)]">Default Wallet Balance (AED)</Label>
                  <Input
                    type="number"
                    defaultValue="0"
                    className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                  />
                </div>
                <div>
                  <Label className="text-[var(--sublimes-light-text)]">Maximum Wallet Balance (AED)</Label>
                  <Input
                    type="number"
                    defaultValue="5000"
                    className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                  />
                </div>
                <div>
                  <Label className="text-[var(--sublimes-light-text)]">Minimum Bid Amount (AED)</Label>
                  <Input
                    type="number"
                    defaultValue="10"
                    className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-[var(--sublimes-light-text)]">Enable wallet-to-wallet transfers</Label>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-[var(--sublimes-light-text)]">Freeze wallets on suspicious activity</Label>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
              <CardHeader>
                <CardTitle className="text-[var(--sublimes-light-text)] flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-[var(--sublimes-light-text)]">Email notifications for failed payments</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-[var(--sublimes-light-text)]">SMS alerts for large transactions</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-[var(--sublimes-light-text)]">Push notifications for wallet updates</Label>
                  <Switch />
                </div>
                <div>
                  <Label className="text-[var(--sublimes-light-text)]">Large transaction threshold (AED)</Label>
                  <Input
                    type="number"
                    defaultValue="500"
                    className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
              <CardHeader>
                <CardTitle className="text-[var(--sublimes-light-text)] flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-[var(--sublimes-light-text)]">Require 2FA for admin actions</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-[var(--sublimes-light-text)]">Log all payment activities</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-[var(--sublimes-light-text)]">Enable fraud detection</Label>
                  <Switch defaultChecked />
                </div>
                <div>
                  <Label className="text-[var(--sublimes-light-text)]">Session timeout (minutes)</Label>
                  <Select defaultValue="30">
                    <SelectTrigger className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Information */}
          <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
            <CardHeader>
              <CardTitle className="text-[var(--sublimes-light-text)] flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[var(--sublimes-light-text)]">v2.1.0</p>
                  <p className="text-sm text-gray-400">System Version</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500">Online</p>
                  <p className="text-sm text-gray-400">Payment Gateway</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[var(--sublimes-gold)]">99.9%</p>
                  <p className="text-sm text-gray-400">Uptime</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Credit Dialog */}
      <Dialog open={isAddCreditDialogOpen} onOpenChange={setIsAddCreditDialogOpen}>
        <DialogContent className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[var(--sublimes-light-text)]">Add Credit Directly</DialogTitle>
            <DialogDescription>
              Manually add credits to a user's wallet for repair bidding.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>User ID</Label>
              <Input
                value={creditForm.userId}
                onChange={(e) => setCreditForm(prev => ({ ...prev, userId: e.target.value }))}
                placeholder="Enter user ID"
                className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)]"
              />
            </div>
            <div>
              <Label>User Name</Label>
              <Input
                value={creditForm.userName}
                onChange={(e) => setCreditForm(prev => ({ ...prev, userName: e.target.value }))}
                placeholder="Enter user name"
                className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)]"
              />
            </div>
            <div>
              <Label>User Email</Label>
              <Input
                value={creditForm.userEmail}
                onChange={(e) => setCreditForm(prev => ({ ...prev, userEmail: e.target.value }))}
                placeholder="Enter user email"
                className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)]"
              />
            </div>
            <div>
              <Label>Amount (AED)</Label>
              <Input
                type="number"
                value={creditForm.amount}
                onChange={(e) => setCreditForm(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="Enter amount"
                className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)]"
              />
            </div>
            <div>
              <Label>Credit Type</Label>
              <Select value={creditForm.type} onValueChange={(value: 'credit' | 'bonus') => setCreditForm(prev => ({ ...prev, type: value }))}>
                <SelectTrigger className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit">Regular Credit</SelectItem>
                  <SelectItem value="bonus">Bonus Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={creditForm.description}
                onChange={(e) => setCreditForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter description"
                className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)]"
              />
            </div>
            <div>
              <Label>Admin Notes (Optional)</Label>
              <Textarea
                value={creditForm.adminNotes}
                onChange={(e) => setCreditForm(prev => ({ ...prev, adminNotes: e.target.value }))}
                placeholder="Enter admin notes"
                className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)]"
                rows={2}
              />
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setIsAddCreditDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddCredit}
                className="flex-1 bg-green-500 text-white hover:bg-green-600"
              >
                Add Credit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={isViewDetailsDialogOpen} onOpenChange={setIsViewDetailsDialogOpen}>
        <DialogContent className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[var(--sublimes-light-text)]">Transaction Details</DialogTitle>
          </DialogHeader>
          {selectedItemDetails && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-400">ID</Label>
                  <p className="text-[var(--sublimes-light-text)]">{selectedItemDetails.id}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-400">User</Label>
                  <p className="text-[var(--sublimes-light-text)]">{selectedItemDetails.userName}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-400">Amount</Label>
                  <p className="text-[var(--sublimes-gold)] font-medium">AED {selectedItemDetails.amount}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-400">Status</Label>
                  <Badge className={getStatusColor(selectedItemDetails.status)}>
                    {selectedItemDetails.status}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm text-gray-400">Description</Label>
                <p className="text-[var(--sublimes-light-text)]">{selectedItemDetails.description}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-400">Date</Label>
                <p className="text-gray-400">{selectedItemDetails.createdAt}</p>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsViewDetailsDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}