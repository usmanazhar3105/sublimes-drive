/**
 * Admin Bid Repair Management - Complete Bid System Management
 * 
 * Wired to Supabase:
 * - bid_repair table
 * - bid_repair_replies table
 * - bid_wallet table
 * - wallet_transactions table
 * - messages table
 */

import { useState, useEffect } from 'react';
import {
  Wrench,
  MessageSquare,
  Wallet,
  TrendingUp,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  User,
  Car,
  RefreshCw,
  Search,
  Filter,
  Download
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { toast } from 'sonner';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

interface BidRepair {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  vehicle_info: any;
  images: string[];
  location: any;
  status: 'open' | 'accepted' | 'closed' | 'cancelled';
  accepted_reply_id: string | null;
  views_count: number;
  replies_count: number;
  created_at: string;
  updated_at: string;
  owner: {
    display_name: string;
    email: string;
    sub_role: string;
  };
}

interface BidReply {
  id: string;
  bid_id: string;
  garage_owner_id: string;
  message: string;
  quote_amount: number;
  estimated_time: string;
  warranty_offered: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  created_at: string;
  garage_owner: {
    display_name: string;
    email: string;
  };
}

interface WalletInfo {
  id: string;
  garage_owner_id: string;
  balance: number;
  total_earned: number;
  total_spent: number;
  last_topup: string | null;
  garage_owner: {
    display_name: string;
    email: string;
  };
}

export function AdminBidRepairManagement() {
  const [activeTab, setActiveTab] = useState<'bids' | 'wallets' | 'transactions'>('bids');
  const [bids, setBids] = useState<BidRepair[]>([]);
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Modal states
  const [selectedBid, setSelectedBid] = useState<BidRepair | null>(null);
  const [bidReplies, setBidReplies] = useState<BidReply[]>([]);
  const [showBidModal, setShowBidModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<WalletInfo | null>(null);

  // Statistics
  const [stats, setStats] = useState({
    totalBids: 0,
    openBids: 0,
    acceptedBids: 0,
    closedBids: 0,
    totalWalletBalance: 0,
    totalTransactions: 0
  });

  // Fetch bids
  const fetchBids = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('bid_repair')
        .select(`
          *,
          owner:profiles!bid_repair_owner_id_fkey(display_name, email, sub_role)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setBids(data || []);

      // Calculate stats
      const { data: allBids } = await supabase
        .from('bid_repair')
        .select('status');

      if (allBids) {
        setStats(prev => ({
          ...prev,
          totalBids: allBids.length,
          openBids: allBids.filter(b => b.status === 'open').length,
          acceptedBids: allBids.filter(b => b.status === 'accepted').length,
          closedBids: allBids.filter(b => b.status === 'closed').length,
        }));
      }
    } catch (error) {
      console.error('Error fetching bids:', error);
      toast.error('Failed to load bids');
    } finally {
      setLoading(false);
    }
  };

  // Fetch wallets
  const fetchWallets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bid_wallet')
        .select(`
          *,
          garage_owner:profiles!bid_wallet_garage_owner_id_fkey(display_name, email)
        `)
        .order('balance', { ascending: false });

      if (error) throw error;

      setWallets(data || []);

      // Calculate total balance
      const totalBalance = data?.reduce((sum, w) => sum + parseFloat(w.balance), 0) || 0;
      setStats(prev => ({ ...prev, totalWalletBalance: totalBalance }));
    } catch (error) {
      console.error('Error fetching wallets:', error);
      toast.error('Failed to load wallets');
    } finally {
      setLoading(false);
    }
  };

  // Fetch transactions
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select(`
          *,
          user:profiles!wallet_transactions_user_id_fkey(display_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      setTransactions(data || []);
      setStats(prev => ({ ...prev, totalTransactions: data?.length || 0 }));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  // Fetch bid replies
  const fetchBidReplies = async (bidId: string) => {
    try {
      const { data, error } = await supabase
        .from('bid_repair_replies')
        .select(`
          *,
          garage_owner:profiles!bid_repair_replies_garage_owner_id_fkey(display_name, email)
        `)
        .eq('bid_id', bidId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBidReplies(data || []);
    } catch (error) {
      console.error('Error fetching replies:', error);
      toast.error('Failed to load replies');
    }
  };

  // View bid details
  const viewBidDetails = async (bid: BidRepair) => {
    setSelectedBid(bid);
    await fetchBidReplies(bid.id);
    setShowBidModal(true);
  };

  // View wallet details
  const viewWalletDetails = async (wallet: WalletInfo) => {
    setSelectedWallet(wallet);
    
    // Fetch wallet transactions
    const { data } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', wallet.garage_owner_id)
      .order('created_at', { ascending: false })
      .limit(20);

    setTransactions(data || []);
    setShowWalletModal(true);
  };

  // Manual credit adjustment (admin only)
  const adjustWalletCredit = async (walletId: string, amount: number, reason: string) => {
    try {
      const { error } = await supabase.rpc('fn_topup_wallet', {
        p_garage_owner_id: walletId,
        p_amount: amount,
        p_stripe_payment_intent_id: 'admin_adjustment',
        p_metadata: { reason, admin_action: true }
      });

      if (error) throw error;

      toast.success('Wallet adjusted successfully');
      fetchWallets();
    } catch (error) {
      console.error('Error adjusting wallet:', error);
      toast.error('Failed to adjust wallet');
    }
  };

  useEffect(() => {
    if (activeTab === 'bids') fetchBids();
    else if (activeTab === 'wallets') fetchWallets();
    else if (activeTab === 'transactions') fetchTransactions();
  }, [activeTab, statusFilter]);

  // Filter data
  const filteredBids = bids.filter(b =>
    b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.owner?.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredWallets = wallets.filter(w =>
    w.garage_owner?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.garage_owner?.email?.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 className="text-3xl font-bold">Bid Repair Management</h1>
          <p className="text-muted-foreground">Manage repair bids, wallets, and transactions</p>
        </div>
        <Button onClick={() => {
          if (activeTab === 'bids') fetchBids();
          else if (activeTab === 'wallets') fetchWallets();
          else fetchTransactions();
        }} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Bids</CardTitle>
            <Wrench className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBids}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Open Bids</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openBids}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Wallet Balance</CardTitle>
            <Wallet className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWalletBalance.toFixed(2)} Credits</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="bids">
            <Wrench className="h-4 w-4 mr-2" />
            Bids
          </TabsTrigger>
          <TabsTrigger value="wallets">
            <Wallet className="h-4 w-4 mr-2" />
            Wallets
          </TabsTrigger>
          <TabsTrigger value="transactions">
            <TrendingUp className="h-4 w-4 mr-2" />
            Transactions
          </TabsTrigger>
        </TabsList>

        {/* Filters */}
        <div className="flex items-center gap-4 mt-4">
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          
          {activeTab === 'bids' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="accepted">Accepted</option>
              <option value="closed">Closed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          )}
        </div>

        {/* Bids Tab */}
        <TabsContent value="bids" className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredBids.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No bids found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBids.map((bid) => (
                <Card key={bid.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{bid.title}</h3>
                          <Badge className={
                            bid.status === 'open' ? 'bg-green-500' :
                            bid.status === 'accepted' ? 'bg-blue-500' :
                            bid.status === 'closed' ? 'bg-gray-500' :
                            'bg-red-500'
                          }>
                            {bid.status}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground line-clamp-2">{bid.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {bid.owner?.display_name || 'Unknown'}
                          </div>
                          <div className="flex items-center gap-1">
                            <Car className="h-4 w-4" />
                            {bid.vehicle_info?.make} {bid.vehicle_info?.model}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            {bid.replies_count} replies
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {bid.views_count} views
                          </div>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          Created: {new Date(bid.created_at).toLocaleString()}
                        </div>
                      </div>

                      <Button size="sm" onClick={() => viewBidDetails(bid)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Wallets Tab */}
        <TabsContent value="wallets" className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredWallets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No wallets found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredWallets.map((wallet) => (
                <Card key={wallet.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">{wallet.garage_owner?.display_name}</h3>
                          <Badge variant="outline">{wallet.garage_owner?.email}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Balance:</span>
                            <p className="font-semibold text-green-600">{parseFloat(wallet.balance).toFixed(2)} Credits</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Total Earned:</span>
                            <p className="font-semibold">{parseFloat(wallet.total_earned).toFixed(2)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Total Spent:</span>
                            <p className="font-semibold">{parseFloat(wallet.total_spent).toFixed(2)}</p>
                          </div>
                        </div>

                        {wallet.last_topup && (
                          <div className="text-xs text-muted-foreground">
                            Last top-up: {new Date(wallet.last_topup).toLocaleString()}
                          </div>
                        )}
                      </div>

                      <Button size="sm" onClick={() => viewWalletDetails(wallet)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
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
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No transactions found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTransactions.map((tx) => (
                <Card key={tx.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${tx.type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                          <DollarSign className={`h-4 w-4 ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`} />
                        </div>
                        <div>
                          <p className="font-medium">{tx.user?.display_name}</p>
                          <p className="text-sm text-muted-foreground">{tx.description || tx.source}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.type === 'credit' ? '+' : '-'}{parseFloat(tx.amount).toFixed(2)}
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

      {/* Bid Details Modal */}
      <Dialog open={showBidModal} onOpenChange={setShowBidModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bid Details</DialogTitle>
          </DialogHeader>
          {selectedBid && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg">{selectedBid.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{selectedBid.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Owner</label>
                  <p>{selectedBid.owner?.display_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Badge>{selectedBid.status}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Vehicle</label>
                  <p>{selectedBid.vehicle_info?.make} {selectedBid.vehicle_info?.model} ({selectedBid.vehicle_info?.year})</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Replies</label>
                  <p>{selectedBid.replies_count} replies</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Replies ({bidReplies.length})</h4>
                <div className="space-y-3">
                  {bidReplies.map((reply) => (
                    <Card key={reply.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium">{reply.garage_owner?.display_name}</span>
                              <Badge className={
                                reply.status === 'accepted' ? 'bg-green-500' :
                                reply.status === 'rejected' ? 'bg-red-500' :
                                'bg-yellow-500'
                              }>
                                {reply.status}
                              </Badge>
                            </div>
                            <p className="text-sm mb-2">{reply.message}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Quote: AED {parseFloat(reply.quote_amount).toFixed(2)}</span>
                              <span>Time: {reply.estimated_time}</span>
                              {reply.warranty_offered && <span>Warranty: {reply.warranty_offered}</span>}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Wallet Details Modal */}
      <Dialog open={showWalletModal} onOpenChange={setShowWalletModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Wallet Details</DialogTitle>
          </DialogHeader>
          {selectedWallet && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Owner</label>
                  <p>{selectedWallet.garage_owner?.display_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Balance</label>
                  <p className="text-2xl font-bold text-green-600">{parseFloat(selectedWallet.balance).toFixed(2)} Credits</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Recent Transactions</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="text-sm">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleString()}</p>
                      </div>
                      <span className={`font-semibold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'credit' ? '+' : '-'}{parseFloat(tx.amount).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
