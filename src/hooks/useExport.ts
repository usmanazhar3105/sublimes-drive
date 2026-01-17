import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function useExport() {
  const [loading, setLoading] = useState(false);


  const exportToCSV = async (
    tableName: string,
    columns: string[],
    filters?: Record<string, any>
  ) => {
    try {
      setLoading(true);

      let query = supabase.from(tableName).select(columns.join(','));

      // Apply filters if provided
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            query = query.eq(key, value);
          }
        });
      }

      const { data, error } = await query;

      if (error) throw error;

      if (!data || data.length === 0) {
        toast.error('No data to export');
        return null;
      }

      // Convert to CSV
      const headers = columns.join(',');
      const rows = data.map(row =>
        columns.map(col => {
          const value = row[col];
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') return JSON.stringify(value);
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value;
        }).join(',')
      );

      const csv = [headers, ...rows].join('\n');

      // Download file
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tableName}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success(`Exported ${data.length} rows`);
      return csv;
    } catch (err: any) {
      console.error('Export error:', err);
      toast.error('Export failed: ' + err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const exportUsers = async (filters?: {
    role?: string;
    verified?: boolean;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.rpc('fn_export_users');
      if (error) throw error;

      const jobId = data as string;
      let job: { status: string; url: string | null } | null = null;

      for (let i = 0; i < 10; i++) {
        const { data: jobData, error: jobError } = await supabase
          .from('export_jobs')
          .select('status,url')
          .eq('id', jobId)
          .maybeSingle();

        if (jobError) throw jobError;

        job = jobData as any;
        if (job?.status === 'done' && job.url) {
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      if (!job || job.status !== 'done' || !job.url) {
        toast.error('Export did not complete. Please try again.');
        return null;
      }

      const href = job.url.startsWith('http')
        ? job.url
        : `${window.location.origin}${job.url}`;

      const a = document.createElement('a');
      a.href = href;
      a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast.success('Export ready');
      return job;
    } catch (err: any) {
      console.error('Export users error:', err);
      toast.error('Export failed: ' + err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const exportListings = async (filters?: {
    type?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    return exportToCSV(
      'marketplace_listings',
      ['id', 'user_id', 'title', 'type', 'status', 'price', 'created_at'],
      filters
    );
  };

  const exportBids = async (filters?: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    return exportToCSV(
      'bid_repair',
      ['id', 'user_id', 'title', 'status', 'created_at', 'updated_at'],
      filters
    );
  };

  const exportPayments = async (filters?: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    return exportToCSV(
      'payments',
      ['id', 'user_id', 'amount', 'currency', 'status', 'created_at', 'payment_method'],
      filters
    );
  };

  return {
    loading,
    exportToCSV,
    exportUsers,
    exportListings,
    exportBids,
    exportPayments,
  };
}
