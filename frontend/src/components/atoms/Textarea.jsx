export default function Textarea({
  id,
  rows = 2,
  error = '',
  className = '',
  ...rest
}) {
  const errorId = id && error ? `${id}-error` : undefined;
  const borderTone = error ? 'border-rose-400' : 'border-[#E7DFD3]';
  const baseClass = `w-full min-h-[44px] px-3 py-2 rounded-xl border ${borderTone} bg-white text-sm text-[#1F1915] placeholder:text-[#6B5E54] focus:border-[#C84B24] focus-visible:ring-2 focus-visible:ring-[#C84B24] focus-visible:ring-offset-1 ${className}`.trim();

  return (
    <textarea
      id={id}
      rows={rows}
      aria-invalid={error ? 'true' : undefined}
      aria-describedby={errorId}
      className={baseClass}
      {...rest}
    />
  );
}
