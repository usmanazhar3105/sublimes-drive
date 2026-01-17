import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase/client';

export interface Listing {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  status: 'draft' | 'active' | 'sold' | 'archived';
  category: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  city: string;
  country: string;
  media: string[];
  meta: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export function useListings(filters?: {
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  query?: string;
  myListings?: boolean;
}) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchListings();
  }, [filters?.brand, filters?.minPrice, filters?.maxPrice, filters?.minYear, filters?.maxYear, filters?.query, filters?.myListings]);

  async function fetchListings() {
    try {
      setLoading(true);
      
      // 🔥 FIXED: Query from marketplace_listings (not listings)
      let query = supabase
        .from('marketplace_listings')
        .select('*')
        .order('created_at', { ascending: false });

      // 🔥 Filter by current user's listings (for "My Listings" page)
      if (filters?.myListings) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          query = query.eq('user_id', user.id);
        } else {
          // No user logged in, return empty
          setListings([]);
          setError(null);
          setLoading(false);
          return;
        }
      } else {
        // Only show active listings for public view
        query = query.eq('status', 'active');
      }

      // Apply filters
      if (filters?.brand) {
        query = query.eq('car_brand', filters.brand);
      }
      if (filters?.minPrice !== undefined && filters?.minPrice > 0) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters?.maxPrice !== undefined && filters?.maxPrice < 1000000) {
        query = query.lte('price', filters.maxPrice);
      }
      if (filters?.minYear) {
        query = query.gte('car_year', filters.minYear);
      }
      if (filters?.maxYear) {
        query = query.lte('car_year', filters.maxYear);
      }
      if (filters?.query) {
        query = query.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
      }

      query = query.limit(50);

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('Error fetching listings:', fetchError);
        throw fetchError;
      }
      
      setListings(data || []);
      setError(null);
    } catch (err) {
      console.error('Fetch listings error:', err);
      // Show empty state on error
      setListings([]);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }

  async function createListing(listing: Partial<Listing>) {
    try {
      const { data, error: createError } = await supabase
        .from('marketplace_listings')
        .insert([listing])
        .select()
        .single();

      if (createError) throw createError;
      
      // Log analytics event
      try {
        // Analytics via analytics_events table - disabled
        // await supabase.rpc('log_event', {
        //   p_name: 'listing_created',
        //   p_props: { listing_id: data.id },
        // });
      } catch (logErr) {
        // Ignore analytics errors
        console.warn('Analytics logging failed:', logErr);
      }

      await fetchListings();
      return { data, error: null };
    } catch (err) {
      console.error('Error creating listing:', err);
      return { data: null, error: err as Error };
    }
  }

  async function updateListing(id: string, updates: Partial<Listing>) {
    try {
      const { data, error: updateError } = await supabase
        .from('marketplace_listings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      await fetchListings();
      return { data, error: null };
    } catch (err) {
      console.error('Error updating listing:', err);
      return { data: null, error: err as Error };
    }
  }

  async function deleteListing(id: string) {
    try {
      const { error: deleteError } = await supabase
        .from('marketplace_listings')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      await fetchListings();
      return { error: null };
    } catch (err) {
      console.error('Error deleting listing:', err);
      return { error: err as Error };
    }
  }

  return {
    listings,
    loading,
    error,
    refetch: fetchListings,
    createListing,
    updateListing,
    deleteListing,
  };
}

export function useListing(id: string) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (id) {
      fetchListing();
    }
  }, [id]);

  async function fetchListing() {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('marketplace_listings')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      setListing(data);
      setError(null);

      // Increment view count
      try {
        await supabase.rpc('increment_listing_views', { p_listing_id: id });
      } catch (rpcErr) {
        console.warn('View count increment failed:', rpcErr);
      }
      
      // Log analytics event
      try {
        // Analytics via analytics_events table - disabled
        // await supabase.rpc('log_event', {
        //   p_name: 'listing_viewed',
        //   p_props: { listing_id: id },
        // });
      } catch (logErr) {
        console.warn('Analytics logging failed:', logErr);
      }
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching listing:', err);
    } finally {
      setLoading(false);
    }
  }

  return { listing, loading, error, refetch: fetchListing };
}
