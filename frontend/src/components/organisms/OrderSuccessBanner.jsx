import { CheckCircle2 } from 'lucide-react';
import { formatRupiah } from '../../utils/format.js';
import Button from '../atoms/Button.jsx';

export default function OrderSuccessBanner({ order, bannerRef, onTrackOrder }) {
  if (!order) return null;

  return (
    <section
      id="last-order-banner"
      ref={bannerRef}
      tabIndex={-1}
      className="mb-6 scroll-mt-20 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div className="flex items-start gap-3 min-w-0">
        <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="min-w-0">
          <h2 className="font-bold text-emerald-950">Pesanan Berhasil Dikirim!</h2>
          <p className="text-sm text-emerald-900 mt-0.5">
            Kode pesanan Anda: <span className="font-mono font-bold">{order.code}</span> • Total{' '}
            <span className="font-bold tabular-nums">{formatRupiah(order.totalAmount)}</span>
          </p>
          <p className="text-xs text-emerald-800 mt-1">
            Simpan kode pesanan untuk memantau status pembuatan di Warung Mak Nyus.
          </p>
        </div>
      </div>
      <Button variant="success" onClick={onTrackOrder} className="py-2 shrink-0">
        Pantau Status
      </Button>
    </section>
  );
}
