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

function extractDivByClass(html, classNeedle) {
  const escaped = classNeedle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const openMatch = new RegExp(`<div class="[^"]*\\b${escaped}\\b[^"]*">`).exec(html);
  assert.ok(openMatch, `Kontainer dengan class "${classNeedle}" tidak ditemukan`);

  const start = openMatch.index;
  const tagRe = /<\/?div\b[^>]*>/g;
  tagRe.lastIndex = start;

  let depth = 0;
  let match;
  while ((match = tagRe.exec(html)) !== null) {
    if (match[0].startsWith('</div')) {
      depth -= 1;
      if (depth === 0) {
        return html.slice(start, tagRe.lastIndex);
      }
    } else {
      depth += 1;
    }
  }
  assert.fail(`Tag penutup </div> tidak seimbang untuk "${classNeedle}"`);
}

function getClassAttr(tag) {
  const match = tag.match(/class="([^"]*)"/);
  return match ? match[1] : '';
}

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

test('MenuManagementPage merender kartu mobile (md:hidden) dan tabel desktop (hidden md:block) dengan isi, tombol 44px, dan fokus aksesibel', () => {
  const html = renderToStaticMarkup(
    React.createElement(MenuManagementPage, { initialMenus: SAMPLE_MENUS })
  );

  assert.equal(html.includes('focus:outline-none'), false);
  assert.ok(html.includes('focus-visible:ring-2'));
  assert.equal(html.includes('#8C7E73'), false);
  assert.equal(html.includes('—'), false);

  assert.match(html, /<button[^>]*class="[^"]*min-h-\[44px\][^"]*"[^>]*>[^<]*<svg[^>]*>.*?<\/svg>Tambah Menu<\/button>/);

  const searchInputMatch = html.match(/<input[^>]*placeholder="Cari nama menu\.\.\."[^>]*>/);
  assert.ok(searchInputMatch, 'Input cari menu harus ada');
  assert.ok(searchInputMatch[0].includes('min-h-[44px]'));
  assert.equal(searchInputMatch[0].includes('focus:outline-none'), false);
  assert.ok(searchInputMatch[0].includes('focus-visible:ring-2'));

  const mobileHtml = extractDivByClass(html, 'md:hidden');
  const desktopHtml = extractDivByClass(html, 'hidden md:block');

  assert.ok(mobileHtml.includes('<article'));
  assert.equal(mobileHtml.includes('<table'), false);
  assert.ok(desktopHtml.includes('<table'));
  assert.equal(desktopHtml.includes('<article'), false);

  for (const [label, section] of [
    ['mobile (md:hidden)', mobileHtml],
    ['desktop (hidden md:block)', desktopHtml],
  ]) {
    assert.ok(section.includes('Nasi Ayam Geprek Original'), `${label} harus memuat nama menu 1`);
    assert.ok(section.includes('Es Teh Manis'), `${label} harus memuat nama menu 2`);
    assert.ok(section.includes('Makanan'), `${label} harus memuat kategori Makanan`);
    assert.ok(section.includes('Minuman'), `${label} harus memuat kategori Minuman`);
    assert.ok(section.includes('Ayam crispy sambal bawang pedas.'), `${label} harus memuat deskripsi`);
    assert.ok(section.includes('Rp15.000'), `${label} harus memuat harga Rp15.000`);
    assert.ok(section.includes('Rp5.000'), `${label} harus memuat harga Rp5.000`);
    assert.ok(section.includes('tabular-nums'), `${label} harus memakai tabular-nums`);
    assert.ok(section.includes('Tersedia'), `${label} harus memuat status Tersedia`);
    assert.ok(section.includes('Habis'), `${label} harus memuat status Habis`);

    const buttons = section.match(/<button\b[^>]*>/g) || [];
    assert.equal(buttons.length, 6, `${label} harus memiliki 6 tombol (2 status + 2 Ubah + 2 Hapus)`);
    for (const btn of buttons) {
      assert.ok(getClassAttr(btn).includes('min-h-[44px]'), `${label} tombol wajib min-h-[44px]: ${btn}`);
    }

    const availBtn = buttons.find((b) =>
      b.includes('aria-label="Tersedia, ubah status Nasi Ayam Geprek Original"')
    );
    assert.ok(availBtn, `${label} tombol status Tersedia harus memiliki aria-label`);
    assert.ok(availBtn.includes('aria-pressed="true"'), `${label} tombol Tersedia harus aria-pressed="true"`);

    const unavailBtn = buttons.find((b) =>
      b.includes('aria-label="Habis, ubah status Es Teh Manis"')
    );
    assert.ok(unavailBtn, `${label} tombol status Habis harus memiliki aria-label`);
    assert.ok(unavailBtn.includes('aria-pressed="false"'), `${label} tombol Habis harus aria-pressed="false"`);

    for (const menuName of ['Nasi Ayam Geprek Original', 'Es Teh Manis']) {
      for (const action of ['Ubah', 'Hapus']) {
        const actionBtn = buttons.find((b) => b.includes(`aria-label="${action} ${menuName}"`));
        assert.ok(actionBtn, `${label} tombol "${action} ${menuName}" harus ada`);
        const cls = getClassAttr(actionBtn);
        assert.ok(cls.includes('min-h-[44px]'), `${label} ${action} wajib min-h-[44px]`);
        assert.ok(cls.includes('min-w-[44px]'), `${label} ${action} wajib min-w-[44px]`);
      }
    }
  }

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
  assert.ok(html.includes('tabindex="-1"'));
  assert.ok(html.includes('cursor-pointer'));
  assert.match(html, /aria-labelledby="menu-modal-title"/);
  assert.ok(html.includes('id="menu-modal-title"'));
  assert.ok(html.includes('max-h-[90dvh]'));
  assert.ok(html.includes('overflow-y-auto'));
  assert.ok(html.includes('grid-cols-1 sm:grid-cols-2'));
  assert.equal(html.includes('focus:outline-none'), false);

  for (const fieldId of ['menu-name', 'menu-category', 'menu-price', 'menu-description', 'menu-available']) {
    assert.ok(html.includes(`for="${fieldId}"`), `Label untuk ${fieldId} harus terhubung`);
    assert.ok(html.includes(`id="${fieldId}"`), `Kontrol ${fieldId} harus memiliki id`);
  }

  const availableLabelMatch = html.match(/<label\b[^>]*for="menu-available"[^>]*>/);
  assert.ok(availableLabelMatch, 'Label menu-available harus ada');
  assert.ok(
    getClassAttr(availableLabelMatch[0]).includes('min-h-[44px]'),
    'Label checkbox menu-available harus memiliki min-h-[44px]'
  );

  assert.match(
    html,
    /aria-label="Tutup"[^>]*class="[^"]*min-h-\[44px\][^"]*min-w-\[44px\]|class="[^"]*min-h-\[44px\][^"]*min-w-\[44px\][^"]*"[^>]*aria-label="Tutup"/
  );
  assert.match(html, /class="[^"]*min-h-\[44px\][^"]*">Batal</);
  assert.match(html, /class="[^"]*min-h-\[44px\][^"]*">Simpan Menu</);
});

test('ReportsPage merender kartu transaksi mobile (md:hidden) dan tabel desktop (hidden md:block), filter 44px, serta tombol Ekspor CSV', () => {
  const html = renderToStaticMarkup(
    React.createElement(ReportsPage, { initialOrders: SAMPLE_ORDERS })
  );

  assert.equal(html.includes('focus:outline-none'), false);
  assert.ok(html.includes('focus-visible:ring-2'));
  assert.equal(html.includes('#8C7E73'), false);
  assert.equal(html.includes('—'), false);

  const exportBtnMatch = html.match(/<button\b[^>]*>[^<]*<svg[^>]*>.*?<\/svg>Ekspor CSV<\/button>/);
  assert.ok(exportBtnMatch, 'Tombol Ekspor CSV harus ada');
  const exportBtnClass = getClassAttr(exportBtnMatch[0]);
  assert.ok(exportBtnClass.includes('min-h-[44px]'), 'Tombol Ekspor CSV wajib min-h-[44px]');
  assert.ok(
    exportBtnClass.includes('disabled:cursor-not-allowed'),
    'Tombol Ekspor CSV wajib disabled:cursor-not-allowed'
  );

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

  const mobileHtml = extractDivByClass(html, 'md:hidden');
  const desktopHtml = extractDivByClass(html, 'hidden md:block');

  assert.ok(mobileHtml.includes('<article'));
  assert.equal(mobileHtml.includes('<table'), false);
  assert.ok(desktopHtml.includes('<table'));
  assert.equal(desktopHtml.includes('<article'), false);

  for (const [label, section] of [
    ['mobile (md:hidden)', mobileHtml],
    ['desktop (hidden md:block)', desktopHtml],
  ]) {
    assert.ok(section.includes('PK-1001'), `${label} harus memuat kode transaksi`);
    assert.ok(section.includes('Budi Santoso'), `${label} harus memuat nama pelanggan`);
    assert.ok(
      section.includes('Nasi Ayam Geprek Original ×2, Es Teh Manis ×1'),
      `${label} harus memuat rincian item`
    );
    assert.ok(section.includes('Rp35.000'), `${label} harus memuat total Rp35.000`);
    assert.ok(section.includes('Selesai'), `${label} harus memuat StatusBadge Selesai`);
    assert.ok(section.includes('tabular-nums'), `${label} harus memakai tabular-nums`);
    assert.ok(section.includes('2026'), `${label} harus memuat waktu transaksi terformat`);
  }

  const svgIcons = html.match(/<svg[^>]*>/g) || [];
  assert.ok(svgIcons.length > 0);
  for (const svg of svgIcons) {
    assert.ok(svg.includes('aria-hidden="true"'), `SVG harus memiliki aria-hidden="true": ${svg}`);
  }
});

test('MenuManagementPage dan ReportsPage merender pesan keadaan kosong di kartu mobile maupun tabel saat data kosong', () => {
  const emptyMenuHtml = renderToStaticMarkup(React.createElement(MenuManagementPage));
  const emptyMenuMobile = extractDivByClass(emptyMenuHtml, 'md:hidden');
  const emptyMenuDesktop = extractDivByClass(emptyMenuHtml, 'hidden md:block');
  assert.ok(emptyMenuMobile.includes('Tidak ada menu yang cocok.'));
  assert.ok(emptyMenuDesktop.includes('Tidak ada menu yang cocok.'));

  const emptyReportHtml = renderToStaticMarkup(React.createElement(ReportsPage));
  const emptyReportMobile = extractDivByClass(emptyReportHtml, 'md:hidden');
  const emptyReportDesktop = extractDivByClass(emptyReportHtml, 'hidden md:block');
  assert.ok(emptyReportMobile.includes('Tidak ada transaksi pada filter yang dipilih.'));
  assert.ok(emptyReportDesktop.includes('Tidak ada transaksi pada filter yang dipilih.'));
  assert.match(emptyReportHtml, /disabled=""[^>]*>[^<]*<svg[^>]*>.*?<\/svg>Ekspor CSV/);
});
