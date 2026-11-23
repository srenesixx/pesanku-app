import test from 'node:test';
import assert from 'node:assert/strict';
import { setupOverlayListeners } from './useOverlayDialog.js';

test('menutup dialog saat Escape ditekan, mengunci scroll, lalu memulihkan overflow dan fokus saat cleanup', () => {
  const listeners = {};
  let focused = false;
  const triggerEl = { focus() { focused = true; } };
  const doc = { body: { style: { overflow: '' } } };
  const win = {
    addEventListener(type, fn) { listeners[type] = fn; },
    removeEventListener(type, fn) { if (listeners[type] === fn) delete listeners[type]; },
  };

  let closed = 0;
  const cleanup = setupOverlayListeners({
    isOpen: true,
    onClose: () => { closed += 1; },
    triggerEl,
    doc,
    win,
  });

  assert.equal(doc.body.style.overflow, 'hidden');
  listeners.keydown({ key: 'Enter' });
  assert.equal(closed, 0);
  listeners.keydown({ key: 'Escape' });
  assert.equal(closed, 1);

  cleanup();
  assert.equal(doc.body.style.overflow, '');
  assert.equal(focused, true);
  assert.equal(listeners.keydown, undefined);
});

test('tidak mendaftarkan listener jika isOpen false', () => {
  let added = false;
  const cleanup = setupOverlayListeners({
    isOpen: false,
    onClose: () => {},
    triggerEl: null,
    doc: { body: { style: { overflow: '' } } },
    win: { addEventListener() { added = true; }, removeEventListener() {} },
  });
  assert.equal(added, false);
  cleanup();
});

test('memulihkan nilai overflow sebelumnya dan aman jika triggerEl null', () => {
  const listeners = {};
  const doc = { body: { style: { overflow: 'auto' } } };
  const win = {
    addEventListener(type, fn) { listeners[type] = fn; },
    removeEventListener(type, fn) { if (listeners[type] === fn) delete listeners[type]; },
  };

  const cleanup = setupOverlayListeners({
    isOpen: true,
    onClose: () => {},
    triggerEl: null,
    doc,
    win,
  });

  assert.equal(doc.body.style.overflow, 'hidden');
  cleanup();
  assert.equal(doc.body.style.overflow, 'auto');
});

function createMockElement(name, { disabled = false, tabIndex = 0 } = {}) {
  const el = {
    name,
    disabled,
    tabIndex,
    focusCalls: 0,
    hasAttribute(attr) {
      return attr === 'disabled' ? this.disabled : false;
    },
    focus() {
      this.focusCalls += 1;
      if (this._doc) this._doc.activeElement = this;
    },
  };
  return el;
}

test('memindahkan fokus ke containerEl saat dibuka dan memulihkan fokus ke triggerEl saat cleanup', () => {
  const listeners = {};
  const triggerEl = createMockElement('trigger');
  const containerEl = createMockElement('dialog', { tabIndex: -1 });
  const doc = { body: { style: { overflow: '' } }, activeElement: triggerEl };
  triggerEl._doc = doc;
  containerEl._doc = doc;
  containerEl.querySelectorAll = () => [];
  containerEl.contains = (node) => node === containerEl;

  const win = {
    addEventListener(type, fn) { listeners[type] = fn; },
    removeEventListener(type, fn) { if (listeners[type] === fn) delete listeners[type]; },
  };

  const cleanup = setupOverlayListeners({
    isOpen: true,
    onClose: () => {},
    triggerEl,
    containerEl,
    doc,
    win,
  });

  assert.equal(containerEl.focusCalls, 1);
  assert.equal(doc.activeElement, containerEl);
  assert.equal(triggerEl.focusCalls, 0);

  cleanup();
  assert.equal(triggerEl.focusCalls, 1);
  assert.equal(doc.activeElement, triggerEl);
});

test('menjebak Tab dari elemen terakhir ke pertama dan Shift+Tab dari pertama atau containerEl ke terakhir', () => {
  const listeners = {};
  const firstBtn = createMockElement('first');
  const middleInput = createMockElement('middle');
  const lastBtn = createMockElement('last');
  const disabledBtn = createMockElement('disabled', { disabled: true });
  const containerEl = createMockElement('dialog', { tabIndex: -1 });
  const children = [firstBtn, middleInput, lastBtn, disabledBtn];

  const doc = { body: { style: { overflow: '' } }, activeElement: null };
  for (const el of [...children, containerEl]) el._doc = doc;

  containerEl.querySelectorAll = () => children;
  containerEl.contains = (node) => node === containerEl || children.includes(node);

  const win = {
    addEventListener(type, fn) { listeners[type] = fn; },
    removeEventListener(type, fn) { if (listeners[type] === fn) delete listeners[type]; },
  };

  const cleanup = setupOverlayListeners({
    isOpen: true,
    onClose: () => {},
    triggerEl: null,
    containerEl,
    doc,
    win,
  });

  // Shift+Tab dari containerEl melompat ke elemen fokus terakhir (mengabaikan disabledBtn)
  let prevented = false;
  listeners.keydown({ key: 'Tab', shiftKey: true, preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(doc.activeElement, lastBtn);

  // Tab dari elemen terakhir membungkus ke elemen pertama
  prevented = false;
  listeners.keydown({ key: 'Tab', shiftKey: false, preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(doc.activeElement, firstBtn);

  // Shift+Tab dari elemen pertama membungkus ke elemen terakhir
  prevented = false;
  listeners.keydown({ key: 'Tab', shiftKey: true, preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(doc.activeElement, lastBtn);

  // Tab dari elemen tengah tidak dicegat
  doc.activeElement = middleInput;
  prevented = false;
  listeners.keydown({ key: 'Tab', shiftKey: false, preventDefault() { prevented = true; } });
  assert.equal(prevented, false);

  cleanup();
});

test('mencegah Tab keluar jika containerEl tidak memiliki elemen fokus aktif', () => {
  const listeners = {};
  const disabledBtn = createMockElement('disabled', { disabled: true });
  const containerEl = createMockElement('dialog', { tabIndex: -1 });
  const doc = { body: { style: { overflow: '' } }, activeElement: null };
  containerEl._doc = doc;
  containerEl.querySelectorAll = () => [disabledBtn];
  containerEl.contains = (node) => node === containerEl;

  const win = {
    addEventListener(type, fn) { listeners[type] = fn; },
    removeEventListener(type, fn) { if (listeners[type] === fn) delete listeners[type]; },
  };

  const cleanup = setupOverlayListeners({
    isOpen: true,
    onClose: () => {},
    triggerEl: null,
    containerEl,
    doc,
    win,
  });

  let prevented = false;
  listeners.keydown({ key: 'Tab', shiftKey: false, preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(doc.activeElement, containerEl);
  assert.equal(containerEl.focusCalls, 2);

  cleanup();
});
