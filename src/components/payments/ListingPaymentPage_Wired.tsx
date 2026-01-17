/**
 * ListingPaymentPage_Wired - Database-connected Listing Payment page
 * Uses: useWallet, useListings, useAnalytics
 */

import { useState, useEffect } from 'react';
import { CreditCard, Shield, CheckCircle, ArrowLeft, Loader2, DollarSign } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { useWallet, useListings, useAnalytics } from '../../src/hooks';

interface ListingPaymentPageProps {
  listingId?: string;
  amount?: number;
  onNavigate?: (page: string) => void;
}

export function ListingPaymentPage({ listingId, amount = 0, onNavigate }: ListingPaymentPageProps) {
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');

  const { wallet, refetch: refetchWallet } = useWallet();
  const { listings } = useListings({ id: listingId });
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.trackPageView('/listing-payment');
  }, []);

  const listing = listings[0];

  const handlePayment = async () => {
    setProcessing(true);
    analytics.trackEvent('payment_initiated', { 
      listing_id: listingId, 
      amount,
      method: paymentMethod 
    });

    // Simulate payment processing
    setTimeout(() => {
      analytics.trackEvent('payment_completed', { listing_id: listingId, amount });
      toast.success('Payment successful! Your listing is now live.');
      setProcessing(false);
      onNavigate?.('payment-success');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#0B1426]">
      <div className="bg-[#0F1829] border-b border-[#1A2332]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button
            onClick={() => onNavigate?.('marketplace')}
            variant="ghost"
            className="mb-4 text-[#8B92A7] hover:text-[#E8EAED]"
          >
            <ArrowLeft className="mr-2" size={20} />
            Back
          </Button>
          <h1 className="text-3xl text-[#E8EAED]" style={{ fontWeight: 600 }}>
            Payment
          </h1>
          <p className="text-[#8B92A7] mt-1">Complete your listing payment</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <Card className="bg-[#0F1829] border-[#1A2332]">
              <CardHeader>
                <CardTitle className="text-xl text-[#E8EAED] flex items-center gap-2">
                  <Shield className="text-[#D4AF37]" size={24} />
                  Secure Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Payment Method */}
                <div>
                  <Label className="text-[#E8EAED] mb-3 block">Payment Method</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        paymentMethod === 'card'
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                          : 'border-[#1A2332] hover:border-[#8B92A7]'
                      }`}
                    >
                      <CreditCard className="mx-auto mb-2 text-[#E8EAED]" size={24} />
                      <p className="text-sm text-[#E8EAED]">Card</p>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('wallet')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        paymentMethod === 'wallet'
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                          : 'border-[#1A2332] hover:border-[#8B92A7]'
                      }`}
                    >
                      <DollarSign className="mx-auto mb-2 text-[#E8EAED]" size={24} />
                      <p className="text-sm text-[#E8EAED]">Wallet</p>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('bank')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        paymentMethod === 'bank'
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                          : 'border-[#1A2332] hover:border-[#8B92A7]'
                      }`}
                    >
                      <Shield className="mx-auto mb-2 text-[#E8EAED]" size={24} />
                      <p className="text-sm text-[#E8EAED]">Bank</p>
                    </button>
                  </div>
                </div>

                {/* Card Details */}
                {paymentMethod === 'card' && (
                  <>
                    <div>
                      <Label className="text-[#E8EAED]">Card Number</Label>
                      <Input
                        placeholder="1234 5678 9012 3456"
                        className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-[#E8EAED]">Expiry Date</Label>
                        <Input
                          placeholder="MM/YY"
                          className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                        />
                      </div>
                      <div>
                        <Label className="text-[#E8EAED]">CVV</Label>
                        <Input
                          placeholder="123"
                          className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                        />
                      </div>
                    </div>
                  </>
                )}

                {paymentMethod === 'wallet' && (
                  <div className="p-4 bg-[#0B1426] rounded-lg border border-[#1A2332]">
                    <p className="text-[#8B92A7] mb-2">Wallet Balance</p>
                    <p className="text-2xl text-[#D4AF37]" style={{ fontWeight: 600 }}>
                      AED {wallet?.balance?.toLocaleString() || 0}
                    </p>
                  </div>
                )}

                <Button
                  onClick={handlePayment}
                  disabled={processing}
                  className="w-full bg-[#D4AF37] text-[#0B1426] hover:bg-[#C4A037]"
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" size={20} />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2" size={20} />
                      Pay AED {amount.toLocaleString()}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="bg-[#0F1829] border-[#1A2332]">
              <CardHeader>
                <CardTitle className="text-lg text-[#E8EAED]">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-[#8B92A7] mb-1">Listing Fee</p>
                  <p className="text-lg text-[#E8EAED]">AED {amount.toLocaleString()}</p>
                </div>
                <div className="border-t border-[#1A2332] pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#8B92A7]">Subtotal</span>
                    <span className="text-[#E8EAED]">AED {amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#8B92A7]">VAT (5%)</span>
                    <span className="text-[#E8EAED]">AED {(amount * 0.05).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#1A2332]">
                    <span className="text-[#E8EAED]" style={{ fontWeight: 600 }}>Total</span>
                    <span className="text-xl text-[#D4AF37]" style={{ fontWeight: 600 }}>
                      AED {(amount * 1.05).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#8B92A7] pt-4 border-t border-[#1A2332]">
                  <Shield size={16} />
                  <span>Secure payment powered by Stripe</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
