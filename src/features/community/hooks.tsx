import { useCallback, useEffect, useState } from 'react';
import type { CommunityPost, CommunityComment, CommunityReply, ToggleResult, UUID } from './types';
import { listPosts, createPost, togglePostLike, listComments, addComment, toggleCommentLike, listReplies, addReply, toggleReplyLike } from './api';

export function usePosts() {
  const [items, setItems] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try { setItems(await listPosts()); setError(null); }
    catch (e:any) { setError(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const add = useCallback(async (content: string) => {
    const created = await createPost(content);
    setItems(prev => [created, ...prev]);
    return created;
  }, []);

  const toggleLike = useCallback(async (postId: UUID): Promise<ToggleResult> => {
    const res = await togglePostLike(postId);
    return res;
  }, []);

  return { items, loading, error, refresh, add, toggleLike };
}

export function useComments(postId: UUID | null) {
  const [items, setItems] = useState<CommunityComment[]>([]);
  useEffect(() => { if (!postId) return; listComments(postId).then(setItems); }, [postId]);
  const add = useCallback(async (content: string) => {
    if (!postId) throw new Error('No postId');
    const c = await addComment(postId, content);
    setItems(prev => [...prev, c]);
    return c;
  }, [postId]);
  const toggleLike = useCallback((commentId: UUID) => toggleCommentLike(commentId), []);
  return { items, add, toggleLike };
}

export function useReplies(commentId: UUID | null) {
  const [items, setItems] = useState<CommunityReply[]>([]);
  useEffect(() => { if (!commentId) return; listReplies(commentId).then(setItems); }, [commentId]);
  const add = useCallback(async (content: string) => {
    if (!commentId) throw new Error('No commentId');
    const r = await addReply(commentId, content);
    setItems(prev => [...prev, r]);
    return r;
  }, [commentId]);
  const toggleLike = useCallback((replyId: UUID) => toggleReplyLike(replyId), []);
  return { items, add, toggleLike };
}

