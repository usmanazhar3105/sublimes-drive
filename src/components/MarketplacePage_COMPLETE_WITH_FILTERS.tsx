/**
 * MarketplacePage_COMPLETE_WITH_FILTERS - Full marketplace with all filters from screenshot
 * Including: Origin country, Verified vendors, Overseas listings
 */

import { useState, useEffect } from 'react';
import { ListingCard } from './ListingCard';
import { ListingDetailModal } from './ListingDetailModal';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, Filter, Plus, SlidersHorizontal, X, ArrowUpDown, TrendingUp, TrendingDown, LayoutGrid, List as ListIcon, Loader2, AlertCircle, Globe, Shield, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Slider } from './ui/slider';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import { toast } from 'sonner';

// Import hooks
import { useMarketplaceListings } from '../hooks/useMarketplaceListings';
import { useRole } from '../hooks';
import { chineseCarBrands } from '../utils/chineseCarData';

interface MarketplacePageProps {
  onNavigate?: (page: string) => void;
}

export function MarketplacePage({ onNavigate }: MarketplacePageProps) {
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedOriginCountry, setSelectedOriginCountry] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [overseasOnly, setOverseasOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  // Modal states
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Hooks
  const { profile, isAdmin } = useRole();
  
  const { 
    listings, 
    loading, 
    error, 
    diagnostics,
    refetch,
  } = useMarketplaceListings({
    listing_type: selectedType !== 'all' ? selectedType : undefined,
    brand: selectedBrand !== 'all' ? selectedBrand : undefined,
    location: selectedLocation !== 'all' ? selectedLocation : undefined,
    origin_country: selectedOriginCountry !== 'all' ? selectedOriginCountry : undefined,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    verified_only: verifiedOnly,
    overseas_only: overseasOnly,
    isAdmin: isAdmin,
  });

  // Filter options
  const brands = ['all', ...chineseCarBrands.map(b => b.name)];
  
  const uaeLocations = [
    'all', 'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 
    'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'
  ];

  const countries = [
    'China', 'Oman', 'Saudi Arabia', 'Bahrain', 'Qatar', 'Kuwait',
    'USA', 'Korea', 'Canada', 'Europe', 'Africa', 'Other'
  ];

  const listingTypes = [
    { value: 'all', label: 'All Items' },
    { value: 'car', label: 'Cars' },
    { value: 'part', label: 'Parts' },
    { value: 'accessory', label: 'Accessories' },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most Popular' },
  ];

  // Filter and sort listings
  const filteredListings = listings
    .filter(listing => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          listing.title?.toLowerCase().includes(query) ||
          listing.make?.toLowerCase().includes(query) ||
          listing.model?.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'price_low':
          return (a.price || 0) - (b.price || 0);
        case 'price_high':
          return (b.price || 0) - (a.price || 0);
        case 'popular':
          return (b.views || 0) - (a.views || 0);
        default:
          return 0;
      }
    });

  // Categorize listings
  const featuredListings = filteredListings.filter(l => l.is_featured);
  const carListings = filteredListings.filter(l => l.listing_type === 'car');
  const partListings = filteredListings.filter(l => l.listing_type === 'part');

  // Handle listing click - open detail modal
  const handleListingClick = (listing: any) => {
    setSelectedListing(listing);
    setIsDetailModalOpen(true);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedBrand('all');
    setSelectedLocation('all');
    setSelectedOriginCountry('all');
    setPriceRange([0, 1000000]);
    setVerifiedOnly(false);
    setOverseasOnly(false);
    setSortBy('newest');
  };

  const activeFiltersCount = [
    selectedType !== 'all',
    selectedBrand !== 'all',
    selectedLocation !== 'all',
    selectedOriginCountry !== 'all',
    verifiedOnly,
    overseasOnly,
    priceRange[0] > 0 || priceRange[1] < 1000000,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#0B1426] pb-20 lg:pb-8">
      {/* Header */}
      <div className="bg-[#1A1F2E] border-b border-[#2A3441] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-[#E8EAED] text-2xl">Marketplace</h1>
              <p className="text-[#8A92A6] text-sm">
                Buy and sell cars, parts, and accessories
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => onNavigate?.('my-listings')}
                variant="outline"
                className="border-[#2A3441] text-[#8A92A6] hover:bg-[#1A1F2E]"
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                My Listings
              </Button>
              <Button
                onClick={() => onNavigate?.('place-ad')}
                className="bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Post Ad
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Featured Carousel - Show if there are featured listings */}
        {featuredListings.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Badge className="bg-[#D4AF37] text-black">
                <TrendingUp className="h-3 w-3 mr-1" />
                Featured
              </Badge>
              <h2 className="text-[#E8EAED]">Featured Marketplace</h2>
            </div>
            <Carousel className="w-full" opts={{ loop: true, align: "start" }}>
              <CarouselContent>
                {featuredListings.map((listing) => (
                  <CarouselItem key={listing.id} className="md:basis-1/2 lg:basis-1/4">
                    <ListingCard
                      listing={listing}
                      onClick={() => handleListingClick(listing)}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-0 -translate-x-1/2 bg-[#1A1F2E] border-[#2A3441] text-[#E8EAED] hover:bg-[#2A3441]" />
              <CarouselNext className="right-0 translate-x-1/2 bg-[#1A1F2E] border-[#2A3441] text-[#E8EAED] hover:bg-[#2A3441]" />
            </Carousel>
          </div>
        )}

        {/* Search and Filters Bar */}
        <div className="bg-[#1A1F2E] rounded-lg border border-[#2A3441] p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#8A92A6]" />
              <Input
                placeholder="Search cars, parts, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#0B1426] border-[#2A3441] text-[#E8EAED]"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex gap-2 flex-wrap lg:flex-nowrap">
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger className="bg-[#0B1426] border-[#2A3441] text-[#E8EAED] w-full lg:w-[160px]">
                  <SelectValue placeholder="All Brands" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1F2E] border-[#2A3441]">
                  {brands.map((brand) => (
                    <SelectItem key={brand} value={brand} className="text-[#E8EAED]">
                      {brand === 'all' ? 'All Brands' : brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="bg-[#0B1426] border-[#2A3441] text-[#E8EAED] w-full lg:w-[160px]">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1F2E] border-[#2A3441]">
                  {uaeLocations.map((location) => (
                    <SelectItem key={location} value={location} className="text-[#E8EAED]">
                      {location === 'all' ? 'All Locations' : location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className="border-[#2A3441] text-[#E8EAED] hover:bg-[#2A3441]"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge className="ml-2 bg-[#D4AF37] text-black">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Expanded Filters */}
          {isFiltersOpen && (
            <div className="mt-4 pt-4 border-t border-[#2A3441] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[#E8EAED]">Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="text-[#D4AF37] hover:bg-[#D4AF37]/10"
                >
                  Reset All
                </Button>
              </div>

              {/* Origin Filter - UAE button or Other countries dropdown */}
              <div>
                <label className="text-[#E8EAED] text-sm mb-2 block flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Origin
                </label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={selectedOriginCountry === 'UAE' ? 'default' : 'outline'}
                    onClick={() => setSelectedOriginCountry('UAE')}
                    className={selectedOriginCountry === 'UAE'
                      ? 'bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90 flex-1'
                      : 'border-[#2A3441] text-[#8A92A6] hover:bg-[#2A3441] flex-1'
                    }
                  >
                    🇦🇪 UAE
                  </Button>
                  <Select 
                    value={selectedOriginCountry !== 'UAE' && selectedOriginCountry !== 'all' ? selectedOriginCountry : 'other'} 
                    onValueChange={(value) => {
                      if (value !== 'other') {
                        setSelectedOriginCountry(value);
                      }
                    }}
                  >
                    <SelectTrigger className={`${selectedOriginCountry !== 'UAE' && selectedOriginCountry !== 'all' ? 'bg-[#D4AF37] text-black border-[#D4AF37]' : 'bg-[#0B1426] border-[#2A3441] text-[#E8EAED]'} flex-1`}>
                      <SelectValue placeholder="🌍 Other" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1F2E] border-[#2A3441]">
                      {countries.map((country) => (
                        <SelectItem key={country} value={country} className="text-[#E8EAED]">
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Verified Vendors Only */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="verifiedOnly"
                  checked={verifiedOnly}
                  onCheckedChange={(checked) => setVerifiedOnly(checked as boolean)}
                  className="border-[#2A3441]"
                />
                <label htmlFor="verifiedOnly" className="text-[#E8EAED] cursor-pointer flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  Verified Vendors Only
                </label>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-[#E8EAED] text-sm mb-2 block">
                  Price Range: {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()} AED
                </label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  min={0}
                  max={1000000}
                  step={10000}
                  className="mt-2"
                />
              </div>
            </div>
          )}
        </div>

        {/* Sort and View Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-[#1A1F2E] border-[#2A3441] text-[#E8EAED] w-[180px]">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1F2E] border-[#2A3441]">
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-[#E8EAED]">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="hidden lg:flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid'
                  ? 'bg-[#D4AF37] text-black'
                  : 'border-[#2A3441] text-[#8A92A6]'
                }
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list'
                  ? 'bg-[#D4AF37] text-black'
                  : 'border-[#2A3441] text-[#8A92A6]'
                }
              >
                <ListIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <p className="text-[#8A92A6] text-sm">
            Showing {filteredListings.length} results
          </p>
        </div>

        {/* Tabs for Categories */}
        <Tabs value={selectedType} onValueChange={setSelectedType} className="mb-6">
          <TabsList className="bg-[#1A1F2E] border border-[#2A3441] w-full lg:w-auto">
            <TabsTrigger 
              value="all"
              className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black"
            >
              All Items ({filteredListings.length})
            </TabsTrigger>
            <TabsTrigger 
              value="car"
              className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black"
            >
              Cars ({carListings.length})
            </TabsTrigger>
            <TabsTrigger 
              value="part"
              className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black"
            >
              Parts ({partListings.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Listings Grid/List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37] mb-4" />
            <p className="text-[#8A92A6]">Loading listings...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
            <p className="text-[#E8EAED] mb-2">Failed to load listings</p>
            <p className="text-[#8A92A6] text-sm mb-4">{error}</p>
            <Button onClick={refetch} variant="outline" className="border-[#2A3441] text-[#8A92A6]">
              Try Again
            </Button>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-[#E8EAED] mb-2">No listings found</p>
            <p className="text-[#8A92A6] text-sm mb-4">
              Try adjusting your filters or search query
            </p>
            <Button onClick={resetFilters} variant="outline" className="border-[#2A3441] text-[#8A92A6]">
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'
              : 'space-y-4'
          }>
            {filteredListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onClick={() => handleListingClick(listing)}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>

      {/* Listing Detail Modal */}
      <ListingDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedListing(null);
        }}
        listing={selectedListing}
      />
    </div>
  );
}
