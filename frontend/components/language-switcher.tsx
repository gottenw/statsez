"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCallback } from "react";
import { locales, localeLabels, type Locale } from "@/i18n/config";

export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("languageSelector");

  const switchLocale = useCallback((newLocale: Locale) => {
    document.cookie = `locale=${newLocale};path=/;max-age=31536000`;
    window.location.reload();
  }, []);

  return (
    <div className="flex items-center gap-1 font-mono text-base">
      {locales.map((l, index) => (
        <span key={l} className="flex items-center">
          <button
            onClick={() => switchLocale(l)}
            className={`px-2 py-1 transition-colors duration-300 ${
              locale === l
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-label={t(l)}
          >
            {localeLabels[l]}
          </button>
          {index < locales.length - 1 && (
            <span className="text-border">/</span>
          )}
        </span>
      ))}
    </div>
  );
}
