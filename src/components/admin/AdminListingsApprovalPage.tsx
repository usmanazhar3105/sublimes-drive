import { useState, useEffect } from 'react';
import { 
  Car, 
  Settings, 
  Wrench, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  AlertTriangle,
  Download,
  Search,
  CreditCard,
  Filter,
  Bot
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Switch } from '../ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { useAdminSettings } from './AdminSettingsContext';
import { DateRangeFilter } from './DateRangeFilter';
import { toast } from 'sonner';

interface PendingListing {
  id: string;
  type: 'car' | 'parts' | 'garage';
  userId: string;
  userName: string;
  userEmail: string;
  title: string;
  description: string;
  price?: number;
  currency: string;
  paymentReference: string;
  paymentAmount: number;
  paidAt: Date;
  submittedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  images: string[];
  details: any;
  adminNotes?: string;
  reviewedAt?: Date;
  reviewedBy?: string;
}

export function AdminListingsApprovalPage() {
  const { autoApprovalSettings, updateAutoApproval, isAutoApprovalEnabled } = useAdminSettings();
  const [selectedListing, setSelectedListing] = useState<PendingListing | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState<PendingListing | null>(null);
  const [showRejectionModal, setShowRejectionModal] = useState<PendingListing | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Mock pending listings data
  const [listings, setListings] = useState<PendingListing[]>([
    {
      id: 'listing_001',
      type: 'car',
      userId: 'user_123',
      userName: 'Ahmad Al-Rashid',
      userEmail: 'ahmad@example.com',
      title: 'BMW X5 2023 - Excellent Condition',
      description: 'Well maintained BMW X5 with full service history. Perfect for UAE roads.',
      price: 180000,
      currency: 'AED',
      paymentReference: 'pi_1234567890',
      paymentAmount: 50,
      paidAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      submittedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      status: 'pending',
      priority: 'medium',
      images: ['bmw1.jpg', 'bmw2.jpg', 'bmw3.jpg'],
      details: {
        make: 'BMW',
        model: 'X5',
        year: 2023,
        mileage: 15000,
        color: 'Black',
        condition: 'Excellent'
      }
    },
    {
      id: 'listing_002',
      type: 'garage',
      userId: 'garage_456',
      userName: 'Emirates Auto Center',
      userEmail: 'info@emiratesauto.ae',
      title: 'Emirates Auto Center - Premium Service',
      description: 'Full-service automotive center specializing in luxury vehicles with certified technicians.',
      currency: 'AED',
      paymentReference: 'pi_garage_789',
      paymentAmount: 100,
      paidAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      submittedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      status: 'pending',
      priority: 'high',
      images: ['garage1.jpg', 'garage2.jpg'],
      details: {
        location: 'Dubai Marina',
        services: ['Engine Repair', 'AC Service', 'Body Work', 'Electrical'],
        licenseNumber: 'CN-1234567',
        established: '2018'
      }
    },
    {
      id: 'listing_003',
      type: 'parts',
      userId: 'user_789',
      userName: 'Omar Hassan',
      userEmail: 'omar@example.com',
      title: 'Mercedes E-Class Brake Pads - Original',
      description: 'Genuine Mercedes brake pads for E-Class models. Brand new, never used.',
      price: 450,
      currency: 'AED',
      paymentReference: 'pi_parts_456',
      paymentAmount: 25,
      paidAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      submittedAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
      status: 'approved',
      priority: 'low',
      images: ['brake1.jpg'],
      details: {
        brand: 'Mercedes-Benz',
        partNumber: 'A0004201120',
        condition: 'New',
        compatibility: 'E-Class W213'
      },
      adminNotes: 'All documentation verified. Parts are genuine.',
      reviewedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      reviewedBy: 'admin1'
    }
  ]);

  // Auto-approval effect for marketplace listings
  useEffect(() => {
    if (isAutoApprovalEnabled('marketplaceListings')) {
      const pendingListings = listings.filter(l => l.status === 'pending');
      if (pendingListings.length > 0) {
        setListings(prev => prev.map(l => 
          l.status === 'pending' 
            ? {
                ...l, 
                status: 'approved' as const,
                adminNotes: '🤖 Auto-approved by system',
                reviewedBy: 'auto-approval-system',
                reviewedAt: new Date()
              }
            : l
        ));
        
        setTimeout(() => {
          toast.success(`🤖 ${pendingListings.length} marketplace listing(s) auto-approved`);
        }, 500);
      }
    }
  }, [autoApprovalSettings.marketplaceListings, listings.length]);

  const filteredListings = listings.filter(listing => {
    const matchesType = filterType === 'all' || listing.type === filterType;
    const matchesStatus = filterStatus === 'all' || listing.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesStatus && matchesSearch;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'car': return <Car className="w-5 h-5" />;
      case 'parts': return <Settings className="w-5 h-5" />;
      case 'garage': return <Wrench className="w-5 h-5" />;
      default: return <Car className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'car': return 'text-blue-500 bg-blue-500/10';
      case 'parts': return 'text-green-500 bg-green-500/10';
      case 'garage': return 'text-orange-500 bg-orange-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-orange-500" />;
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-orange-500 bg-orange-500/10';
      case 'approved': return 'text-green-500 bg-green-500/10';
      case 'rejected': return 'text-red-500 bg-red-500/10';
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

  // Bulk selection handlers
  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = (selectAll: boolean) => {
    if (selectAll) {
      setSelectedItems(filteredListings.map(listing => listing.id));
    } else {
      setSelectedItems([]);
    }
  };

  // Export functionality
  const handleExportData = (selectedIds: string[], dateRange: { from: string; to: string }) => {
    const dataToExport = filteredListings.filter(listing => selectedIds.includes(listing.id));
    
    // Apply date filter if provided
    let filteredItems = dataToExport;
    if (dateRange?.from || dateRange?.to) {
      filteredItems = dataToExport.filter(listing => {
        const itemDate = new Date(listing.submittedAt);
        const fromDate = dateRange.from ? new Date(dateRange.from) : null;
        const toDate = dateRange.to ? new Date(dateRange.to) : null;
        
        if (fromDate && itemDate < fromDate) return false;
        if (toDate && itemDate > toDate) return false;
        return true;
      });
    }

    // Create CSV content
    const headers = ['Listing ID', 'Type', 'Title', 'User Name', 'Email', 'Price', 'Payment Amount', 'Status', 'Priority', 'Submitted At', 'Paid At'];
    
    const csvContent = [
      headers.join(','),
      ...filteredItems.map(listing => [
        listing.id,
        listing.type,
        `"${listing.title}"`,
        listing.userName,
        listing.userEmail,
        listing.price || 'N/A',
        listing.paymentAmount,
        listing.status,
        listing.priority,
        formatDateTime(listing.submittedAt),
        formatDateTime(listing.paidAt)
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `listings_approval_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success(`Exported ${filteredItems.length} listings successfully`);
  };

  const approveListing = () => {
    if (showApprovalModal) {
      setListings(prev => prev.map(listing => 
        listing.id === showApprovalModal.id 
          ? {
              ...listing,
              status: 'approved' as const,
              adminNotes: adminNotes,
              reviewedAt: new Date(),
              reviewedBy: 'current_admin'
            }
          : listing
      ));
      toast.success(`${showApprovalModal.type} listing approved successfully`);
      setShowApprovalModal(null);
      setAdminNotes('');
    }
  };

  const rejectListing = () => {
    if (showRejectionModal) {
      setListings(prev => prev.map(listing => 
        listing.id === showRejectionModal.id 
          ? {
              ...listing,
              status: 'rejected' as const,
              adminNotes: adminNotes,
              reviewedAt: new Date(),
              reviewedBy: 'current_admin'
            }
          : listing
      ));
      toast.error(`${showRejectionModal.type} listing rejected`);
      setShowRejectionModal(null);
      setAdminNotes('');
    }
  };

  const bulkApprove = () => {
    const pendingListings = filteredListings.filter(l => l.status === 'pending');
    if (pendingListings.length === 0) {
      toast.info('No pending listings to approve');
      return;
    }

    if (window.confirm(`Approve ${pendingListings.length} pending listings?`)) {
      setListings(prev => prev.map(listing => 
        pendingListings.find(pl => pl.id === listing.id)
          ? {
              ...listing,
              status: 'approved' as const,
              adminNotes: 'Bulk approved',
              reviewedAt: new Date(),
              reviewedBy: 'current_admin'
            }
          : listing
      ));
      toast.success(`${pendingListings.length} listings approved`);
    }
  };

  const exportListings = () => {
    const headers = ['Listing ID', 'Type', 'Title', 'User', 'Email', 'Payment Amount', 'Payment Ref', 'Status', 'Priority', 'Submitted At'];
    const csvContent = [
      headers.join(','),
      ...filteredListings.map(listing => [
        listing.id,
        listing.type,
        `"${listing.title}"`,
        `"${listing.userName}"`,
        listing.userEmail,
        `${listing.paymentAmount} ${listing.currency}`,
        listing.paymentReference,
        listing.status,
        listing.priority,
        listing.submittedAt.toISOString().split('T')[0]
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `listings-approval-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Listings exported successfully');
  };

  // Calculate stats
  const pendingCount = listings.filter(l => l.status === 'pending').length;
  const approvedCount = listings.filter(l => l.status === 'approved').length;
  const rejectedCount = listings.filter(l => l.status === 'rejected').length;
  const totalRevenue = listings.reduce((sum, l) => sum + l.paymentAmount, 0);

  return (
    <div className="p-6 bg-[var(--sublimes-dark-bg)]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[var(--sublimes-light-text)]">Listings Approval Queue</h1>
            <p className="text-gray-400 mt-1">Review and approve paid listings awaiting approval</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={bulkApprove}
              className="bg-green-500 text-white hover:bg-green-600"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Bulk Approve
            </Button>
            <Button
              onClick={exportListings}
              className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] hover:bg-[var(--sublimes-gold)]/90"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Approval</p>
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
                <p className="text-gray-400 text-sm">Rejected</p>
                <p className="text-2xl font-bold text-[var(--sublimes-light-text)]">{rejectedCount}</p>
              </div>
              <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </div>

          <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-[var(--sublimes-light-text)]">
                  {formatAmount(totalRevenue, 'AED')}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search listings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] focus:ring-2 focus:ring-[var(--sublimes-gold)]"
          >
            <option value="all">All Types</option>
            <option value="car">Car Listings</option>
            <option value="parts">Parts Listings</option>
            <option value="garage">Garage Listings</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] focus:ring-2 focus:ring-[var(--sublimes-gold)]"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Auto-Approval Toggle */}
        <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isAutoApprovalEnabled('marketplaceListings') 
                  ? 'bg-green-500/10' 
                  : 'bg-gray-500/10'
              }`}>
                <Bot className={`w-5 h-5 ${
                  isAutoApprovalEnabled('marketplaceListings') 
                    ? 'text-green-500' 
                    : 'text-gray-500'
                }`} />
              </div>
              <div>
                <h3 className="font-medium text-[var(--sublimes-light-text)]">Auto-Approval for Marketplace Listings</h3>
                <p className="text-sm text-gray-400">
                  {isAutoApprovalEnabled('marketplaceListings') 
                    ? '🤖 New paid listings will be automatically approved' 
                    : '👤 Manual review required for all listings'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`text-sm font-medium ${
                isAutoApprovalEnabled('marketplaceListings') 
                  ? 'text-green-500' 
                  : 'text-gray-400'
              }`}>
                {isAutoApprovalEnabled('marketplaceListings') ? '🤖 Auto' : '👤 Manual'}
              </span>
              <Switch
                checked={isAutoApprovalEnabled('marketplaceListings')}
                onCheckedChange={(checked) => updateAutoApproval('marketplaceListings', checked)}
                className="data-[state=checked]:bg-[var(--sublimes-gold)]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Date Range Filter and Bulk Actions */}
      <DateRangeFilter
        selectedItems={selectedItems}
        onSelectAll={handleSelectAll}
        allItems={filteredListings}
        onExportData={handleExportData}
        title="Listings"
        showBulkActions={true}
      />

      {/* Listings List */}
      <div className="space-y-4">
        {filteredListings.length === 0 ? (
          <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-12 text-center">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[var(--sublimes-light-text)] mb-2">No Listings Found</h3>
            <p className="text-gray-400">No listings match your current filters.</p>
          </div>
        ) : (
          filteredListings.map((listing) => (
            <div
              key={listing.id}
              className="relative bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6"
            >
              {/* Selection Checkbox */}
              <div className="absolute top-4 left-4 z-10">
                <Checkbox
                  checked={selectedItems.includes(listing.id)}
                  onCheckedChange={() => handleSelectItem(listing.id)}
                  className="border-[var(--sublimes-border)] bg-[var(--sublimes-card-bg)]"
                />
              </div>
              
              <div className="pl-8">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getTypeColor(listing.type)}`}>
                    {getTypeIcon(listing.type)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-bold text-[var(--sublimes-light-text)]">{listing.title}</h3>
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${getStatusColor(listing.status)}`}>
                        {getStatusIcon(listing.status)}
                        <span className="text-xs font-medium capitalize">{listing.status}</span>
                      </div>
                      <div className={`px-2 py-1 rounded-full ${getPriorityColor(listing.priority)}`}>
                        <span className="text-xs font-medium capitalize">{listing.priority}</span>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mb-1">By: {listing.userName} ({listing.userEmail})</p>
                    <p className="text-gray-400 text-sm">
                      Listing ID: {listing.id} • Type: {listing.type.charAt(0).toUpperCase() + listing.type.slice(1)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {listing.price && (
                    <p className="text-[var(--sublimes-light-text)] font-bold">
                      {formatAmount(listing.price, listing.currency)}
                    </p>
                  )}
                  <p className="text-gray-400 text-sm">
                    Paid: {formatAmount(listing.paymentAmount, listing.currency)}
                  </p>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CreditCard className="w-4 h-4 text-green-500" />
                  <span className="text-green-500 font-medium text-sm">Payment Verified</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Reference: </span>
                    <span className="text-[var(--sublimes-light-text)]">{listing.paymentReference}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Amount: </span>
                    <span className="text-[var(--sublimes-light-text)] font-medium">
                      {formatAmount(listing.paymentAmount, listing.currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Paid At: </span>
                    <span className="text-[var(--sublimes-light-text)]">{formatDateTime(listing.paidAt)}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg p-4 mb-4">
                <p className="text-gray-400 text-sm mb-2">Description:</p>
                <p className="text-[var(--sublimes-light-text)] text-sm">{listing.description}</p>
                
                {/* Additional Details */}
                {Object.keys(listing.details).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[var(--sublimes-border)]">
                    <p className="text-gray-400 text-sm mb-2">Details:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(listing.details).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-400 text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                          <span className="text-[var(--sublimes-light-text)] text-sm">
                            {Array.isArray(value) ? value.join(', ') : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {listing.adminNotes && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4">
                  <h5 className="font-medium text-yellow-500 text-sm mb-1">Admin Notes</h5>
                  <p className="text-gray-300 text-sm">{listing.adminNotes}</p>
                  {listing.reviewedAt && listing.reviewedBy && (
                    <p className="text-gray-400 text-xs mt-2">
                      Reviewed by {listing.reviewedBy} on {formatDateTime(listing.reviewedAt)}
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">
                  Submitted {formatDateTime(listing.submittedAt)}
                </span>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedListing(listing)}
                    className="border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                  
                  {listing.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => setShowApprovalModal(listing)}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setShowRejectionModal(listing)}
                        className="bg-red-500 hover:bg-red-600 text-white"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
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
            <DialogTitle className="text-[var(--sublimes-light-text)]">Approve Listing</DialogTitle>
            <DialogDescription className="text-gray-400">
              Review and approve this paid listing for publication on the marketplace.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-400">
              Are you sure you want to approve this {showApprovalModal?.type} listing?
            </p>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-green-500 font-medium text-sm">Payment Verified</span>
              </div>
              <p className="text-gray-400 text-sm">
                Payment Reference: {showApprovalModal?.paymentReference}
              </p>
              <p className="text-gray-400 text-sm">
                Amount: {showApprovalModal && formatAmount(showApprovalModal.paymentAmount, showApprovalModal.currency)}
              </p>
            </div>
            <div>
              <label className="block text-[var(--sublimes-light-text)] font-medium mb-2">Admin Notes (Optional)</label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Enter approval notes..."
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
                onClick={approveListing}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
              >
                Approve Listing
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rejection Modal */}
      <Dialog open={!!showRejectionModal} onOpenChange={() => setShowRejectionModal(null)}>
        <DialogContent className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--sublimes-light-text)]">Reject Listing</DialogTitle>
            <DialogDescription className="text-gray-400">
              Reject this listing with a detailed reason. The user will be notified and may receive a refund.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-red-500 font-medium text-sm">Rejection Notice</span>
              </div>
              <p className="text-gray-400 text-sm">
                The user will be notified and a refund process may be initiated depending on the reason.
              </p>
            </div>
            <div>
              <label className="block text-[var(--sublimes-light-text)] font-medium mb-2">Rejection Reason (Required)</label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Enter detailed rejection reason..."
                className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                rows={4}
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
                onClick={rejectListing}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                disabled={!adminNotes.trim()}
              >
                Reject Listing
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={!!selectedListing} onOpenChange={() => setSelectedListing(null)}>
        <DialogContent className="max-w-4xl bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--sublimes-light-text)]">Listing Details</DialogTitle>
          </DialogHeader>
          {selectedListing && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-[var(--sublimes-light-text)] mb-3">Listing Info</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">ID:</span>
                      <span className="text-[var(--sublimes-light-text)]">{selectedListing.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Type:</span>
                      <span className="text-[var(--sublimes-light-text)] capitalize">{selectedListing.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <div className={`flex items-center space-x-1 ${getStatusColor(selectedListing.status)}`}>
                        {getStatusIcon(selectedListing.status)}
                        <span className="capitalize">{selectedListing.status}</span>
                      </div>
                    </div>
                    {selectedListing.price && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Price:</span>
                        <span className="text-[var(--sublimes-light-text)] font-medium">
                          {formatAmount(selectedListing.price, selectedListing.currency)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-[var(--sublimes-light-text)] mb-3">Payment Info</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Reference:</span>
                      <span className="text-[var(--sublimes-light-text)]">{selectedListing.paymentReference}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Amount:</span>
                      <span className="text-[var(--sublimes-light-text)] font-medium">
                        {formatAmount(selectedListing.paymentAmount, selectedListing.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Paid At:</span>
                      <span className="text-[var(--sublimes-light-text)]">{formatDateTime(selectedListing.paidAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Submitted:</span>
                      <span className="text-[var(--sublimes-light-text)]">{formatDateTime(selectedListing.submittedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-[var(--sublimes-light-text)] mb-2">Description</h3>
                <p className="text-gray-400">{selectedListing.description}</p>
              </div>

              {Object.keys(selectedListing.details).length > 0 && (
                <div>
                  <h3 className="font-medium text-[var(--sublimes-light-text)] mb-3">Additional Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(selectedListing.details).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                        <span className="text-[var(--sublimes-light-text)]">
                          {Array.isArray(value) ? value.join(', ') : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedListing.images.length > 0 && (
                <div>
                  <h3 className="font-medium text-[var(--sublimes-light-text)] mb-3">Images ({selectedListing.images.length})</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {selectedListing.images.map((image, index) => (
                      <div key={index} className="bg-gray-700 rounded-lg p-2 text-center">
                        <span className="text-gray-400 text-sm">{image}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={() => setSelectedListing(null)}
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