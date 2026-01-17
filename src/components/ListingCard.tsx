import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter } from './ui/card';
import { MapPin, Calendar, Eye, Heart, Star, MessageCircle, Phone, Share2, Zap } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { FeaturedBadge } from './ui/FeaturedBadge';
import { BoostTimer } from './ui/BoostTimer';
import { toast } from 'sonner';

interface ListingCardProps {
  listing: {
    id: string;
    title: string;
    price: number;
    currency: string;
    location: string;
    year?: number;
    mileage?: string | number;
    category?: string;
    listing_type?: string;
    images: string[];
    isVerified?: boolean;
    isFeatured?: boolean;
    is_featured?: boolean;
    is_boosted?: boolean;
    views?: number;
    view_count?: number;
    postedDate?: string;
    created_at?: string;
    boostEnd?: string;
    boost_expires_at?: string;
    // Overseas fields
    is_overseas?: boolean;
    origin_country?: string;
    // Nested seller object (for old data structure)
    seller?: {
      name: string;
      rating: number;
      isVerified: boolean;
      phone?: string;
      whatsapp?: string;
    };
    // Flat seller fields (from Supabase join)
    seller_name?: string;
    seller_rating?: number;
    seller_avatar?: string;
    seller_phone?: string;
    contact_phone?: string;
    whatsapp_number?: string;
  };
  onFavorite?: () => void;
  isFavorited?: boolean;
  variant?: 'grid' | 'list';
  onViewDetails?: (listing: any) => void;
  onClick?: () => void;
  onShare?: (listing: any) => void;
}

