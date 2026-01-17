// Freya AI: Auto-comment on new community posts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { callLLM, detectLanguage } from '../_shared/llm.ts';
import { searchWeb } from '../_shared/search.ts';

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { post_id } = await req.json();

    // Load post
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', post_id)
      .single();

    if (postError || !post) {
      return new Response(JSON.stringify({ error: 'Post not found' }), { status: 404 });
    }

    // Load Freya agent
    const { data: agent } = await supabase
      .from('ai_agents_freya')
      .select('*')
      .eq('id', 'd8c1f7a7-9c89-4090-a0a6-b310120b190c')
      .single();

    if (!agent?.is_enabled) {
      return new Response(JSON.stringify({ message: 'AI disabled' }), { status: 200 });
    }

    // Check if already responded
    const { data: existing } = await supabase
      .from('ai_post_responses_freya')
      .select('id')
      .eq('agent_id', agent.id)
      .eq('post_id', post_id)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ message: 'Already responded' }), { status: 200 });
    }

    // Check if it's a question
    const postText = `${post.title || ''} ${post.body || ''}`;
    const isQuestion = /\?|how|what|where|when|which|why|suggest|recommend|help/i.test(postText);

    if (!isQuestion) {
      await supabase.from('ai_post_responses_freya').insert({
        agent_id: agent.id,
        post_id,
        status: 'skipped',
        reason: 'not a question'
      });
      return new Response(JSON.stringify({ message: 'Skipped' }), { status: 200 });
    }

    // Detect language
    const lang = await detectLanguage(postText);

    // Search web
    const sources = await searchWeb(postText, 3);

    // Compose answer
    const systemPrompt = `You are Freya, Sublimes Drive AI assistant (female). Answer in ${lang === 'ar' ? 'Arabic' : lang === 'zh' ? 'Chinese' : 'English'}. Be concise (80-180 words), helpful, neutral. Cite 1-3 sources if available. If unsafe/high-risk, politely refuse.`;

    const answer = await callLLM({
      systemPrompt,
      userMessage: `Question: ${postText}\n\nSources: ${sources.map(s => `${s.title} - ${s.snippet}`).join('\n')}`,
      maxTokens: 300
    });

    // Format with sources
    const sourcesText = sources.length > 0 
      ? `\n\n—\nAnswered by ${agent.name} • Sources: ${sources.map(s => `[${s.title}](${s.url})`).join(', ')}`
      : `\n\n—\nAnswered by ${agent.name}`;

    const finalBody = answer + sourcesText;

    // Post comment
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .insert({
        post_id,
        body: finalBody.substring(0, 900),
        is_bot: true,
        bot_agent_id: agent.id,
        parent_comment_id: null
      })
      .select('id')
      .single();

    if (commentError) {
      throw commentError;
    }

    // Record response
    await supabase.from('ai_post_responses_freya').insert({
      agent_id: agent.id,
      post_id,
      root_comment_id: comment.id,
      status: 'posted'
    });

    await supabase.from('ai_comment_threads_freya').insert({
      agent_id: agent.id,
      post_id,
      root_comment_id: comment.id
    });

    await supabase.from('ai_activity_log_freya').insert({
      agent_id: agent.id,
      event_type: 'new_post',
      post_id,
      comment_id: comment.id,
      language: lang,
      status: 'success'
    });

    return new Response(JSON.stringify({ success: true, comment_id: comment.id }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Freya AI error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
