import { Minus, Plus, ShoppingBag, X } from 'lucide-react';
import { formatRupiah } from '../utils/format.js';

export default function OrderSummaryPanel({
  cartItems = [],
  totalItems = 0,
  totalAmount = 0,
  customerName = '',
  notes = '',
  error = '',
  submitting = false,
  variant = 'sidebar',
  onCustomerNameChange,
  onNotesChange,
  onUpdateQty,
  onSubmit,
  onClose,
}) {
  const isSheet = variant === 'sheet';

  return (
    <div
      className={
        isSheet
          ? 'flex flex-col flex-1 min-h-0 overflow-y-auto'
          : 'bg-white border border-[#E7DFD3] rounded-2xl p-5'
      }
    >
      <div
        className={
          isSheet
            ? 'px-4 sm:px-6 py-3.5 border-b border-[#E7DFD3] shrink-0 flex items-center justify-between gap-3'
            : 'flex items-center justify-between gap-3 mb-4'
        }
      >
        <div className="flex items-center gap-2 min-w-0">
          <ShoppingBag className="w-5 h-5 text-[#C84B24] shrink-0" aria-hidden="true" />
          <h2 className="font-bold text-base text-[#1F1915] truncate">Pesanan Anda</h2>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="bg-[#FFF3E8] text-[#A93B19] text-xs font-bold px-2.5 py-1 rounded-full tabular-nums">
            {totalItems} Item
          </span>
          {isSheet && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup ringkasan pesanan"
              className="min-h-[44px] px-3 rounded-xl border border-[#E7DFD3] bg-white hover:bg-[#F3ECE2] text-sm font-semibold text-[#1F1915] inline-flex items-center gap-1.5 motion-reduce:transition-none transition-colors"
            >
              <X className="w-4 h-4" aria-hidden="true" />
              <span>Tutup</span>
            </button>
          )}
        </div>
      </div>

      {cartItems.length === 0 ? (
        <div className={isSheet ? 'flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4' : 'mb-4'}>
          <div className="py-8 px-4 text-center border border-dashed border-[#E7DFD3] rounded-xl">
            <p className="text-sm font-semibold text-[#1F1915]">Keranjang masih kosong</p>
            <p className="text-xs text-[#6B5E54] mt-1">
              Pilih menu pada daftar menu untuk mulai memesan.
            </p>
          </div>
        </div>
      ) : (
        <ul
          className={
            isSheet
              ? 'flex-1 min-h-0 overflow-y-auto divide-y divide-[#F1EAE0] px-4 sm:px-6'
              : 'divide-y divide-[#F1EAE0] mb-4 max-h-72 overflow-y-auto -mx-1 px-1 py-0.5'
          }
        >
          {cartItems.map((item) => {
            const subtotal = item.qty * item.price;
            const itemControls = (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  aria-label={`Hapus ${item.name}`}
                  onClick={() => onUpdateQty?.(item.menuId, -item.qty)}
                  className="min-h-[44px] px-2.5 rounded-lg bg-[#FFF1F2] hover:bg-rose-100 border border-[#FECDD3] text-[#BE123C] text-xs font-semibold motion-reduce:transition-none transition-colors"
                >
                  Hapus
                </button>
                <div className="inline-flex items-center gap-1 bg-[#FAF7F2] border border-[#E7DFD3] rounded-xl p-0.5">
                  <button
                    type="button"
                    aria-label={`Kurangi ${item.name}`}
                    onClick={() => onUpdateQty?.(item.menuId, -1)}
                    className="min-w-[44px] min-h-[44px] rounded-lg bg-white hover:bg-[#F3ECE2] flex items-center justify-center text-[#1F1915] motion-reduce:transition-none transition-colors"
                  >
                    <Minus className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <span className="min-w-[24px] text-center text-sm font-bold tabular-nums text-[#1F1915]">
                    {item.qty}
                  </span>
                  <button
                    type="button"
                    aria-label={`Tambah ${item.name}`}
                    onClick={() => onUpdateQty?.(item.menuId, 1)}
                    className="min-w-[44px] min-h-[44px] rounded-lg bg-[#C84B24] hover:bg-[#A93B19] flex items-center justify-center text-white motion-reduce:transition-none transition-colors"
                  >
                    <Plus className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            );

            return (
              <li key={item.menuId} className="py-3">
                <div
                  className={
                    isSheet
                      ? 'flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4'
                      : 'flex flex-col gap-2'
                  }
                >
                  <div className="min-w-0 flex-1">
                    <div
                      className={
                        isSheet
                          ? 'flex items-start justify-between gap-3 sm:block'
                          : 'flex items-start justify-between gap-3'
                      }
                    >
                      <p className="font-semibold text-sm text-[#1F1915] break-words min-w-0">
                        {item.name}
                      </p>
                      <span
                        className={
                          isSheet
                            ? 'font-bold text-sm text-[#C84B24] tabular-nums shrink-0 sm:hidden'
                            : 'font-bold text-sm text-[#C84B24] tabular-nums shrink-0'
                        }
                      >
                        {formatRupiah(subtotal)}
                      </span>
                    </div>
                    {isSheet && (
                      <p className="hidden sm:block text-xs text-[#6B5E54] tabular-nums mt-0.5">
                        <span className="font-bold text-[#C84B24]">{formatRupiah(subtotal)}</span> (
                        {item.qty} × {formatRupiah(item.price)})
                      </p>
                    )}
                  </div>

                  <div
                    className={
                      isSheet
                        ? 'flex flex-wrap items-center justify-between gap-2 sm:justify-end shrink-0'
                        : 'flex flex-wrap items-center justify-between gap-2'
                    }
                  >
                    <span
                      className={
                        isSheet
                          ? 'text-xs text-[#6B5E54] tabular-nums sm:hidden'
                          : 'text-xs text-[#6B5E54] tabular-nums'
                      }
                    >
                      {item.qty} × {formatRupiah(item.price)}
                    </span>
                    {itemControls}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <form
        onSubmit={onSubmit}
        noValidate
        className={
          isSheet
            ? 'shrink-0 border-t border-[#E7DFD3] bg-white px-4 sm:px-6 py-3.5 space-y-3'
            : 'border-t border-[#E7DFD3] pt-4 space-y-3'
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
          <div>
            <label htmlFor="customer-name" className="block text-xs font-semibold text-[#1F1915] mb-1">
              Nama Pemesan *
            </label>
            <input
              id="customer-name"
              type="text"
              required
              value={customerName}
              onChange={(e) => onCustomerNameChange?.(e.target.value)}
              placeholder="Contoh: Budi Santoso"
              className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#E7DFD3] bg-white text-sm text-[#1F1915] placeholder:text-[#6B5E54] focus:border-[#C84B24] focus-visible:ring-2 focus-visible:ring-[#C84B24]/30"
            />
          </div>

          <div>
            <label htmlFor="customer-notes" className="block text-xs font-semibold text-[#1F1915] mb-1">
              Catatan (opsional)
            </label>
            <input
              id="customer-notes"
              type="text"
              value={notes}
              onChange={(e) => onNotesChange?.(e.target.value)}
              placeholder="Level pedas, bungkus / makan di tempat..."
              className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#E7DFD3] bg-white text-sm text-[#1F1915] placeholder:text-[#6B5E54] focus:border-[#C84B24] focus-visible:ring-2 focus-visible:ring-[#C84B24]/30"
            />
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-800"
          >
            {error}
          </div>
        )}

        <div className={isSheet ? 'flex flex-col sm:flex-row sm:items-center gap-3' : 'flex flex-col gap-3'}>
          <div
            className={
              isSheet
                ? 'flex items-center justify-between gap-3 sm:flex-1 rounded-xl bg-[#FAF7F2] border border-[#E7DFD3] px-3.5 py-2.5 min-h-[44px]'
                : 'flex items-center justify-between gap-3 rounded-xl bg-[#FAF7F2] border border-[#E7DFD3] px-3.5 py-2.5'
            }
          >
            <span className="text-xs sm:text-sm font-semibold text-[#6B5E54]">
              Total Pembayaran ({totalItems} Item)
            </span>
            <span className="text-base sm:text-lg font-extrabold tabular-nums text-[#A93B19] shrink-0">
              {formatRupiah(totalAmount)}
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={
              isSheet
                ? 'w-full sm:w-auto sm:min-w-[180px] min-h-[44px] py-2.5 px-5 rounded-xl bg-[#C84B24] hover:bg-[#A93B19] disabled:opacity-60 text-white font-bold text-sm motion-reduce:transition-none transition-colors'
                : 'w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-[#C84B24] hover:bg-[#A93B19] disabled:opacity-60 text-white font-bold text-sm motion-reduce:transition-none transition-colors'
            }
          >
            {submitting ? 'Mengirim Pesanan...' : 'Kirim Pesanan'}
          </button>
        </div>
      </form>
    </div>
  );
}
