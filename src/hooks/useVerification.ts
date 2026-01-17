import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';

export interface VerificationRequest {
  id: string;
  user_id: string;
  type: string;
  kind?: string;
  status: string;
  documents: any;
  document_urls: string[];
  registration_number: string;
  chassis_number: string;
  car_photos: string[];
  business_name: string;
  business_license: string;
  trade_license: string;
  business_address: string;
  reviewed_by: string;
  reviewed_at: string;
  rejection_reason: string;
  admin_notes: string;
  created_at: string;
  updated_at: string;
}

export interface UseVerificationOptions {
  status?: string;
  type?: string;
  limit?: number;
}

export function useVerification(options: UseVerificationOptions = {}) {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const {
    status,
    type,
    limit = 50,
  } = options;

  useEffect(() => {
    fetchRequests();
    fetchPendingCount();
  }, [status, type, limit]);

  async function fetchRequests() {
    try {
      setLoading(true);

      let query = supabase
        .from('verification_requests')
        .select('*')
        .limit(limit);

      if (status) query = query.eq('status', status);
      
      // Check if the table uses 'type' or 'kind'
      if (type) {
        const { data: sample } = await supabase
          .from('verification_requests')
          .select('*')
          .limit(1)
          .single();

        if (sample && 'type' in sample) {
          query = query.eq('type', type);
        } else if (sample && 'kind' in sample) {
          query = query.eq('kind', type);
        }
      }

      query = query.order('created_at', { ascending: false });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setRequests(data || []);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching verification requests:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPendingCount() {
    try {
      const { data, error: rpcError } = await supabase.rpc('fn_get_pending_verifications_count');

      if (rpcError) {
        // Fallback if RPC doesn't exist
        const { count } = await supabase
          .from('verification_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        setPendingCount(count || 0);
      } else {
        setPendingCount(data || 0);
      }
    } catch (err) {
      console.error('Error fetching pending count:', err);
    }
  }

  async function submitVerification(type: string, documents: any) {
    try {
      const { data, error: rpcError } = await supabase.rpc('fn_submit_verification', {
        p_kind: type,
        p_documents: documents,
      });

      if (rpcError) throw rpcError;

      await fetchRequests();
      return data;
    } catch (err) {
      console.error('Error submitting verification:', err);
      throw err;
    }
  }

  async function approveVerification(requestId: string, notes?: string) {
    try {
      const { data, error: rpcError } = await supabase.rpc('fn_admin_verify', {
        p_request_id: requestId,
        p_status: 'approved',
        p_notes: notes,
      });

      if (rpcError) throw rpcError;

      await fetchRequests();
      await fetchPendingCount();
      return data;
    } catch (err) {
      console.error('Error approving verification:', err);
      throw err;
    }
  }

  async function rejectVerification(requestId: string, reason: string) {
    try {
      const { data, error: rpcError } = await supabase.rpc('fn_admin_verify', {
        p_request_id: requestId,
        p_status: 'rejected',
        p_notes: reason,
      });

      if (rpcError) throw rpcError;

      await fetchRequests();
      await fetchPendingCount();
      return data;
    } catch (err) {
      console.error('Error rejecting verification:', err);
      throw err;
    }
  }

  async function exportVerifications(status?: string) {
    try {
      const { data, error: rpcError } = await supabase.rpc('fn_export_verifications', {
        p_status: status,
      });

      if (rpcError) throw rpcError;

      return data;
    } catch (err) {
      console.error('Error exporting verifications:', err);
      throw err;
    }
  }

  return {
    requests,
    pendingCount,
    loading,
    error,
    submitVerification,
    approveVerification,
    rejectVerification,
    exportVerifications,
    refresh: () => {
      fetchRequests();
      fetchPendingCount();
    },
  };
}

