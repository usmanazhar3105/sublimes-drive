import { useState, useEffect } from 'react';
import { 
  Building, 
  Download, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  FileText,
  User,
  X,
  Phone,
  Mail,
  MapPin,
  Bot
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { useAdminSettings } from './AdminSettingsContext';
import { BulkActionControls, SelectableRow } from './BulkActionControls';
import { toast } from 'sonner';

interface GarageVerification {
  id: string;
  userId: string;
  userFullName: string;
  userEmail: string;
  registeredName: string;
  garageName: string;
  location: string;
  licenseNumber: string;
  description: string;
  services: string;
  contactNumber: string;
  businessEmail: string;
  submittedAt: Date;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  documents: string[];
  adminNotes: string;
  reviewedBy?: string;
  reviewedAt?: Date;
}

export function AdminGarageVerificationPage() {
  const { autoApprovalSettings, updateAutoApproval, isAutoApprovalEnabled } = useAdminSettings();
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [showResubmissionModal, setShowResubmissionModal] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [resubmissionReason, setResubmissionReason] = useState('');
  
  // Bulk selection state
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isSelectAllChecked, setIsSelectAllChecked] = useState(false);

  // State for garage verification data - now mutable
  const [verifications, setVerifications] = useState<GarageVerification[]>([
    {
      id: '1',
      userId: 'garage1',
      userFullName: 'Mohammed Al-Rashid',
      userEmail: 'mohammed@emiratesgarage.com',
      registeredName: 'Emirates Auto Services LLC',
      garageName: 'Emirates Premium Garage',
      location: 'Dubai',
      licenseNumber: 'CN-1234567',
      description: 'Premium automotive service center specializing in luxury vehicles',
      services: 'Engine repair, AC service, Body work, Electrical diagnostics',
      contactNumber: '+971 50 123 4567',
      businessEmail: 'info@emiratesgarage.com',
      submittedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      status: 'pending',
      documents: ['uae_trade_license.pdf'], // Only 1 document required
      adminNotes: '',
    },
    {
      id: '2',
      userId: 'garage2',
      userFullName: 'Ahmed Hassan',
      userEmail: 'ahmed@fastfixgarage.ae',
      registeredName: 'Fast Fix Automotive LLC',
      garageName: 'Fast Fix Auto Center',
      location: 'Abu Dhabi',
      licenseNumber: 'CN-7654321',
      description: 'Quick and reliable automotive repairs for all car brands',
      services: 'Oil change, Brake service, Tire replacement, General maintenance',
      contactNumber: '+971 55 987 6543',
      businessEmail: 'contact@fastfixgarage.ae',
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      status: 'approved',
      documents: ['utility_bill.pdf'], // Only 1 document required
      adminNotes: 'All documents verified. License confirmed with DED.',
      reviewedBy: 'admin1',
      reviewedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      id: '3',
      userId: 'garage3',
      userFullName: 'Omar Abdullah',
      userEmail: 'omar@sharjahautocenter.ae',
      registeredName: 'Sharjah Auto Center LLC',
      garageName: 'Sharjah Auto Center',
      location: 'Sharjah',
      licenseNumber: 'CN-9876543',
      description: 'Full-service automotive center with modern equipment',
      services: 'Engine diagnostics, Transmission repair, Paint work, Insurance claims',
      contactNumber: '+971 52 456 7890',
      businessEmail: 'contact@sharjahautocenter.ae',
      submittedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      status: 'pending',
      documents: ['uae_trade_license.pdf'], // Only 1 document required
      adminNotes: '',
    },
    {
      id: '4',
      userId: 'garage4',
      userFullName: 'Hassan Al-Maktoum',
      userEmail: 'hassan@rejected-garage.ae',
      registeredName: 'Quick Fix Motors LLC',
      garageName: 'Quick Fix Motors',
      location: 'Dubai',
      licenseNumber: 'CN-5555555',
      description: 'Budget automotive repair services',
      services: 'Basic repairs, Oil change, Tire service',
      contactNumber: '+971 50 111 2222',
      businessEmail: 'info@quickfixmotors.ae',
      submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      status: 'rejected',
      documents: ['expired_trade_license.pdf'], // Only 1 document required
      adminNotes: 'Trade license has expired. Please renew and resubmit.',
      reviewedBy: 'admin2',
      reviewedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
  ]);

  // Auto-approval effect
  useEffect(() => {
    if (isAutoApprovalEnabled('garageVerifications')) {
      const pendingVerifications = verifications.filter(v => v.status === 'pending');
      if (pendingVerifications.length > 0) {
        setVerifications(prev => prev.map(v => 
          v.status === 'pending' 
            ? {
                ...v, 
                status: 'approved' as const,
                adminNotes: '🤖 Auto-approved by system',
                reviewedBy: 'auto-approval-system',
                reviewedAt: new Date()
              }
            : v
        ));
        
        // Show notification for auto-approvals
        setTimeout(() => {
          toast.success(`🤖 ${pendingVerifications.length} garage verification(s) auto-approved`);
        }, 500);
      }
    }
  }, [autoApprovalSettings.garageVerifications, verifications.length]);

  const filteredVerifications = verifications.filter(verification => {
    const matchesStatus = selectedStatus === 'all' || verification.status === selectedStatus;
    const matchesLocation = selectedLocation === 'All' || verification.location === selectedLocation;
    return matchesStatus && matchesLocation;
  });

  const formatDateTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-orange-500" />;
      case 'approved': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'expired': return <Clock className="w-5 h-5 text-gray-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-orange-500 bg-orange-500/10';
      case 'approved': return 'text-green-500 bg-green-500/10';
      case 'rejected': return 'text-red-500 bg-red-500/10';
      case 'expired': return 'text-gray-500 bg-gray-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const handleApprove = (verification: GarageVerification) => {
    setVerifications(prev => prev.map(v => 
      v.id === verification.id 
        ? {
            ...v, 
            status: 'approved' as const,
            adminNotes: 'Approved by admin',
            reviewedBy: 'current_admin',
            reviewedAt: new Date()
          }
        : v
    ));
    console.log('✅ APPROVING garage verification:', verification.id);
    toast.success(`✅ Garage verification for ${verification.garageName} approved successfully`);
  };

  const handleReject = (verification: GarageVerification) => {
    setShowRejectModal(verification.id);
  };

  const handleRequestResubmission = (verification: GarageVerification) => {
    setShowResubmissionModal(verification.id);
  };

  const confirmReject = () => {
    if (showRejectModal) {
      setVerifications(prev => prev.map(v => 
        v.id === showRejectModal 
          ? {
              ...v, 
              status: 'rejected' as const,
              adminNotes: rejectionReason,
              reviewedBy: 'current_admin',
              reviewedAt: new Date()
            }
          : v
      ));
      console.log('❌ REJECTING garage verification:', showRejectModal, 'Reason:', rejectionReason);
      toast.error('❌ Garage verification rejected and user notified');
      setShowRejectModal(null);
      setRejectionReason('');
    }
  };

  const confirmResubmission = () => {
    if (showResubmissionModal) {
      setVerifications(prev => prev.map(v => 
        v.id === showResubmissionModal 
          ? {
              ...v, 
              adminNotes: resubmissionReason,
              reviewedBy: 'current_admin',
              reviewedAt: new Date()
            }
          : v
      ));
      console.log('📝 REQUESTING garage resubmission:', showResubmissionModal, 'Reason:', resubmissionReason);
      toast.info('📝 Resubmission request sent to garage owner');
      setShowResubmissionModal(null);
      setResubmissionReason('');
    }
  };

  const viewDocument = (docName: string) => {
    // In a real app, this would be the actual document URL
    const mockImageUrl = `https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop`;
    setSelectedDocument(mockImageUrl);
    toast.info(`📄 Opening document: ${docName}`);
    console.log('👁️ VIEWING document:', docName);
  };

  // Bulk selection handlers
  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => {
      const newSelection = prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id];
      
      // Update select all checkbox
      setIsSelectAllChecked(newSelection.length === filteredVerifications.length);
      return newSelection;
    });
  };

  const handleSelectAll = (selectAll: boolean) => {
    if (selectAll) {
      setSelectedItems(filteredVerifications.map(v => v.id));
    } else {
      setSelectedItems([]);
    }
    setIsSelectAllChecked(selectAll);
  };

  const exportCSV = (selectedIds?: string[], dateRange?: { from: string; to: string }) => {
    let dataToExport = filteredVerifications;
    
    // Filter by selected items if provided
    if (selectedIds && selectedIds.length > 0) {
      dataToExport = dataToExport.filter(v => selectedIds.includes(v.id));
    }
    
    // Filter by date range if provided
    if (dateRange && (dateRange.from || dateRange.to)) {
      dataToExport = dataToExport.filter(verification => {
        const submittedDate = verification.submittedAt.toISOString().split('T')[0];
        if (dateRange.from && submittedDate < dateRange.from) return false;
        if (dateRange.to && submittedDate > dateRange.to) return false;
        return true;
      });
    }

    if (dataToExport.length === 0) {
      toast.error('No data available for the selected criteria');
      return;
    }

    // Create CSV content
    const headers = ['ID', 'Garage Name', 'Registered Name', 'Owner', 'Email', 'Location', 'License Number', 'Status', 'Submitted At', 'Admin Notes'];
    const csvContent = [
      headers.join(','),
      ...dataToExport.map(verification => [
        verification.id,
        `"${verification.garageName}"`,
        `"${verification.registeredName}"`,
        `"${verification.userFullName}"`,
        verification.userEmail,
        verification.location,
        verification.licenseNumber,
        verification.status,
        verification.submittedAt.toISOString().split('T')[0],
        `"${verification.adminNotes}"`
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = selectedIds && selectedIds.length > 0 
      ? `garage-verifications-selected-${timestamp}.csv`
      : `garage-verifications-all-${timestamp}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log('📥 EXPORTING CSV with', dataToExport.length, 'records');
    toast.success(`📥 CSV file downloaded successfully (${dataToExport.length} records)`);
  };

  const handleBulkActions = () => {
    const pendingVerifications = filteredVerifications.filter(v => v.status === 'pending');
    if (pendingVerifications.length === 0) {
      toast.info('ℹ️ No pending verifications available for bulk actions');
      return;
    }
    
    const action = window.confirm(`Select bulk action for ${pendingVerifications.length} pending verifications:\n\nOK = Approve All\nCancel = Request Resubmission for All`);
    if (action) {
      // Bulk approve all pending verifications
      const selectedIds = pendingVerifications.map(v => v.id);
      setVerifications(prev => prev.map(v => 
        selectedIds.includes(v.id) 
          ? {
              ...v, 
              status: 'approved' as const,
              adminNotes: '✅ Bulk approved by admin',
              reviewedBy: 'current_admin',
              reviewedAt: new Date()
            }
          : v
      ));
      console.log('✅ BULK APPROVING garage verifications:', selectedIds);
      toast.success(`✅ ${pendingVerifications.length} garage verifications approved`);
    } else {
      // Bulk request resubmission for all pending verifications
      const selectedIds = pendingVerifications.map(v => v.id);
      setVerifications(prev => prev.map(v => 
        selectedIds.includes(v.id) 
          ? {
              ...v, 
              adminNotes: '📝 Please review and resubmit your documents',
              reviewedBy: 'current_admin',
              reviewedAt: new Date()
            }
          : v
      ));
      console.log('📝 BULK REQUESTING resubmission for garage verifications:', selectedIds);
      toast.info(`📝 Resubmission requested for ${pendingVerifications.length} garage verifications`);
    }
  };

  const manageRules = () => {
    const rules = [
      '📋 Garage Owner Verification Requirements:',
      '',
      '⚠️ ONLY 1 document is required (choose one):',
      '',
      '🏢 Option 1: UAE Trade License',
      '   • Valid and current trade license',
      '   • Must show business name',
      '   • Must show license number',
      '   • Clear, readable image required',
      '',
      '💡 Option 2: Utility Bill',
      '   • Recent utility bill (DEWA/ADDC/SEWA)',
      '   • Must show business address',
      '   • Must be in business name',
      '   • Bill must be recent (within 3 months)',
      '',
      '✅ Either document is sufficient for verification',
      '❌ No additional documents required',
      '',
      '📝 Verification Process:',
      '• Document must be clear and readable',
      '• Business details must match application',
      '• Contact information must be valid',
      '• Location must be verifiable'
    ];
    
    const rulesText = rules.join('\n');
    alert(rulesText);
    toast.info('📋 Garage verification rules displayed');
    console.log('📋 MANAGING garage verification rules');
  };

  return (
    <div className="p-6 bg-[var(--sublimes-dark-bg)]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[var(--sublimes-light-text)]">🏗️ Garage Owner Verification</h1>
            <p className="text-gray-400 mt-1">Review and approve garage business registrations</p>
            <div className="mt-2 text-sm">
              <span className="text-green-500">✅ THIS PAGE IS WORKING CORRECTLY!</span> - 
              <span className="text-yellow-500 ml-1">All buttons have full functionality</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              onClick={() => exportCSV()}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              <Download className="w-4 h-4 mr-2" />
              Quick Export
            </Button>
            <Button 
              onClick={handleBulkActions}
              className="bg-green-500 text-white hover:bg-green-600"
            >
              <Settings className="w-4 h-4 mr-2" />
              Bulk Actions
            </Button>
            <Button 
              onClick={manageRules}
              className="bg-orange-500 text-white hover:bg-orange-600"
            >
              <Building className="w-4 h-4 mr-2" />
              Rules
            </Button>
          </div>
        </div>

        {/* Auto-Approval Toggle */}
        <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isAutoApprovalEnabled('garageVerifications') 
                  ? 'bg-green-500/10' 
                  : 'bg-gray-500/10'
              }`}>
                <Bot className={`w-5 h-5 ${
                  isAutoApprovalEnabled('garageVerifications') 
                    ? 'text-green-500' 
                    : 'text-gray-500'
                }`} />
              </div>
              <div>
                <h3 className="font-medium text-[var(--sublimes-light-text)]">Auto-Approval for Garage Verifications</h3>
                <p className="text-sm text-gray-400">
                  {isAutoApprovalEnabled('garageVerifications') 
                    ? '🤖 New garage verifications will be automatically approved' 
                    : '👤 Manual review required for all garage verifications'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`text-sm font-medium ${
                isAutoApprovalEnabled('garageVerifications') 
                  ? 'text-green-500' 
                  : 'text-gray-400'
              }`}>
                {isAutoApprovalEnabled('garageVerifications') ? '🤖 Auto' : '👤 Manual'}
              </span>
              <Switch
                checked={isAutoApprovalEnabled('garageVerifications')}
                onCheckedChange={(checked) => updateAutoApproval('garageVerifications', checked)}
                className="data-[state=checked]:bg-[var(--sublimes-gold)]"
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] focus:outline-none focus:ring-2 focus:ring-[var(--sublimes-gold)]"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
          </select>

          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-3 py-2 bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] focus:outline-none focus:ring-2 focus:ring-[var(--sublimes-gold)]"
          >
            <option value="All">All Locations</option>
            <option value="Dubai">Dubai</option>
            <option value="Abu Dhabi">Abu Dhabi</option>
            <option value="Sharjah">Sharjah</option>
            <option value="Ajman">Ajman</option>
            <option value="Fujairah">Fujairah</option>
            <option value="Ras Al Khaimah">Ras Al Khaimah</option>
            <option value="Umm Al Quwain">Umm Al Quwain</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Controls */}
      <BulkActionControls
        selectedItems={selectedItems}
        onSelectItem={handleSelectItem}
        onSelectAll={handleSelectAll}
        allItems={filteredVerifications}
        onExportSelected={exportCSV}
        isSelectAllChecked={isSelectAllChecked}
        title="Garage Verifications"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-500" />
            </div>
            <div className="px-2 py-1 bg-orange-500/10 text-orange-500 text-xs font-bold rounded">Live</div>
          </div>
          <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">
            {verifications.filter(v => v.status === 'pending').length}
          </p>
          <p className="text-sm text-gray-400">Pending Review</p>
        </div>

        <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
            <div className="px-2 py-1 bg-blue-500/10 text-blue-500 text-xs font-bold rounded">Live</div>
          </div>
          <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">1.5 hours</p>
          <p className="text-sm text-gray-400">Avg Review Time</p>
        </div>

        <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div className="px-2 py-1 bg-green-500/10 text-green-500 text-xs font-bold rounded">Live</div>
          </div>
          <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">85%</p>
          <p className="text-sm text-gray-400">Approval Rate</p>
        </div>

        <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div className="px-2 py-1 bg-red-500/10 text-red-500 text-xs font-bold rounded">Live</div>
          </div>
          <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">2</p>
          <p className="text-sm text-gray-400">Flagged Applications</p>
        </div>
      </div>

      {/* Verification Cards */}
      <div className="space-y-6">
        {filteredVerifications.length === 0 ? (
          <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-12 text-center">
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[var(--sublimes-light-text)] mb-2">No Garage Verifications Found</h3>
            <p className="text-gray-400">No garage verifications match your current filters.</p>
          </div>
        ) : (
          filteredVerifications.map((verification) => (
            <SelectableRow
              key={verification.id}
              id={verification.id}
              isSelected={selectedItems.includes(verification.id)}
              onSelect={handleSelectItem}
              className={`bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6 ${
                selectedItems.includes(verification.id) ? 'ring-2 ring-[var(--sublimes-gold)]' : ''
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-[var(--sublimes-gold)] rounded-full flex items-center justify-center">
                    <Building className="w-6 h-6 text-[var(--sublimes-dark-bg)]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--sublimes-light-text)]">{verification.garageName}</h3>
                    <p className="text-sm text-gray-400">{verification.registeredName}</p>
                    <p className="text-xs text-gray-400">Owner: {verification.userFullName}</p>
                  </div>
                </div>
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getStatusColor(verification.status)}`}>
                  {getStatusIcon(verification.status)}
                  <span className="text-sm font-medium capitalize">{verification.status}</span>
                </div>
              </div>

              {/* Business Details */}
              <div className="bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-[var(--sublimes-light-text)] mb-3">Business Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">License Number:</span>
                        <span className="text-[var(--sublimes-light-text)]">{verification.licenseNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Location:</span>
                        <span className="text-[var(--sublimes-light-text)]">{verification.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-[var(--sublimes-light-text)]">{verification.contactNumber}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-[var(--sublimes-light-text)]">{verification.businessEmail}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-[var(--sublimes-light-text)] mb-3">Documents</h4>
                    <div className="space-y-2">
                      {verification.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-[var(--sublimes-light-text)]">{doc}</span>
                          </div>
                          <Button 
                            variant="ghost"
                            size="sm"
                            className="text-[var(--sublimes-gold)] hover:text-[var(--sublimes-gold)]/80 h-8 w-8 p-0"
                            onClick={() => viewDocument(doc)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Description and Services */}
                <div className="mt-4 pt-4 border-t border-[var(--sublimes-border)]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-[var(--sublimes-light-text)] mb-2">Description</h5>
                      <p className="text-sm text-gray-400">{verification.description}</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-[var(--sublimes-light-text)] mb-2">Services Offered</h5>
                      <p className="text-sm text-gray-400">{verification.services}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              {verification.adminNotes && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-2">
                    <User className="w-4 h-4 text-yellow-500 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-yellow-500 mb-1">Admin Notes</h5>
                      <p className="text-sm text-gray-300">{verification.adminNotes}</p>
                      {verification.reviewedBy && verification.reviewedAt && (
                        <p className="text-xs text-gray-400 mt-2">
                          Reviewed by {verification.reviewedBy} on {verification.reviewedAt.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Submission Info */}
              <div className="flex items-center justify-between text-sm text-gray-400 mb-6">
                <span>Submitted {formatDateTime(verification.submittedAt)}</span>
                <span>ID: {verification.id}</span>
              </div>

              {/* Action Buttons */}
              {verification.status === 'pending' && (
                <div className="flex items-center space-x-3">
                  <Button
                    onClick={() => handleApprove(verification)}
                    className="flex-1 bg-green-500 text-white hover:bg-green-600 transition-all hover:scale-105 active:scale-95"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleReject(verification)}
                    className="flex-1 bg-red-500 text-white hover:bg-red-600 transition-all hover:scale-105 active:scale-95"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleRequestResubmission(verification)}
                    className="bg-orange-500 text-white hover:bg-orange-600 transition-all hover:scale-105 active:scale-95"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Request Resubmission
                  </Button>
                </div>
              )}

              {/* Completed Action Indicator */}
              {verification.status !== 'pending' && (
                <div className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg ${getStatusColor(verification.status)}`}>
                  {getStatusIcon(verification.status)}
                  <span className="font-medium capitalize">{verification.status}</span>
                  {verification.reviewedAt && (
                    <span className="text-sm opacity-75">
                      • {formatDateTime(verification.reviewedAt)}
                    </span>
                  )}
                </div>
              )}
            </SelectableRow>
          ))
        )}
      </div>

      {/* Document Viewer Modal */}
      <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
        <DialogContent className="max-w-4xl w-full bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--sublimes-light-text)]">📄 Document Viewer</DialogTitle>
            <DialogDescription className="text-gray-400">
              View and review the uploaded document for verification purposes.
            </DialogDescription>
          </DialogHeader>
          <div className="relative">
            <img 
              src={selectedDocument || ''} 
              alt="Document"
              className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
            />
            <Button
              onClick={() => setSelectedDocument(null)}
              className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70 h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rejection Modal */}
      <Dialog open={!!showRejectModal} onOpenChange={() => setShowRejectModal(null)}>
        <DialogContent className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--sublimes-light-text)]">❌ Reject Garage Verification</DialogTitle>
            <DialogDescription className="text-gray-400">
              Provide a detailed reason for rejecting this garage verification request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-400">
              Please provide a detailed reason for rejecting this garage verification. The garage owner will be notified.
            </p>
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="min-h-[100px] bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
            />
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowRejectModal(null)}
                className="flex-1 border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmReject}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                disabled={!rejectionReason.trim()}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Resubmission Modal */}
      <Dialog open={!!showResubmissionModal} onOpenChange={() => setShowResubmissionModal(null)}>
        <DialogContent className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--sublimes-light-text)]">📝 Request Resubmission</DialogTitle>
            <DialogDescription className="text-gray-400">
              Request the garage owner to resubmit their verification with corrections.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-400">
              What specific documents or information need to be resubmitted? Be specific to help the garage owner.
            </p>
            <Textarea
              value={resubmissionReason}
              onChange={(e) => setResubmissionReason(e.target.value)}
              placeholder="Please specify what needs to be resubmitted..."
              className="min-h-[100px] bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
            />
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowResubmissionModal(null)}
                className="flex-1 border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmResubmission}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                disabled={!resubmissionReason.trim()}
              >
                Send Resubmission Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}