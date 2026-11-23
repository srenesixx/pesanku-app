import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusableElements(containerEl, win) {
  const nodes = containerEl?.querySelectorAll?.(FOCUSABLE_SELECTOR);
  if (!nodes) return [];

  return Array.from(nodes).filter((el) => {
    if (
      el.disabled ||
      el.type === 'hidden' ||
      el.hasAttribute?.('disabled') ||
      el.tabIndex === -1 ||
      el.hidden
    ) {
      return false;
    }
    if (typeof el.getClientRects === 'function' && el.getClientRects().length === 0) {
      return false;
    }
    if (typeof win?.getComputedStyle === 'function') {
      const style = win.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') {
        return false;
      }
    }
    return true;
  });
}

export function setupOverlayListeners({
  isOpen,
  onClose,
  triggerEl,
  containerEl = null,
  doc = document,
  win = window,
}) {
  if (!isOpen) return () => {};

  const prevOverflow = doc.body.style.overflow;
  doc.body.style.overflow = 'hidden';

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose?.();
      return;
    }

    if (e.key === 'Tab' && containerEl) {
      const focusable = getFocusableElements(containerEl, win);
      if (focusable.length === 0) {
        e.preventDefault?.();
        containerEl.focus?.();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = doc?.activeElement;
      const isInside =
        active === containerEl ||
        focusable.includes(active) ||
        Boolean(containerEl.contains?.(active));

      if (e.shiftKey) {
        if (active === first || active === containerEl || !isInside) {
          e.preventDefault?.();
          last.focus?.();
        }
      } else if (active === last || !isInside) {
        e.preventDefault?.();
        first.focus?.();
      }
    }
  };

  win.addEventListener('keydown', handleKeyDown);
  containerEl?.focus?.();

  return () => {
    win.removeEventListener('keydown', handleKeyDown);
    doc.body.style.overflow = prevOverflow;
    triggerEl?.focus?.();
  };
}

export function useOverlayDialog(isOpen, onClose, triggerRef, containerRef = null) {
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
      containerEl: containerRef?.current ?? null,
    });
  }, [isOpen, triggerRef, containerRef]);
}
