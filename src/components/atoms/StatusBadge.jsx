import Badge from './Badge.jsx';

const STATUS_TONES = {
  Menunggu: 'amber',
  Diproses: 'sky',
  Selesai: 'emerald',
  Dibatalkan: 'rose',
};

export default function StatusBadge({ status }) {
  const tone = STATUS_TONES[status] || 'neutral';
  return Badge({ tone, size: 'sm', bordered: true, children: status });
}
