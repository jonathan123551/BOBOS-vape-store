import type { Lang } from "./i18n";

const labels: Record<Lang, string> = { en: "EGP", ar: "ج.م" };

export function formatPrice(value: number, lang: Lang = "en"): string {
  const num = new Intl.NumberFormat(lang === "ar" ? "ar-EG" : "en-EG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
  return lang === "ar" ? `${num} ${labels.ar}` : `${labels.en} ${num}`;
}

export function formatDate(date: Date | string, lang: Lang = "en"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(lang === "ar" ? "ar-EG" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}
