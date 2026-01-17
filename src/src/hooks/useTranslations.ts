import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase/client';

export type SupportedLocale = 'en' | 'ar' | 'zh-CN';

export interface Translation {
  src_table: string;
  row_id: string;
  column_name: string;
  original_locale: string;
  translations: Record<SupportedLocale, string>;
}

export function useTranslations(
  srcTable: string,
  rowId: string,
  columns: string[],
  currentLocale: SupportedLocale = 'en'
) {
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!rowId || columns.length === 0) {
      setLoading(false);
      return;
    }

    async function fetchTranslations() {
      try {
        const { data, error } = await supabase
          .from('translations')
          .select('*')
          .eq('src_table', srcTable)
          .eq('row_id', rowId)
          .in('column_name', columns);

        if (error) throw error;

        const translationMap: Record<string, string> = {};

        data?.forEach(t => {
          // If current locale is 'en' (original), no translation needed
          if (currentLocale === 'en' || currentLocale === t.original_locale) {
            // Will fallback to original text in the component
            return;
          }

          // Get translation for current locale
          const translated = t.translations?.[currentLocale];
          if (translated) {
            translationMap[t.column_name] = translated;
          }
        });

        setTranslations(translationMap);
      } catch (err) {
        console.error('Error fetching translations:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchTranslations();
  }, [srcTable, rowId, columns.join(','), currentLocale]);

  const getTranslation = (columnName: string, originalText: string) => {
    // If we have a translation for this column in current locale, use it
    if (translations[columnName]) {
      return translations[columnName];
    }
    // Otherwise, return original text
    return originalText;
  };

  return {
    translations,
    loading,
    getTranslation
  };
}

// Hook for FAQs with translation support
export function useFAQs(category?: string, locale: SupportedLocale = 'en') {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFAQs() {
      try {
        let query = supabase
          .from('faqs')
          .select('*')
          .eq('active', true)
          .order('sort_order');

        if (category) {
          query = query.eq('category', category);
        }

        const { data: faqData, error } = await query;

        if (error) throw error;

        if (!faqData) {
          setFaqs([]);
          setLoading(false);
          return;
        }

        // If locale is 'en', just return the FAQs as-is
        if (locale === 'en') {
          setFaqs(faqData);
          setLoading(false);
          return;
        }

        // Fetch translations for all FAQs
        const faqIds = faqData.map(f => f.id);
        const { data: translationData } = await supabase
          .from('translations')
          .select('*')
          .eq('src_table', 'faqs')
          .in('row_id', faqIds);

        // Merge translations with FAQs
        const translatedFaqs = faqData.map(faq => {
          const faqTranslations = translationData?.filter(t => t.row_id === faq.id) || [];
          
          const title = faqTranslations.find(t => t.column_name === 'title')?.translations?.[locale] || faq.title;
          const body = faqTranslations.find(t => t.column_name === 'body')?.translations?.[locale] || faq.body;

          return {
            ...faq,
            title,
            body
          };
        });

        setFaqs(translatedFaqs);
      } catch (err) {
        console.error('Error fetching FAQs:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFAQs();
  }, [category, locale]);

  return {
    faqs,
    loading
  };
}

// Utility to request translation (calls Edge Function)
export async function requestTranslation(
  srcTable: string,
  rowId: string,
  columnName: string,
  originalText: string,
  targetLocales: SupportedLocale[] = ['ar', 'zh-CN']
) {
  try {
    // Call RPC function (which would trigger Edge Function for actual Google Translation)
    const { data, error } = await supabase.rpc('translate_and_cache', {
      p_src_table: srcTable,
      p_row_id: rowId,
      p_column: columnName,
      p_original_text: originalText,
      p_target_locales: targetLocales
    });

    if (error) throw error;

    return { success: true, data };
  } catch (err) {
    console.error('Error requesting translation:', err);
    return { success: false, error: err };
  }
}
