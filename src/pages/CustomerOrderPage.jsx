import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Flame,
  LogIn,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  UtensilsCrossed,
} from 'lucide-react';
import { menuApi, orderApi, reportApi } from '../services/api.js';
import { calculateOrderTotals, formatDateTime, formatRupiah } from '../utils/format.js';
import StatusBadge from '../components/StatusBadge.jsx';

const CATEGORIES = ['Semua', 'Makanan', 'Paket', 'Minuman', 'Tambahan'];

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

  const [trackCode, setTrackCode] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [trackError, setTrackError] = useState('');
  const [showTracker, setShowTracker] = useState(false);

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
    setError('');
    setSubmitting(true);
    try {
      const created = await orderApi.create({
        customerName,
        notes,
        items: cartItems,
      });
      setLastOrder(created);
      setCart({});
      setCustomerName('');
      setNotes('');
    } catch (err) {
      setError(err.message || 'Gagal mengirim pesanan.');
    } finally {
      setSubmitting(false);
    }
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#C84B24] text-white flex items-center justify-center shrink-0">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div className="truncate">
              <span className="font-extrabold text-base tracking-tight text-[#1F1915] block leading-none">
                PesanKu
              </span>
              <span className="text-xs text-[#6B5E54] truncate block mt-0.5">
                Warung Nasi Ayam Mak Nyus
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowTracker((v) => !v)}
              className="px-3 py-2 rounded-xl border border-[#E7DFD3] bg-white hover:bg-[#F3ECE2] text-xs sm:text-sm font-semibold text-[#1F1915] transition-colors cursor-pointer"
            >
              Lacak Pesanan
            </button>
            <button
              type="button"
              onClick={onOpenLogin}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1F1915] hover:bg-[#352C26] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Pemilik</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {showTracker && (
          <section className="mb-6 bg-white border border-[#E7DFD3] rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <h2 className="font-bold text-base text-[#1F1915]">Lacak Status Pesanan</h2>
                <p className="text-xs text-[#6B5E54]">
                  Masukkan kode pesanan Anda (contoh: <span className="font-mono font-semibold">PK-1005</span>).
                </p>
              </div>
              <form onSubmit={handleTrack} className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-52">
                  <Search className="w-4 h-4 text-[#6B5E54] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={trackCode}
                    onChange={(e) => setTrackCode(e.target.value)}
                    placeholder="Kode pesanan..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E7DFD3] text-sm focus:outline-none focus:border-[#C84B24]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#C84B24] hover:bg-[#A93B19] text-white text-sm font-semibold cursor-pointer"
                >
                  Cek
                </button>
              </form>
            </div>

            {trackError && <p className="text-sm text-rose-700 mt-2">{trackError}</p>}

            {trackedOrder && (
              <div className="mt-3 pt-3 border-t border-[#E7DFD3] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm">{trackedOrder.code}</span>
                    <StatusBadge status={trackedOrder.status} />
                  </div>
                  <p className="text-sm text-[#1F1915] font-medium mt-1">
                    {trackedOrder.customerName} — {trackedOrder.items.map((i) => `${i.name} x${i.qty}`).join(', ')}
                  </p>
                  <p className="text-xs text-[#6B5E54] mt-0.5">{formatDateTime(trackedOrder.createdAt)}</p>
                </div>
                <div className="text-left sm:text-right">
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
          <section className="mb-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
              <div>
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
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold shrink-0 cursor-pointer"
            >
              Pantau Status
            </button>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8">
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
                  onClick={() => setCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors cursor-pointer ${
                    category === cat
                      ? 'bg-[#1F1915] text-white'
                      : 'bg-white border border-[#E7DFD3] text-[#6B5E54] hover:text-[#1F1915]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {visibleMenus.map((menu) => {
                const qty = cart[menu.id] || 0;
                const isRecommended = topMenuNames.includes(menu.name);
                return (
                  <article
                    key={menu.id}
                    className={`bg-white border rounded-2xl p-4 flex flex-col justify-between transition-colors ${
                      qty > 0 ? 'border-[#C84B24]' : 'border-[#E7DFD3]'
                    } ${!menu.available ? 'opacity-60' : ''}`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B5E54]">
                          {menu.category}
                        </span>
                        {isRecommended && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 text-[#C84B24] border border-orange-200 text-[11px] font-semibold">
                            <Flame className="w-3 h-3" />
                            Favorit
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-base text-[#1F1915] mt-1">{menu.name}</h3>
                      {menu.description && (
                        <p className="text-xs text-[#6B5E54] mt-1 leading-relaxed">{menu.description}</p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#F1EAE0] flex items-center justify-between gap-2">
                      <span className="font-extrabold text-base tabular-nums text-[#1F1915]">
                        {formatRupiah(menu.price)}
                      </span>

                      {!menu.available ? (
                        <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg">
                          Habis
                        </span>
                      ) : qty === 0 ? (
                        <button
                          type="button"
                          onClick={() => updateQty(menu.id, 1)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#C84B24] text-[#1F1915] hover:text-white border border-[#E7DFD3] hover:border-[#C84B24] text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Tambah
                        </button>
                      ) : (
                        <div className="inline-flex items-center gap-2 bg-[#FAF7F2] border border-[#E7DFD3] rounded-xl p-1">
                          <button
                            type="button"
                            aria-label={`Kurangi ${menu.name}`}
                            onClick={() => updateQty(menu.id, -1)}
                            className="w-7 h-7 rounded-lg bg-white hover:bg-[#F3ECE2] flex items-center justify-center text-[#1F1915] cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center text-sm font-bold tabular-nums">{qty}</span>
                          <button
                            type="button"
                            aria-label={`Tambah ${menu.name}`}
                            onClick={() => updateQty(menu.id, 1)}
                            className="w-7 h-7 rounded-lg bg-[#C84B24] hover:bg-[#A93B19] flex items-center justify-center text-white cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <aside className="lg:col-span-4 lg:sticky lg:top-22">
            <div className="bg-white border border-[#E7DFD3] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#C84B24]" />
                  <h2 className="font-bold text-base text-[#1F1915]">Ringkasan Pesanan</h2>
                </div>
                <span className="text-xs font-semibold text-[#6B5E54] tabular-nums">
                  {totalItems} item
                </span>
              </div>

              {cartItems.length === 0 ? (
                <div className="py-8 text-center border border-dashed border-[#E7DFD3] rounded-xl mb-4">
                  <p className="text-sm font-medium text-[#6B5E54]">Keranjang masih kosong</p>
                  <p className="text-xs text-[#8C7E73] mt-1">Pilih menu di sebelah kiri untuk mulai memesan.</p>
                </div>
              ) : (
                <ul className="divide-y divide-[#F1EAE0] mb-4 max-h-60 overflow-y-auto">
                  {cartItems.map((item) => (
                    <li key={item.menuId} className="py-2.5 flex items-center justify-between gap-2 text-sm">
                      <div className="min-w-0">
                        <p className="font-semibold text-[#1F1915] truncate">{item.name}</p>
                        <p className="text-xs text-[#6B5E54] tabular-nums">
                          {item.qty} × {formatRupiah(item.price)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-bold tabular-nums">
                          {formatRupiah(item.qty * item.price)}
                        </span>
                        <button
                          type="button"
                          aria-label={`Hapus ${item.name}`}
                          onClick={() => updateQty(item.menuId, -item.qty)}
                          className="text-[#8C7E73] hover:text-rose-700 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex items-center justify-between py-3 border-t border-[#E7DFD3] mb-4">
                <span className="text-sm font-semibold text-[#6B5E54]">Total Pembayaran</span>
                <span className="text-lg font-extrabold tabular-nums text-[#C84B24]">
                  {formatRupiah(totalAmount)}
                </span>
              </div>

              <form onSubmit={handleSubmitOrder} className="space-y-3" noValidate>
                <div>
                  <label htmlFor="customer-name" className="block text-xs font-semibold text-[#1F1915] mb-1">
                    Nama Pemesan *
                  </label>
                  <input
                    id="customer-name"
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full px-3 py-2 rounded-xl border border-[#E7DFD3] text-sm focus:outline-none focus:border-[#C84B24]"
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
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Level pedas, bungkus / makan di tempat..."
                    className="w-full px-3 py-2 rounded-xl border border-[#E7DFD3] text-sm focus:outline-none focus:border-[#C84B24]"
                  />
                </div>

                {error && (
                  <div
                    role="alert"
                    className="rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-800"
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#C84B24] hover:bg-[#A93B19] disabled:opacity-60 text-white font-bold text-sm transition-colors cursor-pointer"
                >
                  {submitting ? 'Mengirim Pesanan...' : 'Kirim Pesanan'}
                </button>
              </form>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
