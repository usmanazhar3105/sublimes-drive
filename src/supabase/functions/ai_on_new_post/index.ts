/**
 * AI Edge Function: ai_on_new_post
 * Automatically responds to new posts when Freya should engage
 * 
 * Triggered by: Database trigger on posts table
 * Rate Limited: Yes (via ai_rate_limits table)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PostPayload {
  type: 'INSERT'
  table: 'posts'
  record: {
    id: string
    content: string
    author_id: string
    community_id: string
    created_at: string
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse webhook payload
    const payload: PostPayload = await req.json()
    const post = payload.record

    console.log('New post detected:', post.id)

    // Get Freya's agent ID
    const { data: freyaAgent, error: agentError } = await supabaseClient
      .from('ai_agents')
      .select('*')
      .eq('email', 'freya@sublimesdrive.com')
      .single()

    if (agentError || !freyaAgent) {
      console.error('Freya agent not found:', agentError)
      return new Response(JSON.stringify({ error: 'AI agent not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      })
    }

    // Check if Freya should respond to this post
    const { data: shouldRespond, error: checkError } = await supabaseClient
      .rpc('fn_ai_should_respond', {
        p_agent_id: freyaAgent.id,
        p_post_id: post.id,
        p_content: post.content
      })

    if (checkError) {
      console.error('Error checking if should respond:', checkError)
      throw checkError
    }

    if (!shouldRespond) {
      console.log('Freya should not respond to this post')
      return new Response(JSON.stringify({ message: 'No response needed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Check rate limits
    const { data: rateLimitOk, error: rateLimitError } = await supabaseClient
      .rpc('fn_ai_check_rate_limits', {
        p_agent_id: freyaAgent.id
      })

    if (rateLimitError) {
      console.error('Error checking rate limits:', rateLimitError)
      throw rateLimitError
    }

    if (!rateLimitOk) {
      console.log('Rate limit exceeded for Freya')
      return new Response(JSON.stringify({ message: 'Rate limit exceeded' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 429,
      })
    }

    // Get post context (community, author, etc.)
    const { data: postContext, error: contextError } = await supabaseClient
      .from('posts')
      .select(`
        *,
        author:profiles!posts_author_id_fkey(display_name, username),
        community:communities(name, description)
      `)
      .eq('id', post.id)
      .single()

    if (contextError) {
      console.error('Error fetching post context:', contextError)
      throw contextError
    }

    // Generate AI response (placeholder - integrate with OpenAI/Anthropic)
    const aiResponse = await generateAIResponse(postContext, freyaAgent)

    // Create AI response record
    const { data: responseRecord, error: responseError } = await supabaseClient
      .from('ai_post_responses')
      .insert({
        agent_id: freyaAgent.id,
        post_id: post.id,
        response_text: aiResponse.text,
        confidence_score: aiResponse.confidence,
        response_type: aiResponse.type,
        metadata: {
          model: aiResponse.model,
          tokens: aiResponse.tokens,
          processing_time_ms: aiResponse.processingTime
        }
      })
      .select()
      .single()

    if (responseError) {
      console.error('Error creating response record:', responseError)
      throw responseError
    }

    // Post comment as Freya
    const { error: commentError } = await supabaseClient
      .from('comments')
      .insert({
        post_id: post.id,
        author_id: freyaAgent.id,
        content: aiResponse.text,
        metadata: {
          ai_response_id: responseRecord.id,
          confidence: aiResponse.confidence
        }
      })

    if (commentError) {
      console.error('Error posting comment:', commentError)
      throw commentError
    }

    // Increment rate limit
    await supabaseClient.rpc('fn_ai_increment_rate_limit', {
      p_agent_id: freyaAgent.id
    })

    // Log activity
    await supabaseClient
      .from('ai_activity_log')
      .insert({
        agent_id: freyaAgent.id,
        action_type: 'post_response',
        target_id: post.id,
        target_type: 'post',
        metadata: {
          response_id: responseRecord.id,
          confidence: aiResponse.confidence,
          processing_time_ms: aiResponse.processingTime
        }
      })

    console.log('Successfully responded to post:', post.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        response_id: responseRecord.id,
        message: 'AI response generated and posted'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in ai_on_new_post:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

/**
 * Generate AI response using LLM
 * TODO: Integrate with OpenAI/Anthropic API
 */
async function generateAIResponse(postContext: any, agent: any) {
  // Placeholder implementation
  // In production, call OpenAI/Anthropic API here
  
  const startTime = Date.now()
  
  // Simulate AI processing
  const response = {
    text: `Thank you for your post! As Sublimes Drive's AI assistant, I'm here to help. ${
      postContext.content.includes('?') 
        ? "I see you have a question. Let me provide some guidance..." 
        : "Feel free to ask if you need any assistance!"
    }`,
    confidence: 0.85,
    type: postContext.content.includes('?') ? 'answer' : 'acknowledgment',
    model: 'gpt-4',
    tokens: 150,
    processingTime: Date.now() - startTime
  }

  return response
}
