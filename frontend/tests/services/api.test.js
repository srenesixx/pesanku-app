import test, { after, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

let vite;
let authApi;
let menuApi;
let orderApi;
let STORAGE_KEYS;
let parseJwt;

function createStorageMock() {
  const map = new Map();
  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      map.set(key, String(value));
    },
    removeItem(key) {
      map.delete(key);
    },
    clear() {
      map.clear();
    },
  };
}

before(async () => {
  globalThis.sessionStorage = createStorageMock();
  globalThis.localStorage = createStorageMock();
  vite = await createServer({
    server: { middlewareMode: true, watch: null },
    optimizeDeps: { noDiscovery: true },
    logLevel: 'silent',
  });
  ({ authApi, menuApi, orderApi, STORAGE_KEYS } = await vite.ssrLoadModule('/src/services/api.js'));
  ({ parseJwt } = await vite.ssrLoadModule('/src/utils/jwt.js'));
});

beforeEach(() => {
  globalThis.sessionStorage.clear();
  globalThis.localStorage.clear();
});

after(async () => {
  await vite?.close();
});

test('authApi.login menyimpan JWT 3-segmen dengan limit 1 hari (86400 detik) di sessionStorage dan getSession memverifikasinya', async () => {
  const nowMs = 1764288000000;
  const session = await authApi.login('pemilik@maknyus.id', 'maknyus2026', { nowMs });

  assert.ok(session.token);
  assert.equal(session.token.split('.').length, 3);
  assert.equal(globalThis.sessionStorage.getItem(STORAGE_KEYS.JWT_TOKEN), session.token);

  const parsed = parseJwt(session.token);
  assert.equal(parsed.payload.email, 'pemilik@maknyus.id');
  assert.equal(parsed.payload.exp - parsed.payload.iat, 86400);

  const activeSession = authApi.getSession(nowMs + 12 * 3600 * 1000);
  assert.ok(activeSession);
  assert.equal(activeSession.user.email, 'pemilik@maknyus.id');
  assert.equal(activeSession.token, session.token);
});

test('authApi.getSession otomatis menghapus sesi jika token JWT melewati limit 1 hari atau berformat warisan non-JWT', async () => {
  const nowMs = 1764288000000;
  await authApi.login('pemilik@maknyus.id', 'maknyus2026', { nowMs });

  const expiredSession = authApi.getSession(nowMs + 86401 * 1000);
  assert.equal(expiredSession, null);
  assert.equal(globalThis.sessionStorage.getItem(STORAGE_KEYS.JWT_TOKEN), null);
  assert.equal(globalThis.sessionStorage.getItem(STORAGE_KEYS.SESSION), null);

  globalThis.sessionStorage.setItem(
    STORAGE_KEYS.SESSION,
    JSON.stringify({ token: 'mock-owner-token', user: { name: 'Legacy' } })
  );
  assert.equal(authApi.getSession(nowMs), null);
  assert.equal(globalThis.sessionStorage.getItem(STORAGE_KEYS.SESSION), null);

  globalThis.localStorage.setItem(
    STORAGE_KEYS.SESSION,
    JSON.stringify({ token: 'mock-owner-token', user: { name: 'LegacyLocal' } })
  );
  assert.equal(authApi.getSession(nowMs), null);
  assert.equal(globalThis.localStorage.getItem(STORAGE_KEYS.SESSION), null);
});

test('authApi, menuApi, dan orderApi menolak input tidak valid sesuai aturan validasi baru', async () => {
  await assert.rejects(
    () => authApi.login('bukan-email', 'maknyus2026'),
    /Format email tidak valid/
  );

  await assert.rejects(
    () => menuApi.create({ name: 'AB', category: 'Makanan', price: 15000 }),
    /Nama menu harus antara 3 hingga 80 karakter/
  );

  await assert.rejects(
    () => menuApi.create({ name: 'Ayam Spesial', category: 'Makanan', price: 200 }),
    /Harga menu harus antara Rp500 hingga Rp1\.000\.000/
  );

  await assert.rejects(
    () => orderApi.getByCode('INVALID-99'),
    /Format kode pesanan tidak valid/
  );

  await assert.rejects(
    () =>
      orderApi.create({
        customerName: 'A',
        notes: '',
        items: [{ menuId: 'm1', name: 'Ayam Geprek', price: 15000, qty: 1 }],
      }),
    /Nama pemesan harus antara 2 hingga 60 karakter/
  );
});
