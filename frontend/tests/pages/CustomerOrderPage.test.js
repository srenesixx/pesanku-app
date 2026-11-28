import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

let vite;
let CustomerOrderPage;
let subscribeMediaQuery;
let submitCustomerOrder;

before(async () => {
  vite = await createServer({
    server: { middlewareMode: true, watch: null },
    optimizeDeps: { noDiscovery: true },
    logLevel: 'silent',
  });
  ({ default: CustomerOrderPage, subscribeMediaQuery, submitCustomerOrder } =
    await vite.ssrLoadModule('/src/pages/CustomerOrderPage.jsx'));
});

after(async () => {
  await vite?.close();
});

test('CustomerOrderPage SSR fallback merender bar mengambang dan desktop matchMedia stub merender tepat 1 instance form checkout', () => {
  const mobileHtml = renderToStaticMarkup(
    React.createElement(CustomerOrderPage, { onOpenLogin: () => {} })
  );

  assert.ok(mobileHtml.includes('Buka Ringkasan'));
  assert.ok(mobileHtml.includes('pb-28 lg:pb-8'));
  assert.equal((mobileHtml.match(/id="customer-name"/g) || []).length, 0);
  assert.equal(mobileHtml.includes('focus:outline-none'), false);
  assert.equal(mobileHtml.includes('#8C7E73'), false);
  assert.equal(mobileHtml.includes('—'), false);

  const prevWindow = globalThis.window;
  globalThis.window = {
    matchMedia(query) {
      assert.equal(query, '(min-width: 1024px)');
      return {
        matches: true,
        addEventListener() {},
        removeEventListener() {},
      };
    },
  };

  let desktopHtml = '';
  try {
    desktopHtml = renderToStaticMarkup(
      React.createElement(CustomerOrderPage, { onOpenLogin: () => {} })
    );
  } finally {
    if (prevWindow === undefined) {
      delete globalThis.window;
    } else {
      globalThis.window = prevWindow;
    }
  }

  assert.equal((desktopHtml.match(/id="customer-name"/g) || []).length, 1);
  assert.equal((desktopHtml.match(/id="customer-notes"/g) || []).length, 1);
  assert.ok(desktopHtml.includes('Pesanan Anda'));
  assert.ok(desktopHtml.includes('Keranjang masih kosong'));
  assert.equal(desktopHtml.includes('Buka Ringkasan'), false);
  assert.equal(desktopHtml.includes('Lihat Pesanan'), false);
});

test('subscribeMediaQuery memperbarui status saat media query berubah dan melepas listener saat cleanup', () => {
  const noWin = subscribeMediaQuery('(min-width: 1024px)', () => {}, undefined);
  assert.equal(noWin.matches, false);
  noWin.unsubscribe();

  const listeners = {};
  const mockWin = {
    matchMedia() {
      return {
        matches: false,
        addEventListener(type, fn) {
          listeners[type] = fn;
        },
        removeEventListener(type, fn) {
          if (listeners[type] === fn) delete listeners[type];
        },
      };
    },
  };

  const updates = [];
  const sub = subscribeMediaQuery('(min-width: 1024px)', (val) => updates.push(val), mockWin);
  assert.equal(sub.matches, false);
  listeners.change({ matches: true });
  listeners.change({ matches: false });
  assert.deepEqual(updates, [true, false]);

  sub.unsubscribe();
  assert.equal(listeners.change, undefined);
});

test('submitCustomerOrder menutup sheet dan mereset keranjang saat orderApi.create berhasil, serta menjaga sheet tetap terbuka saat gagal', async () => {
  const sheetStates = [];
  const submittingStates = [];
  let lastOrder = null;
  let cart = { m1: 2 };
  let customerName = 'Budi';
  let notes = 'Pedas';
  let error = 'old error';

  await submitCustomerOrder({
    createOrder: async (payload) => {
      assert.equal(payload.customerName, 'Budi');
      assert.equal(payload.notes, 'Pedas');
      return { id: 'ord-1', code: 'PK-1001', totalAmount: 30000 };
    },
    customerName,
    notes,
    cartItems: [{ menuId: 'm1', name: 'Ayam Geprek', price: 15000, qty: 2 }],
    setError: (v) => {
      error = v;
    },
    setSubmitting: (v) => submittingStates.push(v),
    setLastOrder: (v) => {
      lastOrder = v;
    },
    setCart: (v) => {
      cart = v;
    },
    setCustomerName: (v) => {
      customerName = v;
    },
    setNotes: (v) => {
      notes = v;
    },
    setSheetOpen: (v) => sheetStates.push(v),
  });

  assert.equal(error, '');
  assert.deepEqual(submittingStates, [true, false]);
  assert.deepEqual(sheetStates, [false]);
  assert.equal(lastOrder?.code, 'PK-1001');
  assert.deepEqual(cart, {});
  assert.equal(customerName, '');
  assert.equal(notes, '');

  const failSheetStates = [];
  let failError = '';
  await submitCustomerOrder({
    createOrder: async () => {
      throw new Error('Nama pemesan wajib diisi.');
    },
    customerName: '',
    notes: '',
    cartItems: [{ menuId: 'm1', name: 'Ayam Geprek', price: 15000, qty: 1 }],
    setError: (v) => {
      failError = v;
    },
    setSubmitting: () => {},
    setLastOrder: () => {
      assert.fail('setLastOrder should not run on error');
    },
    setCart: () => {
      assert.fail('setCart should not run on error');
    },
    setCustomerName: () => {},
    setNotes: () => {},
    setSheetOpen: (v) => failSheetStates.push(v),
  });

  assert.equal(failError, 'Nama pemesan wajib diisi.');
  assert.deepEqual(failSheetStates, []);
});
