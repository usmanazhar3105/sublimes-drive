import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase/client';

export interface Community {
  id: string;
  slug: string;
  title: string;
  brand: string;
  cover_url: string;
  is_private: boolean;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  community_id?: string | null;
  user_id: string;
  title?: string | null;
  content?: string | null;
  body?: string | null;
  images?: string[] | null;
  media?: any[] | null;
  tags?: string[] | null;
  location?: string | null;
  car_brand?: string | null;
  car_model?: string | null;
  urgency?: string | null;
  likes_count?: number | null;
  comments_count?: number | null;
  created_at: string;
  updated_at?: string;
  profiles?: {
    display_name?: string;
    email?: string;
    avatar_url?: string;
    username?: string;
  } | null;
}

export function useCommunities() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchCommunities();
  }, []);

  async function fetchCommunities() {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('communities')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setCommunities(data || []);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching communities:', err);
    } finally {
      setLoading(false);
    }
  }

  async function joinCommunity(communityId: string) {
    try {
      const { error: joinError } = await supabase
        .from('community_members')
        .insert([
          {
            community_id: communityId,
            user_id: (await supabase.auth.getUser()).data.user?.id,
            role: 'member',
          },
        ]);

      if (joinError) throw joinError;
      
      // Analytics logged via analytics_events table

      return { error: null };
    } catch (err) {
      console.error('Error joining community:', err);
      return { error: err as Error };
    }
  }

  async function leaveCommunity(communityId: string) {
    try {
      const { error: leaveError } = await supabase
        .from('community_members')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (leaveError) throw leaveError;
      return { error: null };
    } catch (err) {
      console.error('Error leaving community:', err);
      return { error: err as Error };
    }
  }

  return {
    communities,
    loading,
    error,
    refetch: fetchCommunities,
    joinCommunity,
    leaveCommunity,
  };
}

export function useCommunityPosts(communityId?: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchPosts();

    // Subscribe to realtime updates on posts
    const postsSub = supabase
      .channel(communityId ? `community_${communityId}_posts` : 'all_posts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
          filter: communityId ? `community_id=eq.${communityId}` : undefined,
        },
        () => fetchPosts()
      )
      .subscribe();

    // Also refetch when likes, comments, or views change (keeps counters fresh)
    const likesSub = supabase
      .channel('post_likes_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'post_likes' },
        () => fetchPosts()
      )
      .subscribe();

    const commentsSub = supabase
      .channel('comments_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'comments' },
        () => fetchPosts()
      )
      .subscribe();

    const viewsSub = supabase
      .channel('post_views_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'post_views' },
        () => fetchPosts()
      )
      .subscribe();

    return () => {
      postsSub.unsubscribe();
      likesSub.unsubscribe();
      commentsSub.unsubscribe();
      viewsSub.unsubscribe();
    };
  }, [communityId]);

  async function fetchPosts() {
    try {
      setLoading(true);
      let query = supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (communityId) {
        query = query.eq('community_id', communityId);
      }

      // Show approved posts OR posts without status (for backward compatibility)
      query = query.or('status.eq.approved,status.is.null');

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const rows = (data || []) as any[];

      const ownerIds = Array.from(
        new Set(
          rows
            .map((p) => p.user_id || p.author_id || p.created_by)
            .filter(Boolean)
        )
      );

      let profileMap: Record<string, { display_name?: string; email?: string; avatar_url?: string; username?: string }> = {};
      if (ownerIds.length) {
        const { data: profs } = await supabase
          .from('profiles')
          .select('id, display_name, email, avatar_url, username')
          .in('id', ownerIds);
        (profs || []).forEach((pr: any) => {
          profileMap[pr.id] = { display_name: pr.display_name, email: pr.email, avatar_url: pr.avatar_url, username: pr.username };
        });
      }

      const merged = rows.map((p) => {
        const owner = p.user_id || p.author_id || p.created_by;
        return { ...p, profiles: owner ? profileMap[owner] : undefined } as Post;
      });

      setPosts(merged);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  }

  async function createPost(body: string, media: string[] = []) {
    try {
      const { data, error: createError } = await supabase
        .from('posts')
        .insert([
          {
            community_id: communityId || null,
            user_id: (await supabase.auth.getUser()).data.user?.id,
            body,
            media,
          },
        ])
        .select()
        .single();

      if (createError) throw createError;
      
      // Analytics logged via analytics_events table

      await fetchPosts();
      return { data, error: null };
    } catch (err) {
      console.error('Error creating post:', err);
      return { data: null, error: err as Error };
    }
  }

  async function likePost(postId: string) {
    try {
      const { error: likeError } = await supabase
        .from('post_likes')
        .insert([
          {
            post_id: postId,
            user_id: (await supabase.auth.getUser()).data.user?.id,
          },
        ]);

      if (likeError) throw likeError;
      return { error: null };
    } catch (err) {
      console.error('Error liking post:', err);
      return { error: err as Error };
    }
  }

  async function unlikePost(postId: string) {
    try {
      const { error: unlikeError } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (unlikeError) throw unlikeError;
      return { error: null };
    } catch (err) {
      console.error('Error unliking post:', err);
      return { error: err as Error };
    }
  }

  return {
    posts,
    loading,
    error,
    refetch: fetchPosts,
    createPost,
    likePost,
    unlikePost,
  };
}
