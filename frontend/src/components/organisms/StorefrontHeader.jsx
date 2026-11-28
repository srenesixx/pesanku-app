import { LogIn } from 'lucide-react';
import BrandMark from '../atoms/BrandMark.jsx';
import Button from '../atoms/Button.jsx';

export default function StorefrontHeader({ showTracker = false, onToggleTracker, onOpenLogin }) {
  return (
    <header className="sticky top-0 z-20 bg-[#FAF7F2]/95 backdrop-blur border-b border-[#E7DFD3]">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 min-h-16 py-2 flex items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <BrandMark size="responsive" />
          <div className="min-w-0">
            <span className="font-extrabold text-sm sm:text-base tracking-tight text-[#1F1915] block leading-none truncate">
              PesanKu
            </span>
            <span className="text-xs text-[#6B5E54] truncate block mt-0.5">
              Warung Nasi Ayam Mak Nyus
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Button
            variant="outline"
            size="none"
            aria-expanded={showTracker}
            onClick={onToggleTracker}
            className="px-2 sm:px-3 py-2 text-xs sm:text-sm hover:bg-[#F3ECE2] whitespace-nowrap"
          >
            Lacak Pesanan
          </Button>
          <Button
            variant="dark"
            size="none"
            onClick={onOpenLogin}
            className="gap-1.5 px-2 sm:px-3 py-2 text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0"
          >
            <LogIn className="w-4 h-4" aria-hidden="true" />
            <span>Pemilik</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
