import AlertBanner from '../atoms/AlertBanner.jsx';
import Button from '../atoms/Button.jsx';
import Checkbox from '../atoms/Checkbox.jsx';
import Input from '../atoms/Input.jsx';
import Select from '../atoms/Select.jsx';
import Textarea from '../atoms/Textarea.jsx';
import FormField from '../molecules/FormField.jsx';
import ModalDialog from '../molecules/ModalDialog.jsx';

export default function MenuFormModal({
  open,
  editingId,
  form,
  fieldErrors = {},
  error = '',
  categories = [],
  triggerRef,
  onChangeForm,
  onSave,
  onClose,
}) {
  return (
    <ModalDialog
      open={open}
      titleId="menu-modal-title"
      title={editingId ? 'Ubah Menu' : 'Tambah Menu Baru'}
      triggerRef={triggerRef}
      onClose={onClose}
      maxWidthClass="max-w-md"
      headerBorder={false}
    >
      <form onSubmit={onSave} className="space-y-4" noValidate>
        <FormField id="menu-name" label="Nama Menu *" error={fieldErrors.name}>
          <Input
            id="menu-name"
            type="text"
            value={form.name}
            error={fieldErrors.name}
            onChange={(e) => onChangeForm({ ...form, name: e.target.value }, 'name')}
            placeholder="Contoh: Ayam Geprek Sambal Ijo"
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField id="menu-category" label="Kategori" error={fieldErrors.category}>
            <Select
              id="menu-category"
              value={form.category}
              error={fieldErrors.category}
              onChange={(e) => onChangeForm({ ...form, category: e.target.value }, 'category')}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField id="menu-price" label="Harga (Rp) *" error={fieldErrors.price}>
            <Input
              id="menu-price"
              type="number"
              min="500"
              step="500"
              value={form.price}
              error={fieldErrors.price}
              onChange={(e) => onChangeForm({ ...form, price: e.target.value }, 'price')}
              placeholder="15000"
              className="tabular-nums"
            />
          </FormField>
        </div>

        <FormField id="menu-description" label="Deskripsi singkat" error={fieldErrors.description}>
          <Textarea
            id="menu-description"
            rows={2}
            value={form.description}
            error={fieldErrors.description}
            onChange={(e) => onChangeForm({ ...form, description: e.target.value }, 'description')}
            placeholder="Keterangan porsi, sambal, atau lauk pendamping..."
          />
        </FormField>

        <Checkbox
          id="menu-available"
          label="Menu tersedia hari ini"
          checked={form.available}
          onChange={(e) => onChangeForm({ ...form, available: e.target.checked }, 'available')}
        />

        {error && <AlertBanner message={error} />}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="primary">
            Simpan Menu
          </Button>
        </div>
      </form>
    </ModalDialog>
  );
}
