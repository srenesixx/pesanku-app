import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

let vite;
let LoginPage;
let OrdersPage;
let DashboardPage;

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

const SAMPLE_SUMMARY = {
  totalRevenue: 450000,
  totalTransactions: 18,
  activeOrders: 3,
  topMenus: [
    {
      name: 'Nasi Ayam Geprek Sambal Matah Spesial Jumbo',
      qty: 24,
      revenue: 360000,
    },
  ],
  dailySales: [
    { date: '2026-11-19', revenue: 80000 },
    { date: '2026-11-20', revenue: 95000 },
    { date: '2026-11-21', revenue: 70000 },
    { date: '2026-11-22', revenue: 110000 },
    { date: '2026-11-23', revenue: 95000 },
  ],
};

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
  ({ default: LoginPage } = await vite.ssrLoadModule('/src/pages/LoginPage.jsx'));
  ({ default: OrdersPage } = await vite.ssrLoadModule('/src/pages/OrdersPage.jsx'));
  ({ default: DashboardPage } = await vite.ssrLoadModule('/src/pages/DashboardPage.jsx'));
});

after(async () => {
  await vite?.close();
});

test('LoginPage dibungkus landmark <main>, memakai padding responsif, footer flex-wrap, dan tombol min-h-[44px]', () => {
  const html = renderToStaticMarkup(
    React.createElement(LoginPage, { onSuccess: () => {}, onBack: () => {} })
  );

  assert.match(html, /^<main\b[^>]*class="[^"]*py-8 sm:py-10[^"]*"[^>]*>/);
  assert.ok(html.includes('</main>'));
  assert.ok(html.includes('p-5 sm:p-7'));

  assert.match(html, /class="[^"]*min-h-\[44px\][^"]*">[^<]*<svg[^>]*>.*?<\/svg>Kembali ke Halaman Pembeli/);
  assert.match(html, /<button[^>]*type="submit"[^>]*class="[^"]*min-h-\[44px\][^"]*"[^>]*>Masuk ke Dashboard<\/button>/);
  assert.match(html, /class="[^"]*min-h-\[44px\][^"]*">Isi otomatis \(pemilik@maknyus\.id\)<\/button>/);

  assert.match(html, /class="[^"]*\bflex-wrap\b[^"]*"><span>Akun uji lokal:<\/span>/);

  assert.equal(html.includes('focus:outline-none'), false);
  assert.ok(html.includes('focus-visible:ring-2'));
  assert.equal(html.includes('—'), false);
  assertAllSvgsHidden(html);
});

test('OrdersPage merender filter & Catat Pesanan Baru 44px, select 44px, kontras #6B5E54, dan fokus aksesibel', () => {
  const html = renderToStaticMarkup(
    React.createElement(OrdersPage, { initialOrders: SAMPLE_ORDERS, initialMenus: SAMPLE_MENUS })
  );

  assert.match(html, /class="[^"]*min-h-\[44px\][^"]*">[^<]*<svg[^>]*>.*?<\/svg>Catat Pesanan Baru/);

  for (const status of ['Semua', 'Menunggu', 'Diproses', 'Selesai', 'Dibatalkan']) {
    assert.match(
      html,
      new RegExp(`class="[^"]*min-h-\\[44px\\][^"]*">${status}</button>`),
      `Tombol filter ${status} harus memiliki min-h-[44px]`
    );
  }

  const selectMatch = html.match(/<select[^>]*aria-label="Ubah status PK-1001"[^>]*>/);
  assert.ok(selectMatch, 'Select ubah status harus ada');
  assert.ok(selectMatch[0].includes('min-h-[44px]'));
  assert.equal(selectMatch[0].includes('focus:outline-none'), false);
  assert.ok(selectMatch[0].includes('focus-visible:ring-2'));

  assert.equal(html.includes('#8C7E73'), false);
  assert.ok(html.includes('text-xs text-[#6B5E54]'));
  assert.equal(html.includes('focus:outline-none'), false);
  assert.equal(html.includes('—'), false);
  assertAllSvgsHidden(html);
});

