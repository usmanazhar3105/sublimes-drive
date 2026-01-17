// Supabase Edge Function: make-server-97527403
// Hono-based HTTP server for app APIs

import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const app = new Hono();

// Initialize Supabase client early so it's available to all routes/utilities
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? Deno.env.get('PROJECT_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('ANON_KEY') ?? '';
const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY,
);

app.use('*', logger());
app.use('/*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization', 'apikey', 'x-client-authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
}));

// Allow calling with or without the function slug in the path
app.all('/functions/v1/make-server-97527403/*', (c) => {
  const url = new URL(c.req.url);
  const newPath = url.pathname.replace('/functions/v1/make-server-97527403', '') || '/';
  const newUrl = url.origin + newPath + url.search;
  return app.fetch(new Request(newUrl, c.req));
});

// Update post (admin only)
app.put('/posts/:id', async (c) => {
  try {
    const postId = c.req.param('id');
    const auth = await requireAuth(c);
    if ('error' in auth) return c.json({ error: auth.error }, auth.status);
    const { user } = auth as any;
    if (!(await isAdmin(user.id))) return c.json({ error: 'Forbidden' }, 403);
    const body = await c.req.json().catch(() => ({}));
    const allowed: Record<string, any> = {};
    if (typeof body.title === 'string') allowed.title = body.title;
    if (typeof (body.content ?? body.body) === 'string') {
      const text = (body.content ?? body.body).trim();
      allowed.content = text;
      allowed.body = text;
    }
    if (Array.isArray(body.tags)) allowed.tags = body.tags;
    if (typeof body.location === 'string') allowed.location = body.location;
    if (typeof body.car_brand === 'string') allowed.car_brand = body.car_brand;
    if (typeof body.car_model === 'string') allowed.car_model = body.car_model;
    if (typeof body.urgency === 'string') allowed.urgency = body.urgency;
    if (Object.keys(allowed).length === 0) return c.json({ error: 'No updatable fields provided' }, 400);
    const { error } = await supabase.from('posts').update(allowed).eq('id', postId);
    if (error) return c.json({ error: error.message }, 400);
    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ error: err.message || 'Internal error' }, 500);
  }
});

// Toggle comment like (auth)
app.post('/comments/:id/like', async (c) => {
  try {
    const commentId = c.req.param('id');
    const auth = await requireAuth(c);
    if ('error' in auth) return c.json({ error: auth.error }, auth.status);
    const { user } = auth as any;

    const { data: existing } = await supabase
      .from('community_comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('community_comment_likes')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', user.id);
      if (error) return c.json({ error: error.message }, 400);
      return c.json({ liked: false });
    } else {
      const { error } = await supabase
        .from('community_comment_likes')
        .insert({ comment_id: commentId, user_id: user.id, created_at: new Date().toISOString() });
      if (error) return c.json({ error: error.message }, 400);
      return c.json({ liked: true });
    }
  } catch (err: any) {
    return c.json({ error: err.message || 'Internal error' }, 500);
  }
});

// Events
app.get('/events', async (c) => {
  try {
    let { data, error } = await supabase
      .from('events')
      .select('*')
      .order('start_time', { ascending: true });
    if (error) {
      const retry = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });
      data = retry.data as any;
      error = retry.error as any;
    }
    if (error) return c.json({ events: [] });
    return c.json({ events: data || [] });
  } catch (_e) {
    return c.json({ events: [] });
  }
});

app.post('/events/:id/like', async (c) => {
  try {
    const eventId = c.req.param('id');
    const auth = await requireAuth(c);
    if ('error' in auth) return c.json({ error: auth.error }, auth.status);
    const { user } = auth as any;

    const { data: existing } = await supabase
      .from('event_likes')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('event_likes')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);
      if (error) return c.json({ error: error.message }, 400);
      return c.json({ liked: false });
    } else {
      const { error } = await supabase
        .from('event_likes')
        .insert({ event_id: eventId, user_id: user.id, created_at: new Date().toISOString() });
      if (error) return c.json({ error: error.message }, 400);
      return c.json({ liked: true });
    }
  } catch (err: any) {
    return c.json({ error: err.message || 'Internal error' }, 500);
  }
});

