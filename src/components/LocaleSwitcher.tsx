import React, { useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Locale {
  code: string;
  name: string;
  nativeName: string;
  rtl: boolean;
}

const SUPPORTED_LOCALES: Locale[] = [
  { code: 'en', name: 'English', nativeName: 'English', rtl: false },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', rtl: true },
  { code: 'zh', name: 'Chinese', nativeName: '中文', rtl: false },
];

export const LocaleSwitcher: React.FC = () => {
  const [currentLocale, setCurrentLocale] = useState<string>('en');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLocaleChange = async (locale: Locale) => {
    setLoading(true);
    

    try {
      // Update user preference in database
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase
          .from('profiles')
          .update({ locale: locale.code })
          .eq('id', user.id);
      }

      // Update HTML lang and dir attributes
      document.documentElement.lang = locale.code;
      document.documentElement.dir = locale.rtl ? 'rtl' : 'ltr';
      
      // Store in localStorage
      localStorage.setItem('locale', locale.code);
      
      setCurrentLocale(locale.code);
      setIsOpen(false);
      
      // Reload to apply changes
      window.location.reload();
    } catch (error) {
      console.error('Failed to change locale:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentLocaleData = SUPPORTED_LOCALES.find(l => l.code === currentLocale) || SUPPORTED_LOCALES[0];

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] hover:bg-[var(--sublimes-dark-bg)] transition-colors"
        disabled={loading}
      >
        <Globe className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-[var(--sublimes-light-text)]">
          {currentLocaleData.nativeName}
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-lg shadow-lg z-50">
          <div className="p-2">
            <div className="text-xs text-gray-400 px-3 py-2 font-medium">
              Select Language
            </div>
            {SUPPORTED_LOCALES.map((locale) => (
              <button
                key={locale.code}
                onClick={() => handleLocaleChange(locale)}
                className="w-full flex items-center justify-between px-3 py-2 rounded hover:bg-[var(--sublimes-dark-bg)] transition-colors"
                disabled={loading}
              >
                <div className="flex flex-col items-start">
                  <span className="text-sm text-[var(--sublimes-light-text)]">
                    {locale.nativeName}
                  </span>
                  <span className="text-xs text-gray-400">
                    {locale.name}
                  </span>
                </div>
                {currentLocale === locale.code && (
                  <Check className="w-4 h-4 text-[var(--sublimes-gold)]" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
