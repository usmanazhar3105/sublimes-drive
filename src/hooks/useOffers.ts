import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';

export interface Offer {
  id: string;
  vendor_id: string;
  title: string;
  description: string;
  terms: string;
  discount_type: string;
  discount_value: number;
  code: string;
  image_url: string;
  category: string;
  valid_from: string;
  valid_until: string;
  max_redemptions: number;
  redemption_count: number;
  min_purchase_amount: number;
  is_featured: boolean;
  is_active: boolean;
  status: string;
  views_count: number;
  saves_count: number;
  meta: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface OfferRedemption {
  id: string;
  offer_id: string;
  user_id: string;
  redeemed_at: string;
  amount_saved: number;
  transaction_ref: string;
  notes: string;
}

export interface UseOffersOptions {
  category?: string;
  status?: string;
  search?: string;
  active?: boolean;
  limit?: number;
}

export function useOffers(options: UseOffersOptions = {}) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [redemptions, setRedemptions] = useState<OfferRedemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const {
    category,
    status = 'approved',
    search,
    active = true,
    limit = 20,
  } = options;

  useEffect(() => {
    fetchOffers();
  }, [category, status, search, active, limit]);

  async function fetchOffers() {
    try {
      setLoading(true);

      let query = supabase
        .from('offers')
        .select('*')
        .limit(limit);

      if (category) query = query.eq('category', category);
      if (status) query = query.eq('status', status);
      if (active) {
        query = query.eq('is_active', true);
        query = query.gte('valid_until', new Date().toISOString());
      }
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setOffers(data || []);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching offers:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchRedemptions() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error: fetchError } = await supabase
        .from('offer_redemptions')
        .select('*')
        .eq('user_id', user.id)
        .order('redeemed_at', { ascending: false });

      if (fetchError) throw fetchError;

      setRedemptions(data || []);
    } catch (err) {
      console.error('Error fetching redemptions:', err);
    }
  }

  async function createOffer(offer: Partial<Offer>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error: createError } = await supabase
        .from('offers')
        .insert({
          ...offer,
          vendor_id: user.id,
          status: 'pending',
        })
        .select()
        .single();

      if (createError) throw createError;

      setOffers((prev) => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error creating offer:', err);
      throw err;
    }
  }

  async function redeemOffer(offerId: string, amountSaved?: number, transactionRef?: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error: createError } = await supabase
        .from('offer_redemptions')
        .insert({
          offer_id: offerId,
          user_id: user.id,
          amount_saved: amountSaved,
          transaction_ref: transactionRef,
          redeemed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) throw createError;

      // Update redemption count
      const offer = offers.find(o => o.id === offerId);
      if (offer) {
        await supabase
          .from('offers')
          .update({ redemption_count: (offer.redemption_count || 0) + 1 })
          .eq('id', offerId);
      }

      await fetchOffers();
      await fetchRedemptions();
      return data;
    } catch (err) {
      console.error('Error redeeming offer:', err);
      throw err;
    }
  }

  async function updateOffer(id: string, updates: Partial<Offer>) {
    try {
      const { data, error: updateError } = await supabase
        .from('offers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      setOffers((prev) =>
        prev.map((offer) => (offer.id === id ? data : offer))
      );
      return data;
    } catch (err) {
      console.error('Error updating offer:', err);
      throw err;
    }
  }

  return {
    offers,
    redemptions,
    loading,
    error,
    createOffer,
    updateOffer,
    redeemOffer,
    refresh: fetchOffers,
    fetchRedemptions,
  };
}

