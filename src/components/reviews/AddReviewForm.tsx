/**
 * Add Review Form Component
 * Form to add or edit reviews
 */

import { useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { RatingStars } from './RatingStars';
import { X, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface AddReviewFormProps {
  onSubmit: (rating: number, title: string, content: string, images?: string[]) => Promise<void>;
  onCancel?: () => void;
  initialData?: {
    rating: number;
    title: string;
    content: string;
    images?: string[];
  };
  isEditing?: boolean;
}

export function AddReviewForm({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
}: AddReviewFormProps) {
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!content.trim()) {
      toast.error('Please write a review');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(rating, title, content, images.length > 0 ? images : undefined);
      
      // Reset form
      setRating(0);
      setTitle('');
      setContent('');
      setImages([]);
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Limit to 3 images
    if (images.length + files.length > 3) {
      toast.error('Maximum 3 images allowed');
      return;
    }

    setUploading(true);

    try {
      // In a real app, upload to storage (Supabase Storage, Cloudinary, etc.)
      // For now, we'll use FileReader to create data URLs
      const uploadPromises = Array.from(files).map(file => {
        return new Promise<string>((resolve, reject) => {
          // Check file size (max 5MB)
          if (file.size > 5 * 1024 * 1024) {
            reject(new Error('File size must be less than 5MB'));
            return;
          }

          // Check file type
          if (!file.type.startsWith('image/')) {
            reject(new Error('Only image files are allowed'));
            return;
          }

          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      const uploadedImages = await Promise.all(uploadPromises);
      setImages(prev => [...prev, ...uploadedImages]);
      toast.success('Images uploaded successfully');
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  }

  function removeImage(index: number) {
    setImages(prev => prev.filter((_, i) => i !== index));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Rating */}
      <div className="space-y-2">
        <Label>Rating *</Label>
        <div className="flex items-center gap-2">
          <RatingStars
            rating={rating}
            size="lg"
            interactive
            onChange={setRating}
          />
          {rating > 0 && (
            <span className="text-sm text-muted-foreground">
              {rating} out of 5
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title (optional)</Label>
        <Input
          id="title"
          placeholder="Summarize your experience"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
        />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Label htmlFor="content">Review *</Label>
        <Textarea
          id="content"
          placeholder="Share your experience..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          maxLength={1000}
          required
        />
        <p className="text-xs text-muted-foreground text-right">
          {content.length}/1000
        </p>
      </div>

      {/* Images */}
      <div className="space-y-2">
        <Label>Photos (optional, max 3)</Label>
        
        {/* Image Preview */}
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-2">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-24 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        {images.length < 3 && (
          <div>
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('image-upload')?.click()}
              disabled={uploading}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload Photos'}
            </Button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button
          type="submit"
          disabled={submitting || rating === 0 || !content.trim()}
          className="flex-1"
        >
          {submitting ? 'Submitting...' : isEditing ? 'Update Review' : 'Submit Review'}
        </Button>
        
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
