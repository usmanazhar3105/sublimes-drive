/**
 * PlaceYourAdPage - Complete with All Tabs
 * 
 * Tabs:
 * 1. Create Ad - Form to create listing
 * 2. Preview - View/manage listings (All, Drafts, Under Review, Active, Expired)
 * 3. Pricing & Boost - Listing fees and boost options (7, 14, 30 days)
 */

import { useState, useEffect } from 'react';
import { Plus, Upload, X, Car, Wrench, Loader2, CheckCircle, Image as ImageIcon, Eye, Clock, Zap, Crown, TrendingUp, Edit, Trash2, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { useListings, useAnalytics, useImageUpload, useRole } from '../hooks';
import { chineseCarBrands } from '../utils/chineseCarData';
import { supabase } from '../utils/supabase/client';

interface PlaceYourAdPageProps {
  onNavigate?: (page: string) => void;
}

export function PlaceYourAdPage({ onNavigate }: PlaceYourAdPageProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'preview' | 'pricing'>('create');
  const [previewFilter, setPreviewFilter] = useState<'all' | 'drafts' | 'under_review' | 'active' | 'expired'>('all');
  const [submitting, setSubmitting] = useState(false);
  const [selectedBoostListing, setSelectedBoostListing] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    // Category Selection
    category: 'cars', // 'cars' or 'parts'
    
    // Basic Information
    title: '',
    description: '',
    price: '',
    location: '',
    condition: 'excellent',
    priceNegotiable: true,
    
    // Vehicle Details (for cars)
    listingType: 'car',
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
    partType: '',
    partCondition: 'new',
    compatibleBrands: [] as string[],
    
    // Contact Information
    contactPhone: '',
    contactEmail: '',
    
    // Additional Options
    warrantyAvailable: false,
    warrantyMonths: '',
    features: [] as string[],
    
    // Origin Country (for overseas listings)
    originCountry: 'UAE',
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [marketplaceSettings, setMarketplaceSettings] = useState<any>(null);

  // Hooks
  const { listings, loading, createListing, updateListing, deleteListing, refetch } = useListings();
  const { profile } = useRole();
  const analytics = useAnalytics();
  const { uploadImages } = useImageUpload();

  // Track page view
  useEffect(() => {
    analytics.trackPageView('/place-your-ad');
  }, []);

  // Fetch marketplace settings
  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data, error } = await supabase
          .from('marketplace_settings')
          .select('*')
          .single();
        
        if (!error && data) {
          setMarketplaceSettings(data);
        }
      } catch (err) {
        console.error('Error fetching marketplace settings:', err);
      }
    }
    fetchSettings();
  }, []);

  // Filter my listings by status
  const myListings = listings.filter(l => l.seller_id === profile?.id || l.user_id === profile?.id);
  
  const filteredMyListings = myListings.filter(listing => {
    switch (previewFilter) {
      case 'all':
        return true;
      case 'drafts':
        return listing.status === 'draft';
      case 'under_review':
        return listing.status === 'pending' || listing.status === 'under_review';
      case 'active':
        return listing.status === 'active' || listing.status === 'approved';
      case 'expired':
        return listing.status === 'expired' || listing.status === 'rejected';
      default:
        return true;
    }
  });

  // UAE Emirates
  const uaeLocations = [
    'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 
    'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'
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

  // Car features
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

  const handleSubmit = async () => {
    // Validation
    if (!formData.title || !formData.description || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.category === 'cars' && (!formData.make || !formData.model || !formData.year)) {
      toast.error('Please fill in vehicle details');
      return;
    }

    setSubmitting(true);

    try {
      // Upload images first
      let imageUrls: string[] = [];
      if (imageFiles.length > 0) {
        const uploadResult = await uploadImages(imageFiles, 'marketplace-listings');
        if (uploadResult.error) {
          throw new Error('Failed to upload images');
        }
        imageUrls = uploadResult.urls || [];
      }

      // Determine listing type
      let listingType = 'car';
      if (formData.category === 'parts') {
        listingType = formData.partType?.toLowerCase().includes('accessory') ? 'accessory' : 'part';
      }

      // Create listing
      const { error } = await createListing({
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        location: formData.location,
        condition: formData.condition,
        price_negotiable: formData.priceNegotiable,
        listing_type: listingType,
        
        // Vehicle fields (only for cars)
        make: formData.category === 'cars' ? formData.make : null,
        model: formData.category === 'cars' ? formData.model : null,
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
        
        // Parts fields
        part_type: formData.category === 'parts' ? formData.partType : null,
        compatible_brands: formData.compatibleBrands,
        
        // Contact info
        contact_phone: formData.contactPhone,
        contact_email: formData.contactEmail,
        
        // Warranty
        warranty_available: formData.warrantyAvailable,
        warranty_months: formData.warrantyMonths ? parseInt(formData.warrantyMonths) : null,
        
        // Images and features
        images: imageUrls,
        features: formData.features,
        
        // Origin country
        origin_country: formData.originCountry,
        
        // Status
        status: 'pending',
      });

      if (error) throw error;

      analytics.trackEvent('ad_submitted_successfully', { 
        category: formData.category,
        listing_type: listingType
      });
      
      toast.success('Your listing has been submitted!', {
        description: 'It will be reviewed shortly.',
      });
      
      // Switch to preview tab
      setActiveTab('preview');
      refetch();

    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error('Failed to submit listing', {
        description: error.message || 'Please try again',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    try {
      await deleteListing(id);
      toast.success('Listing deleted');
      refetch();
    } catch (error: any) {
      toast.error('Failed to delete listing');
    }
  };

  // Stats for my listings
  const stats = {
    all: myListings.length,
    drafts: myListings.filter(l => l.status === 'draft').length,
    under_review: myListings.filter(l => l.status === 'pending' || l.status === 'under_review').length,
    active: myListings.filter(l => l.status === 'active' || l.status === 'approved').length,
    expired: myListings.filter(l => l.status === 'expired' || l.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-[#0B1426] pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-[#0F1829] border-b border-[#1A2332] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 md:py-6">
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl text-[#E8EAED] mb-2">Place Your Ad</h1>
            <p className="text-sm text-[#8B92A7]">Reach thousands of car enthusiasts in the UAE</p>
          </div>
          <div className="flex items-center justify-center gap-2 mt-4 text-sm">
            <span className="text-[#8B92A7]">👁️ 4,701 daily views</span>
            <span className="text-[#8B92A7]">•</span>
            <span className="text-[#8B92A7]">🎯 441+ potential buyers</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="w-full">
          {/* Tab Navigation */}
          <TabsList className="grid w-full grid-cols-3 bg-[#0F1829] border border-[#1A2332] p-1 mb-6">
            <TabsTrigger 
              value="create" 
              className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426] text-[#8B92A7]"
            >
              <Plus className="mr-2" size={16} />
              Create Ad
            </TabsTrigger>
            <TabsTrigger 
              value="preview" 
              className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426] text-[#8B92A7]"
            >
              <Eye className="mr-2" size={16} />
              Preview
            </TabsTrigger>
            <TabsTrigger 
              value="pricing" 
              className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426] text-[#8B92A7]"
            >
              <Zap className="mr-2" size={16} />
              Pricing & Boost
            </TabsTrigger>
          </TabsList>

          {/* CREATE AD TAB */}
          <TabsContent value="create" className="space-y-6">
            {/* Category Selection */}
            <Card className="bg-[#0F1829] border-[#1A2332]">
              <CardHeader>
                <CardTitle className="text-[#E8EAED]">Select Category</CardTitle>
                <CardDescription className="text-[#8B92A7]">
                  Choose what you want to sell
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Cars */}
                    <label className={`relative cursor-pointer rounded-lg border-2 p-6 ${
                      formData.category === 'cars' 
                        ? 'border-[#D4AF37] bg-[#D4AF37]/10' 
                        : 'border-[#1A2332] hover:border-[#D4AF37]/50'
                    }`}>
                      <div className="flex items-start gap-4">
                        <RadioGroupItem value="cars" className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Car className="text-[#D4AF37]" size={24} />
                            <span className="text-[#E8EAED]">Cars</span>
                          </div>
                          <p className="text-sm text-[#8B92A7]">
                            Sell your BYD, Hongqi, MG or other Chinese vehicles
                          </p>
                        </div>
                      </div>
                    </label>

                    {/* Parts & Accessories */}
                    <label className={`relative cursor-pointer rounded-lg border-2 p-6 ${
                      formData.category === 'parts' 
                        ? 'border-[#D4AF37] bg-[#D4AF37]/10' 
                        : 'border-[#1A2332] hover:border-[#D4AF37]/50'
                    }`}>
                      <div className="flex items-start gap-4">
                        <RadioGroupItem value="parts" className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Wrench className="text-[#D4AF37]" size={24} />
                            <span className="text-[#E8EAED]">Car Parts & Accessories</span>
                          </div>
                          <p className="text-sm text-[#8B92A7]">
                            List spare parts, accessories, or modifications
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card className="bg-[#0F1829] border-[#1A2332]">
              <CardHeader>
                <CardTitle className="text-[#E8EAED]">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-[#E8EAED]">Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder={formData.category === 'cars' ? 'e.g., 2023 BYD Seal - Premium Package' : 'e.g., Original MG HS Brake Pads'}
                    className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                  />
                </div>

                <div>
                  <Label className="text-[#E8EAED]">Description *</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide detailed information about your listing..."
                    className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED] min-h-[120px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#E8EAED]">Price (AED) *</Label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0"
                      className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                    />
                  </div>

                  <div>
                    <Label className="text-[#E8EAED]">Location *</Label>
                    <Select value={formData.location} onValueChange={(value) => setFormData({ ...formData, location: value })}>
                      <SelectTrigger className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0F1829] border-[#1A2332]">
                        {uaeLocations.map(loc => (
                          <SelectItem key={loc} value={loc} className="text-[#E8EAED]">{loc}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-[#E8EAED]">Condition</Label>
                  <Select value={formData.condition} onValueChange={(value) => setFormData({ ...formData, condition: value })}>
                    <SelectTrigger className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0F1829] border-[#1A2332]">
                      {conditions.map(cond => (
                        <SelectItem key={cond.value} value={cond.value} className="text-[#E8EAED]">
                          {cond.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="negotiable"
                    checked={formData.priceNegotiable}
                    onCheckedChange={(checked) => setFormData({ ...formData, priceNegotiable: checked as boolean })}
                    className="border-[#1A2332] data-[state=checked]:bg-[#D4AF37]"
                  />
                  <Label htmlFor="negotiable" className="text-[#E8EAED]">Price is negotiable</Label>
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Details (Cars Only) */}
            {formData.category === 'cars' && (
              <Card className="bg-[#0F1829] border-[#1A2332]">
                <CardHeader>
                  <CardTitle className="text-[#E8EAED]">Vehicle Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-[#E8EAED]">Make *</Label>
                      <Select value={formData.make} onValueChange={(value) => setFormData({ ...formData, make: value, model: '' })}>
                        <SelectTrigger className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]">
                          <SelectValue placeholder="Select make" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0F1829] border-[#1A2332] max-h-[300px]">
                          {chineseCarBrands.map(brand => (
                            <SelectItem key={brand.id} value={brand.id} className="text-[#E8EAED]">
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-[#E8EAED]">Model *</Label>
                      <Select 
                        value={formData.model} 
                        onValueChange={(value) => setFormData({ ...formData, model: value })}
                        disabled={!formData.make}
                      >
                        <SelectTrigger className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]">
                          <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0F1829] border-[#1A2332]">
                          {availableModels.map(model => (
                            <SelectItem key={model} value={model} className="text-[#E8EAED]">
                              {model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-[#E8EAED]">Year *</Label>
                      <Input
                        type="number"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                        placeholder="2024"
                        className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[#E8EAED]">Mileage (km)</Label>
                      <Input
                        type="number"
                        value={formData.mileage}
                        onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                        placeholder="50000"
                        className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                      />
                    </div>

                    <div>
                      <Label className="text-[#E8EAED]">Color</Label>
                      <Input
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        placeholder="e.g., White, Black, Red"
                        className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Parts Details (Parts Only) */}
            {formData.category === 'parts' && (
              <Card className="bg-[#0F1829] border-[#1A2332]">
                <CardHeader>
                  <CardTitle className="text-[#E8EAED]">Part Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-[#E8EAED]">Part Type *</Label>
                    <Select value={formData.partType} onValueChange={(value) => setFormData({ ...formData, partType: value })}>
                      <SelectTrigger className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]">
                        <SelectValue placeholder="Select part type" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0F1829] border-[#1A2332]">
                        {partTypes.map(type => (
                          <SelectItem key={type} value={type} className="text-[#E8EAED]">{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Images Upload */}
            <Card className="bg-[#0F1829] border-[#1A2332]">
              <CardHeader>
                <CardTitle className="text-[#E8EAED]">Images</CardTitle>
                <CardDescription className="text-[#8B92A7]">
                  Upload up to 10 images
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-[#0B1426] border border-[#1A2332]">
                        <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}

                    {imagePreviews.length < 10 && (
                      <label className="aspect-square rounded-lg border-2 border-dashed border-[#1A2332] hover:border-[#D4AF37] cursor-pointer flex flex-col items-center justify-center gap-2 bg-[#0B1426]">
                        <Upload className="text-[#8B92A7]" size={32} />
                        <span className="text-sm text-[#8B92A7]">Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="bg-[#0F1829] border-[#1A2332]">
              <CardHeader>
                <CardTitle className="text-[#E8EAED]">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#E8EAED]">Phone Number *</Label>
                    <Input
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      placeholder="+971 XX XXX XXXX"
                      className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                    />
                  </div>

                  <div>
                    <Label className="text-[#E8EAED]">Email</Label>
                    <Input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      placeholder="your@email.com"
                      className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Overseas Listing Options */}
            <Card className="bg-[#0F1829] border-[#1A2332]">
              <CardHeader>
                <CardTitle className="text-[#E8EAED] flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Overseas Listing Options
                </CardTitle>
                <CardDescription className="text-[#8B92A7]">
                  Select the origin location of your vehicle
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label className="text-[#E8EAED] mb-3 block">Origin</Label>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant={formData.originCountry === 'UAE' ? 'default' : 'outline'}
                      onClick={() => setFormData({ ...formData, originCountry: 'UAE' })}
                      className={formData.originCountry === 'UAE'
                        ? 'bg-[#D4AF37] text-[#0B1426] hover:bg-[#C19B2E] border-[#D4AF37] h-16 flex-1'
                        : 'border-[#1A2332] text-[#E8EAED] hover:bg-[#1A2332] h-16 flex-1'
                      }
                    >
                      <span className="text-3xl mr-2">🇦🇪</span>
                      <span className="text-base">UAE</span>
                    </Button>
                    <Select 
                      value={formData.originCountry !== 'UAE' ? formData.originCountry : ''}
                      onValueChange={(value) => setFormData({ ...formData, originCountry: value })}
                    >
                      <SelectTrigger className={`${formData.originCountry !== 'UAE' ? 'bg-[#D4AF37] text-[#0B1426] border-[#D4AF37]' : 'bg-[#0B1426] border-[#1A2332] text-[#E8EAED]'} h-16 flex-1`}>
                        <SelectValue placeholder="🌍 Other Countries" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0F1829] border-[#1A2332]">
                        <SelectItem value="China" className="text-[#E8EAED]">🇨🇳 China</SelectItem>
                        <SelectItem value="Oman" className="text-[#E8EAED]">🇴🇲 Oman</SelectItem>
                        <SelectItem value="Saudi Arabia" className="text-[#E8EAED]">🇸🇦 Saudi Arabia</SelectItem>
                        <SelectItem value="Bahrain" className="text-[#E8EAED]">🇧🇭 Bahrain</SelectItem>
                        <SelectItem value="Qatar" className="text-[#E8EAED]">🇶🇦 Qatar</SelectItem>
                        <SelectItem value="Kuwait" className="text-[#E8EAED]">🇰🇼 Kuwait</SelectItem>
                        <SelectItem value="USA" className="text-[#E8EAED]">🇺🇸 USA</SelectItem>
                        <SelectItem value="Korea" className="text-[#E8EAED]">🇰🇷 Korea</SelectItem>
                        <SelectItem value="Canada" className="text-[#E8EAED]">🇨🇦 Canada</SelectItem>
                        <SelectItem value="Europe" className="text-[#E8EAED]">🇪🇺 Europe</SelectItem>
                        <SelectItem value="Africa" className="text-[#E8EAED]">🌍 Africa</SelectItem>
                        <SelectItem value="Other" className="text-[#E8EAED]">🌐 Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                onClick={() => onNavigate?.('marketplace')}
                variant="outline"
                className="flex-1 border-[#1A2332] text-[#E8EAED] hover:bg-[#1A2332]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-[#D4AF37] hover:bg-[#C19B2E] text-[#0B1426]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" size={16} />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2" size={16} />
                    Submit for Review
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* PREVIEW TAB */}
          <TabsContent value="preview" className="space-y-6">
            {/* My Listings Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card 
                className={`bg-[#0F1829] border-[#1A2332] cursor-pointer ${previewFilter === 'all' ? 'ring-2 ring-[#D4AF37]' : ''}`}
                onClick={() => setPreviewFilter('all')}
              >
                <CardContent className="p-4 text-center">
                  <div className="text-2xl text-[#E8EAED] mb-1">{stats.all}</div>
                  <div className="text-sm text-[#8B92A7]">All</div>
                </CardContent>
              </Card>

              <Card 
                className={`bg-[#0F1829] border-[#1A2332] cursor-pointer ${previewFilter === 'drafts' ? 'ring-2 ring-[#D4AF37]' : ''}`}
                onClick={() => setPreviewFilter('drafts')}
              >
                <CardContent className="p-4 text-center">
                  <div className="text-2xl text-[#E8EAED] mb-1">{stats.drafts}</div>
                  <div className="text-sm text-[#8B92A7]">Drafts</div>
                </CardContent>
              </Card>

              <Card 
                className={`bg-[#0F1829] border-[#1A2332] cursor-pointer ${previewFilter === 'under_review' ? 'ring-2 ring-[#D4AF37]' : ''}`}
                onClick={() => setPreviewFilter('under_review')}
              >
                <CardContent className="p-4 text-center">
                  <div className="text-2xl text-[#E8EAED] mb-1">{stats.under_review}</div>
                  <div className="text-sm text-[#8B92A7]">Under Review</div>
                </CardContent>
              </Card>

              <Card 
                className={`bg-[#0F1829] border-[#1A2332] cursor-pointer ${previewFilter === 'active' ? 'ring-2 ring-[#D4AF37]' : ''}`}
                onClick={() => setPreviewFilter('active')}
              >
                <CardContent className="p-4 text-center">
                  <div className="text-2xl text-[#E8EAED] mb-1">{stats.active}</div>
                  <div className="text-sm text-[#8B92A7]">Active</div>
                </CardContent>
              </Card>

              <Card 
                className={`bg-[#0F1829] border-[#1A2332] cursor-pointer ${previewFilter === 'expired' ? 'ring-2 ring-[#D4AF37]' : ''}`}
                onClick={() => setPreviewFilter('expired')}
              >
                <CardContent className="p-4 text-center">
                  <div className="text-2xl text-[#E8EAED] mb-1">{stats.expired}</div>
                  <div className="text-sm text-[#8B92A7]">Expired</div>
                </CardContent>
              </Card>
            </div>

            {/* Listings */}
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="animate-spin text-[#D4AF37]" size={40} />
                </div>
              ) : filteredMyListings.length === 0 ? (
                <Card className="bg-[#0F1829] border-[#1A2332] p-8 text-center">
                  <p className="text-[#8B92A7] mb-4">No listings found</p>
                  <Button
                    onClick={() => setActiveTab('create')}
                    className="bg-[#D4AF37] hover:bg-[#C19B2E] text-[#0B1426]"
                  >
                    <Plus className="mr-2" size={16} />
                    Create First Listing
                  </Button>
                </Card>
              ) : (
                filteredMyListings.map(listing => (
                  <Card key={listing.id} className="bg-[#0F1829] border-[#1A2332]">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Image */}
                        <div className="w-full md:w-48 aspect-video md:aspect-square rounded-lg overflow-hidden bg-[#0B1426]">
                          {listing.images?.[0] ? (
                            <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="text-[#8B92A7]" size={40} />
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg text-[#E8EAED] mb-1">{listing.title}</h3>
                              <p className="text-xl text-[#D4AF37]">
                                AED {listing.price?.toLocaleString()}
                              </p>
                            </div>
                            <Badge className={
                              listing.status === 'active' || listing.status === 'approved'
                                ? 'bg-green-500/20 text-green-500'
                                : listing.status === 'pending' || listing.status === 'under_review'
                                ? 'bg-yellow-500/20 text-yellow-500'
                                : listing.status === 'draft'
                                ? 'bg-gray-500/20 text-gray-500'
                                : 'bg-red-500/20 text-red-500'
                            }>
                              {listing.status}
                            </Badge>
                          </div>

                          <p className="text-sm text-[#8B92A7] mb-4 line-clamp-2">
                            {listing.description}
                          </p>

                          {/* Stats */}
                          <div className="flex items-center gap-4 text-sm text-[#8B92A7] mb-4">
                            <span>👁️ {listing.views || 0} views</span>
                            <span>📞 {listing.clicks || 0} clicks</span>
                            <span>💬 {listing.enquiries || 0} enquiries</span>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-[#1A2332] text-[#E8EAED] hover:bg-[#1A2332]"
                            >
                              <Edit size={16} className="mr-2" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => setSelectedBoostListing(listing)}
                              className="bg-[#D4AF37] hover:bg-[#C19B2E] text-[#0B1426]"
                            >
                              <Zap size={16} className="mr-2" />
                              Boost
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                              onClick={() => handleDeleteListing(listing.id)}
                            >
                              <Trash2 size={16} className="mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* PRICING & BOOST TAB */}
          <TabsContent value="pricing" className="space-y-6">
            {/* Listing Fee */}
            <Card className="bg-[#0F1829] border-[#1A2332]">
              <CardHeader>
                <CardTitle className="text-[#E8EAED]">Listing Fee</CardTitle>
                <CardDescription className="text-[#8B92A7]">
                  Standard listing options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-[#1A2332] rounded-lg">
                    <div>
                      <h4 className="text-[#E8EAED] mb-1">Basic Listing</h4>
                      <p className="text-sm text-[#8B92A7]">Post your ad for 30 days</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl text-[#D4AF37]">
                        {marketplaceSettings?.listing_fee_enabled 
                          ? `AED ${marketplaceSettings?.base_listing_fee || 0}`
                          : 'FREE'
                        }
                      </div>
                      <p className="text-xs text-[#8B92A7]">
                        {marketplaceSettings?.listing_fee_enabled ? 'One-time fee' : 'No charges'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Boost Plans */}
            <Card className="bg-[#0F1829] border-[#1A2332]">
              <CardHeader>
                <CardTitle className="text-[#E8EAED] flex items-center gap-2">
                  <Crown className="text-[#D4AF37]" size={24} />
                  Boost Your Listing (Featured)
                </CardTitle>
                <CardDescription className="text-[#8B92A7]">
                  Get up to 10x more views with featured placement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 7 Days */}
                  <div className="relative border-2 border-[#1A2332] hover:border-[#D4AF37] rounded-lg p-6 cursor-pointer transition-all">
                    <div className="text-center mb-4">
                      <div className="text-4xl mb-2">⚡</div>
                      <h4 className="text-lg text-[#E8EAED] mb-1">7 Days</h4>
                      <p className="text-sm text-[#8B92A7]">Quick Boost</p>
                    </div>
                    <div className="text-center mb-4">
                      <div className="text-3xl text-[#D4AF37] mb-1">
                        AED {marketplaceSettings?.boost_7_days_price || 99}
                      </div>
                      <p className="text-xs text-[#8B92A7]">One-time payment</p>
                    </div>
                    <ul className="space-y-2 mb-6 text-sm text-[#8B92A7]">
                      <li className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-[#D4AF37]" />
                        Featured badge
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-[#D4AF37]" />
                        Top placement
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-[#D4AF37]" />
                        Priority support
                      </li>
                    </ul>
                    <Button className="w-full bg-[#D4AF37] hover:bg-[#C19B2E] text-[#0B1426]">
                      Choose Plan
                    </Button>
                  </div>

                  {/* 14 Days */}
                  <div className="relative border-2 border-[#D4AF37] bg-[#D4AF37]/5 rounded-lg p-6 cursor-pointer">
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#D4AF37] text-[#0B1426]">
                      POPULAR
                    </Badge>
                    <div className="text-center mb-4">
                      <div className="text-4xl mb-2">🚀</div>
                      <h4 className="text-lg text-[#E8EAED] mb-1">14 Days</h4>
                      <p className="text-sm text-[#8B92A7]">Best Value</p>
                    </div>
                    <div className="text-center mb-4">
                      <div className="text-3xl text-[#D4AF37] mb-1">
                        AED {marketplaceSettings?.boost_14_days_price || 179}
                      </div>
                      <p className="text-xs text-[#8B92A7]">Save 10%</p>
                    </div>
                    <ul className="space-y-2 mb-6 text-sm text-[#8B92A7]">
                      <li className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-[#D4AF37]" />
                        Featured badge
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-[#D4AF37]" />
                        Top placement
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-[#D4AF37]" />
                        Priority support
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-[#D4AF37]" />
                        Analytics dashboard
                      </li>
                    </ul>
                    <Button className="w-full bg-[#D4AF37] hover:bg-[#C19B2E] text-[#0B1426]">
                      Choose Plan
                    </Button>
                  </div>

                  {/* 30 Days */}
                  <div className="relative border-2 border-[#1A2332] hover:border-[#D4AF37] rounded-lg p-6 cursor-pointer transition-all">
                    <div className="text-center mb-4">
                      <div className="text-4xl mb-2">👑</div>
                      <h4 className="text-lg text-[#E8EAED] mb-1">30 Days</h4>
                      <p className="text-sm text-[#8B92A7]">Premium</p>
                    </div>
                    <div className="text-center mb-4">
                      <div className="text-3xl text-[#D4AF37] mb-1">
                        AED {marketplaceSettings?.boost_30_days_price || 299}
                      </div>
                      <p className="text-xs text-[#8B92A7]">Save 20%</p>
                    </div>
                    <ul className="space-y-2 mb-6 text-sm text-[#8B92A7]">
                      <li className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-[#D4AF37]" />
                        Featured badge
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-[#D4AF37]" />
                        Top placement
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-[#D4AF37]" />
                        Priority support
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-[#D4AF37]" />
                        Analytics dashboard
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-[#D4AF37]" />
                        Social media promo
                      </li>
                    </ul>
                    <Button className="w-full bg-[#D4AF37] hover:bg-[#C19B2E] text-[#0B1426]">
                      Choose Plan
                    </Button>
                  </div>
                </div>

                {/* Benefits */}
                <div className="mt-6 p-4 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg">
                  <h4 className="text-[#E8EAED] mb-3 flex items-center gap-2">
                    <TrendingUp className="text-[#D4AF37]" size={20} />
                    Featured Benefits
                  </h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-[#8B92A7]">
                    <li className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-[#D4AF37]" />
                      10x more visibility
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-[#D4AF37]" />
                      Highlighted in search results
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-[#D4AF37]" />
                      Featured carousel placement
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-[#D4AF37]" />
                      Email notifications to buyers
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
