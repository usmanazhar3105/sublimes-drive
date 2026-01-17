import { useState } from 'react';
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
  BarChart3
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export function AdminBidManagementPage() {
  const [selectedTab, setSelectedTab] = useState('payments');

  const pendingPayments = [
    {
      id: 'PAY-001',
      user: 'Ahmed Hassan',
      amount: 'AED 50',
      type: 'Wallet Top-up',
      method: 'Credit Card',
      time: '2 minutes ago',
      status: 'Pending',
    },
    {
      id: 'PAY-002',
      user: 'Sara Al-Rashid',
      amount: 'AED 100',
      type: 'Wallet Top-up',
      method: 'Bank Transfer',
      time: '15 minutes ago',
      status: 'Processing',
    },
  ];

  const transactions = [
    ['TXN-001', 'Ahmed Hassan', 'AED 50', 'Top-up', '2024-01-15', 'Completed'],
    ['TXN-002', 'Sara Al-Rashid', 'AED 100', 'Top-up', '2024-01-14', 'Completed'],
    ['TXN-003', 'Mohammed Ali', 'AED 25', 'Refund', '2024-01-13', 'Completed'],
    ['TXN-004', 'Fatima Ahmed', 'AED 75', 'Top-up', '2024-01-12', 'Failed'],
    ['TXN-005', 'Omar Hassan', 'AED 200', 'Top-up', '2024-01-11', 'Completed'],
  ];

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

  const PaymentItem = ({ payment }: any) => (
    <div className="flex items-center justify-between p-4 border-t border-[var(--sublimes-border)]">
      <div className="flex items-center space-x-4">
        <div className="p-2 bg-[var(--sublimes-gold)]/10 rounded-lg">
          <CreditCard className="h-4 w-4 text-[var(--sublimes-gold)]" />
        </div>
        <div>
          <div className="font-medium text-[var(--sublimes-light-text)]">{payment.user}</div>
          <div className="text-sm text-gray-400">{payment.type} • {payment.method}</div>
          <div className="text-xs text-gray-500">{payment.time}</div>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <div className="font-bold text-[var(--sublimes-gold)]">{payment.amount}</div>
          <Badge variant="outline" className="text-xs border-orange-500 text-orange-500">
            {payment.status}
          </Badge>
        </div>
        <div className="flex space-x-1">
          <Button size="sm" variant="outline" className="p-1 h-8 w-8">
            <Check className="h-3 w-3 text-green-500" />
          </Button>
          <Button size="sm" variant="outline" className="p-1 h-8 w-8">
            <X className="h-3 w-3 text-red-500" />
          </Button>
          <Button size="sm" variant="outline" className="p-1 h-8 w-8">
            <Eye className="h-3 w-3 text-gray-400" />
          </Button>
        </div>
      </div>
    </div>
  );

  const TableRow = ({ transaction, index }: any) => (
    <div className="grid grid-cols-7 gap-4 p-4 border-b border-[var(--sublimes-border)]/30 items-center">
      <div className="text-sm font-medium text-[var(--sublimes-light-text)]">{transaction[0]}</div>
      <div className="text-sm text-[var(--sublimes-light-text)]">{transaction[1]}</div>
      <div className="text-sm font-medium text-[var(--sublimes-gold)]">{transaction[2]}</div>
      <div className="text-sm text-[var(--sublimes-light-text)]">{transaction[3]}</div>
      <div className="text-sm text-gray-400">{transaction[4]}</div>
      <div className="text-center">
        <Badge
          variant={transaction[5] === 'Completed' ? 'default' : 'destructive'}
          className={`text-xs ${
            transaction[5] === 'Completed' 
              ? 'bg-green-500/10 text-green-500 border-green-500/30' 
              : 'bg-red-500/10 text-red-500 border-red-500/30'
          }`}
        >
          {transaction[5]}
        </Badge>
      </div>
      <div className="flex space-x-1">
        <Button size="sm" variant="outline" className="p-1 h-6 w-6">
          <Eye className="h-3 w-3 text-gray-400" />
        </Button>
        <Button size="sm" variant="outline" className="p-1 h-6 w-6">
          <RefreshCw className="h-3 w-3 text-blue-400" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-[var(--sublimes-dark-bg)] min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--sublimes-light-text)] mb-2">Bid Repair Management</h1>
            <p className="text-gray-400">Manage payments, transactions, and wallet system</p>
          </div>
          <div className="flex space-x-3">
            <Button className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] hover:bg-[var(--sublimes-gold)]/80">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button className="bg-green-500 text-white hover:bg-green-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Credit
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <TabsTrigger value="payments" className="data-[state=active]:bg-[var(--sublimes-gold)] data-[state=active]:text-[var(--sublimes-dark-bg)]">
            <CreditCard className="h-4 w-4 mr-2" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="transactions" className="data-[state=active]:bg-[var(--sublimes-gold)] data-[state=active]:text-[var(--sublimes-dark-bg)]">
            <DollarSign className="h-4 w-4 mr-2" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-[var(--sublimes-gold)] data-[state=active]:text-[var(--sublimes-dark-bg)]">
            <Users className="h-4 w-4 mr-2" />
            Wallet Users
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-[var(--sublimes-gold)] data-[state=active]:text-[var(--sublimes-dark-bg)]">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-[var(--sublimes-gold)] data-[state=active]:text-[var(--sublimes-dark-bg)]">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              title="Total Revenue"
              value="AED 24,890"
              subtitle="+12% vs last month"
              icon={TrendingUp}
              color="#10B981"
            />
            <StatCard
              title="Pending Payments"
              value="AED 2,340"
              subtitle="8 transactions"
              icon={AlertCircle}
              color="#F59E0B"
            />
            <StatCard
              title="Failed Payments"
              value="AED 156"
              subtitle="2 transactions"
              icon={X}
              color="#EF4444"
            />
            <StatCard
              title="Refunds Issued"
              value="AED 340"
              subtitle="3 refunds"
              icon={RefreshCw}
              color="#3B82F6"
            />
          </div>

          {/* Pending Payments */}
          <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-[var(--sublimes-light-text)]">Pending Payments</CardTitle>
                <Button variant="outline" size="sm">View All</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {pendingPayments.map((payment) => (
                <PaymentItem key={payment.id} payment={payment} />
              ))}
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
            <CardHeader>
              <CardTitle className="text-[var(--sublimes-light-text)]">Recent Payment History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Table Header */}
              <div className="grid grid-cols-7 gap-4 p-4 border-b border-[var(--sublimes-border)] bg-[var(--sublimes-dark-bg)]">
                <div className="text-sm font-medium text-gray-400">Transaction ID</div>
                <div className="text-sm font-medium text-gray-400">User</div>
                <div className="text-sm font-medium text-gray-400">Amount</div>
                <div className="text-sm font-medium text-gray-400">Type</div>
                <div className="text-sm font-medium text-gray-400">Date</div>
                <div className="text-sm font-medium text-gray-400 text-center">Status</div>
                <div className="text-sm font-medium text-gray-400">Actions</div>
              </div>
              {/* Table Rows */}
              {transactions.map((transaction, index) => (
                <TableRow key={index} transaction={transaction} index={index} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              title="Total Transactions"
              value="1,247"
              subtitle="This month"
              icon={DollarSign}
              color="#10B981"
            />
            <StatCard
              title="Processing"
              value="23"
              subtitle="Pending approval"
              icon={RefreshCw}
              color="#F59E0B"
            />
            <StatCard
              title="Failed Transactions"
              value="8"
              subtitle="Need attention"
              icon={AlertCircle}
              color="#EF4444"
            />
            <StatCard
              title="Success Rate"
              value="97.2%"
              subtitle="+1.2% vs last month"
              icon={Check}
              color="#8B5CF6"
            />
          </div>

          {/* Advanced Transaction Search */}
          <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
            <CardHeader>
              <CardTitle className="text-[var(--sublimes-light-text)]">Transaction Search & Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  placeholder="Search by ID, user, or amount"
                  className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                />
                <select className="px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] text-[var(--sublimes-light-text)] rounded-md">
                  <option>All Statuses</option>
                  <option>Completed</option>
                  <option>Failed</option>
                  <option>Processing</option>
                </select>
                <Input
                  type="date"
                  className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                />
                <Button className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]">
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* All Transactions */}
          <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-[var(--sublimes-light-text)]">All Transactions</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-7 gap-4 p-4 border-b border-[var(--sublimes-border)] bg-[var(--sublimes-dark-bg)]">
                <div className="text-sm font-medium text-gray-400">Transaction ID</div>
                <div className="text-sm font-medium text-gray-400">User</div>
                <div className="text-sm font-medium text-gray-400">Amount</div>
                <div className="text-sm font-medium text-gray-400">Type</div>
                <div className="text-sm font-medium text-gray-400">Date</div>
                <div className="text-sm font-medium text-gray-400 text-center">Status</div>
                <div className="text-sm font-medium text-gray-400">Actions</div>
              </div>
              {transactions.map((transaction, index) => (
                <TableRow key={index} transaction={transaction} index={index} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          {/* User Wallet Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              title="Total Users"
              value="3,456"
              subtitle="With wallets"
              icon={Users}
              color="#3B82F6"
            />
            <StatCard
              title="Active Wallets"
              value="2,890"
              subtitle="Used this month"
              icon={CreditCard}
              color="#10B981"
            />
            <StatCard
              title="Total Balance"
              value="AED 45,230"
              subtitle="In user wallets"
              icon={DollarSign}
              color="#D4AF37"
            />
            <StatCard
              title="Average Balance"
              value="AED 156"
              subtitle="Per active wallet"
              icon={TrendingUp}
              color="#8B5CF6"
            />
          </div>

          {/* Top Users by Wallet Activity */}
          <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
            <CardHeader>
              <CardTitle className="text-[var(--sublimes-light-text)]">Top Wallet Users</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-6 gap-4 p-4 border-b border-[var(--sublimes-border)] bg-[var(--sublimes-dark-bg)]">
                <div className="text-sm font-medium text-gray-400">User</div>
                <div className="text-sm font-medium text-gray-400">Current Balance</div>
                <div className="text-sm font-medium text-gray-400">Total Topped Up</div>
                <div className="text-sm font-medium text-gray-400">Last Activity</div>
                <div className="text-sm font-medium text-gray-400">Status</div>
                <div className="text-sm font-medium text-gray-400">Actions</div>
              </div>
              {[
                ['Ahmed Hassan', 'AED 245', 'AED 1,250', '2 hours ago', 'Active'],
                ['Sara Al-Rashid', 'AED 189', 'AED 890', '1 day ago', 'Active'],
                ['Mohammed Ali', 'AED 567', 'AED 2,340', '3 days ago', 'Active'],
                ['Fatima Ahmed', 'AED 78', 'AED 450', '5 days ago', 'Inactive'],
                ['Omar Hassan', 'AED 1,234', 'AED 4,567', '6 hours ago', 'VIP']
              ].map((user, index) => (
                <div key={index} className="grid grid-cols-6 gap-4 p-4 border-b border-[var(--sublimes-border)]/30 items-center">
                  <div className="text-sm font-medium text-[var(--sublimes-light-text)]">{user[0]}</div>
                  <div className="text-sm font-medium text-[var(--sublimes-gold)]">{user[1]}</div>
                  <div className="text-sm text-[var(--sublimes-light-text)]">{user[2]}</div>
                  <div className="text-sm text-gray-400">{user[3]}</div>
                  <div>
                    <Badge
                      className={`text-xs ${
                        user[4] === 'Active' ? 'bg-green-500/10 text-green-500' :
                        user[4] === 'VIP' ? 'bg-[var(--sublimes-gold)]/10 text-[var(--sublimes-gold)]' :
                        'bg-gray-500/10 text-gray-500'
                      }`}
                    >
                      {user[4]}
                    </Badge>
                  </div>
                  <div className="flex space-x-1">
                    <Button size="sm" variant="outline" className="p-1 h-6 w-6">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="p-1 h-6 w-6">
                      <Plus className="h-3 w-3 text-green-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              title="Monthly Revenue"
              value="AED 24,890"
              subtitle="+18.3% vs last month"
              icon={TrendingUp}
              color="#10B981"
            />
            <StatCard
              title="Transaction Volume"
              value="AED 156,780"
              subtitle="This month"
              icon={DollarSign}
              color="#3B82F6"
            />
            <StatCard
              title="Processing Fee"
              value="AED 2,344"
              subtitle="Platform commission"
              icon={CreditCard}
              color="#D4AF37"
            />
            <StatCard
              title="Growth Rate"
              value="24.7%"
              subtitle="Month over month"
              icon={BarChart3}
              color="#8B5CF6"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
              <CardHeader>
                <CardTitle className="text-[var(--sublimes-light-text)]">Revenue Trend (Last 6 Months)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-[var(--sublimes-border)] rounded-lg">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-400">Revenue chart would be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
              <CardHeader>
                <CardTitle className="text-[var(--sublimes-light-text)]">Transaction Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-[var(--sublimes-border)] rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-400">Distribution chart would be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Settings */}
            <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
              <CardHeader>
                <CardTitle className="text-[var(--sublimes-light-text)]">Payment Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Minimum Top-up Amount (AED)</label>
                  <Input 
                    defaultValue="25"
                    className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Maximum Top-up Amount (AED)</label>
                  <Input 
                    defaultValue="5000"
                    className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Processing Fee (%)</label>
                  <Input 
                    defaultValue="2.5"
                    className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                  />
                </div>
                <Button className="w-full bg-green-500 text-white">
                  Save Payment Settings
                </Button>
              </CardContent>
            </Card>

            {/* Bid System Settings */}
            <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
              <CardHeader>
                <CardTitle className="text-[var(--sublimes-light-text)]">Bid System Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Minimum Bid Amount (AED)</label>
                  <Input 
                    defaultValue="50"
                    className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Bid Duration (hours)</label>
                  <Input 
                    defaultValue="48"
                    className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Auto-refund Failed Bids</label>
                  <select className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] text-[var(--sublimes-light-text)] rounded-md">
                    <option>Enabled</option>
                    <option>Disabled</option>
                  </select>
                </div>
                <Button className="w-full bg-green-500 text-white">
                  Save Bid Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}