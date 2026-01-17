import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  MapPin, 
  Clock, 
  Phone, 
  Star, 
  Shield, 
  Award, 
  Globe,
  MessageCircle,
  Heart,
  HeartIcon,
  Share2,
  Navigation,
  Mail,
  CheckCircle,
  Users,
  Calendar,
  Wrench,
  Car,
  DollarSign,
  Zap,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { useGarageReviews } from '../hooks/useGarages';

interface GarageDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
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
}

export function GarageDetailModal({ isOpen, onClose, garage }: GarageDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const { reviews: liveReviews, loading: reviewsLoading, createReview, refetch: refetchReviews } = useGarageReviews(garage.id);
  const [revRating, setRevRating] = useState<number>(5);
  const [revTitle, setRevTitle] = useState<string>('');
  const [revComment, setRevComment] = useState<string>('');

  const handleWhatsAppMessage = () => {
    const whatsappNumber = garage.whatsapp || garage.phone;
    const cleanNumber = whatsappNumber.replace(/\D/g, '');
    const message = encodeURIComponent(`Hi! I found your garage "${garage.name}" on Sublimes Drive. I'm interested in your services.`);
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
    toast.success('Opening WhatsApp...');
  };

  const handleCall = () => {
    window.open(`tel:${garage.phone}`, '_self');
    toast.success('Opening dialer...');
  };

  const handleEmail = () => {
    if (garage.email) {
      const subject = encodeURIComponent(`Inquiry from Sublimes Drive - ${garage.name}`);
      const body = encodeURIComponent(`Hi,\n\nI found your garage on Sublimes Drive and I'm interested in your services.\n\nGarage: ${garage.name}\nLocation: ${garage.address}\n\nPlease let me know more about your services.\n\nThank you!`);
      window.open(`mailto:${garage.email}?subject=${subject}&body=${body}`, '_self');
      toast.success('Opening email client...');
    } else {
      toast.error('Email not available');
    }
  };

  const handleViewLocation = () => {
    const encodedAddress = encodeURIComponent(`${garage.name}, ${garage.address}`);
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    window.open(googleMapsUrl, '_blank');
    toast.success('Opening location in maps...');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: garage.name,
        text: `Check out ${garage.name} on Sublimes Drive - ${garage.specialties.join(', ')} specialist in ${garage.location}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleToggleFavorite = () => {
    setIsFavorited(!isFavorited);
    toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleWebsiteVisit = () => {
    if (garage.website) {
      const url = garage.website.startsWith('http') ? garage.website : `https://${garage.website}`;
      window.open(url, '_blank');
      toast.success('Opening website...');
    }
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('971')) {
      return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
    }
    return phone;
  };

  const reviews = liveReviews as any[];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden p-0 w-[95vw] sm:w-full">
        <div className="flex flex-col h-full max-h-[95vh] sm:max-h-[90vh]">
          {/* Header - Mobile Optimized */}
          <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-border flex-shrink-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                {garage.logo && (
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-lg p-1.5 sm:p-2 shadow-md flex-shrink-0">
                    <ImageWithFallback
                      src={garage.logo}
                      alt={`${garage.name} logo`}
                      className="w-full h-full object-contain rounded"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-lg sm:text-2xl font-bold flex items-center gap-2 line-clamp-1">
                    <span className="truncate">{garage.name}</span>
                    {garage.isVerified && (
                      <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                    )}
                    {garage.isPremium && (
                      <Award className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--sublimes-gold)] flex-shrink-0" />
                    )}
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                    Detailed information about {garage.name} garage including services, contact details, and customer reviews.
                  </DialogDescription>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
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
                      <span className="ml-2 text-xs sm:text-sm text-muted-foreground">
                        {garage.rating} ({garage.reviewCount})
                      </span>
                    </div>
                    <div className="flex items-center gap-1 flex-wrap">
                      {garage.isVerified && (
                        <Badge className="bg-green-500 text-white text-xs">
                          <CheckCircle className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {garage.isPremium && (
                        <Badge className="bg-[var(--sublimes-gold)] text-black text-xs">
                          <Award className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Mobile Optimized */}
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleFavorite}
                  className={`h-8 w-8 sm:h-10 sm:w-10 p-0 ${isFavorited ? 'text-red-500 border-red-200' : ''}`}
                >
                  <Heart className={`h-3 w-3 sm:h-4 sm:w-4 ${isFavorited ? 'fill-current' : ''}`} />
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare} className="h-8 w-8 sm:h-10 sm:w-10 p-0">
                  <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Content - Fixed Height with Proper Scrolling */}
          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="overview" className="w-full h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-4 bg-background/95 backdrop-blur-sm z-10 mx-3 sm:mx-6 mt-3 sm:mt-4 flex-shrink-0">
                <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
                <TabsTrigger value="services" className="text-xs sm:text-sm">Services</TabsTrigger>
                <TabsTrigger value="gallery" className="text-xs sm:text-sm">Gallery</TabsTrigger>
                <TabsTrigger value="reviews" className="text-xs sm:text-sm">Reviews</TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto">
                <div className="p-3 sm:p-6 pb-6">
                  <TabsContent value="overview" className="space-y-4 sm:space-y-6 mt-0">
                    {/* Quick Actions */}
                    <Card>
                      <CardContent className="p-3 sm:p-4">
                        <h3 className="font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                          <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--sublimes-gold)]" />
                          Quick Actions
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                          <Button 
                            className="bg-green-600 hover:bg-green-700 text-white h-auto py-2 sm:py-3 flex-col gap-1 sm:gap-2"
                            onClick={handleWhatsAppMessage}
                          >
                            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="text-xs sm:text-sm">WhatsApp</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            className="h-auto py-2 sm:py-3 flex-col gap-1 sm:gap-2"
                            onClick={handleCall}
                          >
                            <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="text-xs sm:text-sm">Call</span>
                          </Button>
                          {garage.email && (
                            <Button 
                              variant="outline" 
                              className="h-auto py-2 sm:py-3 flex-col gap-1 sm:gap-2"
                              onClick={handleEmail}
                            >
                              <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
                              <span className="text-xs sm:text-sm">Email</span>
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            className="h-auto py-2 sm:py-3 flex-col gap-1 sm:gap-2 text-blue-600 border-blue-200"
                            onClick={handleViewLocation}
                          >
                            <Navigation className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="text-xs sm:text-sm">Location</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <Card>
                        <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                          <h3 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                            <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--sublimes-gold)]" />
                            Location & Contact
                          </h3>
                          
                          <div className="space-y-2 sm:space-y-3">
                            <div>
                              <p className="text-xs sm:text-sm text-muted-foreground">Address</p>
                              <p className="text-xs sm:text-sm font-medium">{garage.address}</p>
                              <p className="text-xs sm:text-sm text-muted-foreground">{garage.location}</p>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-2 sm:gap-3">
                              <div>
                                <p className="text-xs sm:text-sm text-muted-foreground">Phone</p>
                                <p className="text-xs sm:text-sm font-medium">{formatPhoneNumber(garage.phone)}</p>
                              </div>
                              
                              {garage.email && (
                                <div>
                                  <p className="text-xs sm:text-sm text-muted-foreground">Email</p>
                                  <p className="text-xs sm:text-sm font-medium">{garage.email}</p>
                                </div>
                              )}
                              
                              {garage.website && (
                                <div>
                                  <p className="text-xs sm:text-sm text-muted-foreground">Website</p>
                                  <Button 
                                    variant="link" 
                                    className="h-auto p-0 text-xs sm:text-sm font-medium text-blue-600"
                                    onClick={handleWebsiteVisit}
                                  >
                                    {garage.website}
                                    <ExternalLink className="h-2 w-2 sm:h-3 sm:w-3 ml-1" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                          <h3 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--sublimes-gold)]" />
                            Business Info
                          </h3>
                          
                          <div className="space-y-2 sm:space-y-3">
                            <div>
                              <p className="text-xs sm:text-sm text-muted-foreground">Opening Hours</p>
                              <p className="text-xs sm:text-sm font-medium">{garage.openingHours}</p>
                            </div>
                            
                            {garage.workingDays && (
                              <div>
                                <p className="text-xs sm:text-sm text-muted-foreground">Working Days</p>
                                <p className="text-xs sm:text-sm font-medium">{garage.workingDays}</p>
                              </div>
                            )}
                            
                            <div className="grid grid-cols-2 gap-2 sm:gap-3">
                              <div>
                                <p className="text-xs sm:text-sm text-muted-foreground">Response Time</p>
                                <p className="text-xs sm:text-sm font-medium text-green-600">{garage.responseTime}</p>
                              </div>
                              
                              <div>
                                <p className="text-xs sm:text-sm text-muted-foreground">Price Range</p>
                                <p className="text-xs sm:text-sm font-medium">{garage.priceRange}</p>
                              </div>
                            </div>
                            
                            {garage.yearsOfService && (
                              <div>
                                <p className="text-xs sm:text-sm text-muted-foreground">Years of Service</p>
                                <p className="text-xs sm:text-sm font-medium">{garage.yearsOfService} years</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Description */}
                    {garage.description && (
                      <Card>
                        <CardContent className="p-3 sm:p-4">
                          <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">About {garage.name}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{garage.description}</p>
                        </CardContent>
                      </Card>
                    )}

                    {/* Stats */}
                    <Card>
                      <CardContent className="p-3 sm:p-4">
                        <h3 className="font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                          <Users className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--sublimes-gold)]" />
                          Performance Stats
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                          {garage.completedJobs && (
                            <div className="text-center">
                              <p className="text-lg sm:text-2xl font-bold text-[var(--sublimes-gold)]">{garage.completedJobs}</p>
                              <p className="text-xs sm:text-sm text-muted-foreground">Completed Jobs</p>
                            </div>
                          )}
                          <div className="text-center">
                            <p className="text-lg sm:text-2xl font-bold text-green-600">{garage.rating}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">Average Rating</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg sm:text-2xl font-bold text-blue-600">{garage.reviewCount}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">Total Reviews</p>
                          </div>
                          {garage.teamSize && (
                            <div className="text-center">
                              <p className="text-lg sm:text-2xl font-bold text-purple-600">{garage.teamSize}</p>
                              <p className="text-xs sm:text-sm text-muted-foreground">Team Members</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="services" className="space-y-4 sm:space-y-6 mt-0">
                    <Card>
                      <CardContent className="p-3 sm:p-4">
                        <h3 className="font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                          <Wrench className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--sublimes-gold)]" />
                          Services Offered
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                          {garage.services.map((service, index) => (
                            <Badge key={index} variant="outline" className="justify-center py-1.5 sm:py-2 text-xs">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-3 sm:p-4">
                        <h3 className="font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                          <Car className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--sublimes-gold)]" />
                          Brand Specializations
                        </h3>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
                          {garage.specialties.map((brand, index) => (
                            <Badge key={index} className="bg-[var(--sublimes-gold)] text-black justify-center py-1.5 sm:py-2 text-xs">
                              {brand}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {garage.certifications && garage.certifications.length > 0 && (
                      <Card>
                        <CardContent className="p-3 sm:p-4">
                          <h3 className="font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                            <Award className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--sublimes-gold)]" />
                            Certifications
                          </h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                            {garage.certifications.map((cert, index) => (
                              <Badge key={index} variant="outline" className="justify-center py-1.5 sm:py-2 text-green-600 border-green-200 text-xs">
                                <CheckCircle className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                                {cert}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="gallery" className="space-y-4 sm:space-y-6 mt-0">
                    <Card>
                      <CardContent className="p-3 sm:p-4">
                        <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Gallery</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                          {garage.images.map((image, index) => (
                            <div 
                              key={index} 
                              className="aspect-video overflow-hidden rounded-lg border border-border cursor-pointer hover:opacity-75 transition-opacity"
                              onClick={() => setCurrentImageIndex(index)}
                            >
                              <ImageWithFallback
                                src={image}
                                alt={`${garage.name} - Image ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="reviews" className="space-y-4 sm:space-y-6 mt-0">
                    <Card>
                      <CardContent className="p-3 sm:p-4">
                        <h3 className="font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                          <Star className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--sublimes-gold)]" />
                          Customer Reviews ({reviews?.length || 0})
                        </h3>
                        <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <select
                            className="border border-border rounded px-2 py-1 bg-background text-foreground"
                            value={revRating}
                            onChange={(e) => setRevRating(Number(e.target.value))}
                          >
                            {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                          </select>
                          <input
                            type="text"
                            placeholder="Title (optional)"
                            className="border border-border rounded px-2 py-1 bg-background text-foreground"
                            value={revTitle}
                            onChange={(e) => setRevTitle(e.target.value)}
                          />
                          <input
                            type="text"
                            placeholder="Comment"
                            className="border border-border rounded px-2 py-1 bg-background text-foreground"
                            value={revComment}
                            onChange={(e) => setRevComment(e.target.value)}
                          />
                          <div className="sm:col-span-3">
                            <Button
                              onClick={async () => {
                                try {
                                  await createReview({ rating: revRating, title: revTitle, comment: revComment });
                                  toast.success('Review posted');
                                  setRevTitle('');
                                  setRevComment('');
                                  setRevRating(5);
                                  await refetchReviews();
                                } catch (e: any) {
                                  toast.error(e?.message || 'Failed to post review');
                                }
                              }}
                              className="bg-[#D4AF37] hover:bg-[#C19B2E] text-[#0B1426]"
                            >
                              Post Review
                            </Button>
                          </div>
                        </div>
                        
                        {reviewsLoading && (
                          <div className="text-sm text-muted-foreground">Loading reviews...</div>
                        )}
                        {!reviewsLoading && (!reviews || reviews.length === 0) && (
                          <div className="text-sm text-muted-foreground">No reviews yet</div>
                        )}
                        <div className="space-y-3 sm:space-y-4">
                          {reviews?.map((review: any) => (
                            <div key={review.id} className="border-b border-border last:border-b-0 pb-3 sm:pb-4 last:pb-0">
                              <div className="flex items-start gap-2 sm:gap-3">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden flex-shrink-0">
                                  <ImageWithFallback
                                    src={review.avatar || ''}
                                    alt={review.user_id}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-medium text-sm sm:text-base">{review.title || 'Review'}</h4>
                                    <span className="text-xs sm:text-sm text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex items-center mb-2">
                                    <div className="flex text-yellow-400">
                                      {[...Array(5)].map((_, i) => (
                                        <Star 
                                          key={i} 
                                          className={`w-3 h-3 sm:w-4 sm:h-4 ${
                                            i < (review.rating || 0)
                                              ? 'fill-current text-yellow-400' 
                                              : 'text-gray-300'
                                          }`}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                  <p className="text-xs sm:text-sm text-muted-foreground">{review.comment || ''}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </div>
              </div>
            </Tabs>
          </div>

          {/* Footer Actions - Mobile Optimized */}
          <div className="border-t border-border p-3 sm:p-6 flex-shrink-0">
            <div className="flex gap-2 sm:gap-3">
              <Button 
                className="flex-1 bg-green-600 hover:bg-green-700 text-white h-9 sm:h-10"
                onClick={handleWhatsAppMessage}
              >
                <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">WhatsApp</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 h-9 sm:h-10"
                onClick={handleCall}
              >
                <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">Call</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={handleViewLocation}
                className="px-2 sm:px-4 h-9 sm:h-10"
              >
                <Navigation className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline text-xs sm:text-sm">Directions</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}