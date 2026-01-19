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
      
      // 🔥 Query from marketplace_listings - start with basic query
      let query = supabase
        .from('marketplace_listings')
        .select('*')
        .order('created_at', { ascending: false });

      // 🔥 Filter by current user's listings (for "My Listings" page)
      if (filters?.myListings) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Try user_id first, if it fails, try seller_id
          query = query.eq('user_id', user.id);
        } else {
          // No user logged in, return empty
          setListings([]);
          setError(null);
          setLoading(false);
          return;
        }
      } else {
        // Only show active/approved listings for public view
        // Try status='approved' first
        query = query.eq('status', 'approved');
      }

      // Apply filters
      if (filters?.minPrice !== undefined && filters?.minPrice > 0) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters?.maxPrice !== undefined && filters?.maxPrice < 1000000) {
        query = query.lte('price', filters.maxPrice);
      }
      if (filters?.minYear) {
        query = query.gte('year', filters.minYear);
      }
      if (filters?.maxYear) {
        query = query.lte('year', filters.maxYear);
      }
      if (filters?.query) {
        query = query.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
      }

      query = query.limit(50);

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('Error fetching listings:', fetchError);
        // If error is about column not found, try simpler query
        if (fetchError.code === 'PGRST204' || fetchError.message?.includes('column')) {
          console.warn('Retrying with simpler query (column mismatch detected)...');
          // Retry with basic query - try is_active instead of status
          let simpleQuery = supabase
            .from('marketplace_listings')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);
          
          if (filters?.myListings) {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              // Try seller_id if user_id failed
              simpleQuery = simpleQuery.eq('seller_id', user.id);
            }
          } else {
            // Try is_active filter
            simpleQuery = simpleQuery.eq('is_active', true);
          }
          
          const { data: simpleData, error: simpleError } = await simpleQuery;
          if (simpleError) {
            // If still fails, try without any status filter
            const { data: fallbackData, error: fallbackError } = await supabase
              .from('marketplace_listings')
              .select('*')
              .order('created_at', { ascending: false })
              .limit(50);
            
            if (fallbackError) {
              throw fallbackError;
            }
            
            const transformedListings = (fallbackData || []).map((item: any) => transformListing(item));
            setListings(transformedListings);
            setError(null);
            setLoading(false);
            return;
          }
          
          // Transform the simple data
          const transformedListings = (simpleData || []).map((item: any) => transformListing(item));
          setListings(transformedListings);
          setError(null);
          setLoading(false);
          return;
        } else {
          throw fetchError;
        }
      }
      
      // Transform data to match Listing interface
      const transformedListings = (data || []).map((item: any) => transformListing(item));
      setListings(transformedListings);
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

  // Helper function to transform database row to Listing interface
  function transformListing(item: any): Listing {
    return {
      id: item.id,
      seller_id: item.seller_id || item.user_id || item.owner_id || '',
      title: item.title || '',
      description: item.description || '',
      price: parseFloat(item.price) || 0,
      currency: item.currency || 'AED',
      status: item.status || (item.is_active ? 'active' : 'archived') as any,
      category: item.category || item.category_id || 'cars',
      brand: item.brand || item.brand_id || '',
      model: item.model || item.model_id || '',
      year: item.year || null,
      mileage: item.mileage || null,
      city: item.location_city || item.location || item.emirate || '',
      country: item.location_country || 'AE',
      media: Array.isArray(item.images) ? item.images : (Array.isArray(item.media) ? item.media : []),
      meta: {
        condition: item.condition,
        is_featured: item.is_featured || false,
        is_boosted: item.is_boosted || false,
        views_count: item.view_count || item.views_count || 0,
        favorite_count: item.favorite_count || item.likes_count || 0,
      },
      created_at: item.created_at,
      updated_at: item.updated_at,
    };
  }

  async function createListing(listing: Partial<Listing>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // ✅ FIX: Build clean payload with only fields that exist in the table
      // DO NOT pass the entire listing object - it may contain fields that don't exist
      // Let Supabase infer columns from the payload, don't use explicit columns parameter
      const insertPayload: Record<string, any> = {
        user_id: user.id,
        title: listing.title,
        description: listing.description,
        price: listing.price,
        currency: listing.currency || 'AED',
        status: listing.status || 'pending',
      };

      // Only add fields that exist and are provided
      if (listing.category) insertPayload.category = listing.category;
      if (listing.brand) insertPayload.brand = listing.brand;
      if (listing.model) insertPayload.model = listing.model;
      if (listing.year) insertPayload.year = listing.year;
      if (listing.mileage) insertPayload.mileage = listing.mileage;
      if (listing.city) {
        insertPayload.location = listing.city;
        insertPayload.emirate = listing.city;
      }
      if (listing.country) insertPayload.location_country = listing.country;
      if (listing.media && Array.isArray(listing.media) && listing.media.length > 0) {
        insertPayload.images = listing.media;
      }

      const { data, error: createError } = await supabase
        .from('marketplace_listings')
        .insert(insertPayload)
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
    refetch: async () => {
      await fetchListings();
    },
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