app.post('/events/:id/rsvp', async (c) => {
  try {
    const eventId = c.req.param('id');
    const auth = await requireAuth(c);
    if ('error' in auth) return c.json({ error: auth.error }, auth.status);
    const { user } = auth as any;
    const { status } = (await c.req.json().catch(() => ({ status: 'going' }))) as { status?: string };
    const rsvpStatus = ['going', 'interested', 'not_going'].includes(status || '') ? status : 'going';

    const { data: existing } = await supabase
      .from('event_attendees')
      .select('id, status')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      // If same status, remove RSVP; else update
      if ((existing as any).status === rsvpStatus) {
        const { error } = await supabase
          .from('event_attendees')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id);
        if (error) return c.json({ error: error.message }, 400);
        return c.json({ rsvp: null });
      } else {
        const { error } = await supabase
          .from('event_attendees')
          .update({ status: rsvpStatus, updated_at: new Date().toISOString() })
          .eq('id', (existing as any).id);
        if (error) return c.json({ error: error.message }, 400);
        return c.json({ rsvp: rsvpStatus });
      }
    } else {
      const { error } = await supabase
        .from('event_attendees')
        .insert({ event_id: eventId, user_id: user.id, status: rsvpStatus, created_at: new Date().toISOString() });
      if (error) return c.json({ error: error.message }, 400);
      return c.json({ rsvp: rsvpStatus });
    }
  } catch (err: any) {
    return c.json({ error: err.message || 'Internal error' }, 500);
  }
});

app.post('/events/:id/view', async (c) => {
  try {
    const eventId = c.req.param('id');
    const { user_id, session_id } = (await c.req.json().catch(() => ({ user_id: null, session_id: null }))) as {
      user_id?: string | null; session_id?: string | null;
    };
    try {
      await supabase.from('event_views').insert({
        event_id: eventId,
        user_id: user_id || null,
        session_id: session_id || null,
        viewed_at: new Date().toISOString(),
      });
    } catch (_e) {
      // ignore
    }
    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ error: err.message || 'Internal error' }, 500);
  }
});

app.get('/events/:id/attendees', async (c) => {
  try {
    const eventId = c.req.param('id');
    const { data, error } = await supabase
      .from('event_attendees')
      .select('id, user_id, status, created_at')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true });
    if (error) return c.json({ attendees: [] });
    return c.json({ attendees: data || [] });
  } catch (_e) {
    return c.json({ attendees: [] });
  }
});

// Like/Save/Comments for posts (Edge-backed to avoid missing RPCs)

// Toggle like (auth)
app.post('/posts/:id/like', async (c) => {
  try {
    const postId = c.req.param('id');
    const auth = await requireAuth(c);
    if ('error' in auth) return c.json({ error: auth.error }, auth.status);
    const { user } = auth as any;

    // Check existing
    const { data: existing } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);
      if (error) return c.json({ error: error.message }, 400);
      return c.json({ liked: false });
    } else {
      const { error } = await supabase
        .from('post_likes')
        .insert({ post_id: postId, user_id: user.id, created_at: new Date().toISOString() });
      if (error) return c.json({ error: error.message }, 400);
      return c.json({ liked: true });
    }
  } catch (err: any) {
    return c.json({ error: err.message || 'Internal error' }, 500);
  }
});

// Toggle save (auth)
app.post('/posts/:id/save', async (c) => {
  try {
    const postId = c.req.param('id');
    const auth = await requireAuth(c);
    if ('error' in auth) return c.json({ error: auth.error }, auth.status);
    const { user } = auth as any;

    const { data: existing } = await supabase
      .from('post_saves')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('post_saves')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);
      if (error) return c.json({ error: error.message }, 400);
      return c.json({ saved: false });
    } else {
      const { error } = await supabase
        .from('post_saves')
        .insert({ post_id: postId, user_id: user.id, created_at: new Date().toISOString() });
      if (error) return c.json({ error: error.message }, 400);
      return c.json({ saved: true });
    }
  } catch (err: any) {
    return c.json({ error: err.message || 'Internal error' }, 500);
  }
});

