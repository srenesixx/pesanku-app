import { useEffect, useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { orderApi } from '../services/api.js';
import { exportTransactionsCSV, formatDateTime, formatRupiah } from '../utils/format.js';
import StatusBadge from '../components/StatusBadge.jsx';

export default function ReportsPage() {
  const [orders, setOrders] = useState([]);
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
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1F1915] hover:bg-[#352C26] disabled:opacity-50 text-white text-sm font-bold cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Ekspor CSV
        </button>
      </div>

      <div className="bg-white border border-[#E7DFD3] rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-[#6B5E54] mb-1">Dari Tanggal</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-[#E7DFD3] text-sm focus:outline-none focus:border-[#C84B24]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#6B5E54] mb-1">Sampai Tanggal</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-[#E7DFD3] text-sm focus:outline-none focus:border-[#C84B24]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#6B5E54] mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-[#E7DFD3] text-sm bg-white focus:outline-none focus:border-[#C84B24]"
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

      <div className="bg-white border border-[#E7DFD3] rounded-2xl overflow-hidden">
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
                      {order.items.map((i) => `${i.name} ×${i.qty}`).join(', ')}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold tabular-nums">
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
