// Freya Generate - LLM provider abstraction
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are "Freya", an automotive assistant for Chinese-brand cars only (BYD, Jetour, Changan, Geely, Haval, MG, Exeed, Chery, Hongqi, Zeekr, Ora).

Answer only if the post is clearly about these brands or generic car topics that apply to them.
If irrelevant or about other brands, respond with: "Skipping — not a Chinese-brand car question."

Write concise, practical steps. When image(s) provided, analyze them and point to exact UI/part names.
Limit yourself to one comment per post (auto) or one summary reply (reply mode).
Tone: friendly, precise, UAE context when relevant. No speculation; no medical/safety claims beyond common sense.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { post_text, mode, images } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Load settings
    const { data: settings } = await supabase
      .from('freya_settings')
      .select('*')
      .limit(1)
      .single();

    if (!settings) {
      throw new Error('Settings not found');
    }

    // Get API key from Supabase secrets or secrets table
    let apiKey = Deno.env.get('FREYA_OPENAI_API_KEY');
    if (!apiKey) {
      const { data: secrets } = await supabase
        .from('freya_secrets')
        .select('api_key')
        .eq('provider', settings.provider)
        .limit(1)
        .single();
      apiKey = secrets?.api_key;
    }

    if (!apiKey) {
      throw new Error('API key not configured');
    }

    // Build prompt
    const userPrompt = mode === 'auto_comment'
      ? `A user posted: "${post_text}"\n\nProvide a helpful, concise answer (max 600 characters). Focus on Chinese car brands.`
      : `Previous thread context...\n\nProvide a brief summary and final answer (max 400 characters).`;

    // Call OpenAI (or other provider)
    const model = images && images.length > 0 ? settings.model_vision : settings.model_text;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 600,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.choices[0].message.content;
    const tokens_in = data.usage.prompt_tokens;
    const tokens_out = data.usage.completion_tokens;

    return new Response(JSON.stringify({
      text,
      tokens_in,
      tokens_out,
      model
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Generate error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
