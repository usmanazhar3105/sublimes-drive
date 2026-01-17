import { useState } from 'react';
import { 
  Car, 
  Upload, 
  Camera, 
  MapPin, 
  DollarSign, 
  Calendar,
  Gauge,
  Palette,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card } from '../ui/card';
import { PaymentFlow, PaymentConfig } from '../payments/PaymentFlow';
import { toast } from 'sonner';

interface CarListingData {
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  color: string;
  condition: 'excellent' | 'good' | 'fair' | 'needs-work';
  location: string;
  description: string;
  features: string[];
  images: File[];
}

interface CreateCarListingPageProps {
  onNavigate: (page: string) => void;
}

export function CreateCarListingPage({ onNavigate }: CreateCarListingPageProps) {
  const [currentStep, setCurrentStep] = useState<'form' | 'review' | 'payment' | 'success'>('form');
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);
  const [listingData, setListingData] = useState<CarListingData>({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    price: 0,
    mileage: 0,
    color: '',
    condition: 'excellent',
    location: '',
    description: '',
    features: [],
    images: []
  });

  // Payment configuration for car listings
  const paymentConfig: PaymentConfig = {
    type: 'car-listing',
    title: 'Car Listing Payment',
    amount: 50,
    currency: 'AED',
    description: 'Post your car listing on Sublimes Drive marketplace',
    duration: 90,
    features: [
      'Featured listing for 90 days',
      'Up to 20 high-quality photos',
      'Priority placement in search results',
      'Direct contact from interested buyers',
      'Listing analytics and views tracking',
      '24/7 customer support'
    ]
  };

  const carMakes = [
    'Audi', 'BMW', 'Mercedes-Benz', 'Toyota', 'Honda', 'Nissan', 'Hyundai',
    'Kia', 'Volkswagen', 'Ford', 'Chevrolet', 'Mazda', 'Mitsubishi',
    'Lexus', 'Infiniti', 'Porsche', 'Jaguar', 'Land Rover', 'Other'
  ];

  const carColors = [
    'White', 'Black', 'Silver', 'Gray', 'Blue', 'Red', 'Brown', 'Gold',
    'Green', 'Orange', 'Yellow', 'Purple', 'Other'
  ];

  const commonFeatures = [
    'Air Conditioning', 'Bluetooth', 'Backup Camera', 'Navigation System',
    'Leather Seats', 'Sunroof', 'Alloy Wheels', 'Automatic Transmission',
    'Cruise Control', 'Power Windows', 'ABS Brakes', 'Airbags',
    'Keyless Entry', 'Remote Start', 'Heated Seats', 'Premium Sound System'
  ];

  const handleInputChange = (field: keyof CarListingData, value: any) => {
    setListingData(prev => ({ ...prev, [field]: value }));
  };

  const handleFeatureToggle = (feature: string) => {
    setListingData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setListingData(prev => ({
      ...prev,
      images: [...prev.images, ...files].slice(0, 20) // Max 20 images
    }));
  };

  const removeImage = (index: number) => {
    setListingData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const required = ['make', 'model', 'year', 'price', 'mileage', 'color', 'location', 'description'];
    const missing = required.filter(field => !listingData[field as keyof CarListingData]);
    
    if (missing.length > 0) {
      toast.error(`Please fill in all required fields: ${missing.join(', ')}`);
      return false;
    }

    if (listingData.images.length === 0) {
      toast.error('Please upload at least one image of your car');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (currentStep === 'form') {
      if (validateForm()) {
        setCurrentStep('review');
      }
    } else if (currentStep === 'review') {
      setCurrentStep('payment');
      setShowPaymentFlow(true);
    }
  };

  const handlePaymentSuccess = (paymentReference: string) => {
    setShowPaymentFlow(false);
    setCurrentStep('success');
    toast.success('Car listing submitted successfully!');
  };

  const handlePaymentCancel = () => {
    setShowPaymentFlow(false);
    setCurrentStep('review');
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED'
    }).format(amount);
  };

  const renderForm = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-[var(--sublimes-gold)]/10 rounded-full flex items-center justify-center">
          <Car className="w-8 h-8 text-[var(--sublimes-gold)]" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-2">List Your Car</h1>
        <p className="text-gray-400">Fill in the details to create your car listing</p>
      </div>

      {/* Basic Information */}
      <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)] p-6">
        <h2 className="font-bold text-[var(--sublimes-light-text)] mb-6 flex items-center">
          <Car className="w-5 h-5 mr-2" />
          Basic Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[var(--sublimes-light-text)] font-medium mb-2">Make *</label>
            <select
              value={listingData.make}
              onChange={(e) => handleInputChange('make', e.target.value)}
              className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] focus:ring-2 focus:ring-[var(--sublimes-gold)]"
            >
              <option value="">Select Make</option>
              {carMakes.map(make => (
                <option key={make} value={make}>{make}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[var(--sublimes-light-text)] font-medium mb-2">Model *</label>
            <Input
              value={listingData.model}
              onChange={(e) => handleInputChange('model', e.target.value)}
              placeholder="Enter car model"
              className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
            />
          </div>

          <div>
            <label className="block text-[var(--sublimes-light-text)] font-medium mb-2">Year *</label>
            <Input
              type="number"
              value={listingData.year}
              onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
              min="1990"
              max={new Date().getFullYear() + 1}
              className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
            />
          </div>

          <div>
            <label className="block text-[var(--sublimes-light-text)] font-medium mb-2">Price (AED) *</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="number"
                value={listingData.price}
                onChange={(e) => handleInputChange('price', parseInt(e.target.value))}
                placeholder="0"
                className="pl-10 bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[var(--sublimes-light-text)] font-medium mb-2">Mileage (km) *</label>
            <div className="relative">
              <Gauge className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="number"
                value={listingData.mileage}
                onChange={(e) => handleInputChange('mileage', parseInt(e.target.value))}
                placeholder="0"
                className="pl-10 bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[var(--sublimes-light-text)] font-medium mb-2">Color *</label>
            <select
              value={listingData.color}
              onChange={(e) => handleInputChange('color', e.target.value)}
              className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] focus:ring-2 focus:ring-[var(--sublimes-gold)]"
            >
              <option value="">Select Color</option>
              {carColors.map(color => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[var(--sublimes-light-text)] font-medium mb-2">Condition *</label>
            <select
              value={listingData.condition}
              onChange={(e) => handleInputChange('condition', e.target.value)}
              className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] focus:ring-2 focus:ring-[var(--sublimes-gold)]"
            >
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="needs-work">Needs Work</option>
            </select>
          </div>

          <div>
            <label className="block text-[var(--sublimes-light-text)] font-medium mb-2">Location *</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                value={listingData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="City, UAE"
                className="pl-10 bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Description */}
      <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)] p-6">
        <h2 className="font-bold text-[var(--sublimes-light-text)] mb-6">Description *</h2>
        <Textarea
          value={listingData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Describe your car in detail. Include any special features, recent maintenance, or unique selling points..."
          rows={5}
          className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
        />
        <p className="text-gray-400 text-sm mt-2">
          {listingData.description.length}/500 characters
        </p>
      </Card>

      {/* Features */}
      <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)] p-6">
        <h2 className="font-bold text-[var(--sublimes-light-text)] mb-6">Features & Options</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {commonFeatures.map(feature => (
            <button
              key={feature}
              onClick={() => handleFeatureToggle(feature)}
              className={`text-left p-3 rounded-lg border transition-colors ${
                listingData.features.includes(feature)
                  ? 'border-[var(--sublimes-gold)] bg-[var(--sublimes-gold)]/10 text-[var(--sublimes-gold)]'
                  : 'border-[var(--sublimes-border)] bg-[var(--sublimes-dark-bg)] text-gray-400 hover:border-[var(--sublimes-gold)]/50'
              }`}
            >
              <div className="flex items-center space-x-2">
                {listingData.features.includes(feature) && (
                  <CheckCircle className="w-4 h-4" />
                )}
                <span className="text-sm">{feature}</span>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Images */}
      <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)] p-6">
        <h2 className="font-bold text-[var(--sublimes-light-text)] mb-6 flex items-center">
          <Camera className="w-5 h-5 mr-2" />
          Photos * (Max 20)
        </h2>
        
        <div className="space-y-4">
          {/* Upload Button */}
          <div className="border-2 border-dashed border-[var(--sublimes-border)] rounded-lg p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-[var(--sublimes-gold)]/10 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-[var(--sublimes-gold)]" />
            </div>
            <p className="text-[var(--sublimes-light-text)] mb-2">Upload car photos</p>
            <p className="text-gray-400 text-sm mb-4">
              Add up to 20 high-quality photos of your car
            </p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <Button
              onClick={() => document.getElementById('image-upload')?.click()}
              className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] hover:bg-[var(--sublimes-gold)]/90"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose Photos
            </Button>
          </div>

          {/* Image Preview */}
          {listingData.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {listingData.images.map((image, index) => (
                <div key={index} className="relative">
                  <div className="aspect-square bg-gray-700 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 text-sm">{image.name}</span>
                  </div>
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <Button
          variant="outline"
          onClick={() => onNavigate('marketplace')}
          className="flex-1 border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
        >
          Cancel
        </Button>
        <Button
          onClick={handleNext}
          className="flex-1 bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] hover:bg-[var(--sublimes-gold)]/90"
        >
          Review Listing
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderReview = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-[var(--sublimes-gold)]/10 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-[var(--sublimes-gold)]" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-2">Review Your Listing</h1>
        <p className="text-gray-400">Please review your car listing details before payment</p>
      </div>

      {/* Listing Preview */}
      <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)] p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[var(--sublimes-light-text)]">
              {listingData.year} {listingData.make} {listingData.model}
            </h2>
            
            <div className="text-2xl font-bold text-[var(--sublimes-gold)]">
              {formatAmount(listingData.price)}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Mileage:</span>
                <span className="text-[var(--sublimes-light-text)] ml-2">
                  {listingData.mileage.toLocaleString()} km
                </span>
              </div>
              <div>
                <span className="text-gray-400">Color:</span>
                <span className="text-[var(--sublimes-light-text)] ml-2">{listingData.color}</span>
              </div>
              <div>
                <span className="text-gray-400">Condition:</span>
                <span className="text-[var(--sublimes-light-text)] ml-2 capitalize">{listingData.condition}</span>
              </div>
              <div>
                <span className="text-gray-400">Location:</span>
                <span className="text-[var(--sublimes-light-text)] ml-2">{listingData.location}</span>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-[var(--sublimes-light-text)] mb-2">Description</h3>
              <p className="text-gray-400 text-sm">{listingData.description}</p>
            </div>

            {listingData.features.length > 0 && (
              <div>
                <h3 className="font-medium text-[var(--sublimes-light-text)] mb-2">Features</h3>
                <div className="flex flex-wrap gap-2">
                  {listingData.features.map(feature => (
                    <span key={feature} className="px-2 py-1 bg-[var(--sublimes-gold)]/10 text-[var(--sublimes-gold)] text-xs rounded">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <h3 className="font-medium text-[var(--sublimes-light-text)] mb-3">
              Photos ({listingData.images.length})
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {listingData.images.slice(0, 4).map((image, index) => (
                <div key={index} className="aspect-square bg-gray-700 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-xs text-center p-2">{image.name}</span>
                </div>
              ))}
            </div>
            {listingData.images.length > 4 && (
              <p className="text-gray-400 text-sm mt-2">
                +{listingData.images.length - 4} more photos
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Payment Info */}
      <Card className="bg-blue-500/10 border border-blue-500/20 p-6">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-400 mb-2">Next: Complete Payment</h3>
            <p className="text-gray-300 text-sm mb-3">
              To publish your listing, you'll need to complete a one-time payment of {formatAmount(paymentConfig.amount)}.
            </p>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• Your listing will be live for {paymentConfig.duration} days</li>
              <li>• Premium placement in search results</li>
              <li>• Direct contact from interested buyers</li>
              <li>• 24/7 customer support</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <Button
          variant="outline"
          onClick={() => setCurrentStep('form')}
          className="flex-1 border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
        >
          Edit Listing
        </Button>
        <Button
          onClick={handleNext}
          className="flex-1 bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] hover:bg-[var(--sublimes-gold)]/90"
        >
          Proceed to Payment
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center space-y-8">
      <div className="w-20 h-20 mx-auto bg-green-500/10 rounded-full flex items-center justify-center">
        <CheckCircle className="w-10 h-10 text-green-500" />
      </div>
      
      <div>
        <h1 className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-2">
          Listing Submitted Successfully!
        </h1>
        <p className="text-gray-400">
          Your car listing has been submitted for approval and will be reviewed within 24 hours.
        </p>
      </div>

      <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)] p-6 text-left">
        <h2 className="font-bold text-[var(--sublimes-light-text)] mb-4">What happens next?</h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-orange-500/10 rounded-full flex items-center justify-center">
              <span className="text-orange-500 text-sm font-bold">1</span>
            </div>
            <span className="text-gray-400">Our team reviews your listing (usually within 24 hours)</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-blue-500/10 rounded-full flex items-center justify-center">
              <span className="text-blue-500 text-sm font-bold">2</span>
            </div>
            <span className="text-gray-400">You'll receive an email notification once approved</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-green-500/10 rounded-full flex items-center justify-center">
              <span className="text-green-500 text-sm font-bold">3</span>
            </div>
            <span className="text-gray-400">Your listing goes live and potential buyers can contact you</span>
          </div>
        </div>
      </Card>

      <div className="flex space-x-4">
        <Button
          variant="outline"
          onClick={() => {
            setCurrentStep('form');
            setListingData({
              make: '',
              model: '',
              year: new Date().getFullYear(),
              price: 0,
              mileage: 0,
              color: '',
              condition: 'excellent',
              location: '',
              description: '',
              features: [],
              images: []
            });
          }}
          className="flex-1 border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
        >
          Create Another Listing
        </Button>
        <Button
          onClick={() => onNavigate('marketplace')}
          className="flex-1 bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] hover:bg-[var(--sublimes-gold)]/90"
        >
          View Marketplace
        </Button>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-[var(--sublimes-dark-bg)] min-h-screen">
      <div className="max-w-4xl mx-auto">
        {currentStep === 'form' && renderForm()}
        {currentStep === 'review' && renderReview()}
        {currentStep === 'success' && renderSuccess()}
      </div>

      {/* Payment Flow Modal */}
      <PaymentFlow
        config={paymentConfig}
        onSuccess={handlePaymentSuccess}
        onCancel={handlePaymentCancel}
        isOpen={showPaymentFlow}
      />
    </div>
  );
}