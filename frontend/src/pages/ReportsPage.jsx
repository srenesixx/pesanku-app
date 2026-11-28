import { useEffect, useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { orderApi } from '../services/api.js';
import { exportTransactionsCSV, formatRupiah } from '../utils/format.js';
import { validateReportDateRange } from '../utils/validation.js';
import { AlertBanner, Button } from '../components/atoms/index.js';
import { MetricCard, PageHeader } from '../components/molecules/index.js';
import {
  ReportFilterBar,
  TransactionHistoryTable,
} from '../components/organisms/index.js';

export default function ReportsPage({ initialOrders = [] } = {}) {
  const [orders, setOrders] = useState(initialOrders);
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    orderApi.list().then(setOrders);
  }, []);

  const dateValidation = useMemo(
    () => validateReportDateRange({ startDate, endDate }),
    [startDate, endDate]
  );

  const filtered = useMemo(() => {
    if (!dateValidation.valid) return [];
    return orders.filter((order) => {
      if (statusFilter !== 'Semua' && order.status !== statusFilter) return false;
      const day = order.createdAt.slice(0, 10);
      if (startDate && day < startDate) return false;
      if (endDate && day > endDate) return false;
      return true;
    });
  }, [orders, statusFilter, startDate, endDate, dateValidation.valid]);

  const validFiltered = filtered.filter((o) => o.status !== 'Dibatalkan');
  const totalRevenue = validFiltered.reduce((sum, o) => sum + o.totalAmount, 0);
  const avgOrder = validFiltered.length > 0 ? Math.round(totalRevenue / validFiltered.length) : 0;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Riwayat Transaksi & Laporan"
        subtitle="Pantau seluruh riwayat transaksi, saring berdasarkan tanggal, dan ekspor laporan CSV."
        actions={
          <Button
            variant="dark"
            onClick={() => exportTransactionsCSV(filtered)}
            disabled={filtered.length === 0}
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            Ekspor CSV
          </Button>
        }
      />

      <ReportFilterBar
        startDate={startDate}
        endDate={endDate}
        statusFilter={statusFilter}
        dateError={dateValidation.errors.dateRange}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onStatusChange={setStatusFilter}
      />

      {!dateValidation.valid && <AlertBanner message={dateValidation.message} />}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          label="Total Pendapatan (Valid)"
          value={formatRupiah(totalRevenue)}
          accent="text-[#C84B24]"
        />
        <MetricCard label="Jumlah Transaksi" value={`${filtered.length} transaksi`} />
        <MetricCard label="Rata-rata per Transaksi" value={formatRupiah(avgOrder)} />
      </div>

      <TransactionHistoryTable orders={filtered} />
    </div>
  );
}
