import { useState } from 'react';
import { Plus, Upload, X, Car, Wrench, Star, MapPin, DollarSign, Calendar, Camera, FileText, Zap, Eye, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { Label } from './ui/label';
import { CarBrandModelSelector } from './ui/CarBrandModelSelector';
import { CAR_BRANDS, getCarBrandById } from '../utils/carData';

interface AdFormData {
  category: string;
  type: string;
  title: string;
  description: string;
  price: string;
  negotiable: boolean;
  location: string;
  condition: string;
  images: File[];
  contactMethod: string;
  phoneNumber: string;
  email: string;
  // Car specific
  make?: string;
  model?: string;
  customModel?: string;
  year?: string;
  mileage?: string;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  color?: string;
  // Service specific
  serviceType?: string;
  availability?: string;
  certification?: string;
}

const adCategories = [
  { id: 'vehicles', label: 'Vehicles', icon: Car, types: ['Cars', 'Motorcycles', 'Trucks', 'SUVs', 'Luxury Cars'] },
  { id: 'parts', label: 'Parts & Accessories', icon: Wrench, types: ['Engine Parts', 'Body Parts', 'Electronics', 'Tires & Wheels', 'Interior'] }
];


const years = Array.from({ length: 30 }, (_, i) => (new Date().getFullYear() - i).toString());
const conditions = ['New', 'Like New', 'Good', 'Fair', 'Needs Work'];
const fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'LPG'];
const transmissions = ['Automatic', 'Manual', 'CVT'];
const bodyTypes = ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Wagon', 'Truck', 'Van'];

interface PlaceYourAdPageProps {
  onNavigate?: (page: string, data?: any) => void;
}

