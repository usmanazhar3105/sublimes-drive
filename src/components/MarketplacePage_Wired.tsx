/**
 * MarketplacePage - Wired with Supabase Hooks
 * 
 * This version replaces mock data with real database hooks
 * Uses: useListings, useRole, useAnalytics
 */

import { useState, useEffect } from 'react';
import { ListingCard } from './ListingCard';
import { ListingDetailModal } from './ListingDetailModal';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, Filter, Plus, SlidersHorizontal, List, X, ArrowUpDown, TrendingUp, TrendingDown, LayoutGrid, Loader2 } from 'lucide-react';
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
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedModel, setSelectedModel] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [location, setLocation] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [yearRange, setYearRange] = useState([2000, 2024]);
  const [mileageMax, setMileageMax] = useState(200000);
  const [condition, setCondition] = useState<string[]>([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [showMyListings, setShowMyListings] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isBoostModalOpen, setIsBoostModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // 🔥 SUPABASE HOOKS - Replace mock data
  const { listings, loading, error, createListing, refetch } = useListings({
    brand: selectedBrand !== 'all' ? selectedBrand : undefined,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    minYear: yearRange[0],
    maxYear: yearRange[1],
    query: searchQuery,
  });

  const { profile, isAdmin } = useRole();
  const analytics = useAnalytics();

  // Track page view
  useEffect(() => {
    analytics.trackPageView('/marketplace');
  }, []);

  // Filter options
  const categories = ['all', 'cars', 'parts'];
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

  // Client-side filtering (in addition to server-side)
  const filteredListings = listings
    .filter(listing => {
      if (selectedCategory !== 'all' && listing.category !== selectedCategory) return false;
      if (location !== 'all' && listing.city !== location) return false;
      if (verifiedOnly && !listing.seller?.isVerified) return false;
      if (featuredOnly && !listing.isFeatured) return false;
      if (showMyListings && listing.seller_id !== profile?.id) return false;
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
    analytics.trackEvent('listing_favorited', { listing_id: id });
  };

  const handleBoostListing = (listing: any) => {
    setSelectedListing(listing);
    setIsBoostModalOpen(true);
  };

  const handleOpenDetail = (listing: any) => {
    setSelectedListing(listing);
    setIsDetailModalOpen(true);
    analytics.trackListingViewed(listing.id);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedBrand('all');
    setSelectedModel('all');
    setPriceRange([0, 1000000]);
    setLocation('all');
    setSortBy('newest');
    setYearRange([2000, 2024]);
    setMileageMax(200000);
    setCondition([]);
    setVerifiedOnly(false);
    setFeaturedOnly(false);
  };

  const activeFiltersCount = [
    searchQuery !== '',
    selectedCategory !== 'all',
    selectedBrand !== 'all',
    location !== 'all',
    verifiedOnly,
    featuredOnly,
    condition.length > 0,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#0B1426]">
      {/* Header Section */}
      <div className="bg-[#0F1829] border-b border-[#1A2332]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Title Row */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl text-[#E8EAED] mb-2">Marketplace</h1>
              <p className="text-sm text-[#8B92A7]">
                {loading ? 'Loading...' : `${filteredListings.length} listings found`}
              </p>
            </div>
            
            {profile && (
              <Button
                onClick={() => onNavigate?.('create-listing')}
                className="bg-[#D4AF37] hover:bg-[#C19B2E] text-[#0B1426] gap-2"
              >
                <Plus size={20} />
                Create Listing
              </Button>
            )}
          </div>

          {/* Search and Filter Bar */}
          <div className="flex gap-3 items-center">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B92A7]" size={20} />
              <Input
                placeholder="Search by title, brand, or model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#1A2332] border-[#2A3342] text-[#E8EAED] placeholder:text-[#8B92A7]"
              />
            </div>

            {/* Quick Filters */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-32 bg-[#1A2332] border-[#2A3342] text-[#E8EAED]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1A2332] border-[#2A3342]">
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat} className="text-[#E8EAED]">
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger className="w-40 bg-[#1A2332] border-[#2A3342] text-[#E8EAED]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1A2332] border-[#2A3342] max-h-80">
                {brands.map(brand => (
                  <SelectItem key={brand} value={brand} className="text-[#E8EAED]">
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Advanced Filters Button */}
            <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="bg-[#1A2332] border-[#2A3342] text-[#E8EAED] hover:bg-[#2A3342] gap-2"
                >
                  <SlidersHorizontal size={20} />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge className="bg-[#D4AF37] text-[#0B1426] ml-1">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96 bg-[#1A2332] border-[#2A3342] text-[#E8EAED]" align="end">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Advanced Filters</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResetFilters}
                      className="text-[#D4AF37] hover:text-[#C19B2E]"
                    >
                      Reset All
                    </Button>
                  </div>
                  
                  <Separator className="bg-[#2A3342]" />

                  {/* Price Range */}
                  <div>
                    <label className="text-sm mb-2 block">Price Range (AED)</label>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      min={0}
                      max={1000000}
                      step={10000}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-xs text-[#8B92A7]">
                      <span>{priceRange[0].toLocaleString()}</span>
                      <span>{priceRange[1].toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="text-sm mb-2 block">Location</label>
                    <Select value={location} onValueChange={setLocation}>
                      <SelectTrigger className="bg-[#0F1829] border-[#2A3342]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1A2332] border-[#2A3342]">
                        {locations.map(loc => (
                          <SelectItem key={loc} value={loc} className="text-[#E8EAED]">
                            {loc.charAt(0).toUpperCase() + loc.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Checkboxes */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="verified"
                        checked={verifiedOnly}
                        onCheckedChange={(checked) => setVerifiedOnly(checked as boolean)}
                      />
                      <label htmlFor="verified" className="text-sm cursor-pointer">
                        Verified Sellers Only
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="featured"
                        checked={featuredOnly}
                        onCheckedChange={(checked) => setFeaturedOnly(checked as boolean)}
                      />
                      <label htmlFor="featured" className="text-sm cursor-pointer">
                        Featured Listings Only
                      </label>
                    </div>
                    {profile && (
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="my-listings"
                          checked={showMyListings}
                          onCheckedChange={(checked) => setShowMyListings(checked as boolean)}
                        />
                        <label htmlFor="my-listings" className="text-sm cursor-pointer">
                          My Listings Only
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Sort Dropdown */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48 bg-[#1A2332] border-[#2A3342] text-[#E8EAED]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1A2332] border-[#2A3342]">
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value} className="text-[#E8EAED]">
                    <div className="flex items-center gap-2">
                      <option.icon size={16} />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* View Toggle */}
            <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin mb-4" />
            <p className="text-[#8B92A7]">Loading listings...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="bg-red-500/10 border-red-500 mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <X className="text-red-400 mt-1" size={20} />
                <div>
                  <h3 className="text-red-400 font-semibold mb-1">Error Loading Listings</h3>
                  <p className="text-sm text-red-300">{error.message}</p>
                  <Button
                    onClick={() => refetch()}
                    variant="outline"
                    size="sm"
                    className="mt-3 border-red-400 text-red-400 hover:bg-red-400/10"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !error && filteredListings.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl text-[#E8EAED] mb-2">No listings found</h3>
            <p className="text-[#8B92A7] mb-6">
              Try adjusting your filters or search query
            </p>
            <Button
              onClick={handleResetFilters}
              variant="outline"
              className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10"
            >
              Reset Filters
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
            isFavorite={favoriteIds.includes(selectedListing.id)}
            onToggleFavorite={() => toggleFavorite(selectedListing.id)}
            onNavigate={onNavigate}
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
