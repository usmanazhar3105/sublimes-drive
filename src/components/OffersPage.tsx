import { useState, useEffect } from 'react';
import { Star, Clock, MapPin, ExternalLink, Heart, Share2, Filter, Search, Zap, Tag, Gift, Percent, ShoppingCart, Check, CreditCard, Eye, Copy, Info, Calendar, Phone, Mail, TrendingUp, Grid, List } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Separator } from './ui/separator';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ViewToggle } from './ui/ViewToggle';
import { FeaturedRibbon } from './ui/FeaturedRibbon';
import { BoostPlansModal } from './ui/BoostPlansModal';
import { FeaturedBadge } from './ui/FeaturedBadge';
import { toast } from 'sonner';
import { useOffers } from '../hooks/usePromotionalOffers';

// Fallback sample data (only used if database is empty)

interface Offer {
  id: string;
  title: string;
  description: string;
  discount: string;
  originalPrice: number;
  salePrice: number;
  image: string;
  category: string;
  provider: {
    name: string;
    location: string;
    rating: number;
    verified: boolean;
  };
  validUntil: string;
  termsAndConditions: string[];
  featured: boolean;
  liked: boolean;
  claims: number;
  maxClaims?: number;
  tags: string[];
  availability: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
    weekends: boolean;
    publicHolidays: boolean;
  };
  serviceIncludes: string[];
}

interface PurchasedOffer {
  id: string;
  offerId: string;
  offerTitle: string;
  amount: number;
  purchaseCode: string;
  purchaseDate: Date;
  isRedeemed: boolean;
  redeemedDate?: Date;
}

const sampleOffers: Offer[] = [
  {
    id: '1',
    title: '50% OFF Premium Car Wash & Detail',
    description: 'Complete exterior and interior car wash with premium wax, vacuum service, and dashboard polish. Professional service guaranteed.',
    discount: '50%',
    originalPrice: 100,
    salePrice: 50,
    image: 'https://images.unsplash.com/photo-1485463611174-f302f6a5c1c9?w=400&h=300&fit=crop',
    category: 'Detailing',
    provider: {
      name: 'Premium Auto Spa',
      location: 'Al Quoz, Dubai',
      rating: 4.8,
      verified: true
    },
    validUntil: '2024-12-31',
    termsAndConditions: [
      'Valid for sedans and hatchbacks only',
      'Appointment required - call 24 hours in advance',
      'Cannot be combined with other offers',
      'Valid Monday to Saturday only'
    ],
    featured: true,
    liked: false,
    claims: 45,
    maxClaims: 100,
    tags: ['Car Wash', 'Detailing', 'Interior', 'Exterior'],
    availability: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: false,
      weekends: false,
      publicHolidays: false,
    },
    serviceIncludes: ['Exterior wash & wax', 'Interior vacuum', 'Dashboard polish', 'Tire shine']
  },
  {
    id: '2',
    title: 'Oil Change & Filter Replacement Special',
    description: 'Premium engine oil change with genuine oil filter replacement. Includes basic 15-point inspection and fluid top-up.',
    discount: '35%',
    originalPrice: 150,
    salePrice: 97,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    category: 'Maintenance',
    provider: {
      name: 'Quick Service Center',
      location: 'Sheikh Zayed Road, Dubai',
      rating: 4.6,
      verified: true
    },
    validUntil: '2024-11-30',
    termsAndConditions: [
      'Valid for passenger cars up to 3.0L engine',
      'Synthetic oil upgrade available for additional cost',
      'Service takes approximately 45 minutes',
      'Appointment recommended but walk-ins accepted'
    ],
    featured: false,
    liked: true,
    claims: 23,
    maxClaims: 50,
    tags: ['Oil Change', 'Maintenance', 'Filter', 'Inspection'],
    availability: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: true,
      weekends: true,
      publicHolidays: false,
    },
    serviceIncludes: ['Premium engine oil (up to 5L)', 'Genuine oil filter', '15-point inspection', 'Fluid top-up']
  },
  {
    id: '3',
    title: 'Complete AC Service & Repair',
    description: 'Full air conditioning system service including gas refill, filter cleaning, and performance check.',
    discount: '40%',
    originalPrice: 200,
    salePrice: 120,
    image: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=400&h=300&fit=crop',
    category: 'AC Service',
    provider: {
      name: 'Cool Air Specialists',
      location: 'Business Bay, Dubai',
      rating: 4.9,
      verified: true
    },
    validUntil: '2024-12-15',
    termsAndConditions: [
      'Gas refill included (R134A type)',
      'Additional charges apply for major repairs',
      'Warranty: 30 days on service',
      'Cooling performance test included'
    ],
    featured: true,
    liked: false,
    claims: 12,
    maxClaims: 25,
    tags: ['AC Service', 'Gas Refill', 'Filter', 'Repair'],
    availability: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
      weekends: false,
      publicHolidays: false,
    },
    serviceIncludes: ['AC gas refill', 'Filter cleaning', 'System diagnosis', 'Performance test']
  },
  {
    id: '4',
    title: 'Brake Service Package',
    description: 'Complete brake system inspection, brake pad replacement (if needed), and brake fluid change.',
    discount: '25%',
    originalPrice: 300,
    salePrice: 225,
    image: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=400&h=300&fit=crop',
    category: 'Brake Service',
    provider: {
      name: 'Safety First Auto',
      location: 'Al Karama, Dubai',
      rating: 4.4,
      verified: false
    },
    validUntil: '2024-11-20',
    termsAndConditions: [
      'Brake pads extra if replacement needed',
      'Free brake system diagnosis',
      'Genuine parts used',
      'Road test included'
    ],
    featured: false,
    liked: false,
    claims: 8,
    maxClaims: 30,
    tags: ['Brake Service', 'Safety', 'Inspection', 'Fluid Change'],
    availability: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: false,
      weekends: false,
      publicHolidays: false,
    },
    serviceIncludes: ['Brake system inspection', 'Brake fluid change', 'Brake pad check', 'Road test']
  },
  {
    id: '5',
    title: 'Battery Check & Replacement',
    description: 'Professional battery testing, terminal cleaning, and replacement with premium battery if needed.',
    discount: '30%',
    originalPrice: 250,
    salePrice: 175,
    image: 'https://images.unsplash.com/photo-1558618047-b3a85f75ecbe?w=400&h=300&fit=crop',
    category: 'Battery',
    provider: {
      name: 'Power Plus Auto',
      location: 'Sharjah Industrial Area',
      rating: 4.7,
      verified: true
    },
    validUntil: '2024-12-01',
    termsAndConditions: [
      'Battery extra if replacement needed',
      'Free battery testing',
      '1-year warranty on new battery',
      'Old battery disposal included'
    ],
    featured: false,
    liked: true,
    claims: 15,
    maxClaims: 40,
    tags: ['Battery', 'Testing', 'Replacement', 'Warranty'],
    availability: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: true,
      weekends: true,
      publicHolidays: false,
    },
    serviceIncludes: ['Battery testing', 'Terminal cleaning', 'Load test', 'Installation (if needed)']
  }
];

