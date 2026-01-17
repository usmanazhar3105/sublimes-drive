/**
 * ADMIN OFFERS PAGE - ENHANCED WITH MULTIPLE IMAGES & BOOST FUNCTIONALITY
 * 
 * Features:
 * 1. ✅ Create Offer with multiple image upload
 * 2. ✅ Boost Offer to featured (separate tab)
 * 3. ✅ Manage all offers
 * 4. ✅ View analytics and redemptions
 * 5. ✅ Chinese car brands in examples
 */

import { useState, useEffect } from 'react';
import { 
  Plus, Search, Star, Sparkles, Image as ImageIcon,
  Calendar, Tag as TagIcon, Users, Upload, X, Eye,
  Edit, Trash2, TrendingUp, CheckCircle, XCircle, Gift
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { useOffers } from '../../src/hooks/usePromotionalOffers';
import { supabase } from '../../utils/supabase/client';
import { ImageWithFallback } from '../figma/ImageWithFallback';

const CATEGORIES = [
  'Car Wash',
  'Oil Change',
  'Tires',
  'Detailing',
  'Maintenance',
  'Parts',
  'Accessories',
  'Service',
  'Other'
];

export default function AdminOffersPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBoostModalOpen, setIsBoostModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const { offers, loading, refetch } = useOffers({});

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Car Wash',
    original_price: '',
    discounted_price: '',
    valid_until: '',
    max_redemptions: '100',
    terms: '',
    provider_name: '',
  });

  // Calculate discount percentage automatically
  const calculateDiscount = () => {
    const original = parseFloat(formData.original_price);
    const discounted = parseFloat(formData.discounted_price);
    
    if (original && discounted && original > discounted) {
      return Math.round(((original - discounted) / original) * 100);
    }
    return 0;
  };

  // Handle image upload (multiple images)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `offer-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('public-assets')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('public-assets')
          .getPublicUrl(filePath);

        return publicUrl;
      });

      const urls = await Promise.all(uploadPromises);
      setUploadedImages(prev => [...prev, ...urls]);
      toast.success(`${urls.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  // Remove uploaded image
  const removeImage = (url: string) => {
    setUploadedImages(prev => prev.filter(img => img !== url));
  };

  // Create offer
  const handleCreateOffer = async () => {
    if (!formData.title || !formData.discounted_price || !formData.valid_until) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (uploadedImages.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const discountPercent = calculateDiscount();

      const { error } = await supabase
        .from('offers')
        .insert({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          original_price: parseFloat(formData.original_price) || null,
          discounted_price: parseFloat(formData.discounted_price),
          discount_percent: discountPercent,
          valid_until: formData.valid_until,
          max_redemptions: parseInt(formData.max_redemptions),
          terms: formData.terms,
          provider_name: formData.provider_name,
          images: uploadedImages, // Multiple images array
          image_url: uploadedImages[0], // First image as primary
          created_by: user.id,
          is_featured: false,
          is_active: true
        });

      if (error) throw error;

      toast.success('Offer created successfully!');
      setIsCreateModalOpen(false);
      resetForm();
      refetch();
    } catch (error: any) {
      console.error('Error creating offer:', error);
      toast.error('Failed to create offer');
    }
  };

  // Boost offer to featured
  const handleBoostOffer = async (offerId: string) => {
    try {
      const { error } = await supabase
        .from('offers')
        .update({ is_featured: true })
        .eq('id', offerId);

      if (error) throw error;

      toast.success('Offer boosted to featured!');
      setIsBoostModalOpen(false);
      setSelectedOffer(null);
      refetch();
    } catch (error) {
      console.error('Error boosting offer:', error);
      toast.error('Failed to boost offer');
    }
  };

  // Unboost offer
  const handleUnboostOffer = async (offerId: string) => {
    try {
      const { error } = await supabase
        .from('offers')
        .update({ is_featured: false })
        .eq('id', offerId);

      if (error) throw error;

      toast.success('Offer removed from featured');
      refetch();
    } catch (error) {
      console.error('Error unboosting offer:', error);
      toast.error('Failed to unboost offer');
    }
  };

  // Delete offer
  const handleDeleteOffer = async (offerId: string) => {
    if (!confirm('Are you sure you want to delete this offer?')) return;

    try {
      const { error } = await supabase
        .from('offers')
        .delete()
        .eq('id', offerId);

      if (error) throw error;

      toast.success('Offer deleted successfully');
      refetch();
    } catch (error) {
      console.error('Error deleting offer:', error);
      toast.error('Failed to delete offer');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Car Wash',
      original_price: '',
      discounted_price: '',
      valid_until: '',
      max_redemptions: '100',
      terms: '',
      provider_name: '',
    });
    setUploadedImages([]);
  };

  const filteredOffers = offers.filter(offer =>
    offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    offer.provider_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const featuredOffers = filteredOffers.filter(o => o.is_featured);
  const activeOffers = filteredOffers.filter(o => o.is_active && !o.is_featured);

  return (
    <div className="p-6" style={{ background: '#0B1426', minHeight: '100vh' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#E8EAED' }}>
              <Gift className="w-8 h-8 inline mr-3" style={{ color: '#D4AF37' }} />
              Offers Management
            </h1>
            <p style={{ color: 'rgba(232, 234, 237, 0.7)' }}>
              Create, manage, and boost promotional offers
            </p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            style={{ background: '#D4AF37', color: '#0B1426' }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Offer
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'rgba(232, 234, 237, 0.5)' }} />
            <Input
              placeholder="Search offers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              style={{ 
                background: 'rgba(11, 20, 38, 0.6)', 
                borderColor: 'rgba(212, 175, 55, 0.2)',
                color: '#E8EAED'
              }}
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList style={{ background: 'rgba(11, 20, 38, 0.6)', borderColor: 'rgba(212, 175, 55, 0.2)' }}>
            <TabsTrigger value="all" style={{ color: '#E8EAED' }}>
              All Offers ({filteredOffers.length})
            </TabsTrigger>
            <TabsTrigger value="featured" style={{ color: '#E8EAED' }}>
              Featured ({featuredOffers.length})
            </TabsTrigger>
            <TabsTrigger value="boost" style={{ color: '#E8EAED' }}>
              <Sparkles className="w-4 h-4 mr-2" />
              Offer Boosting
            </TabsTrigger>
          </TabsList>

          {/* All Offers Tab */}
          <TabsContent value="all" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOffers.map(offer => (
                <OfferCard 
                  key={offer.id} 
                  offer={offer}
                  onBoost={() => {
                    setSelectedOffer(offer);
                    setIsBoostModalOpen(true);
                  }}
                  onUnboost={() => handleUnboostOffer(offer.id)}
                  onDelete={() => handleDeleteOffer(offer.id)}
                />
              ))}
            </div>
          </TabsContent>

          {/* Featured Offers Tab */}
          <TabsContent value="featured" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredOffers.map(offer => (
                <OfferCard 
                  key={offer.id} 
                  offer={offer}
                  onBoost={() => {}}
                  onUnboost={() => handleUnboostOffer(offer.id)}
                  onDelete={() => handleDeleteOffer(offer.id)}
                />
              ))}
            </div>
          </TabsContent>

          {/* Offer Boosting Tab */}
          <TabsContent value="boost" className="mt-6">
            <Card style={{ background: 'rgba(11, 20, 38, 0.6)', borderColor: 'rgba(212, 175, 55, 0.2)' }}>
              <CardHeader>
                <CardTitle style={{ color: '#E8EAED' }}>
                  <Sparkles className="w-5 h-5 inline mr-2" style={{ color: '#D4AF37' }} />
                  Boost Offers to Featured
                </CardTitle>
                <p className="text-sm" style={{ color: 'rgba(232, 234, 237, 0.7)' }}>
                  Select offers to promote in the featured carousel (max 4 recommended)
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeOffers.map(offer => (
                    <div
                      key={offer.id}
                      className="flex items-center justify-between p-4 rounded-lg"
                      style={{ background: 'rgba(212, 175, 55, 0.05)', border: '1px solid rgba(212, 175, 55, 0.2)' }}
                    >
                      <div className="flex items-center gap-4">
                        <ImageWithFallback
                          src={offer.images?.[0] || offer.image_url}
                          alt={offer.title}
                          className="w-16 h-16 rounded object-cover"
                        />
                        <div>
                          <h4 className="font-semibold" style={{ color: '#E8EAED' }}>
                            {offer.title}
                          </h4>
                          <p className="text-sm" style={{ color: 'rgba(232, 234, 237, 0.6)' }}>
                            {offer.category} • AED {offer.discounted_price}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleBoostOffer(offer.id)}
                        style={{ background: '#D4AF37', color: '#0B1426' }}
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Boost to Featured
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Offer Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent 
            className="max-w-3xl max-h-[90vh] overflow-y-auto"
            style={{ background: '#0B1426', borderColor: 'rgba(212, 175, 55, 0.3)' }}
          >
            <DialogHeader>
              <DialogTitle style={{ color: '#E8EAED' }}>
                Create New Offer
              </DialogTitle>
              <DialogDescription style={{ color: 'rgba(232, 234, 237, 0.7)' }}>
                Fill in the details for your promotional offer
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Title */}
              <div>
                <Label style={{ color: '#E8EAED' }}>Title *</Label>
                <Input
                  placeholder="e.g., 50% OFF Premium Car Wash - BYD, NIO, Xpeng"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ background: 'rgba(11, 20, 38, 0.6)', borderColor: 'rgba(212, 175, 55, 0.2)', color: '#E8EAED' }}
                />
              </div>

              {/* Description */}
              <div>
                <Label style={{ color: '#E8EAED' }}>Description *</Label>
                <Textarea
                  placeholder="Complete exterior and interior wash for all Chinese car brands..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  style={{ background: 'rgba(11, 20, 38, 0.6)', borderColor: 'rgba(212, 175, 55, 0.2)', color: '#E8EAED' }}
                />
              </div>

              {/* Category & Provider */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label style={{ color: '#E8EAED' }}>Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger style={{ background: 'rgba(11, 20, 38, 0.6)', borderColor: 'rgba(212, 175, 55, 0.2)', color: '#E8EAED' }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent style={{ background: '#0B1426', borderColor: 'rgba(212, 175, 55, 0.3)' }}>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat} style={{ color: '#E8EAED' }}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label style={{ color: '#E8EAED' }}>Provider Name</Label>
                  <Input
                    placeholder="e.g., Premium Auto Spa"
                    value={formData.provider_name}
                    onChange={(e) => setFormData({ ...formData, provider_name: e.target.value })}
                    style={{ background: 'rgba(11, 20, 38, 0.6)', borderColor: 'rgba(212, 175, 55, 0.2)', color: '#E8EAED' }}
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label style={{ color: '#E8EAED' }}>Original Price (AED)</Label>
                  <Input
                    type="number"
                    placeholder="100"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                    style={{ background: 'rgba(11, 20, 38, 0.6)', borderColor: 'rgba(212, 175, 55, 0.2)', color: '#E8EAED' }}
                  />
                </div>
                <div>
                  <Label style={{ color: '#E8EAED' }}>Offer Price (AED) *</Label>
                  <Input
                    type="number"
                    placeholder="50"
                    value={formData.discounted_price}
                    onChange={(e) => setFormData({ ...formData, discounted_price: e.target.value })}
                    style={{ background: 'rgba(11, 20, 38, 0.6)', borderColor: 'rgba(212, 175, 55, 0.2)', color: '#E8EAED' }}
                  />
                </div>
                <div>
                  <Label style={{ color: '#E8EAED' }}>Discount %</Label>
                  <Input
                    type="text"
                    value={calculateDiscount() ? `${calculateDiscount()}%` : ''}
                    disabled
                    style={{ background: 'rgba(11, 20, 38, 0.4)', borderColor: 'rgba(212, 175, 55, 0.2)', color: '#10b981' }}
                  />
                </div>
              </div>

              {/* Valid Until & Max Redemptions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label style={{ color: '#E8EAED' }}>Valid Until *</Label>
                  <Input
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                    style={{ background: 'rgba(11, 20, 38, 0.6)', borderColor: 'rgba(212, 175, 55, 0.2)', color: '#E8EAED' }}
                  />
                </div>
                <div>
                  <Label style={{ color: '#E8EAED' }}>Max Redemptions</Label>
                  <Input
                    type="number"
                    placeholder="100"
                    value={formData.max_redemptions}
                    onChange={(e) => setFormData({ ...formData, max_redemptions: e.target.value })}
                    style={{ background: 'rgba(11, 20, 38, 0.6)', borderColor: 'rgba(212, 175, 55, 0.2)', color: '#E8EAED' }}
                  />
                </div>
              </div>

              {/* Images Upload */}
              <div>
                <Label style={{ color: '#E8EAED' }}>Images * (Multiple allowed)</Label>
                <div 
                  className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-opacity-100 transition-all"
                  style={{ borderColor: 'rgba(212, 175, 55, 0.3)' }}
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  <input
                    id="image-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: '#D4AF37' }} />
                  <p style={{ color: '#E8EAED' }}>Click to upload images</p>
                  <p className="text-sm" style={{ color: 'rgba(232, 234, 237, 0.6)' }}>
                    PNG, JPG up to 10MB each
                  </p>
                </div>

                {/* Uploaded Images Preview */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-4 mt-4">
                    {uploadedImages.map((url, idx) => (
                      <div key={idx} className="relative group">
                        <img src={url} alt={`Upload ${idx + 1}`} className="w-full h-24 object-cover rounded" />
                        <button
                          onClick={() => removeImage(url)}
                          className="absolute top-1 right-1 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: '#ef4444' }}
                        >
                          <X className="w-4 h-4" style={{ color: '#fff' }} />
                        </button>
                        {idx === 0 && (
                          <Badge className="absolute bottom-1 left-1" style={{ background: '#D4AF37', color: '#0B1426' }}>
                            Primary
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Terms */}
              <div>
                <Label style={{ color: '#E8EAED' }}>What's Included (one per line)</Label>
                <Textarea
                  placeholder="Exterior wash & wax&#10;Interior vacuum&#10;Dashboard polish&#10;Tire shine"
                  value={formData.terms}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                  rows={4}
                  style={{ background: 'rgba(11, 20, 38, 0.6)', borderColor: 'rgba(212, 175, 55, 0.2)', color: '#E8EAED' }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  resetForm();
                }}
                style={{ borderColor: 'rgba(212, 175, 55, 0.3)', color: '#E8EAED' }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateOffer}
                disabled={uploading}
                style={{ background: '#D4AF37', color: '#0B1426' }}
              >
                {uploading ? 'Uploading...' : 'Create Offer'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Offer Card Component
function OfferCard({ 
  offer, 
  onBoost, 
  onUnboost, 
  onDelete 
}: { 
  offer: any;
  onBoost: () => void;
  onUnboost: () => void;
  onDelete: () => void;
}) {
  return (
    <Card
      className="overflow-hidden"
      style={{ background: 'rgba(11, 20, 38, 0.6)', borderColor: 'rgba(212, 175, 55, 0.2)' }}
    >
      <div className="relative h-48">
        <ImageWithFallback
          src={offer.images?.[0] || offer.image_url}
          alt={offer.title}
          className="w-full h-full object-cover"
        />
        {offer.is_featured && (
          <Badge className="absolute top-2 left-2" style={{ background: '#D4AF37', color: '#0B1426' }}>
            <Star className="w-3 h-3 mr-1 fill-current" />
            Featured
          </Badge>
        )}
        {offer.images?.length > 1 && (
          <Badge className="absolute top-2 right-2" style={{ background: '#3b82f6', color: '#fff' }}>
            <ImageIcon className="w-3 h-3 mr-1" />
            {offer.images.length} images
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold mb-2" style={{ color: '#E8EAED' }}>
          {offer.title}
        </h3>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xl" style={{ color: '#D4AF37' }}>
            AED {offer.discounted_price}
          </span>
          {offer.discount_percent && (
            <Badge style={{ background: '#10b981', color: '#fff' }}>
              {offer.discount_percent}% OFF
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm mb-3">
          <Users className="w-4 h-4" style={{ color: 'rgba(232, 234, 237, 0.5)' }} />
          <span style={{ color: 'rgba(232, 234, 237, 0.7)' }}>
            {offer.redemption_count || 0} claimed
          </span>
        </div>

        <div className="flex gap-2">
          {!offer.is_featured ? (
            <Button
              size="sm"
              onClick={onBoost}
              className="flex-1"
              style={{ background: '#D4AF37', color: '#0B1426' }}
            >
              <Star className="w-3 h-3 mr-1" />
              Boost
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={onUnboost}
              className="flex-1"
              variant="outline"
              style={{ borderColor: '#D4AF37', color: '#D4AF37' }}
            >
              <XCircle className="w-3 h-3 mr-1" />
              Unboost
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={onDelete}
            style={{ borderColor: '#ef4444', color: '#ef4444' }}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
