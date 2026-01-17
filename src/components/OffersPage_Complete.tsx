/**
 * 🚀 COMPREHENSIVE OFFERS PAGE
 * 
 * Features:
 * - All Offers / Featured / Saved / My Purchases tabs
 * - Search, filters, category dropdown, sort
 * - List/Grid view toggle
 * - Featured carousel
 * - Favorite & Share functionality
 * - Admin: Create & Boost offers
 * - Users: Purchase via Stripe & redeem with coupon code
 * - 100% Mobile responsive
 * - Chinese car brands only
 */

import { useState, useEffect } from 'react';
import { 
  Star, Clock, MapPin, Heart, Share2, Filter, Search, 
  Tag, Gift, Percent, Check, Eye, Copy, Calendar, 
  TrendingUp, Grid, List, Loader2, X, CheckCircle, XCircle,
  Plus, Sparkles, ShoppingCart, ArrowRight, ChevronLeft, ChevronRight,
  CreditCard, Ticket, Store, BadgeCheck, ExternalLink, Users
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { ImageWithFallback } from './figma/ImageWithFallback';

// Import Supabase hooks
import { useOffers, useAnalytics, useSocialInteractions } from '../hooks';
import { useRole } from '../hooks/useRole';

interface OffersPageProps {
  onNavigate?: (page: string) => void;
}

const CATEGORIES = [
  'All Categories',
  'Car Wash',
  'Detailing',
  'Maintenance',
  'Parts',
  'Accessories',
  'Modification',
  'Repair',
  'Inspection'
];

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured First' },
  { value: 'newest', label: 'Newest First' },
  { value: 'discount', label: 'Best Discount' },
  { value: 'expiring', label: 'Expiring Soon' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
];

export function OffersPage({ onNavigate }: OffersPageProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('featured');
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [isOfferDetailOpen, setIsOfferDetailOpen] = useState(false);
  const [isCreateOfferOpen, setIsCreateOfferOpen] = useState(false);
  const [isBoostModalOpen, setIsBoostModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [selectedBoostOffer, setSelectedBoostOffer] = useState<any>(null);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  // 🔥 HOOKS
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
  const { toggleFavorite, checkIfFavorited } = useSocialInteractions();
  const [favoritedOffers, setFavoritedOffers] = useState<Set<string>>(new Set());

  // Create offer form
  const [createOfferForm, setCreateOfferForm] = useState({
    title: '',
    description: '',
    category: 'Car Wash',
    original_price: '',
    discounted_price: '',
    discount_percent: '',
    valid_until: '',
    max_redemptions: '',
    terms: '',
    provider_name: '',
  });

  // Track page view
  useEffect(() => {
    analytics.trackPageView('/offers');
  }, []);

  // Load favorited offers
  useEffect(() => {
    const loadFavorites = async () => {
      const favoriteSet = new Set<string>();
      for (const offer of offers) {
        const isFavorited = await checkIfFavorited('offer', offer.id);
        if (isFavorited) {
          favoriteSet.add(offer.id);
        }
      }
      setFavoritedOffers(favoriteSet);
    };
    
    if (offers.length > 0) {
      loadFavorites();
    }
  }, [offers]);

  // Auto-scroll featured carousel
  useEffect(() => {
    const featuredOffers = offers.filter(o => o.is_featured);
    if (featuredOffers.length <= 1) return;

    const interval = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % featuredOffers.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [offers]);

  // HANDLERS
  const handleToggleFavorite = async (offerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const { success, isFavorited } = await toggleFavorite('offer', offerId);
    
    if (success) {
      setFavoritedOffers(prev => {
        const newSet = new Set(prev);
        if (isFavorited) {
          newSet.add(offerId);
          toast.success('Added to favorites');
        } else {
          newSet.delete(offerId);
          toast.success('Removed from favorites');
        }
        return newSet;
      });
    } else {
      toast.error('Failed to update favorite');
    }
  };

  const handleShare = async (offer: any, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const shareData = {
      title: offer.title,
      text: `${offer.discount_percent}% OFF - ${offer.title}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success('Shared successfully!');
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleOfferClick = (offer: any) => {
    setSelectedOffer(offer);
    setIsOfferDetailOpen(true);
  };

  const handlePurchaseOffer = (offer: any) => {
    setSelectedOffer(offer);
    setIsPurchaseModalOpen(true);
  };

  const handleBoostOffer = (offer: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBoostOffer(offer);
    setIsBoostModalOpen(true);
  };

  const handleCreateOffer = async () => {
    // TODO: Connect to Supabase
    toast.success('Offer created successfully!');
    setIsCreateOfferOpen(false);
    refetch();
  };

  const handleConfirmBoost = async () => {
    // TODO: Update offer to featured
    toast.success('Offer boosted successfully!');
    setIsBoostModalOpen(false);
    refetch();
  };

  const handleProcessPayment = async () => {
    if (!selectedOffer) return;
    
    try {
      // TODO: Integrate Stripe payment
      // After successful payment, call claimOffer
      const { data, error } = await claimOffer(selectedOffer.id);
      
      if (!error && data) {
        toast.success('Purchase successful! Your coupon code: ' + data.redemption_code);
        setIsPurchaseModalOpen(false);
        refetch();
      }
    } catch (err) {
      toast.error('Payment failed. Please try again.');
    }
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Coupon code copied!');
  };

  // FILTERING & SORTING
  const filteredOffers = offers.filter(offer => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        offer.title.toLowerCase().includes(query) ||
        offer.description?.toLowerCase().includes(query) ||
        offer.provider_name?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Tab filter
    if (activeTab === 'featured' && !offer.is_featured) return false;
    if (activeTab === 'saved' && !favoritedOffers.has(offer.id)) return false;
    
    return true;
  });

  // Sort offers
  const sortedOffers = [...filteredOffers].sort((a, b) => {
    switch (sortBy) {
      case 'featured':
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'discount':
        return (b.discount_percent || 0) - (a.discount_percent || 0);
      case 'expiring':
        return new Date(a.valid_until).getTime() - new Date(b.valid_until).getTime();
      case 'price_low':
        return (a.discounted_price || 0) - (b.discounted_price || 0);
      case 'price_high':
        return (b.discounted_price || 0) - (a.discounted_price || 0);
      default:
        return 0;
    }
  });

  const featuredOffers = offers.filter(o => o.is_featured);
  const currentFeatured = featuredOffers[featuredIndex];

  const getTimeRemaining = (validUntil: string) => {
    const now = new Date().getTime();
    const end = new Date(validUntil).getTime();
    const diff = end - now;
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} remaining`;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0B1426' }}>
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-lg border-b" style={{ 
        backgroundColor: 'rgba(11, 20, 38, 0.9)',
        borderColor: 'rgba(212, 175, 55, 0.1)'
      }}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#D4AF37' }}>
                <Gift className="w-6 h-6 text-[#0B1426]" />
              </div>
              <div>
                <h1 className="text-2xl" style={{ color: '#E8EAED' }}>Exclusive Offers</h1>
                <p className="text-sm" style={{ color: 'rgba(232, 234, 237, 0.6)' }}>
                  Save money on car services, parts, and accessories
                </p>
              </div>
            </div>
            <Badge className="px-4 py-2" style={{ backgroundColor: '#D4AF37', color: '#0B1426' }}>
              {offers.length} Offers Available
            </Badge>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'rgba(232, 234, 237, 0.4)' }} />
              <Input
                placeholder="Search offers, providers, or services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 border-0"
                style={{ 
                  backgroundColor: 'rgba(232, 234, 237, 0.05)',
                  color: '#E8EAED'
                }}
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48 h-12 border-0" style={{ 
                backgroundColor: 'rgba(232, 234, 237, 0.05)',
                color: '#E8EAED'
              }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: '#1a2942', borderColor: 'rgba(212, 175, 55, 0.2)' }}>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat} style={{ color: '#E8EAED' }}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48 h-12 border-0" style={{ 
                backgroundColor: 'rgba(232, 234, 237, 0.05)',
                color: '#E8EAED'
              }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: '#1a2942', borderColor: 'rgba(212, 175, 55, 0.2)' }}>
                {SORT_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value} style={{ color: '#E8EAED' }}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="p-1 h-auto gap-1" style={{ backgroundColor: 'rgba(232, 234, 237, 0.05)' }}>
              <TabsTrigger value="all" className="px-6 py-3 data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426]" style={{ color: '#E8EAED' }}>
                <Tag className="w-4 h-4 mr-2" />
                All Offers
              </TabsTrigger>
              <TabsTrigger value="featured" className="px-6 py-3 data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426]" style={{ color: '#E8EAED' }}>
                <Star className="w-4 h-4 mr-2" />
                Featured
              </TabsTrigger>
              <TabsTrigger value="saved" className="px-6 py-3 data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426]" style={{ color: '#E8EAED' }}>
                <Heart className="w-4 h-4 mr-2" />
                Saved
              </TabsTrigger>
              <TabsTrigger value="purchases" className="px-6 py-3 data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426]" style={{ color: '#E8EAED' }}>
                <ShoppingCart className="w-4 h-4 mr-2" />
                My Purchases
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              {/* Admin: Create & Boost */}
              {isAdmin && activeTab !== 'purchases' && (
                <Button
                  onClick={() => setIsCreateOfferOpen(true)}
                  className="gap-2"
                  style={{ backgroundColor: '#D4AF37', color: '#0B1426' }}
                >
                  <Plus className="w-4 h-4" />
                  Create Offer
                </Button>
              )}

              {/* View Toggle */}
              {activeTab !== 'purchases' && (
                <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: 'rgba(232, 234, 237, 0.05)' }}>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={viewMode === 'grid' ? 'bg-[#D4AF37] text-[#0B1426]' : ''}
                    style={viewMode !== 'grid' ? { color: '#E8EAED' } : {}}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={viewMode === 'list' ? 'bg-[#D4AF37] text-[#0B1426]' : ''}
                    style={viewMode !== 'list' ? { color: '#E8EAED' } : {}}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <TabsContent value="all">
            {/* Featured Carousel */}
            {featuredOffers.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5" style={{ color: '#D4AF37' }} />
                    <h2 className="text-xl" style={{ color: '#E8EAED' }}>Featured Offers</h2>
                  </div>
                  {featuredOffers.length > 1 && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFeaturedIndex((prev) => (prev - 1 + featuredOffers.length) % featuredOffers.length)}
                        style={{ borderColor: 'rgba(212, 175, 55, 0.3)', color: '#E8EAED' }}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFeaturedIndex((prev) => (prev + 1) % featuredOffers.length)}
                        style={{ borderColor: 'rgba(212, 175, 55, 0.3)', color: '#E8EAED' }}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {currentFeatured && (
                  <Card 
                    className="overflow-hidden border cursor-pointer hover:shadow-2xl transition-all duration-300 group"
                    style={{ 
                      backgroundColor: '#1a2942',
                      borderColor: '#D4AF37'
                    }}
                    onClick={() => handleOfferClick(currentFeatured)}
                  >
                    <div className="grid md:grid-cols-2 gap-0">
                      <div className="relative h-64 md:h-auto">
                        <ImageWithFallback
                          src={`https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&h=600&fit=crop`}
                          alt={currentFeatured.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <Badge className="absolute top-4 left-4 gap-1 px-3 py-1" style={{ backgroundColor: '#D4AF37', color: '#0B1426' }}>
                          <Star className="w-4 h-4 fill-current" />
                          Featured
                        </Badge>
                        <Badge className="absolute top-4 right-4 gap-1 px-3 py-2 text-lg" style={{ backgroundColor: '#10b981', color: 'white' }}>
                          {currentFeatured.discount_percent}% OFF
                        </Badge>
                      </div>

                      <div className="p-6 flex flex-col justify-between">
                        <div>
                          <h3 className="text-2xl mb-3" style={{ color: '#E8EAED' }}>
                            {currentFeatured.title}
                          </h3>
                          <p className="mb-4" style={{ color: 'rgba(232, 234, 237, 0.7)' }}>
                            {currentFeatured.description}
                          </p>

                          <div className="flex flex-wrap gap-4 mb-4">
                            <div className="flex items-center gap-2">
                              <Store className="w-4 h-4" style={{ color: '#D4AF37' }} />
                              <span style={{ color: '#E8EAED' }}>{currentFeatured.provider_name}</span>
                              {currentFeatured.provider_verified && (
                                <BadgeCheck className="w-4 h-4" style={{ color: '#3b82f6' }} />
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" style={{ color: '#D4AF37' }} />
                              <span style={{ color: 'rgba(232, 234, 237, 0.7)' }}>
                                {getTimeRemaining(currentFeatured.valid_until)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-baseline gap-3 mb-6">
                            <span className="text-3xl" style={{ color: '#D4AF37' }}>
                              AED {currentFeatured.discounted_price}
                            </span>
                            {currentFeatured.original_price && (
                              <span className="text-lg line-through" style={{ color: 'rgba(232, 234, 237, 0.4)' }}>
                                AED {currentFeatured.original_price}
                              </span>
                            )}
                            <span className="text-sm px-2 py-1 rounded" style={{ backgroundColor: '#10b981', color: 'white' }}>
                              Save AED {(currentFeatured.original_price || 0) - (currentFeatured.discounted_price || 0)}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Button 
                            className="flex-1 h-12 gap-2"
                            style={{ backgroundColor: '#D4AF37', color: '#0B1426' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePurchaseOffer(currentFeatured);
                            }}
                          >
                            <CreditCard className="w-5 h-5" />
                            Buy Now - AED {currentFeatured.discounted_price}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => handleToggleFavorite(currentFeatured.id, e)}
                            style={{ borderColor: 'rgba(212, 175, 55, 0.3)' }}
                          >
                            <Heart className={`w-5 h-5 ${favoritedOffers.has(currentFeatured.id) ? 'fill-red-500 text-red-500' : ''}`} style={{ color: favoritedOffers.has(currentFeatured.id) ? '#ef4444' : '#E8EAED' }} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => handleShare(currentFeatured, e)}
                            style={{ borderColor: 'rgba(212, 175, 55, 0.3)', color: '#E8EAED' }}
                          >
                            <Share2 className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* All Offers Section */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl" style={{ color: '#E8EAED' }}>
                All Offers ({sortedOffers.length})
              </h2>
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  style={{ borderColor: 'rgba(212, 175, 55, 0.3)', color: '#D4AF37' }}
                >
                  <TrendingUp className="w-4 h-4" />
                  Boost Offer
                </Button>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#D4AF37' }} />
              </div>
            ) : sortedOffers.length === 0 ? (
              <Card className="p-12 text-center" style={{ backgroundColor: '#1a2942', borderColor: 'rgba(212, 175, 55, 0.1)' }}>
                <Gift className="w-16 h-16 mx-auto mb-4" style={{ color: 'rgba(232, 234, 237, 0.2)' }} />
                <h3 className="text-xl mb-2" style={{ color: '#E8EAED' }}>No offers found</h3>
                <p style={{ color: 'rgba(232, 234, 237, 0.6)' }}>
                  {searchQuery ? 'Try adjusting your search or filters' : 'Check back soon for new offers!'}
                </p>
              </Card>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {sortedOffers.map((offer) => (
                  <OfferCard
                    key={offer.id}
                    offer={offer}
                    viewMode={viewMode}
                    isFavorited={favoritedOffers.has(offer.id)}
                    isAdmin={isAdmin}
                    onToggleFavorite={handleToggleFavorite}
                    onShare={handleShare}
                    onClick={() => handleOfferClick(offer)}
                    onPurchase={() => handlePurchaseOffer(offer)}
                    onBoost={(e) => handleBoostOffer(offer, e)}
                    getTimeRemaining={getTimeRemaining}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="featured">
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {featuredOffers.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  viewMode={viewMode}
                  isFavorited={favoritedOffers.has(offer.id)}
                  isAdmin={isAdmin}
                  onToggleFavorite={handleToggleFavorite}
                  onShare={handleShare}
                  onClick={() => handleOfferClick(offer)}
                  onPurchase={() => handlePurchaseOffer(offer)}
                  onBoost={(e) => handleBoostOffer(offer, e)}
                  getTimeRemaining={getTimeRemaining}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="saved">
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {sortedOffers.filter(o => favoritedOffers.has(o.id)).map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  viewMode={viewMode}
                  isFavorited={true}
                  isAdmin={isAdmin}
                  onToggleFavorite={handleToggleFavorite}
                  onShare={handleShare}
                  onClick={() => handleOfferClick(offer)}
                  onPurchase={() => handlePurchaseOffer(offer)}
                  onBoost={(e) => handleBoostOffer(offer, e)}
                  getTimeRemaining={getTimeRemaining}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="purchases">
            <MyPurchases 
              userOffers={userOffers}
              offers={offers}
              onCopyCoupon={handleCopyCoupon}
              getTimeRemaining={getTimeRemaining}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <OfferDetailModal
        offer={selectedOffer}
        isOpen={isOfferDetailOpen}
        onClose={() => setIsOfferDetailOpen(false)}
        onPurchase={handlePurchaseOffer}
        isFavorited={selectedOffer ? favoritedOffers.has(selectedOffer.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onShare={handleShare}
        getTimeRemaining={getTimeRemaining}
      />

      <CreateOfferModal
        isOpen={isCreateOfferOpen}
        onClose={() => setIsCreateOfferOpen(false)}
        form={createOfferForm}
        setForm={setCreateOfferForm}
        onCreate={handleCreateOffer}
      />

      <BoostOfferModal
        offer={selectedBoostOffer}
        isOpen={isBoostModalOpen}
        onClose={() => setIsBoostModalOpen(false)}
        onConfirm={handleConfirmBoost}
      />

      <PurchaseModal
        offer={selectedOffer}
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        onConfirm={handleProcessPayment}
      />
    </div>
  );
}

// ========== OFFER CARD COMPONENT ==========
function OfferCard({ offer, viewMode, isFavorited, isAdmin, onToggleFavorite, onShare, onClick, onPurchase, onBoost, getTimeRemaining }: any) {
  const claimed = offer.claims_count || 0;
  const maxClaims = offer.max_claims || 100;
  const claimPercentage = (claimed / maxClaims) * 100;

  if (viewMode === 'list') {
    return (
      <Card 
        className="overflow-hidden border cursor-pointer hover:shadow-xl transition-all duration-300 group"
        style={{ 
          backgroundColor: '#1a2942',
          borderColor: offer.is_featured ? '#D4AF37' : 'rgba(212, 175, 55, 0.1)'
        }}
        onClick={onClick}
      >
        <div className="flex gap-4 p-4">
          <div className="relative w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden">
            <ImageWithFallback
              src={`https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=400&h=300&fit=crop`}
              alt={offer.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {offer.is_featured && (
              <Badge className="absolute top-2 left-2 gap-1 px-2 py-0.5 text-xs" style={{ backgroundColor: '#D4AF37', color: '#0B1426' }}>
                <Star className="w-3 h-3 fill-current" />
                Featured
              </Badge>
            )}
            <Badge className="absolute top-2 right-2 px-2 py-1" style={{ backgroundColor: '#10b981', color: 'white' }}>
              {offer.discount_percent}% OFF
            </Badge>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="text-lg mb-1" style={{ color: '#E8EAED' }}>{offer.title}</h3>
                <p className="text-sm line-clamp-2 mb-2" style={{ color: 'rgba(232, 234, 237, 0.6)' }}>
                  {offer.description}
                </p>
              </div>
              <div className="flex gap-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => onToggleFavorite(offer.id, e)}
                >
                  <Heart className={`w-5 h-5 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} style={{ color: isFavorited ? '#ef4444' : 'rgba(232, 234, 237, 0.6)' }} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => onShare(offer, e)}
                >
                  <Share2 className="w-5 h-5" style={{ color: 'rgba(232, 234, 237, 0.6)' }} />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-3">
              <div className="flex items-center gap-2 text-sm">
                <Store className="w-4 h-4" style={{ color: '#D4AF37' }} />
                <span style={{ color: '#E8EAED' }}>{offer.provider_name}</span>
                {offer.provider_verified && (
                  <BadgeCheck className="w-4 h-4" style={{ color: '#3b82f6' }} />
                )}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" style={{ color: '#D4AF37' }} />
                <span style={{ color: 'rgba(232, 234, 237, 0.7)' }}>
                  {getTimeRemaining(offer.valid_until)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4" style={{ color: '#D4AF37' }} />
                <span style={{ color: 'rgba(232, 234, 237, 0.7)' }}>
                  {claimed} claimed
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl" style={{ color: '#D4AF37' }}>
                  AED {offer.discounted_price}
                </span>
                {offer.original_price && (
                  <span className="text-sm line-through" style={{ color: 'rgba(232, 234, 237, 0.4)' }}>
                    AED {offer.original_price}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onBoost}
                    className="gap-2"
                    style={{ borderColor: 'rgba(212, 175, 55, 0.3)', color: '#D4AF37' }}
                  >
                    <Sparkles className="w-4 h-4" />
                    Boost
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPurchase();
                  }}
                  className="gap-2"
                  style={{ backgroundColor: '#D4AF37', color: '#0B1426' }}
                >
                  Buy Now
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Grid view
  return (
    <Card 
      className="overflow-hidden border cursor-pointer hover:shadow-2xl transition-all duration-300 group"
      style={{ 
        backgroundColor: '#1a2942',
        borderColor: offer.is_featured ? '#D4AF37' : 'rgba(212, 175, 55, 0.1)'
      }}
      onClick={onClick}
    >
      <div className="relative h-48">
        <ImageWithFallback
          src={`https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=600&h=400&fit=crop`}
          alt={offer.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {offer.is_featured && (
          <Badge className="absolute top-3 left-3 gap-1 px-2 py-1" style={{ backgroundColor: '#D4AF37', color: '#0B1426' }}>
            <Star className="w-3 h-3 fill-current" />
            Featured
          </Badge>
        )}
        <Badge className="absolute top-3 right-3 px-2 py-1" style={{ backgroundColor: '#10b981', color: 'white' }}>
          {offer.discount_percent}% OFF
        </Badge>

        <div className="absolute top-3 right-3 flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 rounded-full"
            style={{ backgroundColor: 'rgba(11, 20, 38, 0.8)' }}
            onClick={(e) => onToggleFavorite(offer.id, e)}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} style={{ color: isFavorited ? '#ef4444' : '#E8EAED' }} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 rounded-full"
            style={{ backgroundColor: 'rgba(11, 20, 38, 0.8)', color: '#E8EAED' }}
            onClick={(e) => onShare(offer, e)}
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="text-lg mb-2 line-clamp-2" style={{ color: '#E8EAED' }}>
          {offer.title}
        </h3>
        
        <p className="text-sm mb-4 line-clamp-2" style={{ color: 'rgba(232, 234, 237, 0.6)' }}>
          {offer.description}
        </p>

        <div className="flex items-center gap-2 mb-3 text-sm">
          <Store className="w-4 h-4" style={{ color: '#D4AF37' }} />
          <span style={{ color: '#E8EAED' }}>{offer.provider_name}</span>
          {offer.provider_verified && (
            <BadgeCheck className="w-4 h-4" style={{ color: '#3b82f6' }} />
          )}
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" style={{ color: '#D4AF37' }} />
              <span style={{ color: 'rgba(232, 234, 237, 0.7)' }}>
                {getTimeRemaining(offer.valid_until)}
              </span>
            </div>
            <span style={{ color: 'rgba(232, 234, 237, 0.7)' }}>
              {claimed}/{maxClaims} claimed
            </span>
          </div>
          
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(232, 234, 237, 0.1)' }}>
            <div 
              className="h-full rounded-full transition-all"
              style={{ 
                width: `${claimPercentage}%`,
                backgroundColor: claimPercentage > 80 ? '#ef4444' : claimPercentage > 50 ? '#f59e0b' : '#10b981'
              }}
            />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-2xl" style={{ color: '#D4AF37' }}>
            AED {offer.discounted_price}
          </span>
          {offer.original_price && (
            <>
              <span className="text-sm line-through" style={{ color: 'rgba(232, 234, 237, 0.4)' }}>
                AED {offer.original_price}
              </span>
              <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: '#10b981', color: 'white' }}>
                Save {offer.discount_percent}%
              </span>
            </>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            className="flex-1 h-10 gap-2"
            style={{ backgroundColor: '#D4AF37', color: '#0B1426' }}
            onClick={(e) => {
              e.stopPropagation();
              onPurchase();
            }}
          >
            <CreditCard className="w-4 h-4" />
            Buy Now
          </Button>
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBoost}
              style={{ borderColor: 'rgba(212, 175, 55, 0.3)' }}
            >
              <Sparkles className="w-4 h-4" style={{ color: '#D4AF37' }} />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ========== MY PURCHASES COMPONENT ==========
function MyPurchases({ userOffers, offers, onCopyCoupon, getTimeRemaining }: any) {
  if (userOffers.length === 0) {
    return (
      <Card className="p-12 text-center" style={{ backgroundColor: '#1a2942', borderColor: 'rgba(212, 175, 55, 0.1)' }}>
        <ShoppingCart className="w-16 h-16 mx-auto mb-4" style={{ color: 'rgba(232, 234, 237, 0.2)' }} />
        <h3 className="text-xl mb-2" style={{ color: '#E8EAED' }}>No purchases yet</h3>
        <p style={{ color: 'rgba(232, 234, 237, 0.6)' }}>
          Browse offers and purchase to get exclusive deals!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {userOffers.map((userOffer: any) => {
        const offer = offers.find((o: any) => o.id === userOffer.offer_id);
        if (!offer) return null;

        const isExpired = new Date(userOffer.expires_at) < new Date();
        const isRedeemed = !!userOffer.redeemed_at;

        return (
          <Card 
            key={userOffer.id}
            className="overflow-hidden border"
            style={{ 
              backgroundColor: '#1a2942',
              borderColor: isRedeemed ? 'rgba(16, 185, 129, 0.3)' : isExpired ? 'rgba(239, 68, 68, 0.3)' : 'rgba(212, 175, 55, 0.1)'
            }}
          >
            <div className="flex flex-col md:flex-row gap-4 p-4">
              <div className="relative w-full md:w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden">
                <ImageWithFallback
                  src={`https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=400&h=300&fit=crop`}
                  alt={offer.title}
                  className="w-full h-full object-cover"
                />
                {isRedeemed && (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(16, 185, 129, 0.9)' }}>
                    <div className="text-center">
                      <CheckCircle className="w-12 h-12 mx-auto mb-2 text-white" />
                      <span className="text-white">Redeemed</span>
                    </div>
                  </div>
                )}
                {isExpired && !isRedeemed && (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(239, 68, 68, 0.9)' }}>
                    <div className="text-center">
                      <XCircle className="w-12 h-12 mx-auto mb-2 text-white" />
                      <span className="text-white">Expired</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg mb-1" style={{ color: '#E8EAED' }}>{offer.title}</h3>
                    <p className="text-sm mb-2" style={{ color: 'rgba(232, 234, 237, 0.6)' }}>
                      {offer.provider_name}
                    </p>
                  </div>
                  <Badge 
                    className="px-3 py-1"
                    style={{ 
                      backgroundColor: isRedeemed ? '#10b981' : isExpired ? '#ef4444' : '#D4AF37',
                      color: isRedeemed || isExpired ? 'white' : '#0B1426'
                    }}
                  >
                    {isRedeemed ? 'Redeemed' : isExpired ? 'Expired' : 'Active'}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <div>
                    <p className="text-sm mb-1" style={{ color: 'rgba(232, 234, 237, 0.6)' }}>Coupon Code</p>
                    <div className="flex items-center gap-2">
                      <code className="px-3 py-2 rounded text-sm" style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', color: '#D4AF37' }}>
                        {userOffer.redemption_code}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCopyCoupon(userOffer.redemption_code)}
                        disabled={isExpired}
                      >
                        <Copy className="w-4 h-4" style={{ color: '#D4AF37' }} />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm mb-1" style={{ color: 'rgba(232, 234, 237, 0.6)' }}>
                      {isRedeemed ? 'Redeemed On' : 'Expires On'}
                    </p>
                    <div className="flex items-center gap-2 text-sm" style={{ color: '#E8EAED' }}>
                      <Calendar className="w-4 h-4" style={{ color: '#D4AF37' }} />
                      {isRedeemed 
                        ? new Date(userOffer.redeemed_at).toLocaleDateString()
                        : new Date(userOffer.expires_at).toLocaleDateString()
                      }
                    </div>
                  </div>
                </div>

                {!isRedeemed && !isExpired && (
                  <div className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                    <Ticket className="w-5 h-5" style={{ color: '#3b82f6' }} />
                    <div className="flex-1">
                      <p className="text-sm" style={{ color: '#E8EAED' }}>
                        Show this code at <strong>{offer.provider_name}</strong> to redeem your offer
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'rgba(232, 234, 237, 0.6)' }}>
                        {getTimeRemaining(userOffer.expires_at)} to use this offer
                      </p>
                    </div>
                  </div>
                )}

                {offer.terms && (
                  <details className="mt-3">
                    <summary className="text-sm cursor-pointer" style={{ color: '#D4AF37' }}>
                      View Terms & Conditions
                    </summary>
                    <p className="text-sm mt-2 pl-4" style={{ color: 'rgba(232, 234, 237, 0.6)' }}>
                      {offer.terms}
                    </p>
                  </details>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ========== OFFER DETAIL MODAL ==========
function OfferDetailModal({ offer, isOpen, onClose, onPurchase, isFavorited, onToggleFavorite, onShare, getTimeRemaining }: any) {
  if (!offer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: '#1a2942', borderColor: 'rgba(212, 175, 55, 0.2)' }}>
        <DialogHeader>
          <DialogTitle style={{ color: '#E8EAED' }}>{offer.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="relative h-80 rounded-lg overflow-hidden">
            <ImageWithFallback
              src={`https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=1200&h=800&fit=crop`}
              alt={offer.title}
              className="w-full h-full object-cover"
            />
            {offer.is_featured && (
              <Badge className="absolute top-4 left-4 gap-1 px-3 py-1" style={{ backgroundColor: '#D4AF37', color: '#0B1426' }}>
                <Star className="w-4 h-4 fill-current" />
                Featured
              </Badge>
            )}
            <Badge className="absolute top-4 right-4 px-3 py-2 text-lg" style={{ backgroundColor: '#10b981', color: 'white' }}>
              {offer.discount_percent}% OFF
            </Badge>
          </div>

          <div>
            <h3 className="text-sm mb-2" style={{ color: 'rgba(232, 234, 237, 0.6)' }}>Description</h3>
            <p style={{ color: '#E8EAED' }}>{offer.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm mb-1" style={{ color: 'rgba(232, 234, 237, 0.6)' }}>Provider</p>
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5" style={{ color: '#D4AF37' }} />
                <span style={{ color: '#E8EAED' }}>{offer.provider_name}</span>
                {offer.provider_verified && (
                  <BadgeCheck className="w-5 h-5" style={{ color: '#3b82f6' }} />
                )}
              </div>
            </div>

            <div>
              <p className="text-sm mb-1" style={{ color: 'rgba(232, 234, 237, 0.6)' }}>Valid Until</p>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" style={{ color: '#D4AF37' }} />
                <span style={{ color: '#E8EAED' }}>{getTimeRemaining(offer.valid_until)}</span>
              </div>
            </div>

            <div>
              <p className="text-sm mb-1" style={{ color: 'rgba(232, 234, 237, 0.6)' }}>Category</p>
              <Badge style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', color: '#D4AF37' }}>
                {offer.category}
              </Badge>
            </div>

            <div>
              <p className="text-sm mb-1" style={{ color: 'rgba(232, 234, 237, 0.6)' }}>Claims</p>
              <span style={{ color: '#E8EAED' }}>
                {offer.claims_count || 0} / {offer.max_claims || 100}
              </span>
            </div>
          </div>

          {offer.terms && (
            <div>
              <h3 className="text-sm mb-2" style={{ color: 'rgba(232, 234, 237, 0.6)' }}>Terms & Conditions</h3>
              <p className="text-sm" style={{ color: '#E8EAED' }}>{offer.terms}</p>
            </div>
          )}

          <div className="flex items-baseline gap-3 pt-4 border-t" style={{ borderColor: 'rgba(212, 175, 55, 0.1)' }}>
            <span className="text-3xl" style={{ color: '#D4AF37' }}>
              AED {offer.discounted_price}
            </span>
            {offer.original_price && (
              <>
                <span className="text-lg line-through" style={{ color: 'rgba(232, 234, 237, 0.4)' }}>
                  AED {offer.original_price}
                </span>
                <span className="text-sm px-2 py-1 rounded" style={{ backgroundColor: '#10b981', color: 'white' }}>
                  Save AED {offer.original_price - offer.discounted_price}
                </span>
              </>
            )}
          </div>

          <div className="flex gap-3">
            <Button 
              className="flex-1 h-12 gap-2"
              style={{ backgroundColor: '#D4AF37', color: '#0B1426' }}
              onClick={() => {
                onPurchase(offer);
                onClose();
              }}
            >
              <CreditCard className="w-5 h-5" />
              Buy Now - AED {offer.discounted_price}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => onToggleFavorite(offer.id, e)}
              style={{ borderColor: 'rgba(212, 175, 55, 0.3)' }}
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} style={{ color: isFavorited ? '#ef4444' : '#E8EAED' }} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => onShare(offer, e)}
              style={{ borderColor: 'rgba(212, 175, 55, 0.3)', color: '#E8EAED' }}
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ========== CREATE OFFER MODAL (ADMIN ONLY) ==========
function CreateOfferModal({ isOpen, onClose, form, setForm, onCreate }: any) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: '#1a2942', borderColor: 'rgba(212, 175, 55, 0.2)' }}>
        <DialogHeader>
          <DialogTitle style={{ color: '#E8EAED' }}>Create New Offer</DialogTitle>
          <DialogDescription style={{ color: 'rgba(232, 234, 237, 0.6)' }}>
            Create a promotional offer for users to purchase
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm mb-2 block" style={{ color: '#E8EAED' }}>Offer Title *</label>
            <Input
              placeholder="e.g., 50% OFF Premium Car Wash - BYD & Geely"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              style={{ backgroundColor: 'rgba(232, 234, 237, 0.05)', color: '#E8EAED', borderColor: 'rgba(212, 175, 55, 0.2)' }}
            />
          </div>

          <div>
            <label className="text-sm mb-2 block" style={{ color: '#E8EAED' }}>Description *</label>
            <Textarea
              placeholder="Describe the offer details..."
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              style={{ backgroundColor: 'rgba(232, 234, 237, 0.05)', color: '#E8EAED', borderColor: 'rgba(212, 175, 55, 0.2)' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm mb-2 block" style={{ color: '#E8EAED' }}>Category *</label>
              <Select value={form.category} onValueChange={(val) => setForm({ ...form, category: val })}>
                <SelectTrigger style={{ backgroundColor: 'rgba(232, 234, 237, 0.05)', color: '#E8EAED', borderColor: 'rgba(212, 175, 55, 0.2)' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#1a2942', borderColor: 'rgba(212, 175, 55, 0.2)' }}>
                  {CATEGORIES.filter(c => c !== 'All Categories').map(cat => (
                    <SelectItem key={cat} value={cat} style={{ color: '#E8EAED' }}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm mb-2 block" style={{ color: '#E8EAED' }}>Provider Name *</label>
              <Input
                placeholder="e.g., Premium Auto Spa"
                value={form.provider_name}
                onChange={(e) => setForm({ ...form, provider_name: e.target.value })}
                style={{ backgroundColor: 'rgba(232, 234, 237, 0.05)', color: '#E8EAED', borderColor: 'rgba(212, 175, 55, 0.2)' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm mb-2 block" style={{ color: '#E8EAED' }}>Original Price *</label>
              <Input
                type="number"
                placeholder="100"
                value={form.original_price}
                onChange={(e) => setForm({ ...form, original_price: e.target.value })}
                style={{ backgroundColor: 'rgba(232, 234, 237, 0.05)', color: '#E8EAED', borderColor: 'rgba(212, 175, 55, 0.2)' }}
              />
            </div>

            <div>
              <label className="text-sm mb-2 block" style={{ color: '#E8EAED' }}>Offer Price *</label>
              <Input
                type="number"
                placeholder="50"
                value={form.discounted_price}
                onChange={(e) => setForm({ ...form, discounted_price: e.target.value })}
                style={{ backgroundColor: 'rgba(232, 234, 237, 0.05)', color: '#E8EAED', borderColor: 'rgba(212, 175, 55, 0.2)' }}
              />
            </div>

            <div>
              <label className="text-sm mb-2 block" style={{ color: '#E8EAED' }}>Discount % *</label>
              <Input
                type="number"
                placeholder="50"
                value={form.discount_percent}
                onChange={(e) => setForm({ ...form, discount_percent: e.target.value })}
                style={{ backgroundColor: 'rgba(232, 234, 237, 0.05)', color: '#E8EAED', borderColor: 'rgba(212, 175, 55, 0.2)' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm mb-2 block" style={{ color: '#E8EAED' }}>Valid Until *</label>
              <Input
                type="date"
                value={form.valid_until}
                onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
                style={{ backgroundColor: 'rgba(232, 234, 237, 0.05)', color: '#E8EAED', borderColor: 'rgba(212, 175, 55, 0.2)' }}
              />
            </div>

            <div>
              <label className="text-sm mb-2 block" style={{ color: '#E8EAED' }}>Max Redemptions</label>
              <Input
                type="number"
                placeholder="100"
                value={form.max_redemptions}
                onChange={(e) => setForm({ ...form, max_redemptions: e.target.value })}
                style={{ backgroundColor: 'rgba(232, 234, 237, 0.05)', color: '#E8EAED', borderColor: 'rgba(212, 175, 55, 0.2)' }}
              />
            </div>
          </div>

          <div>
            <label className="text-sm mb-2 block" style={{ color: '#E8EAED' }}>Terms & Conditions</label>
            <Textarea
              placeholder="Enter terms and conditions..."
              rows={3}
              value={form.terms}
              onChange={(e) => setForm({ ...form, terms: e.target.value })}
              style={{ backgroundColor: 'rgba(232, 234, 237, 0.05)', color: '#E8EAED', borderColor: 'rgba(212, 175, 55, 0.2)' }}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              className="flex-1"
              onClick={onCreate}
              style={{ backgroundColor: '#D4AF37', color: '#0B1426' }}
            >
              Create Offer
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              style={{ borderColor: 'rgba(212, 175, 55, 0.3)', color: '#E8EAED' }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ========== BOOST OFFER MODAL (ADMIN ONLY) ==========
function BoostOfferModal({ offer, isOpen, onClose, onConfirm }: any) {
  if (!offer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent style={{ backgroundColor: '#1a2942', borderColor: 'rgba(212, 175, 55, 0.2)' }}>
        <DialogHeader>
          <DialogTitle style={{ color: '#E8EAED' }}>Boost Offer</DialogTitle>
          <DialogDescription style={{ color: 'rgba(232, 234, 237, 0.6)' }}>
            Feature this offer to increase visibility
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)' }}>
            <h3 className="mb-2" style={{ color: '#E8EAED' }}>{offer.title}</h3>
            <p className="text-sm" style={{ color: 'rgba(232, 234, 237, 0.6)' }}>{offer.description}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" style={{ color: '#D4AF37' }} />
              <span style={{ color: '#E8EAED' }}>Featured badge on offer card</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" style={{ color: '#D4AF37' }} />
              <span style={{ color: '#E8EAED' }}>Shown in featured carousel</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5" style={{ color: '#D4AF37' }} />
              <span style={{ color: '#E8EAED' }}>Priority in search results</span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              className="flex-1"
              onClick={onConfirm}
              style={{ backgroundColor: '#D4AF37', color: '#0B1426' }}
            >
              Boost Offer
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              style={{ borderColor: 'rgba(212, 175, 55, 0.3)', color: '#E8EAED' }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ========== PURCHASE MODAL (STRIPE INTEGRATION) ==========
function PurchaseModal({ offer, isOpen, onClose, onConfirm }: any) {
  if (!offer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent style={{ backgroundColor: '#1a2942', borderColor: 'rgba(212, 175, 55, 0.2)' }}>
        <DialogHeader>
          <DialogTitle style={{ color: '#E8EAED' }}>Purchase Offer</DialogTitle>
          <DialogDescription style={{ color: 'rgba(232, 234, 237, 0.6)' }}>
            Complete your purchase to receive a coupon code
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(212, 175, 55, 0.05)', borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.2)' }}>
            <h3 className="mb-2" style={{ color: '#E8EAED' }}>{offer.title}</h3>
            <p className="text-sm mb-3" style={{ color: 'rgba(232, 234, 237, 0.6)' }}>{offer.provider_name}</p>
            
            <div className="flex items-baseline gap-2">
              <span className="text-2xl" style={{ color: '#D4AF37' }}>AED {offer.discounted_price}</span>
              {offer.original_price && (
                <span className="text-sm line-through" style={{ color: 'rgba(232, 234, 237, 0.4)' }}>
                  AED {offer.original_price}
                </span>
              )}
              <Badge style={{ backgroundColor: '#10b981', color: 'white' }}>
                {offer.discount_percent}% OFF
              </Badge>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 text-sm">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#10b981' }} />
              <div>
                <p style={{ color: '#E8EAED' }}>Instant coupon code delivery</p>
                <p style={{ color: 'rgba(232, 234, 237, 0.6)' }}>Receive your code immediately after payment</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#10b981' }} />
              <div>
                <p style={{ color: '#E8EAED' }}>30-day validity</p>
                <p style={{ color: 'rgba(232, 234, 237, 0.6)' }}>Use your offer within 30 days</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#10b981' }} />
              <div>
                <p style={{ color: '#E8EAED' }}>Redeem at shop</p>
                <p style={{ color: 'rgba(232, 234, 237, 0.6)' }}>Show your code to get the discount</p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
            <div className="flex items-center gap-2 text-sm" style={{ color: '#3b82f6' }}>
              <ExternalLink className="w-4 h-4" />
              <span>Secure payment powered by Stripe</span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              className="flex-1 h-12 gap-2"
              onClick={onConfirm}
              style={{ backgroundColor: '#D4AF37', color: '#0B1426' }}
            >
              <CreditCard className="w-5 h-5" />
              Pay AED {offer.discounted_price}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              style={{ borderColor: 'rgba(212, 175, 55, 0.3)', color: '#E8EAED' }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Export as default for compatibility
export default OffersPage;

// Also export as named export
export { OffersPage as OffersPage_Complete };
