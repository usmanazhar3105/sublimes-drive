import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Upload, X, Tag, Image, Video, Camera, FileText, AlertCircle, CheckCircle, 
  UserX, BarChart3, Plus, Trash2, AlertTriangle, InfoIcon
} from 'lucide-react';
import { supabase } from '../utils/supabase/client'
import { useUploadCommunityMedia } from '../../AI2SQL/hooks/useUploadCommunityMedia'

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UploadedFile {
  file: File;
  preview: string;
  type: 'image' | 'video';
  uploadProgress: number;
  uploadStatus: 'pending' | 'uploading' | 'completed' | 'error';
}

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [carBrand, setCarBrand] = useState('');
  const [carModel, setCarModel] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [postAsAnonymous, setPostAsAnonymous] = useState(false);
  const [urgencyLevel, setUrgencyLevel] = useState('normal');
  const [postType, setPostType] = useState<'regular' | 'poll'>('regular');
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<PollOption[]>([
    { id: '1', text: '', votes: 0 },
    { id: '2', text: '', votes: 0 }
  ]);
  const [pollDuration, setPollDuration] = useState('24');
  const [allowMultipleChoice, setAllowMultipleChoice] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadCommunity = useUploadCommunityMedia();

  // STRICTLY CHINESE CAR BRANDS ONLY (as requested)
  const chineseCarBrands = [
    'BYD', 'NIO', 'XPeng', 'Li Auto', 'Geely', 'Great Wall Motors', 'Chery', 'SAIC', 'GAC',
    'Hongqi', 'Haval', 'WEY', 'Tank', 'Ora', 'Jetour', 'Jaecoo', 'Omoda', 'Exeed',
    'BAIC', 'Beijing Auto', 'Dongfeng', 'Forthing', 'Venucia', 'Bestune', 'Trumpchi',
    'Roewe', 'MG Motor', 'Maxus', 'LDV', 'JAC', 'Jianghuai', 'Soueast', 'VGV',
    'Seres', 'AITO', 'Avatr', 'Skywell', 'Leapmotor', 'Neta', 'Hozon', 'Weltmeister',
    'WM Motor', 'Aiways', 'Byton', 'Lucid Motors', 'Changan', 'Deepal', 'ZEEKR'
  ];

  // Car models organized by brand
  const carModels: { [key: string]: string[] } = {
    'BYD': ['Han', 'Tang', 'Song', 'Qin', 'Yuan', 'Dolphin', 'Seal', 'Atto 3', 'e6'],
    'NIO': ['ES8', 'ES6', 'EC6', 'ET7', 'ET5', 'EL7', 'EL6'],
    'XPeng': ['P7', 'P5', 'G3', 'G6', 'G9'],
    'Li Auto': ['Li ONE', 'L9', 'L8', 'L7', 'L6'],
    'Geely': ['Emgrand', 'Coolray', 'Azkarra', 'Okavango', 'Tugella'],
    'Great Wall Motors': ['Haval H6', 'Haval H9', 'Ora Good Cat', 'Tank 300', 'Tank 500'],
    'Chery': ['Tiggo 8', 'Tiggo 7', 'Arrizo 6', 'QQ', 'Fulwin'],
    'Hongqi': ['H9', 'HS7', 'E-HS9', 'H5', 'HS5'],
    'Jetour': ['X70', 'X90', 'Dashing', 'T1', 'T2'],
    'Jaecoo': ['J7', 'J8'],
    'Omoda': ['5', '7'],
    'Exeed': ['LX', 'TXL', 'VX']
  };

  const quickTags = [
    'Normal', 'Important', 'Urgent', 'Dubai'
  ];

  const topicTags = [
    'photography', 'adventure', 'meetup', 'repair', 'maintenance', 'modification', 'review'
  ];

  const suggestedTags = [
    'ChineseCars', 'ElectricVehicles', 'CarReview', 'ModifiedCars', 'DubaiCars', 
    'UAEMotors', 'CarShow', 'CarMeet', 'CarPhotography', 'NewEnergyVehicles'
  ];

  const handleAddTag = (tag: string) => {
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const validateFile = (file: File): string | null => {
    if (file.size > 10 * 1024 * 1024) {
      return 'File size must be less than 10MB';
    }
    
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      return 'Only image and video files are allowed';
    }
    
    if (uploadedFiles.length >= 10) {
      return 'Maximum 10 files allowed';
    }
    
    return null;
  };

  const simulateUpload = (fileObj: UploadedFile) => {
    const updateProgress = () => {
      setUploadedFiles(prev => prev.map(f => {
        if (f.file === fileObj.file) {
          const newProgress = Math.min(f.uploadProgress + 10, 100);
          const newStatus = newProgress === 100 ? 'completed' : 'uploading';
          return { ...f, uploadProgress: newProgress, uploadStatus: newStatus };
        }
        return f;
      }));
    };

    const interval = setInterval(updateProgress, 100);
    
    setTimeout(() => {
      clearInterval(interval);
      setIsUploading(false);
    }, 1000);
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];

    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        alert(error);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setIsUploading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        if (!userId) {
          alert('You must be signed in to upload');
          setIsUploading(false);
          return;
        }

        for (const file of validFiles) {
          const url = await uploadCommunity(file, userId);
          const fileType = file.type.startsWith('image/') ? 'image' : 'video';
          const fileObj: UploadedFile = {
            file,
            preview: url,
            type: fileType,
            uploadProgress: 100,
            uploadStatus: 'completed'
          };
          setUploadedFiles(prev => [...prev, fileObj]);
        }
      } catch (_) {
        alert('Upload failed');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    await handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const addPollOption = () => {
    if (pollOptions.length < 6) {
      const newOption: PollOption = {
        id: Date.now().toString(),
        text: '',
        votes: 0
      };
      setPollOptions([...pollOptions, newOption]);
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

  const handleSubmit = () => {
    // Validate required fields
    if (!description.trim()) {
      alert('Please add content for your post');
      return;
    }

    // Validate poll if poll type is selected
    if (postType === 'poll') {
      if (!pollQuestion.trim()) {
        alert('Please add a poll question');
        return;
      }
      
      const validOptions = pollOptions.filter(option => option.text.trim());
      if (validOptions.length < 2) {
        alert('Please add at least 2 poll options');
        return;
      }
    }

    // Check if any files are still uploading
    const stillUploading = uploadedFiles.some(file => file.uploadStatus === 'uploading');
    if (stillUploading) {
      alert('Please wait for all files to finish uploading');
      return;
    }

    // Handle post creation logic here
    const postData = {
      title: title.trim(),
      content: description.trim(),
      carBrand,
      carModel,
      tags,
      urgencyLevel,
      postAsAnonymous,
      postType,
      ...(postType === 'poll' && {
        poll: {
          question: pollQuestion.trim(),
          options: pollOptions.filter(option => option.text.trim()),
          duration: parseInt(pollDuration),
          allowMultipleChoice
        }
      }),
      images: uploadedFiles.filter(f => f.type === 'image').map(f => f.preview),
      videos: uploadedFiles.filter(f => f.type === 'video').map(f => f.preview),
      timestamp: new Date().toISOString()
    };
    
    console.log('Creating post:', postData);
    
    handleClose();
  };

  const handleClose = () => {
    // Clean up preview URLs
    uploadedFiles.forEach(file => {
      URL.revokeObjectURL(file.preview);
    });
    
    // Reset form
    setTitle('');
    setDescription('');
    setCarBrand('');
    setCarModel('');
    setTags([]);
    setUploadedFiles([]);
    setIsUploading(false);
    setPostAsAnonymous(false);
    setUrgencyLevel('normal');
    setPostType('regular');
    setPollQuestion('');
    setPollOptions([
      { id: '1', text: '', votes: 0 },
      { id: '2', text: '', votes: 0 }
    ]);
    setPollDuration('24');
    setAllowMultipleChoice(false);
    
    onClose();
  };

  const selectedBrandModels = carBrand ? carModels[carBrand] || [] : [];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create New Post</DialogTitle>
          <DialogDescription>
            Share your car experiences, photos, or ask questions to connect with the community.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Post as Anonymous Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-card border border-border">
            <div className="flex items-center space-x-3">
              <UserX className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label className="text-base font-medium">Post as Anonymous</Label>
                <p className="text-sm text-muted-foreground">Your identity will be hidden from other users</p>
              </div>
            </div>
            <Switch
              checked={postAsAnonymous}
              onCheckedChange={setPostAsAnonymous}
            />
          </div>

          {/* Post Type Tabs */}
          <Tabs value={postType} onValueChange={(value) => setPostType(value as 'regular' | 'poll')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="regular" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Regular Post
              </TabsTrigger>
              <TabsTrigger value="poll" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Create Poll
              </TabsTrigger>
            </TabsList>

            <TabsContent value="regular" className="space-y-6 mt-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="What's this post about?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-base"
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  placeholder="Share your thoughts, experiences, or questions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  className="text-base resize-none"
                />
              </div>
            </TabsContent>

            <TabsContent value="poll" className="space-y-6 mt-6">
              {/* Poll Question */}
              <div className="space-y-2">
                <Label htmlFor="poll-question">Poll Question *</Label>
                <Input
                  id="poll-question"
                  placeholder="Ask a question for the community to vote on..."
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  className="text-base"
                />
              </div>

              {/* Poll Options */}
              <div className="space-y-3">
                <Label>Poll Options (2-6 options)</Label>
                {pollOptions.map((option, index) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option.text}
                      onChange={(e) => updatePollOption(option.id, e.target.value)}
                      className="flex-1"
                    />
                    {pollOptions.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removePollOption(option.id)}
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
                    size="sm"
                    onClick={addPollOption}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                )}
              </div>

              {/* Poll Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Poll Duration</Label>
                  <Select value={pollDuration} onValueChange={setPollDuration}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hour</SelectItem>
                      <SelectItem value="6">6 hours</SelectItem>
                      <SelectItem value="12">12 hours</SelectItem>
                      <SelectItem value="24">24 hours</SelectItem>
                      <SelectItem value="48">2 days</SelectItem>
                      <SelectItem value="168">1 week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="multiple-choice"
                    checked={allowMultipleChoice}
                    onCheckedChange={setAllowMultipleChoice}
                  />
                  <Label htmlFor="multiple-choice">Allow multiple choices</Label>
                </div>
              </div>

              {/* Poll Description */}
              <div className="space-y-2">
                <Label htmlFor="poll-content">Additional Details (Optional)</Label>
                <Textarea
                  id="poll-content"
                  placeholder="Add more context to your poll..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="text-base resize-none"
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Brand and Model Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Brand Community</Label>
              <Select value={carBrand} onValueChange={(value) => {
                setCarBrand(value);
                setCarModel(''); // Reset model when brand changes
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {chineseCarBrands.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Mark As</Label>
              <Select value={urgencyLevel} onValueChange={setUrgencyLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      Normal
                    </div>
                  </SelectItem>
                  <SelectItem value="important">
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2" />
                      Important
                    </div>
                  </SelectItem>
                  <SelectItem value="urgent">
                    <div className="flex items-center">
                      <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                      Urgent
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Car Model (if brand selected) */}
          {selectedBrandModels.length > 0 && (
            <div className="space-y-2">
              <Label>Car Model (Optional)</Label>
              <Select value={carModel} onValueChange={setCarModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {selectedBrandModels.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Tags */}
          <div className="space-y-3">
            <Label>Tags (max 5)</Label>
            <div className="flex space-x-2">
              <Input
                placeholder="Add a tag..."
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag(currentTag)}
                disabled={tags.length >= 5}
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleAddTag(currentTag)}
                disabled={!currentTag || tags.length >= 5}
              >
                <Tag className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Current Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-[var(--sublimes-gold)] text-black">
                    #{tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:bg-black/20 rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Quick Tags */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Quick:</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {quickTags.filter(tag => !tags.includes(tag)).map((tag) => (
                  <Button
                    key={tag}
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddTag(tag)}
                    className="text-xs"
                    disabled={tags.length >= 5}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
              
              <p className="text-sm text-muted-foreground mb-2">Topic:</p>
              <div className="flex flex-wrap gap-2">
                {topicTags.filter(tag => !tags.includes(tag)).slice(0, 7).map((tag) => (
                  <Button
                    key={tag}
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddTag(tag)}
                    className="text-xs"
                    disabled={tags.length >= 5}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Media Upload */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Photos/Videos (Optional)
            </Label>
            
            {/* Upload Area */}
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragging 
                  ? 'border-[var(--sublimes-gold)] bg-[var(--sublimes-gold)]/10' 
                  : 'border-border hover:border-[var(--sublimes-gold)]/50'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
                id="file-upload"
              />
              
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Upload className={`h-12 w-12 ${isDragging ? 'text-[var(--sublimes-gold)]' : 'text-muted-foreground'}`} />
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-1">
                    {isDragging ? 'Drop files here' : 'Click to upload photos or videos'}
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[var(--sublimes-gold)] hover:underline text-sm"
                  >
                    Click to browse files
                  </button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Max 10 files, 10MB each
                  </p>
                </div>
              </div>
            </div>
            
            {/* Uploaded Files Preview */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Uploaded Files ({uploadedFiles.length}/10)
                  </span>
                  {isUploading && (
                    <span className="text-xs text-muted-foreground">Uploading...</span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {uploadedFiles.map((fileObj, index) => (
                    <div key={index} className="relative bg-muted rounded-lg overflow-hidden">
                      {/* File Preview */}
                      <div className="aspect-square">
                        {fileObj.type === 'image' ? (
                          <img
                            src={fileObj.preview}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-black flex items-center justify-center">
                            <div className="text-center">
                              <Video className="h-8 w-8 text-white mx-auto mb-2" />
                              <span className="text-xs text-white">Video</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* File Info Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs truncate">{fileObj.file.name}</p>
                            <p className="text-xs opacity-70">
                              {(fileObj.file.size / (1024 * 1024)).toFixed(1)}MB
                            </p>
                          </div>
                          
                          {/* Status Icon */}
                          <div className="ml-2">
                            {fileObj.uploadStatus === 'uploading' && (
                              <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full" />
                            )}
                            {fileObj.uploadStatus === 'completed' && (
                              <CheckCircle className="h-3 w-3 text-green-400" />
                            )}
                            {fileObj.uploadStatus === 'error' && (
                              <AlertCircle className="h-3 w-3 text-red-400" />
                            )}
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        {fileObj.uploadStatus === 'uploading' && (
                          <Progress 
                            value={fileObj.uploadProgress} 
                            className="h-1 mt-1"
                          />
                        )}
                      </div>
                      
                      {/* Remove Button */}
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute top-1 right-1 bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-black/90"
                        disabled={fileObj.uploadStatus === 'uploading'}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={
                (!description.trim() && postType === 'regular') ||
                (!pollQuestion.trim() && postType === 'poll') ||
                isUploading
              }
              className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/80 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin h-4 w-4 border border-black border-t-transparent rounded-full mr-2" />
                  Uploading...
                </>
              ) : (
                postType === 'poll' ? 'Create Poll' : 'Create Post'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}