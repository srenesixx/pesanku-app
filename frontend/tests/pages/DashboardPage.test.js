import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

let vite;
let DashboardPage;

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
  ({ default: DashboardPage } = await vite.ssrLoadModule('/src/pages/DashboardPage.jsx'));
});

after(async () => {
  await vite?.close();
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
