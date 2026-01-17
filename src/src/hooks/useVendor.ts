import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase/client';

export interface VendorApplication {
  id: string;
  user_id: string;
  documents: Array<{ type: string; url: string }>;
  preferred_countries: string[];
  shipping_capability: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

export function useVendor(userId?: string) {
  const [application, setApplication] = useState<VendorApplication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchApplication() {
      try {
        const { data, error } = await supabase
          .from('vendor_applications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') throw error; // Ignore "not found" error

        setApplication(data);
      } catch (err) {
        console.error('Error fetching vendor application:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchApplication();
  }, [userId]);

  const submitApplication = async (data: {
    documents: Array<{ type: string; url: string }>;
    preferred_countries: string[];
    shipping_capability: string;
  }) => {
    if (!userId) return { success: false };

    try {
      const { data: newApp, error } = await supabase
        .from('vendor_applications')
        .insert({
          user_id: userId,
          ...data,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      setApplication(newApp);
      return { success: true, application: newApp };
    } catch (err) {
      console.error('Error submitting vendor application:', err);
      return { success: false, error: err };
    }
  };

  return {
    application,
    loading,
    submitApplication,
    isPending: application?.status === 'pending',
    isApproved: application?.status === 'approved',
    isRejected: application?.status === 'rejected'
  };
}

// Admin hook for vendor applications
export function useVendorApplications() {
  const [applications, setApplications] = useState<VendorApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchApplications() {
      try {
        const { data, error } = await supabase
          .from('vendor_applications')
          .select('*, user:user_id(display_name, email, avatar_url)')
          .order('created_at', { ascending: false });

        if (error) throw error;

        setApplications(data || []);
      } catch (err) {
        console.error('Error fetching vendor applications:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchApplications();
  }, []);

  const approveApplication = async (applicationId: string, userId: string) => {
    try {
      // Update application status
      const { error: updateError } = await supabase
        .from('vendor_applications')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (updateError) throw updateError;

      // Grant vendor role (update profiles table instead of user_roles)
      const { error: roleError } = await supabase
        .from('profiles')
        .update({
          role: 'vendor'
        })
        .eq('id', userId);

      if (roleError) throw roleError;

      // Refresh applications
      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId ? { ...app, status: 'approved' as const } : app
        )
      );

      return { success: true };
    } catch (err) {
      console.error('Error approving application:', err);
      return { success: false, error: err };
    }
  };

  const rejectApplication = async (applicationId: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('vendor_applications')
        .update({
          status: 'rejected',
          notes,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (error) throw error;

      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId ? { ...app, status: 'rejected' as const, notes } : app
        )
      );

      return { success: true };
    } catch (err) {
      console.error('Error rejecting application:', err);
      return { success: false, error: err };
    }
  };

  return {
    applications,
    loading,
    approveApplication,
    rejectApplication
  };
}