export function ListingCard({ 
  listing, 
  onFavorite, 
  isFavorited = false, 
  variant = 'grid', 
  onViewDetails, 
  onClick,
  onShare 
}: ListingCardProps) {
  // Helper functions to safely access seller data (supports both nested and flat structures)
  const getSellerName = () => {
    return listing.seller?.name || listing.seller_name || 'Unknown Seller';
  };

  const getSellerRating = () => {
    return listing.seller?.rating || listing.seller_rating || 0;
  };

  const getSellerVerified = () => {
    return listing.seller?.isVerified || listing.isVerified || false;
  };

  const getSellerPhone = () => {
    return listing.seller?.phone || listing.seller_phone || listing.contact_phone || '+971501234567';
  };

  const getSellerWhatsApp = () => {
    return listing.seller?.whatsapp || listing.whatsapp_number || getSellerPhone();
  };

  const getViews = () => {
    return listing.views || listing.view_count || 0;
  };

  const getPostedDate = () => {
    if (listing.postedDate) return listing.postedDate;
    if (listing.created_at) {
      const date = new Date(listing.created_at);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      return date.toLocaleDateString();
    }
    return 'Recently';
  };

  const getBoostEnd = () => {
    return listing.boostEnd || listing.boost_expires_at;
  };

  const getMileage = () => {
    if (!listing.mileage) return null;
    const mileage = typeof listing.mileage === 'string' ? listing.mileage : `${listing.mileage}`;
    return mileage.includes('km') ? mileage : `${mileage} km`;
  };

  const isFeaturedListing = listing.isFeatured || listing.is_featured;

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare) {
      onShare(listing);
    } else {
      // Default share behavior
      if (navigator.share) {
        navigator.share({
          title: listing.title,
          text: `Check out this ${listing.listing_type || 'listing'}: ${listing.title} - ${listing.currency} ${listing.price.toLocaleString()}`,
          url: window.location.href + `?listing=${listing.id}`
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(window.location.href + `?listing=${listing.id}`);
        toast.success('Link copied to clipboard!');
      }
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavorite?.();
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (onViewDetails) {
      onViewDetails(listing);
    }
  };

  // LIST VIEW - Matches offers pattern
  if (variant === 'list') {
    return (
      <Card 
        className="bg-[#0F1829] border-[#1A2332] hover:border-[#D4AF37] transition-all cursor-pointer"
        onClick={handleClick}
      >
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Image */}
            <div className="w-32 h-32 flex-shrink-0 relative">
              <ImageWithFallback
                src={listing.images?.[0] || ''}
                alt={listing.title}
                className="w-full h-full object-cover rounded-lg"
              />
              {listing.is_boosted && getBoostEnd() && (
                <Badge className="absolute top-2 left-2 bg-[#D4AF37] text-[#0B1426] text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  BOOSTED
                </Badge>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  {isFeaturedListing && (
                    <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] mb-2">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      FEATURED
                    </Badge>
                  )}
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg text-[#E8EAED] truncate">{listing.title}</h3>
                    {getSellerVerified() && (
                      <Badge variant="outline" className="border-green-500 text-green-500 text-xs">
                        ✓ Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[#8B92A7]">
                    {listing.year && <span>{listing.year}</span>}
                    {getMileage() && (
                      <>
                        <span>•</span>
                        <span>{getMileage()}</span>
                      </>
                    )}
                    {listing.category && (
                      <>
                        <span>•</span>
                        <span>{listing.category}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleFavorite}
                    className={isFavorited ? 'text-red-500' : 'text-[#8B92A7]'}
                  >
                    <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleShare}
                    className="text-[#8B92A7] hover:text-[#D4AF37]"
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Price and Details */}
              <div className="flex items-center gap-3 mt-3">
                <span className="text-2xl text-[#D4AF37]">
                  {listing.currency} {listing.price.toLocaleString()}
                </span>
                {listing.is_overseas && listing.origin_country && (
                  <Badge className="bg-blue-500/20 text-blue-400">
                    🌍 {listing.origin_country}
                  </Badge>
                )}
              </div>

              {/* Meta Info */}
              <div className="flex items-center gap-4 mt-3 text-sm text-[#8B92A7]">
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {listing.location}
                </span>
                <span className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  {getViews()} views
                </span>
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {getPostedDate()}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // GRID VIEW
  return (
    <Card 
      className="bg-[#0F1829] border-[#1A2332] hover:border-[#D4AF37] transition-all cursor-pointer overflow-hidden group"
      onClick={handleClick}
    >
      <div className="relative">
        <ImageWithFallback
          src={listing.images?.[0] || ''}
          alt={listing.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Featured/Boosted Badge */}
        {isFeaturedListing && (
          <Badge className="absolute top-3 left-3 bg-[#D4AF37] text-[#0B1426]">
            <Star className="w-3 h-3 mr-1 fill-current" />
            FEATURED
          </Badge>
        )}
        {listing.is_boosted && getBoostEnd() && (
          <Badge className="absolute top-3 left-3 bg-[#D4AF37] text-[#0B1426]">
            <Zap className="w-3 h-3 mr-1" />
            BOOSTED
          </Badge>
        )}
        
        {/* Origin Flag Badge */}
        {listing.origin_country && (
          <Badge className="absolute top-3 right-3 bg-[#1A1F2E]/90 text-white border-0">
            {listing.origin_country === 'UAE' ? '🇦🇪' : 
             listing.origin_country === 'China' ? '🇨🇳' :
             listing.origin_country === 'Oman' ? '🇴🇲' :
             listing.origin_country === 'Saudi Arabia' ? '🇸🇦' :
             listing.origin_country === 'Qatar' ? '🇶🇦' :
             listing.origin_country === 'Bahrain' ? '🇧🇭' :
             listing.origin_country === 'Kuwait' ? '🇰🇼' :
             listing.origin_country === 'USA' ? '🇺🇸' :
             listing.origin_country === 'Korea' ? '🇰🇷' :
             listing.origin_country === 'Canada' ? '🇨🇦' :
             listing.origin_country === 'Europe' ? '🇪🇺' :
             listing.origin_country === 'Africa' ? '🌍' : '🌐'}
          </Badge>
        )}

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="bg-[#0F1829]/80 hover:bg-[#0F1829]"
            onClick={handleFavorite}
          >
            <Heart className={`w-5 h-5 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-white'}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="bg-[#0F1829]/80 hover:bg-[#0F1829]"
            onClick={handleShare}
          >
            <Share2 className="w-5 h-5 text-white" />
          </Button>
        </div>

        {/* Overseas Badge */}
        {listing.is_overseas && listing.origin_country && (
          <Badge className="absolute bottom-3 left-3 bg-blue-500 text-white">
            🌍 {listing.origin_country}
          </Badge>
        )}

        {/* Verified Badge */}
        {getSellerVerified() && (
          <Badge className="absolute bottom-3 right-3 bg-green-500 text-white">
            ✓ Verified
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-[#E8EAED] line-clamp-1 flex-1">{listing.title}</h3>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-[#8B92A7] mb-3">
          {listing.year && <span>{listing.year}</span>}
          {getMileage() && (
            <>
              <span>•</span>
              <span>{getMileage()}</span>
            </>
          )}
          {listing.listing_type && (
            <>
              <span>•</span>
              <span className="capitalize">{listing.listing_type}</span>
            </>
          )}
        </div>

        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl text-[#D4AF37]">
            {listing.currency} {listing.price.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#8B92A7]">
          <span className="flex items-center">
            <MapPin className="w-3 h-3 mr-1" />
            {listing.location}
          </span>
          <span className="flex items-center">
            <Eye className="w-3 h-3 mr-1" />
            {getViews()}
          </span>
        </div>
      </CardContent>

      {listing.is_boosted && getBoostEnd() && (
        <CardFooter className="px-4 py-2 bg-[#1A2332] border-t border-[#1A2332]">
          <BoostTimer expiresAt={getBoostEnd()} />
        </CardFooter>
      )}
    </Card>
  );
}
