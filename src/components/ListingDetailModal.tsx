import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  MapPin, Calendar, Eye, Heart, Star, MessageCircle, Phone, 
  Car, Gauge, Fuel, Settings, Shield, Clock, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { FeaturedBadge } from './ui/FeaturedBadge';
import { BoostTimer } from './ui/BoostTimer';
import { toast } from 'sonner';

interface ListingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: {
    id: string;
    title: string;
    price: number;
    currency: string;
    location: string;
    year?: number;
    mileage?: string;
    category: 'cars' | 'parts';
    images: string[];
    isVerified: boolean;
    isFeatured?: boolean;
    views: number;
    postedDate: string;
    boostEnd?: string;
    seller?: {
      name: string;
      rating: number;
      isVerified: boolean;
      phone?: string;
      whatsapp?: string;
    };
    description?: string;
    specifications?: {
      transmission?: string;
      fuelType?: string;
      bodyType?: string;
      color?: string;
      condition?: string;
    };
  } | null;
  onFavorite?: () => void;
  isFavorited?: boolean;
}

export function ListingDetailModal({ 
  isOpen, 
  onClose, 
  listing, 
  onFavorite, 
  isFavorited = false 
}: ListingDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!listing) return null;

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleWhatsAppMessage = (e: React.MouseEvent) => {
    e.stopPropagation();
    const whatsappNumber = listing.seller?.whatsapp || listing.seller?.phone || '+971501234567';
    const cleanNumber = whatsappNumber.replace(/\D/g, '');
    const message = encodeURIComponent(`Hi! I'm interested in your ${listing.title} listed on Sublimes Drive for ${formatPrice(listing.price, listing.currency)}.`);
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
    toast.success('Opening WhatsApp...');
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phoneNumber = listing.seller?.phone || '+971501234567';
    try {
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        window.location.href = `tel:${phoneNumber}`;
      } else {
        if (window.confirm(`Call ${listing.seller?.name || 'seller'} at ${phoneNumber}?`)) {
          window.location.href = `tel:${phoneNumber}`;
        }
      }
      toast.success('Opening dialer...');
    } catch (error) {
      console.error('Failed to initiate call:', error);
      toast.error('Unable to make call. Please dial manually: ' + phoneNumber);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % listing.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="truncate mr-4">{listing.title}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onFavorite}
              className="flex-shrink-0"
            >
              <Heart 
                className={`h-5 w-5 ${
                  isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'
                }`} 
              />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Listed in {listing.location} • Posted {listing.postedDate}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image Gallery */}
          <div className="relative">
            <div className="aspect-video overflow-hidden rounded-lg bg-gray-100">
              <ImageWithFallback
                src={listing.images[currentImageIndex]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Image Navigation */}
            {listing.images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                
                {/* Image Counter */}
                <div className="absolute bottom-3 right-3 bg-black/60 text-white text-sm px-2 py-1 rounded">
                  {currentImageIndex + 1} / {listing.images.length}
                </div>
              </>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              {listing.isVerified && (
                <Badge className="bg-green-500 text-white">
                  Verified
                </Badge>
              )}
              {listing.isFeatured && (
                <FeaturedBadge />
              )}
            </div>
          </div>

          {/* Price and Main Info */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div className="flex-1">
              <div className="text-3xl font-bold text-[var(--sublimes-gold)] mb-2">
                {formatPrice(listing.price, listing.currency)}
              </div>
              
              {listing.category === 'cars' && listing.year && (
                <div className="text-lg text-muted-foreground mb-3">
                  {listing.year} • {listing.mileage} km
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{listing.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{listing.views} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{listing.postedDate}</span>
                </div>
              </div>
            </div>

            {/* Contact Buttons */}
            <div className="flex flex-col gap-2 md:w-48">
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white w-full"
                onClick={handleWhatsAppMessage}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
              <Button 
                variant="outline"
                className="w-full"
                onClick={handleCall}
              >
                <Phone className="h-4 w-4 mr-2" />
                Call Now
              </Button>
            </div>
          </div>

          {/* Description */}
          {listing.description && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {listing.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Specifications (for cars) */}
          {listing.category === 'cars' && listing.specifications && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Specifications</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {listing.specifications.transmission && (
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">Transmission</div>
                        <div className="text-sm font-medium">{listing.specifications.transmission}</div>
                      </div>
                    </div>
                  )}
                  {listing.specifications.fuelType && (
                    <div className="flex items-center gap-2">
                      <Fuel className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">Fuel</div>
                        <div className="text-sm font-medium">{listing.specifications.fuelType}</div>
                      </div>
                    </div>
                  )}
                  {listing.specifications.bodyType && (
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">Body Type</div>
                        <div className="text-sm font-medium">{listing.specifications.bodyType}</div>
                      </div>
                    </div>
                  )}
                  {listing.specifications.condition && (
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">Condition</div>
                        <div className="text-sm font-medium">{listing.specifications.condition}</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Seller Info */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Seller Information</h3>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>{listing.seller?.name?.[0] || 'S'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{listing.seller?.name || 'Car Owner'}</span>
                    {listing.seller?.isVerified && (
                      <Badge variant="outline" className="text-xs">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        {listing.seller?.rating || 5.0}
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {listing.seller?.isVerified ? 'Verified Seller' : 'Private Seller'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Boost Timer (if featured) */}
          {listing.isFeatured && listing.boostEnd && (
            <Card className="border-[var(--sublimes-gold)]/30">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2 text-[var(--sublimes-gold)]">
                  🔥 Featured Listing
                </h3>
                <BoostTimer endDate={listing.boostEnd} />
              </CardContent>
            </Card>
          )}

          {/* Thumbnail Gallery */}
          {listing.images.length > 1 && (
            <div className="space-y-2">
              <h3 className="font-semibold">All Photos</h3>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                {listing.images.map((image, index) => (
                  <div 
                    key={index}
                    className={`aspect-square overflow-hidden rounded-lg cursor-pointer border-2 transition-colors ${
                      index === currentImageIndex ? 'border-[var(--sublimes-gold)]' : 'border-transparent'
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <ImageWithFallback
                      src={image}
                      alt={`${listing.title} - Image ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}