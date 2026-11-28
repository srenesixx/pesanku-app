import { formatDateTime, formatRupiah } from '../../utils/format.js';
import Card from '../atoms/Card.jsx';
import StatusBadge from '../atoms/StatusBadge.jsx';
import EmptyState from '../molecules/EmptyState.jsx';

function formatOrderItems(items) {
  return (items || []).map((i) => `${i.name} ×${i.qty}`).join(', ');
}

export default function TransactionHistoryTable({ orders = [] }) {
  return (
    <>
      <div className="space-y-3 md:hidden">
        {orders.length === 0 ? (
          <EmptyState title="Tidak ada transaksi pada filter yang dipilih." padding="lg" />
        ) : (
          orders.map((order) => (
            <Card key={order.id} as="article" padding="sm" className="space-y-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                  <span className="font-mono font-bold text-sm text-[#1F1915]">{order.code}</span>
                  <StatusBadge status={order.status} />
                </div>
                <span className="font-bold text-sm text-[#1F1915] tabular-nums shrink-0">
                  {formatRupiah(order.totalAmount)}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <p className="font-semibold text-sm text-[#1F1915] break-words">
                  {order.customerName}
                </p>
                <p className="text-xs text-[#6B5E54] whitespace-nowrap">
                  {formatDateTime(order.createdAt)}
                </p>
              </div>

              <p className="text-xs text-[#6B5E54] break-words leading-relaxed">
                {formatOrderItems(order.items)}
              </p>
            </Card>
          ))
        )}
      </div>

      <Card padding="none" className="hidden md:block overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E7DFD3] bg-[#FAF7F2] text-xs font-bold uppercase tracking-wider text-[#6B5E54]">
                <th className="py-3 px-4">Kode</th>
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">Pelanggan</th>
                <th className="py-3 px-4">Rincian</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1EAE0] text-sm">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#6B5E54]">
                    Tidak ada transaksi pada filter yang dipilih.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FAF7F2]/60">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#1F1915]">{order.code}</td>
                    <td className="py-3.5 px-4 text-xs text-[#6B5E54] whitespace-nowrap">
                      {formatDateTime(order.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#1F1915]">{order.customerName}</td>
                    <td className="py-3.5 px-4 text-xs text-[#6B5E54]">
                      {formatOrderItems(order.items)}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold tabular-nums text-[#1F1915]">
                      {formatRupiah(order.totalAmount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