// Get comments (public)
app.get('/posts/:id/comments', async (c) => {
  try {
    const postId = c.req.param('id');
    // Primary: comments
    let res = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (!res.error) return c.json({ comments: res.data || [] });

    // Fallback 1: item_comments
    const resItem = await supabase
      .from('item_comments')
      .select('*')
      .eq('item_type', 'post')
      .eq('item_id', postId)
      .order('created_at', { ascending: true });
    if (!resItem.error) {
      const mapped = (resItem.data || []).map((r: any) => ({
        id: r.id,
        post_id: r.item_id,
        user_id: r.user_id,
        body: r.content,
        parent_comment_id: r.parent_comment_id,
        media: r.media ?? [],
        created_at: r.created_at,
      }));
      return c.json({ comments: mapped });
    }

    // Fallback 2: community_comments
    const resComm = await supabase
      .from('community_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (!resComm.error) {
      const mapped = (resComm.data || []).map((r: any) => ({
        id: r.id,
        post_id: r.post_id,
        user_id: r.author_id,
        body: r.body,
        parent_comment_id: null,
        media: [],
        created_at: r.created_at,
      }));
      return c.json({ comments: mapped });
    }

    return c.json({ comments: [] });
  } catch (_e) {
    return c.json({ comments: [] });
  }
});

// Add comment (auth)
app.post('/posts/:id/comments', async (c) => {
  try {
    const postId = c.req.param('id');
    const auth = await requireAuth(c);
    if ('error' in auth) return c.json({ error: (auth as any).error }, (auth as any).status);
    const { user } = auth as any;
    const bodyJson = await c.req.json().catch(() => ({}));
    const text = (bodyJson.body || bodyJson.content || '').trim();
    const parentId = bodyJson.parent_id ?? bodyJson.parent_comment_id ?? null;
    const media = Array.isArray(bodyJson.media) ? bodyJson.media : [];

    if (!text) return c.json({ error: 'Comment body required' }, 400);

    // Primary: public.comments (if exists)
    try {
      const insertPayload: Record<string, any> = {
        post_id: postId,
        user_id: user.id,
        body: text,
        media,
      };
      if (parentId) insertPayload.parent_comment_id = parentId;

      const { data, error } = await supabase
        .from('comments')
        .insert(insertPayload)
        .select('*')
        .single();
      if (error) throw error;
      return c.json({ comment: data });
    } catch (_primaryErr) {
      // Fallback 1: item_comments
      try {
        const payload = {
          item_type: 'post',
          item_id: postId,
          user_id: user.id,
          content: text,
          parent_comment_id: parentId,
          media,
        };
        const ins = await supabase
          .from('item_comments')
          .insert(payload as any)
          .select('*')
          .single();
        if (ins.error) throw ins.error;
        const mapped = {
          id: (ins.data as any).id,
          post_id: (ins.data as any).item_id,
          user_id: (ins.data as any).user_id,
          body: (ins.data as any).content,
          parent_comment_id: (ins.data as any).parent_comment_id,
          media: (ins.data as any).media ?? [],
          created_at: (ins.data as any).created_at,
        };
        return c.json({ comment: mapped, hint: 'fallback_item_comments' });
      } catch (_itemErr) {
        // Fallback 2: community_comments (no threading, no media table linkage here)
        const ins2 = await supabase
          .from('community_comments')
          .insert({ post_id: postId, author_id: user.id, body: text })
          .select('*')
          .single();
        if (ins2.error) return c.json({ error: ins2.error.message, hint: 'fallback_insert_failed_comm' }, 400);
        const mapped2 = {
          id: (ins2.data as any).id,
          post_id: (ins2.data as any).post_id,
          user_id: (ins2.data as any).author_id,
          body: (ins2.data as any).body,
          parent_comment_id: null,
          media: [],
          created_at: (ins2.data as any).created_at,
        };
        return c.json({ comment: mapped2, hint: 'fallback_community_comments' });
      }
    }
  } catch (err: any) {
    return c.json({ error: err.message || 'Internal error' }, 500);
  }
});

