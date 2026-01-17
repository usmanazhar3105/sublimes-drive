/**
 * Universal Interaction Bar
 * Works with any item type: post, listing, garage, event, meetup, repair_bid
 */

import { Heart, Bookmark, Share2, MessageCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { useUniversalInteractions, ItemType } from '../../src/hooks/useUniversalInteractions';
import { useState } from 'react';
import { ShareDialog } from './ShareDialog';

interface InteractionBarProps {
  itemType: ItemType;
  itemId: string;
  className?: string;
  onCommentClick?: () => void;
  showCommentButton?: boolean;
}

export function InteractionBar({
  itemType,
  itemId,
  className,
  onCommentClick,
  showCommentButton = true,
}: InteractionBarProps) {
  const [showShareDialog, setShowShareDialog] = useState(false);
  
  const {
    likeCount,
    saveCount,
    shareCount,
    commentCount,
    userHasLiked,
    userHasSaved,
    toggleLike,
    toggleSave,
    loading,
  } = useUniversalInteractions(itemType, itemId);

  return (
    <>
      <div className={cn('flex items-center gap-4', className)}>
        {/* Like Button */}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'gap-2',
            userHasLiked && 'text-red-500'
          )}
          onClick={toggleLike}
          disabled={loading}
        >
          <Heart
            className={cn(
              'h-5 w-5',
              userHasLiked && 'fill-current'
            )}
          />
          <span className="text-sm font-medium">{likeCount}</span>
        </Button>

        {/* Comment Button */}
        {showCommentButton && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={onCommentClick}
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm font-medium">{commentCount}</span>
          </Button>
        )}

        {/* Save Button */}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'gap-2',
            userHasSaved && 'text-blue-500'
          )}
          onClick={toggleSave}
          disabled={loading}
        >
          <Bookmark
            className={cn(
              'h-5 w-5',
              userHasSaved && 'fill-current'
            )}
          />
          <span className="text-sm font-medium">{saveCount}</span>
        </Button>

        {/* Share Button */}
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() => setShowShareDialog(true)}
        >
          <Share2 className="h-5 w-5" />
          <span className="text-sm font-medium">{shareCount}</span>
        </Button>
      </div>

      {/* Share Dialog */}
      <ShareDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        itemType={itemType}
        itemId={itemId}
      />
    </>
  );
}
