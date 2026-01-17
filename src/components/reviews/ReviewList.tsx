/**
 * Review List Component
 * Display list of reviews with filters and sorting
 */

import { useState } from 'react';
import { ReviewCard } from './ReviewCard';
import { RatingStars } from './RatingStars';
import { Button } from '../ui/button';
import { Star, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface Review {
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
}

interface ReviewListProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
  currentUserId?: string;
  onMarkHelpful?: (reviewId: string) => void;
  onEdit?: (reviewId: string) => void;
  onDelete?: (reviewId: string) => void;
  helpfulReviewIds?: string[];
}

type SortOption = 'recent' | 'helpful' | 'rating-high' | 'rating-low';
type FilterOption = 'all' | '5' | '4' | '3' | '2' | '1';

export function ReviewList({
  reviews,
  averageRating,
  totalReviews,
  ratingDistribution,
  currentUserId,
  onMarkHelpful,
  onEdit,
  onDelete,
  helpfulReviewIds = [],
}: ReviewListProps) {
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  // Filter reviews
  const filteredReviews = reviews.filter(review => {
    if (filterBy === 'all') return true;
    return review.rating === parseInt(filterBy);
  });

  // Sort reviews
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'helpful':
        return b.helpful_count - a.helpful_count;
      case 'rating-high':
        return b.rating - a.rating;
      case 'rating-low':
        return a.rating - b.rating;
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="border rounded-lg p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Average Rating */}
          <div className="flex flex-col items-center justify-center sm:border-r sm:pr-6">
            <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
            <RatingStars rating={averageRating} size="md" className="my-2" />
            <p className="text-sm text-muted-foreground">
              {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingDistribution[rating] || 0;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

              return (
                <div key={rating} className="flex items-center gap-2">
                  <button
                    onClick={() => setFilterBy(rating.toString() as FilterOption)}
                    className="flex items-center gap-1 text-sm hover:underline"
                  >
                    <span>{rating}</span>
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  </button>
                  
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  
                  <span className="text-sm text-muted-foreground w-8 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Filter */}
        <Select value={filterBy} onValueChange={(value) => setFilterBy(value as FilterOption)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            <SelectItem value="5">5 Stars</SelectItem>
            <SelectItem value="4">4 Stars</SelectItem>
            <SelectItem value="3">3 Stars</SelectItem>
            <SelectItem value="2">2 Stars</SelectItem>
            <SelectItem value="1">1 Star</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="helpful">Most Helpful</SelectItem>
            <SelectItem value="rating-high">Highest Rating</SelectItem>
            <SelectItem value="rating-low">Lowest Rating</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {(filterBy !== 'all' || sortBy !== 'recent') && (
          <Button
            variant="outline"
            onClick={() => {
              setFilterBy('all');
              setSortBy('recent');
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Reviews */}
      <div className="space-y-4">
        {sortedReviews.length === 0 ? (
          <div className="text-center py-12 border rounded-lg">
            <p className="text-muted-foreground">
              {filterBy !== 'all' 
                ? `No ${filterBy}-star reviews yet`
                : 'No reviews yet. Be the first to review!'}
            </p>
          </div>
        ) : (
          sortedReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              currentUserId={currentUserId}
              onMarkHelpful={onMarkHelpful}
              onEdit={onEdit}
              onDelete={onDelete}
              isHelpful={helpfulReviewIds.includes(review.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
