import { UtensilsCrossed } from 'lucide-react';

const BOX_SIZES = {
  sm: 'w-8 h-8',
  responsive: 'w-8 h-8 sm:w-9 sm:h-9',
  lg: 'w-11 h-11',
};

const ICON_SIZES = {
  sm: 'w-4 h-4',
  responsive: 'w-4 h-4 sm:w-5 sm:h-5',
  lg: 'w-5 h-5',
};

export default function BrandMark({ size = 'sm' }) {
  const boxClass = BOX_SIZES[size] || BOX_SIZES.sm;
  const iconClass = ICON_SIZES[size] || ICON_SIZES.sm;

  return (
    <div className={`${boxClass} rounded-xl bg-[#C84B24] text-white flex items-center justify-center shrink-0`}>
      <UtensilsCrossed className={iconClass} aria-hidden="true" />
    </div>
  );
}
