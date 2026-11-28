import Card from '../atoms/Card.jsx';

export default function MetricCard({
  icon: Icon,
  label,
  value,
  sub = '',
  accent = 'text-[#1F1915]',
}) {
  return (
    <Card padding="sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-[#6B5E54]">{label}</span>
        {Icon && <Icon className="w-4 h-4 text-[#6B5E54]" aria-hidden="true" />}
      </div>
      <p className={`text-xl font-extrabold tracking-tight tabular-nums line-clamp-2 break-words ${accent}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-[#6B5E54] mt-0.5">{sub}</p>}
    </Card>
  );
}
