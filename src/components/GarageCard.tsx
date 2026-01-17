import { useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter } from './ui/card';
import { MapPin, Clock, Phone, Star, Shield, Award, Heart, MessageCircle, Navigation, Mail, Share2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { GarageDetailModal } from './GarageDetailModal';
import { FeaturedBadge } from './ui/FeaturedBadge';
import { toast } from 'sonner';

interface GarageCardProps {
  garage: {
    id: string;
    name: string;
    logo?: string;
    location: string;
    address: string;
    rating: number;
    reviewCount: number;
    isVerified: boolean;
    isPremium?: boolean;
    featured?: boolean;
    openingHours: string;
    phone: string;
    whatsapp?: string;
    email?: string;
    website?: string;
    services: string[];
    specialties: string[];
    priceRange: string;
    responseTime: string;
    completedJobs?: number;
    images: string[];
    description?: string;
    yearsOfService?: number;
    certifications?: string[];
    teamSize?: number;
    workingDays?: string;
    emergencyService?: boolean;
    pickupService?: boolean;
    warrantyPeriod?: string;
  };
  variant?: 'grid' | 'list';
}

export function GarageCard({ garage, variant = 'grid' }: GarageCardProps) {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  const handleWhatsAppMessage = (e: React.MouseEvent) => {
    e.stopPropagation();
    const whatsappNumber = garage.whatsapp || garage.phone;
    const cleanNumber = whatsappNumber.replace(/\D/g, '');
    const message = encodeURIComponent(`Hi! I found your garage "${garage.name}" on Sublimes Drive. I'm interested in your services.`);
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
    toast.success('Opening WhatsApp...');
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      // For mobile devices, use tel: protocol
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        window.location.href = `tel:${garage.phone}`;
      } else {
        // For desktop, try to open default phone app or show the number
        if (window.confirm(`Call ${garage.name} at ${garage.phone}?`)) {
          window.location.href = `tel:${garage.phone}`;
        }
      }
      toast.success('Opening dialer...');
    } catch (error) {
      console.error('Failed to initiate call:', error);
      toast.error('Unable to make call. Please dial manually: ' + garage.phone);
    }
  };

  const handleEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (garage.email) {
      const subject = encodeURIComponent(`Inquiry from Sublimes Drive - ${garage.name}`);
      const body = encodeURIComponent(`Hi,\n\nI found your garage on Sublimes Drive and I'm interested in your services.\n\nGarage: ${garage.name}\nLocation: ${garage.address}\n\nPlease let me know more about your services.\n\nThank you!`);
      window.open(`mailto:${garage.email}?subject=${subject}&body=${body}`, '_self');
      toast.success('Opening email client...');
    } else {
      toast.error('Email not available');
    }
  };

  const handleViewLocation = (e: React.MouseEvent) => {
    e.stopPropagation();
    const encodedAddress = encodeURIComponent(`${garage.name}, ${garage.address}`);
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    window.open(googleMapsUrl, '_blank');
    toast.success('Opening location in maps...');
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: garage.name,
          text: `Check out ${garage.name} on Sublimes Drive - ${garage.specialties.join(', ')} specialist in ${garage.location}`,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled share or error occurred
      }
    } else {
      const { copyToClipboard } = await import('../utils/clipboard');
      const success = await copyToClipboard(window.location.href);
      if (success) {
        toast.success('Link copied to clipboard!');
      } else {
        toast.error('Failed to copy link');
      }
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
    toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleCardClick = () => {
    setShowDetailModal(true);
  };

  // List view variant
  if (variant === 'list') {
    return (
      <>
        <Card 
          className={`bg-card border-border hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-[var(--sublimes-gold)]/50 ${garage.featured ? 'ring-2 ring-[var(--sublimes-gold)]/50 shadow-xl' : ''}`}
          onClick={handleCardClick}
        >
          <CardContent className="p-4">
            <div className="flex gap-4">
              {/* Image */}
              <div className="relative w-24 h-24 flex-shrink-0">
                <ImageWithFallback
                  src={garage.images[0]}
                  alt={garage.name}
                  className="w-full h-full object-cover rounded-lg"
                />
                {garage.logo && (
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full p-1 shadow-md">
                    <ImageWithFallback
                      src={garage.logo}
                      alt={`${garage.name} logo`}
                      className="w-full h-full object-contain rounded"
                    />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg text-card-foreground truncate">{garage.name}</h3>
                      {garage.featured && <FeaturedBadge variant="compact" />}
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${
                                i < Math.floor(garage.rating) 
                                  ? 'fill-current text-yellow-400' 
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="ml-1 text-sm text-muted-foreground">
                          {garage.rating} ({garage.reviewCount})
                        </span>
                      </div>
                      <div className="flex space-x-1">
                        {garage.isVerified && (
                          <Badge className="bg-green-500 text-white text-xs">
                            <Shield className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        {garage.isPremium && (
                          <Badge className="bg-[var(--sublimes-gold)] text-black text-xs">
                            <Award className="w-3 h-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-[var(--sublimes-gold)] font-bold text-lg">{garage.priceRange}</div>
                    <div className="text-green-600 text-sm font-medium">{garage.responseTime}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground truncate">{garage.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground truncate">{garage.openingHours}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex flex-wrap gap-1">
                    {garage.specialties.slice(0, 3).map((specialty, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                    {garage.specialties.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{garage.specialties.length - 3}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={handleWhatsAppMessage}
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      WhatsApp
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleCall}
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      Call
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detail Modal */}
        <GarageDetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          garage={garage}
        />
      </>
    );
  }

  // Grid view variant (default)
  return (
    <>
      <Card 
        className={`bg-card border-border hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-[var(--sublimes-gold)]/50 ${garage.featured ? 'ring-2 ring-[var(--sublimes-gold)]/50 shadow-xl' : ''}`}
        onClick={handleCardClick}
      >
        <div className="relative">
          <div className="aspect-video overflow-hidden rounded-t-lg">
            <ImageWithFallback
              src={garage.images[0]}
              alt={garage.name}
              className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
            />
          </div>
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex space-x-2">
            {garage.featured && <FeaturedBadge />}
            {garage.isVerified && (
              <Badge className="bg-green-500 text-white">
                <Shield className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
            {garage.isPremium && (
              <Badge className="bg-[var(--sublimes-gold)] text-black">
                <Award className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>

          {/* Action Icons */}
          <div className="absolute top-3 right-3 flex space-x-2">
            <Button
              size="icon"
              variant="outline"
              className="w-8 h-8 bg-white/90 hover:bg-white border-white/50"
              onClick={handleToggleFavorite}
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current text-red-500' : 'text-gray-600'}`} />
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="w-8 h-8 bg-white/90 hover:bg-white border-white/50"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4 text-gray-600" />
            </Button>
          </div>
          
          {/* Logo */}
          {garage.logo && (
            <div className="absolute bottom-3 left-3 w-12 h-12 bg-white rounded-lg p-1 shadow-md">
              <ImageWithFallback
                src={garage.logo}
                alt={`${garage.name} logo`}
                className="w-full h-full object-contain rounded"
              />
            </div>
          )}
        </div>
        
        <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
          {/* Header */}
          <div>
            <h3 className="font-semibold text-base sm:text-lg text-card-foreground hover:text-[var(--sublimes-gold)] transition-colors line-clamp-1">{garage.name}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <div className="flex items-center">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-3 h-3 sm:w-4 sm:h-4 ${
                        i < Math.floor(garage.rating) 
                          ? 'fill-current text-yellow-400' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-1 text-xs sm:text-sm text-muted-foreground">
                  {garage.rating} ({garage.reviewCount})
                </span>
              </div>
            </div>
          </div>
          
          {/* Location */}
          <div className="flex items-start space-x-2 text-xs sm:text-sm">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-card-foreground truncate">{garage.location}</p>
              <p className="text-muted-foreground text-xs line-clamp-1">{garage.address}</p>
            </div>
          </div>
          
          {/* Hours & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
            <div className="flex items-center space-x-2">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground truncate">{garage.openingHours}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-card-foreground truncate">{garage.phone}</span>
            </div>
          </div>
          
          {/* Services */}
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-card-foreground mb-2">Services:</p>
            <div className="flex flex-wrap gap-1">
              {garage.services.slice(0, 3).map((service, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {service}
                </Badge>
              ))}
              {garage.services.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{garage.services.length - 3} more
                </Badge>
              )}
            </div>
          </div>
          
          {/* Specialties - Mobile Optimized */}
          {garage.specialties.length > 0 && (
            <div>
              <p className="text-xs sm:text-sm font-medium text-card-foreground mb-1">
                <span className="sm:hidden">Specializes:</span>
                <span className="hidden sm:inline">Specializes in:</span>
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                {garage.specialties.slice(0, 2).join(', ')}
                {garage.specialties.length > 2 && ` +${garage.specialties.length - 2} more`}
              </p>
            </div>
          )}
          
          {/* Price Range & Response Time - Mobile Optimized */}
          <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
            <div>
              <span className="text-muted-foreground">Price: </span>
              <span className="text-card-foreground font-medium text-xs sm:text-sm">{garage.priceRange}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Response: </span>
              <span className="text-green-600 font-medium text-xs sm:text-sm">{garage.responseTime}</span>
            </div>
            {garage.completedJobs && (
              <div className="col-span-2 sm:hidden">
                <span className="text-muted-foreground text-xs">Jobs: </span>
                <span className="text-blue-600 font-medium text-xs">{garage.completedJobs}</span>
              </div>
            )}
            {garage.completedJobs && (
              <div className="col-span-2 hidden sm:block">
                <span className="text-muted-foreground">Completed Jobs: </span>
                <span className="text-blue-600 font-medium">{garage.completedJobs}</span>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="p-3 sm:p-4 pt-0 space-y-2">
          {/* Quick Action Buttons - Mobile Responsive */}
          <div className="flex gap-2 w-full">
            <Button 
              size="sm" 
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              onClick={handleWhatsAppMessage}
            >
              <MessageCircle className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">WhatsApp</span>
              <span className="sm:hidden">Chat</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={handleCall}
            >
              <Phone className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Call</span>
              <span className="sm:hidden">Call</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 sm:flex-none sm:w-auto px-2"
              onClick={handleViewLocation}
            >
              <Navigation className="w-3 h-3 sm:mr-1" />
              <span className="hidden sm:inline">Location</span>
            </Button>
            {garage.email && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 sm:flex-none sm:w-auto px-2"
                onClick={handleEmail}
              >
                <Mail className="w-3 h-3 sm:mr-1" />
                <span className="hidden sm:inline">Email</span>
              </Button>
            )}
          </div>
          
          {/* View Profile Button - Mobile Optimized */}
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full border-[var(--sublimes-gold)] text-[var(--sublimes-gold)] hover:bg-[var(--sublimes-gold)] hover:text-black text-xs sm:text-sm py-2"
            onClick={(e) => {
              e.stopPropagation();
              setShowDetailModal(true);
            }}
          >
            <span className="sm:hidden">View Details</span>
            <span className="hidden sm:inline">View Full Profile</span>
          </Button>
        </CardFooter>
      </Card>

      {/* Detail Modal */}
      <GarageDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        garage={garage}
      />
    </>
  );
}