/**
 * AI Edge Function: ai_admin_actions
 * Admin controls for Freya AI Assistant
 * 
 * Actions: enable/disable, update settings, clear rate limits, view analytics
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

    // Get auth token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // Verify user is admin
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // Check if user is admin
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden - Admin only' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      })
    }

    // Parse request
    const { action, agent_id, settings } = await req.json()

    // Get Freya agent
    const { data: agent } = await supabaseClient
      .from('ai_agents')
      .select('*')
      .eq('id', agent_id || 'd8c1f7a7-9c89-4090-a0a6-b310120b190c')
      .single()

    if (!agent) {
      return new Response(JSON.stringify({ error: 'Agent not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      })
    }

    let result

    switch (action) {
      case 'enable':
        result = await supabaseClient
          .from('ai_agents')
          .update({ is_enabled: true })
          .eq('id', agent.id)
        break

      case 'disable':
        result = await supabaseClient
          .from('ai_agents')
          .update({ is_enabled: false })
          .eq('id', agent.id)
        break

      case 'update_settings':
        result = await supabaseClient
          .from('ai_agent_settings')
          .update(settings)
          .eq('agent_id', agent.id)
        break

      case 'clear_rate_limits':
        result = await supabaseClient
          .from('ai_rate_limits')
          .delete()
          .eq('agent_id', agent.id)
        break

      case 'get_analytics':
        const { data: analytics } = await supabaseClient
          .from('ai_activity_log')
          .select('*')
          .eq('agent_id', agent.id)
          .order('created_at', { ascending: false })
          .limit(100)

        return new Response(
          JSON.stringify({ success: true, analytics }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )

      case 'get_status':
        const { data: rateLimits } = await supabaseClient
          .from('ai_rate_limits')
          .select('*')
          .eq('agent_id', agent.id)
          .single()

        const { data: recentActivity } = await supabaseClient
          .from('ai_activity_log')
          .select('count')
          .eq('agent_id', agent.id)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

        return new Response(
          JSON.stringify({
            success: true,
            status: {
              is_enabled: agent.is_enabled,
              rate_limits: rateLimits,
              activity_24h: recentActivity?.[0]?.count || 0
            }
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        })
    }

    return new Response(
      JSON.stringify({ success: true, message: `Action '${action}' completed` }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in ai_admin_actions:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
