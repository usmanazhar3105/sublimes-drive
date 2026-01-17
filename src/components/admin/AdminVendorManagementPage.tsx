import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Switch } from '../ui/switch';
import { 
  Search, 
  Download, 
  Building,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  MoreVertical,
  Users,
  Shield,
  FileText,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Star,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Settings2
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { toast } from 'sonner';

interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  business_type: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  verified_by?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
  license_docs?: any[];
  admin_notes?: string;
  revenue?: number;
  listings_count?: number;
  rating?: number;
  auto_approve?: boolean;
}

interface VendorVerification {
  id: string;
  vendor_id: string;
  user_id: string;
  verification_type: 'business_license' | 'utility_bill' | 'trade_license' | 'bank_statement' | 'insurance_document';
  document_url: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string;
  reviewed_at?: string;
  admin_notes?: string;
  created_at: string;
}

export function AdminVendorManagementPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [verifications, setVerifications] = useState<VendorVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAutoApproveDialogOpen, setIsAutoApproveDialogOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [dateRange, setDateRange] = useState('all');
  const [autoApproveEnabled, setAutoApproveEnabled] = useState(false);

  // 🔥 REAL DATA: Fetch vendors from Supabase
  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      // Fetch vendors from profiles table where role is vendor or garage_owner
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          display_name,
          phone,
          emirate,
          role,
          verification_status,
          created_at,
          updated_at
        `)
        .in('role', ['vendor', 'garage_owner'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map profiles to Vendor interface
      const mappedVendors: Vendor[] = (profiles || []).map((p: any) => ({
        id: p.id,
        name: p.display_name || p.email?.split('@')[0] || 'Unknown Vendor',
        email: p.email || '',
        phone: p.phone || '',
        address: p.emirate || 'UAE',
        business_type: p.role === 'garage_owner' ? 'Garage' : 'Vendor',
        verification_status: p.verification_status || 'pending',
        created_at: p.created_at || new Date().toISOString(),
        updated_at: p.updated_at || p.created_at || new Date().toISOString(),
        revenue: 0, // TODO: Calculate from transactions
        listings_count: 0, // TODO: Count from listings table
        rating: 0, // TODO: Calculate from reviews
        auto_approve: false,
        license_docs: [], // TODO: Get from verification_requests
      }));

      setVendors(mappedVendors);
    } catch (error: any) {
      console.error('Error fetching vendors:', error);
      toast.error('Failed to load vendors: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vendor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vendor.business_type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || vendor.verification_status === statusFilter;
    const matchesLocation = locationFilter === 'all' || vendor.address.includes(locationFilter);
    return matchesSearch && matchesStatus && matchesLocation;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedVendors(filteredVendors.map(v => v.id));
    } else {
      setSelectedVendors([]);
    }
  };

  const handleSelectVendor = (vendorId: string, checked: boolean) => {
    if (checked) {
      setSelectedVendors([...selectedVendors, vendorId]);
    } else {
      setSelectedVendors(selectedVendors.filter(id => id !== vendorId));
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject') => {
    if (selectedVendors.length === 0) {
      toast.error('Please select vendors to perform bulk action');
      return;
    }

    try {
      const updatedVendors = vendors.map(vendor => 
        selectedVendors.includes(vendor.id)
          ? { 
              ...vendor, 
              verification_status: action,
              verified_by: 'current-admin-id',
              verified_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          : vendor
      );
      
      setVendors(updatedVendors);
      setSelectedVendors([]);
      toast.success(`${selectedVendors.length} vendors ${action}d successfully`);
    } catch (error) {
      toast.error(`Failed to ${action} vendors`);
    }
  };

  const handleReviewVendor = (vendor: Vendor, action: 'approve' | 'reject') => {
    setSelectedVendor(vendor);
    setReviewAction(action);
    setReviewNotes(vendor.admin_notes || '');
    setIsReviewDialogOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedVendor) return;

    try {
      const updatedVendors = vendors.map(vendor => 
        vendor.id === selectedVendor.id 
          ? { 
              ...vendor, 
              verification_status: reviewAction,
              verified_by: 'current-admin-id',
              verified_at: new Date().toISOString(),
              admin_notes: reviewNotes,
              updated_at: new Date().toISOString()
            }
          : vendor
      );
      
      setVendors(updatedVendors);
      setIsReviewDialogOpen(false);
      setReviewNotes('');
      
      toast.success(`Vendor ${reviewAction === 'approve' ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      toast.error('Failed to update vendor status');
    }
  };

  const handleViewDetails = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsDetailsDialogOpen(true);
  };

  const handleEditVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsEditDialogOpen(true);
  };

  const handleViewDocuments = (vendor: Vendor) => {
    // Open documents in new tab
    vendor.license_docs?.forEach(doc => {
      window.open(doc.url, '_blank');
    });
  };

  const handleExportData = async () => {
    try {
      const csvData = filteredVendors.map(vendor => ({
        'Vendor Name': vendor.name,
        'Email': vendor.email,
        'Phone': vendor.phone,
        'Address': vendor.address,
        'Business Type': vendor.business_type,
        'Status': vendor.verification_status,
        'Revenue': vendor.revenue || 0,
        'Listings': vendor.listings_count || 0,
        'Rating': vendor.rating || 0,
        'Created Date': new Date(vendor.created_at).toLocaleDateString(),
        'Verified Date': vendor.verified_at ? new Date(vendor.verified_at).toLocaleDateString() : '',
        'Admin Notes': vendor.admin_notes || ''
      }));

      const csvContent = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vendors-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const handleAutoApproveToggle = async () => {
    try {
      setAutoApproveEnabled(!autoApproveEnabled);
      toast.success(`Auto-approval ${!autoApproveEnabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to update auto-approval settings');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getVerificationIcon = (type: string) => {
    switch (type) {
      case 'business_license':
        return <FileText className="h-4 w-4" />;
      case 'trade_license':
        return <Shield className="h-4 w-4" />;
      case 'utility_bill':
        return <FileText className="h-4 w-4" />;
      case 'bank_statement':
        return <DollarSign className="h-4 w-4" />;
      case 'insurance_document':
        return <Shield className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-[var(--sublimes-gold)]" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--sublimes-light-text)]">Vendor Management</h1>
          <p className="text-gray-400">Manage vendor registrations and verifications</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleExportData}
            variant="outline" 
            size="sm"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button 
            onClick={() => window.location.reload()}
            variant="outline" 
            size="sm"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Auto-Approval Settings */}
      <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[var(--sublimes-light-text)]">Auto-Approval for Vendor Verifications</h3>
              <p className="text-gray-400">Automatically approve vendors based on criteria</p>
            </div>
            <div className="flex items-center gap-4">
              <Switch 
                checked={autoApproveEnabled}
                onCheckedChange={handleAutoApproveToggle}
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsAutoApproveDialogOpen(true)}
              >
                <Settings2 className="mr-2 h-4 w-4" />
                Rules
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-[var(--sublimes-light-text)]">{vendors.length}</p>
                <p className="text-sm text-gray-400">Total Vendors</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-[var(--sublimes-light-text)]">
                  {vendors.filter(v => v.verification_status === 'pending').length}
                </p>
                <p className="text-sm text-gray-400">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-[var(--sublimes-light-text)]">
                  {vendors.filter(v => v.verification_status === 'approved').length}
                </p>
                <p className="text-sm text-gray-400">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold text-[var(--sublimes-light-text)]">
                  AED {vendors.reduce((sum, v) => sum + (v.revenue || 0), 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-400">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold text-[var(--sublimes-light-text)]">
                  {(vendors.reduce((sum, v) => sum + (v.rating || 0), 0) / vendors.filter(v => v.rating > 0).length || 0).toFixed(1)}
                </p>
                <p className="text-sm text-gray-400">Avg Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Bulk Actions */}
      <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search vendors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="Dubai">Dubai</SelectItem>
                <SelectItem value="Abu Dhabi">Abu Dhabi</SelectItem>
                <SelectItem value="Sharjah">Sharjah</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Bulk Actions */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Checkbox 
                checked={selectedVendors.length === filteredVendors.length && filteredVendors.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-gray-400">
                Select All ({selectedVendors.length}/{filteredVendors.length} selected)
              </span>
              {selectedVendors.length > 0 && (
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleBulkAction('approve')}
                    className="bg-green-600/10 text-green-600 border-green-600/20 hover:bg-green-600/20"
                  >
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Approve Selected ({selectedVendors.length})
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleBulkAction('reject')}
                    className="bg-red-600/10 text-red-600 border-red-600/20 hover:bg-red-600/20"
                  >
                    <XCircle className="mr-1 h-4 w-4" />
                    Reject Selected ({selectedVendors.length})
                  </Button>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Calendar className="mr-2 h-4 w-4" />
                Date Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vendors Table */}
      <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Vendors ({filteredVendors.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredVendors.map((vendor) => (
              <div 
                key={vendor.id}
                className="flex items-center justify-between p-4 border border-[var(--sublimes-border)] rounded-lg hover:bg-[var(--sublimes-card-bg)]/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <Checkbox 
                    checked={selectedVendors.includes(vendor.id)}
                    onCheckedChange={(checked) => handleSelectVendor(vendor.id, checked as boolean)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-[var(--sublimes-light-text)]">{vendor.name}</h3>
                      {getStatusBadge(vendor.verification_status)}
                      {vendor.auto_approve && (
                        <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                          Auto-Approved
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        <span>{vendor.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        <span>{vendor.phone}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{vendor.address}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <span className="text-gray-500">Business: <span className="text-[var(--sublimes-light-text)]">{vendor.business_type}</span></span>
                      <span className="text-gray-500">Revenue: <span className="text-[var(--sublimes-light-text)]">AED {vendor.revenue?.toLocaleString() || 0}</span></span>
                      <span className="text-gray-500">Listings: <span className="text-[var(--sublimes-light-text)]">{vendor.listings_count || 0}</span></span>
                      {vendor.rating > 0 && (
                        <span className="text-gray-500">Rating: <span className="text-[var(--sublimes-light-text)]">{vendor.rating}/5.0</span></span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {vendor.verification_status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleReviewVendor(vendor, 'approve')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReviewVendor(vendor, 'reject')}
                      >
                        <XCircle className="mr-1 h-4 w-4" />
                        Reject
                      </Button>
                    </>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleViewDetails(vendor)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleViewDocuments(vendor)}>
                        <FileText className="mr-2 h-4 w-4" />
                        View Documents
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditVendor(vendor)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Vendor
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--sublimes-light-text)]">
              {reviewAction === 'approve' ? 'Approve' : 'Reject'} Vendor
            </DialogTitle>
            <DialogDescription>
              {selectedVendor?.name} - {selectedVendor?.business_type}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="review-notes">Admin Notes</Label>
              <Textarea
                id="review-notes"
                placeholder="Add notes about this decision..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="mt-1"
              />
            </div>
            
            {selectedVendor?.license_docs && (
              <div>
                <Label>Verification Documents</Label>
                <div className="mt-2 space-y-2">
                  {selectedVendor.license_docs.map((doc, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border border-[var(--sublimes-border)] rounded">
                      {getVerificationIcon(doc.type)}
                      <span className="text-sm">{doc.type.replace('_', ' ').toUpperCase()}</span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(doc.url, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitReview}
              className={reviewAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {reviewAction === 'approve' ? 'Approve Vendor' : 'Reject Vendor'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)] max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-[var(--sublimes-light-text)]">
              Vendor Details - {selectedVendor?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedVendor && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {selectedVendor.name}</p>
                    <p><span className="font-medium">Email:</span> {selectedVendor.email}</p>
                    <p><span className="font-medium">Phone:</span> {selectedVendor.phone}</p>
                    <p><span className="font-medium">Address:</span> {selectedVendor.address}</p>
                    <p><span className="font-medium">Business Type:</span> {selectedVendor.business_type}</p>
                    <p><span className="font-medium">Status:</span> {getStatusBadge(selectedVendor.verification_status)}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">Business Metrics</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Revenue:</span> AED {selectedVendor.revenue?.toLocaleString() || 0}</p>
                    <p><span className="font-medium">Listings:</span> {selectedVendor.listings_count || 0}</p>
                    <p><span className="font-medium">Rating:</span> {selectedVendor.rating || 'N/A'}</p>
                    <p><span className="font-medium">Created:</span> {new Date(selectedVendor.created_at).toLocaleDateString()}</p>
                    {selectedVendor.verified_at && (
                      <p><span className="font-medium">Verified:</span> {new Date(selectedVendor.verified_at).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {selectedVendor.admin_notes && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Admin Notes</h3>
                  <p className="text-gray-300">{selectedVendor.admin_notes}</p>
                </div>
              )}
              
              {selectedVendor.license_docs && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Verification Documents</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedVendor.license_docs.map((doc, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 border border-[var(--sublimes-border)] rounded">
                        {getVerificationIcon(doc.type)}
                        <span className="text-sm flex-1">{doc.type.replace('_', ' ').toUpperCase()}</span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(doc.url, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => handleEditVendor(selectedVendor!)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Vendor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--sublimes-light-text)]">
              Edit Vendor - {selectedVendor?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedVendor && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Vendor Name</Label>
                  <Input id="edit-name" defaultValue={selectedVendor.name} />
                </div>
                <div>
                  <Label htmlFor="edit-email">Email</Label>
                  <Input id="edit-email" defaultValue={selectedVendor.email} />
                </div>
                <div>
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input id="edit-phone" defaultValue={selectedVendor.phone} />
                </div>
                <div>
                  <Label htmlFor="edit-business-type">Business Type</Label>
                  <Input id="edit-business-type" defaultValue={selectedVendor.business_type} />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-address">Address</Label>
                <Textarea id="edit-address" defaultValue={selectedVendor.address} />
              </div>
              <div>
                <Label htmlFor="edit-notes">Admin Notes</Label>
                <Textarea id="edit-notes" defaultValue={selectedVendor.admin_notes || ''} />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}