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
      const payload: any = {
        user_id: auth.user.id,
        title: data.title ?? null,
        description: data.description ?? null,
        car_make: data.car_make ?? null,
        car_model: data.car_model ?? null,
        budget_min: data.budget_min ?? null,
        budget_max: data.budget_max ?? null,
        location_id: data.location_id ?? null,
        media: (data.media && Array.isArray(data.media)) ? data.media : [],
        status: 'open',
        created_at: new Date().toISOString(),
      }
      const { data: row, error: e } = await (supabase as any).from('bid_repair').insert(payload).select('*').single()
      if (e) throw e
      setError(null)
      return row
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const getUserBidRequests = async () => {
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) return []
    const { data } = await supabase.from('bid_repair').select('*').eq('user_id', auth.user.id).order('created_at', { ascending: false })
    return data || []
  }

  const getAvailableBids = async () => {
    const { data } = await supabase.from('bid_repair').select('*').eq('status', 'open').order('created_at', { ascending: false })
    return data || []
  }

  const createBidReply = async (bidId: string, data: { amount?: number; message?: string }) => {
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) throw new Error('Not authenticated')
    const payload: any = {
      bid_id: bidId,
      user_id: auth.user.id,
      amount: data.amount ?? null,
      message: data.message ?? null,
      status: 'active',
      created_at: new Date().toISOString(),
    }
    const { data: row, error: e } = await (supabase as any).from('bid_repair_replies').insert(payload).select('*').single()
    if (e) throw e
    return row
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
