import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import "./LanguageSelector.css";

export default function LanguageSelector({ className = "", compact = false }) {
  const { language, setLanguage, languages, currentLanguageMeta } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key press
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (code) => {
    if (code === language) {
      setIsOpen(false);
      return;
    }
    setLanguage(code);
    setIsOpen(false);
    // Immediately reload so all charts, dashboards, filters, and async datasets mount 100% cleanly in the selected language
    window.location.reload();
  };

  return (
    <div
      ref={containerRef}
      className={`lang-selector-wrapper ${compact ? "compact" : ""} ${className}`}
    >
      <button
        type="button"
        className={`lang-selector-btn ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select language"
        title="Change application language"
      >
        <span className="lang-globe-icon" role="img" aria-hidden="true">
          🌐
        </span>
        <span className="lang-name-text">
          {currentLanguageMeta?.nativeName || "English"}
        </span>
        <ChevronDown
          size={14}
          className={`lang-chevron ${isOpen ? "rotated" : ""}`}
        />
      </button>

      {isOpen && (
        <ul
          className="lang-dropdown-menu"
          role="listbox"
          aria-label="Language options"
        >
          {languages.map((lang) => {
            const isSelected = lang.code === language;
            return (
              <li key={lang.code} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  className={`lang-option-btn ${isSelected ? "selected" : ""}`}
                  onClick={() => handleSelect(lang.code)}
                >
                  <span>{lang.nativeName}</span>
                  {isSelected && <Check size={15} className="check-icon" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
