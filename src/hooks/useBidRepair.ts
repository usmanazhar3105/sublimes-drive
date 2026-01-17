import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';

export interface BidRequest {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  images: string[];
  status: string;
  created_at: string;
  updated_at: string;
}

export interface BidReply {
  id: string;
  request_id: string;
  garage_id: string;
  message: string;
  amount: number;
  estimated_days: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface UseBidRepairOptions {
  status?: string;
  userId?: string;
  limit?: number;
}

export function useBidRepair(options: UseBidRepairOptions = {}) {
  const [requests, setRequests] = useState<BidRequest[]>([]);
  const [replies, setReplies] = useState<BidReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const {
    status,
    userId,
    limit = 20,
  } = options;

  useEffect(() => {
    fetchRequests();
    fetchReplies();
  }, [status, userId, limit]);

  async function fetchRequests() {
    try {
      setLoading(true);

      let query = supabase
        .from('bid_requests')
        .select('*')
        .limit(limit);

      if (status) query = query.eq('status', status);
      if (userId) query = query.eq('user_id', userId);

      query = query.order('created_at', { ascending: false });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setRequests(data || []);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching bid requests:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchReplies() {
    try {
      let query = supabase
        .from('bid_replies')
        .select('*')
        .limit(limit);

      if (status) query = query.eq('status', status);

      query = query.order('created_at', { ascending: false });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setReplies(data || []);
    } catch (err) {
      console.error('Error fetching bid replies:', err);
    }
  }

  async function createRequest(request: Partial<BidRequest>) {
    try {
      const { data, error: rpcError } = await supabase.rpc('fn_create_bid_request', {
        p_title: request.title,
        p_description: request.description,
        p_category: request.category,
        p_budget: request.budget,
        p_images: request.images || [],
      });

      if (rpcError) throw rpcError;

      await fetchRequests();
      return data;
    } catch (err) {
      console.error('Error creating bid request:', err);
      throw err;
    }
  }

  async function replyToBid(requestId: string, message: string, amount: number, estimatedDays?: number) {
    try {
      const { data, error: rpcError } = await supabase.rpc('fn_reply_to_bid', {
        p_request_id: requestId,
        p_message: message,
        p_amount: amount,
        p_estimated_days: estimatedDays,
      });

      if (rpcError) throw rpcError;

      await fetchReplies();
      return data;
    } catch (err) {
      console.error('Error replying to bid:', err);
      throw err;
    }
  }

  async function acceptBid(replyId: string) {
    try {
      const { data, error: rpcError } = await supabase.rpc('fn_accept_bid', {
        p_reply_id: replyId,
      });

      if (rpcError) throw rpcError;

      await fetchRequests();
      await fetchReplies();
      return data;
    } catch (err) {
      console.error('Error accepting bid:', err);
      throw err;
    }
  }

  async function canMessage(requestId: string, userId: string): Promise<boolean> {
    try {
      const { data, error: rpcError } = await supabase.rpc('fn_can_message', {
        p_request_id: requestId,
        p_user_id: userId,
      });

      if (rpcError) throw rpcError;

      return data;
    } catch (err) {
      console.error('Error checking message permission:', err);
      return false;
    }
  }

  return {
    requests,
    replies,
    loading,
    error,
    createRequest,
    replyToBid,
    acceptBid,
    canMessage,
    refresh: () => {
      fetchRequests();
      fetchReplies();
    },
  };
}

