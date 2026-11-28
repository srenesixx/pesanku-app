import { Fragment } from 'react';
import {
  ClipboardList,
  FileSpreadsheet,
  LayoutDashboard,
  LogOut,
  Store,
  UtensilsCrossed,
} from 'lucide-react';
import { isMockMode } from '../../services/api.js';
import BrandMark from '../atoms/BrandMark.jsx';
import Button from '../atoms/Button.jsx';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'orders', label: 'Pesanan', icon: ClipboardList },
  { id: 'menus', label: 'Kelola Menu', icon: UtensilsCrossed },
  { id: 'reports', label: 'Riwayat & Laporan', icon: FileSpreadsheet },
];

export default function AdminLayout({
  activeTab,
  onSelectTab,
  user,
  onLogout,
  onOpenStorefront,
  children,
}) {
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col lg:flex-row">
      <aside className="lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-[#E7DFD3] flex flex-col shrink-0">
        <div className="px-4 sm:px-5 min-h-16 py-2 flex items-center justify-between gap-2 border-b border-[#E7DFD3]">
          <div className="flex items-center gap-2.5 min-w-0">
            {BrandMark({ size: 'sm' })}
            <div className="min-w-0">
              <span className="font-extrabold text-sm text-[#1F1915] block leading-none truncate">
                PesanKu
              </span>
              <span className="text-[11px] text-[#6B5E54] block mt-0.5 truncate">
                Panel Pemilik
              </span>
            </div>
          </div>

          <div className="lg:hidden flex items-center gap-1.5 sm:gap-2 shrink-0">
            {Button({
              variant: 'outline',
              size: 'none',
              onClick: onOpenStorefront,
              'aria-label': 'Lihat Tampilan Pembeli',
              className: 'gap-1.5 px-2.5 sm:px-3 text-xs',
              children: (
                <>
                  <Store className="w-4 h-4 text-[#6B5E54] shrink-0" aria-hidden="true" />
                  <span className="sm:hidden">Pembeli</span>
                  <span className="hidden sm:inline">Lihat Pembeli</span>
                </>
              ),
            })}
            {Button({
              variant: 'danger-ghost',
              size: 'none',
              onClick: onLogout,
              'aria-label': 'Keluar',
              className: 'gap-1.5 px-2.5 sm:px-3 text-xs',
              children: (
                <>
                  <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Keluar</span>
                </>
              ),
            })}
          </div>
        </div>

        <nav
          aria-label="Navigasi Admin"
          className="p-3 grid grid-cols-2 sm:grid-cols-4 lg:flex lg:flex-col gap-1.5 lg:gap-1"
        >
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <Fragment key={id}>
                {Button({
                  variant: active ? 'nav-active' : 'nav-idle',
                  size: 'none',
                  onClick: () => onSelectTab(id),
                  'aria-current': active ? 'page' : undefined,
                  className:
                    'lg:justify-start lg:gap-2.5 px-2.5 sm:px-3 lg:px-3.5 py-2.5 text-xs sm:text-sm leading-tight text-center lg:text-left lg:whitespace-nowrap',
                  children: (
                    <>
                      <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>{label}</span>
                    </>
                  ),
                })}
              </Fragment>
            );
          })}
        </nav>

        <div className="hidden lg:flex flex-col gap-2 mt-auto p-4 border-t border-[#E7DFD3]">
          <div className="text-xs text-[#6B5E54] px-1">
            <p className="font-semibold text-[#1F1915] truncate">{user?.name || 'Pemilik'}</p>
            <p className="truncate">{isMockMode ? 'Mode: Mock API Lokal' : 'Mode: Backend API'}</p>
          </div>
          {Button({
            variant: 'outline',
            size: 'sm',
            onClick: onOpenStorefront,
            className: 'justify-start',
            children: (
              <>
                <Store className="w-4 h-4 text-[#6B5E54] shrink-0" aria-hidden="true" />
                Lihat Tampilan Pembeli
              </>
            ),
          })}
          {Button({
            variant: 'danger-ghost',
            size: 'sm',
            onClick: onLogout,
            className: 'justify-start',
            children: (
              <>
                <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
                Keluar
              </>
            ),
          })}
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">{children}</main>
    </div>
  );
}
