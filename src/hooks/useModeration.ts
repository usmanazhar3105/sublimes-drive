import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';

export interface Report {
  id: string;
  post_id: string;
  user_id: string;  // reporter_id
  reason: string;
  details: string | null;
  status: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  action_taken?: string | null;
  moderator_notes?: string | null;
  created_at: string | null;
  updated_at?: string | null;
}

export interface ModerationAction {
  type: 'approve' | 'reject' | 'ban' | 'warn' | 'delete';
  reason: string;
  duration?: number;
}

export interface UseModerationOptions {
  type?: 'posts' | 'listings' | 'comments' | 'all';
  status?: string;
  limit?: number;
}

export function useModeration(options: UseModerationOptions = {}) {
  const [reports, setReports] = useState<Report[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const {
    type = 'all',
    status = 'pending',
    limit = 50,
  } = options;

  useEffect(() => {
    fetchReports();
  }, [type, status, limit]);

  async function fetchReports() {
    try {
      setLoading(true);

      let query = supabase
        .from('post_reports')
        .select('*')
        .limit(limit);

      if (status) query = query.eq('status', status);

      query = query.order('created_at', { ascending: false });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setReports(data || []);
      
      const pending = (data || []).filter(r => r.status === 'pending').length;
      setPendingCount(pending);
      
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  }

  async function takeAction(reportId: string, action: ModerationAction) {
    try {
      const report = reports.find(r => r.id === reportId);
      if (!report) throw new Error('Report not found');

      // Update report status
      await supabase
        .from('post_reports')
        .update({
          status: 'reviewed',
          action_taken: action.type,
          moderator_notes: action.reason,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', reportId);

      // Take action on the content
      if (action.type === 'delete' && report.post_id) {
        await supabase
          .from('posts')
          .update({ status: 'deleted' })
          .eq('id', report.post_id);
      } else if (action.type === 'reject' && report.post_id) {
        await supabase
          .from('posts')
          .update({ status: 'rejected' })
          .eq('id', report.post_id);
      } else if (action.type === 'approve' && report.post_id) {
        await supabase
          .from('posts')
          .update({ status: 'approved' })
          .eq('id', report.post_id);
      }

      // Handle ban action
      if (action.type === 'ban' && report.post_id) {
        const { data: post } = await supabase
          .from('posts')
          .select('user_id')
          .eq('id', report.post_id)
          .single();

        if (post) {
          await supabase
            .from('profiles')
            .update({
              verification_status: 'rejected',
              meta: { banned: true, ban_reason: action.reason },
            })
            .eq('id', post.user_id);
        }
      }

      await fetchReports();
    } catch (err) {
      console.error('Error taking moderation action:', err);
      throw err;
    }
  }

  async function approveContent(contentId: string, contentType: 'post' | 'listing' | 'comment') {
    try {
      if (contentType === 'post') {
        await supabase
          .from('posts')
          .update({ status: 'approved' })
          .eq('id', contentId);
      } else if (contentType === 'listing') {
        await supabase
          .from('market_listings')
          .update({ status: 'approved' })
          .eq('id', contentId);
      } else if (contentType === 'comment') {
        // Comments don't have status - just update the report
        // The comment itself stays approved (no action needed on comments table)
      }

      await fetchReports();
    } catch (err) {
      console.error('Error approving content:', err);
      throw err;
    }
  }

  async function rejectContent(contentId: string, contentType: 'post' | 'listing' | 'comment', reason: string) {
    try {
      if (contentType === 'post') {
        await supabase
          .from('posts')
          .update({ 
            status: 'rejected',
            admin_notes: reason,
          })
          .eq('id', contentId);
      } else if (contentType === 'listing') {
        await supabase
          .from('market_listings')
          .update({ 
            status: 'rejected',
            admin_notes: reason,
          })
          .eq('id', contentId);
      } else if (contentType === 'comment') {
        // Comments don't have status - update content to show it was removed
        await supabase
          .from('comments')
          .update({ 
            content: '[Comment removed by moderator]'
          })
          .eq('id', contentId);
      }

      await fetchReports();
    } catch (err) {
      console.error('Error rejecting content:', err);
      throw err;
    }
  }

  async function deleteContent(contentId: string, contentType: 'post' | 'listing' | 'comment') {
    try {
      if (contentType === 'post') {
        await supabase
          .from('posts')
          .delete()
          .eq('id', contentId);
      } else if (contentType === 'listing') {
        await supabase
          .from('market_listings')
          .delete()
          .eq('id', contentId);
      } else {
        await supabase
          .from('comments')
          .delete()
          .eq('id', contentId);
      }

      await fetchReports();
    } catch (err) {
      console.error('Error deleting content:', err);
      throw err;
    }
  }

  async function banUser(userId: string, reason: string, duration?: number) {
    try {
      const updates: any = {
        verification_status: 'rejected',
        meta: { banned: true, ban_reason: reason },
      };

      if (duration) {
        const banUntil = new Date();
        banUntil.setDate(banUntil.getDate() + duration);
        updates.meta.ban_until = banUntil.toISOString();
      }

      await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      await fetchReports();
    } catch (err) {
      console.error('Error banning user:', err);
      throw err;
    }
  }

  return {
    reports,
    pendingCount,
    loading,
    error,
    takeAction,
    approveContent,
    rejectContent,
    deleteContent,
    banUser,
    refresh: fetchReports,
  };
}

