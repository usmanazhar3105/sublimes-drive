/**
 * CREATE OFFER MODAL - UPGRADED
 * 
 * Features:
 * - Multiple image upload
 * - Category selection
 * - Availability settings
 * - Pricing with auto-discount calculation
 * - Chinese car brands only
 */

import { useState } from 'react';
import { X, Upload, Calendar, Tag, DollarSign, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';

interface CreateOfferModalUpgradedProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateOffer: (offerData: any) => void;
}

const CATEGORIES = [
  'Oil Change',
  'AC Service',
  'Suspension',
  'Glass Service',
  'Tyres',
  'Brake Service',
  'Electrical',
  'Interior Cleaning',
  'Detailing',
  'Engine Service',
  'Bodywork',
  'Waxing',
  'Battery',
  'Transmission',
  'Paint Service',
  'Polishing',
];

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

export function CreateOfferModalUpgraded({ isOpen, onClose, onCreateOffer }: CreateOfferModalUpgradedProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    originalPrice: '',
    offerPrice: '',
    validFrom: '',
    validUntil: '',
    maxRedemptions: '100',
    availability: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: true,
      weekends: true,
      publicHolidays: false,
    },
    categories: [] as string[],
    images: [] as string[],
  });

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [currentImageUrl, setCurrentImageUrl] = useState('');

  const calculateDiscount = () => {
    const original = parseFloat(formData.originalPrice);
    const offer = parseFloat(formData.offerPrice);
    if (original && offer && original > 0) {
      return Math.round(((original - offer) / original) * 100);
    }
    return 0;
  };

  const handleAddImage = () => {
    if (currentImageUrl.trim()) {
      setImageUrls([...imageUrls, currentImageUrl.trim()]);
      setCurrentImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleToggleCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleToggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: !prev.availability[day as keyof typeof prev.availability]
      }
    }));
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.title || !formData.description || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.originalPrice || !formData.offerPrice) {
      toast.error('Please set both original and offer prices');
      return;
    }

    if (parseFloat(formData.offerPrice) >= parseFloat(formData.originalPrice)) {
      toast.error('Offer price must be less than original price');
      return;
    }

    if (!formData.validFrom || !formData.validUntil) {
      toast.error('Please set valid from and valid until dates');
      return;
    }

    const discountPercentage = calculateDiscount();

    const offerData = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      originalPrice: parseFloat(formData.originalPrice),
      offerPrice: parseFloat(formData.offerPrice),
      discountPercentage,
      validFrom: new Date(formData.validFrom),
      validUntil: new Date(formData.validUntil),
      availability: formData.availability,
      categories: formData.categories.length > 0 ? formData.categories : [formData.category],
      images: imageUrls,
      maxRedemptions: parseInt(formData.maxRedemptions) || 100,
    };

    onCreateOffer(offerData);
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      category: '',
      originalPrice: '',
      offerPrice: '',
      validFrom: '',
      validUntil: '',
      maxRedemptions: '100',
      availability: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true,
        weekends: true,
        publicHolidays: false,
      },
      categories: [],
      images: [],
    });
    setImageUrls([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
        <DialogHeader>
          <DialogTitle className="text-[var(--sublimes-gold)] text-2xl">Create New Offer</DialogTitle>
          <DialogDescription className="text-gray-400">
            Create a promotional offer for car services. All examples use Chinese car brands only.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[var(--sublimes-light-text)] flex items-center">
              <Tag className="w-5 h-5 mr-2 text-[var(--sublimes-gold)]" />
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-[var(--sublimes-light-text)]">Offer Title *</Label>
                <Input
                  placeholder="e.g., 50% OFF Oil Change for BYD & NIO"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-2 bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                />
              </div>

              <div>
                <Label className="text-[var(--sublimes-light-text)]">Primary Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger className="mt-2 bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-[var(--sublimes-light-text)]">Description *</Label>
              <Textarea
                placeholder="e.g., Premium oil change service for all Chinese car brands including BYD, NIO, Xpeng, Li Auto, and Geely..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="mt-2 bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[var(--sublimes-light-text)] flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-[var(--sublimes-gold)]" />
              Pricing & Discount
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-[var(--sublimes-light-text)]">Original Price (AED) *</Label>
                <Input
                  type="number"
                  placeholder="100"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  className="mt-2 bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                />
              </div>

              <div>
                <Label className="text-[var(--sublimes-light-text)]">Offer Price (AED) *</Label>
                <Input
                  type="number"
                  placeholder="50"
                  value={formData.offerPrice}
                  onChange={(e) => setFormData({ ...formData, offerPrice: e.target.value })}
                  className="mt-2 bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                />
              </div>

              <div>
                <Label className="text-[var(--sublimes-light-text)]">Discount</Label>
                <div className="mt-2 h-10 flex items-center justify-center bg-[var(--sublimes-gold)]/10 border border-[var(--sublimes-gold)]/20 rounded-md">
                  <span className="text-2xl font-bold text-[var(--sublimes-gold)]">
                    {calculateDiscount()}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Validity Period */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[var(--sublimes-light-text)] flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-[var(--sublimes-gold)]" />
              Validity Period
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-[var(--sublimes-light-text)]">Valid From *</Label>
                <Input
                  type="datetime-local"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  className="mt-2 bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                />
              </div>

              <div>
                <Label className="text-[var(--sublimes-light-text)]">Valid Until *</Label>
                <Input
                  type="datetime-local"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  className="mt-2 bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                />
              </div>

              <div>
                <Label className="text-[var(--sublimes-light-text)]">Max Redemptions</Label>
                <Input
                  type="number"
                  placeholder="100"
                  value={formData.maxRedemptions}
                  onChange={(e) => setFormData({ ...formData, maxRedemptions: e.target.value })}
                  className="mt-2 bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                />
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[var(--sublimes-light-text)]">Availability</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={day.key}
                    checked={formData.availability[day.key as keyof typeof formData.availability] as boolean}
                    onCheckedChange={() => handleToggleDay(day.key)}
                  />
                  <Label htmlFor={day.key} className="text-[var(--sublimes-light-text)] cursor-pointer">
                    {day.label}
                  </Label>
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="weekends"
                  checked={formData.availability.weekends}
                  onCheckedChange={() => handleToggleDay('weekends')}
                />
                <Label htmlFor="weekends" className="text-[var(--sublimes-light-text)] cursor-pointer">
                  Valid on Weekends
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="publicHolidays"
                  checked={formData.availability.publicHolidays}
                  onCheckedChange={() => handleToggleDay('publicHolidays')}
                />
                <Label htmlFor="publicHolidays" className="text-[var(--sublimes-light-text)] cursor-pointer">
                  Valid on Public Holidays
                </Label>
              </div>
            </div>
          </div>

          {/* Additional Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[var(--sublimes-light-text)]">Additional Categories (Optional)</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <Badge
                  key={cat}
                  variant={formData.categories.includes(cat) ? 'default' : 'outline'}
                  className={`cursor-pointer ${
                    formData.categories.includes(cat)
                      ? 'bg-[var(--sublimes-gold)] text-black'
                      : 'text-gray-400 hover:bg-gray-700'
                  }`}
                  onClick={() => handleToggleCategory(cat)}
                >
                  {cat}
                </Badge>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[var(--sublimes-light-text)] flex items-center">
              <ImageIcon className="w-5 h-5 mr-2 text-[var(--sublimes-gold)]" />
              Images (Optional)
            </h3>

            <div className="flex items-center space-x-2">
              <Input
                placeholder="Enter image URL"
                value={currentImageUrl}
                onChange={(e) => setCurrentImageUrl(e.target.value)}
                className="flex-1 bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
              />
              <Button
                type="button"
                onClick={handleAddImage}
                className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>

            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-video bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg overflow-hidden">
                      <img src={url} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-[var(--sublimes-border)]">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Offer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
