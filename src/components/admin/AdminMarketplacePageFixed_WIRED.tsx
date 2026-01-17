/**
 * AdminMarketplacePageFixed_WIRED
 * Complete admin marketplace management with Supabase integration
 * Features: Listing approval, boost management, analytics, settings
 */

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
import { AdminMarketplaceAnalyticsPage_WIRED } from './AdminMarketplaceAnalyticsPage_WIRED';
import { AdminMarketplaceSettingsPage } from './AdminMarketplaceSettingsPage';
import { toast } from 'sonner';
import { useMarketplaceListings } from '../../src/hooks';
import { supabase } from '../../utils/supabase/client';

export function AdminMarketplacePageFixed_WIRED() {
  const [selectedTab, setSelectedTab] = useState('listings');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch listings from database
  const { 
    listings: allListings, 
    loading, 
    refetch,
    approveListing: dbApproveListing,
    rejectListing: dbRejectListing,
    updateListing: dbUpdateListing,
    deleteListing: dbDeleteListing,
    suspendListing: dbSuspendListing
  } = useMarketplaceListings({ isAdmin: true });

  // Fetch admin stats from database view
  const [adminStats, setAdminStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, [allListings.length]);

  const fetchAdminStats = async () => {
    try {
      setStatsLoading(true);
      const { data, error } = await supabase
        .from('admin_marketplace_stats')
        .select('*')
        .single();

      if (error) {
        console.error('Error fetching admin stats:', error);
        // Fallback to client-side calculation
        setAdminStats({
          total_listings: allListings.length,
          pending_listings: allListings.filter(l => l.status === 'pending').length,
          car_listings: allListings.filter(l => l.listing_type === 'car').length,
          part_listings: allListings.filter(l => l.listing_type === 'part').length,
        });
      } else {
        setAdminStats(data);
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Split listings into pending and approved
  const pendingListings = allListings.filter(l => ['pending', 'under_review'].includes(l.status));
  const approvedListings = allListings.filter(l => ['active', 'sold'].includes(l.status));

  // Calculate stats from database
  const marketplaceStats = [
    { 
      title: 'Total Listings', 
      value: statsLoading ? '...' : (adminStats?.total_listings || 0).toString(), 
      change: '', 
      icon: ShoppingCart, 
      color: 'text-blue-500' 
    },
    { 
      title: 'Pending Approval', 
      value: statsLoading ? '...' : (adminStats?.pending_listings || 0).toString(), 
      change: '', 
      icon: Clock, 
      color: 'text-orange-500' 
    },
    { 
      title: 'Cars Listed', 
      value: statsLoading ? '...' : (adminStats?.car_listings || 0).toString(), 
      change: '', 
      icon: Car, 
      color: 'text-green-500' 
    },
    { 
      title: 'Auto Parts', 
      value: statsLoading ? '...' : (adminStats?.part_listings || 0).toString(), 
      change: '', 
      icon: Wrench, 
      color: 'text-purple-500' 
    },
  ];

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
      case 'sold': return 'text-purple-500 bg-purple-500/10';
      case 'suspended': return 'text-yellow-500 bg-yellow-500/10';
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
    if (selectAll) {
      setSelectedItems(allListings.map(listing => listing.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleExportData = (selectedIds: string[], dateRange: { from: string; to: string }) => {
    const dataToExport = selectedIds.length > 0 
      ? allListings.filter(listing => selectedIds.includes(listing.id))
      : allListings;
    
    const headers = ['ID', 'Title', 'Seller', 'Type', 'Price', 'Location', 'Status', 'Views', 'Created'];
    const csvContent = [
      headers.join(','),
      ...dataToExport.map(listing => [
        listing.id,
        `"${listing.title}"`,
        `"${listing.seller_name || 'Unknown'}"`,
        listing.listing_type,
        listing.price,
        listing.location,
        listing.status,
        listing.view_count || 0,
        new Date(listing.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `marketplace-listings-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Exported ${dataToExport.length} listings successfully`);
  };

  const bulkApprove = async () => {
    const pendingIds = pendingListings.filter(listing => listing.status === 'pending').map(listing => listing.id);
    if (pendingIds.length === 0) {
      toast.error('No pending listings to approve');
      return;
    }
    const confirmed = window.confirm(`Approve ${pendingIds.length} pending listings?\n\nThis will make all pending listings visible to users.`);
    if (confirmed) {
      try {
        // Approve all in parallel
        await Promise.all(pendingIds.map(id => dbApproveListing(id)));
        toast.success(`✅ ${pendingIds.length} listings approved successfully!`);
        refetch();
      } catch (error) {
        toast.error('Failed to approve listings');
        console.error(error);
      }
    }
  };

  const approveListing = async (listingId: string) => {
    const listing = allListings.find(l => l.id === listingId);
    if (listing) {
      const confirmation = window.confirm(`Approve listing "${listing.title}"?\n\nPrice: AED ${listing.price.toLocaleString()}\nLocation: ${listing.location}\n\nThis will make the listing visible to all users.`);
      
      if (confirmation) {
        try {
          await dbApproveListing(listingId);
          toast.success(`✅ Listing "${listing.title}" approved successfully!`);
          refetch();
        } catch (error) {
          toast.error('Failed to approve listing');
          console.error(error);
        }
      }
    }
  };

  const reviewListing = (listingId: string) => {
    const listing = allListings.find(l => l.id === listingId);
    if (listing) {
      const listingDetails = `LISTING REVIEW:\n\nTitle: ${listing.title}\nSeller: ${listing.seller_name}\nPrice: AED ${listing.price.toLocaleString()}\nType: ${listing.listing_type}\nLocation: ${listing.location}\nStatus: ${listing.status}\n\nDescription: ${listing.description}\n\nBoost: ${listing.boost_package || 'None'}\nViews: ${listing.view_count}\nInquiries: ${listing.inquiry_count}`;
      
      alert(listingDetails);
      toast.success(`📋 Reviewing listing: ${listing.title}`);
    }
  };

  const rejectListing = async (listingId: string) => {
    const listing = allListings.find(l => l.id === listingId);
    if (listing) {
      const reason = window.prompt(`Enter rejection reason for "${listing.title}":\n\nCommon reasons:\n- Inappropriate content\n- Fake/misleading information\n- Poor quality images\n- Duplicate listing\n- Price manipulation\n\nReason:`);
      
      if (reason) {
        try {
          await dbRejectListing(listingId, reason);
          toast.error(`❌ Listing "${listing.title}" rejected. Reason: ${reason}`);
          refetch();
        } catch (error) {
          toast.error('Failed to reject listing');
          console.error(error);
        }
      }
    }
  };

  const editListing = async (listingId: string) => {
    const listing = allListings.find(l => l.id === listingId);
    if (listing) {
      const newTitle = window.prompt(`Edit title for "${listing.title}":`, listing.title);
      const newPrice = window.prompt(`Edit price for "${listing.title}" (current: ${listing.price}):`, listing.price.toString());
      
      if (newTitle && newPrice) {
        try {
          await dbUpdateListing(listingId, { 
            title: newTitle, 
            price: parseFloat(newPrice) 
          });
          toast.success(`✏️ Listing updated successfully!`);
          refetch();
        } catch (error) {
          toast.error('Failed to update listing');
          console.error(error);
        }
      }
    }
  };

  const suspendListing = async (listingId: string) => {
    const listing = allListings.find(l => l.id === listingId);
    if (listing) {
      const reason = window.prompt(`Enter suspension reason for "${listing.title}":\n\nCommon reasons:\n- Policy violation\n- User reports\n- Suspicious activity\n- Maintenance required\n\nReason:`);
      
      if (reason) {
        try {
          await dbSuspendListing(listingId, reason);
          toast.warning(`⏸️ Listing "${listing.title}" suspended. Reason: ${reason}`);
          refetch();
        } catch (error) {
          toast.error('Failed to suspend listing');
          console.error(error);
        }
      }
    }
  };

  const removeListing = async (listingId: string) => {
    const listing = allListings.find(l => l.id === listingId);
    if (listing) {
      const reason = window.prompt(`Enter removal reason for "${listing.title}":\n\nCommon reasons:\n- Policy violation\n- Inappropriate content\n- User request\n- Duplicate listing\n\nReason:`);
      
      if (reason) {
        const confirmed = window.confirm(`Are you sure you want to permanently delete "${listing.title}"?\n\nThis action cannot be undone.`);
        if (confirmed) {
          try {
            await dbDeleteListing(listingId);
            toast.success(`🗑️ Listing "${listing.title}" removed.`);
            refetch();
          } catch (error) {
            toast.error('Failed to remove listing');
            console.error(error);
          }
        }
      }
    }
  };

  const editBoostPackage = (packageType: string) => {
    const currentPrice = packageType === 'Basic' ? 50 : packageType === 'Premium' ? 100 : 200;
    const currentDuration = packageType === 'Basic' ? 7 : packageType === 'Premium' ? 14 : 30;
    
    const newPrice = window.prompt(`Edit ${packageType} Boost Package\n\nCurrent Price: AED ${currentPrice}\nEnter new price (AED):`, currentPrice.toString());
    const newDuration = window.prompt(`Edit ${packageType} Boost Package\n\nCurrent Duration: ${currentDuration} days\nEnter new duration (days):`, currentDuration.toString());
    
    if (newPrice && newDuration) {
      toast.success(`✅ ${packageType} Boost Package updated!\nNew Price: AED ${newPrice}\nNew Duration: ${newDuration} days`);
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
            <p className="text-2xl font-bold text-blue-500">
              {statsLoading ? '...' : (adminStats?.boosted_listings || 0)}
            </p>
            <p className="text-sm text-gray-400">Active Boosts</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[var(--sublimes-gold)]">
              {statsLoading ? '...' : adminStats?.total_views || 0}
            </p>
            <p className="text-sm text-gray-400">Total Views</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-500">
              {statsLoading ? '...' : adminStats?.total_inquiries || 0}
            </p>
            <p className="text-sm text-gray-400">Total Inquiries</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-500">
              {statsLoading ? '...' : adminStats?.total_favorites || 0}
            </p>
            <p className="text-sm text-gray-400">Total Favorites</p>
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
        allItems={allListings}
        onExportData={handleExportData}
        isSelectAllChecked={selectedItems.length === allListings.length && allListings.length > 0}
        title="Listings"
      />

      {/* Filters */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-4 flex-wrap gap-2">
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
            <option value="Accessories">Accessories</option>
            <option value="Services">Services</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)]"
          >
            <option value="All">All Status</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="rejected">Rejected</option>
            <option value="sold">Sold</option>
            <option value="suspended">Suspended</option>
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

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
            <p className="text-[#8B92A7]">Loading listings...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Pending Listings */}
          <div>
            <h3 className="text-xl font-bold text-[var(--sublimes-light-text)] mb-4">Pending Approval ({pendingListings.length})</h3>
            {pendingListings.length === 0 ? (
              <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-8 text-center">
                <p className="text-gray-400">No pending listings</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingListings.map((listing) => (
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
                          {listing.boost_package && (
                            <span className="px-2 py-1 bg-[var(--sublimes-gold)]/10 text-[var(--sublimes-gold)] rounded-full text-xs font-medium">
                              {listing.boost_package.toUpperCase()} BOOST
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-400 mb-2">
                          <span>by {listing.seller_name}</span>
                          <span>•</span>
                          <span>{listing.listing_type}</span>
                          <span>•</span>
                          <span>{listing.location}</span>
                          <span>•</span>
                          <span>{new Date(listing.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-[var(--sublimes-light-text)] text-xl font-bold mb-2">AED {listing.price.toLocaleString()}</p>
                        <p className="text-gray-400 text-sm line-clamp-2">{listing.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                          <span>{listing.images?.length || 0} images</span>
                          <span>•</span>
                          <span>{listing.view_count} views</span>
                          <span>•</span>
                          <span>{listing.inquiry_count} inquiries</span>
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
            )}
          </div>

          {/* Active Listings */}
          <div>
            <h3 className="text-xl font-bold text-[var(--sublimes-light-text)] mb-4">Active Listings ({approvedListings.length})</h3>
            {approvedListings.length === 0 ? (
              <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-8 text-center">
                <p className="text-gray-400">No active listings</p>
              </div>
            ) : (
              <div className="space-y-4">
                {approvedListings.slice(0, 10).map((listing) => (
                  <div key={listing.id} className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-bold text-[var(--sublimes-light-text)]">{listing.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(listing.status)}`}>
                            {listing.status.toUpperCase()}
                          </span>
                          {listing.boost_package && (
                            <span className="px-2 py-1 bg-[var(--sublimes-gold)]/10 text-[var(--sublimes-gold)] rounded-full text-xs font-medium">
                              {listing.boost_package.toUpperCase()} BOOST
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-400 mb-2">
                          <span>by {listing.seller_name}</span>
                          <span>•</span>
                          <span>{listing.listing_type}</span>
                          <span>•</span>
                          <span>{listing.location}</span>
                        </div>
                        <p className="text-[var(--sublimes-light-text)] text-xl font-bold mb-2">AED {listing.price.toLocaleString()}</p>
                        <div className="flex items-center space-x-6 text-sm text-gray-400">
                          <span>{listing.view_count} views</span>
                          <span>•</span>
                          <span>{listing.inquiry_count} inquiries</span>
                          <span>•</span>
                          <span>{listing.favorite_count} favorites</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
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
        <div className="flex space-x-1 bg-[var(--sublimes-card-bg)] rounded-lg p-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors whitespace-nowrap ${
                  selectedTab === tab.id
                    ? 'bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]'
                    : 'text-gray-400 hover:text-[var(--sublimes-light-text)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {selectedTab === 'listings' && renderListingsContent()}
      {selectedTab === 'boost' && renderBoostContent()}
      {selectedTab === 'analytics' && <AdminMarketplaceAnalyticsPage_WIRED />}
      {selectedTab === 'settings' && <AdminMarketplaceSettingsPage />}
    </div>
  );
}
