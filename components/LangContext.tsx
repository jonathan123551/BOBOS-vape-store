"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { defaultLang, getDict, type Dict, type Lang } from "@/lib/i18n";

interface LangContextValue {
  lang: Lang;
  dict: Dict;
  setLang: (l: Lang) => void;
  toggle: () => void;
  dir: "ltr" | "rtl";
}

const LangContext = createContext<LangContextValue | undefined>(undefined);

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(defaultLang);

  useEffect(() => {
    const stored = (typeof window !== "undefined" && localStorage.getItem("lang")) as Lang | null;
    const initial: Lang = stored === "ar" || stored === "en" ? stored : defaultLang;
    setLangState(initial);
    document.documentElement.lang = initial;
    document.documentElement.dir = initial === "ar" ? "rtl" : "ltr";
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    document.documentElement.lang = l;
    document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
    try {
      localStorage.setItem("lang", l);
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => setLang(lang === "ar" ? "en" : "ar"), [lang, setLang]);

  const value = useMemo<LangContextValue>(
    () => ({ lang, dict: getDict(lang), setLang, toggle, dir: lang === "ar" ? "rtl" : "ltr" }),
    [lang, setLang, toggle],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside LangProvider");
  return ctx;
}
