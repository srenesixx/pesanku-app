import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

let vite;
let MenuManagementPage;
let ReportsPage;

const SAMPLE_MENUS = [
  {
    id: 'm1',
    name: 'Nasi Ayam Geprek Original',
    category: 'Makanan',
    price: 15000,
    available: true,
    description: 'Ayam crispy sambal bawang pedas.',
  },
  {
    id: 'm2',
    name: 'Es Teh Manis',
    category: 'Minuman',
    price: 5000,
    available: false,
    description: 'Teh melati segar.',
  },
];

const SAMPLE_ORDERS = [
  {
    id: 'ord-1001',
    code: 'PK-1001',
    customerName: 'Budi Santoso',
    status: 'Selesai',
    createdAt: '2026-11-23T05:15:00.000Z',
    items: [
      { menuId: 'm1', name: 'Nasi Ayam Geprek Original', price: 15000, qty: 2 },
      { menuId: 'm2', name: 'Es Teh Manis', price: 5000, qty: 1 },
    ],
    totalAmount: 35000,
  },
];

before(async () => {
  vite = await createServer({
    server: { middlewareMode: true, watch: null },
    optimizeDeps: { noDiscovery: true },
    logLevel: 'silent',
  });
  ({ default: MenuManagementPage } = await vite.ssrLoadModule('/src/pages/MenuManagementPage.jsx'));
  ({ default: ReportsPage } = await vite.ssrLoadModule('/src/pages/ReportsPage.jsx'));
});

after(async () => {
  await vite?.close();
});

