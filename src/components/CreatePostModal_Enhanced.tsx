import { useState } from 'react';
import { X, Image as ImageIcon, Video, Smile, MapPin, Tag, Send, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { useImageUpload } from '../hooks';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CreatePostModalEnhancedProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    avatar: string;
    role: string;
  };
  onPostCreated?: (post: any) => void;
}

export function CreatePostModalEnhanced({
  isOpen,
  onClose,
  user,
  onPostCreated,
}: CreatePostModalEnhancedProps) {
  const [postText, setPostText] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [location, setLocation] = useState('');
  const [uploading, setUploading] = useState(false);

  const {
    uploadedUrls: uploadedImages = [],
    progress: uploadProgress = [],
    uploading: isUploading,
    uploadImage,
    deleteImage: removeImage,
  } = useImageUpload();

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file size (10MB max - matches hook's MAX_FILE_SIZE)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 10MB`);
        continue;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        continue;
      }

      await uploadImage(file, 'posts', 'community');
    }
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    
    const newTag = tagInput.trim().toLowerCase().replace(/^#/, '');
    
    if (tags.includes(newTag)) {
      toast.error('Tag already added');
      return;
    }

    if (tags.length >= 5) {
      toast.error('Maximum 5 tags allowed');
      return;
    }

    setTags([...tags, newTag]);
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handlePost = async () => {
    if (!postText.trim() && uploadedImages.length === 0) {
      toast.error('Please add some content or images');
      return;
    }

    setUploading(true);

    try {
      // Here you would call your API to create the post
      const newPost = {
        id: Date.now().toString(),
        content: postText,
        images: uploadedImages,
        tags,
        location,
        created_at: new Date().toISOString(),
        user: {
          name: user.name,
          avatar: user.avatar,
          role: user.role,
        },
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('Post created successfully!');
      onPostCreated?.(newPost);
      handleClose();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setPostText('');
    setTags([]);
    setTagInput('');
    setLocation('');
    onClose();
  };

  const charLimit = 2000;
  const remainingChars = charLimit - postText.length;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#1A1F2E] border-[#2A3441] text-[#E8EAED] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#E8EAED] flex items-center justify-between">
            <span>Create Post</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8 text-[#8A92A6] hover:text-[#E8EAED]"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* User Info */}
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-[#D4AF37]/20">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-[#D4AF37]/10 text-[#D4AF37]">
                {user.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-[#E8EAED]">{user.name}</p>
              <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-xs">
                {user.role}
              </Badge>
            </div>
          </div>

          {/* Post Text */}
          <div>
            <Textarea
              placeholder="What's on your mind?"
              value={postText}
              onChange={(e) => setPostText(e.target.value.slice(0, charLimit))}
              className="min-h-[150px] bg-[#0B1426] border-[#2A3441] text-[#E8EAED] placeholder:text-[#8A92A6] resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-[#8A92A6]">
                {remainingChars} characters remaining
              </p>
              {postText.length > charLimit - 50 && (
                <Badge
                  className={
                    remainingChars < 0
                      ? 'bg-red-500/10 text-red-500 border-red-500/20'
                      : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                  }
                >
                  {remainingChars < 0 ? 'Limit exceeded' : 'Almost full'}
                </Badge>
              )}
            </div>
          </div>

          {/* Uploaded Images */}
          {uploadedImages.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {uploadedImages.map((image, index) => (
                <div key={index} className="relative aspect-video rounded-lg overflow-hidden group">
                  <ImageWithFallback
                    src={image}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeImage(image)}
                    className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-black/80 rounded-full transition-colors"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && uploadProgress.length > 0 && (
            <div className="bg-[#0B1426] rounded-lg p-4 border border-[#2A3441] space-y-2">
              {uploadProgress.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-[#8A92A6]">{item.fileName}</span>
                    <span className="text-sm text-[#D4AF37]">
                      {item.status === 'complete' ? '✓' : item.status === 'error' ? '✗' : `${item.progress}%`}
                    </span>
                  </div>
                  <div className="h-2 bg-[#2A3441] rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        item.status === 'error' ? 'bg-red-500' : 'bg-[#D4AF37]'
                      }`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  className="bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20"
                >
                  #{tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 hover:text-[#D4AF37]/70"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Add Tag */}
          <div className="flex gap-2">
            <Input
              placeholder="Add tag (e.g., bmw, dubai)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              className="flex-1 bg-[#0B1426] border-[#2A3441] text-[#E8EAED]"
              disabled={tags.length >= 5}
            />
            <Button
              onClick={handleAddTag}
              disabled={!tagInput.trim() || tags.length >= 5}
              variant="outline"
              className="border-[#2A3441] text-[#E8EAED] hover:bg-[#2A3441]"
            >
              <Tag className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location" className="text-[#8A92A6]">
              Location (optional)
            </Label>
            <div className="relative mt-2">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-[#8A92A6]" />
              <Input
                id="location"
                placeholder="Add location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10 bg-[#0B1426] border-[#2A3441] text-[#E8EAED]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-[#2A3441]">
            <div className="flex gap-2">
              <label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={isUploading || uploadedImages.length >= 4}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-[#8A92A6] hover:text-[#E8EAED]"
                  disabled={isUploading || uploadedImages.length >= 4}
                  onClick={() => {
                    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
                    input?.click();
                  }}
                >
                  <ImageIcon className="h-5 w-5" />
                </Button>
              </label>
              <Button
                variant="ghost"
                size="icon"
                className="text-[#8A92A6] hover:text-[#E8EAED]"
                disabled
              >
                <Video className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-[#8A92A6] hover:text-[#E8EAED]"
                disabled
              >
                <Smile className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="border-[#2A3441] text-[#E8EAED] hover:bg-[#2A3441]"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePost}
                disabled={
                  uploading ||
                  isUploading ||
                  (!postText.trim() && uploadedImages.length === 0) ||
                  remainingChars < 0
                }
                className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Post
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
