import React, { useState, useEffect } from 'react';
import { Check, X, Eye, Clock, CheckCircle, XCircle } from 'lucide-react';
import { getVendorVerifications, updateVendorVerificationStatus } from '../../lib/api/overseas';
import type { VendorVerification } from '../../lib/types/overseas';

export const VerificationQueue: React.FC = () => {
  const [verifications, setVerifications] = useState<VendorVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadVerifications();
  }, []);

  const loadVerifications = async () => {
    try {
      const data = await getVendorVerifications();
      setVerifications(data);
    } catch (error) {
      console.error('Failed to load verifications:', error);
      setMessage({ type: 'error', text: 'Failed to load verifications' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await updateVendorVerificationStatus(id, 'verified');
      setMessage({ type: 'success', text: 'Verification approved' });
      loadVerifications();
    } catch (error) {
      console.error('Failed to approve verification:', error);
      setMessage({ type: 'error', text: 'Failed to approve verification' });
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateVendorVerificationStatus(id, 'rejected');
      setMessage({ type: 'success', text: 'Verification rejected' });
      loadVerifications();
    } catch (error) {
      console.error('Failed to reject verification:', error);
      setMessage({ type: 'error', text: 'Failed to reject verification' });
    }
  };

  const filteredVerifications = verifications.filter(v => {
    if (filter === 'all') return true;
    return v.status === filter;
  });

  const getStatusIcon = (status: VendorVerification['status']) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: VendorVerification['status']) => {
    switch (status) {
      case 'verified':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading verifications...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <CheckCircle className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Verification Queue</h2>
      </div>

      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="flex gap-2">
        {(['all', 'pending', 'verified', 'rejected'] as const).map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredVerifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No verifications found
          </div>
        ) : (
          filteredVerifications.map(verification => (
            <div key={verification.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(verification.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(verification.status)}`}>
                      {verification.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">User ID:</span> {verification.user_id}
                    </div>
                    <div>
                      <span className="font-medium">Document Type:</span> {verification.doc_type}
                    </div>
                    <div>
                      <span className="font-medium">Submitted:</span> {new Date(verification.created_at).toLocaleDateString()}
                    </div>
                    {verification.reviewer_id && (
                      <div>
                        <span className="font-medium">Reviewed by:</span> {verification.reviewer_id}
                      </div>
                    )}
                  </div>

                  {verification.review_notes && (
                    <div className="mt-2">
                      <span className="font-medium text-sm">Review Notes:</span>
                      <p className="text-sm text-gray-600 mt-1">{verification.review_notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <a
                    href={verification.doc_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                    title="View Document"
                  >
                    <Eye className="h-4 w-4" />
                  </a>
                  
                  {verification.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(verification.id)}
                        className="p-2 text-green-600 hover:text-green-700 transition-colors"
                        title="Approve"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleReject(verification.id)}
                        className="p-2 text-red-600 hover:text-red-700 transition-colors"
                        title="Reject"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
