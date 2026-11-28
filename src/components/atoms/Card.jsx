const PADDING_CLASSES = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-5 sm:p-7',
};

export default function Card({
  as: Tag = 'div',
  padding = 'md',
  dashed = false,
  className = '',
  children,
  ...rest
}) {
  const paddingClass = PADDING_CLASSES[padding] ?? PADDING_CLASSES.md;
  const classes = [
    'bg-white border border-[#E7DFD3] rounded-2xl',
    dashed ? 'border-dashed' : '',
    paddingClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  );
}
