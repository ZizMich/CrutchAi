import React from "react";
import { useTheme } from "../context/ThemeContext";
// Icons for theme modes
import {
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/outline";

const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="theme-selector w-full">
      <div className="flex space-x-2 w-full justify-between">
        <button
          onClick={() => setTheme("light")}
          className={`flex items-center justify-center p-2 rounded-md transition-all ${
            theme === "light"
              ? "bg-blue-500 text-white shadow-md"
              : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
          }`}
          aria-label="Light Mode"
        >
          <SunIcon className="h-5 w-5 mr-1" />
          <span>Light</span>
        </button>

        <button
          onClick={() => setTheme("dark")}
          className={`flex items-center justify-center p-2 rounded-md transition-all ${
            theme === "dark"
              ? "bg-blue-500 text-white shadow-md"
              : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
          }`}
          aria-label="Dark Mode"
        >
          <MoonIcon className="h-5 w-5 mr-1" />
          <span>Dark</span>
        </button>

        <button
          onClick={() => setTheme("system")}
          className={`flex items-center justify-center p-2 rounded-md transition-all ${
            theme === "system"
              ? "bg-blue-500 text-white shadow-md"
              : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
          }`}
          aria-label="System Mode"
        >
          <ComputerDesktopIcon className="h-5 w-5 mr-1" />
          <span>System</span>
        </button>
      </div>
    </div>
  );
};

export default ThemeSelector;
