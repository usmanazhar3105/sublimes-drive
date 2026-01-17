/**
 * CreateCarListingPage_Wired - Database-connected Create Car Listing page
 * Uses: useListings, useAnalytics, useImageUpload
 */

import { useState, useEffect } from 'react';
import { Car, Plus, Loader2, Upload } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ImageUpload } from '../ui/ImageUpload';
import { toast } from 'sonner';
import { useListings, useAnalytics } from '../../src/hooks';

interface CreateCarListingPageProps {
  onNavigate?: (page: string) => void;
}

export function CreateCarListingPage({ onNavigate }: CreateCarListingPageProps) {
  const [submitting, setSubmitting] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    make: '',
    model: '',
    year: '',
    mileage: '',
    location: '',
  });

  const { createListing } = useListings();
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.trackPageView('/create-car-listing');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (imageUrls.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }
    
    setSubmitting(true);

    const { error } = await createListing({
      ...formData,
      category: 'vehicles',
      price: parseFloat(formData.price) || 0,
      year: parseInt(formData.year) || new Date().getFullYear(),
      mileage: parseInt(formData.mileage) || 0,
      images: imageUrls,
    });

    setSubmitting(false);

    if (!error) {
      toast.success('🚗 Car listing created successfully!');
      analytics.trackEvent('listing_created', {
        category: 'vehicles',
        make: formData.make,
        model: formData.model,
      });
      onNavigate?.('my-listings');
    } else {
      toast.error('Failed to create listing');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1426]">
      <div className="bg-[#0F1829] border-b border-[#1A2332]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl text-[#E8EAED]" style={{ fontWeight: 600 }}>
            Create Car Listing
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-[#0F1829] border-[#1A2332]">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label className="text-[#E8EAED]">Title *</Label>
                <Input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                  placeholder="e.g., BYD Seal 2024"
                />
              </div>

              <div>
                <Label className="text-[#E8EAED]">Description *</Label>
                <Textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#E8EAED]">Make *</Label>
                  <Input
                    required
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                  />
                </div>
                <div>
                  <Label className="text-[#E8EAED]">Model *</Label>
                  <Input
                    required
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-[#E8EAED]">Year *</Label>
                  <Input
                    required
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                  />
                </div>
                <div>
                  <Label className="text-[#E8EAED]">Price (AED) *</Label>
                  <Input
                    required
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                  />
                </div>
                <div>
                  <Label className="text-[#E8EAED]">Mileage (km) *</Label>
                  <Input
                    required
                    type="number"
                    value={formData.mileage}
                    onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                    className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                  />
                </div>
              </div>

              <div>
                <Label className="text-[#E8EAED]">Location *</Label>
                <Select
                  required
                  value={formData.location}
                  onValueChange={(value) => setFormData({ ...formData, location: value })}
                >
                  <SelectTrigger className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0F1829] border-[#1A2332]">
                    <SelectItem value="Dubai" className="text-[#E8EAED]">Dubai</SelectItem>
                    <SelectItem value="Abu Dhabi" className="text-[#E8EAED]">Abu Dhabi</SelectItem>
                    <SelectItem value="Sharjah" className="text-[#E8EAED]">Sharjah</SelectItem>
                    <SelectItem value="Ajman" className="text-[#E8EAED]">Ajman</SelectItem>
                    <SelectItem value="Ras Al Khaimah" className="text-[#E8EAED]">Ras Al Khaimah</SelectItem>
                    <SelectItem value="Fujairah" className="text-[#E8EAED]">Fujairah</SelectItem>
                    <SelectItem value="Umm Al Quwain" className="text-[#E8EAED]">Umm Al Quwain</SelectItem>
                    <SelectItem value="Overseas" className="text-[#E8EAED]">Overseas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-[#E8EAED] mb-2 block">Vehicle Images *</Label>
                <ImageUpload
                  onImagesUploaded={setImageUrls}
                  maxImages={10}
                  folder="listings/vehicles"
                  existingImages={imageUrls}
                />
              </div>

              <Button
                type="submit"
                disabled={submitting || imageUrls.length === 0}
                className="w-full bg-[#D4AF37] text-[#0B1426] hover:bg-[#C4A037]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" size={20} />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2" size={20} />
                    Create Listing
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
