export default function LeaderboardRow({ rank, name, subLabel, rightLabel }) {
  return (
    <li className="flex items-center justify-between gap-3 text-sm">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="w-6 h-6 rounded-lg bg-[#FAF7F2] border border-[#E7DFD3] text-xs font-bold flex items-center justify-center shrink-0">
          {rank}
        </span>
        <div className="min-w-0">
          <p className="font-semibold text-[#1F1915] truncate">{name}</p>
          {subLabel && <p className="text-xs text-[#6B5E54] tabular-nums">{subLabel}</p>}
        </div>
      </div>
      <span className="font-bold tabular-nums text-[#1F1915] shrink-0">{rightLabel}</span>
    </li>
  );
}
