import React, { useState } from 'react';
import { Loader2, CreditCard, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface StripeCheckoutProps {
  itemId: string;
  itemType: 'boost' | 'listing' | 'premium';
  amount: number;
  currency?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const StripeCheckout: React.FC<StripeCheckoutProps> = ({
  itemId,
  itemType,
  amount,
  currency = 'AED',
  onSuccess,
  onError
}) => {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Please log in to continue');
      }

      // Call stripe-create-checkout Edge Function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-create-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            itemId,
            itemType,
            amount,
            currency,
            userId: user.id,
            successUrl: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${window.location.origin}/payment/cancelled`
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId, url } = await response.json();

      // Redirect to Stripe Checkout
      window.location.href = url;
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      if (onError) {
        onError(error.message || 'Payment failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] rounded-lg font-medium hover:bg-[var(--sublimes-gold)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          <CreditCard className="w-5 h-5" />
          <span>Pay {amount} {currency}</span>
        </>
      )}
    </button>
  );
};

// Boost Package Selector Component
interface BoostPackage {
  id: string;
  name: string;
  duration_days: number;
  price_aed: number;
  features: any;
}

interface BoostSelectorProps {
  listingId: string;
  onSuccess?: () => void;
}

export const BoostSelector: React.FC<BoostSelectorProps> = ({ listingId, onSuccess }) => {
  const [packages, setPackages] = useState<BoostPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    
    const { data } = await supabase
      .from('boost_packages')
      .select('*')
      .eq('is_active', true)
      .order('price_aed', { ascending: true });
    
    setPackages(data || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--sublimes-gold)]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-[var(--sublimes-light-text)] mb-2">
          Boost Your Listing
        </h3>
        <p className="text-sm text-gray-400">
          Get more visibility and reach more buyers
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            onClick={() => setSelectedPackage(pkg.id)}
            className={`relative p-6 rounded-lg border-2 cursor-pointer transition-all ${
              selectedPackage === pkg.id
                ? 'border-[var(--sublimes-gold)] bg-[var(--sublimes-gold)]/5'
                : 'border-[var(--sublimes-border)] hover:border-[var(--sublimes-gold)]/50'
            }`}
          >
            <div className="text-center mb-4">
              <h4 className="text-lg font-bold text-[var(--sublimes-light-text)] mb-1">
                {pkg.name}
              </h4>
              <div className="text-3xl font-bold text-[var(--sublimes-gold)]">
                {pkg.price_aed}
                <span className="text-sm text-gray-400 ml-1">AED</span>
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {pkg.duration_days} days
              </div>
            </div>

            <div className="space-y-2">
              {pkg.features?.highlight && (
                <div className="flex items-center text-sm text-gray-300">
                  <ShieldCheck className="w-4 h-4 mr-2 text-green-500" />
                  <span>Highlighted</span>
                </div>
              )}
              {pkg.features?.badge && (
                <div className="flex items-center text-sm text-gray-300">
                  <ShieldCheck className="w-4 h-4 mr-2 text-green-500" />
                  <span>{pkg.features.badge} Badge</span>
                </div>
              )}
              {pkg.features?.homepage && (
                <div className="flex items-center text-sm text-gray-300">
                  <ShieldCheck className="w-4 h-4 mr-2 text-green-500" />
                  <span>Homepage Featured</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedPackage && (
        <div className="mt-6">
          <StripeCheckout
            itemId={listingId}
            itemType="boost"
            amount={packages.find(p => p.id === selectedPackage)?.price_aed || 0}
            onSuccess={onSuccess}
          />
        </div>
      )}
    </div>
  );
};
