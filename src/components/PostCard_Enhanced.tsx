import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark, Flag, UserMinus, Volume2, Play } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent, CardHeader } from './ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { MediaViewerModal } from './MediaViewerModal';
import { toast } from 'sonner';
import { useSocialInteractions } from '../hooks';
import CommentsPane from '../features/comments/CommentsPane';

interface PostCardEnhancedProps {
  postId: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    role: 'admin' | 'editor' | 'car_owner' | 'garage_owner' | 'car_browser';
    verified: boolean;
  };
  content: {
    title?: string;
    text: string;
    images?: string[];
    videos?: string[];
    timestamp: string;
    tags?: string[];
    carBrand?: string;
    carModel?: string;
    location?: string;
    urgency?: string;
  };
  views?: number;
  onReport?: (postId: string) => void;
  onBlock?: (userId: string) => void;
}

export function PostCardEnhanced({
  postId,
  user,
  content,
  views: _views = 0,
  onReport,
  onBlock,
}: PostCardEnhancedProps) {
  const [showFullText, setShowFullText] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showMediaViewer, setShowMediaViewer] = useState(false);
  const [mediaViewerIndex, setMediaViewerIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  // Social interactions hook
  const {
    likeCount,
    shareCount,
    userHasLiked,
    toggleLike,
    sharePost,
    toggleFavorite,
    checkIfFavorited,
    loading,
  } = useSocialInteractions(postId);

  // Check if post is favorited on mount
  useEffect(() => {
    const checkFavorite = async () => {
      if (checkIfFavorited) {
        try {
          const favorited = await checkIfFavorited('post', postId);
          setIsFavorited(favorited);
        } catch (error) {
          // Silently fail if user is not authenticated or table doesn't exist
          console.debug('Could not check favorite status:', error);
          setIsFavorited(false);
        }
      }
    };
    checkFavorite();
  }, [postId, checkIfFavorited]);

  const handleLike = async () => {
    await toggleLike();
  };

  const handleShare = async (platform?: string) => {
    await sharePost(platform);
    toast.success('Post shared!');
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const { error } = await toggleFavorite('post', postId);
    if (!error) {
      // Toggle the local state
      setIsFavorited(!isFavorited);
    }
  };

  const getRoleBadge = (role: string) => {
    const badges = {
      admin: { text: 'Admin', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
      editor: { text: 'Editor', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
      car_owner: { text: 'Car Owner', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
      garage_owner: { text: 'Garage', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
      car_browser: { text: 'Browser', color: 'bg-gray-500/10 text-gray-500 border-gray-500/20' },
    };
    return badges[role as keyof typeof badges] || badges.car_browser;
  };

  const badge = getRoleBadge(user.role);
  const textPreview = content.text.slice(0, 280);
  const shouldTruncate = content.text.length > 280;
  const images = content.images ?? [];
  const videos = content.videos ?? [];

  return (
    <Card className="bg-[#1A1F2E] border-[#2A3441] hover:border-[#D4AF37]/30 transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12 border-2 border-[#D4AF37]/20">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-[#D4AF37]/10 text-[#D4AF37]">
                {user.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-[#E8EAED]">{user.name}</h4>
                {user.verified && (
                  <svg className="h-4 w-4 text-[#D4AF37]" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                )}
                <Badge className={`text-xs ${badge.color}`}>
                  {badge.text}
                </Badge>
              </div>
              <p className="text-sm text-[#8A92A6]">@{user.username} • {content.timestamp}</p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-[#8A92A6] hover:text-[#E8EAED]">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#1A1F2E] border-[#2A3441]">
              <DropdownMenuItem className="text-[#E8EAED] hover:bg-[#2A3441]">
                <Bookmark className="mr-2 h-4 w-4" />
                Save Post
              </DropdownMenuItem>
              <DropdownMenuItem className="text-[#E8EAED] hover:bg-[#2A3441]">
                <Volume2 className="mr-2 h-4 w-4" />
                Mute User
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#2A3441]" />
              <DropdownMenuItem 
                className="text-red-500 hover:bg-red-500/10"
                onClick={() => onReport?.(postId)}
              >
                <Flag className="mr-2 h-4 w-4" />
                Report Post
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-500 hover:bg-red-500/10"
                onClick={() => onBlock?.(user.id)}
              >
                <UserMinus className="mr-2 h-4 w-4" />
                Block User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Title */}
        {content.title && (
          <h3 className="text-xl text-[#E8EAED]">{content.title}</h3>
        )}

        {/* Text Content */}
        <div className="text-[#E8EAED] whitespace-pre-wrap">
          {shouldTruncate && !showFullText ? (
            <>
              {textPreview}...
              <button
                onClick={() => setShowFullText(true)}
                className="text-[#D4AF37] hover:underline ml-2"
              >
                Show more
              </button>
            </>
          ) : (
            <>
              {content.text}
              {shouldTruncate && showFullText && (
                <button
                  onClick={() => setShowFullText(false)}
                  className="text-[#D4AF37] hover:underline ml-2"
                >
                  Show less
                </button>
              )}
            </>
          )}
        </div>

        {/* Tags */}
        {content.tags && content.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {content.tags.map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20 hover:bg-[#D4AF37]/20 cursor-pointer"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Metadata Row */}
        {(content.carBrand || content.carModel || content.location || content.urgency) && (
          <div className="text-sm text-[#8A92A6] flex flex-wrap items-center gap-2">
            {(content.carBrand || content.carModel) && (
              <span>
                {[content.carBrand, content.carModel].filter(Boolean).join(' ')}
              </span>
            )}
            {content.location && (
              <span>• {content.location}</span>
            )}
            {content.urgency && (
              <span className={`px-2 py-0.5 rounded-full border ${content.urgency.toLowerCase() === 'urgent' ? 'bg-red-500/10 text-red-400 border-red-500/20' : content.urgency.toLowerCase() === 'high' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                {content.urgency.toUpperCase()}
              </span>
            )}
          </div>
        )}

        {/* Images */}
        {images.length > 0 && (
          <div className={`grid gap-2 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {images.slice(0, 4).map((image, index) => (
              <div
                key={index}
                className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => {
                  setMediaViewerIndex(index);
                  setShowMediaViewer(true);
                }}
              >
                <ImageWithFallback
                  src={image}
                  alt={`Post image ${index + 1}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                {images.length > 4 && index === 3 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-2xl text-white">+{images.length - 4}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Videos */}
        {videos.length > 0 && (
          <div className="space-y-2">
            {videos.map((_, index) => (
              <div key={index} className="relative aspect-video rounded-lg overflow-hidden bg-black/50 flex items-center justify-center cursor-pointer group">
                <Play className="h-16 w-16 text-white/80 group-hover:text-white group-hover:scale-110 transition-all" />
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons with Counts */}
        <div className="flex items-center gap-2 pt-2 border-t border-[#2A3441]">
          <Button
            variant="ghost"
            size="sm"
            className={`flex-1 gap-2 ${
              userHasLiked
                ? 'text-red-500 hover:text-red-400'
                : 'text-[#8A92A6] hover:text-[#E8EAED]'
            }`}
            onClick={handleLike}
            disabled={loading}
          >
            <Heart className={`h-4 w-4 ${userHasLiked ? 'fill-red-500' : ''}`} />
            <span className="hidden sm:inline">{userHasLiked ? 'Liked' : 'Like'}</span>
            {likeCount > 0 && <span className="text-xs">({likeCount})</span>}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex-1 gap-2 text-[#8A92A6] hover:text-[#E8EAED]"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Comment</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={`flex-1 gap-2 ${
              isFavorited
                ? 'text-[#D4AF37] hover:text-[#D4AF37]/80'
                : 'text-[#8A92A6] hover:text-[#E8EAED]'
            }`}
            onClick={handleToggleFavorite}
            disabled={loading}
          >
            <Bookmark className={`h-4 w-4 ${isFavorited ? 'fill-[#D4AF37]' : ''}`} />
            <span className="hidden sm:inline">{isFavorited ? 'Saved' : 'Save'}</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 gap-2 text-[#8A92A6] hover:text-[#E8EAED]"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Share</span>
                {shareCount > 0 && <span className="text-xs">({shareCount})</span>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#1A1F2E] border-[#2A3441]">
              <DropdownMenuItem onClick={() => handleShare('twitter')} className="text-[#E8EAED] hover:bg-[#2A3441]">
                Share to Twitter
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare('facebook')} className="text-[#E8EAED] hover:bg-[#2A3441]">
                Share to Facebook
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare('whatsapp')} className="text-[#E8EAED] hover:bg-[#2A3441]">
                Share to WhatsApp
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#2A3441]" />
              <DropdownMenuItem onClick={() => handleShare()} className="text-[#E8EAED] hover:bg-[#2A3441]">
                Copy Link
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="pt-4 border-t border-[#2A3441]">
            <CommentsPane postId={postId} />
          </div>
        )}
      </CardContent>

      {/* Media Viewer Modal */}
      {showMediaViewer && images && (
        <MediaViewerModal
          isOpen={showMediaViewer}
          media={images.map((url) => ({ url, type: 'image' as const }))}
          initialIndex={mediaViewerIndex}
          onClose={() => setShowMediaViewer(false)}
        />
      )}
    </Card>
  );
}
