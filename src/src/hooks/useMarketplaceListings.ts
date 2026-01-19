/**
 * useMarketplaceListings Hook
 * Manages marketplace listings with Supabase integration
 * 
 * MASTER GUIDELINE COMPLIANCE:
 * - Single source of truth: Supabase marketplace_listings table
 * - RLS policies: Public read for active, user read/write own, admin full access
 * - No hardcoded data
 * - Comprehensive error handling with diagnostics
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../utils/supabase/client';

export interface MarketplaceListing {
  id: string;
  user_id: string;
  listing_type: 'car' | 'part' | 'accessory' | 'service';
  title: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  thumbnail_url?: string;
  category?: string;
  brand?: string;
  
  // Car-specific fields
  car_brand?: string;
  car_model?: string;
  car_year?: number;
  car_mileage?: number;
  car_condition?: string;
  car_fuel_type?: string;
  car_transmission?: string;
  
  // Location
  location: string;
  latitude?: number;
  longitude?: number;
  
  // Status
  status: 'pending' | 'active' | 'sold' | 'expired' | 'suspended' | 'rejected';
  admin_notes?: string;
  rejection_reason?: string;
  
  // Boost
  is_boosted: boolean;
  boost_package?: 'basic' | 'premium' | 'featured';
  boost_expires_at?: string;
  boost_payment_id?: string;
  
  // Payment
  listing_fee_paid: boolean;
  listing_payment_id?: string;
  listing_payment_amount?: number;
  
  // Analytics
  view_count: number;
  inquiry_count: number;
  favorite_count: number;
  
  // Verification
  is_verified: boolean;
  verification_badge?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  approved_at?: string;
  expires_at?: string;
  sold_at?: string;
  
  // Seller info (from join)
  seller_name?: string;
  seller_email?: string;
  seller_avatar?: string;
  seller_rating?: number;
}

interface UseMarketplaceListingsOptions {
  status?: string;
  listing_type?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  origin_country?: string;
  verified_only?: boolean;
  overseas_only?: boolean;
  isAdmin?: boolean;
}

interface DiagnosticInfo {
  tableExists: boolean;
  hasData: boolean;
  rlsEnabled: boolean;
  errorCode?: string;
  errorDetails?: string;
}

export function useMarketplaceListings(options: UseMarketplaceListingsOptions = {}) {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<DiagnosticInfo | null>(null);

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setDiagnostics(null);

      // Build query with detailed logging
      // NOTE: profiles.rating removed - column doesn't exist
      let query = supabase
        .from('marketplace_listings')
        .select(`
          *,
          profiles:user_id (
            display_name,
            email,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (options.status && options.status !== 'all') {
        query = query.eq('status', options.status);
      } else if (!options.isAdmin) {
        // For non-admin users, only show active listings
        query = query.eq('status', 'active');
      }

      if (options.listing_type && options.listing_type !== 'all') {
        query = query.eq('listing_type', options.listing_type);
      }

      if (options.brand && options.brand !== 'all') {
        query = query.eq('car_brand', options.brand);
      }

      if (options.minPrice !== undefined) {
        query = query.gte('price', options.minPrice);
      }

      if (options.maxPrice !== undefined) {
        query = query.lte('price', options.maxPrice);
      }

      if (options.location && options.location !== 'all') {
        query = query.eq('location', options.location);
      }

      // Origin country filter
      if (options.origin_country && options.origin_country !== 'all') {
        query = query.eq('origin_country', options.origin_country);
      }

      // Verified vendors only filter
      if (options.verified_only) {
        query = query.eq('is_verified_vendor', true);
      }

      // Overseas only filter (non-UAE listings)
      if (options.overseas_only) {
        query = query.neq('origin_country', 'UAE');
      }

      const { data, error: queryError } = await query;

      if (queryError) {
        console.error('❌ Supabase query error:', {
          code: queryError.code,
          message: queryError.message,
          details: queryError.details,
          hint: queryError.hint,
        });

        // Provide diagnostic information
        const diagnostic: DiagnosticInfo = {
          tableExists: queryError.code !== '42P01', // 42P01 = relation does not exist
          hasData: false,
          rlsEnabled: queryError.code === '42501', // 42501 = insufficient privilege
          errorCode: queryError.code,
          errorDetails: queryError.message,
        };
        setDiagnostics(diagnostic);

        // Throw with enhanced error message
        if (queryError.code === '42P01') {
          throw new Error(
            'Marketplace table does not exist. Please run: /MARKETPLACE_FIX_FRESH_START.sql in Supabase SQL Editor.'
          );
        } else if (queryError.code === '42501') {
          throw new Error(
            'Permission denied. Please run: /FIX_MARKETPLACE_RLS_NOW.sql in Supabase SQL Editor to fix RLS policies.'
          );
        } else {
          throw queryError;
        }
      }



      // Transform data to include seller info
      // NOTE: seller_rating removed - profiles.rating column doesn't exist
      const transformedListings = (data || []).map((listing: any) => ({
        ...listing,
        seller_name: listing.profiles?.display_name || 'Unknown Seller',
        seller_email: listing.profiles?.email,
        seller_avatar: listing.profiles?.avatar_url,
        seller_rating: 0, // Default value since rating column doesn't exist
      }));

      setListings(transformedListings);
      setDiagnostics({
        tableExists: true,
        hasData: transformedListings.length > 0,
        rlsEnabled: true,
      });
    } catch (err) {
      console.error('💥 Error fetching marketplace listings:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch listings';
      setError(errorMessage);
      
      // Log actionable fix steps
      console.group('🔧 HOW TO FIX:');
      console.log('1. Open Supabase Dashboard → SQL Editor');
      console.log('2. Run: /MARKETPLACE_FIX_FRESH_START.sql');
      console.log('3. Run: /FIX_MARKETPLACE_RLS_NOW.sql');
      console.log('4. Refresh this page');
      console.groupEnd();
    } finally {
      setLoading(false);
    }
  }, [
    options.status,
    options.listing_type,
    options.brand,
    options.minPrice,
    options.maxPrice,
    options.location,
    options.isAdmin,
  ]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const createListing = async (listingData: Partial<MarketplaceListing>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // ✅ FIX: Build clean payload - DO NOT spread listingData as it may contain invalid columns
      // Only include fields that actually exist in the marketplace_listings table
      // Let Supabase infer columns from payload, no explicit columns parameter
      const insertPayload: Record<string, any> = {
        user_id: user.id,
        title: listingData.title,
        description: listingData.description,
        price: listingData.price,
        currency: listingData.currency || 'AED',
        status: 'pending',
        listing_fee_paid: false,
        is_boosted: false,
        view_count: 0,
        inquiry_count: 0,
        favorite_count: 0,
        is_verified: false,
      };

      // Only add optional fields if they exist and are provided
      if (listingData.listing_type) insertPayload.listing_type = listingData.listing_type;
      if (listingData.category) insertPayload.category = listingData.category;
      if (listingData.location) insertPayload.location = listingData.location;
      if (listingData.images && Array.isArray(listingData.images) && listingData.images.length > 0) {
        insertPayload.images = listingData.images;
      }
      if (listingData.thumbnail_url) insertPayload.thumbnail_url = listingData.thumbnail_url;
      if (listingData.brand) insertPayload.brand = listingData.brand;
      if (listingData.car_brand) insertPayload.car_brand = listingData.car_brand;
      if (listingData.car_model) insertPayload.car_model = listingData.car_model;
      if (listingData.car_year) insertPayload.car_year = listingData.car_year;
      if (listingData.car_mileage) insertPayload.car_mileage = listingData.car_mileage;
      if (listingData.car_condition) insertPayload.car_condition = listingData.car_condition;
      if (listingData.car_fuel_type) insertPayload.car_fuel_type = listingData.car_fuel_type;
      if (listingData.car_transmission) insertPayload.car_transmission = listingData.car_transmission;
      if (listingData.latitude) insertPayload.latitude = listingData.latitude;
      if (listingData.longitude) insertPayload.longitude = listingData.longitude;

      const { data, error: insertError } = await supabase
        .from('marketplace_listings')
        .insert(insertPayload)
        .select()
        .single();

      if (insertError) throw insertError;

      // Refresh listings
      await fetchListings();
      return { data, error: null };
    } catch (err) {
      console.error('Error creating listing:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Failed to create listing' };
    }
  };

  const updateListing = async (listingId: string, updates: Partial<MarketplaceListing>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('marketplace_listings')
        .update(updates)
        .eq('id', listingId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Refresh listings
      await fetchListings();
      return { data, error: null };
    } catch (err) {
      console.error('Error updating listing:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Failed to update listing' };
    }
  };

  const deleteListing = async (listingId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('marketplace_listings')
        .delete()
        .eq('id', listingId);

      if (deleteError) throw deleteError;

      // Refresh listings
      await fetchListings();
      return { error: null };
    } catch (err) {
      console.error('Error deleting listing:', err);
      return { error: err instanceof Error ? err.message : 'Failed to delete listing' };
    }
  };

  const approveListing = async (listingId: string) => {
    return updateListing(listingId, {
      status: 'active',
      approved_at: new Date().toISOString(),
    });
  };

  const rejectListing = async (listingId: string, reason: string) => {
    return updateListing(listingId, {
      status: 'rejected',
      rejection_reason: reason,
    });
  };

  const suspendListing = async (listingId: string, reason: string) => {
    return updateListing(listingId, {
      status: 'suspended',
      admin_notes: reason,
    });
  };

  const boostListing = async (listingId: string, boostPackage: 'basic' | 'premium' | 'featured', paymentId: string) => {
    // Calculate boost duration based on package
    const duration = boostPackage === 'basic' ? 7 : boostPackage === 'premium' ? 14 : 30;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + duration);

    return updateListing(listingId, {
      is_boosted: true,
      boost_package: boostPackage,
      boost_expires_at: expiresAt.toISOString(),
      boost_payment_id: paymentId,
    });
  };

  return {
    listings,
    loading,
    error,
    diagnostics,
    refetch: fetchListings,
    createListing,
    updateListing,
    deleteListing,
    approveListing,
    rejectListing,
    suspendListing,
    boostListing,
  };
}
