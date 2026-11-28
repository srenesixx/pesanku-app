export default function Checkbox({
  id,
  label,
  checked,
  onChange,
  className = '',
  ...rest
}) {
  return (
    <label
      htmlFor={id}
      className={`min-h-[44px] inline-flex items-center gap-2.5 text-sm text-[#1F1915] cursor-pointer ${className}`.trim()}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="accent-[#C84B24] w-4 h-4"
        {...rest}
      />
      {label}
    </label>
  );
}
