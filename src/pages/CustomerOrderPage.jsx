import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  Flame,
  LogIn,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  UtensilsCrossed,
} from 'lucide-react';
import { menuApi, orderApi, reportApi } from '../services/api.js';
import { calculateOrderTotals, formatDateTime, formatRupiah } from '../utils/format.js';
import StatusBadge from '../components/StatusBadge.jsx';
import OrderSummaryPanel from '../components/OrderSummaryPanel.jsx';
import { useOverlayDialog } from '../hooks/useOverlayDialog.js';

const CATEGORIES = ['Semua', 'Makanan', 'Paket', 'Minuman', 'Tambahan'];

export function subscribeMediaQuery(
  query,
  onChange,
  win = typeof window !== 'undefined' ? window : undefined
) {
  if (!win || typeof win.matchMedia !== 'function') {
    return { matches: false, unsubscribe: () => {} };
  }
  const mediaQuery = win.matchMedia(query);
  const handleChange = (event) => onChange(event.matches);
  mediaQuery.addEventListener('change', handleChange);
  return {
    matches: Boolean(mediaQuery.matches),
    unsubscribe: () => mediaQuery.removeEventListener('change', handleChange),
  };
}

export async function submitCustomerOrder({
  createOrder,
  customerName,
  notes,
  cartItems,
  setError,
  setSubmitting,
  setLastOrder,
  setCart,
  setCustomerName,
  setNotes,
  setSheetOpen,
}) {
  setError('');
  setSubmitting(true);
  try {
    const created = await createOrder({
      customerName,
      notes,
      items: cartItems,
    });
    setLastOrder(created);
    setCart({});
    setCustomerName('');
    setNotes('');
    setSheetOpen(false);
    return created;
  } catch (err) {
    setError(err.message || 'Gagal mengirim pesanan.');
    return null;
  } finally {
    setSubmitting(false);
  }
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }
    return Boolean(window.matchMedia(query).matches);
  });

  useEffect(() => {
    const { matches: currentMatches, unsubscribe } = subscribeMediaQuery(query, setMatches);
    setMatches(currentMatches);
    return unsubscribe;
  }, [query]);

  return matches;
}