test('MenuManagementPage merender kartu mobile (md:hidden), tabel desktop (hidden md:block), target sentuh 44px, dan fokus aksesibel', () => {
  const html = renderToStaticMarkup(
    React.createElement(MenuManagementPage, { initialMenus: SAMPLE_MENUS })
  );

  assert.match(html, /<div class="[^"]*\bmd:hidden\b[^"]*">/);
  assert.match(html, /<div class="[^"]*\bhidden md:block\b[^"]*">/);

  assert.ok(html.includes('Nasi Ayam Geprek Original'));
  assert.ok(html.includes('Ayam crispy sambal bawang pedas.'));
  assert.ok(html.includes('Rp15.000'));
  assert.ok(html.includes('Tersedia'));
  assert.ok(html.includes('Habis'));
  assert.ok(html.includes('tabular-nums'));

  assert.equal(html.includes('focus:outline-none'), false);
  assert.ok(html.includes('focus-visible:ring-2'));
  assert.equal(html.includes('#8C7E73'), false);
  assert.equal(html.includes('—'), false);

  assert.match(html, /class="[^"]*min-h-\[44px\][^"]*">[^<]*<svg[^>]*>.*?<\/svg>Tambah Menu/);
  assert.match(
    html,
    /aria-label="Ubah Nasi Ayam Geprek Original"[^>]*class="[^"]*min-h-\[44px\][^"]*min-w-\[44px\]|class="[^"]*min-h-\[44px\][^"]*min-w-\[44px\][^"]*"[^>]*aria-label="Ubah Nasi Ayam Geprek Original"/
  );
  assert.match(
    html,
    /aria-label="Hapus Nasi Ayam Geprek Original"[^>]*class="[^"]*min-h-\[44px\][^"]*min-w-\[44px\]|class="[^"]*min-h-\[44px\][^"]*min-w-\[44px\][^"]*"[^>]*aria-label="Hapus Nasi Ayam Geprek Original"/
  );

  const searchInputMatch = html.match(/<input[^>]*placeholder="Cari nama menu\.\.\."[^>]*>/);
  assert.ok(searchInputMatch, 'Input cari menu harus ada');
  assert.ok(searchInputMatch[0].includes('min-h-[44px]'));
  assert.equal(searchInputMatch[0].includes('focus:outline-none'), false);
  assert.ok(searchInputMatch[0].includes('focus-visible:ring-2'));

  const svgIcons = html.match(/<svg[^>]*>/g) || [];
  assert.ok(svgIcons.length > 0);
  for (const svg of svgIcons) {
    assert.ok(svg.includes('aria-hidden="true"'), `SVG harus memiliki aria-hidden="true": ${svg}`);
  }
});

test('MenuManagementPage modal merender dialog aksesibel dengan grid responsif, batas tinggi 90dvh, label terhubung, dan kontrol 44px', () => {
  const html = renderToStaticMarkup(
    React.createElement(MenuManagementPage, {
      initialMenus: SAMPLE_MENUS,
      initialModalOpen: true,
    })
  );

  assert.ok(html.includes('role="dialog"'));
  assert.ok(html.includes('aria-modal="true"'));
  assert.match(html, /aria-labelledby="menu-modal-title"/);
  assert.ok(html.includes('id="menu-modal-title"'));
  assert.ok(html.includes('max-h-[90dvh]'));
  assert.ok(html.includes('overflow-y-auto'));
  assert.ok(html.includes('grid-cols-1 sm:grid-cols-2'));
  assert.equal(html.includes('focus:outline-none'), false);

  for (const fieldId of ['menu-name', 'menu-category', 'menu-price', 'menu-description']) {
    assert.ok(html.includes(`for="${fieldId}"`), `Label untuk ${fieldId} harus terhubung`);
    assert.ok(html.includes(`id="${fieldId}"`), `Kontrol ${fieldId} harus memiliki id`);
  }

  assert.match(
    html,
    /aria-label="Tutup"[^>]*class="[^"]*min-h-\[44px\][^"]*min-w-\[44px\]|class="[^"]*min-h-\[44px\][^"]*min-w-\[44px\][^"]*"[^>]*aria-label="Tutup"/
  );
  assert.match(html, /class="[^"]*min-h-\[44px\][^"]*">Batal</);
  assert.match(html, /class="[^"]*min-h-\[44px\][^"]*">Simpan Menu</);
});

test('ReportsPage merender kartu transaksi mobile (md:hidden), tabel desktop (hidden md:block), filter 44px, dan tombol Ekspor CSV 44px', () => {
  const html = renderToStaticMarkup(
    React.createElement(ReportsPage, { initialOrders: SAMPLE_ORDERS })
  );

  assert.match(html, /<div class="[^"]*\bmd:hidden\b[^"]*">/);
  assert.match(html, /<div class="[^"]*\bhidden md:block\b[^"]*">/);

  assert.ok(html.includes('PK-1001'));
  assert.ok(html.includes('Budi Santoso'));
  assert.ok(html.includes('Nasi Ayam Geprek Original ×2, Es Teh Manis ×1'));
  assert.ok(html.includes('Rp35.000'));
  assert.ok(html.includes('Selesai'));
  assert.ok(html.includes('tabular-nums'));

  assert.equal(html.includes('focus:outline-none'), false);
  assert.ok(html.includes('focus-visible:ring-2'));
  assert.equal(html.includes('#8C7E73'), false);
  assert.equal(html.includes('—'), false);

  assert.match(html, /class="[^"]*min-h-\[44px\][^"]*">[^<]*<svg[^>]*>.*?<\/svg>Ekspor CSV/);

  const dateInputs = html.match(/<input[^>]*type="date"[^>]*>/g) || [];
  assert.equal(dateInputs.length, 2);
  for (const input of dateInputs) {
    assert.ok(input.includes('min-h-[44px]'));
    assert.equal(input.includes('focus:outline-none'), false);
    assert.ok(input.includes('focus-visible:ring-2'));
  }

  const selectMatches = html.match(/<select[^>]*>/g) || [];
  assert.equal(selectMatches.length, 1);
  assert.ok(selectMatches[0].includes('min-h-[44px]'));
  assert.equal(selectMatches[0].includes('focus:outline-none'), false);
  assert.ok(selectMatches[0].includes('focus-visible:ring-2'));

  const svgIcons = html.match(/<svg[^>]*>/g) || [];
  assert.ok(svgIcons.length > 0);
  for (const svg of svgIcons) {
    assert.ok(svg.includes('aria-hidden="true"'), `SVG harus memiliki aria-hidden="true": ${svg}`);
  }
});

test('MenuManagementPage dan ReportsPage merender pesan keadaan kosong di kartu mobile maupun tabel saat data kosong', () => {
  const emptyMenuHtml = renderToStaticMarkup(React.createElement(MenuManagementPage));
  assert.equal((emptyMenuHtml.match(/Tidak ada menu yang cocok\./g) || []).length, 2);

  const emptyReportHtml = renderToStaticMarkup(React.createElement(ReportsPage));
  assert.equal(
    (emptyReportHtml.match(/Tidak ada transaksi pada filter yang dipilih\./g) || []).length,
    2
  );
  assert.match(emptyReportHtml, /disabled=""[^>]*>[^<]*<svg[^>]*>.*?<\/svg>Ekspor CSV/);
});
