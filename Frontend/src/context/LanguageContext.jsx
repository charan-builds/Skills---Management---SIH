import { createContext, useContext, useState, useCallback, useMemo } from "react";
import en from "../locales/en.json";
import hi from "../locales/hi.json";
import mr from "../locales/mr.json";

import { DICTIONARY } from "../locales/dictionary";

const translations = { en, hi, mr };

export const LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
];

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem("language") || localStorage.getItem("sih_language");
      if (saved && translations[saved]) {
        return saved;
      }
    } catch {
      // fallback
    }
    return "en";
  });

  const setLanguage = useCallback((newLang) => {
    if (!translations[newLang]) return;
    try {
      localStorage.setItem("language", newLang);
      localStorage.setItem("sih_language", newLang);
    } catch (e) {
      console.warn("Could not save language to localStorage:", e);
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = newLang;
    }
    // Reload to apply new language across all components
    window.location.reload();
  }, []);

  /**
   * Core translation function — Angular-style i18n & dictionary lookup:
   * 1. Direct dictionary phrase match (e.g., t("View Profile"))
   * 2. Dot-notation lookup in current language JSON (e.g., t("trainees.directory_title"))
   * 3. Fallback phrase dictionary match (e.g., t("trainees.title", "Trainee Directory"))
   * 4. Dot-notation lookup in en.json
   * 5. Explicit fallback argument or path
   */
  const t = useCallback((path, fallback) => {
    if (!path || typeof path !== "string") return fallback ?? "";

    // 1. Direct phrase lookup in dictionary
    if (DICTIONARY && DICTIONARY[path]?.[language]) {
      return DICTIONARY[path][language];
    }

    // Dot-notation resolver for JSON files
    const resolve = (langObj, keyPath) => {
      const keys = keyPath.split(".");
      let current = langObj;
      for (const k of keys) {
        if (current && typeof current === "object" && k in current) {
          current = current[k];
        } else {
          return undefined;
        }
      }
      return typeof current === "string" ? current : undefined;
    };

    // 2. Current language JSON lookup
    const currentTrans = translations[language];
    let result = resolve(currentTrans, path);
    if (result !== undefined) return result;

    // 3. Fallback phrase lookup in dictionary
    if (fallback && typeof fallback === "string" && DICTIONARY && DICTIONARY[fallback]?.[language]) {
      return DICTIONARY[fallback][language];
    }

    // 4. English fallback (for missing translations in JSON)
    if (language !== "en") {
      result = resolve(translations.en, path);
      if (result !== undefined) return result;
    }

    // 5. Explicit fallback string or key itself
    return fallback !== undefined ? fallback : path;
  }, [language]);

  /**
   * Helper to translate DB status codes (e.g., "EMPLOYED", "PENDING", "IN_PROGRESS")
   */
  const formatStatus = useCallback((status) => {
    if (!status) return "";
    const key = String(status).toLowerCase().replace(/[\s-]+/g, "_");
    const translated = t(`status.${key}`, null);
    if (translated) return translated;
    return String(status);
  }, [t]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    t,
    formatStatus,
    languages: LANGUAGES,
    currentLanguageMeta: LANGUAGES.find((l) => l.code === language) || LANGUAGES[0]
  }), [language, setLanguage, t, formatStatus]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

// Convenient alias
// eslint-disable-next-line react-refresh/only-export-components
export const useTranslation = useLanguage;
