/**
 * LanguageSwitcher Component
 * Allows users to switch between English, Arabic (RTL), and Chinese
 */

import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { Button } from './button';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'ar', name: 'العربية', flag: '🇦🇪', dir: 'rtl' },
  { code: 'zh-CN', name: '中文', flag: '🇨🇳', dir: 'ltr' },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];

  const changeLanguage = (code: string) => {
    const lang = languages.find((l) => l.code === code);
    if (!lang) return;

    // Change language
    i18n.changeLanguage(code);

    // Update document direction for RTL
    document.documentElement.dir = lang.dir;
    document.documentElement.lang = code;

    // Store preference in localStorage
    localStorage.setItem('preferred-language', code);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-[#E8EAED] hover:text-[#D4AF37] hover:bg-[#1A2332]"
        >
          <Globe size={20} />
          <span className="hidden sm:inline">
            {currentLanguage.flag} {currentLanguage.name}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-[#0F1829] border-[#1A2332] w-48">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className="flex items-center justify-between cursor-pointer text-[#E8EAED] hover:bg-[#1A2332] hover:text-[#D4AF37]"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{lang.flag}</span>
              <span>{lang.name}</span>
            </div>
            {i18n.language === lang.code && (
              <Check className="text-[#D4AF37]" size={16} />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
