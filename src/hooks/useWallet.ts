import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner';

export interface WalletBalance {
  balance: number;
  currency: string;
  total_earned?: number;
  total_spent?: number;
}

export interface WalletTransaction {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  source: string;
  description?: string;
  created_at: string;
}

export function useWallet(userId?: string) {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [topUpLoading, setTopUpLoading] = useState(false); // Separate loading state for top-up

  useEffect(() => {
    if (userId) {
      fetchWallet();
    }
  }, [userId]);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      const uid = userId || user?.id;
      
      if (!uid) {
        setBalance(null);
        setTransactions([]);
        return;
      }

      // Fetch wallet balance (try bid_wallet first, then billing_wallets)
      let walletData: any = null;
      
      // Try bid_wallet (for garage owners)
      const { data: bidWallet } = await supabase
        .from('bid_wallet')
        .select('*')
        .eq('garage_owner_id', uid)
        .maybeSingle();

      if (bidWallet) {
        walletData = {
          balance: parseFloat(bidWallet.balance || 0),
          currency: 'AED',
          total_earned: parseFloat(bidWallet.total_earned || 0),
          total_spent: parseFloat(bidWallet.total_spent || 0),
        };
      } else {
        // Try billing_wallets
        const { data: billingWallet } = await supabase
          .from('billing_wallets')
          .select('*')
          .eq('owner_id', uid)
          .maybeSingle();

        if (billingWallet) {
          walletData = {
            balance: parseFloat((billingWallet.balance || 0) / 100), // Convert from cents
            currency: billingWallet.currency || 'AED',
          };
        }
      }

      setBalance(walletData || { balance: 0, currency: 'AED' });

      // Fetch transactions
      const { data: walletTransactions } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .limit(50);

      if (walletTransactions) {
        setTransactions(walletTransactions.map((t: any) => ({
          id: t.id,
          amount: parseFloat(t.amount || 0),
          type: t.type === 'credit' ? 'credit' : 'debit',
          source: t.source || 'unknown',
          description: t.description || t.metadata?.description,
          created_at: t.created_at,
        })));
      }
    } catch (error: any) {
      console.error('Error fetching wallet:', error);
      toast.error('Failed to load wallet');
    } finally {
      setLoading(false);
    }
  };

  const topUpWallet = async (amount: number, paymentMethod: 'stripe' = 'stripe') => {
    setTopUpLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to top up wallet');
        setTopUpLoading(false);
        return { error: 'Not authenticated' };
      }

      if (paymentMethod !== 'stripe') {
        setTopUpLoading(false);
        return { error: 'Unsupported payment method' };
      }

      console.log('Creating Stripe checkout session for amount:', amount);

      // Create Stripe checkout session via dedicated Edge Function
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const { data, error } = await supabase.functions.invoke('stripe-create-checkout', {
        body: {
          kind: 'wallet_credit',
          amount: Math.round(amount * 100), // minor units
          success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/wallet`,
          metadata: {
            description: `Wallet Top-Up - AED ${amount}`,
          },
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        const errorMsg = error.message || 'Failed to create checkout session';
        toast.error(errorMsg);
        setTopUpLoading(false);
        return { error };
      }

      if (!data) {
        const errorMsg = 'No response from payment server';
        console.error(errorMsg);
        toast.error(errorMsg);
        setTopUpLoading(false);
        return { error: new Error(errorMsg) };
      }

      console.log('Checkout session created:', data);

      // Handle response - edge function returns { url, session_id, order_id }
      const checkoutUrl = data.url;
      const sessionId = data.session_id || data.sessionId;

      if (checkoutUrl) {
        // Direct URL redirect (preferred - simpler and more reliable)
        console.log('Redirecting to Stripe checkout:', checkoutUrl);
        // Don't reset loading here - let the redirect happen
        window.location.href = checkoutUrl;
        // Return immediately - page will redirect
        return { error: null };
      }

      if (sessionId) {
        // Fallback: Use Stripe.js to redirect if URL not provided
        try {
          const stripe = await import('@stripe/stripe-js');
          const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
          
          if (!publishableKey) {
            const errorMsg = 'Stripe publishable key not configured';
            console.error(errorMsg);
            toast.error(errorMsg);
            setTopUpLoading(false);
            return { error: new Error(errorMsg) };
          }
          
          console.log('Loading Stripe.js...');
          const stripePromise = stripe.loadStripe(publishableKey);
          const stripeInstance = await stripePromise;
          
          if (!stripeInstance) {
            const errorMsg = 'Failed to initialize Stripe';
            console.error(errorMsg);
            toast.error(errorMsg);
            setTopUpLoading(false);
            return { error: new Error(errorMsg) };
          }
          
          console.log('Redirecting to Stripe checkout with session:', sessionId);
          const { error: redirectError } = await stripeInstance.redirectToCheckout({ 
            sessionId: sessionId 
          });
          
          if (redirectError) {
            console.error('Stripe redirect error:', redirectError);
            toast.error(redirectError.message || 'Failed to redirect to payment');
            setTopUpLoading(false);
            return { error: redirectError };
          }
          
          // Don't reset loading here - redirect is happening
          return { error: null };
        } catch (stripeError: any) {
          console.error('Stripe redirect error:', stripeError);
          toast.error(stripeError.message || 'Failed to redirect to payment. Please try again.');
          setTopUpLoading(false);
          return { error: stripeError };
        }
      }

      const errorMsg = 'No checkout session URL or ID received from server';
      console.error(errorMsg, data);
      toast.error(errorMsg);
      setTopUpLoading(false);
      return { error: new Error(errorMsg) };
    } catch (error: any) {
      console.error('Error topping up wallet:', error);
      const errorMsg = error?.message || 'Unknown error';
      toast.error('Failed to initiate wallet top-up: ' + errorMsg);
      setTopUpLoading(false);
      return { error };
    }
  };

  return {
    balance,
    transactions,
    loading: loading || topUpLoading, // Combine both loading states
    topUpLoading, // Expose separate top-up loading state
    refetch: fetchWallet,
    topUpWallet,
  };
}
