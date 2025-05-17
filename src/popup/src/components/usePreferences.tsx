import { useEffect, useState } from "react";

type Preferences = Record<string, unknown>;

export function usePreferences<T extends Preferences>(
  defaults: T
): [T, <K extends keyof T>(key: K, value: T[K]) => void] {
  const [preferences, setPreferences] = useState<T>(defaults);

  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.get(Object.keys(defaults), (result) => {
        setPreferences({ ...defaults, ...result });
      });
    } else {
      console.warn("chrome.storage.local ist nicht verfügbar – Entwicklungsmodus?");
    }
  }, [defaults]);

  const updatePreference = <K extends keyof T>(key: K, value: T[K]) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);

    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.set({ [key]: value });
    } else {
      console.warn("chrome.storage.local.set konnte nicht ausgeführt werden.");
    }
  };

  return [preferences, updatePreference];
}

