import { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, CreditCard, Calendar, DollarSign, User, Search, Filter, Activity, Settings, TrendingUp, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DateRangeFilter } from './DateRangeFilter';
import { SelectableRow } from './BulkActionControls';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
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

export function AdminRepairBidPage() {
  const [activeTab, setActiveTab] = useState<'payments' | 'transactions' | 'wallets' | 'analytics' | 'settings'>('payments');
  
  // Mock data
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
    },
    {
      id: 'wallet_002',
      userId: 'user_002',
      userName: 'Sara Al-Rashid',
      userEmail: 'sara@email.com',
      currentBalance: 100.00,
      totalCredits: 250.00,
      totalDebits: 150.00,
      status: 'active',
      lastActivity: '2024-01-14T15:45:00Z'
    }
  ]);

  const [transactions, setTransactions] = useState<BidTransaction[]>([
    {
      id: 'txn_001',
      userId: 'user_001',
      userName: 'Ahmed Hassan',
      userEmail: 'ahmed@email.com',
      type: 'credit',
      amount: 100.00,
      balance: 225.50,
      description: 'Wallet top-up via Stripe',
      status: 'completed',
      referenceId: 'stripe_pi_123',
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 'txn_002',
      userId: 'user_001',
      userName: 'Ahmed Hassan',
      userEmail: 'ahmed@email.com',
      type: 'debit',
      amount: 25.00,
      balance: 125.50,
      description: 'Bid placed on BMW X5 brake repair',
      status: 'completed',
      referenceId: 'bid_456',
      createdAt: '2024-01-15T12:15:00Z'
    }
  ]);

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
      createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
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
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      description: 'Wallet Top-up'
    }
  ]);

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreditDialogOpen, setIsCreditDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<BidTransaction | null>(null);

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

  // Bulk selection handlers
  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = (selectAll: boolean) => {
    const currentData = getCurrentData();
    if (selectAll) {
      setSelectedItems(currentData.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'payments': return payments;
      case 'transactions': return transactions;
      case 'wallets': return wallets;
      default: return [];
    }
  };

  const isSelectAllChecked = () => {
    const currentData = getCurrentData();
    return selectedItems.length === currentData.length && currentData.length > 0;
  };

  // Export functionality
  const handleExportSelected = (selectedIds: string[], dateRange: { from: string; to: string }) => {
    const dataToExport = getCurrentData();
    const itemsToExport = selectedIds.length > 0 
      ? dataToExport.filter(item => selectedIds.includes(item.id))
      : dataToExport;
    
    // Apply date filter if provided
    let filteredItems = itemsToExport;
    if (dateRange?.from || dateRange?.to) {
      filteredItems = itemsToExport.filter(item => {
        const itemDate = new Date(item.createdAt || (item as any).lastActivity);
        const fromDate = dateRange.from ? new Date(dateRange.from) : null;
        const toDate = dateRange.to ? new Date(dateRange.to) : null;
        
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
          new Date(payment.createdAt).toLocaleDateString()
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
          new Date(transaction.createdAt).toLocaleDateString()
        ].join(',');
      });
    }

    const csvContent = [headers.join(','), ...csvRows].join('\\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success(`Exported ${filteredItems.length} items successfully`);
  };

  // CRUD operations
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
      id: `txn_${Date.now()}`,
      userId: creditForm.userId,
      userName: creditForm.userName,
      userEmail: creditForm.userEmail,
      type: creditForm.type,
      amount,
      balance: 0,
      description: creditForm.description,
      status: 'completed',
      createdAt: new Date().toISOString(),
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

    setIsCreditDialogOpen(false);
    toast.success(`Successfully added ${amount} AED credit to ${creditForm.userName}'s wallet`);
  };

  // Filter current data
  const filteredData = getCurrentData().filter(item => {
    const matchesSearch = 
      (item as any).userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item as any).userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item as any).description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const status = (item as any).status;
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
        <Button 
          onClick={() => setIsCreditDialogOpen(true)}
          className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] hover:bg-[var(--sublimes-gold)]/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Credit
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <div className="px-2 py-1 bg-green-500/10 text-green-500 text-xs font-bold rounded">Live</div>
            </div>
            <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">AED 24,890</p>
            <p className="text-sm text-gray-400">Total Revenue</p>
            <p className="text-xs text-green-500 mt-1">+12% vs last month</p>
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
            <p className="text-xs text-yellow-500 mt-1">8 transactions</p>
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
            <p className="text-xs text-red-500 mt-1">2 transactions</p>
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

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by user name, email, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
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

        {/* Date Range Filter with Bulk Actions */}
        <div className="mt-6">
          <DateRangeFilter
            selectedItems={selectedItems}
            onSelectItem={handleSelectItem}
            onSelectAll={handleSelectAll}
            allItems={filteredData}
            onExportData={handleExportSelected}
            isSelectAllChecked={isSelectAllChecked()}
            title={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          />
        </div>

        {/* Tab Contents */}
        <TabsContent value="payments" className="space-y-4">
          <h3 className="text-lg font-medium text-[var(--sublimes-light-text)] mb-4">Pending Payments</h3>
          {payments.map((payment) => (
            <SelectableRow
              key={payment.id}
              id={payment.id}
              isSelected={selectedItems.includes(payment.id)}
              onSelect={handleSelectItem}
            >
              <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-[var(--sublimes-gold)]/10 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-[var(--sublimes-gold)]" />
                      </div>
                      <div>
                        <h4 className="font-medium text-[var(--sublimes-light-text)]">{payment.userName}</h4>
                        <p className="text-sm text-gray-400">{payment.description} • {payment.paymentMethod}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(payment.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[var(--sublimes-gold)]">AED {payment.amount}</p>
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="ghost" className="text-green-500 hover:text-green-400">
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-400">
                        <X className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SelectableRow>
          ))}
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          {transactions.map((transaction) => (
            <SelectableRow
              key={transaction.id}
              id={transaction.id}
              isSelected={selectedItems.includes(transaction.id)}
              onSelect={handleSelectItem}
            >
              <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-medium text-[var(--sublimes-light-text)]">{transaction.userName}</h3>
                        <Badge className={getStatusColor(transaction.type)}>
                          {transaction.type}
                        </Badge>
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400 mb-1">{transaction.description}</p>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-400">
                          Amount: <span className={`font-medium ${
                            transaction.type === 'debit' ? 'text-red-500' : 'text-green-500'
                          }`}>
                            {transaction.type === 'debit' ? '-' : '+'}AED {transaction.amount.toFixed(2)}
                          </span>
                        </span>
                        <span className="text-sm text-gray-400">
                          Balance: <span className="text-[var(--sublimes-gold)]">AED {transaction.balance.toFixed(2)}</span>
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(transaction.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {transaction.adminNotes && (
                        <p className="text-xs text-blue-400 mt-1">Note: {transaction.adminNotes}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingTransaction(transaction);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SelectableRow>
          ))}
        </TabsContent>

        <TabsContent value="wallets" className="space-y-4">
          {wallets.map((wallet) => (
            <SelectableRow
              key={wallet.id}
              id={wallet.id}
              isSelected={selectedItems.includes(wallet.id)}
              onSelect={handleSelectItem}
            >
              <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-[var(--sublimes-light-text)]">{wallet.userName}</h3>
                      <p className="text-sm text-gray-400">{wallet.userEmail}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm text-gray-400">
                          Balance: <span className="text-[var(--sublimes-gold)] font-medium">AED {wallet.currentBalance.toFixed(2)}</span>
                        </span>
                        <span className="text-sm text-gray-400">
                          Total Credits: <span className="text-green-500">AED {wallet.totalCredits.toFixed(2)}</span>
                        </span>
                        <span className="text-sm text-gray-400">
                          Total Debits: <span className="text-red-500">AED {wallet.totalDebits.toFixed(2)}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(wallet.status)}>
                        {wallet.status}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {new Date(wallet.lastActivity).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SelectableRow>
          ))}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[var(--sublimes-light-text)] mb-2">Analytics Dashboard</h3>
            <p className="text-gray-400">Detailed analytics and reporting tools will be available here.</p>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="text-center py-12">
            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[var(--sublimes-light-text)] mb-2">System Settings</h3>
            <p className="text-gray-400">Configuration options and system settings will be available here.</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Credit Dialog */}
      <Dialog open={isCreditDialogOpen} onOpenChange={setIsCreditDialogOpen}>
        <DialogContent className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[var(--sublimes-light-text)]">Add Credit to User Wallet</DialogTitle>
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
                onClick={() => setIsCreditDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddCredit}
                className="flex-1 bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]"
              >
                Add Credit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}