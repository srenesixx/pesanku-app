const STATUS_STYLES = {
  Menunggu: 'bg-amber-50 text-amber-800 border-amber-200',
  Diproses: 'bg-sky-50 text-sky-800 border-sky-200',
  Selesai: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  Dibatalkan: 'bg-rose-50 text-rose-800 border-rose-200',
};

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || 'bg-stone-100 text-stone-700 border-stone-200';
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}
    >
      {status}
    </span>
  );
}
