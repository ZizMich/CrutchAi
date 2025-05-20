import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "../../context/ThemeContext";

/**
 * TextInput component props interface
 */
export interface TextInputProps {
  /** Label text displayed above the input field */
  title: string;
  /** Default value for the input field */
  default?: string;
  /** Callback function triggered after user stops typing */
  onDoneTyping?: (value: string) => void;
  /** Debounce delay in milliseconds before triggering onDoneTyping */
  delay?: number;
  /** Whether the input field is disabled */
  disabled?: boolean;
}

/**
 * TextInput Component
 *
 * A styled text input field with debounced onChange handling.
 * Includes a fieldset with title legend and respects theme context.
 *
 * @example
 * <TextInput
 *   title="Search"
 *   default="Initial value"
 *   onDoneTyping={(value) => console.log(value)}
 *   delay={300}
 * />
 */
const TextInput: React.FC<TextInputProps> = ({
  title,
  default: defaultValue,
  onDoneTyping,
  delay = 500,
  disabled = false,
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [value, setValue] = useState(defaultValue || "");
  const timeoutRef = useRef<number | null>(null);

  // Sync defaultValue -> value when defaultValue changes
  useEffect(() => {
    setValue(defaultValue || "");
  }, [defaultValue]);

  /**
   * Handles input change with debounce functionality
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = window.setTimeout(() => {
      onDoneTyping?.(newValue);
    }, delay);
  };

  // Clean up timeout on component unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <fieldset
      className={`border rounded-md p-4 my-4 ${
        isDark ? "border-gray-600" : "border-gray-300"
      } ${disabled ? "opacity-60" : ""}`}
    >
      <legend
        className={`px-2 font-medium ${
          isDark ? "text-gray-300" : "text-gray-700"
        }`}
      >
        {title}
      </legend>
      <input
        type="text"
        className={`w-full p-2 rounded-md border ${
          isDark
            ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400"
            : "bg-white text-gray-900 border-gray-300 placeholder-gray-500"
        } focus:outline-none focus:ring-2 focus:ring-blue-500
        disabled:opacity-50 disabled:cursor-not-allowed`}
        placeholder="e.g. explain these words"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        aria-disabled={disabled}
      />
    </fieldset>
  );
};

export default TextInput;
