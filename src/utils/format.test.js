import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateOrderTotals, formatRupiah, validateOrderItems } from './format.js';

test('menghitung 2 Ayam Geprek seharga Rp15.000 menjadi Rp30.000', () => {
  const result = calculateOrderTotals([
    { menuId: 'm1', name: 'Ayam Geprek', price: 15000, qty: 2 },
  ]);
  assert.equal(result.totalItems, 2);
  assert.equal(result.totalAmount, 30000);
  assert.equal(formatRupiah(result.totalAmount), 'Rp30.000');
});

test('menolak pesanan kosong atau jumlah pesanan nol', () => {
  assert.ok(validateOrderItems([]));
  assert.ok(validateOrderItems([{ menuId: 'm1', name: 'Ayam Geprek', price: 15000, qty: 0 }]));
  assert.equal(
    validateOrderItems([{ menuId: 'm1', name: 'Ayam Geprek', price: 15000, qty: 2 }]),
    null
  );
});
