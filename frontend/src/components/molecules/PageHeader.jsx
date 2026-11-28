export default function PageHeader({
  title,
  subtitle = '',
  titleClassName = 'text-2xl',
  subtitleClassName = 'mt-0.5',
  actions = null,
  className = '',
}) {
  const headerContent = (
    <div>
      <h1 className={`${titleClassName} font-extrabold tracking-tight text-[#1F1915]`}>{title}</h1>
      {subtitle && <p className={`text-sm text-[#6B5E54] ${subtitleClassName}`}>{subtitle}</p>}
    </div>
  );

  if (!actions) {
    return <div className={className}>{headerContent}</div>;
  }

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${className}`.trim()}>
      {headerContent}
      {actions}
    </div>
  );
}
