/**
 * CreatePostModal_Full - Comprehensive Database-Connected Create Post Modal
 * Features: Title, Content, Images, Videos, Tags, Location, Car Info, Polls, Anonymous
 */

import { useState, useRef, useEffect } from 'react';
import { X, Image as ImageIcon, Video, MapPin, Tag, Send, Loader2, Camera, Plus, Trash2, UserX, BarChart3, FileText, Smile, Circle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { Progress } from './ui/progress';
import { toast } from 'sonner';
import { useProfile, useImageUpload } from '../hooks';
import { useUploadCommunityMedia } from '../../AI2SQL/hooks/useUploadCommunityMedia';
import { supabase, apiCall, publicApiCall } from '../utils/supabase/client';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
}

interface UploadedFile {
  file: File;
  preview: string;
  type: 'image' | 'video';
  url?: string;
}

interface PollOption {
  id: string;
  text: string;
}

export function CreatePostModal({ isOpen, onClose, onPostCreated }: CreatePostModalProps) {
  const { profile } = useProfile();
  
  // Post Content
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<'regular' | 'poll'>('regular');
  
  // Car Information
  const [carBrand, setCarBrand] = useState('');
  const [carModel, setCarModel] = useState('');
  const [customBrand, setCustomBrand] = useState('');
  const [customModel, setCustomModel] = useState('');
  
  // Urgency Level
  const [urgencyLevel, setUrgencyLevel] = useState<'normal' | 'important' | 'urgent'>('normal');
  
  // Tags
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  // Location
  const [location, setLocation] = useState('');
  
  // Media
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Poll
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<PollOption[]>([
    { id: '1', text: '' },
    { id: '2', text: '' }
  ]);
  const [pollDuration, setPollDuration] = useState('24');
  const [allowMultipleChoice, setAllowMultipleChoice] = useState(false);
  
  // Settings
  const [postAsAnonymous, setPostAsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { uploadImage } = useImageUpload();
  const uploadCommunity = useUploadCommunityMedia();

  // Prewarm Edge Function to avoid cold start delay
  useEffect(() => {
    if (isOpen) {
      publicApiCall('/health').catch(() => {});
    }
  }, [isOpen]);

  // Chinese Car Brands
  const chineseCarBrands = [
    'BYD', 'Hongqi', 'Bestune', 'MG', 'Haval', 'Foton', 'Geely', 'XPeng', 'Jaecoo', 'Zeekr',
    'Jetour', 'JAC', 'GAC', 'BAIC', 'Great Wall', 'Chery', 'Skywell', 'Riddara', 'NIO', 'Tank',
    'Roewe', 'Li Auto', 'Kaiyi', 'Dongfeng', 'Omoda', 'Soueast', 'VGV', 'Seres', 'Avatr', 'Forthing',
    'Changan', 'Maxus', 'Exeed', 'Other'
  ];

  const carModels: { [key: string]: string[] } = {
    'BYD': ['Atto 3', 'Han', 'Qin Plus', 'Seal', 'Sealion 7', 'Song Plus', 'Other'],
    'Hongqi': ['E-HS9', 'E-QM5', 'H5', 'H9', 'HS3', 'HS5', 'Other'],
    'Bestune': ['B70', 'T77', 'T99', 'Other'],
    'MG': ['3', '4', '5', '7', 'GT', 'HS', 'One', 'RX5', 'RX8', 'RX9', 'ZS', 'Other'],
    'Haval': ['Dargo', 'H6', 'H6 GT', 'Jolion', 'Other'],
    'Foton': ['Aumark', 'Tunland', 'Other'],
    'Geely': ['Coolray', 'Emgrand', 'Monjaro', 'Tugella', 'Starray', 'Geometry A', 'Geometry C', 'Other'],
    'XPeng': ['G6', 'G9', 'X9', 'Other'],
    'Jaecoo': ['J7', 'J8', 'Other'],
    'Zeekr': ['001', '007', '009', 'X', 'Other'],
    'Jetour': ['Dashing', 'T2', 'X70', 'X90 Plus', 'Other'],
    'JAC': ['J7', 'JS4', 'JS6', 'Other'],
    'GAC': ['Empow', 'EMKOO', 'GA8', 'GS3 Emzoom', 'GS8', 'Other'],
    'BAIC': ['BJ30', 'BJ40', 'X35', 'X55', 'X7', 'Other'],
    'Great Wall': ['King Kong', 'Poer', 'Other'],
    'Chery': ['Arrizo 5', 'Arrizo 8', 'Tiggo 4 Pro', 'Tiggo 7 Pro', 'Tiggo 8 Pro', 'Tiggo 9', 'Other'],
    'Skywell': ['ET5', 'Other'],
    'Riddara': ['RD6', 'Other'],
    'NIO': ['EC6', 'EL8', 'ET5', 'ET7', 'ET9', 'ES6', 'ES7', 'ES8', 'Other'],
    'Tank': ['300', '500', '700', 'Other'],
    'Roewe': ['RX5', 'RX8', 'Other'],
    'Li Auto': ['L6', 'L7', 'L8', 'L9', 'Other'],
    'Kaiyi': ['E5', 'X3', 'X7', 'Other'],
    'Dongfeng': ['Rich 7', 'Mage', 'Shine Max', 'Other'],
    'Omoda': ['C5', 'C7', 'E5', 'Other'],
    'Soueast': ['S06', 'S07', 'S09', 'Other'],
    'VGV': ['U70', 'U75 Plus', 'Other'],
    'Seres': ['3', '5', '7', 'Other'],
    'Avatr': ['11', '12', 'Other'],
    'Forthing': ['Friday EV', 'T5 EVO', 'U-Tour', 'Other'],
    'Changan': ['Alsvin', 'CS35 Plus', 'CS75 Plus', 'UNI-T', 'UNI-V', 'Other'],
    'Maxus': ['D60', 'G50', 'T60', 'T90', 'Other'],
    'Exeed': ['LX', 'RX', 'TXL', 'VX', 'Other'],
    'Other': ['Other']
  };

  const suggestedTags = [
    'ChineseCars', 'ElectricVehicles', 'CarReview', 'ModifiedCars', 'DubaiCars',
    'UAEMotors', 'CarShow', 'CarMeet', 'CarPhotography', 'NewEnergyVehicles'
  ];

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 10MB`);
        continue;
      }

      // Validate file type
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      if (!isImage && !isVideo) {
        toast.error(`${file.name} is not a valid image or video`);
        continue;
      }

      const preview = URL.createObjectURL(file);

      setUploadedFiles(prev => [
        ...prev,
        {
          file,
          preview,
          type: isImage ? 'image' : 'video'
        }
      ]);
    }

    setIsUploading(false);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleAddTag = (tagText?: string) => {
    const newTag = (tagText || tagInput).trim().toLowerCase().replace(/^#/, '');
    
    if (!newTag) return;

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

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addPollOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions([...pollOptions, { id: Date.now().toString(), text: '' }]);
    }
  };

  const removePollOption = (id: string) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter(option => option.id !== id));
    }
  };

  const updatePollOption = (id: string, text: string) => {
    setPollOptions(pollOptions.map(option => 
      option.id === id ? { ...option, text } : option
    ));
  };

  const handlePost = async () => {
    // Validation
    if (postType === 'regular') {
      if (!content.trim() && uploadedFiles.length === 0) {
        toast.error('Please add some content or media');
        return;
      }
    } else {
      if (!pollQuestion.trim()) {
        toast.error('Please add a poll question');
        return;
      }

      const validOptions = pollOptions.filter(opt => opt.text.trim());
      if (validOptions.length < 2) {
        toast.error('Please add at least 2 poll options');
        return;
      }
    }

    setSubmitting(true);

    try {
      // Get session for auth token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('You must be logged in to create a post');
        setSubmitting(false);
        return;
      }

      // Validate required fields
      if (!title.trim()) {
        toast.error('Title is required');
        setSubmitting(false);
        return;
      }

      const hasContentOrMedia = (content && content.trim().length > 0) || uploadedFiles.length > 0 || (postType === 'poll' && pollQuestion.trim().length > 0);
      if (!hasContentOrMedia) {
        toast.error('Add some content or media');
        setSubmitting(false);
        return;
      }

      // Validate brand/model if provided (OPTIONAL - car info is now optional)
      if (carBrand === 'Other' && !customBrand.trim()) {
        toast.error('Please enter the car brand or select a different option');
        setSubmitting(false);
        return;
      }
      if (carModel === 'Other' && !customModel.trim()) {
        toast.error('Please enter the car model or select a different option');
        setSubmitting(false);
        return;
      }

      // Upload media files to storage (community-media) - parallelize
      const uploadStart = performance.now();
      const uploadedMediaUrls: string[] = [];
      const uploadedStoragePaths: string[] = [];
      let uploadedMedia: { url: string; type: 'image' | 'video' }[] = [];
      if (uploadedFiles.length > 0) {
        const userId = session.user.id;
        const results = await Promise.allSettled(
          uploadedFiles.map((f) => uploadCommunity(f.file, userId, 'post'))
        );
        results.forEach((res, idx) => {
          if (res.status === 'fulfilled') {
            const url = res.value as string;
            if (url) {
              uploadedMediaUrls.push(url);
              uploadedMedia.push({ url, type: uploadedFiles[idx]?.type === 'video' ? 'video' : 'image' });
              
              // Extract storage path from public URL
              // URL format: https://project.supabase.co/storage/v1/object/public/community-media/path/to/file
              try {
                const urlObj = new URL(url);
                // Try multiple patterns to extract the path
                let storagePath: string | null = null;
                
                // Pattern 1: /storage/v1/object/public/community-media/path
                const pathMatch1 = urlObj.pathname.match(/\/storage\/v1\/object\/public\/community-media\/(.+)$/);
                if (pathMatch1 && pathMatch1[1]) {
                  storagePath = decodeURIComponent(pathMatch1[1]);
                } else {
                  // Pattern 2: Look for community-media/ in the URL
                  const bucketIndex = url.indexOf('community-media/');
                  if (bucketIndex !== -1) {
                    storagePath = url.substring(bucketIndex + 'community-media/'.length);
                    // Remove query params if any
                    const queryIndex = storagePath.indexOf('?');
                    if (queryIndex !== -1) {
                      storagePath = storagePath.substring(0, queryIndex);
                    }
                    storagePath = decodeURIComponent(storagePath);
                  }
                }
                
                if (storagePath) {
                  uploadedStoragePaths.push(storagePath);
                  console.log('Extracted storage path:', storagePath, 'from URL:', url);
                } else {
                  console.warn('Could not extract storage path from URL:', url);
                }
              } catch (e) {
                console.warn('Error extracting storage path from URL:', url, e);
              }
            }
          } else {
            const name = uploadedFiles[idx]?.file?.name || `file ${idx+1}`;
            console.error('Error uploading file:', res.reason);
            toast.error(`Failed to upload ${name}`);
          }
        });
        const uploadDuration = Math.round(performance.now() - uploadStart);
        console.log('[CreatePost] Media upload ms =', uploadDuration, 'files =', uploadedFiles.length);
        console.log('[CreatePost] Storage paths extracted:', uploadedStoragePaths);
      }

      // Prepare post data for API
      const postContent = content.trim() || pollQuestion.trim();
      
      // Ensure title is never null or empty - use content preview if title is empty
      const postTitle = title.trim() || content.trim().substring(0, 50) || pollQuestion.trim().substring(0, 50) || 'Untitled Post';
      
      const postPayload = {
        title: postTitle, // Always ensure title is set
        content: postContent || '[Image Post]',
        images: uploadedMediaUrls || [],
        tags: tags || [],
        location: location.trim() || undefined,
        car_brand: (carBrand === 'Other' ? customBrand.trim() : carBrand) || undefined,
        car_model: (carModel === 'Other' ? customModel.trim() : carModel) || undefined,
        car_brand_other: carBrand === 'Other' ? customBrand.trim() : undefined,
        car_model_other: carModel === 'Other' ? customModel.trim() : undefined,
        urgency_level: urgencyLevel || 'normal',
        is_anonymous: postAsAnonymous || false,
        post_type: postType || 'regular',
        poll_data: postType === 'poll' ? {
          question: pollQuestion,
          options: pollOptions.filter(opt => opt.text.trim()).map(opt => opt.text),
          duration_hours: parseInt(pollDuration) || 24,
          allow_multiple: allowMultipleChoice || false
        } : undefined
      };

      let createdPostId: string | null = null;
      
      try {
        const res = await apiCall('/posts', {
          method: 'POST',
          body: JSON.stringify(postPayload),
        }, true);
        console.log('✅ Post created via Edge Function:', res);
        createdPostId = res?.id || res?.post?.id || null;
      } catch (apiErr: any) {
        // Fallback 1: Direct Supabase insert with full metadata
        try {
          const urgencyRaw = (urgencyLevel || '').toLowerCase();
          const urgency = urgencyRaw === 'urgent' ? 'urgent' : (urgencyRaw === 'important' || urgencyRaw === 'high') ? 'high' : (urgencyRaw === 'medium') ? 'medium' : (urgencyRaw === 'normal' || urgencyRaw === 'low') ? 'low' : null;
          // Ensure title is never null or empty
          const postTitle = title.trim() || content.trim().substring(0, 50) || 'Untitled Post';
          
          const directPayload: any = {
            user_id: session.user.id,
            title: postTitle, // Always ensure title is set
            content: postContent || '[No content]',
            body: postContent || '[No content]',
            images: uploadedMediaUrls || [],
            media: uploadedMedia || [],
            tags: tags || [],
            location: location.trim() || null,
            car_brand: (carBrand === 'Other' ? customBrand.trim() : carBrand) || null,
            car_model: (carModel === 'Other' ? customModel.trim() : carModel) || null,
            urgency: urgency || 'normal',
            status: 'approved',
            is_anonymous: !!postAsAnonymous,
            created_at: new Date().toISOString(),
          };
          const ins = await supabase.from('posts').insert(directPayload).select('*').single();
          if (ins.error) throw ins.error;
          createdPostId = ins.data?.id;
          console.log('✅ Post created via direct insert:', createdPostId);
        } catch (directErr: any) {
          // Fallback 2: RPC minimal create
          const rpcTitle = title.trim() || content.trim().substring(0, 50) || pollQuestion.trim().substring(0, 50) || 'Untitled Post';
          const rpcContent = (content || pollQuestion || '').trim() || '[Image Post]';
          
          // Try the unified function signature
          const { data: postId, error: rpcError } = await supabase.rpc('fn_create_post', {
            p_title: rpcTitle,
            p_body: rpcContent,
            p_content: rpcContent,
            p_media: uploadedMedia || [],
            p_tags: tags || [],
            p_community_id: null,
            p_location: location.trim() || null,
            p_car_brand: (carBrand === 'Other' ? customBrand.trim() : carBrand) || null,
            p_car_model: (carModel === 'Other' ? customModel.trim() : carModel) || null,
            p_urgency: urgencyLevel || null
          });
          if (rpcError) {
            toast.error('Failed to create post: ' + (apiErr?.message || directErr?.message || rpcError.message));
            setSubmitting(false);
            return;
          }
          createdPostId = postId as string;
          console.log('✅ Post created via RPC:', createdPostId);
        }
      }
      
      // Link uploaded images to post
      // Since posts are in 'posts' table (not 'community_posts'), we'll use community_post_images or store in posts.images
      if (createdPostId && uploadedStoragePaths.length > 0) {
        try {
          // First try: Insert into community_post_images table (references posts table)
          const imageInserts = uploadedStoragePaths.map(path => ({
            post_id: createdPostId,
            storage_path: path
          }));
          
          const { error: imageInsertError, data: insertedImages } = await supabase
            .from('community_post_images')
            .insert(imageInserts)
            .select();
          
          if (imageInsertError) {
            // If unique constraint violation (409), images might already exist - that's okay
            if (imageInsertError.code === '23505' || imageInsertError.message?.includes('duplicate') || imageInsertError.message?.includes('unique')) {
              console.log('Images may already be linked (unique constraint), continuing...');
            } else {
              console.warn('community_post_images insert failed:', imageInsertError);
            }
          } else {
            console.log('✅ Images linked to post via community_post_images:', insertedImages);
          }
          
          // Always also update the post's images column as primary storage (works regardless of table structure)
          const { error: updateError } = await supabase
            .from('posts')
            .update({ 
              images: uploadedMediaUrls,
              media: uploadedMedia 
            })
            .eq('id', createdPostId);
          
          if (updateError) {
            console.warn('Failed to update post.images column:', updateError);
          } else {
            console.log('✅ Images saved to post.images column');
          }
          
        } catch (linkErr: any) {
          console.error('Error linking images to post:', linkErr);
          // Last resort: just update post images column
          try {
            const { error: finalUpdateError } = await supabase
              .from('posts')
              .update({ images: uploadedMediaUrls, media: uploadedMedia })
              .eq('id', createdPostId);
            
            if (finalUpdateError) {
              console.error('Failed to save images to post:', finalUpdateError);
            } else {
              console.log('✅ Images saved to post.images column as fallback');
            }
          } catch (finalErr: any) {
            console.error('All image linking methods failed:', finalErr);
          }
        }
      } else if (createdPostId && uploadedMediaUrls.length > 0) {
        // If we have URLs but no storage paths, just update the post's images column
        try {
          const { error: updateError } = await supabase
            .from('posts')
            .update({ 
              images: uploadedMediaUrls,
              media: uploadedMedia 
            })
            .eq('id', createdPostId);
          
          if (updateError) {
            console.error('Failed to update post.images column:', updateError);
          } else {
            console.log('✅ Images saved to post.images column');
          }
        } catch (err: any) {
          console.error('Error saving images to post:', err);
        }
      }
      toast.success(postType === 'poll' ? 'Poll created successfully!' : 'Post created successfully!');
      
      // Call callback
      if (onPostCreated) {
        onPostCreated();
      }

      // Close and reset
      handleClose();

    } catch (err: any) {
      const msg = err?.message || (typeof err === 'string' ? err : JSON.stringify(err));
      console.error('❌ Error creating post:', msg);
      toast.error('Failed to create post: ' + msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    // Clean up preview URLs
    uploadedFiles.forEach(file => {
      URL.revokeObjectURL(file.preview);
    });

    // Reset all fields
    setTitle('');
    setContent('');
    setPostType('regular');
    setCarBrand('');
    setCarModel('');
    setUrgencyLevel('normal');
    setTags([]);
    setTagInput('');
    setLocation('');
    setUploadedFiles([]);
    setPostAsAnonymous(false);
    setPollQuestion('');
    setPollOptions([
      { id: '1', text: '' },
      { id: '2', text: '' }
    ]);
    setPollDuration('24');
    setAllowMultipleChoice(false);

    onClose();
  };

  const characterCount = content.length;
  const maxCharacters = 2000;
  const charactersRemaining = maxCharacters - characterCount;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="
          w-full sm:max-w-3xl 
          h-screen sm:h-auto 
          max-h-screen sm:max-h-[95vh] 
          overflow-hidden 
          bg-[#1A1F2E] 
          border-0 sm:border sm:border-[#2A3441] 
          p-0 
          gap-0 
          flex 
          flex-col 
          rounded-none sm:rounded-lg
          !fixed
          !top-0 sm:!top-1/2
          !left-0 sm:!left-1/2
          !right-0 sm:!right-auto
          !bottom-0 sm:!bottom-auto
          !translate-x-0 sm:!-translate-x-1/2
          !translate-y-0 sm:!-translate-y-1/2
          !m-0 sm:!m-auto
        "
      >
        <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[#2A3441] shrink-0 bg-[#1A1F2E]">
          <DialogTitle className="text-[#E8EAED] text-lg sm:text-xl">Create Post</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-4 space-y-4 sm:space-y-6 bg-[#0B1426]">
          {/* User Info */}
          {profile && (
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="bg-[#D4AF37] text-black">
                  {profile.display_name?.substring(0, 2).toUpperCase() || 'AD'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-[#E8EAED]">{profile.display_name || 'User'}</p>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  {profile.role || 'user'}
                </Badge>
              </div>
            </div>
          )}

          {/* Post Type Tabs */}
          <Tabs value={postType} onValueChange={(value) => setPostType(value as 'regular' | 'poll')}>
            <TabsList className="grid w-full grid-cols-2 bg-[#0B1426]">
              <TabsTrigger value="regular" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">
                <FileText className="h-4 w-4 mr-2" />
                Regular Post
              </TabsTrigger>
              <TabsTrigger value="poll" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">
                <BarChart3 className="h-4 w-4 mr-2" />
                Create Poll
              </TabsTrigger>
            </TabsList>

            {/* Regular Post */}
            <TabsContent value="regular" className="space-y-4 mt-4">
              {/* Title */}
              <div className="space-y-2">
                <Label className="text-[#8A92A6] text-sm">Title</Label>
                <Input
                  placeholder="Give your post a catchy title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-[#0B1426] border-[#2A3441] text-[#E8EAED] placeholder:text-[#8A92A6] h-11"
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Textarea
                  placeholder="What's on your mind?"
                  value={content}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    if (newValue.length <= maxCharacters) {
                      setContent(newValue);
                    }
                  }}
                  rows={6}
                  className="bg-[#0B1426] border-[#2A3441] text-[#E8EAED] placeholder:text-[#8A92A6] resize-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent min-h-[150px] sm:min-h-[200px]"
                />
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <p className="text-[#8A92A6]">
                    {charactersRemaining} characters remaining
                  </p>
                  {content.length > maxCharacters * 0.9 && (
                    <p className="text-orange-400">
                      {Math.floor((content.length / maxCharacters) * 100)}% used
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Poll */}
            <TabsContent value="poll" className="space-y-4 mt-4">
              {/* Poll Question */}
              <div className="space-y-2">
                <Label className="text-[#8A92A6] text-sm">Poll Question *</Label>
                <Input
                  placeholder="Ask a question..."
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  className="bg-[#0B1426] border-[#2A3441] text-[#E8EAED] placeholder:text-[#8A92A6] h-11"
                />
              </div>

              {/* Poll Options */}
              <div className="space-y-3">
                <Label className="text-[#8A92A6] text-sm">Poll Options (2-6)</Label>
                {pollOptions.map((option, index) => (
                  <div key={option.id} className="flex items-center gap-2">
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option.text}
                      onChange={(e) => updatePollOption(option.id, e.target.value)}
                      className="flex-1 bg-[#0B1426] border-[#2A3441] text-[#E8EAED] placeholder:text-[#8A92A6] h-11"
                    />
                    {pollOptions.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removePollOption(option.id)}
                        className="border-[#2A3441] hover:bg-red-500/20 hover:border-red-500 shrink-0 h-11 w-11"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}

                {pollOptions.length < 6 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addPollOption}
                    className="w-full border-[#2A3441] text-[#8A92A6] hover:bg-[#D4AF37] hover:text-black h-11"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                )}
              </div>

              {/* Poll Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label className="text-[#8A92A6] text-sm">Duration</Label>
                  <Select value={pollDuration} onValueChange={setPollDuration}>
                    <SelectTrigger className="bg-[#0B1426] border-[#2A3441] text-[#E8EAED] h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1F2E] border-[#2A3441]">
                      <SelectItem value="1">1 hour</SelectItem>
                      <SelectItem value="6">6 hours</SelectItem>
                      <SelectItem value="12">12 hours</SelectItem>
                      <SelectItem value="24">24 hours</SelectItem>
                      <SelectItem value="48">2 days</SelectItem>
                      <SelectItem value="168">1 week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[#8A92A6] text-sm">Allow Multiple Answers</Label>
                  <div className="flex items-center h-11">
                    <Switch
                      checked={allowMultipleChoice}
                      onCheckedChange={setAllowMultipleChoice}
                    />
                    <Label className="text-[#8A92A6] text-sm ml-2">Multiple Choice</Label>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Car Information and Urgency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label className="text-[#8A92A6] text-sm">Car Brand</Label>
              <Select value={carBrand} onValueChange={setCarBrand}>
                <SelectTrigger className="bg-[#0B1426] border-[#2A3441] text-[#E8EAED] h-11">
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1F2E] border-[#2A3441] max-h-[200px]">
                  {chineseCarBrands.map(brand => (
                    <SelectItem key={brand} value={brand} className="text-[#E8EAED]">{brand}</SelectItem>
                  ))}
                  <SelectItem key="Other" value="Other" className="text-[#E8EAED]">Other</SelectItem>
                </SelectContent>
              </Select>
              {carBrand === 'Other' && (
                <Input
                  placeholder="Enter car brand"
                  value={customBrand}
                  onChange={(e) => setCustomBrand(e.target.value)}
                  className="bg-[#0B1426] border-[#2A3441] text-[#E8EAED] placeholder:text-[#8A92A6] h-11"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-[#8A92A6] text-sm">Car Model</Label>
              <Select value={carModel} onValueChange={setCarModel} disabled={!carBrand}>
                <SelectTrigger className="bg-[#0B1426] border-[#2A3441] text-[#E8EAED] h-11">
                  <SelectValue placeholder={carBrand ? "Select model" : "Select brand first"} />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1F2E] border-[#2A3441]">
                  {(carModels[carBrand] || []).map(model => (
                    <SelectItem key={model} value={model} className="text-[#E8EAED]">{model}</SelectItem>
                  ))}
                  <SelectItem key="Other" value="Other" className="text-[#E8EAED]">Other</SelectItem>
                </SelectContent>
              </Select>
              {carModel === 'Other' && (
                <Input
                  placeholder="Enter car model"
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  className="bg-[#0B1426] border-[#2A3441] text-[#E8EAED] placeholder:text-[#8A92A6] h-11"
                />
              )}
            </div>
          </div>

          {/* Urgency Level */}
          <div className="space-y-2">
            <Label className="text-[#8A92A6] text-sm">Priority Level</Label>
            <Select value={urgencyLevel} onValueChange={(value: any) => setUrgencyLevel(value)}>
              <SelectTrigger className="bg-[#0B1426] border-[#2A3441] text-[#E8EAED] h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1F2E] border-[#2A3441]">
                <SelectItem value="normal" className="text-[#E8EAED]">
                  <div className="flex items-center space-x-2">
                    <Circle className="h-3 w-3 fill-green-500 text-green-500" />
                    <span>Normal</span>
                  </div>
                </SelectItem>
                <SelectItem value="important" className="text-[#E8EAED]">
                  <div className="flex items-center space-x-2">
                    <Circle className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                    <span>Important</span>
                  </div>
                </SelectItem>
                <SelectItem value="urgent" className="text-[#E8EAED]">
                  <div className="flex items-center space-x-2">
                    <Circle className="h-3 w-3 fill-red-500 text-red-500" />
                    <span>Urgent</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-[#8A92A6] text-sm">Tags (Max 5)</Label>
            <div className="flex items-center gap-2">
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
                className="flex-1 bg-[#0B1426] border-[#2A3441] text-[#E8EAED] placeholder:text-[#8A92A6] h-11"
              />
              <Button
                type="button"
                onClick={() => handleAddTag()}
                className="bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90 shrink-0"
                disabled={tags.length >= 5 || !tagInput.trim()}
              >
                <Tag className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Add</span>
              </Button>
            </div>

            {/* Tag Pills */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <Badge
                    key={tag}
                    className="bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30 hover:bg-[#D4AF37]/30"
                  >
                    #{tag}
                    <X
                      className="h-3 w-3 ml-2 cursor-pointer"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}

            {/* Suggested Tags */}
            <div className="flex flex-wrap gap-2">
              {suggestedTags.filter(t => !tags.includes(t.toLowerCase())).slice(0, 5).map(tag => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer border-[#2A3441] text-[#8A92A6] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]"
                  onClick={() => handleAddTag(tag)}
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label className="text-[#8A92A6] text-sm">Location</Label>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#8A92A6] shrink-0" />
              <Input
                placeholder="Add location (e.g., Dubai, Abu Dhabi)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="flex-1 bg-[#0B1426] border-[#2A3441] text-[#E8EAED] placeholder:text-[#8A92A6] h-11"
              />
            </div>
          </div>

          {/* Media Upload */}
          {postType === 'regular' && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />

              {/* Uploaded Files Preview */}
              {uploadedFiles.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="relative rounded-lg overflow-hidden border border-[#2A3441] aspect-square">
                      {file.type === 'image' ? (
                        <img
                          src={file.preview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#0B1426] flex items-center justify-center">
                          <Video className="h-6 w-6 sm:h-8 sm:w-8 text-[#8A92A6]" />
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => removeFile(index)}
                        className="absolute top-1 right-1 h-7 w-7 sm:h-6 sm:w-6 rounded-full"
                      >
                        <X className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Post as Anonymous */}
          <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-[#0B1426] border border-[#2A3441]">
            <div className="flex items-center space-x-3">
              <UserX className="h-5 w-5 text-[#8A92A6] shrink-0" />
              <div>
                <Label className="text-[#E8EAED] text-sm sm:text-base">Post as Anonymous</Label>
                <p className="text-xs sm:text-sm text-[#8A92A6]">Your identity will be hidden</p>
              </div>
            </div>
            <Switch
              checked={postAsAnonymous}
              onCheckedChange={setPostAsAnonymous}
              className="shrink-0"
            />
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleImageSelect}
          className="hidden"
        />

        {/* Fixed Footer with Action Buttons */}
        <div className="shrink-0 border-t border-[#2A3441] bg-[#1A1F2E] px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {postType === 'regular' && (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[#8A92A6] hover:text-[#E8EAED] h-9 w-9"
                    disabled={isUploading}
                    title="Upload Image"
                  >
                    <ImageIcon className="h-5 w-5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[#8A92A6] hover:text-[#E8EAED] h-9 w-9"
                    disabled={isUploading}
                  >
                    <Video className="h-5 w-5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-[#8A92A6] hover:text-[#E8EAED] h-9 w-9"
                  >
                    <Smile className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                onClick={handleClose}
                className="text-[#8A92A6] hover:text-[#E8EAED] hidden sm:flex"
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePost}
                className="bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90 font-semibold"
                disabled={submitting || isUploading}
              >
                {submitting ? (
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
