import { useState, useRef } from 'react';
import { X, Upload, Calendar, Image as ImageIcon, Plus, Minus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';

interface CreateOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateOffer: (offerData: any) => void;
}

export function CreateOfferModal({ isOpen, onClose, onCreateOffer }: CreateOfferModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    originalPrice: '',
    offerPrice: '',
    validFrom: '',
    validFromTime: '09:00',
    validUntil: '',
    validUntilTime: '18:00',
    availability: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: false,
      weekends: false,
      publicHolidays: false
    },
    categories: [] as string[],
    images: [] as File[],
    videos: [] as File[],
    maxRedemptions: '100',
    termsAndConditions: '',
    contactPhone: '',
    contactEmail: '',
    location: '',
    additionalNotes: '',
    isLimitedQuantity: false,
    quantityAvailable: '',
    isRecurring: false,
    recurringPeriod: 'weekly'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const serviceCategories = [
    'oil change',
    'tyres',
    'detailing',
    'battery',
    'ac service',
    'brake service',
    'engine service',
    'transmission',
    'suspension',
    'electrical',
    'bodywork',
    'paint service',
    'glass service',
    'interior cleaning',
    'waxing',
    'polishing'
  ];

  const mainCategories = [
    'Maintenance',
    'Detailing',
    'Repair',
    'Parts'
  ];

  const availabilityOptions = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
    { key: 'weekends', label: 'Weekends' },
    { key: 'publicHolidays', label: 'Public Holidays' }
  ];

  const calculateDiscount = () => {
    const original = parseFloat(formData.originalPrice) || 0;
    const offer = parseFloat(formData.offerPrice) || 0;
    if (original > 0 && offer > 0 && offer < original) {
      return Math.round(((original - offer) / original) * 100);
    }
    return 0;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleAvailabilityChange = (day: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: checked
      }
    }));
  };

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    
    // Check total file count (max 10)
    if (formData.images.length + newFiles.length > 10) {
      toast.error('Maximum 10 files allowed');
      return;
    }

    // Check file size (max 10MB each)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = newFiles.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newFiles]
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Offer title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be 100 characters or less';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 1000) {
      newErrors.description = 'Description must be 1000 characters or less';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.originalPrice || parseFloat(formData.originalPrice) <= 0) {
      newErrors.originalPrice = 'Valid original price is required';
    }

    if (!formData.offerPrice || parseFloat(formData.offerPrice) <= 0) {
      newErrors.offerPrice = 'Valid offer price is required';
    }

    if (parseFloat(formData.offerPrice) >= parseFloat(formData.originalPrice)) {
      newErrors.offerPrice = 'Offer price must be less than original price';
    }

    if (!formData.validFrom) {
      newErrors.validFrom = 'Valid from date is required';
    }

    if (!formData.validUntil) {
      newErrors.validUntil = 'Valid until date is required';
    }

    if (formData.validFrom && formData.validUntil && new Date(formData.validFrom) >= new Date(formData.validUntil)) {
      newErrors.validUntil = 'Valid until date must be after valid from date';
    }

    if (formData.categories.length === 0) {
      newErrors.categories = 'At least one service category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting');
      return;
    }

    const offerData = {
      ...formData,
      originalPrice: parseFloat(formData.originalPrice),
      offerPrice: parseFloat(formData.offerPrice),
      discountPercentage: calculateDiscount(),
      validFrom: new Date(`${formData.validFrom}T${formData.validFromTime}`),
      validUntil: new Date(`${formData.validUntil}T${formData.validUntilTime}`),
      maxRedemptions: parseInt(formData.maxRedemptions) || 100,
      currentRedemptions: 0,
      isActive: true,
      isFeatured: false,
      isBoosted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    onCreateOffer(offerData);
    onClose();
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      category: '',
      originalPrice: '',
      offerPrice: '',
      validFrom: '',
      validFromTime: '09:00',
      validUntil: '',
      validUntilTime: '18:00',
      availability: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: false,
        weekends: false,
        publicHolidays: false
      },
      categories: [],
      images: [],
      videos: [],
      maxRedemptions: '100',
      termsAndConditions: '',
      contactPhone: '',
      contactEmail: '',
      location: '',
      additionalNotes: '',
      isLimitedQuantity: false,
      quantityAvailable: '',
      isRecurring: false,
      recurringPeriod: 'weekly'
    });
    setErrors({});
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getNextWeekDate = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split('T')[0];
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)] max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[var(--sublimes-light-text)]">
            Create New Offer
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-[var(--sublimes-light-text)] border-b border-[var(--sublimes-border)] pb-2">
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label htmlFor="title">
                  Offer Title *
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., 50% OFF Premium Car Wash & Detail"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={errors.title ? 'border-red-500' : ''}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.title && <span className="text-red-500 text-sm">{errors.title}</span>}
                  <span className="text-xs text-gray-400 ml-auto">{formData.title.length}/100 characters</span>
                </div>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  rows={4}
                  placeholder="Describe your offer in detail..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={errors.description ? 'border-red-500' : ''}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.description && <span className="text-red-500 text-sm">{errors.description}</span>}
                  <span className="text-xs text-gray-400 ml-auto">{formData.description.length}/1000 characters</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Discount */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-[var(--sublimes-light-text)] border-b border-[var(--sublimes-border)] pb-2">
              Pricing & Discount
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="originalPrice">
                  Original Price (AED) *
                </Label>
                <Input
                  id="originalPrice"
                  type="number"
                  placeholder="100"
                  value={formData.originalPrice}
                  onChange={(e) => handleInputChange('originalPrice', e.target.value)}
                  className={errors.originalPrice ? 'border-red-500' : ''}
                />
                {errors.originalPrice && <span className="text-red-500 text-sm">{errors.originalPrice}</span>}
              </div>
              
              <div>
                <Label htmlFor="offerPrice">
                  Offer Price (AED) *
                </Label>
                <Input
                  id="offerPrice"
                  type="number"
                  placeholder="50"
                  value={formData.offerPrice}
                  onChange={(e) => handleInputChange('offerPrice', e.target.value)}
                  className={errors.offerPrice ? 'border-red-500' : ''}
                />
                {errors.offerPrice && <span className="text-red-500 text-sm">{errors.offerPrice}</span>}
              </div>
              
              <div>
                <Label>
                  Discount
                </Label>
                <div className="p-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-md text-center">
                  <span className="text-[var(--sublimes-gold)] font-medium">
                    {calculateDiscount() > 0 ? `${calculateDiscount()}% OFF` : 'Enter prices'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Validity Period */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-[var(--sublimes-light-text)] border-b border-[var(--sublimes-border)] pb-2">
              Validity Period
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="validFrom">
                  Valid From *
                </Label>
                <div className="flex space-x-2">
                  <Input
                    id="validFrom"
                    type="date"
                    min={getTomorrowDate()}
                    value={formData.validFrom}
                    onChange={(e) => handleInputChange('validFrom', e.target.value)}
                    className={`flex-1 ${errors.validFrom ? 'border-red-500' : ''}`}
                  />
                  <Input
                    type="time"
                    value={formData.validFromTime}
                    onChange={(e) => handleInputChange('validFromTime', e.target.value)}
                    className="w-32"
                  />
                </div>
                {errors.validFrom && <span className="text-red-500 text-sm">{errors.validFrom}</span>}
              </div>
              
              <div>
                <Label htmlFor="validUntil">
                  Valid Until *
                </Label>
                <div className="flex space-x-2">
                  <Input
                    id="validUntil"
                    type="date"
                    min={formData.validFrom || getTomorrowDate()}
                    value={formData.validUntil}
                    onChange={(e) => handleInputChange('validUntil', e.target.value)}
                    className={`flex-1 ${errors.validUntil ? 'border-red-500' : ''}`}
                  />
                  <Input
                    type="time"
                    value={formData.validUntilTime}
                    onChange={(e) => handleInputChange('validUntilTime', e.target.value)}
                    className="w-32"
                  />
                </div>
                {errors.validUntil && <span className="text-red-500 text-sm">{errors.validUntil}</span>}
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-[var(--sublimes-light-text)] border-b border-[var(--sublimes-border)] pb-2">
              Availability
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {availabilityOptions.map((option) => (
                <Label
                  key={option.key}
                  className="flex items-center space-x-2 cursor-pointer p-3 rounded-lg border border-[var(--sublimes-border)] hover:bg-[var(--sublimes-dark-bg)] transition-colors"
                >
                  <Checkbox
                    checked={formData.availability[option.key as keyof typeof formData.availability]}
                    onCheckedChange={(checked) => handleAvailabilityChange(option.key, checked as boolean)}
                  />
                  <span className="text-sm">{option.label}</span>
                </Label>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-[var(--sublimes-light-text)] border-b border-[var(--sublimes-border)] pb-2">
              Categories *
            </h3>
            
            <div>
              <Label htmlFor="mainCategory">
                Main Category *
              </Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select main category" />
                </SelectTrigger>
                <SelectContent>
                  {mainCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <span className="text-red-500 text-sm">{errors.category}</span>}
            </div>

            <div>
              <Label>
                Service Categories * (Select all that apply)
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-2">
                {serviceCategories.map((category) => (
                  <Label
                    key={category}
                    className={`flex items-center space-x-2 cursor-pointer p-3 rounded-lg border transition-colors ${
                      formData.categories.includes(category)
                        ? 'border-[var(--sublimes-gold)] bg-[var(--sublimes-gold)]/10'
                        : 'border-[var(--sublimes-border)] hover:bg-[var(--sublimes-dark-bg)]'
                    }`}
                  >
                    <Checkbox
                      checked={formData.categories.includes(category)}
                      onCheckedChange={() => handleCategoryToggle(category)}
                    />
                    <span className="text-sm capitalize">{category}</span>
                  </Label>
                ))}
              </div>
              {errors.categories && <span className="text-red-500 text-sm">{errors.categories}</span>}
              
              {formData.categories.length > 0 && (
                <div className="mt-3">
                  <span className="text-sm text-gray-400">Selected categories:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.categories.map((category) => (
                      <Badge
                        key={category}
                        variant="outline"
                        className="bg-[var(--sublimes-gold)]/10 text-[var(--sublimes-gold)] border-[var(--sublimes-gold)]/20"
                      >
                        {category}
                        <button
                          type="button"
                          onClick={() => handleCategoryToggle(category)}
                          className="ml-2 hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Images & Videos */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-[var(--sublimes-light-text)] border-b border-[var(--sublimes-border)] pb-2">
              Offer Images (Up to 5)
            </h3>
            
            <div>
              <Label>
                Upload Images
              </Label>
              <p className="text-sm text-gray-400 mb-3">First image will be used as primary thumbnail. Max 5 images, 10MB each.</p>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              <div className="grid grid-cols-3 gap-4">
                {formData.images.map((file, index) => (
                  <div key={index} className="relative aspect-square group">
                    <div className="w-full h-full bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg flex items-center justify-center overflow-hidden">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                    {index === 0 && (
                      <Badge className="absolute bottom-2 left-2 bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]">
                        Primary
                      </Badge>
                    )}
                    <p className="text-xs text-gray-400 mt-1 truncate text-center">{file.name}</p>
                  </div>
                ))}
                
                {formData.images.length < 5 && (
                  <label className="border-2 border-dashed border-[var(--sublimes-border)] rounded-lg aspect-square flex items-center justify-center cursor-pointer hover:border-[var(--sublimes-gold)] transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <div className="text-center">
                      <Upload className="h-8 w-8 mx-auto text-gray-400" />
                      <p className="text-sm text-gray-400 mt-2">Add Image</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {5 - formData.images.length} remaining
                      </p>
                    </div>
                  </label>
                )}
              </div>
              
              {formData.images.length === 0 && (
                <div className="mt-4 p-4 bg-[var(--sublimes-dark-bg)]/50 rounded-lg border border-[var(--sublimes-border)]">
                  <p className="text-sm text-gray-400 text-center">
                    No images uploaded yet. Click above to add images.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Settings */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-[var(--sublimes-light-text)] border-b border-[var(--sublimes-border)] pb-2">
              Additional Settings
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="maxRedemptions">
                  Maximum Redemptions
                </Label>
                <Input
                  id="maxRedemptions"
                  type="number"
                  placeholder="100"
                  value={formData.maxRedemptions}
                  onChange={(e) => handleInputChange('maxRedemptions', e.target.value)}
                />
                <p className="text-sm text-gray-400 mt-1">Maximum number of times this offer can be redeemed</p>
              </div>

              <div>
                <Label htmlFor="contactPhone">
                  Contact Phone
                </Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  placeholder="+971 50 123 4567"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                />
                <p className="text-sm text-gray-400 mt-1">Contact number for inquiries</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="contactEmail">
                  Contact Email
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="info@garage.com"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                />
                <p className="text-sm text-gray-400 mt-1">Email for customer inquiries</p>
              </div>

              <div>
                <Label htmlFor="location">
                  Location/Area
                </Label>
                <Input
                  id="location"
                  placeholder="Dubai Marina, Dubai"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
                <p className="text-sm text-gray-400 mt-1">Service location or garage area</p>
              </div>
            </div>

            <div>
              <Label htmlFor="termsAndConditions">
                Terms & Conditions
              </Label>
              <Textarea
                id="termsAndConditions"
                rows={4}
                placeholder="Enter specific terms and conditions for this offer..."
                value={formData.termsAndConditions}
                onChange={(e) => handleInputChange('termsAndConditions', e.target.value)}
              />
              <p className="text-sm text-gray-400 mt-1">Specific terms, restrictions, and conditions</p>
            </div>

            <div>
              <Label htmlFor="additionalNotes">
                Additional Notes
              </Label>
              <Textarea
                id="additionalNotes"
                rows={3}
                placeholder="Any additional information or special instructions..."
                value={formData.additionalNotes}
                onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
              />
              <p className="text-sm text-gray-400 mt-1">Internal notes or special instructions</p>
            </div>

            <div className="space-y-4">
              <Label className="flex items-center space-x-2 cursor-pointer">
                <Checkbox
                  checked={formData.isLimitedQuantity}
                  onCheckedChange={(checked) => handleInputChange('isLimitedQuantity', checked as boolean)}
                />
                <span>Limited Quantity Offer</span>
              </Label>
              
              {formData.isLimitedQuantity && (
                <div className="ml-6">
                  <Input
                    type="number"
                    placeholder="Enter quantity available"
                    value={formData.quantityAvailable}
                    onChange={(e) => handleInputChange('quantityAvailable', e.target.value)}
                  />
                  <p className="text-sm text-gray-400 mt-1">Number of services available at this price</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <Label className="flex items-center space-x-2 cursor-pointer">
                <Checkbox
                  checked={formData.isRecurring}
                  onCheckedChange={(checked) => handleInputChange('isRecurring', checked as boolean)}
                />
                <span>Recurring Offer</span>
              </Label>
              
              {formData.isRecurring && (
                <div className="ml-6">
                  <Select value={formData.recurringPeriod} onValueChange={(value) => handleInputChange('recurringPeriod', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select recurrence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-400 mt-1">How often this offer repeats</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4 pt-6 border-t border-[var(--sublimes-border)]">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] hover:bg-[var(--sublimes-gold)]/90"
            >
              Submit for Review
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}