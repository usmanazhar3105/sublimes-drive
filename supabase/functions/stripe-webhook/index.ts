// Stripe Webhook Handler (idempotent)
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno';

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  
  if (!signature || !webhookSecret) {
    return new Response('Webhook secret not configured', { status: 400 });
  }

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
  });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    // Idempotency: Check if event already processed
    const { data: existing } = await supabase
      .from('stripe_events')
      .select('id')
      .eq('stripe_event_id', event.id)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ received: true, processed: 'duplicate' }), { status: 200 });
    }

    // Process event
    switch (event.type) {
      case 'checkout.session.completed': {
        // Enhanced webhook handler with idempotency
        const session = event.data.object as any;
        const orderId = session.metadata?.order_id;
        const meta = session.metadata || {};
        
        // Update order if present
        if (orderId) {
          const updatePayload: Record<string, any> = {
            status: 'succeeded',
            stripe_payment_intent_id: session.payment_intent,
            updated_at: new Date().toISOString(),
          };
          // Best-effort store amount if present
          if (typeof session.amount_total === 'number') updatePayload.amount = session.amount_total;

          await supabase.from('orders').update(updatePayload).eq('id', orderId);
        }

        // Boost activation (if boost row exists and is linked)
        if (meta.kind === 'boost_marketplace' || meta.kind === 'boost_garage') {
          const boostId = meta.boost_id;
          if (boostId) {
            await supabase.from('boosts').update({ status: 'active' }).eq('id', boostId);
          }
        }

        // Wallet credit (preferred: stripe-create-checkout metadata)
        if (meta.kind === 'wallet_credit') {
          const walletId = meta.wallet_id;
          const amount = parseInt(meta.amount || '0', 10);
          if (walletId && amount > 0) {
            await supabase.rpc('fn_credit_wallet', {
              p_wallet_id: walletId,
              p_amount: amount,
              p_ref_type: 'order',
              p_ref_id: orderId || null,
              p_meta: { stripe_session_id: session.id },
            });
          }
        }

        // Offer purchase (supports both stripe-create-checkout and legacy make-server metadata)
        const isOfferPurchase = meta.kind === 'offer_purchase' || meta.type === 'offer_purchase';
        if (isOfferPurchase && meta.offer_id && meta.user_id) {
          try {
            const { data: existingRedeem } = await supabase
              .from('offer_redemptions')
              .select('id')
              .eq('offer_id', meta.offer_id)
              .eq('user_id', meta.user_id)
              .maybeSingle();
            if (!existingRedeem) {
              await supabase.from('offer_redemptions').insert({
                offer_id: meta.offer_id,
                user_id: meta.user_id,
                created_at: new Date().toISOString(),
                meta: {
                  stripe_session_id: session.id,
                  stripe_payment_intent_id: session.payment_intent,
                  amount_total: session.amount_total,
                },
              } as any);
            }
          } catch (e) {
            console.error('Offer redemption insert failed (non-fatal):', e);
          }
        }

        // Legacy wallet top-up via make-server: metadata has { user_id, amount, description }
        // If we can, credit the user's billing wallet.
        if (!meta.kind && meta.user_id && meta.amount && String(meta.description || '').toLowerCase().includes('wallet')) {
          try {
            const amount = parseInt(meta.amount || '0', 10);
            if (amount > 0) {
              const { data: wallet } = await supabase
                .from('billing_wallets')
                .select('id')
                .eq('owner_type', 'user')
                .eq('owner_id', meta.user_id)
                .maybeSingle();
              let walletId = (wallet as any)?.id as string | undefined;
              if (!walletId) {
                const created = await supabase
                  .from('billing_wallets')
                  .insert({ owner_type: 'user', owner_id: meta.user_id, currency: 'AED', balance: 0 })
                  .select('id')
                  .single();
                walletId = (created.data as any)?.id;
              }
              if (walletId) {
                await supabase.rpc('fn_credit_wallet', {
                  p_wallet_id: walletId,
                  p_amount: amount,
                  p_ref_type: 'stripe_session',
                  p_ref_id: null,
                  p_meta: { stripe_session_id: session.id },
                });
              }
            }
          } catch (e) {
            console.error('Legacy wallet credit failed (non-fatal):', e);
          }
        }

        break;
      }

      case 'payment_intent.payment_failed': {
        const intent = event.data.object as any;
        await supabase
          .from('orders')
          .update({ status: 'failed', updated_at: new Date().toISOString() })
          .eq('stripe_payment_intent_id', intent.id);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as any;
        await supabase
          .from('orders')
          .update({ status: 'refunded', updated_at: new Date().toISOString() })
          .eq('stripe_payment_intent_id', charge.payment_intent);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as any;
        // Additional handling for successful payments
        console.log('Payment intent succeeded:', paymentIntent.id);
        break;
      }
    }

    // Log event as processed
    await supabase.from('stripe_events').insert({
      stripe_event_id: event.id,
      type: event.type,
      processed_at: new Date().toISOString()
    });

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }
});
