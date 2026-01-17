/**
 * BannerManager - Admin component for managing homepage banners
 * Full CRUD operations for banner slider system
 */

import { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Save,
  X,
  Upload,
  MoveUp,
  MoveDown,
  Loader2
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { toast } from 'sonner';
import { supabase } from '../../utils/supabase/client';

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  cta_label: string;
  cta_link: string;
  image_url: string;
  is_active: boolean;
  order_index?: number; // Optional - may not exist in database yet
  created_at?: string;
  updated_at?: string;
}

export function BannerManager() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState<Partial<Banner>>({
    title: '',
    subtitle: '',
    cta_label: '',
    cta_link: '',
    image_url: '',
    is_active: true,
    // order_index removed - optional field
  });
  const [saving, setSaving] = useState(false);

  // Use singleton Supabase client instance (already imported)
  // No need to create a new client here

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('created_at', { ascending: false }); // Use created_at instead of order_index

      if (error) {
        // Handle column missing error gracefully
        if (error.code === '42703') {
          console.warn('⚠️ Banners table missing order_index column. Using created_at for ordering.');
          console.warn('⚠️ Run the SQL fix in Supabase to add order_index column.');
        } else {
          throw error;
        }
      }

      setBanners(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast.error('Failed to load banners');
      setBanners([]);
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      subtitle: '',
      cta_label: 'Learn More',
      cta_link: '/',
      image_url: '',
      is_active: true,
      // order_index: banners.length + 1, // Removed - optional field
    });
    setIsModalOpen(true);
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData(banner);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.image_url) {
      toast.error('Title and image URL are required');
      return;
    }

    setSaving(true);

    try {
      if (editingBanner) {
        // Update existing banner
        const { error } = await supabase
          .from('banners')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingBanner.id);

        if (error) throw error;

        toast.success('Banner updated successfully');
      } else {
        // Create new banner
        const { error } = await supabase
          .from('banners')
          .insert([formData]);

        if (error) throw error;

        toast.success('Banner created successfully');
      }

      setIsModalOpen(false);
      fetchBanners();
    } catch (error: any) {
      console.error('Error saving banner:', error);
      toast.error(error.message || 'Failed to save banner');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Banner deleted successfully');
      fetchBanners();
    } catch (error: any) {
      console.error('Error deleting banner:', error);
      toast.error('Failed to delete banner');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('banners')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Banner ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchBanners();
    } catch (error: any) {
      console.error('Error toggling banner status:', error);
      toast.error('Failed to update banner status');
    }
  };

  const handleReorder = async (bannerId: string, direction: 'up' | 'down') => {
    const currentIndex = banners.findIndex(b => b.id === bannerId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= banners.length) return;

    const reorderedBanners = [...banners];
    const [movedBanner] = reorderedBanners.splice(currentIndex, 1);
    reorderedBanners.splice(newIndex, 0, movedBanner);

    // Update order_index for all affected banners
    try {
      const updates = reorderedBanners.map((banner, index) => ({
        id: banner.id,
        order_index: index + 1,
      }));

      for (const update of updates) {
        await supabase
          .from('banners')
          .update({ order_index: update.order_index })
          .eq('id', update.id);
      }

      toast.success('Banner reordered');
      fetchBanners();
    } catch (error) {
      console.error('Error reordering banners:', error);
      toast.error('Failed to reorder banners');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-[#D4AF37]" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-[#E8EAED] mb-1" style={{ fontWeight: 600 }}>
            Banner Manager
          </h2>
          <p className="text-sm text-[#8B92A7]">
            Manage homepage banner slider - shown at the top of the home page
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-[#D4AF37] hover:bg-[#C19B2E] text-[#0B1426]"
        >
          <Plus size={20} className="mr-2" />
          Create Banner
        </Button>
      </div>

      {/* Banners Table */}
      <Card className="bg-[#0F1829] border-[#1A2332]">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-[#1A2332] hover:bg-transparent">
                <TableHead className="text-[#8B92A7]">Preview</TableHead>
                <TableHead className="text-[#8B92A7]">Title</TableHead>
                <TableHead className="text-[#8B92A7]">CTA</TableHead>
                <TableHead className="text-[#8B92A7]">Order</TableHead>
                <TableHead className="text-[#8B92A7]">Status</TableHead>
                <TableHead className="text-[#8B92A7] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-[#8B92A7] py-12">
                    <ImageIcon className="mx-auto mb-3 opacity-50" size={48} />
                    <p>No banners yet. Create your first banner to get started!</p>
                  </TableCell>
                </TableRow>
              ) : (
                banners.map((banner, index) => (
                  <TableRow key={banner.id} className="border-[#1A2332]">
                    <TableCell>
                      <div className="w-24 h-12 rounded overflow-hidden bg-[#1A2332]">
                        <img
                          src={banner.image_url}
                          alt={banner.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-[#E8EAED] font-medium">{banner.title}</p>
                        <p className="text-xs text-[#8B92A7] truncate max-w-xs">
                          {banner.subtitle}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-[#8B92A7]">
                        {banner.cta_label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReorder(banner.id, 'up')}
                          disabled={index === 0}
                          className="h-6 w-6 p-0"
                        >
                          <MoveUp size={14} />
                        </Button>
                        <span className="text-sm text-[#E8EAED] w-8 text-center">
                          {banner.order_index}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReorder(banner.id, 'down')}
                          disabled={index === banners.length - 1}
                          className="h-6 w-6 p-0"
                        >
                          <MoveDown size={14} />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(banner.id, banner.is_active)}
                        className="gap-2"
                      >
                        {banner.is_active ? (
                          <>
                            <Eye size={16} className="text-green-500" />
                            <span className="text-green-500">Active</span>
                          </>
                        ) : (
                          <>
                            <EyeOff size={16} className="text-gray-500" />
                            <span className="text-gray-500">Inactive</span>
                          </>
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(banner)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(banner.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#0F1829] border-[#1A2332] text-[#E8EAED] max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingBanner ? 'Edit Banner' : 'Create New Banner'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Title */}
            <div>
              <Label className="text-[#E8EAED]">Title *</Label>
              <Input
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Welcome to Sublimes Drive"
                className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
              />
            </div>

            {/* Subtitle */}
            <div>
              <Label className="text-[#E8EAED]">Subtitle</Label>
              <Textarea
                value={formData.subtitle || ''}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="The #1 Chinese Car Community in UAE"
                className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                rows={2}
              />
            </div>

            {/* CTA Label & Link */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[#E8EAED]">CTA Label</Label>
                <Input
                  value={formData.cta_label || ''}
                  onChange={(e) => setFormData({ ...formData, cta_label: e.target.value })}
                  placeholder="Learn More"
                  className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                />
              </div>
              <div>
                <Label className="text-[#E8EAED]">CTA Link</Label>
                <Input
                  value={formData.cta_link || ''}
                  onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                  placeholder="/marketplace"
                  className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                />
              </div>
            </div>

            {/* Image URL */}
            <div>
              <Label className="text-[#E8EAED]">Image URL *</Label>
              <Input
                value={formData.image_url || ''}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
              />
              <p className="text-xs text-[#8B92A7] mt-1">
                Recommended: 1200x400px, WebP format, ~200KB
              </p>
            </div>

            {/* Preview */}
            {formData.image_url && (
              <div>
                <Label className="text-[#E8EAED] mb-2 block">Preview</Label>
                <div className="relative aspect-[16/5] rounded-xl overflow-hidden">
                  <img
                    src={formData.image_url}
                    alt="Banner preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 via-purple-900/80 to-fuchsia-900/70" />
                  <div className="absolute inset-0 p-6 flex flex-col justify-center max-w-2xl">
                    <h3 className="text-2xl text-white mb-2" style={{ fontWeight: 700 }}>
                      {formData.title || 'Banner Title'}
                    </h3>
                    <p className="text-white/90 mb-4">
                      {formData.subtitle || 'Banner subtitle goes here'}
                    </p>
                    <div className="inline-block bg-[#D4AF37] text-[#0B1426] px-4 py-2 rounded-lg w-fit">
                      {formData.cta_label || 'Learn More'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Active Toggle */}
            <div className="flex items-center justify-between p-4 bg-[#0B1426] rounded-lg border border-[#1A2332]">
              <div>
                <Label className="text-[#E8EAED]">Active Status</Label>
                <p className="text-xs text-[#8B92A7]">
                  Only active banners are shown on the homepage
                </p>
              </div>
              <Switch
                checked={formData.is_active || false}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="border-[#1A2332] text-[#E8EAED]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#D4AF37] hover:bg-[#C19B2E] text-[#0B1426]"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={16} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  {editingBanner ? 'Update Banner' : 'Create Banner'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
