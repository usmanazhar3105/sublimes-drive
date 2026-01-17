/**
 * WalletPage - Wired with Supabase Hooks
 * 
 * Uses: useWallet, useAnalytics
 */

import { useState, useEffect } from 'react';
import { 
  Wallet, CreditCard, TrendingUp, TrendingDown, 
  Plus, Download, Upload, Clock, CheckCircle, 
  XCircle, Loader2, X, DollarSign, Calendar, 
  ArrowUpRight, ArrowDownLeft, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';

// Import Supabase hooks
import { useWallet, useAnalytics } from '../hooks';
import { WalletTopUpModal } from './WalletTopUpModal';

interface WalletPageProps {
  onNavigate?: (page: string) => void;
}

export function WalletPage({ onNavigate }: WalletPageProps) {
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  // 🔥 SUPABASE HOOKS
  const { 
    balance = 0, 
    transactions = [], 
    stats = { totalSpent: 0, totalReceived: 0, transactionCount: 0 },
    loading = false, 
    error = null, 
    refetch 
  } = useWallet() || {};

  const analytics = useAnalytics();

  // Track page view
  useEffect(() => {
    analytics.trackPageView('/wallet');
  }, []);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'top_up':
        return <ArrowDownLeft className="text-green-400" size={20} />;
      case 'withdrawal':
        return <ArrowUpRight className="text-red-400" size={20} />;
      case 'purchase':
        return <DollarSign className="text-blue-400" size={20} />;
      case 'refund':
        return <RefreshCw className="text-purple-400" size={20} />;
      default:
        return <Wallet className="text-[#8B92A7]" size={20} />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'top_up':
      case 'refund':
        return 'text-green-400';
      case 'withdrawal':
      case 'purchase':
        return 'text-red-400';
      default:
        return 'text-[#8B92A7]';
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1426]">
      {/* Header */}
      <div className="bg-[#0F1829] border-b border-[#1A2332]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl text-[#E8EAED] mb-2">Wallet</h1>
              <p className="text-sm text-[#8B92A7]">Manage your credits and transactions</p>
            </div>
            
            <Button
              onClick={() => setShowTopUpModal(true)}
              className="bg-[#D4AF37] hover:bg-[#C19B2E] text-[#0B1426]"
            >
              <Plus size={20} className="mr-2" />
              Top Up
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin mb-4" />
            <p className="text-[#8B92A7]">Loading wallet...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="bg-red-500/10 border-red-500">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <X className="text-red-400 mt-1" size={20} />
                <div>
                  <h3 className="text-red-400 font-semibold mb-1">Error Loading Wallet</h3>
                  <p className="text-sm text-red-300">{error.message}</p>
                  <Button
                    onClick={() => refetch()}
                    variant="outline"
                    size="sm"
                    className="mt-3 border-red-400 text-red-400 hover:bg-red-400/10"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && !error && (
          <>
            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Current Balance */}
              <Card className="bg-gradient-to-br from-[#D4AF37]/20 to-[#1A2332] border-[#D4AF37]/30">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                      <Wallet className="text-[#D4AF37]" size={24} />
                    </div>
                  </div>
                  <p className="text-sm text-[#8B92A7] mb-1">Current Balance</p>
                  <h2 className="text-3xl text-[#E8EAED] mb-2">
                    AED {(balance || 0).toLocaleString()}
                  </h2>
                  <Badge className="bg-green-500/10 text-green-400 border-0">
                    <TrendingUp size={14} className="mr-1" />
                    Active
                  </Badge>
                </CardContent>
              </Card>

              {/* Total Spent */}
              <Card className="bg-[#0F1829] border-[#1A2332]">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <TrendingDown className="text-blue-400" size={24} />
                    </div>
                  </div>
                  <p className="text-sm text-[#8B92A7] mb-1">Total Spent</p>
                  <h2 className="text-3xl text-[#E8EAED] mb-2">
                    AED {(stats.totalSpent || 0).toLocaleString()}
                  </h2>
                  <p className="text-xs text-[#8B92A7]">This {selectedPeriod}</p>
                </CardContent>
              </Card>

              {/* Total Added */}
              <Card className="bg-[#0F1829] border-[#1A2332]">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                      <TrendingUp className="text-green-400" size={24} />
                    </div>
                  </div>
                  <p className="text-sm text-[#8B92A7] mb-1">Total Added</p>
                  <h2 className="text-3xl text-[#E8EAED] mb-2">
                    AED {(stats.totalAdded || 0).toLocaleString()}
                  </h2>
                  <p className="text-xs text-[#8B92A7]">This {selectedPeriod}</p>
                </CardContent>
              </Card>
            </div>

            {/* Transactions */}
            <Card className="bg-[#0F1829] border-[#1A2332]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#E8EAED]">Transaction History</CardTitle>
                  <Tabs value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as any)}>
                    <TabsList className="bg-[#1A2332]">
                      <TabsTrigger value="week" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426]">
                        Week
                      </TabsTrigger>
                      <TabsTrigger value="month" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426]">
                        Month
                      </TabsTrigger>
                      <TabsTrigger value="year" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426]">
                        Year
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <Wallet className="mx-auto mb-4 text-[#8B92A7]" size={48} />
                    <p className="text-[#8B92A7]">No transactions yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((transaction) => (
                      <div 
                        key={transaction.id}
                        className="flex items-center justify-between p-4 bg-[#1A2332] rounded-lg hover:bg-[#1A2332]/70 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-[#0B1426] flex items-center justify-center">
                            {getTransactionIcon(transaction.type)}
                          </div>
                          <div>
                            <h4 className="text-sm text-[#E8EAED] mb-1">
                              {transaction.description || transaction.type}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-[#8B92A7]">
                              <Clock size={12} />
                              {new Date(transaction.created_at).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className={`text-lg ${getTransactionColor(transaction.type)}`}>
                            {['top_up', 'refund'].includes(transaction.type) ? '+' : '-'}
                            AED {Math.abs(transaction.amount).toLocaleString()}
                          </p>
                          <Badge className={
                            transaction.status === 'completed' 
                              ? 'bg-green-500/10 text-green-400' 
                              : transaction.status === 'pending'
                              ? 'bg-yellow-500/10 text-yellow-400'
                              : 'bg-red-500/10 text-red-400'
                          }>
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Top Up Modal - Using WalletTopUpModal Component */}
      <WalletTopUpModal
        isOpen={showTopUpModal}
        onClose={() => {
          setShowTopUpModal(false);
          refetch(); // Refresh wallet balance after top-up
        }}
      />
    </div>
  );
}
