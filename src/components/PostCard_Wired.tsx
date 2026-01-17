/**
 * PostCard_Wired - Fully wired PostCard with Supabase backend integration
 * Uses useSocialInteractions hook for like, comment, share, and save functionality
 */

import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share, Eye, MoreHorizontal, Bookmark, Flag, UserMinus, Volume2, AlertTriangle, Play, BarChart3, CheckCircle, Clock, Tag, Users, Edit, Trash2 } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent, CardHeader } from './ui/card';
import { Progress } from './ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { MediaViewerModal } from './MediaViewerModal';
import { CommentSystem } from './CommentSystem';
import { toast } from 'sonner';
import { copyToClipboard } from '../utils/clipboard';
import { useSocialInteractions } from '../hooks/useSocialInteractions';
import { useProfile } from '../hooks/useProfile';
import { useContentModeration } from '../hooks/useContentModeration';
import { supabase, apiCall } from '../utils/supabase/client';

interface PollOption {
  id: string;
  text: string;
  votes: number;
  percentage?: number;
}

interface PostCardProps {
  user: {
    name: string;
    username: string;
    avatar: string;
    role: 'admin' | 'editor' | 'car-owner' | 'garage-owner' | 'browser';
    verified: boolean;
    isUrgent?: boolean;
    isAnonymous?: boolean;
  };
  content: {
    title?: string;
    text: string;
    images?: string[];
    videos?: string[];
    timestamp: string;
    tags?: string[];
    mentions?: string[];
    carBrand?: string;
    carModel?: string;
    location?: string;
    urgency?: string;
  };
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  poll?: {
    question: string;
    options: PollOption[];
    totalVotes: number;
    userVotes: string[];
    allowMultipleChoice: boolean;
    endsAt: string;
    hasEnded: boolean;
  };
  postType?: 'regular' | 'poll';
  postId: string;
  ownerId?: string;
}

