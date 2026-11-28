import { formatRupiah } from '../../utils/format.js';
import AlertBanner from '../atoms/AlertBanner.jsx';
import Button from '../atoms/Button.jsx';
import Input from '../atoms/Input.jsx';
import FormField from '../molecules/FormField.jsx';
import ModalDialog from '../molecules/ModalDialog.jsx';
import QuantityStepper from '../molecules/QuantityStepper.jsx';

export default function CashierOrderModal({
  open,
  menus = [],
  draftCart = {},
  customerName = '',
  notes = '',
  fieldErrors = {},
  error = '',
  totalAmount = 0,
  triggerRef,
  onCustomerNameChange,
  onNotesChange,
  onAdjustQty,
  onSubmit,
  onClose,
}) {
  return (
    <ModalDialog
      open={open}
      titleId="order-modal-title"
      title="Catat Pesanan Baru (Kasir)"
      triggerRef={triggerRef}
      onClose={onClose}
      maxWidthClass="max-w-lg"
      headerBorder={true}
    >
      <form onSubmit={onSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField id="order-customer-name" label="Nama Pelanggan *" error={fieldErrors.customerName}>
            <Input
              id="order-customer-name"
              type="text"
              value={customerName}
              error={fieldErrors.customerName}
              onChange={(e) => onCustomerNameChange?.(e.target.value)}
              placeholder="Contoh: Pembeli Meja 2"
            />
          </FormField>

          <FormField id="order-notes" label="Catatan" error={fieldErrors.notes}>
            <Input
              id="order-notes"
              type="text"
              value={notes}
              error={fieldErrors.notes}
              onChange={(e) => onNotesChange?.(e.target.value)}
              placeholder="Opsional..."
            />
          </FormField>
        </div>

        <div>
          <p className="text-xs font-semibold text-[#1F1915] mb-2">Pilih Menu *</p>
          <div className="divide-y divide-[#F1EAE0] border border-[#E7DFD3] rounded-xl max-h-56 overflow-y-auto">
            {menus.map((menu) => {
              const qty = draftCart[menu.id] || 0;
              return (
                <div key={menu.id} className="px-3.5 py-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1F1915] truncate">{menu.name}</p>
                    <p className="text-xs text-[#6B5E54] tabular-nums">{formatRupiah(menu.price)}</p>
                  </div>
                  <QuantityStepper
                    itemName={menu.name}
                    qty={qty}
                    variant="plain"
                    onDecrement={() => onAdjustQty?.(menu.id, -1)}
                    onIncrement={() => onAdjustQty?.(menu.id, 1)}
                  />
                </div>
              );
            })}
          </div>
          {fieldErrors.items && (
            <p className="text-xs text-rose-700 mt-1">{fieldErrors.items}</p>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#E7DFD3]">
          <span className="text-sm font-semibold text-[#6B5E54]">Total Otomatis</span>
          <span className="text-lg font-extrabold tabular-nums text-[#C84B24]">
            {formatRupiah(totalAmount)}
          </span>
        </div>

        {error && <AlertBanner message={error} />}

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} className="py-2">
            Batal
          </Button>
          <Button type="submit" variant="primary" className="py-2">
            Simpan Pesanan
          </Button>
        </div>
      </form>
    </ModalDialog>
  );
}
