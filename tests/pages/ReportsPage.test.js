import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

let vite;
let ReportsPage;

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
  ({ default: ReportsPage } = await vite.ssrLoadModule('/src/pages/ReportsPage.jsx'));
});

after(async () => {
  await vite?.close();
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

test('ReportsPage merender pesan keadaan kosong di kartu mobile maupun tabel saat data kosong dan menonaktifkan Ekspor CSV', () => {
  const emptyReportHtml = renderToStaticMarkup(React.createElement(ReportsPage));
  const emptyReportMobile = extractDivByClass(emptyReportHtml, 'md:hidden');
  const emptyReportDesktop = extractDivByClass(emptyReportHtml, 'hidden md:block');
  assert.ok(emptyReportMobile.includes('Tidak ada transaksi pada filter yang dipilih.'));
  assert.ok(emptyReportDesktop.includes('Tidak ada transaksi pada filter yang dipilih.'));
  assert.match(emptyReportHtml, /disabled=""[^>]*>[^<]*<svg[^>]*>.*?<\/svg>Ekspor CSV/);
});
