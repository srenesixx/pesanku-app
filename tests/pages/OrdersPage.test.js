import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

let vite;
let OrdersPage;

const SAMPLE_MENUS = [
  {
    id: 'm1',
    name: 'Nasi Ayam Geprek Sambal Bawang',
    category: 'Makanan',
    price: 15000,
    available: true,
  },
  {
    id: 'm2',
    name: 'Es Teh Manis',
    category: 'Minuman',
    price: 5000,
    available: true,
  },
];

const SAMPLE_ORDERS = [
  {
    id: 'ord-1001',
    code: 'PK-1001',
    customerName: 'Budi Santoso',
    status: 'Menunggu',
    createdAt: '2026-11-23T05:15:00.000Z',
    items: [
      { menuId: 'm1', name: 'Nasi Ayam Geprek Sambal Bawang', qty: 2, subtotal: 30000 },
    ],
    totalAmount: 30000,
    notes: 'Sambal dipisah',
  },
];

function assertAllSvgsHidden(html) {
  const svgIcons = html.match(/<svg[^>]*>/g) || [];
  assert.ok(svgIcons.length > 0, 'Harus ada minimal satu ikon SVG');
  for (const svg of svgIcons) {
    assert.ok(svg.includes('aria-hidden="true"'), `SVG harus memiliki aria-hidden="true": ${svg}`);
  }
}

before(async () => {
  vite = await createServer({
    server: { middlewareMode: true, watch: null },
    optimizeDeps: { noDiscovery: true },
    logLevel: 'silent',
  });
  ({ default: OrdersPage } = await vite.ssrLoadModule('/src/pages/OrdersPage.jsx'));
});

after(async () => {
  await vite?.close();
});

test('OrdersPage merender filter & Catat Pesanan Baru 44px, select 44px, kontras #6B5E54, dan fokus aksesibel', () => {
  const html = renderToStaticMarkup(
    React.createElement(OrdersPage, { initialOrders: SAMPLE_ORDERS, initialMenus: SAMPLE_MENUS })
  );

  const newOrderBtnMatch = html.match(/<button\b([^>]*)>[^<]*<svg[^>]*>.*?<\/svg>Catat Pesanan Baru<\/button>/);
  assert.ok(newOrderBtnMatch && newOrderBtnMatch[1].includes('min-h-[44px]'));

  for (const status of ['Semua', 'Menunggu', 'Diproses', 'Selesai', 'Dibatalkan']) {
    const filterBtnMatch = html.match(new RegExp(`<button\\b([^>]*)>${status}</button>`));
    assert.ok(filterBtnMatch, `Tombol filter ${status} harus ada`);
    assert.ok(
      filterBtnMatch[1].includes('min-h-[44px]'),
      `Tombol filter ${status} harus memiliki min-h-[44px]`
    );
    const expectedPressed = status === 'Semua' ? 'true' : 'false';
    assert.ok(
      filterBtnMatch[1].includes(`aria-pressed="${expectedPressed}"`),
      `Tombol filter ${status} harus memiliki aria-pressed="${expectedPressed}"`
    );
  }

  const selectMatch = html.match(/<select[^>]*aria-label="Ubah status PK-1001"[^>]*>/);
  assert.ok(selectMatch, 'Select ubah status harus ada');
  assert.ok(selectMatch[0].includes('min-h-[44px]'));
  assert.equal(selectMatch[0].includes('focus:outline-none'), false);
  assert.equal(selectMatch[0].includes('focus-visible:ring-[#C84B24]/30'), false);
  assert.ok(selectMatch[0].includes('focus-visible:ring-2'));
  assert.ok(selectMatch[0].includes('focus-visible:ring-[#C84B24]'));

  assert.equal(html.includes('#8C7E73'), false);
  assert.ok(html.includes('text-xs text-[#6B5E54]'));
  assert.equal(html.includes('focus:outline-none'), false);
  assert.equal(html.includes('—'), false);
  assertAllSvgsHidden(html);
});

test('OrdersPage modal kasir merender dialog aksesibel, max-h-[90dvh], label terhubung, tombol -/+ 44px, dan aksi 44px', () => {
  const html = renderToStaticMarkup(
    React.createElement(OrdersPage, {
      initialOrders: SAMPLE_ORDERS,
      initialMenus: SAMPLE_MENUS,
      initialModalOpen: true,
    })
  );

  assert.ok(html.includes('role="dialog"'));
  assert.ok(html.includes('aria-modal="true"'));
  assert.ok(html.includes('tabindex="-1"'));
  assert.ok(html.includes('cursor-pointer'));
  assert.match(html, /aria-labelledby="order-modal-title"/);
  assert.ok(html.includes('id="order-modal-title"'));
  assert.ok(html.includes('max-h-[90dvh]'));

  for (const fieldId of ['order-customer-name', 'order-notes']) {
    assert.ok(html.includes(`for="${fieldId}"`), `Label untuk ${fieldId} harus terhubung`);
    assert.ok(html.includes(`id="${fieldId}"`), `Input ${fieldId} harus memiliki id`);
  }

  assert.match(
    html,
    /aria-label="Kurangi Nasi Ayam Geprek Sambal Bawang"[^>]*class="[^"]*min-w-\[44px\][^"]*min-h-\[44px\]|class="[^"]*min-w-\[44px\][^"]*min-h-\[44px\][^"]*"[^>]*aria-label="Kurangi Nasi Ayam Geprek Sambal Bawang"/
  );
  assert.match(
    html,
    /aria-label="Tambah Nasi Ayam Geprek Sambal Bawang"[^>]*class="[^"]*min-w-\[44px\][^"]*min-h-\[44px\]|class="[^"]*min-w-\[44px\][^"]*min-h-\[44px\][^"]*"[^>]*aria-label="Tambah Nasi Ayam Geprek Sambal Bawang"/
  );

  assert.match(
    html,
    /aria-label="Tutup"[^>]*class="[^"]*min-h-\[44px\][^"]*min-w-\[44px\]|class="[^"]*min-h-\[44px\][^"]*min-w-\[44px\][^"]*"[^>]*aria-label="Tutup"/
  );
  const cancelBtnMatch = html.match(/<button\b([^>]*)>Batal<\/button>/);
  assert.ok(cancelBtnMatch && cancelBtnMatch[1].includes('min-h-[44px]'));
  const saveBtnMatch = html.match(/<button\b([^>]*)>Simpan Pesanan<\/button>/);
  assert.ok(saveBtnMatch && saveBtnMatch[1].includes('type="submit"') && saveBtnMatch[1].includes('min-h-[44px]'));

  assert.equal(html.includes('focus:outline-none'), false);
  assert.equal(html.includes('focus-visible:ring-[#C84B24]/30'), false);
  assert.ok(html.includes('focus-visible:ring-2'));
  assert.ok(html.includes('focus-visible:ring-[#C84B24]'));
  assertAllSvgsHidden(html);
});
