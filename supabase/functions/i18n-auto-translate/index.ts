// i18n: Auto-translate UGC content
// Supports both Google Translate API and LLM fallback
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { callLLM } from '../_shared/llm.ts';

const GOOGLE_TRANSLATE_API_KEY = Deno.env.get('GOOGLE_TRANSLATE_API_KEY');

// Language code mapping for Google Translate
const LOCALE_TO_GOOGLE_LANG: Record<string, string> = {
  'ar': 'ar',
  'zh': 'zh-CN',
  'zh-TW': 'zh-TW',
  'en': 'en',
  'fr': 'fr',
  'de': 'de',
  'es': 'es',
  'pt': 'pt',
  'ru': 'ru',
  'ja': 'ja',
  'ko': 'ko',
  'hi': 'hi',
  'ur': 'ur',
};

// Google Translate API function
async function googleTranslate(text: string, targetLang: string, sourceLang?: string): Promise<string> {
  if (!GOOGLE_TRANSLATE_API_KEY) {
    throw new Error('Google Translate API key not configured');
  }

  const googleLang = LOCALE_TO_GOOGLE_LANG[targetLang] || targetLang;
  const sourceParam = sourceLang ? `&source=${LOCALE_TO_GOOGLE_LANG[sourceLang] || sourceLang}` : '';

  const response = await fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        target: googleLang,
        format: 'text',
        ...(sourceLang && { source: LOCALE_TO_GOOGLE_LANG[sourceLang] || sourceLang }),
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google Translate API error: ${error}`);
  }

  const data = await response.json();
  return data.data.translations[0].translatedText;
}

// Fallback to LLM translation
async function llmTranslate(text: string, targetLang: string): Promise<string> {
  const langMap: Record<string, string> = {
    'ar': 'Arabic',
    'zh': 'Chinese (Simplified)',
    'zh-TW': 'Chinese (Traditional)',
    'en': 'English',
    'fr': 'French',
    'de': 'German',
    'es': 'Spanish',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'hi': 'Hindi',
    'ur': 'Urdu',
  };

  const targetName = langMap[targetLang] || targetLang;
  
  return await callLLM({
    systemPrompt: `Translate the following text to ${targetName}. Preserve meaning and tone. Output ONLY the translation, no explanations.`,
    userMessage: text,
    maxTokens: 500
  });
}

// Main translation function - uses Google Translate if available, falls back to LLM
async function translate(text: string, targetLang: string, sourceLang?: string): Promise<string> {
  if (GOOGLE_TRANSLATE_API_KEY) {
    try {
      return await googleTranslate(text, targetLang, sourceLang);
    } catch (error) {
      console.warn('Google Translate failed, falling back to LLM:', error);
    }
  }
  
  return await llmTranslate(text, targetLang);
}

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { entity_type, entity_id, field, source_locale, text } = await req.json();

    // Get enabled locales
    const { data: locales } = await supabase
      .from('i18n_locales')
      .select('code')
      .eq('enabled', true)
      .neq('code', source_locale);

    if (!locales || locales.length === 0) {
      return new Response(JSON.stringify({ message: 'No target locales' }), { status: 200 });
    }

    const results: Array<{ locale: string; status: string }> = [];

    // Translate to each locale
    for (const locale of locales) {
      // Check if translation exists
      const { data: existing } = await supabase
        .from('i18n_entity_translations')
        .select('id, status')
        .eq('entity_type', entity_type)
        .eq('entity_id', entity_id)
        .eq('field', field)
        .eq('locale', locale.code)
        .maybeSingle();

      // Skip if human-reviewed or locked
      if (existing && (existing.status === 'human' || existing.status === 'locked')) {
        results.push({ locale: locale.code, status: 'skipped' });
        continue;
      }

      try {
        // Translate using Google Translate or LLM fallback
        const translated = await translate(text, locale.code, source_locale);

        // Upsert translation
        await supabase
          .from('i18n_entity_translations')
          .upsert({
            entity_type,
            entity_id,
            field,
            locale: locale.code,
            value: translated,
            status: 'machine',
            source_locale,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'entity_type,entity_id,field,locale'
          });

        results.push({ locale: locale.code, status: 'translated' });
      } catch (error) {
        console.error(`Translation to ${locale.code} failed:`, error);
        results.push({ locale: locale.code, status: 'failed' });
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      locales: results,
      provider: GOOGLE_TRANSLATE_API_KEY ? 'google' : 'llm'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Translation error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
