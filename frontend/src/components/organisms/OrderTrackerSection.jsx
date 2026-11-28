import { Search } from 'lucide-react';
import { formatDateTime, formatRupiah } from '../../utils/format.js';
import Button from '../atoms/Button.jsx';
import Card from '../atoms/Card.jsx';
import Input from '../atoms/Input.jsx';
import StatusBadge from '../atoms/StatusBadge.jsx';

export default function OrderTrackerSection({
  trackCode = '',
  trackError = '',
  trackedOrder = null,
  onTrackCodeChange,
  onSubmit,
}) {
  return (
    <Card as="section" padding="none" className="mb-6 p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div>
          <h2 className="font-bold text-base text-[#1F1915]">Lacak Status Pesanan</h2>
          <p className="text-xs text-[#6B5E54]">
            Masukkan kode pesanan Anda (contoh: <span className="font-mono font-semibold">PK-1005</span>).
          </p>
        </div>
        <form onSubmit={onSubmit} className="flex gap-2 w-full sm:w-auto" noValidate>
          <div className="relative flex-1 sm:w-52">
            <label htmlFor="track-order-code" className="sr-only">
              Kode pesanan
            </label>
            <Input
              id="track-order-code"
              type="text"
              icon={Search}
              value={trackCode}
              error={trackError}
              onChange={(e) => onTrackCodeChange?.(e.target.value)}
              placeholder="Kode pesanan..."
            />
          </div>
          <Button type="submit" variant="primary" size="none" className="px-4 py-2 text-sm font-semibold shrink-0">
            Cek
          </Button>
        </form>
      </div>

      {trackError && (
        <p id="track-order-code-error" role="alert" className="text-sm text-rose-700 mt-2">
          {trackError}
        </p>
      )}

      {trackedOrder && (
        <div className="mt-3 pt-3 border-t border-[#E7DFD3] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono font-bold text-sm text-[#1F1915]">
                {trackedOrder.code}
              </span>
              <StatusBadge status={trackedOrder.status} />
            </div>
            <p className="text-sm text-[#1F1915] font-medium mt-1 break-words">
              {trackedOrder.customerName}:{' '}
              {trackedOrder.items.map((i) => `${i.name} x${i.qty}`).join(', ')}
            </p>
            <p className="text-xs text-[#6B5E54] mt-0.5">{formatDateTime(trackedOrder.createdAt)}</p>
          </div>
          <div className="text-left sm:text-right shrink-0">
            <span className="text-xs text-[#6B5E54] block">Total</span>
            <span className="font-bold text-base tabular-nums text-[#C84B24]">
              {formatRupiah(trackedOrder.totalAmount)}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
