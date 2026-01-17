import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner';

/**
 * PROMOTIONAL OFFERS - Vendor deals and discounts
 * Garages/vendors create offers (50% off detailing, etc.)
 * Used in the Offers Tab/Page
 */

export interface PromotionalOffer {
  id: string;
  vendor_id?: string;
  provider_id?: string;
  created_by?: string;
  title: string;
  description: string;
  discount_percent: number;
  original_price?: number;
  discounted_price: number;
  discount_percentage?: number; // Alias for compatibility
  currency?: string;
  valid_from?: string;
  valid_until: string;
  is_active: boolean;
  is_featured: boolean;
  max_claims?: number;
  claims_count?: number;
  max_redemptions?: number;
  redemption_count?: number;
  category?: string;
  terms?: string;
  provider_name?: string;
  provider_verified?: boolean;
  image_url?: string;
  images?: string[];
  created_at: string;
  updated_at?: string;
}

export interface UserOffer {
  id: string;
  offer_id: string;
  user_id: string;
  redemption_code: string;
  redeemed_at?: string;
  expires_at: string;
  created_at: string;
}

export function useOffers(filters?: { category?: string; active?: boolean }) {
  const [offers, setOffers] = useState<PromotionalOffer[]>([]);
  const [userOffers, setUserOffers] = useState<UserOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOffers = async () => {
    try {
      setLoading(true);

      // Build query - SIMPLIFIED without join to avoid RLS issues
      let query = supabase
        .from('offers')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.active !== undefined) {
        query = query.eq('is_active', filters.active);
      }

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('⚠️ Error fetching offers:', fetchError);
        console.error('Error code:', fetchError.code);
        console.error('Error message:', fetchError.message);
        console.error('Error details:', fetchError.details);
        
        if (fetchError.code === '42P01') {
          console.warn('⚠️ Offers table not found yet');
          setOffers([]);
          setError(null);
        } else {
          toast.error(`Failed to fetch offers: ${fetchError.message}`);
          throw fetchError;
        }
      } else if (data) {
        // Transform data to match interface
        const transformedOffers: PromotionalOffer[] = data.map((offer: any) => ({
          ...offer,
          discount_percentage: offer.discount_percent, // Create alias
          offer_price: offer.discounted_price, // Create alias for backward compatibility
          redemptions_count: offer.redemption_count, // Create alias
          provider_name: offer.provider_name || 'Unknown Vendor',
          provider_verified: false,
          claims_count: offer.redemption_count || 0,
          max_claims: offer.max_redemptions || null,
          currency: offer.currency || 'AED',
        }));
        setOffers(transformedOffers);
        setError(null);
      }
    } catch (err: any) {
      console.error('❌ Critical error fetching offers:', err);
      toast.error(`Error loading offers: ${err.message || 'Unknown error'}`);
      setError(err as Error);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOffers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setUserOffers([]);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('offer_redemptions')
        .select('*')
        .eq('user_id', user.id);

      if (fetchError) {
        console.warn('⚠️ Error fetching user offers:', fetchError);
        setUserOffers([]);
      } else {
        setUserOffers(data || []);
      }
    } catch (err) {
      console.error('Error fetching user offers:', err);
      setUserOffers([]);
    }
  };

  useEffect(() => {
    fetchOffers();
    fetchUserOffers();
  }, [filters?.category, filters?.active]);

  const claimOffer = async (offerId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please sign in to claim offers');
        return { data: null, error: new Error('Not authenticated') };
      }

      // Generate unique redemption code
      const code = `OFFER-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
      
      // Set expiration to 30 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const { data, error: insertError } = await supabase
        .from('offer_redemptions')
        .insert({
          offer_id: offerId,
          user_id: user.id,
          redemption_code: code,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        if (insertError.code === '23505') {
          toast.error('You have already claimed this offer');
        } else {
          toast.error('Failed to claim offer');
        }
        return { data: null, error: insertError };
      }

      // Increment redemption count
      await supabase.rpc('increment_offer_redemptions', { offer_id: offerId });

      toast.success('Offer claimed successfully!');
      await fetchUserOffers();
      
      return { data, error: null };
    } catch (err: any) {
      console.error('Error claiming offer:', err);
      return { data: null, error: err };
    }
  };

  const redeemOffer = async (offerId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please sign in to redeem offers');
        return { error: new Error('Not authenticated') };
      }

      const { error: updateError } = await supabase
        .from('offer_redemptions')
        .update({ redeemed_at: new Date().toISOString() })
        .eq('offer_id', offerId)
        .eq('user_id', user.id)
        .is('redeemed_at', null);

      if (updateError) {
        toast.error('Failed to redeem offer');
        return { error: updateError };
      }

      toast.success('Offer redeemed successfully!');
      await fetchUserOffers();
      
      return { error: null };
    } catch (err: any) {
      console.error('Error redeeming offer:', err);
      return { error: err };
    }
  };

  const refetch = () => {
    fetchOffers();
    fetchUserOffers();
  };

  return {
    offers,
    userOffers,
    loading,
    error,
    claimOffer,
    redeemOffer,
    refetch,
  };
}
