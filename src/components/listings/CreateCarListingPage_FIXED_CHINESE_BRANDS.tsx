/**
 * CreateCarListingPage - FIXED with ONLY Chinese Car Brands
 * + Overseas Shipping Options
 * + All features working
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Upload, X, CheckCircle, Loader2, ArrowLeft, Ship, Package, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { CAR_BRANDS } from '../../utils/carData'; // Chinese brands only

interface CreateCarListingPageProps {
  onNavigate?: (page: string) => void;
}

export function CreateCarListingPage({ onNavigate }: CreateCarListingPageProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    // Basic Details
    make: '',
    model: '',
    year: '',
    price: '',
    condition: 'excellent',
    mileage: '',
    location: '',
    
    // Overseas Options
    origin: 'uae', // 'uae' or 'overseas'
    originCountry: '',
    shippingAvailable: false,
    shippingCost: '',
    estimatedDeliveryDays: '',
    logisticsHandling: 'vendor', // 'vendor' or 'buyer'
    
    // Details
    color: '',
    bodyType: '',
    transmission: 'automatic',
    fuelType: 'gasoline',
    doors: '4',
    engineCapacity: '',
    horsepower: '',
    
    // Description
    title: '',
    description: '',
    features: [] as string[],
    
    // Images
    images: [] as File[],
    imagePreviews: [] as string[],
    
    // Contact
    contactPhone: '',
    contactEmail: '',
    priceNegotiable: true,
    warrantyAvailable: false,
    warrantyMonths: '',
  });

  // UAE Emirates
  const uaeLocations = [
    'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 
    'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'
  ];

  // Origin countries for overseas listings
  const originCountries = [
    'China', 'Japan', 'Germany', 'USA', 'UK', 
    'South Korea', 'Italy', 'France', 'Other'
  ];

  const carColors = [
    'White', 'Black', 'Silver', 'Gray', 'Blue', 'Red', 
    'Green', 'Brown', 'Gold', 'Orange', 'Yellow', 'Other'
  ];

  const bodyTypes = [
    'Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 
    'Wagon', 'Pickup', 'Van', 'Minivan'
  ];

  const conditions = [
    { value: 'new', label: 'Brand New' },
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'needs_work', label: 'Needs Work' },
  ];

  const popularFeatures = [
    'Sunroof', 'Leather Seats', 'Navigation', 'Backup Camera',
    'Parking Sensors', 'Cruise Control', 'Bluetooth', 'USB Port',
    'Heated Seats', 'Keyless Entry', 'Push Start', 'Alloy Wheels',
    'LED Headlights', 'Adaptive Cruise Control', 'Lane Assist', '360 Camera'
  ];

  // Get models for selected brand
  const selectedBrand = CAR_BRANDS.find(b => b.id === formData.make);
  const availableModels = selectedBrand?.models || [];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + formData.images.length > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          imagePreviews: [...prev.imagePreviews, reader.result as string]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imagePreviews: prev.imagePreviews.filter((_, i) => i !== index)
    }));
  };

  const toggleFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.make || !formData.model || !formData.year || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Listing submitted successfully!', {
        description: 'Your listing will be reviewed shortly.',
      });
      
      setTimeout(() => {
        onNavigate?.('marketplace');
      }, 1500);
    } catch (error) {
      toast.error('Failed to submit listing');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1426] pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-[#0F1829] border-b border-[#1A2332] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={() => onNavigate?.('marketplace')}
              variant="ghost"
              size="sm"
              className="text-[#8B92A7] hover:text-[#E8EAED]"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back
            </Button>
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl text-[#E8EAED] mb-2">List Your Car</h1>
            <p className="text-sm text-[#8B92A7]">Sell your Chinese car to thousands of buyers in the UAE</p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 1 ? 'bg-[#D4AF37] text-[#0B1426]' : 'bg-[#1A2332] text-[#8B92A7]'
              }`}>
                1
              </div>
              <span className="ml-2 text-sm text-[#E8EAED]">Basic Info</span>
            </div>
            <div className="w-12 h-px bg-[#1A2332]" />
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 2 ? 'bg-[#D4AF37] text-[#0B1426]' : 'bg-[#1A2332] text-[#8B92A7]'
              }`}>
                2
              </div>
              <span className="ml-2 text-sm text-[#E8EAED]">Details</span>
            </div>
            <div className="w-12 h-px bg-[#1A2332]" />
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 3 ? 'bg-[#D4AF37] text-[#0B1426]' : 'bg-[#1A2332] text-[#8B92A7]'
              }`}>
                3
              </div>
              <span className="ml-2 text-sm text-[#E8EAED]">Images</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* STEP 1: Basic Information */}
        {currentStep === 1 && (
          <>
            <Card className="bg-[#0F1829] border-[#1A2332]">
              <CardHeader>
                <CardTitle className="text-[#E8EAED]">Basic Information</CardTitle>
                <CardDescription className="text-[#8B92A7]">
                  Tell us about your car (Chinese brands only)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Make - CHINESE BRANDS ONLY */}
                  <div>
                    <Label className="text-[#E8EAED]">Make *</Label>
                    <Select value={formData.make} onValueChange={(value) => setFormData({ ...formData, make: value, model: '' })}>
                      <SelectTrigger className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]">
                        <SelectValue placeholder="Select Make" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0F1829] border-[#1A2332] max-h-[300px]">
                        {CAR_BRANDS.map(brand => (
                          <SelectItem key={brand.id} value={brand.id} className="text-[#E8EAED]">
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Model */}
                  <div>
                    <Label className="text-[#E8EAED]">Model *</Label>
                    <Select 
                      value={formData.model} 
                      onValueChange={(value) => setFormData({ ...formData, model: value })}
                      disabled={!formData.make}
                    >
                      <SelectTrigger className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]">
                        <SelectValue placeholder="Select Model" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0F1829] border-[#1A2332]">
                        {availableModels.map(model => (
                          <SelectItem key={model.id} value={model.id} className="text-[#E8EAED]">
                            {model.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Year */}
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

                  {/* Price */}
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

                  {/* Mileage */}
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Condition */}
                  <div>
                    <Label className="text-[#E8EAED]">Condition *</Label>
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

                  {/* Location */}
                  <div>
                    <Label className="text-[#E8EAED]">Location *</Label>
                    <Select value={formData.location} onValueChange={(value) => setFormData({ ...formData, location: value })}>
                      <SelectTrigger className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]">
                        <SelectValue placeholder="Select Emirate" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0F1829] border-[#1A2332]">
                        {uaeLocations.map(loc => (
                          <SelectItem key={loc} value={loc} className="text-[#E8EAED]">{loc}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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

            {/* Overseas Shipping Options */}
            <Card className="bg-[#0F1829] border-[#1A2332]">
              <CardHeader>
                <CardTitle className="text-[#E8EAED] flex items-center gap-2">
                  <Ship className="text-[#D4AF37]" size={24} />
                  Overseas Listing Options
                </CardTitle>
                <CardDescription className="text-[#8B92A7]">
                  Is this car currently overseas or available for shipping?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Origin Selection */}
                <div>
                  <Label className="text-[#E8EAED] mb-2 block">Car Location</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className={`cursor-pointer rounded-lg border-2 p-4 ${
                      formData.origin === 'uae' 
                        ? 'border-[#D4AF37] bg-[#D4AF37]/10' 
                        : 'border-[#1A2332] hover:border-[#D4AF37]/50'
                    }`}>
                      <input
                        type="radio"
                        name="origin"
                        value="uae"
                        checked={formData.origin === 'uae'}
                        onChange={(e) => setFormData({ ...formData, origin: e.target.value as 'uae' | 'overseas' })}
                        className="hidden"
                      />
                      <div className="flex items-center gap-3">
                        <Globe className="text-[#D4AF37]" size={24} />
                        <div>
                          <div className="text-[#E8EAED]">In UAE</div>
                          <p className="text-sm text-[#8B92A7]">Car is in the UAE</p>
                        </div>
                      </div>
                    </label>

                    <label className={`cursor-pointer rounded-lg border-2 p-4 ${
                      formData.origin === 'overseas' 
                        ? 'border-[#D4AF37] bg-[#D4AF37]/10' 
                        : 'border-[#1A2332] hover:border-[#D4AF37]/50'
                    }`}>
                      <input
                        type="radio"
                        name="origin"
                        value="overseas"
                        checked={formData.origin === 'overseas'}
                        onChange={(e) => setFormData({ ...formData, origin: e.target.value as 'uae' | 'overseas' })}
                        className="hidden"
                      />
                      <div className="flex items-center gap-3">
                        <Ship className="text-[#D4AF37]" size={24} />
                        <div>
                          <div className="text-[#E8EAED]">Overseas</div>
                          <p className="text-sm text-[#8B92A7]">Can be shipped to UAE</p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Overseas-specific options */}
                {formData.origin === 'overseas' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Origin Country */}
                      <div>
                        <Label className="text-[#E8EAED]">Origin Country *</Label>
                        <Select value={formData.originCountry} onValueChange={(value) => setFormData({ ...formData, originCountry: value })}>
                          <SelectTrigger className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]">
                            <SelectValue placeholder="Select Country" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0F1829] border-[#1A2332]">
                            {originCountries.map(country => (
                              <SelectItem key={country} value={country} className="text-[#E8EAED]">{country}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Logistics Handling */}
                      <div>
                        <Label className="text-[#E8EAED]">Logistics Handling *</Label>
                        <Select value={formData.logisticsHandling} onValueChange={(value) => setFormData({ ...formData, logisticsHandling: value as 'vendor' | 'buyer' })}>
                          <SelectTrigger className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0F1829] border-[#1A2332]">
                            <SelectItem value="vendor" className="text-[#E8EAED]">
                              Vendor Handles Shipping
                            </SelectItem>
                            <SelectItem value="buyer" className="text-[#E8EAED]">
                              Buyer Arranges Shipping
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {formData.logisticsHandling === 'vendor' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Shipping Cost */}
                        <div>
                          <Label className="text-[#E8EAED]">Shipping Cost (AED)</Label>
                          <Input
                            type="number"
                            value={formData.shippingCost}
                            onChange={(e) => setFormData({ ...formData, shippingCost: e.target.value })}
                            placeholder="5000"
                            className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                          />
                        </div>

                        {/* Delivery Time */}
                        <div>
                          <Label className="text-[#E8EAED]">Estimated Delivery (Days)</Label>
                          <Input
                            type="number"
                            value={formData.estimatedDeliveryDays}
                            onChange={(e) => setFormData({ ...formData, estimatedDeliveryDays: e.target.value })}
                            placeholder="30"
                            className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                          />
                        </div>
                      </div>
                    )}

                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Package className="text-blue-500 flex-shrink-0 mt-1" size={20} />
                        <div className="text-sm text-[#E8EAED]">
                          <p className="mb-2">Overseas listings help buyers understand:</p>
                          <ul className="list-disc list-inside space-y-1 text-[#8B92A7]">
                            <li>Current location of the vehicle</li>
                            <li>Shipping arrangements and costs</li>
                            <li>Expected delivery timeframe</li>
                            <li>Import duties and documentation requirements</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                onClick={() => setCurrentStep(2)}
                className="bg-[#D4AF37] hover:bg-[#C19B2E] text-[#0B1426]"
              >
                Next: Add Details
              </Button>
            </div>
          </>
        )}

        {/* STEP 2: Car Details */}
        {currentStep === 2 && (
          <>
            <Card className="bg-[#0F1829] border-[#1A2332]">
              <CardHeader>
                <CardTitle className="text-[#E8EAED]">Car Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Color */}
                  <div>
                    <Label className="text-[#E8EAED]">Color</Label>
                    <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
                      <SelectTrigger className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]">
                        <SelectValue placeholder="Select Color" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0F1829] border-[#1A2332]">
                        {carColors.map(color => (
                          <SelectItem key={color} value={color} className="text-[#E8EAED]">{color}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Body Type */}
                  <div>
                    <Label className="text-[#E8EAED]">Body Type</Label>
                    <Select value={formData.bodyType} onValueChange={(value) => setFormData({ ...formData, bodyType: value })}>
                      <SelectTrigger className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]">
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0F1829] border-[#1A2332]">
                        {bodyTypes.map(type => (
                          <SelectItem key={type} value={type} className="text-[#E8EAED]">{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Transmission */}
                  <div>
                    <Label className="text-[#E8EAED]">Transmission</Label>
                    <Select value={formData.transmission} onValueChange={(value) => setFormData({ ...formData, transmission: value })}>
                      <SelectTrigger className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0F1829] border-[#1A2332]">
                        <SelectItem value="automatic" className="text-[#E8EAED]">Automatic</SelectItem>
                        <SelectItem value="manual" className="text-[#E8EAED]">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Fuel Type */}
                  <div>
                    <Label className="text-[#E8EAED]">Fuel Type</Label>
                    <Select value={formData.fuelType} onValueChange={(value) => setFormData({ ...formData, fuelType: value })}>
                      <SelectTrigger className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0F1829] border-[#1A2332]">
                        <SelectItem value="gasoline" className="text-[#E8EAED]">Gasoline</SelectItem>
                        <SelectItem value="diesel" className="text-[#E8EAED]">Diesel</SelectItem>
                        <SelectItem value="electric" className="text-[#E8EAED]">Electric</SelectItem>
                        <SelectItem value="hybrid" className="text-[#E8EAED]">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Doors */}
                  <div>
                    <Label className="text-[#E8EAED]">Doors</Label>
                    <Select value={formData.doors} onValueChange={(value) => setFormData({ ...formData, doors: value })}>
                      <SelectTrigger className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0F1829] border-[#1A2332]">
                        <SelectItem value="2" className="text-[#E8EAED]">2 Doors</SelectItem>
                        <SelectItem value="4" className="text-[#E8EAED]">4 Doors</SelectItem>
                        <SelectItem value="5" className="text-[#E8EAED]">5 Doors</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Engine Capacity */}
                  <div>
                    <Label className="text-[#E8EAED]">Engine Capacity (L)</Label>
                    <Input
                      value={formData.engineCapacity}
                      onChange={(e) => setFormData({ ...formData, engineCapacity: e.target.value })}
                      placeholder="e.g., 2.0"
                      className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                    />
                  </div>

                  {/* Horsepower */}
                  <div>
                    <Label className="text-[#E8EAED]">Horsepower (HP)</Label>
                    <Input
                      type="number"
                      value={formData.horsepower}
                      onChange={(e) => setFormData({ ...formData, horsepower: e.target.value })}
                      placeholder="e.g., 200"
                      className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-[#E8EAED]">Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., 2024 BYD Seal - Premium Package, Low Mileage"
                    className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                  />
                </div>

                <div>
                  <Label className="text-[#E8EAED]">Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your car in detail..."
                    className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED] min-h-[120px]"
                  />
                </div>

                {/* Features */}
                <div>
                  <Label className="text-[#E8EAED] mb-3 block">Features</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {popularFeatures.map(feature => (
                      <label
                        key={feature}
                        className={`cursor-pointer rounded-lg border p-3 text-sm ${
                          formData.features.includes(feature)
                            ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                            : 'border-[#1A2332] hover:border-[#D4AF37]/50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.features.includes(feature)}
                          onChange={() => toggleFeature(feature)}
                          className="hidden"
                        />
                        <span className="text-[#E8EAED]">{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Warranty */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="warranty"
                      checked={formData.warrantyAvailable}
                      onCheckedChange={(checked) => setFormData({ ...formData, warrantyAvailable: checked as boolean })}
                      className="border-[#1A2332] data-[state=checked]:bg-[#D4AF37]"
                    />
                    <Label htmlFor="warranty" className="text-[#E8EAED]">Warranty Available</Label>
                  </div>
                  
                  {formData.warrantyAvailable && (
                    <div className="ml-6">
                      <Label className="text-[#E8EAED]">Warranty Duration (Months)</Label>
                      <Input
                        type="number"
                        value={formData.warrantyMonths}
                        onChange={(e) => setFormData({ ...formData, warrantyMonths: e.target.value })}
                        placeholder="12"
                        className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED] max-w-xs"
                      />
                    </div>
                  )}
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

            <div className="flex justify-between">
              <Button
                onClick={() => setCurrentStep(1)}
                variant="outline"
                className="border-[#1A2332] text-[#E8EAED] hover:bg-[#1A2332]"
              >
                Back
              </Button>
              <Button
                onClick={() => setCurrentStep(3)}
                className="bg-[#D4AF37] hover:bg-[#C19B2E] text-[#0B1426]"
              >
                Next: Add Photos
              </Button>
            </div>
          </>
        )}

        {/* STEP 3: Images */}
        {currentStep === 3 && (
          <>
            <Card className="bg-[#0F1829] border-[#1A2332]">
              <CardHeader>
                <CardTitle className="text-[#E8EAED]">Upload Photos</CardTitle>
                <CardDescription className="text-[#8B92A7]">
                  Add up to 10 high-quality photos of your car
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {formData.imagePreviews.map((preview, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-[#0B1426] border border-[#1A2332]">
                        <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                        {index === 0 && (
                          <Badge className="absolute top-2 left-2 bg-[#D4AF37] text-[#0B1426]">
                            Main
                          </Badge>
                        )}
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}

                    {formData.imagePreviews.length < 10 && (
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

                  {formData.imagePreviews.length === 0 && (
                    <div className="text-center py-8 text-[#8B92A7]">
                      No images uploaded yet. Add at least one photo.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button
                onClick={() => setCurrentStep(2)}
                variant="outline"
                className="border-[#1A2332] text-[#E8EAED] hover:bg-[#1A2332]"
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting || formData.imagePreviews.length === 0}
                className="bg-[#D4AF37] hover:bg-[#C19B2E] text-[#0B1426]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" size={16} />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2" size={16} />
                    Submit Listing
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
