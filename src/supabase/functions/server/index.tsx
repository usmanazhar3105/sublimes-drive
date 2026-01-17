import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'npm:stripe@14';
// KV store not needed - using Supabase database directly

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Create Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Check Posts Table on startup
async function checkPostsTable() {
  try {
    console.log('📝 Checking posts table...');
    
    // Check if posts table exists
    const { error: checkError } = await supabase
      .from('posts')
      .select('id')
      .limit(1);
    
    // If no error, table exists
    if (!checkError) {
      console.log('✅ Posts table exists and is accessible');
      return;
    }
    
    // If table doesn't exist, log a simple warning
    if (checkError.code === '42P01' || checkError.code === '42501' || checkError.message.includes('does not exist')) {
      console.log('⚠️  Posts table not found - posts functionality will be disabled until table is created');
      console.log('💡 Run migration file 107_posts_table.sql in Supabase to enable posts');
    } else {
      console.error('❌ Error checking posts table:', checkError);
    }
  } catch (err) {
    console.error('❌ Error checking posts table:', err);
  }
}

// Run initialization
async function runInitialization() {
  await checkPostsTable();
}

runInitialization();

// Debug middleware to log all requests
app.use('/make-server-97527403/*', async (c, next) => {
  console.log(`${c.req.method} ${c.req.url}`);
  console.log('Headers:', Object.fromEntries(c.req.raw.headers.entries()));
  await next();
});

// =============================================================================
// COMMUNITY POSTS ROUTES
// =============================================================================

