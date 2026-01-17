import { useState, useEffect } from 'react';
import { supabase, apiCall } from '../../utils/supabase/client';

export interface WalletTransaction {
  id: string;
  user_id: string;
  type: 'credit' | 'debit' | 'hold' | 'release';
  amount: number;
  currency: string;
  balance_before: number;
  balance_after: number;
  description: string;
  reference_type?: string;
  reference_id?: string;
  status: 'pending' | 'completed' | 'failed' | 'reversed';
  created_at: string;
}

export function useWallet() {
  const [balance, setBalance] = useState<number>(0);
  const [bidBalance, setBidBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      const { data: user } = await supabase.auth.getUser();

      if (!user.user) {
        setBalance(0);
        setBidBalance(0);
        setLoading(false);
        return;
      }

      let bal = 0;
      let bidBal = 0;
      const wb = await supabase
        .from('wallet_balance')
        .select('balance')
        .eq('user_id', user.user.id)
        .maybeSingle();
      if (!wb.error && wb.data) {
        bal = (wb.data as any)?.balance ?? 0;
      } else {
        const prof = await supabase
          .from('profiles')
          .select('wallet_balance, bid_wallet_balance')
          .eq('id', user.user.id)
          .maybeSingle();
        bal = (prof.data as any)?.wallet_balance ?? 0;
        bidBal = (prof.data as any)?.bid_wallet_balance ?? 0;
      }
      const bw = await supabase
        .from('bid_wallet')
        .select('balance')
        .eq('user_id', user.user.id)
        .maybeSingle();
      if (!bw.error && bw.data) {
        bidBal = (bw.data as any)?.balance ?? 0;
      }
      setBalance(bal);
      setBidBalance(bidBal);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching wallet balance:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  return {
    balance,
    bidBalance,
    loading,
    error,
    refetch: fetchBalance,
  };
}

export function useWalletTransactions() {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async (limit = 50) => {
    try {
      setLoading(true);
      const { data: user } = await supabase.auth.getUser();

      if (!user.user) {
        setTransactions([]);
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (fetchError) throw fetchError;

      setTransactions(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching wallet transactions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions,
  };
}

export function useTopUpWallet() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const topUp = async (amount: number) => {
    try {
      setLoading(true);
      const res = await apiCall('/stripe/create-checkout', {
        method: 'POST',
        body: JSON.stringify({ amount, description: 'Wallet Top-Up' }),
      }, true);
      setError(null);
      return res;
    } catch (err: any) {
      console.error('Error topping up wallet:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    topUp,
    loading,
    error,
  };
}

export function useBidWallet() {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      const { data: user } = await supabase.auth.getUser();

      if (!user.user) {
        setBalance(0);
        setLoading(false);
        return;
      }

      let bal = 0;
      const bw = await supabase
        .from('bid_wallet')
        .select('balance')
        .eq('user_id', user.user.id)
        .maybeSingle();
      if (!bw.error && bw.data) {
        bal = (bw.data as any)?.balance ?? 0;
      } else {
        const prof = await supabase
          .from('profiles')
          .select('bid_wallet_balance')
          .eq('id', user.user.id)
          .maybeSingle();
        bal = (prof.data as any)?.bid_wallet_balance ?? 0;
      }
      setBalance(bal);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching bid wallet balance:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const purchaseBidCredits = async (amount: number) => {
    try {
      setLoading(true);
      
      // Similar to topUp, this would integrate with Stripe
      console.log('Purchase bid credits:', amount);

      setError(null);
      return { success: true, message: 'Redirect to payment gateway' };
    } catch (err: any) {
      console.error('Error purchasing bid credits:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const useBidCredit = async () => {
    try {
      setLoading(true);
      const { data: user } = await supabase.auth.getUser();

      if (!user.user) {
        throw new Error('Must be logged in');
      }

      // Deduct 1 bid credit
      const { data, error: updateError } = await supabase.rpc(
        'deduct_bid_credit',
        { user_id_param: user.user.id }
      );

      if (updateError) throw updateError;

      await fetchBalance();
      setError(null);
      return data;
    } catch (err: any) {
      console.error('Error using bid credit:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  return {
    balance,
    loading,
    error,
    purchaseBidCredits,
    useBidCredit,
    refetch: fetchBalance,
  };
}
