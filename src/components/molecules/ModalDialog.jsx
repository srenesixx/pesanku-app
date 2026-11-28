import { useRef } from 'react';
import { X } from 'lucide-react';
import { useOverlayDialog } from '../../hooks/useOverlayDialog.js';
import Button from '../atoms/Button.jsx';

export default function ModalDialog({
  open,
  titleId,
  title,
  onClose,
  triggerRef,
  maxWidthClass = 'max-w-md',
  headerBorder = false,
  children,
}) {
  const internalTriggerRef = useRef(null);
  const dialogRef = useRef(null);
  const backdropMouseDownRef = useRef(false);

  useOverlayDialog(open, onClose, triggerRef || internalTriggerRef, dialogRef);

  if (!open) return null;

  return (
    <div
      onMouseDown={(e) => {
        backdropMouseDownRef.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        const startedOnBackdrop = backdropMouseDownRef.current;
        backdropMouseDownRef.current = false;
        if (e.target === e.currentTarget && startedOnBackdrop) {
          onClose?.();
        }
      }}
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 cursor-pointer"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        className={`bg-white border border-[#E7DFD3] rounded-2xl w-full ${maxWidthClass} max-h-[90dvh] ${
          headerBorder ? 'flex flex-col overflow-hidden' : 'overflow-y-auto p-5 sm:p-6'
        } cursor-default`}
      >
        <div
          className={
            headerBorder
              ? 'flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-[#E7DFD3]'
              : 'flex items-center justify-between gap-3 mb-4'
          }
        >
          <h2 id={titleId} className="font-bold text-lg text-[#1F1915]">
            {title}
          </h2>
          <Button variant="ghost" size="icon" aria-label="Tutup" onClick={onClose}>
            <X className="w-5 h-5" aria-hidden="true" />
          </Button>
        </div>

        {children}
      </div>
    </div>
  );
}
