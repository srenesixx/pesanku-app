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
