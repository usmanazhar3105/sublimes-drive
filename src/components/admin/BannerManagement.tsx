import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Save
} from 'lucide-react';
import { toast } from 'sonner';
import { getAllBanners, createBanner, updateBanner, deleteBanner, Banner } from '../../lib/bannerApi';

export function BannerManagement() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    cta_text: '',
    cta_url: '',
    locale: 'en',
    audience_roles: [] as string[],
    sort_order: 100,
    is_active: true,
    start_at: '',
    end_at: ''
  });

  // Fetch banners
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const allBanners = await getAllBanners();
        setBanners(allBanners);
      } catch (error) {
        console.error('Failed to fetch banners:', error);
        toast.error('Failed to fetch banners');
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const bannerData = {
        ...formData,
        audience_roles: formData.audience_roles,
        start_at: formData.start_at ? new Date(formData.start_at).toISOString() : null,
        end_at: formData.end_at ? new Date(formData.end_at).toISOString() : null,
      };

      if (editingBanner) {
        await updateBanner(editingBanner.id, bannerData);
        toast.success('Banner updated successfully');
        setIsEditOpen(false);
      } else {
        await createBanner(bannerData);
        toast.success('Banner created successfully');
        setIsCreateOpen(false);
      }

      // Refresh banners
      const updatedBanners = await getAllBanners();
      setBanners(updatedBanners);
      resetForm();
    } catch (error) {
      console.error('Failed to save banner:', error);
      toast.error('Failed to save banner');
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    
    try {
      await deleteBanner(id);
      toast.success('Banner deleted successfully');
      const updatedBanners = await getAllBanners();
      setBanners(updatedBanners);
    } catch (error) {
      console.error('Failed to delete banner:', error);
      toast.error('Failed to delete banner');
    }
  };

  // Handle edit
  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      cta_text: banner.cta_text || '',
      cta_url: banner.cta_url || '',
      locale: banner.locale,
      audience_roles: banner.audience_roles,
      sort_order: banner.sort_order,
      is_active: banner.is_active,
      start_at: banner.start_at ? new Date(banner.start_at).toISOString().slice(0, 16) : '',
      end_at: banner.end_at ? new Date(banner.end_at).toISOString().slice(0, 16) : ''
    });
    setIsEditOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      cta_text: '',
      cta_url: '',
      locale: 'en',
      audience_roles: [],
      sort_order: 100,
      is_active: true,
      start_at: '',
      end_at: ''
    });
    setEditingBanner(null);
  };

  // Handle audience role toggle
  const toggleAudienceRole = (role: string) => {
    setFormData(prev => ({
      ...prev,
      audience_roles: prev.audience_roles.includes(role)
        ? prev.audience_roles.filter(r => r !== role)
        : [...prev.audience_roles, role]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading banners...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Banner Management</h2>
          <p className="text-muted-foreground">Manage promotional banners for the home page</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Create Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Banner</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Banner title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="locale">Locale</Label>
                  <Select value={formData.locale} onValueChange={(value) => setFormData(prev => ({ ...prev, locale: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">Arabic</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="subtitle">Subtitle</Label>
                <Textarea
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="Banner subtitle"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cta_text">CTA Text</Label>
                  <Input
                    id="cta_text"
                    value={formData.cta_text}
                    onChange={(e) => setFormData(prev => ({ ...prev, cta_text: e.target.value }))}
                    placeholder="Button text"
                  />
                </div>
                <div>
                  <Label htmlFor="cta_url">CTA URL</Label>
                  <Input
                    id="cta_url"
                    value={formData.cta_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, cta_url: e.target.value }))}
                    placeholder="/marketplace"
                  />
                </div>
              </div>

              <div>
                <Label>Audience Roles</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['subscriber', 'carOwner', 'garageOwner', 'admin', 'editor'].map(role => (
                    <Button
                      key={role}
                      type="button"
                      variant={formData.audience_roles.includes(role) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleAudienceRole(role)}
                    >
                      {role}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="start_at">Start Date</Label>
                  <Input
                    id="start_at"
                    type="datetime-local"
                    value={formData.start_at}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_at: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="end_at">End Date</Label>
                  <Input
                    id="end_at"
                    type="datetime-local"
                    value={formData.end_at}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_at: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="w-4 h-4 mr-2" />
                  Create Banner
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Banners Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Banners ({banners.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Locale</TableHead>
                <TableHead>Audience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sort Order</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.map((banner) => (
                <TableRow key={banner.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{banner.title}</div>
                      <div className="text-sm text-muted-foreground">{banner.subtitle}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{banner.locale}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {banner.audience_roles.map(role => (
                        <Badge key={role} variant="secondary" className="text-xs">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {banner.is_active ? (
                        <Badge variant="default" className="bg-green-500">
                          <Eye className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <EyeOff className="w-3 h-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{banner.sort_order}</TableCell>
                  <TableCell>
                    {new Date(banner.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(banner)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(banner.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Banner</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Banner title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-locale">Locale</Label>
                <Select value={formData.locale} onValueChange={(value) => setFormData(prev => ({ ...prev, locale: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ar">Arabic</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-subtitle">Subtitle</Label>
              <Textarea
                id="edit-subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                placeholder="Banner subtitle"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-cta_text">CTA Text</Label>
                <Input
                  id="edit-cta_text"
                  value={formData.cta_text}
                  onChange={(e) => setFormData(prev => ({ ...prev, cta_text: e.target.value }))}
                  placeholder="Button text"
                />
              </div>
              <div>
                <Label htmlFor="edit-cta_url">CTA URL</Label>
                <Input
                  id="edit-cta_url"
                  value={formData.cta_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, cta_url: e.target.value }))}
                  placeholder="/marketplace"
                />
              </div>
            </div>

            <div>
              <Label>Audience Roles</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {['subscriber', 'carOwner', 'garageOwner', 'admin', 'editor'].map(role => (
                  <Button
                    key={role}
                    type="button"
                    variant={formData.audience_roles.includes(role) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleAudienceRole(role)}
                  >
                    {role}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-sort_order">Sort Order</Label>
                <Input
                  id="edit-sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-start_at">Start Date</Label>
                <Input
                  id="edit-start_at"
                  type="datetime-local"
                  value={formData.start_at}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_at: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-end_at">End Date</Label>
                <Input
                  id="edit-end_at"
                  type="datetime-local"
                  value={formData.end_at}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_at: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="edit-is_active">Active</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                Update Banner
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