// Utilities
async function requireAuth(c: any) {
  const headerVal = c.req.header('Authorization') || c.req.header('x-client-authorization') || '';
  const accessToken = headerVal.startsWith('Bearer ')
    ? headerVal.slice('Bearer '.length)
    : headerVal || undefined;
  if (!accessToken) {
    const headers: Record<string, string> = {};
    c.req.raw.headers.forEach((value: string, key: string) => {
      headers[key] = value;
    });
    return { error: 'Authorization header missing', status: 401, detail: headers };
  }
  if (accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
    return { error: 'Authorization requires user token, received anon key', status: 401 };
  }
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (!user?.id || error) return { error: 'Unauthorized', status: 401 };
  return { user };
}

async function isAdmin(userId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();
  const role = (data as any)?.role;
  return role === 'admin' || role === 'editor';
}

// Health
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.get('/functions/v1/make-server-97527403/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));
// Extra routes to accommodate different path forwarding behaviors
app.get('/make-server-97527403/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.get('/', (c) => c.json({ status: 'ok', root: true, timestamp: new Date().toISOString() }));

// Generate signed upload URL (auth required). Client will use uploadToSignedUrl
app.post('/storage/signed-upload', async (c) => {
  try {
    const auth = await requireAuth(c);
    if ('error' in auth) return c.json({ error: auth.error }, auth.status);
    const { bucket, file_name } = await c.req.json();
    if (!bucket || !file_name) return c.json({ error: 'bucket and file_name required' }, 400);

    // Ensure bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.some(b => b.name === bucket);
    if (!exists) return c.json({ error: `Bucket '${bucket}' not found` }, 400);

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(file_name);

    if (error || !data) return c.json({ error: error?.message || 'Failed to create signed upload URL' }, 400);

    return c.json({ path: file_name, token: data.token });
  } catch (err: any) {
    return c.json({ error: err.message || 'Internal error' }, 500);
  }
});

// Posts
app.get('/posts', async (c) => {
  try {
    // Primary query with join including community_post_media for images
    // Filter for approved posts OR posts without status (backward compatibility)
    const primary = await supabase
      .from('posts')
      .select(`
        id, user_id, title, content, body, images, media, tags, location, car_brand, car_model, urgency, status, created_at,
        profiles:profiles!posts_user_id_fkey(display_name, username, avatar_url, role),
        community_post_media:community_post_media(path, bucket)
      `)
      .or('status.eq.approved,status.is.null')
      .order('created_at', { ascending: false });
    let rows: any[] | null = null;
    if (primary.error) {
      // Fallback: try without community_post_media join
      const fb = await supabase
        .from('posts')
        .select(`
          id, user_id, title, content, body, images, media, tags, location, car_brand, car_model, urgency, status, created_at,
          profiles:profiles!posts_user_id_fkey(display_name, username, avatar_url, role)
        `)
        .or('status.eq.approved,status.is.null')
        .order('created_at', { ascending: false });
      if (fb.error) {
        // Last fallback: simple select
        const simple = await supabase
          .from('posts')
          .select('id, user_id, title, content, body, images, media, tags, location, car_brand, car_model, urgency, status, created_at')
          .or('status.eq.approved,status.is.null')
          .order('created_at', { ascending: false });
        if (simple.error) return c.json({ error: simple.error.message }, 400);
        rows = simple.data || [];
      } else {
        rows = fb.data || [];
      }
    } else {
      rows = primary.data || [];
    }
    const posts = rows.map((row: any) => {
      // Get images from multiple sources: community_post_media (priority), images column, or media column
      let images: string[] = [];
      
      // Priority 1: Get from community_post_media table (most reliable)
      if (row.community_post_media && Array.isArray(row.community_post_media) && row.community_post_media.length > 0) {
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
      
      // Priority 2: Get from images column (JSONB array)
      if (images.length === 0 && row.images) {
        const media = Array.isArray(row.images) ? row.images : [];
        images = media.map((m: any) => {
          if (typeof m === 'string') return m;
          if (typeof m === 'object' && m?.url) return m.url;
          return null;
        }).filter(Boolean);
      }
      
      // Priority 3: Get from media column
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
        title: row.title || 'Untitled Post',
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
      };
    });
    return c.json({ posts });
  } catch (err: any) {
    return c.json({ error: err.message || 'Internal error' }, 500);
  }
});

app.post('/posts', async (c) => {
  try {
    const auth = await requireAuth(c);
    if ('error' in auth) return c.json({ error: auth.error }, auth.status);
    const { user } = auth as any;
    const body = await c.req.json();
    const text = (body.content || body.body || '').trim() || '[Image Post]';
    const media = Array.isArray(body.images) ? body.images : (Array.isArray(body.media) ? body.media : []);
    const rawUrg = ((body.urgency || body.urgency_level || '') + '').toLowerCase();
    const urgency = rawUrg === 'urgent' ? 'urgent' : (rawUrg === 'important' || rawUrg === 'high') ? 'high' : (rawUrg === 'medium') ? 'medium' : (rawUrg === 'normal' || rawUrg === 'low') ? 'low' : null;
    
    // ✅ Use RPC function instead of direct insert to avoid post_stats VIEW issues
    const { data: postId, error: rpcError } = await supabase.rpc('fn_create_post', {
      p_title: body.title || 'Untitled Post',
      p_body: text,
      p_content: text,
      p_media: media,
      p_tags: Array.isArray(body.tags) ? body.tags : [],
      p_location: body.location || null,
      p_car_brand: body.car_brand || null,
      p_car_model: body.car_model || null,
      p_urgency: urgency || null,
      p_community_id: null
    });
    
    if (rpcError) {
      // Log the RPC error for debugging
      console.error('RPC fn_create_post error:', rpcError);
      // Fallback: try direct insert (but skip post_stats)
      try {
        const payload = {
          user_id: user.id,
          title: body.title || 'Untitled Post',
          content: text,
          body: text,
          media,
          tags: Array.isArray(body.tags) ? body.tags : [],
          location: body.location || null,
          car_brand: body.car_brand || null,
          car_model: body.car_model || null,
          urgency,
          status: 'approved',
          is_anonymous: typeof body.is_anonymous === 'boolean' ? !!body.is_anonymous : false,
          created_at: new Date().toISOString(),
        };
        const { data, error } = await supabase.from('posts').insert(payload as any).select('*').single();
        if (error) {
          // Last fallback: minimal payload
          const minimal: any = {
            user_id: user.id,
            title: body.title || 'Untitled Post',
            content: text,
            body: text,
            status: 'approved',
          };
          const retry = await supabase.from('posts').insert(minimal).select('*').single();
          if (retry.error) return c.json({ error: retry.error.message, hint: 'fallback_insert_failed_alt' }, 400);
          return c.json({ post: retry.data, hint: 'fallback_insert_used' });
        }
        return c.json({ post: data, hint: 'direct_insert_used' });
      } catch (fallbackErr: any) {
        return c.json({ error: fallbackErr.message || rpcError.message, hint: 'fallback_insert_failed_alt' }, 400);
      }
    }
    
    // Fetch the created post
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single();
    
    if (fetchError) {
      return c.json({ error: fetchError.message, hint: 'post_created_but_fetch_failed' }, 400);
    }
    
    return c.json({ post, hint: 'rpc_used' });
  } catch (err: any) {
    return c.json({ error: err.message || 'Internal error' }, 500);
  }
});

app.delete('/posts/:id', async (c) => {
  try {
    const postId = c.req.param('id');
    const auth = await requireAuth(c);
    if ('error' in auth) return c.json({ error: auth.error }, auth.status);
    const { user } = auth as any;

    const admin = await isAdmin(user.id);
    if (!admin) {
      const { data: post } = await supabase
        .from('posts')
        .select('user_id')
        .eq('id', postId)
        .single();
      if (!post || post.user_id !== user.id) return c.json({ error: 'Forbidden' }, 403);
    }

    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (error) return c.json({ error: error.message }, 400);
    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ error: err.message || 'Internal error' }, 500);
  }
});

