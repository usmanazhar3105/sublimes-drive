// Freya Dispatch - Route auto-comment jobs
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DispatchPayload {
  post_id: string;
  mode: 'auto_comment' | 'summary_reply';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { post_id, mode }: DispatchPayload = await req.json();

    // 1. Load settings
    const { data: settings } = await supabase
      .from('freya_settings')
      .select('*')
      .limit(1)
      .single();

    if (!settings) {
      throw new Error('Freya settings not configured');
    }

    // 2. Check brand whitelist
    const { data: post } = await supabase
      .from('posts')
      .select('title, body, media')
      .eq('id', post_id)
      .single();

    if (!post) {
      throw new Error('Post not found');
    }

    const brands = settings.brand_whitelist.split(',').map((b: string) => b.trim());
    const postText = `${post.title || ''} ${post.body || ''}`.toLowerCase();
    const matchesBrand = brands.some((brand: string) => 
      postText.includes(brand.toLowerCase())
    );

    if (!matchesBrand) {
      // Skip - not a Chinese brand post
      await supabase.from('freya_runs').insert({
        post_id,
        action: mode,
        status: 'skipped',
        reason: 'brand_not_whitelisted'
      });
      return new Response(JSON.stringify({ skipped: true, reason: 'brand' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 3. Check daily budget
    const today = new Date().toISOString().split('T')[0];
    const { data: budget } = await supabase
      .from('freya_budget')
      .select('*')
      .eq('day', today)
      .single();

    if (budget && budget.tokens_used >= (budget.tokens_limit || settings.daily_token_cap)) {
      await supabase.from('freya_runs').insert({
        post_id,
        action: mode,
        status: 'skipped',
        reason: 'budget_cap_reached'
      });
      return new Response(JSON.stringify({ skipped: true, reason: 'budget' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 4. Check 2-comment cap (transaction)
    const { data: state } = await supabase
      .from('freya_post_state')
      .select('*')
      .eq('post_id', post_id)
      .single();

    if (mode === 'auto_comment' && state?.auto_comment_id) {
      await supabase.from('freya_runs').insert({
        post_id,
        action: mode,
        status: 'skipped',
        reason: 'already_auto_commented'
      });
      return new Response(JSON.stringify({ skipped: true, reason: 'already_commented' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (mode === 'summary_reply' && state?.summary_reply_comment_id) {
      await supabase.from('freya_runs').insert({
        post_id,
        action: mode,
        status: 'skipped',
        reason: 'already_replied'
      });
      return new Response(JSON.stringify({ skipped: true, reason: 'already_replied' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 5. Call freya-generate
    const generateResponse = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/freya-generate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
        },
        body: JSON.stringify({
          post_id,
          mode,
          post_text: postText,
          images: post.media || []
        })
      }
    );

    if (!generateResponse.ok) {
      throw new Error('Generate failed');
    }

    const generated = await generateResponse.json();

    // 6. Post comment
    const { data: comment } = await supabase
      .from('comments')
      .insert({
        post_id,
        user_id: '00000000-0000-0000-0000-000000000000', // Freya's UUID
        body: generated.text,
        is_bot: true
      })
      .select('id')
      .single();

    // 7. Update state
    if (mode === 'auto_comment') {
      await supabase.from('freya_post_state').upsert({
        post_id,
        auto_comment_id: comment.id
      });
    } else {
      await supabase.from('freya_post_state').update({
        summary_reply_comment_id: comment.id
      }).eq('post_id', post_id);
    }

    // 8. Update budget
    await supabase.from('freya_budget').upsert({
      day: today,
      tokens_used: (budget?.tokens_used || 0) + generated.tokens_in + generated.tokens_out,
      tokens_limit: budget?.tokens_limit || settings.daily_token_cap
    });

    // 9. Log run
    await supabase.from('freya_runs').insert({
      post_id,
      action: mode,
      status: 'success',
      tokens_input: generated.tokens_in,
      tokens_output: generated.tokens_out,
      provider: settings.provider,
      model: generated.model,
      finished_at: new Date().toISOString()
    });

    return new Response(JSON.stringify({ success: true, comment_id: comment.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Dispatch error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
