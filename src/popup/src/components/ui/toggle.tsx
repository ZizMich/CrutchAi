import React from "react";
import { useTheme } from "../../context/ThemeContext";

/**
 * Toggle component props interface
 */
interface ToggleProps {
  /** Whether the toggle is checked/active */
  checked?: boolean;
  /** Callback function triggered when toggle state changes */
  onToggle?: (checked: boolean) => void;
  /** Additional CSS classes to apply to the toggle */
  className?: string;
  /** Optional inline styles to apply to the toggle */
  style?: React.CSSProperties;
}

/**
 * Toggle Component
 *
 * A styled toggle switch that supports both light and dark themes.
 * Provides visual feedback for checked/unchecked states.
 *
 * @example
 * <Toggle
 *   checked={isEnabled}
 *   onToggle={(checked) => setIsEnabled(checked)}
 * />
 */
const Toggle: React.FC<ToggleProps> = ({
  checked = false,
  onToggle,
  className = "",
  style,
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  /**
   * Handles the toggle state change
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onToggle?.(e.target.checked);
  };

  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        className="sr-only peer"
        aria-checked={checked}
      />
      <div
        className={`
          w-11 h-6 rounded-full peer 
          ${
            isDark
              ? "bg-gray-700 peer-checked:bg-blue-500"
              : "bg-gray-300 peer-checked:bg-blue-600"
          }
          peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300
          after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
          after:bg-white after:border-gray-300 after:border after:rounded-full 
          after:h-5 after:w-5 after:transition-all
          peer-checked:after:translate-x-full ${className}
        `}
        style={style}
      ></div>
    </label>
  );
};

export default Toggle;
