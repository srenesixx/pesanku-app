import { Minus, Plus } from 'lucide-react';
import Button from '../atoms/Button.jsx';

export default function QuantityStepper({
  itemName,
  qty,
  onDecrement,
  onIncrement,
  variant = 'pill',
}) {
  if (variant === 'plain') {
    return (
      <div className="inline-flex items-center gap-2 shrink-0">
        {Button({
          variant: 'secondary',
          size: 'none',
          'aria-label': `Kurangi ${itemName}`,
          onClick: onDecrement,
          className: 'min-w-[44px] min-h-[44px] rounded-lg',
          children: <Minus className="w-4 h-4" aria-hidden="true" />,
        })}
        <span className="w-6 text-center text-sm font-bold tabular-nums">{qty}</span>
        {Button({
          variant: 'primary',
          size: 'none',
          'aria-label': `Tambah ${itemName}`,
          onClick: onIncrement,
          className: 'min-w-[44px] min-h-[44px] rounded-lg',
          children: <Plus className="w-4 h-4" aria-hidden="true" />,
        })}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1 bg-[#FAF7F2] border border-[#E7DFD3] rounded-xl p-0.5">
      {Button({
        variant: 'ghost',
        size: 'none',
        'aria-label': `Kurangi ${itemName}`,
        onClick: onDecrement,
        className: 'min-w-[44px] min-h-[44px] rounded-lg bg-white hover:bg-[#F3ECE2] text-[#1F1915]',
        children: <Minus className="w-4 h-4" aria-hidden="true" />,
      })}
      <span className="min-w-[24px] text-center text-sm font-bold tabular-nums text-[#1F1915]">
        {qty}
      </span>
      {Button({
        variant: 'primary',
        size: 'none',
        'aria-label': `Tambah ${itemName}`,
        onClick: onIncrement,
        className: 'min-w-[44px] min-h-[44px] rounded-lg',
        children: <Plus className="w-4 h-4" aria-hidden="true" />,
      })}
    </div>
  );
}
