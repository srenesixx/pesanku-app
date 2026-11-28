import { useEffect, useState } from 'react';
import { Clock, ReceiptText, TrendingUp, Trophy } from 'lucide-react';
import { reportApi } from '../services/api.js';
import { formatRupiah } from '../utils/format.js';
import { MetricCard, PageHeader } from '../components/molecules/index.js';
import {
  AiInsightSection,
  SalesTrendChart,
  TopMenusCard,
} from '../components/organisms/index.js';

export default function DashboardPage({ initialSummary = null } = {}) {
  const [summary, setSummary] = useState(initialSummary);
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
    if (!initialSummary) {
      reportApi.getDashboardSummary().then(setSummary);
    }
    loadAi(false);
  }, [initialSummary]);

  if (!summary) {
    return <p className="text-sm text-[#6B5E54]">Memuat ringkasan penjualan...</p>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Penjualan"
        subtitle="Ringkasan performa transaksi Warung Nasi Ayam Mak Nyus secara real-time."
      />

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
        <SalesTrendChart dailySales={summary.dailySales} />
        <TopMenusCard topMenus={summary.topMenus} />
      </div>

      <AiInsightSection
        loadingAi={loadingAi}
        aiError={aiError}
        aiInsight={aiInsight}
        onReload={loadAi}
      />
    </div>
  );
}