// Get posts feed (public)
app.get('/make-server-97527403/posts', async (c) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id, user_id, title, content, images, tags, location, created_at,
        post_stats:post_stats(view_count, like_count, comment_count),
        profiles:profiles!posts_user_id_fkey(display_name, username, avatar_url, role)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get posts error:', error);
      return c.json({ error: error.message }, 400);
    }

    const posts = (data || []).map((row: any) => ({
      id: row.id,
      user_id: row.user_id,
      title: row.title,
      content: row.content,
      images: row.images || [],
      tags: row.tags || [],
      location: row.location || null,
      created_at: row.created_at,
      views_count: row.post_stats?.[0]?.view_count || 0,
      user: {
        id: row.user_id,
        display_name: row.profiles?.display_name || '',
        username: row.profiles?.username || '',
        avatar_url: row.profiles?.avatar_url || '',
        role: row.profiles?.role || 'browser',
        verified: false,
      },
    }));

    return c.json({ posts });
  } catch (error) {
    console.error('Get posts error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Create a post (auth required)
app.post('/make-server-97527403/posts', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Authorization required' }, 401);

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (!user?.id || authError) return c.json({ error: 'Unauthorized' }, 401);

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

    const { data, error } = await supabase
      .from('posts')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      console.error('Create post error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ post: data });
  } catch (error) {
    console.error('Create post error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Delete a post (auth required, owner or admin)
app.delete('/make-server-97527403/posts/:id', async (c) => {
  try {
    const postId = c.req.param('id');
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Authorization required' }, 401);

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (!user?.id || authError) return c.json({ error: 'Unauthorized' }, 401);

    // Check if admin
    let isAdmin = false;
    const { data: prof } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
    if ((prof as any)?.role === 'admin' || (prof as any)?.role === 'editor') isAdmin = true;

    // If not admin, ensure ownership
    const { data: post } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', postId)
      .single();

    if (!post || (!isAdmin && post.user_id !== user.id)) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) {
      console.error('Delete post error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Delete post error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Increment views (public)
app.post('/make-server-97527403/posts/:id/view', async (c) => {
  try {
    const postId = c.req.param('id');
    // Increment view count in post_stats
    const { data: stats } = await supabase
      .from('post_stats')
      .select('view_count')
      .eq('post_id', postId)
      .maybeSingle();

    const current = (stats as any)?.view_count || 0;
    const { error } = await supabase
      .from('post_stats')
      .upsert({ post_id: postId, view_count: current + 1 }, { onConflict: 'post_id' });

    if (error) {
      console.error('Increment views error:', error);
      return c.json({ error: error.message }, 400);
    }
    return c.json({ success: true });
  } catch (error) {
    console.error('Increment views error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Moderate post (admin only)
app.post('/make-server-97527403/posts/:id/moderate', async (c) => {
  try {
    const postId = c.req.param('id');
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Authorization required' }, 401);

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (!user?.id || authError) return c.json({ error: 'Unauthorized' }, 401);

    const { data: prof } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
    const role = (prof as any)?.role;
    if (role !== 'admin' && role !== 'editor') return c.json({ error: 'Forbidden' }, 403);

    const { status } = await c.req.json();
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return c.json({ error: 'Invalid status' }, 400);
    }

    const { error } = await supabase
      .from('posts')
      .update({ status })
      .eq('id', postId);

    if (error) return c.json({ error: error.message }, 400);
    return c.json({ success: true });
  } catch (error) {
    console.error('Moderate post error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Pin/Unpin post (admin only)
app.post('/make-server-97527403/posts/:id/pin', async (c) => {
  try {
    const postId = c.req.param('id');
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Authorization required' }, 401);

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (!user?.id || authError) return c.json({ error: 'Unauthorized' }, 401);

    const { data: prof } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
    const role = (prof as any)?.role;
    if (role !== 'admin' && role !== 'editor') return c.json({ error: 'Forbidden' }, 403);

    const { pinned } = await c.req.json();
    const { error } = await supabase
      .from('posts')
      .update({ is_pinned: !!pinned })
      .eq('id', postId);

    if (error) return c.json({ error: error.message }, 400);
    return c.json({ success: true });
  } catch (error) {
    console.error('Pin post error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// =============================================================================
// MARKETPLACE ADMIN ROUTES
// =============================================================================

// Approve marketplace listing (admin only)
app.post('/make-server-97527403/marketplace/:id/approve', async (c) => {
  try {
    const listingId = c.req.param('id');
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Authorization required' }, 401);

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (!user?.id || authError) return c.json({ error: 'Unauthorized' }, 401);

    const { data: prof } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
    const role = (prof as any)?.role;
    if (role !== 'admin' && role !== 'editor') return c.json({ error: 'Forbidden' }, 403);

    const { error } = await supabase
      .from('market_listings')
      .update({ status: 'approved' })
      .eq('id', listingId);

    if (error) return c.json({ error: error.message }, 400);
    return c.json({ success: true });
  } catch (error) {
    console.error('Approve listing error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Delete marketplace listing (admin only)
app.delete('/make-server-97527403/marketplace/:id', async (c) => {
  try {
    const listingId = c.req.param('id');
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Authorization required' }, 401);

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (!user?.id || authError) return c.json({ error: 'Unauthorized' }, 401);

    const { data: prof } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
    const role = (prof as any)?.role;
    if (role !== 'admin' && role !== 'editor') return c.json({ error: 'Forbidden' }, 403);

    const { error } = await supabase
      .from('market_listings')
      .delete()
      .eq('id', listingId);

    if (error) return c.json({ error: error.message }, 400);
    return c.json({ success: true });
  } catch (error) {
    console.error('Delete listing error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});
// Health check endpoint
app.get("/make-server-97527403/health", (c) => {
  console.log('Health check endpoint hit');
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Handle OPTIONS requests explicitly
app.options("/make-server-97527403/*", (c) => {
  return new Response(null, { status: 200 });
});

// Authentication routes
app.post('/make-server-97527403/auth/signup', async (c) => {
  try {
    const { email, password, userData } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: userData,
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.error('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Store user profile in database instead of KV store
    try {
      await supabase.from('profiles').insert({
        user_id: data.user.id,
        full_name: userData.full_name,
        role: userData.role || 'car_browser',
        location: userData.location,
        xp_points: 0,
        level: 1,
        wallet_balance: 0,
      });
    } catch (err) {
      console.log('Profile creation failed (will be created by trigger):', err);
    }

    return c.json({ data, message: 'User created successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/make-server-97527403/auth/signin', async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Signin error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Get user profile from database instead of KV store
    let profile = null;
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (profileError) {
        console.log('Profile fetch error:', profileError.message);
      } else {
        profile = profileData;
      }
    } catch (err) {
      console.log('Profile fetch failed (optional):', err);
    }

    return c.json({ data: { ...data, profile } });
  } catch (error) {
    console.error('Signin error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Car listings routes
app.get('/make-server-97527403/listings', async (c) => {
  try {
    // Get listings from database instead of KV store
    const { data: listings, error } = await supabase
      .from('car_listings')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Listings error:', error);
      return c.json({ error: error.message }, 400);
    }
    
    return c.json({ data: listings || [] });
  } catch (error) {
    console.error('Listings error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/make-server-97527403/listings', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization header required' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const listingData = await c.req.json();
    const listingId = crypto.randomUUID();
    
    const listing = {
      id: listingId,
      ...listingData,
      user_id: user.id,
      status: 'active',
      views_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await kv.set(`listing:${listingId}`, listing);

    return c.json({ data: listing });
  } catch (error) {
    console.error('Create listing error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Garage routes
app.get('/make-server-97527403/garages', async (c) => {
  try {
    const garages = await kv.getByPrefix('garage:');
    
    // Filter verified garages only
    const verifiedGarages = garages.filter((garage: any) => garage.is_verified === true);
    
    return c.json({ data: verifiedGarages });
  } catch (error) {
    console.error('Garages error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Community routes
app.get('/make-server-97527403/communities', async (c) => {
  try {
    const communities = await kv.getByPrefix('community:');
    return c.json({ data: communities });
  } catch (error) {
    console.error('Communities error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Events routes
app.get('/make-server-97527403/events', async (c) => {
  try {
    const events = await kv.getByPrefix('event:');
    
    // Filter upcoming events only
    const upcomingEvents = events.filter((event: any) => 
      event.status === 'upcoming' && new Date(event.event_date) > new Date()
    );
    
    return c.json({ data: upcomingEvents });
  } catch (error) {
    console.error('Events error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Offers routes
app.get('/make-server-97527403/offers', async (c) => {
  try {
    const offers = await kv.getByPrefix('offer:');
    
    // Filter active offers only
    const activeOffers = offers.filter((offer: any) => 
      offer.is_active === true && new Date(offer.valid_until) > new Date()
    );
    
    return c.json({ data: activeOffers });
  } catch (error) {
    console.error('Offers error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Profile routes
app.get('/make-server-97527403/profile/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const profile = await kv.get(`profile:${userId}`);
    
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    return c.json({ data: profile });
  } catch (error) {
    console.error('Profile error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.put('/make-server-97527403/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization header required' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profileData = await c.req.json();
    const existingProfile = await kv.get(`profile:${user.id}`);
    
    const updatedProfile = {
      ...existingProfile,
      ...profileData,
      updated_at: new Date().toISOString()
    };

    await kv.set(`profile:${user.id}`, updatedProfile);

    return c.json({ data: updatedProfile });
  } catch (error) {
    console.error('Profile update error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Notifications routes
app.get('/make-server-97527403/notifications', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization header required' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const notifications = await kv.getByPrefix(`notification:${user.id}:`);
    
    return c.json({ data: notifications });
  } catch (error) {
    console.error('Notifications error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Repair bids routes
app.get('/make-server-97527403/repair-bids', async (c) => {
  try {
    const repairBids = await kv.getByPrefix('repair-bid:');
    
    // Filter open bids only
    const openBids = repairBids.filter((bid: any) => bid.status === 'open');
    
    return c.json({ data: openBids });
  } catch (error) {
    console.error('Repair bids error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Search route
app.get('/make-server-97527403/search', async (c) => {
  try {
    const query = c.req.query('q');
    const type = c.req.query('type') || 'all';
    
    if (!query) {
      return c.json({ error: 'Search query is required' }, 400);
    }

    let results = { listings: [], garages: [], communities: [], events: [] };

    // Search listings
    if (type === 'all' || type === 'listings') {
      const listings = await kv.getByPrefix('listing:');
      results.listings = listings.filter((listing: any) => 
        listing.status === 'active' && (
          listing.title?.toLowerCase().includes(query.toLowerCase()) ||
          listing.brand?.toLowerCase().includes(query.toLowerCase()) ||
          listing.model?.toLowerCase().includes(query.toLowerCase())
        )
      ).slice(0, 10);
    }

    // Search garages
    if (type === 'all' || type === 'garages') {
      const garages = await kv.getByPrefix('garage:');
      results.garages = garages.filter((garage: any) => 
        garage.is_verified === true && (
          garage.name?.toLowerCase().includes(query.toLowerCase()) ||
          garage.location?.toLowerCase().includes(query.toLowerCase())
        )
      ).slice(0, 10);
    }

    return c.json({ data: results });
  } catch (error) {
    console.error('Search error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Initialize sample data on startup
app.post('/make-server-97527403/init-sample-data', async (c) => {
  try {
    // Sample garage data
    const sampleGarages = [
      {
        id: crypto.randomUUID(),
        name: 'Precision Motors BMW Specialist',
        description: 'Expert BMW service and repair center with certified technicians',
        specialization: ['BMW', 'MINI', 'Rolls-Royce'],
        services: ['Engine Repair', 'Transmission', 'Body Work', 'Electrical', 'Diagnostics'],
        location: 'Al Quoz Industrial Area 3',
        phone: '+971 4 321 4567',
        email: 'info@precisionmotors.ae',
        website: 'https://precisionmotors.ae',
        is_verified: true,
        is_premium: true,
        rating: 4.8,
        review_count: 127,
        response_time: 'Usually responds in 2 hours',
        is_open: true,
        cover_image: 'https://images.unsplash.com/photo-1486754735734-325b5831c3ad?w=600&h=400&fit=crop',
        created_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        name: 'Gulf Coast Auto Repair',
        description: 'General automotive repair services for all car brands',
        specialization: ['General Repair', 'Japanese Cars', 'Korean Cars'],
        services: ['General Repair', 'Oil Change', 'Brake Service', 'Battery', 'AC Service'],
        location: 'Deira',
        phone: '+971 4 234 5678',
        email: 'service@gulfcoast.ae',
        is_verified: true,
        is_premium: false,
        rating: 4.5,
        review_count: 89,
        response_time: 'Usually responds in 4 hours',
        is_open: true,
        cover_image: 'https://images.unsplash.com/photo-1558618047-b0cb5c2d6fdc?w=600&h=400&fit=crop',
        created_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        name: 'Mercedes Benz Service Center',
        description: 'Authorized Mercedes-Benz service center',
        specialization: ['Mercedes-Benz', 'AMG', 'Maybach'],
        services: ['Warranty Service', 'Engine Repair', 'Transmission', 'Body Work'],
        location: 'Sheikh Zayed Road',
        phone: '+971 4 345 6789',
        email: 'service@mercedesuae.com',
        website: 'https://mercedes-benz.ae',
        is_verified: true,
        is_premium: true,
        rating: 4.9,
        review_count: 203,
        response_time: 'Usually responds in 1 hour',
        is_open: true,
        cover_image: 'https://images.unsplash.com/photo-1580415216913-5b61e15d1f8e?w=600&h=400&fit=crop',
        created_at: new Date().toISOString()
      }
    ];

    // Sample community data
    const sampleCommunities = [
      {
        id: crypto.randomUUID(),
        name: 'BMW Enthusiasts UAE',
        description: 'Everything about BMW cars in UAE. Share experiences, modifications, and tips.',
        category: 'brand',
        is_private: false,
        member_count: 1250,
        cover_image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=300&fit=crop',
        created_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        name: 'Dubai Car Meet',
        description: 'Weekly car meets in Dubai. Join us for amazing gatherings and photo sessions.',
        category: 'location',
        is_private: false,
        member_count: 890,
        cover_image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=300&fit=crop',
        created_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        name: 'Supercar Owners Club',
        description: 'Exclusive community for supercar owners in the UAE',
        category: 'luxury',
        is_private: true,
        member_count: 145,
        cover_image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&h=300&fit=crop',
        created_at: new Date().toISOString()
      }
    ];

    // Sample offer data
    const sampleOffers = [
      {
        id: crypto.randomUUID(),
        title: '50% Off BMW Service Package',
        description: 'Complete maintenance package for BMW vehicles including oil change, brake inspection, and diagnostics',
        discount_percentage: 50,
        original_price: 2000,
        discounted_price: 1000,
        currency: 'AED',
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        terms: 'Valid for first-time customers only. Cannot be combined with other offers.',
        category: 'Service',
        locations: ['Al Quoz', 'Sharjah', 'Ajman'],
        is_active: true,
        usage_count: 15,
        max_usage: 100,
        image: 'https://images.unsplash.com/photo-1558618047-b0cb5c2d6fdc?w=400&h=300&fit=crop',
        created_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        title: 'Free Car Wash with Full Service',
        description: 'Get a complimentary car wash when you book a full service package',
        discount_percentage: 25,
        original_price: 800,
        discounted_price: 600,
        currency: 'AED',
        valid_until: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        terms: 'Valid at all locations. Advance booking required.',
        category: 'Service',
        locations: ['Dubai', 'Abu Dhabi', 'Sharjah'],
        is_active: true,
        usage_count: 32,
        max_usage: 50,
        image: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&h=300&fit=crop',
        created_at: new Date().toISOString()
      }
    ];

    // Sample events data
    const sampleEvents = [
      {
        id: crypto.randomUUID(),
        creator_id: crypto.randomUUID(),
        title: 'Dubai Supercar Meet 2024',
        description: 'Join us for the biggest supercar gathering in Dubai. Meet fellow enthusiasts, show off your ride, and enjoy an amazing day.',
        event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        location: 'Dubai Marina Walk',
        max_attendees: 200,
        current_attendees: 67,
        event_type: 'Car Meet',
        is_paid: false,
        price: 0,
        status: 'upcoming',
        image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=400&fit=crop',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        creator_id: crypto.randomUUID(),
        title: 'Track Day at Dubai Autodrome',
        description: 'Experience the thrill of racing on a professional track. All skill levels welcome.',
        event_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
        location: 'Dubai Autodrome',
        max_attendees: 50,
        current_attendees: 23,
        event_type: 'Track Day',
        is_paid: true,
        price: 500,
        status: 'upcoming',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        creator_id: crypto.randomUUID(),
        title: 'Classic Car Exhibition',
        description: 'Showcase of vintage and classic automobiles from around the world',
        event_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days from now
        location: 'Dubai World Trade Centre',
        max_attendees: 1000,
        current_attendees: 156,
        event_type: 'Exhibition',
        is_paid: true,
        price: 75,
        status: 'upcoming',
        image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&h=400&fit=crop',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    // Sample car listings
    const sampleListings = [
      {
        id: crypto.randomUUID(),
        user_id: crypto.randomUUID(),
        title: '2023 BMW M3 Competition - Pristine Condition',
        description: 'Barely driven BMW M3 Competition with only 5,000km. Full BMW warranty remaining.',
        brand: 'BMW',
        model: 'M3',
        year: 2023,
        price: 450000,
        currency: 'AED',
        mileage: 5000,
        condition: 'certified',
        location: 'Dubai Marina',
        images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&h=400&fit=crop'],
        features: ['Carbon Fiber Roof', 'Harman Kardon Sound', 'M Performance Exhaust', 'Adaptive Suspension'],
        is_featured: true,
        is_boosted: false,
        status: 'active',
        views_count: 245,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        user_id: crypto.randomUUID(),
        title: '2021 Mercedes-AMG GT 63 S 4MATIC+',
        description: 'Performance luxury sedan with incredible power and comfort. Immaculately maintained.',
        brand: 'Mercedes-Benz',
        model: 'AMG GT 63 S',
        year: 2021,
        price: 520000,
        currency: 'AED',
        mileage: 25000,
        condition: 'used',
        location: 'Abu Dhabi',
        images: ['https://images.unsplash.com/photo-1606611013016-969fb3b1e894?w=600&h=400&fit=crop'],
        features: ['AMG Performance Exhaust', 'Panoramic Sunroof', 'AMG Track Pace', 'Burmester Sound'],
        is_featured: false,
        is_boosted: true,
        status: 'active',
        views_count: 189,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    // Store sample data
    for (const garage of sampleGarages) {
      await kv.set(`garage:${garage.id}`, garage);
    }

    for (const community of sampleCommunities) {
      await kv.set(`community:${community.id}`, community);
    }

    for (const offer of sampleOffers) {
      await kv.set(`offer:${offer.id}`, offer);
    }

    for (const event of sampleEvents) {
      await kv.set(`event:${event.id}`, event);
    }

    for (const listing of sampleListings) {
      await kv.set(`listing:${listing.id}`, listing);
    }

    return c.json({ 
      message: 'Sample data initialized successfully',
      data: {
        garages: sampleGarages.length,
        communities: sampleCommunities.length,
        offers: sampleOffers.length,
        events: sampleEvents.length,
        listings: sampleListings.length
      }
    });
  } catch (error) {
    console.error('Init sample data error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// =============================================================================
// STRIPE PAYMENT INTEGRATION
// =============================================================================

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
});

// Create Stripe Checkout Session
app.post('/make-server-97527403/stripe/create-checkout', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { amount, description } = await c.req.json();

    if (!amount || amount < 10) {
      return c.json({ error: 'Invalid amount (minimum AED 10)' }, 400);
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'aed',
            product_data: {
              name: description || 'Wallet Top-Up',
              description: `Add AED ${amount} to your Sublimes Drive wallet`,
            },
            unit_amount: amount * 100, // Convert to fils (Stripe uses smallest currency unit)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${c.req.header('origin') || 'http://localhost:5173'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${c.req.header('origin') || 'http://localhost:5173'}/wallet`,
      metadata: {
        user_id: user.id,
        amount: amount.toString(),
        description: description || 'Wallet Top-Up',
      },
    });

    console.log(`Stripe checkout session created for user ${user.id}: ${session.id}`);

    return c.json({ sessionId: session.id });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return c.json({ error: error.message || 'Failed to create checkout session' }, 500);
  }
});

// Create Stripe Checkout Session for Offers
app.post('/make-server-97527403/stripe/create-offer-checkout', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { offer_id, offer_title, amount, currency } = await c.req.json();

    if (!offer_id || !amount || amount < 10) {
      return c.json({ error: 'Invalid offer data' }, 400);
    }

    // Verify offer exists and is active
    const { data: offer, error: offerError } = await supabase
      .from('offers')
      .select('*')
      .eq('id', offer_id)
      .single();

    if (offerError || !offer) {
      return c.json({ error: 'Offer not found' }, 404);
    }

    if (!offer.is_active) {
      return c.json({ error: 'Offer is no longer active' }, 400);
    }

    // Check if user already purchased this offer
    const { data: existingPurchase } = await supabase
      .from('offer_redemptions')
      .select('id')
      .eq('offer_id', offer_id)
      .eq('user_id', user.id)
      .single();

    if (existingPurchase) {
      return c.json({ error: 'You have already purchased this offer' }, 400);
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency || 'aed',
            product_data: {
              name: offer_title || offer.title,
              description: offer.description || 'Exclusive offer for Chinese car owners in UAE',
              images: offer.image_urls && offer.image_urls.length > 0 ? [offer.image_urls[0]] : [],
            },
            unit_amount: Math.round(amount * 100), // Convert to smallest currency unit
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${c.req.header('origin') || 'http://localhost:5173'}/offers?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${c.req.header('origin') || 'http://localhost:5173'}/offers?payment=cancelled`,
      metadata: {
        user_id: user.id,
        offer_id: offer_id,
        offer_title: offer_title || offer.title,
        amount: amount.toString(),
        type: 'offer_purchase',
      },
    });

    console.log(`Offer checkout session created for user ${user.id}, offer ${offer_id}: ${session.id}`);

    return c.json({ sessionId: session.id });
  } catch (error: any) {
    console.error('Stripe offer checkout error:', error);
    return c.json({ error: error.message || 'Failed to create checkout session' }, 500);
  }
});

// Get redemption code after successful payment
app.get('/make-server-97527403/offers/:offerId/redemption', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const offerId = c.req.param('offerId');

    // Get user's redemption for this offer
    const { data: redemption, error } = await supabase
      .from('offer_redemptions')
      .select('*')
      .eq('offer_id', offerId)
      .eq('user_id', user.id)
      .single();

    if (error || !redemption) {
      return c.json({ error: 'Redemption not found' }, 404);
    }

    return c.json({ redemption });
  } catch (error: any) {
    console.error('Get redemption error:', error);
    return c.json({ error: error.message || 'Failed to get redemption' }, 500);
  }
});

// Stripe Webhook Handler
app.post('/make-server-97527403/stripe/webhook', async (c) => {
  try {
    const sig = c.req.header('stripe-signature');
    const body = await c.req.text();

    if (!sig) {
      console.error('No Stripe signature found');
      return c.json({ error: 'No signature' }, 400);
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''
      );
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return c.json({ error: 'Webhook signature verification failed' }, 400);
    }

    console.log(`Stripe webhook event: ${event.type}`);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const amount = parseFloat(session.metadata?.amount || '0');
        const paymentType = session.metadata?.type || 'wallet_topup';
        const description = session.metadata?.description || 'Wallet Top-Up';

        if (!userId) {
          console.error('No user_id in session metadata');
          break;
        }

        // Handle different payment types
        if (paymentType === 'offer_purchase') {
          // OFFER PURCHASE - Generate redemption code
          const offerId = session.metadata?.offer_id;
          
          if (!offerId) {
            console.error('No offer_id in session metadata');
            break;
          }

          console.log(`Offer payment successful - User: ${userId}, Offer: ${offerId}, Amount: AED ${amount}`);

          // Generate unique redemption code
          const redemptionCode = `OFFER-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

          // Create offer redemption record
          const { data: redemption, error: redemptionError } = await supabase
            .from('offer_redemptions')
            .insert({
              offer_id: offerId,
              user_id: userId,
              redemption_code: redemptionCode,
              redemption_status: 'pending',
              payment_amount: amount,
              payment_status: 'completed',
              stripe_session_id: session.id,
              stripe_payment_intent: session.payment_intent,
            })
            .select()
            .single();

          if (redemptionError) {
            console.error('Error creating redemption:', redemptionError);
          } else {
            console.log(`✅ Redemption created: ${redemptionCode}`);
            
            // Update offer redemption count
            await supabase.rpc('increment_offer_redemptions', {
              p_offer_id: offerId
            });
          }

        } else {
          // WALLET TOP-UP - Credit wallet
          if (amount > 0) {
            console.log(`Wallet payment successful for user ${userId}: AED ${amount}`);

            // Credit the wallet using RPC function
            const { data, error } = await supabase.rpc('wallet_credit', {
              p_user_id: userId,
              p_amount: amount,
              p_description: description,
            });

            if (error) {
              console.error('Failed to credit wallet:', error);
              return c.json({ error: 'Failed to credit wallet' }, 500);
            }

            console.log(`Wallet credited successfully for user ${userId}`);
          }
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        console.log(`Refund processed: ${charge.id}`);
        // Handle refund logic here if needed
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment intent succeeded: ${paymentIntent.id}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return c.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return c.json({ error: 'Webhook handler failed' }, 500);
  }
});

// Create Payment Intent (for direct card payments)
app.post('/make-server-97527403/payments/create-intent', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { amount, currency, description, metadata } = await c.req.json();

    if (!amount || amount < 10) {
      return c.json({ error: 'Invalid amount (minimum 10 AED)' }, 400);
    }

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // Already in fils (smallest unit)
      currency: currency || 'aed',
      description: description || 'Sublimes Drive payment',
      metadata: {
        user_id: user.id,
        ...metadata,
      },
    });

    console.log(`Payment intent created: ${paymentIntent.id} for user ${user.id}`);

    return c.json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error('Payment intent error:', error);
    return c.json({ error: error.message || 'Failed to create payment intent' }, 500);
  }
});

// Verify Stripe connection (test endpoint)
app.get('/make-server-97527403/stripe/test', async (c) => {
  try {
    const balance = await stripe.balance.retrieve();
    return c.json({ 
      status: 'Stripe connected successfully', 
      currency: balance.available[0]?.currency || 'aed',
      test_mode: true 
    });
  } catch (error: any) {
    console.error('Stripe test error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============================================================================
// POSTS ROUTES
// ============================================================================

// Get all posts (with user info, likes, comments count)
app.get('/make-server-97527403/posts', async (c) => {
  try {
    // Fetch posts WITHOUT foreign key join (workaround for missing FK constraint)
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      // If permission denied or table doesn't exist, return empty array instead of error
      // This allows the app to work even if posts table isn't set up yet
      if (error.code === '42501' || error.code === '42P01') {
        // Silently return empty array - no error logging needed
        return c.json({ posts: [] });
      }
      
      // Only log non-permission errors
      console.error('Error fetching posts:', error);
      return c.json({ error: error.message, details: error }, 500);
    }

    // Manually fetch user data and counts for each post
    const postsWithCounts = await Promise.all((posts || []).map(async (post) => {
      // Get user profile
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, role, verified')
        .eq('id', post.user_id)
        .single();

      // Get likes count
      const { count: likesCount } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('target_id', post.id)
        .eq('target_type', 'post');

      // Get comments count
      const { count: commentsCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('target_id', post.id)
        .eq('target_type', 'post');

      return {
        ...post,
        user: userProfile || null,
        likes_count: likesCount || 0,
        comments_count: commentsCount || 0,
      };
    }));

    return c.json({ posts: postsWithCounts });
  } catch (error: any) {
    // Silently return empty array on any error
    return c.json({ posts: [] });
  }
});

// Create a new post
app.post('/make-server-97527403/posts', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { title, content, images, tags, location } = await c.req.json();

    // Require at least text content or some media
    if ((!content || String(content).trim().length === 0) && (!images || (Array.isArray(images) && images.length === 0))) {
      return c.json({ error: 'Content or media is required' }, 400);
    }

    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        title: (title && String(title).trim().length > 0) ? String(title).trim() : 'Untitled Post',
        content: (content && typeof content === 'string') ? content.trim() : '',
        images: images || [],
        tags: tags || [],
        location: location || null,
        views_count: 0,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating post:', error);
      if (error.code === '42501' || error.code === '42P01') {
        return c.json({ 
          error: 'Posts table not set up. Please run the setup SQL in Supabase dashboard.',
          details: 'Go to Supabase > SQL Editor and create the posts table',
          sql_needed: true
        }, 503);
      }
      return c.json({ error: error.message }, 500);
    }

    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, role, verified')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
    }

    const postWithUser = {
      ...post,
      user: userProfile || null,
    };

    console.log(`Post created: ${post.id} by user ${user.id}`);
    return c.json({ post: postWithUser });
  } catch (error: any) {
    console.error('Post creation error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Delete a post
app.delete('/make-server-97527403/posts/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const postId = c.req.param('id');

    // Check if user owns the post
    const { data: post } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', postId)
      .single();

    if (!post) {
      return c.json({ error: 'Post not found' }, 404);
    }

    if (post.user_id !== user.id) {
      return c.json({ error: 'Unauthorized to delete this post' }, 403);
    }

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) {
      console.error('Error deleting post:', error);
      return c.json({ error: error.message }, 500);
    }

    console.log(`Post deleted: ${postId} by user ${user.id}`);
    return c.json({ success: true });
  } catch (error: any) {
    console.error('Post deletion error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Increment post views
app.post('/make-server-97527403/posts/:id/view', async (c) => {
  try {
    const postId = c.req.param('id');

    const { error } = await supabase.rpc('increment_post_views', {
      post_id: postId
    });

    if (error) {
      console.error('Error incrementing views:', error);
      // Don't return error to client, views are not critical
    }

    return c.json({ success: true });
  } catch (error: any) {
    console.error('View increment error:', error);
    return c.json({ success: true }); // Always return success for views
  }
});

Deno.serve(app.fetch);