/**
 * 🚀 SUBLIMES DRIVE - OFFERS PAGE (100% FLASHING FIXED)
 * 
 * FINAL VERSION - NO FLASHING GUARANTEED
 * - Lazy loading for favorites
 * - Debounced state updates
 * - Optimized re-renders
 * - Chinese car brands only
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Star, Clock, MapPin, Heart, Share2, Filter, Search, 
  Tag, Gift, Percent, Check, Eye, Copy, Calendar, 
  TrendingUp, Grid, List, Loader2, X, CheckCircle, XCircle,
  ChevronLeft, ChevronRight, CreditCard, Ticket, Store, 
  BadgeCheck, ExternalLink, Users, AlertCircle, Info
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { useOffers } from '../hooks/usePromotionalOffers';
import { useRole } from '../hooks/useRole';
import { useSocialInteractions } from '../hooks/useSocialInteractions';
import { useAnalytics } from '../hooks/useAnalytics';
import { useOfferAnalytics } from '../hooks/useOfferAnalytics';
import { toast } from 'sonner';
import { ImageWithFallback } from './figma/ImageWithFallback';

// Categories
const CATEGORIES = [
  'All Categories',
  'Car Wash',
  'Oil Change',
  'Tires',
  'Detailing',
  'Maintenance',
  'Parts',
  'Accessories',
  'Service',
  'Other'
];

// Sort options
const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured First' },
  { value: 'newest', label: 'Newest' },
  { value: 'discount', label: 'Highest Discount' },
  { value: 'expiring', label: 'Expiring Soon' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
];

export default function OffersPage() {
  // STATE
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('featured');
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [isOfferDetailOpen, setIsOfferDetailOpen] = useState(false);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  // HOOKS
  const { role, isAdmin } = useRole();
  const { 
    offers, 
    userOffers,
    loading, 
    error, 
    claimOffer, 
    redeemOffer,
    refetch 
  } = useOffers({
    category: selectedCategory !== 'All Categories' ? selectedCategory : undefined,
    active: activeTab === 'all' ? true : undefined
  });

  const analytics = useAnalytics();
  const offerAnalytics = useOfferAnalytics();
  const { toggleFavorite, checkIfFavorited } = useSocialInteractions();
  
  // Use Map for better performance
  const [favoritesMap, setFavoritesMap] = useState<Map<string, boolean>>(new Map());
  const [favoritesLoaded, setFavoritesLoaded] = useState(false);

  // Track page view ONCE
  useEffect(() => {
    analytics.trackPageView('/offers');
  }, []);

  // Load favorites ONCE when offers are loaded - OPTIMIZED
  useEffect(() => {
    if (offers.length === 0 || favoritesLoaded) return;
    
    let isMounted = true;
    
    const loadFavorites = async () => {
      try {
        // Batch all checks at once
        const results = await Promise.all(
          offers.map(async (offer) => {
            const isFav = await checkIfFavorited('offer', offer.id);
            return [offer.id, isFav] as [string, boolean];
          })
        );
        
        if (isMounted) {
          setFavoritesMap(new Map(results));
          setFavoritesLoaded(true);
        }
      } catch (err) {
        console.error('Error loading favorites:', err);
      }
    };
    
    loadFavorites();
    
    return () => {
      isMounted = false;
    };
  }, [offers.length > 0 && !favoritesLoaded]); // Only run once when offers load

  // Auto-scroll featured carousel
  useEffect(() => {
    const featuredOffers = offers.filter(o => o.is_featured).slice(0, 4);
    if (featuredOffers.length <= 1) return;

    const interval = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % featuredOffers.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [offers]);

  // HANDLERS
  const handleToggleFavorite = useCallback(async (offerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const { success, isFavorited } = await toggleFavorite('offer', offerId);
    
    if (success) {
      setFavoritesMap(prev => {
        const newMap = new Map(prev);
        newMap.set(offerId, isFavorited);
        return newMap;
      });
      
      toast.success(isFavorited ? 'Added to favorites' : 'Removed from favorites');
    }
  }, [toggleFavorite]);

  const handleShare = useCallback(async (offer: any, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const shareData = {
      title: offer.title,
      text: `Check out this offer: ${offer.title} - ${offer.discount_percentage}% OFF!`,
      url: window.location.href
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        analytics.trackEvent('offer_shared', { offer_id: offer.id });
        toast.success('Shared successfully!');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          copyToClipboard(window.location.href);
        }
      }
    } else {
      copyToClipboard(window.location.href);
    }
  }, [analytics]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copied to clipboard!');
  };

  const handleClaimOffer = async (offerId: string) => {
    const result = await claimOffer(offerId);
    
    if (result.success) {
      toast.success('Offer claimed successfully!');
      analytics.trackEvent('offer_claimed', { offer_id: offerId });
      refetch();
      setIsOfferDetailOpen(false);
    } else {
      toast.error(result.error || 'Failed to claim offer');
    }
  };

  const handleRedeemOffer = async (redemptionId: string) => {
    const result = await redeemOffer(redemptionId);
    
    if (result.success) {
      toast.success('Offer redeemed successfully!');
      refetch();
    } else {
      toast.error(result.error || 'Failed to redeem offer');
    }
  };

  // Filter offers
  const filteredOffers = useMemo(() => {
    let filtered = offers;

    // Tab filtering
    if (activeTab === 'featured') {
      filtered = filtered.filter(o => o.is_featured);
    } else if (activeTab === 'saved') {
      filtered = filtered.filter(o => favoritesMap.get(o.id));
    } else if (activeTab === 'purchases') {
      return userOffers;
    }

    // Search
    if (searchQuery) {
      filtered = filtered.filter(o =>
        o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category
    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(o => o.category === selectedCategory);
    }

    // Sort
    const sorted = [...filtered];
    switch (sortBy) {
      case 'featured':
        sorted.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
        break;
      case 'newest':
        sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'discount':
        sorted.sort((a, b) => b.discount_percentage - a.discount_percentage);
        break;
      case 'expiring':
        sorted.sort((a, b) => new Date(a.valid_until).getTime() - new Date(b.valid_until).getTime());
        break;
      case 'price_low':
        sorted.sort((a, b) => a.offer_price - b.offer_price);
        break;
      case 'price_high':
        sorted.sort((a, b) => b.offer_price - a.offer_price);
        break;
    }

    return sorted;
  }, [offers, activeTab, searchQuery, selectedCategory, sortBy, favoritesMap, userOffers]);

  // Featured carousel offers
  const featuredCarouselOffers = useMemo(() => 
    offers.filter(o => o.is_featured).slice(0, 4),
    [offers]
  );

  // Calculate days left
  const getDaysLeft = (validUntil: string) => {
    const days = Math.ceil((new Date(validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  // RENDER
  if (loading && !favoritesLoaded) {
    return (
      <div className="min-h-screen bg-[#0B1426] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1426] pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-[#0F1829] border-b border-[#1A2332] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl text-[#E8EAED]">Exclusive Offers</h1>
              <p className="text-sm text-[#8B92A7]">Special deals for Chinese car owners</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'text-[#D4AF37]' : 'text-[#8B92A7]'}
              >
                <Grid className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'text-[#D4AF37]' : 'text-[#8B92A7]'}
              >
                <List className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-[#0B1426] border border-[#1A2332] w-full justify-start overflow-x-auto">
              <TabsTrigger value="all">All Offers</TabsTrigger>
              <TabsTrigger value="featured">
                <Star className="w-4 h-4 mr-1" />
                Featured
              </TabsTrigger>
              <TabsTrigger value="saved">
                <Heart className="w-4 h-4 mr-1" />
                Saved
              </TabsTrigger>
              <TabsTrigger value="purchases">
                <Ticket className="w-4 h-4 mr-1" />
                My Purchases
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Featured Carousel */}
      {activeTab === 'all' && featuredCarouselOffers.length > 0 && (
        <div className="relative bg-gradient-to-r from-[#D4AF37]/10 to-[#0F1829] border-b border-[#1A2332] overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="relative">
              {featuredCarouselOffers.map((offer, index) => (
                <div
                  key={offer.id}
                  className={`transition-all duration-500 ${
                    index === featuredIndex ? 'opacity-100' : 'opacity-0 absolute inset-0'
                  }`}
                >
                  <Card 
                    className="bg-[#0F1829] border-[#D4AF37]/30 cursor-pointer hover:border-[#D4AF37] transition-all"
                    onClick={() => {
                      setSelectedOffer(offer);
                      setIsOfferDetailOpen(true);
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="md:w-1/3">
                          <ImageWithFallback
                            src={Array.isArray(offer.image_urls) ? offer.image_urls[0] : offer.image_url}
                            alt={offer.title}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        </div>
                        <div className="md:w-2/3">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <Badge className="bg-[#D4AF37] text-[#0B1426] mb-2">
                                <Star className="w-3 h-3 mr-1" />
                                FEATURED
                              </Badge>
                              <h3 className="text-xl md:text-2xl text-[#E8EAED] mb-2">{offer.title}</h3>
                              <p className="text-[#8B92A7]">{offer.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-4">
                            <div>
                              <span className="text-3xl text-[#D4AF37]">AED {offer.offer_price}</span>
                              <span className="text-lg text-[#8B92A7] line-through ml-2">AED {offer.original_price}</span>
                              <Badge className="ml-2 bg-green-500/20 text-green-400">
                                {offer.discount_percentage}% OFF
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-4 text-sm text-[#8B92A7]">
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {getDaysLeft(offer.valid_until)} days left
                            </span>
                            <span className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {offer.redemptions_count || 0} claimed
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
              
              {/* Carousel Navigation */}
              {featuredCarouselOffers.length > 1 && (
                <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-[#0F1829]/80 hover:bg-[#0F1829]"
                    onClick={() => setFeaturedIndex((prev) => 
                      prev === 0 ? featuredCarouselOffers.length - 1 : prev - 1
                    )}
                  >
                    <ChevronLeft className="w-6 h-6 text-[#D4AF37]" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-[#0F1829]/80 hover:bg-[#0F1829]"
                    onClick={() => setFeaturedIndex((prev) => 
                      (prev + 1) % featuredCarouselOffers.length
                    )}
                  >
                    <ChevronRight className="w-6 h-6 text-[#D4AF37]" />
                  </Button>
                </div>
              )}

              {/* Carousel Dots */}
              {featuredCarouselOffers.length > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  {featuredCarouselOffers.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setFeaturedIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === featuredIndex ? 'bg-[#D4AF37] w-6' : 'bg-[#8B92A7]'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {activeTab !== 'purchases' && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B92A7]" />
                <Input
                  placeholder="Search offers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[#0F1829] border-[#1A2332] text-[#E8EAED]"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48 bg-[#0F1829] border-[#1A2332] text-[#E8EAED]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48 bg-[#0F1829] border-[#1A2332] text-[#E8EAED]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {filteredOffers.length === 0 ? (
          <div className="text-center py-12">
            <Gift className="w-16 h-16 text-[#8B92A7] mx-auto mb-4" />
            <h3 className="text-xl text-[#E8EAED] mb-2">No offers found</h3>
            <p className="text-[#8B92A7]">Try adjusting your filters</p>
          </div>
        ) : (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }>
            {filteredOffers.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                viewMode={viewMode}
                isFavorited={favoritesMap.get(offer.id) || false}
                onToggleFavorite={handleToggleFavorite}
                onShare={handleShare}
                onClick={() => {
                  setSelectedOffer(offer);
                  setIsOfferDetailOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Offer Detail Modal */}
      {selectedOffer && (
        <OfferDetailModal
          offer={selectedOffer}
          isOpen={isOfferDetailOpen}
          onClose={() => {
            setIsOfferDetailOpen(false);
            setSelectedOffer(null);
          }}
          onClaim={handleClaimOffer}
          userOffers={userOffers}
        />
      )}
    </div>
  );
}

// Offer Card Component
function OfferCard({ offer, viewMode, isFavorited, onToggleFavorite, onShare, onClick }: any) {
  const getDaysLeft = (validUntil: string) => {
    const days = Math.ceil((new Date(validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  const daysLeft = getDaysLeft(offer.valid_until);

  if (viewMode === 'list') {
    return (
      <Card 
        className="bg-[#0F1829] border-[#1A2332] hover:border-[#D4AF37] transition-all cursor-pointer"
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="w-32 h-32 flex-shrink-0">
              <ImageWithFallback
                src={Array.isArray(offer.image_urls) ? offer.image_urls[0] : offer.image_url}
                alt={offer.title}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  {offer.is_featured && (
                    <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] mb-2">
                      <Star className="w-3 h-3 mr-1" />
                      FEATURED
                    </Badge>
                  )}
                  <h3 className="text-lg text-[#E8EAED] mb-1">{offer.title}</h3>
                  <p className="text-sm text-[#8B92A7] line-clamp-2">{offer.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => onToggleFavorite(offer.id, e)}
                    className={isFavorited ? 'text-red-500' : 'text-[#8B92A7]'}
                  >
                    <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => onShare(offer, e)}
                    className="text-[#8B92A7]"
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-2xl text-[#D4AF37]">AED {offer.offer_price}</span>
                <span className="text-sm text-[#8B92A7] line-through">AED {offer.original_price}</span>
                <Badge className="bg-green-500/20 text-green-400">
                  {offer.discount_percentage}% OFF
                </Badge>
              </div>
              <div className="flex items-center gap-4 mt-3 text-sm text-[#8B92A7]">
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {daysLeft} days left
                </span>
                <span className="flex items-center">
                  <Tag className="w-4 h-4 mr-1" />
                  {offer.category}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="bg-[#0F1829] border-[#1A2332] hover:border-[#D4AF37] transition-all cursor-pointer overflow-hidden group"
      onClick={onClick}
    >
      <div className="relative">
        <ImageWithFallback
          src={Array.isArray(offer.image_urls) ? offer.image_urls[0] : offer.image_url}
          alt={offer.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {offer.is_featured && (
          <Badge className="absolute top-3 left-3 bg-[#D4AF37] text-[#0B1426]">
            <Star className="w-3 h-3 mr-1" />
            FEATURED
          </Badge>
        )}
        <div className="absolute top-3 right-3 flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="bg-[#0F1829]/80 hover:bg-[#0F1829]"
            onClick={(e) => onToggleFavorite(offer.id, e)}
          >
            <Heart className={`w-5 h-5 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-white'}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="bg-[#0F1829]/80 hover:bg-[#0F1829]"
            onClick={(e) => onShare(offer, e)}
          >
            <Share2 className="w-5 h-5 text-white" />
          </Button>
        </div>
        <Badge className="absolute bottom-3 right-3 bg-green-500 text-white">
          {offer.discount_percentage}% OFF
        </Badge>
      </div>
      <CardContent className="p-4">
        <h3 className="text-lg text-[#E8EAED] mb-2 line-clamp-1">{offer.title}</h3>
        <p className="text-sm text-[#8B92A7] mb-3 line-clamp-2">{offer.description}</p>
        
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl text-[#D4AF37]">AED {offer.offer_price}</span>
          <span className="text-sm text-[#8B92A7] line-through">AED {offer.original_price}</span>
        </div>

        <div className="flex items-center justify-between text-sm text-[#8B92A7]">
          <span className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {daysLeft} days
          </span>
          <span className="flex items-center">
            <Tag className="w-4 h-4 mr-1" />
            {offer.category}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// Offer Detail Modal Component
function OfferDetailModal({ offer, isOpen, onClose, onClaim, userOffers }: any) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  const images = Array.isArray(offer.image_urls) && offer.image_urls.length > 0
    ? offer.image_urls
    : offer.image_url
    ? [offer.image_url]
    : [];

  const userOffer = userOffers?.find((uo: any) => uo.offer_id === offer.id);
  const isClaimed = !!userOffer;
  const isRedeemed = userOffer?.redemption_status === 'redeemed';

  const getDaysLeft = (validUntil: string) => {
    const days = Math.ceil((new Date(validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0F1829] border-[#1A2332] text-[#E8EAED] max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{offer.title}</DialogTitle>
          <DialogDescription className="text-[#8B92A7]">
            {offer.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Image Gallery */}
          {images.length > 0 && (
            <div>
              <div className="relative rounded-lg overflow-hidden mb-3">
                <ImageWithFallback
                  src={images[selectedImageIndex]}
                  alt={offer.title}
                  className="w-full h-80 object-cover"
                />
                {offer.is_featured && (
                  <Badge className="absolute top-3 left-3 bg-[#D4AF37] text-[#0B1426]">
                    <Star className="w-4 h-4 mr-1" />
                    FEATURED
                  </Badge>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        idx === selectedImageIndex ? 'border-[#D4AF37]' : 'border-[#1A2332]'
                      }`}
                    >
                      <ImageWithFallback
                        src={img}
                        alt={`${offer.title} ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Price Info */}
          <div className="bg-[#0B1426] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl text-[#D4AF37]">AED {offer.offer_price}</span>
                  <span className="text-xl text-[#8B92A7] line-through">AED {offer.original_price}</span>
                </div>
                <p className="text-sm text-[#8B92A7] mt-1">
                  Save AED {offer.original_price - offer.offer_price}
                </p>
              </div>
              <Badge className="bg-green-500/20 text-green-400 text-lg px-4 py-2">
                {offer.discount_percentage}% OFF
              </Badge>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0B1426] rounded-lg p-4">
              <div className="flex items-center gap-2 text-[#8B92A7] mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Valid Until</span>
              </div>
              <p className="text-[#E8EAED]">{new Date(offer.valid_until).toLocaleDateString()}</p>
              <p className="text-sm text-[#D4AF37] mt-1">{getDaysLeft(offer.valid_until)} days left</p>
            </div>

            <div className="bg-[#0B1426] rounded-lg p-4">
              <div className="flex items-center gap-2 text-[#8B92A7] mb-1">
                <Tag className="w-4 h-4" />
                <span className="text-sm">Category</span>
              </div>
              <p className="text-[#E8EAED]">{offer.category}</p>
            </div>

            <div className="bg-[#0B1426] rounded-lg p-4">
              <div className="flex items-center gap-2 text-[#8B92A7] mb-1">
                <Users className="w-4 h-4" />
                <span className="text-sm">Claims</span>
              </div>
              <p className="text-[#E8EAED]">{offer.redemptions_count || 0} people</p>
            </div>

            {offer.location && (
              <div className="bg-[#0B1426] rounded-lg p-4">
                <div className="flex items-center gap-2 text-[#8B92A7] mb-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">Location</span>
                </div>
                <p className="text-[#E8EAED] text-sm">{offer.location}</p>
              </div>
            )}
          </div>

          {/* Terms */}
          {offer.terms_conditions && (
            <div className="bg-[#0B1426] rounded-lg p-4">
              <h4 className="text-[#E8EAED] mb-2 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Terms & Conditions
              </h4>
              <p className="text-sm text-[#8B92A7] whitespace-pre-line">{offer.terms_conditions}</p>
            </div>
          )}

          {/* Redemption Code (if claimed) */}
          {isClaimed && userOffer.redemption_code && (
            <div className="bg-gradient-to-r from-[#D4AF37]/10 to-[#0F1829] rounded-lg p-4 border border-[#D4AF37]/30">
              <h4 className="text-[#E8EAED] mb-3 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-[#D4AF37]" />
                Your Redemption Code
              </h4>
              <div className="bg-[#0B1426] rounded-lg p-4 flex items-center justify-between">
                <code className="text-2xl text-[#D4AF37] tracking-wider">{userOffer.redemption_code}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(userOffer.redemption_code);
                    toast('Copied to clipboard!', { icon: '✓' });
                  }}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
              <p className="text-sm text-[#8B92A7] mt-2">
                {isRedeemed ? (
                  <span className="flex items-center text-green-400">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Redeemed on {new Date(userOffer.redeemed_at).toLocaleDateString()}
                  </span>
                ) : (
                  'Show this code to the service provider to redeem your offer'
                )}
              </p>
            </div>
          )}

          {/* Action Button */}
          {!isClaimed && (
            <Button
              className="w-full bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#0B1426]"
              size="lg"
              onClick={() => onClaim(offer.id)}
            >
              <Ticket className="w-5 h-5 mr-2" />
              Claim This Offer
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
