import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

let vite;
let AdminLayout;

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

function getText(node) {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(getText).join('');
  if (typeof node === 'object' && node.props?.children !== undefined) {
    return getText(node.props.children);
  }
  return '';
}

before(async () => {
  vite = await createServer({
    server: { middlewareMode: true, watch: null },
    optimizeDeps: { noDiscovery: true },
    logLevel: 'silent',
  });
  ({ default: AdminLayout } = await vite.ssrLoadModule('/src/components/AdminLayout.jsx'));
});

after(async () => {
  await vite?.close();
});

test('AdminLayout merender 4 tab navigasi dalam grid responsif 2/4 kolom tanpa overflow-x-auto dan semua tombol min-h-[44px]', () => {
  const tree = AdminLayout({
    activeTab: 'orders',
    onSelectTab: () => {},
    user: { name: 'Ibu Sari' },
    onLogout: () => {},
    onOpenStorefront: () => {},
    children: React.createElement('div', null, 'Konten Admin'),
  });

  const navs = findElements(tree, (n) => n.type === 'nav');
  assert.equal(navs.length, 1);
  const navClass = navs[0].props.className || '';
  assert.ok(navClass.includes('grid'));
  assert.ok(navClass.includes('grid-cols-2'));
  assert.ok(navClass.includes('sm:grid-cols-4'));
  assert.ok(navClass.includes('lg:flex'));
  assert.ok(navClass.includes('lg:flex-col'));
  assert.equal(navClass.includes('overflow-x-auto'), false);

  const navButtons = findElements(navs[0], (n) => n.type === 'button');
  assert.deepEqual(
    navButtons.map((btn) => getText(btn)),
    ['Dashboard', 'Pesanan', 'Kelola Menu', 'Riwayat & Laporan']
  );

  for (const btn of navButtons) {
    assert.ok((btn.props.className || '').includes('min-h-[44px]'));
    assert.ok((btn.props.className || '').includes('justify-center'));
    assert.ok((btn.props.className || '').includes('lg:justify-start'));
  }

  assert.equal(navButtons[0].props['aria-current'], undefined);
  assert.equal(navButtons[1].props['aria-current'], 'page');
  assert.equal(navButtons[2].props['aria-current'], undefined);
  assert.equal(navButtons[3].props['aria-current'], undefined);
});

test('AdminLayout menyediakan tombol Lihat Tampilan Pembeli dan Keluar pada bar < lg dengan target sentuh 44px', () => {
  const tree = AdminLayout({
    activeTab: 'dashboard',
    onSelectTab: () => {},
    user: { name: 'Ibu Sari' },
    onLogout: () => {},
    onOpenStorefront: () => {},
    children: React.createElement('p', null, 'Isi'),
  });

  const aside = findElements(tree, (n) => n.type === 'aside')[0];
  assert.ok((aside.props.className || '').includes('lg:w-64'));

  const mobileActions = findElements(
    aside,
    (n) => typeof n.props?.className === 'string' && n.props.className.includes('lg:hidden') && n.type === 'div'
  )[0];
  assert.ok(mobileActions, 'Kontainer aksi < lg harus tersedia');

  const mobileStorefrontBtn = findElements(
    mobileActions,
    (n) => n.type === 'button' && n.props?.['aria-label'] === 'Lihat Tampilan Pembeli'
  )[0];
  assert.ok(mobileStorefrontBtn, 'Tombol Lihat Tampilan Pembeli harus tersedia di < lg');
  assert.ok((mobileStorefrontBtn.props.className || '').includes('min-h-[44px]'));

  const mobileStorefrontHtml = renderToStaticMarkup(mobileStorefrontBtn);
  assert.ok(mobileStorefrontHtml.includes('Pembeli'));
  assert.ok(mobileStorefrontHtml.includes('Lihat Pembeli'));

  const mobileLogoutBtn = findElements(
    mobileActions,
    (n) => n.type === 'button' && (n.props?.['aria-label'] === 'Keluar' || getText(n).includes('Keluar'))
  )[0];
  assert.ok(mobileLogoutBtn, 'Tombol Keluar harus tersedia di < lg');
  assert.ok((mobileLogoutBtn.props.className || '').includes('min-h-[44px]'));
});

test('AdminLayout merender sidebar footer lg+, children di main, dan memicu callback navigasi serta aksi', () => {
  const selectedTabs = [];
  let storefrontClicks = 0;
  let logoutClicks = 0;

  const props = {
    activeTab: 'menus',
    onSelectTab: (id) => selectedTabs.push(id),
    user: { name: 'Pak Budi' },
    onLogout: () => {
      logoutClicks += 1;
    },
    onOpenStorefront: () => {
      storefrontClicks += 1;
    },
    children: React.createElement('section', null, 'Panel Menu'),
  };

  const tree = AdminLayout(props);
  const html = renderToStaticMarkup(React.createElement(AdminLayout, props));

  assert.ok(html.includes('Pak Budi'));
  assert.ok(html.includes('Lihat Tampilan Pembeli'));
  assert.ok(html.includes('Keluar'));
  assert.ok(html.includes('Panel Menu'));
  assert.ok(html.includes('aria-current="page"'));
  assert.equal(html.includes('#8C7E73'), false);
  assert.equal(html.includes('—'), false);
  assert.equal(html.includes('focus:outline-none'), false);

  const navButtons = findElements(findElements(tree, (n) => n.type === 'nav')[0], (n) => n.type === 'button');
  navButtons[0].props.onClick();
  navButtons[3].props.onClick();
  assert.deepEqual(selectedTabs, ['dashboard', 'reports']);

  const storefrontButtons = findElements(
    tree,
    (n) => n.type === 'button' && (n.props?.['aria-label'] === 'Lihat Tampilan Pembeli' || getText(n).includes('Lihat Tampilan Pembeli'))
  );
  assert.equal(storefrontButtons.length, 2);
  storefrontButtons[0].props.onClick();
  storefrontButtons[1].props.onClick();
  assert.equal(storefrontClicks, 2);

  const logoutButtons = findElements(
    tree,
    (n) => n.type === 'button' && (n.props?.['aria-label'] === 'Keluar' || getText(n).includes('Keluar'))
  );
  assert.equal(logoutButtons.length, 2);
  logoutButtons[0].props.onClick();
  logoutButtons[1].props.onClick();
  assert.equal(logoutClicks, 2);

  const iconsWithoutAriaHidden = findElements(
    tree,
    (n) => typeof n.type === 'object' && n.props?.['aria-hidden'] !== 'true'
  );
  assert.equal(iconsWithoutAriaHidden.length, 0);
});
