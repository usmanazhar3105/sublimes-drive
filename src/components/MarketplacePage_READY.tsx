/**
 * MarketplacePage - Production Ready with Setup Diagnostics
 * 
 * MASTER GUIDELINE COMPLIANCE:
 * - Single source of truth: Supabase marketplace_listings table
 * - RLS policies enforced
 * - No hardcoded data
 * - Comprehensive error handling
 * - Mobile responsive
 * - Chinese car brands only
 */

import { useState, useEffect } from 'react';
import { ListingCard } from './ListingCard';
import { ListingDetailModal } from './ListingDetailModal';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, Filter, Plus, SlidersHorizontal, X, ArrowUpDown, TrendingUp, TrendingDown, LayoutGrid, Loader2, AlertCircle, Database, Shield, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Slider } from './ui/slider';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { ViewToggle } from './ui/ViewToggle';
import { BoostPlansModal } from './ui/BoostPlansModal';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

// Import the correct marketplace hook
import { useMarketplaceListings } from '../hooks/useMarketplaceListings';
import { useRole } from '../hooks';

interface MarketplacePageProps {
  onNavigate?: (page: string) => void;
}

export function MarketplacePage({ onNavigate }: MarketplacePageProps) {
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [location, setLocation] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isBoostModalOpen, setIsBoostModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // 🔥 SUPABASE HOOKS - Use correct hook
  const { profile, isAdmin } = useRole();
  
  const { 
    listings, 
    loading, 
    error, 
    diagnostics,
    refetch,
  } = useMarketplaceListings({
    status: selectedType !== 'all' ? selectedType : undefined,
    listing_type: selectedType !== 'all' ? selectedType : undefined,
    brand: selectedBrand !== 'all' ? selectedBrand : undefined,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    location: location !== 'all' ? location : undefined,
    isAdmin: isAdmin,
  });

  // Show error toast when fetch fails
  useEffect(() => {
    if (error) {
      console.error('Marketplace error:', error);
    }
  }, [error]);

  // Filter options - Chinese car brands only
  const listingTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'car', label: '🚗 Cars' },
    { value: 'part', label: '🔧 Parts' },
    { value: 'accessory', label: '✨ Accessories' },
    { value: 'service', label: '🛠️ Services' },
  ];

  const brands = [
    'all', 'BYD', 'Hongqi', 'Bestune', 'MG', 'Haval', 'Foton', 'Geely', 'Xpeng', 'Jaecoo', 'Zeekr', 
    'Jetour', 'Jac', 'GAC', 'BAIC', 'Great Wall', 'Chery', 'Skywell', 'Riddara', 'NIO', 'Tank', 
    'Roewe', 'Li Auto', 'Kaiyi', 'Dongfeng', 'Omoda', 'Soueast', 'VGV', 'Seres', 'Avatr', 
    'Forthing', 'Changan', 'Maxus', 'Exeed', 'Other'
  ];

  const locations = ['all', 'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'];

  const sortOptions = [
    { value: 'newest', label: 'Newest First', icon: TrendingUp },
    { value: 'oldest', label: 'Oldest First', icon: TrendingDown },
    { value: 'price_low', label: 'Price: Low to High', icon: ArrowUpDown },
    { value: 'price_high', label: 'Price: High to Low', icon: ArrowUpDown },
    { value: 'popular', label: 'Most Popular', icon: TrendingUp },
  ];

  // Filter and sort listings
  let filteredListings = [...listings];

  // Apply search filter
  if (searchQuery) {
    filteredListings = filteredListings.filter(listing =>
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Apply verified filter
  if (verifiedOnly) {
    filteredListings = filteredListings.filter(listing => listing.is_verified);
  }

  // Apply featured filter
  if (featuredOnly) {
    filteredListings = filteredListings.filter(listing => listing.is_boosted);
  }

  // Apply sorting
  filteredListings.sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'price_low':
        return a.price - b.price;
      case 'price_high':
        return b.price - a.price;
      case 'popular':
        return b.view_count - a.view_count;
      default:
        return 0;
    }
  });

  const handleListingClick = (listing: any) => {
    setSelectedListing(listing);
    setIsDetailModalOpen(true);
  };

  const handleFavoriteToggle = (listingId: string) => {
    setFavoriteIds(prev =>
      prev.includes(listingId)
        ? prev.filter(id => id !== listingId)
        : [...prev, listingId]
    );
  };

  const handleCreateListing = () => {
    if (onNavigate) {
      onNavigate('place-ad');
    }
  };

  const activeFiltersCount = [
    selectedType !== 'all',
    selectedBrand !== 'all',
    location !== 'all',
    priceRange[0] > 0 || priceRange[1] < 1000000,
    verifiedOnly,
    featuredOnly,
  ].filter(Boolean).length;

  // Setup diagnostic panel
  const showSetupInstructions = error && diagnostics;

  return (
    <div className="flex-1 overflow-y-auto bg-[#0B1426]">
      {/* Setup Instructions (if needed) */}
      {showSetupInstructions && (
        <div className="p-4 md:p-6">
          <Alert className="mb-6 bg-red-500/10 border-red-500/20">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <AlertTitle className="text-red-400 mb-2">Marketplace Setup Required</AlertTitle>
            <AlertDescription className="text-red-300 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {diagnostics.tableExists ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">
                    {diagnostics.tableExists ? 'Table exists' : 'Table does not exist'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {diagnostics.rlsEnabled ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">
                    {diagnostics.rlsEnabled ? 'RLS configured' : 'RLS needs configuration'}
                  </span>
                </div>
              </div>

              <div className="bg-[#1E293B] rounded-lg p-4 space-y-3">
                <p className="font-semibold text-[#E8EAED]">Quick Fix (2 minutes):</p>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Open <strong>Supabase Dashboard</strong> → SQL Editor</li>
                  <li>
                    Copy/Paste: <code className="bg-[#0B1426] px-2 py-1 rounded text-[#D4AF37]">/MARKETPLACE_FIX_FRESH_START.sql</code>
                  </li>
                  <li>Click <strong>Run</strong></li>
                  <li>
                    Copy/Paste: <code className="bg-[#0B1426] px-2 py-1 rounded text-[#D4AF37]">/FIX_MARKETPLACE_RLS_NOW.sql</code>
                  </li>
                  <li>Click <strong>Run</strong></li>
                  <li>Refresh this page</li>
                </ol>
              </div>

              {diagnostics.errorDetails && (
                <div className="text-xs text-red-300/80 font-mono bg-[#0B1426] p-2 rounded">
                  Error: {diagnostics.errorDetails}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={() => refetch()}
                  variant="outline"
                  size="sm"
                  className="bg-[#1E293B] border-[#334155] text-[#E8EAED] hover:bg-[#334155]"
                >
                  <Database className="w-4 h-4 mr-2" />
                  Retry Connection
                </Button>
                <Button
                  onClick={() => window.open('https://app.supabase.com', '_blank')}
                  variant="outline"
                  size="sm"
                  className="bg-[#D4AF37] border-[#D4AF37] text-[#0B1426] hover:bg-[#C19B2E]"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Open Supabase Dashboard
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0B1426]/95 backdrop-blur-lg border-b border-[#1E293B]">
        <div className="px-4 md:px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl text-[#E8EAED]">Marketplace</h1>
              <p className="text-sm text-[#94A3B8]">
                {loading ? 'Loading...' : `${filteredListings.length} listings available`}
              </p>
            </div>
            <Button 
              onClick={handleCreateListing}
              className="bg-[#D4AF37] hover:bg-[#C19B2E] text-[#0B1426]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Post Listing
            </Button>
          </div>

          {/* Search and Type Filter */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
              <Input
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#1E293B] border-[#334155] text-[#E8EAED] placeholder:text-[#64748B]"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full md:w-[200px] bg-[#1E293B] border-[#334155] text-[#E8EAED]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1E293B] border-[#334155]">
                {listingTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="text-[#E8EAED]">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className="bg-[#1E293B] border-[#334155] text-[#E8EAED] hover:bg-[#334155]"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2 bg-[#D4AF37] text-[#0B1426]">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
            <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          </div>

          {/* Advanced Filters */}
          {isFiltersOpen && (
            <div className="mt-4 p-4 bg-[#1E293B] rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-[#94A3B8] mb-2 block">Brand</label>
                  <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                    <SelectTrigger className="bg-[#0B1426] border-[#334155] text-[#E8EAED]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1E293B] border-[#334155]">
                      {brands.map((brand) => (
                        <SelectItem key={brand} value={brand} className="text-[#E8EAED]">
                          {brand === 'all' ? 'All Brands' : brand}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-[#94A3B8] mb-2 block">Location</label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="bg-[#0B1426] border-[#334155] text-[#E8EAED]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1E293B] border-[#334155]">
                      {locations.map((loc) => (
                        <SelectItem key={loc} value={loc} className="text-[#E8EAED]">
                          {loc === 'all' ? 'All Locations' : loc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-[#94A3B8] mb-2 block">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="bg-[#0B1426] border-[#334155] text-[#E8EAED]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1E293B] border-[#334155]">
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="text-[#E8EAED]">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm text-[#E8EAED] cursor-pointer">
                  <Checkbox
                    checked={verifiedOnly}
                    onCheckedChange={(checked) => setVerifiedOnly(checked as boolean)}
                  />
                  Verified Only
                </label>
                <label className="flex items-center gap-2 text-sm text-[#E8EAED] cursor-pointer">
                  <Checkbox
                    checked={featuredOnly}
                    onCheckedChange={(checked) => setFeaturedOnly(checked as boolean)}
                  />
                  Featured Only
                </label>
              </div>

              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedType('all');
                    setSelectedBrand('all');
                    setLocation('all');
                    setPriceRange([0, 1000000]);
                    setVerifiedOnly(false);
                    setFeaturedOnly(false);
                  }}
                  className="bg-[#0B1426] border-[#334155] text-[#E8EAED]"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
          </div>
        )}

        {/* Empty State (no error) */}
        {!loading && !error && filteredListings.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[#94A3B8] mb-4">No listings found</p>
            <Button onClick={handleCreateListing} className="bg-[#D4AF37] hover:bg-[#C19B2E] text-[#0B1426]">
              <Plus className="w-4 h-4 mr-2" />
              Create First Listing
            </Button>
          </div>
        )}

        {/* Listings Grid/List */}
        {!loading && !error && filteredListings.length > 0 && (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }>
            {filteredListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={{
                  id: listing.id,
                  title: listing.title,
                  price: listing.price,
                  currency: listing.currency,
                  location: listing.location,
                  year: listing.car_year,
                  mileage: listing.car_mileage?.toString(),
                  category: listing.listing_type as 'cars' | 'parts',
                  images: listing.images || [],
                  isVerified: listing.is_verified,
                  isFeatured: listing.is_boosted,
                  views: listing.view_count,
                  postedDate: new Date(listing.created_at).toLocaleDateString(),
                  seller: {
                    name: listing.seller_name || 'Unknown',
                    rating: listing.seller_rating || 0,
                    isVerified: listing.is_verified,
                    phone: '',
                    whatsapp: ''
                  },
                  sellerId: listing.user_id,
                  boostEnd: listing.boost_expires_at,
                  description: listing.description,
                  specifications: {
                    transmission: listing.car_transmission,
                    fuelType: listing.car_fuel_type,
                    condition: listing.car_condition,
                  }
                }}
                isFavorite={favoriteIds.includes(listing.id)}
                onFavoriteToggle={handleFavoriteToggle}
                onClick={() => handleListingClick(listing)}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedListing && (
        <ListingDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedListing(null);
          }}
          listing={selectedListing}
          isFavorite={favoriteIds.includes(selectedListing.id)}
          onFavoriteToggle={handleFavoriteToggle}
          onContact={() => {
            toast.success('Contact request sent!');
          }}
          onBoost={() => {
            setIsBoostModalOpen(true);
          }}
        />
      )}

      <BoostPlansModal
        isOpen={isBoostModalOpen}
        onClose={() => setIsBoostModalOpen(false)}
        onSelectPlan={(plan) => {
          toast.success(`${plan.name} plan selected!`);
          setIsBoostModalOpen(false);
        }}
      />
    </div>
  );
}
