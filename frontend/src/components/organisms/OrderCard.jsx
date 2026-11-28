import { ORDER_STATUS_OPTIONS } from '../../constants/domain.js';
import { formatDateTime, formatRupiah } from '../../utils/format.js';
import Card from '../atoms/Card.jsx';
import Select from '../atoms/Select.jsx';
import StatusBadge from '../atoms/StatusBadge.jsx';

export default function OrderCard({ order, onStatusChange }) {
  return (
    <Card
      as="article"
      padding="md"
      className="flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
      <div className="space-y-1.5 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono font-bold text-sm text-[#1F1915]">{order.code}</span>
          <StatusBadge status={order.status} />
          <span className="text-xs text-[#6B5E54]">{formatDateTime(order.createdAt)}</span>
        </div>
        <p className="font-bold text-base text-[#1F1915]">{order.customerName}</p>
        <ul className="text-sm text-[#6B5E54] space-y-0.5">
          {order.items.map((item, idx) => (
            <li key={`${order.id}-${idx}`} className="tabular-nums">
              {item.name} × {item.qty}{' '}
              <span className="text-xs text-[#6B5E54]">({formatRupiah(item.subtotal)})</span>
            </li>
          ))}
        </ul>
        {order.notes && (
          <p className="text-xs text-[#6B5E54] bg-[#FAF7F2] inline-block px-2.5 py-1 rounded-lg">
            Catatan: {order.notes}
          </p>
        )}
      </div>

      <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-[#F1EAE0] shrink-0">
        <div className="md:text-right">
          <span className="text-xs text-[#6B5E54] block">Total</span>
          <span className="text-lg font-extrabold tabular-nums text-[#C84B24]">
            {formatRupiah(order.totalAmount)}
          </span>
        </div>

        <Select
          aria-label={`Ubah status ${order.code}`}
          value={order.status}
          fullWidth={false}
          onChange={(e) => onStatusChange?.(order.id, e.target.value)}
          className="bg-[#FAF7F2] font-semibold"
        >
          {ORDER_STATUS_OPTIONS.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </Select>
      </div>
    </Card>
  );
}
