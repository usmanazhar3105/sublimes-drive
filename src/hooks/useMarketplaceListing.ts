import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Listing {
  id: string;
  owner_id: string;
  type: 'car' | 'parts';
  title: string;
  description: string;
  price: number;
  status: string;
  featured: boolean;
  boosted: boolean;
  created_at: string;
  // ... other fields
}

export function useMarketplaceListing() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  

  const fetchListings = async (filters?: {
    type?: 'car' | 'parts';
    status?: string;
    featured?: boolean;
  }) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('marketplace_listings')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.featured) {
        query = query.eq('featured', true);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setListings(data || []);
    } catch (err: any) {
      console.error('Fetch listings error:', err);
      setError(err.message);
      toast.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = async (listingId: string) => {
    try {
      const { data, error } = await supabase.rpc('fn_toggle_listing_save', {
        p_listing_id: listingId,
      });

      if (error) throw error;

      toast.success(data.saved ? 'Listing saved' : 'Listing unsaved');
      return data;
    } catch (err: any) {
      console.error('Toggle save error:', err);
      toast.error('Failed to save listing');
      return null;
    }
  };

  const trackView = async (listingId: string, anonHash?: string) => {
    try {
      await supabase.rpc('fn_register_listing_view', {
        p_listing_id: listingId,
        p_anon_hash: anonHash,
      });
    } catch (err) {
      // Silent fail for view tracking
      console.error('View tracking error:', err);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  return {
    listings,
    loading,
    error,
    refetch: fetchListings,
    toggleSave,
    trackView,
  };
}
