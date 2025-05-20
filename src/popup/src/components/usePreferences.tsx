import { useEffect, useState, useCallback, useMemo } from "react";

/**
 * Type for preferences object
 */
export type Preferences = Record<string, unknown>;

/**
 * Chrome storage error handler
 */
const handleChromeError = () => {
  if (chrome.runtime?.lastError) {
    console.error("Chrome storage error:", chrome.runtime.lastError);
    return true;
  }
  return false;
};

/**
 * Custom hook for managing user preferences with Chrome storage
 *
 * @template T - Type of preferences object
 * @param {T} defaults - Default preference values
 * @returns {[T, <K extends keyof T>(key: K, value: T[K]) => void]} - Current preferences and update function
 *
 * @example
 * const [prefs, setPref] = usePreferences({
 *   theme: "dark",
 *   fontSize: 16
 * });
 *
 * // Access preference
 * console.log(prefs.theme);
 *
 * // Update preference
 * setPref("fontSize", 18);
 */
export function usePreferences<T extends Preferences>(
  defaults: T
): [T, <K extends keyof T>(key: K, value: T[K]) => void] {
  // Initialize state with defaults
  const [preferences, setPreferences] = useState<T>(defaults);

  // Determine if we're in a Chrome extension environment
  const isChromeExtension = useMemo(() => {
    return (
      typeof chrome !== "undefined" &&
      typeof chrome.storage !== "undefined" &&
      typeof chrome.storage.local !== "undefined"
    );
  }, []);

  // Load stored preferences on mount
  useEffect(() => {
    if (isChromeExtension) {
      chrome.storage.local.get(Object.keys(defaults), (result) => {
        if (handleChromeError()) return;

        // Filter out any null or undefined values from storage
        const validResults = Object.fromEntries(
          Object.entries(result).filter(([_, v]) => v != null)
        );

        setPreferences((prev) => ({ ...prev, ...validResults }));
      });
    } else {
      console.info(
        "Chrome storage is not available - using in-memory preferences only"
      );
    }
  }, [defaults, isChromeExtension]);

  // Memoize update function to avoid unnecessary re-renders
  const updatePreference = useCallback(
    <K extends keyof T>(key: K, value: T[K]) => {
      setPreferences((prev) => ({ ...prev, [key]: value }));

      if (isChromeExtension) {
        chrome.storage.local.set({ [key]: value }, () => {
          handleChromeError();
        });
      } else {
        console.info(
          `Preference saved in memory only: ${String(key)} = ${JSON.stringify(
            value
          )}`
        );
      }
    },
    [isChromeExtension]
  );

  return [preferences, updatePreference];
}
