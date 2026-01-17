import { useState, useEffect, useRef } from 'react';
import { normalizeMarketplace, AdminMarketItem } from './_marketNormalize';
import { 
  ShoppingCart, 
  Car, 
  Wrench, 
  CheckCircle, 
  Clock, 
  XCircle,
  Eye,
  TrendingUp,
  Filter,
  Search,
  MoreVertical,
  Edit
} from 'lucide-react';
import { DateRangeFilter } from './DateRangeFilter';
import { Checkbox } from '../ui/checkbox';
import { AdminMarketplaceAnalyticsPage } from './AdminMarketplaceAnalyticsPage';
import { AdminMarketplaceSettingsPage } from './AdminMarketplaceSettingsPage';
import { toast } from 'sonner';

export function AdminMarketplacePageFixed() {
  const [selectedTab, setSelectedTab] = useState('listings');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    if (activeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [activeDropdown]);

  const marketplaceStats = [
    { title: 'Total Listings', value: '1,247', change: '+18%', icon: ShoppingCart, color: 'text-blue-500' },
    { title: 'Pending Approval', value: '23', change: '+5', icon: Clock, color: 'text-orange-500' },
    { title: 'Cars Listed', value: '156', change: '+12%', icon: Car, color: 'text-green-500' },
    { title: 'Auto Parts', value: '1,091', change: '+22%', icon: Wrench, color: 'text-purple-500' },
  ];

  const pendingListings = [
    {
      id: '1',
      title: '2023 BMW M3 Competition - Low Mileage',
      seller: 'Ahmed Hassan',
      category: 'Cars',
      price: 185000,
      location: 'Dubai',
      submittedAt: '2 hours ago',
      status: 'pending',
      images: 8,
      description: 'Pristine condition BMW M3 with full service history...',
      views: 0,
      boostPackage: 'Premium'
    },
    {
      id: '2',
      title: 'BYD Original Brake Pads Set',
      seller: 'Parts Pro Dubai',
      category: 'Auto Parts',
      price: 450,
      location: 'Sharjah',
      submittedAt: '5 hours ago',
      status: 'pending',
      images: 4,
      description: 'Genuine BYD brake pads suitable for all BYD models...',
      views: 0,
      boostPackage: null
    },
    {
      id: '3',
      title: '2022 Mercedes EQS - Electric Luxury',
      seller: 'Luxury Cars AE',
      category: 'Cars',
      price: 295000,
      location: 'Abu Dhabi',
      submittedAt: '1 day ago',
      status: 'under_review',
      images: 12,
      description: 'Fully loaded Mercedes EQS with extended warranty...',
      views: 45,
      boostPackage: 'Featured'
    }
  ];

  const approvedListings = [
    {
      id: '4',
      title: '2023 BYD Seal Performance',
      seller: 'CarDealer123',
      category: 'Cars',
      price: 125000,
      location: 'Dubai',
      approvedAt: '1 day ago',
      status: 'active',
      images: 10,
      views: 234,
      inquiries: 12,
      boostPackage: 'Basic'
    },
    {
      id: '5',
      title: 'Tesla Model Y Performance Wheels',
      seller: 'Tesla Parts UAE',
      category: 'Auto Parts',
      price: 3200,
      location: 'Dubai',
      approvedAt: '2 days ago',
      status: 'active',
      images: 6,
      views: 156,
      inquiries: 8,
      boostPackage: null
    }
  ];

  const tabs = [
    { id: 'listings', label: 'Listing Management', icon: ShoppingCart },
    { id: 'boost', label: 'Boost Packages', icon: TrendingUp },
    { id: 'analytics', label: 'Marketplace Analytics', icon: Eye },
    { id: 'settings', label: 'Marketplace Settings', icon: Filter }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-orange-500 bg-orange-500/10';
      case 'under_review': return 'text-blue-500 bg-blue-500/10';
      case 'active': return 'text-green-500 bg-green-500/10';
      case 'rejected': return 'text-red-500 bg-red-500/10';
      case 'expired': return 'text-gray-500 bg-gray-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
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
    const allListings = [...listings.pending, ...listings.approved];
    if (selectAll) {
      setSelectedItems(allListings.map(listing => listing.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleExportData = (selectedIds: string[], dateRange: { from: string; to: string }) => {
    const allListings = [...listings.pending, ...listings.approved];
    const dataToExport = selectedIds.length > 0 
      ? allListings.filter(listing => selectedIds.includes(listing.id))
      : allListings;
    
    // Apply date filter if provided
    let filteredItems = dataToExport;
    if (dateRange?.from || dateRange?.to) {
      filteredItems = dataToExport.filter(listing => {
        const itemDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
        const fromDate = dateRange.from ? new Date(dateRange.from) : null;
        const toDate = dateRange.to ? new Date(dateRange.to) : null;
        
        if (fromDate && itemDate < fromDate) return false;
        if (toDate && itemDate > toDate) return false;
        return true;
      });
    }

    const headers = ['ID', 'Title', 'Seller', 'Category', 'Price', 'Location', 'Status', 'Views', 'Images'];
    const csvContent = [
      headers.join(','),
      ...filteredItems.map(listing => [
        listing.id,
        `"${listing.title}"`,
        `"${listing.seller}"`,
        listing.category,
        listing.price,
        listing.location,
        listing.status,
        listing.views || 0,
        listing.images
      ].join(','))
    ].join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `marketplace-listings-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Exported ${filteredItems.length} listings successfully`);
  };

  const bulkApprove = () => {
    const pendingIds = listings.pending.filter(listing => listing.status === 'pending').map(listing => listing.id);
    if (pendingIds.length === 0) {
      toast.error('No pending listings to approve');
      return;
    }
    const confirmed = window.confirm(`Approve ${pendingIds.length} pending listings?\\n\\nThis will make all pending listings visible to users.`);
    if (confirmed) {
      const pendingToApprove = listings.pending.filter(listing => listing.status === 'pending');
      const newlyApproved = pendingToApprove.map(listing => ({
        ...listing,
        status: 'active',
        approvedAt: 'Just now',
        views: 0,
        inquiries: 0
      }));
      
      setListings(prev => ({
        pending: prev.pending.filter(listing => listing.status !== 'pending'),
        approved: [...prev.approved, ...newlyApproved]
      }));
      
      toast.success(`✅ ${pendingIds.length} listings approved successfully!`);
    }
  };

  const normalizedInitial = normalizeMarketplace(pendingListings, approvedListings)

  const [listings, setListings] = useState<{ pending: AdminMarketItem[]; approved: AdminMarketItem[] }>({
    pending: normalizedInitial.pending,
    approved: normalizedInitial.approved,
  })

  const approveListing = (listingId: string) => {
    const listing = listings.pending.find(l => l.id === listingId);
    if (listing) {
      const confirmation = window.confirm(`Approve listing "${listing.title}" by ${listing.seller}?\\n\\nPrice: AED ${listing.price.toLocaleString()}\\nLocation: ${listing.location}\\nCategory: ${listing.category}\\n\\nThis will make the listing visible to all users.`);
      
      if (confirmation) {
        setListings(prev => ({
          pending: prev.pending.filter(l => l.id !== listingId),
          approved: [...prev.approved, { ...listing, status: 'active', approvedAt: 'Just now', views: 0, inquiries: 0 }]
        }));
        
        toast.success(`✅ Listing "${listing.title}" approved successfully!`);
      }
    }
  };

  const reviewListing = (listingId: string) => {
    const listing = [...listings.pending, ...listings.approved].find(l => l.id === listingId);
    if (listing) {
      const listingDetails = `LISTING REVIEW:\\n\\nTitle: ${listing.title}\\nSeller: ${listing.seller}\\nPrice: AED ${listing.price.toLocaleString()}\\nCategory: ${listing.category}\\nLocation: ${listing.location}\\nImages: ${listing.images}\\nStatus: ${listing.status}\\n\\nDescription: ${listing.description || 'N/A'}\\n\\nBoost Package: ${listing.boostPackage || 'None'}\\nViews: ${listing.views || 0}\\nInquiries: ${(listing as any).inquiries || 0}`;
      
      alert(listingDetails);
      toast.success(`📋 Reviewing listing: ${listing.title}`);
    }
  };

  const rejectListing = (listingId: string) => {
    const listing = listings.pending.find(l => l.id === listingId);
    if (listing) {
      const reason = window.prompt(`Enter rejection reason for "${listing.title}" by ${listing.seller}:\\n\\nCommon reasons:\\n- Inappropriate content\\n- Fake/misleading information\\n- Poor quality images\\n- Duplicate listing\\n- Price manipulation\\n\\nReason:`);
      
      if (reason) {
        setListings(prev => ({
          pending: prev.pending.filter(l => l.id !== listingId),
          approved: prev.approved
        }));
        
        toast.error(`❌ Listing "${listing.title}" rejected. Reason: ${reason}`);
      }
    }
  };

  const editListing = (listingId: string) => {
    const listing = [...listings.pending, ...listings.approved].find(l => l.id === listingId);
    if (listing) {
      const newTitle = window.prompt(`Edit title for "${listing.title}":`, listing.title);
      const newPrice = window.prompt(`Edit price for "${listing.title}" (current: ${listing.price}):`, listing.price.toString());
      
      if (newTitle && newPrice) {
        const updatedListing = { ...listing, title: newTitle, price: parseInt(newPrice) };
        
        if (listing.status === 'pending' || listing.status === 'under_review') {
          setListings(prev => ({
            pending: prev.pending.map(l => l.id === listingId ? updatedListing : l),
            approved: prev.approved
          }));
        } else {
          setListings(prev => ({
            pending: prev.pending,
            approved: prev.approved.map(l => l.id === listingId ? updatedListing : l)
          }));
        }
        
        toast.success(`✏️ Listing "${updatedListing.title}" updated successfully!`);
      }
    }
  };

  const suspendListing = (listingId: string) => {
    const listing = listings.approved.find(l => l.id === listingId);
    if (listing) {
      const reason = window.prompt(`Enter suspension reason for "${listing.title}":\\n\\nCommon reasons:\\n- Policy violation\\n- User reports\\n- Suspicious activity\\n- Maintenance required\\n\\nReason:`);
      
      if (reason) {
        setListings(prev => ({
          pending: prev.pending,
          approved: prev.approved.map(l => l.id === listingId ? { ...l, status: 'suspended' } : l)
        }));
        
        toast.warning(`⏸️ Listing "${listing.title}" suspended. Reason: ${reason}`);
      }
    }
  };

  const removeListing = (listingId: string) => {
    const listing = [...listings.pending, ...listings.approved].find(l => l.id === listingId);
    if (listing) {
      const reason = window.prompt(`Enter removal reason for "${listing.title}":\\n\\nCommon reasons:\\n- Policy violation\\n- Inappropriate content\\n- User request\\n- Duplicate listing\\n\\nReason:`);
      
      if (reason) {
        if (listing.status === 'pending' || listing.status === 'under_review') {
          setListings(prev => ({
            pending: prev.pending.filter(l => l.id !== listingId),
            approved: prev.approved
          }));
        } else {
          setListings(prev => ({
            pending: prev.pending,
            approved: prev.approved.filter(l => l.id !== listingId)
          }));
        }
        
        toast.success(`🗑️ Listing "${listing.title}" removed. Reason: ${reason}`);
      }
    }
  };

  const editBoostPackage = (packageType: string) => {
    const currentPrice = packageType === 'Basic' ? 50 : packageType === 'Premium' ? 100 : 200;
    const currentDuration = packageType === 'Basic' ? 7 : packageType === 'Premium' ? 14 : 30;
    
    const newPrice = window.prompt(`Edit ${packageType} Boost Package\\n\\nCurrent Price: AED ${currentPrice}\\nEnter new price (AED):`, currentPrice.toString());
    const newDuration = window.prompt(`Edit ${packageType} Boost Package\\n\\nCurrent Duration: ${currentDuration} days\\nEnter new duration (days):`, currentDuration.toString());
    
    if (newPrice && newDuration) {
      toast.success(`✅ ${packageType} Boost Package updated!\\nNew Price: AED ${newPrice}\\nNew Duration: ${newDuration} days`);
    }
  };

  const renderBoostContent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['Basic', 'Premium', 'Featured'].map((packageType) => (
          <div key={packageType} className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
            <h4 className="text-lg font-bold text-[var(--sublimes-light-text)] mb-4">{packageType} Boost</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Price</span>
                <span className="text-[var(--sublimes-gold)] font-medium">
                  AED {packageType === 'Basic' ? '50' : packageType === 'Premium' ? '100' : '200'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Duration</span>
                <span className="text-[var(--sublimes-light-text)]">
                  {packageType === 'Basic' ? '7 days' : packageType === 'Premium' ? '14 days' : '30 days'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Views Boost</span>
                <span className="text-[var(--sublimes-light-text)]">
                  {packageType === 'Basic' ? '2x' : packageType === 'Premium' ? '3x' : '5x'}
                </span>
              </div>
            </div>
            <button 
              onClick={() => editBoostPackage(packageType)}
              className="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
            >
              Edit Package
            </button>
          </div>
        ))}
      </div>
      
      <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
        <h4 className="text-lg font-bold text-[var(--sublimes-light-text)] mb-6">Boost Statistics</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-500">234</p>
            <p className="text-sm text-gray-400">Active Boosts</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[var(--sublimes-gold)]">AED 12.5K</p>
            <p className="text-sm text-gray-400">Monthly Revenue</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-500">89%</p>
            <p className="text-sm text-gray-400">Success Rate</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-500">3.2x</p>
            <p className="text-sm text-gray-400">Avg. View Increase</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderListingsContent = () => (
    <div className="space-y-6">
      {/* Bulk Selection & Export Controls */}
      <DateRangeFilter 
        selectedItems={selectedItems}
        onSelectItem={handleSelectItem}
        onSelectAll={handleSelectAll}
        allItems={[...listings.pending, ...listings.approved]}
        onExportData={handleExportData}
        isSelectAllChecked={selectedItems.length === [...listings.pending, ...listings.approved].length && [...listings.pending, ...listings.approved].length > 0}
        title="Listings"
      />

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search listings..."
              className="pl-10 pr-4 py-2 bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--sublimes-gold)]"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)]"
          >
            <option value="All">All Categories</option>
            <option value="Cars">Cars</option>
            <option value="Auto Parts">Auto Parts</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)]"
          >
            <option value="All">All Status</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="active">Active</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={bulkApprove}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Bulk Approve</span>
          </button>
        </div>
      </div>

      {/* Pending Listings */}
      <div>
        <h3 className="text-xl font-bold text-[var(--sublimes-light-text)] mb-4">Pending Approval ({listings.pending.length})</h3>
        <div className="space-y-4">
          {listings.pending.map((listing) => (
            <div key={listing.id} className="bg-[var(--sublimes-card-bg)] border border-orange-500/30 rounded-xl p-6 relative">
              <div className="absolute top-4 left-4">
                <Checkbox
                  checked={selectedItems.includes(listing.id)}
                  onCheckedChange={() => handleSelectItem(listing.id)}
                  className="border-[var(--sublimes-border)]"
                />
              </div>
              <div className="flex items-start justify-between mb-4 ml-8">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-bold text-[var(--sublimes-light-text)]">{listing.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(listing.status)}`}>
                      {listing.status.replace('_', ' ').toUpperCase()}
                    </span>
                    {listing.boostPackage && (
                      <span className="px-2 py-1 bg-[var(--sublimes-gold)]/10 text-[var(--sublimes-gold)] rounded-full text-xs font-medium">
                        {listing.boostPackage} Boost
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-400 mb-2">
                    <span>by {listing.seller}</span>
                    <span>•</span>
                    <span>{listing.category}</span>
                    <span>•</span>
                    <span>{listing.location}</span>
                    <span>•</span>
                    <span>{listing.submittedAt}</span>
                  </div>
                  <p className="text-[var(--sublimes-light-text)] text-xl font-bold mb-2">AED {listing.price.toLocaleString()}</p>
                  <p className="text-gray-400 text-sm">{listing.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                    <span>{listing.images} images</span>
                    <span>•</span>
                    <span>{listing.views} views</span>
                  </div>
                </div>
                <div className="relative">
                  <button 
                    onClick={() => setActiveDropdown(activeDropdown === listing.id ? null : listing.id)}
                    className="p-2 text-gray-400 hover:text-[var(--sublimes-light-text)] transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {activeDropdown === listing.id && (
                    <div className="absolute right-0 top-8 w-48 bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-lg shadow-lg z-[9999]">
                      <div className="py-2">
                        <button
                          onClick={() => {
                            reviewListing(listing.id);
                            setActiveDropdown(null);
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-blue-500 hover:bg-blue-500/10 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Review Details</span>
                        </button>
                        <button
                          onClick={() => {
                            editListing(listing.id);
                            setActiveDropdown(null);
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-orange-500 hover:bg-orange-500/10 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit Listing</span>
                        </button>
                        <button
                          onClick={() => {
                            approveListing(listing.id);
                            setActiveDropdown(null);
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-green-500 hover:bg-green-500/10 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => {
                            rejectListing(listing.id);
                            setActiveDropdown(null);
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                        <button
                          onClick={() => {
                            removeListing(listing.id);
                            setActiveDropdown(null);
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => approveListing(listing.id)}
                  className="flex-1 flex items-center justify-center space-x-2 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Approve</span>
                </button>
                <button 
                  onClick={() => reviewListing(listing.id)}
                  className="flex-1 flex items-center justify-center space-x-2 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
                >
                  <Eye className="w-4 h-4" />
                  <span>Review</span>
                </button>
                <button 
                  onClick={() => rejectListing(listing.id)}
                  className="flex-1 flex items-center justify-center space-x-2 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Listings */}
      <div>
        <h3 className="text-xl font-bold text-[var(--sublimes-light-text)] mb-4">Active Listings ({listings.approved.length})</h3>
        <div className="space-y-4">
          {listings.approved.map((listing) => (
            <div key={listing.id} className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6 relative">
              <div className="absolute top-4 left-4">
                <Checkbox
                  checked={selectedItems.includes(listing.id)}
                  onCheckedChange={() => handleSelectItem(listing.id)}
                  className="border-[var(--sublimes-border)]"
                />
              </div>
              <div className="flex items-start justify-between mb-4 ml-8">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-bold text-[var(--sublimes-light-text)]">{listing.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(listing.status)}`}>
                      {listing.status.toUpperCase()}
                    </span>
                    {listing.boostPackage && (
                      <span className="px-2 py-1 bg-[var(--sublimes-gold)]/10 text-[var(--sublimes-gold)] rounded-full text-xs font-medium">
                        {listing.boostPackage} Boost
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-400 mb-2">
                    <span>by {listing.seller}</span>
                    <span>•</span>
                    <span>{listing.category}</span>
                    <span>•</span>
                    <span>{listing.location}</span>
                    <span>•</span>
                    <span>Approved {listing.approvedAt}</span>
                  </div>
                  <p className="text-[var(--sublimes-light-text)] text-xl font-bold mb-2">AED {listing.price.toLocaleString()}</p>
                  <div className="flex items-center space-x-6 text-sm text-gray-400">
                    <span>{listing.images} images</span>
                    <span>•</span>
                    <span>{listing.views} views</span>
                    <span>•</span>
                    <span>{listing.inquiries} inquiries</span>
                  </div>
                </div>
                <div className="relative">
                  <button 
                    onClick={() => setActiveDropdown(activeDropdown === listing.id ? null : listing.id)}
                    className="p-2 text-gray-400 hover:text-[var(--sublimes-light-text)] transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {activeDropdown === listing.id && (
                    <div className="absolute right-0 top-8 w-48 bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-lg shadow-lg z-[9999]">
                      <div className="py-2">
                        <button
                          onClick={() => {
                            reviewListing(listing.id);
                            setActiveDropdown(null);
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-blue-500 hover:bg-blue-500/10 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Details</span>
                        </button>
                        <button
                          onClick={() => {
                            editListing(listing.id);
                            setActiveDropdown(null);
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-orange-500 hover:bg-orange-500/10 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit Listing</span>
                        </button>
                        <button
                          onClick={() => {
                            suspendListing(listing.id);
                            setActiveDropdown(null);
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-yellow-500 hover:bg-yellow-500/10 transition-colors"
                        >
                          <Clock className="w-4 h-4" />
                          <span>Suspend</span>
                        </button>
                        <button
                          onClick={() => {
                            removeListing(listing.id);
                            setActiveDropdown(null);
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => reviewListing(listing.id)}
                  className="flex items-center space-x-1 px-3 py-1 text-blue-500 hover:bg-blue-500/10 rounded-lg"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </button>
                <button 
                  onClick={() => editListing(listing.id)}
                  className="flex items-center space-x-1 px-3 py-1 text-orange-500 hover:bg-orange-500/10 rounded-lg"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button 
                  onClick={() => suspendListing(listing.id)}
                  className="flex items-center space-x-1 px-3 py-1 text-red-500 hover:bg-red-500/10 rounded-lg"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Suspend</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-[var(--sublimes-dark-bg)]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--sublimes-light-text)] mb-2">Marketplace Management</h1>
        <p className="text-gray-400">Manage listings, approvals, and marketplace settings</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {marketplaceStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <Icon className={`w-8 h-8 ${stat.color}`} />
                <span className={`px-2 py-1 text-xs font-bold rounded ${stat.color.replace('text-', 'bg-')}/10 ${stat.color}`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">{stat.value}</p>
              <p className="text-sm text-gray-400">{stat.title}</p>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex space-x-1 bg-[var(--sublimes-card-bg)] rounded-lg p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
                  selectedTab === tab.id
                    ? 'bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]'
                    : 'text-gray-400 hover:text-[var(--sublimes-light-text)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {selectedTab === 'listings' && renderListingsContent()}
      {selectedTab === 'boost' && renderBoostContent()}
      {selectedTab === 'analytics' && <AdminMarketplaceAnalyticsPage />}
      {selectedTab === 'settings' && <AdminMarketplaceSettingsPage />}
    </div>
  );
}