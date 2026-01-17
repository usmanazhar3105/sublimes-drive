import React, { useState } from 'react';
import { Download, Loader2, Check, X } from 'lucide-react';
import { exportAdminData } from '@/utils/exportUtils';

interface ExportButtonProps {
  tableName: string;
  filters?: Record<string, any>;
  filename?: string;
  label?: string;
  className?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  tableName,
  filters,
  filename,
  label = 'Export CSV',
  className = ''
}) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleExport = async () => {
    setLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      const result = await exportAdminData(tableName, filters, filename);
      setStatus('success');
      setMessage(`Exported ${result.count} records`);
      
      // Reset after 3 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 3000);
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Export failed');
      
      // Reset after 5 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  const getButtonColor = () => {
    if (status === 'success') return 'bg-green-500/10 text-green-500 border-green-500';
    if (status === 'error') return 'bg-red-500/10 text-red-500 border-red-500';
    return 'bg-[var(--sublimes-card-bg)] text-[var(--sublimes-light-text)] border-[var(--sublimes-border)] hover:bg-[var(--sublimes-dark-bg)]';
  };

  const getIcon = () => {
    if (loading) return <Loader2 className="w-4 h-4 animate-spin" />;
    if (status === 'success') return <Check className="w-4 h-4" />;
    if (status === 'error') return <X className="w-4 h-4" />;
    return <Download className="w-4 h-4" />;
  };

  return (
    <div className="flex flex-col items-end space-y-1">
      <button
        onClick={handleExport}
        disabled={loading}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getButtonColor()} ${className}`}
      >
        {getIcon()}
        <span className="text-sm font-medium">{label}</span>
      </button>
      
      {message && (
        <div className={`text-xs ${status === 'error' ? 'text-red-400' : 'text-green-400'}`}>
          {message}
        </div>
      )}
    </div>
  );
};

// Batch Export Component
interface BatchExportProps {
  exports: Array<{
    tableName: string;
    label: string;
    filters?: Record<string, any>;
  }>;
}

export const BatchExport: React.FC<BatchExportProps> = ({ exports }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-[var(--sublimes-border)] bg-[var(--sublimes-card-bg)] hover:bg-[var(--sublimes-dark-bg)] transition-colors"
      >
        <Download className="w-4 h-4" />
        <span className="text-sm font-medium">Batch Export</span>
      </button>

      {expanded && (
        <div className="absolute right-0 mt-2 w-64 bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-lg shadow-lg z-50 p-2">
          <div className="text-xs text-gray-400 px-3 py-2 font-medium">
            Select Export
          </div>
          <div className="space-y-1">
            {exports.map((exp, idx) => (
              <ExportButton
                key={idx}
                tableName={exp.tableName}
                filters={exp.filters}
                label={exp.label}
                className="w-full justify-start"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

