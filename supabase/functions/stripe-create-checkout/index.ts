// Stripe: Create checkout session (supports dynamic amounts for wallet/listing/offer)
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno';

type CreateCheckoutPayload = {
  kind: string;
  price_id?: string | null;
  amount?: number | null; // minor units (fils/cents)
  target_id?: string | null;
  success_url?: string | null;
  cancel_url?: string | null;
  metadata?: Record<string, string> | null;
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!;

function json(status: number, body: unknown, origin?: string | null) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-authorization',
    'Access-Control-Max-Age': '86400',
  };
  
  return new Response(JSON.stringify(body), {
    status,
    headers,
  });
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    const origin = req.headers.get('origin') || '*';
    return json(200, {}, origin);
  }

  const origin = req.headers.get('origin') || '*';

  try {
    const authHeader = req.headers.get('Authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      return json(401, { error: 'Unauthorized' }, origin);
    }

    const payload = (await req.json().catch(() => ({}))) as CreateCheckoutPayload;
    const kind = String(payload.kind || '').trim();
    const priceId = payload.price_id ? String(payload.price_id) : null;
    const amount = payload.amount ?? null;
    const targetIdRaw = payload.target_id ? String(payload.target_id) : null;
    const successUrl = payload.success_url ? String(payload.success_url) : null;
    const cancelUrl = payload.cancel_url ? String(payload.cancel_url) : null;
    const metadata = payload.metadata ?? {};

    if (!kind) return json(400, { error: 'kind is required' }, origin);
    if (!successUrl || !cancelUrl) return json(400, { error: 'success_url and cancel_url are required' }, origin);

    // Auth client (validate user)
    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) return json(401, { error: 'Unauthorized' }, origin);

    // Admin client (bypass RLS for billing writes)
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Get or create Stripe customer
    const { data: existingCustomer } = await supabaseAdmin
      .from('billing_customers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();

    let customerId = (existingCustomer as any)?.stripe_customer_id as string | undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;
      await supabaseAdmin.from('billing_customers').upsert({
        user_id: user.id,
        stripe_customer_id: customerId,
      });
    }

    // Determine line items
    const usesDynamicAmount = ['wallet_credit', 'listing_fee', 'offer_purchase', 'parts'].includes(kind);
    if (!usesDynamicAmount && !priceId) {
      return json(400, { error: 'price_id is required for this kind' }, origin);
    }
    if (usesDynamicAmount && (!amount || amount <= 0)) {
      return json(400, { error: 'amount (minor units) is required for this kind' }, origin);
    }

    // Ensure wallet exists for wallet_credit (user wallets)
    let walletId: string | null = null;
    if (kind === 'wallet_credit') {
      const { data: wallet } = await supabaseAdmin
        .from('billing_wallets')
        .select('id')
        .eq('owner_type', 'user')
        .eq('owner_id', user.id)
        .maybeSingle();
      walletId = (wallet as any)?.id ?? null;
      if (!walletId) {
        const { data: createdWallet, error: walletErr } = await supabaseAdmin
          .from('billing_wallets')
          .insert({ owner_type: 'user', owner_id: user.id, currency: 'AED', balance: 0 })
          .select('id')
          .single();
        if (walletErr) return json(500, { error: walletErr.message }, origin);
        walletId = (createdWallet as any).id;
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

    const { data: order, error: orderErr } = await supabaseAdmin
      .from('orders')
      .insert(orderInsert)
      .select('id')
      .single();
    if (orderErr || !order) return json(500, { error: orderErr?.message || 'Failed to create order' }, origin);

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

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: lineItems as any,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: sessionMetadata,
    });

    // Update order with session id
    await supabaseAdmin
      .from('orders')
      .update({ stripe_checkout_session_id: session.id })
      .eq('id', (order as any).id);

    return json(200, { url: session.url, session_id: session.id, order_id: (order as any).id }, origin);
  } catch (error) {
    console.error('Checkout error:', error);
    return json(500, { error: (error as any)?.message || 'Checkout failed' }, origin);
  }
});