app.post('/posts/:id/view', async (c) => {
  try {
    const postId = c.req.param('id');
    // Best-effort increment; non-fatal if permissions not set yet or if post_stats is a VIEW
    try {
      // Check if post_stats is a TABLE (not a VIEW) before trying to update
      const { data: tableCheck } = await supabase
        .rpc('pg_typeof', { value: 'post_stats' })
        .catch(() => ({ data: null }));
      
      // Try to get current stats (works for both TABLE and VIEW)
      const { data: stats } = await supabase
        .from('post_stats')
        .select('view_count')
        .eq('post_id', postId)
        .maybeSingle();
      
      // Only try to update if we got data (means it's a TABLE, not a VIEW)
      // If it's a VIEW, the stats are calculated automatically, so no update needed
      if (stats) {
        const current = (stats as any)?.view_count || 0;
        // Try to upsert, but catch errors if it's a VIEW
        await supabase
          .from('post_stats')
          .upsert({ post_id: postId, view_count: current + 1 }, { onConflict: 'post_id' })
          .catch(() => {
            // If upsert fails (likely because it's a VIEW), that's OK
            // Views calculate stats automatically
          });
      }
    } catch (_e) {
      // ignore - post_stats might be a VIEW which calculates stats automatically
    }
    return c.json({ success: true, note: 'view increment best-effort' });
  } catch (err: any) {
    return c.json({ error: err.message || 'Internal error' }, 500);
  }
});

