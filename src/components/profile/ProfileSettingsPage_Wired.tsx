/**
 * ProfileSettingsPage - Wired with Supabase Hooks
 * Uses: useProfile, useAnalytics
 */

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { User, Bell, Lock, Globe, Save, Camera, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useProfile, useAnalytics, useImageUpload } from '../../src/hooks';

interface ProfileSettingsPageProps {
  onNavigate?: (page: string) => void;
}

export function ProfileSettingsPage({ onNavigate: _onNavigate }: ProfileSettingsPageProps) {
  const { profile, updateProfile } = useProfile();
  const analytics = useAnalytics();
  const { uploadImage, uploading: _imageUploading } = useImageUpload();
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    display_name: '',
    username: '',
    bio: '',
    location: '',
    phone: '',
    email: '',
    avatar_url: '',
    cover_image: '',
  });

  useEffect(() => {
    analytics.trackPageView('/profile-settings');
  }, []);

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        username: profile.username || '',
        bio: profile.bio || '',
        location: profile.location || '',
        phone: profile.phone || '',
        email: profile.email || '',
        avatar_url: profile.avatar_url || '',
        cover_image: profile.cover_image || '',
      });
    }
  }, [profile]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { url: imageUrl } = await uploadImage(file, 'avatars', 'profile');
      if (imageUrl) {
        setFormData({ ...formData, avatar_url: imageUrl });
        // Update profile immediately
        await updateProfile({ avatar_url: imageUrl });
        toast.success('Avatar updated successfully');
        analytics.trackEvent('avatar_updated');
      }
    } catch (error) {
      toast.error('Failed to upload avatar');
      console.error('Avatar upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { url: imageUrl } = await uploadImage(file, 'covers', 'profile');
      if (imageUrl) {
        setFormData({ ...formData, cover_image: imageUrl });
        // Update profile immediately
        await updateProfile({ cover_image: imageUrl });
        toast.success('Cover image updated successfully');
        analytics.trackEvent('cover_image_updated');
      }
    } catch (error) {
      toast.error('Failed to upload cover image');
      console.error('Cover upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    const { error } = await updateProfile(formData);
    if (!error) {
      toast.success('Profile updated successfully');
      analytics.trackEvent('profile_updated');
    } else {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1426]">
      <div className="bg-[#0F1829] border-b border-[#1A2332]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl text-[#E8EAED] mb-2">Settings</h1>
          <p className="text-sm text-[#8B92A7]">Manage your account settings</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="profile">
          <TabsList className="bg-[#1A2332] border border-[#2A3342] mb-6">
            <TabsTrigger value="profile" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426]">
              <User size={16} className="mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426]">
              <Bell size={16} className="mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426]">
              <Lock size={16} className="mr-2" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="preferences" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426]">
              <Globe size={16} className="mr-2" />
              Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            {/* Cover Image Upload Card */}
            <Card className="bg-[#0F1829] border-[#1A2332] mb-6">
              <CardHeader>
                <CardTitle className="text-[#E8EAED]">Profile Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Cover Image */}
                <div>
                  <Label className="text-[#E8EAED] mb-2 block">Cover Image</Label>
                  <div className="relative h-32 sm:h-40 bg-gradient-to-br from-[#1A2332] via-[#2A3342] to-[#1A2332] rounded-lg overflow-hidden border border-[#2A3342]">
                    {formData.cover_image ? (
                      <img 
                        src={formData.cover_image} 
                        alt="Cover Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Upload className="h-8 w-8 text-[#8B92A7]" />
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={uploading}
                      className="absolute top-2 right-2 bg-[#0F1829]/90 backdrop-blur-sm border-[#2A3342] text-[#E8EAED] hover:bg-[#1A2332]"
                      onClick={() => coverInputRef.current?.click()}
                    >
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                      ) : (
                        <Camera className="h-4 w-4 mr-1.5" />
                      )}
                      {uploading ? 'Uploading...' : 'Change Cover'}
                    </Button>
                    <input
                      ref={coverInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleCoverUpload}
                    />
                  </div>
                  <p className="text-xs text-[#8B92A7] mt-2">Recommended: 1500x500px, max 5MB</p>
                </div>

                {/* Avatar Image */}
                <div>
                  <Label className="text-[#E8EAED] mb-2 block">Profile Picture</Label>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-24 w-24 border-4 border-[#D4AF37]">
                      <AvatarImage src={formData.avatar_url || undefined} />
                      <AvatarFallback className="bg-[#1A2332] text-[#D4AF37] text-2xl">
                        {formData.display_name?.charAt(0)?.toUpperCase() || <User />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={uploading}
                        className="bg-[#1A2332] border-[#2A3342] text-[#E8EAED] hover:bg-[#2A3342] mb-2"
                        onClick={() => avatarInputRef.current?.click()}
                      >
                        {uploading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                        ) : (
                          <Camera className="h-4 w-4 mr-1.5" />
                        )}
                        {uploading ? 'Uploading...' : 'Change Avatar'}
                      </Button>
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                      <p className="text-xs text-[#8B92A7]">Recommended: 400x400px, max 2MB</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#0F1829] border-[#1A2332]">
              <CardHeader>
                <CardTitle className="text-[#E8EAED]">Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-[#E8EAED]">Display Name</Label>
                  <Input
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    className="bg-[#1A2332] border-[#2A3342] text-[#E8EAED]"
                    placeholder="Enter your display name"
                  />
                </div>

                <div>
                  <Label className="text-[#E8EAED]">Username</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B92A7]">@</span>
                    <Input
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value.replace('@', '') })}
                      className="bg-[#1A2332] border-[#2A3342] text-[#E8EAED] pl-8"
                      placeholder="yourhandle"
                    />
                  </div>
                  <p className="text-xs text-[#8B92A7] mt-1">Your unique username for profile URL</p>
                </div>

                <div>
                  <Label className="text-[#E8EAED]">Bio</Label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="bg-[#1A2332] border-[#2A3342] text-[#E8EAED]"
                    rows={4}
                    placeholder="Tell us about yourself and your ride..."
                    maxLength={500}
                  />
                  <p className="text-xs text-[#8B92A7] mt-1">{formData.bio.length}/500 characters</p>
                </div>

                <div>
                  <Label className="text-[#E8EAED]">Location</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="bg-[#1A2332] border-[#2A3342] text-[#E8EAED]"
                    placeholder="Dubai, UAE"
                  />
                </div>

                <div>
                  <Label className="text-[#E8EAED]">Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-[#1A2332] border-[#2A3342] text-[#E8EAED]"
                    placeholder="+971 50 123 4567"
                  />
                </div>

                <Button onClick={handleSave} className="w-full bg-[#D4AF37] text-[#0B1426]">
                  <Save size={20} className="mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="bg-[#0F1829] border-[#1A2332]">
              <CardHeader>
                <CardTitle className="text-[#E8EAED]">Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {['Email Notifications', 'Push Notifications', 'SMS Notifications', 'Marketing Emails'].map((item) => (
                  <div key={item} className="flex items-center justify-between p-3 bg-[#1A2332] rounded-lg">
                    <span className="text-[#E8EAED]">{item}</span>
                    <Switch />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
