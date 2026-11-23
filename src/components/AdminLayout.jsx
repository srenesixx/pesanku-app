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
        <div className="px-4 sm:px-5 min-h-16 py-2 flex items-center justify-between gap-2 border-b border-[#E7DFD3]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#C84B24] text-white flex items-center justify-center shrink-0">
              <UtensilsCrossed className="w-4 h-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <span className="font-extrabold text-sm text-[#1F1915] block leading-none truncate">PesanKu</span>
              <span className="text-[11px] text-[#6B5E54] block mt-0.5 truncate">Panel Pemilik</span>
            </div>
          </div>

          <div className="lg:hidden flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenStorefront}
              aria-label="Lihat Tampilan Pembeli"
              className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-2.5 sm:px-3 rounded-xl border border-[#E7DFD3] bg-white hover:bg-[#FAF7F2] active:bg-[#F3ECE1] text-xs font-semibold text-[#1F1915] transition-colors cursor-pointer"
            >
              <Store className="w-4 h-4 text-[#6B5E54] shrink-0" aria-hidden="true" />
              <span className="sm:hidden">Pembeli</span>
              <span className="hidden sm:inline">Lihat Pembeli</span>
            </button>
            <button
              type="button"
              onClick={onLogout}
              aria-label="Keluar"
              className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-2.5 sm:px-3 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 active:bg-rose-100 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        <nav aria-label="Navigasi Admin" className="p-3 grid grid-cols-2 sm:grid-cols-4 lg:flex lg:flex-col gap-1.5 lg:gap-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelectTab(id)}
                aria-current={active ? 'page' : undefined}
                className={`inline-flex items-center justify-center lg:justify-start gap-2 lg:gap-2.5 min-h-[44px] px-2.5 sm:px-3 lg:px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold leading-tight text-center lg:text-left lg:whitespace-nowrap transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#C84B24] text-white active:bg-[#A93B19]'
                    : 'text-[#6B5E54] hover:text-[#1F1915] hover:bg-[#FAF7F2] active:bg-[#F3ECE1]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
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
            className="inline-flex items-center gap-2 min-h-[44px] px-3 py-2 rounded-xl border border-[#E7DFD3] hover:bg-[#FAF7F2] active:bg-[#F3ECE1] text-xs font-semibold text-[#1F1915] transition-colors cursor-pointer"
          >
            <Store className="w-4 h-4 text-[#6B5E54] shrink-0" aria-hidden="true" />
            Lihat Tampilan Pembeli
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-2 min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 active:bg-rose-100 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
            Keluar
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">{children}</main>
    </div>
  );
}
