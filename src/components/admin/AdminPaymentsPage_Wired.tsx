/**
 * AdminPaymentsPage_Wired - Payments & Transactions Management
 * Uses: useWallet, useAnalytics
 */

import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, CreditCard, CheckCircle, Download, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useAnalytics } from '../../src/hooks';

export function AdminPaymentsPage_Wired() {
  const analytics = useAnalytics();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    analytics.trackPageView('/admin/payments');
  }, []);

  const transactions = [
    { id: 'TXN001', user: 'Ahmed Hassan', amount: 250, type: 'boost', status: 'completed', date: '2024-01-24' },
    { id: 'TXN002', user: 'Mohammed Ali', amount: 150, type: 'listing', status: 'completed', date: '2024-01-24' },
    { id: 'TXN003', user: 'Sara Ahmed', amount: 75, type: 'boost', status: 'pending', date: '2024-01-24' },
  ];

  const filtered = transactions.filter((t) => {
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesQuery = !q || t.user.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl text-[#E8EAED]" style={{ fontWeight: 600 }}>
        Payments & Transactions
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <Card className="bg-[#0F1829] border-[#1A2332]">
          <CardContent className="p-4">
            <DollarSign className="text-green-500 mb-2" size={24} />
            <p className="text-sm text-[#8B92A7] mb-1">Total Revenue</p>
            <p className="text-2xl text-[#E8EAED]" style={{ fontWeight: 600 }}>AED 45.2K</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0F1829] border-[#1A2332]">
          <CardContent className="p-4">
            <TrendingUp className="text-blue-500 mb-2" size={24} />
            <p className="text-sm text-[#8B92A7] mb-1">This Month</p>
            <p className="text-2xl text-[#E8EAED]" style={{ fontWeight: 600 }}>AED 12.8K</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0F1829] border-[#1A2332]">
          <CardContent className="p-4">
            <CreditCard className="text-purple-500 mb-2" size={24} />
            <p className="text-sm text-[#8B92A7] mb-1">Transactions</p>
            <p className="text-2xl text-[#E8EAED]" style={{ fontWeight: 600 }}>234</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0F1829] border-[#1A2332]">
          <CardContent className="p-4">
            <CheckCircle className="text-[#D4AF37] mb-2" size={24} />
            <p className="text-sm text-[#8B92A7] mb-1">Success Rate</p>
            <p className="text-2xl text-[#E8EAED]" style={{ fontWeight: 600 }}>98.5%</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search by user, email, or transaction ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-[#0B1426] border-[#1A2332] text-[#E8EAED] placeholder:text-gray-500"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 bg-[#0B1426] border-[#1A2332] text-[#E8EAED]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent className="bg-[#0F1829] border-[#1A2332]">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Button className="bg-[#D4AF37] text-[#0B1426] hover:bg-[#C4A037]">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      <Card className="bg-[#0F1829] border-[#1A2332]">
        <CardHeader>
          <CardTitle className="text-xl text-[#E8EAED]">Recent Transactions ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-[#8B92A7]">No transactions found</div>
          ) : (
            <div className="space-y-3">
              {filtered.map((txn) => (
                <div key={txn.id} className="flex items-center justify-between p-4 bg-[#0B1426] rounded-lg border border-[#1A2332]">
                  <div>
                    <p className="text-sm text-[#E8EAED]" style={{ fontWeight: 600 }}>{txn.user}</p>
                    <p className="text-xs text-[#8B92A7]">{txn.id} • {txn.date}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className="bg-blue-500/20 text-blue-400">{txn.type}</Badge>
                    <p className="text-[#D4AF37]" style={{ fontWeight: 600 }}>AED {txn.amount}</p>
                    <Badge className={txn.status === 'completed' ? 'bg-green-500/20 text-green-400' : txn.status === 'failed' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}>
                      {txn.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
