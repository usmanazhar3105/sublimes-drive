// Freya AI: Admin controls
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const adminToken = req.headers.get('x-admin-token');
    if (adminToken !== Deno.env.get('ADMIN_API_TOKEN')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { action, post_id, setting_updates } = await req.json();

    switch (action) {
      case 'toggle_enabled':
        await supabase
          .from('ai_agents_freya')
          .update({ is_enabled: setting_updates.is_enabled })
          .eq('id', 'd8c1f7a7-9c89-4090-a0a6-b310120b190c');
        return new Response(JSON.stringify({ success: true }), { status: 200 });

      case 'delete_comment':
        const { data: response } = await supabase
          .from('ai_post_responses_freya')
          .select('root_comment_id')
          .eq('post_id', post_id)
          .single();
        
        if (response?.root_comment_id) {
          await supabase
            .from('comments')
            .delete()
            .eq('id', response.root_comment_id);
        }
        return new Response(JSON.stringify({ success: true }), { status: 200 });

      case 'flush_rate_limits':
        await supabase
          .from('ai_rate_limits_freya')
          .delete()
          .eq('agent_id', 'd8c1f7a7-9c89-4090-a0a6-b310120b190c');
        return new Response(JSON.stringify({ success: true }), { status: 200 });

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400 });
    }

  } catch (error) {
    console.error('Admin action error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
