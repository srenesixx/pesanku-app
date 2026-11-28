export default function Input({
  id,
  type = 'text',
  error = '',
  icon: Icon = null,
  className = '',
  ...rest
}) {
  const errorId = id && error ? `${id}-error` : undefined;
  const paddingLeft = Icon ? 'pl-10 pr-3.5' : 'px-3';
  const borderTone = error ? 'border-rose-400' : 'border-[#E7DFD3]';
  const baseClass = `w-full min-h-[44px] ${paddingLeft} py-2 rounded-xl border ${borderTone} bg-white text-sm text-[#1F1915] placeholder:text-[#6B5E54] focus:border-[#C84B24] focus-visible:ring-2 focus-visible:ring-[#C84B24] focus-visible:ring-offset-1 ${className}`.trim();

  const inputElement = (
    <input
      id={id}
      type={type}
      aria-invalid={error ? 'true' : undefined}
      aria-describedby={errorId}
      className={baseClass}
      {...rest}
    />
  );

  if (!Icon) {
    return inputElement;
  }

  return (
    <div className="relative">
      <Icon
        className="w-4 h-4 text-[#6B5E54] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
        aria-hidden="true"
      />
      {inputElement}
    </div>
  );
}
