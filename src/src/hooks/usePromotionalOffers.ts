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
  code?: string; // Alias for redemption_code
  redemption_code?: string;
  redeemed_at?: string;
  expires_at?: string;
  expiry_date?: string; // Alias
  created_at: string;
  claimed_at?: string; // Alias for created_at
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
        .select('*');

      // Apply filters - only show active offers
      if (filters?.active !== false) {
        // Try is_active first, fallback to status
        query = query.eq('is_active', true);
        
        // Also filter by valid_until date if column exists
        const now = new Date().toISOString();
        query = query.or(`valid_until.is.null,valid_until.gte.${now}`);
      }

      // Filter by status if column exists (approved or active)
      // This will be handled in the error fallback if column doesn't exist

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      // Order by featured first, then by creation date
      query = query.order('is_featured', { ascending: false })
                   .order('created_at', { ascending: false });

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('⚠️ Error fetching offers:', fetchError);
        console.error('Error code:', fetchError.code);
        console.error('Error message:', fetchError.message);
        
        // If column error, try simpler query
        if (fetchError.code === 'PGRST204' || fetchError.message?.includes('column')) {
          console.warn('⚠️ Retrying with simpler query (column mismatch)...');
          
          // Retry without is_active filter, filter by status instead
          let simpleQuery = supabase
            .from('offers')
            .select('*')
            .order('created_at', { ascending: false });
          
          // Try status filter
          try {
            simpleQuery = simpleQuery.eq('status', 'approved');
          } catch {
            // If status doesn't exist, try active
            try {
              simpleQuery = simpleQuery.eq('status', 'active');
            } catch {
              // If neither exists, just get all offers
            }
          }
          
          // Filter by valid_until if it exists
          const now = new Date().toISOString();
          try {
            simpleQuery = simpleQuery.or(`valid_until.is.null,valid_until.gte.${now}`);
          } catch {
            // Column might not exist, continue
          }
          
          if (filters?.category && filters.category !== 'all') {
            simpleQuery = simpleQuery.eq('category', filters.category);
          }
          
          const { data: simpleData, error: simpleError } = await simpleQuery;
          
          if (simpleError) {
            // If still fails, try without any filters
            const { data: fallbackData, error: fallbackError } = await supabase
              .from('offers')
              .select('*')
              .order('created_at', { ascending: false })
              .limit(50);
            
            if (fallbackError) {
              if (fallbackError.code === '42P01') {
                console.warn('⚠️ Offers table not found yet');
                setOffers([]);
                setError(null);
                setLoading(false);
                return;
              }
              throw fallbackError;
            }
            
            // Filter expired offers client-side
            const activeOffers = (fallbackData || []).filter((offer: any) => {
              if (offer.valid_until) {
                return new Date(offer.valid_until) >= new Date();
              }
              return true;
            });
            
            const transformedOffers = activeOffers.map((offer: any) => transformOffer(offer));
            setOffers(transformedOffers);
            setError(null);
            setLoading(false);
            return;
          }
          
          // Filter expired offers client-side
          const activeOffers = (simpleData || []).filter((offer: any) => {
            if (offer.valid_until) {
              return new Date(offer.valid_until) >= new Date();
            }
            return true;
          });
          
          const transformedOffers = activeOffers.map((offer: any) => transformOffer(offer));
          setOffers(transformedOffers);
          setError(null);
          setLoading(false);
          return;
        } else if (fetchError.code === '42P01') {
          console.warn('⚠️ Offers table not found yet');
          setOffers([]);
          setError(null);
        } else {
          toast.error(`Failed to fetch offers: ${fetchError.message}`);
          throw fetchError;
        }
      } else if (data) {
        // Filter expired offers client-side (in case valid_until filter didn't work)
        const activeOffers = (data || []).filter((offer: any) => {
          // Must be active
          if (offer.is_active === false) return false;
          
          // Check valid_until date
          if (offer.valid_until) {
            return new Date(offer.valid_until) >= new Date();
          }
          
          return true;
        });
        
        // Transform data to match interface
        const transformedOffers: PromotionalOffer[] = activeOffers.map((offer: any) => transformOffer(offer));
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

  // Helper function to transform offer data
  function transformOffer(offer: any): PromotionalOffer {
    return {
      ...offer,
      discount_percentage: offer.discount_percentage || offer.discount_percent || 0,
      discount_percent: offer.discount_percent || offer.discount_percentage || 0,
      offer_price: offer.discounted_price || offer.offer_price || 0,
      redemptions_count: offer.redemption_count || offer.current_redemptions || offer.redemptions_count || 0,
      provider_name: offer.provider_name || offer.vendor_name || 'Unknown Vendor',
      provider_verified: offer.provider_verified || false,
      claims_count: offer.redemption_count || offer.current_redemptions || offer.claims_count || 0,
      max_claims: offer.max_redemptions || offer.max_claims || null,
      currency: offer.currency || 'AED',
      images: offer.images || (offer.image_url ? [offer.image_url] : []),
      image_url: offer.image_url || (offer.images && offer.images[0]) || undefined,
    };
  }

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
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.warn('⚠️ Error fetching user offers:', fetchError);
        // If table doesn't exist, return empty array
        if (fetchError.code === '42P01') {
          setUserOffers([]);
          return;
        }
        setUserOffers([]);
      } else {
        // Transform to match UserOffer interface
        const transformedUserOffers: UserOffer[] = (data || []).map((redemption: any) => ({
          id: redemption.id,
          offer_id: redemption.offer_id,
          user_id: redemption.user_id,
          code: redemption.code || redemption.redemption_code || '',
          redemption_code: redemption.redemption_code || redemption.code || '',
          redeemed_at: redemption.redeemed_at,
          expires_at: redemption.expires_at || redemption.expiry_date || '',
          expiry_date: redemption.expiry_date || redemption.expires_at || '',
          created_at: redemption.created_at,
          claimed_at: redemption.created_at, // Alias for created_at
        }));
        setUserOffers(transformedUserOffers);
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

      // Increment redemption count (if RPC exists)
      try {
        await supabase.rpc('increment_offer_redemptions', { offer_id: offerId });
      } catch (rpcError) {
        // If RPC doesn't exist, manually update
        console.warn('RPC increment_offer_redemptions not available, skipping');
      }

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
