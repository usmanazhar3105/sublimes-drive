/**
 * 🚀 SUBLIMES DRIVE - OFFERS PAGE WITH FULL ANALYTICS TRACKING
 * 
 * Features:
 * ✅ No flashing (optimized re-renders)
 * ✅ Track impressions (when offer appears)
 * ✅ Track clicks (when user clicks offer)
 * ✅ Track views (when detail modal opens)
 * ✅ Track claims
 * ✅ Track shares
 * ✅ Chinese car brands only
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
import OfferPaymentModal from './OfferPaymentModal';

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
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [offerToPurchase, setOfferToPurchase] = useState<any>(null);
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

  // Intersection Observer for tracking impressions
  const observerRef = useRef<IntersectionObserver | null>(null);
  const trackedImpressions = useRef<Set<string>>(new Set());

  // Track page view ONCE
  useEffect(() => {
    if (analytics) {
      analytics.trackPageView('/offers');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Setup Intersection Observer for impression tracking
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const offerId = entry.target.getAttribute('data-offer-id');
            const source = entry.target.getAttribute('data-source');
            
            // Only track if we have a valid offerId and haven't tracked it yet
            if (offerId && offerId !== 'undefined' && offerId !== 'null' && !trackedImpressions.current.has(offerId)) {
              // Verify offer exists in current offers list before tracking
              const offerExists = offers.some(o => o.id === offerId);
              if (offerExists) {
                trackedImpressions.current.add(offerId);
                offerAnalytics.trackImpression(offerId, source || undefined);
              }
            }
          }
        });
      },
      {
        threshold: 0.5, // Track when 50% of offer is visible
        rootMargin: '0px'
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [offerAnalytics, offers]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offers.length, favoritesLoaded]);

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
    
    // Track share analytics
    offerAnalytics.trackShare(offer.id, 'user_action');
    
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
  }, [analytics, offerAnalytics]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copied to clipboard!');
  };

  const handleOfferClick = useCallback((offer: any, source: string) => {
    // Track click analytics
    offerAnalytics.trackClick(offer.id, source);
    
    setSelectedOffer(offer);
    setIsOfferDetailOpen(true);
    
    // Track view analytics when modal opens
    offerAnalytics.trackView(offer.id, source);
  }, [offerAnalytics]);

  const handleClaimOffer = async (offer: any) => {
    // Close detail modal and open payment modal
    setIsOfferDetailOpen(false);
    setOfferToPurchase(offer);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async (redemptionData: any) => {
    // Track claim analytics
    offerAnalytics.trackClaim(redemptionData.offer_id, 'payment_success');
    
    toast.success('Payment successful! Your offer has been activated.');
    analytics.trackEvent('offer_purchased', { 
      offer_id: redemptionData.offer_id,
      redemption_code: redemptionData.redemption_code 
    });
    
    // Close payment modal and refetch offers
    setIsPaymentModalOpen(false);
    setOfferToPurchase(null);
    refetch();
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
            <div className="flex-1 min-w-0 pr-4">
              <h1 className="text-xl sm:text-2xl md:text-3xl text-[#E8EAED]">Exclusive Offers</h1>
              <p className="text-xs sm:text-sm text-[#8B92A7] truncate">Special deals for BYD, NIO, Xpeng owners</p>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode('grid')}
                className={`h-9 w-9 sm:h-10 sm:w-10 ${viewMode === 'grid' ? 'text-[#D4AF37] bg-[#D4AF37]/10' : 'text-[#8B92A7]'}`}
              >
                <Grid className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode('list')}
                className={`h-9 w-9 sm:h-10 sm:w-10 ${viewMode === 'list' ? 'text-[#D4AF37] bg-[#D4AF37]/10' : 'text-[#8B92A7]'}`}
              >
                <List className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-[#0B1426] border border-[#1A2332] w-full justify-start overflow-x-auto scrollbar-hide">
              <TabsTrigger value="all" className="text-xs sm:text-sm whitespace-nowrap">All Offers</TabsTrigger>
              <TabsTrigger value="featured" className="text-xs sm:text-sm whitespace-nowrap">
                <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden sm:inline">Featured</span>
                <span className="sm:hidden">Hot</span>
              </TabsTrigger>
              <TabsTrigger value="saved" className="text-xs sm:text-sm whitespace-nowrap">
                <Heart className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden sm:inline">Saved</span>
                <span className="sm:hidden">Saved</span>
              </TabsTrigger>
              <TabsTrigger value="purchases" className="text-xs sm:text-sm whitespace-nowrap">
                <Ticket className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden sm:inline">My Purchases</span>
                <span className="sm:hidden">Mine</span>
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
                  data-offer-id={offer.id}
                  data-source="featured_carousel"
                  ref={(el) => {
                    if (el && observerRef.current && index === featuredIndex) {
                      observerRef.current.observe(el);
                    }
                  }}
                  className={`transition-all duration-500 ${
                    index === featuredIndex ? 'opacity-100' : 'opacity-0 absolute inset-0'
                  }`}
                >
                  <Card 
                    className="bg-[#0F1829] border-[#D4AF37]/30 cursor-pointer hover:border-[#D4AF37] transition-all"
                    onClick={() => handleOfferClick(offer, 'featured_carousel')}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="md:w-1/3">
                          <ImageWithFallback
                            src={Array.isArray(offer.images) && offer.images.length > 0 ? offer.images[0] : offer.image_url}
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
                              <span className="text-3xl text-[#D4AF37]">AED {offer.discounted_price}</span>
                              <span className="text-lg text-[#8B92A7] line-through ml-2">AED {offer.original_price}</span>
                              <Badge className="ml-2 bg-green-500/20 text-green-400">
                                {offer.discount_percent}% OFF
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
                              {offer.redemption_count || 0} claimed
                            </span>
                            <span className="flex items-center">
                              <Eye className="w-4 h-4 mr-1" />
                              {offer.total_views || 0} views
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
                <>
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

                  {/* Carousel Dots */}
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
                </>
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
                  placeholder="Search offers for BYD, NIO, Xpeng..."
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
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        {filteredOffers.length === 0 ? (
          <div className="text-center py-12">
            <Gift className="w-12 h-12 sm:w-16 sm:h-16 text-[#8B92A7] mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl text-[#E8EAED] mb-2">No offers found</h3>
            <p className="text-sm text-[#8B92A7]">Try adjusting your filters</p>
          </div>
        ) : (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6'
              : 'space-y-3 sm:space-y-4'
          }>
            {filteredOffers.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                viewMode={viewMode}
                isFavorited={favoritesMap.get(offer.id) || false}
                onToggleFavorite={handleToggleFavorite}
                onShare={handleShare}
                onClick={() => handleOfferClick(offer, activeTab === 'all' ? 'all_offers' : activeTab)}
                observer={observerRef.current}
                source={activeTab === 'all' ? 'all_offers' : activeTab}
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

      {/* Payment Modal */}
      {offerToPurchase && (
        <OfferPaymentModal
          offer={offerToPurchase}
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setOfferToPurchase(null);
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}

// Offer Card Component
function OfferCard({ offer, viewMode, isFavorited, onToggleFavorite, onShare, onClick, observer, source }: any) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardElement, setCardElement] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (cardElement && observer) {
      cardElement.setAttribute('data-offer-id', offer.id);
      cardElement.setAttribute('data-source', source);
      observer.observe(cardElement);

      return () => {
        observer.unobserve(cardElement);
      };
    }
  }, [cardElement, offer.id, observer, source]);

  const getDaysLeft = (validUntil: string) => {
    const days = Math.ceil((new Date(validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  const daysLeft = getDaysLeft(offer.valid_until);

  if (viewMode === 'list') {
    return (
      <div ref={setCardElement}>
        <Card className="bg-[#0F1829] border-[#1A2332] hover:border-[#D4AF37] transition-all cursor-pointer" onClick={onClick}>
        <CardContent className="p-2.5 sm:p-4">
          <div className="flex gap-2.5 sm:gap-4">
            {/* Image - VERY compact square on mobile */}
            <div className="relative w-16 h-16 sm:w-28 sm:h-28 md:w-32 md:h-32 flex-shrink-0">
              <ImageWithFallback
                src={Array.isArray(offer.images) && offer.images.length > 0 ? offer.images[0] : offer.image_url}
                alt={offer.title}
                className="w-full h-full object-cover rounded-md sm:rounded-lg"
              />
              {/* Featured badge on image for mobile */}
              {offer.is_featured && (
                <div className="absolute -top-1 -left-1 sm:hidden">
                  <div className="w-5 h-5 rounded-full bg-[#D4AF37] flex items-center justify-center">
                    <Star className="w-2.5 h-2.5 text-[#0B1426] fill-current" />
                  </div>
                </div>
              )}
              {/* Discount badge on image for mobile */}
              <div className="absolute -bottom-1 -right-1 sm:hidden">
                <Badge className="bg-green-500 text-white text-[9px] px-1 py-0 h-4">
                  -{offer.discount_percent}%
                </Badge>
              </div>
            </div>
            
            {/* Content - Ultra compact on mobile */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              {/* Top section: Title and badges */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {/* Featured badge for desktop */}
                  {offer.is_featured && (
                    <Badge className="hidden sm:inline-flex bg-[#D4AF37]/20 text-[#D4AF37] mb-1 text-xs px-1.5 py-0.5">
                      <Star className="w-3 h-3 mr-0.5" />
                      FEATURED
                    </Badge>
                  )}
                  {/* Title - single line on mobile */}
                  <h3 className="text-sm sm:text-base md:text-lg text-[#E8EAED] line-clamp-1 leading-tight mb-0.5 sm:mb-1">
                    {offer.title}
                  </h3>
                  {/* Description - hidden on small mobile, single line on larger screens */}
                  <p className="hidden sm:block text-xs sm:text-sm text-[#8B92A7] line-clamp-1 md:line-clamp-2">
                    {offer.description}
                  </p>
                  {/* Category badge on mobile (instead of description) */}
                  <div className="sm:hidden flex items-center gap-1 mt-0.5">
                    <Tag className="w-2.5 h-2.5 text-[#8B92A7]" />
                    <span className="text-[10px] text-[#8B92A7] truncate">{offer.category}</span>
                  </div>
                </div>
                
                {/* Action buttons - desktop only */}
                <div className="hidden lg:flex gap-2 flex-shrink-0">
                  <Button variant="ghost" size="icon" onClick={(e) => onToggleFavorite(offer.id, e)} className={isFavorited ? 'text-red-500' : 'text-[#8B92A7]'}>
                    <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={(e) => onShare(offer, e)} className="text-[#8B92A7]">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Bottom section: Price and meta */}
              <div className="flex items-end justify-between gap-2 mt-1 sm:mt-2">
                {/* Price - prominent */}
                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-0.5 sm:gap-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base sm:text-xl md:text-2xl text-[#D4AF37] font-semibold leading-none">
                      AED {offer.discounted_price}
                    </span>
                    <span className="text-[10px] sm:text-sm text-[#8B92A7] line-through leading-none">
                      {offer.original_price}
                    </span>
                  </div>
                  {/* Discount badge for desktop */}
                  <Badge className="hidden sm:inline-flex bg-green-500/20 text-green-400 text-xs px-1.5 py-0.5">
                    {offer.discount_percent}% OFF
                  </Badge>
                </div>
                
                {/* Meta info - minimal on mobile */}
                <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-[#8B92A7]">
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-3 h-3" />
                    <span className="hidden sm:inline">{daysLeft} days</span>
                    <span className="sm:hidden">{daysLeft}d</span>
                  </span>
                  <span className="hidden sm:flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {offer.total_views || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    );
  }

  // Grid view (vertical card)
  return (
    <div ref={setCardElement}>
      <Card className="bg-[#0F1829] border-[#1A2332] hover:border-[#D4AF37] transition-all cursor-pointer overflow-hidden group" onClick={onClick}>
      {/* Image Section */}
      <div className="relative">
        <ImageWithFallback
          src={Array.isArray(offer.images) && offer.images.length > 0 ? offer.images[0] : offer.image_url}
          alt={offer.title}
          className="w-full h-40 sm:h-44 md:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Featured Badge */}
        {offer.is_featured && (
          <Badge className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-[#D4AF37] text-[#0B1426] text-[10px] sm:text-xs px-1.5 py-0.5">
            <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
            FEATURED
          </Badge>
        )}
        
        {/* Action Buttons */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex gap-1.5 sm:gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="bg-[#0F1829]/80 hover:bg-[#0F1829] h-8 w-8 sm:h-9 sm:w-9" 
            onClick={(e) => onToggleFavorite(offer.id, e)}
          >
            <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-white'}`} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="bg-[#0F1829]/80 hover:bg-[#0F1829] h-8 w-8 sm:h-9 sm:w-9" 
            onClick={(e) => onShare(offer, e)}
          >
            <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </Button>
        </div>
        
        {/* Discount Badge */}
        <Badge className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 bg-green-500 text-white text-[10px] sm:text-xs px-2 py-1">
          {offer.discount_percent}% OFF
        </Badge>
      </div>
      
      {/* Content Section */}
      <CardContent className="p-3 sm:p-4">
        <h3 className="text-base sm:text-lg text-[#E8EAED] mb-1 sm:mb-2 line-clamp-1">{offer.title}</h3>
        <p className="text-xs sm:text-sm text-[#8B92A7] mb-2 sm:mb-3 line-clamp-2">{offer.description}</p>
        
        {/* Price */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
          <span className="text-xl sm:text-2xl text-[#D4AF37]">AED {offer.discounted_price}</span>
          <span className="text-xs sm:text-sm text-[#8B92A7] line-through">AED {offer.original_price}</span>
        </div>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-[10px] sm:text-xs text-[#8B92A7]">
          <span className="flex items-center">
            <Clock className="w-3 h-3 mr-0.5 sm:mr-1" />
            <span className="hidden sm:inline">{daysLeft} days</span>
            <span className="sm:hidden">{daysLeft}d</span>
          </span>
          <span className="flex items-center">
            <Users className="w-3 h-3 mr-0.5 sm:mr-1" />
            {offer.redemption_count || 0}
          </span>
          <span className="flex items-center">
            <Eye className="w-3 h-3 mr-0.5 sm:mr-1" />
            {offer.total_views || 0}
          </span>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}

// Offer Detail Modal Component
function OfferDetailModal({ offer, isOpen, onClose, onClaim, userOffers }: any) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  const images = Array.isArray(offer.images) && offer.images.length > 0 ? offer.images : offer.image_url ? [offer.image_url] : [];

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
          <DialogDescription className="text-[#8B92A7]">{offer.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {images.length > 0 && (
            <div>
              <div className="relative rounded-lg overflow-hidden mb-3">
                <ImageWithFallback src={images[selectedImageIndex]} alt={offer.title} className="w-full h-80 object-cover" />
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
                    <button key={idx} onClick={() => setSelectedImageIndex(idx)} className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${idx === selectedImageIndex ? 'border-[#D4AF37]' : 'border-[#1A2332]'}`}>
                      <ImageWithFallback src={img} alt={`${offer.title} ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="bg-[#0B1426] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl text-[#D4AF37]">AED {offer.discounted_price}</span>
                  <span className="text-xl text-[#8B92A7] line-through">AED {offer.original_price}</span>
                </div>
                <p className="text-sm text-[#8B92A7] mt-1">Save AED {offer.original_price - offer.discounted_price}</p>
              </div>
              <Badge className="bg-green-500/20 text-green-400 text-lg px-4 py-2">{offer.discount_percent}% OFF</Badge>
            </div>
          </div>

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
              <p className="text-[#E8EAED]">{offer.redemption_count || 0} people</p>
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

          {offer.terms && (
            <div className="bg-[#0B1426] rounded-lg p-4">
              <h4 className="text-[#E8EAED] mb-2 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Terms & Conditions
              </h4>
              <p className="text-sm text-[#8B92A7] whitespace-pre-line">{offer.terms}</p>
            </div>
          )}

          {isClaimed && userOffer.redemption_code && (
            <div className="bg-gradient-to-r from-[#D4AF37]/10 to-[#0F1829] rounded-lg p-4 border border-[#D4AF37]/30">
              <h4 className="text-[#E8EAED] mb-3 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-[#D4AF37]" />
                Your Redemption Code
              </h4>
              <div className="bg-[#0B1426] rounded-lg p-4 flex items-center justify-between">
                <code className="text-2xl text-[#D4AF37] tracking-wider">{userOffer.redemption_code}</code>
                <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(userOffer.redemption_code); toast('Copied to clipboard!', { icon: '✓' }); }}>
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

          {!isClaimed && (
            <Button className="w-full bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#0B1426]" size="lg" onClick={() => onClaim(offer)}>
              <CreditCard className="w-5 h-5 mr-2" />
              Purchase for AED {offer.offer_price}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
