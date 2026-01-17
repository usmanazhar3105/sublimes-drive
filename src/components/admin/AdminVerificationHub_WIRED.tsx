import { useState, useEffect } from 'react';
import { Shield, CheckCircle, XCircle, Clock, AlertTriangle, Download, Filter, Search, Eye } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner';

interface VerificationRequest {
  id: string;
  user_id: string;
  verification_type: 'vehicle' | 'garage' | 'vendor';
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at?: string;
  reviewer_id?: string;
  data: any;
  documents: string[];
  profile?: {
    display_name: string;
    email: string;
    avatar_url?: string;
  };
}

export function AdminVerificationHub_WIRED() {
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<VerificationRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    avgReviewTime: '0 hours'
  });

  // Fetch verifications from database
  useEffect(() => {
    fetchVerifications();
  }, [statusFilter, typeFilter]);

  const fetchVerifications = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('verification_requests')
        .select(`
          *,
          profile:profiles(display_name, email, avatar_url)
        `)
        .order('submitted_at', { ascending: false });

      // Apply filters
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (typeFilter !== 'all') {
        query = query.eq('verification_type', typeFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setVerifications(data || []);

      // Calculate stats
      const pending = data?.filter(v => v.status === 'pending').length || 0;
      const approved = data?.filter(v => v.status === 'approved').length || 0;
      const rejected = data?.filter(v => v.status === 'rejected').length || 0;

      // Calculate average review time
      const reviewedItems = data?.filter(v => v.reviewed_at && v.submitted_at) || [];
      const avgTime = reviewedItems.length > 0
        ? reviewedItems.reduce((acc, item) => {
            const submitted = new Date(item.submitted_at).getTime();
            const reviewed = new Date(item.reviewed_at!).getTime();
            return acc + (reviewed - submitted);
          }, 0) / reviewedItems.length
        : 0;

      const avgHours = (avgTime / (1000 * 60 * 60)).toFixed(1);

      setStats({
        pending,
        approved,
        rejected,
        avgReviewTime: `${avgHours} hours`
      });

    } catch (error: any) {
      console.error('Error fetching verifications:', error);
      toast.error('Failed to load verifications');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (verificationId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('verification_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewer_id: user.id
        })
        .eq('id', verificationId);

      if (error) throw error;

      toast.success('Verification approved!');
      fetchVerifications();
      setSelectedVerification(null);
    } catch (error: any) {
      console.error('Error approving verification:', error);
      toast.error('Failed to approve verification');
    }
  };

  const handleReject = async (verificationId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('verification_requests')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewer_id: user.id
        })
        .eq('id', verificationId);

      if (error) throw error;

      toast.success('Verification rejected');
      fetchVerifications();
      setSelectedVerification(null);
    } catch (error: any) {
      console.error('Error rejecting verification:', error);
      toast.error('Failed to reject verification');
    }
  };

  const handleBulkApprove = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const pendingIds = verifications
        .filter(v => v.status === 'pending')
        .map(v => v.id);

      if (pendingIds.length === 0) {
        toast.error('No pending verifications to approve');
        return;
      }

      const { error } = await supabase
        .from('verification_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewer_id: user.id
        })
        .in('id', pendingIds);

      if (error) throw error;

      toast.success(`Approved ${pendingIds.length} verifications!`);
      fetchVerifications();
    } catch (error: any) {
      console.error('Error bulk approving:', error);
      toast.error('Failed to bulk approve');
    }
  };

  const handleExport = () => {
    try {
      const csv = [
        ['ID', 'Type', 'User', 'Email', 'Status', 'Submitted', 'Reviewed'].join(','),
        ...verifications.map(v => [
          v.id,
          v.verification_type,
          v.profile?.display_name || 'Unknown',
          v.profile?.email || 'Unknown',
          v.status,
          new Date(v.submitted_at).toLocaleString(),
          v.reviewed_at ? new Date(v.reviewed_at).toLocaleString() : 'N/A'
        ].join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `verifications_${new Date().toISOString()}.csv`;
      a.click();

      toast.success('Export downloaded!');
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Failed to export');
    }
  };

  const filteredVerifications = verifications.filter(v => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        v.profile?.display_name?.toLowerCase().includes(query) ||
        v.profile?.email?.toLowerCase().includes(query) ||
        v.id.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Verification Hub</h1>
          <p className="text-muted-foreground">Review and approve user verifications</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleBulkApprove} className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="h-4 w-4 mr-2" />
            Bulk Approve
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Review</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Review Time</p>
              <p className="text-2xl font-bold">{stats.avgReviewTime}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold">{stats.approved}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Rejected</p>
              <p className="text-2xl font-bold">{stats.rejected}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="vehicle">Vehicle</SelectItem>
              <SelectItem value="garage">Garage</SelectItem>
              <SelectItem value="vendor">Vendor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Verifications List */}
      <Card className="p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--sublimes-gold)] mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading verifications...</p>
          </div>
        ) : filteredVerifications.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">No verifications found</p>
            <p className="text-muted-foreground">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVerifications.map((verification) => (
              <div
                key={verification.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                    {verification.profile?.avatar_url ? (
                      <img
                        src={verification.profile.avatar_url}
                        alt={verification.profile.display_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <Shield className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>

                  <div>
                    <p className="font-medium">{verification.profile?.display_name || 'Unknown User'}</p>
                    <p className="text-sm text-muted-foreground">{verification.profile?.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="capitalize">
                        {verification.verification_type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(verification.submitted_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      verification.status === 'approved'
                        ? 'default'
                        : verification.status === 'rejected'
                        ? 'destructive'
                        : 'secondary'
                    }
                    className="capitalize"
                  >
                    {verification.status}
                  </Badge>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedVerification(verification)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Review
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedVerification} onOpenChange={() => setSelectedVerification(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Verification Request</DialogTitle>
          </DialogHeader>

          {selectedVerification && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
                  {selectedVerification.profile?.avatar_url ? (
                    <img
                      src={selectedVerification.profile.avatar_url}
                      alt={selectedVerification.profile.display_name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <Shield className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-lg">{selectedVerification.profile?.display_name}</p>
                  <p className="text-muted-foreground">{selectedVerification.profile?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{selectedVerification.verification_type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className="capitalize">{selectedVerification.status}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Submitted</p>
                  <p className="font-medium">{new Date(selectedVerification.submitted_at).toLocaleString()}</p>
                </div>
                {selectedVerification.reviewed_at && (
                  <div>
                    <p className="text-sm text-muted-foreground">Reviewed</p>
                    <p className="font-medium">{new Date(selectedVerification.reviewed_at).toLocaleString()}</p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Submitted Data</p>
                <pre className="bg-accent p-4 rounded-lg text-sm overflow-auto max-h-60">
                  {JSON.stringify(selectedVerification.data, null, 2)}
                </pre>
              </div>

              {selectedVerification.documents && selectedVerification.documents.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Documents</p>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedVerification.documents.map((doc, index) => (
                      <a
                        key={index}
                        href={doc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 border border-border rounded hover:bg-accent transition-colors text-sm"
                      >
                        Document {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {selectedVerification.status === 'pending' && (
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => handleApprove(selectedVerification.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleReject(selectedVerification.id)}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
