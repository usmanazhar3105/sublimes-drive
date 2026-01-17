import { useState } from 'react';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner';

export interface ContentReport {
  id: string;
  content_type: 'post' | 'comment' | 'listing' | 'user' | 'garage' | 'event';
  content_id: string;
  reason: string;
  details?: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  created_at: string;
}

export function useContentModeration() {
  const [loading, setLoading] = useState(false);

  const submitReport = async (
    contentType: string,
    contentId: string,
    reason: string,
    details?: string
  ) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('fn_submit_report', {
        p_content_type: contentType,
        p_content_id: contentId,
        p_reason: reason,
        p_details: details || null,
      });

      if (error) throw error;

      toast.success('Report submitted successfully. We will review it shortly.');
      return { success: true, reportId: data };
    } catch (error: any) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report: ' + (error.message || 'Unknown error'));
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const getReports = async (status?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('content_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;

      return { success: true, reports: data || [] };
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      return { success: false, error, reports: [] };
    } finally {
      setLoading(false);
    }
  };

  const moderateContent = async (
    reportId: string,
    actionType: 'warn' | 'hide' | 'delete' | 'ban_user' | 'no_action',
    reason: string,
    notes?: string
  ) => {
    try {
      setLoading(true);
      // This should be called via Edge Function with admin auth
      const { data, error } = await supabase.rpc('fn_moderate_content', {
        p_report_id: reportId,
        p_action_type: actionType,
        p_reason: reason,
        p_notes: notes || null,
      });

      if (error) throw error;

      toast.success('Moderation action completed');
      return { success: true, data };
    } catch (error: any) {
      console.error('Error moderating content:', error);
      toast.error('Failed to moderate content: ' + (error.message || 'Unknown error'));
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    submitReport,
    getReports,
    moderateContent,
  };
}


