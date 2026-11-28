import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

let vite;
let AlertBanner;
let Badge;
let BrandMark;
let Button;
let Card;
let Checkbox;
let Input;
let Select;
let StatusBadge;
let Textarea;

before(async () => {
  vite = await createServer({
    server: { middlewareMode: true, watch: null },
    optimizeDeps: { noDiscovery: true },
    logLevel: 'silent',
  });
  ({
    AlertBanner,
    Badge,
    BrandMark,
    Button,
    Card,
    Checkbox,
    Input,
    Select,
    StatusBadge,
    Textarea,
  } = await vite.ssrLoadModule('/src/components/atoms/index.js'));
});

after(async () => {
  await vite?.close();
});

test('Button dan BrandMark merender target sentuh 44px, varian pill, dan ikon tersembunyi', () => {
  const primaryHtml = renderToStaticMarkup(
    React.createElement(Button, { variant: 'primary' }, 'Simpan')
  );
  assert.ok(primaryHtml.includes('min-h-[44px]'));
  assert.ok(primaryHtml.includes('bg-[#C84B24]'));
  assert.ok(primaryHtml.includes('Simpan'));

  const pillHtml = renderToStaticMarkup(
    React.createElement(Button, { variant: 'pill', size: 'pill' }, 'Makanan')
  );
  assert.ok(pillHtml.includes('rounded-full'));
  assert.ok(pillHtml.includes('min-h-[44px]'));

  const brandHtml = renderToStaticMarkup(React.createElement(BrandMark, { size: 'lg' }));
  assert.ok(brandHtml.includes('w-11 h-11'));
  assert.ok(brandHtml.includes('aria-hidden="true"'));
});

test('Input, Select, Textarea, dan Checkbox merender atribut aksesibilitas dan status error', () => {
  const inputHtml = renderToStaticMarkup(
    React.createElement(Input, {
      id: 'email-field',
      value: '',
      error: 'Email wajib diisi.',
      onChange: () => {},
    })
  );
  assert.ok(inputHtml.includes('min-h-[44px]'));
  assert.ok(inputHtml.includes('focus-visible:ring-2'));
  assert.ok(inputHtml.includes('aria-invalid="true"'));
  assert.ok(inputHtml.includes('aria-describedby="email-field-error"'));

  const selectHtml = renderToStaticMarkup(
    React.createElement(
      Select,
      { id: 'cat-field', value: 'Makanan', onChange: () => {} },
      React.createElement('option', { value: 'Makanan' }, 'Makanan')
    )
  );
  assert.ok(selectHtml.includes('min-h-[44px]'));
  assert.ok(selectHtml.includes('focus-visible:ring-[#C84B24]'));

  const textareaHtml = renderToStaticMarkup(
    React.createElement(Textarea, { id: 'desc-field', value: 'Pedas', onChange: () => {} })
  );
  assert.ok(textareaHtml.includes('min-h-[44px]'));
  assert.ok(textareaHtml.includes('focus-visible:ring-[#C84B24]'));

  const checkboxHtml = renderToStaticMarkup(
    React.createElement(Checkbox, {
      id: 'avail-field',
      label: 'Tersedia hari ini',
      checked: true,
      onChange: () => {},
    })
  );
  assert.ok(checkboxHtml.includes('for="avail-field"'));
  assert.ok(checkboxHtml.includes('min-h-[44px]'));
  assert.ok(checkboxHtml.includes('Tersedia hari ini'));
});

test('Badge, StatusBadge, Card, dan AlertBanner merender tone dan landmark peran dengan benar', () => {
  const badgeHtml = renderToStaticMarkup(
    React.createElement(Badge, { tone: 'warm' }, 'Favorit')
  );
  assert.ok(badgeHtml.includes('bg-[#FFF3E8]'));
  assert.ok(badgeHtml.includes('text-[#A93B19]'));

  const statusHtml = renderToStaticMarkup(
    React.createElement(StatusBadge, { status: 'Selesai' })
  );
  assert.ok(statusHtml.includes('Selesai'));
  assert.ok(statusHtml.includes('bg-emerald-50'));

  const cardHtml = renderToStaticMarkup(
    React.createElement(Card, { as: 'section', dashed: true }, 'Konten')
  );
  assert.ok(cardHtml.startsWith('<section'));
  assert.ok(cardHtml.includes('border-dashed'));

  const alertHtml = renderToStaticMarkup(
    React.createElement(AlertBanner, { message: 'Terjadi kesalahan validasi.' })
  );
  assert.ok(alertHtml.includes('role="alert"'));
  assert.ok(alertHtml.includes('Terjadi kesalahan validasi.'));
});
