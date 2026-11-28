import { Flame, Plus } from 'lucide-react';
import { formatRupiah } from '../../utils/format.js';
import Badge from '../atoms/Badge.jsx';
import Button from '../atoms/Button.jsx';
import Card from '../atoms/Card.jsx';
import QuantityStepper from '../molecules/QuantityStepper.jsx';

export default function MenuCard({ menu, qty = 0, isRecommended = false, onUpdateQty }) {
  return (
    <Card
      as="article"
      padding="sm"
      className={`flex flex-col justify-between motion-reduce:transition-none transition-colors ${
        qty > 0 ? 'border-[#C84B24]' : 'border-[#E7DFD3]'
      } ${!menu.available ? 'opacity-60' : ''}`}
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B5E54]">
            {menu.category}
          </span>
          {isRecommended && (
            <Badge tone="warm" size="xs">
              <Flame className="w-3 h-3" aria-hidden="true" />
              Favorit
            </Badge>
          )}
        </div>
        <h3 className="font-bold text-base text-[#1F1915] mt-1 break-words">{menu.name}</h3>
        {menu.description && (
          <p className="text-xs text-[#6B5E54] mt-1 leading-relaxed">{menu.description}</p>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-[#F1EAE0] flex flex-wrap items-center justify-between gap-2">
        <span className="font-extrabold text-base tabular-nums text-[#1F1915]">
          {formatRupiah(menu.price)}
        </span>

        {!menu.available ? (
          <Badge tone="rose" size="sm" bordered={false} className="rounded-lg py-1.5">
            Habis
          </Badge>
        ) : qty === 0 ? (
          <Button
            variant="soft"
            size="none"
            onClick={() => onUpdateQty?.(menu.id, 1)}
            className="gap-1.5 px-3.5 py-2 text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Tambah
          </Button>
        ) : (
          <QuantityStepper
            itemName={menu.name}
            qty={qty}
            onDecrement={() => onUpdateQty?.(menu.id, -1)}
            onIncrement={() => onUpdateQty?.(menu.id, 1)}
          />
        )}
      </div>
    </Card>
  );
}
