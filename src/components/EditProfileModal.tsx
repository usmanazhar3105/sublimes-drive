import { useState, useEffect } from 'react';
import { X, Camera, Save, User, Mail, Phone, MapPin, Calendar, Edit2, Upload } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { useProfile } from '../hooks';
import { toast } from 'sonner';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (profileData: any) => void;
}

export function EditProfileModal({ isOpen, onClose, onSave }: EditProfileModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { profile, loading, updateProfile } = useProfile();
  
  // Initialize with current user data from database
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    emirate: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    avatar: '',
    coverImage: '',
    // Car preferences
    drivingExperience: '',
    carOwnershipStatus: ''
  });

  // Update form when profile data is loaded
  useEffect(() => {
    if (profile) {
      // Parse display_name into first and last name if needed
      const nameParts = (profile.display_name || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      setProfileData({
        firstName,
        lastName,
        username: profile.username || '',
        email: profile.email || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        location: profile.location || '',
        emirate: profile.location || '',
        dateOfBirth: '',
        gender: '',
        nationality: '',
        avatar: profile.avatar_url || '',
        coverImage: '',
        drivingExperience: '',
        carOwnershipStatus: ''
      });
    }
  }, [profile]);

  const emirates = [
    'Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Fujairah', 'Ras Al Khaimah', 'Umm Al Quwain'
  ];

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };



  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Combine first and last name into display_name
      const display_name = `${profileData.firstName} ${profileData.lastName}`.trim();
      
      // Update profile in database
      const { error } = await updateProfile({
        display_name,
        username: profileData.username,
        phone: profileData.phone,
        bio: profileData.bio,
        location: profileData.location,
      });

      if (error) {
        toast.error('Failed to update profile');
        console.error('Error updating profile:', error);
      } else {
        toast.success('Profile updated successfully');
        onSave?.(profileData);
        onClose();
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (type: 'avatar' | 'cover') => {
    // In a real app, this would open a file picker and upload to storage
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        setProfileData(prev => ({
          ...prev,
          [type === 'avatar' ? 'avatar' : 'coverImage']: previewUrl
        }));
      }
    };
    input.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit2 className="h-5 w-5" />
            Edit Profile
          </DialogTitle>
          <DialogDescription>
            Update your profile information, upload new photos, and manage your car preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Images */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profile Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cover Image */}
              <div className="relative h-32 rounded-lg overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600">
                <img 
                  src={profileData.coverImage} 
                  alt="Cover" 
                  className="w-full h-full object-cover opacity-70"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => handleImageUpload('cover')}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Change Cover
                </Button>
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profileData.avatar} />
                    <AvatarFallback>AH</AvatarFallback>
                  </Avatar>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full p-0"
                    onClick={() => handleImageUpload('avatar')}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  <h3 className="font-medium">Profile Picture</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload a new profile picture (JPG, PNG, max 5MB)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={profileData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={profileData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter your last name"
                />
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={profileData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Enter your username"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <Label htmlFor="emirate">Emirate</Label>
                <Select value={profileData.emirate} onValueChange={(value) => handleInputChange('emirate', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your emirate" />
                  </SelectTrigger>
                  <SelectContent>
                    {emirates.map(emirate => (
                      <SelectItem key={emirate} value={emirate}>{emirate}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={profileData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select value={profileData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Bio</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={profileData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell us about yourself and your car passion..."
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {profileData.bio.length}/500 characters
              </p>
            </CardContent>
          </Card>

          {/* Car Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Car Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="drivingExperience">Driving Experience</Label>
                <Select value={profileData.drivingExperience} onValueChange={(value) => handleInputChange('drivingExperience', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your driving experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-1 years">0-1 years</SelectItem>
                    <SelectItem value="1-3 years">1-3 years</SelectItem>
                    <SelectItem value="3-5 years">3-5 years</SelectItem>
                    <SelectItem value="5-10 years">5-10 years</SelectItem>
                    <SelectItem value="10+ years">10+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="carOwnershipStatus">Car Ownership Status</Label>
                <Select value={profileData.carOwnershipStatus} onValueChange={(value) => handleInputChange('carOwnershipStatus', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your car ownership status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Car Owner</SelectItem>
                    <SelectItem value="looking">Looking to Buy</SelectItem>
                    <SelectItem value="enthusiast">Enthusiast (No Car)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isLoading}
              className="flex-1 bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/80"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}