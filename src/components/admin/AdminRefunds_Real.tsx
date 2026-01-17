/**
 * Admin Refunds Management - Real Database & Stripe Integration
 * Handles refund requests with Stripe API integration
 */

import { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Eye,
  Download,
  Search,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';

interface RefundRequest {
  id: string;
  transaction_id: string;
  user_id: string;
  original_amount: number;
  requested_amount: number;
  currency: string;
  reason: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  reviewed_at?: string;
  processed_at?: string;
  admin_notes?: string;
  stripe_payment_id?: string;
  stripe_refund_id?: string;
  user?: {
    display_name?: string;
    email?: string;
  };
}

interface RefundStats {
  pending: number;
  approved: number;
  totalRefunded: number;
  highPriority: number;
}

export function AdminRefunds_Real() {
  const [loading, setLoading] = useState(true);
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
  const [stats, setStats] = useState<RefundStats>({
    pending: 0,
    approved: 0,
    totalRefunded: 0,
    highPriority: 0,
  });
  const [filterStatus, setFilterStatus] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState<RefundRequest | null>(null);
  const [showRejectionModal, setShowRejectionModal] = useState<RefundRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRefundRequests();
    const interval = setInterval(fetchRefundRequests, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchRefundRequests = async () => {
    setLoading(true);
    try {
      let refunds: RefundRequest[] = [];
      let profilesMap: Record<string, { display_name?: string; email?: string }> = {};

      // Try to fetch from dedicated refund_requests table first
      const { data: dedicatedRefunds, error: dedicatedError } = await supabase
        .from('refund_requests')
        .select(`
          id,
          user_id,
          transaction_id,
          original_amount,
          requested_amount,
          currency,
          reason,
          description,
          status,
          priority,
          admin_notes,
          reviewed_at,
          processed_at,
          stripe_payment_id,
          stripe_refund_id,
          metadata,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (!dedicatedError && dedicatedRefunds && dedicatedRefunds.length > 0) {
        // Use dedicated refund_requests table
        const userIds = [...new Set(dedicatedRefunds.map(r => r.user_id).filter(Boolean))];
        
        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, display_name, email')
            .in('id', userIds);

          if (profilesData) {
            profilesMap = profilesData.reduce((acc, profile) => {
              acc[profile.id] = { display_name: profile.display_name, email: profile.email };
              return acc;
            }, {} as Record<string, { display_name?: string; email?: string }>);
          }
        }

        refunds = dedicatedRefunds.map((item: any) => ({
          id: item.id,
          transaction_id: item.transaction_id || item.id,
          user_id: item.user_id,
          original_amount: Math.abs(Number(item.original_amount) || 0),
          requested_amount: Math.abs(Number(item.requested_amount) || 0),
          currency: item.currency || 'AED',
          reason: item.reason || 'No reason provided',
          description: item.description || '',
          status: item.status || 'pending',
          priority: item.priority || 'medium',
          created_at: item.created_at,
          reviewed_at: item.reviewed_at,
          processed_at: item.processed_at,
          admin_notes: item.admin_notes,
          stripe_payment_id: item.stripe_payment_id,
          stripe_refund_id: item.stripe_refund_id,
          user: profilesMap[item.user_id] || { display_name: 'Unknown User', email: '' },
        }));
      } else {
        // Fallback: Fetch from wallet_transactions with refund-related types
        console.log('Falling back to wallet_transactions for refunds');
        
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('wallet_transactions')
          .select(`
            id,
            user_id,
            amount,
            currency,
            type,
            description,
            reference_id,
            metadata,
            status,
            stripe_payment_id,
            created_at
          `)
          .or('type.eq.refund,type.eq.refund_pending,type.eq.refund_approved,type.eq.refund_rejected,status.eq.refunded')
          .order('created_at', { ascending: false });

        if (transactionsError) throw transactionsError;

        // Get unique user IDs and fetch their profiles
        const userIds = [...new Set((transactionsData || []).map(t => t.user_id).filter(Boolean))];
        
        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, display_name, email')
            .in('id', userIds);

          if (profilesData) {
            profilesMap = profilesData.reduce((acc, profile) => {
              acc[profile.id] = { display_name: profile.display_name, email: profile.email };
              return acc;
            }, {} as Record<string, { display_name?: string; email?: string }>);
          }
        }

        // Map transactions to refund requests
        refunds = (transactionsData || []).map((item: any) => {
          const metadata = item.metadata || {};
          let refundStatus: 'pending' | 'approved' | 'rejected' | 'processed' = 'pending';
          
          if (item.type === 'refund_pending' || item.status === 'pending') {
            refundStatus = 'pending';
          } else if (item.type === 'refund_approved' || item.status === 'approved') {
            refundStatus = 'approved';
          } else if (item.type === 'refund_rejected' || item.status === 'rejected') {
            refundStatus = 'rejected';
          } else if (item.type === 'refund' || item.status === 'refunded' || item.status === 'completed') {
            refundStatus = 'processed';
          }

          return {
            id: item.id,
            transaction_id: item.reference_id || item.id,
            user_id: item.user_id,
            original_amount: Math.abs(Number(item.amount) || 0),
            requested_amount: Math.abs(Number(item.amount) || 0),
            currency: item.currency || 'AED',
            reason: metadata.reason || item.description || 'No reason provided',
            description: item.description || '',
            status: refundStatus,
            priority: metadata.priority || 'medium',
            created_at: item.created_at,
            reviewed_at: metadata.reviewed_at,
            processed_at: metadata.processed_at,
            admin_notes: metadata.admin_notes,
            stripe_payment_id: item.stripe_payment_id || metadata.stripe_payment_id,
            stripe_refund_id: metadata.stripe_refund_id,
            user: profilesMap[item.user_id] || { display_name: 'Unknown User', email: '' },
          };
        });
      }

      setRefundRequests(refunds);

      // Calculate stats
      const pending = refunds.filter(r => r.status === 'pending').length;
      const approved = refunds.filter(r => r.status === 'approved' || r.status === 'processed').length;
      const totalRefunded = refunds
        .filter(r => r.status === 'processed')
        .reduce((sum, r) => sum + r.requested_amount, 0);
      const highPriority = refunds.filter(r => r.status === 'pending' && r.priority === 'high').length;

      setStats({ pending, approved, totalRefunded, highPriority });
    } catch (error: any) {
      console.error('Error fetching refund requests:', error);
      toast.error('Failed to load refund requests');
    } finally {
      setLoading(false);
    }
  };

  const approveRefund = async (refund: RefundRequest) => {
    setProcessing(true);
    try {
      const now = new Date().toISOString();
      
      // Update transaction status to approved
      const { error: updateError } = await supabase
        .from('wallet_transactions')
        .update({
          type: 'refund_approved',
          status: 'approved',
          updated_at: now,
          metadata: {
            ...(typeof refund === 'object' ? { original_reason: refund.reason } : {}),
            admin_notes: adminNotes,
            reviewed_at: now,
            reviewed_status: 'approved',
          },
        })
        .eq('id', refund.id);

      if (updateError) throw updateError;

      // Process Stripe refund if payment exists
      if (refund.stripe_payment_id) {
        try {
          const { data: stripeData, error: stripeError } = await supabase.functions.invoke(
            'stripe-webhook',
            {
              body: {
                action: 'create_refund',
                payment_intent: refund.stripe_payment_id,
                amount: Math.round(refund.requested_amount * 100), // Convert to cents
                reason: 'requested_by_customer',
                metadata: {
                  admin_notes: adminNotes,
                  transaction_id: refund.transaction_id,
                },
              },
            }
          );

          if (stripeError) {
            console.error('Stripe refund error:', stripeError);
            toast.warning('Approved but Stripe refund failed. Process manually in Stripe Dashboard.');
          } else {
            const processedAt = new Date().toISOString();
            
            // Update with Stripe refund ID
            await supabase
              .from('wallet_transactions')
              .update({
                type: 'refund',
                status: 'completed',
                updated_at: processedAt,
                metadata: {
                  stripe_refund_id: stripeData?.refund_id,
                  processed_at: processedAt,
                  processed_status: 'completed',
                },
              })
              .eq('id', refund.id);

            // Create credit transaction for user wallet
            await supabase.from('wallet_transactions').insert({
              user_id: refund.user_id,
              amount: refund.requested_amount,
              currency: refund.currency,
              type: 'credit',
              description: `Refund processed: ${refund.reason || 'Refund'}`,
              status: 'completed',
              reference_type: 'refund',
              reference_id: refund.id,
              stripe_refund_id: stripeData?.refund_id,
              created_at: processedAt,
            });

            toast.success('Refund approved and processed via Stripe');
          }
        } catch (stripeError) {
          console.error('Stripe refund error:', stripeError);
          toast.warning('Approved but Stripe integration failed. Process manually.');
        }
      } else {
        const processedAt = new Date().toISOString();
        
        // Manual refund without Stripe
        await supabase
          .from('wallet_transactions')
          .update({
            type: 'refund',
            status: 'completed',
            updated_at: processedAt,
            metadata: {
              processed_at: processedAt,
              processed_status: 'completed',
            },
          })
          .eq('id', refund.id);

        // Create credit transaction for user wallet
        await supabase.from('wallet_transactions').insert({
          user_id: refund.user_id,
          amount: refund.requested_amount,
          currency: refund.currency,
          type: 'credit',
          description: `Refund processed: ${refund.reason || 'Manual Refund'}`,
          status: 'completed',
          reference_type: 'refund',
          reference_id: refund.id,
          created_at: processedAt,
        });

        toast.success('Refund approved and processed');
      }

      setShowApprovalModal(null);
      setAdminNotes('');
      fetchRefundRequests();
    } catch (error: any) {
      console.error('Error approving refund:', error);
      toast.error(error.message || 'Failed to approve refund');
    } finally {
      setProcessing(false);
    }
  };

  const rejectRefund = async (refund: RefundRequest) => {
    setProcessing(true);
    try {
      const now = new Date().toISOString();
      
      const { error } = await supabase
        .from('wallet_transactions')
        .update({
          type: 'refund_rejected',
          status: 'rejected',
          updated_at: now,
          metadata: {
            original_reason: refund.reason,
            admin_notes: adminNotes,
            rejection_reason: adminNotes,
            reviewed_at: now,
            reviewed_status: 'rejected',
          },
        })
        .eq('id', refund.id);

      if (error) throw error;

      toast.success('Refund rejected');
      setShowRejectionModal(null);
      setAdminNotes('');
      fetchRefundRequests();
    } catch (error: any) {
      console.error('Error rejecting refund:', error);
      toast.error(error.message || 'Failed to reject refund');
    } finally {
      setProcessing(false);
    }
  };

  const exportRefunds = () => {
    try {
      const headers = ['ID', 'Transaction ID', 'User', 'Email', 'Amount', 'Currency', 'Reason', 'Status', 'Priority', 'Stripe Payment ID', 'Created', 'Admin Notes'];
      
      const csvRows = filteredRefunds.map(r => [
        r.id,
        r.transaction_id,
        r.user?.display_name || 'N/A',
        r.user?.email || 'N/A',
        r.requested_amount.toFixed(2),
        r.currency,
        `"${(r.reason || '').replace(/"/g, '""')}"`,
        r.status,
        r.priority,
        r.stripe_payment_id || 'N/A',
        new Date(r.created_at).toLocaleString(),
        `"${(r.admin_notes || '').replace(/"/g, '""')}"`,
      ].join(','));

      const csvContent = [headers.join(','), ...csvRows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `refunds_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Refunds exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export refunds');
    }
  };

  const filteredRefunds = refundRequests.filter(refund => {
    const matchesStatus = filterStatus === 'all' || refund.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      (refund.user?.display_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (refund.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      refund.transaction_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-orange-500" />;
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'processed': return <RefreshCw className="w-4 h-4 text-blue-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
      case 'approved': return 'text-green-500 bg-green-500/10 border-green-500/30';
      case 'rejected': return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'processed': return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'medium': return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
      case 'low': return 'text-green-500 bg-green-500/10 border-green-500/30';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/30';
    }
  };

  if (loading && refundRequests.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--sublimes-gold)]" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-[var(--sublimes-dark-bg)] min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--sublimes-light-text)] mb-2">
              Refund Management
            </h1>
            <p className="text-gray-400">Review and process refund requests</p>
          </div>
          <div className="flex space-x-3">
            <Button 
              className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]"
              onClick={exportRefunds}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button 
              variant="outline"
              onClick={fetchRefundRequests}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-8 w-8 text-orange-500" />
              <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/30">
                Pending
              </Badge>
            </div>
            <div className="text-3xl font-bold text-[var(--sublimes-light-text)]">
              {stats.pending}
            </div>
            <div className="text-sm text-gray-400">Pending Requests</div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <Badge className="bg-green-500/10 text-green-500 border-green-500/30">
                Success
              </Badge>
            </div>
            <div className="text-3xl font-bold text-[var(--sublimes-light-text)]">
              {stats.approved}
            </div>
            <div className="text-sm text-gray-400">Approved</div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <RefreshCw className="h-8 w-8 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-[var(--sublimes-gold)]">
              AED {stats.totalRefunded.toFixed(2)}
            </div>
            <div className="text-sm text-gray-400">Total Refunded</div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <Badge className="bg-red-500/10 text-red-500 border-red-500/30">
                Urgent
              </Badge>
            </div>
            <div className="text-3xl font-bold text-[var(--sublimes-light-text)]">
              {stats.highPriority}
            </div>
            <div className="text-sm text-gray-400">High Priority</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)] mb-6">
        <CardContent className="p-6">
          <div className="flex space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search refunds..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)]"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="processed">Processed</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Refund Requests */}
      <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
        <CardContent className="p-6">
          {filteredRefunds.length === 0 ? (
            <div className="text-center py-12">
              <RefreshCw className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-xl font-semibold text-[var(--sublimes-light-text)] mb-2">
                No Refund Requests Found
              </p>
              <p className="text-gray-400">
                No refund requests match your current filters.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRefunds.map((refund) => (
                <div
                  key={refund.id}
                  className="border border-[var(--sublimes-border)] rounded-lg p-6 hover:border-[var(--sublimes-gold)]/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-[var(--sublimes-light-text)]">
                          {refund.user?.display_name || refund.user?.email || 'Unknown User'}
                        </h3>
                        <Badge className={getPriorityColor(refund.priority)}>
                          {refund.priority}
                        </Badge>
                        <Badge className={getStatusColor(refund.status)}>
                          {getStatusIcon(refund.status)}
                          <span className="ml-1">{refund.status}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400 mb-1">{refund.user?.email}</p>
                      <p className="text-sm text-gray-400">
                        Transaction: {refund.transaction_id}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[var(--sublimes-gold)] mb-1">
                        {refund.currency} {refund.requested_amount.toFixed(2)}
                      </div>
                      <p className="text-xs text-gray-400">
                        {new Date(refund.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-[var(--sublimes-light-text)] mb-1">
                      Reason:
                    </p>
                    <p className="text-sm text-gray-400">{refund.reason}</p>
                    {refund.description && (
                      <>
                        <p className="text-sm font-medium text-[var(--sublimes-light-text)] mt-2 mb-1">
                          Description:
                        </p>
                        <p className="text-sm text-gray-400">{refund.description}</p>
                      </>
                    )}
                  </div>

                  {refund.admin_notes && (
                    <div className="mb-4 p-3 bg-[var(--sublimes-dark-bg)]/50 rounded-lg border border-[var(--sublimes-border)]">
                      <p className="text-xs font-medium text-gray-400 mb-1">Admin Notes:</p>
                      <p className="text-sm text-[var(--sublimes-light-text)]">{refund.admin_notes}</p>
                    </div>
                  )}

                  {refund.status === 'pending' && (
                    <div className="flex space-x-2">
                      <Button
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                        onClick={() => setShowApprovalModal(refund)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Refund
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-red-500 text-red-500 hover:bg-red-500/10"
                        onClick={() => setShowRejectionModal(refund)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval Modal */}
      {showApprovalModal && (
        <Dialog open={!!showApprovalModal} onOpenChange={() => setShowApprovalModal(null)}>
          <DialogContent className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
            <DialogHeader>
              <DialogTitle className="text-[var(--sublimes-light-text)]">
                Approve Refund Request
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-sm text-green-500 mb-2">
                  Refund Amount: {showApprovalModal.currency} {showApprovalModal.requested_amount.toFixed(2)}
                </p>
                <p className="text-xs text-gray-400">
                  User: {showApprovalModal.user?.display_name || showApprovalModal.user?.email}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-[var(--sublimes-light-text)] mb-2 block">
                  Admin Notes (Optional)
                </label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this approval..."
                  className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                  rows={3}
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  className="flex-1 bg-green-500 hover:bg-green-600"
                  onClick={() => approveRefund(showApprovalModal)}
                  disabled={processing}
                >
                  {processing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Confirm Approval
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowApprovalModal(null)}
                  disabled={processing}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && (
        <Dialog open={!!showRejectionModal} onOpenChange={() => setShowRejectionModal(null)}>
          <DialogContent className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
            <DialogHeader>
              <DialogTitle className="text-[var(--sublimes-light-text)]">
                Reject Refund Request
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-sm text-red-500 mb-2">
                  Refund Amount: {showRejectionModal.currency} {showRejectionModal.requested_amount.toFixed(2)}
                </p>
                <p className="text-xs text-gray-400">
                  User: {showRejectionModal.user?.display_name || showRejectionModal.user?.email}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-[var(--sublimes-light-text)] mb-2 block">
                  Reason for Rejection <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Provide a reason for rejecting this refund request..."
                  className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                  rows={3}
                  required
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  className="flex-1 bg-red-500 hover:bg-red-600"
                  onClick={() => rejectRefund(showRejectionModal)}
                  disabled={!adminNotes || processing}
                >
                  {processing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  Confirm Rejection
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowRejectionModal(null)}
                  disabled={processing}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}





