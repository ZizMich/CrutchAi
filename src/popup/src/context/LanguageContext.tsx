import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useTranslation } from "react-i18next";

/**
 * Available language options
 */
export type Language = "en" | "es";

/**
 * Language context type definition
 */
interface LanguageContextType {
  /** Current language setting */
  language: Language;
  /** Function to change the language */
  setLanguage: (language: Language) => void;
  /** Available languages */
  availableLanguages: Language[];
}

/**
 * Language context with default undefined value
 */
const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

/**
 * Storage key for persisting language preference
 */
const LANGUAGE_STORAGE_KEY = "language";

/**
 * Provider component that manages language state and provides language context
 */
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { i18n } = useTranslation();

  // Available languages
  const availableLanguages: Language[] = ["en", "es"];

  // Initialize language from localStorage or default to browser language
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === "undefined") return "en";

    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (
      savedLanguage &&
      availableLanguages.includes(savedLanguage as Language)
    ) {
      return savedLanguage as Language;
    }

    // Get browser language
    const browserLang = navigator.language.split("-")[0];
    return availableLanguages.includes(browserLang as Language)
      ? (browserLang as Language)
      : "en";
  });

  // Update i18n language when language changes
  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  // Memoized function to update language
  const setLanguage = useCallback((newLanguage: Language) => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
    setLanguageState(newLanguage);
  }, []);

  // Memoized context value to prevent unnecessary renders
  const contextValue = useMemo(() => {
    return { language, setLanguage, availableLanguages };
  }, [language, setLanguage, availableLanguages]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

/**
 * Hook to access language context with error handling
 * @returns LanguageContextType
 * @throws Error if used outside LanguageProvider
 */
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
