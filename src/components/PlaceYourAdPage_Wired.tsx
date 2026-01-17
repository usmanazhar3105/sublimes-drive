/**
 * PlaceYourAdPage - Complete listing creation with overseas options
 * Matches screenshot design with Vehicles AND Parts & Accessories categories
 * Mobile optimized with full overseas shipping options
 */

import { useState, useEffect } from 'react';
import { Upload, X, Car, Wrench, Loader2, CheckCircle, Image as ImageIcon, Globe, Ship, MapPin, Package } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
// import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { useListings, useAnalytics } from '../hooks';
import { supabase } from '../utils/supabase/client'
import { useUploadMarketplaceMedia } from '../../AI2SQL/hooks/useUploadMarketplaceMedia'
import { chineseCarBrands } from '../utils/chineseCarData';

interface PlaceYourAdPageProps {
  onNavigate?: (page: string) => void;
}

export function PlaceYourAdPage({ onNavigate }: PlaceYourAdPageProps) {
  const [currentStep, setCurrentStep] = useState<'category' | 'form'>('category');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Category Selection
    category: '', // 'vehicles' or 'parts-accessories'
    
    // Basic Information
    title: '',
    description: '',
    price: '',
    location: '',
    condition: 'excellent',
    priceNegotiable: true,
    
    // Overseas Listing Options
    origin: 'uae', // 'uae' or 'overseas'
    originCountry: '',
    logisticsHandling: 'vendor', // 'vendor' or 'buyer'
    shippingCost: '',
    deliveryTime: '',
    
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
    
    // Parts & Accessories Details
    partType: '', // engine, body, interior, electronics, etc.
    partCondition: 'new',
    compatibleBrands: [] as string[],
    
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
  const { createListing } = useListings();
  const analytics = useAnalytics();
  const uploadMarketplace = useUploadMarketplaceMedia();

  // Track page view
  useEffect(() => {
    analytics.trackPageView('/place-your-ad');
  }, []);

  // UAE Emirates for location dropdown
  const uaeLocations = [
    'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 
    'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'
  ];

  // Countries for origin (when overseas is selected)
  const originCountries = [
    'China', 'Japan', 'Germany', 'USA', 'UK', 
    'South Korea', 'Italy', 'France', 'Other'
  ];

  // Condition options
  const conditions = [
    { value: 'new', label: 'Brand New' },
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'needs_work', label: 'Needs Work' },
  ];

  // Part types
  const partTypes = [
    'Engine Parts', 'Body Parts', 'Interior', 'Electronics',
    'Suspension', 'Brakes', 'Exhaust', 'Lighting',
    'Wheels & Tires', 'Accessories', 'Other'
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
    if (formData.category === 'vehicles' && (!formData.make || !formData.model || !formData.year)) {
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
    if (formData.origin === 'overseas' && !formData.originCountry) {
      toast.error('Please select origin country for overseas listings');
      return;
    }

    setSubmitting(true);
    analytics.trackEvent('ad_submission_started', { 
      category: formData.category,
      is_overseas: formData.origin === 'overseas'
    });

    try {
      // Upload images first to marketplace-media
      let imageUrls: string[] = [];
      if (imageFiles.length > 0) {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        if (!userId) throw new Error('Sign in required to upload');
        const results = await Promise.allSettled(
          imageFiles.map((f) => uploadMarketplace(f, userId))
        );
        const failed = results.filter(r => r.status === 'rejected');
        if (failed.length > 0) throw new Error('Failed to upload one or more images');
        imageUrls = (results
          .filter(r => r.status === 'fulfilled') as PromiseFulfilledResult<string>[]) 
          .map(r => r.value);
      }

      // Normalize category
      let normalizedCategory = formData.category;
      if (normalizedCategory === 'parts-accessories') normalizedCategory = 'parts';
      if (normalizedCategory === 'vehicles') normalizedCategory = 'car';

      // Create listing (align to useListings.Listing)
      const { error } = await createListing({
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        currency: 'AED',
        category: normalizedCategory,
        brand: formData.category === 'vehicles' ? formData.make : (formData.compatibleBrands?.[0] || ''),
        model: formData.category === 'vehicles' ? formData.model : '',
        year: formData.year ? parseInt(formData.year) : undefined,
        mileage: formData.mileage ? parseInt(formData.mileage) : undefined,
        city: formData.location,
        country: formData.origin === 'overseas' ? formData.originCountry : 'UAE',
        media: imageUrls,
        // Pack extras into meta
        meta: {
          condition: formData.condition,
          price_negotiable: formData.priceNegotiable,
          is_overseas: formData.origin === 'overseas',
          shipping_available: formData.origin === 'overseas',
          shipping_cost: formData.shippingCost ? parseFloat(formData.shippingCost) : undefined,
          estimated_delivery_days: formData.deliveryTime ? parseInt(formData.deliveryTime) : undefined,
          logistics_handling: formData.logisticsHandling,
          color: formData.color,
          body_type: formData.bodyType,
          transmission: formData.transmission,
          fuel_type: formData.fuelType,
          doors: formData.doors ? parseInt(formData.doors) : undefined,
          seats: formData.seats ? parseInt(formData.seats) : undefined,
          engine_capacity: formData.engineCapacity,
          horsepower: formData.horsepower ? parseInt(formData.horsepower) : undefined,
          part_type: formData.partType,
          // compatibility metadata omitted (no field in form)
          compatible_brands: formData.compatibleBrands,
          contact_phone: formData.contactPhone,
          contact_email: formData.contactEmail,
          whatsapp_number: formData.whatsappNumber || formData.contactPhone,
          warranty_available: formData.warrantyAvailable,
          warranty_months: formData.warrantyMonths ? parseInt(formData.warrantyMonths) : undefined,
          features: formData.features,
        }
      });

      if (error) throw error;

      analytics.trackEvent('ad_submitted_successfully', { 
        category: formData.category,
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

  // CATEGORY SELECTION STEP
  if (currentStep === 'category') {
    return (
      <div className="min-h-screen bg-[#0B1426] pb-20 md:pb-0">
        {/* Header */}
        <div className="bg-[#0F1829] border-b border-[#1A2332] sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4 md:py-6">
            <div className="text-center md:text-left">
              <h1 className="text-2xl md:text-3xl text-[#E8EAED] mb-2">Place Your Ad</h1>
              <p className="text-sm text-[#8B92A7]">Reach thousands of car enthusiasts in the UAE</p>
            </div>
            <div className="flex items-center justify-center gap-2 mt-4 text-sm">
              <span className="text-[#8B92A7]">👁️ 238k+ daily views</span>
              <span className="text-[#8B92A7]">•</span>
              <span className="text-[#8B92A7]">🎯 48+ potential buyers</span>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#D4AF37] text-[#0B1426] flex items-center justify-center">
                1
              </div>
              <span className="ml-2 text-[#E8EAED]">Create Ad</span>
            </div>
            <div className="w-12 h-px bg-[#1A2332]" />
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#1A2332] text-[#8B92A7] flex items-center justify-center">
                2
              </div>
              <span className="ml-2 text-[#8B92A7]">Preview</span>
            </div>
            <div className="w-12 h-px bg-[#1A2332]" />
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#1A2332] text-[#8B92A7] flex items-center justify-center">
                3
              </div>
              <span className="ml-2 text-[#8B92A7]">Pricing & Boost</span>
            </div>
          </div>

          {/* Category Selection */}
          <Card className="bg-[#0F1829] border-[#1A2332]">
            <CardHeader>
              <CardTitle className="text-[#E8EAED]">Category</CardTitle>
              <CardDescription className="text-[#8B92A7]">
                What would you like to list?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Vehicles */}
                <button
                  onClick={() => {
                    setFormData({ ...formData, category: 'vehicles', listingType: 'car' });
                    setCurrentStep('form');
                  }}
                  className="group p-6 bg-[#1A2332] hover:bg-[#D4AF37]/10 border-2 border-[#1A2332] hover:border-[#D4AF37] rounded-lg transition-all text-left"
                >
                  <div className="flex items-center justify-center w-16 h-16 bg-[#D4AF37]/20 rounded-lg mb-4 group-hover:scale-110 transition-transform">
                    <Car className="w-8 h-8 text-[#D4AF37]" />
                  </div>
                  <h3 className="text-xl text-[#E8EAED] mb-2">Vehicles</h3>
                  <p className="text-sm text-[#8B92A7]">
                    Sell cars, trucks, motorcycles, and more
                  </p>
                </button>

                {/* Parts & Accessories */}
                <button
                  onClick={() => {
                    setFormData({ ...formData, category: 'parts-accessories', listingType: 'part' });
                    setCurrentStep('form');
                  }}
                  className="group p-6 bg-[#1A2332] hover:bg-[#D4AF37]/10 border-2 border-[#1A2332] hover:border-[#D4AF37] rounded-lg transition-all text-left"
                >
                  <div className="flex items-center justify-center w-16 h-16 bg-[#D4AF37]/20 rounded-lg mb-4 group-hover:scale-110 transition-transform">
                    <Wrench className="w-8 h-8 text-[#D4AF37]" />
                  </div>
                  <h3 className="text-xl text-[#E8EAED] mb-2">Parts & Accessories</h3>
                  <p className="text-sm text-[#8B92A7]">
                    List car parts, modifications, and accessories
                  </p>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // FORM STEP
  return (
    <div className="min-h-screen bg-[#0B1426] pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-[#0F1829] border-b border-[#1A2332] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl text-[#E8EAED] mb-1">Place Your Ad</h1>
              <p className="text-sm text-[#8B92A7]">
                {formData.category === 'vehicles' ? 'List your vehicle' : 'List parts & accessories'}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setCurrentStep('category')}
              className="border-[#1A2332] text-[#8B92A7] hover:bg-[#1A2332]"
            >
              Back
            </Button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Category Badge */}
          <div className="flex items-center gap-2">
            <Badge className="bg-[#D4AF37] text-[#0B1426]">
              {formData.category === 'vehicles' ? (
                <><Car className="w-4 h-4 mr-1" /> Vehicles</>
              ) : (
                <><Wrench className="w-4 h-4 mr-1" /> Parts & Accessories</>
              )}
            </Badge>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCurrentStep('category')}
              className="text-[#8B92A7] hover:text-[#D4AF37]"
            >
              Change
            </Button>
          </div>

          {/* Basic Information */}
          <Card className="bg-[#0F1829] border-[#1A2332]">
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
                  className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED] mt-2"
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
                  className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED] mt-2 min-h-[120px]"
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
                    placeholder="Enter price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED] mt-2"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="location" className="text-[#E8EAED]">
                    Location
                  </Label>
                  <Select value={formData.location} onValueChange={(val) => setFormData({ ...formData, location: val })}>
                    <SelectTrigger className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED] mt-2">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {uaeLocations.map(loc => (
                        <SelectItem key={loc} value={loc}>{loc}</SelectItem>
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
                <Select value={formData.condition} onValueChange={(val) => setFormData({ ...formData, condition: val })}>
                  <SelectTrigger className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED] mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Negotiable */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="negotiable"
                  checked={formData.priceNegotiable}
                  onCheckedChange={(checked) => setFormData({ ...formData, priceNegotiable: checked as boolean })}
                />
                <Label htmlFor="negotiable" className="text-[#E8EAED]">
                  Price negotiable
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Overseas Listing Options */}
          <Card className="bg-[#0F1829] border-[#1A2332]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#D4AF37]" />
                <CardTitle className="text-[#E8EAED]">Overseas Listing Options</CardTitle>
              </div>
              <CardDescription className="text-[#8B92A7]">
                Is this item located outside the UAE?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Origin Toggle */}
              <div>
                <Label className="text-[#E8EAED] mb-3 block">Origin</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, origin: 'uae', originCountry: '' })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.origin === 'uae'
                        ? 'bg-[#D4AF37] border-[#D4AF37] text-[#0B1426]'
                        : 'bg-[#1A2332] border-[#1A2332] text-[#E8EAED] hover:border-[#D4AF37]/50'
                    }`}
                  >
                    <MapPin className="w-5 h-5 mx-auto mb-1" />
                    <div className="text-sm">UAE</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, origin: 'overseas' })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.origin === 'overseas'
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-[#1A2332] border-[#1A2332] text-[#E8EAED] hover:border-blue-500/50'
                    }`}
                  >
                    <Globe className="w-5 h-5 mx-auto mb-1" />
                    <div className="text-sm">Overseas</div>
                  </button>
                </div>
              </div>

              {/* Overseas Fields */}
              {formData.origin === 'overseas' && (
                <>
                  {/* Origin Country */}
                  <div>
                    <Label htmlFor="originCountry" className="text-[#E8EAED]">
                      Origin Country <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={formData.originCountry} 
                      onValueChange={(val) => setFormData({ ...formData, originCountry: val })}
                    >
                      <SelectTrigger className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED] mt-2">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {originCountries.map(country => (
                          <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Logistics Handling */}
                  <div>
                    <Label className="text-[#E8EAED] mb-3 block">Logistics Handling</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, logisticsHandling: 'vendor' })}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          formData.logisticsHandling === 'vendor'
                            ? 'bg-[#D4AF37] border-[#D4AF37] text-[#0B1426]'
                            : 'bg-[#1A2332] border-[#1A2332] text-[#E8EAED] hover:border-[#D4AF37]/50'
                        }`}
                      >
                        <Ship className="w-5 h-5 mx-auto mb-1" />
                        <div className="text-sm">Vendor Handles</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, logisticsHandling: 'buyer' })}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          formData.logisticsHandling === 'buyer'
                            ? 'bg-[#D4AF37] border-[#D4AF37] text-[#0B1426]'
                            : 'bg-[#1A2332] border-[#1A2332] text-[#E8EAED] hover:border-[#D4AF37]/50'
                        }`}
                      >
                        <Package className="w-5 h-5 mx-auto mb-1" />
                        <div className="text-sm">Buyer Arranges</div>
                      </button>
                    </div>
                  </div>

                  {/* Shipping Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="shippingCost" className="text-[#E8EAED]">
                        Shipping Cost (AED)
                      </Label>
                      <Input
                        id="shippingCost"
                        type="number"
                        placeholder="Enter shipping cost"
                        value={formData.shippingCost}
                        onChange={(e) => setFormData({ ...formData, shippingCost: e.target.value })}
                        className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED] mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="deliveryTime" className="text-[#E8EAED]">
                        Delivery Time (Days)
                      </Label>
                      <Input
                        id="deliveryTime"
                        type="number"
                        placeholder="Est. delivery days"
                        value={formData.deliveryTime}
                        onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                        className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED] mt-2"
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Vehicle/Part Specific Details */}
          {formData.category === 'vehicles' ? (
            <Card className="bg-[#0F1829] border-[#1A2332]">
              <CardHeader>
                <CardTitle className="text-[#E8EAED]">Vehicle Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Make and Model */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="make" className="text-[#E8EAED]">
                      Make <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.make} onValueChange={(val) => setFormData({ ...formData, make: val, model: '' })}>
                      <SelectTrigger className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED] mt-2">
                        <SelectValue placeholder="Select make" />
                      </SelectTrigger>
                      <SelectContent>
                        {chineseCarBrands.map(brand => (
                          <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="model" className="text-[#E8EAED]">
                      Model <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.model} onValueChange={(val) => setFormData({ ...formData, model: val })} disabled={!formData.make}>
                      <SelectTrigger className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED] mt-2">
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableModels.map(model => (
                          <SelectItem key={model.id} value={model.name}>{model.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Year and Mileage */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="year" className="text-[#E8EAED]">
                      Year <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="year"
                      type="number"
                      placeholder="2024"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED] mt-2"
                      min="1900"
                      max="2025"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mileage" className="text-[#E8EAED]">
                      Mileage (km)
                    </Label>
                    <Input
                      id="mileage"
                      type="number"
                      placeholder="50000"
                      value={formData.mileage}
                      onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                      className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED] mt-2"
                    />
                  </div>
                </div>

                {/* More specs... */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="color" className="text-[#E8EAED]">Color</Label>
                    <Input
                      id="color"
                      placeholder="e.g. White"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED] mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="transmission" className="text-[#E8EAED]">Transmission</Label>
                    <Select value={formData.transmission} onValueChange={(val) => setFormData({ ...formData, transmission: val })}>
                      <SelectTrigger className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED] mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="automatic">Automatic</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="fuelType" className="text-[#E8EAED]">Fuel Type</Label>
                    <Select value={formData.fuelType} onValueChange={(val) => setFormData({ ...formData, fuelType: val })}>
                      <SelectTrigger className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED] mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gasoline">Gasoline</SelectItem>
                        <SelectItem value="diesel">Diesel</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                        <SelectItem value="electric">Electric</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <Label className="text-[#E8EAED] mb-3 block">Features</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {carFeatures.map(feature => (
                      <button
                        key={feature}
                        type="button"
                        onClick={() => toggleFeature(feature)}
                        className={`p-2 text-sm rounded-lg border transition-all ${
                          formData.features.includes(feature)
                            ? 'bg-[#D4AF37] border-[#D4AF37] text-[#0B1426]'
                            : 'bg-[#1A2332] border-[#1A2332] text-[#E8EAED] hover:border-[#D4AF37]/50'
                        }`}
                      >
                        {feature}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-[#0F1829] border-[#1A2332]">
              <CardHeader>
                <CardTitle className="text-[#E8EAED]">Part Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="partType" className="text-[#E8EAED]">
                    Part Type <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.partType} onValueChange={(val) => setFormData({ ...formData, partType: val })}>
                    <SelectTrigger className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED] mt-2">
                      <SelectValue placeholder="Select part type" />
                    </SelectTrigger>
                    <SelectContent>
                      {partTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Photos */}
          <Card className="bg-[#0F1829] border-[#1A2332]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#D4AF37]" />
                <CardTitle className="text-[#E8EAED]">Photos (0/10)</CardTitle>
              </div>
              <CardDescription className="text-[#8B92A7]">
                Drag and drop photos here, or click to select files
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Image Upload */}
              <div className="border-2 border-dashed border-[#1A2332] rounded-lg p-8 text-center hover:border-[#D4AF37] transition-colors">
                <input
                  type="file"
                  id="image-upload"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-[#8B92A7] mx-auto mb-4" />
                  <p className="text-[#E8EAED] mb-2">Click to upload or drag and drop</p>
                  <p className="text-sm text-[#8B92A7]">Maximum 10 images • JPG, PNG, WEBP</p>
                </label>
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
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {index === 0 && (
                        <Badge className="absolute bottom-2 left-2 bg-[#D4AF37] text-[#0B1426]">
                          Cover
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-[#0F1829] border-[#1A2332]">
            <CardHeader>
              <CardTitle className="text-[#E8EAED]">Contact Information</CardTitle>
              <CardDescription className="text-[#8B92A7]">
                How should buyers reach you?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Preferred Contact Method */}
              <div>
                <Label className="text-[#E8EAED] mb-3 block">Preferred Contact Method</Label>
                <Select value={formData.contactMethod} onValueChange={(val) => setFormData({ ...formData, contactMethod: val })}>
                  <SelectTrigger className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Phone and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED] mt-2"
                  />
                </div>
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
                    className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED] mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onNavigate?.('marketplace')}
              className="flex-1 border-[#1A2332] text-[#E8EAED] hover:bg-[#1A2332]"
              disabled={submitting}
            >
              Save as Draft
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#D4AF37] text-[#0B1426] hover:bg-[#C4A037]"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Continue to Payment
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
