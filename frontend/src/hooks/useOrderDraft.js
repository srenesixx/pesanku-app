import { useMemo, useState } from 'react';
import { calculateOrderTotals } from '../utils/format.js';
import { validateCustomerOrderInput } from '../utils/validation.js';

export function deriveCartItems(cart = {}, menus = []) {
  return Object.entries(cart)
    .filter(([, qty]) => qty > 0)
    .map(([menuId, qty]) => {
      const menu = menus.find((m) => m.id === menuId);
      return menu ? { menuId: menu.id, name: menu.name, price: menu.price, qty } : null;
    })
    .filter(Boolean);
}

export function applyCartQuantityDelta(prevCart = {}, menuId, delta) {
  const nextQty = (prevCart[menuId] || 0) + delta;
  if (nextQty <= 0) {
    const copy = { ...prevCart };
    delete copy[menuId];
    return copy;
  }
  return { ...prevCart, [menuId]: nextQty };
}

export function useOrderDraft(menus = []) {
  const [cart, setCart] = useState({});
  const [customerName, setCustomerNameState] = useState('');
  const [notes, setNotesState] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');

  const cartItems = useMemo(() => deriveCartItems(cart, menus), [cart, menus]);

  const { totalItems, totalAmount } = useMemo(
    () => calculateOrderTotals(cartItems),
    [cartItems]
  );

  function updateQty(menuId, delta) {
    setError('');
    if (fieldErrors.items) {
      setFieldErrors((prev) => ({ ...prev, items: '' }));
    }
    setCart((prev) => applyCartQuantityDelta(prev, menuId, delta));
  }

  function setCustomerName(value) {
    setCustomerNameState(value);
    if (fieldErrors.customerName) {
      setFieldErrors((prev) => ({ ...prev, customerName: '' }));
    }
  }

  function setNotes(value) {
    setNotesState(value);
    if (fieldErrors.notes) {
      setFieldErrors((prev) => ({ ...prev, notes: '' }));
    }
  }

  function resetDraft() {
    setCart({});
    setCustomerNameState('');
    setNotesState('');
    setFieldErrors({});
    setError('');
  }

  function validateDraft() {
    setError('');
    const result = validateCustomerOrderInput({
      customerName,
      notes,
      items: cartItems,
    });
    if (!result.valid) {
      setFieldErrors(result.errors);
      setError(result.message);
      return false;
    }
    setFieldErrors({});
    return true;
  }

  return {
    cart,
    setCart,
    cartItems,
    totalItems,
    totalAmount,
    customerName,
    setCustomerName,
    notes,
    setNotes,
    fieldErrors,
    setFieldErrors,
    error,
    setError,
    updateQty,
    resetDraft,
    validateDraft,
  };
}
