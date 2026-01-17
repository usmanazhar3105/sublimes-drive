/**
 * 🔥 OFFER PAYMENT MODAL - Stripe Integration
 * 
 * Payment flow:
 * 1. User clicks "Claim This Offer" → Opens this modal
 * 2. Shows offer details + Stripe payment form
 * 3. User pays via Stripe Checkout
 * 4. After successful payment → Generate redemption code
 * 5. Show redemption code only after payment verified
 */

import { useState } from 'react';
import { CreditCard, Lock, Shield, X, Loader2, Info, Tag, Calendar, Star } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { useAnalytics } from '../hooks/useAnalytics';
import { loadStripe } from '@stripe/stripe-js';
import { publicApiCall } from '../utils/supabase/client';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { STRIPE_PUBLISHABLE_KEY } from '../lib/env';

// Get Stripe key
const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null;

interface OfferPaymentModalProps {
  offer: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (redemptionData: any) => void;
}

export default function OfferPaymentModal({ offer, isOpen, onClose, onSuccess: _onSuccess }: OfferPaymentModalProps) {
  const [processing, setProcessing] = useState(false);
  const [_paymentStep, _setPaymentStep] = useState<'details' | 'payment' | 'success'>('details');
  const [_redemptionCode, _setRedemptionCode] = useState<string | null>(null);
  
  const analytics = useAnalytics();

  const handlePayment = async () => {
    setProcessing(true);
    
    try {
      // Track payment initiation
      analytics.trackEvent('offer_payment_initiated', { 
        offer_id: offer.id,
        amount: offer.offer_price 
      });

      // Check if Stripe is configured
      if (!stripePromise) {
        toast.error('Payment system is not configured. Please contact support.');
        setProcessing(false);
        return;
      }

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Payment system failed to load');
      }

      // Create checkout session via Edge Function (centralized client)
      const { sessionId } = await publicApiCall('/stripe/create-offer-checkout', {
        method: 'POST',
        body: JSON.stringify({
          offer_id: offer.id,
          offer_title: offer.title,
          amount: offer.offer_price,
          currency: 'aed',
        }),
      });

      // Redirect to Stripe Checkout
      analytics.trackEvent('stripe_checkout_redirect', { offer_id: offer.id });
      
      const result = await stripe.redirectToCheckout({ sessionId });

      if (result.error) {
        throw new Error(result.error.message);
      }

    } catch (error) {
      console.error('Payment error:', error);
      toast.error((error as Error).message || 'Payment failed. Please try again.');
      analytics.trackEvent('offer_payment_failed', { 
        offer_id: offer.id,
        error: (error as Error).message 
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    if (!processing) {
      setPaymentStep('details');
      setRedemptionCode(null);
      onClose();
    }
  };

  const getDaysLeft = (validUntil: string) => {
    const days = Math.ceil((new Date(validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#0F1829] border-[#1A2332] text-[#E8EAED] max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-2xl">
            <span>Complete Your Purchase</span>
            {!processing && (
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="w-5 h-5" />
              </Button>
            )}
          </DialogTitle>
          <DialogDescription className="text-[#8B92A7]">
            Secure payment powered by Stripe
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Offer Summary */}
          <div className="bg-[#0B1426] rounded-lg p-4 border border-[#1A2332]">
            <div className="flex gap-4">
              <div className="w-24 h-24 flex-shrink-0">
                <ImageWithFallback
                  src={Array.isArray(offer.image_urls) && offer.image_urls.length > 0 ? offer.image_urls[0] : offer.image_url}
                  alt={offer.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-lg text-[#E8EAED] mb-1">{offer.title}</h3>
                <p className="text-sm text-[#8B92A7] line-clamp-2">{offer.description}</p>
                
                {offer.is_featured && (
                  <Badge className="mt-2 bg-[#D4AF37]/20 text-[#D4AF37]">
                    <Star className="w-3 h-3 mr-1" />
                    FEATURED
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Details */}
          <div className="bg-gradient-to-r from-[#D4AF37]/10 to-[#0F1829] rounded-lg p-4 border border-[#D4AF37]/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[#8B92A7]">Original Price:</span>
              <span className="text-[#8B92A7] line-through">AED {offer.original_price}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[#8B92A7]">Discount:</span>
              <Badge className="bg-green-500/20 text-green-400">
                {offer.discount_percentage}% OFF
              </Badge>
            </div>
            <Separator className="my-3 bg-[#1A2332]" />
            <div className="flex items-center justify-between">
              <span className="text-xl text-[#E8EAED]">Total Amount:</span>
              <span className="text-3xl text-[#D4AF37]">AED {offer.offer_price}</span>
            </div>
            <p className="text-sm text-green-400 mt-2 text-right">
              You save AED {offer.original_price - offer.offer_price}!
            </p>
          </div>

          {/* Offer Details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0B1426] rounded-lg p-3 border border-[#1A2332]">
              <div className="flex items-center gap-2 text-[#8B92A7] text-sm mb-1">
                <Calendar className="w-4 h-4" />
                <span>Valid Until</span>
              </div>
              <p className="text-[#E8EAED]">{new Date(offer.valid_until).toLocaleDateString()}</p>
              <p className="text-xs text-[#D4AF37] mt-1">{getDaysLeft(offer.valid_until)} days left</p>
            </div>

            <div className="bg-[#0B1426] rounded-lg p-3 border border-[#1A2332]">
              <div className="flex items-center gap-2 text-[#8B92A7] text-sm mb-1">
                <Tag className="w-4 h-4" />
                <span>Category</span>
              </div>
              <p className="text-[#E8EAED]">{offer.category}</p>
            </div>
          </div>

          {/* Security Notice */}
          <Alert className="bg-[#0B1426] border-[#D4AF37]/30">
            <Shield className="w-4 h-4 text-[#D4AF37]" />
            <AlertDescription className="text-[#8B92A7]">
              Your payment is secured by Stripe. After successful payment, you'll receive a unique redemption code to use at the service provider.
            </AlertDescription>
          </Alert>

          {/* Terms */}
          {offer.terms_conditions && (
            <div className="bg-[#0B1426] rounded-lg p-3 border border-[#1A2332]">
              <div className="flex items-center gap-2 text-[#8B92A7] text-sm mb-2">
                <Info className="w-4 h-4" />
                <span>Terms & Conditions</span>
              </div>
              <p className="text-xs text-[#8B92A7] whitespace-pre-line max-h-32 overflow-y-auto">
                {offer.terms_conditions}
              </p>
            </div>
          )}

          {/* Payment Button */}
          <Button
            onClick={handlePayment}
            disabled={processing}
            className="w-full bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#0B1426] h-12 text-lg"
          >
            {processing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5 mr-2" />
                Pay AED {offer.offer_price} with Stripe
              </>
            )}
          </Button>

          {/* Security Badges */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs text-[#8B92A7]">
              <Lock className="w-4 h-4" />
              <span>Secure Checkout</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#8B92A7]">
              <Shield className="w-4 h-4" />
              <span>SSL Protected</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#8B92A7]">
              <CreditCard className="w-4 h-4" />
              <span>Stripe Verified</span>
            </div>
          </div>

          {/* Help Text */}
          <p className="text-xs text-center text-[#8B92A7]">
            By completing this purchase, you agree to the offer's terms and conditions.
            <br />
            For support, contact us at support@sublimesdrive.com
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
