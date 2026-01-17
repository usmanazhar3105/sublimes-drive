import { useState } from 'react';
import { Wallet, Plus, ArrowUpRight, ArrowDownRight, History, CreditCard, DollarSign, TrendingUp, Gift } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { useWallet, useWalletTransactions, usePayments } from '../hooks';
import { toast } from 'sonner';

export function WalletPageEnhanced() {
  const { balance, loading: walletLoading, refetch } = useWallet();
  const { transactions = [], loading: transactionsLoading } = useWalletTransactions();
  const { createWalletTopUp, loading: paymentLoading } = usePayments();
  
  const [topUpAmount, setTopUpAmount] = useState('');
  const [showTopUpDialog, setShowTopUpDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'wallet'>('stripe');

  const predefinedAmounts = [50, 100, 250, 500, 1000];

  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmount);
    
    if (!amount || amount < 10) {
      toast.error('Minimum top-up amount is AED 10');
      return;
    }

    if (amount > 10000) {
      toast.error('Maximum top-up amount is AED 10,000');
      return;
    }

    if (paymentMethod === 'stripe') {
      // Create Stripe payment intent
      const { clientSecret, error } = await createWalletTopUp(amount);
      
      if (error) {
        toast.error('Failed to initiate payment');
        return;
      }

      // Here you would integrate Stripe Elements to process the payment
      // For now, we'll show a success message
      toast.success('Payment initiated! Complete the payment to top up your wallet.');
      setShowTopUpDialog(false);
      setTopUpAmount('');
    } else {
      // This doesn't make sense for wallet top-up, but keeping for consistency
      toast.error('Cannot top up wallet using wallet balance');
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'credit':
        return <ArrowDownRight className="h-4 w-4 text-green-500" />;
      case 'debit':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case 'hold':
        return <DollarSign className="h-4 w-4 text-orange-500" />;
      case 'release':
        return <ArrowDownRight className="h-4 w-4 text-blue-500" />;
      default:
        return <DollarSign className="h-4 w-4 text-[#8A92A6]" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'credit':
      case 'release':
        return 'text-green-500';
      case 'debit':
      case 'hold':
        return 'text-red-500';
      default:
        return 'text-[#8A92A6]';
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'bg-green-500/10 text-green-500 border-green-500/20',
      pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      failed: 'bg-red-500/10 text-red-500 border-red-500/20',
      cancelled: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    };
    return variants[status as keyof typeof variants] || variants.pending;
  };

  return (
    <div className="min-h-screen bg-[#0B1426]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1A1F2E] to-[#0B1426] border-b border-[#2A3441]">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl text-[#E8EAED] flex items-center gap-3">
                <Wallet className="h-8 w-8 text-[#D4AF37]" />
                My Wallet
              </h1>
              <p className="text-[#8A92A6] mt-2">
                Manage your funds and transactions
              </p>
            </div>

            <Dialog open={showTopUpDialog} onOpenChange={setShowTopUpDialog}>
              <DialogTrigger asChild>
                <Button className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black">
                  <Plus className="h-4 w-4 mr-2" />
                  Top Up Wallet
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#1A1F2E] border-[#2A3441] text-[#E8EAED]">
                <DialogHeader>
                  <DialogTitle>Top Up Wallet</DialogTitle>
                  <DialogDescription className="text-[#8A92A6]">
                    Add funds to your wallet using a credit card
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                  {/* Quick Amount Selection */}
                  <div>
                    <Label className="text-[#E8EAED]">Quick Select</Label>
                    <div className="grid grid-cols-5 gap-2 mt-2">
                      {predefinedAmounts.map((amount) => (
                        <Button
                          key={amount}
                          variant="outline"
                          onClick={() => setTopUpAmount(amount.toString())}
                          className={`${
                            topUpAmount === amount.toString()
                              ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-[#D4AF37]'
                              : 'border-[#2A3441] text-[#E8EAED] hover:bg-[#2A3441]'
                          }`}
                        >
                          {amount}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Amount */}
                  <div>
                    <Label htmlFor="amount" className="text-[#E8EAED]">
                      Custom Amount (AED)
                    </Label>
                    <div className="relative mt-2">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-[#8A92A6]" />
                      <Input
                        id="amount"
                        type="number"
                        placeholder="Enter amount"
                        value={topUpAmount}
                        onChange={(e) => setTopUpAmount(e.target.value)}
                        className="pl-10 bg-[#0B1426] border-[#2A3441] text-[#E8EAED]"
                        min="10"
                        max="10000"
                      />
                    </div>
                    <p className="text-xs text-[#8A92A6] mt-1">
                      Minimum: AED 10 • Maximum: AED 10,000
                    </p>
                  </div>

                  {/* Payment Summary */}
                  {topUpAmount && parseFloat(topUpAmount) >= 10 && (
                    <Card className="bg-[#0B1426] border-[#2A3441]">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-[#8A92A6]">Amount</span>
                            <span className="text-[#E8EAED]">AED {parseFloat(topUpAmount).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-[#8A92A6]">Processing Fee</span>
                            <span className="text-[#E8EAED]">AED 0.00</span>
                          </div>
                          <div className="h-px bg-[#2A3441] my-2" />
                          <div className="flex justify-between">
                            <span className="text-[#E8EAED]">Total</span>
                            <span className="text-[#D4AF37]">AED {parseFloat(topUpAmount).toFixed(2)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowTopUpDialog(false)}
                      className="flex-1 border-[#2A3441] text-[#E8EAED] hover:bg-[#2A3441]"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleTopUp}
                      disabled={!topUpAmount || parseFloat(topUpAmount) < 10 || paymentLoading}
                      className="flex-1 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black"
                    >
                      {paymentLoading ? (
                        <>
                          <div className="h-4 w-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Pay with Card
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {/* Balance Card */}
          <Card className="md:col-span-2 bg-gradient-to-br from-[#D4AF37]/20 to-[#1A1F2E] border-[#D4AF37]/30">
            <CardHeader>
              <CardTitle className="text-[#E8EAED] flex items-center gap-2">
                <Wallet className="h-5 w-5 text-[#D4AF37]" />
                Available Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl text-[#D4AF37]">
                  {walletLoading ? '...' : balance.toFixed(2)}
                </span>
                <span className="text-2xl text-[#8A92A6]">AED</span>
              </div>
              <p className="text-[#8A92A6] mt-2 text-sm">
                Use your balance for listings, boosts, and premium features
              </p>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-[#1A1F2E] border-[#2A3441]">
            <CardHeader>
              <CardTitle className="text-[#E8EAED] text-sm">This Month</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[#8A92A6] text-sm">Income</span>
                <span className="text-green-500">+AED 0.00</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8A92A6] text-sm">Spent</span>
                <span className="text-red-500">-AED 0.00</span>
              </div>
              <div className="h-px bg-[#2A3441]" />
              <div className="flex items-center justify-between">
                <span className="text-[#E8EAED] text-sm">Net</span>
                <span className="text-[#D4AF37]">AED 0.00</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions */}
        <Card className="bg-[#1A1F2E] border-[#2A3441]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[#E8EAED] flex items-center gap-2">
                  <History className="h-5 w-5 text-[#D4AF37]" />
                  Transaction History
                </CardTitle>
                <CardDescription className="text-[#8A92A6]">
                  View all your wallet transactions
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="border-[#2A3441] text-[#E8EAED] hover:bg-[#2A3441]"
              >
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {transactions.length > 0 ? (
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-[#0B1426] rounded-lg border border-[#2A3441] hover:border-[#D4AF37]/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#1A1F2E] rounded-lg">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <p className="text-[#E8EAED]">
                            {transaction.description || transaction.type}
                          </p>
                          <p className="text-xs text-[#8A92A6]">
                            {new Date(transaction.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className={`${getTransactionColor(transaction.type)}`}>
                          {transaction.amount >= 0 ? '+' : ''}AED {Math.abs(transaction.amount).toFixed(2)}
                        </p>
                        <Badge className={`mt-1 ${getStatusBadge(transaction.status)}`}>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-12">
                <History className="h-12 w-12 text-[#8A92A6] mx-auto mb-4" />
                <h3 className="text-xl text-[#E8EAED] mb-2">No Transactions Yet</h3>
                <p className="text-[#8A92A6]">
                  Your transaction history will appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
