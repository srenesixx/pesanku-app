export default function SalesBarColumn({ valueLabel, heightPct, dateLabel }) {
  return (
    <div className="flex flex-col items-center h-full justify-end gap-2 min-w-0">
      <span className="text-[11px] font-semibold text-[#6B5E54] tabular-nums">{valueLabel}</span>
      <div className="w-full max-w-12 bg-[#FAF7F2] rounded-t-xl h-28 flex items-end overflow-hidden border border-[#F1EAE0]">
        <div
          className="w-full bg-[#C84B24] rounded-t-lg motion-reduce:transition-none transition-all"
          style={{ height: `${heightPct}%` }}
        />
      </div>
      <span className="text-[11px] sm:text-xs font-medium text-[#6B5E54]">{dateLabel}</span>
    </div>
  );
}
