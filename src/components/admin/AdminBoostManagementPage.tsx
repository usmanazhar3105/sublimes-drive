import { useState, useEffect } from 'react';
import { DateRangeFilter } from './DateRangeFilter';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { 
  Search, 
  Download, 
  Zap,
  TrendingUp,
  Settings,
  Eye,
  Edit,
  MoreVertical,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Star,
  Calendar,
  DollarSign,
  BarChart3,
  Users,
  Building,
  ShoppingCart,
  Target,
  Filter,
  SortDesc,
  PlayCircle,
  PauseCircle,
  StopCircle,
  RotateCcw,
  Trash2,
  ChevronDown
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Button } from '../ui/button';

interface BoostListing {
  id: string;
  listingId: string;
  listingTitle: string;
  listingType: 'marketplace' | 'garage' | 'offer';
  userId: string;
  userName: string;
  userEmail: string;
  userType: 'car_owner' | 'garage_owner' | 'browser';
  boostPackage: string;
  boostDuration: number;
  boostPrice: number;
  boostType: string;
  status: 'pending' | 'active' | 'paused' | 'completed' | 'rejected' | 'expired';
  adminStatus: 'pending_approval' | 'approved' | 'featured' | 'rejected';
  placement: 'home' | 'category' | 'search' | 'all';
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  approvedAt?: Date;
  featuredAt?: Date;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  adminNotes?: string;
  paymentReference: string;
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded';
  refundAmount?: number;
  priority: number;
}

interface BoostStats {
  totalBoosts: number;
  activeBoosts: number;
  pendingApproval: number;
  totalRevenue: number;
  averageBoostDuration: number;
  conversionRate: number;
  topPerformingType: string;
}

