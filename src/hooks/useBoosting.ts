import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';

export interface BoostPackage {
  id: string;
  name: string;
  description: string;
  duration_days: number;
  price: number;
  currency: string;
  entity_type: string;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BoostEntitlement {
  id: string;
  user_id: string;
  entity_id: string;
  entity_type: string;
  package_id: string;
  boosted_until: string;
  is_active: boolean;
  created_at: string;
}

export function useBoosting() {
  const [packages, setPackages] = useState<BoostPackage[]>([]);
  const [entitlements, setEntitlements] = useState<BoostEntitlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchPackages();
    fetchEntitlements();
  }, []);

  async function fetchPackages() {
    try {
      setLoading(true);

      const { data, error: fetchError } = await supabase
        .from('boost_packages')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (fetchError) throw fetchError;

      setPackages(data || []);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching boost packages:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchEntitlements() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error: fetchError } = await supabase
        .from('boost_entitlements')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .gte('boosted_until', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setEntitlements(data || []);
    } catch (err) {
      console.error('Error fetching entitlements:', err);
    }
  }

  async function createPackage(pkg: Partial<BoostPackage>) {
    try {
      const { data, error: createError } = await supabase
        .from('boost_packages')
        .insert(pkg)
        .select()
        .single();

      if (createError) throw createError;

      await fetchPackages();
      return data;
    } catch (err) {
      console.error('Error creating boost package:', err);
      throw err;
    }
  }

  async function updatePackage(id: string, updates: Partial<BoostPackage>) {
    try {
      const { data, error: updateError } = await supabase
        .from('boost_packages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      await fetchPackages();
      return data;
    } catch (err) {
      console.error('Error updating boost package:', err);
      throw err;
    }
  }

  async function purchaseBoost(entityId: string, entityType: string, days: number) {
    try {
      // First handle payment (this would integrate with Stripe)
      // For now, assume payment is successful

      const { data, error: rpcError } = await supabase.rpc('fn_grant_boost_after_payment', {
        p_entity_id: entityId,
        p_entity_type: entityType,
        p_days: days,
      });

      if (rpcError) throw rpcError;

      await fetchEntitlements();
      return data;
    } catch (err) {
      console.error('Error purchasing boost:', err);
      throw err;
    }
  }

  async function checkBoostStatus(entityId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data } = await supabase
        .from('boost_entitlements')
        .select('*')
        .eq('entity_id', entityId)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .gte('boosted_until', new Date().toISOString())
        .single();

      return !!data;
    } catch (err) {
      return false;
    }
  }

  return {
    packages,
    entitlements,
    loading,
    error,
    createPackage,
    updatePackage,
    purchaseBoost,
    checkBoostStatus,
    refresh: () => {
      fetchPackages();
      fetchEntitlements();
    },
  };
}