app.post('/posts/:id/moderate', async (c) => {
  try {
    const postId = c.req.param('id');
    const auth = await requireAuth(c);
    if ('error' in auth) return c.json({ error: auth.error }, auth.status);
    const { user } = auth as any;
    if (!(await isAdmin(user.id))) return c.json({ error: 'Forbidden' }, 403);
    const { status } = await c.req.json();
    if (!['approved', 'rejected', 'pending'].includes(status)) return c.json({ error: 'Invalid status' }, 400);
    const { error } = await supabase.from('posts').update({ status }).eq('id', postId);
    if (error) return c.json({ error: error.message }, 400);
    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ error: err.message || 'Internal error' }, 500);
  }
});

app.post('/posts/:id/pin', async (c) => {
  try {
    const postId = c.req.param('id');
    const auth = await requireAuth(c);
    if ('error' in auth) return c.json({ error: auth.error }, auth.status);
    const { user } = auth as any;
    if (!(await isAdmin(user.id))) return c.json({ error: 'Forbidden' }, 403);
    const { pinned } = await c.req.json();
    const { error } = await supabase.from('posts').update({ is_pinned: !!pinned }).eq('id', postId);
    if (error) return c.json({ error: error.message }, 400);
    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ error: err.message || 'Internal error' }, 500);
  }
});

// Marketplace admin
app.post('/marketplace/:id/approve', async (c) => {
  try {
    const listingId = c.req.param('id');
    const auth = await requireAuth(c);
    if ('error' in auth) return c.json({ error: auth.error }, auth.status);
    const { user } = auth as any;
    if (!(await isAdmin(user.id))) return c.json({ error: 'Forbidden' }, 403);
    const { error } = await supabase.from('market_listings').update({ status: 'approved' }).eq('id', listingId);
    if (error) return c.json({ error: error.message }, 400);
    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ error: err.message || 'Internal error' }, 500);
  }
});

app.delete('/marketplace/:id', async (c) => {
  try {
    const listingId = c.req.param('id');
    const auth = await requireAuth(c);
    if ('error' in auth) return c.json({ error: auth.error }, auth.status);
    const { user } = auth as any;
    if (!(await isAdmin(user.id))) return c.json({ error: 'Forbidden' }, 403);
    const { error } = await supabase.from('market_listings').delete().eq('id', listingId);
    if (error) return c.json({ error: error.message }, 400);
    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ error: err.message || 'Internal error' }, 500);
  }
});

