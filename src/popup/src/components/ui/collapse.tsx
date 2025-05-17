import React, { useState } from "react";
import type { ReactNode } from "react";
import { useTheme } from "../../context/ThemeContext";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

interface CollapseProps {
  title: string;
  children?: ReactNode;
}

const Collapse: React.FC<CollapseProps> = ({ title, children }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`rounded-md border mb-4 overflow-hidden ${
        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-4 flex items-center justify-between font-medium ${
          isDark
            ? "text-gray-200 hover:bg-gray-700"
            : "text-gray-900 hover:bg-gray-50"
        } transition-colors`}
      >
        <span>{title}</span>
        {isOpen ? (
          <ChevronUpIcon className="h-5 w-5" />
        ) : (
          <ChevronDownIcon className="h-5 w-5" />
        )}
      </button>

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className={`p-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Collapse;