export function PlaceYourAdPage({ onNavigate }: PlaceYourAdPageProps) {
  const [activeTab, setActiveTab] = useState('create');
  const [formData, setFormData] = useState<AdFormData>({
    category: '',
    type: '',
    title: '',
    description: '',
    price: '',
    negotiable: false,
    location: '',
    condition: '',
    images: [],
    contactMethod: 'phone',
    phoneNumber: '',
    email: ''
  });

  const [dragActive, setDragActive] = useState(false);
  
  // Admin-configured pricing (should be fetched from admin settings in real app)
  const [pricingConfig] = useState({
    basic: { price: 0, name: 'Basic Listing' },
    featured: { price: 50, name: 'Featured Listing' },
    premium: { price: 100, name: 'Premium Listing' }
  });

  const updateFormData = (field: keyof AdFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (files: FileList | null) => {
    if (files) {
      const newImages = Array.from(files).slice(0, 10 - formData.images.length);
      setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const selectedCategory = adCategories.find(cat => cat.id === formData.category);

  const estimatedViews = Math.floor(Math.random() * 500) + 100;
  const estimatedInterest = Math.floor(Math.random() * 50) + 10;

  return (
    <div className="h-full bg-background overflow-y-auto">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Plus className="h-7 w-7 text-[var(--sublimes-gold)]" />
                Place Your Ad
              </h1>
              <p className="text-muted-foreground">Reach thousands of car enthusiasts in the UAE</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{estimatedViews}+ daily views</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{estimatedInterest}+ potential buyers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-4xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">Create Ad</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="pricing">Pricing & Boost</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="mt-6 space-y-6">
            {/* Category Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {adCategories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <Card 
                        key={category.id}
                        className={`cursor-pointer transition-all ${
                          formData.category === category.id 
                            ? 'border-[var(--sublimes-gold)] bg-[var(--sublimes-gold)]/10' 
                            : 'hover:border-[var(--sublimes-gold)]/50'
                        }`}
                        onClick={() => updateFormData('category', category.id)}
                      >
                        <CardContent className="p-4 text-center">
                          <Icon className="h-8 w-8 mx-auto mb-2 text-[var(--sublimes-gold)]" />
                          <h3 className="font-semibold">{category.label}</h3>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {selectedCategory && (
                  <div className="mt-4">
                    <Label>Type</Label>
                    <Select value={formData.type} onValueChange={(value) => updateFormData('type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedCategory.types.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input 
                    placeholder="Enter a descriptive title for your ad"
                    value={formData.title}
                    onChange={(e) => updateFormData('title', e.target.value)}
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea 
                    placeholder="Provide detailed information about your item or service"
                    rows={5}
                    value={formData.description}
                    onChange={(e) => updateFormData('description', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Price (AED)</Label>
                    <Input 
                      type="number"
                      placeholder="Enter price"
                      value={formData.price}
                      onChange={(e) => updateFormData('price', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Input 
                      placeholder="Enter location"
                      value={formData.location}
                      onChange={(e) => updateFormData('location', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Condition</Label>
                    <Select value={formData.condition} onValueChange={(value) => updateFormData('condition', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {conditions.map((condition) => (
                          <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Checkbox 
                      id="negotiable"
                      checked={formData.negotiable}
                      onCheckedChange={(checked) => updateFormData('negotiable', checked)}
                    />
                    <Label htmlFor="negotiable">Price negotiable</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Specific Fields */}
            {formData.category === 'vehicles' && (
              <Card>
                <CardHeader>
                  <CardTitle>Vehicle Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2">
                      <CarBrandModelSelector
                        selectedBrand={formData.make}
                        selectedModel={formData.model}
                        customModel={formData.customModel}
                        onBrandChange={(brandId) => updateFormData('make', brandId)}
                        onModelChange={(modelId) => updateFormData('model', modelId)}
                        onCustomModelChange={(customModel) => updateFormData('customModel', customModel)}
                        brandLabel="Car Brand"
                        modelLabel="Car Model"
                        brandPlaceholder="Select car brand"
                        modelPlaceholder="Select car model"
                        required={true}
                      />
                    </div>
                    <div>
                      <Label>Year</Label>
                      <Select value={formData.year} onValueChange={(value) => updateFormData('year', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year} value={year}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label>Mileage (km)</Label>
                      <Input 
                        type="number"
                        placeholder="Enter mileage"
                        value={formData.mileage}
                        onChange={(e) => updateFormData('mileage', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Fuel Type</Label>
                      <Select value={formData.fuelType} onValueChange={(value) => updateFormData('fuelType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select fuel type" />
                        </SelectTrigger>
                        <SelectContent>
                          {fuelTypes.map((fuel) => (
                            <SelectItem key={fuel} value={fuel}>{fuel}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Transmission</Label>
                      <Select value={formData.transmission} onValueChange={(value) => updateFormData('transmission', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select transmission" />
                        </SelectTrigger>
                        <SelectContent>
                          {transmissions.map((trans) => (
                            <SelectItem key={trans} value={trans}>{trans}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Body Type</Label>
                      <Select value={formData.bodyType} onValueChange={(value) => updateFormData('bodyType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select body type" />
                        </SelectTrigger>
                        <SelectContent>
                          {bodyTypes.map((body) => (
                            <SelectItem key={body} value={body}>{body}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Color</Label>
                      <Input 
                        placeholder="Enter color"
                        value={formData.color}
                        onChange={(e) => updateFormData('color', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Photos ({formData.images.length}/10)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive ? 'border-[var(--sublimes-gold)] bg-[var(--sublimes-gold)]/10' : 'border-border'
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    handleImageUpload(e.dataTransfer.files);
                  }}
                >
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Drag and drop photos here, or click to select files
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    Choose Files
                  </Button>
                  <input 
                    id="image-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e.target.files)}
                  />
                </div>

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={URL.createObjectURL(image)}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        {index === 0 && (
                          <Badge className="absolute bottom-1 left-1 text-xs">Main</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Preferred Contact Method</Label>
                  <Select value={formData.contactMethod} onValueChange={(value) => updateFormData('contactMethod', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Phone Number</Label>
                    <Input 
                      placeholder="+971 XX XXX XXXX"
                      value={formData.phoneNumber}
                      onChange={(e) => updateFormData('phoneNumber', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input 
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Ad Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{formData.title || 'Your Ad Title'}</h3>
                      <p className="text-2xl font-bold text-[var(--sublimes-gold)]">
                        AED {formData.price || '0'} {formData.negotiable && '(Negotiable)'}
                      </p>
                    </div>
                    <Badge>{formData.condition || 'Condition'}</Badge>
                  </div>

                  <p className="text-muted-foreground mb-4">
                    {formData.description || 'Your description will appear here...'}
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {formData.location || 'Location'}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Just now
                    </div>
                  </div>

                  {formData.category === 'vehicles' && (formData.make || formData.model) && (
                    <Separator className="my-4" />
                  )}

                  {formData.category === 'vehicles' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {formData.make && <div><strong>Make:</strong> {formData.make}</div>}
                      {formData.model && <div><strong>Model:</strong> {formData.model}</div>}
                      {formData.year && <div><strong>Year:</strong> {formData.year}</div>}
                      {formData.mileage && <div><strong>Mileage:</strong> {formData.mileage} km</div>}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Listing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4">
                    {pricingConfig.basic.price === 0 ? 'FREE' : `AED ${pricingConfig.basic.price}`}
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li>✓ List for 30 days</li>
                    <li>✓ Up to 10 photos</li>
                    <li>✓ Basic search visibility</li>
                    <li>✓ Contact information</li>
                  </ul>
                  <Button 
                    className="w-full mt-4" 
                    variant="outline"
                    onClick={() => {
                      if (pricingConfig.basic.price === 0) {
                        const listingType = formData.category === 'vehicles' ? 'marketplace' : 'garage';
                        onNavigate?.('listing-payment', { listingData: formData, listingType, plan: 'basic' });
                      } else {
                        const listingType = formData.category === 'vehicles' ? 'marketplace' : 'garage';
                        onNavigate?.('listing-payment', { listingData: formData, listingType, plan: 'basic' });
                      }
                    }}
                  >
                    {pricingConfig.basic.price === 0 ? 'Post for Free' : `Post for AED ${pricingConfig.basic.price}`}
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-[var(--sublimes-gold)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-[var(--sublimes-gold)]" />
                    Featured Listing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4">AED {pricingConfig.featured.price}</div>
                  <ul className="space-y-2 text-sm">
                    <li>✓ Everything in Basic</li>
                    <li>✓ Featured placement</li>
                    <li>✓ 3x more visibility</li>
                    <li>✓ Priority in search</li>
                    <li>✓ Social media promotion</li>
                  </ul>
                  <Button 
                    className="w-full mt-4 bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/80"
                    onClick={() => {
                      const listingType = formData.category === 'vehicles' ? 'marketplace' : 'garage';
                      onNavigate?.('listing-payment', { listingData: formData, listingType, plan: 'featured' });
                    }}
                  >
                    Make it Featured
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Premium Listing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4">AED {pricingConfig.premium.price}</div>
                  <ul className="space-y-2 text-sm">
                    <li>✓ Everything in Featured</li>
                    <li>✓ Homepage banner</li>
                    <li>✓ Email promotion</li>
                    <li>✓ Analytics dashboard</li>
                    <li>✓ Priority support</li>
                  </ul>
                  <Button 
                    className="w-full mt-4" 
                    variant="outline"
                    onClick={() => {
                      const listingType = formData.category === 'vehicles' ? 'marketplace' : 'garage';
                      onNavigate?.('listing-payment', { listingData: formData, listingType, plan: 'premium' });
                    }}
                  >
                    Go Premium
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Performance Estimate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[var(--sublimes-gold)]">{estimatedViews}+</div>
                    <div className="text-sm text-muted-foreground">Expected Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[var(--sublimes-gold)]">{estimatedInterest}+</div>
                    <div className="text-sm text-muted-foreground">Potential Inquiries</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[var(--sublimes-gold)]">72%</div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
          <Button variant="outline">
            Save as Draft
          </Button>
          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={() => setActiveTab('preview')}
              disabled={activeTab === 'preview'}
            >
              Preview
            </Button>
            <Button 
              className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/80"
              disabled={!formData.title || !formData.description || !formData.price}
              onClick={() => {
                const listingType = formData.category === 'vehicles' ? 'marketplace' : 'garage';
                onNavigate?.('listing-payment', { listingData: formData, listingType });
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              Continue to Payment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}