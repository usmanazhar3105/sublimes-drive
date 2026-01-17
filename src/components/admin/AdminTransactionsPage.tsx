import { useState } from 'react';
import { 
  CreditCard, 
  Download, 
  Filter, 
  Search,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Eye,
  ArrowUpDown,
  Car,
  Settings,
  Wrench,
  Wallet
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { DateRangeFilter } from './DateRangeFilter';
import { toast } from 'sonner';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  type: 'car-listing' | 'parts-listing' | 'garage-listing' | 'bid-wallet' | 'boost' | 'offer';
  userId: string;
  userEmail: string;
  userName: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  paymentMethod: 'stripe' | 'apple-pay' | 'google-pay';
  paymentReference: string;
  createdAt: Date;
  description: string;
  listingId?: string;
  refundAmount?: number;
  refundedAt?: Date;
}

export function AdminTransactionsPage() {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('30');

  // Mock transaction data
  const [transactions] = useState<Transaction[]>([
    {
      id: 'txn_001',
      type: 'car-listing',
      userId: 'user_123',
      userEmail: 'ahmad@example.com',
      userName: 'Ahmad Al-Rashid',
      amount: 50,
      currency: 'AED',
      status: 'completed',
      paymentMethod: 'stripe',
      paymentReference: 'pi_1234567890',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      description: 'Car listing payment - BMW X5 2023',
      listingId: 'car_456'
    },
    {
      id: 'txn_002',
      type: 'garage-listing',
      userId: 'garage_789',
      userEmail: 'garage@emirates.ae',
      userName: 'Emirates Auto Center',
      amount: 100,
      currency: 'AED',
      status: 'completed',
      paymentMethod: 'apple-pay',
      paymentReference: 'ap_9876543210',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      description: 'Garage Hub listing payment',
      listingId: 'garage_111'
    },
    {
      id: 'txn_003',
      type: 'bid-wallet',
      userId: 'garage_456',
      userEmail: 'fastfix@garage.ae',
      userName: 'Fast Fix Auto',
      amount: 250,
      currency: 'AED',
      status: 'completed',
      paymentMethod: 'google-pay',
      paymentReference: 'gp_1122334455',
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      description: 'Bid wallet top-up - 250 AED credits'
    },
    {
      id: 'txn_004',
      type: 'parts-listing',
      userId: 'user_789',
      userEmail: 'omar@example.com',
      userName: 'Omar Hassan',
      amount: 25,
      currency: 'AED',
      status: 'failed',
      paymentMethod: 'stripe',
      paymentReference: 'pi_failed_123',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      description: 'Car parts listing payment - Mercedes brake pads'
    },
    {
      id: 'txn_005',
      type: 'car-listing',
      userId: 'user_321',
      userEmail: 'mohammed@example.com',
      userName: 'Mohammed Abdullah',
      amount: 50,
      currency: 'AED',
      status: 'refunded',
      paymentMethod: 'stripe',
      paymentReference: 'pi_0987654321',
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
      description: 'Car listing payment - Toyota Camry 2022',
      listingId: 'car_789',
      refundAmount: 50,
      refundedAt: new Date(Date.now() - 36 * 60 * 60 * 1000)
    }
  ]);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesSearch = searchTerm === '' || 
      transaction.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.paymentReference.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesType && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-orange-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'refunded': return <RefreshCw className="w-4 h-4 text-blue-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500 bg-green-500/10';
      case 'pending': return 'text-orange-500 bg-orange-500/10';
      case 'failed': return 'text-red-500 bg-red-500/10';
      case 'refunded': return 'text-blue-500 bg-blue-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'car-listing': return <Car className="w-4 h-4" />;
      case 'parts-listing': return <Settings className="w-4 h-4" />;
      case 'garage-listing': return <Wrench className="w-4 h-4" />;
      case 'bid-wallet': return <Wallet className="w-4 h-4" />;
      default: return <CreditCard className="w-4 h-4" />;
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const exportTransactions = () => {
    const headers = ['Transaction ID', 'Type', 'User', 'Email', 'Amount', 'Status', 'Payment Method', 'Date', 'Description'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(transaction => [
        transaction.id,
        transaction.type,
        `"${transaction.userName}"`,
        transaction.userEmail,
        `${transaction.amount} ${transaction.currency}`,
        transaction.status,
        transaction.paymentMethod,
        transaction.createdAt.toISOString().split('T')[0],
        `"${transaction.description}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Transactions exported successfully');
  };

  // Calculate totals
  const totalRevenue = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const todayRevenue = transactions
    .filter(t => t.status === 'completed' && 
      new Date(t.createdAt).toDateString() === new Date().toDateString())
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="p-6 bg-[var(--sublimes-dark-bg)]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[var(--sublimes-light-text)]">Transactions</h1>
            <p className="text-gray-400 mt-1">View and manage all payment transactions</p>
          </div>
          <Button
            onClick={exportTransactions}
            className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] hover:bg-[var(--sublimes-gold)]/90"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-[var(--sublimes-light-text)]">
                  {formatAmount(totalRevenue, 'AED')}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Today's Revenue</p>
                <p className="text-2xl font-bold text-[var(--sublimes-light-text)]">
                  {formatAmount(todayRevenue, 'AED')}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <ArrowUpDown className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Completed</p>
                <p className="text-2xl font-bold text-[var(--sublimes-light-text)]">
                  {transactions.filter(t => t.status === 'completed').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Failed/Pending</p>
                <p className="text-2xl font-bold text-[var(--sublimes-light-text)]">
                  {transactions.filter(t => t.status === 'failed' || t.status === 'pending').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] focus:ring-2 focus:ring-[var(--sublimes-gold)]"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] focus:ring-2 focus:ring-[var(--sublimes-gold)]"
          >
            <option value="all">All Types</option>
            <option value="car-listing">Car Listings</option>
            <option value="parts-listing">Parts Listings</option>
            <option value="garage-listing">Garage Listings</option>
            <option value="bid-wallet">Bid Wallet</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] focus:ring-2 focus:ring-[var(--sublimes-gold)]"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--sublimes-border)]">
                <th className="text-left py-4 px-6 text-[var(--sublimes-light-text)] font-medium">Transaction</th>
                <th className="text-left py-4 px-6 text-[var(--sublimes-light-text)] font-medium">User</th>
                <th className="text-left py-4 px-6 text-[var(--sublimes-light-text)] font-medium">Type</th>
                <th className="text-left py-4 px-6 text-[var(--sublimes-light-text)] font-medium">Amount</th>
                <th className="text-left py-4 px-6 text-[var(--sublimes-light-text)] font-medium">Status</th>
                <th className="text-left py-4 px-6 text-[var(--sublimes-light-text)] font-medium">Date</th>
                <th className="text-left py-4 px-6 text-[var(--sublimes-light-text)] font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-[var(--sublimes-border)] hover:bg-[var(--sublimes-dark-bg)]/50">
                  <td className="py-4 px-6">
                    <div>
                      <p className="text-[var(--sublimes-light-text)] font-medium">{transaction.id}</p>
                      <p className="text-gray-400 text-sm">{transaction.paymentReference}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="text-[var(--sublimes-light-text)] font-medium">{transaction.userName}</p>
                      <p className="text-gray-400 text-sm">{transaction.userEmail}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(transaction.type)}
                      <span className="text-[var(--sublimes-light-text)] capitalize">
                        {transaction.type.replace('-', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-[var(--sublimes-light-text)] font-medium">
                      {formatAmount(transaction.amount, transaction.currency)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className={`flex items-center space-x-2 px-2 py-1 rounded-full ${getStatusColor(transaction.status)}`}>
                      {getStatusIcon(transaction.status)}
                      <span className="text-sm font-medium capitalize">{transaction.status}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-gray-400 text-sm">{formatDateTime(transaction.createdAt)}</span>
                  </td>
                  <td className="py-4 px-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedTransaction(transaction)}
                      className="border-[var(--sublimes-border)] text-[var(--sublimes-light-text)] hover:bg-[var(--sublimes-dark-bg)]"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent className="max-w-2xl bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--sublimes-light-text)]">Transaction Details</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-[var(--sublimes-light-text)] mb-3">Transaction Info</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">ID:</span>
                      <span className="text-[var(--sublimes-light-text)]">{selectedTransaction.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Reference:</span>
                      <span className="text-[var(--sublimes-light-text)]">{selectedTransaction.paymentReference}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Amount:</span>
                      <span className="text-[var(--sublimes-light-text)] font-medium">
                        {formatAmount(selectedTransaction.amount, selectedTransaction.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded ${getStatusColor(selectedTransaction.status)}`}>
                        {getStatusIcon(selectedTransaction.status)}
                        <span className="text-sm capitalize">{selectedTransaction.status}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-[var(--sublimes-light-text)] mb-3">User Info</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Name:</span>
                      <span className="text-[var(--sublimes-light-text)]">{selectedTransaction.userName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Email:</span>
                      <span className="text-[var(--sublimes-light-text)]">{selectedTransaction.userEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">User ID:</span>
                      <span className="text-[var(--sublimes-light-text)]">{selectedTransaction.userId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Payment Method:</span>
                      <span className="text-[var(--sublimes-light-text)] capitalize">
                        {selectedTransaction.paymentMethod.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-[var(--sublimes-light-text)] mb-2">Description</h3>
                <p className="text-gray-400">{selectedTransaction.description}</p>
              </div>

              {selectedTransaction.status === 'refunded' && selectedTransaction.refundedAt && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <h3 className="font-medium text-blue-400 mb-2">Refund Information</h3>
                  <div className="space-y-1">
                    <p className="text-gray-400">
                      Refund Amount: <span className="text-[var(--sublimes-light-text)]">
                        {formatAmount(selectedTransaction.refundAmount!, selectedTransaction.currency)}
                      </span>
                    </p>
                    <p className="text-gray-400">
                      Refunded At: <span className="text-[var(--sublimes-light-text)]">
                        {formatDateTime(selectedTransaction.refundedAt)}
                      </span>
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedTransaction(null)}
                  className="border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                >
                  Close
                </Button>
                {selectedTransaction.status === 'completed' && (
                  <Button
                    onClick={() => {
                      toast.info('Refund process would be initiated here');
                      setSelectedTransaction(null);
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    Process Refund
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}