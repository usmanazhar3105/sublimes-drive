import { supabase } from '../../lib/supabase';
import { apiCall, publicApiCall } from '../../utils/supabase/client';
import type { CommunityPost, CommunityComment, CommunityReply, UUID, ToggleResult } from './types';

export async function getSessionUserId(): Promise<UUID | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user?.id ?? null;
}

/* ---------------------- Posts ---------------------- */
export async function listPosts(limit = 25): Promise<CommunityPost[]> {
  const res = await publicApiCall('/posts');
  const posts = (res?.posts || []) as any[];
  return posts.slice(0, limit).map((p) => ({
    id: p.id,
    user_id: p.user_id,
    content: p.content ?? null,
    is_poll: false,
    allow_anonymous: false,
    created_at: p.created_at,
  } satisfies CommunityPost));
}

export async function createPost(content: string): Promise<CommunityPost> {
  const res = await apiCall('/posts', {
    method: 'POST',
    body: JSON.stringify({ content }),
  }, true);
  const p = res?.post || res;
  return {
    id: p.id,
    user_id: p.user_id,
    content: p.content ?? null,
    is_poll: false,
    allow_anonymous: !!p.is_anonymous,
    created_at: p.created_at,
  } as CommunityPost;
}

export async function togglePostLike(postId: UUID): Promise<ToggleResult> {
  const res = await apiCall(`/posts/${postId}/like`, { method: 'POST' }, true);
  return (res?.[0] ?? res) as ToggleResult;
}

/* -------------------- Comments --------------------- */
export async function listComments(postId: UUID): Promise<CommunityComment[]> {
  const { data, error } = await supabase
    .from('community_comments')
    .select('id, post_id, author_id, content, created_at')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []).map((r: any) => ({
    id: r.id,
    post_id: r.post_id,
    user_id: r.author_id,
    content: r.content,
    created_at: r.created_at,
  } as CommunityComment));
}

export async function addComment(postId: UUID, content: string): Promise<CommunityComment> {
  const uid = await getSessionUserId();
  if (!uid) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('community_comments')
    .insert({ post_id: postId, author_id: uid, content })
    .select('*')
    .single();
  if (error) throw error;
  return {
    id: (data as any).id,
    post_id: (data as any).post_id,
    user_id: (data as any).author_id,
    content: (data as any).content,
    created_at: (data as any).created_at,
  } as CommunityComment;
}

export async function toggleCommentLike(commentId: UUID): Promise<ToggleResult> {
  const { data, error } = await supabase.rpc('toggle_comment_like', { p_comment_id: commentId });
  if (error) throw error;
  return (data?.[0] ?? data) as ToggleResult;
}

/* --------------------- Replies --------------------- */
export async function listReplies(commentId: UUID): Promise<CommunityReply[]> {
  const { data, error } = await supabase
    .from('community_replies')
    .select('*')
    .eq('comment_id', commentId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as CommunityReply[];
}

export async function addReply(commentId: UUID, content: string): Promise<CommunityReply> {
  const uid = await getSessionUserId();
  if (!uid) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('community_replies')
    .insert({ comment_id: commentId, user_id: uid, content })
    .select('*')
    .single();
  if (error) throw error;
  return data as CommunityReply;
}

export async function toggleReplyLike(replyId: UUID): Promise<ToggleResult> {
  const { data, error } = await supabase.rpc('toggle_reply_like', { p_reply_id: replyId });
  if (error) throw error;
  return (data?.[0] ?? data) as ToggleResult;
}