test('OrdersPage modal kasir merender dialog aksesibel, max-h-[90dvh], label terhubung, tombol -/+ 40px, dan aksi 44px', () => {
  const html = renderToStaticMarkup(
    React.createElement(OrdersPage, {
      initialOrders: SAMPLE_ORDERS,
      initialMenus: SAMPLE_MENUS,
      initialModalOpen: true,
    })
  );

  assert.ok(html.includes('role="dialog"'));
  assert.ok(html.includes('aria-modal="true"'));
  assert.match(html, /aria-labelledby="order-modal-title"/);
  assert.ok(html.includes('id="order-modal-title"'));
  assert.ok(html.includes('max-h-[90dvh]'));

  for (const fieldId of ['order-customer-name', 'order-notes']) {
    assert.ok(html.includes(`for="${fieldId}"`), `Label untuk ${fieldId} harus terhubung`);
    assert.ok(html.includes(`id="${fieldId}"`), `Input ${fieldId} harus memiliki id`);
  }

  assert.match(
    html,
    /aria-label="Kurangi Nasi Ayam Geprek Sambal Bawang"[^>]*class="[^"]*min-w-\[40px\][^"]*min-h-\[40px\]|class="[^"]*min-w-\[40px\][^"]*min-h-\[40px\][^"]*"[^>]*aria-label="Kurangi Nasi Ayam Geprek Sambal Bawang"/
  );
  assert.match(
    html,
    /aria-label="Tambah Nasi Ayam Geprek Sambal Bawang"[^>]*class="[^"]*min-w-\[40px\][^"]*min-h-\[40px\]|class="[^"]*min-w-\[40px\][^"]*min-h-\[40px\][^"]*"[^>]*aria-label="Tambah Nasi Ayam Geprek Sambal Bawang"/
  );

  assert.match(
    html,
    /aria-label="Tutup"[^>]*class="[^"]*min-h-\[44px\][^"]*min-w-\[44px\]|class="[^"]*min-h-\[44px\][^"]*min-w-\[44px\][^"]*"[^>]*aria-label="Tutup"/
  );
  assert.match(html, /class="[^"]*min-h-\[44px\][^"]*">Batal<\/button>/);
  assert.match(html, /<button[^>]*type="submit"[^>]*class="[^"]*min-h-\[44px\][^"]*"[^>]*>Simpan Pesanan<\/button>/);

  assert.equal(html.includes('focus:outline-none'), false);
  assert.ok(html.includes('focus-visible:ring-2'));
  assertAllSvgsHidden(html);
});

test('DashboardPage dengan initialSummary merender MetricCard Menu Terlaris dengan line-clamp-2, grafik gap-1.5 sm:gap-3, dan tombol AI 44px', () => {
  const html = renderToStaticMarkup(
    React.createElement(DashboardPage, { initialSummary: SAMPLE_SUMMARY })
  );

  assert.ok(html.includes('Nasi Ayam Geprek Sambal Matah Spesial Jumbo'));
  const metricCardMatch = html.match(
    /<span[^>]*>Menu Terlaris<\/span>[\s\S]*?<\/div><p class="([^"]*)">Nasi Ayam Geprek Sambal Matah Spesial Jumbo<\/p>/
  );
  assert.ok(metricCardMatch, 'MetricCard Menu Terlaris harus dirender');
  assert.ok(metricCardMatch[1].includes('line-clamp-2'));
  assert.ok(metricCardMatch[1].includes('break-words'));
  assert.equal(/\btruncate\b/.test(metricCardMatch[1]), false);

  assert.match(html, /<div class="grid grid-cols-5 gap-1\.5 sm:gap-3 items-end h-44 pt-4">/);
  assert.ok(html.includes('text-[11px] sm:text-xs font-medium text-[#6B5E54]'));

  assert.match(
    html,
    /class="[^"]*min-h-\[44px\][^"]*inline-flex items-center[^"]*px-2[^"]*">Muat Ulang Insight<\/button>/
  );
  assert.match(
    html,
    /class="[^"]*min-h-\[44px\][^"]*inline-flex items-center[^"]*px-2[^"]*">Uji Fallback AI<\/button>/
  );

  assert.equal(html.includes('—'), false);
  assertAllSvgsHidden(html);
});
