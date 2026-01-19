import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
// Badge not used
import { Card, CardContent } from './ui/card';
import { 
  MapPin, 
  Camera,
  Info,
  Users
} from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { useCreateEvent } from '../hooks';
import { useUploadEventMedia } from '../../AI2SQL/hooks/useUploadEventMedia';

interface CreateMeetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate?: (meetupData: any) => void;
}

export function CreateMeetupModal({ isOpen, onClose, onCreate }: CreateMeetupModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [meetupData, setMeetupData] = useState({
    title: '',
    description: '',
    emirate: '',
    location: '',
    coordinates: '',
    photo: null as File | null,
    autoExpire: true
  });
  const uploadEventMedia = useUploadEventMedia();
  const { createEvent } = useCreateEvent();

  const emirates = [
    'Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Fujairah', 'Ras Al Khaimah', 'Umm Al Quwain'
  ];

  const handleInputChange = (field: string, value: string | boolean | File | null) => {
    setMeetupData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && file.size <= 10 * 1024 * 1024) { // 10MB limit
        handleInputChange('photo', file);
      } else {
        alert('Please select an image file under 10MB');
      }
    };
    input.click();
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          handleInputChange('coordinates', `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get current location. Please enter manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const handleCreate = async () => {
    // Validate required fields
    if (!meetupData.title.trim()) {
      alert('Please enter a meetup title');
      return;
    }
    if (!meetupData.description.trim()) {
      alert('Please enter a description');
      return;
    }
    if (!meetupData.emirate) {
      alert('Please select an emirate');
      return;
    }
    if (!meetupData.location.trim()) {
      alert('Please enter a location');
      return;
    }

    setIsLoading(true);
    try {
      // Upload cover photo if provided
      let coverUrl: string | undefined;
      if (meetupData.photo) {
        const { data: auth } = await supabase.auth.getUser();
        const userId = auth.user?.id;
        if (!userId) {
          alert('Please sign in to upload an image');
          setIsLoading(false);
          return;
        }
        coverUrl = await uploadEventMedia(meetupData.photo, userId, 'draft');
      }

      // Create event row
      const fullAddress = meetupData.location ? `${meetupData.emirate ? meetupData.emirate + ' - ' : ''}${meetupData.location}` : '';
      const created = await createEvent({
        title: meetupData.title,
        description: meetupData.description,
        event_type: 'meetup',
        location: fullAddress, // Required NOT NULL field
        address: fullAddress, // New address field
        start_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now for instant meetups
        cover_image_url: coverUrl,
      } as any);

      onCreate?.(created);
      onClose();

      // Reset form
      setMeetupData({
        title: '',
        description: '',
        emirate: '',
        location: '',
        coordinates: '',
        photo: null,
        autoExpire: true
      });
    } catch (error) {
      console.error('Error creating meetup:', error);
      alert('Failed to create meetup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-[var(--sublimes-gold)]" />
            Create Meetup
          </DialogTitle>
          <DialogDescription>
            Create an instant meetup to connect with nearby car enthusiasts. Your meetup will auto-expire in 24 hours to nearby car enthusiasts.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Meetup Title */}
          <div className="space-y-2">
            <Label htmlFor="meetup-title" className="flex items-center gap-2">
              Meetup Title *
            </Label>
            <Input
              id="meetup-title"
              placeholder="e.g., Coffee & Cars at Mall of Emirates"
              value={meetupData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">
              {meetupData.title.length}/100 characters
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2">
              Description *
            </Label>
            <Textarea
              id="description"
              placeholder="Describe your meetup idea, what you'd like to do, etc."
              value={meetupData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {meetupData.description.length}/500 characters
            </p>
          </div>

          {/* Location Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Emirate */}
            <div className="space-y-2">
              <Label htmlFor="emirate">Emirate *</Label>
              <Select value={meetupData.emirate} onValueChange={(value) => handleInputChange('emirate', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select emirate" />
                </SelectTrigger>
                <SelectContent>
                  {emirates.map(emirate => (
                    <SelectItem key={emirate} value={emirate}>{emirate}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location Pin */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location Pin
              </Label>
              <Button
                type="button"
                variant="outline"
                onClick={getCurrentLocation}
                className="w-full justify-start"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Get Current Location
              </Button>
            </div>
          </div>

          {/* Specific Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Specific Location *</Label>
            <Input
              id="location"
              placeholder="e.g., Mall of Emirates Parking Level 2"
              value={meetupData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
            />
          </div>

          {/* Coordinates (auto-filled or manual) */}
          {meetupData.coordinates && (
            <div className="space-y-2">
              <Label htmlFor="coordinates">Coordinates</Label>
              <Input
                id="coordinates"
                value={meetupData.coordinates}
                onChange={(e) => handleInputChange('coordinates', e.target.value)}
                placeholder="25.1200, 55.3966"
                readOnly
                className="bg-muted"
              />
            </div>
          )}

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label>Photo (Optional)</Label>
            <div 
              className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-[var(--sublimes-gold)]/50 transition-colors"
              onClick={handlePhotoUpload}
            >
              {meetupData.photo ? (
                <div className="space-y-2">
                  <img 
                    src={URL.createObjectURL(meetupData.photo)} 
                    alt="Meetup preview" 
                    className="max-h-32 mx-auto rounded"
                  />
                  <p className="text-sm text-muted-foreground">{meetupData.photo.name}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInputChange('photo', null);
                    }}
                  >
                    Remove Photo
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Camera className="h-8 w-8 text-muted-foreground mx-auto" />
                  <div>
                    <p className="text-sm font-medium">Drop an image here or click to upload</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Important Guidelines */}
          <Card className="border-blue-200 bg-blue-50/10">
            <CardContent className="p-4">
              <h3 className="font-semibold text-blue-600 mb-2 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Important Guidelines
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Your meetup will auto-expire in 24 hours</li>
                <li>• No contact sharing allowed (phone, email, social handles)</li>
                <li>• Use comments for coordination, not direct messaging</li>
                <li>• Keep it car-related and respectful</li>
              </ul>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleCreate} 
              disabled={isLoading}
              className="flex-1 bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/80"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Users className="h-4 w-4 mr-2" />
                  Create Meetup
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}