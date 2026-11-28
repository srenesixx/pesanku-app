import test from 'node:test';
import assert from 'node:assert/strict';
import { applyCartQuantityDelta, deriveCartItems } from '../../src/hooks/useOrderDraft.js';

test('deriveCartItems memetakan id menu menjadi item pesanan dengan qty positif', () => {
  const menus = [
    { id: 'm1', name: 'Nasi Ayam Geprek', price: 15000 },
    { id: 'm2', name: 'Es Teh Manis', price: 5000 },
  ];
  const items = deriveCartItems({ m1: 2, m2: 0, missing: 1 }, menus);
  assert.deepEqual(items, [
    { menuId: 'm1', name: 'Nasi Ayam Geprek', price: 15000, qty: 2 },
  ]);
});

test('applyCartQuantityDelta menambah, mengurangi, dan menghapus item saat qty <= 0', () => {
  let cart = applyCartQuantityDelta({}, 'm1', 1);
  assert.deepEqual(cart, { m1: 1 });

  cart = applyCartQuantityDelta(cart, 'm1', 2);
  assert.deepEqual(cart, { m1: 3 });

  cart = applyCartQuantityDelta(cart, 'm1', -3);
  assert.deepEqual(cart, {});
});
