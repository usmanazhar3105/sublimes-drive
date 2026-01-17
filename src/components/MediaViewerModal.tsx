import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { VisuallyHidden } from './ui/visually-hidden';
import { Button } from './ui/button';
import { X, ChevronLeft, ChevronRight, Download, Share2, Heart, MessageCircle } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface MediaItem {
  url: string;
  type: 'image' | 'video';
  caption?: string;
}

interface MediaViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: MediaItem[];
  initialIndex: number;
  postId?: string;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
}

export function MediaViewerModal({ 
  isOpen, 
  onClose, 
  media, 
  initialIndex, 
  postId,
  onLike,
  onComment 
}: MediaViewerModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          event.preventDefault();
          goToNext();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex]);

  if (!media || media.length === 0) return null;

  const currentMedia = media[currentIndex];
  const hasMultiple = media.length > 1;

  const goToPrevious = () => {
    setCurrentIndex(prev => prev > 0 ? prev - 1 : media.length - 1);
  };

  const goToNext = () => {
    setCurrentIndex(prev => prev < media.length - 1 ? prev + 1 : 0);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(currentMedia.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sublimes-drive-media-${Date.now()}.${currentMedia.type === 'image' ? 'jpg' : 'mp4'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this from Sublimes Drive',
          url: currentMedia.url
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(currentMedia.url);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (postId && onLike) {
      onLike(postId);
    }
  };

  const handleComment = () => {
    if (postId && onComment) {
      onComment(postId);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] p-0 bg-black/95 border-none">
        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle>Media Viewer</DialogTitle>
            <DialogDescription>
              View and interact with media content. Use arrow keys to navigate between images/videos.
            </DialogDescription>
          </DialogHeader>
        </VisuallyHidden>
        <div className="relative w-full h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm">
            <div className="flex items-center space-x-4">
              {hasMultiple && (
                <div className="text-white text-sm">
                  {currentIndex + 1} / {media.length}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`text-white hover:bg-white/20 ${isLiked ? 'text-red-500' : ''}`}
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleComment}
                className="text-white hover:bg-white/20"
              >
                <MessageCircle className="h-5 w-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="text-white hover:bg-white/20"
              >
                <Share2 className="h-5 w-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="text-white hover:bg-white/20"
              >
                <Download className="h-5 w-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Media Content */}
          <div className="flex-1 flex items-center justify-center relative overflow-hidden">
            {currentMedia.type === 'image' ? (
              <ImageWithFallback
                src={currentMedia.url}
                alt="Media content"
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <video
                src={currentMedia.url}
                controls
                autoPlay
                className="max-w-full max-h-full object-contain"
                onLoadStart={() => console.log('Video loading started')}
                onError={(e) => console.error('Video error:', e)}
              />
            )}

            {/* Navigation Arrows */}
            {hasMultiple && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12 rounded-full"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12 rounded-full"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}
          </div>

          {/* Caption */}
          {currentMedia.caption && (
            <div className="p-4 bg-black/50 backdrop-blur-sm">
              <p className="text-white text-sm">{currentMedia.caption}</p>
            </div>
          )}

          {/* Thumbnail Navigation */}
          {hasMultiple && (
            <div className="flex items-center justify-center space-x-2 p-4 bg-black/50 backdrop-blur-sm overflow-x-auto">
              {media.map((item, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentIndex 
                      ? 'border-[var(--sublimes-gold)]' 
                      : 'border-transparent hover:border-white/30'
                  }`}
                >
                  {item.type === 'image' ? (
                    <ImageWithFallback
                      src={item.url}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-black/70 flex items-center justify-center">
                      <div className="w-4 h-4 bg-white/80 rounded-full flex items-center justify-center">
                        <div className="w-0 h-0 border-l-2 border-l-black border-y-1 border-y-transparent ml-0.5"></div>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}