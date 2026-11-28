import { Pencil, Trash2 } from 'lucide-react';
import { formatRupiah } from '../../utils/format.js';
import Button from '../atoms/Button.jsx';
import Card from '../atoms/Card.jsx';
import EmptyState from '../molecules/EmptyState.jsx';

export default function MenuCatalogTable({
  menus = [],
  onToggleAvailable,
  onEdit,
  onDelete,
}) {
  return (
    <>
      <div className="space-y-3 md:hidden">
        {menus.length === 0 ? (
          <EmptyState title="Tidak ada menu yang cocok." padding="lg" />
        ) : (
          menus.map((menu) => (
            <Card key={menu.id} as="article" padding="sm" className="space-y-3">
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
                <Button
                  variant={menu.available ? 'available' : 'unavailable'}
                  size="chip"
                  aria-label={`${menu.available ? 'Tersedia' : 'Habis'}, ubah status ${menu.name}`}
                  aria-pressed={menu.available}
                  onClick={() => onToggleAvailable?.(menu)}
                >
                  {menu.available ? 'Tersedia' : 'Habis'}
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label={`Ubah ${menu.name}`}
                    onClick={(e) => onEdit?.(menu, e)}
                    className="min-w-[44px] gap-1.5"
                  >
                    <Pencil className="w-4 h-4" aria-hidden="true" />
                    <span>Ubah</span>
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    aria-label={`Hapus ${menu.name}`}
                    onClick={() => onDelete?.(menu)}
                    className="min-w-[44px] gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                    <span>Hapus</span>
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Card padding="none" className="hidden md:block overflow-hidden">
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
              {menus.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#6B5E54]">
                    Tidak ada menu yang cocok.
                  </td>
                </tr>
              ) : (
                menus.map((menu) => (
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
                      <Button
                        variant={menu.available ? 'available' : 'unavailable'}
                        size="chip"
                        aria-label={`${menu.available ? 'Tersedia' : 'Habis'}, ubah status ${menu.name}`}
                        aria-pressed={menu.available}
                        onClick={() => onToggleAvailable?.(menu)}
                      >
                        {menu.available ? 'Tersedia' : 'Habis'}
                      </Button>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost-neutral"
                          size="icon"
                          aria-label={`Ubah ${menu.name}`}
                          onClick={(e) => onEdit?.(menu, e)}
                        >
                          <Pencil className="w-4 h-4" aria-hidden="true" />
                        </Button>
                        <Button
                          variant="ghost-danger"
                          size="icon"
                          aria-label={`Hapus ${menu.name}`}
                          onClick={() => onDelete?.(menu)}
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
