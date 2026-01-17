// i18n: Set user locale preference
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { locale } = await req.json();

    // Validate locale
    const { data: validLocale } = await supabase
      .from('i18n_locales')
      .select('code')
      .eq('code', locale)
      .eq('enabled', true)
      .maybeSingle();

    if (!validLocale) {
      return new Response(JSON.stringify({ error: 'Invalid locale' }), { status: 400 });
    }

    // Update profile
    await supabase
      .from('profiles')
      .update({ preferred_locale: locale })
      .eq('id', user.id);

    return new Response(JSON.stringify({ success: true, locale }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
