export type Locale = "pt" | "en";

export const defaultLocale: Locale = "pt";
export const locales: Locale[] = ["pt", "en"];

export const localeLabels: Record<Locale, string> = {
  pt: "PT",
  en: "EN",
};
