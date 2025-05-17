import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Initialize theme from localStorage or default to system
  const [theme, setThemeState] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    return savedTheme || "system";
  });

  // Initialize resolvedTheme based on system preference
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  );

  // Update resolved theme when theme changes
  useEffect(() => {
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () =>
        setResolvedTheme(mediaQuery.matches ? "dark" : "light");

      mediaQuery.addEventListener("change", handleChange);
      setResolvedTheme(mediaQuery.matches ? "dark" : "light");

      return () => mediaQuery.removeEventListener("change", handleChange);
    } else {
      setResolvedTheme(theme);
    }
  }, [theme]);

  // Apply theme class to document element
  useEffect(() => {
    const root = window.document.documentElement;

    // Remove previous theme classes
    root.classList.remove("light", "dark");

    // Add current theme class
    root.classList.add(resolvedTheme);

    // Also set data-theme attribute for daisyUI
    root.setAttribute("data-theme", resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem("theme", newTheme);
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
