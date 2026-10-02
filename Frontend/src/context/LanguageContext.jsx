import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
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

// List of proper names that must NEVER be translated
const PRESERVED_NAMES = new Set([
  // Trainee Personas & Names
  "Pooja Sharma", "Sunil Shinde", "Aarav Patel", "Priya Nair", "Anjali Verma",
  "Rahul Deshmukh", "Sneha Kulkarni", "Vikram Joshi", "Deepak Patil", "Kavita Rao",
  "Amit Jadhav", "Neha Gupta", "Suresh More", "Divya Shinde", "Rohan Gaikwad",
  "Pooja Patil", "Kalyan Pagadala", "Rajesh Kumar", "Sanjay Mehta", "Meera Iyer",
  "Arjun Reddy", "Tanvi Deshpande", "Nikhil Kulkarni", "Sandeep Patil", "Pallavi Joshi",
  "Swati Kulkarni", "Yogesh Chavan", "Ganesh Kadam", "Vishal Jadhav", "Akshay Shinde",
  "Sachin Pawar", "Mahesh Bhosale",
  // Employers & Organisations
  "Tata Consultancy Services", "Infosys BPM", "Mahindra & Mahindra Automotive",
  "Mahindra & Mahindra", "Apollo Hospitals Enterprise", "Reliance Clean Energy Ltd",
  "New Horizon Logistics Ltd", "Tata Motors", "Larsen & Toubro", "L&T Construction",
  "Tech Mahindra", "Wipro Technologies", "HCL Technologies", "Bajaj Auto", "Godrej Industries",
  "TCS", "Infosys", "Mahindra", "Apollo Hospitals", "Reliance Clean Energy", "New Horizon Logistics",
  // Training Providers
  "Apollo MedSkills", "Tata Tech", "L&T Construction Skills Academy",
  "Mahindra Institute of Technology", "Centum Learning", "Don Bosco Tech Society",
  "IL&FS Skills", "National Skill Training Institute",
  // HRIS Systems
  "Workday", "BambooHR", "SAP SuccessFactors", "Oracle HCM", "Darwinbox", "Custom HRIS",
  // Government / Industry Brands & Tech Acronyms
  "Skill2Impact", "Skill2Impact™", "EPFO", "NSQF", "PMKVY", "DDU-GKY", "NAPS",
  "GSTIN", "CIN", "PAN", "API", "CSV", "PDF", "Aadhaar", "DigiLocker"
]);

// Helper regex to identify IDs, codes, emails, or urls that should not be translated
const NON_TRANSLATABLE_REGEX = /^(TR-\d+|EMP-[A-Z0-9-]+|PRG-\d+|DIST-\d+|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|\+?\d[\d\s-]{8,}|\/[a-zA-Z0-9_\-\/.]+)$/i;

// Pre-sort dictionary keys by descending length for longest-match-first compound translation
const SORTED_KEYS = Object.keys(DICTIONARY).sort((a, b) => b.length - a.length);

