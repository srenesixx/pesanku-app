import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

let vite;
let OrderSummaryPanel;
let CustomerOrderPage;
let subscribeMediaQuery;
let submitCustomerOrder;

function findElements(node, predicate, acc = []) {
  if (!node || typeof node !== 'object') return acc;
  if (Array.isArray(node)) {
    for (const child of node) findElements(child, predicate, acc);
    return acc;
  }
  if (predicate(node)) acc.push(node);
  if (node.props?.children !== undefined) {
    findElements(node.props.children, predicate, acc);
  }
  return acc;
}

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

test('OrderSummaryPanel variant="sheet" merender 2 menu, tombol tutup, scroll fallback di root, kontrol kuantitas, dan form checkout aksesibel', async () => {
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

  assert.match(html, /^<div class="flex flex-col flex-1 min-h-0 overflow-y-auto">/);
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

test('OrderSummaryPanel variant="sidebar" dengan item keranjang merender daftar item, total, dan tanpa tombol tutup', async () => {
  ({ default: OrderSummaryPanel } = await vite.ssrLoadModule('/src/components/OrderSummaryPanel.jsx'));

  const html = renderToStaticMarkup(
    React.createElement(OrderSummaryPanel, {
      cartItems: [
        { menuId: 'm1', name: 'Ayam Geprek', price: 15000, qty: 2 },
        { menuId: 'm2', name: 'Es Teh Manis', price: 5000, qty: 1 },
      ],
      totalItems: 3,
      totalAmount: 35000,
      customerName: 'Siti',
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

  assert.ok(html.includes('Ayam Geprek'));
  assert.ok(html.includes('Rp30.000'));
  assert.ok(html.includes('Total Pembayaran (3 Item)'));
  assert.ok(html.includes('Rp35.000'));
  assert.ok(html.includes('-mx-1 px-1 py-0.5'));
  assert.ok(html.includes('aria-label="Hapus Ayam Geprek"'));
  assert.ok(html.includes('aria-label="Kurangi Ayam Geprek"'));
  assert.ok(html.includes('aria-label="Tambah Ayam Geprek"'));
  assert.equal(html.includes('Tutup ringkasan pesanan'), false);
});

test('OrderSummaryPanel memicu callback onUpdateQty, onClose, onCustomerNameChange, onNotesChange, dan onSubmit dengan argumen tepat', async () => {
  ({ default: OrderSummaryPanel } = await vite.ssrLoadModule('/src/components/OrderSummaryPanel.jsx'));

  const qtyCalls = [];
  const nameCalls = [];
  const notesCalls = [];
  let closeCalls = 0;
  let submitEvent = null;

  const tree = OrderSummaryPanel({
    cartItems: [{ menuId: 'm1', name: 'Ayam Geprek', price: 15000, qty: 2 }],
    totalItems: 2,
    totalAmount: 30000,
    customerName: 'Budi',
    notes: '',
    error: '',
    submitting: false,
    variant: 'sheet',
    onCustomerNameChange: (val) => nameCalls.push(val),
    onNotesChange: (val) => notesCalls.push(val),
    onUpdateQty: (id, delta) => qtyCalls.push([id, delta]),
    onSubmit: (e) => {
      submitEvent = e;
    },
    onClose: () => {
      closeCalls += 1;
    },
  });

  const closeBtn = findElements(tree, (n) => n.props?.['aria-label'] === 'Tutup ringkasan pesanan')[0];
  const removeBtn = findElements(tree, (n) => n.props?.['aria-label'] === 'Hapus Ayam Geprek')[0];
  const decBtn = findElements(tree, (n) => n.props?.['aria-label'] === 'Kurangi Ayam Geprek')[0];
  const incBtn = findElements(tree, (n) => n.props?.['aria-label'] === 'Tambah Ayam Geprek')[0];
  const nameInput = findElements(tree, (n) => n.props?.id === 'customer-name')[0];
  const notesInput = findElements(tree, (n) => n.props?.id === 'customer-notes')[0];
  const formEl = findElements(tree, (n) => n.type === 'form')[0];

  closeBtn.props.onClick();
  removeBtn.props.onClick();
  decBtn.props.onClick();
  incBtn.props.onClick();
  nameInput.props.onChange({ target: { value: 'Siti' } });
  notesInput.props.onChange({ target: { value: 'Tidak pedas' } });
  const fakeEvent = { preventDefault() {} };
  formEl.props.onSubmit(fakeEvent);

  assert.equal(closeCalls, 1);
  assert.deepEqual(qtyCalls, [
    ['m1', -2],
    ['m1', -1],
    ['m1', 1],
  ]);
  assert.deepEqual(nameCalls, ['Siti']);
  assert.deepEqual(notesCalls, ['Tidak pedas']);
  assert.equal(submitEvent, fakeEvent);
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

test('CustomerOrderPage SSR fallback merender bar mengambang dan desktop matchMedia stub merender tepat 1 instance form checkout', async () => {
  ({ default: CustomerOrderPage, subscribeMediaQuery, submitCustomerOrder } = await vite.ssrLoadModule(
    '/src/pages/CustomerOrderPage.jsx'
  ));

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

test('subscribeMediaQuery memperbarui status saat media query berubah dan melepas listener saat cleanup', async () => {
  ({ subscribeMediaQuery } = await vite.ssrLoadModule('/src/pages/CustomerOrderPage.jsx'));

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
  ({ submitCustomerOrder } = await vite.ssrLoadModule('/src/pages/CustomerOrderPage.jsx'));

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
