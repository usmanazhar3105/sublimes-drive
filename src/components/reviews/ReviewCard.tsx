/**
 * Review Card Component
 * Display individual review with actions
 */

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { ThumbsUp, Trash2, Edit, MoreVertical } from 'lucide-react';
import { RatingStars } from './RatingStars';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    title: string | null;
    content: string;
    images: string[] | null;
    helpful_count: number;
    created_at: string;
    user?: {
      display_name: string;
      avatar_url: string;
    };
    user_id: string;
  };
  currentUserId?: string;
  onMarkHelpful?: (reviewId: string) => void;
  onEdit?: (reviewId: string) => void;
  onDelete?: (reviewId: string) => void;
  isHelpful?: boolean;
}

export function ReviewCard({
  review,
  currentUserId,
  onMarkHelpful,
  onEdit,
  onDelete,
  isHelpful = false,
}: ReviewCardProps) {
  const [imageError, setImageError] = useState<{ [key: string]: boolean }>({});
  const isOwner = currentUserId === review.user_id;

  return (
    <div className="border rounded-lg p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={review.user?.avatar_url} />
            <AvatarFallback>
              {review.user?.display_name?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <p className="font-medium">
              {review.user?.display_name || 'Anonymous'}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>

        {/* Actions Menu */}
        {isOwner && (onEdit || onDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(review.id)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Review
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem 
                  onClick={() => onDelete(review.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Review
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2">
        <RatingStars rating={review.rating} size="sm" />
        <span className="text-sm font-medium">{review.rating.toFixed(1)}</span>
      </div>

      {/* Title */}
      {review.title && (
        <h4 className="font-semibold">{review.title}</h4>
      )}

      {/* Content */}
      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
        {review.content}
      </p>

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {review.images.map((image, index) => (
            !imageError[image] && (
              <img
                key={index}
                src={image}
                alt={`Review image ${index + 1}`}
                className="rounded-md w-full h-24 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onError={() => setImageError(prev => ({ ...prev, [image]: true }))}
                onClick={() => window.open(image, '_blank')}
              />
            )
          ))}
        </div>
      )}

      {/* Helpful Button */}
      {onMarkHelpful && (
        <div className="flex items-center gap-2 pt-2 border-t">
          <Button
            variant={isHelpful ? "default" : "outline"}
            size="sm"
            onClick={() => onMarkHelpful(review.id)}
            className="gap-2"
          >
            <ThumbsUp className="h-4 w-4" />
            Helpful ({review.helpful_count})
          </Button>
        </div>
      )}
    </div>
  );
}
