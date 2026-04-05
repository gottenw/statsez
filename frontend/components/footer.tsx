"use client";

import { useTranslations } from "next-intl";
import { ScrambleText } from "./scramble-text";
import { LanguageSwitcher } from "./language-switcher";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="w-full bg-background border-t border-border">
      <div className="section-padding">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 py-16 md:py-24">
          <div className="md:col-span-6">
            <div className="mb-6">
              <img src="/logo.svg" alt="Statsez" className="h-8 invert" />
            </div>
            <p className="text-muted-foreground max-w-md leading-relaxed">
              {t("description")}
            </p>
          </div>

          <div className="col-span-6 md:col-span-3">
            <span className="data-label mb-6 block">{t("product")}</span>
            <ul className="space-y-3">
              <li>
                <a
                  href="/docs"
                  className="text-foreground hover:text-muted-foreground transition-colors duration-300 text-base"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="text-foreground hover:text-muted-foreground transition-colors duration-300 text-base"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="/dashboard"
                  className="text-foreground hover:text-muted-foreground transition-colors duration-300 text-base"
                >
                  Dashboard
                </a>
              </li>
            </ul>
          </div>

          <div className="col-span-6 md:col-span-3">
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
                  href="/docs"
                  className="text-foreground hover:text-muted-foreground transition-colors duration-300 text-base"
                >
                  API Reference
                </a>
              </li>
              <li>
                <a
                  href="#capabilities"
                  className="text-foreground hover:text-muted-foreground transition-colors duration-300 text-base"
                >
                  Capabilities
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-8 border-t border-border gap-4">
          <div className="flex items-center gap-8">
            <span className="font-mono text-sm text-muted-foreground">
              {t("copyright")}
            </span>
            <span className="font-mono text-sm text-muted-foreground">
              {t("version")}
            </span>
          </div>

          <div className="flex items-center gap-8">
            <span className="font-mono text-sm text-muted-foreground">
              {t("language")}:
            </span>
            <LanguageSwitcher />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-data-primary animate-pulse" />
              <span className="font-mono text-sm text-muted-foreground">
                {t("status")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
