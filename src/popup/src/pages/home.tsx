import Toggle from "../components/ui/toggle";
import Selector from "../components/ui/selector";
import React, { useState } from "react";
import { usePreferences } from "../components/usePreferences";
import Collapse from "../components/ui/collapse";
import TextInput from "../components/ui/textinput";
import supabase from "../supabaseClient";
import ThemeSelector from "../components/ThemeSelector";
import { useTheme } from "../context/ThemeContext";

interface HomeProps {
  user: { id: string; email?: string } | null;
  onLogout: () => void;
}

const LOGOUT_SUCCESS_MSG = "Вы успешно вышли из аккаунта.";

const Home: React.FC<HomeProps> = ({ user, onLogout }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  if (!user) {
    return (
      <div className="p-4">
        <p>No user found. Please log in.</p>
      </div>
    );
  }

  const [prefs, setPref] = usePreferences({
    translate_to: "German",
    customPrompt: "",
    useCustomPrompt: false,
  });
  const [loading, setLoading] = useState(false);
  const [logoutMessage, setLogoutMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    setLoading(true);
    setError(null);
    setLogoutMessage(null);
    try {
      const { error } = await supabase.auth.signOut();

      // Save the current theme preference
      const savedTheme = localStorage.getItem("theme");

      // Clear session data but not theme preference
      // Remove only Supabase auth-related items
      sessionStorage.clear();
      for (const key of Object.keys(localStorage)) {
        // Skip theme-related items
        if (key !== "theme") {
          localStorage.removeItem(key);
        }
      }

      if (error) throw error;
      setLogoutMessage(LOGOUT_SUCCESS_MSG);
      onLogout();
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message || "Logout failed");
      } else {
        setError("Logout failed");
      }
    } finally {
      setLoading(false);
    }
  };

  // Define adaptive text color classes
  const textClass = isDark ? "text-gray-100" : "text-gray-900";
  const labelClass = isDark
    ? "text-gray-300 font-medium"
    : "text-gray-700 font-medium";

  return (
    <div className={`p-4 ${isDark ? "bg-gray-800" : "bg-white"}`}>
      {/* Theme Selection */}
      <div
        className="mb-6 p-4 rounded-lg border shadow-sm bg-opacity-90 
        ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}"
      >
        <h3 className={`text-lg font-medium mb-3 ${textClass}`}>
          Theme Settings
        </h3>
        <ThemeSelector />
      </div>

      <div
        className={`flex items-center justify-between p-3 mb-4 rounded-md ${
          isDark ? "bg-gray-700" : "bg-gray-100"
        }`}
      >
        <span className={labelClass}>Turn on/off</span>
        <Toggle />
      </div>

      <div
        className={`max-w-md mx-auto p-6 mb-6 rounded-lg shadow-sm ${
          isDark ? "bg-gray-700" : "bg-white"
        }`}
      >
        <h2
          className={`text-xl font-bold mb-4 ${textClass}`}
        >{`Вы вошли как ${user.email}`}</h2>
        <button
          className="w-full py-3 px-4 mb-3 rounded-md font-semibold bg-red-600 text-white 
            hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50
            disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          onClick={handleLogout}
          disabled={loading}
        >
          Выйти
        </button>
        {logoutMessage && (
          <div className="p-2 text-sm font-medium text-green-700 bg-green-100 rounded-md">
            {logoutMessage}
          </div>
        )}
        {error && (
          <div className="p-2 text-sm font-medium text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}
      </div>

      <div className="mb-6">
        <Selector
          options={["German", "English", "Spanish", "French"]}
          onSelect={(sel) => {
            setPref("translate_to", sel);
          }}
          default={0}
        />
      </div>

      <Collapse title="Advanced setting">
        <div
          className={`p-4 rounded-md ${isDark ? "bg-gray-700" : "bg-gray-50"}`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className={labelClass}>Use custom prompt</span>
            <Toggle
              checked={prefs.useCustomPrompt}
              onToggle={(e) => {
                setPref("useCustomPrompt", e);
              }}
            />
          </div>

          <TextInput
            onDoneTyping={(value) => {
              setPref("customPrompt", value);
            }}
            default={prefs.customPrompt}
            title={"Custom prompt"}
          />
        </div>
      </Collapse>
    </div>
  );
};

export default Home;
