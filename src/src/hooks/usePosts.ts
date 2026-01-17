import { useState, useEffect } from 'react';
import { publicApiCall, apiCall, supabase } from '../../utils/supabase/client';

interface Post {
  id: string;
  user_id: string;
  content: string;
  images?: string[];
  tags?: string[];
  location?: string;
  car_brand?: string | null;
  car_model?: string | null;
  urgency?: string | null;
  created_at: string;
  views_count: number;
  user?: {
    id: string;
    display_name: string;
    username: string;
    avatar_url: string;
    role: string;
    verified: boolean;
  };
}

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await publicApiCall('/posts').catch(() => null);
      if (!data) {
        // Fallback: query Supabase directly when Edge function is down
        // First try to get posts with community_post_images join (references posts table)
        // Include status in select and filter for approved posts OR posts without status (for backward compatibility)
        let res = await supabase
          .from('posts')
          .select(`
            id, user_id, title, content, body, images, media, tags, location, car_brand, car_model, urgency, status, created_at,
            profiles:profiles!posts_user_id_fkey(display_name, username, avatar_url, role),
            community_post_images:community_post_images(storage_path)
          `)
          .or('status.eq.approved,status.is.null')
          .order('created_at', { ascending: false });
        
        // If that fails, try with community_post_media join
        if (res.error) {
          res = await supabase
            .from('posts')
            .select(`
              id, user_id, title, content, body, images, media, tags, location, car_brand, car_model, urgency, status, created_at,
              profiles:profiles!posts_user_id_fkey(display_name, username, avatar_url, role),
              community_post_media:community_post_media(path, bucket)
            `)
            .or('status.eq.approved,status.is.null')
            .order('created_at', { ascending: false });
        }
        
        // If that also fails, try without any join
        if (res.error) {
          res = await supabase
            .from('posts')
            .select(`
              id, user_id, title, content, body, images, media, tags, location, car_brand, car_model, urgency, status, created_at,
              profiles:profiles!posts_user_id_fkey(display_name, username, avatar_url, role)
            `)
            .or('status.eq.approved,status.is.null')
            .order('created_at', { ascending: false });
        }
        
        if (res.error) {
          setPosts([]);
          setError(null);
          return;
        }
        const rows: any[] = res.data || [];
        const mapped = rows.map((row: any) => {
          // Get images from multiple sources with priority order
          let images: string[] = [];
          
          // Priority 1: Get from community_post_images table (references posts table)
          if (row.community_post_images && Array.isArray(row.community_post_images) && row.community_post_images.length > 0) {
            images = row.community_post_images.map((img: any) => {
              const path = img.storage_path;
              if (path) {
                const { data } = supabase.storage.from('community-media').getPublicUrl(path);
                return data.publicUrl;
              }
              return null;
            }).filter(Boolean);
          }
          
          // Priority 2: Get from community_post_media table (if exists)
          if (images.length === 0 && row.community_post_media && Array.isArray(row.community_post_media) && row.community_post_media.length > 0) {
            images = row.community_post_media.map((media: any) => {
              const bucket = media.bucket || 'community-media';
              const path = media.path;
              if (path) {
                const { data } = supabase.storage.from(bucket).getPublicUrl(path);
                return data.publicUrl;
              }
              return null;
            }).filter(Boolean);
          }
          
          // Priority 3: Get from images column (JSONB array) - this is what we're updating now
          if (images.length === 0 && row.images) {
            const media = Array.isArray(row.images) ? row.images : [];
            images = media.map((m: any) => {
              if (typeof m === 'string') return m;
              if (typeof m === 'object' && m?.url) return m.url;
              return null;
            }).filter(Boolean);
          }
          
          // Priority 4: Get from media column (fallback)
          if (images.length === 0 && row.media) {
            const media = Array.isArray(row.media) ? row.media : [];
            images = media.map((m: any) => {
              if (typeof m === 'string') return m;
              if (typeof m === 'object' && m?.url) return m.url;
              return null;
            }).filter(Boolean);
          }
          
          return {
            id: row.id,
            user_id: row.user_id,
            content: row.content ?? row.body ?? '',
            images,
            tags: row.tags || [],
            location: row.location || null,
            car_brand: row.car_brand || null,
            car_model: row.car_model || null,
            urgency: row.urgency || null,
            created_at: row.created_at,
            views_count: 0,
            user: row.profiles ? {
              id: row.user_id,
              display_name: row.profiles?.display_name || '',
              username: row.profiles?.username || '',
              avatar_url: row.profiles?.avatar_url || '',
              role: row.profiles?.role || 'browser',
              verified: false,
            } : undefined,
          } as Post;
        });
        setPosts(mapped);
      } else {
        setPosts(data.posts || []);
      }
      setError(null);
    } catch (err) {
      setPosts([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (postData: {
    content: string;
    images?: string[];
    tags?: string[];
    location?: string;
    car_brand?: string;
    car_model?: string;
    urgency?: 'low' | 'medium' | 'high' | 'urgent' | 'normal' | 'important';
    is_anonymous?: boolean;
  }) => {
    try {
      // Ensure user is authenticated to avoid 401 and empty error objects
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Sign in required to create a post');
      }
      const response = await apiCall('/posts', {
        method: 'POST',
        body: JSON.stringify(postData),
      }, true);
      const data = response;

      const created = data?.post || data;
      const media = created?.images ?? created?.media ?? [];
      const images = Array.isArray(media) && media.length > 0
        ? (typeof media[0] === 'object' && media[0]?.url ? media.map((m: any) => m?.url).filter(Boolean) : media)
        : [];
      const mapped: Post = {
        id: created.id,
        user_id: created.user_id,
        content: created.content ?? created.body ?? postData.content,
        images,
        tags: created.tags || postData.tags || [],
        location: created.location || postData.location || undefined,
        car_brand: created.car_brand ?? null,
        car_model: created.car_model ?? null,
        urgency: created.urgency ?? (postData.urgency as string) ?? null,
        created_at: created.created_at || new Date().toISOString(),
        views_count: created.views_count ?? 0,
        user: created.user,
      } as Post;

      // Add new post to the beginning of the list (so images/meta appear immediately)
      setPosts((prev) => [mapped, ...prev]);

      return { post: mapped, error: null };
    } catch (err: any) {
      const msg = err?.message || (typeof err === 'string' ? err : JSON.stringify(err));
      console.error('Error creating post:', msg);
      return { post: null, error: new Error(msg) };
    }
  };

  const deletePost = async (postId: string) => {
    try {
      await apiCall(`/posts/${postId}`, { method: 'DELETE' }, true);

      // Remove post from list
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      
      return { error: null };
    } catch (err) {
      console.error('Error deleting post:', err);
      return { error: err as Error };
    }
  };

  const incrementViews = async (postId: string) => {
    try {
      await publicApiCall(`/posts/${postId}/view`, { method: 'POST' });
    } catch (err) {
      console.error('Error incrementing views:', err);
    }
  };

  const toggleLike = async (postId: string) => {
    try {
      // Use RPC function directly for reliability
      const { data, error: rpcError } = await supabase.rpc('fn_toggle_like', { p_post_id: postId });
      
      if (rpcError) {
        // Fallback to API call
        const res = await apiCall(`/posts/${postId}/like`, { method: 'POST' }, true).catch(() => null);
        return { liked: !!res?.liked, error: rpcError };
      }
      
      return { liked: data?.liked ?? false, like_count: data?.like_count ?? 0, error: null };
    } catch (err: any) {
      const msg = err?.message || (typeof err === 'string' ? err : JSON.stringify(err));
      return { liked: false, error: new Error(msg) };
    }
  };

  const toggleSave = async (postId: string) => {
    try {
      // Use RPC function directly for reliability
      const { data, error: rpcError } = await supabase.rpc('fn_toggle_save', { p_post_id: postId });
      
      if (rpcError) {
        // Fallback to API call
        const res = await apiCall(`/posts/${postId}/save`, { method: 'POST' }, true).catch(() => null);
        return { saved: !!res?.saved, error: rpcError };
      }
      
      return { saved: data?.saved ?? false, save_count: data?.save_count ?? 0, error: null };
    } catch (err: any) {
      const msg = err?.message || (typeof err === 'string' ? err : JSON.stringify(err));
      return { saved: false, error: new Error(msg) };
    }
  };

  const getComments = async (postId: string) => {
    try {
      // Query Supabase directly for reliability
      const { data: baseComments, error: fetchError } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      
      if (fetchError) {
        // Fallback to API
        const res = await publicApiCall(`/posts/${postId}/comments`).catch(() => ({ comments: [] }));
        return { comments: res?.comments || [], error: fetchError };
      }
      
      // Fetch user profiles
      const rows = baseComments || [];
      const userIds = Array.from(new Set(rows.map((c: any) => c.user_id).filter(Boolean)));
      let profilesById: Record<string, any> = {};
      
      if (userIds.length > 0) {
        const { data: profs } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url')
          .in('id', userIds);
        (profs || []).forEach((p: any) => {
          profilesById[p.id] = { display_name: p.display_name, avatar_url: p.avatar_url };
        });
      }
      
      const enriched = rows.map((c: any) => ({
        ...c,
        content: c.body || c.content || '',
        user: profilesById[c.user_id] || {},
      }));
      
      return { comments: enriched, error: null };
    } catch (err: any) {
      const msg = err?.message || (typeof err === 'string' ? err : JSON.stringify(err));
      return { comments: [], error: new Error(msg) };
    }
  };

  const addComment = async (
    postId: string,
    body: string,
    opts?: { parent_id?: string; media?: any }
  ) => {
    try {
      // Use RPC function directly for reliability
      const { data, error: rpcError } = await supabase.rpc('fn_add_comment', { 
        p_post_id: postId, 
        p_body: body,
        p_parent_id: opts?.parent_id || null
      });
      
      if (rpcError) {
        // Fallback: insert directly
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');
        
        const { data: inserted, error: insertError } = await supabase
          .from('comments')
          .insert({
            post_id: postId,
            user_id: user.id,
            body: body.trim(),
            content: body.trim(),
            parent_id: opts?.parent_id || null,
          })
          .select('*')
          .single();
        
        if (insertError) throw insertError;
        return { comment: inserted, error: null };
      }
      
      return { comment: data?.comment, comment_count: data?.comment_count, error: null };
    } catch (err: any) {
      const msg = err?.message || (typeof err === 'string' ? err : JSON.stringify(err));
      return { comment: null, error: new Error(msg) };
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      // Use RPC function directly
      const { data, error: rpcError } = await supabase.rpc('fn_delete_comment', { p_comment_id: commentId });
      
      if (rpcError) {
        // Fallback: delete directly
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');
        
        const { error: deleteError } = await supabase
          .from('comments')
          .delete()
          .eq('id', commentId)
          .eq('user_id', user.id);
        
        if (deleteError) throw deleteError;
        return { error: null };
      }
      
      return { comment_count: data?.comment_count, error: null };
    } catch (err: any) {
      const msg = err?.message || (typeof err === 'string' ? err : JSON.stringify(err));
      return { error: new Error(msg) };
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return {
    posts,
    loading,
    error,
    createPost,
    deletePost,
    incrementViews,
    toggleLike,
    toggleSave,
    getComments,
    addComment,
    deleteComment,
    refetch: fetchPosts,
  };
}
