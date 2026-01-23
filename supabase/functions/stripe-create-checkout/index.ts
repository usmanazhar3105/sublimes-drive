// Stripe: Create checkout session (supports dynamic amounts for wallet/listing/offer)
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

type CreateCheckoutPayload = {
  kind: string;
  price_id?: string | null;
  amount?: number | null; // minor units (fils/cents)
  target_id?: string | null;
  success_url?: string | null;
  cancel_url?: string | null;
  metadata?: Record<string, string> | null;
  locale?: string | null; // Stripe checkout locale (e.g., 'en', 'ar', 'auto')
};

// Environment variables with validation
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || Deno.env.get('PROJECT_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('ANON_KEY') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SERVICE_ROLE_KEY') || '';
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') || '';

// Validate required environment variables
if (!SUPABASE_URL) {
  console.error('❌ SUPABASE_URL is not set');
}
if (!SUPABASE_ANON_KEY) {
  console.error('❌ SUPABASE_ANON_KEY is not set');
}
if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set');
}
if (!STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY is not set');
}

// CORS helper function - allows specific origins
const getCorsHeaders = (origin: string | null) => {
  // Allow specific origins
  const allowedOrigins = [
    'https://sublimes-drive-hoo.vercel.app',
    'https://app.sublimesdrive.com',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5174',
  ];
  
  // Normalize origin (remove trailing slash, lowercase for comparison)
  const normalizedOrigin = origin ? origin.toLowerCase().replace(/\/$/, '') : null;
  const normalizedAllowed = allowedOrigins.map(o => o.toLowerCase().replace(/\/$/, ''));
  
  // Check if origin is in allowed list (case-insensitive)
  const isAllowed = normalizedOrigin && normalizedAllowed.includes(normalizedOrigin);
  
  // Use origin if allowed, otherwise use the first allowed origin as fallback
  // Never use '*' when credentials are required
  const allowOrigin = isAllowed && origin ? origin : (allowedOrigins[0] || '*');
  
  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-client-authorization, accept',
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json',
  };
  
  // Only add credentials header if origin is specific (not '*')
  if (allowOrigin !== '*') {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }
  
  return headers;
};

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  // 🔴 REQUIRED: Handle OPTIONS preflight FIRST
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  // Check if Stripe is configured
  if (!STRIPE_SECRET_KEY) {
    return new Response(
      JSON.stringify({ 
        error: 'Configuration Error',
        message: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.'
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }

  try {
    const authHeader = req.headers.get('Authorization') || req.headers.get('x-client-authorization') || '';
    
    // Check if Authorization header is provided
    if (!authHeader) {
      return new Response(
        JSON.stringify({ 
          error: 'Unauthorized',
          message: 'Missing Authorization header. Please provide: Authorization: Bearer <your-access-token>'
        }),
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }
    
    // Extract token (handle both "Bearer <token>" and just "<token>" formats)
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    
    if (!token) {
      return new Response(
        JSON.stringify({ 
          error: 'Unauthorized',
          message: 'Invalid Authorization header format. Use: Bearer <your-access-token>'
        }),
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    // Parse request body with error handling
    let payload: CreateCheckoutPayload;
    try {
      const bodyText = await req.text();
      if (!bodyText) {
        return new Response(
          JSON.stringify({ error: 'Request body is required' }),
          {
            status: 400,
            headers: corsHeaders,
          }
        );
      }
      payload = JSON.parse(bodyText) as CreateCheckoutPayload;
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }
    const kind = String(payload.kind || '').trim();
    const priceId = payload.price_id ? String(payload.price_id) : null;
    const amount = payload.amount ?? null;
    const targetIdRaw = payload.target_id ? String(payload.target_id) : null;
    const successUrl = payload.success_url ? String(payload.success_url) : null;
    const cancelUrl = payload.cancel_url ? String(payload.cancel_url) : null;
    const metadata = payload.metadata ?? {};
    // Use 'auto' to let Stripe detect locale, or fallback to 'en' to avoid module errors
    const locale = payload.locale || 'auto';

    if (!kind) {
      return new Response(
        JSON.stringify({ error: 'kind is required' }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }
    
    if (!successUrl || !cancelUrl) {
      return new Response(
        JSON.stringify({ error: 'success_url and cancel_url are required' }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Validate Supabase URL
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return new Response(
        JSON.stringify({ 
          error: 'Configuration Error',
          message: 'Supabase configuration is missing'
        }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }

    // Auth client (validate user)
    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ 
          error: 'Unauthorized',
          message: userError?.message || 'Invalid or expired access token. Please sign in to get a valid token.'
        }),
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    // Admin client (bypass RLS for billing writes)
    if (!SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ 
          error: 'Configuration Error',
          message: 'Service role key is missing'
        }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }
    
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Initialize Stripe with error handling
    let stripe: Stripe;
    try {
      stripe = new Stripe(STRIPE_SECRET_KEY, {
        apiVersion: '2023-10-16',
        typescript: true,
      });
    } catch (stripeError) {
      console.error('Stripe initialization error:', stripeError);
      return new Response(
        JSON.stringify({ 
          error: 'Stripe Configuration Error',
          message: 'Failed to initialize Stripe client'
        }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }

    // Get or create Stripe customer
    let customerId: string | undefined;
    try {
      const { data: existingCustomer, error: customerError } = await supabaseAdmin
        .from('billing_customers')
        .select('stripe_customer_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (customerError && customerError.code !== 'PGRST116') {
        console.warn('Error fetching customer:', customerError);
      }

      customerId = (existingCustomer as any)?.stripe_customer_id as string | undefined;
      
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email ?? undefined,
          metadata: { user_id: user.id },
        });
        customerId = customer.id;
        
        const { error: upsertError } = await supabaseAdmin.from('billing_customers').upsert({
          user_id: user.id,
          stripe_customer_id: customerId,
        });
        
        if (upsertError) {
          console.warn('Error saving customer ID:', upsertError);
          // Continue anyway - customer was created in Stripe
        }
      }
    } catch (customerError: any) {
      console.error('Customer creation error:', customerError);
      return new Response(
        JSON.stringify({ 
          error: 'Customer Error',
          message: customerError?.message || 'Failed to get or create Stripe customer'
        }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }

    // Determine line items
    const usesDynamicAmount = ['wallet_credit', 'listing_fee', 'offer_purchase', 'parts'].includes(kind);
    if (!usesDynamicAmount && !priceId) {
      return new Response(
        JSON.stringify({ error: 'price_id is required for this kind' }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }
    if (usesDynamicAmount && (!amount || amount <= 0)) {
      return new Response(
        JSON.stringify({ error: 'amount (minor units) is required for this kind' }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Ensure wallet exists for wallet_credit (user wallets)
    let walletId: string | null = null;
    if (kind === 'wallet_credit') {
      try {
        const { data: wallet, error: walletFetchError } = await supabaseAdmin
          .from('billing_wallets')
          .select('id')
          .eq('owner_type', 'user')
          .eq('owner_id', user.id)
          .maybeSingle();
        
        if (walletFetchError && walletFetchError.code !== 'PGRST116') {
          console.warn('Error fetching wallet:', walletFetchError);
        }
        
        walletId = (wallet as any)?.id ?? null;
        if (!walletId) {
          const { data: createdWallet, error: walletErr } = await supabaseAdmin
            .from('billing_wallets')
            .insert({ owner_type: 'user', owner_id: user.id, currency: 'AED', balance: 0 })
            .select('id')
            .single();
          
          if (walletErr) {
            console.error('Wallet creation error:', walletErr);
            return new Response(
              JSON.stringify({ 
                error: 'Wallet Error',
                message: walletErr.message || 'Failed to create wallet'
              }),
              {
                status: 500,
                headers: corsHeaders,
              }
            );
          }
          walletId = (createdWallet as any).id;
        }
      } catch (walletError: any) {
        console.error('Wallet operation error:', walletError);
        // Continue without wallet ID - not critical for checkout
      }
    }

    // Create order
    const orderInsert: Record<string, unknown> = {
      user_id: user.id,
      kind,
      status: 'pending',
      currency: 'AED',
      amount: usesDynamicAmount ? amount : null,
      meta: metadata ?? {},
    };
    // Store target_id if it looks like a UUID; otherwise keep in meta only.
    if (targetIdRaw && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(targetIdRaw)) {
      orderInsert.target_id = targetIdRaw;
    } else if (targetIdRaw) {
      orderInsert.meta = { ...(metadata ?? {}), target_id: targetIdRaw };
    }

    let order: any;
    try {
      const { data: orderData, error: orderErr } = await supabaseAdmin
        .from('orders')
        .insert(orderInsert)
        .select('id')
        .single();
      
      if (orderErr || !orderData) {
        console.error('Order creation error:', orderErr);
        return new Response(
          JSON.stringify({ 
            error: 'Order Error',
            message: orderErr?.message || 'Failed to create order'
          }),
          {
            status: 500,
            headers: corsHeaders,
          }
        );
      }
      order = orderData;
    } catch (orderError: any) {
      console.error('Order operation error:', orderError);
      return new Response(
        JSON.stringify({ 
          error: 'Order Error',
          message: orderError?.message || 'Failed to create order'
        }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }

    const sessionMetadata: Record<string, string> = {
      order_id: (order as any).id,
      kind,
      user_id: user.id,
      ...(metadata ?? {}),
    };
    if (targetIdRaw) sessionMetadata.target_id = targetIdRaw;
    if (walletId) sessionMetadata.wallet_id = walletId;
    if (usesDynamicAmount && amount) sessionMetadata.amount = String(amount);

    const lineItems = usesDynamicAmount
      ? [{
          price_data: {
            currency: 'aed',
            product_data: {
              name:
                kind === 'wallet_credit'
                  ? 'Wallet Top-Up'
                  : kind === 'listing_fee'
                    ? 'Listing Fee'
                    : kind === 'offer_purchase'
                      ? 'Offer Purchase'
                      : 'Payment',
          },
            unit_amount: amount!,
          },
          quantity: 1,
        }]
      : [{ price: priceId!, quantity: 1 }];

    // Create checkout session with error handling
    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: lineItems as any,
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: sessionMetadata,
        payment_method_types: ['card'],
        locale: locale as any, // Set locale to fix language module errors ('auto', 'en', 'ar', etc.)
      });
    } catch (stripeError: any) {
      console.error('Stripe checkout session creation error:', stripeError);
      return new Response(
        JSON.stringify({ 
          error: 'Stripe Error',
          message: stripeError?.message || 'Failed to create checkout session',
          details: stripeError?.type || 'unknown'
        }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }

    // Update order with session id (non-blocking)
    try {
      await supabaseAdmin
        .from('orders')
        .update({ stripe_checkout_session_id: session.id })
        .eq('id', order.id);
    } catch (updateError) {
      console.warn('Failed to update order with session ID:', updateError);
      // Continue anyway - order was created, session was created
    }

    return new Response(
      JSON.stringify({ 
        url: session.url, 
        session_id: session.id, 
        order_id: order.id 
      }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error: any) {
    console.error('Unexpected checkout error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal Server Error',
        message: error?.message || 'Checkout failed',
        type: error?.name || 'UnknownError'
      }),
      {
        status: 500,
        headers: getCorsHeaders(req.headers.get('origin')),
      }
    );
  }
});
