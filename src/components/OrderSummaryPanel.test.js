import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

let vite;
let OrderSummaryPanel;
let CustomerOrderPage;

before(async () => {
  vite = await createServer({
    server: { middlewareMode: true, watch: null },
    optimizeDeps: { noDiscovery: true },
    logLevel: 'silent',
  });
});

after(async () => {
  await vite?.close();
});

test('OrderSummaryPanel variant="sheet" merender 2 menu, tombol tutup, kontrol kuantitas, dan form checkout aksesibel', async () => {
  ({ default: OrderSummaryPanel } = await vite.ssrLoadModule('/src/components/OrderSummaryPanel.jsx'));

  const html = renderToStaticMarkup(
    React.createElement(OrderSummaryPanel, {
      cartItems: [
        { menuId: 'm1', name: 'Ayam Geprek', price: 15000, qty: 1 },
        { menuId: 'm2', name: 'Es Teh Manis', price: 5000, qty: 1 },
      ],
      totalItems: 2,
      totalAmount: 20000,
      customerName: 'Budi',
      notes: 'Pedas sedang',
      error: '',
      submitting: false,
      variant: 'sheet',
      onCustomerNameChange: () => {},
      onNotesChange: () => {},
      onUpdateQty: () => {},
      onSubmit: () => {},
      onClose: () => {},
    })
  );

  assert.ok(html.includes('Pesanan Anda'));
  assert.ok(html.includes('2 Item'));
  assert.ok(html.includes('Tutup'));
  assert.ok(html.includes('aria-label="Tutup ringkasan pesanan"'));
  assert.ok(html.includes('aria-label="Hapus Ayam Geprek"'));
  assert.ok(html.includes('aria-label="Kurangi Ayam Geprek"'));
  assert.ok(html.includes('aria-label="Tambah Ayam Geprek"'));
  assert.ok(html.includes('Nama Pemesan *'));
  assert.ok(html.includes('id="customer-name"'));
  assert.ok(html.includes('Catatan (opsional)'));
  assert.ok(html.includes('id="customer-notes"'));
  assert.ok(html.includes('Total Pembayaran'));
  assert.ok(html.includes('Kirim Pesanan'));
  assert.match(html, /bg-\[#FFF3E8\][^"]*text-\[#A93B19\]/);
  assert.doesNotMatch(html, /bg-\[#FFF3E8\][^"]*text-\[#C84B24\]/);
  assert.equal(html.includes('focus:outline-none'), false);
  assert.equal(html.includes('#8C7E73'), false);
});

test('OrderSummaryPanel variant="sidebar" keadaan kosong menampilkan pesan tanpa teks desktop-only dan tanpa tombol tutup', async () => {
  ({ default: OrderSummaryPanel } = await vite.ssrLoadModule('/src/components/OrderSummaryPanel.jsx'));

  const html = renderToStaticMarkup(
    React.createElement(OrderSummaryPanel, {
      cartItems: [],
      totalItems: 0,
      totalAmount: 0,
      customerName: '',
      notes: '',
      error: '',
      submitting: false,
      variant: 'sidebar',
      onCustomerNameChange: () => {},
      onNotesChange: () => {},
      onUpdateQty: () => {},
      onSubmit: () => {},
    })
  );

  assert.ok(html.includes('Keranjang masih kosong'));
  assert.equal(html.includes('di sebelah kiri'), false);
  assert.equal(html.includes('Tutup ringkasan pesanan'), false);
  assert.equal(html.includes('>Tutup<'), false);
  assert.equal(html.includes('#8C7E73'), false);
});

test('OrderSummaryPanel menampilkan alert error dan status tombol disabled saat submitting', async () => {
  ({ default: OrderSummaryPanel } = await vite.ssrLoadModule('/src/components/OrderSummaryPanel.jsx'));

  const html = renderToStaticMarkup(
    React.createElement(OrderSummaryPanel, {
      cartItems: [{ menuId: 'm1', name: 'Ayam Geprek', price: 15000, qty: 1 }],
      totalItems: 1,
      totalAmount: 15000,
      customerName: '',
      notes: '',
      error: 'Nama pemesan wajib diisi.',
      submitting: true,
      variant: 'sheet',
      onCustomerNameChange: () => {},
      onNotesChange: () => {},
      onUpdateQty: () => {},
      onSubmit: () => {},
      onClose: () => {},
    })
  );

  assert.ok(html.includes('role="alert"'));
  assert.ok(html.includes('Nama pemesan wajib diisi.'));
  assert.ok(html.includes('Mengirim Pesanan...'));
  assert.ok(html.includes('disabled=""') || html.includes('disabled'));
});

test('CustomerOrderPage SSR fallback merender bar mengambang, tanpa duplikasi ID form, tanpa outline-none, dan tanpa em dash', async () => {
  ({ default: CustomerOrderPage } = await vite.ssrLoadModule('/src/pages/CustomerOrderPage.jsx'));

  const html = renderToStaticMarkup(
    React.createElement(CustomerOrderPage, { onOpenLogin: () => {} })
  );

  assert.ok(html.includes('Buka Ringkasan'));
  assert.ok(html.includes('pb-28 lg:pb-8'));
  assert.equal((html.match(/id="customer-name"/g) || []).length, 0);
  assert.equal(html.includes('focus:outline-none'), false);
  assert.equal(html.includes('#8C7E73'), false);
  assert.equal(html.includes('—'), false);
});
