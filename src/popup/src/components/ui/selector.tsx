import React from "react";
import { useTheme } from "../../context/ThemeContext";

/**
 * Selector component props interface
 */
interface SelectorProps {
  /** Array of options to display in the dropdown */
  options: string[];
  /** Index of the default selected option */
  default: number;
  /** Callback function triggered when an option is selected */
  onSelect: (value: string) => void;
}

/**
 * Selector Component
 *
 * A styled dropdown select component with theme support.
 * Displays a list of options in a dropdown menu with a fieldset wrapper.
 *
 * @example
 * <Selector
 *   options={["English", "Spanish", "French"]}
 *   default={0}
 *   onSelect={(language) => setLanguage(language)}
 * />
 */
const Selector: React.FC<SelectorProps> = ({
  options,
  default: defaultIndex,
  onSelect,
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <fieldset
      className={`border rounded-md p-4 w-full ${
        isDark ? "border-gray-600" : "border-gray-300"
      }`}
    >
      <legend
        className={`px-2 font-medium ${
          isDark ? "text-gray-300" : "text-gray-700"
        }`}
      >
        Language
      </legend>
      <select
        onChange={(e) => onSelect(e.target.value)}
        defaultValue={options[defaultIndex]}
        className={`w-full p-2 rounded-md border ${
          isDark
            ? "bg-gray-700 text-white border-gray-600"
            : "bg-white text-gray-900 border-gray-300"
        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
        aria-label="Language selector"
      >
        {options.map((opt, idx) => (
          <option
            key={idx}
            value={opt}
            className={isDark ? "bg-gray-700" : "bg-white"}
          >
            {opt}
          </option>
        ))}
      </select>
      <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
        Optional
      </span>
    </fieldset>
  );
};

export default Selector;
