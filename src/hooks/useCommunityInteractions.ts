import { useState } from 'react';
import { supabase, apiCall, publicApiCall } from '../utils/supabase/client';
import { toast } from 'sonner';

export function useCommunityInteractions() {
  const [loading, setLoading] = useState(false);

  const isUuid = (id: string) => /^(?!00000000-0000-0000-0000-000000000000)[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(id);

  const togglePostLike = async (postId: string) => {
    try {
      setLoading(true);
      if (!isUuid(postId)) {
        // Skip backend for sample/local IDs like 'meetup_004'
        return { liked: true } as any;
      }
      // ✅ Use direct RPC call instead of Edge Function
      const { data, error } = await supabase.rpc('fn_toggle_like', { p_post_id: postId });
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error toggling post like:', error);
      toast.error('Failed to like post');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const toggleCommentLike = async (commentId: string) => {
    try {
      setLoading(true);
      if (!isUuid(commentId)) {
        return { liked: true } as any;
      }
      // ✅ Use Edge Function endpoint (service role, stable)
      const res = await apiCall(`/comments/${commentId}/like`, { method: 'POST' }, true);
      return res;
    } catch (error: any) {
      console.error('Error toggling comment like:', error);
      toast.error('Failed to like comment');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (postId: string, body: string, parentId?: string, media?: any[]) => {
    try {
      setLoading(true);
      if (!isUuid(postId)) {
        toast.success(parentId ? 'Reply added!' : 'Comment added!');
        return { ok: true } as any;
      }
      // ✅ Use Edge Function to insert into public.comments (supports parent_comment_id)
      const payload: any = { body, parent_id: parentId || null, media: media ?? null };
      const res = await apiCall(`/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }, true);
      toast.success(parentId ? 'Reply added!' : 'Comment added!');
      // Return the created comment id if present; else the response
      return res?.comment?.id ?? res;
    } catch (error: any) {
      // Fallback: direct insert into community_comments (no threading)
      try {
        const { data: userData } = await supabase.auth.getUser();
        const uid = userData?.user?.id;
        if (!uid) throw error;
        const { data, error: insertErr } = await supabase
          .from('community_comments')
          .insert({ post_id: postId, author_id: uid, content: body })
          .select('id')
          .single();
        if (insertErr) throw insertErr;
        toast.success('Comment added!');
        return data?.id ?? true;
      } catch (fallbackErr: any) {
        const msg = fallbackErr?.message || (error instanceof Error ? error.message : typeof error === 'string' ? error : JSON.stringify(error || {}));
        console.error('Error adding comment:', msg);
        toast.error(`Failed to add comment: ${msg}`);
        return null;
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePostSave = async (postId: string) => {
    try {
      setLoading(true);
      if (!isUuid(postId)) {
        toast.success('Post saved!');
        return { saved: true } as any;
      }
      // ✅ Use direct RPC call instead of Edge Function
      const { data, error } = await supabase.rpc('fn_toggle_save', { p_post_id: postId });
      if (error) throw error;
      toast.success((data as any)?.saved ? 'Post saved!' : 'Post unsaved');
      return data;
    } catch (error: any) {
      console.error('Error toggling post save:', error);
      toast.error('Failed to save post');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getPostWithStats = async (postId: string) => {
    try {
      const { data, error } = await supabase.rpc('fn_get_post_with_stats', {
        p_post_id: postId
      });
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error getting post stats:', error);
      return null;
    }
  };

  const getComments = async (postId: string) => {
    try {
      if (!isUuid(postId)) return [] as any[];
      const data = await publicApiCall(`/posts/${postId}/comments`);
      return (data as any)?.comments || [];
    } catch (error: any) {
      console.error('Error getting comments:', error);
      return [];
    }
  };

  return {
    loading,
    togglePostLike,
    toggleCommentLike,
    addComment,
    togglePostSave,
    getPostWithStats,
    getComments
  };
}
