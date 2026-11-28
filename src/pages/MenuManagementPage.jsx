import { useCallback, useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { menuApi } from '../services/api.js';
import { VALID_MENU_CATEGORIES, validateMenuInput } from '../utils/validation.js';
import { Button } from '../components/atoms/index.js';
import { PageHeader, SearchInput } from '../components/molecules/index.js';
import { MenuCatalogTable, MenuFormModal } from '../components/organisms/index.js';

const EMPTY_FORM = {
  name: '',
  category: 'Makanan',
  price: '',
  description: '',
  available: true,
};

export default function MenuManagementPage({ initialMenus = [], initialModalOpen = false } = {}) {
  const [menus, setMenus] = useState(initialMenus);
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(initialModalOpen);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const lastTriggerRef = useRef(null);
  const handleCloseModal = useCallback(() => setModalOpen(false), []);

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
    setFieldErrors({});
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
    setFieldErrors({});
    setError('');
    setModalOpen(true);
  }

  function handleChangeForm(nextForm, changedField) {
    setForm(nextForm);
    if (changedField && fieldErrors[changedField]) {
      setFieldErrors((prev) => ({ ...prev, [changedField]: '' }));
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    const validation = validateMenuInput(
      {
        name: form.name,
        category: form.category,
        price: form.price,
        description: form.description,
      },
      { isPartial: false }
    );
    if (!validation.valid) {
      setFieldErrors(validation.errors);
      setError(validation.message);
      return;
    }
    setFieldErrors({});
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
      if (err.errors) setFieldErrors(err.errors);
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
      <PageHeader
        title="Pengelolaan Menu"
        subtitle="Tambah, ubah harga, atur ketersediaan, atau hapus menu warung."
        actions={
          <Button variant="primary" onClick={openCreate}>
            <Plus className="w-4 h-4" aria-hidden="true" />
            Tambah Menu
          </Button>
        }
      />

      <SearchInput
        id="menu-search"
        label="Cari nama menu"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Cari nama menu..."
      />

      <MenuCatalogTable
        menus={filtered}
        onToggleAvailable={handleToggleAvailable}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <MenuFormModal
        open={modalOpen}
        editingId={editingId}
        form={form}
        fieldErrors={fieldErrors}
        error={error}
        categories={VALID_MENU_CATEGORIES}
        triggerRef={lastTriggerRef}
        onChangeForm={handleChangeForm}
        onSave={handleSave}
        onClose={handleCloseModal}
      />
    </div>
  );
}
