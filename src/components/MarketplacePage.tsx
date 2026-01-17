import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner';
import { ListingCard } from './ListingCard';
import { ListingDetailModal } from './ListingDetailModal';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, Filter, Plus, SlidersHorizontal, List, X, ArrowUpDown, TrendingUp, TrendingDown, LayoutGrid } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Slider } from './ui/slider';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { ViewToggle } from './ui/ViewToggle';
import { FeaturedRibbon } from './ui/FeaturedRibbon';
import { BoostPlansModal } from './ui/BoostPlansModal';

interface MarketplacePageProps {
  onNavigate?: (page: string) => void;
}

export function MarketplacePage({ onNavigate }: MarketplacePageProps) {
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

  // Mock current user ID - this should come from auth context
  const currentUserId = 'user123';

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
    'Bestune': ['all', 'B70', 'T77', 'T99'],
    'MG': ['all', '3', '4', '5', '7', 'GT', 'HS', 'One', 'RX5', 'RX8', 'RX9', 'ZS'],
    'Haval': ['all', 'Dargo', 'H6', 'H6 GT', 'Jolion'],
    'Foton': ['all', 'Aumark', 'Tunland'],
    'Geely': ['all', 'Coolray', 'Emgrand', 'Monjaro', 'Tugella', 'Starray', 'Geometry A', 'Geometry C'],
    'Xpeng': ['all', 'G6', 'G9', 'X9'],
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

  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real listings from database
  useEffect(() => {
    fetchListings();
  }, [selectedCategory, sortBy]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('market_listings')
        .select('*')
        .eq('status', 'approved');

      if (selectedCategory !== 'all') {
        query = query.eq('listing_type', selectedCategory === 'cars' ? 'car' : 'part');
      }

      if (sortBy === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'oldest') {
        query = query.order('created_at', { ascending: true });
      } else if (sortBy === 'price_low') {
        query = query.order('price', { ascending: true });
      } else if (sortBy === 'price_high') {
        query = query.order('price', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      setListings(data || []);
    } catch (error: any) {
      console.error('Error fetching listings:', error);
      toast.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  // Sample listings data (fallback)
  const sampleListings = [
    {
      id: '1',
      title: '2023 BYD Atto 3 - Extended Range',
      price: 89000,
      currency: 'AED',
      location: 'Dubai',
      year: 2023,
      mileage: '12,500',
      category: 'cars' as const,
      images: [
        'https://images.unsplash.com/photo-1647340764627-11713b9d0f65?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjYXIlMjBkZWFsZXJzaGlwJTIwc2hvd3Jvb218ZW58MXx8fHwxNzU4NDQyNTg4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop'
      ],
      isVerified: true,
      isFeatured: true,
      views: 1247,
      postedDate: '2 days ago',
      seller: {
        name: 'Premium Motors',
        rating: 4.8,
        isVerified: true,
        phone: '+971501234567',
        whatsapp: '+971501234567'
      },
      sellerId: 'seller1',
      boostEnd: '2024-03-20T10:00:00Z',
      description: 'Excellent condition BYD Atto 3 with extended range battery. Single owner, full service history, and under warranty. This electric SUV offers impressive range and modern features.',
      specifications: {
        transmission: 'Automatic',
        fuelType: 'Electric',
        bodyType: 'SUV',
        color: 'Pearl White',
        condition: 'Excellent'
      }
    },
    {
      id: '2',
      title: 'Performance Exhaust System - Universal Fit',
      price: 3500,
      currency: 'AED',
      location: 'Abu Dhabi',
      category: 'parts' as const,
      images: [
        'https://images.unsplash.com/photo-1752959805242-0a7799902ae4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBjYXIlMjBwYXJ0cyUyMGF1dG9tb3RpdmV8ZW58MXx8fHwxNzU4NTQ0Mzk1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&h=600&fit=crop'
      ],
      isVerified: true,
      views: 456,
      postedDate: '1 week ago',
      seller: {
        name: 'Auto Parts Hub',
        rating: 4.5,
        isVerified: true,
        phone: '+971501234568',
        whatsapp: '+971501234568'
      },
      sellerId: 'seller2',
      isFeatured: true,
      boostEnd: '2024-03-25T15:30:00Z',
      description: 'High-performance stainless steel exhaust system with improved flow dynamics. Universal fit for most Chinese car models. Brand new with 2-year warranty.',
      specifications: {
        condition: 'New'
      }
    },
    {
      id: '3',
      title: '2023 NIO ET7 Performance Edition - Low Mileage',
      price: 420000,
      currency: 'AED',
      location: 'Dubai',
      year: 2022,
      mileage: '8,900',
      category: 'cars' as const,
      images: ['https://images.unsplash.com/photo-1647340764627-11713b9d0f65?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjYXIlMjBkZWFsZXJzaGlwJTIwc2hvd3Jvb218ZW58MXx8fHwxNzU4NDQyNTg4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'],
      isVerified: true,
      views: 892,
      postedDate: '3 days ago',
      seller: {
        name: 'Elite Car Gallery',
        rating: 4.9,
        isVerified: true
      },
      isFeatured: true,
      boostEnd: '2024-03-18T20:00:00Z'
    },
    {
      id: '4',
      title: 'Carbon Fiber Hood - BYD Seal Performance',
      price: 8500,
      currency: 'AED',
      location: 'Sharjah',
      category: 'parts' as const,
      images: ['https://images.unsplash.com/photo-1752959805242-0a7799902ae4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBjYXIlMjBwYXJ0cyUyMGF1dG9tb3RpdmV8ZW58MXx8fHwxNzU4NTQ0Mzk1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'],
      isVerified: false,
      views: 234,
      postedDate: '5 days ago',
      seller: {
        name: 'Ahmed Modifications',
        rating: 4.2,
        isVerified: false,
        phone: '+971501234570',
        whatsapp: '+971501234570'
      },
      sellerId: 'seller4',
      description: 'High-quality carbon fiber hood for BYD Seal Performance. Lightweight and durable construction. Perfect for performance and aesthetics upgrade.'
    },
    // Add a user's own listing for testing "My Listings"
    {
      id: '5',
      title: '2021 BYD Qin Plus - Family Sedan',
      price: 65000,
      currency: 'AED',
      location: 'Sharjah',
      year: 2021,
      mileage: '35,000',
      category: 'cars' as const,
      images: [
        'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop'
      ],
      isVerified: true,
      views: 324,
      postedDate: '1 day ago',
      seller: {
        name: 'Current User',
        rating: 4.6,
        isVerified: true,
        phone: '+971501234571',
        whatsapp: '+971501234571'
      },
      sellerId: currentUserId, // This will be the current user's listing
      description: 'Well-maintained BYD Qin Plus family sedan. Regular service, non-smoking owner, excellent fuel economy and reliability.',
      specifications: {
        transmission: 'Automatic',
        fuelType: 'Hybrid',
        bodyType: 'Sedan',
        color: 'Silver',
        condition: 'Good'
      }
    }
  ];

  const handleFavorite = (listingId: string) => {
    setFavoriteIds(prev => 
      prev.includes(listingId) 
        ? prev.filter(id => id !== listingId)
        : [...prev, listingId]
    );
  };

  const handleViewListing = (listing: any) => {
    setSelectedListing(listing);
    setIsDetailModalOpen(true);
  };

  const handleFeaturedItemClick = (item: any) => {
    // Find the full listing data
    const fullListing = sampleListings.find(listing => listing.id === item.id);
    if (fullListing) {
      handleViewListing(fullListing);
    }
  };

  const handleBoostPlan = (plan: any) => {
    console.log('Selected boost plan:', plan);
    setIsBoostModalOpen(false);
    // Handle payment flow here
  };

  // Get featured items for ribbon
  const featuredItems = sampleListings
    .filter(listing => listing.isFeatured)
    .map(listing => ({
      id: listing.id,
      title: listing.title,
      image: listing.images[0],
      price: listing.price,
      currency: listing.currency,
      type: listing.category as 'car' | 'part',
      boostEnd: listing.boostEnd,
      views: listing.views,
      likes: Math.floor(Math.random() * 50) + 10
    }));

  // Get available models for selected brand
  const availableModels = selectedBrand !== 'all' ? modelsByBrand[selectedBrand] || ['all'] : ['all'];

  const filteredListings = sampleListings.filter(listing => {
    // My Listings filter - only show current user's listings
    if (showMyListings && listing.sellerId !== currentUserId) return false;
    
    // Category filter
    if (selectedCategory !== 'all' && listing.category !== selectedCategory) return false;
    
    // Search filter
    if (searchQuery && !listing.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    // Brand filter (for cars only)
    if (selectedBrand !== 'all' && listing.category === 'cars') {
      if (!listing.title.toLowerCase().includes(selectedBrand.toLowerCase())) return false;
    }
    
    // Price range filter
    if (listing.price < priceRange[0] || listing.price > priceRange[1]) return false;
    
    // Location filter
    if (location !== 'all' && listing.location !== location) return false;
    
    // Verified sellers only filter
    if (verifiedOnly && !listing.seller.isVerified) return false;
    
    // Featured only filter
    if (featuredOnly && !listing.isFeatured) return false;
    
    return true;
  });

  const sortedListings = [...filteredListings].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
      case 'oldest':
        return new Date(a.postedDate).getTime() - new Date(b.postedDate).getTime();
      case 'price_low':
        return a.price - b.price;
      case 'price_high':
        return b.price - a.price;
      case 'popular':
        return (b.views || 0) - (a.views || 0);
      default:
        return 0;
    }
  });

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedBrand('all');
    setSelectedModel('all');
    setPriceRange([0, 1000000]);
    setLocation('all');
    setYearRange([2000, 2024]);
    setMileageMax(200000);
    setCondition([]);
    setVerifiedOnly(false);
    setFeaturedOnly(false);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedCategory !== 'all') count++;
    if (selectedBrand !== 'all') count++;
    if (selectedModel !== 'all') count++;
    if (priceRange[0] > 0 || priceRange[1] < 1000000) count++;
    if (location !== 'all') count++;
    if (yearRange[0] > 2000 || yearRange[1] < 2024) count++;
    if (mileageMax < 200000) count++;
    if (condition.length > 0) count++;
    if (verifiedOnly) count++;
    if (featuredOnly) count++;
    return count;
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-card border-b border-border p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Marketplace</h1>
              <p className="text-muted-foreground">Buy and sell cars, parts, and accessories</p>
            </div>
            
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <Button
                variant="outline"
                aria-pressed={showMyListings}
                onClick={() => setShowMyListings(!showMyListings)}
                className={showMyListings ? 'bg-[var(--sublimes-gold)] text-black' : ''}
              >
                <List className="mr-2 h-4 w-4" />
                <span>My Listings</span>
                {showMyListings && (
                  <Badge variant="secondary" className="ml-2 text-xs uppercase tracking-wide">
                    Active
                  </Badge>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsBoostModalOpen(true)}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Boost
              </Button>
              <Button
                className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/80"
                onClick={() => onNavigate?.('place-ad')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Place Your Ad
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Featured Ribbon */}
        {featuredItems.length > 0 && (
          <FeaturedRibbon 
            items={featuredItems}
            title="Featured Marketplace"
            onItemClick={handleFeaturedItemClick}
          />
        )}

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search cars, parts, brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-2">
                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map(brand => (
                      <SelectItem key={brand} value={brand}>
                        {brand === 'all' ? 'All Brands' : brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {availableModels.length > 1 && (
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Model" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.map(model => (
                        <SelectItem key={model} value={model}>
                          {model === 'all' ? 'All Models' : model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(loc => (
                      <SelectItem key={loc} value={loc}>
                        {loc === 'all' ? 'All Locations' : loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Advanced Filters Button */}
                <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex items-center relative">
                      <SlidersHorizontal className="mr-2 h-4 w-4" />
                      Filters
                      {getActiveFiltersCount() > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                        >
                          {getActiveFiltersCount()}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="end">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold">Advanced Filters</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsFiltersOpen(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {/* Sort By */}
                        <div>
                          <label className="text-sm font-medium mb-2 block">Sort by</label>
                          <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {sortOptions.map(option => {
                                const Icon = option.icon;
                                return (
                                  <SelectItem key={option.value} value={option.value}>
                                    <div className="flex items-center">
                                      <Icon className="h-4 w-4 mr-2" />
                                      {option.label}
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>

                        <Separator />

                        {/* Price Range */}
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Price Range: {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()} AED
                          </label>
                          <Slider
                            value={priceRange}
                            onValueChange={setPriceRange}
                            max={1000000}
                            min={0}
                            step={5000}
                            className="w-full"
                          />
                        </div>

                        {/* Special Filters */}
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="verified"
                              checked={verifiedOnly}
                              onCheckedChange={setVerifiedOnly}
                            />
                            <label htmlFor="verified" className="text-sm font-medium">
                              Verified sellers only
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="featured"
                              checked={featuredOnly}
                              onCheckedChange={setFeaturedOnly}
                            />
                            <label htmlFor="featured" className="text-sm font-medium">
                              Featured listings only
                            </label>
                          </div>
                        </div>

                        <Separator />

                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={clearAllFilters}
                        >
                          Clear All Filters
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
            className={selectedCategory === 'all' ? 'bg-[var(--sublimes-gold)] text-black' : ''}
          >
            All Items ({sortedListings.length})
          </Button>
          <Button
            variant={selectedCategory === 'cars' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('cars')}
            className={selectedCategory === 'cars' ? 'bg-[var(--sublimes-gold)] text-black' : ''}
          >
            Cars ({sortedListings.filter(l => l.category === 'cars').length})
          </Button>
          <Button
            variant={selectedCategory === 'parts' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('parts')}
            className={selectedCategory === 'parts' ? 'bg-[var(--sublimes-gold)] text-black' : ''}
          >
            Parts ({sortedListings.filter(l => l.category === 'parts').length})
          </Button>
        </div>

        {/* Results Section */}
        <div className="mt-6">
          {/* Results Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div className="mb-4 md:mb-0">
              <h2 className="text-lg font-semibold">
                {showMyListings ? 'My Listings' : 'All Listings'} ({sortedListings.length})
              </h2>
              <p className="text-sm text-muted-foreground">
                {showMyListings 
                  ? 'Manage your active listings'
                  : `Showing ${sortedListings.length} results${searchQuery ? ` for "${searchQuery}"` : ''}`
                }
              </p>
            </div>
            
            {/* View Toggle and Sort */}
            <div className="flex items-center gap-4">
              <ViewToggle view={viewMode} onViewChange={setViewMode} />
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map(option => {
                      const Icon = option.icon;
                      return (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center">
                            <Icon className="h-4 w-4 mr-2" />
                            {option.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Results */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onFavorite={() => handleFavorite(listing.id)}
                  isFavorited={favoriteIds.includes(listing.id)}
                  onViewDetails={handleViewListing}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onFavorite={() => handleFavorite(listing.id)}
                  isFavorited={favoriteIds.includes(listing.id)}
                  variant="list"
                  onViewDetails={handleViewListing}
                />
              ))}
            </div>
          )}

          {sortedListings.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <Filter className="h-12 w-12 mx-auto mb-2" />
                <h3 className="text-lg font-medium">
                  {showMyListings ? 'No listings yet' : 'No listings found'}
                </h3>
                <p>
                  {showMyListings 
                    ? 'Create your first listing to get started'
                    : 'Try adjusting your search criteria or filters'
                  }
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                {showMyListings ? (
                  <Button className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/80">
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Listing
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={clearAllFilters}>
                      Clear All Filters
                    </Button>
                    <Button onClick={() => setShowMyListings(true)}>
                      View My Listings
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Load More */}
          {sortedListings.length > 0 && (
            <div className="text-center mt-8">
              <Button variant="outline" size="lg">
                Load More Listings
                <span className="ml-2 text-xs">({sortedListings.length} of 150+)</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Boost Plans Modal */}
      <BoostPlansModal
        isOpen={isBoostModalOpen}
        onClose={() => setIsBoostModalOpen(false)}
        onSelectPlan={handleBoostPlan}
        entityType="marketplace"
        isVerified={true}
      />

      {/* Listing Detail Modal */}
      <ListingDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        listing={selectedListing}
        onFavorite={() => selectedListing && handleFavorite(selectedListing.id)}
        isFavorited={selectedListing ? favoriteIds.includes(selectedListing.id) : false}
      />
    </div>
  );
}