import { formatShortDate } from '../../utils/format.js';
import Card from '../atoms/Card.jsx';
import SalesBarColumn from '../molecules/SalesBarColumn.jsx';

export default function SalesTrendChart({ dailySales = [] }) {
  const maxDaily = Math.max(...dailySales.map((d) => d.revenue), 1);

  return (
    <Card as="section" padding="md" className="lg:col-span-7">
      <h2 className="font-bold text-base text-[#1F1915] mb-1">Tren Penjualan 5 Hari Terakhir</h2>
      <p className="text-xs text-[#6B5E54] mb-5">Total pendapatan harian dari transaksi yang valid.</p>

      <div className="grid grid-cols-5 gap-1.5 sm:gap-3 items-end h-44 pt-4">
        {dailySales.map((day) => {
          const heightPct = Math.max(
            Math.round((day.revenue / maxDaily) * 100),
            day.revenue > 0 ? 12 : 4
          );
          const valueLabel = day.revenue > 0 ? `${Math.round(day.revenue / 1000)}rb` : '0';
          return (
            <SalesBarColumn
              key={day.date}
              valueLabel={valueLabel}
              heightPct={heightPct}
              dateLabel={formatShortDate(day.date)}
            />
          );
        })}
      </div>
    </Card>
  );
}
