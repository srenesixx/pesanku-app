export default function FormField({
  id,
  label,
  error = '',
  labelClassName = 'block text-xs font-semibold text-[#1F1915] mb-1',
  className = '',
  children,
}) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className={labelClassName}>
          {label}
        </label>
      )}
      {children}
      {error && (
        <p id={id ? `${id}-error` : undefined} className="text-xs text-rose-700 mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
