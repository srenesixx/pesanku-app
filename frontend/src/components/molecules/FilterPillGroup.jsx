import Button from '../atoms/Button.jsx';

export default function FilterPillGroup({
  options = [],
  activeOption,
  onSelect,
  className = '',
}) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`.trim()}>
      {options.map((opt) => {
        const isActive = activeOption === opt;
        return (
          <Button
            key={opt}
            variant={isActive ? 'pill-active' : 'pill'}
            size="pill"
            aria-pressed={isActive}
            onClick={() => onSelect?.(opt)}
          >
            {opt}
          </Button>
        );
      })}
    </div>
  );
}
