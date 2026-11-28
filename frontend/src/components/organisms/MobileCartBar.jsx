import { ShoppingBag } from 'lucide-react';
import { formatRupiah } from '../../utils/format.js';
import Button from '../atoms/Button.jsx';

export default function MobileCartBar({
  totalItems = 0,
  totalAmount = 0,
  sheetOpen = false,
  triggerRef,
  onOpenSheet,
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 bg-[#FAF7F2]/95 backdrop-blur border-t border-[#E7DFD3] pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 pt-2.5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="text-xs font-semibold text-[#6B5E54] block tabular-nums">
            {totalItems} Item
          </span>
          <span className="font-extrabold text-base sm:text-lg tabular-nums text-[#A93B19] block truncate">
            {formatRupiah(totalAmount)}
          </span>
        </div>

        <Button
          ref={triggerRef}
          variant="primary"
          size="none"
          aria-expanded={sheetOpen}
          aria-controls="customer-order-sheet"
          onClick={onOpenSheet}
          className="px-4 sm:px-5 text-sm shrink-0"
        >
          <ShoppingBag className="w-4 h-4" aria-hidden="true" />
          <span>{totalItems === 0 ? 'Buka Ringkasan' : 'Lihat Pesanan'}</span>
        </Button>
      </div>
    </div>
  );
}
