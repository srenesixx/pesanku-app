const VARIANT_CLASSES = {
  primary:
    'rounded-xl bg-[#C84B24] hover:bg-[#A93B19] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-[#C84B24] text-white font-bold',
  secondary:
    'rounded-xl border border-[#E7DFD3] bg-white hover:bg-[#FAF7F2] active:bg-[#F3ECE1] text-[#6B5E54] hover:text-[#1F1915] font-semibold',
  outline:
    'rounded-xl border border-[#E7DFD3] bg-white hover:bg-[#FAF7F2] active:bg-[#F3ECE1] text-[#1F1915] font-semibold',
  dark:
    'rounded-xl bg-[#1F1915] hover:bg-[#352C26] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold',
  danger:
    'rounded-xl border border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100 font-semibold',
  'danger-ghost':
    'rounded-xl text-rose-700 hover:bg-rose-50 active:bg-rose-100 font-semibold',
  success:
    'rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold',
  available:
    'rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 font-semibold',
  unavailable:
    'rounded-full bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 font-semibold',
  ghost:
    'rounded-xl text-[#6B5E54] hover:text-[#1F1915] hover:bg-[#FAF7F2] font-semibold',
  'ghost-danger':
    'rounded-lg text-[#6B5E54] hover:text-rose-700 hover:bg-rose-50 font-semibold',
  'ghost-neutral':
    'rounded-lg text-[#6B5E54] hover:text-[#1F1915] hover:bg-[#F1EAE0] font-semibold',
  pill:
    'rounded-full bg-white border border-[#E7DFD3] text-[#6B5E54] hover:text-[#1F1915] font-semibold',
  'pill-active':
    'rounded-full bg-[#1F1915] text-white font-semibold',
  'nav-active':
    'rounded-xl bg-[#C84B24] text-white active:bg-[#A93B19] font-semibold',
  'nav-idle':
    'rounded-xl text-[#6B5E54] hover:text-[#1F1915] hover:bg-[#FAF7F2] active:bg-[#F3ECE1] font-semibold',
  link:
    'rounded-lg text-[#C84B24] hover:underline font-semibold',
  soft:
    'rounded-xl bg-[#FAF7F2] hover:bg-[#C84B24] text-[#1F1915] hover:text-white border border-[#E7DFD3] hover:border-[#C84B24] font-bold',
};

const SIZE_CLASSES = {
  md: 'min-h-[44px] px-4 py-2.5 text-sm',
  sm: 'min-h-[44px] px-3 py-2 text-xs',
  pill: 'min-h-[44px] px-4 py-2 text-sm',
  chip: 'min-h-[44px] px-3.5 py-2 text-xs',
  icon: 'min-h-[44px] min-w-[44px] p-2 text-xs',
  inline: 'min-h-[44px] px-2 text-xs',
  none: 'min-h-[44px]',
};

export default function Button({
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}) {
  const baseClass =
    'inline-flex items-center justify-center gap-2 cursor-pointer motion-reduce:transition-none transition-colors';
  const variantClass = VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary;
  const sizeClass = SIZE_CLASSES[size] ?? SIZE_CLASSES.md;

  return (
    <button
      type={type}
      className={`${baseClass} ${sizeClass} ${variantClass} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}