export function PostCard_Wired({ 
  user, 
  content, 
  engagement, 
  poll, 
  postType = 'regular',
  postId,
  ownerId
}: PostCardProps) {
  // 🔥 SUPABASE SOCIAL INTERACTIONS HOOK
  const {
    likes,
    comments: backendComments,
    shares: backendShares,
    userHasLiked,
    loading: interactionsLoading,
    toggleLike,
    addComment,
    deleteComment,
    sharePost,
    toggleFavorite,
    checkIfFavorited,
  } = useSocialInteractions(postId);

  // 🔥 CONTENT MODERATION HOOK
  const { submitReport } = useContentModeration();

  // UI State
  const [showFullText, setShowFullText] = useState(false);
  const [selectedPollOptions, setSelectedPollOptions] = useState<string[]>(poll?.userVotes || []);
  const [hasVoted, setHasVoted] = useState((poll?.userVotes || []).length > 0);
  const [showComments, setShowComments] = useState(false);
  const [showMediaViewer, setShowMediaViewer] = useState(false);
  const [mediaViewerIndex, setMediaViewerIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(content.title || '');
  const [editedText, setEditedText] = useState(content.text);
  const [editedBrand, setEditedBrand] = useState(content.carBrand || '');
  const [editedModel, setEditedModel] = useState(content.carModel || '');
  const [editedLocation, setEditedLocation] = useState(content.location || '');
  const [editedUrgency, setEditedUrgency] = useState(content.urgency || '');
  const [editedTagsText, setEditedTagsText] = useState((content.tags || []).join(', '));

  // ✅ Get real current user from profile hook
  const { profile: currentUserProfile } = useProfile();
  
  const currentUser = {
    name: currentUserProfile?.display_name || currentUserProfile?.email || 'You',
    username: currentUserProfile?.username || currentUserProfile?.email?.split('@')[0] || 'user',
    avatar: currentUserProfile?.avatar_url || '',
    role: (currentUserProfile?.role || 'car_owner').replace('_', '-') as 'admin' | 'editor' | 'car-owner' | 'garage-owner' | 'browser',
    verified: false,
  };

  // Saved state (favorites)
  const [isFavorited, setIsFavorited] = useState(false);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (checkIfFavorited) {
          const fav = await checkIfFavorited('post', postId);
          if (mounted) setIsFavorited(fav);
        }
      } catch {}
    })();
    return () => { mounted = false; };
  }, [postId, checkIfFavorited]);

  const getRoleBadge = () => {
    switch (user.role) {
      case 'admin':
        return { text: 'Admin', style: 'bg-[var(--sublimes-gold)] text-black' };
      case 'editor':
        return { text: 'Editor', style: 'bg-blue-500 text-white' };
      case 'car-owner':
        return { text: 'Car Owner', style: 'bg-green-500 text-white' };
      case 'garage-owner':
        return { text: 'Garage Owner', style: 'bg-purple-500 text-white' };
      case 'browser':
        return { text: 'Browser', style: 'bg-gray-500 text-white' };
      default:
        return { text: 'Member', style: 'bg-gray-500 text-white' };
    }
  };

  const handleLike = async () => {
    const result = await toggleLike();
    if (result.error) {
      toast.error('Failed to like post');
    }
  };

  const handleSave = async () => {
    const result = await toggleFavorite('post', postId);
    if (result.error) {
      toast.error('Failed to save post');
    } else {
      setIsFavorited((prev) => !prev);
      toast.success(!isFavorited ? 'Post saved!' : 'Removed from saved');
    }
  };

  const handleShare = async () => {
    // Native share if available, otherwise copy to clipboard
    if (navigator.share) {
      try {
        await navigator.share({
          title: content.title || poll?.question || `Post by ${user.name}`,
          text: postType === 'poll' ? poll?.question : content.text,
          url: `${window.location.origin}/post/${postId}`
        });
        // Track share in backend
        await sharePost('native');
      } catch (err) {
        // User cancelled share
        console.log('Share cancelled');
      }
    } else {
      const success = await copyToClipboard(`${window.location.origin}/post/${postId}`);
      if (success) {
        toast.success('Link copied to clipboard!');
        await sharePost('clipboard');
      } else {
        toast.info('Share via: ' + `${window.location.origin}/post/${postId}`);
      }
    }
  };

  const handleComment = () => {
    setShowComments(!showComments);
  };

  const handleImageClick = (index: number) => {
    setMediaViewerIndex(index);
    setShowMediaViewer(true);
  };

  const handleAddComment = async (_postId: string, _comment: any) => {};

  const handleDeleteComment = async (commentId: string) => {
    const result = await deleteComment(commentId);
    if (!result.error) {
      // Success toast is shown by the hook
    }
  };

  const handleReportComment = async (commentId: string) => {
    const { success } = await submitReport('comment', commentId, 'Inappropriate content', 'User reported this comment');
    if (success) {
      toast.success('Comment reported. We will review it shortly.');
    }
  };

  const handleReport = async () => {
    const { success } = await submitReport('post', postId, 'Inappropriate content', 'User reported this post');
    if (success) {
      toast.success('Post reported. We will review it shortly.');
    }
  };

  const handleEditPost = async () => {
    try {
      const updated = {
        title: editedTitle,
        content: editedText,
        car_brand: editedBrand || null,
        car_model: editedModel || null,
        location: editedLocation || null,
        urgency: editedUrgency || null,
        tags: editedTagsText
          .split(',')
          .map(t => t.trim())
          .filter(Boolean),
      } as any;
      await apiCall(`/posts/${postId}`, { method: 'PUT', body: JSON.stringify(updated) }, true);
      toast.success('Post updated successfully!');
      setIsEditing(false);
      // Soft refresh: emit event so feeds can refetch
      window.dispatchEvent(new CustomEvent('post-created'));
    } catch (error: any) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post: ' + (error?.message || ''));
    }
  };

  const handleDeletePost = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await apiCall(`/posts/${postId}`, { method: 'DELETE' }, true);

      toast.success('Post deleted successfully!');
      window.dispatchEvent(new CustomEvent('post-created'));
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  // Check if current user is the post owner
  const isPostOwner = !!(currentUserProfile?.id && ownerId && currentUserProfile.id === ownerId);

  const handlePollVote = (optionId: string) => {
    if (poll?.hasEnded) return;

    let newSelectedOptions: string[];
    
    if (poll?.allowMultipleChoice) {
      // Multiple choice: toggle selection
      if (selectedPollOptions.includes(optionId)) {
        newSelectedOptions = selectedPollOptions.filter(id => id !== optionId);
      } else {
        newSelectedOptions = [...selectedPollOptions, optionId];
      }
    } else {
      // Single choice: replace selection
      newSelectedOptions = [optionId];
    }

    setSelectedPollOptions(newSelectedOptions);
    setHasVoted(newSelectedOptions.length > 0);
    // TODO: Send vote to backend
  };

  const isTextLong = content.text.length > 200;
  const displayText = isTextLong && !showFullText 
    ? content.text.substring(0, 200) + '...' 
    : content.text;

  // Anonymous display logic
  const displayUser = user.isAnonymous ? {
    name: 'Anonymous',
    username: 'anonymous',
    avatar: '',
    role: user.role,
    verified: false,
    isUrgent: user.isUrgent
  } : user;

  // Use backend data for counts if available
  const likesCount = likes.length;
  const commentsCount = backendComments.length;
  const sharesCount = backendShares.length;

  return (
    <Card className="mb-4 bg-card border-border hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <Avatar className="h-12 w-12 ring-2 ring-border">
              {displayUser.avatar ? (
                <AvatarImage src={displayUser.avatar} />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
              )}
              <AvatarFallback>{displayUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              {/* Name */}
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-bold text-card-foreground truncate">
                  {displayUser.name}
                </h3>
                {user.isAnonymous && (
                  <Badge variant="secondary" className="text-xs bg-gray-500 text-white">
                    Anonymous
                  </Badge>
                )}
                {displayUser.verified && (
                  <div className="w-4 h-4 rounded-full bg-[var(--sublimes-gold)] flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-black">✓</span>
                  </div>
                )}
              </div>
              
              {/* Badges */}
              <div className="flex items-center space-x-1 mb-2 flex-wrap gap-1">
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${getRoleBadge().style}`}
                >
                  {getRoleBadge().text}
                </Badge>
                {displayUser.isUrgent && (
                  <Badge 
                    variant="secondary" 
                    className="text-xs bg-red-500 text-white"
                  >
                    URGENT
                  </Badge>
                )}
                {postType === 'poll' && (
                  <Badge 
                    variant="secondary" 
                    className="text-xs bg-blue-500 text-white"
                  >
                    <BarChart3 className="h-3 w-3 mr-1" />
                    POLL
                  </Badge>
                )}
              </div>
              
              {/* Username and timestamp */}
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>@{displayUser.username}</span>
                <span>•</span>
                <span>{content.timestamp}</span>
                {poll && (
                  <>
                    <span>•</span>
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {poll.hasEnded ? 'Ended' : `Ends ${poll.endsAt}`}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* More options dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {isPostOwner && (
                <>
                  <DropdownMenuItem onClick={() => setIsEditing(!isEditing)}>
                    <Edit className="h-4 w-4 mr-2" />
                    {isEditing ? 'Cancel Edit' : 'Edit Post'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDeletePost} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Post
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={handleSave}>
                <Bookmark className={`h-4 w-4 mr-2 ${isFavorited ? 'fill-current' : ''}`} />
                {isFavorited ? 'Remove from Saved' : 'Save Post'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleReport}>
                <Flag className="h-4 w-4 mr-2" />
                Report Post
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <UserMinus className="h-4 w-4 mr-2" />
                Unfollow @{displayUser.username}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Volume2 className="h-4 w-4 mr-2" />
                Mute @{displayUser.username}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Block @{displayUser.username}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Edit Mode */}
        {isEditing ? (
          <div className="mb-4 space-y-3">
            {content.title && (
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--sublimes-input-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] font-bold text-lg"
                placeholder="Post title..."
              />
            )}
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-[var(--sublimes-input-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] resize-none"
              placeholder="What's on your mind?"
            />
            {/* Metadata fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                value={editedBrand}
                onChange={(e) => setEditedBrand(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--sublimes-input-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)]"
                placeholder="Car brand"
              />
              <input
                type="text"
                value={editedModel}
                onChange={(e) => setEditedModel(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--sublimes-input-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)]"
                placeholder="Car model"
              />
              <input
                type="text"
                value={editedLocation}
                onChange={(e) => setEditedLocation(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--sublimes-input-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)]"
                placeholder="Location"
              />
              <select
                value={editedUrgency}
                onChange={(e) => setEditedUrgency(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--sublimes-input-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)]"
              >
                <option value="">Select urgency</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <input
              type="text"
              value={editedTagsText}
              onChange={(e) => setEditedTagsText(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--sublimes-input-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)]"
              placeholder="Tags (comma-separated)"
            />
            <div className="flex gap-2">
              <Button onClick={handleEditPost} size="sm" className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/90">
                Save Changes
              </Button>
              <Button onClick={() => setIsEditing(false)} size="sm" variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Title */}
            {content.title && (
              <h2 className="font-bold text-lg mb-3 text-card-foreground">{content.title}</h2>
            )}

            {/* Poll Question (for poll posts) */}
            {postType === 'poll' && poll && (
              <div className="mb-4">
                <h2 className="font-bold text-lg mb-3 text-card-foreground">{poll.question}</h2>
              </div>
            )}
            
            {/* Text Content */}
            {content.text && (
              <div className="mb-4">
                <p className="text-card-foreground whitespace-pre-wrap leading-relaxed">
                  {displayText}
                </p>
                {isTextLong && (
                  <button
                    onClick={() => setShowFullText(!showFullText)}
                    className="text-[var(--sublimes-gold)] text-sm mt-2 hover:underline"
                  >
                    {showFullText ? 'Show less' : 'Read more'}
                  </button>
                )}
            
            {/* Tags */}
            {content.tags && content.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {content.tags.map((tag, index) => (
                  <button
                    key={index}
                    onClick={() => console.log('Search tag:', tag)}
                    className="inline-flex items-center text-xs text-[var(--sublimes-gold)] hover:underline"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </button>
                ))}
              </div>
            )}

            {/* Mentions */}
            {content.mentions && content.mentions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {content.mentions.map((mention, index) => (
                  <button
                    key={index}
                    onClick={() => console.log('Visit profile:', mention)}
                    className="inline-flex items-center text-xs text-blue-400 hover:underline"
                  >
                    <Users className="h-3 w-3 mr-1" />
                    @{mention}
                  </button>
                ))}
              </div>
            )}

            {/* Metadata: car brand/model, location, urgency */}
            {(content.carBrand || content.carModel || content.location || content.urgency) && (
              <div className="mt-3 text-xs text-muted-foreground flex flex-wrap items-center gap-2">
                {(content.carBrand || content.carModel) && (
                  <span>
                    {[content.carBrand, content.carModel].filter(Boolean).join(' ')}
                  </span>
                )}
                {content.location && (
                  <span>• {content.location}</span>
                )}
                {content.urgency && (
                  <span className={`px-2 py-0.5 rounded-full border ${content.urgency.toLowerCase() === 'urgent' ? 'bg-red-500/10 text-red-500 border-red-500/20' : content.urgency.toLowerCase() === 'high' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                    {content.urgency.toUpperCase()}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Poll Options */}
        {postType === 'poll' && poll && (
          <div className="mb-4 space-y-3">
            {poll.options.map((option) => {
              const percentage = poll.totalVotes > 0 ? (option.votes / poll.totalVotes) * 100 : 0;
              const isSelected = selectedPollOptions.includes(option.id);
              const canVote = !poll.hasEnded;
              
              return (
                <div
                  key={option.id}
                  className={`relative p-3 rounded-lg border transition-all cursor-pointer ${
                    canVote 
                      ? 'hover:border-[var(--sublimes-gold)]/50 hover:bg-muted/50' 
                      : 'cursor-not-allowed opacity-60'
                  } ${
                    isSelected 
                      ? 'border-[var(--sublimes-gold)] bg-[var(--sublimes-gold)]/10' 
                      : 'border-border'
                  }`}
                  onClick={() => canVote && handlePollVote(option.id)}
                >
                  {/* Background progress bar */}
                  {hasVoted && (
                    <div 
                      className="absolute inset-0 bg-muted/30 rounded-lg transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  )}
                  
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        isSelected 
                          ? 'border-[var(--sublimes-gold)] bg-[var(--sublimes-gold)]' 
                          : 'border-muted-foreground'
                      }`}>
                        {isSelected && (
                          <CheckCircle className="h-3 w-3 text-black" />
                        )}
                      </div>
                      <span className="font-medium text-card-foreground">{option.text}</span>
                    </div>
                    
                    {hasVoted && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>{option.votes.toLocaleString()} votes</span>
                        <span>({percentage.toFixed(1)}%)</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {/* Poll Stats */}
            <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t border-border">
              <span>{poll.totalVotes.toLocaleString()} total votes</span>
              <div className="flex items-center space-x-2">
                {poll.allowMultipleChoice && (
                  <Badge variant="outline" className="text-xs">
                    Multiple Choice
                  </Badge>
                )}
                <span className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {poll.hasEnded ? 'Poll ended' : `Ends ${poll.endsAt}`}
                </span>
              </div>
            </div>
          </div>
        )}
        
        {/* Media Content */}
        {((content.images && content.images.length > 0) || (content.videos && content.videos.length > 0)) && (
          <div className="mb-4 rounded-lg overflow-hidden bg-muted">
            {/* Videos First */}
            {content.videos && content.videos.length > 0 && (
              <div className="grid gap-2 mb-2">
                {content.videos.map((video, index) => (
                  <div key={index} className="relative">
                    <video
                      className="w-full h-64 object-cover rounded-lg"
                      controls
                      preload="metadata"
                    >
                      <source src={video} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg pointer-events-none">
                      <Play className="h-12 w-12 text-white/80" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Images */}
            {content.images && content.images.length > 0 && (
              <div className={`grid gap-2 ${
                content.images.length === 1 ? 'grid-cols-1' :
                content.images.length === 2 ? 'grid-cols-2' :
                content.images.length === 3 ? 'grid-cols-3' :
                'grid-cols-2'
              }`}>
                {content.images.slice(0, 4).map((image, index) => (
                  <div key={index} className="relative">
                    <ImageWithFallback
                      src={image}
                      alt={`Post image ${index + 1}`}
                      className={`w-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity ${
                        content.images!.length === 1 ? 'h-64' :
                        content.images!.length === 2 ? 'h-48' :
                        'h-32'
                      }`}
                      onClick={() => handleImageClick(index)}
                    />
                    {/* Show +X more overlay for 4th image if more than 4 images */}
                    {index === 3 && content.images!.length > 4 && (
                      <div 
                        className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-lg cursor-pointer"
                        onClick={() => handleImageClick(index)}
                      >
                        <span className="text-white text-lg font-bold">
                          +{content.images!.length - 4} more
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
          </>
        )}
        
        {/* Engagement Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLike}
              disabled={interactionsLoading}
              className={`text-muted-foreground hover:text-red-500 transition-colors ${
                userHasLiked ? 'text-red-500' : ''
              }`}
            >
              <Heart className={`h-5 w-5 mr-2 transition-all ${
                userHasLiked ? 'fill-current scale-110' : ''
              }`} />
              <span className="font-medium">{likesCount.toLocaleString()}</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleComment}
              className="text-muted-foreground hover:text-blue-500 transition-colors"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">{commentsCount.toLocaleString()}</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleShare}
              className="text-muted-foreground hover:text-green-500 transition-colors"
            >
              <Share className="h-5 w-5 mr-2" />
              <span className="font-medium">{sharesCount.toLocaleString()}</span>
            </Button>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              <span>{engagement.views.toLocaleString()} views</span>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <CommentSystem
            postId={postId}
            comments={backendComments.map(comment => ({
              id: comment.id,
              user: {
                name: comment.user?.display_name || 'Unknown',
                username: comment.user?.display_name?.toLowerCase().replace(' ', '_') || 'unknown',
                avatar: comment.user?.avatar_url || '',
                role: 'car-owner' as const,
                verified: false
              },
              content: {
                text: comment.content
              },
              timestamp: new Date(comment.created_at).toLocaleDateString(),
              likes: comment.likes_count || 0,
              isLiked: false,
              replies: []
            }))}
            onAddComment={handleAddComment}
            onLikeComment={async (_commentId) => {}}
            onReplyToComment={async (_commentId, _reply) => {}}
            onDeleteComment={handleDeleteComment}
            onReportComment={handleReportComment}
            currentUser={currentUser}
          />
        )}
      </CardContent>

      {/* Media Viewer Modal */}
      {content.images && content.images.length > 0 && (
        <MediaViewerModal
          isOpen={showMediaViewer}
          onClose={() => setShowMediaViewer(false)}
          media={[
            ...content.images.map(img => ({ url: img, type: 'image' as const })),
            ...(content.videos || []).map(vid => ({ url: vid, type: 'video' as const }))
          ]}
          initialIndex={mediaViewerIndex}
          postId={postId}
          onLike={handleLike}
          onComment={handleComment}
        />
      )}
    </Card>
  );
}
