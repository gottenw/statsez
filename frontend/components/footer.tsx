"use client";

import { useTranslations } from "next-intl";
import { ScrambleText } from "./scramble-text";
import { LanguageSwitcher } from "./language-switcher";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="w-full bg-background border-t border-border">
      <div className="section-padding">
        {}
        <div className="grid grid-cols-12 gap-8 py-24">
          {}
          <div className="col-span-12 md:col-span-6">
            <h2 className="headline-text text-foreground mb-6">
              <ScrambleText text="QUANTSPORTS" />
            </h2>
            <p className="text-muted-foreground max-w-md leading-relaxed">
              {t("description")}
            </p>
          </div>

          {}
          <div className="col-span-6 md:col-span-2">
            <span className="data-label mb-6 block">{t("product")}</span>
            <ul className="space-y-3">
              {["Documentation", "API Reference", "Pricing", "Status"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-foreground hover:text-muted-foreground transition-colors duration-300 text-sm"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-6 md:col-span-2">
            <span className="data-label mb-6 block">{t("resources")}</span>
            <ul className="space-y-3">
              <li>
                <a
                  href="/llm.txt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-muted-foreground transition-colors duration-300 text-sm flex items-center gap-2"
                >
                  {t("llmTxt")}
                  <span className="text-xs text-muted-foreground">↗</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-foreground hover:text-muted-foreground transition-colors duration-300 text-sm"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-foreground hover:text-muted-foreground transition-colors duration-300 text-sm"
                >
                  Examples
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-foreground hover:text-muted-foreground transition-colors duration-300 text-sm"
                >
                  Support
                </a>
              </li>
            </ul>
          </div>

          <div className="col-span-12 md:col-span-2">
            <span className="data-label mb-6 block">{t("contact")}</span>
            <ul className="space-y-3">
              {["Twitter/X", "LinkedIn", "Email"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-foreground hover:text-muted-foreground transition-colors duration-300 text-sm"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-8 border-t border-border gap-4">
          <div className="flex items-center gap-8">
            <span className="font-mono text-xs text-muted-foreground">
              {t("copyright")}
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              {t("version")}
            </span>
          </div>
          
          <div className="flex items-center gap-8">
            <span className="font-mono text-xs text-muted-foreground">
              {t("language")}:
            </span>
            <LanguageSwitcher />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-data-primary animate-pulse" />
              <span className="font-mono text-xs text-muted-foreground">
                {t("status")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
