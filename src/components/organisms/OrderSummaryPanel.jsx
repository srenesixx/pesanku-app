import { ShoppingBag, X } from 'lucide-react';
import { formatRupiah } from '../../utils/format.js';
import AlertBanner from '../atoms/AlertBanner.jsx';
import Badge from '../atoms/Badge.jsx';
import Button from '../atoms/Button.jsx';
import Input from '../atoms/Input.jsx';
import EmptyState from '../molecules/EmptyState.jsx';
import FormField from '../molecules/FormField.jsx';
import QuantityStepper from '../molecules/QuantityStepper.jsx';

export default function OrderSummaryPanel({
  cartItems = [],
  totalItems = 0,
  totalAmount = 0,
  customerName = '',
  notes = '',
  error = '',
  fieldErrors = {},
  submitting = false,
  variant = 'sidebar',
  onCustomerNameChange,
  onNotesChange,
  onUpdateQty,
  onSubmit,
  onClose,
}) {
  const isSheet = variant === 'sheet';
  const nameError = fieldErrors?.customerName || '';
  const notesError = fieldErrors?.notes || '';

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
          {Badge({
            tone: 'warm',
            size: 'md',
            bordered: false,
            className: 'font-bold tabular-nums',
            children: `${totalItems} Item`,
          })}
          {isSheet &&
            Button({
              variant: 'outline',
              size: 'none',
              onClick: onClose,
              'aria-label': 'Tutup ringkasan pesanan',
              className: 'gap-1.5 px-3 text-sm hover:bg-[#F3ECE2]',
              children: (
                <>
                  <X className="w-4 h-4" aria-hidden="true" />
                  <span>Tutup</span>
                </>
              ),
            })}
        </div>
      </div>

      {cartItems.length === 0 ? (
        <div className={isSheet ? 'flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4' : 'mb-4'}>
          {EmptyState({
            title: 'Keranjang masih kosong',
            description: 'Pilih menu pada daftar menu untuk mulai memesan.',
            dashed: true,
            padding: 'none',
            className: 'rounded-xl py-8 px-4',
          })}
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
            const stepperNode = QuantityStepper({
              itemName: item.name,
              qty: item.qty,
              onDecrement: () => onUpdateQty?.(item.menuId, -1),
              onIncrement: () => onUpdateQty?.(item.menuId, 1),
            });
            const itemControls = (
              <div className="flex items-center gap-2 shrink-0">
                {Button({
                  variant: 'danger',
                  size: 'none',
                  'aria-label': `Hapus ${item.name}`,
                  onClick: () => onUpdateQty?.(item.menuId, -item.qty),
                  className: 'rounded-lg bg-[#FFF1F2] border-[#FECDD3] text-[#BE123C] px-2.5 text-xs',
                  children: 'Hapus',
                })}
                {stepperNode}
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
          {FormField({
            id: 'customer-name',
            label: 'Nama Pemesan *',
            error: nameError,
            children: Input({
              id: 'customer-name',
              type: 'text',
              required: true,
              value: customerName,
              error: nameError,
              onChange: (e) => onCustomerNameChange?.(e.target.value),
              placeholder: 'Contoh: Budi Santoso',
            }),
          })}

          {FormField({
            id: 'customer-notes',
            label: 'Catatan (opsional)',
            error: notesError,
            children: Input({
              id: 'customer-notes',
              type: 'text',
              value: notes,
              error: notesError,
              onChange: (e) => onNotesChange?.(e.target.value),
              placeholder: 'Level pedas, bungkus / makan di tempat...',
            }),
          })}
        </div>

        {error && AlertBanner({ message: error })}

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

          {Button({
            type: 'submit',
            variant: 'primary',
            size: 'none',
            disabled: submitting,
            className: isSheet
              ? 'w-full sm:w-auto sm:min-w-[180px] py-2.5 px-5 text-sm'
              : 'w-full py-2.5 px-4 text-sm',
            children: submitting ? 'Mengirim Pesanan...' : 'Kirim Pesanan',
          })}
        </div>
      </form>
    </div>
  );
}
