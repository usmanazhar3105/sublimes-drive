// Stripe: Expire boosts (CRON)
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    const { data: expired } = await supabase
      .from('boosts')
      .update({ status: 'expired', updated_at: new Date().toISOString() })
      .lt('active_until', new Date().toISOString())
      .eq('status', 'active')
      .select('id');

    return new Response(JSON.stringify({ 
      expired: expired?.length || 0,
      timestamp: new Date().toISOString()
    }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
