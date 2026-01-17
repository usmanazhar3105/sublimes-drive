/**
 * AdminVendorVerificationPage_Wired - Vendor Verification Management
 * Allows admins to approve/reject vendor verification requests
 */

import { useState, useEffect } from 'react';
import { 
  Store, CheckCircle, XCircle, Clock, Eye, FileText,
  Phone, Mail, MapPin, Building2, AlertCircle, Loader2,
  Search, Filter
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from 'sonner';
import { supabase } from '../../utils/supabase/client';
import { useAnalytics } from '../../src/hooks';

const BUSINESS_TYPES = {
  parts_seller: '零件卖家 - Parts Seller',
  accessories: '配件商 - Accessories',
  services: '服务商 - Services',
  other: '其他 - Other'
};

interface VendorVerification {
  id: string;
  user_id: string;
  business_name: string;
  business_type: string;
  trade_license_number: string;
  location: string;
  emirate: string;
  business_phone: string;
  business_email: string;
  business_address: string;
  trade_license_url?: string;
  tax_certificate_url?: string;
  business_photos_urls?: string[];
  status: 'pending' | 'verified' | 'rejected';
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  admin_notes?: string;
  created_at: string;
  profiles?: {
    username: string;
    email: string;
  };
}

export function AdminVendorVerificationPage_Wired() {
  const analytics = useAnalytics();
  const [loading, setLoading] = useState(true);
  const [verifications, setVerifications] = useState<VendorVerification[]>([]);
  const [selectedVerification, setSelectedVerification] = useState<VendorVerification | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    analytics.trackPageView('/admin/vendor-verification');
    loadVerifications();
  }, [statusFilter]);

  const loadVerifications = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('vendor_verifications')
        .select(`
          *,
          profiles:user_id (
            username,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setVerifications(data || []);
    } catch (error: any) {
      console.error('Error loading vendor verifications:', error);
      toast.error('Failed to load vendor verifications');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (verification: VendorVerification) => {
    if (!confirm(`Approve vendor verification for ${verification.business_name}?`)) return;

    try {
      setProcessing(true);

      const { error: updateError } = await supabase
        .from('vendor_verifications')
        .update({
          status: 'verified',
          reviewed_at: new Date().toISOString(),
          admin_notes: adminNotes || null
        })
        .eq('id', verification.id);

      if (updateError) throw updateError;

      // Update user role to vendor
      const { error: roleError } = await supabase
        .from('profiles')
        .update({ role: 'vendor' })
        .eq('id', verification.user_id);

      if (roleError) throw roleError;

      toast.success('Vendor verified successfully! 🎉');
      analytics.trackEvent('admin_vendor_verified', { 
        vendor_id: verification.user_id,
        business_name: verification.business_name
      });

      setShowDetailModal(false);
      loadVerifications();
    } catch (error: any) {
      console.error('Error approving vendor:', error);
      toast.error('Failed to approve vendor');
    } finally {
      setProcessing(false);
      setAdminNotes('');
    }
  };

  const handleReject = async (verification: VendorVerification) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    if (!confirm(`Reject vendor verification for ${verification.business_name}?`)) return;

    try {
      setProcessing(true);

      const { error } = await supabase
        .from('vendor_verifications')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          rejection_reason: rejectionReason,
          admin_notes: adminNotes || null
        })
        .eq('id', verification.id);

      if (error) throw error;

      toast.success('Vendor verification rejected');
      analytics.trackEvent('admin_vendor_rejected', { 
        vendor_id: verification.user_id,
        reason: rejectionReason 
      });

      setShowDetailModal(false);
      setRejectionReason('');
      setAdminNotes('');
      loadVerifications();
    } catch (error: any) {
      console.error('Error rejecting vendor:', error);
      toast.error('Failed to reject vendor');
    } finally {
      setProcessing(false);
    }
  };

  const openDetailModal = (verification: VendorVerification) => {
    setSelectedVerification(verification);
    setRejectionReason(verification.rejection_reason || '');
    setAdminNotes(verification.admin_notes || '');
    setShowDetailModal(true);
  };

  const filteredVerifications = verifications.filter(v =>
    v.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.trade_license_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.profiles?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <Badge className="bg-green-900/30 text-green-400">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-900/30 text-yellow-400">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-900/30 text-red-400">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  const stats = {
    total: verifications.length,
    pending: verifications.filter(v => v.status === 'pending').length,
    verified: verifications.filter(v => v.status === 'verified').length,
    rejected: verifications.filter(v => v.status === 'rejected').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl text-[#E8EAED] mb-2">Vendor Verification</h1>
        <p className="text-gray-400">Review and manage vendor verification requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#0F1829] border-[#1A2332]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total</p>
                <p className="text-2xl text-[#E8EAED]">{stats.total}</p>
              </div>
              <Store className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0F1829] border-yellow-700/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-400">Pending</p>
                <p className="text-2xl text-[#E8EAED]">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0F1829] border-green-700/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-400">Verified</p>
                <p className="text-2xl text-[#E8EAED]">{stats.verified}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0F1829] border-red-700/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-400">Rejected</p>
                <p className="text-2xl text-[#E8EAED]">{stats.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-[#0F1829] border-[#1A2332]">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by business name, license, or username..."
                  className="pl-10 bg-[#0B1426] border-gray-700 text-[#E8EAED]"
                />
              </div>
            </div>

            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-[#0B1426] border-gray-700 text-[#E8EAED]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0F1829] border-gray-700">
                  <SelectItem value="all" className="text-[#E8EAED]">All Status</SelectItem>
                  <SelectItem value="pending" className="text-[#E8EAED]">Pending</SelectItem>
                  <SelectItem value="verified" className="text-[#E8EAED]">Verified</SelectItem>
                  <SelectItem value="rejected" className="text-[#E8EAED]">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verifications List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
        </div>
      ) : filteredVerifications.length === 0 ? (
        <Card className="bg-[#0F1829] border-[#1A2332]">
          <CardContent className="p-12 text-center">
            <Store className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl text-[#E8EAED] mb-2">No verifications found</h3>
            <p className="text-gray-400">
              {searchTerm ? 'Try adjusting your search' : 'No vendor verifications to review'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredVerifications.map((verification) => (
            <Card key={verification.id} className="bg-[#0F1829] border-[#1A2332] hover:border-[#D4AF37]/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Store className="w-5 h-5 text-[#D4AF37]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg text-[#E8EAED] truncate">{verification.business_name}</h3>
                        <p className="text-sm text-gray-400">
                          @{verification.profiles?.username || 'Unknown'} • {BUSINESS_TYPES[verification.business_type as keyof typeof BUSINESS_TYPES]}
                        </p>
                      </div>
                      {getStatusBadge(verification.status)}
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-400">
                        <FileText className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">License: {verification.trade_license_number}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{verification.emirate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{verification.business_phone}</span>
                      </div>
                    </div>

                    {/* Rejection Reason */}
                    {verification.status === 'rejected' && verification.rejection_reason && (
                      <div className="mt-3 p-3 bg-red-900/20 border border-red-700/30 rounded text-sm">
                        <p className="text-red-400">
                          <AlertCircle className="w-4 h-4 inline mr-1" />
                          Rejected: {verification.rejection_reason}
                        </p>
                      </div>
                    )}

                    {/* Submitted Date */}
                    <p className="text-xs text-gray-500 mt-3">
                      Submitted {new Date(verification.created_at).toLocaleString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => openDetailModal(verification)}
                      variant="outline"
                      size="sm"
                      className="border-gray-700 text-gray-400 hover:text-[#E8EAED] whitespace-nowrap"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>

                    {verification.status === 'pending' && (
                      <>
                        <Button
                          onClick={() => handleApprove(verification)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white whitespace-nowrap"
                          disabled={processing}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedVerification(verification);
                            setShowDetailModal(true);
                          }}
                          size="sm"
                          variant="outline"
                          className="border-red-500 text-red-500 hover:bg-red-500/10 whitespace-nowrap"
                          disabled={processing}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="bg-[#0F1829] border-[#1A2332] text-[#E8EAED] max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Store className="w-5 h-5 text-[#D4AF37]" />
              Vendor Verification Details
            </DialogTitle>
          </DialogHeader>

          {selectedVerification && (
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-[#0B1426] rounded-lg">
                <span className="text-gray-400">Status:</span>
                {getStatusBadge(selectedVerification.status)}
              </div>

              {/* Business Information */}
              <div className="space-y-4">
                <h3 className="text-lg flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#D4AF37]" />
                  Business Information
                </h3>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400 mb-1">Business Name</p>
                    <p className="text-[#E8EAED]">{selectedVerification.business_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Business Type</p>
                    <p className="text-[#E8EAED]">
                      {BUSINESS_TYPES[selectedVerification.business_type as keyof typeof BUSINESS_TYPES]}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Trade License</p>
                    <p className="text-[#E8EAED]">{selectedVerification.trade_license_number}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Emirate</p>
                    <p className="text-[#E8EAED]">{selectedVerification.emirate}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Location</p>
                    <p className="text-[#E8EAED]">{selectedVerification.location || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Business Phone</p>
                    <p className="text-[#E8EAED]">{selectedVerification.business_phone}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-400 mb-1">Business Email</p>
                    <p className="text-[#E8EAED]">{selectedVerification.business_email}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-400 mb-1">Business Address</p>
                    <p className="text-[#E8EAED]">{selectedVerification.business_address}</p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="space-y-4">
                <h3 className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#D4AF37]" />
                  Documents
                </h3>
                
                <div className="space-y-2">
                  {selectedVerification.trade_license_url && (
                    <a 
                      href={selectedVerification.trade_license_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[#D4AF37] hover:underline"
                    >
                      <FileText className="w-4 h-4" />
                      View Trade License
                    </a>
                  )}
                  {selectedVerification.tax_certificate_url && (
                    <a 
                      href={selectedVerification.tax_certificate_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[#D4AF37] hover:underline"
                    >
                      <FileText className="w-4 h-4" />
                      View Tax Certificate
                    </a>
                  )}
                  {(!selectedVerification.trade_license_url && !selectedVerification.tax_certificate_url) && (
                    <p className="text-gray-400 text-sm">No documents uploaded</p>
                  )}
                </div>
              </div>

              {/* Admin Actions */}
              {selectedVerification.status === 'pending' && (
                <div className="space-y-4 pt-4 border-t border-gray-800">
                  <div className="space-y-2">
                    <Label className="text-[#E8EAED]">Admin Notes (Optional)</Label>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Internal notes about this verification..."
                      className="bg-[#0B1426] border-gray-700 text-[#E8EAED] min-h-[80px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#E8EAED]">Rejection Reason (Required for rejection)</Label>
                    <Textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Reason for rejection (will be shown to user)..."
                      className="bg-[#0B1426] border-gray-700 text-[#E8EAED] min-h-[80px]"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleApprove(selectedVerification)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      disabled={processing}
                    >
                      {processing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve Vendor
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleReject(selectedVerification)}
                      variant="outline"
                      className="flex-1 border-red-500 text-red-500 hover:bg-red-500/10"
                      disabled={processing || !rejectionReason.trim()}
                    >
                      {processing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject Vendor
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Review Info (for verified/rejected) */}
              {selectedVerification.status !== 'pending' && (
                <div className="space-y-2 pt-4 border-t border-gray-800">
                  <p className="text-sm text-gray-400">
                    Reviewed at: {selectedVerification.reviewed_at ? new Date(selectedVerification.reviewed_at).toLocaleString() : 'N/A'}
                  </p>
                  {selectedVerification.rejection_reason && (
                    <div className="p-3 bg-red-900/20 border border-red-700/30 rounded">
                      <p className="text-sm text-red-400">
                        Rejection Reason: {selectedVerification.rejection_reason}
                      </p>
                    </div>
                  )}
                  {selectedVerification.admin_notes && (
                    <div className="p-3 bg-[#0B1426] rounded">
                      <p className="text-sm text-gray-400">
                        Admin Notes: {selectedVerification.admin_notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
