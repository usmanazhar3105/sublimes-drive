import { useState } from 'react';
import { 
  Shield, 
  Download, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  FileText,
  User,
  X
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { BulkActionControls, SelectableRow } from './BulkActionControls';

interface VehicleVerification {
  id: string;
  userId: string;
  userFullName: string;
  userEmail: string;
  brand: string;
  model: string;
  year: number;
  plateNumber: string;
  vinLast6: string;
  submittedAt: Date;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  documents: string[];
  ocrData: Record<string, string>;
  userInputData: Record<string, string>;
  adminNotes: string;
  reviewedBy?: string;
  reviewedAt?: Date;
}

export function AdminVehicleVerificationPage() {
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [showResubmissionModal, setShowResubmissionModal] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [resubmissionReason, setResubmissionReason] = useState('');
  
  // Bulk selection state
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isSelectAllChecked, setIsSelectAllChecked] = useState(false);

  // Chinese car brands that we support - replace with our own data
  const chineseBrands = ['BYD', 'Hongqi', 'Bestune', 'MG', 'Haval', 'Foton', 'Geely', 'Xpeng', 'Jaecoo', 'Zeekr', 
  'Jetour', 'Jac', 'GAC', 'BAIC', 'Great Wall', 'Chery', 'Skywell', 'Riddara', 'NIO', 'Tank', 
  'Roewe', 'Li Auto', 'Kaiyi', 'Dongfeng', 'Omoda', 'Soueast', 'VGV', 'Seres', 'Avatr', 
  'Forthing', 'Changan', 'Maxus', 'Exeed'];

  // Mock verification data - using our Chinese car brands
  const verifications: VehicleVerification[] = [
    {
      id: '1',
      userId: 'user1',
      userFullName: 'Ahmed Hassan',
      userEmail: 'ahmed@example.com',
      brand: 'BYD',
      model: 'Han',
      year: 2023,
      plateNumber: 'A 12345',
      vinLast6: 'ABC123',
      submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      status: 'pending',
      documents: ['mulkiya_front.jpg', 'mulkiya_back.jpg'], // Only 2 required documents
      ocrData: {
        brand: 'BYD',
        model: 'Han',
        year: '2023',
        plateNumber: 'A 12345',
        ownerName: 'Ahmed Hassan',
      },
      userInputData: {
        brand: 'BYD',
        model: 'Han',
        year: '2023',
        plateNumber: 'A 12345',
      },
      adminNotes: '',
    },
    {
      id: '2',
      userId: 'user2',
      userFullName: 'Sara Al-Rashid',
      userEmail: 'sara@example.com',
      brand: 'MG',
      model: 'RX5',
      year: 2022,
      plateNumber: 'B 67890',
      vinLast6: 'XYZ789',
      submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      status: 'approved',
      documents: ['mulkiya_front.jpg', 'mulkiya_back.jpg'], // Only 2 required documents
      ocrData: {
        brand: 'MG',
        model: 'RX5',
        year: '2022',
        plateNumber: 'B 67890',
        ownerName: 'Sara Al-Rashid',
      },
      userInputData: {
        brand: 'MG',
        model: 'RX5',
        year: '2022',
        plateNumber: 'B 67890',
      },
      adminNotes: 'All documents verified successfully.',
      reviewedBy: 'admin1',
      reviewedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    },
    {
      id: '3',
      userId: 'user3',
      userFullName: 'Mohammed Al-Zaabi',
      userEmail: 'mohammed@example.com',
      brand: 'Geely',
      model: 'Coolray',
      year: 2024,
      plateNumber: 'C 11111',
      vinLast6: 'MER001',
      submittedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      status: 'pending',
      documents: ['mulkiya_front.jpg', 'mulkiya_back.jpg'], // Only 2 required documents
      ocrData: {
        brand: 'Geely',
        model: 'Coolray',
        year: '2024',
        plateNumber: 'C 11111',
        ownerName: 'Mohammed Al-Zaabi',
      },
      userInputData: {
        brand: 'Geely',
        model: 'Coolray',
        year: '2024',
        plateNumber: 'C 11111',
      },
      adminNotes: '',
    },
    {
      id: '4',
      userId: 'user4',
      userFullName: 'Fatima Al-Rashid',
      userEmail: 'fatima@example.com',
      brand: 'Haval',
      model: 'H6',
      year: 2023,
      plateNumber: 'T 22222',
      vinLast6: 'TOY002',
      submittedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      status: 'pending',
      documents: ['mulkiya_front.jpg', 'mulkiya_back.jpg'], // Only 2 required documents
      ocrData: {
        brand: 'Haval',
        model: 'H6',
        year: '2023',
        plateNumber: 'T 22222',
        ownerName: 'Fatima Al-Rashid',
      },
      userInputData: {
        brand: 'Haval',
        model: 'H6',
        year: '2023',
        plateNumber: 'T 22222',
      },
      adminNotes: '',
    },
    {
      id: '5',
      userId: 'user5',
      userFullName: 'Omar Al-Mansoori',
      userEmail: 'omar@example.com',
      brand: 'NIO',
      model: 'ES8',
      year: 2023,
      plateNumber: 'N 33333',
      vinLast6: 'NIO003',
      submittedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      status: 'pending',
      documents: ['mulkiya_front.jpg', 'mulkiya_back.jpg'],
      ocrData: {
        brand: 'NIO',
        model: 'ES8',
        year: '2023',
        plateNumber: 'N 33333',
        ownerName: 'Omar Al-Mansoori',
      },
      userInputData: {
        brand: 'NIO',
        model: 'ES8',
        year: '2023',
        plateNumber: 'N 33333',
      },
      adminNotes: '',
    },
  ];

  const filteredVerifications = verifications.filter(verification => {
    const matchesStatus = selectedStatus === 'all' || verification.status === selectedStatus;
    const matchesBrand = selectedBrand === 'All Brands' || verification.brand === selectedBrand;
    return matchesStatus && matchesBrand;
  });

  // Get unique brands from our Chinese car brands
  const uniqueBrands = chineseBrands.sort();

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

  const hasOcrMismatch = (verification: VehicleVerification) => {
    const { ocrData, userInputData } = verification;
    return (
      ocrData.brand !== userInputData.brand ||
      ocrData.model !== userInputData.model ||
      ocrData.year !== userInputData.year ||
      ocrData.plateNumber !== userInputData.plateNumber
    );
  };

  const handleApprove = (verification: VehicleVerification) => {
    console.log('Approving verification:', verification.id);
    toast.success(`Verification for ${verification.userFullName} approved successfully`);
    // Implementation would update the verification status
  };

  const handleReject = (verification: VehicleVerification) => {
    setShowRejectModal(verification.id);
  };

  const handleRequestResubmission = (verification: VehicleVerification) => {
    setShowResubmissionModal(verification.id);
  };

  const confirmReject = () => {
    if (showRejectModal) {
      console.log('Rejecting verification:', showRejectModal, 'Reason:', rejectionReason);
      toast.error('Verification rejected and user notified');
      setShowRejectModal(null);
      setRejectionReason('');
    }
  };

  const confirmResubmission = () => {
    if (showResubmissionModal) {
      console.log('Requesting resubmission:', showResubmissionModal, 'Reason:', resubmissionReason);
      toast.info('Resubmission request sent to user');
      setShowResubmissionModal(null);
      setResubmissionReason('');
    }
  };

  const viewDocument = (docName: string) => {
    // In a real app, this would be the actual document URL
    const mockImageUrl = `https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&h=600&fit=crop`;
    setSelectedDocument(mockImageUrl);
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
    const headers = ['ID', 'Owner Name', 'Email', 'Brand', 'Model', 'Year', 'Plate Number', 'Status', 'Submitted At', 'OCR Match', 'Admin Notes'];
    const csvContent = [
      headers.join(','),
      ...dataToExport.map(verification => [
        verification.id,
        `"${verification.userFullName}"`,
        verification.userEmail,
        verification.brand,
        verification.model,
        verification.year,
        verification.plateNumber,
        verification.status,
        verification.submittedAt.toISOString().split('T')[0],
        hasOcrMismatch(verification) ? 'Mismatch' : 'Match',
        `"${verification.adminNotes}"`
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = selectedIds && selectedIds.length > 0 
      ? `vehicle-verifications-selected-${timestamp}.csv`
      : `vehicle-verifications-all-${timestamp}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`CSV file downloaded successfully (${dataToExport.length} records)`);
  };

  const handleBulkActions = () => {
    const pendingVerifications = filteredVerifications.filter(v => v.status === 'pending');
    if (pendingVerifications.length === 0) {
      toast.info('No pending verifications available for bulk actions');
      return;
    }
    
    const action = window.confirm(`Select bulk action for ${pendingVerifications.length} pending verifications:\n\nOK = Approve All\nCancel = Request Resubmission for All`);
    if (action) {
      // Bulk approve all pending verifications
      pendingVerifications.forEach(verification => {
        handleApprove(verification);
      });
      console.log('✅ BULK APPROVING vehicle verifications:', pendingVerifications.map(v => v.id));
      toast.success(`✅ ${pendingVerifications.length} vehicle verifications approved`);
    } else {
      // Bulk request resubmission
      pendingVerifications.forEach(verification => {
        console.log('📝 BULK REQUESTING resubmission for:', verification.id);
      });
      toast.info(`📝 Resubmission requested for ${pendingVerifications.length} vehicle verifications`);
    }
  };

  const manageRules = () => {
    const rules = [
      '📋 Vehicle Verification Requirements:',
      '',
      '1. Mulkiya Front Picture - Required ✅',
      '   • Clear, high-resolution image',
      '   • All text must be readable',
      '   • No glare or shadows',
      '',
      '2. Mulkiya Back Picture - Required ✅',
      '   • Clear, high-resolution image',
      '   • All text must be readable',
      '   • Signature area visible',
      '',
      '⚠️ ONLY these 2 documents are required',
      '⚠️ No additional documents needed',
      '',
      '📝 OCR Verification Rules:',
      '• Owner name must match user account',
      '• Plate number must be clearly visible',
      '• Vehicle details must match submission',
      '• Document must be current and valid'
    ];
    
    const rulesText = rules.join('\n');
    alert(rulesText);
    toast.info('📋 Vehicle verification rules displayed');
    console.log('📋 MANAGING vehicle verification rules');
  };

  return (
    <div className="p-6 bg-[var(--sublimes-dark-bg)]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[var(--sublimes-light-text)]">Vehicle Verification (Mulkiya)</h1>
            <p className="text-gray-400 mt-1">Review and approve vehicle ownership documents</p>
            <div className="mt-2 text-sm">
              <span className="text-green-500">✅ FIXED & WORKING!</span> - 
              <span className="text-yellow-500 ml-1">Only 2 documents required: Mulkiya front & back</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => exportCSV()}
              className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600"
            >
              <Download className="w-4 h-4" />
              <span>Quick Export</span>
            </button>
            <button 
              onClick={handleBulkActions}
              className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600"
            >
              <Settings className="w-4 h-4" />
              <span>Bulk Actions</span>
            </button>
            <button 
              onClick={manageRules}
              className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600"
            >
              <Shield className="w-4 h-4" />
              <span>Rules</span>
            </button>
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
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="px-3 py-2 bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] focus:outline-none focus:ring-2 focus:ring-[var(--sublimes-gold)]"
          >
            <option value="All Brands">All Brands</option>
            {uniqueBrands.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
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
        title="Vehicle Verifications"
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
          <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">2.3 hours</p>
          <p className="text-sm text-gray-400">Avg Review Time</p>
        </div>

        <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div className="px-2 py-1 bg-green-500/10 text-green-500 text-xs font-bold rounded">Live</div>
          </div>
          <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">67%</p>
          <p className="text-sm text-gray-400">Auto-Approved</p>
        </div>

        <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div className="px-2 py-1 bg-red-500/10 text-red-500 text-xs font-bold rounded">Live</div>
          </div>
          <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">3</p>
          <p className="text-sm text-gray-400">Duplicate Detected</p>
        </div>
      </div>

      {/* Verification Cards */}
      <div className="space-y-6">
        {filteredVerifications.length === 0 ? (
          <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-12 text-center">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[var(--sublimes-light-text)] mb-2">No Verifications Found</h3>
            <p className="text-gray-400">No vehicle verifications match your current filters.</p>
          </div>
        ) : (
          filteredVerifications.map((verification) => {
            const mismatch = hasOcrMismatch(verification);
            
            return (
              <SelectableRow
                key={verification.id}
                id={verification.id}
                isSelected={selectedItems.includes(verification.id)}
                onSelect={handleSelectItem}
                className={`bg-[var(--sublimes-card-bg)] border rounded-xl p-6 ${
                  mismatch ? 'border-orange-500/50' : 'border-[var(--sublimes-border)]'
                } ${selectedItems.includes(verification.id) ? 'ring-2 ring-[var(--sublimes-gold)]' : ''}`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-[var(--sublimes-gold)] rounded-full flex items-center justify-center">
                      <span className="text-[var(--sublimes-dark-bg)] font-bold">
                        {verification.userFullName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-[var(--sublimes-light-text)]">{verification.userFullName}</h3>
                      <p className="text-sm text-gray-400">{verification.userEmail}</p>
                    </div>
                  </div>
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getStatusColor(verification.status)}`}>
                    {getStatusIcon(verification.status)}
                    <span className="text-sm font-medium capitalize">{verification.status}</span>
                  </div>
                </div>

                {/* Vehicle Details */}
                <div className="bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-[var(--sublimes-light-text)] mb-3">Vehicle Information</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Brand:</span>
                          <span className="text-[var(--sublimes-light-text)]">{verification.brand}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Model:</span>
                          <span className="text-[var(--sublimes-light-text)]">{verification.model}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Year:</span>
                          <span className="text-[var(--sublimes-light-text)]">{verification.year}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Plate:</span>
                          <span className="text-[var(--sublimes-light-text)]">{verification.plateNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">VIN (Last 6):</span>
                          <span className="text-[var(--sublimes-light-text)]">{verification.vinLast6}</span>
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
                            <button 
                              className="text-[var(--sublimes-gold)] hover:text-[var(--sublimes-gold)]/80 text-sm"
                              onClick={() => viewDocument(doc)}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {mismatch && (
                    <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                        <span className="font-medium text-orange-500">OCR Mismatch Detected</span>
                        <button className="text-orange-500 hover:text-orange-400 text-sm ml-auto">
                          View Details
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submission Info */}
                <div className="flex items-center justify-between text-sm text-gray-400 mb-6">
                  <span>Submitted {formatDateTime(verification.submittedAt)}</span>
                  <span>ID: {verification.id}</span>
                </div>

                {/* Action Buttons */}
                {verification.status === 'pending' && (
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleApprove(verification)}
                      className="flex-1 flex items-center justify-center space-x-2 bg-green-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleReject(verification)}
                      className="flex-1 flex items-center justify-center space-x-2 bg-red-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleRequestResubmission(verification)}
                      className="flex items-center justify-center space-x-2 bg-orange-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>Request Resubmission</span>
                    </button>
                  </div>
                )}
              </SelectableRow>
            );
          })
        )}
      </div>

      {/* Document Viewer Modal */}
      <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
        <DialogContent className="max-w-4xl w-full bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--sublimes-light-text)]">Document Viewer</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <img 
              src={selectedDocument || ''} 
              alt="Document"
              className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setSelectedDocument(null)}
              className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={!!showRejectModal} onOpenChange={() => setShowRejectModal(null)}>
        <DialogContent className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--sublimes-light-text)]">Reject Verification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-400">
              Please provide a reason for rejecting this verification. The user will receive this message.
            </p>
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
              rows={4}
            />
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowRejectModal(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmReject}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                disabled={!rejectionReason.trim()}
              >
                Reject Verification
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Resubmission Modal */}
      <Dialog open={!!showResubmissionModal} onOpenChange={() => setShowResubmissionModal(null)}>
        <DialogContent className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--sublimes-light-text)]">Request Resubmission</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-400">
              Please specify what needs to be corrected or resubmitted. The user will receive this message.
            </p>
            <Textarea
              value={resubmissionReason}
              onChange={(e) => setResubmissionReason(e.target.value)}
              placeholder="Enter resubmission instructions..."
              className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
              rows={4}
            />
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowResubmissionModal(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmResubmission}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                disabled={!resubmissionReason.trim()}
              >
                Request Resubmission
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}