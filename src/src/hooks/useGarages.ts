import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase/client';

export interface Garage {
  id: string;
  name: string;
  name_ar?: string;
  description?: string;
  description_ar?: string;
  logo_url?: string;
  cover_image_url?: string;
  owner_id: string;
  location_id?: string;
  address?: string;
  coordinates?: { lat: number; lng: number };
  phone?: string;
  email?: string;
  website?: string;
  hours?: Record<string, { open: string; close: string; closed: boolean }>;
  services: string[]; // service_category IDs
  rating?: number;
  review_count?: number;
  is_verified: boolean;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useGarages() {
  const [garages, setGarages] = useState<Garage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGarages = async (filters?: {
    location?: string;
    services?: string[];
    verified?: boolean;
    featured?: boolean;
    search?: string;
  }) => {
    try {
      setLoading(true);
      let query = supabase
        .from('garages')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('rating', { ascending: false, nullsFirst: false });

      if (filters?.location) {
        query = query.eq('location_id', filters.location);
      }

      if (filters?.verified !== undefined) {
        query = query.eq('is_verified', filters.verified);
      }

      if (filters?.featured !== undefined) {
        query = query.eq('is_featured', filters.featured);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters?.services && filters.services.length > 0) {
        query = query.contains('services', filters.services);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setGarages(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching garages:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGarages();
  }, []);

  return {
    garages,
    loading,
    error,
    fetchGarages,
    refetch: fetchGarages,
  };
}

export function useGarage(id: string) {
  const [garage, setGarage] = useState<Garage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGarage = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('garages')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      setGarage(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching garage:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGarage();
  }, [id]);

  return {
    garage,
    loading,
    error,
    refetch: fetchGarage,
  };
}

export function useCreateGarage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createGarage = async (garageData: Partial<Garage>) => {
    try {
      setLoading(true);
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        throw new Error('Must be logged in to create a garage');
      }

      const { data, error: createError } = await (supabase as any)
        .from('garages')
        .insert({
          ...garageData,
          owner_id: user.user.id,
        })
        .select()
        .single();

      if (createError) throw createError;

      setError(null);
      return data;
    } catch (err: any) {
      console.error('Error creating garage:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createGarage,
    loading,
    error,
  };
}

export function useUpdateGarage(id: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateGarage = async (updates: Partial<Garage>) => {
    try {
      setLoading(true);
      const { data, error: updateError } = await (supabase as any)
        .from('garages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      setError(null);
      return data;
    } catch (err: any) {
      console.error('Error updating garage:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateGarage,
    loading,
    error,
  };
}

export function useGarageReviews(garageId: string) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async () => {
    if (!garageId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('garage_reviews')
        .select('*')
        .eq('garage_id', garageId)
        .order('created_at', { ascending: false });
      if (fetchError) throw fetchError;
      setReviews(data || []);
      setError(null);
    } catch (err: any) {
      setReviews([]);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createReview = async (data: { rating: number; title?: string; comment?: string }) => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) throw new Error('Not authenticated');
    const payload: any = {
      garage_id: garageId,
      user_id: auth.user.id,
      rating: data.rating,
      title: data.title ?? null,
      comment: data.comment ?? null,
      created_at: new Date().toISOString(),
    };
    const { data: inserted, error: insertError } = await supabase
      .from('garage_reviews')
      .insert(payload)
      .select('*')
      .single();
    if (insertError) throw insertError;
    setReviews((prev) => [inserted, ...prev]);
    return inserted;
  };

  const updateReview = async (reviewId: string, updates: { rating?: number; title?: string; comment?: string }) => {
    const { data, error: updateError } = await supabase
      .from('garage_reviews')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', reviewId)
      .select('*')
      .single();
    if (updateError) throw updateError;
    setReviews((prev) => prev.map((r) => (r.id === reviewId ? data : r)));
    return data;
  };

  const deleteReview = async (reviewId: string) => {
    const { error: delError } = await supabase
      .from('garage_reviews')
      .delete()
      .eq('id', reviewId);
    if (delError) throw delError;
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    return { success: true };
  };

  useEffect(() => {
    fetchReviews();
  }, [garageId]);

  return {
    reviews,
    loading,
    error,
    createReview,
    updateReview,
    deleteReview,
    refetch: fetchReviews,
  };
}
