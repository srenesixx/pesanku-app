import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { TrendingUp } from 'lucide-react';

let vite;
let Input;
let EmptyState;
let FilterPillGroup;
let FormField;
let LeaderboardRow;
let MetricCard;
let ModalDialog;
let PageHeader;
let QuantityStepper;
let SalesBarColumn;
let SearchInput;

before(async () => {
  vite = await createServer({
    server: { middlewareMode: true, watch: null },
    optimizeDeps: { noDiscovery: true },
    logLevel: 'silent',
  });
  ({ Input } = await vite.ssrLoadModule('/src/components/atoms/index.js'));
  ({
    EmptyState,
    FilterPillGroup,
    FormField,
    LeaderboardRow,
    MetricCard,
    ModalDialog,
    PageHeader,
    QuantityStepper,
    SalesBarColumn,
    SearchInput,
  } = await vite.ssrLoadModule('/src/components/molecules/index.js'));
});

after(async () => {
  await vite?.close();
});

test('FormField, SearchInput, FilterPillGroup, dan QuantityStepper merender kontrol 44px dan error per-field', () => {
  const fieldHtml = renderToStaticMarkup(
    React.createElement(
      FormField,
      { id: 'menu-name', label: 'Nama Menu *', error: 'Nama menu wajib diisi.' },
      React.createElement(Input, {
        id: 'menu-name',
        value: '',
        error: 'Nama menu wajib diisi.',
        onChange: () => {},
      })
    )
  );
  assert.ok(fieldHtml.includes('for="menu-name"'));
  assert.ok(fieldHtml.includes('id="menu-name-error"'));
  assert.ok(fieldHtml.includes('Nama menu wajib diisi.'));

  const searchHtml = renderToStaticMarkup(
    React.createElement(SearchInput, {
      id: 'menu-search',
      label: 'Cari nama menu',
      value: '',
      placeholder: 'Cari nama menu...',
      onChange: () => {},
    })
  );
  assert.ok(searchHtml.includes('for="menu-search"'));
  assert.ok(searchHtml.includes('min-h-[44px]'));

  const pillsHtml = renderToStaticMarkup(
    React.createElement(FilterPillGroup, {
      options: ['Semua', 'Makanan'],
      activeOption: 'Semua',
      onSelect: () => {},
    })
  );
  assert.ok(pillsHtml.includes('aria-pressed="true"'));
  assert.ok(pillsHtml.includes('aria-pressed="false"'));

  const stepperHtml = renderToStaticMarkup(
    React.createElement(QuantityStepper, {
      itemName: 'Ayam Geprek',
      qty: 2,
      onDecrement: () => {},
      onIncrement: () => {},
    })
  );
  assert.ok(stepperHtml.includes('aria-label="Kurangi Ayam Geprek"'));
  assert.ok(stepperHtml.includes('aria-label="Tambah Ayam Geprek"'));
  assert.ok(stepperHtml.includes('min-w-[44px] min-h-[44px]'));
});

test('MetricCard, SalesBarColumn, LeaderboardRow, PageHeader, EmptyState, dan ModalDialog merender struktur lengkap', () => {
  const metricHtml = renderToStaticMarkup(
    React.createElement(MetricCard, {
      icon: TrendingUp,
      label: 'Total Pendapatan',
      value: 'Rp150.000',
    })
  );
  assert.ok(metricHtml.includes('Total Pendapatan'));
  assert.ok(metricHtml.includes('Rp150.000'));

  const barHtml = renderToStaticMarkup(
    React.createElement(SalesBarColumn, {
      valueLabel: '95rb',
      heightPct: 80,
      dateLabel: '23 Nov',
    })
  );
  assert.ok(barHtml.includes('95rb'));
  assert.ok(barHtml.includes('height:80%'));
  assert.ok(barHtml.includes('23 Nov'));

  const rowHtml = renderToStaticMarkup(
    React.createElement(LeaderboardRow, {
      rank: 1,
      name: 'Ayam Geprek',
      subLabel: '10 porsi',
      rightLabel: 'Rp150.000',
    })
  );
  assert.ok(rowHtml.includes('Ayam Geprek'));
  assert.ok(rowHtml.includes('10 porsi'));

  const headerHtml = renderToStaticMarkup(
    React.createElement(PageHeader, {
      title: 'Judul Halaman',
      subtitle: 'Subjudul ringkas',
    })
  );
  assert.ok(headerHtml.includes('Judul Halaman'));
  assert.ok(headerHtml.includes('Subjudul ringkas'));

  const emptyHtml = renderToStaticMarkup(
    React.createElement(EmptyState, {
      title: 'Data kosong',
      description: 'Tambahkan item baru.',
      dashed: true,
    })
  );
  assert.ok(emptyHtml.includes('Data kosong'));
  assert.ok(emptyHtml.includes('border-dashed'));

  const modalHtml = renderToStaticMarkup(
    React.createElement(
      ModalDialog,
      {
        open: true,
        titleId: 'test-modal-title',
        title: 'Judul Modal',
        onClose: () => {},
      },
      React.createElement('p', null, 'Isi Modal')
    )
  );
  assert.ok(modalHtml.includes('role="dialog"'));
  assert.ok(modalHtml.includes('aria-modal="true"'));
  assert.ok(modalHtml.includes('Judul Modal'));
});
