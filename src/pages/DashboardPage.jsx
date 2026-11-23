import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Clock,
  ReceiptText,
  Sparkles,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import { reportApi } from '../services/api.js';
import { formatRupiah, formatShortDate } from '../utils/format.js';

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [aiInsight, setAiInsight] = useState(null);
  const [aiError, setAiError] = useState('');
  const [loadingAi, setLoadingAi] = useState(true);

  async function loadAi(simulateError = false) {
    setLoadingAi(true);
    setAiError('');
    try {
      const data = await reportApi.getAiInsights({ simulateError });
      setAiInsight(data);
    } catch (err) {
      setAiInsight(null);
      setAiError(err.message || 'Layanan AI tidak tersedia.');
    } finally {
      setLoadingAi(false);
    }
  }

  useEffect(() => {
    reportApi.getDashboardSummary().then(setSummary);
    loadAi(false);
  }, []);

  if (!summary) {
    return <p className="text-sm text-[#6B5E54]">Memuat ringkasan penjualan...</p>;
  }

  const maxDaily = Math.max(...summary.dailySales.map((d) => d.revenue), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#1F1915]">Dashboard Penjualan</h1>
        <p className="text-sm text-[#6B5E54] mt-0.5">
          Ringkasan performa transaksi Warung Nasi Ayam Mak Nyus secara real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          icon={TrendingUp}
          label="Total Pendapatan"
          value={formatRupiah(summary.totalRevenue)}
          accent="text-[#C84B24]"
        />
        <MetricCard
          icon={ReceiptText}
          label="Jumlah Transaksi"
          value={`${summary.totalTransactions} transaksi`}
        />
        <MetricCard
          icon={Clock}
          label="Pesanan Aktif"
          value={`${summary.activeOrders} pesanan`}
        />
        <MetricCard
          icon={Trophy}
          label="Menu Terlaris"
          value={summary.topMenus[0]?.name || 'Belum ada data'}
          sub={summary.topMenus[0] ? `${summary.topMenus[0].qty} porsi terjual` : ''}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <section className="lg:col-span-7 bg-white border border-[#E7DFD3] rounded-2xl p-5">
          <h2 className="font-bold text-base text-[#1F1915] mb-1">Tren Penjualan 5 Hari Terakhir</h2>
          <p className="text-xs text-[#6B5E54] mb-5">Total pendapatan harian dari transaksi yang valid.</p>

          <div className="grid grid-cols-5 gap-3 items-end h-44 pt-4">
            {summary.dailySales.map((day) => {
              const heightPct = Math.max(Math.round((day.revenue / maxDaily) * 100), day.revenue > 0 ? 12 : 4);
              return (
                <div key={day.date} className="flex flex-col items-center h-full justify-end gap-2">
                  <span className="text-[11px] font-semibold text-[#6B5E54] tabular-nums">
                    {day.revenue > 0 ? `${Math.round(day.revenue / 1000)}rb` : '0'}
                  </span>
                  <div className="w-full max-w-12 bg-[#FAF7F2] rounded-t-xl h-28 flex items-end overflow-hidden border border-[#F1EAE0]">
                    <div
                      className="w-full bg-[#C84B24] rounded-t-lg transition-all"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-[#6B5E54]">{formatShortDate(day.date)}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="lg:col-span-5 bg-white border border-[#E7DFD3] rounded-2xl p-5">
          <h2 className="font-bold text-base text-[#1F1915] mb-1">Menu Terlaris</h2>
          <p className="text-xs text-[#6B5E54] mb-4">Urutan berdasarkan jumlah porsi terjual.</p>

          {summary.topMenus.length === 0 ? (
            <p className="text-sm text-[#6B5E54]">Belum ada data penjualan.</p>
          ) : (
            <ul className="space-y-3">
              {summary.topMenus.map((item, idx) => (
                <li key={item.name} className="flex items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-[#FAF7F2] border border-[#E7DFD3] text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-[#1F1915] truncate">{item.name}</p>
                      <p className="text-xs text-[#6B5E54] tabular-nums">{item.qty} porsi</p>
                    </div>
                  </div>
                  <span className="font-bold tabular-nums text-[#1F1915] shrink-0">
                    {formatRupiah(item.revenue)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="bg-white border border-[#E7DFD3] rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#C84B24]" />
            <h2 className="font-bold text-base text-[#1F1915]">AI Insight Penjualan</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadAi(false)}
              className="text-xs font-semibold text-[#C84B24] hover:underline cursor-pointer"
            >
              Muat Ulang Insight
            </button>
            <span className="text-[#E7DFD3]">|</span>
            <button
              type="button"
              onClick={() => loadAi(true)}
              className="text-xs font-medium text-[#6B5E54] hover:text-[#1F1915] cursor-pointer"
            >
              Uji Fallback AI
            </button>
          </div>
        </div>

        {loadingAi ? (
          <p className="text-sm text-[#6B5E54]">Menganalisis data transaksi...</p>
        ) : aiError ? (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-950">{aiError}</p>
              <p className="text-xs text-amber-800 mt-1">
                Fitur pencatatan pesanan dan laporan statistik tetap berjalan normal.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-[#1F1915] leading-relaxed">{aiInsight?.summary}</p>
            <ul className="space-y-1.5">
              {(aiInsight?.recommendations || []).map((rec) => (
                <li key={rec} className="text-sm text-[#6B5E54] flex items-start gap-2">
                  <span className="text-[#C84B24] font-bold">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, sub, accent = 'text-[#1F1915]' }) {
  return (
    <div className="bg-white border border-[#E7DFD3] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-[#6B5E54]">{label}</span>
        <Icon className="w-4 h-4 text-[#6B5E54]" />
      </div>
      <p className={`text-xl font-extrabold tracking-tight tabular-nums truncate ${accent}`}>{value}</p>
      {sub && <p className="text-xs text-[#6B5E54] mt-0.5">{sub}</p>}
    </div>
  );
}
