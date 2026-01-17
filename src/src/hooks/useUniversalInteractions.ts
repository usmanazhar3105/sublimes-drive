/**
 * Universal Interactions Hook
 * Works with ANY item type: listing, garage, event, meetup, repair_bid, post
 */

import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner';

export type ItemType = 'listing' | 'garage' | 'event' | 'meetup' | 'repair_bid' | 'post';
export type ShareType = 'link' | 'whatsapp' | 'twitter' | 'facebook' | 'email' | 'other';

interface UniversalInteractionsResult {
  // State
  likeCount: number;
  saveCount: number;
  shareCount: number;
  commentCount: number;
  userHasLiked: boolean;
  userHasSaved: boolean;
  comments: any[];
  loading: boolean;
  error: Error | null;
  
  // Actions
  toggleLike: () => Promise<void>;
  toggleSave: () => Promise<void>;
  trackShare: (shareType: ShareType) => Promise<void>;
  addComment: (content: string, parentId?: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  refreshCounts: () => Promise<void>;
}

export function useUniversalInteractions(
  itemType: ItemType,
  itemId: string | undefined
): UniversalInteractionsResult {
  const [likeCount, setLikeCount] = useState(0);
  const [saveCount, setSaveCount] = useState(0);
  const [shareCount, setShareCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [userHasLiked, setUserHasLiked] = useState(false);
  const [userHasSaved, setUserHasSaved] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch all counts and user states
  useEffect(() => {
    if (itemId) {
      fetchCounts();
      fetchComments();
      checkUserStates();
    }
  }, [itemId, itemType]);

  async function fetchCounts() {
    if (!itemId) return;

    try {
      // Fetch likes count
      const { count: likes } = await supabase
        .from('item_likes')
        .select('*', { count: 'exact', head: true })
        .eq('item_type', itemType)
        .eq('item_id', itemId);

      setLikeCount(likes || 0);

      // Fetch saves count
      const { count: saves } = await supabase
        .from('item_saves')
        .select('*', { count: 'exact', head: true })
        .eq('item_type', itemType)
        .eq('item_id', itemId);

      setSaveCount(saves || 0);

      // Fetch shares count
      const { count: shares } = await supabase
        .from('item_shares')
        .select('*', { count: 'exact', head: true })
        .eq('item_type', itemType)
        .eq('item_id', itemId);

      setShareCount(shares || 0);

      // Fetch comments count
      const { count: commentsNum } = await supabase
        .from('item_comments')
        .select('*', { count: 'exact', head: true })
        .eq('item_type', itemType)
        .eq('item_id', itemId);

      setCommentCount(commentsNum || 0);
    } catch (err) {
      console.error('Error fetching counts:', err);
      setError(err as Error);
    }
  }

  async function checkUserStates() {
    if (!itemId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if user has liked
      const { data: likeData } = await supabase
        .from('item_likes')
        .select('id')
        .eq('item_type', itemType)
        .eq('item_id', itemId)
        .eq('user_id', user.id)
        .maybeSingle();

      setUserHasLiked(!!likeData);

      // Check if user has saved
      const { data: saveData } = await supabase
        .from('item_saves')
        .select('id')
        .eq('item_type', itemType)
        .eq('item_id', itemId)
        .eq('user_id', user.id)
        .maybeSingle();

      setUserHasSaved(!!saveData);
    } catch (err) {
      console.error('Error checking user states:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchComments() {
    if (!itemId) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('item_comments')
        .select(`
          *,
          user:profiles!item_comments_user_id_fkey (
            display_name,
            avatar_url
          )
        `)
        .eq('item_type', itemType)
        .eq('item_id', itemId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;
      setComments(data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  }

  async function toggleLike() {
    if (!itemId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to like');
        return;
      }

      // Use RPC function
      const { data, error: rpcError } = await supabase.rpc('fn_toggle_item_like', {
        _item_type: itemType,
        _item_id: itemId
      });

      if (rpcError) {
        console.error('Error toggling like:', rpcError);
        toast.error('Failed to toggle like');
        return;
      }

      if (data) {
        setUserHasLiked(data.liked);
        setLikeCount(data.like_count);
        
        if (data.liked) {
          toast.success('Liked!');
        }
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      toast.error('Failed to toggle like');
    }
  }

  async function toggleSave() {
    if (!itemId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to save');
        return;
      }

      // Use RPC function
      const { data, error: rpcError } = await supabase.rpc('fn_toggle_item_save', {
        _item_type: itemType,
        _item_id: itemId
      });

      if (rpcError) {
        console.error('Error toggling save:', rpcError);
        toast.error('Failed to toggle save');
        return;
      }

      if (data) {
        setUserHasSaved(data.saved);
        setSaveCount(data.save_count);
        
        if (data.saved) {
          toast.success('Saved!');
        } else {
          toast.success('Unsaved');
        }
      }
    } catch (err) {
      console.error('Error toggling save:', err);
      toast.error('Failed to toggle save');
    }
  }

  async function trackShare(shareType: ShareType) {
    if (!itemId) return;

    try {
      // Use RPC function (silently ignore if not deployed)
      const { data, error: rpcError } = await supabase.rpc('fn_track_item_share', {
        _item_type: itemType,
        _item_id: itemId,
        _share_type: shareType
      });

      if (!rpcError && data) {
        setShareCount(data.share_count);
      }

      toast.success('Shared!');
    } catch {
      // Silently ignore - RPC may not be deployed
      toast.success('Shared!');
    }
  }

  async function addComment(content: string, parentId?: string) {
    if (!itemId || !content.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to comment');
        return;
      }

      // Use RPC function
      const { data, error: rpcError } = await supabase.rpc('fn_add_item_comment', {
        _item_type: itemType,
        _item_id: itemId,
        _content: content.trim(),
        _parent_comment_id: parentId || null
      });

      if (rpcError) {
        console.error('Error adding comment:', rpcError);
        toast.error('Failed to add comment');
        return;
      }

      if (data && data.success) {
        setCommentCount(data.comment_count);
        await fetchComments(); // Refresh comments
        toast.success('Comment added!');
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      toast.error('Failed to add comment');
    }
  }

  async function deleteComment(commentId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error: deleteError } = await supabase
        .from('item_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Error deleting comment:', deleteError);
        toast.error('Failed to delete comment');
        return;
      }

      await fetchComments();
      setCommentCount(prev => Math.max(0, prev - 1));
      toast.success('Comment deleted');
    } catch (err) {
      console.error('Error deleting comment:', err);
      toast.error('Failed to delete comment');
    }
  }

  async function refreshCounts() {
    await fetchCounts();
    await fetchComments();
    await checkUserStates();
  }

  return {
    likeCount,
    saveCount,
    shareCount,
    commentCount,
    userHasLiked,
    userHasSaved,
    comments,
    loading,
    error,
    toggleLike,
    toggleSave,
    trackShare,
    addComment,
    deleteComment,
    refreshCounts,
  };
}
