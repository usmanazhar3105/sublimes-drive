/**
 * 🚀 SUBLIMES DRIVE - COMPREHENSIVE OFFERS PAGE
 * 
 * Changes implemented:
 * 1. ✅ Removed "Create Offer" button (admin creates in admin panel)
 * 2. ✅ Removed "Boost Offer" button (boosting only in admin panel)
 * 3. ✅ New comprehensive offer details modal matching screenshot
 * 4. ✅ Featured carousel shows 3-4 offers max
 * 5. ✅ Removed Stripe payment flow - simple free claim system
 * 6. ✅ Support for multiple images per offer
 * 
 * Features:
 * - 4 Tabs: All Offers, Featured, Saved, My Purchases
 * - Search, filters, category dropdown, sort
 * - List/Grid view toggle
 * - Featured carousel (3-4 offers)
 * - Favorite & Share functionality
 * - Free claim system (no payment)
 * - 100% Mobile responsive
 * - Chinese car brands only
 */

import { useState, useEffect } from 'react';
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
  const { toggleFavorite, checkIfFavorited } = useSocialInteractions();
  const [favoritedOffers, setFavoritedOffers] = useState<Set<string>>(new Set());

  // Track page view
  useEffect(() => {
    analytics.trackPageView('/offers');
  }, []);

  // Load favorited offers (optimized to prevent flashing)
  useEffect(() => {
    const loadFavorites = async () => {
      if (offers.length === 0) return;
      
      // Batch check favorites to prevent multiple re-renders
      const favoritePromises = offers.map(offer => 
        checkIfFavorited('offer', offer.id).then(isFavorited => ({ id: offer.id, isFavorited }))
      );
      
      const results = await Promise.all(favoritePromises);
      const favoriteSet = new Set<string>();
      
      results.forEach(({ id, isFavorited }) => {
        if (isFavorited) favoriteSet.add(id);
      });
      
      setFavoritedOffers(favoriteSet);
    };
    
    loadFavorites();
  }, [offers.length]); // Only re-run when count changes, not on every offers array change

  // Auto-scroll featured carousel (limit to 4 offers max)
  useEffect(() => {
    const featuredOffers = offers.filter(o => o.is_featured).slice(0, 4);
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
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: offer.title,
          text: offer.description,
          url: window.location.href
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const handleClaimOffer = async (offerId: string) => {
    const { data, error } = await claimOffer(offerId);
    
    if (error) {
      toast.error('Failed to claim offer');
      return;
    }
    
    toast.success('Offer claimed successfully! Check "My Purchases" tab.');
    refetch();
    setIsOfferDetailOpen(false);
  };

  const handleRedeemOffer = async (offerId: string) => {
    const { error } = await redeemOffer(offerId);
    
    if (error) {
      toast.error('Failed to mark as redeemed');
      return;
    }
    
    toast.success('Offer marked as redeemed');
    refetch();
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Coupon code copied!');
  };

  const getTimeRemaining = (date: string) => {
    const now = new Date();
    const expiry = new Date(date);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff < 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`;
    return `${hours} hour${hours > 1 ? 's' : ''} left`;
  };

  // FILTERING AND SORTING
  const getFilteredOffers = () => {
    let filtered = offers;

    // Tab filtering
    if (activeTab === 'featured') {
      filtered = filtered.filter(o => o.is_featured);
    } else if (activeTab === 'saved') {
      filtered = filtered.filter(o => favoritedOffers.has(o.id));
    }

    // Search filtering
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(o => 
        o.title.toLowerCase().includes(query) ||
        o.description?.toLowerCase().includes(query) ||
        o.provider_name?.toLowerCase().includes(query)
      );
    }

    // Category filtering
    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(o => o.category === selectedCategory);
    }

    // Sorting
    filtered = [...filtered].sort((a, b) => {
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
          return a.discounted_price - b.discounted_price;
        case 'price_high':
          return b.discounted_price - a.discounted_price;
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredOffers = getFilteredOffers();
  const featuredOffers = offers.filter(o => o.is_featured).slice(0, 4); // Max 4 featured

  // =================================================================
  // FEATURED CAROUSEL (3-4 OFFERS MAX)
  // =================================================================
  const FeaturedCarousel = () => {
    if (featuredOffers.length === 0) return null;

    const currentOffer = featuredOffers[featuredIndex];

    const handlePrev = () => {
      setFeaturedIndex((prev) => 
        prev === 0 ? featuredOffers.length - 1 : prev - 1
      );
    };

    const handleNext = () => {
      setFeaturedIndex((prev) => 
        (prev + 1) % featuredOffers.length
      );
    };

    return (
      <div className="relative overflow-hidden rounded-xl mb-8" style={{ background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(11, 20, 38, 0.8) 100%)' }}>
        <div className="relative h-[400px] md:h-[500px]">
          {/* Background Image */}
          <div className="absolute inset-0">
            <ImageWithFallback
              src={currentOffer.image_url || `https://source.unsplash.com/1200x600/?chinese-car,${currentOffer.category}`}
              alt={currentOffer.title}
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(11, 20, 38, 0.95) 0%, rgba(11, 20, 38, 0.7) 50%, transparent 100%)' }} />
          </div>

          {/* Content */}
          <div className="relative z-10 h-full flex items-center px-6 md:px-12">
            <div className="max-w-xl">
              {/* Badges */}
              <div className="flex items-center gap-3 mb-4">
                {currentOffer.discount_percent && (
                  <Badge className="px-4 py-1.5" style={{ background: '#10b981', color: '#fff' }}>
                    <Percent className="w-4 h-4 mr-1" />
                    {currentOffer.discount_percent}% OFF
                  </Badge>
                )}
                <Badge className="px-4 py-1.5" style={{ background: '#D4AF37', color: '#0B1426' }}>
                  <Star className="w-4 h-4 mr-1 fill-current" />
                    Featured
                  </Badge>
                </div>

              {/* Title */}
              <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: '#E8EAED' }}>
                {currentOffer.title}
              </h2>

              {/* Description */}
              <p className="text-lg mb-6" style={{ color: 'rgba(232, 234, 237, 0.8)' }}>
                {currentOffer.description}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-5xl font-bold" style={{ color: '#D4AF37' }}>
                  AED {currentOffer.discounted_price}
                </span>
                {currentOffer.original_price && (
                  <>
                    <span className="text-2xl line-through" style={{ color: 'rgba(232, 234, 237, 0.4)' }}>
                      AED {currentOffer.original_price}
                    </span>
                    <span className="px-3 py-1 rounded-full text-sm" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>
                      Save AED {currentOffer.original_price - currentOffer.discounted_price}
                    </span>
                  </>
                )}
              </div>

              {/* CTA Button */}
              <Button
                size="lg"
                className="px-8 py-6 text-lg"
                style={{ background: '#D4AF37', color: '#0B1426' }}
                onClick={() => {
                  setSelectedOffer(currentOffer);
                  setIsOfferDetailOpen(true);
                }}
              >
                View Details
                <Eye className="w-5 h-5 ml-2" />
              </Button>

              {/* Indicators */}
              {featuredOffers.length > 1 && (
                <div className="flex items-center gap-2 mt-6">
                  {featuredOffers.map((_, idx) => (
                    <div
                      key={idx}
                      className="h-1.5 rounded-full transition-all cursor-pointer"
                      style={{
                        width: idx === featuredIndex ? '32px' : '16px',
                        background: idx === featuredIndex ? '#D4AF37' : 'rgba(232, 234, 237, 0.3)'
                      }}
                      onClick={() => setFeaturedIndex(idx)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Navigation Arrows */}
          {featuredOffers.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full transition-all hover:scale-110"
                style={{ background: 'rgba(11, 20, 38, 0.8)', border: '1px solid rgba(212, 175, 55, 0.3)' }}
              >
                <ChevronLeft className="w-6 h-6" style={{ color: '#D4AF37' }} />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full transition-all hover:scale-110"
                style={{ background: 'rgba(11, 20, 38, 0.8)', border: '1px solid rgba(212, 175, 55, 0.3)' }}
              >
                <ChevronRight className="w-6 h-6" style={{ color: '#D4AF37' }} />
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  // =================================================================
  // OFFER CARD
  // =================================================================
  const OfferCard = ({ offer }: { offer: any }) => {
    const claimed = offer.redemption_count || 0;
    const maxClaims = offer.max_redemptions || 100;
    const progress = (claimed / maxClaims) * 100;
    const isFavorited = favoritedOffers.has(offer.id);

    return (
      <Card
        className="overflow-hidden cursor-pointer transition-all hover:scale-[1.02]"
        style={{ 
          background: 'rgba(11, 20, 38, 0.6)', 
          borderColor: 'rgba(212, 175, 55, 0.2)',
          backdropFilter: 'blur(10px)'
        }}
        onClick={() => {
          setSelectedOffer(offer);
          setIsOfferDetailOpen(true);
        }}
      >
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <ImageWithFallback
            src={offer.image_url || `https://source.unsplash.com/600x400/?chinese-car,${offer.category}`}
            alt={offer.title}
            className="w-full h-full object-cover"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {offer.is_featured && (
              <Badge className="px-3 py-1" style={{ background: '#D4AF37', color: '#0B1426' }}>
                <Star className="w-3 h-3 mr-1 fill-current" />
                Featured
              </Badge>
            )}
            {offer.discount_percent && (
              <Badge className="px-3 py-1" style={{ background: '#10b981', color: '#fff' }}>
                {offer.discount_percent}% OFF
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="absolute top-3 right-3 flex gap-2">
            <button
              onClick={(e) => handleToggleFavorite(offer.id, e)}
              className="p-2 rounded-full transition-all"
              style={{ background: 'rgba(11, 20, 38, 0.8)' }}
            >
              <Heart 
                className="w-5 h-5" 
                style={{ 
                  color: isFavorited ? '#ef4444' : '#E8EAED',
                  fill: isFavorited ? '#ef4444' : 'none'
                }} 
              />
            </button>
            <button
              onClick={(e) => handleShare(offer, e)}
              className="p-2 rounded-full transition-all"
              style={{ background: 'rgba(11, 20, 38, 0.8)' }}
            >
              <Share2 className="w-5 h-5" style={{ color: '#E8EAED' }} />
            </button>
          </div>
        </div>

        <CardContent className="p-4">
          {/* Provider */}
          <div className="flex items-center gap-2 mb-2">
            <Store className="w-4 h-4" style={{ color: '#D4AF37' }} />
            <span className="text-sm" style={{ color: 'rgba(232, 234, 237, 0.7)' }}>
              {offer.provider_name || 'Premium Auto Spa'}
            </span>
            <BadgeCheck className="w-4 h-4" style={{ color: '#3b82f6' }} />
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold mb-2" style={{ color: '#E8EAED' }}>
            {offer.title}
          </h3>

          {/* Description */}
          <p className="text-sm mb-4 line-clamp-2" style={{ color: 'rgba(232, 234, 237, 0.6)' }}>
            {offer.description}
          </p>

          {/* Meta Info */}
          <div className="flex items-center gap-4 mb-3 text-sm">
            <div className="flex items-center gap-2">
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
          </div>

          {/* Progress Bar */}
          {maxClaims > 0 && (
            <div className="mt-3">
              <Progress 
                value={progress} 
                className="h-2" 
                style={{ 
                  background: 'rgba(232, 234, 237, 0.1)',
                }}
              />
              <p className="text-xs mt-1" style={{ color: 'rgba(232, 234, 237, 0.5)' }}>
                {claimed}/{maxClaims} claimed
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // =================================================================
  // COMPREHENSIVE OFFER DETAILS MODAL (MATCHING SCREENSHOT)
  // =================================================================
  const OfferDetailsModal = () => {
    if (!selectedOffer) return null;

    // Parse what's included and terms
    const whatsIncluded = selectedOffer.terms?.split('\n').filter((t: string) => t.trim()) || [
      'Exterior wash & wax',
      'Interior vacuum',
      'Dashboard polish',
      'Tire shine'
    ];

    const terms = [
      'Valid for sedans and hatchbacks only',
      'Appointment required - call 24 hours in advance',
      'Cannot be combined with other offers',
      'Valid Monday to Saturday only'
    ];

    const savings = selectedOffer.original_price ? 
      selectedOffer.original_price - selectedOffer.discounted_price : 0;

    return (
      <Dialog open={isOfferDetailOpen} onOpenChange={setIsOfferDetailOpen}>
        <DialogContent 
          className="max-w-5xl max-h-[90vh] overflow-y-auto p-0"
          style={{ background: '#0B1426', borderColor: 'rgba(212, 175, 55, 0.3)' }}
        >
          <DialogHeader className="p-6 pb-4" style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.2)' }}>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg" style={{ background: 'rgba(212, 175, 55, 0.1)' }}>
                <Gift className="w-6 h-6" style={{ color: '#D4AF37' }} />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold" style={{ color: '#E8EAED' }}>
                  {selectedOffer.title}
                </DialogTitle>
                <DialogDescription className="text-sm mt-1" style={{ color: 'rgba(232, 234, 237, 0.6)' }}>
                  View detailed information about this exclusive offer including services, terms, and provider details.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Main Content Grid */}
          <div className="grid md:grid-cols-2 gap-6 p-6">
            {/* LEFT SIDE - Image */}
            <div>
              <div className="relative rounded-xl overflow-hidden mb-4">
                <ImageWithFallback
                  src={selectedOffer.image_url || `https://source.unsplash.com/800x600/?chinese-car-wash,detailing`}
                  alt={selectedOffer.title}
                  className="w-full aspect-video object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>

              {/* What's Included */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: '#E8EAED' }}>
                  <CheckCircle className="w-5 h-5" style={{ color: '#10b981' }} />
                  What's Included:
                </h3>
                <div className="space-y-2">
                  {whatsIncluded.map((item: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#10b981' }} />
                      <span style={{ color: 'rgba(232, 234, 237, 0.8)' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Terms & Conditions */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: '#E8EAED' }}>
                  <AlertCircle className="w-5 h-5" style={{ color: '#f59e0b' }} />
                  Terms & Conditions:
                </h3>
                <div className="space-y-2">
                  {terms.map((term, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Info className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'rgba(232, 234, 237, 0.5)' }} />
                      <span className="text-sm" style={{ color: 'rgba(232, 234, 237, 0.7)' }}>{term}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT SIDE - Details & CTA */}
            <div className="flex flex-col">
              {/* Badges */}
              <div className="flex items-center gap-2 mb-4">
                {selectedOffer.discount_percent && (
                  <Badge className="px-4 py-1.5" style={{ background: '#10b981', color: '#fff' }}>
                    {selectedOffer.discount_percent}% OFF
                  </Badge>
                )}
                {selectedOffer.is_featured && (
                  <Badge className="px-4 py-1.5" style={{ background: '#D4AF37', color: '#0B1426' }}>
                    <Star className="w-4 h-4 mr-1 fill-current" />
                    Featured
                  </Badge>
                )}
              </div>

              {/* Price */}
              <div className="mb-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold" style={{ color: '#D4AF37' }}>
                    AED {selectedOffer.discounted_price}
                  </span>
                  {selectedOffer.original_price && (
                    <span className="text-xl line-through" style={{ color: 'rgba(232, 234, 237, 0.4)' }}>
                      AED {selectedOffer.original_price}
                    </span>
                  )}
                </div>
                {savings > 0 && (
                  <p className="text-sm mt-1" style={{ color: '#10b981' }}>
                    You save AED {savings}
                  </p>
                )}
              </div>

              {/* Description */}
              <p className="mb-6" style={{ color: 'rgba(232, 234, 237, 0.8)' }}>
                {selectedOffer.description || 'Complete exterior and interior car wash with premium wax, vacuum service, and dashboard polish. Professional service guaranteed.'}
              </p>

              <Separator className="my-4" style={{ background: 'rgba(212, 175, 55, 0.2)' }} />

              {/* Provider Details Card */}
              <div 
                className="p-4 rounded-lg mb-6"
                style={{ background: 'rgba(212, 175, 55, 0.05)', border: '1px solid rgba(212, 175, 55, 0.2)' }}
              >
                <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: '#E8EAED' }}>
                  <Store className="w-5 h-5" style={{ color: '#D4AF37' }} />
                  Provider Details:
                </h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium" style={{ color: '#E8EAED' }}>
                        {selectedOffer.provider_name || 'Premium Auto Spa'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 fill-current" style={{ color: '#D4AF37' }} />
                          <span className="ml-1 text-sm" style={{ color: '#E8EAED' }}>4.8</span>
                        </div>
                        <Star className="w-3 h-3 fill-current" style={{ color: '#D4AF37' }} />
                      </div>
                    </div>
                    <BadgeCheck className="w-6 h-6" style={{ color: '#3b82f6' }} />
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4" style={{ color: '#D4AF37' }} />
                    <span style={{ color: 'rgba(232, 234, 237, 0.8)' }}>
                      Al Quoz, Dubai
                    </span>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="mt-auto space-y-3">
                <Button
                  size="lg"
                  className="w-full py-6 text-lg"
                  style={{ background: '#D4AF37', color: '#0B1426' }}
                  onClick={() => handleClaimOffer(selectedOffer.id)}
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Buy Now - AED {selectedOffer.discounted_price}
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(selectedOffer, e);
                    }}
                    style={{ borderColor: 'rgba(212, 175, 55, 0.3)', color: '#E8EAED' }}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    style={{ borderColor: 'rgba(212, 175, 55, 0.3)', color: '#E8EAED' }}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Visit
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // =================================================================
  // MY PURCHASES TAB
  // =================================================================
  const MyPurchasesTab = () => {
    if (userOffers.length === 0) {
      return (
        <div className="text-center py-16">
          <Ticket className="w-16 h-16 mx-auto mb-4" style={{ color: 'rgba(232, 234, 237, 0.3)' }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: '#E8EAED' }}>
            No purchases yet
          </h3>
          <p style={{ color: 'rgba(232, 234, 237, 0.6)' }}>
            Browse offers and claim your first deal!
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {userOffers.map((redemption: any) => {
          const offer = offers.find(o => o.id === redemption.offer_id);
          if (!offer) return null;

          const isExpired = new Date(redemption.expires_at) < new Date();
          const isRedeemed = !!redemption.redeemed_at;

          return (
            <Card
              key={redemption.id}
              className="overflow-hidden"
              style={{ 
                background: 'rgba(11, 20, 38, 0.6)', 
                borderColor: isRedeemed ? 'rgba(16, 185, 129, 0.3)' : 'rgba(212, 175, 55, 0.2)'
              }}
            >
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left - Offer Info */}
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-semibold mb-1" style={{ color: '#E8EAED' }}>
                          {offer.title}
                        </h3>
                        <p className="text-sm" style={{ color: 'rgba(232, 234, 237, 0.6)' }}>
                          {offer.provider_name || 'Premium Auto Spa'}
                        </p>
                      </div>
                      {isRedeemed ? (
                        <Badge style={{ background: '#10b981', color: '#fff' }}>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Redeemed
                        </Badge>
                      ) : isExpired ? (
                        <Badge style={{ background: '#ef4444', color: '#fff' }}>
                          <XCircle className="w-3 h-3 mr-1" />
                          Expired
                        </Badge>
                      ) : (
                        <Badge style={{ background: '#3b82f6', color: '#fff' }}>
                          <Ticket className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm mb-4" style={{ color: 'rgba(232, 234, 237, 0.7)' }}>
                      {offer.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" style={{ color: '#D4AF37' }} />
                        <span style={{ color: 'rgba(232, 234, 237, 0.7)' }}>
                          Expires: {new Date(redemption.expires_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right - Coupon Code */}
                  <div className="flex flex-col justify-center">
                    <div
                      className="p-4 rounded-lg border-2 border-dashed mb-4"
                      style={{ 
                        borderColor: '#D4AF37',
                        background: 'rgba(212, 175, 55, 0.05)'
                      }}
                    >
                      <p className="text-xs mb-2" style={{ color: 'rgba(232, 234, 237, 0.6)' }}>
                        YOUR COUPON CODE
                      </p>
                      <div className="flex items-center justify-between gap-3">
                        <code className="text-2xl font-mono font-bold" style={{ color: '#D4AF37' }}>
                          {redemption.redemption_code}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyCoupon(redemption.redemption_code)}
                          style={{ borderColor: '#D4AF37', color: '#D4AF37' }}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {!isRedeemed && !isExpired && (
                      <Button
                        variant="outline"
                        onClick={() => handleRedeemOffer(redemption.id)}
                        style={{ borderColor: '#10b981', color: '#10b981' }}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Mark as Redeemed
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  // =================================================================
  // MAIN RENDER
  // =================================================================
  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: '#0B1426' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#E8EAED' }}>
            <Gift className="w-8 h-8 inline mr-3" style={{ color: '#D4AF37' }} />
            Exclusive Offers
          </h1>
          <p style={{ color: 'rgba(232, 234, 237, 0.7)' }}>
            Discover amazing deals from verified Chinese car service providers in the UAE
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList style={{ background: 'rgba(11, 20, 38, 0.6)', borderColor: 'rgba(212, 175, 55, 0.2)' }}>
            <TabsTrigger value="all" style={{ color: '#E8EAED' }}>All Offers</TabsTrigger>
            <TabsTrigger value="featured" style={{ color: '#E8EAED' }}>Featured</TabsTrigger>
            <TabsTrigger value="saved" style={{ color: '#E8EAED' }}>Saved</TabsTrigger>
            <TabsTrigger value="purchases" style={{ color: '#E8EAED' }}>My Purchases</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {/* Featured Carousel */}
            {featuredOffers.length > 0 && activeTab === 'all' && <FeaturedCarousel />}

            {/* Search & Filters */}
            <div className="mb-6 space-y-4">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'rgba(232, 234, 237, 0.5)' }} />
                    <Input
                      placeholder="Search offers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      style={{ 
                        background: 'rgba(11, 20, 38, 0.6)', 
                        borderColor: 'rgba(212, 175, 55, 0.2)',
                        color: '#E8EAED'
                      }}
                    />
                  </div>
                </div>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger style={{ background: 'rgba(11, 20, 38, 0.6)', borderColor: 'rgba(212, 175, 55, 0.2)', color: '#E8EAED' }}>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent style={{ background: '#0B1426', borderColor: 'rgba(212, 175, 55, 0.3)' }}>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat} style={{ color: '#E8EAED' }}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger style={{ background: 'rgba(11, 20, 38, 0.6)', borderColor: 'rgba(212, 175, 55, 0.2)', color: '#E8EAED' }}>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent style={{ background: '#0B1426', borderColor: 'rgba(212, 175, 55, 0.3)' }}>
                    {SORT_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value} style={{ color: '#E8EAED' }}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm" style={{ color: 'rgba(232, 234, 237, 0.7)' }}>
                  {filteredOffers.length} offer{filteredOffers.length !== 1 ? 's' : ''} found
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className="p-2 rounded transition-all"
                    style={{ 
                      background: viewMode === 'grid' ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
                      color: viewMode === 'grid' ? '#D4AF37' : 'rgba(232, 234, 237, 0.5)'
                    }}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className="p-2 rounded transition-all"
                    style={{ 
                      background: viewMode === 'list' ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
                      color: viewMode === 'list' ? '#D4AF37' : 'rgba(232, 234, 237, 0.5)'
                    }}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Offers Grid */}
            {loading ? (
              <div className="text-center py-16">
                <Loader2 className="w-12 h-12 animate-spin mx-auto" style={{ color: '#D4AF37' }} />
              </div>
            ) : filteredOffers.length === 0 ? (
              <div className="text-center py-16">
                <Gift className="w-16 h-16 mx-auto mb-4" style={{ color: 'rgba(232, 234, 237, 0.3)' }} />
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#E8EAED' }}>
                  No offers found
                </h3>
                <p style={{ color: 'rgba(232, 234, 237, 0.6)' }}>
                  Try adjusting your filters
                </p>
              </div>
            ) : (
              <div className={`grid ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
                {filteredOffers.map(offer => (
                  <OfferCard key={offer.id} offer={offer} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="featured" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredOffers.map(offer => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="saved" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOffers.filter(o => favoritedOffers.has(o.id)).map(offer => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="purchases" className="mt-6">
            <MyPurchasesTab />
          </TabsContent>
        </Tabs>

        {/* Offer Details Modal */}
        <OfferDetailsModal />
      </div>
    </div>
  );
}

// Export as default for compatibility
export { OffersPage };
