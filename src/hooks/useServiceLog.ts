import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ServiceLogEntry {
  id: string;
  service_type: string;
  service_date: string;
  mileage?: number;
  cost_amount?: number;
  service_provider?: string;
  notes?: string;
  next_service_date?: string;
  next_service_mileage?: number;
  created_at: string;
}

export function useServiceLog() {
  const [logs, setLogs] = useState<ServiceLogEntry[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('service_log')
        .select('*')
        .order('service_date', { ascending: false });

      if (fetchError) throw fetchError;

      setLogs(data || []);
    } catch (err: any) {
      console.error('Fetch service log error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchReminders = async () => {
    try {
      const { data, error } = await supabase.rpc('fn_get_service_reminders');

      if (error) throw error;

      setReminders(data || []);
    } catch (err: any) {
      console.error('Fetch reminders error:', err);
    }
  };

  const createLog = async (logData: {
    service_type: string;
    service_date: string;
    mileage?: number;
    cost_amount?: number;
    service_provider?: string;
    notes?: string;
    next_service_date?: string;
    next_service_mileage?: number;
  }) => {
    try {
      const { data, error } = await supabase.rpc('fn_create_service_log', {
        p_service_type: logData.service_type,
        p_service_date: logData.service_date,
        p_mileage: logData.mileage || null,
        p_cost_amount: logData.cost_amount || null,
        p_service_provider: logData.service_provider || null,
        p_notes: logData.notes || null,
        p_next_service_date: logData.next_service_date || null,
        p_next_service_mileage: logData.next_service_mileage || null,
      });

      if (error) throw error;

      toast.success('Service log created');
      fetchLogs();
      fetchReminders();
      return data;
    } catch (err: any) {
      console.error('Create service log error:', err);
      toast.error('Failed to create service log');
      return null;
    }
  };

  const updateLog = async (logId: string, updates: Partial<ServiceLogEntry>) => {
    try {
      const { error } = await supabase
        .from('service_log')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', logId);

      if (error) throw error;

      toast.success('Service log updated');
      fetchLogs();
      fetchReminders();
    } catch (err: any) {
      console.error('Update service log error:', err);
      toast.error('Failed to update service log');
    }
  };

  const deleteLog = async (logId: string) => {
    try {
      const { error } = await supabase
        .from('service_log')
        .delete()
        .eq('id', logId);

      if (error) throw error;

      toast.success('Service log deleted');
      fetchLogs();
      fetchReminders();
    } catch (err: any) {
      console.error('Delete service log error:', err);
      toast.error('Failed to delete service log');
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchReminders();
  }, []);

  return {
    logs,
    reminders,
    loading,
    error,
    createLog,
    updateLog,
    deleteLog,
    refetch: fetchLogs,
  };
}
