import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { menuApi, orderApi } from '../services/api.js';
import { calculateOrderTotals, formatDateTime, formatRupiah } from '../utils/format.js';
import StatusBadge from '../components/StatusBadge.jsx';
import { useOverlayDialog } from '../hooks/useOverlayDialog.js';

const STATUS_FILTERS = ['Semua', 'Menunggu', 'Diproses', 'Selesai', 'Dibatalkan'];
const STATUS_OPTIONS = ['Menunggu', 'Diproses', 'Selesai', 'Dibatalkan'];

export default function OrdersPage({
  initialOrders = [],
  initialMenus = [],
  initialModalOpen = false,
} = {}) {
  const [orders, setOrders] = useState(initialOrders);
  const [menus, setMenus] = useState(() => initialMenus.filter((m) => m.available));
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [modalOpen, setModalOpen] = useState(initialModalOpen);
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [draftCart, setDraftCart] = useState({});
  const [error, setError] = useState('');
  const newOrderTriggerRef = useRef(null);
  const dialogRef = useRef(null);
  const backdropMouseDownRef = useRef(false);

  const closeModal = useCallback(() => setModalOpen(false), []);
  useOverlayDialog(modalOpen, closeModal, newOrderTriggerRef, dialogRef);

  async function refresh() {
    const [orderList, menuList] = await Promise.all([orderApi.list(), menuApi.list()]);
    setOrders(orderList);
    setMenus(menuList.filter((m) => m.available));
  }

  useEffect(() => {
    refresh();
  }, []);

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'Semua') return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  const draftItems = useMemo(() => {
    return Object.entries(draftCart)
      .filter(([, qty]) => qty > 0)
      .map(([menuId, qty]) => {
        const menu = menus.find((m) => m.id === menuId);
        return menu ? { menuId: menu.id, name: menu.name, price: menu.price, qty } : null;
      })
      .filter(Boolean);
  }, [draftCart, menus]);

  const { totalAmount } = useMemo(() => calculateOrderTotals(draftItems), [draftItems]);

  async function handleStatusChange(orderId, nextStatus) {
    await orderApi.updateStatus(orderId, nextStatus);
    await refresh();
  }

  function adjustDraftQty(menuId, delta) {
    setError('');
    setDraftCart((prev) => {
      const next = (prev[menuId] || 0) + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[menuId];
        return copy;
      }
      return { ...prev, [menuId]: next };
    });
  }

  async function handleCreateOrder(e) {
    e.preventDefault();
    setError('');
    try {
      await orderApi.create({ customerName, notes, items: draftItems });
      setModalOpen(false);
      setCustomerName('');
      setNotes('');
      setDraftCart({});
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#1F1915]">Pencatatan Pesanan</h1>
          <p className="text-sm text-[#6B5E54] mt-0.5">
            Terima pesanan pembeli, perbarui status dapur, atau catat pesanan langsung di kasir.
          </p>
        </div>
        <button
          ref={newOrderTriggerRef}
          type="button"
          onClick={() => {
            setError('');
            setModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl bg-[#C84B24] hover:bg-[#A93B19] text-white text-sm font-bold cursor-pointer motion-reduce:transition-none transition-colors"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Catat Pesanan Baru
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((st) => (
          <button
            key={st}
            type="button"
            aria-pressed={statusFilter === st}
            onClick={() => setStatusFilter(st)}
            className={`min-h-[44px] px-4 py-2 rounded-full text-sm font-semibold motion-reduce:transition-none transition-colors cursor-pointer ${
              statusFilter === st
                ? 'bg-[#1F1915] text-white'
                : 'bg-white border border-[#E7DFD3] text-[#6B5E54] hover:text-[#1F1915]'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="bg-white border border-[#E7DFD3] rounded-2xl p-8 text-center text-sm text-[#6B5E54]">
            Belum ada pesanan dengan status ini.
          </div>
        ) : (
          filteredOrders.map((order) => (
            <article
              key={order.id}
              className="bg-white border border-[#E7DFD3] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-sm text-[#1F1915]">{order.code}</span>
                  <StatusBadge status={order.status} />
                  <span className="text-xs text-[#6B5E54]">{formatDateTime(order.createdAt)}</span>
                </div>
                <p className="font-bold text-base text-[#1F1915]">{order.customerName}</p>
                <ul className="text-sm text-[#6B5E54] space-y-0.5">
                  {order.items.map((item, idx) => (
                    <li key={`${order.id}-${idx}`} className="tabular-nums">
                      {item.name} × {item.qty}{' '}
                      <span className="text-xs text-[#6B5E54]">({formatRupiah(item.subtotal)})</span>
                    </li>
                  ))}
                </ul>
                {order.notes && (
                  <p className="text-xs text-[#6B5E54] bg-[#FAF7F2] inline-block px-2.5 py-1 rounded-lg">
                    Catatan: {order.notes}
                  </p>
                )}
              </div>

              <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-[#F1EAE0] shrink-0">
                <div className="md:text-right">
                  <span className="text-xs text-[#6B5E54] block">Total</span>
                  <span className="text-lg font-extrabold tabular-nums text-[#C84B24]">
                    {formatRupiah(order.totalAmount)}
                  </span>
                </div>

                <select
                  aria-label={`Ubah status ${order.code}`}
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  className="min-h-[44px] px-3 py-2 rounded-xl border border-[#E7DFD3] bg-[#FAF7F2] text-sm font-semibold text-[#1F1915] focus:border-[#C84B24] focus-visible:ring-2 focus-visible:ring-[#C84B24] focus-visible:ring-offset-1 cursor-pointer"
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </article>
          ))
        )}
      </div>

      {modalOpen && (
        <div
          onMouseDown={(e) => {
            backdropMouseDownRef.current = e.target === e.currentTarget;
          }}
          onClick={(e) => {
            const startedOnBackdrop = backdropMouseDownRef.current;
            backdropMouseDownRef.current = false;
            if (e.target === e.currentTarget && startedOnBackdrop) {
              closeModal();
            }
          }}
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            ref={dialogRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-modal-title"
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#E7DFD3] rounded-2xl w-full max-w-lg max-h-[90dvh] flex flex-col overflow-hidden cursor-default"
          >
            <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-[#E7DFD3]">
              <h2 id="order-modal-title" className="font-bold text-lg text-[#1F1915]">
                Catat Pesanan Baru (Kasir)
              </h2>
              <button
                type="button"
                aria-label="Tutup"
                onClick={closeModal}
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl text-[#6B5E54] hover:text-[#1F1915] hover:bg-[#FAF7F2] cursor-pointer motion-reduce:transition-none transition-colors"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="p-5 sm:p-6 space-y-4 overflow-y-auto" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="order-customer-name" className="block text-xs font-semibold text-[#1F1915] mb-1">
                    Nama Pelanggan *
                  </label>
                  <input
                    id="order-customer-name"
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Contoh: Pembeli Meja 2"
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#E7DFD3] text-sm text-[#1F1915] placeholder:text-[#6B5E54] focus:border-[#C84B24] focus-visible:ring-2 focus-visible:ring-[#C84B24] focus-visible:ring-offset-1"
                  />
                </div>
                <div>
                  <label htmlFor="order-notes" className="block text-xs font-semibold text-[#1F1915] mb-1">
                    Catatan
                  </label>
                  <input
                    id="order-notes"
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Opsional..."
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#E7DFD3] text-sm text-[#1F1915] placeholder:text-[#6B5E54] focus:border-[#C84B24] focus-visible:ring-2 focus-visible:ring-[#C84B24] focus-visible:ring-offset-1"
                  />
                </div>
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
                        <div className="inline-flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            aria-label={`Kurangi ${menu.name}`}
                            onClick={() => adjustDraftQty(menu.id, -1)}
                            className="min-w-[44px] min-h-[44px] rounded-lg border border-[#E7DFD3] flex items-center justify-center hover:bg-[#FAF7F2] cursor-pointer motion-reduce:transition-none transition-colors"
                          >
                            <Minus className="w-4 h-4" aria-hidden="true" />
                          </button>
                          <span className="w-6 text-center text-sm font-bold tabular-nums">{qty}</span>
                          <button
                            type="button"
                            aria-label={`Tambah ${menu.name}`}
                            onClick={() => adjustDraftQty(menu.id, 1)}
                            className="min-w-[44px] min-h-[44px] rounded-lg bg-[#C84B24] text-white flex items-center justify-center hover:bg-[#A93B19] cursor-pointer motion-reduce:transition-none transition-colors"
                          >
                            <Plus className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#E7DFD3]">
                <span className="text-sm font-semibold text-[#6B5E54]">Total Otomatis</span>
                <span className="text-lg font-extrabold tabular-nums text-[#C84B24]">
                  {formatRupiah(totalAmount)}
                </span>
              </div>

              {error && (
                <div role="alert" className="rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-800">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="min-h-[44px] px-4 py-2 rounded-xl border border-[#E7DFD3] text-sm font-semibold text-[#6B5E54] hover:text-[#1F1915] hover:bg-[#FAF7F2] cursor-pointer motion-reduce:transition-none transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-[#C84B24] hover:bg-[#A93B19] text-white text-sm font-bold cursor-pointer motion-reduce:transition-none transition-colors"
                >
                  Simpan Pesanan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
