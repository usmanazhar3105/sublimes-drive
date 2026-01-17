/**
 * AI Edge Function: ai_on_new_comment
 * Responds to comments in threads where Freya is mentioned or active
 * 
 * Triggered by: Database trigger on comments table
 * Rate Limited: Yes
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const payload = await req.json()
    const comment = payload.record

    console.log('New comment detected:', comment.id)

    // Get Freya's agent
    const { data: freyaAgent } = await supabaseClient
      .from('ai_agents')
      .select('*')
      .eq('email', 'freya@sublimesdrive.com')
      .single()

    if (!freyaAgent) {
      return new Response(JSON.stringify({ error: 'AI agent not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      })
    }

    // Check if comment mentions Freya or is in an active thread
    const shouldRespond = comment.content.toLowerCase().includes('@freya') ||
                          comment.content.toLowerCase().includes('freya')

    if (!shouldRespond) {
      // Check if Freya is active in this thread
      const { data: threadContext } = await supabaseClient
        .rpc('fn_ai_get_thread_context', {
          p_agent_id: freyaAgent.id,
          p_post_id: comment.post_id
        })

      if (!threadContext?.is_active) {
        return new Response(JSON.stringify({ message: 'No response needed' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      }
    }

    // Check rate limits
    const { data: rateLimitOk } = await supabaseClient
      .rpc('fn_ai_check_rate_limits', {
        p_agent_id: freyaAgent.id
      })

    if (!rateLimitOk) {
      return new Response(JSON.stringify({ message: 'Rate limit exceeded' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 429,
      })
    }

    // Get full thread context
    const { data: threadComments } = await supabaseClient
      .from('comments')
      .select(`
        *,
        author:profiles!comments_author_id_fkey(display_name, username)
      `)
      .eq('post_id', comment.post_id)
      .order('created_at', { ascending: true })

    // Generate contextual response
    const aiResponse = await generateThreadResponse(comment, threadComments, freyaAgent)

    // Create comment thread record
    const { data: threadRecord } = await supabaseClient
      .from('ai_comment_threads')
      .insert({
        agent_id: freyaAgent.id,
        post_id: comment.post_id,
        parent_comment_id: comment.id,
        response_text: aiResponse.text,
        confidence_score: aiResponse.confidence,
        metadata: {
          model: aiResponse.model,
          tokens: aiResponse.tokens
        }
      })
      .select()
      .single()

    // Post reply comment
    await supabaseClient
      .from('comments')
      .insert({
        post_id: comment.post_id,
        parent_comment_id: comment.id,
        author_id: freyaAgent.id,
        content: aiResponse.text,
        metadata: {
          ai_thread_id: threadRecord.id,
          confidence: aiResponse.confidence
        }
      })

    // Increment rate limit
    await supabaseClient.rpc('fn_ai_increment_rate_limit', {
      p_agent_id: freyaAgent.id
    })

    // Log activity
    await supabaseClient
      .from('ai_activity_log')
      .insert({
        agent_id: freyaAgent.id,
        action_type: 'comment_response',
        target_id: comment.id,
        target_type: 'comment',
        metadata: {
          thread_id: threadRecord.id,
          confidence: aiResponse.confidence
        }
      })

    return new Response(
      JSON.stringify({ 
        success: true, 
        thread_id: threadRecord.id,
        message: 'AI response generated'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in ai_on_new_comment:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

async function generateThreadResponse(comment: any, threadComments: any[], agent: any) {
  // Placeholder - integrate with LLM
  return {
    text: `Thanks for your comment! I'm here to help with any questions about ${
      comment.content.includes('?') ? 'that' : 'this topic'
    }.`,
    confidence: 0.80,
    model: 'gpt-4',
    tokens: 100
  }
}
