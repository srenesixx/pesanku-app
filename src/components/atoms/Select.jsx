export default function Select({
  id,
  error = '',
  fullWidth = true,
  className = '',
  children,
  ...rest
}) {
  const errorId = id && error ? `${id}-error` : undefined;
  const widthClass = fullWidth ? 'w-full' : '';
  const borderTone = error ? 'border-rose-400' : 'border-[#E7DFD3]';
  const baseClass = `${widthClass} min-h-[44px] px-3 py-2 rounded-xl border ${borderTone} bg-white text-sm text-[#1F1915] focus:border-[#C84B24] focus-visible:ring-2 focus-visible:ring-[#C84B24] focus-visible:ring-offset-1 ${className}`.trim();

  return (
    <select
      id={id}
      aria-invalid={error ? 'true' : undefined}
      aria-describedby={errorId}
      className={baseClass}
      {...rest}
    >
      {children}
    </select>
  );
}
