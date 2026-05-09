/**
 * ===========================================
 * COMPONENT: Language Selector
 * ===========================================
 *
 * WHY THIS FILE EXISTS:
 * - Reusable dropdown for selecting source or target language
 * - Uses ShadCN Select component for consistent styling
 * - Supports search/filter for easier language finding
 * - Displays both English name and native name
 */

'use client';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Language } from '@/types';

interface LanguageSelectorProps {
  id: string;
  languages: Language[];
  value: string;
  onChange: (value: string) => void;
  label: string;
  disabled?: boolean;
}

export function LanguageSelector({
  id,
  languages,
  value,
  onChange,
  label,
  disabled = false,
}: LanguageSelectorProps) {
  const selectedLang = languages.find((l) => l.code === value);

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="text-[13px] font-medium text-muted-foreground ml-1"
      >
        {label}
      </label>
      <Select value={value} onValueChange={(val) => val && onChange(val)} disabled={disabled}>
        <SelectTrigger
          id={id}
          className="w-full h-12 glass-panel border-glass-border hover:border-primary/50 transition-colors focus:ring-primary/30 cursor-pointer rounded-xl text-[15px]"
        >
          <SelectValue placeholder="Select language">
            {selectedLang ? (
              <span className="flex items-center gap-2">
                <span className="font-semibold">{selectedLang.name}</span>
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {selectedLang.nativeName !== selectedLang.name ? selectedLang.nativeName : ''}
                </span>
              </span>
            ) : (
              'Select language'
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[300px] glass-panel rounded-xl shadow-lg border-glass-border">
          <SelectGroup>
            {languages.map((lang) => (
              <SelectItem
                key={lang.code}
                value={lang.code}
                className="cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span className="font-medium">{lang.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {lang.nativeName}
                  </span>
                </span>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
