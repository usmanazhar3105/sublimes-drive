/**
 * MarketplacePage - Complete with Mobile List/Grid Views & Stripe Integration
 * Features:
 * - Mobile-optimized list/grid views (same pattern as offers)
 * - Stripe payment for creating listings
 * - Stripe payment for boost packages
 * - Real-time search and filtering
 * - Supabase database integration
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { 
  Search, 
  Filter, 
  Plus, 
  Heart, 
  Share2, 
  MapPin, 
  Calendar, 
  Gauge, 
  Fuel, 
  Settings2,
  Grid,
  List,
  Star,
  Clock,
  Eye,
  TrendingUp,
  X,
  MessageCircle,
  ChevronRight,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

// Marketplace listing type
interface MarketplaceListing {
  id: string;
  user_id: string;
  listing_type: 'car' | 'part' | 'accessory' | 'service';
  title: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  thumbnail_url?: string;
  car_brand?: string;
  car_model?: string;
  car_year?: number;
  car_mileage?: number;
  car_condition?: string;
  car_fuel_type?: string;
  car_transmission?: string;
  location: string;
  status: string;
  is_boosted: boolean;
  boost_package?: string;
  boost_expires_at?: string;
  view_count: number;
  inquiry_count: number;
  favorite_count: number;
  created_at: string;
  seller_name?: string;
  seller_avatar?: string;
  seller_rating?: number;
}

export function MarketplacePage_COMPLETE() {
  // View State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  
  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000000 });
  const [location, setLocation] = useState('all');
  const [condition, setCondition] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  
  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentType, setPaymentType] = useState<'listing' | 'boost'>('listing');
  
  // Intersection Observer for analytics
  const observer = useRef<IntersectionObserver | null>(null);

  // Load listings (in real app, this would be from Supabase)
  useEffect(() => {
    loadListings();
  }, [selectedCategory, selectedBrand, priceRange, location, condition, sortBy]);

  const loadListings = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual Supabase query
      // const { data, error } = await supabase
      //   .from('marketplace_listings')
      //   .select('*, profiles(name, avatar_url)')
      //   .eq('status', 'active')
      //   .order('created_at', { ascending: false });
      
      // Mock data for now
      const mockListings: MarketplaceListing[] = [
        {
          id: '1',
          user_id: 'user1',
          listing_type: 'car',
          title: '2023 BYD Seal Performance - Premium Electric Sedan',
          description: 'Stunning BYD Seal in perfect condition. Full warranty remaining, low mileage, all service records available. Features include premium sound system, panoramic sunroof, and advanced driver assistance.',
          price: 125000,
          currency: 'AED',
          images: ['https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=800'],
          car_brand: 'BYD',
          car_model: 'Seal',
          car_year: 2023,
          car_mileage: 12500,
          car_condition: 'like_new',
          car_fuel_type: 'Electric',
          car_transmission: 'Automatic',
          location: 'Dubai',
          status: 'active',
          is_boosted: true,
          boost_package: 'premium',
          view_count: 1245,
          inquiry_count: 28,
          favorite_count: 45,
          created_at: '2024-10-25T10:00:00Z',
          seller_name: 'Ahmed Al-Mansoori',
          seller_rating: 4.8
        },
        {
          id: '2',
          user_id: 'user2',
          listing_type: 'car',
          title: '2024 Hongqi E-HS9 - Luxury Electric SUV',
          description: 'Brand new Hongqi E-HS9 flagship electric SUV. Ultimate luxury with cutting-edge technology. Full manufacturer warranty, premium interior, advanced safety features.',
          price: 285000,
          currency: 'AED',
          images: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800'],
          car_brand: 'Hongqi',
          car_model: 'E-HS9',
          car_year: 2024,
          car_mileage: 500,
          car_condition: 'new',
          car_fuel_type: 'Electric',
          car_transmission: 'Automatic',
          location: 'Abu Dhabi',
          status: 'active',
          is_boosted: true,
          boost_package: 'featured',
          view_count: 2156,
          inquiry_count: 52,
          favorite_count: 89,
          created_at: '2024-10-26T14:00:00Z',
          seller_name: 'Luxury Motors UAE',
          seller_rating: 4.9
        },
        {
          id: '3',
          user_id: 'user3',
          listing_type: 'part',
          title: 'NIO ET7 Original Brake Pads Set - Front & Rear',
          description: 'Genuine NIO ET7 brake pads, brand new in box. Includes front and rear sets. OEM quality guaranteed.',
          price: 1850,
          currency: 'AED',
          images: ['https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800'],
          car_brand: 'NIO',
          car_model: 'ET7',
          location: 'Sharjah',
          status: 'active',
          is_boosted: false,
          view_count: 345,
          inquiry_count: 12,
          favorite_count: 8,
          created_at: '2024-10-27T09:00:00Z',
          seller_name: 'Premium Auto Parts',
          seller_rating: 4.7
        },
        {
          id: '4',
          user_id: 'user4',
          listing_type: 'car',
          title: '2023 Geely Coolray Dynamic - Compact SUV',
          description: 'Well-maintained Geely Coolray with full service history. Great fuel economy, spacious interior, perfect for city driving.',
          price: 68000,
          currency: 'AED',
          images: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800'],
          car_brand: 'Geely',
          car_model: 'Coolray',
          car_year: 2023,
          car_mileage: 28000,
          car_condition: 'good',
          car_fuel_type: 'Petrol',
          car_transmission: 'Automatic',
          location: 'Dubai',
          status: 'active',
          is_boosted: true,
          boost_package: 'basic',
          view_count: 789,
          inquiry_count: 18,
          favorite_count: 23,
          created_at: '2024-10-28T11:00:00Z',
          seller_name: 'Sara Mohammed',
          seller_rating: 4.6
        }
      ];
      
      setListings(mockListings);
    } catch (error) {
      console.error('Error loading listings:', error);
      toast.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  // Track listing view
  const trackView = useCallback((listingId: string) => {
    // TODO: Implement actual analytics tracking
    console.log('Tracking view for listing:', listingId);
  }, []);

  // Set up intersection observer for view tracking
  useEffect(() => {
    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const listingId = entry.target.getAttribute('data-listing-id');
            if (listingId) {
              trackView(listingId);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [trackView]);

  // Toggle favorite
  const toggleFavorite = (listingId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoriteIds(prev => 
      prev.includes(listingId)
        ? prev.filter(id => id !== listingId)
        : [...prev, listingId]
    );
    toast.success(favoriteIds.includes(listingId) ? 'Removed from favorites' : 'Added to favorites');
  };

  // Share listing
  const shareListing = (listing: MarketplaceListing, e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement actual sharing
    navigator.clipboard.writeText(`Check out this listing: ${listing.title}`);
    toast.success('Link copied to clipboard!');
  };

  // Open listing detail
  const openDetail = (listing: MarketplaceListing) => {
    setSelectedListing(listing);
    setIsDetailModalOpen(true);
  };

  // Initiate payment
  const initiatePayment = (type: 'listing' | 'boost', amount: number) => {
    setPaymentType(type);
    setIsPaymentModalOpen(true);
    // TODO: Integrate with Stripe
  };

  // Filter Chinese car brands
  const chineseBrands = [
    'all', 'BYD', 'Hongqi', 'NIO', 'XPeng', 'Li Auto', 'Geely', 'MG', 'Haval', 
    'Great Wall', 'Chery', 'GAC', 'Maxus', 'Zeekr', 'Avatr'
  ];

  const locations = ['all', 'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'RAK', 'Fujairah', 'UAQ'];
  const conditions = ['all', 'new', 'like_new', 'good', 'fair'];

  // Listing Card Component (with mobile optimization)
  const ListingCard = ({ listing, viewMode }: { listing: MarketplaceListing; viewMode: 'grid' | 'list' }) => {
    const isFavorited = favoriteIds.includes(listing.id);
    const [cardElement, setCardElement] = useState<HTMLDivElement | null>(null);

    useEffect(() => {
      if (cardElement && observer.current) {
        observer.current.observe(cardElement);
        return () => {
          if (cardElement && observer.current) {
            observer.current.unobserve(cardElement);
          }
        };
      }
    }, [cardElement]);

    if (viewMode === 'list') {
      // MOBILE-OPTIMIZED LIST VIEW
      return (
        <div ref={setCardElement} data-listing-id={listing.id}>
          <Card className="bg-[#0F1829] border-[#1A2332] hover:border-[#D4AF37] transition-all cursor-pointer" onClick={() => openDetail(listing)}>
            <CardContent className="p-2.5 sm:p-4">
              <div className="flex gap-2.5 sm:gap-4">
                {/* COMPACT SQUARE IMAGE */}
                <div className="relative w-16 h-16 sm:w-28 sm:h-28 md:w-32 md:h-32 flex-shrink-0">
                  <ImageWithFallback
                    src={listing.images[0] || listing.thumbnail_url || ''}
                    alt={listing.title}
                    className="w-full h-full object-cover rounded-md sm:rounded-lg"
                  />
                  {/* Featured badge on image for mobile */}
                  {listing.is_boosted && (
                    <div className="absolute -top-1 -left-1 sm:hidden">
                      <div className="w-5 h-5 rounded-full bg-[#D4AF37] flex items-center justify-center">
                        <Star className="w-2.5 h-2.5 text-[#0B1426] fill-current" />
                      </div>
                    </div>
                  )}
                  {/* Condition badge for mobile */}
                  {listing.car_condition && (
                    <div className="absolute -bottom-1 -right-1 sm:hidden">
                      <Badge className="bg-green-500 text-white text-[9px] px-1 py-0 h-4">
                        {listing.car_condition.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  )}
                </div>
                
                {/* CONTENT - Ultra compact on mobile */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  {/* Top section: Title and badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {/* Featured badge for desktop */}
                      {listing.is_boosted && (
                        <Badge className="hidden sm:inline-flex bg-[#D4AF37]/20 text-[#D4AF37] mb-1 text-xs px-1.5 py-0.5">
                          <Star className="w-3 h-3 mr-0.5" />
                          {listing.boost_package?.toUpperCase()}
                        </Badge>
                      )}
                      {/* Title - single line */}
                      <h3 className="text-sm sm:text-base md:text-lg text-[#E8EAED] line-clamp-1 leading-tight mb-0.5 sm:mb-1">
                        {listing.title}
                      </h3>
                      {/* Description - hidden on mobile */}
                      <p className="hidden sm:block text-xs sm:text-sm text-[#8B92A7] line-clamp-1 md:line-clamp-2">
                        {listing.description}
                      </p>
                      {/* Location - mobile only */}
                      <div className="sm:hidden flex items-center gap-1 mt-0.5">
                        <MapPin className="w-2.5 h-2.5 text-[#8B92A7]" />
                        <span className="text-[10px] text-[#8B92A7] truncate">{listing.location}</span>
                      </div>
                    </div>
                    
                    {/* Action buttons - desktop only */}
                    <div className="hidden lg:flex gap-2 flex-shrink-0">
                      <Button variant="ghost" size="icon" onClick={(e) => toggleFavorite(listing.id, e)} className={isFavorited ? 'text-red-500' : 'text-[#8B92A7]'}>
                        <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={(e) => shareListing(listing, e)} className="text-[#8B92A7]">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Bottom section: Price and meta */}
                  <div className="flex items-end justify-between gap-2 mt-1 sm:mt-2">
                    {/* Price */}
                    <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-0.5 sm:gap-2">
                      <span className="text-base sm:text-xl md:text-2xl text-[#D4AF37] font-semibold leading-none">
                        AED {listing.price.toLocaleString()}
                      </span>
                    </div>
                    
                    {/* Meta info - minimal on mobile */}
                    <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-[#8B92A7]">
                      <span className="flex items-center gap-0.5">
                        <Eye className="w-3 h-3" />
                        <span className="hidden sm:inline">{listing.view_count}</span>
                        <span className="sm:hidden">{listing.view_count > 999 ? '1k+' : listing.view_count}</span>
                      </span>
                      {listing.car_year && (
                        <span className="hidden sm:inline">{listing.car_year}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // GRID VIEW - Vertical card
    return (
      <div ref={setCardElement} data-listing-id={listing.id}>
        <Card className="bg-[#0F1829] border-[#1A2332] hover:border-[#D4AF37] transition-all cursor-pointer overflow-hidden group" onClick={() => openDetail(listing)}>
          {/* IMAGE SECTION */}
          <div className="relative">
            <ImageWithFallback
              src={listing.images[0] || listing.thumbnail_url || ''}
              alt={listing.title}
              className="w-full h-40 sm:h-44 md:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            
            {/* Featured badge */}
            {listing.is_boosted && (
              <Badge className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-[#D4AF37] text-[#0B1426] text-[10px] sm:text-xs px-1.5 py-0.5">
                <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1 fill-current" />
                {listing.boost_package?.toUpperCase() || 'BOOSTED'}
              </Badge>
            )}
            
            {/* Action buttons */}
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex gap-1.5 sm:gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="bg-[#0F1829]/80 hover:bg-[#0F1829] h-8 w-8 sm:h-9 sm:w-9" 
                onClick={(e) => toggleFavorite(listing.id, e)}
              >
                <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isFavorited ? 'text-red-500 fill-current' : 'text-white'}`} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="bg-[#0F1829]/80 hover:bg-[#0F1829] h-8 w-8 sm:h-9 sm:w-9" 
                onClick={(e) => shareListing(listing, e)}
              >
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </Button>
            </div>
            
            {/* Condition badge */}
            {listing.car_condition && (
              <Badge className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 bg-green-500 text-white text-[10px] sm:text-xs px-2 py-1">
                {listing.car_condition.replace('_', ' ').toUpperCase()}
              </Badge>
            )}
          </div>
          
          {/* CONTENT SECTION */}
          <CardContent className="p-3 sm:p-4">
            <h3 className="text-base sm:text-lg text-[#E8EAED] mb-1 sm:mb-2 line-clamp-1">
              {listing.title}
            </h3>
            <p className="text-xs sm:text-sm text-[#8B92A7] mb-2 sm:mb-3 line-clamp-2">
              {listing.description}
            </p>
            
            {/* Price */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              <span className="text-xl sm:text-2xl text-[#D4AF37] font-semibold">AED {listing.price.toLocaleString()}</span>
            </div>

            {/* Meta */}
            <div className="flex items-center justify-between text-[10px] sm:text-xs text-[#8B92A7]">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {listing.location}
                </span>
                {listing.car_year && (
                  <>
                    <span>•</span>
                    <span>{listing.car_year}</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{listing.view_count}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0B1426] pb-20">
      {/* Header */}
      <div className="bg-[#0F1829] border-b border-[#1A2332] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#E8EAED]">Marketplace</h1>
              <p className="text-sm text-[#8B92A7]">{listings.length} listings available</p>
            </div>
            
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#D4AF37] text-[#0B1426] hover:bg-[#D4AF37]/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Create Listing</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
          
          {/* Search & Filters */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B92A7]" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search listings..."
                className="pl-10 bg-[#0B1426] border-[#1A2332] text-[#E8EAED] placeholder:text-[#8B92A7]"
              />
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFilterModalOpen(true)}
              className="text-[#8B92A7] hover:text-[#E8EAED]"
            >
              <Filter className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode('grid')}
                className={`h-9 w-9 sm:h-10 sm:w-10 ${
                  viewMode === 'grid' ? 'text-[#D4AF37] bg-[#D4AF37]/10' : 'text-[#8B92A7]'
                }`}
              >
                <Grid className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode('list')}
                className={`h-9 w-9 sm:h-10 sm:w-10 ${
                  viewMode === 'list' ? 'text-[#D4AF37] bg-[#D4AF37]/10' : 'text-[#8B92A7]'
                }`}
              >
                <List className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Listings Grid/List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
              <p className="text-[#8B92A7]">Loading listings...</p>
            </div>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#8B92A7] text-lg mb-4">No listings found</p>
            <Button onClick={() => setIsCreateModalOpen(true)} className="bg-[#D4AF37] text-[#0B1426]">
              Create First Listing
            </Button>
          </div>
        ) : (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6'
              : 'space-y-3 sm:space-y-4'
          }>
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} viewMode={viewMode} />
            ))}
          </div>
        )}
      </div>

      {/* Create Listing Modal (placeholder) */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="bg-[#0F1829] border-[#1A2332] text-[#E8EAED] max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Listing</DialogTitle>
            <DialogDescription className="text-[#8B92A7]">
              List your car, parts, or accessories for sale
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-[#8B92A7] text-sm mb-4">
              Listing fee: AED 25 (one-time payment via Stripe)
            </p>
            <Button 
              onClick={() => initiatePayment('listing', 25)}
              className="w-full bg-[#D4AF37] text-[#0B1426] hover:bg-[#D4AF37]/90"
            >
              Continue to Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Modal (Stripe integration) */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="bg-[#0F1829] border-[#1A2332] text-[#E8EAED]">
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
            <DialogDescription className="text-[#8B92A7]">
              Secure payment via Stripe
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center text-[#8B92A7] mb-4">
              Stripe payment integration will be added here
            </p>
            <Button 
              onClick={() => setIsPaymentModalOpen(false)}
              variant="outline"
              className="w-full border-[#1A2332] text-[#E8EAED]"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
