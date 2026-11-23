import { useCallback, useEffect, useRef, useState } from 'react';
import { Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { menuApi } from '../services/api.js';
import { formatRupiah } from '../utils/format.js';
import { useOverlayDialog } from '../hooks/useOverlayDialog.js';

const CATEGORIES = ['Makanan', 'Paket', 'Minuman', 'Tambahan'];

const EMPTY_FORM = {
  name: '',
  category: 'Makanan',
  price: '',
  description: '',
  available: true,
};

const INPUT_CLASS =
  'w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#E7DFD3] bg-white text-sm text-[#1F1915] placeholder:text-[#6B5E54] focus:border-[#C84B24] focus-visible:ring-2 focus-visible:ring-[#C84B24]/30';

function getAvailabilityButtonClass(available) {
  const tone = available
    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
    : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100';
  return `min-h-[44px] px-3.5 py-2 rounded-full text-xs font-semibold border cursor-pointer motion-reduce:transition-none transition-colors ${tone}`;
}

export default function MenuManagementPage({ initialMenus = [], initialModalOpen = false } = {}) {
  const [menus, setMenus] = useState(initialMenus);
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(initialModalOpen);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const lastTriggerRef = useRef(null);
  const handleCloseModal = useCallback(() => setModalOpen(false), []);

  useOverlayDialog(modalOpen, handleCloseModal, lastTriggerRef);

  async function refresh() {
    const list = await menuApi.list();
    setMenus(list);
  }

  useEffect(() => {
    refresh();
  }, []);

  function openCreate(e) {
    lastTriggerRef.current = e?.currentTarget || null;
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
    setModalOpen(true);
  }

  function openEdit(menu, e) {
    lastTriggerRef.current = e?.currentTarget || null;
    setEditingId(menu.id);
    setForm({
      name: menu.name,
      category: menu.category,
      price: String(menu.price),
      description: menu.description || '',
      available: menu.available,
    });
    setError('');
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        name: form.name,
        category: form.category,
        price: Number(form.price),
        description: form.description,
        available: form.available,
      };
      if (editingId) {
        await menuApi.update(editingId, payload);
      } else {
        await menuApi.create(payload);
      }
      setModalOpen(false);
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleToggleAvailable(menu) {
    await menuApi.update(menu.id, { available: !menu.available });
    await refresh();
  }

  async function handleDelete(menu) {
    if (!window.confirm(`Hapus menu "${menu.name}"?`)) return;
    await menuApi.remove(menu.id);
    await refresh();
  }

  const filtered = menus.filter((m) =>
    m.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#1F1915]">Pengelolaan Menu</h1>
          <p className="text-sm text-[#6B5E54] mt-0.5">
            Tambah, ubah harga, atur ketersediaan, atau hapus menu warung.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl bg-[#C84B24] hover:bg-[#A93B19] text-white text-sm font-bold cursor-pointer motion-reduce:transition-none transition-colors"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Tambah Menu
        </button>
      </div>

      <div className="relative max-w-sm">
        <label htmlFor="menu-search" className="sr-only">
          Cari nama menu
        </label>
        <Search
          className="w-4 h-4 text-[#6B5E54] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          aria-hidden="true"
        />
        <input
          id="menu-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari nama menu..."
          className="w-full min-h-[44px] pl-10 pr-3.5 py-2 rounded-xl border border-[#E7DFD3] bg-white text-sm text-[#1F1915] placeholder:text-[#6B5E54] focus:border-[#C84B24] focus-visible:ring-2 focus-visible:ring-[#C84B24]/30"
        />
      </div>

      <div className="space-y-3 md:hidden">
        {filtered.length === 0 ? (
          <div className="bg-white border border-[#E7DFD3] rounded-2xl p-6 text-center text-sm text-[#6B5E54]">
            Tidak ada menu yang cocok.
          </div>
        ) : (
          filtered.map((menu) => (
            <article
              key={menu.id}
              className="bg-white border border-[#E7DFD3] rounded-2xl p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-[#1F1915] break-words">{menu.name}</p>
                  <p className="text-xs font-medium text-[#6B5E54] mt-0.5">{menu.category}</p>
                </div>
                <p className="font-bold text-sm text-[#1F1915] tabular-nums shrink-0">
                  {formatRupiah(menu.price)}
                </p>
              </div>

              {menu.description && (
                <p className="text-xs text-[#6B5E54] break-words">{menu.description}</p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#F1EAE0]">
                <button
                  type="button"
                  onClick={() => handleToggleAvailable(menu)}
                  className={getAvailabilityButtonClass(menu.available)}
                >
                  {menu.available ? 'Tersedia' : 'Habis'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label={`Ubah ${menu.name}`}
                    onClick={(e) => openEdit(menu, e)}
                    className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl border border-[#E7DFD3] text-xs font-semibold text-[#1F1915] hover:bg-[#FAF7F2] inline-flex items-center justify-center gap-1.5 cursor-pointer motion-reduce:transition-none transition-colors"
                  >
                    <Pencil className="w-4 h-4" aria-hidden="true" />
                    <span>Ubah</span>
                  </button>
                  <button
                    type="button"
                    aria-label={`Hapus ${menu.name}`}
                    onClick={() => handleDelete(menu)}
                    className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 text-xs font-semibold text-rose-800 hover:bg-rose-100 inline-flex items-center justify-center gap-1.5 cursor-pointer motion-reduce:transition-none transition-colors"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="hidden md:block bg-white border border-[#E7DFD3] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E7DFD3] bg-[#FAF7F2] text-xs font-bold uppercase tracking-wider text-[#6B5E54]">
                <th className="py-3 px-4">Menu</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4 text-right">Harga</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1EAE0] text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#6B5E54]">
                    Tidak ada menu yang cocok.
                  </td>
                </tr>
              ) : (
                filtered.map((menu) => (
                  <tr key={menu.id} className="hover:bg-[#FAF7F2]/60">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[#1F1915]">{menu.name}</p>
                      {menu.description && (
                        <p className="text-xs text-[#6B5E54] mt-0.5 line-clamp-1">{menu.description}</p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[#6B5E54]">{menu.category}</td>
                    <td className="py-3.5 px-4 text-right font-bold tabular-nums text-[#1F1915]">
                      {formatRupiah(menu.price)}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleAvailable(menu)}
                        className={getAvailabilityButtonClass(menu.available)}
                      >
                        {menu.available ? 'Tersedia' : 'Habis'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          aria-label={`Ubah ${menu.name}`}
                          onClick={(e) => openEdit(menu, e)}
                          className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center p-2 rounded-lg text-[#6B5E54] hover:text-[#1F1915] hover:bg-[#F1EAE0] cursor-pointer motion-reduce:transition-none transition-colors"
                        >
                          <Pencil className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Hapus ${menu.name}`}
                          onClick={() => handleDelete(menu)}
                          className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center p-2 rounded-lg text-[#6B5E54] hover:text-rose-700 hover:bg-rose-50 cursor-pointer motion-reduce:transition-none transition-colors"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={handleCloseModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="menu-modal-title"
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#E7DFD3] rounded-2xl w-full max-w-md max-h-[90dvh] overflow-y-auto p-5 sm:p-6"
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 id="menu-modal-title" className="font-bold text-lg text-[#1F1915]">
                {editingId ? 'Ubah Menu' : 'Tambah Menu Baru'}
              </h2>
              <button
                type="button"
                aria-label="Tutup"
                onClick={handleCloseModal}
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl text-[#6B5E54] hover:text-[#1F1915] hover:bg-[#FAF7F2] cursor-pointer motion-reduce:transition-none transition-colors"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4" noValidate>
              <div>
                <label htmlFor="menu-name" className="block text-xs font-semibold text-[#1F1915] mb-1">
                  Nama Menu *
                </label>
                <input
                  id="menu-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Contoh: Ayam Geprek Sambal Ijo"
                  className={INPUT_CLASS}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="menu-category" className="block text-xs font-semibold text-[#1F1915] mb-1">
                    Kategori
                  </label>
                  <select
                    id="menu-category"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className={INPUT_CLASS}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="menu-price" className="block text-xs font-semibold text-[#1F1915] mb-1">
                    Harga (Rp) *
                  </label>
                  <input
                    id="menu-price"
                    type="number"
                    min="500"
                    step="500"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="15000"
                    className={`${INPUT_CLASS} tabular-nums`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="menu-description" className="block text-xs font-semibold text-[#1F1915] mb-1">
                  Deskripsi singkat
                </label>
                <textarea
                  id="menu-description"
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Keterangan porsi, sambal, atau lauk pendamping..."
                  className={INPUT_CLASS}
                />
              </div>

              <label
                htmlFor="menu-available"
                className="min-h-[44px] inline-flex items-center gap-2.5 text-sm text-[#1F1915] cursor-pointer"
              >
                <input
                  id="menu-available"
                  type="checkbox"
                  checked={form.available}
                  onChange={(e) => setForm({ ...form, available: e.target.checked })}
                  className="accent-[#C84B24] w-4 h-4"
                />
                Menu tersedia hari ini
              </label>

              {error && (
                <div role="alert" className="rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-800">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl border border-[#E7DFD3] text-sm font-semibold text-[#6B5E54] hover:text-[#1F1915] hover:bg-[#FAF7F2] cursor-pointer motion-reduce:transition-none transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#C84B24] hover:bg-[#A93B19] text-white text-sm font-bold cursor-pointer motion-reduce:transition-none transition-colors"
                >
                  Simpan Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
