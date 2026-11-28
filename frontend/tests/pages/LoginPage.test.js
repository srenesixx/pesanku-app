import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

let vite;
let LoginPage;

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
