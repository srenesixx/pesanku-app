import { formatRupiah } from '../../utils/format.js';
import Card from '../atoms/Card.jsx';
import LeaderboardRow from '../molecules/LeaderboardRow.jsx';

export default function TopMenusCard({ topMenus = [] }) {
  return (
    <Card as="section" padding="md" className="lg:col-span-5">
      <h2 className="font-bold text-base text-[#1F1915] mb-1">Menu Terlaris</h2>
      <p className="text-xs text-[#6B5E54] mb-4">Urutan berdasarkan jumlah porsi terjual.</p>

      {topMenus.length === 0 ? (
        <p className="text-sm text-[#6B5E54]">Belum ada data penjualan.</p>
      ) : (
        <ul className="space-y-3">
          {topMenus.map((item, idx) => (
            <LeaderboardRow
              key={item.name}
              rank={idx + 1}
              name={item.name}
              subLabel={`${item.qty} porsi`}
              rightLabel={formatRupiah(item.revenue)}
            />
          ))}
        </ul>
      )}
    </Card>
  );
}
