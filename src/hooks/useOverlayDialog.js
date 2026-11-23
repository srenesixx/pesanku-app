import { useEffect, useRef } from 'react';

export function setupOverlayListeners({
  isOpen,
  onClose,
  triggerEl,
  doc = document,
  win = window,
}) {
  if (!isOpen) return () => {};

  const prevOverflow = doc.body.style.overflow;
  doc.body.style.overflow = 'hidden';

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose?.();
    }
  };

  win.addEventListener('keydown', handleKeyDown);

  return () => {
    win.removeEventListener('keydown', handleKeyDown);
    doc.body.style.overflow = prevOverflow;
    triggerEl?.focus?.();
  };
}

export function useOverlayDialog(isOpen, onClose, triggerRef) {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return undefined;

    return setupOverlayListeners({
      isOpen,
      onClose: () => onCloseRef.current?.(),
      triggerEl: triggerRef?.current,
    });
  }, [isOpen, triggerRef]);
}
