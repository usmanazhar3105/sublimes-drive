import { supabase } from '@/lib/supabase';

/**
 * Export data to CSV format
 */
export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  // Get headers from first row
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    // Header row
    headers.join(','),
    // Data rows
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        // Handle null/undefined
        if (value === null || value === undefined) return '';
        // Escape quotes and wrap in quotes if contains comma/quote/newline
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export admin data with filters
 */
export const exportAdminData = async (
  tableName: string,
  filters?: Record<string, any>,
  filename?: string
) => {
  
  
  try {
    let query = supabase.from(tableName).select('*');
    
    // Apply filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          query = query.eq(key, value);
        }
      });
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    if (!data || data.length === 0) throw new Error('No data found');
    
    exportToCSV(data, filename || tableName);
    return { success: true, count: data.length };
  } catch (error: any) {
    console.error('Export error:', error);
    throw new Error(error.message || 'Export failed');
  }
};

/**
 * Export button component props
 */
export interface ExportButtonProps {
  tableName: string;
  filters?: Record<string, any>;
  filename?: string;
  label?: string;
  className?: string;
}
