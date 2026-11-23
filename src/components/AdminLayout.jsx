import {
  ClipboardList,
  FileSpreadsheet,
  LayoutDashboard,
  LogOut,
  Store,
  UtensilsCrossed,
} from 'lucide-react';
import { isMockMode } from '../services/api.js';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'orders', label: 'Pesanan', icon: ClipboardList },
  { id: 'menus', label: 'Kelola Menu', icon: UtensilsCrossed },
  { id: 'reports', label: 'Riwayat & Laporan', icon: FileSpreadsheet },
];

export default function AdminLayout({ activeTab, onSelectTab, user, onLogout, onOpenStorefront, children }) {
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col lg:flex-row">
      <aside className="lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-[#E7DFD3] flex flex-col shrink-0">
        <div className="px-5 h-16 flex items-center justify-between border-b border-[#E7DFD3]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#C84B24] text-white flex items-center justify-center shrink-0">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div className="truncate">
              <span className="font-extrabold text-sm text-[#1F1915] block leading-none">PesanKu</span>
              <span className="text-[11px] text-[#6B5E54] block mt-0.5 truncate">Panel Pemilik</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            aria-label="Keluar"
            className="lg:hidden p-2 rounded-lg text-[#6B5E54] hover:bg-[#FAF7F2] cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <nav className="p-3 flex lg:flex-col gap-1 overflow-x-auto">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelectTab(id)}
                className={`inline-flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#C84B24] text-white'
                    : 'text-[#6B5E54] hover:text-[#1F1915] hover:bg-[#FAF7F2]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="hidden lg:flex flex-col gap-2 mt-auto p-4 border-t border-[#E7DFD3]">
          <div className="text-xs text-[#6B5E54] px-1">
            <p className="font-semibold text-[#1F1915] truncate">{user?.name || 'Pemilik'}</p>
            <p className="truncate">{isMockMode ? 'Mode: Mock API Lokal' : 'Mode: Backend API'}</p>
          </div>
          <button
            type="button"
            onClick={onOpenStorefront}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[#E7DFD3] hover:bg-[#FAF7F2] text-xs font-semibold text-[#1F1915] cursor-pointer"
          >
            <Store className="w-4 h-4 text-[#6B5E54]" />
            Lihat Tampilan Pembeli
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">{children}</main>
    </div>
  );
}
