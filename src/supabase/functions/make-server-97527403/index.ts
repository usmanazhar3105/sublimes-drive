// Supabase Edge Function: make-server-97527403
// Hono-based HTTP server for app APIs

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'npm:stripe@14';

const app = new Hono();

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

// Toggle comment like (auth)
app.post('/comments/:id/like', async (c) => {
  try {
    const commentId = c.req.param('id');
    const auth = await requireAuth(c);
    if ('error' in auth) return c.json({ error: auth.error }, auth.status);
    const { user } = auth as any;

    const { data: existing } = await supabase
      .from('comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('comment_likes')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', user.id);
      if (error) return c.json({ error: error.message }, 400);
      return c.json({ liked: false });
    } else {
      const { error } = await supabase
        .from('comment_likes')
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
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (error) return c.json({ comments: [] });
    return c.json({ comments: data || [] });
  } catch (_e) {
    return c.json({ comments: [] });
  }
});

// Add comment (auth)
app.post('/posts/:id/comments', async (c) => {
  try {
    const postId = c.req.param('id');
    const auth = await requireAuth(c);
    if ('error' in auth) return c.json({ error: auth.error }, auth.status);
    const { user } = auth as any;
    const { body, parent_id, media } = await c.req.json();
    if (!body || typeof body !== 'string') return c.json({ error: 'body required' }, 400);

    const payload: any = {
      post_id: postId,
      user_id: user.id,
      body,
      parent_comment_id: parent_id || null,
      media: media ?? null,
      created_at: new Date().toISOString(),
    };
    const { data, error } = await supabase
      .from('comments')
      .insert(payload)
      .select('*')
      .single();
    if (error) return c.json({ error: error.message }, 400);
    return c.json({ comment: data });
  } catch (err: any) {
    return c.json({ error: err.message || 'Internal error' }, 500);
  }
});
// Also handle calls where the runtime doesn't include '/functions/v1' in forwarded path
app.all('/make-server-97527403/*', (c) => {
  const url = new URL(c.req.url);
  const newPath = url.pathname.replace('/make-server-97527403', '') || '/';
  const newUrl = url.origin + newPath + url.search;
  return app.fetch(new Request(newUrl, c.req));
});
app.get('/functions/v1/make-server-97527403/posts', (c) => app.fetch(new Request(new URL(c.req.url).origin + '/posts' + new URL(c.req.url).search, c.req)));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

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
    // Primary query with join (if FK is named consistently)
    const primary = await supabase
      .from('posts')
      .select(`
        id, user_id, title, content, body, images, media, tags, location, created_at,
        profiles:profiles!posts_user_id_fkey(display_name, username, avatar_url, role)
      `)
      .order('created_at', { ascending: false });
    let rows: any[] | null = null;
    if (primary.error) {
      // Fallback: simple select without join
      const fb = await supabase
        .from('posts')
        .select('id, user_id, title, content, body, images, media, tags, location, created_at')
        .order('created_at', { ascending: false });
      if (fb.error) return c.json({ error: fb.error.message }, 400);
      rows = fb.data || [];
    } else {
      rows = primary.data || [];
    }
    const posts = rows.map((row: any) => ({
      id: row.id,
      user_id: row.user_id,
      title: row.title || 'Untitled Post',
      content: row.content ?? row.body ?? '',
      images: row.images ?? row.media ?? [],
      tags: row.tags || [],
      location: row.location || null,
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
    }));
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
    const payload = {
      user_id: user.id,
      title: body.title || 'Untitled Post',
      content: body.content || '',
      images: body.images || [],
      tags: body.tags || [],
      location: body.location || null,
      created_at: new Date().toISOString(),
    };
    const { data, error } = await supabase.from('posts').insert(payload as any).select('*').single();
    if (error) {
      // Fallback 1: minimal payload for content-based schema
      const minimal: any = {
        user_id: user.id,
        content: body.content || '',
      };
      const retry1 = await supabase.from('posts').insert(minimal).select('*').single();
      if (retry1.error) {
        // Fallback 2: body/media fields for alternate schema
        const alt: any = {
          user_id: user.id,
          body: body.content || body.body || '',
          media: Array.isArray(body.images) ? body.images : (Array.isArray(body.media) ? body.media : []),
        };
        const retry2 = await supabase.from('posts').insert(alt).select('*').single();
        if (retry2.error) return c.json({ error: retry2.error.message, hint: 'fallback_insert_failed_alt' }, 400);
        return c.json({ post: retry2.data, hint: 'fallback_insert_used_alt' });
      }
      return c.json({ post: retry1.data, hint: 'fallback_insert_used' });
    }
    return c.json({ post: data });
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
    // Best-effort increment; non-fatal if permissions not set yet
    try {
      const { data: stats } = await supabase
        .from('post_stats')
        .select('view_count')
        .eq('post_id', postId)
        .maybeSingle();
      const current = (stats as any)?.view_count || 0;
      await supabase
        .from('post_stats')
        .upsert({ post_id: postId, view_count: current + 1 }, { onConflict: 'post_id' });
    } catch (_e) {
      // ignore
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

// Stripe checkout
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', { apiVersion: '2023-10-16' });

app.post('/stripe/create-checkout', async (c) => {
  try {
    const auth = await requireAuth(c);
    if ('error' in auth) return c.json({ error: auth.error }, auth.status);
    const { user } = auth as any;
    const { amount, description } = await c.req.json();
    if (!amount || amount < 10) return c.json({ error: 'Invalid amount (minimum AED 10)' }, 400);
    const origin = c.req.header('origin') || 'http://localhost:5173';
    const session = await stripe.checkout.sessions.create({
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
    const session = await stripe.checkout.sessions.create({
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

serve((req) => app.fetch(req));
