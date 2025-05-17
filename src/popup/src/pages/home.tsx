import React, { useState, useCallback, useMemo } from "react";
import Toggle from "../components/ui/toggle";
import Selector from "../components/ui/selector";
import { usePreferences } from "../components/usePreferences";
import Collapse from "../components/ui/collapse";
import TextInput from "../components/ui/textinput";
import supabase from "../supabaseClient";
import Settings from "../components/Settings";
import { useTheme } from "../context/ThemeContext";
import type { WithUserProps } from "../types/user";
import { useTranslation } from "react-i18next";

/**
 * Home page component that displays the main application interface
 * when a user is authenticated
 */
const Home: React.FC<WithUserProps> = ({ user, onLogout }) => {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Redirect to login if no user
  if (!user) {
    return (
      <div className="p-4 text-center">
        <p>No user found. Please log in.</p>
      </div>
    );
  }

  // Load user preferences from storage
  const [prefs, setPref] = usePreferences({
    translate_to: "German",
    customPrompt: "",
    useCustomPrompt: false,
  });

  // Component state
  const [loading, setLoading] = useState(false);
  const [logoutMessage, setLogoutMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle user logout with error handling
   */
  const handleLogout = useCallback(async () => {
    setLoading(true);
    setError(null);
    setLogoutMessage(null);

    try {
      const { error } = await supabase.auth.signOut();

      // Save the current theme preference
      const savedTheme = localStorage.getItem("theme");
      const savedLanguage = localStorage.getItem("language");

      // Clear session data but not theme preference
      sessionStorage.clear();
      for (const key of Object.keys(localStorage)) {
        // Skip theme and language related items
        if (key !== "theme" && key !== "language") {
          localStorage.removeItem(key);
        }
      }

      if (error) throw error;

      setLogoutMessage(t("common.logout") + " " + t("common.loading"));
      onLogout();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Logout failed");
    } finally {
      setLoading(false);
    }
  }, [onLogout, t]);

  // Memoize adaptive theme classes
  const themeClasses = useMemo(() => {
    return {
      textClass: isDark ? "text-gray-100" : "text-gray-900",
      labelClass: isDark
        ? "text-gray-300 font-medium"
        : "text-gray-700 font-medium",
      cardClass: isDark
        ? "bg-gray-700 border-gray-600"
        : "bg-gray-50 border-gray-200",
      containerClass: isDark ? "bg-gray-800" : "bg-white",
    };
  }, [isDark]);

  const { textClass, labelClass, cardClass, containerClass } = themeClasses;

  return (
    <div className={`p-4 ${containerClass}`}>
      {/* Settings Section (Theme and Language) */}
      <Settings />

      {/* Toggle Section */}
      <div
        className={`flex items-center justify-between p-3 mb-4 mt-4 rounded-md ${
          isDark ? "bg-gray-700" : "bg-gray-100"
        }`}
      >
        <span id="main-toggle-label" className={labelClass}>
          Turn on/off
        </span>
        <Toggle aria-labelledby="main-toggle-label" />
      </div>

      {/* User Profile Section */}
      <div
        className={`max-w-md mx-auto p-6 mb-6 rounded-lg shadow-sm ${
          isDark ? "bg-gray-700" : "bg-white"
        }`}
      >
        <h2 className={`text-xl font-bold mb-4 ${textClass}`}>
          {`${t("common.login")} ${user.email || "Unknown user"}`}
        </h2>
        <button
          className="w-full py-3 px-4 mb-3 rounded-md font-semibold bg-red-600 text-white 
            hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50
            disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          onClick={handleLogout}
          disabled={loading}
          aria-busy={loading}
        >
          {t("common.logout")}
        </button>
        {logoutMessage && (
          <div
            className="p-2 text-sm font-medium text-green-700 bg-green-100 rounded-md"
            role="status"
          >
            {logoutMessage}
          </div>
        )}
        {error && (
          <div
            className="p-2 text-sm font-medium text-red-700 bg-red-100 rounded-md"
            role="alert"
          >
            {error}
          </div>
        )}
      </div>

      {/* Language Selection */}
      <section className="mb-6" aria-labelledby="language-section">
        <h2 id="language-section" className="sr-only">
          Language Selection
        </h2>
        <Selector
          options={["German", "English", "Spanish", "French"]}
          onSelect={(sel) => {
            setPref("translate_to", sel);
          }}
          default={0}
        />
      </section>

      {/* Advanced Settings */}
      <Collapse title="Advanced settings">
        <div
          className={`p-4 rounded-md ${isDark ? "bg-gray-700" : "bg-gray-50"}`}
        >
          <div className="flex items-center justify-between mb-4">
            <span id="custom-prompt-toggle" className={labelClass}>
              Use custom prompt
            </span>
            <Toggle
              checked={prefs.useCustomPrompt}
              onToggle={(e) => {
                setPref("useCustomPrompt", e);
              }}
              aria-labelledby="custom-prompt-toggle"
            />
          </div>

          <TextInput
            onDoneTyping={(value) => {
              setPref("customPrompt", value);
            }}
            default={prefs.customPrompt}
            title={"Custom prompt"}
            disabled={!prefs.useCustomPrompt}
          />
        </div>
      </Collapse>
    </div>
  );
};

export default Home;
