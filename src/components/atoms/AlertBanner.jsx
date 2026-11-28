export default function AlertBanner({
  message,
  children,
  tone = 'error',
  className = '',
  size = 'xs',
}) {
  if (!message && !children) return null;

  const toneStyles = {
    error: 'bg-rose-50 border-rose-200 text-rose-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
  };

  const sizeStyles = {
    xs: 'px-3 py-2 text-xs',
    sm: 'px-3.5 py-2.5 text-sm',
  };

  return (
    <div
      role="alert"
      className={`rounded-xl border ${toneStyles[tone] || toneStyles.error} ${
        sizeStyles[size] || sizeStyles.xs
      } ${className}`.trim()}
    >
      {children || message}
    </div>
  );
}
