import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "../../context/ThemeContext";

export interface TextInputProps {
  title: string;
  default?: string;
  onDoneTyping?: (value: string) => void;
  delay?: number; // optional delay in ms
  disabled?: boolean; // whether the input is disabled
}

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = window.setTimeout(() => {
      onDoneTyping?.(newValue);
    }, delay);
  };

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
