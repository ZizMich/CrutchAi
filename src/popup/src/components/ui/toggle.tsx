interface ToggleProps {
  checked?: boolean;
  onToggle?: (checked: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
}

const Toggle: React.FC<ToggleProps> = ({ checked, onToggle, className, style }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onToggle?.(e.target.checked);
  };

  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={handleChange}
      className={`toggle ${className ?? ""}`}
      style={style}
    />
  );
};

export default Toggle;