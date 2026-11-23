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

  const backBtnMatch = html.match(/<button\b([^>]*)>[^<]*<svg[^>]*>.*?<\/svg>Kembali ke Halaman Pembeli<\/button>/);
  assert.ok(backBtnMatch && backBtnMatch[1].includes('min-h-[44px]'));

  const submitBtnMatch = html.match(/<button\b([^>]*)>Masuk ke Dashboard<\/button>/);
  assert.ok(submitBtnMatch, 'Tombol submit harus ada');
  assert.ok(submitBtnMatch[1].includes('type="submit"'));
  assert.ok(submitBtnMatch[1].includes('min-h-[44px]'));
  assert.ok(submitBtnMatch[1].includes('disabled:cursor-not-allowed'));
  assert.ok(submitBtnMatch[1].includes('disabled:hover:bg-[#C84B24]'));

  const autofillBtnMatch = html.match(/<button\b([^>]*)>Isi otomatis \(pemilik@maknyus\.id\)<\/button>/);
  assert.ok(autofillBtnMatch && autofillBtnMatch[1].includes('min-h-[44px]'));

  assert.match(html, /class="[^"]*\bflex-wrap\b[^"]*"><span>Akun uji lokal:<\/span>/);

  assert.equal(html.includes('focus:outline-none'), false);
  assert.equal(html.includes('focus-visible:ring-[#C84B24]/30'), false);
  assert.ok(html.includes('focus-visible:ring-2'));
  assert.ok(html.includes('focus-visible:ring-[#C84B24]'));
  assert.equal(html.includes('—'), false);
  assertAllSvgsHidden(html);
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
  assert.ok(html.includes('motion-reduce:transition-none'));

  for (const label of ['Muat Ulang Insight', 'Uji Fallback AI']) {
    const aiBtnMatch = html.match(new RegExp(`<button\\b([^>]*)>${label}</button>`));
    assert.ok(aiBtnMatch, `Tombol ${label} harus ada`);
    assert.ok(aiBtnMatch[1].includes('min-h-[44px]'));
    assert.ok(aiBtnMatch[1].includes('inline-flex'));
    assert.ok(aiBtnMatch[1].includes('items-center'));
    assert.ok(aiBtnMatch[1].includes('px-2'));
    if (label === 'Muat Ulang Insight') {
      assert.ok(aiBtnMatch[1].includes('-ml-2 sm:ml-0'));
    }
  }

  assert.equal(html.includes('#8C7E73'), false);
  assert.equal(html.includes('focus:outline-none'), false);
  assert.equal(html.includes('—'), false);
  assertAllSvgsHidden(html);
});
