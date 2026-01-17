import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Image, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Upload,
  Settings,
  ImageIcon,
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../utils/supabase/client';
import { useUploadBrandAsset } from '../../../AI2SQL/hooks/useUploadBrandAsset';

// Types
interface Banner {
  id: string;
  title: string;
  subtitle: string;
  cta_text: string;
  cta_url: string;
  image_url_web: string;
  image_url_mobile: string;
  video_url_web?: string;
  video_url_mobile?: string;
  media_type: 'image' | 'video';
  locale: string;
  audience_roles: string[];
  sort_order: number;
  start_at: string | null;
  end_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

interface BannerFormData {
  title: string;
  subtitle: string;
  cta_text: string;
  cta_url: string;
  image_url_web: string;
  image_url_mobile: string;
  video_url_web: string;
  video_url_mobile: string;
  media_type: 'image' | 'video';
  locale: string;
  audience_roles: string[];
  sort_order: number;
  start_at: string;
  end_at: string;
  is_active: boolean;
}

export function AdminBannerManagement() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewBanner, setPreviewBanner] = useState<Banner | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<{[key: string]: boolean}>({});
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});

  const [formData, setFormData] = useState<BannerFormData>({
    title: '',
    subtitle: '',
    cta_text: '',
    cta_url: '',
    image_url_web: '',
    image_url_mobile: '',
    video_url_web: '',
    video_url_mobile: '',
    media_type: 'image',
    locale: 'en',
    audience_roles: [],
    sort_order: 0,
    start_at: '',
    end_at: '',
    is_active: true
  });

  // Load banners
  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/banners');
      if (response.ok) {
        const data = await response.json();
        setBanners(data);
      } else {
        throw new Error('Failed to load banners');
      }
    } catch (error) {
      console.error('Error loading banners:', error);
      toast.error('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  // Create banner
  const handleCreateBanner = async () => {
    try {
      const response = await fetch('/api/admin/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('Banner created successfully');
        setIsCreateOpen(false);
        resetForm();
        loadBanners();
      } else {
        throw new Error('Failed to create banner');
      }
    } catch (error) {
      console.error('Error creating banner:', error);
      toast.error('Failed to create banner');
    }
  };

  // Update banner
  const handleUpdateBanner = async () => {
    if (!editingBanner) return;

    try {
      const response = await fetch(`/api/admin/banners/${editingBanner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('Banner updated successfully');
        setIsEditOpen(false);
        setEditingBanner(null);
        resetForm();
        loadBanners();
      } else {
        throw new Error('Failed to update banner');
      }
    } catch (error) {
      console.error('Error updating banner:', error);
      toast.error('Failed to update banner');
    }
  };

  // Delete banner
  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
      const response = await fetch(`/api/admin/banners/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Banner deleted successfully');
        loadBanners();
      } else {
        throw new Error('Failed to delete banner');
      }
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error('Failed to delete banner');
    }
  };

  // Toggle banner active status
  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/banners/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive })
      });

      if (response.ok) {
        toast.success(`Banner ${!isActive ? 'activated' : 'deactivated'} successfully`);
        loadBanners();
      } else {
        throw new Error('Failed to update banner status');
      }
    } catch (error) {
      console.error('Error updating banner status:', error);
      toast.error('Failed to update banner status');
    }
  };

  // Update sort order
  const handleUpdateSortOrder = async (id: string, newOrder: number) => {
    try {
      const response = await fetch(`/api/admin/banners/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sort_order: newOrder })
      });

      if (response.ok) {
        toast.success('Sort order updated successfully');
        loadBanners();
      } else {
        throw new Error('Failed to update sort order');
      }
    } catch (error) {
      console.error('Error updating sort order:', error);
      toast.error('Failed to update sort order');
    }
  };

  // Open edit dialog
  const openEditDialog = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle,
      cta_text: banner.cta_text,
      cta_url: banner.cta_url,
      image_url_web: banner.image_url_web,
      image_url_mobile: banner.image_url_mobile,
      video_url_web: banner.video_url_web || '',
      video_url_mobile: banner.video_url_mobile || '',
      media_type: banner.media_type || 'image',
      locale: banner.locale,
      audience_roles: banner.audience_roles,
      sort_order: banner.sort_order,
      start_at: banner.start_at ? banner.start_at.split('T')[0] : '',
      end_at: banner.end_at ? banner.end_at.split('T')[0] : '',
      is_active: banner.is_active
    });
    setIsEditOpen(true);
  };

  // Open preview dialog
  const openPreviewDialog = (banner: Banner) => {
    setPreviewBanner(banner);
    setIsPreviewOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      cta_text: '',
      cta_url: '',
      image_url_web: '',
      image_url_mobile: '',
      video_url_web: '',
      video_url_mobile: '',
      media_type: 'image',
      locale: 'en',
      audience_roles: [],
      sort_order: 0,
      start_at: '',
      end_at: '',
      is_active: true
    });
  };

  const uploadBrandAsset = useUploadBrandAsset();

  // File upload handler -> system-settings bucket
  const handleFileUpload = async (file: File, field: string) => {
    if (!file) return;

    // Validate file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      toast.error('Please upload an image or video file');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploadingFiles(prev => ({ ...prev, [field]: true }));
    setUploadProgress(prev => ({ ...prev, [field]: 0 }));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) throw new Error('Sign in required to upload');

      const url = await uploadBrandAsset(file, userId, 'banner');

      // Update form data with the uploaded URL
      setFormData(prev => ({
        ...prev,
        [field]: url
      }));

      // If it's a video, also set media type
      if (isVideo) {
        setFormData(prev => ({
          ...prev,
          media_type: 'video'
        }));
      }

      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploadingFiles(prev => ({ ...prev, [field]: false }));
      setUploadProgress(prev => ({ ...prev, [field]: 0 }));
    }
  };

  // Handle audience role change
  const handleAudienceRoleChange = (role: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        audience_roles: [...formData.audience_roles, role]
      });
    } else {
      setFormData({
        ...formData,
        audience_roles: formData.audience_roles.filter(r => r !== role)
      });
    }
  };

  // Get status badge
  const getStatusBadge = (banner: Banner) => {
    const now = new Date();
    const startDate = banner.start_at ? new Date(banner.start_at) : null;
    const endDate = banner.end_at ? new Date(banner.end_at) : null;

    if (!banner.is_active) {
      return <Badge variant="secondary">Inactive</Badge>;
    }

    if (startDate && now < startDate) {
      return <Badge variant="outline">Scheduled</Badge>;
    }

    if (endDate && now > endDate) {
      return <Badge variant="destructive">Expired</Badge>;
    }

    return <Badge variant="default">Active</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--sublimes-gold)]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--sublimes-light-text)]">Banner Management</h1>
          <p className="text-gray-400">Manage home page banner slides and settings</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsCreateOpen(true)} className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/90">
            <Plus className="w-4 h-4 mr-2" />
            Create Banner
          </Button>
          <Button onClick={loadBanners} variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Banner Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Banners</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{banners.length}</div>
            <p className="text-xs text-muted-foreground">
              {banners.filter(b => b.is_active).length} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Banners</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{banners.filter(b => b.is_active).length}</div>
            <p className="text-xs text-muted-foreground">
              Currently showing
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {banners.filter(b => b.start_at && new Date(b.start_at) > new Date()).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Future banners
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {banners.filter(b => b.end_at && new Date(b.end_at) < new Date()).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Past banners
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Banners Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Image className="w-5 h-5 mr-2" />
            Banner Slides
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Locale</TableHead>
                <TableHead>Audience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sort Order</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.map((banner) => (
                <TableRow key={banner.id}>
                  <TableCell>
                    <div className="w-16 h-10 bg-gray-100 rounded overflow-hidden">
                      {banner.image_url_web ? (
                        <img 
                          src={banner.image_url_web} 
                          alt={banner.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{banner.title}</div>
                      <div className="text-sm text-gray-500">{banner.subtitle}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{banner.locale}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {banner.audience_roles.map((role) => (
                        <Badge key={role} variant="secondary" className="text-xs">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(banner)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateSortOrder(banner.id, banner.sort_order - 1)}
                        disabled={banner.sort_order <= 1}
                      >
                        <ArrowUp className="w-3 h-3" />
                      </Button>
                      <span className="text-sm font-medium">{banner.sort_order}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateSortOrder(banner.id, banner.sort_order + 1)}
                      >
                        <ArrowDown className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openPreviewDialog(banner)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(banner)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleActive(banner.id, banner.is_active)}
                      >
                        {banner.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteBanner(banner.id)}
                        className="text-red-500 hover:text-red-700"
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

      {/* Create Banner Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Banner</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="banner-title">Title</Label>
                <Input
                  id="banner-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter banner title"
                />
              </div>
              <div>
                <Label htmlFor="banner-locale">Locale</Label>
                <Select onValueChange={(value) => setFormData({ ...formData, locale: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select locale" />
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
              <Label htmlFor="banner-subtitle">Subtitle</Label>
              <Textarea
                id="banner-subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Enter banner subtitle"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="banner-cta-text">CTA Text</Label>
                <Input
                  id="banner-cta-text"
                  value={formData.cta_text}
                  onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                  placeholder="e.g., Learn More"
                />
              </div>
              <div>
                <Label htmlFor="banner-cta-url">CTA URL</Label>
                <Input
                  id="banner-cta-url"
                  value={formData.cta_url}
                  onChange={(e) => setFormData({ ...formData, cta_url: e.target.value })}
                  placeholder="e.g., /marketplace"
                />
              </div>
            </div>

            {/* Media Type Selection */}
            <div>
              <Label>Media Type</Label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="media_type"
                    value="image"
                    checked={formData.media_type === 'image'}
                    onChange={(e) => setFormData({ ...formData, media_type: e.target.value as 'image' | 'video' })}
                  />
                  <span>Image</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="media_type"
                    value="video"
                    checked={formData.media_type === 'video'}
                    onChange={(e) => setFormData({ ...formData, media_type: e.target.value as 'image' | 'video' })}
                  />
                  <span>Video</span>
                </label>
              </div>
            </div>

            {/* Web Media Upload */}
            <div>
              <Label htmlFor="web_media">Web {formData.media_type === 'image' ? 'Image' : 'Video'}</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="web_media"
                  value={formData.media_type === 'image' ? formData.image_url_web : formData.video_url_web}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    [formData.media_type === 'image' ? 'image_url_web' : 'video_url_web']: e.target.value 
                  })}
                  placeholder={`https://example.com/${formData.media_type === 'image' ? 'image' : 'video'}.${formData.media_type === 'image' ? 'jpg' : 'mp4'}`}
                />
                <input
                  type="file"
                  id="web_media_upload"
                  accept={formData.media_type === 'image' ? 'image/*' : 'video/*'}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file, formData.media_type === 'image' ? 'image_url_web' : 'video_url_web');
                    }
                  }}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('web_media_upload')?.click()}
                  disabled={uploadingFiles[formData.media_type === 'image' ? 'image_url_web' : 'video_url_web']}
                >
                  {uploadingFiles[formData.media_type === 'image' ? 'image_url_web' : 'video_url_web'] ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
              </div>
              {uploadProgress[formData.media_type === 'image' ? 'image_url_web' : 'video_url_web'] > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress[formData.media_type === 'image' ? 'image_url_web' : 'video_url_web']}%` }}
                  ></div>
                </div>
              )}
            </div>

            {/* Mobile Media Upload */}
            <div>
              <Label htmlFor="mobile_media">Mobile {formData.media_type === 'image' ? 'Image' : 'Video'}</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="mobile_media"
                  value={formData.media_type === 'image' ? formData.image_url_mobile : formData.video_url_mobile}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    [formData.media_type === 'image' ? 'image_url_mobile' : 'video_url_mobile']: e.target.value 
                  })}
                  placeholder={`https://example.com/${formData.media_type === 'image' ? 'image' : 'video'}-mobile.${formData.media_type === 'image' ? 'jpg' : 'mp4'}`}
                />
                <input
                  type="file"
                  id="mobile_media_upload"
                  accept={formData.media_type === 'image' ? 'image/*' : 'video/*'}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file, formData.media_type === 'image' ? 'image_url_mobile' : 'video_url_mobile');
                    }
                  }}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('mobile_media_upload')?.click()}
                  disabled={uploadingFiles[formData.media_type === 'image' ? 'image_url_mobile' : 'video_url_mobile']}
                >
                  {uploadingFiles[formData.media_type === 'image' ? 'image_url_mobile' : 'video_url_mobile'] ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
              </div>
              {uploadProgress[formData.media_type === 'image' ? 'image_url_mobile' : 'video_url_mobile'] > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress[formData.media_type === 'image' ? 'image_url_mobile' : 'video_url_mobile']}%` }}
                  ></div>
                </div>
              )}
            </div>

            <div>
              <Label>Audience Roles</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {['admin', 'editor', 'garage_owner', 'car_owner', 'subscriber'].map((role) => (
                  <div key={role} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`audience-${role}`}
                      checked={formData.audience_roles.includes(role)}
                      onChange={(e) => handleAudienceRoleChange(role, e.target.checked)}
                    />
                    <Label htmlFor={`audience-${role}`} className="text-sm">
                      {role.replace('_', ' ')}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="banner-sort-order">Sort Order</Label>
                <Input
                  id="banner-sort-order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="banner-start-date">Start Date</Label>
                <Input
                  id="banner-start-date"
                  type="date"
                  value={formData.start_at}
                  onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="banner-end-date">End Date</Label>
                <Input
                  id="banner-end-date"
                  type="date"
                  value={formData.end_at}
                  onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="banner-active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="banner-active">Active</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateBanner} className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/90">
                Create Banner
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Banner Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Banner</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-banner-title">Title</Label>
                <Input
                  id="edit-banner-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter banner title"
                />
              </div>
              <div>
                <Label htmlFor="edit-banner-locale">Locale</Label>
                <Select value={formData.locale} onValueChange={(value) => setFormData({ ...formData, locale: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select locale" />
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
              <Label htmlFor="edit-banner-subtitle">Subtitle</Label>
              <Textarea
                id="edit-banner-subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Enter banner subtitle"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-banner-cta-text">CTA Text</Label>
                <Input
                  id="edit-banner-cta-text"
                  value={formData.cta_text}
                  onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                  placeholder="e.g., Learn More"
                />
              </div>
              <div>
                <Label htmlFor="edit-banner-cta-url">CTA URL</Label>
                <Input
                  id="edit-banner-cta-url"
                  value={formData.cta_url}
                  onChange={(e) => setFormData({ ...formData, cta_url: e.target.value })}
                  placeholder="e.g., /marketplace"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-banner-image-web">Web Image URL</Label>
                <Input
                  id="edit-banner-image-web"
                  value={formData.image_url_web}
                  onChange={(e) => setFormData({ ...formData, image_url_web: e.target.value })}
                  placeholder="Enter web image URL"
                />
              </div>
              <div>
                <Label htmlFor="edit-banner-image-mobile">Mobile Image URL</Label>
                <Input
                  id="edit-banner-image-mobile"
                  value={formData.image_url_mobile}
                  onChange={(e) => setFormData({ ...formData, image_url_mobile: e.target.value })}
                  placeholder="Enter mobile image URL"
                />
              </div>
            </div>

            <div>
              <Label>Audience Roles</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {['admin', 'editor', 'garage_owner', 'car_owner', 'subscriber'].map((role) => (
                  <div key={role} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`edit-audience-${role}`}
                      checked={formData.audience_roles.includes(role)}
                      onChange={(e) => handleAudienceRoleChange(role, e.target.checked)}
                    />
                    <Label htmlFor={`edit-audience-${role}`} className="text-sm">
                      {role.replace('_', ' ')}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-banner-sort-order">Sort Order</Label>
                <Input
                  id="edit-banner-sort-order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="edit-banner-start-date">Start Date</Label>
                <Input
                  id="edit-banner-start-date"
                  type="date"
                  value={formData.start_at}
                  onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-banner-end-date">End Date</Label>
                <Input
                  id="edit-banner-end-date"
                  type="date"
                  value={formData.end_at}
                  onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-banner-active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="edit-banner-active">Active</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateBanner} className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/90">
                Update Banner
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Banner Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Banner Preview</DialogTitle>
          </DialogHeader>
          {previewBanner && (
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">{previewBanner.title}</h3>
                  <p className="text-gray-600 mb-4">{previewBanner.subtitle}</p>
                  {previewBanner.cta_text && (
                    <Button className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/90">
                      {previewBanner.cta_text}
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Web Image</Label>
                  {previewBanner.image_url_web ? (
                    <img 
                      src={previewBanner.image_url_web} 
                      alt="Web preview"
                      className="w-full h-32 object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-gray-500">No image</span>
                    </div>
                  )}
                </div>
                <div>
                  <Label>Mobile Image</Label>
                  {previewBanner.image_url_mobile ? (
                    <img 
                      src={previewBanner.image_url_mobile} 
                      alt="Mobile preview"
                      className="w-full h-32 object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-gray-500">No image</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Locale</Label>
                  <Badge variant="outline">{previewBanner.locale}</Badge>
                </div>
                <div>
                  <Label>Status</Label>
                  {getStatusBadge(previewBanner)}
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
