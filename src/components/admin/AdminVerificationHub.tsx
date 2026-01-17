/**
 * Admin Verification Hub - Unified Verification Management
 * 
 * Wired to Supabase with new schema:
 * - profiles.sub_role, verification_status, badge_color
 * - verification_history table
 * - RPC functions: fn_admin_approve_verification, fn_admin_reject_verification, fn_admin_request_reupload
 */

import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  Eye,
  FileText,
  User,
  Mail,
  Phone,
  Building,
  Car,
  Package,
  RefreshCw,
  Download,
  Search,
  Filter
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { toast } from 'sonner';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

interface VerificationRequest {
  id: string;
  display_name: string;
  email: string;
  phone: string | null;
  sub_role: 'car_owner' | 'garage_owner' | 'vendor';
  verification_status: 'pending' | 'approved' | 'rejected' | 'reupload_requested';
  verification_documents: any[];
  verification_notes: string | null;
  verification_requested_at: string;
  badge_color: string;
  created_at: string;
}

export function AdminVerificationHub() {
  const [activeTab, setActiveTab] = useState<'garage' | 'car_owner' | 'vendor'>('garage');
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  
  // Modal states
  const [selectedVerification, setSelectedVerification] = useState<VerificationRequest | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'reupload'>('approve');
  const [actionNotes, setActionNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  // Statistics
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    reupload_requested: 0
  });

  // Fetch verifications
  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('sub_role', activeTab === 'garage' ? 'garage_owner' : activeTab === 'car_owner' ? 'car_owner' : 'vendor')
        .eq('verification_status', statusFilter)
        .order('verification_requested_at', { ascending: false });

      if (error) throw error;

      setVerifications(data || []);
      
      // Calculate stats
      const { data: allData } = await supabase
        .from('profiles')
        .select('verification_status')
        .eq('sub_role', activeTab === 'garage' ? 'garage_owner' : activeTab === 'car_owner' ? 'car_owner' : 'vendor');

      if (allData) {
        const newStats = {
          pending: allData.filter(v => v.verification_status === 'pending').length,
          approved: allData.filter(v => v.verification_status === 'approved').length,
          rejected: allData.filter(v => v.verification_status === 'rejected').length,
          reupload_requested: allData.filter(v => v.verification_status === 'reupload_requested').length,
        };
        setStats(newStats);
      }
    } catch (error) {
      console.error('Error fetching verifications:', error);
      toast.error('Failed to load verifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, [activeTab, statusFilter]);

  // Handle approve
  const handleApprove = async () => {
    if (!selectedVerification) return;
    
    setProcessing(true);
    try {
      const { data, error } = await supabase.rpc('fn_admin_approve_verification', {
        p_user_id: selectedVerification.id,
        p_notes: actionNotes || null
      });

      if (error) throw error;

      toast.success('Verification approved successfully!');
      setShowActionModal(false);
      setActionNotes('');
      fetchVerifications();
      
      // TODO: Send email notification
    } catch (error) {
      console.error('Error approving verification:', error);
      toast.error('Failed to approve verification');
    } finally {
      setProcessing(false);
    }
  };

  // Handle reject
  const handleReject = async () => {
    if (!selectedVerification || !actionNotes.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    setProcessing(true);
    try {
      const { data, error } = await supabase.rpc('fn_admin_reject_verification', {
        p_user_id: selectedVerification.id,
        p_notes: actionNotes
      });

      if (error) throw error;

      toast.success('Verification rejected');
      setShowActionModal(false);
      setActionNotes('');
      fetchVerifications();
      
      // TODO: Send email notification
    } catch (error) {
      console.error('Error rejecting verification:', error);
      toast.error('Failed to reject verification');
    } finally {
      setProcessing(false);
    }
  };

  // Handle request reupload
  const handleRequestReupload = async () => {
    if (!selectedVerification || !actionNotes.trim()) {
      toast.error('Please provide instructions for re-upload');
      return;
    }
    
    setProcessing(true);
    try {
      const { data, error } = await supabase.rpc('fn_admin_request_reupload', {
        p_user_id: selectedVerification.id,
        p_notes: actionNotes
      });

      if (error) throw error;

      toast.success('Re-upload requested');
      setShowActionModal(false);
      setActionNotes('');
      fetchVerifications();
      
      // TODO: Send email notification
    } catch (error) {
      console.error('Error requesting reupload:', error);
      toast.error('Failed to request re-upload');
    } finally {
      setProcessing(false);
    }
  };

  // Open action modal
  const openActionModal = (verification: VerificationRequest, type: 'approve' | 'reject' | 'reupload') => {
    setSelectedVerification(verification);
    setActionType(type);
    setActionNotes('');
    setShowActionModal(true);
  };

  // Execute action
  const executeAction = () => {
    switch (actionType) {
      case 'approve':
        handleApprove();
        break;
      case 'reject':
        handleReject();
        break;
      case 'reupload':
        handleRequestReupload();
        break;
    }
  };

  // Get badge color
  const getBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'reupload_requested': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  // Get role label
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'garage_owner': return 'Garage Owner';
      case 'car_owner': return 'Car Owner';
      case 'vendor': return 'Vendor';
      default: return role;
    }
  };

  // Get required documents
  const getRequiredDocuments = (role: string) => {
    switch (role) {
      case 'garage_owner': return 'Trade License or Utility Bill';
      case 'car_owner': return 'Mulkia / Registration (Front & Back)';
      case 'vendor': return 'Business License';
      default: return 'Documents';
    }
  };

  // Filter verifications by search
  const filteredVerifications = verifications.filter(v => 
    v.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Verification Hub</h1>
          <p className="text-muted-foreground">Manage user verification requests</p>
        </div>
        <Button onClick={fetchVerifications} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Re-upload Requested</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reupload_requested}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="garage">
            <Building className="h-4 w-4 mr-2" />
            Garage Hub
          </TabsTrigger>
          <TabsTrigger value="car_owner">
            <Car className="h-4 w-4 mr-2" />
            Car Owners
          </TabsTrigger>
          <TabsTrigger value="vendor">
            <Package className="h-4 w-4 mr-2" />
            Vendors
          </TabsTrigger>
        </TabsList>

        {/* Filters */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex-1">
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="reupload_requested">Re-upload Requested</option>
          </select>
        </div>

        {/* Content */}
        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredVerifications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No {statusFilter} verifications found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredVerifications.map((verification) => (
                <Card key={verification.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        {/* User Info */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <span className="font-semibold">{verification.display_name || 'No name'}</span>
                          </div>
                          <Badge className={getBadgeColor(verification.verification_status)}>
                            {verification.verification_status}
                          </Badge>
                          <Badge variant="outline">
                            {getRoleLabel(verification.sub_role)}
                          </Badge>
                        </div>

                        {/* Contact Info */}
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {verification.email}
                          </div>
                          {verification.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              {verification.phone}
                            </div>
                          )}
                        </div>

                        {/* Documents */}
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Required:</span>
                          <span>{getRequiredDocuments(verification.sub_role)}</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-blue-600">
                            {verification.verification_documents?.length || 0} document(s) uploaded
                          </span>
                        </div>

                        {/* Submitted Date */}
                        <div className="text-sm text-muted-foreground">
                          Submitted: {new Date(verification.verification_requested_at || verification.created_at).toLocaleString()}
                        </div>

                        {/* Admin Notes */}
                        {verification.verification_notes && (
                          <div className="mt-2 p-3 bg-muted rounded-md text-sm">
                            <strong>Admin Notes:</strong> {verification.verification_notes}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedVerification(verification);
                            setShowDetailsModal(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>

                        {verification.verification_status === 'pending' || verification.verification_status === 'reupload_requested' ? (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => openActionModal(verification, 'approve')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>

                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openActionModal(verification, 'reject')}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openActionModal(verification, 'reupload')}
                            >
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              Request Re-upload
                            </Button>
                          </>
                        ) : (
                          <Badge variant="outline" className="justify-center">
                            {verification.verification_status === 'approved' ? 'Verified' : 'Closed'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Verification Details</DialogTitle>
          </DialogHeader>
          {selectedVerification && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <p>{selectedVerification.display_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p>{selectedVerification.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Role</label>
                  <p>{getRoleLabel(selectedVerification.sub_role)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Badge className={getBadgeColor(selectedVerification.verification_status)}>
                    {selectedVerification.verification_status}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Documents</label>
                <div className="mt-2 space-y-2">
                  {selectedVerification.verification_documents?.map((doc: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">{doc.name || `Document ${index + 1}`}</span>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {selectedVerification.verification_notes && (
                <div>
                  <label className="text-sm font-medium">Admin Notes</label>
                  <p className="mt-1 p-3 bg-muted rounded-md">{selectedVerification.verification_notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Modal */}
      <Dialog open={showActionModal} onOpenChange={setShowActionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' && 'Approve Verification'}
              {actionType === 'reject' && 'Reject Verification'}
              {actionType === 'reupload' && 'Request Re-upload'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' && 'This will approve the verification and grant the user access.'}
              {actionType === 'reject' && 'This will reject the verification. Please provide a reason.'}
              {actionType === 'reupload' && 'Request the user to re-upload documents. Please provide instructions.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Textarea
              placeholder={
                actionType === 'approve' 
                  ? 'Optional notes...' 
                  : actionType === 'reject'
                  ? 'Reason for rejection (required)...'
                  : 'Instructions for re-upload (required)...'
              }
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              rows={4}
            />

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowActionModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={executeAction}
                disabled={processing || ((actionType === 'reject' || actionType === 'reupload') && !actionNotes.trim())}
                className={
                  actionType === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : actionType === 'reject'
                    ? 'bg-red-600 hover:bg-red-700'
                    : ''
                }
              >
                {processing ? 'Processing...' : 'Confirm'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