interface OffersPageProps {
  onNavigate?: (page: string, data?: any) => void;
}

export function OffersPage({ onNavigate }: OffersPageProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isBoostModalOpen, setIsBoostModalOpen] = useState(false);
  
  // 🔥 REAL DATA FROM DATABASE (not mock)
  const { offers: dbOffers, userOffers, loading, claimOffer, refetch } = useOffers({ 
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    active: true 
  });
  
  // Use real offers from database, fallback to sample if empty
  const [offers, setOffers] = useState(sampleOffers);
  const [purchasedOffers, setPurchasedOffers] = useState<PurchasedOffer[]>([]);
  
  useEffect(() => {
    if (dbOffers && dbOffers.length > 0) {
      setOffers(dbOffers as any); // Transform format if needed
    }
    if (userOffers && userOffers.length > 0) {
      setPurchasedOffers(userOffers as any);
    }
  }, [dbOffers, userOffers]);

  const toggleLike = (offerId: string) => {
    setOffers(prev => prev.map(offer => 
      offer.id === offerId ? { ...offer, liked: !offer.liked } : offer
    ));
    
    const offer = offers.find(o => o.id === offerId);
    if (offer) {
      toast.success(offer.liked ? 'Removed from favorites' : 'Added to favorites');
    }
  };

  const handleViewOffer = (offer: Offer) => {
    setSelectedOffer(offer);
    setIsViewModalOpen(true);
  };

  const handleShareOffer = (offer: Offer) => {
    setSelectedOffer(offer);
    setIsShareModalOpen(true);
  };

  const copyOfferLink = async (offer: Offer) => {
    const offerLink = `https://sublimesdrive.com/offers/${offer.id}`;
    const { copyToClipboard } = await import('../utils/clipboard');
    const success = await copyToClipboard(offerLink);
    if (success) {
      toast.success('Offer link copied to clipboard!');
    } else {
      toast.error('Failed to copy link');
    }
  };

  const shareToSocial = (platform: string, offer: Offer) => {
    const offerLink = `https://sublimesdrive.com/offers/${offer.id}`;
    const text = `Check out this amazing offer: ${offer.title} - Save ${offer.discount}! Available on Sublimes Drive.`;
    
    let shareUrl = '';
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + offerLink)}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(offerLink)}&text=${encodeURIComponent(text)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(offerLink)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(offerLink)}`;
        break;
      case 'instagram':
        copyOfferLink(offer);
        toast.info('Link copied! Paste it in your Instagram story or bio.');
        return;
      default:
        copyOfferLink(offer);
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
    setIsShareModalOpen(false);
  };

  const visitProvider = (offer: Offer) => {
    toast.success(`Opening directions to ${offer.provider.name}`);
    // In a real app, this would open maps with directions
  };

  const generatePurchaseCode = () => {
    const prefix = 'SUB';
    const category = selectedOffer?.category.slice(0, 3).toUpperCase() || 'OFF';
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}-${category}-${year}-${timestamp}`;
  };

  const handlePurchaseOffer = async (offer: Offer) => {
    try {
      // Simulate Stripe payment
      toast.loading('Processing payment...');
      
      // Simulate payment delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const purchaseCode = generatePurchaseCode();
      const purchase: PurchasedOffer = {
        id: Date.now().toString(),
        offerId: offer.id,
        offerTitle: offer.title,
        amount: offer.salePrice,
        purchaseCode,
        purchaseDate: new Date(),
        isRedeemed: false,
      };

      setPurchasedOffers(prev => [...prev, purchase]);
      
      // Update offer claims
      setOffers(prev => prev.map(o => 
        o.id === offer.id ? { ...o, claims: o.claims + 1 } : o
      ));

      toast.dismiss();
      toast.success('Purchase successful! Check your email for the confirmation.');
      
      // Navigate to payment success page with purchase data
      if (onNavigate) {
        onNavigate('payment-success', {
          type: 'offer',
          amount: offer.salePrice,
          offerTitle: offer.title,
          purchaseCode,
          userEmail: 'user@example.com' // This would come from auth context
        });
      }
      
      setIsPurchaseModalOpen(false);
      setSelectedOffer(null);
    } catch (error) {
      toast.dismiss();
      toast.error('Payment failed. Please try again.');
    }
  };

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         offer.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         offer.provider.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || offer.category.toLowerCase() === categoryFilter.toLowerCase();
    
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'featured' && offer.featured) ||
                      (activeTab === 'saved' && offer.liked);
    
    return matchesSearch && matchesCategory && matchesTab;
  });

  const sortedOffers = [...filteredOffers].sort((a, b) => {
    if (sortBy === 'featured') return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    if (sortBy === 'discount') return parseInt(b.discount) - parseInt(a.discount);
    if (sortBy === 'expiring') return new Date(a.validUntil).getTime() - new Date(b.validUntil).getTime();
    if (sortBy === 'popular') return b.claims - a.claims;
    if (sortBy === 'price_low') return a.salePrice - b.salePrice;
    if (sortBy === 'price_high') return b.salePrice - a.salePrice;
    return 0;
  });

  const categories = ['all', ...Array.from(new Set(offers.map(offer => offer.category)))];

  return (
    <div className="h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Gift className="h-7 w-7 text-[var(--sublimes-gold)]" />
                Exclusive Offers
              </h1>
              <p className="text-muted-foreground">Save money on car services, parts, and accessories</p>
            </div>
            <Badge variant="secondary" className="bg-[var(--sublimes-gold)] text-black">
              {sortedOffers.length} Offers Available
            </Badge>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search offers, providers, or services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured First</SelectItem>
                  <SelectItem value="discount">Best Discount</SelectItem>
                  <SelectItem value="expiring">Expiring Soon</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              All Offers
            </TabsTrigger>
            <TabsTrigger value="featured" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Featured
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Saved
            </TabsTrigger>
            <TabsTrigger value="purchased" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              My Purchases
            </TabsTrigger>
          </TabsList>

          <TabsContent value="purchased">
            <div className="space-y-4">
            {purchasedOffers.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No purchases yet</h3>
                <p className="text-muted-foreground">Browse our offers and make your first purchase!</p>
              </div>
            ) : (
              purchasedOffers.map((purchase) => (
                <Card key={purchase.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{purchase.offerTitle}</h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                          <span>Purchased: {purchase.purchaseDate.toLocaleDateString()}</span>
                          <Badge variant={purchase.isRedeemed ? "default" : "secondary"}>
                            {purchase.isRedeemed ? "Redeemed" : "Active"}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-bold text-[var(--sublimes-gold)] text-lg">AED {purchase.amount}</div>
                        <div className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] px-3 py-1 rounded font-mono text-sm mt-2">
                          {purchase.purchaseCode}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Featured Offers Ribbon */}
        {sortedOffers.filter(o => o.featured).length > 0 && (
          <FeaturedRibbon 
            items={sortedOffers.filter(o => o.featured).map(offer => ({
              id: offer.id,
              title: offer.title,
              image: offer.image,
              type: 'offer' as const,
              views: Math.floor(Math.random() * 500) + 100,
              likes: Math.floor(Math.random() * 50) + 10
            }))}
            title="Featured Offers"
            onItemClick={(item) => console.log('Featured offer clicked:', item)}
          />
        )}

        {/* View Toggle and Boost Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold">
              All Offers ({sortedOffers.length})
            </h2>
            <p className="text-sm text-muted-foreground">
              Browse all available deals and discounts
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <ViewToggle view={viewMode} onViewChange={setViewMode} />
            <Button
              variant="outline"
              onClick={() => setIsBoostModalOpen(true)}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Boost Offer
            </Button>
          </div>
        </div>

        {/* Offers Grid */}
          <TabsContent value="all">
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {sortedOffers.map((offer) => (
              <Card key={offer.id} className={`bg-card border-border hover:border-[var(--sublimes-gold)]/50 transition-all duration-300 ${offer.featured ? 'ring-1 ring-[var(--sublimes-gold)]/30' : ''}`}>
                <div className="relative">
                  <ImageWithFallback 
                    src={offer.image}
                    alt={offer.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    {offer.featured && (
                      <Badge className="bg-[var(--sublimes-gold)] text-black">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    <Badge variant="secondary" className="bg-green-600 text-white">
                      {offer.discount} OFF
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`absolute top-3 right-3 ${offer.liked ? 'text-red-500' : 'text-white'}`}
                    onClick={() => toggleLike(offer.id)}
                  >
                    <Heart className={`h-5 w-5 ${offer.liked ? 'fill-current' : ''}`} />
                  </Button>
                </div>
                
                <CardContent className="p-4">
                  <div className="mb-3">
                    <h3 className="font-semibold text-lg mb-1">{offer.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{offer.description}</p>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl font-bold text-[var(--sublimes-gold)]">
                      AED {offer.salePrice}
                    </span>
                    <span className="text-sm text-muted-foreground line-through">
                      AED {offer.originalPrice}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      Save AED {offer.originalPrice - offer.salePrice}
                    </Badge>
                  </div>

                  {/* Provider */}
                  <div className="flex items-center justify-between mb-3 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{offer.provider.name}</span>
                      {offer.provider.verified && (
                        <Badge variant="outline" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          {offer.provider.rating}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span className="text-xs">{offer.provider.location}</span>
                    </div>
                  </div>

                  {/* Usage Stats */}
                  {offer.maxClaims && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>{offer.claims} claimed</span>
                        <span>{offer.maxClaims - offer.claims} remaining</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div 
                          className="bg-[var(--sublimes-gold)] h-1.5 rounded-full" 
                          style={{ width: `${(offer.claims / offer.maxClaims) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Expiry */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                    <Clock className="h-3 w-3" />
                    <span>Valid until {new Date(offer.validUntil).toLocaleDateString()}</span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {offer.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <Button 
                      className="w-full bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/80"
                      onClick={() => {
                        setSelectedOffer(offer);
                        setIsPurchaseModalOpen(true);
                      }}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Buy Now - AED {offer.salePrice}
                    </Button>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewOffer(offer)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleShareOffer(offer)}
                      >
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => visitProvider(offer)}
                      >
                        <MapPin className="h-4 w-4 mr-1" />
                        Visit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          </TabsContent>

          <TabsContent value="featured">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedOffers.filter(o => o.featured).map((offer) => (
              <Card key={offer.id} className="bg-card border-border hover:border-[var(--sublimes-gold)]/50 transition-all duration-300 ring-1 ring-[var(--sublimes-gold)]/30">
                {/* Same card content as above */}
                <div className="relative">
                  <ImageWithFallback 
                    src={offer.image}
                    alt={offer.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge className="bg-[var(--sublimes-gold)] text-black">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                    <Badge variant="secondary" className="bg-green-600 text-white">
                      {offer.discount} OFF
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`absolute top-3 right-3 ${offer.liked ? 'text-red-500' : 'text-white'}`}
                    onClick={() => toggleLike(offer.id)}
                  >
                    <Heart className={`h-5 w-5 ${offer.liked ? 'fill-current' : ''}`} />
                  </Button>
                </div>
                
                <CardContent className="p-4">
                  <div className="mb-3">
                    <h3 className="font-semibold text-lg mb-1">{offer.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{offer.description}</p>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl font-bold text-[var(--sublimes-gold)]">
                      AED {offer.salePrice}
                    </span>
                    <span className="text-sm text-muted-foreground line-through">
                      AED {offer.originalPrice}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <Button 
                      className="w-full bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/80"
                      onClick={() => {
                        setSelectedOffer(offer);
                        setIsPurchaseModalOpen(true);
                      }}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Buy Now - AED {offer.salePrice}
                    </Button>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewOffer(offer)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleShareOffer(offer)}
                      >
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => visitProvider(offer)}
                      >
                        <MapPin className="h-4 w-4 mr-1" />
                        Visit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          </TabsContent>

          <TabsContent value="saved">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedOffers.filter(o => o.liked).map((offer) => (
              <Card key={offer.id} className="bg-card border-border hover:border-[var(--sublimes-gold)]/50 transition-all duration-300">
                {/* Same card content as above */}
                <div className="relative">
                  <ImageWithFallback 
                    src={offer.image}
                    alt={offer.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-3 right-3 text-red-500"
                    onClick={() => toggleLike(offer.id)}
                  >
                    <Heart className="h-5 w-5 fill-current" />
                  </Button>
                </div>
                
                <CardContent className="p-4">
                  <div className="mb-3">
                    <h3 className="font-semibold text-lg mb-1">{offer.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{offer.description}</p>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl font-bold text-[var(--sublimes-gold)]">
                      AED {offer.salePrice}
                    </span>
                    <span className="text-sm text-muted-foreground line-through">
                      AED {offer.originalPrice}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <Button 
                      className="w-full bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/80"
                      onClick={() => {
                        setSelectedOffer(offer);
                        setIsPurchaseModalOpen(true);
                      }}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Buy Now - AED {offer.salePrice}
                    </Button>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewOffer(offer)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleShareOffer(offer)}
                      >
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => visitProvider(offer)}
                      >
                        <MapPin className="h-4 w-4 mr-1" />
                        Visit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          </TabsContent>
        </Tabs>

        {sortedOffers.length === 0 && activeTab !== 'purchased' && (
          <div className="text-center py-12">
            <Gift className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No offers found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Purchase Modal */}
      <Dialog open={isPurchaseModalOpen} onOpenChange={setIsPurchaseModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[var(--sublimes-gold)]">Purchase Offer</DialogTitle>
          </DialogHeader>
          
          {selectedOffer && (
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <ImageWithFallback 
                  src={selectedOffer.image}
                  alt={selectedOffer.title}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{selectedOffer.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{selectedOffer.provider.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-[var(--sublimes-gold)]">
                      AED {selectedOffer.salePrice}
                    </span>
                    <span className="text-sm text-muted-foreground line-through">
                      AED {selectedOffer.originalPrice}
                    </span>
                    <Badge variant="secondary" className="bg-green-600 text-white">
                      {selectedOffer.discount} OFF
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Service Includes:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {selectedOffer.serviceIncludes.map((service, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      {service}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Terms & Conditions:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {selectedOffer.termsAndConditions.map((term, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                      {term}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">How it works:</h4>
                <ol className="text-sm text-muted-foreground space-y-1">
                  <li>1. Complete your purchase</li>
                  <li>2. Receive confirmation email with unique purchase code</li>
                  <li>3. Visit the service provider</li>
                  <li>4. Show your purchase code to redeem the offer</li>
                </ol>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsPurchaseModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/80"
                  onClick={() => handlePurchaseOffer(selectedOffer)}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Purchase for AED {selectedOffer.salePrice}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Offer Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[var(--sublimes-gold)]">Offer Details</DialogTitle>
          </DialogHeader>
          
          {selectedOffer && (
            <div className="space-y-6">
              {/* Header with Image */}
              <div className="relative">
                <ImageWithFallback 
                  src={selectedOffer.image}
                  alt={selectedOffer.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  {selectedOffer.featured && (
                    <Badge className="bg-[var(--sublimes-gold)] text-black">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  <Badge variant="secondary" className="bg-green-600 text-white">
                    {selectedOffer.discount} OFF
                  </Badge>
                </div>
              </div>

              {/* Offer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold">{selectedOffer.title}</h3>
                    <p className="text-muted-foreground mt-2">{selectedOffer.description}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Pricing</h4>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-[var(--sublimes-gold)]">
                        AED {selectedOffer.salePrice}
                      </span>
                      <span className="text-lg text-muted-foreground line-through">
                        AED {selectedOffer.originalPrice}
                      </span>
                      <Badge variant="outline">
                        Save AED {selectedOffer.originalPrice - selectedOffer.salePrice}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Service Includes</h4>
                    <ul className="space-y-1">
                      {selectedOffer.serviceIncludes.map((service, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          {service}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedOffer.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Service Provider</h4>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium">{selectedOffer.provider.name}</h5>
                          {selectedOffer.provider.verified && (
                            <Badge variant="outline" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              {selectedOffer.provider.rating}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-1" />
                          {selectedOffer.provider.location}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Availability</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(selectedOffer.availability).map(([day, available]) => (
                        <div key={day} className="flex items-center justify-between">
                          <span className="capitalize">{day.replace(/([A-Z])/g, ' $1')}</span>
                          <Badge variant={available ? "default" : "secondary"} className="text-xs">
                            {available ? "Available" : "Closed"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Offer Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Valid Until:</span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {new Date(selectedOffer.validUntil).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Category:</span>
                        <Badge variant="outline">{selectedOffer.category}</Badge>
                      </div>
                      {selectedOffer.maxClaims && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Remaining:</span>
                          <span>{selectedOffer.maxClaims - selectedOffer.claims} of {selectedOffer.maxClaims}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div>
                <h4 className="font-semibold mb-2">Terms & Conditions</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {selectedOffer.termsAndConditions.map((term, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                      {term}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  Close
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleShareOffer(selectedOffer)}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button
                  className="flex-1 bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/80"
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setIsPurchaseModalOpen(true);
                  }}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Buy Now - AED {selectedOffer.salePrice}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Share Offer Modal */}
      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[var(--sublimes-gold)]">Share This Offer</DialogTitle>
          </DialogHeader>
          
          {selectedOffer && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                <ImageWithFallback 
                  src={selectedOffer.image}
                  alt={selectedOffer.title}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{selectedOffer.title}</h4>
                  <p className="text-xs text-muted-foreground">{selectedOffer.discount} OFF</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Share via</h4>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => shareToSocial('whatsapp', selectedOffer)}
                    className="justify-start"
                  >
                    <div className="w-5 h-5 bg-green-500 rounded mr-2"></div>
                    WhatsApp
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => shareToSocial('telegram', selectedOffer)}
                    className="justify-start"
                  >
                    <div className="w-5 h-5 bg-blue-500 rounded mr-2"></div>
                    Telegram
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => shareToSocial('twitter', selectedOffer)}
                    className="justify-start"
                  >
                    <div className="w-5 h-5 bg-blue-400 rounded mr-2"></div>
                    Twitter
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => shareToSocial('facebook', selectedOffer)}
                    className="justify-start"
                  >
                    <div className="w-5 h-5 bg-blue-600 rounded mr-2"></div>
                    Facebook
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => shareToSocial('instagram', selectedOffer)}
                    className="justify-start"
                  >
                    <div className="w-5 h-5 bg-pink-500 rounded mr-2"></div>
                    Instagram
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Copy Link</h4>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={`https://sublimesdrive.com/offers/${selectedOffer.id}`}
                      readOnly
                      className="text-xs"
                    />
                    <Button
                      size="sm"
                      onClick={() => copyOfferLink(selectedOffer)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Boost Plans Modal */}
      <BoostPlansModal
        isOpen={isBoostModalOpen}
        onClose={() => setIsBoostModalOpen(false)}
        type="offer"
        onSelectPlan={(plan) => {
          console.log('Selected boost plan:', plan);
          setIsBoostModalOpen(false);
        }}
      />
    </div>
  );
}