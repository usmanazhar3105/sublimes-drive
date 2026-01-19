/**
 * OffersPage - Wired with Supabase Hooks
 * 
 * Uses: useOffers, useAnalytics
 */

import { useState, useEffect } from 'react';
import { 
  Star, Clock, MapPin, Heart, Share2, Filter, Search, 
  Tag, Gift, Percent, Check, Eye, Copy, Calendar, 
  TrendingUp, Grid, List, Loader2, X, CheckCircle, XCircle
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { toast } from 'sonner';

// Import Supabase hooks
import { useOffers, useAnalytics, useSocialInteractions } from '../hooks';

interface OffersPageProps {
  onNavigate?: (page: string) => void;
}

export function OffersPage({ onNavigate }: OffersPageProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);

  // 🔥 SUPABASE HOOKS
  const { 
    offers, 
    userOffers,
    loading, 
    error, 
    claimOffer, 
    redeemOffer,
    refetch 
  } = useOffers({
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    active: activeTab === 'all' ? true : undefined
  });

  const analytics = useAnalytics();
  
  // 🔥 SOCIAL INTERACTIONS for favorites
  const { toggleFavorite, checkIfFavorited } = useSocialInteractions();
  const [favoritedOffers, setFavoritedOffers] = useState<Set<string>>(new Set());

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

  const categories = [
    { value: 'all', label: 'All Offers' },
    { value: 'detailing', label: 'Detailing' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'parts', label: 'Parts & Accessories' },
    { value: 'services', label: 'Services' },
    { value: 'events', label: 'Events' },
  ];

  const filteredOffers = offers.filter(offer => {
    if (searchQuery && !offer.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleClaimOffer = async (offerId: string) => {
    const { data, error } = await claimOffer(offerId);
    
    if (!error && data) {
      toast.success('Offer claimed successfully!');
      toast.info(`Your code: ${data.code}`);
      analytics.trackOfferClaim(offerId);
      refetch();
    } else {
      toast.error('Failed to claim offer');
    }
  };

  const handleRedeemOffer = async (offerId: string) => {
    const { error } = await redeemOffer(offerId);
    
    if (!error) {
      toast.success('Offer redeemed successfully!');
      refetch();
    } else {
      toast.error('Failed to redeem offer');
    }
  };

  const selectedOffer = selectedOfferId ? offers.find(o => o.id === selectedOfferId) : null;

  return (
    <div className="min-h-screen bg-[#0B1426]">
      {/* Header */}
      <div className="bg-[#0F1829] border-b border-[#1A2332]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl text-[#E8EAED] mb-2">Exclusive Offers</h1>
              <p className="text-sm text-[#8B92A7]">
                {loading ? 'Loading...' : `${filteredOffers.length} offers available`}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-[#D4AF37] text-[#0B1426]' : ''}
              >
                <Grid size={16} />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-[#D4AF37] text-[#0B1426]' : ''}
              >
                <List size={16} />
              </Button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B92A7]" size={20} />
              <Input
                placeholder="Search offers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#1A2332] border-[#2A3342] text-[#E8EAED]"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48 bg-[#1A2332] border-[#2A3342] text-[#E8EAED]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1A2332] border-[#2A3342]">
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value} className="text-[#E8EAED]">
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="bg-[#1A2332] border border-[#2A3342]">
              <TabsTrigger value="all" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426]">
                All Offers
              </TabsTrigger>
              <TabsTrigger value="my-offers" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426]">
                My Offers ({userOffers.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab}>
          {/* All Offers Tab */}
          <TabsContent value="all">
            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin mb-4" />
                <p className="text-[#8B92A7]">Loading offers...</p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <Card className="bg-red-500/10 border-red-500">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <X className="text-red-400 mt-1" size={20} />
                    <div>
                      <h3 className="text-red-400 font-semibold mb-1">Error Loading Offers</h3>
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
            {!loading && !error && filteredOffers.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🎁</div>
                <h3 className="text-xl text-[#E8EAED] mb-2">No offers found</h3>
                <p className="text-[#8B92A7]">
                  {searchQuery ? "Try adjusting your search" : "Check back later for new offers"}
                </p>
              </div>
            )}

            {/* Offers Grid */}
            {!loading && !error && filteredOffers.length > 0 && (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                : 'space-y-4'
              }>
                {filteredOffers.map((offer) => {
                  const discountPercent = offer.discount_percentage;
                  const daysLeft = Math.ceil((new Date(offer.valid_until).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  const isExpiringSoon = daysLeft <= 3;
                  const hasClaimed = userOffers.some(uo => uo.offer_id === offer.id);

                  return (
                    <Card 
                      key={offer.id}
                      className="bg-[#0F1829] border-[#1A2332] hover:border-[#D4AF37]/30 transition-all overflow-hidden group"
                    >
                      {/* Offer Image */}
                      <div className="relative h-48 bg-[#1A2332] overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1426] to-transparent z-10" />
                        
                        {/* Discount Badge */}
                        <Badge className="absolute top-3 left-3 z-20 bg-[#D4AF37] text-[#0B1426] border-0 text-lg px-3 py-1">
                          {discountPercent}% OFF
                        </Badge>

                        {/* Featured Badge */}
                        {offer.is_featured && (
                          <Badge className="absolute top-3 right-3 z-20 bg-purple-500 text-white border-0">
                            <Star size={14} className="mr-1" />
                            Featured
                          </Badge>
                        )}

                        {/* Claimed Badge */}
                        {hasClaimed && (
                          <Badge className="absolute bottom-3 right-3 z-20 bg-green-500 text-white border-0">
                            <CheckCircle size={14} className="mr-1" />
                            Claimed
                          </Badge>
                        )}
                      </div>

                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg text-[#E8EAED] mb-1 group-hover:text-[#D4AF37] transition-colors">
                              {offer.title}
                            </h3>
                            <p className="text-sm text-[#8B92A7] line-clamp-2 mb-3">
                              {offer.description}
                            </p>
                          </div>
                        </div>

                        {/* Provider Info */}
                        <div className="flex items-center gap-2 mb-3">
                          <MapPin size={14} className="text-[#8B92A7]" />
                          <span className="text-sm text-[#8B92A7]">{offer.provider_name}</span>
                          {offer.provider_verified && (
                            <CheckCircle size={14} className="text-green-400" />
                          )}
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-2xl text-[#D4AF37]">
                            AED {offer.discounted_price}
                          </span>
                          <span className="text-sm text-[#8B92A7] line-through">
                            AED {offer.original_price}
                          </span>
                        </div>

                        {/* Valid Until */}
                        <div className="flex items-center gap-2 mb-4">
                          <Clock size={14} className={isExpiringSoon ? 'text-red-400' : 'text-[#8B92A7]'} />
                          <span className={`text-sm ${isExpiringSoon ? 'text-red-400' : 'text-[#8B92A7]'}`}>
                            {isExpiringSoon ? `Expires in ${daysLeft} days!` : `Valid until ${new Date(offer.valid_until).toLocaleDateString()}`}
                          </span>
                        </div>

                        {/* Claims */}
                        {offer.max_claims && (
                          <div className="mb-4">
                            <div className="flex justify-between text-xs text-[#8B92A7] mb-1">
                              <span>{offer.claims_count || 0} claimed</span>
                              <span>{offer.max_claims} available</span>
                            </div>
                            <div className="h-2 bg-[#1A2332] rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-[#D4AF37]"
                                style={{ width: `${((offer.claims_count || 0) / offer.max_claims) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          {!hasClaimed ? (
                            <Button
                              onClick={() => handleClaimOffer(offer.id)}
                              className="flex-1 bg-[#D4AF37] hover:bg-[#C19B2E] text-[#0B1426]"
                            >
                              <Gift size={16} className="mr-2" />
                              Claim Offer
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleRedeemOffer(offer.id)}
                              className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                            >
                              <CheckCircle size={16} className="mr-2" />
                              Redeem
                            </Button>
                          )}
                          
                          {/* Favorite Button */}
                          <Button
                            onClick={(e) => handleToggleFavorite(offer.id, e)}
                            variant="outline"
                            className={`border-[#2A3342] hover:bg-[#1A2332] ${
                              favoritedOffers.has(offer.id) ? 'text-[#D4AF37]' : 'text-[#E8EAED]'
                            }`}
                          >
                            <Heart 
                              size={16} 
                              fill={favoritedOffers.has(offer.id) ? '#D4AF37' : 'none'}
                            />
                          </Button>
                          
                          <Button
                            onClick={() => {
                              setSelectedOfferId(offer.id);
                              analytics.trackEvent('offer_viewed', { offer_id: offer.id });
                            }}
                            variant="outline"
                            className="border-[#2A3342] text-[#E8EAED] hover:bg-[#1A2332]"
                          >
                            <Eye size={16} />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* My Offers Tab */}
          <TabsContent value="my-offers">
            {userOffers.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl text-[#E8EAED] mb-2">No claimed offers</h3>
                <p className="text-[#8B92A7] mb-6">Start claiming offers to see them here</p>
                <Button
                  onClick={() => setActiveTab('all')}
                  className="bg-[#D4AF37] text-[#0B1426] hover:bg-[#C19B2E]"
                >
                  Browse Offers
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userOffers.map((userOffer) => {
                  const offer = offers.find(o => o.id === userOffer.offer_id);
                  if (!offer) return null;

                  return (
                    <Card 
                      key={userOffer.id}
                      className="bg-[#0F1829] border-[#1A2332]"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg text-[#E8EAED]">{offer.title}</h3>
                          <Badge className={userOffer.redeemed_at ? 'bg-gray-500' : 'bg-green-500'}>
                            {userOffer.redeemed_at ? 'Redeemed' : 'Active'}
                          </Badge>
                        </div>

                        {/* Redemption Code */}
                        <div className="bg-[#1A2332] p-3 rounded-lg mb-4">
                          <p className="text-xs text-[#8B92A7] mb-1">Redemption Code</p>
                          <div className="flex items-center justify-between">
                            <span className="text-lg text-[#D4AF37] font-mono">
                              {userOffer.code || userOffer.redemption_code || 'N/A'}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const code = userOffer.code || userOffer.redemption_code || '';
                                if (code) {
                                  navigator.clipboard.writeText(code);
                                  toast.success('Code copied!');
                                }
                              }}
                            >
                              <Copy size={16} />
                            </Button>
                          </div>
                        </div>

                        <div className="text-sm text-[#8B92A7] space-y-1 mb-4">
                          <div>Claimed: {new Date(userOffer.claimed_at || userOffer.created_at).toLocaleDateString()}</div>
                          {userOffer.redeemed_at && (
                            <div>Redeemed: {new Date(userOffer.redeemed_at).toLocaleDateString()}</div>
                          )}
                        </div>

                        {!userOffer.redeemed_at && (
                          <Button
                            onClick={() => handleRedeemOffer(userOffer.offer_id)}
                            className="w-full bg-[#D4AF37] text-[#0B1426] hover:bg-[#C19B2E]"
                          >
                            Redeem Now
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Offer Detail Modal */}
      {selectedOffer && (
        <Dialog open={!!selectedOfferId} onOpenChange={() => setSelectedOfferId(null)}>
          <DialogContent className="bg-[#0F1829] border-[#1A2332] max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-[#E8EAED]">{selectedOffer.title}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <p className="text-[#8B92A7]">{selectedOffer.description}</p>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-3xl text-[#D4AF37]">AED {selectedOffer.discounted_price}</span>
                  <span className="text-lg text-[#8B92A7] line-through ml-3">AED {selectedOffer.original_price}</span>
                </div>
                <Badge className="bg-[#D4AF37] text-[#0B1426] text-lg px-3 py-1">
                  {selectedOffer.discount_percentage}% OFF
                </Badge>
              </div>

              {selectedOffer.terms && (
                <div>
                  <h4 className="text-[#E8EAED] mb-2">Terms & Conditions</h4>
                  <ul className="list-disc list-inside text-sm text-[#8B92A7] space-y-1">
                    {selectedOffer.terms.split('\n').map((term, idx) => (
                      <li key={idx}>{term}</li>
                    ))}
                  </ul>
                </div>
              )}

              <Button
                onClick={() => {
                  handleClaimOffer(selectedOffer.id);
                  setSelectedOfferId(null);
                }}
                className="w-full bg-[#D4AF37] text-[#0B1426] hover:bg-[#C19B2E]"
              >
                <Gift size={16} className="mr-2" />
                Claim This Offer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
