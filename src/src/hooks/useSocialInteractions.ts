import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner';

export interface Like {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  body: string; // Changed from 'content' to 'body' to match schema
  parent_id?: string | null;
  likes_count?: number;
  created_at: string;
  updated_at?: string;
  user?: {
    display_name?: string;
    avatar_url?: string;
  };
}

export interface Share {
  id: string;
  user_id: string;
  post_id: string;
  platform?: string;
  created_at: string;
}

export function useSocialInteractions(postId?: string) {
  const [likes, setLikes] = useState<Like[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [shares, setShares] = useState<Share[]>([]);
  const [userHasLiked, setUserHasLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [postStats, setPostStats] = useState<{
    like_count: number;
    comment_count: number;
    share_count: number;
    view_count: number;
  } | null>(null);

  // Fetch likes for a post
  useEffect(() => {
    if (postId) {
      fetchLikes();
      fetchComments();
      fetchShares();
      fetchPostStats();
      const unsubscribeLikes = subscribeToLikes();
      const unsubscribeComments = subscribeToComments();
      const unsubscribeStats = subscribeToPostStats();
      
      return () => {
        if (unsubscribeLikes) unsubscribeLikes();
        if (unsubscribeComments) unsubscribeComments();
        if (unsubscribeStats) unsubscribeStats();
      };
    }
  }, [postId]);

  async function fetchLikes() {
    if (!postId) return;

    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();

      // Fetch from post_likes table
      const { data, error: fetchError } = await supabase
        .from('post_likes')
        .select('*')
        .eq('post_id', postId);

      if (fetchError) {
        // If table doesn't exist yet
        if (fetchError.code === 'PGRST204' || fetchError.code === '42P01' || fetchError.code === '42703') {
          console.warn('⚠️ Likes not available yet (waiting for schema)');
          setLikes([]);
          setError(null);
        } else {
          throw fetchError;
        }
      } else {
        setLikes(data || []);
        
        // Check if current user has liked
        if (user) {
          const hasLiked = data?.some(like => like.user_id === user.id) || false;
          setUserHasLiked(hasLiked);
        }
        
        setError(null);
      }
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching likes:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchComments() {
    if (!postId) return;

    try {
      // Fetch comments first (no FK join to profiles to avoid schema hint dependency)
      const { data: baseComments, error: fetchError } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (fetchError) {
        if (fetchError.code === 'PGRST204' || fetchError.code === '42P01' || fetchError.code === '42703') {
          console.warn('⚠️ Comments not available yet (schema mismatch)');
          setComments([]);
        } else {
          console.error('Error fetching comments:', fetchError);
          throw fetchError;
        }
      } else {
        const rows = baseComments || [];
        const userIds = Array.from(new Set(rows.map((c: any) => c.user_id).filter(Boolean)));
        let profilesById: Record<string, { display_name?: string; avatar_url?: string }> = {};
        if (userIds.length > 0) {
          const { data: profs } = await supabase
            .from('profiles')
            .select('id, display_name, avatar_url')
            .in('id', userIds);
          (profs || []).forEach((p: any) => {
            profilesById[p.id] = { display_name: p.display_name, avatar_url: p.avatar_url };
          });
        }
        // Map 'body' to 'content' for backward compatibility with UI components
        const enriched = rows.map((c: any) => ({
          ...c,
          content: c.body || c.content || '', // Support both 'body' and 'content' columns
          user: profilesById[c.user_id] || {},
        }));
        setComments(enriched);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  }

  async function fetchShares() {
    if (!postId) return;

    try {
      // Shares likely don't exist yet - gracefully handle
      const { data, error: fetchError } = await supabase
        .from('post_shares')
        .select('*')
        .eq('post_id', postId);

      if (fetchError) {
        // Table doesn't exist yet - just set empty array
        if (fetchError.code === '42501' || fetchError.code === '42P01' || fetchError.code === 'PGRST205') {
          console.warn('⚠️ Shares not implemented yet');
          setShares([]);
        } else {
          throw fetchError;
        }
      } else {
        setShares(data || []);
      }
    } catch (err) {
      console.error('Error fetching shares:', err);
      setShares([]);
    }
  }

  function subscribeToLikes() {
    if (!postId) return;

    // Subscribe to post_likes table
    const channel = supabase
      .channel(`post_likes:${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_likes',
          filter: `post_id=eq.${postId}`,
        },
        () => {
          fetchLikes();
          fetchPostStats(); // Also update stats when likes change
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }

  function subscribeToComments() {
    if (!postId) return;

    // Subscribe to comments table
    const channel = supabase
      .channel(`comments:${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`,
        },
        () => {
          fetchComments();
          fetchPostStats(); // Also update stats when comments change
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }

  async function fetchPostStats() {
    if (!postId) return;

    try {
      const { data, error } = await supabase
        .from('post_stats')
        .select('like_count, comment_count, share_count, view_count')
        .eq('post_id', postId)
        .single();

      if (error) {
        // If post_stats doesn't exist, use local counts
        if (error.code === 'PGRST116' || error.code === '42P01') {
          console.debug('post_stats table not available, using local counts');
          return;
        }
        console.error('Error fetching post stats:', error);
      } else if (data) {
        setPostStats(data);
      }
    } catch (err) {
      console.debug('Could not fetch post stats:', err);
    }
  }

  function subscribeToPostStats() {
    if (!postId) return;

    // Subscribe to post_stats table for real-time count updates
    const channel = supabase
      .channel(`post_stats:${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_stats',
          filter: `post_id=eq.${postId}`,
        },
        () => {
          fetchPostStats();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }

  async function toggleLike() {
    if (!postId) return { error: new Error('No post ID') };

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to like posts');
        return { error: new Error('Not authenticated') };
      }

      // Use RPC function for atomic toggle
      const { data, error: rpcError } = await supabase
        .rpc('fn_toggle_like', { p_post_id: postId });

      if (rpcError) {
        console.error('Error toggling like:', rpcError);
        toast.error('Failed to toggle like');
        // If FK fails (post removed), reflect UI state gracefully
        if ((rpcError as any).code === '23503') {
          return { error: new Error('Post not found') };
        }
        throw rpcError;
      }

      // Update local state with response
      // Handle both response formats: { liked: boolean } or { success: true, liked: boolean }
      if (data) {
        const liked = data.liked ?? ((data as any).success === true && (data as any).liked);
        setUserHasLiked(liked);
        // Refetch to get updated list and stats
        fetchLikes();
        fetchPostStats();
        
        if (liked) {
          toast.success('Post liked!');
        } else {
          toast.success('Post unliked');
        }
      }

      return { error: null };
    } catch (err) {
      console.error('Error toggling like:', err);
      return { error: err as Error };
    }
  }

  async function addComment(content: string, parentCommentId?: string) {
    if (!postId || !content.trim()) {
      return { error: new Error('Invalid comment') };
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to comment');
        return { error: new Error('Not authenticated') };
      }

      // Insert into comments table (using 'body' column, not 'content')
      const { data: inserted, error: insertError } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          body: content.trim(),
          parent_id: parentCommentId || null,
        })
        .select('*')
        .single();

      if (insertError) {
        console.error('Error adding comment:', insertError);
        toast.error('Failed to add comment');
        throw insertError;
      }

      // hydrate with current user's profile and map body to content
      let hydrated = inserted as any;
      try {
        const { data: p } = await supabase
          .from('profiles')
          .select('display_name, avatar_url')
          .eq('id', user.id)
          .maybeSingle();
        hydrated = { 
          ...inserted, 
          content: inserted.body || inserted.content || '', // Map body to content
          user: { display_name: p?.display_name, avatar_url: p?.avatar_url } 
        };
      } catch {}
      setComments(prev => [...prev, hydrated]);
      fetchPostStats(); // Update stats after adding comment
      toast.success('Comment added!');

      return { data: hydrated, error: null };
    } catch (err) {
      console.error('Error adding comment:', err);
      return { error: err as Error };
    }
  }

  async function deleteComment(commentId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { error: new Error('Not authenticated') };
      }

      // Delete from comments table
      const { error: deleteError } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id); // Only allow deleting own comments

      if (deleteError) throw deleteError;

      setComments(prev => prev.filter(comment => comment.id !== commentId));
      fetchPostStats(); // Update stats after deleting comment
      toast.success('Comment deleted');

      return { error: null };
    } catch (err) {
      console.error('Error deleting comment:', err);
      toast.error('Failed to delete comment');
      return { error: err as Error };
    }
  }

  async function sharePost(platform?: string) {
    if (!postId) return { error: new Error('No post ID') };

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Track share using RPC function (silently ignore if not deployed)
      const shareType = platform || 'link';
      try {
        const { data, error: rpcError } = await supabase
          .rpc('fn_track_share', { 
            _post_id: postId,
            _share_type: shareType 
          });

        if (!rpcError && data) {
          // Refetch shares to update count
          fetchShares();
        }
      } catch {
        // Silently ignore - RPC may not be deployed
      }

      toast.success('Post shared!');
      return { data, error: null };

    } catch (err) {
      console.error('Error sharing post:', err);
      return { error: err as Error };
    }
  }

  async function checkIfFavorited(itemType: string, itemId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // For posts, check post_saves table
      if (itemType === 'post') {
        // Use maybeSingle() to avoid 406 error when post is not saved
        const { data, error } = await supabase
          .from('post_saves')
          .select('id')
          .eq('user_id', user.id)
          .eq('post_id', itemId)
          .maybeSingle();

        if (error) {
          // PGRST116 = no rows found (not an error, just means not saved)
          if (error.code === 'PGRST116') return false;
          // 42P01 = table doesn't exist, 42501 = permission denied
          if (error.code === '42P01' || error.code === '42501' || error.code === 'PGRST301') {
            console.debug('post_saves table not available or permission denied:', error.message);
            return false;
          }
          // Other errors - log but don't crash
          console.debug('post_saves query error:', error.message);
          return false;
        }
        // Return true if data exists (post is saved)
        return !!data;
      }

      // For other types, check user_favorites
      const { data, error } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('item_type', itemType)
        .eq('item_id', itemId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return false;
        if (error.code === '42P01' || error.code === '42501') return false;
        return false;
      }

      return !!data;
    } catch (err) {
      console.debug('Could not check favorite status:', err);
      return false;
    }
  }

  async function toggleFavorite(itemType: string, itemId: string): Promise<{ error: Error | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to save posts');
        return { error: new Error('Not authenticated') };
      }

      // For posts, use post_saves table with RPC function
      if (itemType === 'post') {
        const { data, error: rpcError } = await supabase
          .rpc('fn_toggle_save', { _post_id: itemId });

        if (rpcError) {
          console.error('Error toggling save:', rpcError);
          toast.error('Failed to toggle save');
          throw rpcError;
        }

        if (data) {
          if (data.saved) {
            toast.success('Post saved!');
          } else {
            toast.success('Post unsaved');
          }
        }

        return { error: null };
      }

      // For other types, use generic user_favorites table
      const isFavorited = await checkIfFavorited(itemType, itemId);

      if (isFavorited) {
        const { error: deleteError } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('item_type', itemType)
          .eq('item_id', itemId);

        if (deleteError) throw deleteError;
        toast.success('Removed from favorites');
      } else {
        const { error: insertError } = await supabase
          .from('user_favorites')
          .insert({
            user_id: user.id,
            item_type: itemType,
            item_id: itemId,
          });

        if (insertError) throw insertError;
        toast.success('Added to favorites');
      }

      return { error: null };
    } catch (err) {
      console.error('Error toggling favorite:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update favorites';
      toast.error(errorMessage);
      return { error: err as Error };
    }
  }

  // Use post_stats if available, otherwise fall back to local counts
  const likeCount = postStats?.like_count ?? likes.length;
  const commentCount = postStats?.comment_count ?? comments.length;
  const shareCount = postStats?.share_count ?? shares.length;

  return {
    likes,
    comments,
    shares,
    userHasLiked,
    loading,
    error,
    toggleLike,
    addComment,
    deleteComment,
    sharePost,
    checkIfFavorited,
    toggleFavorite,
    likeCount,
    commentCount,
    shareCount,
    postStats, // Expose stats for components that need it
  };
}
