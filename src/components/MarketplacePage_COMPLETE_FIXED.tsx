/**
 * MarketplacePage - Complete with Featured Section and Fixed Filters
 * 
 * Features:
 * - Featured listings carousel at top
 * - Category filter: ONLY Cars and Car Parts & Accessories
 * - Full Supabase integration
 * - Mobile responsive
 */

import { useState, useEffect } from 'react';
import { ListingCard } from './ListingCard';
import { ListingDetailModal } from './ListingDetailModal';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, Filter, Plus, SlidersHorizontal, List, X, ArrowUpDown, TrendingUp, TrendingDown, LayoutGrid, Loader2, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Slider } from './ui/slider';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { ViewToggle } from './ui/ViewToggle';
import { FeaturedRibbon } from './ui/FeaturedRibbon';
import { BoostPlansModal } from './ui/BoostPlansModal';
import { toast } from 'sonner';

// Import Supabase hooks
import { useListings } from '../hooks';
import { useRole } from '../hooks';
import { useAnalytics } from '../hooks';

interface MarketplacePageProps {
  onNavigate?: (page: string) => void;
}

export function MarketplacePage({ onNavigate }: MarketplacePageProps) {
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'cars' | 'parts'>('cars');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedModel, setSelectedModel] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [location, setLocation] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [yearRange, setYearRange] = useState([2000, 2024]);
  const [mileageMax, setMileageMax] = useState(200000);
  const [condition, setCondition] = useState<string[]>([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [showMyListings, setShowMyListings] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isBoostModalOpen, setIsBoostModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [featuredCarouselIndex, setFeaturedCarouselIndex] = useState(0);

  // 🔥 SUPABASE HOOKS - Replace mock data
  const { listings = [], loading, error, createListing, refetch } = useListings({
    brand: selectedBrand !== 'all' ? selectedBrand : undefined,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    minYear: yearRange[0],
    maxYear: yearRange[1],
    query: searchQuery,
  }) || { listings: [], loading: false, error: null, createListing: async () => {}, refetch: () => {} };

  const { profile, isAdmin } = useRole() || { profile: null, isAdmin: false };
  const analytics = useAnalytics() || { trackPageView: () => {}, trackEvent: () => {}, trackListingViewed: () => {} };

  // Track page view
  useEffect(() => {
    if (analytics?.trackPageView) {
      analytics.trackPageView('/marketplace');
    }
  }, []);

  // Chinese car brands (for Chinese car app)
  const brands = [
    'all', 'BYD', 'Hongqi', 'Bestune', 'MG', 'Haval', 'Foton', 'Geely', 'Xpeng', 'Jaecoo', 'Zeekr', 
    'Jetour', 'Jac', 'GAC', 'BAIC', 'Great Wall', 'Chery', 'Skywell', 'Riddara', 'NIO', 'Tank', 
    'Roewe', 'Li Auto', 'Kaiyi', 'Dongfeng', 'Omoda', 'Soueast', 'VGV', 'Seres', 'Avatr', 
    'Forthing', 'Changan', 'Maxus', 'Exeed', 'Other'
  ];

  const modelsByBrand: Record<string, string[]> = {
    'BYD': ['all', 'Atto 3', 'Han', 'Qin Plus', 'Seal', 'Sealion 7', 'Song Plus'],
    'Hongqi': ['all', 'E-HS9', 'E-QM5', 'H5', 'H9', 'HS3', 'HS5'],
    'MG': ['all', '3', '4', '5', '7', 'GT', 'HS', 'One', 'RX5', 'RX8', 'RX9', 'ZS'],
    'Haval': ['all', 'Dargo', 'H6', 'H6 GT', 'Jolion'],
    // Add more as needed
  };

  const locations = ['all', 'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'];
  const conditionOptions = ['New', 'Like New', 'Good', 'Fair', 'Needs Repair'];

  const sortOptions = [
    { value: 'newest', label: 'Newest First', icon: TrendingUp },
    { value: 'oldest', label: 'Oldest First', icon: TrendingDown },
    { value: 'price_low', label: 'Price: Low to High', icon: ArrowUpDown },
    { value: 'price_high', label: 'Price: High to Low', icon: ArrowUpDown },
    { value: 'popular', label: 'Most Popular', icon: TrendingUp },
  ];

  // Filter featured and regular listings
  const featuredListings = listings.filter(listing => listing.is_featured || listing.isFeatured);
  
  // Client-side filtering (in addition to server-side)
  const filteredListings = listings
    .filter(listing => {
      // Category filter
      if (selectedCategory === 'cars') {
        if (listing.listing_type !== 'car' && listing.category !== 'cars') return false;
      } else if (selectedCategory === 'parts') {
        if (!['part', 'accessory'].includes(listing.listing_type) && 
            !['parts', 'accessories'].includes(listing.category)) return false;
      }
      
      if (location !== 'all' && listing.city !== location && listing.location !== location) return false;
      if (verifiedOnly && !listing.seller?.isVerified && !listing.is_verified) return false;
      if (showMyListings && listing.seller_id !== profile?.id) return false;
      
      // Don't show featured in regular list
      if (listing.is_featured || listing.isFeatured) return false;
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'price_low':
          return a.price - b.price;
        case 'price_high':
          return b.price - a.price;
        default:
          return 0;
      }
    });

  const toggleFavorite = (id: string) => {
    setFavoriteIds(prev =>
      prev.includes(id)
        ? prev.filter(favId => favId !== id)
        : [...prev, id]
    );
    if (analytics?.trackEvent) {
      analytics.trackEvent('listing_favorited', { listing_id: id });
    }
  };

  const handleBoostListing = (listing: any) => {
    setSelectedListing(listing);
    setIsBoostModalOpen(true);
  };

  const handleOpenDetail = (listing: any) => {
    setSelectedListing(listing);
    setIsDetailModalOpen(true);
    if (analytics?.trackListingViewed) {
      analytics.trackListingViewed(listing.id);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('cars');
    setSelectedBrand('all');
    setSelectedModel('all');
    setPriceRange([0, 1000000]);
    setLocation('all');
    setSortBy('newest');
    setYearRange([2000, 2024]);
    setMileageMax(200000);
    setCondition([]);
    setVerifiedOnly(false);
  };

  const activeFiltersCount = [
    searchQuery !== '',
    selectedBrand !== 'all',
    location !== 'all',
    verifiedOnly,
    condition.length > 0,
  ].filter(Boolean).length;

  // Featured carousel navigation
  const nextFeatured = () => {
    setFeaturedCarouselIndex((prev) => 
      prev === featuredListings.length - 1 ? 0 : prev + 1
    );
  };

  const prevFeatured = () => {
    setFeaturedCarouselIndex((prev) => 
      prev === 0 ? featuredListings.length - 1 : prev - 1
    );
  };

  return (
    <div className="min-h-screen bg-[#0B1426]">
      {/* Header Section */}
      <div className="bg-[#0F1829] border-b border-[#1A2332]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Title Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl text-[#E8EAED] mb-2">Marketplace</h1>
              <p className="text-sm text-[#8B92A7]">
                Buy and sell cars, parts, and accessories
              </p>
            </div>
            
            <div className="flex gap-3 w-full sm:w-auto">
              <Button
                onClick={() => onNavigate?.('my-listings')}
                variant="outline"
                className="flex-1 sm:flex-none border-[#1A2332] bg-transparent text-[#E8EAED] hover:bg-[#1A2332]"
              >
                My Listings
              </Button>
              {profile && (
                <Button
                  onClick={() => onNavigate?.('place-ad')}
                  className="flex-1 sm:flex-none bg-[#D4AF37] hover:bg-[#C19B2E] text-[#0B1426] gap-2"
                >
                  <Plus size={20} />
                  Post Ad
                </Button>
              )}
            </div>
          </div>

          {/* Search and Category Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B92A7]" size={20} />
              <Input
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#0B1426] border-[#1A2332] text-[#E8EAED] placeholder:text-[#8B92A7]"
              />
            </div>

            {/* Category Dropdown - ONLY Cars and Parts & Accessories */}
            <Select value={selectedCategory} onValueChange={(value: 'cars' | 'parts') => setSelectedCategory(value)}>
              <SelectTrigger className="w-full sm:w-[200px] bg-[#0B1426] border-[#1A2332] text-[#E8EAED]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0F1829] border-[#1A2332]">
                <SelectItem value="cars" className="text-[#E8EAED]">
                  🚗 Cars
                </SelectItem>
                <SelectItem value="parts" className="text-[#E8EAED]">
                  🔧 Car Parts & Accessories
                </SelectItem>
              </SelectContent>
            </Select>

            {/* View Toggle - Desktop Only */}
            <div className="hidden md:block">
              <ViewToggle 
                viewMode={viewMode} 
                onViewModeChange={setViewMode}
              />
            </div>

            {/* Filters Button */}
            <Button
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              variant="outline"
              className="border-[#1A2332] bg-[#0B1426] text-[#E8EAED] hover:bg-[#1A2332]"
            >
              <SlidersHorizontal size={20} className="mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge className="ml-2 bg-[#D4AF37] text-[#0B1426]">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Advanced Filters Panel */}
          {isFiltersOpen && (
            <Card className="mt-4 bg-[#0B1426] border-[#1A2332]">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Brand Filter */}
                  <div>
                    <label className="text-sm text-[#8B92A7] mb-2 block">Brand</label>
                    <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                      <SelectTrigger className="bg-[#0F1829] border-[#1A2332] text-[#E8EAED]">
                        <SelectValue placeholder="All Brands" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0F1829] border-[#1A2332] max-h-[300px]">
                        {brands.map(brand => (
                          <SelectItem key={brand} value={brand} className="text-[#E8EAED]">
                            {brand === 'all' ? 'All Brands' : brand}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Location Filter */}
                  <div>
                    <label className="text-sm text-[#8B92A7] mb-2 block">Location</label>
                    <Select value={location} onValueChange={setLocation}>
                      <SelectTrigger className="bg-[#0F1829] border-[#1A2332] text-[#E8EAED]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0F1829] border-[#1A2332]">
                        {locations.map(loc => (
                          <SelectItem key={loc} value={loc} className="text-[#E8EAED]">
                            {loc === 'all' ? 'All Locations' : loc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="text-sm text-[#8B92A7] mb-2 block">Sort By</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="bg-[#0F1829] border-[#1A2332] text-[#E8EAED]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0F1829] border-[#1A2332]">
                        {sortOptions.map(option => (
                          <SelectItem key={option.value} value={option.value} className="text-[#E8EAED]">
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Verified Only */}
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={verifiedOnly}
                        onCheckedChange={(checked) => setVerifiedOnly(checked as boolean)}
                        className="border-[#1A2332] data-[state=checked]:bg-[#D4AF37] data-[state=checked]:border-[#D4AF37]"
                      />
                      <span className="text-sm text-[#E8EAED]">Verified Only</span>
                    </label>
                  </div>
                </div>

                {/* Reset Button */}
                {activeFiltersCount > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#1A2332]">
                    <Button
                      onClick={handleResetFilters}
                      variant="outline"
                      size="sm"
                      className="border-[#1A2332] text-[#E8EAED] hover:bg-[#1A2332]"
                    >
                      <X size={16} className="mr-2" />
                      Reset Filters
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Featured Marketplace Section */}
        {featuredListings.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Star className="text-[#D4AF37]" size={24} fill="#D4AF37" />
                <h2 className="text-xl text-[#E8EAED]">Featured Marketplace</h2>
              </div>
              {featuredListings.length > 3 && (
                <div className="flex gap-2">
                  <Button
                    onClick={prevFeatured}
                    variant="outline"
                    size="sm"
                    className="border-[#1A2332] bg-[#0F1829] text-[#E8EAED] hover:bg-[#1A2332]"
                  >
                    <ChevronLeft size={20} />
                  </Button>
                  <Button
                    onClick={nextFeatured}
                    variant="outline"
                    size="sm"
                    className="border-[#1A2332] bg-[#0F1829] text-[#E8EAED] hover:bg-[#1A2332]"
                  >
                    <ChevronRight size={20} />
                  </Button>
                </div>
              )}
            </div>

            {/* Featured Carousel */}
            <div className="relative overflow-hidden">
              <div 
                className="flex transition-transform duration-300 ease-in-out gap-4"
                style={{ 
                  transform: `translateX(-${featuredCarouselIndex * (100 / Math.min(3, featuredListings.length))}%)` 
                }}
              >
                {featuredListings.map((listing) => (
                  <div 
                    key={listing.id} 
                    className="flex-shrink-0 w-full sm:w-1/2 lg:w-1/3"
                  >
                    <div className="relative">
                      <Badge className="absolute top-4 left-4 z-10 bg-[#D4AF37] text-[#0B1426]">
                        ⭐ Featured
                      </Badge>
                      <ListingCard
                        listing={listing}
                        isFavorite={favoriteIds.includes(listing.id)}
                        onToggleFavorite={() => toggleFavorite(listing.id)}
                        onBoost={() => handleBoostListing(listing)}
                        onClick={() => handleOpenDetail(listing)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* All Listings Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl text-[#E8EAED]">
              All Listings ({filteredListings.length})
            </h2>
            
            {/* Mobile View Toggle */}
            <div className="md:hidden">
              <ViewToggle 
                viewMode={viewMode} 
                onViewModeChange={setViewMode}
              />
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-[#D4AF37]" size={40} />
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card className="bg-[#0F1829] border-[#1A2332] p-8 text-center">
              <p className="text-[#E8EAED] mb-4">Failed to load listings</p>
              <Button onClick={() => refetch()} className="bg-[#D4AF37] hover:bg-[#C19B2E] text-[#0B1426]">
                Retry
              </Button>
            </Card>
          )}

          {/* Listings Grid/List */}
          {!loading && !error && (
            <>
              {filteredListings.length === 0 ? (
                <Card className="bg-[#0F1829] border-[#1A2332] p-8 text-center">
                  <p className="text-[#8B92A7] mb-4">No listings found</p>
                  <Button 
                    onClick={handleResetFilters}
                    variant="outline"
                    className="border-[#1A2332] text-[#E8EAED] hover:bg-[#1A2332]"
                  >
                    Clear Filters
                  </Button>
                </Card>
              ) : (
                <div className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'
                    : 'flex flex-col gap-4'
                }>
                  {filteredListings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      isFavorite={favoriteIds.includes(listing.id)}
                      onToggleFavorite={() => toggleFavorite(listing.id)}
                      onBoost={() => handleBoostListing(listing)}
                      onClick={() => handleOpenDetail(listing)}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedListing && (
        <>
          <ListingDetailModal
            listing={selectedListing}
            isOpen={isDetailModalOpen}
            onClose={() => {
              setIsDetailModalOpen(false);
              setSelectedListing(null);
            }}
          />
          <BoostPlansModal
            isOpen={isBoostModalOpen}
            onClose={() => {
              setIsBoostModalOpen(false);
              setSelectedListing(null);
            }}
            listingId={selectedListing.id}
            listingTitle={selectedListing.title}
          />
        </>
      )}
    </div>
  );
}
