/**
 * Reviews Hook
 * For garages, listings, and repair bids
 */

import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner';

export type ReviewItemType = 'garage' | 'listing' | 'repair_bid';

export interface Review {
  id: string;
  item_type: ReviewItemType;
  item_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  content: string;
  images: string[] | null;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  user?: {
    display_name: string;
    avatar_url: string;
  };
}

interface UseReviewsResult {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
  userReview: Review | null;
  loading: boolean;
  error: Error | null;
  
  addReview: (rating: number, title: string, content: string, images?: string[]) => Promise<void>;
  updateReview: (reviewId: string, rating: number, title: string, content: string, images?: string[]) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
  markHelpful: (reviewId: string) => Promise<void>;
  refreshReviews: () => Promise<void>;
}

export function useReviews(
  itemType: ReviewItemType,
  itemId: string | undefined
): UseReviewsResult {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState<{ [key: number]: number }>({});
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (itemId) {
      fetchReviews();
    }
  }, [itemId, itemType]);

  async function fetchReviews() {
    if (!itemId) return;

    try {
      setLoading(true);

      // Fetch all reviews
      const { data, error: fetchError } = await supabase
        .from('reviews')
        .select(`
          *,
          user:profiles!reviews_user_id_fkey (
            display_name,
            avatar_url
          )
        `)
        .eq('item_type', itemType)
        .eq('item_id', itemId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setReviews(data || []);
      setTotalReviews(data?.length || 0);

      // Calculate average rating
      if (data && data.length > 0) {
        const sum = data.reduce((acc, review) => acc + review.rating, 0);
        setAverageRating(sum / data.length);

        // Calculate rating distribution
        const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        data.forEach(review => {
          distribution[review.rating] = (distribution[review.rating] || 0) + 1;
        });
        setRatingDistribution(distribution);
      } else {
        setAverageRating(0);
        setRatingDistribution({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
      }

      // Check if current user has reviewed
      const { data: { user } } = await supabase.auth.getUser();
      if (user && data) {
        const userReviewData = data.find(review => review.user_id === user.id);
        setUserReview(userReviewData || null);
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }

  async function addReview(
    rating: number,
    title: string,
    content: string,
    images?: string[]
  ) {
    if (!itemId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to add a review');
        return;
      }

      const { data, error: insertError } = await supabase
        .from('reviews')
        .insert({
          item_type: itemType,
          item_id: itemId,
          user_id: user.id,
          rating,
          title: title || null,
          content,
          images: images || null,
        })
        .select(`
          *,
          user:profiles!reviews_user_id_fkey (
            display_name,
            avatar_url
          )
        `)
        .single();

      if (insertError) {
        if (insertError.code === '23505') {
          toast.error('You have already reviewed this item');
        } else {
          toast.error('Failed to add review');
        }
        throw insertError;
      }

      await fetchReviews();
      toast.success('Review added successfully!');
    } catch (err) {
      console.error('Error adding review:', err);
      throw err;
    }
  }

  async function updateReview(
    reviewId: string,
    rating: number,
    title: string,
    content: string,
    images?: string[]
  ) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error: updateError } = await supabase
        .from('reviews')
        .update({
          rating,
          title: title || null,
          content,
          images: images || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reviewId)
        .eq('user_id', user.id);

      if (updateError) {
        toast.error('Failed to update review');
        throw updateError;
      }

      await fetchReviews();
      toast.success('Review updated successfully!');
    } catch (err) {
      console.error('Error updating review:', err);
      throw err;
    }
  }

  async function deleteReview(reviewId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error: deleteError } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', user.id);

      if (deleteError) {
        toast.error('Failed to delete review');
        throw deleteError;
      }

      await fetchReviews();
      toast.success('Review deleted successfully');
    } catch (err) {
      console.error('Error deleting review:', err);
      throw err;
    }
  }

  async function markHelpful(reviewId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to mark reviews as helpful');
        return;
      }

      // Check if already marked helpful
      const { data: existing } = await supabase
        .from('review_helpful')
        .select('id')
        .eq('review_id', reviewId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        // Remove helpful mark
        await supabase
          .from('review_helpful')
          .delete()
          .eq('review_id', reviewId)
          .eq('user_id', user.id);

        // Decrement count
        await supabase.rpc('decrement', {
          table_name: 'reviews',
          row_id: reviewId,
          column_name: 'helpful_count'
        });

        toast.success('Removed helpful mark');
      } else {
        // Add helpful mark
        await supabase
          .from('review_helpful')
          .insert({
            review_id: reviewId,
            user_id: user.id,
          });

        // Increment count
        const { data: review } = await supabase
          .from('reviews')
          .select('helpful_count')
          .eq('id', reviewId)
          .single();

        await supabase
          .from('reviews')
          .update({ helpful_count: (review?.helpful_count || 0) + 1 })
          .eq('id', reviewId);

        toast.success('Marked as helpful');
      }

      await fetchReviews();
    } catch (err) {
      console.error('Error marking helpful:', err);
      toast.error('Failed to mark as helpful');
    }
  }

  async function refreshReviews() {
    await fetchReviews();
  }

  return {
    reviews,
    averageRating,
    totalReviews,
    ratingDistribution,
    userReview,
    loading,
    error,
    addReview,
    updateReview,
    deleteReview,
    markHelpful,
    refreshReviews,
  };
}
