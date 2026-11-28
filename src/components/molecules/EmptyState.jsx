import Card from '../atoms/Card.jsx';

export default function EmptyState({
  title,
  description = '',
  dashed = false,
  padding = 'md',
  className = '',
}) {
  return Card({
    padding,
    dashed,
    className: `text-center ${className}`.trim(),
    children: description ? (
      <>
        <p className="text-sm font-semibold text-[#1F1915]">{title}</p>
        <p className="text-xs text-[#6B5E54] mt-1">{description}</p>
      </>
    ) : (
      <p className="text-sm text-[#6B5E54]">{title}</p>
    ),
  });
}
