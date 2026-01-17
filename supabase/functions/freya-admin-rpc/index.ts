// Freya Admin RPC - Settings management for admins
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, data } = await req.json();

    // Verify admin token
    const authHeader = req.headers.get('authorization');
    const adminToken = Deno.env.get('ADMIN_API_TOKEN');
    
    if (!authHeader || !authHeader.includes(adminToken || 'NO_TOKEN')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    switch (action) {
      case 'get_settings': {
        const { data: settings } = await supabase
          .from('freya_settings')
          .select('*')
          .limit(1)
          .single();
        
        return new Response(JSON.stringify({ settings }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'update_settings': {
        const { data: updated } = await supabase
          .from('freya_settings')
          .update(data)
          .eq('id', data.id)
          .select()
          .single();
        
        return new Response(JSON.stringify({ settings: updated }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'set_api_key': {
        // Store encrypted API key
        const { provider, api_key } = data;
        
        // Delete old key for this provider
        await supabase
          .from('freya_secrets')
          .delete()
          .eq('provider', provider);
        
        // Insert new key
        const { data: secret } = await supabase
          .from('freya_secrets')
          .insert({ provider, api_key })
          .select()
          .single();
        
        return new Response(JSON.stringify({ 
          success: true,
          message: 'API key saved securely' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'get_budget': {
        const today = new Date().toISOString().split('T')[0];
        const { data: budget } = await supabase
          .from('freya_budget')
          .select('*')
          .eq('day', today)
          .single();
        
        return new Response(JSON.stringify({ budget }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'get_stats': {
        // Get today's stats
        const today = new Date().toISOString().split('T')[0];
        
        const { data: budget } = await supabase
          .from('freya_budget')
          .select('*')
          .eq('day', today)
          .single();
        
        const { count: auto_comments } = await supabase
          .from('freya_runs')
          .select('*', { count: 'exact', head: true })
          .eq('action', 'auto_comment')
          .eq('status', 'success')
          .gte('created_at', `${today}T00:00:00`);
        
        const { count: summary_replies } = await supabase
          .from('freya_runs')
          .select('*', { count: 'exact', head: true })
          .eq('action', 'summary_reply')
          .eq('status', 'success')
          .gte('created_at', `${today}T00:00:00`);
        
        const { count: skipped } = await supabase
          .from('freya_runs')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'skipped')
          .gte('created_at', `${today}T00:00:00`);
        
        const { count: errors } = await supabase
          .from('freya_runs')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'failed')
          .gte('created_at', `${today}T00:00:00`);
        
        return new Response(JSON.stringify({
          stats: {
            tokens_used: budget?.tokens_used || 0,
            tokens_limit: budget?.tokens_limit || 0,
            auto_comments: auto_comments || 0,
            summary_replies: summary_replies || 0,
            skipped: skipped || 0,
            errors: errors || 0
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'get_runs': {
        const { limit = 50, offset = 0 } = data || {};
        
        const { data: runs } = await supabase
          .from('freya_runs')
          .select('*')
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);
        
        return new Response(JSON.stringify({ runs }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'test_prompt': {
        // Test API connectivity
        const { data: settings } = await supabase
          .from('freya_settings')
          .select('*')
          .limit(1)
          .single();
        
        if (!settings) {
          throw new Error('Settings not configured');
        }
        
        return new Response(JSON.stringify({ 
          success: true,
          message: 'Freya is configured correctly',
          provider: settings.provider,
          model: settings.model_text
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (error: any) {
    console.error('Admin RPC error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

