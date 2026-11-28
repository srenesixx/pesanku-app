const TONE_CLASSES = {
  neutral: 'bg-stone-100 text-stone-700 border-stone-200',
  warm: 'bg-[#FFF3E8] text-[#A93B19] border-[#F3D2BA]',
  amber: 'bg-amber-50 text-amber-800 border-amber-200',
  sky: 'bg-sky-50 text-sky-800 border-sky-200',
  emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  rose: 'bg-rose-50 text-rose-800 border-rose-200',
};

const SIZE_CLASSES = {
  xs: 'px-2.5 py-0.5 text-[11px]',
  sm: 'px-2.5 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
};

export default function Badge({
  tone = 'neutral',
  size = 'sm',
  bordered = true,
  className = '',
  children,
}) {
  const toneClass = TONE_CLASSES[tone] || TONE_CLASSES.neutral;
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.sm;
  const classes = [
    'inline-flex items-center gap-1 rounded-full font-semibold',
    sizeClass,
    bordered ? 'border' : '',
    toneClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <span className={classes}>{children}</span>;
}
