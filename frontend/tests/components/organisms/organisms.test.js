import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

let vite;
let AiInsightSection;
let CashierOrderModal;
let LoginFormCard;
let MenuCard;
let MenuFormModal;
let MobileCartBar;
let OrderCard;
let OrderSuccessBanner;
let OrderTrackerSection;
let ReportFilterBar;
let SalesTrendChart;
let StorefrontHeader;
let TopMenusCard;

before(async () => {
  vite = await createServer({
    server: { middlewareMode: true, watch: null },
    optimizeDeps: { noDiscovery: true },
    logLevel: 'silent',
  });
  ({
    AiInsightSection,
    CashierOrderModal,
    LoginFormCard,
    MenuCard,
    MenuFormModal,
    MobileCartBar,
    OrderCard,
    OrderSuccessBanner,
    OrderTrackerSection,
    ReportFilterBar,
    SalesTrendChart,
    StorefrontHeader,
    TopMenusCard,
  } = await vite.ssrLoadModule('/src/components/organisms/index.js'));
});

after(async () => {
  await vite?.close();
});

test('Organisms storefront (StorefrontHeader, MenuCard, OrderTrackerSection, OrderSuccessBanner, MobileCartBar) merender dengan benar', () => {
  const headerHtml = renderToStaticMarkup(
    React.createElement(StorefrontHeader, {
      showTracker: true,
      onToggleTracker: () => {},
      onOpenLogin: () => {},
    })
  );
  assert.ok(headerHtml.includes('PesanKu'));
  assert.ok(headerHtml.includes('aria-expanded="true"'));

  const cardHtml = renderToStaticMarkup(
    React.createElement(MenuCard, {
      menu: {
        id: 'm1',
        name: 'Nasi Ayam Geprek Original',
        category: 'Makanan',
        price: 15000,
        available: true,
        description: 'Sambal bawang',
      },
      qty: 1,
      isRecommended: true,
      onUpdateQty: () => {},
    })
  );
  assert.ok(cardHtml.includes('Nasi Ayam Geprek Original'));
  assert.ok(cardHtml.includes('Favorit'));
  assert.ok(cardHtml.includes('Rp15.000'));

  const trackerHtml = renderToStaticMarkup(
    React.createElement(OrderTrackerSection, {
      trackCode: 'INVALID',
      trackError: 'Format kode pesanan tidak valid.',
      trackedOrder: null,
      onTrackCodeChange: () => {},
      onSubmit: () => {},
    })
  );
  assert.ok(trackerHtml.includes('Lacak Status Pesanan'));
  assert.ok(trackerHtml.includes('aria-describedby="track-order-code-error"'));
  assert.ok(trackerHtml.includes('Format kode pesanan tidak valid.'));

  const bannerHtml = renderToStaticMarkup(
    React.createElement(OrderSuccessBanner, {
      order: { code: 'PK-1009', totalAmount: 30000 },
      onTrackOrder: () => {},
    })
  );
  assert.ok(bannerHtml.includes('PK-1009'));
  assert.ok(bannerHtml.includes('Pantau Status'));

  const barHtml = renderToStaticMarkup(
    React.createElement(MobileCartBar, {
      totalItems: 2,
      totalAmount: 30000,
      sheetOpen: false,
      onOpenSheet: () => {},
    })
  );
  assert.ok(barHtml.includes('2 Item'));
  assert.ok(barHtml.includes('Lihat Pesanan'));
});

test('Organisms dashboard dan admin (SalesTrendChart, TopMenusCard, AiInsightSection, OrderCard, ReportFilterBar, modals) merender dengan benar', () => {
  const chartHtml = renderToStaticMarkup(
    React.createElement(SalesTrendChart, {
      dailySales: [{ date: '2026-11-23', revenue: 95000 }],
    })
  );
  assert.ok(chartHtml.includes('Tren Penjualan 5 Hari Terakhir'));
  assert.ok(chartHtml.includes('95rb'));

  const topHtml = renderToStaticMarkup(
    React.createElement(TopMenusCard, {
      topMenus: [{ name: 'Ayam Geprek', qty: 12, revenue: 180000 }],
    })
  );
  assert.ok(topHtml.includes('Menu Terlaris'));
  assert.ok(topHtml.includes('12 porsi'));

  const aiHtml = renderToStaticMarkup(
    React.createElement(AiInsightSection, {
      loadingAi: false,
      aiError: '',
      aiInsight: { summary: 'Penjualan meningkat.', recommendations: ['Stok ayam ditambah.'] },
      onReload: () => {},
    })
  );
  assert.ok(aiHtml.includes('AI Insight Penjualan'));
  assert.ok(aiHtml.includes('Penjualan meningkat.'));

  const orderCardHtml = renderToStaticMarkup(
    React.createElement(OrderCard, {
      order: {
        id: 'ord-1',
        code: 'PK-1001',
        customerName: 'Budi',
        status: 'Menunggu',
        createdAt: '2026-11-23T05:15:00.000Z',
        items: [{ name: 'Ayam Geprek', qty: 2, subtotal: 30000 }],
        totalAmount: 30000,
      },
      onStatusChange: () => {},
    })
  );
  assert.ok(orderCardHtml.includes('PK-1001'));
  assert.ok(orderCardHtml.includes('Ubah status PK-1001'));

  const filterHtml = renderToStaticMarkup(
    React.createElement(ReportFilterBar, {
      startDate: '2026-11-25',
      endDate: '2026-11-20',
      dateError: 'Tanggal akhir tidak boleh lebih awal dari tanggal mulai.',
      statusFilter: 'Semua',
    })
  );
  assert.ok(filterHtml.includes('aria-invalid="true"'));
  assert.ok(filterHtml.includes('Tanggal akhir tidak boleh lebih awal'));

  const loginHtml = renderToStaticMarkup(
    React.createElement(LoginFormCard, {
      email: '',
      password: '',
      fieldErrors: { email: 'Email pemilik wajib diisi.' },
      error: 'Email pemilik wajib diisi.',
    })
  );
  assert.ok(loginHtml.includes('Masuk Pemilik'));
  assert.ok(loginHtml.includes('Email pemilik wajib diisi.'));

  const menuModalHtml = renderToStaticMarkup(
    React.createElement(MenuFormModal, {
      open: true,
      editingId: null,
      form: { name: '', category: 'Makanan', price: '', description: '', available: true },
      fieldErrors: { name: 'Nama menu wajib diisi.' },
      error: 'Nama menu wajib diisi.',
      categories: ['Makanan', 'Minuman'],
      onChangeForm: () => {},
      onSave: () => {},
      onClose: () => {},
    })
  );
  assert.ok(menuModalHtml.includes('Tambah Menu Baru'));
  assert.ok(menuModalHtml.includes('Nama menu wajib diisi.'));

  const cashierModalHtml = renderToStaticMarkup(
    React.createElement(CashierOrderModal, {
      open: true,
      menus: [{ id: 'm1', name: 'Ayam Geprek', price: 15000, available: true }],
      draftCart: { m1: 1 },
      customerName: '',
      notes: '',
      fieldErrors: { customerName: 'Nama pemesan wajib diisi.' },
      error: 'Nama pemesan wajib diisi.',
      totalAmount: 15000,
      onCustomerNameChange: () => {},
      onNotesChange: () => {},
      onAdjustQty: () => {},
      onSubmit: () => {},
      onClose: () => {},
    })
  );
  assert.ok(cashierModalHtml.includes('Catat Pesanan Baru (Kasir)'));
  assert.ok(cashierModalHtml.includes('Nama pemesan wajib diisi.'));
});
