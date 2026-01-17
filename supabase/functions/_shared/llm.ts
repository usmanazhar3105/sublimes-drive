// Shared LLM utility for Freya AI
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface LLMRequest {
  systemPrompt: string;
  userMessage: string;
  maxTokens?: number;
  temperature?: number;
}

export async function callLLM(req: LLMRequest): Promise<string> {
  const apiKey = Deno.env.get('LLM_API_KEY') || Deno.env.get('OPENAI_API_KEY');
  const model = Deno.env.get('LLM_MODEL') || 'gpt-4-turbo-preview';
  const baseUrl = Deno.env.get('LLM_API_BASE') || 'https://api.openai.com/v1';

  if (!apiKey) {
    throw new Error('LLM_API_KEY not configured');
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: req.systemPrompt },
        { role: 'user', content: req.userMessage }
      ],
      max_tokens: req.maxTokens || 500,
      temperature: req.temperature || 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`LLM API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

export async function detectLanguage(text: string): Promise<'en' | 'ar' | 'zh'> {
  // Simple heuristic detection
  const hasArabic = /[\u0600-\u06FF]/.test(text);
  const hasChinese = /[\u4E00-\u9FFF]/.test(text);
  
  if (hasArabic) return 'ar';
  if (hasChinese) return 'zh';
  return 'en';
}
