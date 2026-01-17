import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase/client';

/**
 * MARKETPLACE OFFERS - For buying/selling cars
 * Users make offers to buy marketplace listings
 */

export interface MarketplaceOffer {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  currency: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'expired';
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export function useMarketplaceOffers(listingId?: string) {
  const [offers, setOffers] = useState<MarketplaceOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const { data: user } = await supabase.auth.getUser();

      if (!user.user) {
        setOffers([]);
        setLoading(false);
        return;
      }

      let query = supabase
        .from('marketplace_offers')
        .select('*')
        .or(`buyer_id.eq.${user.user.id},seller_id.eq.${user.user.id}`)
        .order('created_at', { ascending: false });

      if (listingId) {
        query = query.eq('listing_id', listingId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setOffers(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching marketplace offers:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [listingId]);

  return {
    offers,
    loading,
    error,
    refetch: fetchOffers,
  };
}

export function useCreateMarketplaceOffer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOffer = async (offerData: {
    listing_id: string;
    seller_id: string;
    amount: number;
    message?: string;
    currency?: string;
  }) => {
    try {
      setLoading(true);
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        throw new Error('Must be logged in to make an offer');
      }

      // Set expiration to 7 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { data, error: createError } = await supabase
        .from('marketplace_offers')
        .insert({
          listing_id: offerData.listing_id,
          buyer_id: user.user.id,
          seller_id: offerData.seller_id,
          amount: offerData.amount,
          currency: offerData.currency || 'AED',
          message: offerData.message,
          status: 'pending',
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (createError) throw createError;

      setError(null);
      return data;
    } catch (err: any) {
      console.error('Error creating marketplace offer:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createOffer,
    loading,
    error,
  };
}

export function useUpdateMarketplaceOffer(offerId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const acceptOffer = async () => {
    try {
      setLoading(true);
      const { data, error: updateError } = await supabase
        .from('marketplace_offers')
        .update({ status: 'accepted' })
        .eq('id', offerId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Optionally mark listing as sold
      if (data.listing_id) {
        await supabase
          .from('marketplace_listings')
          .update({ status: 'sold' })
          .eq('id', data.listing_id);
      }

      setError(null);
      return data;
    } catch (err: any) {
      console.error('Error accepting marketplace offer:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const rejectOffer = async () => {
    try {
      setLoading(true);
      const { data, error: updateError } = await supabase
        .from('marketplace_offers')
        .update({ status: 'rejected' })
        .eq('id', offerId)
        .select()
        .single();

      if (updateError) throw updateError;

      setError(null);
      return data;
    } catch (err: any) {
      console.error('Error rejecting marketplace offer:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const withdrawOffer = async () => {
    try {
      setLoading(true);
      const { data, error: updateError } = await supabase
        .from('marketplace_offers')
        .update({ status: 'withdrawn' })
        .eq('id', offerId)
        .select()
        .single();

      if (updateError) throw updateError;

      setError(null);
      return data;
    } catch (err: any) {
      console.error('Error withdrawing marketplace offer:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    acceptOffer,
    rejectOffer,
    withdrawOffer,
    loading,
    error,
  };
}
