import { useState } from 'react';
import { supabase, publicApiCall } from '../../utils/supabase/client';
import { toast } from 'sonner';

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: 'deposit' | 'withdrawal' | 'payment' | 'refund' | 'reward';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export function usePayments() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Create a Stripe payment intent for wallet top-up
   */
  async function createWalletTopUp(amount: number): Promise<{ clientSecret?: string; error: Error | null }> {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Call server endpoint to create Stripe payment intent
      const data = await publicApiCall('/payments/create-intent', {
        method: 'POST',
        body: JSON.stringify({
          amount: amount * 100,
          currency: 'aed',
          description: 'Wallet top-up',
          userId: user.id,
        }),
      });
      
      // Create transaction record
      await (supabase as any)
        .from('transactions')
        .insert({
          user_id: user.id,
          amount,
          transaction_type: 'deposit',
          status: 'pending',
          description: 'Wallet top-up',
          metadata: {
            payment_intent_id: data.paymentIntentId,
          },
        });

      toast.success('Payment initiated');
      return { clientSecret: data.clientSecret, error: null };
    } catch (err) {
      const error = err as Error;
      console.error('Error creating payment intent:', error);
      setError(error);
      toast.error('Failed to initiate payment');
      return { error };
    } finally {
      setLoading(false);
    }
  }

  /**
   * Create payment for listing promotion
   */
  async function createListingPayment(
    listingId: string,
    amount: number,
    packageType: string
  ): Promise<{ clientSecret?: string; error: Error | null }> {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      const data = await publicApiCall('/payments/create-intent', {
        method: 'POST',
        body: JSON.stringify({
          amount: amount * 100,
          currency: 'aed',
          description: `Listing promotion - ${packageType}`,
          userId: user.id,
          metadata: {
            listingId,
            packageType,
          },
        }),
      });

      // Create transaction record
      await (supabase as any)
        .from('transactions')
        .insert({
          user_id: user.id,
          amount,
          transaction_type: 'payment',
          status: 'pending',
          description: `Listing promotion - ${packageType}`,
          metadata: {
            payment_intent_id: data.paymentIntentId,
            listing_id: listingId,
            package_type: packageType,
          },
        });

      return { clientSecret: data.clientSecret, error: null };
    } catch (err) {
      const error = err as Error;
      console.error('Error creating listing payment:', error);
      setError(error);
      toast.error('Failed to initiate payment');
      return { error };
    } finally {
      setLoading(false);
    }
  }

  /**
   * Confirm payment success and update wallet/listing
   */
  async function confirmPayment(
    paymentIntentId: string,
    type: 'wallet' | 'listing',
    metadata?: Record<string, any>
  ): Promise<{ error: Error | null }> {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Update transaction status
      const { error: txError } = await (supabase as any)
        .from('transactions')
        .update({ status: 'completed' })
        .eq('metadata->>payment_intent_id', paymentIntentId)
        .eq('user_id', user.id);

      if (txError) throw txError;

      if (type === 'wallet') {
        // Get transaction amount
        const { data: transaction } = await (supabase as any)
          .from('transactions')
          .select('amount')
          .eq('metadata->>payment_intent_id', paymentIntentId)
          .single();

        if (transaction) {
          // Update wallet balance (compute client-side)
          const { data: prof } = await (supabase as any)
            .from('profiles')
            .select('wallet_balance')
            .eq('user_id', user.id)
            .single();
          const newBalance = ((prof?.wallet_balance as number) || 0) + ((transaction as any)?.amount || 0);
          const { error: walletError } = await (supabase as any)
            .from('profiles')
            .update({ wallet_balance: newBalance })
            .eq('user_id', user.id);

          if (walletError) throw walletError;
        }
      } else if (type === 'listing' && metadata?.listingId) {
        // Update listing boost status
        const boostDays = metadata.packageType === 'premium' ? 30 : 7;
        const boostEndDate = new Date();
        boostEndDate.setDate(boostEndDate.getDate() + boostDays);

        await (supabase as any)
          .from('marketplace_listings')
          .update({
            is_featured: true,
            featured_until: boostEndDate.toISOString(),
            boost_level: metadata.packageType === 'premium' ? 2 : 1,
          })
          .eq('id', metadata.listingId);
      }

      toast.success('Payment successful!');
      return { error: null };
    } catch (err) {
      const error = err as Error;
      console.error('Error confirming payment:', error);
      toast.error('Failed to confirm payment');
      return { error };
    } finally {
      setLoading(false);
    }
  }

  /**
   * Process wallet payment (deduct from wallet balance)
   */
  async function processWalletPayment(
    amount: number,
    description: string,
    metadata?: Record<string, any>
  ): Promise<{ error: Error | null }> {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Check wallet balance
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('wallet_balance')
        .eq('user_id', user.id)
        .single();

      if (!profile || profile.wallet_balance < amount) {
        throw new Error('Insufficient wallet balance');
      }

      // Deduct from wallet
      const newBalance = (profile.wallet_balance || 0) - amount;
      const { error: walletError } = await (supabase as any)
        .from('profiles')
        .update({ wallet_balance: newBalance })
        .eq('user_id', user.id);

      if (walletError) throw walletError;

      // Create transaction record
      await (supabase as any)
        .from('transactions')
        .insert({
          user_id: user.id,
          amount: -amount,
          transaction_type: 'payment',
          status: 'completed',
          description,
          metadata,
        });

      toast.success('Payment processed from wallet');
      return { error: null };
    } catch (err) {
      const error = err as Error;
      console.error('Error processing wallet payment:', error);
      toast.error(error.message || 'Failed to process payment');
      return { error };
    } finally {
      setLoading(false);
    }
  }

  /**
   * Get user transactions
   */
  async function getTransactions(limit: number = 50): Promise<{ transactions: Transaction[]; error: Error | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (fetchError) throw fetchError;

      return { transactions: data || [], error: null };
    } catch (err) {
      const error = err as Error;
      console.error('Error fetching transactions:', error);
      return { transactions: [], error };
    }
  }

  return {
    loading,
    error,
    createWalletTopUp,
    createListingPayment,
    confirmPayment,
    processWalletPayment,
    getTransactions,
  };
}