// Lowercase lookup index for case-insensitive matching
const LOWER_DICT = {};
for (const key of Object.keys(DICTIONARY)) {
  LOWER_DICT[key.toLowerCase()] = DICTIONARY[key];
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Pre-build boundary patterns to prevent partial word mangling (e.g. "Train" inside "Training")
const KEY_PATTERN_MAP = new Map();
for (const key of SORTED_KEYS) {
  const left = /^[a-zA-Z0-9]/.test(key) ? '(?<![a-zA-Z0-9])' : '';
  const right = /[a-zA-Z0-9]$/.test(key) ? '(?![a-zA-Z0-9])' : '';
  KEY_PATTERN_MAP.set(key, `${left}${escapeRegExp(key)}${right}`);
}

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

  const originalTextMapRef = useRef(new WeakMap());
  const isTranslatingRef = useRef(false);

  const setLanguage = useCallback((newLang) => {
    if (!translations[newLang]) return;
    setLanguageState(newLang);
    try {
      localStorage.setItem("language", newLang);
      localStorage.setItem("sih_language", newLang);
    } catch (e) {
      console.warn("Could not save language to localStorage:", e);
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = newLang;
    }
  }, []);

  /**
   * Core translation helper for any text string
   */
  const translateString = useCallback((text, targetLang) => {
    if (!text || typeof text !== "string" || targetLang === "en") return text;
    const trimmed = text.trim();
    if (!trimmed) return text;

    // Strict preservation of names, IDs, numbers, currencies, dates
    if (PRESERVED_NAMES.has(trimmed) || NON_TRANSLATABLE_REGEX.test(trimmed)) {
      return text;
    }
    if (/^[\d\s.,₹$%+\-/():#|•&;—]+$/.test(trimmed)) {
      return text;
    }

    const leading = text.match(/^\s*/)?.[0] || "";
    const trailing = text.match(/\s*$/)?.[0] || "";

    // 1. Direct exact dictionary match
    if (DICTIONARY[trimmed]?.[targetLang]) {
      return leading + DICTIONARY[trimmed][targetLang] + trailing;
    }

    // 2. Case-insensitive exact match
    const lowerKey = trimmed.toLowerCase();
    if (LOWER_DICT[lowerKey]?.[targetLang]) {
      return leading + LOWER_DICT[lowerKey][targetLang] + trailing;
    }

    // 3. Punctuation-stripped match (e.g. "Label:", "(12M Retention)", "Search...", "• In Progress")
    const punctMatch = trimmed.match(/^([•\-\s(]*)(.*?)([:.?!)\]\s]*)$/);
    if (punctMatch && punctMatch[2]) {
      const pPrefix = punctMatch[1] || "";
      const pCore = punctMatch[2].trim();
      const pSuffix = punctMatch[3] || "";

      if (pCore && DICTIONARY[pCore]?.[targetLang]) {
        return leading + pPrefix + DICTIONARY[pCore][targetLang] + pSuffix + trailing;
      }
      if (pCore && LOWER_DICT[pCore.toLowerCase()]?.[targetLang]) {
        return leading + pPrefix + LOWER_DICT[pCore.toLowerCase()][targetLang] + pSuffix + trailing;
      }
    }

    // 4. Compound phrase replacement (longest key first with strict word boundaries)
    let currentText = trimmed;
    let modified = false;

    for (let i = 0; i < SORTED_KEYS.length; i++) {
      const key = SORTED_KEYS[i];
      if (key.length >= 2 && currentText.includes(key)) {
        // Ensure we don't accidentally replace inside a preserved proper name
        let shouldSkip = false;
        for (const name of PRESERVED_NAMES) {
          if (name.includes(key) && currentText.includes(name)) {
            shouldSkip = true;
            break;
          }
        }
        if (!shouldSkip) {
          const trans = DICTIONARY[key]?.[targetLang];
          if (trans) {
            const pattern = KEY_PATTERN_MAP.get(key);
            if (pattern) {
              const regex = new RegExp(pattern, 'g');
              if (regex.test(currentText)) {
                regex.lastIndex = 0;
                currentText = currentText.replace(regex, trans);
                modified = true;
              }
            }
          }
        }
      }
    }

    if (modified) {
      return leading + currentText + trailing;
    }

    return text;
  }, []);

  /**
   * Automatic Local DOM Translation Engine
   * Walks all text nodes, input placeholders, titles, and SVG text elements in #root.
   * When language is "en", we skip entirely — no translation or restoration needed,
   * because page always reloads on language switch (window.location.reload()).
   * The "restore to orig" approach caused CountUp values to be overwritten with
   * stale intermediate values cached by the MutationObserver during animation.
   */
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = language;

    // English: no DOM walking needed at all — page reloads on every language switch.
    // Skipping prevents the MutationObserver from caching/restoring animated values.
    if (language === "en") return;

    const rootEl = document.getElementById("root") || document.body;
    const originalMap = originalTextMapRef.current;

    const translateNode = (node) => {
      if (!node || node.nodeType !== Node.TEXT_NODE) return;
      const parent = node.parentElement;
      if (!parent) return;

      const tag = parent.tagName.toLowerCase();
      if (["script", "style", "code", "pre"].includes(tag)) return;
      if (parent.closest(".no-translate") || parent.closest(".lang-selector-wrapper")) return;

      // CRITICAL: Skip purely numeric / percentage / currency text nodes.
      // CountUp animates these values through many intermediate states.
      // If we cache an intermediate value as "orig", the next MutationObserver
      // walk will restore the node to that stale intermediate — corrupting CountUp.
      // Numbers never need translation anyway, so we skip them entirely.
      const rawVal = node.nodeValue;
      const trimmedVal = rawVal?.trim();
      if (!trimmedVal || /^[\d\s.,₹$%+\-\/():#|•&;—]+$/.test(trimmedVal)) return;

      // Record original text only once (first time we see this node)
      let orig = originalMap.get(node);
      if (orig === undefined) {
        orig = rawVal;
        originalMap.set(node, orig);
      }

      const newVal = translateString(orig, language);
      if (newVal !== undefined && node.nodeValue !== newVal) {
        node.nodeValue = newVal;
      }
    };

    const translateAttributes = (container) => {
      // 1. Input and Textarea Placeholders
      const inputs = container.querySelectorAll ? container.querySelectorAll("input, textarea") : [];
      inputs.forEach((el) => {
        if (!el.placeholder) return;
        if (el.closest(".no-translate") || el.closest(".lang-selector-wrapper")) return;

        let orig = originalMap.get(el);
        if (orig === undefined) {
          orig = el.placeholder;
          originalMap.set(el, orig);
        }

        const trans = translateString(orig, language);
        if (trans && el.placeholder !== trans) el.placeholder = trans;
      });

      // 2. Element Titles (Tooltips)
      const titledElements = container.querySelectorAll ? container.querySelectorAll("[title]") : [];
      titledElements.forEach((el) => {
        if (!el.title) return;
        if (el.closest(".no-translate") || el.closest(".lang-selector-wrapper")) return;

        let orig = originalMap.get(el);
        if (orig === undefined) {
          orig = el.title;
          originalMap.set(el, orig);
        }

        const trans = translateString(orig, language);
        if (trans && el.title !== trans) el.title = trans;
      });
    };

    const walk = (container) => {
      if (!container || isTranslatingRef.current) return;
      isTranslatingRef.current = true;
      try {
        const walker = document.createTreeWalker(
          container,
          NodeFilter.SHOW_TEXT,
          {
            acceptNode(n) {
              const p = n.parentElement;
              if (!p) return NodeFilter.FILTER_REJECT;
              const t = p.tagName.toLowerCase();
              if (["script", "style", "code", "pre"].includes(t)) return NodeFilter.FILTER_REJECT;
              if (p.closest(".no-translate") || p.closest(".lang-selector-wrapper")) return NodeFilter.FILTER_REJECT;
              return NodeFilter.FILTER_ACCEPT;
            }
          }
        );
        let n;
        while ((n = walker.nextNode())) {
          translateNode(n);
        }
        translateAttributes(container);
      } finally {
        isTranslatingRef.current = false;
      }
    };

    // Run initial walk
    walk(rootEl);

    // Debounced mutation observer to translate dynamically rendered content
    let timeoutId;
    const observer = new MutationObserver(() => {
      if (isTranslatingRef.current) return;
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        walk(rootEl);
      }, 50);
    });

    observer.observe(rootEl, {
      childList: true,
      subtree: true,
      characterData: false
    });

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, [language, translateString]);

  /**
   * Translates a key by traversing dot notation path or direct phrase dictionary lookup
   */
  const t = useCallback((path, fallback) => {
    if (!path || typeof path !== "string") return fallback ?? "";

    // 1. Direct dictionary phrase match
    if (DICTIONARY[path] && DICTIONARY[path][language]) {
      return DICTIONARY[path][language];
    }

    // 2. Dot-notation lookup in locales JSON
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

    const currentTrans = translations[language];
    let result = resolve(currentTrans, path);
    if (result !== undefined) return result;

    if (language !== "en") {
      result = resolve(translations.en, path);
      if (result !== undefined) return result;
    }

    // 3. Fallback to DICTIONARY for default text / fallback phrase
    if (fallback && typeof fallback === "string" && DICTIONARY[fallback] && DICTIONARY[fallback][language]) {
      return DICTIONARY[fallback][language];
    }

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