// Stripe checkout (optional): dynamic import to avoid boot-time failures in edge runtime
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
let stripe: any = null;
async function getStripe() {
  if (!STRIPE_SECRET_KEY) return null;
  if (stripe) return stripe;
  const { default: Stripe } = await import('npm:stripe@14');
  stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
  return stripe;
}

app.post('/stripe/create-checkout', async (c) => {
  try {
    const s = await getStripe();
    if (!s) return c.json({ error: 'Stripe not configured' }, 503);
    const auth = await requireAuth(c);
    if ('error' in auth) return c.json({ error: auth.error }, auth.status);
    const { user } = auth as any;
    const { amount, description } = await c.req.json();
    if (!amount || amount < 10) return c.json({ error: 'Invalid amount (minimum AED 10)' }, 400);
    const origin = c.req.header('origin') || 'http://localhost:5173';
    const session = await s.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'aed',
          product_data: { name: description || 'Wallet Top-Up', description: `Add AED ${amount} to your wallet` },
          unit_amount: amount * 100,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/wallet`,
      metadata: { user_id: user.id, amount: String(amount), description: description || 'Wallet Top-Up' },
    });
    return c.json({ sessionId: session.id });
  } catch (err: any) {
    return c.json({ error: err.message || 'Failed to create checkout session' }, 500);
  }
});

app.post('/stripe/create-offer-checkout', async (c) => {
  try {
    const s = await getStripe();
    if (!s) return c.json({ error: 'Stripe not configured' }, 503);
    const auth = await requireAuth(c);
    if ('error' in auth) return c.json({ error: auth.error }, auth.status);
    const { user } = auth as any;
    const { offer_id, offer_title, amount, currency } = await c.req.json();
    if (!offer_id || !amount || amount < 10) return c.json({ error: 'Invalid offer data' }, 400);
    const { data: offer } = await supabase.from('offers').select('*').eq('id', offer_id).maybeSingle();
    if (!offer || offer.is_active === false) return c.json({ error: 'Offer not found or inactive' }, 404);
    const { data: existing } = await supabase
      .from('offer_redemptions')
      .select('id')
      .eq('offer_id', offer_id)
      .eq('user_id', user.id)
      .maybeSingle();
    if (existing) return c.json({ error: 'You have already purchased this offer' }, 400);
    const origin = c.req.header('origin') || 'http://localhost:5173';
    const session = await s.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: currency || 'aed',
          product_data: { name: offer_title || offer.title, description: offer.description || 'Offer purchase', images: offer.image_urls?.length ? [offer.image_urls[0]] : [] },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${origin}/offers?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/offers?payment=cancelled`,
      metadata: { user_id: user.id, offer_id, offer_title: offer_title || offer.title, amount: String(amount), type: 'offer_purchase' },
    });
    return c.json({ sessionId: session.id });
  } catch (err: any) {
    return c.json({ error: err.message || 'Failed to create offer checkout' }, 500);
  }
});

// OPTIONS
app.options('/*', (c) => c.text('', 200));

// Forward requests under the function slug to the app, stripping the base path
const root = new Hono();
root.all('/make-server-97527403/*', async (c) => {
  const incoming = c.req.raw;
  const url = new URL(incoming.url);
  const prefix = '/make-server-97527403';
  if (!url.pathname.startsWith(prefix)) return c.notFound();
  url.pathname = url.pathname.slice(prefix.length) || '/';
  const method = incoming.method;
  const headers = new Headers(incoming.headers);
  const body = method === 'GET' || method === 'HEAD' ? undefined : await incoming.clone().arrayBuffer();
  const forwarded = new Request(url.toString(), { method, headers, body: body as any });
  return app.fetch(forwarded);
});

Deno.serve((req) => root.fetch(req));
