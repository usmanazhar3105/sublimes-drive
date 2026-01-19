import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';

export interface Listing {
  id: string;
  user_id?: string;
  owner_id?: string;
  seller_id?: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  condition: string;
  images: string[];
  location: string;
  status: string;
  is_featured: boolean;
  is_boosted: boolean;
  views_count: number;
  saves_count: number;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

export interface UseListingsOptions {
  category?: string;
  status?: string;
  search?: string;
  sortBy?: 'created_at' | 'price' | 'views_count';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  userId?: string;
}

export function useListings(options: UseListingsOptions = {}) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);

  const {
    category,
    status = 'approved',
    search,
    sortBy = 'created_at',
    sortOrder = 'desc',
    limit = 20,
    userId,
  } = options;

  useEffect(() => {
    fetchListings();
  }, [category, status, search, sortBy, sortOrder, limit, userId, page]);

  async function fetchListings() {
    try {
      setLoading(true);

      let query = supabase
        .from('marketplace_listings')
        .select('*')
        .range(page * limit, (page + 1) * limit - 1);

      // Apply filters
      if (category) query = query.eq('category', category);
      if (status) query = query.eq('status', status);
      if (userId) {
        // Try different owner column names
        const ownerCol = await getOwnerColumn();
        query = query.eq(ownerCol, userId);
      }
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error: fetchError, count } = await query;

      if (fetchError) throw fetchError;

      if (page === 0) {
        setListings(data || []);
      } else {
        setListings((prev) => [...prev, ...(data || [])]);
      }

      setHasMore((data?.length || 0) === limit);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching listings:', err);
    } finally {
      setLoading(false);
    }
  }

  async function getOwnerColumn(): Promise<string> {
    // Check which column name is used
    const { data } = await supabase
      .from('marketplace_listings')
      .select('*')
      .limit(1)
      .single();

    if (!data) return 'user_id';

    if ('user_id' in data) return 'user_id';
    if ('owner_id' in data) return 'owner_id';
    if ('seller_id' in data) return 'seller_id';
    return 'user_id';
  }

  async function createListing(listing: Partial<Listing>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const ownerCol = await getOwnerColumn();

      // Map fields to correct database column names
      const dbPayload: any = {
        [ownerCol]: user.id,
        title: listing.title,
        description: listing.description,
        price: listing.price,
        currency: listing.currency || 'AED',
        category: listing.category,
        status: 'pending',
      };

      // Map location fields - use location and emirate (simpler schema)
      // DO NOT use 'city' - it doesn't exist in the schema
      if ((listing as any).city) {
        dbPayload.location = (listing as any).city;
        dbPayload.emirate = (listing as any).city;
      }
      
      // Map condition
      if ((listing as any).meta?.condition) {
        dbPayload.condition = (listing as any).meta.condition;
      }

      // Map media/images - use images column (exists in simpler schema)
      if ((listing as any).media && Array.isArray((listing as any).media)) {
        dbPayload.images = (listing as any).media;
      } else if ((listing as any).images) {
        dbPayload.images = (listing as any).images;
      }

      // Note: brand, model, year, mileage, country, meta don't exist as direct columns
      // in the simpler schema, so we skip them to avoid column errors
      // They can be stored in a JSONB field if the schema supports it, but for now we skip

      const { data, error: createError } = await supabase
        .from('marketplace_listings')
        .insert(dbPayload)
        .select()
        .single();

      if (createError) {
        console.error('Error creating listing:', createError);
        // If error is about missing columns, try simpler payload
        if (createError.code === 'PGRST204' || createError.message?.includes('column')) {
          console.warn('Retrying with simpler payload (column mismatch)...');
          
          // Try with minimal required fields only
          const simplePayload: any = {
            [ownerCol]: user.id,
            title: listing.title,
            description: listing.description,
            price: listing.price,
            currency: listing.currency || 'AED',
            category: listing.category,
            status: 'pending',
          };
          
          // Try location field variations - use location and emirate (NOT city)
          if ((listing as any).city) {
            simplePayload.location = (listing as any).city;
            simplePayload.emirate = (listing as any).city;
          }
          
          // Add condition if available
          if ((listing as any).meta?.condition) {
            simplePayload.condition = (listing as any).meta.condition;
          }
          
          // Add images if available
          if ((listing as any).media) {
            simplePayload.images = (listing as any).media;
          }
          
          const { data: simpleData, error: simpleError } = await supabase
            .from('marketplace_listings')
            .insert(simplePayload)
            .select()
            .single();
          
          if (simpleError) {
            throw simpleError;
          }
          
          setListings((prev) => [simpleData, ...prev]);
          return simpleData;
        }
        throw createError;
      }

      setListings((prev) => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error creating listing:', err);
      throw err;
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

      setListings((prev) =>
        prev.map((listing) => (listing.id === id ? data : listing))
      );
      return { data, error: null };
    } catch (err) {
      console.error('Error updating listing:', err);
      return { data: null, error: err };
    }
  }

  async function deleteListing(id: string) {
    try {
      const { error: deleteError } = await supabase
        .from('marketplace_listings')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setListings((prev) => prev.filter((listing) => listing.id !== id));
    } catch (err) {
      console.error('Error deleting listing:', err);
      throw err;
    }
  }

  async function toggleSave(listingId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: existing } = await supabase
        .from('listing_saves')
        .select('id')
        .eq('listing_id', listingId)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        await supabase
          .from('listing_saves')
          .delete()
          .eq('listing_id', listingId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('listing_saves')
          .insert({ listing_id: listingId, user_id: user.id });
      }

      await fetchListings();
    } catch (err) {
      console.error('Error toggling save:', err);
      throw err;
    }
  }

  function loadMore() {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  }

  function refresh() {
    setPage(0);
    fetchListings();
  }

  return {
    listings,
    loading,
    error,
    hasMore,
    createListing,
    updateListing,
    deleteListing,
    toggleSave,
    loadMore,
    refresh,
  };
}

