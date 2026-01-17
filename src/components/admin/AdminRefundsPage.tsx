import { useState } from 'react';
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Eye,
  Download,
  Search,
  MessageSquare
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from 'sonner';

interface RefundRequest {
  id: string;
  transactionId: string;
  userId: string;
  userName: string;
  userEmail: string;
  originalAmount: number;
  requestedAmount: number;
  currency: string;
  reason: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  reviewedAt?: Date;
  processedAt?: Date;
  adminNotes?: string;
  paymentReference: string;
  listingType: string;
  supportingDocuments?: string[];
}

export function AdminRefundsPage() {
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState<RefundRequest | null>(null);
  const [showRejectionModal, setShowRejectionModal] = useState<RefundRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock refund requests data
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([
    {
      id: 'ref_001',
      transactionId: 'txn_001',
      userId: 'user_123',
      userName: 'Ahmad Al-Rashid',
      userEmail: 'ahmad@example.com',
      originalAmount: 50,
      requestedAmount: 50,
      currency: 'AED',
      reason: 'listing_not_approved',
      description: 'My car listing was rejected due to incomplete documents. I have now provided all required documents.',
      status: 'pending',
      priority: 'medium',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      paymentReference: 'pi_1234567890',
      listingType: 'Car Listing',
      supportingDocuments: ['updated_registration.pdf', 'new_photos.jpg']
    },
    {
      id: 'ref_002',
      transactionId: 'txn_005',
      userId: 'user_456',
      userName: 'Omar Hassan',
      userEmail: 'omar@example.com',
      originalAmount: 100,
      requestedAmount: 100,
      currency: 'AED',
      reason: 'accidental_payment',
      description: 'I accidentally paid twice for the same garage listing. This is the duplicate payment.',
      status: 'approved',
      priority: 'high',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      reviewedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      adminNotes: 'Verified duplicate payment. Approved for full refund.',
      paymentReference: 'pi_duplicate_123',
      listingType: 'Garage Listing'
    },
    {
      id: 'ref_003',
      transactionId: 'txn_003',
      userId: 'garage_789',
      userName: 'Fast Fix Auto',
      userEmail: 'fastfix@garage.ae',
      originalAmount: 25,
      requestedAmount: 15,
      currency: 'AED',
      reason: 'partial_service',
      description: 'The boost service was only partially delivered due to technical issues.',
      status: 'rejected',
      priority: 'low',
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
      reviewedAt: new Date(Date.now() - 36 * 60 * 60 * 1000),
      adminNotes: 'Service was delivered as promised. No grounds for refund.',
      paymentReference: 'pi_boost_456',
      listingType: 'Boost Service'
    }
  ]);

  const filteredRefunds = refundRequests.filter(refund => {
    const matchesStatus = filterStatus === 'all' || refund.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      refund.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    
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
      case 'pending': return 'text-orange-500 bg-orange-500/10';
      case 'approved': return 'text-green-500 bg-green-500/10';
      case 'rejected': return 'text-red-500 bg-red-500/10';
      case 'processed': return 'text-blue-500 bg-blue-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-500/10';
      case 'medium': return 'text-orange-500 bg-orange-500/10';
      case 'low': return 'text-green-500 bg-green-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const approveRefund = () => {
    if (showApprovalModal) {
      setRefundRequests(prev => prev.map(refund => 
        refund.id === showApprovalModal.id 
          ? {
              ...refund,
              status: 'approved' as const,
              adminNotes: adminNotes,
              reviewedAt: new Date()
            }
          : refund
      ));
      toast.success(`Refund request ${showApprovalModal.id} approved`);
      setShowApprovalModal(null);
      setAdminNotes('');
    }
  };

  const rejectRefund = () => {
    if (showRejectionModal) {
      setRefundRequests(prev => prev.map(refund => 
        refund.id === showRejectionModal.id 
          ? {
              ...refund,
              status: 'rejected' as const,
              adminNotes: adminNotes,
              reviewedAt: new Date()
            }
          : refund
      ));
      toast.error(`Refund request ${showRejectionModal.id} rejected`);
      setShowRejectionModal(null);
      setAdminNotes('');
    }
  };

  const processRefund = (refund: RefundRequest) => {
    setRefundRequests(prev => prev.map(r => 
      r.id === refund.id 
        ? {
            ...r,
            status: 'processed' as const,
            processedAt: new Date()
          }
        : r
    ));
    toast.success(`Refund ${refund.id} processed successfully`);
  };

  const exportRefunds = () => {
    const headers = ['Refund ID', 'Transaction ID', 'User', 'Email', 'Original Amount', 'Requested Amount', 'Status', 'Priority', 'Reason', 'Created At'];
    const csvContent = [
      headers.join(','),
      ...filteredRefunds.map(refund => [
        refund.id,
        refund.transactionId,
        `"${refund.userName}"`,
        refund.userEmail,
        `${refund.originalAmount} ${refund.currency}`,
        `${refund.requestedAmount} ${refund.currency}`,
        refund.status,
        refund.priority,
        refund.reason,
        refund.createdAt.toISOString().split('T')[0]
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `refunds-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Refunds exported successfully');
  };

  // Calculate stats
  const pendingCount = refundRequests.filter(r => r.status === 'pending').length;
  const approvedCount = refundRequests.filter(r => r.status === 'approved').length;
  const totalRefundAmount = refundRequests
    .filter(r => r.status === 'approved' || r.status === 'processed')
    .reduce((sum, r) => sum + r.requestedAmount, 0);

  return (
    <div className="p-6 bg-[var(--sublimes-dark-bg)]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[var(--sublimes-light-text)]">Refund Management</h1>
            <p className="text-gray-400 mt-1">Review and process refund requests</p>
          </div>
          <Button
            onClick={exportRefunds}
            className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] hover:bg-[var(--sublimes-gold)]/90"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Requests</p>
                <p className="text-2xl font-bold text-[var(--sublimes-light-text)]">{pendingCount}</p>
              </div>
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </div>

          <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Approved</p>
                <p className="text-2xl font-bold text-[var(--sublimes-light-text)]">{approvedCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Refunded</p>
                <p className="text-2xl font-bold text-[var(--sublimes-light-text)]">
                  {formatAmount(totalRefundAmount, 'AED')}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">High Priority</p>
                <p className="text-2xl font-bold text-[var(--sublimes-light-text)]">
                  {refundRequests.filter(r => r.priority === 'high' && r.status === 'pending').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search refunds..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] focus:ring-2 focus:ring-[var(--sublimes-gold)]"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="processed">Processed</option>
          </select>
        </div>
      </div>

      {/* Refunds List */}
      <div className="space-y-4">
        {filteredRefunds.length === 0 ? (
          <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-12 text-center">
            <RefreshCw className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[var(--sublimes-light-text)] mb-2">No Refund Requests Found</h3>
            <p className="text-gray-400">No refund requests match your current filters.</p>
          </div>
        ) : (
          filteredRefunds.map((refund) => (
            <div
              key={refund.id}
              className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[var(--sublimes-gold)] rounded-full flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 text-[var(--sublimes-dark-bg)]" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-bold text-[var(--sublimes-light-text)]">{refund.id}</h3>
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${getStatusColor(refund.status)}`}>
                        {getStatusIcon(refund.status)}
                        <span className="text-xs font-medium capitalize">{refund.status}</span>
                      </div>
                      <div className={`px-2 py-1 rounded-full ${getPriorityColor(refund.priority)}`}>
                        <span className="text-xs font-medium capitalize">{refund.priority} Priority</span>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mb-1">User: {refund.userName} ({refund.userEmail})</p>
                    <p className="text-gray-400 text-sm">Transaction: {refund.transactionId} • {refund.listingType}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[var(--sublimes-light-text)] font-bold">
                    {formatAmount(refund.requestedAmount, refund.currency)}
                  </p>
                  <p className="text-gray-400 text-sm">
                    of {formatAmount(refund.originalAmount, refund.currency)}
                  </p>
                </div>
              </div>

              <div className="bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg p-4 mb-4">
                <h4 className="font-medium text-[var(--sublimes-light-text)] mb-2">Reason: {refund.reason.replace('_', ' ')}</h4>
                <p className="text-gray-400 text-sm">{refund.description}</p>
                {refund.supportingDocuments && refund.supportingDocuments.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[var(--sublimes-light-text)] text-sm font-medium mb-1">Supporting Documents:</p>
                    <div className="flex flex-wrap gap-2">
                      {refund.supportingDocuments.map((doc, index) => (
                        <span key={index} className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded">
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {refund.adminNotes && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4">
                  <h5 className="font-medium text-yellow-500 text-sm mb-1">Admin Notes</h5>
                  <p className="text-gray-300 text-sm">{refund.adminNotes}</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">
                  Submitted {formatDateTime(refund.createdAt)}
                  {refund.reviewedAt && (
                    <span> • Reviewed {formatDateTime(refund.reviewedAt)}</span>
                  )}
                </span>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedRefund(refund)}
                    className="border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                  
                  {refund.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => setShowApprovalModal(refund)}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setShowRejectionModal(refund)}
                        className="bg-red-500 hover:bg-red-600 text-white"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                  
                  {refund.status === 'approved' && (
                    <Button
                      size="sm"
                      onClick={() => processRefund(refund)}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Process Refund
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Approval Modal */}
      <Dialog open={!!showApprovalModal} onOpenChange={() => setShowApprovalModal(null)}>
        <DialogContent className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--sublimes-light-text)]">Approve Refund Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-400">
              Are you sure you want to approve this refund request for {showApprovalModal && formatAmount(showApprovalModal.requestedAmount, showApprovalModal.currency)}?
            </p>
            <div>
              <label className="block text-[var(--sublimes-light-text)] font-medium mb-2">Admin Notes (Required)</label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Enter reason for approval..."
                className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                rows={3}
              />
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowApprovalModal(null)}
                className="flex-1 border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
              >
                Cancel
              </Button>
              <Button 
                onClick={approveRefund}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                disabled={!adminNotes.trim()}
              >
                Approve Refund
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rejection Modal */}
      <Dialog open={!!showRejectionModal} onOpenChange={() => setShowRejectionModal(null)}>
        <DialogContent className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--sublimes-light-text)]">Reject Refund Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-400">
              Please provide a reason for rejecting this refund request. The user will be notified with your message.
            </p>
            <div>
              <label className="block text-[var(--sublimes-light-text)] font-medium mb-2">Rejection Reason (Required)</label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Enter reason for rejection..."
                className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                rows={3}
              />
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowRejectionModal(null)}
                className="flex-1 border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
              >
                Cancel
              </Button>
              <Button 
                onClick={rejectRefund}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                disabled={!adminNotes.trim()}
              >
                Reject Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={!!selectedRefund} onOpenChange={() => setSelectedRefund(null)}>
        <DialogContent className="max-w-2xl bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--sublimes-light-text)]">Refund Request Details</DialogTitle>
          </DialogHeader>
          {selectedRefund && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-[var(--sublimes-light-text)] mb-3">Request Info</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Refund ID:</span>
                      <span className="text-[var(--sublimes-light-text)]">{selectedRefund.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Transaction ID:</span>
                      <span className="text-[var(--sublimes-light-text)]">{selectedRefund.transactionId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Original Amount:</span>
                      <span className="text-[var(--sublimes-light-text)]">
                        {formatAmount(selectedRefund.originalAmount, selectedRefund.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Requested Amount:</span>
                      <span className="text-[var(--sublimes-light-text)] font-medium">
                        {formatAmount(selectedRefund.requestedAmount, selectedRefund.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Priority:</span>
                      <span className={`capitalize ${selectedRefund.priority === 'high' ? 'text-red-500' : selectedRefund.priority === 'medium' ? 'text-orange-500' : 'text-green-500'}`}>
                        {selectedRefund.priority}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-[var(--sublimes-light-text)] mb-3">User Info</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Name:</span>
                      <span className="text-[var(--sublimes-light-text)]">{selectedRefund.userName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Email:</span>
                      <span className="text-[var(--sublimes-light-text)]">{selectedRefund.userEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">User ID:</span>
                      <span className="text-[var(--sublimes-light-text)]">{selectedRefund.userId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Listing Type:</span>
                      <span className="text-[var(--sublimes-light-text)]">{selectedRefund.listingType}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-[var(--sublimes-light-text)] mb-2">Refund Reason</h3>
                <p className="text-gray-400 text-sm mb-2 capitalize">{selectedRefund.reason.replace('_', ' ')}</p>
                <p className="text-gray-400">{selectedRefund.description}</p>
              </div>

              {selectedRefund.supportingDocuments && selectedRefund.supportingDocuments.length > 0 && (
                <div>
                  <h3 className="font-medium text-[var(--sublimes-light-text)] mb-2">Supporting Documents</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRefund.supportingDocuments.map((doc, index) => (
                      <div key={index} className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex items-center space-x-2">
                        <MessageSquare className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-400 text-sm">{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedRefund.adminNotes && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <h3 className="font-medium text-yellow-500 mb-2">Admin Notes</h3>
                  <p className="text-gray-300">{selectedRefund.adminNotes}</p>
                  {selectedRefund.reviewedAt && (
                    <p className="text-gray-400 text-sm mt-2">
                      Reviewed: {formatDateTime(selectedRefund.reviewedAt)}
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={() => setSelectedRefund(null)}
                  className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] hover:bg-[var(--sublimes-gold)]/90"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}