/**
 * PlaceYourAdPage_COMPLETE - Full listing creation with overseas options
 * Matches screenshot design with all fields including international shipping
 */

import { useState, useEffect } from 'react';
import { Plus, Upload, X, Car, Wrench, Loader2, CheckCircle, Image as ImageIcon, Globe, Ship, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';
import { toast } from 'sonner';
import { useListings, useAnalytics, useImageUpload } from '../hooks';
import { chineseCarBrands } from '../utils/chineseCarData';

interface PlaceYourAdPageProps {
  onNavigate?: (page: string) => void;
}

export function PlaceYourAdPage({ onNavigate }: PlaceYourAdPageProps) {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Basic Information
    title: '',
    description: '',
    price: '',
    location: '',
    condition: 'excellent',
    priceNegotiable: true,
    
    // Overseas Listing Options
    originCountry: 'UAE',
    isOverseas: false,
    shippingAvailable: false,
    estimatedDeliveryDays: '',
    customsCleared: false,
    
    // Vehicle Details (for cars)
    listingType: 'car', // car, part, accessory, service
    make: '',
    model: '',
    year: '',
    mileage: '',
    color: '',
    bodyType: '',
    transmission: 'automatic',
    fuelType: 'gasoline',
    doors: '4',
    seats: '5',
    engineCapacity: '',
    horsepower: '',
    
    // Contact Information
    contactMethod: 'phone', // phone, whatsapp, email
    contactPhone: '',
    contactEmail: '',
    whatsappNumber: '',
    
    // Additional Options
    warrantyAvailable: false,
    warrantyMonths: '',
    features: [] as string[],
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Hooks
  const { createListing, refetch } = useListings();
  const analytics = useAnalytics();
  const { uploadImages } = useImageUpload();

  // Track page view
  useEffect(() => {
    analytics.trackPageView('/place-your-ad');
  }, []);

  // UAE Emirates for location dropdown
  const uaeLocations = [
    'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 
    'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'
  ];

  // Countries for origin
  const countries = [
    'UAE', 'China', 'Saudi Arabia', 'Oman', 'Qatar', 
    'Bahrain', 'Kuwait', 'Other'
  ];

  // Condition options
  const conditions = [
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'needs_work', label: 'Needs Work' },
    { value: 'new', label: 'Brand New' },
  ];

  // Listing types
  const listingTypes = [
    { value: 'car', label: '🚗 Car', icon: Car },
    { value: 'part', label: '🔧 Part', icon: Wrench },
    { value: 'accessory', label: '✨ Accessory', icon: Plus },
    { value: 'service', label: '🛠️ Service', icon: Wrench },
  ];

  // Get models for selected make
  const selectedBrand = chineseCarBrands.find(brand => brand.id === formData.make);
  const availableModels = selectedBrand?.models || [];

  // Popular car features
  const carFeatures = [
    'Sunroof', 'Leather Seats', 'Navigation', 'Backup Camera',
    'Parking Sensors', 'Cruise Control', 'Bluetooth', 'USB Port',
    'Heated Seats', 'Keyless Entry', 'Push Start', 'Alloy Wheels',
    'LED Headlights', 'Adaptive Cruise Control', 'Lane Assist', '360 Camera'
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + imageFiles.length > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }

    setImageFiles(prev => [...prev, ...files]);
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const toggleFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    if (formData.listingType === 'car' && (!formData.make || !formData.model || !formData.year)) {
      toast.error('Please fill in car details (make, model, year)');
      return;
    }
    if (!formData.contactPhone && !formData.contactEmail) {
      toast.error('Please provide at least one contact method');
      return;
    }
    if (imageFiles.length === 0) {
      toast.error('Please upload at least one photo');
      return;
    }

    setSubmitting(true);
    analytics.trackEvent('ad_submission_started', { 
      listing_type: formData.listingType,
      is_overseas: formData.isOverseas 
    });

    try {
      // Upload images first (marketplace listings bucket)
      let imageUrls: string[] = [];
      if (imageFiles.length > 0) {
        const { urls, errors } = await uploadImages(imageFiles, 'listings', 'marketplace');
        if (errors.length > 0) {
          throw new Error('Failed to upload images');
        }
        imageUrls = urls || [];
      }

      // Create listing
      const { error } = await createListing({
        // Basic info
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        location: formData.location,
        condition: formData.condition,
        price_negotiable: formData.priceNegotiable,
        
        // Overseas fields
        origin_country: formData.originCountry,
        is_overseas: formData.originCountry !== 'UAE',
        shipping_available: formData.shippingAvailable,
        estimated_delivery_days: formData.estimatedDeliveryDays ? parseInt(formData.estimatedDeliveryDays) : null,
        customs_cleared: formData.customsCleared,
        
        // Listing type
        listing_type: formData.listingType,
        
        // Vehicle fields (only for cars)
        make: formData.listingType === 'car' ? formData.make : null,
        model: formData.listingType === 'car' ? formData.model : null,
        year: formData.year ? parseInt(formData.year) : null,
        mileage: formData.mileage ? parseInt(formData.mileage) : null,
        color: formData.color,
        body_type: formData.bodyType,
        transmission: formData.transmission,
        fuel_type: formData.fuelType,
        doors: formData.doors ? parseInt(formData.doors) : null,
        seats: formData.seats ? parseInt(formData.seats) : null,
        engine_capacity: formData.engineCapacity,
        horsepower: formData.horsepower ? parseInt(formData.horsepower) : null,
        
        // Contact info
        contact_phone: formData.contactPhone,
        contact_email: formData.contactEmail,
        whatsapp_number: formData.whatsappNumber || formData.contactPhone,
        
        // Warranty
        warranty_available: formData.warrantyAvailable,
        warranty_months: formData.warrantyMonths ? parseInt(formData.warrantyMonths) : null,
        
        // Images and features
        images: imageUrls,
        features: formData.features,
        
        // Always pending for approval
        status: 'pending',
      });

      if (error) throw error;

      analytics.trackEvent('ad_submitted_successfully', { 
        listing_type: formData.listingType 
      });
      
      toast.success('Your listing has been submitted for approval!', {
        description: 'You will be notified once it is reviewed.',
      });
      
      // Navigate to my listings
      setTimeout(() => {
        onNavigate?.('my-listings');
      }, 2000);

    } catch (error: any) {
      console.error('Submission error:', error);
      analytics.trackEvent('ad_submission_failed', { 
        error: error.message 
      });
      toast.error('Failed to submit listing', {
        description: error.message || 'Please try again',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1426] pb-20 lg:pb-8">
      {/* Header */}
      <div className="bg-[#1A1F2E] border-b border-[#2A3441] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[#E8EAED] text-2xl">Place Your Ad</h1>
              <p className="text-[#8A92A6] text-sm mt-1">
                List your car, parts, or services
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => onNavigate?.('marketplace')}
              className="border-[#2A3441] text-[#8A92A6] hover:bg-[#1A1F2E]"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Basic Information */}
          <Card className="bg-[#1A1F2E] border-[#2A3441]">
            <CardHeader>
              <CardTitle className="text-[#E8EAED]">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div>
                <Label htmlFor="title" className="text-[#E8EAED]">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Enter a descriptive title for your ad"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-[#0B1426] border-[#2A3441] text-[#E8EAED] mt-2"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-[#E8EAED]">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed information about your item or service"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-[#0B1426] border-[#2A3441] text-[#E8EAED] mt-2 min-h-[120px]"
                  rows={6}
                />
              </div>

              {/* Price and Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price" className="text-[#E8EAED]">
                    Price (AED) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="bg-[#0B1426] border-[#2A3441] text-[#E8EAED] mt-2"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="location" className="text-[#E8EAED]">
                    Location
                  </Label>
                  <Select
                    value={formData.location}
                    onValueChange={(value) => setFormData({ ...formData, location: value })}
                  >
                    <SelectTrigger className="bg-[#0B1426] border-[#2A3441] text-[#E8EAED] mt-2">
                      <SelectValue placeholder="Enter location" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1F2E] border-[#2A3441]">
                      {uaeLocations.map(loc => (
                        <SelectItem key={loc} value={loc} className="text-[#E8EAED]">
                          {loc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Condition */}
              <div>
                <Label htmlFor="condition" className="text-[#E8EAED]">
                  Condition
                </Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value) => setFormData({ ...formData, condition: value })}
                >
                  <SelectTrigger className="bg-[#0B1426] border-[#2A3441] text-[#E8EAED] mt-2">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1F2E] border-[#2A3441]">
                    {conditions.map(cond => (
                      <SelectItem key={cond.value} value={cond.value} className="text-[#E8EAED]">
                        {cond.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Negotiable */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="priceNegotiable"
                  checked={formData.priceNegotiable}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, priceNegotiable: checked as boolean })
                  }
                  className="border-[#2A3441]"
                />
                <Label htmlFor="priceNegotiable" className="text-[#E8EAED] cursor-pointer">
                  Price negotiable
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Overseas Listing Options */}
          <Card className="bg-[#1A1F2E] border-[#2A3441]">
            <CardHeader>
              <CardTitle className="text-[#E8EAED] flex items-center gap-2">
                <Globe className="h-5 w-5 text-[#D4AF37]" />
                Overseas Listing Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Origin Country */}
              <div>
                <Label htmlFor="originCountry" className="text-[#E8EAED]">
                  Origin
                </Label>
                <div className="flex gap-2 mt-2">
                  {/* UAE/Other toggle buttons */}
                  <Button
                    type="button"
                    variant={formData.originCountry === 'UAE' ? 'default' : 'outline'}
                    onClick={() => setFormData({ ...formData, originCountry: 'UAE' })}
                    className={formData.originCountry === 'UAE' 
                      ? 'bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90'
                      : 'border-[#2A3441] text-[#8A92A6] hover:bg-[#2A3441]'
                    }
                  >
                    🇦🇪 UAE
                  </Button>
                  <Select
                    value={formData.originCountry !== 'UAE' ? formData.originCountry : 'other'}
                    onValueChange={(value) => setFormData({ ...formData, originCountry: value })}
                    disabled={formData.originCountry === 'UAE'}
                  >
                    <SelectTrigger className="bg-[#0B1426] border-[#2A3441] text-[#E8EAED] flex-1">
                      <SelectValue placeholder="Other" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1F2E] border-[#2A3441]">
                      {countries.filter(c => c !== 'UAE').map(country => (
                        <SelectItem key={country} value={country} className="text-[#E8EAED]">
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Show overseas options only if not UAE */}
              {formData.originCountry !== 'UAE' && (
                <>
                  {/* Shipping Available */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="shippingAvailable"
                      checked={formData.shippingAvailable}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, shippingAvailable: checked as boolean })
                      }
                      className="border-[#2A3441]"
                    />
                    <Label htmlFor="shippingAvailable" className="text-[#E8EAED] cursor-pointer flex items-center gap-2">
                      <Ship className="h-4 w-4" />
                      Shipping to UAE available
                    </Label>
                  </div>

                  {/* Estimated Delivery */}
                  {formData.shippingAvailable && (
                    <div>
                      <Label htmlFor="estimatedDelivery" className="text-[#E8EAED]">
                        Estimated Delivery (days)
                      </Label>
                      <Input
                        id="estimatedDelivery"
                        type="number"
                        placeholder="e.g., 30"
                        value={formData.estimatedDeliveryDays}
                        onChange={(e) => setFormData({ ...formData, estimatedDeliveryDays: e.target.value })}
                        className="bg-[#0B1426] border-[#2A3441] text-[#E8EAED] mt-2"
                      />
                    </div>
                  )}

                  {/* Customs Cleared */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="customsCleared"
                      checked={formData.customsCleared}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, customsCleared: checked as boolean })
                      }
                      className="border-[#2A3441]"
                    />
                    <Label htmlFor="customsCleared" className="text-[#E8EAED] cursor-pointer">
                      Customs already cleared
                    </Label>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Photos */}
          <Card className="bg-[#1A1F2E] border-[#2A3441]">
            <CardHeader>
              <CardTitle className="text-[#E8EAED] flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-[#D4AF37]" />
                Photos (0/{imagePreviews.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Upload Area */}
              <div className="border-2 border-dashed border-[#2A3441] rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-[#8A92A6] mx-auto mb-4" />
                <p className="text-[#E8EAED] mb-2">
                  Drag and drop photos here, or click to select files
                </p>
                <p className="text-[#8A92A6] text-sm mb-4">
                  Maximum 10 photos • JPG, PNG up to 5MB each
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('photo-upload')?.click()}
                  className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10"
                >
                  Choose Files
                </Button>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 bg-[#D4AF37] text-black text-xs px-2 py-1 rounded">
                          Cover
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-[#1A1F2E] border-[#2A3441]">
            <CardHeader>
              <CardTitle className="text-[#E8EAED]">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Preferred Contact Method */}
              <div>
                <Label className="text-[#E8EAED] mb-2 block">
                  Preferred Contact Method
                </Label>
                <RadioGroup
                  value={formData.contactMethod}
                  onValueChange={(value) => setFormData({ ...formData, contactMethod: value })}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="phone" id="phone" />
                    <Label htmlFor="phone" className="text-[#E8EAED] cursor-pointer">
                      Phone
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="whatsapp" id="whatsapp" />
                    <Label htmlFor="whatsapp" className="text-[#E8EAED] cursor-pointer">
                      WhatsApp
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="email" id="email" />
                    <Label htmlFor="email" className="text-[#E8EAED] cursor-pointer">
                      Email
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Phone Number */}
              <div>
                <Label htmlFor="contactPhone" className="text-[#E8EAED]">
                  Phone Number
                </Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  placeholder="+971 XX XXX XXXX"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="bg-[#0B1426] border-[#2A3441] text-[#E8EAED] mt-2"
                />
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="contactEmail" className="text-[#E8EAED]">
                  Email
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="bg-[#0B1426] border-[#2A3441] text-[#E8EAED] mt-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onNavigate?.('marketplace')}
              className="flex-1 border-[#2A3441] text-[#8A92A6] hover:bg-[#1A1F2E]"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit for Approval
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
