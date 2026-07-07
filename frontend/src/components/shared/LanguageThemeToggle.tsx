import { Moon, Sun, Languages } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useApp } from '../../lib/AppContext';
import type { Language } from '../../lib/translations';

export function LanguageThemeToggle() {
  const { language, setLanguage, theme, toggleTheme, t } = useApp();

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
  ];

  return (
    <div className="flex items-center gap-2">
      {/* Language Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="border-[#C5B59A] text-[#3A2F1F] dark:text-[#E8DCC8] hover:bg-[#E8DCC8] dark:hover:bg-[#3A3430]"
          >
            <Languages className="h-5 w-5" />
            <span className="sr-only">{t.language}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-card border-border">
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`cursor-pointer text-foreground hover:bg-muted ${
                language === lang.code ? 'bg-muted' : ''
              }`}
            >
              <span className="mr-2">{lang.flag}</span>
              {lang.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Theme Toggle */}
      <Button
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        className="border-[#C5B59A] text-[#3A2F1F] dark:text-[#E8DCC8] hover:bg-[#E8DCC8] dark:hover:bg-[#3A3430]"
      >
        {theme === 'light' ? (
          <Moon className="h-5 w-5" />
        ) : (
          <Sun className="h-5 w-5" />
        )}
        <span className="sr-only">{t.theme}</span>
      </Button>
    </div>
  );
}
