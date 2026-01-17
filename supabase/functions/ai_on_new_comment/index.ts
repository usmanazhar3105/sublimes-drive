// Freya AI: Reply in thread when users respond to her
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { callLLM } from '../_shared/llm.ts';

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { comment_id } = await req.json();

    // Load comment
    const { data: comment } = await supabase
      .from('comments')
      .select('*, post_id')
      .eq('id', comment_id)
      .single();

    if (!comment || comment.is_bot) {
      return new Response(JSON.stringify({ message: 'Not applicable' }), { status: 200 });
    }

    // Check if this is in Freya's thread
    const { data: thread } = await supabase
      .from('ai_comment_threads_freya')
      .select('root_comment_id')
      .eq('post_id', comment.post_id)
      .eq('agent_id', 'd8c1f7a7-9c89-4090-a0a6-b310120b190c')
      .maybeSingle();

    if (!thread) {
      return new Response(JSON.stringify({ message: 'Not in AI thread' }), { status: 200 });
    }

    // Check if commenting on Freya's comment or child
    let currentId = comment.parent_comment_id;
    let inThread = false;
    while (currentId && !inThread) {
      if (currentId === thread.root_comment_id) {
        inThread = true;
        break;
      }
      const { data: parent } = await supabase
        .from('comments')
        .select('parent_comment_id')
        .eq('id', currentId)
        .maybeSingle();
      currentId = parent?.parent_comment_id;
    }

    if (!inThread) {
      return new Response(JSON.stringify({ message: 'Not in AI thread' }), { status: 200 });
    }

    // Compose reply
    const systemPrompt = `You are Freya, continuing a thread. Answer the user's latest question briefly (<150 words).`;
    const answer = await callLLM({
      systemPrompt,
      userMessage: comment.body,
      maxTokens: 200
    });

    // Post reply
    const { data: reply } = await supabase
      .from('comments')
      .insert({
        post_id: comment.post_id,
        body: answer,
        is_bot: true,
        bot_agent_id: 'd8c1f7a7-9c89-4090-a0a6-b310120b190c',
        parent_comment_id: comment_id
      })
      .select('id')
      .single();

    await supabase.from('ai_activity_log_freya').insert({
      agent_id: 'd8c1f7a7-9c89-4090-a0a6-b310120b190c',
      event_type: 'reply',
      post_id: comment.post_id,
      comment_id: reply.id,
      thread_root_id: thread.root_comment_id,
      status: 'success'
    });

    return new Response(JSON.stringify({ success: true, reply_id: reply.id }), { status: 200 });

  } catch (error) {
    console.error('Freya reply error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
