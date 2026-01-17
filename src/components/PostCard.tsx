import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share, Eye, MoreHorizontal, Bookmark, Flag, UserMinus, Volume2, AlertTriangle, Play, BarChart3, CheckCircle, Clock, Tag, Users } from 'lucide-react';
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
import { useCommunityInteractions } from '../hooks/useCommunityInteractions';

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
  isLiked?: boolean;
  isSaved?: boolean;
  onInteraction?: (type: 'like' | 'comment' | 'share' | 'save' | 'report' | 'vote', postId: string, data?: any) => void;
  postId: string;
}

export function PostCard({ 
  user, 
  content, 
  engagement, 
  poll, 
  postType = 'regular', 
  isLiked = false, 
  isSaved = false, 
  onInteraction, 
  postId 
}: PostCardProps) {
  const { togglePostLike, togglePostSave, getComments, loading } = useCommunityInteractions();
  
  const [localLiked, setLocalLiked] = useState(isLiked);
  const [localSaved, setLocalSaved] = useState(isSaved);
  const [localLikes, setLocalLikes] = useState(engagement.likes);
  const [localShares, setLocalShares] = useState(engagement.shares);
  const [showFullText, setShowFullText] = useState(false);
  const [selectedPollOptions, setSelectedPollOptions] = useState<string[]>(poll?.userVotes || []);
  const [hasVoted, setHasVoted] = useState((poll?.userVotes || []).length > 0);
  const [showComments, setShowComments] = useState(false);
  const [showMediaViewer, setShowMediaViewer] = useState(false);
  const [mediaViewerIndex, setMediaViewerIndex] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  // Load comments from database when showing comments
  useEffect(() => {
    if (showComments) {
      loadComments();
    }
  }, [showComments]);

  const loadComments = async () => {
    setCommentsLoading(true);
    const data = await getComments(postId);
    if (data) {
      setComments(data);
    }
    setCommentsLoading(false);
  };

  // Current user for comments
  const currentUser = {
    name: 'You',
    username: 'your_username',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
    role: 'car-owner' as const,
    verified: true
  };

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
    // Optimistic update
    const newLiked = !localLiked;
    setLocalLiked(newLiked);
    setLocalLikes(prev => newLiked ? prev + 1 : prev - 1);
    
    // Call database
    const result = await togglePostLike(postId);
    if (result) {
      setLocalLiked(result.liked);
      setLocalLikes(result.like_count);
    }
    
    onInteraction?.('like', postId);
  };

  const handleSave = async () => {
    // Optimistic update
    setLocalSaved(!localSaved);
    
    // Call database
    const result = await togglePostSave(postId);
    if (result) {
      setLocalSaved(result.saved);
    }
    
    onInteraction?.('save', postId);
  };

  const handleShare = async () => {
    setLocalShares(prev => prev + 1);
    onInteraction?.('share', postId);
    
    // Native share if available, otherwise copy to clipboard
    if (navigator.share) {
      navigator.share({
        title: content.title || poll?.question || `Post by ${user.name}`,
        text: postType === 'poll' ? poll?.question : content.text,
        url: `${window.location.origin}/post/${postId}`
      });
    } else {
      const success = await copyToClipboard(`${window.location.origin}/post/${postId}`);
      if (success) {
        toast.success('Link copied to clipboard!');
      } else {
        toast.info('Share via: ' + `${window.location.origin}/post/${postId}`);
      }
    }
  };

  const handleComment = () => {
    setShowComments(!showComments);
    onInteraction?.('comment', postId);
  };

  const handleImageClick = (index: number) => {
    setMediaViewerIndex(index);
    setShowMediaViewer(true);
  };

  const handleAddComment = async (postId: string, comment: any) => {
    // Refresh comments from backend to get the actual saved comment
    await loadComments();
  };

  const handleLikeComment = (commentId: string) => {
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          isLiked: !comment.isLiked,
          likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
        };
      }
      return comment;
    }));
  };

  const handleReplyToComment = async (commentId: string, reply: any) => {
    // Refresh comments from backend to get the actual saved reply
    await loadComments();
  };

  const handleDeleteComment = (commentId: string) => {
    setComments(prev => prev.filter(comment => comment.id !== commentId));
    toast.success('Comment deleted!');
  };

  const handleReportComment = (commentId: string) => {
    toast.success('Comment reported. We will review it shortly.');
  };

  const handleReport = () => {
    onInteraction?.('report', postId);
  };

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
    onInteraction?.('vote', postId, { optionIds: newSelectedOptions });
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
              <DropdownMenuItem onClick={handleSave}>
                <Bookmark className={`h-4 w-4 mr-2 ${localSaved ? 'fill-current' : ''}`} />
                {localSaved ? 'Remove from Saved' : 'Save Post'}
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
        
        {/* Engagement Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLike}
              className={`text-muted-foreground hover:text-red-500 transition-colors ${
                localLiked ? 'text-red-500' : ''
              }`}
            >
              <Heart className={`h-5 w-5 mr-2 transition-all ${
                localLiked ? 'fill-current scale-110' : ''
              }`} />
              <span className="font-medium">{localLikes.toLocaleString()}</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleComment}
              className="text-muted-foreground hover:text-blue-500 transition-colors"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">{engagement.comments.toLocaleString()}</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleShare}
              className="text-muted-foreground hover:text-green-500 transition-colors"
            >
              <Share className="h-5 w-5 mr-2" />
              <span className="font-medium">{localShares.toLocaleString()}</span>
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
            comments={comments}
            onAddComment={handleAddComment}
            onLikeComment={handleLikeComment}
            onReplyToComment={handleReplyToComment}
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