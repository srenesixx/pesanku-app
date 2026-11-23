import { useEffect, useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { orderApi } from '../services/api.js';
import { exportTransactionsCSV, formatDateTime, formatRupiah } from '../utils/format.js';
import StatusBadge from '../components/StatusBadge.jsx';

const FILTER_INPUT_CLASS =
  'w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#E7DFD3] bg-white text-sm text-[#1F1915] focus:border-[#C84B24] focus-visible:ring-2 focus-visible:ring-[#C84B24]/30';

function formatOrderItems(items) {
  return (items || []).map((i) => `${i.name} ×${i.qty}`).join(', ');
}

export default function ReportsPage({ initialOrders = [] } = {}) {
  const [orders, setOrders] = useState(initialOrders);
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    orderApi.list().then(setOrders);
  }, []);

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== 'Semua' && order.status !== statusFilter) return false;
      const day = order.createdAt.slice(0, 10);
      if (startDate && day < startDate) return false;
      if (endDate && day > endDate) return false;
      return true;
    });
  }, [orders, statusFilter, startDate, endDate]);

  const validFiltered = filtered.filter((o) => o.status !== 'Dibatalkan');
  const totalRevenue = validFiltered.reduce((sum, o) => sum + o.totalAmount, 0);
  const avgOrder = validFiltered.length > 0 ? Math.round(totalRevenue / validFiltered.length) : 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#1F1915]">
            Riwayat Transaksi & Laporan
          </h1>
          <p className="text-sm text-[#6B5E54] mt-0.5">
            Pantau seluruh riwayat transaksi, saring berdasarkan tanggal, dan ekspor laporan CSV.
          </p>
        </div>
        <button
          type="button"
          onClick={() => exportTransactionsCSV(filtered)}
          disabled={filtered.length === 0}
          className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl bg-[#1F1915] hover:bg-[#352C26] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold cursor-pointer motion-reduce:transition-none transition-colors"
        >
          <Download className="w-4 h-4" aria-hidden="true" />
          Ekspor CSV
        </button>
      </div>

      <div className="bg-white border border-[#E7DFD3] rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label htmlFor="report-start-date" className="block text-xs font-semibold text-[#6B5E54] mb-1">
            Dari Tanggal
          </label>
          <input
            id="report-start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={FILTER_INPUT_CLASS}
          />
        </div>
        <div>
          <label htmlFor="report-end-date" className="block text-xs font-semibold text-[#6B5E54] mb-1">
            Sampai Tanggal
          </label>
          <input
            id="report-end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={FILTER_INPUT_CLASS}
          />
        </div>
        <div>
          <label htmlFor="report-status" className="block text-xs font-semibold text-[#6B5E54] mb-1">
            Status
          </label>
          <select
            id="report-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={FILTER_INPUT_CLASS}
          >
            {['Semua', 'Menunggu', 'Diproses', 'Selesai', 'Dibatalkan'].map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E7DFD3] rounded-2xl p-4">
          <span className="text-xs font-semibold text-[#6B5E54]">Total Pendapatan (Valid)</span>
          <p className="text-xl font-extrabold tabular-nums text-[#C84B24] mt-1">
            {formatRupiah(totalRevenue)}
          </p>
        </div>
        <div className="bg-white border border-[#E7DFD3] rounded-2xl p-4">
          <span className="text-xs font-semibold text-[#6B5E54]">Jumlah Transaksi</span>
          <p className="text-xl font-extrabold tabular-nums text-[#1F1915] mt-1">
            {filtered.length} transaksi
          </p>
        </div>
        <div className="bg-white border border-[#E7DFD3] rounded-2xl p-4">
          <span className="text-xs font-semibold text-[#6B5E54]">Rata-rata per Transaksi</span>
          <p className="text-xl font-extrabold tabular-nums text-[#1F1915] mt-1">
            {formatRupiah(avgOrder)}
          </p>
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {filtered.length === 0 ? (
          <div className="bg-white border border-[#E7DFD3] rounded-2xl p-6 text-center text-sm text-[#6B5E54]">
            Tidak ada transaksi pada filter yang dipilih.
          </div>
        ) : (
          filtered.map((order) => (
            <article
              key={order.id}
              className="bg-white border border-[#E7DFD3] rounded-2xl p-4 space-y-2.5"
            >
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
            </article>
          ))
        )}
      </div>

      <div className="hidden md:block bg-white border border-[#E7DFD3] rounded-2xl overflow-hidden">
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#6B5E54]">
                    Tidak ada transaksi pada filter yang dipilih.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
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
      </div>
    </div>
  );
}