export default function CustomerOrderPage({ onOpenLogin }) {
  const [menus, setMenus] = useState([]);
  const [topMenuNames, setTopMenuNames] = useState([]);
  const [category, setCategory] = useState('Semua');
  const [cart, setCart] = useState({});
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const [trackCode, setTrackCode] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [trackError, setTrackError] = useState('');
  const [showTracker, setShowTracker] = useState(false);

  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const summaryTriggerRef = useRef(null);

  useOverlayDialog(sheetOpen && !isDesktop, () => setSheetOpen(false), summaryTriggerRef);

  useEffect(() => {
    if (isDesktop && sheetOpen) {
      setSheetOpen(false);
    }
  }, [isDesktop, sheetOpen]);

  useEffect(() => {
    Promise.all([menuApi.list(), reportApi.getDashboardSummary()]).then(([menuList, summary]) => {
      setMenus(menuList);
      setTopMenuNames((summary.topMenus || []).slice(0, 2).map((m) => m.name));
    });
  }, []);

  const visibleMenus = useMemo(() => {
    if (category === 'Semua') return menus;
    return menus.filter((m) => m.category === category);
  }, [menus, category]);

  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([menuId, qty]) => {
        const menu = menus.find((m) => m.id === menuId);
        if (!menu) return null;
        return { menuId: menu.id, name: menu.name, price: menu.price, qty };
      })
      .filter(Boolean);
  }, [cart, menus]);

  const { totalItems, totalAmount } = useMemo(() => calculateOrderTotals(cartItems), [cartItems]);

  function updateQty(menuId, delta) {
    setError('');
    setCart((prev) => {
      const nextQty = (prev[menuId] || 0) + delta;
      if (nextQty <= 0) {
        const copy = { ...prev };
        delete copy[menuId];
        return copy;
      }
      return { ...prev, [menuId]: nextQty };
    });
  }

  async function handleSubmitOrder(e) {
    e.preventDefault();
    await submitCustomerOrder({
      createOrder: orderApi.create,
      customerName,
      notes,
      cartItems,
      setError,
      setSubmitting,
      setLastOrder,
      setCart,
      setCustomerName,
      setNotes,
      setSheetOpen,
    });
  }

  async function handleTrack(e) {
    e.preventDefault();
    setTrackError('');
    setTrackedOrder(null);
    try {
      const order = await orderApi.getByCode(trackCode);
      setTrackedOrder(order);
    } catch (err) {
      setTrackError(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <header className="sticky top-0 z-20 bg-[#FAF7F2]/95 backdrop-blur border-b border-[#E7DFD3]">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 min-h-16 py-2 flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#C84B24] text-white flex items-center justify-center shrink-0">
              <UtensilsCrossed className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
            </div>
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
            <button
              type="button"
              aria-expanded={showTracker}
              onClick={() => setShowTracker((v) => !v)}
              className="min-h-[44px] px-2 sm:px-3 py-2 rounded-xl border border-[#E7DFD3] bg-white hover:bg-[#F3ECE2] text-xs sm:text-sm font-semibold text-[#1F1915] motion-reduce:transition-none transition-colors whitespace-nowrap"
            >
              Lacak Pesanan
            </button>
            <button
              type="button"
              onClick={onOpenLogin}
              className="min-h-[44px] inline-flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-xl bg-[#1F1915] hover:bg-[#352C26] text-white text-xs sm:text-sm font-semibold motion-reduce:transition-none transition-colors whitespace-nowrap shrink-0"
            >
              <LogIn className="w-4 h-4" aria-hidden="true" />
              <span>Pemilik</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3.5 sm:px-6 pt-6 sm:pt-8 pb-28 lg:pb-8">
        {showTracker && (
          <section className="mb-6 bg-white border border-[#E7DFD3] rounded-2xl p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <h2 className="font-bold text-base text-[#1F1915]">Lacak Status Pesanan</h2>
                <p className="text-xs text-[#6B5E54]">
                  Masukkan kode pesanan Anda (contoh: <span className="font-mono font-semibold">PK-1005</span>).
                </p>
              </div>
              <form onSubmit={handleTrack} className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-52">
                  <label htmlFor="track-order-code" className="sr-only">
                    Kode pesanan
                  </label>
                  <Search
                    className="w-4 h-4 text-[#6B5E54] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="track-order-code"
                    type="text"
                    value={trackCode}
                    onChange={(e) => setTrackCode(e.target.value)}
                    placeholder="Kode pesanan..."
                    className="w-full min-h-[44px] pl-9 pr-3 py-2 rounded-xl border border-[#E7DFD3] text-sm text-[#1F1915] placeholder:text-[#6B5E54] focus:border-[#C84B24] focus-visible:ring-2 focus-visible:ring-[#C84B24]/30"
                  />
                </div>
                <button
                  type="submit"
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-[#C84B24] hover:bg-[#A93B19] text-white text-sm font-semibold shrink-0 motion-reduce:transition-none transition-colors"
                >
                  Cek
                </button>
              </form>
            </div>

            {trackError && (
              <p role="alert" className="text-sm text-rose-700 mt-2">
                {trackError}
              </p>
            )}

            {trackedOrder && (
              <div className="mt-3 pt-3 border-t border-[#E7DFD3] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-sm text-[#1F1915]">
                      {trackedOrder.code}
                    </span>
                    <StatusBadge status={trackedOrder.status} />
                  </div>
                  <p className="text-sm text-[#1F1915] font-medium mt-1 break-words">
                    {trackedOrder.customerName}:{' '}
                    {trackedOrder.items.map((i) => `${i.name} x${i.qty}`).join(', ')}
                  </p>
                  <p className="text-xs text-[#6B5E54] mt-0.5">{formatDateTime(trackedOrder.createdAt)}</p>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <span className="text-xs text-[#6B5E54] block">Total</span>
                  <span className="font-bold text-base tabular-nums text-[#C84B24]">
                    {formatRupiah(trackedOrder.totalAmount)}
                  </span>
                </div>
              </div>
            )}
          </section>
        )}

        {lastOrder && (
          <section className="mb-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="min-w-0">
                <h2 className="font-bold text-emerald-950">Pesanan Berhasil Dikirim!</h2>
                <p className="text-sm text-emerald-900 mt-0.5">
                  Kode pesanan Anda: <span className="font-mono font-bold">{lastOrder.code}</span> • Total{' '}
                  <span className="font-bold tabular-nums">{formatRupiah(lastOrder.totalAmount)}</span>
                </p>
                <p className="text-xs text-emerald-800 mt-1">
                  Simpan kode pesanan untuk memantau status pembuatan di Warung Mak Nyus.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setTrackCode(lastOrder.code);
                setTrackedOrder(lastOrder);
                setShowTracker(true);
                setLastOrder(null);
              }}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold shrink-0 motion-reduce:transition-none transition-colors"
            >
              Pantau Status
            </button>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 min-w-0">
            <div className="mb-5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1F1915]">
                Daftar Menu Hari Ini
              </h1>
              <p className="text-sm text-[#6B5E54] mt-1">
                Pilih makanan dan minuman favorit Anda, pesanan langsung tercatat ke dapur.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 mb-5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  aria-pressed={category === cat}
                  onClick={() => setCategory(cat)}
                  className={`min-h-[44px] px-4 py-2 rounded-full text-sm font-semibold motion-reduce:transition-none transition-colors ${
                    category === cat
                      ? 'bg-[#1F1915] text-white'
                      : 'bg-white border border-[#E7DFD3] text-[#6B5E54] hover:text-[#1F1915]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {visibleMenus.length === 0 ? (
              <div className="bg-white border border-dashed border-[#E7DFD3] rounded-2xl p-8 text-center">
                <p className="text-sm font-semibold text-[#1F1915]">Belum ada menu pada kategori ini</p>
                <p className="text-xs text-[#6B5E54] mt-1">
                  Pilih kategori lain untuk melihat menu yang tersedia.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                {visibleMenus.map((menu) => {
                  const qty = cart[menu.id] || 0;
                  const isRecommended = topMenuNames.includes(menu.name);
                  return (
                    <article
                      key={menu.id}
                      className={`bg-white border rounded-2xl p-4 flex flex-col justify-between motion-reduce:transition-none transition-colors ${
                        qty > 0 ? 'border-[#C84B24]' : 'border-[#E7DFD3]'
                      } ${!menu.available ? 'opacity-60' : ''}`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B5E54]">
                            {menu.category}
                          </span>
                          {isRecommended && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFF3E8] text-[#A93B19] border border-[#F3D2BA] text-[11px] font-semibold">
                              <Flame className="w-3 h-3" aria-hidden="true" />
                              Favorit
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-base text-[#1F1915] mt-1 break-words">
                          {menu.name}
                        </h3>
                        {menu.description && (
                          <p className="text-xs text-[#6B5E54] mt-1 leading-relaxed">{menu.description}</p>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#F1EAE0] flex flex-wrap items-center justify-between gap-2">
                        <span className="font-extrabold text-base tabular-nums text-[#1F1915]">
                          {formatRupiah(menu.price)}
                        </span>

                        {!menu.available ? (
                          <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1.5 rounded-lg">
                            Habis
                          </span>
                        ) : qty === 0 ? (
                          <button
                            type="button"
                            onClick={() => updateQty(menu.id, 1)}
                            className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#C84B24] text-[#1F1915] hover:text-white border border-[#E7DFD3] hover:border-[#C84B24] text-xs sm:text-sm font-bold motion-reduce:transition-none transition-colors"
                          >
                            <Plus className="w-4 h-4" aria-hidden="true" />
                            Tambah
                          </button>
                        ) : (
                          <div className="inline-flex items-center gap-1 bg-[#FAF7F2] border border-[#E7DFD3] rounded-xl p-0.5">
                            <button
                              type="button"
                              aria-label={`Kurangi ${menu.name}`}
                              onClick={() => updateQty(menu.id, -1)}
                              className="min-w-[44px] min-h-[44px] rounded-lg bg-white hover:bg-[#F3ECE2] flex items-center justify-center text-[#1F1915] motion-reduce:transition-none transition-colors"
                            >
                              <Minus className="w-4 h-4" aria-hidden="true" />
                            </button>
                            <span className="min-w-[24px] text-center text-sm font-bold tabular-nums text-[#1F1915]">
                              {qty}
                            </span>
                            <button
                              type="button"
                              aria-label={`Tambah ${menu.name}`}
                              onClick={() => updateQty(menu.id, 1)}
                              className="min-w-[44px] min-h-[44px] rounded-lg bg-[#C84B24] hover:bg-[#A93B19] flex items-center justify-center text-white motion-reduce:transition-none transition-colors"
                            >
                              <Plus className="w-4 h-4" aria-hidden="true" />
                            </button>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {isDesktop && (
            <aside className="lg:col-span-4 lg:sticky lg:top-22">
              <OrderSummaryPanel
                cartItems={cartItems}
                totalItems={totalItems}
                totalAmount={totalAmount}
                customerName={customerName}
                notes={notes}
                error={error}
                submitting={submitting}
                variant="sidebar"
                onCustomerNameChange={setCustomerName}
                onNotesChange={setNotes}
                onUpdateQty={updateQty}
                onSubmit={handleSubmitOrder}
              />
            </aside>
          )}
        </div>
      </main>

      {!isDesktop && (
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

            <button
              ref={summaryTriggerRef}
              type="button"
              aria-expanded={sheetOpen}
              aria-controls="customer-order-sheet"
              onClick={() => setSheetOpen(true)}
              className="min-h-[44px] px-4 sm:px-5 rounded-xl bg-[#C84B24] hover:bg-[#A93B19] text-white text-sm font-bold inline-flex items-center gap-2 shrink-0 motion-reduce:transition-none transition-colors"
            >
              <ShoppingBag className="w-4 h-4" aria-hidden="true" />
              <span>{totalItems === 0 ? 'Buka Ringkasan' : 'Lihat Pesanan'}</span>
            </button>
          </div>
        </div>
      )}

      {!isDesktop && sheetOpen && (
        <>
          <div
            aria-hidden="true"
            onClick={() => setSheetOpen(false)}
            className="fixed inset-0 z-40 bg-black/40"
          />
          <div
            id="customer-order-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Pesanan Anda"
            className="fixed inset-x-0 bottom-0 z-50 w-full max-w-4xl mx-auto bg-white rounded-t-2xl border border-b-0 border-[#E7DFD3] max-h-[85dvh] flex flex-col overflow-hidden shadow-2xl pb-[env(safe-area-inset-bottom)]"
          >
            <OrderSummaryPanel
              cartItems={cartItems}
              totalItems={totalItems}
              totalAmount={totalAmount}
              customerName={customerName}
              notes={notes}
              error={error}
              submitting={submitting}
              variant="sheet"
              onCustomerNameChange={setCustomerName}
              onNotesChange={setNotes}
              onUpdateQty={updateQty}
              onSubmit={handleSubmitOrder}
              onClose={() => setSheetOpen(false)}
            />
          </div>
        </>
      )}
    </div>
  );
}
