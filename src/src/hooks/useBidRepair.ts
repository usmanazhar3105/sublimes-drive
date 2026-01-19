import { useState } from 'react'
import { supabase, apiCall } from '../../utils/supabase/client'

export function useBidRepair() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createBidRequest = async (data: { title?: string; description?: string; car_make?: string; car_model?: string; budget_min?: number; budget_max?: number; location_id?: string; media?: string[] }) => {
    try {
      setLoading(true)
      const { data: auth } = await supabase.auth.getUser()
      if (!auth.user) throw new Error('Not authenticated')
      
      // Build payload with only fields that exist in the schema
      // The error indicates owner_id is required (NOT NULL constraint)
      // Set owner_id as primary, and also set user_id for schemas that use it
      const payload: any = {
        owner_id: auth.user.id, // REQUIRED - Some schemas use this (NOT NULL)
        title: data.title ?? null,
        description: data.description ?? null,
        status: 'open',
      }
      
      // Also try user_id for schemas that use it instead of owner_id
      // Note: Setting both shouldn't cause issues as Supabase ignores non-existent columns
      // But we prioritize owner_id since the error indicates it's required
      
      // Add optional fields only if provided
      if (data.car_make !== undefined) {
        payload.car_make = data.car_make;
      }
      if (data.car_model !== undefined) {
        payload.car_model = data.car_model;
      }
      
      // Handle media/images - check which column exists
      if (data.media && Array.isArray(data.media) && data.media.length > 0) {
        // Try images first (simpler schema), then media (JSONB schema)
        payload.images = data.media;
        payload.media = data.media; // Try both
      }
      
      // Only add budget columns if they're actually provided (not null/undefined)
      // These columns may not exist in all schema versions
      const hasBudgetMin = data.budget_min !== undefined && data.budget_min !== null && !isNaN(data.budget_min);
      const hasBudgetMax = data.budget_max !== undefined && data.budget_max !== null && !isNaN(data.budget_max);
      
      // We'll try to insert budget columns, but if they fail, we'll retry without them
      if (hasBudgetMin) {
        payload.budget_min = data.budget_min;
      }
      if (hasBudgetMax) {
        payload.budget_max = data.budget_max;
      }
      
      if (data.location_id !== undefined) {
        payload.location_id = data.location_id;
      }
      
      let row: any;
      let e: any;
      
      // Try insert
      const result = await (supabase as any).from('bid_repair').insert(payload).select('*').single()
      row = result.data;
      e = result.error;
      
      // If error is about missing columns or owner_id constraint, retry with correct column
      if (e && (e.code === 'PGRST204' || e.code === '23502' || e.message?.includes('column') || e.message?.includes('budget') || e.message?.includes('owner_id') || e.message?.includes('user_id'))) {
        console.warn('Retrying with corrected column names (schema mismatch)...');
        
        // Try with owner_id only (if error was about user_id)
        if (e.message?.includes('owner_id') || e.code === '23502') {
          const ownerPayload: any = {
            owner_id: auth.user.id,
            title: data.title ?? null,
            description: data.description ?? null,
            status: 'open',
          }
          
          if (data.car_make !== undefined) {
            ownerPayload.car_make = data.car_make;
          }
          if (data.car_model !== undefined) {
            ownerPayload.car_model = data.car_model;
          }
          
          if (data.media && Array.isArray(data.media) && data.media.length > 0) {
            ownerPayload.images = data.media;
          }
          
          const ownerResult = await (supabase as any).from('bid_repair').insert(ownerPayload).select('*').single()
          row = ownerResult.data;
          e = ownerResult.error;
          
          if (!e) {
            setError(null)
            return row
          }
        }
        
        // Remove budget columns and retry - ensure owner_id is set
        const simplePayload: any = {
          owner_id: auth.user.id, // REQUIRED - must be set
          title: data.title ?? null,
          description: data.description ?? null,
          status: 'open',
        }
        
        // Also set user_id for schemas that use it instead
        simplePayload.user_id = auth.user.id;
        
        if (data.car_make !== undefined) {
          simplePayload.car_make = data.car_make;
        }
        if (data.car_model !== undefined) {
          simplePayload.car_model = data.car_model;
        }
        
        // Try images column (simpler schema)
        if (data.media && Array.isArray(data.media) && data.media.length > 0) {
          simplePayload.images = data.media;
        }
        
        if (data.location_id !== undefined) {
          simplePayload.location_id = data.location_id;
        }
        
        const retryResult = await (supabase as any).from('bid_repair').insert(simplePayload).select('*').single()
        row = retryResult.data;
        e = retryResult.error;
      }
      
      if (e) throw e
      setError(null)
      return row
    } catch (err: any) {
      console.error('Error creating bid request:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const getUserBidRequests = async () => {
    try {
      const { data: auth } = await supabase.auth.getUser()
      if (!auth.user) return []
      
      // Try user_id first, fallback to owner_id if column doesn't exist
      let query = supabase.from('bid_repair').select('*').order('created_at', { ascending: false })
      
      // Try user_id column
      try {
        const { data, error } = await query.eq('user_id', auth.user.id)
        if (!error) return data || []
      } catch {
        // If user_id doesn't exist, try owner_id
        try {
          const { data, error } = await supabase.from('bid_repair').select('*').eq('owner_id', auth.user.id).order('created_at', { ascending: false })
          if (!error) return data || []
        } catch {
          return []
        }
      }
      
      return []
    } catch (err) {
      console.error('Error fetching user bid requests:', err)
      return []
    }
  }

  const getAvailableBids = async () => {
    try {
      const { data, error } = await supabase.from('bid_repair').select('*').eq('status', 'open').order('created_at', { ascending: false })
      if (error) {
        console.error('Error fetching available bids:', error)
        return []
      }
      return data || []
    } catch (err) {
      console.error('Error fetching available bids:', err)
      return []
    }
  }

  const createBidReply = async (bidId: string, data: { amount?: number; message?: string }) => {
    try {
      const { data: auth } = await supabase.auth.getUser()
      if (!auth.user) throw new Error('Not authenticated')
      
      // Try different table names and column names based on schema
      const payload: any = {
        bid_id: bidId,
        message: data.message ?? null,
      }
      
      // Try garage_id first (most common schema), fallback to user_id
      payload.garage_id = auth.user.id;
      payload.garage_owner_id = auth.user.id; // Alternative column name
      
      // Map amount to different possible column names
      if (data.amount !== undefined && data.amount !== null) {
        payload.price_estimate = data.amount;
        payload.quote_amount = data.amount;
        payload.amount = data.amount;
      }
      
      payload.status = 'pending'; // Default status
      
      // Try bid_repair_replies first, fallback to bid_replies
      let row: any;
      let e: any;
      
      try {
        const result = await (supabase as any).from('bid_repair_replies').insert(payload).select('*').single()
        row = result.data;
        e = result.error;
      } catch {
        // Try bid_replies table
        try {
          const result = await (supabase as any).from('bid_replies').insert(payload).select('*').single()
          row = result.data;
          e = result.error;
        } catch (err: any) {
          e = err;
        }
      }
      
      if (e) {
        // If error is about column mismatch, try simpler payload
        if (e.code === 'PGRST204' || e.message?.includes('column')) {
          console.warn('Retrying with simpler payload (column mismatch)...');
          const simplePayload: any = {
            bid_id: bidId,
            garage_id: auth.user.id,
            message: data.message ?? null,
            price_estimate: data.amount ?? null,
            status: 'pending',
          }
          
          const retryResult = await (supabase as any).from('bid_repair_replies').insert(simplePayload).select('*').single()
          row = retryResult.data;
          e = retryResult.error;
        }
        
        if (e) throw e
      }
      
      return row
    } catch (err: any) {
      console.error('Error creating bid reply:', err)
      throw err
    }
  }

  const getMyBidReplies = async () => {
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) return []
    const { data } = await supabase.from('bid_repair_replies').select('*').eq('user_id', auth.user.id).order('created_at', { ascending: false })
    return data || []
  }

  const withdrawBid = async (replyId: string) => {
    const { error: e } = await supabase.from('bid_repair_replies').update({ status: 'withdrawn' }).eq('id', replyId)
    if (e) throw e
    return { success: true }
  }

  const acceptBid = async (bidId: string, replyId: string) => {
    const { error: e1 } = await supabase.from('bid_repair').update({ status: 'accepted', accepted_reply_id: replyId }).eq('id', bidId)
    if (e1) throw e1
    return { success: true }
  }

  const completeBid = async (bidId: string) => {
    const { error: e } = await supabase.from('bid_repair').update({ status: 'completed' }).eq('id', bidId)
    if (e) throw e
    return { success: true }
  }

  const getBidWalletBalance = async () => {
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) return 0
    const { data, error } = await supabase.from('bid_wallet').select('balance').eq('user_id', auth.user.id).maybeSingle()
    if (error) return 0
    return (data as any)?.balance ?? 0
  }

  const topUpBidCredits = async (amount: number) => {
    const res = await apiCall('/stripe/create-checkout', { method: 'POST', body: JSON.stringify({ amount, description: 'Bid Credits Top-up' }) }, true)
    return res
  }

  const getBidTransactions = async (limit = 50) => {
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) return []
    const { data } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', auth.user.id)
      .order('created_at', { ascending: false })
      .limit(limit)
    return data || []
  }

  return {
    loading,
    error,
    createBidRequest,
    getUserBidRequests,
    getAvailableBids,
    createBidReply,
    getMyBidReplies,
    withdrawBid,
    acceptBid,
    completeBid,
    getBidWalletBalance,
    topUpBidCredits,
    getBidTransactions,
  }
}