export function AdminBoostManagementPage() {
  const [activeTab, setActiveTab] = useState('approval-queue');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBoost, setEditingBoost] = useState<BoostListing | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [autoApproveBoosts, setAutoApproveBoosts] = useState(false);
  const [storedOfferBoosts, setStoredOfferBoosts] = useState<BoostListing[]>([]);
  
  // Boost Management Settings
  const [boostSettings, setBoostSettings] = useState({
    autoApprove: false,
    autoApproveAfterDays: 3,
    requirePaymentFirst: true,
    enableBoostNotifications: true,
    maxBoostDuration: 30,
    minBoostDuration: 1,
    allowSelfBoost: true,
    enablePriorityBoosts: true
  });

  // Load stored offer boosts from localStorage
  useEffect(() => {
    const loadStoredBoosts = () => {
      try {
        const stored = JSON.parse(localStorage.getItem('adminOfferBoosts') || '[]');
        setStoredOfferBoosts(stored);
      } catch (error) {
        console.error('Error loading stored boosts:', error);
        setStoredOfferBoosts([]);
      }
    };

    loadStoredBoosts();

    // Listen for storage changes to refresh data when new boosts are added
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'adminOfferBoosts') {
        loadStoredBoosts();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check for changes periodically (for same-tab updates)
    const interval = setInterval(loadStoredBoosts, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Mock boost listings data
  const [boostListings, setBoostListings] = useState<BoostListing[]>([
    {
      id: '1',
      listingId: 'listing-1',
      listingTitle: 'NIO ES8 2023 - Premium Electric SUV',
      listingType: 'marketplace',
      userId: 'user_1',
      userName: 'Ahmed Hassan',
      userEmail: 'ahmed@example.com',
      userType: 'car_owner',
      boostPackage: 'Category Top',
      boostDuration: 14,
      boostPrice: 149,
      boostType: 'Category Top',
      status: 'active',
      adminStatus: 'featured',
      placement: 'category',
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      approvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      featuredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      impressions: 12500,
      clicks: 340,
      conversions: 23,
      paymentReference: 'PAY_001',
      paymentStatus: 'paid',
      priority: 1
    },
    {
      id: '2',
      listingId: 'garage-1',
      listingTitle: 'Elite Auto Service - Premium Car Care',
      listingType: 'garage',
      userId: 'garage_1',
      userName: 'Elite Auto Service',
      userEmail: 'elite@example.com',
      userType: 'garage_owner',
      boostPackage: 'City Top',
      boostDuration: 14,
      boostPrice: 249,
      boostType: 'City Top',
      status: 'pending',
      adminStatus: 'pending_approval',
      placement: 'category',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      paymentReference: 'PAY_002',
      paymentStatus: 'paid',
      priority: 0
    },
    {
      id: '3',
      listingId: 'listing-3',
      listingTitle: 'BMW M4 Competition 2022',
      listingType: 'marketplace',
      userId: 'user_2',
      userName: 'Mohammed Ali',
      userEmail: 'mohammed@example.com',
      userType: 'car_owner',
      boostPackage: 'Market Top',
      boostDuration: 7,
      boostPrice: 99,
      boostType: 'Market Top',
      status: 'expired',
      adminStatus: 'approved',
      placement: 'home',
      startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      approvedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      featuredAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      impressions: 8900,
      clicks: 234,
      conversions: 15,
      paymentReference: 'PAY_003',
      paymentStatus: 'paid',
      priority: 0
    },
    {
      id: '4',
      listingId: 'offer-1',
      listingTitle: 'Special Discount on Car Maintenance',
      listingType: 'offer',
      userId: 'admin',
      userName: 'Admin',
      userEmail: 'admin@sublimes.ae',
      userType: 'car_owner',
      boostPackage: 'Featured Deal',
      boostDuration: 7,
      boostPrice: 0,
      boostType: 'Featured Deal',
      status: 'active',
      adminStatus: 'featured',
      placement: 'all',
      startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      approvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      featuredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      impressions: 5600,
      clicks: 189,
      conversions: 34,
      paymentReference: 'ADMIN_BOOST',
      paymentStatus: 'paid',
      priority: 3
    }
  ]);

  // Calculate statistics
  const stats: BoostStats = {
    totalBoosts: boostListings.length,
    activeBoosts: boostListings.filter(b => b.status === 'active').length,
    pendingApproval: boostListings.filter(b => b.adminStatus === 'pending_approval').length,
    totalRevenue: boostListings.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.boostPrice, 0),
    averageBoostDuration: boostListings.reduce((sum, b) => sum + b.boostDuration, 0) / boostListings.length,
    conversionRate: 0, // Calculate based on impressions/clicks
    topPerformingType: 'Category Top'
  };

  const filteredBoosts = boostListings.filter(boost => {
    const matchesSearch = boost.listingTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         boost.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         boost.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         boost.boostType.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || boost.adminStatus === statusFilter;
    const matchesType = typeFilter === 'all' || boost.listingType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleSelectAll = () => {
    if (selectedItems.length === filteredBoosts.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredBoosts.map(boost => boost.id));
    }
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleExportData = (selectedIds: string[], dateRange: { from: string; to: string }) => {
    const boostsToExport = selectedIds.length > 0 
      ? filteredBoosts.filter(boost => selectedIds.includes(boost.id))
      : filteredBoosts;
    
    // Apply date filter if provided
    let filteredBoosts_export = boostsToExport;
    if (dateRange?.from || dateRange?.to) {
      filteredBoosts_export = boostsToExport.filter(boost => {
        const boostDate = new Date(boost.createdAt);
        const fromDate = dateRange.from ? new Date(dateRange.from) : null;
        const toDate = dateRange.to ? new Date(dateRange.to) : null;
        
        if (fromDate && boostDate < fromDate) return false;
        if (toDate && boostDate > toDate) return false;
        return true;
      });
    }

    // Create CSV content
    const headers = ['ID', 'Listing Title', 'Listing Type', 'User Name', 'User Email', 'Boost Type', 'Duration', 'Price', 'Status', 'Admin Status', 'Start Date', 'End Date', 'Impressions', 'Clicks', 'Conversions', 'Payment Status', 'Created At'];
    const csvContent = [
      headers.join(','),
      ...filteredBoosts_export.map(boost => [
        boost.id,
        `"${boost.listingTitle}"`,
        boost.listingType,
        `"${boost.userName}"`,
        boost.userEmail,
        boost.boostType,
        boost.boostDuration,
        boost.boostPrice,
        boost.status,
        boost.adminStatus,
        boost.startDate?.toISOString().split('T')[0] || '',
        boost.endDate?.toISOString().split('T')[0] || '',
        boost.impressions || 0,
        boost.clicks || 0,
        boost.conversions || 0,
        boost.paymentStatus,
        boost.createdAt.toISOString().split('T')[0]
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `boost_listings_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    toast.success(`✅ Exported ${filteredBoosts_export.length} boost listings to CSV!`);
  };

  const handleApproveBoost = (boostId: string) => {
    // Check if it's a stored offer boost
    const isStoredOfferBoost = storedOfferBoosts.some(boost => boost.id === boostId);
    
    if (isStoredOfferBoost) {
      const updatedStoredBoosts = storedOfferBoosts.map(boost => 
        boost.id === boostId 
          ? { 
              ...boost, 
              adminStatus: 'approved' as const, 
              status: 'active' as const,
              approvedAt: new Date(),
              startDate: new Date(),
              endDate: new Date(Date.now() + boost.boostDuration * 24 * 60 * 60 * 1000)
            }
          : boost
      );
      localStorage.setItem('adminOfferBoosts', JSON.stringify(updatedStoredBoosts));
      setStoredOfferBoosts(updatedStoredBoosts);
    } else {
      setBoostListings(prev => prev.map(boost => 
        boost.id === boostId 
          ? { 
              ...boost, 
              adminStatus: 'approved' as const, 
              status: 'active' as const,
              approvedAt: new Date(),
              startDate: new Date(),
              endDate: new Date(Date.now() + boost.boostDuration * 24 * 60 * 60 * 1000)
            }
          : boost
      ));
    }
    toast.success('✅ Boost approved successfully!');
  };

  const handleRejectBoost = (boostId: string) => {
    // Check if it's a stored offer boost
    const isStoredOfferBoost = storedOfferBoosts.some(boost => boost.id === boostId);
    
    if (isStoredOfferBoost) {
      const updatedStoredBoosts = storedOfferBoosts.map(boost => 
        boost.id === boostId 
          ? { ...boost, adminStatus: 'rejected' as const, status: 'rejected' as const }
          : boost
      );
      localStorage.setItem('adminOfferBoosts', JSON.stringify(updatedStoredBoosts));
      setStoredOfferBoosts(updatedStoredBoosts);
    } else {
      setBoostListings(prev => prev.map(boost => 
        boost.id === boostId 
          ? { ...boost, adminStatus: 'rejected' as const, status: 'rejected' as const }
          : boost
      ));
    }
    toast.success('✅ Boost rejected successfully!');
  };

  const handleFeatureBoost = (boostId: string) => {
    // Check if it's a stored offer boost
    const isStoredOfferBoost = storedOfferBoosts.some(boost => boost.id === boostId);
    
    if (isStoredOfferBoost) {
      const updatedStoredBoosts = storedOfferBoosts.map(boost => 
        boost.id === boostId 
          ? { 
              ...boost, 
              adminStatus: 'featured' as const, 
              status: 'active' as const,
              featuredAt: new Date() 
            }
          : boost
      );
      localStorage.setItem('adminOfferBoosts', JSON.stringify(updatedStoredBoosts));
      setStoredOfferBoosts(updatedStoredBoosts);
    } else {
      setBoostListings(prev => prev.map(boost => 
        boost.id === boostId 
          ? { 
              ...boost, 
              adminStatus: 'featured' as const, 
              status: 'active' as const,
              featuredAt: new Date() 
            }
          : boost
      ));
    }
    toast.success('✅ Boost marked as featured!');
  };

  const handlePauseBoost = (boostId: string) => {
    // Check if it's a stored offer boost
    const isStoredOfferBoost = storedOfferBoosts.some(boost => boost.id === boostId);
    
    if (isStoredOfferBoost) {
      const updatedStoredBoosts = storedOfferBoosts.map(boost => 
        boost.id === boostId 
          ? { ...boost, status: 'paused' as const }
          : boost
      );
      localStorage.setItem('adminOfferBoosts', JSON.stringify(updatedStoredBoosts));
      setStoredOfferBoosts(updatedStoredBoosts);
    } else {
      setBoostListings(prev => prev.map(boost => 
        boost.id === boostId 
          ? { ...boost, status: 'paused' as const }
          : boost
      ));
    }
    toast.success('✅ Boost paused successfully!');
  };

  const handleResumeBoost = (boostId: string) => {
    // Check if it's a stored offer boost
    const isStoredOfferBoost = storedOfferBoosts.some(boost => boost.id === boostId);
    
    if (isStoredOfferBoost) {
      const updatedStoredBoosts = storedOfferBoosts.map(boost => 
        boost.id === boostId 
          ? { ...boost, status: 'active' as const }
          : boost
      );
      localStorage.setItem('adminOfferBoosts', JSON.stringify(updatedStoredBoosts));
      setStoredOfferBoosts(updatedStoredBoosts);
    } else {
      setBoostListings(prev => prev.map(boost => 
        boost.id === boostId 
          ? { ...boost, status: 'active' as const }
          : boost
      ));
    }
    toast.success('✅ Boost resumed successfully!');
  };

  const handleBulkApprove = () => {
    const selectedBoosts = boostListings.filter(b => selectedItems.includes(b.id) && b.adminStatus === 'pending_approval');
    setBoostListings(prev => prev.map(boost => 
      selectedItems.includes(boost.id) && boost.adminStatus === 'pending_approval'
        ? { 
            ...boost, 
            adminStatus: 'approved' as const, 
            status: 'active' as const,
            approvedAt: new Date(),
            startDate: new Date(),
            endDate: new Date(Date.now() + boost.boostDuration * 24 * 60 * 60 * 1000)
          }
        : boost
    ));
    setSelectedItems([]);
    toast.success(`✅ Approved ${selectedBoosts.length} boosts!`);
  };

  const handleBulkReject = () => {
    const selectedBoosts = boostListings.filter(b => selectedItems.includes(b.id) && b.adminStatus === 'pending_approval');
    setBoostListings(prev => prev.map(boost => 
      selectedItems.includes(boost.id) && boost.adminStatus === 'pending_approval'
        ? { ...boost, adminStatus: 'rejected' as const, status: 'rejected' as const }
        : boost
    ));
    setSelectedItems([]);
    toast.success(`✅ Rejected ${selectedBoosts.length} boosts!`);
  };

  const handleBulkFeature = () => {
    const selectedBoosts = boostListings.filter(b => selectedItems.includes(b.id) && b.adminStatus === 'approved');
    setBoostListings(prev => prev.map(boost => 
      selectedItems.includes(boost.id) && boost.adminStatus === 'approved'
        ? { 
            ...boost, 
            adminStatus: 'featured' as const, 
            status: 'active' as const,
            featuredAt: new Date() 
          }
        : boost
    ));
    setSelectedItems([]);
    toast.success(`✅ Featured ${selectedBoosts.length} boosts!`);
  };

  const handleDeleteBoost = (boostId: string) => {
    if (confirm('Are you sure you want to delete this boost? This action cannot be undone.')) {
      // Check if it's a stored offer boost (from localStorage)
      const isStoredOfferBoost = storedOfferBoosts.some(boost => boost.id === boostId);
      
      if (isStoredOfferBoost) {
        // Remove from stored offer boosts in localStorage
        const updatedStoredBoosts = storedOfferBoosts.filter(boost => boost.id !== boostId);
        localStorage.setItem('adminOfferBoosts', JSON.stringify(updatedStoredBoosts));
        setStoredOfferBoosts(updatedStoredBoosts);
      } else {
        // Remove from main boost listings
        setBoostListings(prev => prev.filter(boost => boost.id !== boostId));
      }
      
      toast.success('✅ Boost deleted successfully!');
    }
  };

  const handleViewBoost = (boostId: string) => {
    const boost = boostListings.find(b => b.id === boostId);
    if (boost) {
      // Here you would typically open a detailed view modal
      // For now, we'll just show a toast with basic info
      toast.success(`Viewing boost: ${boost.listingTitle}`);
    }
  };

  const renderApprovalQueueTab = () => (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[var(--sublimes-card-bg)] rounded-lg border border-[var(--sublimes-border)] p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-400">Pending Approval</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.pendingApproval}</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--sublimes-card-bg)] rounded-lg border border-[var(--sublimes-border)] p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-400">Active Boosts</p>
              <p className="text-2xl font-bold text-green-400">{stats.activeBoosts}</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--sublimes-card-bg)] rounded-lg border border-[var(--sublimes-border)] p-6">
          <div className="flex items-center">
            <div className="p-2 bg-[var(--sublimes-gold)]/20 rounded-lg">
              <DollarSign className="w-6 h-6 text-[var(--sublimes-gold)]" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-[var(--sublimes-gold)]">AED {stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--sublimes-card-bg)] rounded-lg border border-[var(--sublimes-border)] p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-400">Total Boosts</p>
              <p className="text-2xl font-bold text-blue-400">{stats.totalBoosts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by listing title, user name, or boost type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] focus:outline-none focus:ring-2 focus:ring-[var(--sublimes-gold)]"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] focus:outline-none focus:ring-2 focus:ring-[var(--sublimes-gold)]"
        >
          <option value="all">All Statuses</option>
          <option value="pending_approval">Pending Approval</option>
          <option value="approved">Approved</option>
          <option value="featured">Featured</option>
          <option value="rejected">Rejected</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] focus:outline-none focus:ring-2 focus:ring-[var(--sublimes-gold)]"
        >
          <option value="all">All Types</option>
          <option value="marketplace">Marketplace</option>
          <option value="garage">Garage</option>
          <option value="offer">Offers</option>
        </select>
        
        <DateRangeFilter onExport={handleExportData} selectedItems={selectedItems} />
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="p-4 bg-[var(--sublimes-gold)]/10 border border-[var(--sublimes-gold)]/20 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--sublimes-light-text)]">
              {selectedItems.length} boost(s) selected
            </span>
            <div className="flex space-x-2">
              <button 
                onClick={handleBulkApprove}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                Bulk Approve
              </button>
              <button 
                onClick={handleBulkReject}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Bulk Reject
              </button>
              <button 
                onClick={handleBulkFeature}
                className="px-3 py-1 bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] rounded text-sm hover:bg-[var(--sublimes-gold)]/90"
              >
                Bulk Feature
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-[var(--sublimes-card-bg)] rounded-lg border border-[var(--sublimes-border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--sublimes-border)] bg-[var(--sublimes-dark-bg)]">
                <th className="text-left p-4">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === filteredBoosts.length && filteredBoosts.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-[var(--sublimes-border)] bg-[var(--sublimes-dark-bg)] text-[var(--sublimes-gold)]"
                  />
                </th>
                <th className="text-left p-4 text-[var(--sublimes-light-text)]">Listing & User</th>
                <th className="text-left p-4 text-[var(--sublimes-light-text)]">Boost Details</th>
                <th className="text-left p-4 text-[var(--sublimes-light-text)]">Status</th>
                <th className="text-left p-4 text-[var(--sublimes-light-text)]">Performance</th>
                <th className="text-left p-4 text-[var(--sublimes-light-text)]">Payment</th>
                <th className="text-left p-4 text-[var(--sublimes-light-text)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBoosts.map((boost) => (
                <tr key={boost.id} className="border-b border-[var(--sublimes-border)] hover:bg-[var(--sublimes-dark-bg)]/30">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(boost.id)}
                      onChange={() => handleSelectItem(boost.id)}
                      className="rounded border-[var(--sublimes-border)] bg-[var(--sublimes-dark-bg)] text-[var(--sublimes-gold)]"
                    />
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-[var(--sublimes-light-text)]">{boost.listingTitle}</p>
                      <p className="text-sm text-gray-400">{boost.userName}</p>
                      <p className="text-xs text-gray-500">{boost.userEmail}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                          boost.listingType === 'marketplace' ? 'bg-blue-500/20 text-blue-400' :
                          boost.listingType === 'garage' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-purple-500/20 text-purple-400'
                        }`}>
                          {boost.listingType === 'marketplace' ? <ShoppingCart className="w-3 h-3 mr-1" /> :
                           boost.listingType === 'garage' ? <Building className="w-3 h-3 mr-1" /> :
                           <Target className="w-3 h-3 mr-1" />}
                          {boost.listingType}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-[var(--sublimes-light-text)]">{boost.boostType}</p>
                      <p className="text-sm text-gray-400">{boost.boostDuration} days</p>
                      <p className="text-sm text-[var(--sublimes-gold)]">AED {boost.boostPrice}</p>
                      <p className="text-xs text-gray-500">Placement: {boost.placement}</p>
                      {boost.priority > 0 && (
                        <p className="text-xs text-[var(--sublimes-gold)]">Priority: {boost.priority}</p>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        boost.adminStatus === 'pending_approval' ? 'bg-yellow-500/20 text-yellow-400' :
                        boost.adminStatus === 'approved' ? 'bg-blue-500/20 text-blue-400' :
                        boost.adminStatus === 'featured' ? 'bg-green-500/20 text-green-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {boost.adminStatus.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className={`block px-2 py-1 rounded-full text-xs ${
                        boost.status === 'active' ? 'bg-green-500/20 text-green-400' :
                        boost.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        boost.status === 'paused' ? 'bg-orange-500/20 text-orange-400' :
                        boost.status === 'expired' ? 'bg-gray-500/20 text-gray-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {boost.status.toUpperCase()}
                      </span>
                      {boost.startDate && boost.endDate && (
                        <div className="text-xs text-gray-500">
                          <p>Start: {boost.startDate.toLocaleDateString()}</p>
                          <p>End: {boost.endDate.toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    {boost.impressions !== undefined ? (
                      <div className="text-sm">
                        <p className="text-[var(--sublimes-light-text)]">
                          <span className="font-medium">{boost.impressions?.toLocaleString()}</span> impressions
                        </p>
                        <p className="text-gray-400">
                          <span className="font-medium">{boost.clicks}</span> clicks
                        </p>
                        <p className="text-green-400">
                          <span className="font-medium">{boost.conversions}</span> conversions
                        </p>
                        {boost.impressions && boost.clicks && (
                          <p className="text-xs text-gray-500">
                            CTR: {((boost.clicks / boost.impressions) * 100).toFixed(2)}%
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">No data yet</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      <p className="font-medium text-[var(--sublimes-light-text)]">AED {boost.boostPrice}</p>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        boost.paymentStatus === 'paid' ? 'bg-green-500/20 text-green-400' :
                        boost.paymentStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        boost.paymentStatus === 'failed' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {boost.paymentStatus.toUpperCase()}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">Ref: {boost.paymentReference}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      {boost.adminStatus === 'pending_approval' && (
                        <>
                          <button
                            onClick={() => handleApproveBoost(boost.id)}
                            className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRejectBoost(boost.id)}
                            className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <AlertCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {boost.adminStatus === 'approved' && (
                        <button
                          onClick={() => handleFeatureBoost(boost.id)}
                          className="p-2 text-[var(--sublimes-gold)] hover:bg-[var(--sublimes-gold)]/10 rounded-lg transition-colors"
                          title="Mark as Featured"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      )}
                      {boost.status === 'active' && (
                        <button
                          onClick={() => handlePauseBoost(boost.id)}
                          className="p-2 text-orange-400 hover:bg-orange-400/10 rounded-lg transition-colors"
                          title="Pause"
                        >
                          <PauseCircle className="w-4 h-4" />
                        </button>
                      )}
                      {boost.status === 'paused' && (
                        <button
                          onClick={() => handleResumeBoost(boost.id)}
                          className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg transition-colors"
                          title="Resume"
                        >
                          <PlayCircle className="w-4 h-4" />
                        </button>
                      )}
                      
                      {/* Actions Dropdown Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
                          <DropdownMenuItem 
                            onClick={() => handleViewBoost(boost.id)}
                            className="flex items-center text-blue-400 hover:bg-blue-400/10"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              setEditingBoost(boost);
                              setShowEditModal(true);
                            }}
                            className="flex items-center text-[var(--sublimes-gold)] hover:bg-[var(--sublimes-gold)]/10"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Boost
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteBoost(boost.id)}
                            className="flex items-center text-red-400 hover:bg-red-400/10"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Boost
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredBoosts.length === 0 && (
            <div className="text-center py-8">
              <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No boost listings found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderActiveBoostsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Boost Cards */}
        {boostListings
          .filter(boost => boost.status === 'active' && boost.adminStatus === 'featured')
          .sort((a, b) => b.priority - a.priority)
          .map((boost) => (
            <div key={boost.id} className="bg-[var(--sublimes-card-bg)] rounded-lg border border-[var(--sublimes-border)] p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-[var(--sublimes-light-text)] mb-2">{boost.listingTitle}</h3>
                  <p className="text-sm text-gray-400 mb-2">{boost.userName}</p>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                      boost.listingType === 'marketplace' ? 'bg-blue-500/20 text-blue-400' :
                      boost.listingType === 'garage' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-purple-500/20 text-purple-400'
                    }`}>
                      {boost.listingType}
                    </span>
                    {boost.priority > 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-[var(--sublimes-gold)]/20 text-[var(--sublimes-gold)]">
                        Priority #{boost.priority}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handlePauseBoost(boost.id)}
                    className="p-2 text-orange-400 hover:bg-orange-400/10 rounded-lg transition-colors"
                    title="Pause"
                  >
                    <PauseCircle className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400">Boost Type</p>
                  <p className="font-medium text-[var(--sublimes-light-text)]">{boost.boostType}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Duration</p>
                    <p className="font-medium text-[var(--sublimes-light-text)]">{boost.boostDuration} days</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Price</p>
                    <p className="font-medium text-[var(--sublimes-gold)]">AED {boost.boostPrice}</p>
                  </div>
                </div>

                {boost.endDate && (
                  <div>
                    <p className="text-sm text-gray-400">Expires</p>
                    <p className="font-medium text-[var(--sublimes-light-text)]">{boost.endDate.toLocaleDateString()}</p>
                  </div>
                )}

                {boost.impressions !== undefined && (
                  <div className="pt-3 border-t border-[var(--sublimes-border)]">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-lg font-bold text-blue-400">{boost.impressions?.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">Impressions</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-green-400">{boost.clicks}</p>
                        <p className="text-xs text-gray-400">Clicks</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-purple-400">{boost.conversions}</p>
                        <p className="text-xs text-gray-400">Conversions</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  const renderOffersTab = () => {
    // Combine static offer boosts with dynamically loaded ones
    const offerBoosts = [...boostListings.filter(boost => boost.listingType === 'offer'), ...storedOfferBoosts];
    
    return (
      <div className="space-y-6">
        {/* Statistics Cards for Offers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[var(--sublimes-card-bg)] rounded-lg border border-[var(--sublimes-border)] p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Target className="w-6 h-6 text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Total Offer Boosts</p>
                <p className="text-2xl font-bold text-purple-400">{offerBoosts.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-[var(--sublimes-card-bg)] rounded-lg border border-[var(--sublimes-border)] p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Active Offers</p>
                <p className="text-2xl font-bold text-green-400">
                  {offerBoosts.filter(b => b.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[var(--sublimes-card-bg)] rounded-lg border border-[var(--sublimes-border)] p-6">
            <div className="flex items-center">
              <div className="p-2 bg-[var(--sublimes-gold)]/20 rounded-lg">
                <Star className="w-6 h-6 text-[var(--sublimes-gold)]" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Featured Offers</p>
                <p className="text-2xl font-bold text-[var(--sublimes-gold)]">
                  {offerBoosts.filter(b => b.adminStatus === 'featured').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[var(--sublimes-card-bg)] rounded-lg border border-[var(--sublimes-border)] p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Total Conversions</p>
                <p className="text-2xl font-bold text-blue-400">
                  {offerBoosts.reduce((sum, b) => sum + (b.conversions || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Offers Table */}
        <div className="bg-[var(--sublimes-card-bg)] rounded-lg border border-[var(--sublimes-border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--sublimes-border)] bg-[var(--sublimes-dark-bg)]">
                  <th className="text-left p-4 text-[var(--sublimes-light-text)]">Offer Details</th>
                  <th className="text-left p-4 text-[var(--sublimes-light-text)]">Boost Info</th>
                  <th className="text-left p-4 text-[var(--sublimes-light-text)]">Status</th>
                  <th className="text-left p-4 text-[var(--sublimes-light-text)]">Performance</th>
                  <th className="text-left p-4 text-[var(--sublimes-light-text)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {offerBoosts.map((boost) => (
                  <tr key={boost.id} className="border-b border-[var(--sublimes-border)] hover:bg-[var(--sublimes-dark-bg)]/30">
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-[var(--sublimes-light-text)]">{boost.listingTitle}</p>
                        <p className="text-sm text-gray-400">{boost.userName}</p>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-400 mt-1">
                          <Target className="w-3 h-3 mr-1" />
                          Offer
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-[var(--sublimes-light-text)]">{boost.boostType}</p>
                        <p className="text-sm text-gray-400">{boost.boostDuration} days</p>
                        <p className="text-sm text-[var(--sublimes-gold)]">
                          {boost.boostPrice === 0 ? 'Free (Admin)' : `AED ${boost.boostPrice}`}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          boost.adminStatus === 'pending_approval' ? 'bg-yellow-500/20 text-yellow-400' :
                          boost.adminStatus === 'approved' ? 'bg-blue-500/20 text-blue-400' :
                          boost.adminStatus === 'featured' ? 'bg-green-500/20 text-green-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {boost.adminStatus.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`block px-2 py-1 rounded-full text-xs ${
                          boost.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          boost.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          boost.status === 'paused' ? 'bg-orange-500/20 text-orange-400' :
                          boost.status === 'expired' ? 'bg-gray-500/20 text-gray-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {boost.status.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      {boost.impressions !== undefined ? (
                        <div className="text-sm">
                          <p className="text-[var(--sublimes-light-text)]">
                            <span className="font-medium">{boost.impressions?.toLocaleString()}</span> impressions
                          </p>
                          <p className="text-gray-400">
                            <span className="font-medium">{boost.clicks}</span> clicks
                          </p>
                          <p className="text-green-400">
                            <span className="font-medium">{boost.conversions}</span> conversions
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">No data yet</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        {boost.adminStatus === 'pending_approval' && (
                          <>
                            <button
                              onClick={() => handleApproveBoost(boost.id)}
                              className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRejectBoost(boost.id)}
                              className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <AlertCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {boost.adminStatus === 'approved' && (
                          <button
                            onClick={() => handleFeatureBoost(boost.id)}
                            className="p-2 text-[var(--sublimes-gold)] hover:bg-[var(--sublimes-gold)]/10 rounded-lg transition-colors"
                            title="Mark as Featured"
                          >
                            <Star className="w-4 h-4" />
                          </button>
                        )}
                        
                        {/* Actions Dropdown Menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
                            <DropdownMenuItem 
                              onClick={() => handleViewBoost(boost.id)}
                              className="flex items-center text-blue-400 hover:bg-blue-400/10"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                setEditingBoost(boost);
                                setShowEditModal(true);
                              }}
                              className="flex items-center text-[var(--sublimes-gold)] hover:bg-[var(--sublimes-gold)]/10"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Boost
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteBoost(boost.id)}
                              className="flex items-center text-red-400 hover:bg-red-400/10"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Boost
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {offerBoosts.length === 0 && (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No offer boosts found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[var(--sublimes-card-bg)] rounded-lg border border-[var(--sublimes-border)] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Avg. Boost Duration</p>
              <p className="text-2xl font-bold text-blue-400">{stats.averageBoostDuration.toFixed(1)} days</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-[var(--sublimes-card-bg)] rounded-lg border border-[var(--sublimes-border)] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Conversion Rate</p>
              <p className="text-2xl font-bold text-green-400">3.4%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-[var(--sublimes-card-bg)] rounded-lg border border-[var(--sublimes-border)] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Top Performing</p>
              <p className="text-lg font-bold text-[var(--sublimes-gold)]">{stats.topPerformingType}</p>
            </div>
            <Star className="w-8 h-8 text-[var(--sublimes-gold)]" />
          </div>
        </div>

        <div className="bg-[var(--sublimes-card-bg)] rounded-lg border border-[var(--sublimes-border)] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Revenue Per Boost</p>
              <p className="text-xl font-bold text-purple-400">AED {(stats.totalRevenue / stats.totalBoosts).toFixed(0)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--sublimes-card-bg)] rounded-lg border border-[var(--sublimes-border)] p-6">
          <h4 className="text-lg font-semibold text-[var(--sublimes-light-text)] mb-4">Boost Performance Trends</h4>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-2" />
              <p>Performance chart would go here</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--sublimes-card-bg)] rounded-lg border border-[var(--sublimes-border)] p-6">
          <h4 className="text-lg font-semibold text-[var(--sublimes-light-text)] mb-4">Revenue Breakdown</h4>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <DollarSign className="w-12 h-12 mx-auto mb-2" />
              <p>Revenue chart would go here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Edit Boost Modal
  const EditBoostModal = () => {
    const [priority, setPriority] = useState(editingBoost?.priority || 0);
    const [adminNotes, setAdminNotes] = useState(editingBoost?.adminNotes || '');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingBoost) {
        // Check if it's a stored offer boost
        const isStoredOfferBoost = storedOfferBoosts.some(boost => boost.id === editingBoost.id);
        
        if (isStoredOfferBoost) {
          const updatedStoredBoosts = storedOfferBoosts.map(boost => 
            boost.id === editingBoost.id 
              ? { ...boost, priority, adminNotes }
              : boost
          );
          localStorage.setItem('adminOfferBoosts', JSON.stringify(updatedStoredBoosts));
          setStoredOfferBoosts(updatedStoredBoosts);
        } else {
          setBoostListings(prev => prev.map(boost => 
            boost.id === editingBoost.id 
              ? { ...boost, priority, adminNotes }
              : boost
          ));
        }
        
        setShowEditModal(false);
        setEditingBoost(null);
        toast.success('✅ Boost updated successfully!');
      }
    };

    return (
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[var(--sublimes-light-text)]">Edit Boost</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update boost settings for {editingBoost?.listingTitle}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">Priority (0 = lowest)</label>
              <input
                type="number"
                min="0"
                max="10"
                value={priority}
                onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] focus:outline-none focus:ring-2 focus:ring-[var(--sublimes-gold)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">Admin Notes</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] focus:outline-none focus:ring-2 focus:ring-[var(--sublimes-gold)]"
                placeholder="Add any notes about this boost..."
              />
            </div>
            <DialogFooter className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] rounded-lg hover:bg-[var(--sublimes-gold)]/90"
              >
                Update Boost
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--sublimes-light-text)]">Boost Management</h1>
          <p className="text-gray-400">Manage marketplace, garage, and offer boost listings</p>
        </div>
        <button
          onClick={() => setShowSettingsModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] hover:bg-[var(--sublimes-dark-bg)] transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-[var(--sublimes-border)]">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'approval-queue', label: 'Approval Queue', icon: Clock },
            { id: 'active-boosts', label: 'Active Boosts', icon: Zap },
            { id: 'offers', label: 'Boost Offers', icon: Target },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-[var(--sublimes-gold)] text-[var(--sublimes-gold)]'
                  : 'border-transparent text-gray-400 hover:text-[var(--sublimes-light-text)] hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'approval-queue' && renderApprovalQueueTab()}
      {activeTab === 'active-boosts' && renderActiveBoostsTab()}
      {activeTab === 'offers' && renderOffersTab()}
      {activeTab === 'analytics' && renderAnalyticsTab()}

      {/* Modals */}
      <EditBoostModal />

      {/* Settings Modal */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)] max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[var(--sublimes-light-text)]">Boost Management Settings</DialogTitle>
            <DialogDescription className="text-gray-400">
              Configure automatic approval and boost management settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Auto Approval Settings */}
            <div>
              <h4 className="text-lg font-semibold text-[var(--sublimes-light-text)] mb-4">Auto Approval Settings</h4>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-[var(--sublimes-dark-bg)] rounded-lg border border-[var(--sublimes-border)]">
                  <div>
                    <span className="text-[var(--sublimes-light-text)] font-medium">Auto Approve All Boosts</span>
                    <p className="text-sm text-gray-400">Automatically approve all new boost requests without manual review</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoApproveBoosts}
                    onChange={(e) => {
                      setAutoApproveBoosts(e.target.checked);
                      toast.success(e.target.checked ? '✅ Auto approval enabled for all boosts!' : '⚠️ Auto approval disabled for all boosts!');
                    }}
                    className="rounded border-[var(--sublimes-border)] bg-[var(--sublimes-dark-bg)] text-[var(--sublimes-gold)] w-5 h-5"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-[var(--sublimes-dark-bg)] rounded-lg border border-[var(--sublimes-border)]">
                  <div>
                    <span className="text-[var(--sublimes-light-text)] font-medium">Auto Approve Marketplace Boosts</span>
                    <p className="text-sm text-gray-400">Automatically approve marketplace listing boosts</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={boostSettings.autoApprove}
                    onChange={(e) => setBoostSettings({...boostSettings, autoApprove: e.target.checked})}
                    className="rounded border-[var(--sublimes-border)] bg-[var(--sublimes-dark-bg)] text-[var(--sublimes-gold)] w-5 h-5"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-[var(--sublimes-dark-bg)] rounded-lg border border-[var(--sublimes-border)]">
                  <div>
                    <span className="text-[var(--sublimes-light-text)] font-medium">Auto Approve Garage Boosts</span>
                    <p className="text-sm text-gray-400">Automatically approve garage hub boosts</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={boostSettings.autoApprove}
                    onChange={(e) => setBoostSettings({...boostSettings, autoApprove: e.target.checked})}
                    className="rounded border-[var(--sublimes-border)] bg-[var(--sublimes-dark-bg)] text-[var(--sublimes-gold)] w-5 h-5"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-[var(--sublimes-dark-bg)] rounded-lg border border-[var(--sublimes-border)]">
                  <div>
                    <span className="text-[var(--sublimes-light-text)] font-medium">Auto Approve Offer Boosts</span>
                    <p className="text-sm text-gray-400">Automatically approve admin-created offer boosts</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={true}
                    onChange={() => {}}
                    className="rounded border-[var(--sublimes-border)] bg-[var(--sublimes-dark-bg)] text-[var(--sublimes-gold)] w-5 h-5"
                  />
                </label>
              </div>
            </div>

            {/* Additional Settings */}
            <div>
              <h4 className="text-lg font-semibold text-[var(--sublimes-light-text)] mb-4">Additional Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">
                    Auto-Approve After (Days)
                  </label>
                  <input
                    type="number"
                    value={boostSettings.autoApproveAfterDays}
                    onChange={(e) => setBoostSettings({...boostSettings, autoApproveAfterDays: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">
                    Max Boost Duration (Days)
                  </label>
                  <input
                    type="number"
                    value={boostSettings.maxBoostDuration}
                    onChange={(e) => setBoostSettings({...boostSettings, maxBoostDuration: parseInt(e.target.value) || 30})}
                    className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)]"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowSettingsModal(false)}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setShowSettingsModal(false);
                toast.success('✅ Boost settings saved successfully!');
              }}
              className="flex-1 px-4 py-2 bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] rounded-lg hover:bg-[var(--sublimes-gold)]/90"
            >
              Save Settings
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}