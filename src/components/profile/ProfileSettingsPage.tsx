import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { ArrowLeft, User, Bell, Shield, Globe, Camera, Save } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { useProfile } from '../../src/hooks';
import { toast } from 'sonner';
import { supabase } from '../../utils/supabase/client';
import { useUploadProfileImage } from '../../../AI2SQL/hooks/useUploadProfileImage';

interface ProfileSettingsPageProps {
  onNavigate: (page: string) => void;
}

export function ProfileSettingsPage({ onNavigate }: ProfileSettingsPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { profile, loading, updateProfile } = useProfile();
  const uploadProfileImage = useUploadProfileImage();
  const [avatarUploading, setAvatarUploading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    location: ''
  });

  // Load profile data when available
  useEffect(() => {
    if (profile) {
      // Parse display_name into first and last name
      const nameParts = (profile.display_name || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      setProfileData({
        firstName,
        lastName,
        email: profile.email || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        location: profile.location || ''
      });
    }
  }, [profile]);

  const [notificationSettings, setNotificationSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    communityUpdates: true,
    repairUpdates: true,
    meetupReminders: true
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisible: true,
    allowMessages: true,
    showPhone: false,
    showEmail: false,
    defaultAnonymous: false
  });

  const [appSettings, setAppSettings] = useState({
    language: 'english',
    darkMode: true,
    autoPlay: true,
    dataOptimized: false
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Combine first and last name into display_name
      const display_name = `${profileData.firstName} ${profileData.lastName}`.trim();
      
      // Update profile in database
      const { error } = await updateProfile({
        display_name,
        phone: profileData.phone,
        bio: profileData.bio,
        location: profileData.location,
      });

      if (error) {
        toast.error('Failed to update settings');
        console.error('Error updating settings:', error);
      } else {
        toast.success('Settings saved successfully!');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border z-10">
        <div className="flex items-center p-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onNavigate('profile')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-lg font-semibold ml-4">Profile Settings</h1>
          <div className="ml-auto">
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4 space-y-6 pb-20">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your personal information and profile details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Picture */}
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={profile?.avatar_url || '/placeholder-avatar.jpg'} />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div>
                <input
                  id="avatar-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      setAvatarUploading(true);
                      const { data: { session } } = await supabase.auth.getSession();
                      const userId = session?.user?.id;
                      if (!userId) {
                        toast.error('Please sign in to upload');
                        return;
                      }
                      const url = await uploadProfileImage(file, userId);
                      // Persist to profile
                      const { error } = await updateProfile({ avatar_url: url } as any);
                      if (error) throw error;
                      toast.success('Profile photo updated');
                    } catch (err) {
                      toast.error('Failed to update photo');
                    } finally {
                      setAvatarUploading(false);
                      // reset input
                      try { (e.target as HTMLInputElement).value = ''; } catch {}
                    }
                  }}
                />
                <Button variant="outline" size="sm" onClick={() => document.getElementById('avatar-input')?.click()} disabled={avatarUploading}>
                  <Camera className="w-4 h-4 mr-2" />
                  {avatarUploading ? 'Uploading...' : 'Change Photo'}
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG up to 5MB
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="City, Country"
                value={profileData.location}
                onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell others about yourself and your automotive interests"
                value={profileData.bio}
                onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Notifications
            </CardTitle>
            <CardDescription>
              Choose how you want to be notified about activities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="pushNotifications">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about activities on your phone
                  </p>
                </div>
                <Switch
                  id="pushNotifications"
                  checked={notificationSettings.pushNotifications}
                  onCheckedChange={(checked) => 
                    setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive important updates via email
                  </p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => 
                    setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="smsNotifications">SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get SMS for urgent notifications
                  </p>
                </div>
                <Switch
                  id="smsNotifications"
                  checked={notificationSettings.smsNotifications}
                  onCheckedChange={(checked) => 
                    setNotificationSettings(prev => ({ ...prev, smsNotifications: checked }))
                  }
                />
              </div>

              <Separator />

              <h4 className="font-medium">Content Notifications</h4>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="communityUpdates">Community Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    New posts and comments on your content
                  </p>
                </div>
                <Switch
                  id="communityUpdates"
                  checked={notificationSettings.communityUpdates}
                  onCheckedChange={(checked) => 
                    setNotificationSettings(prev => ({ ...prev, communityUpdates: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="repairUpdates">Repair & Marketplace</Label>
                  <p className="text-sm text-muted-foreground">
                    Updates on your repair requests and listings
                  </p>
                </div>
                <Switch
                  id="repairUpdates"
                  checked={notificationSettings.repairUpdates}
                  onCheckedChange={(checked) => 
                    setNotificationSettings(prev => ({ ...prev, repairUpdates: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="meetupReminders">Event Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Reminders for events and meetups you're attending
                  </p>
                </div>
                <Switch
                  id="meetupReminders"
                  checked={notificationSettings.meetupReminders}
                  onCheckedChange={(checked) => 
                    setNotificationSettings(prev => ({ ...prev, meetupReminders: checked }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Privacy & Security
            </CardTitle>
            <CardDescription>
              Control your privacy and security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="profileVisible">Profile Visibility</Label>
                  <p className="text-sm text-muted-foreground">
                    Make your profile visible to other users
                  </p>
                </div>
                <Switch
                  id="profileVisible"
                  checked={privacySettings.profileVisible}
                  onCheckedChange={(checked) => 
                    setPrivacySettings(prev => ({ ...prev, profileVisible: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allowMessages">Allow Messages</Label>
                  <p className="text-sm text-muted-foreground">
                    Let other users send you direct messages
                  </p>
                </div>
                <Switch
                  id="allowMessages"
                  checked={privacySettings.allowMessages}
                  onCheckedChange={(checked) => 
                    setPrivacySettings(prev => ({ ...prev, allowMessages: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="defaultAnonymous">Default Anonymous for Repairs</Label>
                  <p className="text-sm text-muted-foreground">
                    Post repair requests anonymously by default
                  </p>
                </div>
                <Switch
                  id="defaultAnonymous"
                  checked={privacySettings.defaultAnonymous}
                  onCheckedChange={(checked) => 
                    setPrivacySettings(prev => ({ ...prev, defaultAnonymous: checked }))
                  }
                />
              </div>

              <Separator />

              <h4 className="font-medium">Contact Information Visibility</h4>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="showPhone">Show Phone Number</Label>
                  <p className="text-sm text-muted-foreground">
                    Display your phone number on your profile
                  </p>
                </div>
                <Switch
                  id="showPhone"
                  checked={privacySettings.showPhone}
                  onCheckedChange={(checked) => 
                    setPrivacySettings(prev => ({ ...prev, showPhone: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="showEmail">Show Email Address</Label>
                  <p className="text-sm text-muted-foreground">
                    Display your email address on your profile
                  </p>
                </div>
                <Switch
                  id="showEmail"
                  checked={privacySettings.showEmail}
                  onCheckedChange={(checked) => 
                    setPrivacySettings(prev => ({ ...prev, showEmail: checked }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* App Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              App Settings
            </CardTitle>
            <CardDescription>
              Customize your app experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={appSettings.language} onValueChange={(value) => setAppSettings(prev => ({ ...prev, language: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="arabic">العربية (Arabic)</SelectItem>
                    <SelectItem value="chinese">中文 (Chinese)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="darkMode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Use dark theme throughout the app
                  </p>
                </div>
                <Switch
                  id="darkMode"
                  checked={appSettings.darkMode}
                  onCheckedChange={(checked) => 
                    setAppSettings(prev => ({ ...prev, darkMode: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoPlay">Auto-play Videos</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically play videos in feeds
                  </p>
                </div>
                <Switch
                  id="autoPlay"
                  checked={appSettings.autoPlay}
                  onCheckedChange={(checked) => 
                    setAppSettings(prev => ({ ...prev, autoPlay: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dataOptimized">Data Optimized Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Reduce data usage for slower connections
                  </p>
                </div>
                <Switch
                  id="dataOptimized"
                  checked={appSettings.dataOptimized}
                  onCheckedChange={(checked) => 
                    setAppSettings(prev => ({ ...prev, dataOptimized: checked }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible actions that affect your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full">
              Download My Data
            </Button>
            <Button variant="outline" className="w-full">
              Deactivate Account
            </Button>
            <Button variant="destructive" className="w-full">
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}