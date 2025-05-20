import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";

/**
 * Available theme options
 */
export type Theme = "light" | "dark" | "system";

/**
 * Theme context type definition
 */
interface ThemeContextType {
  /** Current theme setting */
  theme: Theme;
  /** Function to change the theme */
  setTheme: (theme: Theme) => void;
  /** Currently applied theme (always resolves to light or dark) */
  resolvedTheme: "light" | "dark";
}

/**
 * Theme context with default undefined value
 */
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Media query for detecting system dark mode preference
 */
const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";

/**
 * Storage key for persisting theme preference
 */
const THEME_STORAGE_KEY = "theme";

/**
 * Provider component that manages theme state and provides theme context
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Initialize theme from localStorage or default to system
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "system";

    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return (savedTheme as Theme) || "system";
  });

  // Initialize resolvedTheme based on system preference
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";

    return window.matchMedia(DARK_MEDIA_QUERY).matches ? "dark" : "light";
  });

  // Update resolved theme when theme changes
  useEffect(() => {
    if (theme === "system") {
      const mediaQuery = window.matchMedia(DARK_MEDIA_QUERY);

      const handleChange = () =>
        setResolvedTheme(mediaQuery.matches ? "dark" : "light");

      // Set initial value
      handleChange();

      // Add listener for preference changes
      mediaQuery.addEventListener("change", handleChange);

      return () => mediaQuery.removeEventListener("change", handleChange);
    } else {
      setResolvedTheme(theme);
    }
  }, [theme]);

  // Apply theme class to document element
  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = window.document.documentElement;

    // Remove previous theme classes
    root.classList.remove("light", "dark");

    // Add current theme class
    root.classList.add(resolvedTheme);

    // Also set data-theme attribute for daisyUI
    root.setAttribute("data-theme", resolvedTheme);
  }, [resolvedTheme]);

  // Memoized function to update theme
  const setTheme = useCallback((newTheme: Theme) => {
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    setThemeState(newTheme);
  }, []);

  // Memoized context value to prevent unnecessary renders
  const contextValue = useMemo(() => {
    return { theme, setTheme, resolvedTheme };
  }, [theme, setTheme, resolvedTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to access theme context with error handling
 * @returns ThemeContextType
 * @throws Error if used outside ThemeProvider
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
