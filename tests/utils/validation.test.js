import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateCustomerOrderInput,
  validateLoginInput,
  validateMenuInput,
  validateReportDateRange,
  validateTrackCode,
} from '../../src/utils/validation.js';

test('validateLoginInput memvalidasi email kosong, format email salah, dan kata sandi terlalu pendek', () => {
  const emptyBoth = validateLoginInput({ email: '', password: '' });
  assert.equal(emptyBoth.valid, false);
  assert.equal(emptyBoth.message, 'Email dan kata sandi wajib diisi.');
  assert.ok(emptyBoth.errors.email);
  assert.ok(emptyBoth.errors.password);

  const badEmail = validateLoginInput({ email: 'bukan-email', password: 'maknyus2026' });
  assert.equal(badEmail.valid, false);
  assert.ok(badEmail.errors.email.includes('Format email tidak valid'));

  const shortPass = validateLoginInput({ email: 'pemilik@maknyus.id', password: '123' });
  assert.equal(shortPass.valid, false);
  assert.ok(shortPass.errors.password.includes('minimal 6 karakter'));

  const valid = validateLoginInput({ email: 'pemilik@maknyus.id', password: 'maknyus2026' });
  assert.equal(valid.valid, true);
  assert.deepEqual(valid.errors, {});
});

test('validateCustomerOrderInput memvalidasi nama pemesan, batas catatan, harga item, dan qty keranjang', () => {
  const validItems = [{ menuId: 'm1', name: 'Ayam Geprek', price: 15000, qty: 2 }];

  const emptyName = validateCustomerOrderInput({ customerName: '   ', notes: '', items: validItems });
  assert.equal(emptyName.valid, false);
  assert.equal(emptyName.message, 'Nama pemesan wajib diisi.');
  assert.ok(emptyName.errors.customerName);

  const shortName = validateCustomerOrderInput({ customerName: 'A', notes: '', items: validItems });
  assert.equal(shortName.valid, false);
  assert.ok(shortName.errors.customerName.includes('2 hingga 60 karakter'));

  const longNotes = validateCustomerOrderInput({
    customerName: 'Budi Santoso',
    notes: 'x'.repeat(201),
    items: validItems,
  });
  assert.equal(longNotes.valid, false);
  assert.ok(longNotes.errors.notes.includes('200 karakter'));

  const excessiveQty = validateCustomerOrderInput({
    customerName: 'Budi Santoso',
    notes: '',
    items: [{ menuId: 'm1', name: 'Ayam Geprek', price: 15000, qty: 100 }],
  });
  assert.equal(excessiveQty.valid, false);
  assert.ok(excessiveQty.errors.items);

  const zeroPriceItem = validateCustomerOrderInput({
    customerName: 'Budi Santoso',
    notes: '',
    items: [{ menuId: 'm1', name: 'Ayam Geprek', price: 0, qty: 1 }],
  });
  assert.equal(zeroPriceItem.valid, false);
  assert.ok(zeroPriceItem.errors.items.includes('Harga setiap menu'));

  const valid = validateCustomerOrderInput({
    customerName: 'Budi Santoso',
    notes: 'Sambal dipisah',
    items: validItems,
  });
  assert.equal(valid.valid, true);
});

test('validateTrackCode memvalidasi kode kosong dan pola PK-XXXX', () => {
  const empty = validateTrackCode('  ');
  assert.equal(empty.valid, false);
  assert.equal(empty.message, 'Masukkan kode pesanan terlebih dahulu.');

  const invalidPattern = validateTrackCode('ORD-99');
  assert.equal(invalidPattern.valid, false);
  assert.ok(invalidPattern.errors.trackCode.includes('PK-'));

  const valid = validateTrackCode(' pk-1005 ');
  assert.equal(valid.valid, true);
  assert.equal(valid.normalizedCode, 'PK-1005');
});

test('validateMenuInput dan validateReportDateRange memvalidasi input menu dan rentang tanggal laporan', () => {
  const emptyName = validateMenuInput({ name: '', category: 'Makanan', price: 15000 });
  assert.equal(emptyName.valid, false);
  assert.equal(emptyName.message, 'Nama menu wajib diisi.');

  const zeroPrice = validateMenuInput({ name: 'Ayam Geprek', category: 'Makanan', price: 0 });
  assert.equal(zeroPrice.valid, false);
  assert.equal(zeroPrice.message, 'Harga menu harus lebih dari Rp0.');

  const lowPrice = validateMenuInput({ name: 'Ayam Geprek', category: 'Makanan', price: 200 });
  assert.equal(lowPrice.valid, false);
  assert.ok(lowPrice.errors.price.includes('Rp500'));

  const validMenu = validateMenuInput({
    name: 'Ayam Geprek Sambal Ijo',
    category: 'Makanan',
    price: 16000,
    description: 'Pedas mantap',
  });
  assert.equal(validMenu.valid, true);

  const badRange = validateReportDateRange({ startDate: '2026-11-28', endDate: '2026-11-20' });
  assert.equal(badRange.valid, false);
  assert.ok(badRange.errors.dateRange);

  const goodRange = validateReportDateRange({ startDate: '2026-11-20', endDate: '2026-11-28' });
  assert.equal(goodRange.valid, true);
});
