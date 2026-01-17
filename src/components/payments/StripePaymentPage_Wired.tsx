/**
 * StripePaymentPage_Wired - Real Stripe Checkout Integration
 * Uses: Stripe Checkout, useWallet, useAnalytics
 */

import { useState, useEffect } from 'react';
import { CreditCard, Lock, Shield, ArrowLeft, Loader2, Check, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { toast } from 'sonner';
import { useAnalytics } from '../../src/hooks';
import { loadStripe } from '@stripe/stripe-js';
import { STRIPE_PUBLISHABLE_KEY } from '../../lib/env';
import { supabase } from '../../utils/supabase/client';

// Initialize Stripe
const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null;

interface StripePaymentPageProps {
  amount?: number;
  description?: string;
  paymentData?: {
    amount?: number;
    currency?: string;
    description?: string;
    type?: string;
    offerId?: string;
    offerTitle?: string;
  };
  onNavigate?: (page: string) => void;
}

export function StripePaymentPage({ 
  amount, 
  description,
  paymentData,
  onNavigate 
}: StripePaymentPageProps) {
  // Use paymentData if available, otherwise fall back to props
  const actualAmount = paymentData?.amount || amount || 100;
  const actualDescription = paymentData?.description || paymentData?.offerTitle || description || 'Payment';
  
  const [processing, setProcessing] = useState(false);
  const [customAmount, setCustomAmount] = useState(actualAmount);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const analytics = useAnalytics();

  useEffect(() => {
    analytics.trackPageView('/stripe-payment');
  }, []);

  const handleCheckout = async (checkoutAmount: number) => {
    if (checkoutAmount < 10) {
      toast.error('Minimum amount is AED 10');
      return;
    }

    setProcessing(true);
    analytics.trackEvent('stripe_checkout_initiated', { amount: checkoutAmount });

    try {
      // Check if Stripe is configured
      if (!stripePromise) {
        toast.error('Stripe is not configured. Please add VITE_STRIPE_PUBLISHABLE_KEY to your environment variables.');
        setProcessing(false);
        return;
      }
      
      // Get Stripe instance
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const isOfferPurchase = paymentData?.type === 'offer_purchase';

      // Create checkout session via Supabase Edge Function (auth required)
      const { data, error } = await supabase.functions.invoke('stripe-create-checkout', {
        body: {
          kind: isOfferPurchase ? 'offer_purchase' : 'wallet_credit',
          amount: Math.round(checkoutAmount * 100), // minor units
          target_id: isOfferPurchase ? (paymentData?.offerId || null) : null,
          success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/${isOfferPurchase ? 'offers' : 'wallet'}`,
          metadata: {
            description: actualDescription,
            ...(isOfferPurchase && paymentData?.offerId ? { offer_id: String(paymentData.offerId) } : {}),
          },
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      const result = await stripe.redirectToCheckout({ sessionId: data?.session_id });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error: any) {
      console.error('Stripe checkout error:', error);
      analytics.trackError('stripe_checkout_failed', { error: error.message });
      toast.error('Failed to initiate payment. Please try again.');
      setProcessing(false);
    }
  };

  const isOfferPurchase = paymentData?.type === 'offer_purchase';
  const presetAmounts = [50, 100, 200, 500, 1000, 2000];

  return (
    <div className="min-h-screen bg-[#0B1426]">
      <div className="bg-[#0F1829] border-b border-[#1A2332]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button
            onClick={() => onNavigate?.(isOfferPurchase ? 'offers' : 'wallet')}
            variant="ghost"
            className="mb-4 text-[#8B92A7] hover:text-[#E8EAED]"
          >
            <ArrowLeft className="mr-2" size={20} />
            {isOfferPurchase ? 'Back to Offers' : 'Back to Wallet'}
          </Button>
          
          {!STRIPE_PUBLISHABLE_KEY && (
            <Alert className="bg-yellow-500/10 border-yellow-500/30 mb-4">
              <AlertCircle className="text-yellow-400" size={20} />
              <AlertDescription className="text-yellow-300 ml-2">
                <strong>Stripe Not Configured:</strong> Add VITE_STRIPE_PUBLISHABLE_KEY to your environment variables to enable payments.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-[#6772E5]/20 flex items-center justify-center">
              <CreditCard className="text-[#6772E5]" size={24} />
            </div>
            <div>
              <h1 className="text-3xl text-[#E8EAED]" style={{ fontWeight: 600 }}>
                {isOfferPurchase ? 'Secure Payment' : 'Top Up Wallet'}
              </h1>
              <p className="text-[#8B92A7]">
                {isOfferPurchase ? `Complete your ${paymentData?.type?.replace('_', ' ')} payment` : 'Powered by Stripe - Secure & Fast'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Security Notice */}
        <Alert className="bg-blue-500/10 border-blue-500/30 mb-6">
          <Shield className="text-blue-400" size={20} />
          <AlertDescription className="text-blue-300 ml-2">
            Your payment is 100% secure. Powered by Stripe with bank-level encryption.
          </AlertDescription>
        </Alert>

        {/* Quick Amounts - Only show for wallet top-up */}
        {!isOfferPurchase && (
          <Card className="bg-[#0F1829] border-[#1A2332] mb-6">
            <CardHeader>
              <CardTitle className="text-xl text-[#E8EAED]">
                Select Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {presetAmounts.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      setSelectedAmount(preset);
                      setCustomAmount(preset);
                    }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedAmount === preset
                        ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                        : 'border-[#1A2332] bg-[#0B1426] hover:border-[#D4AF37]/50'
                    }`}
                  >
                    <p className="text-sm text-[#8B92A7] mb-1">AED</p>
                    <p className="text-2xl text-[#E8EAED]" style={{ fontWeight: 600 }}>
                      {preset}
                    </p>
                    {selectedAmount === preset && (
                      <Check className="text-[#D4AF37] mx-auto mt-2" size={20} />
                    )}
                  </button>
                ))}
              </div>

              {/* Custom Amount */}
              <div>
                <Label className="text-[#E8EAED] mb-2 block">Or Enter Custom Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B92A7]">
                    AED
                  </span>
                  <Input
                    type="number"
                    value={customAmount}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setCustomAmount(value);
                      setSelectedAmount(null);
                    }}
                    placeholder="Enter amount"
                    min="10"
                    className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED] pl-16 text-xl"
                  />
                </div>
                <p className="text-xs text-[#8B92A7] mt-2">Minimum amount: AED 10</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Summary */}
        <Card className="bg-[#0F1829] border-[#1A2332] mb-6">
          <CardContent className="p-6">
            {isOfferPurchase && (
              <>
                <div className="mb-4 pb-4 border-b border-[#1A2332]">
                  <h3 className="text-lg text-[#E8EAED] mb-2" style={{ fontWeight: 600 }}>Order Summary</h3>
                  <p className="text-[#8B92A7]">{actualDescription}</p>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[#8B92A7]">{actualDescription}</span>
                  <span className="text-[#E8EAED]">AED {actualAmount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[#8B92A7]">Subtotal</span>
                  <span className="text-[#E8EAED]">AED {actualAmount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[#8B92A7]">VAT (5%)</span>
                  <span className="text-[#E8EAED]">AED {(actualAmount * 0.05).toFixed(2)}</span>
                </div>
              </>
            )}
            <div className="flex items-center justify-between mb-4 pt-4 border-t border-[#1A2332]">
              <span className="text-[#8B92A7]">{isOfferPurchase ? 'Total' : 'Amount to pay'}</span>
              <span className="text-2xl text-[#E8EAED]" style={{ fontWeight: 600 }}>
                AED {isOfferPurchase ? (actualAmount * 1.05).toFixed(2) : customAmount.toLocaleString()}
              </span>
            </div>
            {!isOfferPurchase && (
              <div className="flex items-center justify-between text-sm pt-4 border-t border-[#1A2332]">
                <span className="text-[#8B92A7]">Processing fee</span>
                <span className="text-[#E8EAED]">Free</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Checkout Button */}
        <Button
          onClick={() => handleCheckout(isOfferPurchase ? Number((actualAmount * 1.05).toFixed(2)) : customAmount)}
          disabled={processing || (!isOfferPurchase && customAmount < 10)}
          className="w-full bg-[#6772E5] text-white hover:bg-[#5469D4] h-14 text-lg"
        >
          {processing ? (
            <>
              <Loader2 className="mr-2 animate-spin" size={24} />
              Redirecting to Stripe...
            </>
          ) : (
            <>
              <Lock className="mr-2" size={24} />
              {isOfferPurchase ? `Pay AED ${(actualAmount * 1.05).toFixed(2)}` : 'Continue to Payment'}
            </>
          )}
        </Button>

        {/* Security Badges */}
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-center gap-4 text-xs text-[#8B92A7]">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-blue-400" />
              <span>SSL Secured</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock size={16} className="text-green-400" />
              <span>PCI Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Check size={16} className="text-[#D4AF37]" />
              <span>Verified by Stripe</span>
            </div>
          </div>

          {/* Accepted Cards */}
          <div className="text-center">
            <p className="text-sm text-[#8B92A7] mb-3">We accept</p>
            <div className="flex items-center justify-center gap-4 opacity-60">
              <div className="w-16 h-10 bg-[#1A2332] rounded flex items-center justify-center text-xs text-[#E8EAED] font-semibold">
                VISA
              </div>
              <div className="w-16 h-10 bg-[#1A2332] rounded flex items-center justify-center text-xs text-[#E8EAED] font-semibold">
                MASTER
              </div>
              <div className="w-16 h-10 bg-[#1A2332] rounded flex items-center justify-center text-xs text-[#E8EAED] font-semibold">
                AMEX
              </div>
              <div className="w-16 h-10 bg-[#1A2332] rounded flex items-center justify-center text-xs text-[#E8EAED] font-semibold">
                MADA
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
