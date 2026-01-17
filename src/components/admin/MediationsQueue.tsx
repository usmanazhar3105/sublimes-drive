import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, DollarSign, Car, Wrench } from 'lucide-react';
import { getMediationRequests, updateMediationStatus } from '../../lib/api/overseas';
import type { MediationRequest } from '../../lib/types/overseas';

export const MediationsQueue: React.FC = () => {
  const [mediations, setMediations] = useState<MediationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'requested' | 'active' | 'completed' | 'refunded' | 'cancelled'>('all');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadMediations();
  }, []);

  const loadMediations = async () => {
    try {
      const data = await getMediationRequests();
      setMediations(data);
    } catch (error) {
      console.error('Failed to load mediations:', error);
      setMessage({ type: 'error', text: 'Failed to load mediations' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: MediationRequest['status'], notes?: string) => {
    try {
      await updateMediationStatus(id, status, notes);
      setMessage({ type: 'success', text: 'Mediation status updated' });
      loadMediations();
    } catch (error) {
      console.error('Failed to update mediation:', error);
      setMessage({ type: 'error', text: 'Failed to update mediation' });
    }
  };

  const filteredMediations = mediations.filter(m => {
    if (filter === 'all') return true;
    return m.status === filter;
  });

  const getStatusIcon = (status: MediationRequest['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'active':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'requested':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'refunded':
        return <XCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: MediationRequest['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'active':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'requested':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'refunded':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading mediations...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <DollarSign className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Mediations Queue</h2>
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

      <div className="flex gap-2 flex-wrap">
        {(['all', 'requested', 'active', 'completed', 'refunded', 'cancelled'] as const).map(status => (
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
        {filteredMediations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No mediations found
          </div>
        ) : (
          filteredMediations.map(mediation => (
            <div key={mediation.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(mediation.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(mediation.status)}`}>
                      {mediation.status}
                    </span>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      {mediation.kind === 'car' ? (
                        <Car className="h-4 w-4" />
                      ) : (
                        <Wrench className="h-4 w-4" />
                      )}
                      {mediation.kind}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Listing ID:</span> {mediation.listing_id}
                    </div>
                    <div>
                      <span className="font-medium">Buyer ID:</span> {mediation.buyer_id}
                    </div>
                    <div>
                      <span className="font-medium">Vendor ID:</span> {mediation.vendor_id}
                    </div>
                    <div>
                      <span className="font-medium">Service Fee:</span> AED {mediation.service_fee_aed.toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Refundable:</span> {mediation.refundable_percent}%
                    </div>
                    <div>
                      <span className="font-medium">Created:</span> {new Date(mediation.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  {mediation.notes && (
                    <div className="mt-2">
                      <span className="font-medium text-sm">Notes:</span>
                      <p className="text-sm text-gray-600 mt-1">{mediation.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  {mediation.status === 'requested' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(mediation.id, 'active')}
                        className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
                      >
                        Activate
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(mediation.id, 'cancelled')}
                        className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  
                  {mediation.status === 'active' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(mediation.id, 'completed')}
                        className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(mediation.id, 'refunded')}
                        className="px-3 py-1 bg-orange-600 text-white rounded-md text-sm hover:bg-orange-700 transition-colors"
                      >
                        Refund
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
