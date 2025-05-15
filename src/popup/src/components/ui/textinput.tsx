import React, { useEffect, useRef, useState } from "react";

interface TextInputProps {
  title: string;
  default?: string;
  onDoneTyping?: (value: string) => void;
  delay?: number; // optional, z. B. 500 ms
}

const TextInput: React.FC<TextInputProps> = ({
  title,
  default: defaultValue,
  onDoneTyping,
  delay = 500
}) => {
  const [value, setValue] = useState(defaultValue || "");
  const timeoutRef = useRef<number | null>(null);

  // Synchronisiere defaultValue → value wenn defaultValue sich ändert
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
    <fieldset className="fieldset">
      <legend className="fieldset-legend">{title}</legend>
      <input
        type="text"
        className="input"
        placeholder="e.g. explain these words"
        style={{ color: "black" }}
        value={value}
        onChange={handleChange}
      />
    </fieldset>
  );
};

export default TextInput;
