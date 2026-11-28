import { calculateOrderTotals } from '../utils/format.js';
import { JWT_TTL_SECONDS, createJwt, parseJwt, verifyJwt } from '../utils/jwt.js';
import {
  validateCustomerOrderInput,
  validateLoginInput,
  validateMenuInput,
  validateTrackCode,
} from '../utils/validation.js';
import { SEED_MENUS, SEED_ORDERS } from './seedData.js';
import {
  STORAGE_KEYS,
  clearAllSessionStores,
  clearLegacyLocalSession,
  getSessionStore,
  loadStore,
  saveStore,
} from './storage.js';

export { STORAGE_KEYS };

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const USE_MOCK = !API_BASE_URL;

function saveJwtSession(token, userFallback = null) {
  const parsed = parseJwt(token);
  const payload = parsed?.payload || {};
  const user = userFallback || {
    name: payload.name || 'Pemilik Warung Mak Nyus',
    email: payload.email || 'pemilik@maknyus.id',
    role: payload.role || 'owner',
  };
  const iat = payload.iat || Math.floor(Date.now() / 1000);
  const exp = payload.exp || iat + JWT_TTL_SECONDS;
  const session = {
    token,
    user,
    iat,
    exp,
    expiresAt: exp * 1000,
  };
  try {
    const store = getSessionStore();
    if (store) {
      store.setItem(STORAGE_KEYS.JWT_TOKEN, token);
      store.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    }
  } catch {
    // Ignore storage quota or SSR access errors.
  }
  return session;
}

async function request(path, options = {}) {
  const session = authApi.getSession();
  const headers = {
    'Content-Type': 'application/json',
    ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
    ...options.headers,
  };
  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Permintaan gagal (${res.status})`);
  }
  return data;
}

export const isMockMode = USE_MOCK;

export const authApi = {
  verifyToken(token, nowMs = Date.now()) {
    return verifyJwt(token, { nowMs, verifySignature: USE_MOCK });
  },

  getSession(nowMs = Date.now()) {
    try {
      const store = getSessionStore();
      if (!store) return null;

      if (typeof sessionStorage !== 'undefined' && store === sessionStorage) {
        clearLegacyLocalSession();
      }

      const rawToken = store.getItem(STORAGE_KEYS.JWT_TOKEN);
      const rawSession = store.getItem(STORAGE_KEYS.SESSION);
      const parsedSession = rawSession ? JSON.parse(rawSession) : null;
      const candidateToken = rawToken || parsedSession?.token || '';

      if (!candidateToken) {
        if (rawSession) this.logout();
        return null;
      }

      const check = this.verifyToken(candidateToken, nowMs);
      if (!check.valid) {
        this.logout();
        return null;
      }

      const payload = check.payload;
      const user = parsedSession?.user || {
        name: payload.name || 'Pemilik Warung Mak Nyus',
        email: payload.email || 'pemilik@maknyus.id',
        role: payload.role || 'owner',
      };

      return {
        token: candidateToken,
        user,
        iat: payload.iat,
        exp: payload.exp,
        expiresAt: payload.exp * 1000,
        remainingSeconds: check.remainingSeconds,
      };
    } catch {
      this.logout();
      return null;
    }
  },

  async login(email, password, { ttlSeconds = JWT_TTL_SECONDS, nowMs = Date.now() } = {}) {
    const validation = validateLoginInput({ email, password });
    if (!validation.valid) {
      const err = new Error(validation.message);
      err.errors = validation.errors;
      throw err;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!USE_MOCK) {
      const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      const parsedBackend = data?.token ? parseJwt(data.token) : null;
      const hasValidExp = Number.isFinite(Number(parsedBackend?.payload?.exp));
      const backendToken =
        parsedBackend && hasValidExp
          ? data.token
          : createJwt(
              {
                sub: data?.user?.id || parsedBackend?.payload?.sub || 'owner-1',
                email: data?.user?.email || parsedBackend?.payload?.email || cleanEmail,
                name: data?.user?.name || parsedBackend?.payload?.name || 'Pemilik Warung Mak Nyus',
                role: data?.user?.role || parsedBackend?.payload?.role || 'owner',
              },
              { ttlSeconds, nowMs }
            );
      return saveJwtSession(backendToken, data?.user);
    }

    // shortcut: kredensial demo lokal untuk pengujian MVP, menggunakan JWT HS256 dengan limit 1 hari (86400 detik)
    if (cleanEmail === 'pemilik@maknyus.id' && password === 'maknyus2026') {
      const user = {
        name: 'Pemilik Warung Mak Nyus',
        email: 'pemilik@maknyus.id',
        role: 'owner',
      };
      const token = createJwt({ sub: 'owner-1', ...user }, { ttlSeconds, nowMs });
      return saveJwtSession(token, user);
    }

    throw new Error('Email atau kata sandi salah. Periksa kembali akun pemilik Anda.');
  },

  logout() {
    clearAllSessionStores();
  },
};

export const menuApi = {
  async list() {
    if (!USE_MOCK) return request('/menus');
    return loadStore(STORAGE_KEYS.MENUS, SEED_MENUS);
  },

  async create(payload) {
    const validation = validateMenuInput(payload, { isPartial: false });
    if (!validation.valid) {
      const err = new Error(validation.message);
      err.errors = validation.errors;
      throw err;
    }

    const name = payload.name.trim();
    const price = Number(payload.price);

    if (!USE_MOCK) {
      return request('/menus', { method: 'POST', body: JSON.stringify(payload) });
    }
    const menus = loadStore(STORAGE_KEYS.MENUS, SEED_MENUS);
    const created = {
      id: `m-${Date.now()}`,
      name,
      category: payload.category || 'Makanan',
      price,
      available: payload.available ?? true,
      description: payload.description?.trim() || '',
    };
    const next = [created, ...menus];
    saveStore(STORAGE_KEYS.MENUS, next);
    return created;
  },

  async update(id, patch) {
    const validation = validateMenuInput(patch, { isPartial: true });
    if (!validation.valid) {
      const err = new Error(validation.message);
      err.errors = validation.errors;
      throw err;
    }

    if (!USE_MOCK) {
      return request(`/menus/${id}`, { method: 'PUT', body: JSON.stringify(patch) });
    }
    const menus = loadStore(STORAGE_KEYS.MENUS, SEED_MENUS);
    const next = menus.map((m) =>
      m.id === id
        ? {
            ...m,
            ...patch,
            name: patch.name !== undefined ? patch.name.trim() : m.name,
            description: patch.description !== undefined ? patch.description.trim() : m.description,
            price: patch.price !== undefined ? Number(patch.price) : m.price,
          }
        : m
    );
    saveStore(STORAGE_KEYS.MENUS, next);
    return next.find((m) => m.id === id);
  },

  async remove(id) {
    if (!USE_MOCK) {
      return request(`/menus/${id}`, { method: 'DELETE' });
    }
    const menus = loadStore(STORAGE_KEYS.MENUS, SEED_MENUS);
    saveStore(
      STORAGE_KEYS.MENUS,
      menus.filter((m) => m.id !== id)
    );
    return { ok: true };
  },
};

export const orderApi = {
  async list() {
    if (!USE_MOCK) return request('/orders');
    const orders = loadStore(STORAGE_KEYS.ORDERS, SEED_ORDERS);
    return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getByCode(code) {
    const validation = validateTrackCode(code);
    if (!validation.valid) {
      const err = new Error(validation.message);
      err.errors = validation.errors;
      throw err;
    }
    const clean = validation.normalizedCode;
    if (!USE_MOCK) return request(`/orders/code/${encodeURIComponent(clean)}`);
    const orders = loadStore(STORAGE_KEYS.ORDERS, SEED_ORDERS);
    const found = orders.find((o) => o.code.toUpperCase() === clean);
    if (!found) throw new Error(`Pesanan dengan kode ${clean} tidak ditemukan.`);
    return found;
  },

  async create({ customerName, notes = '', items }) {
    const validation = validateCustomerOrderInput({ customerName, notes, items });
    if (!validation.valid) {
      const err = new Error(validation.message);
      err.errors = validation.errors;
      throw err;
    }

    const { items: normalizedItems, totalItems, totalAmount } = calculateOrderTotals(items);

    if (!USE_MOCK) {
      return request('/orders', {
        method: 'POST',
        body: JSON.stringify({
          customerName: customerName.trim(),
          notes: notes.trim(),
          items: normalizedItems,
          totalItems,
          totalAmount,
        }),
      });
    }

    const orders = loadStore(STORAGE_KEYS.ORDERS, SEED_ORDERS);
    const nextNum = 1001 + orders.length;
    const created = {
      id: `ord-${Date.now()}`,
      code: `PK-${nextNum}`,
      customerName: customerName.trim(),
      notes: notes.trim(),
      status: 'Menunggu',
      createdAt: new Date().toISOString(),
      items: normalizedItems,
      totalItems,
      totalAmount,
    };
    saveStore(STORAGE_KEYS.ORDERS, [created, ...orders]);
    return created;
  },

  async updateStatus(id, status) {
    if (!USE_MOCK) {
      return request(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    }
    const orders = loadStore(STORAGE_KEYS.ORDERS, SEED_ORDERS);
    const next = orders.map((o) => (o.id === id ? { ...o, status } : o));
    saveStore(STORAGE_KEYS.ORDERS, next);
    return next.find((o) => o.id === id);
  },
};

export const reportApi = {
  async getDashboardSummary() {
    if (!USE_MOCK) return request('/reports/summary');
    const orders = await orderApi.list();
    const validOrders = orders.filter((o) => o.status !== 'Dibatalkan');
    const totalRevenue = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalTransactions = validOrders.length;
    const activeOrders = orders.filter((o) => o.status === 'Menunggu' || o.status === 'Diproses').length;

    const menuCounts = new Map();
    for (const order of validOrders) {
      for (const item of order.items) {
        const current = menuCounts.get(item.name) || { name: item.name, qty: 0, revenue: 0 };
        current.qty += item.qty;
        current.revenue += item.subtotal;
        menuCounts.set(item.name, current);
      }
    }

    const topMenus = [...menuCounts.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);

    const dailyMap = new Map();
    for (let i = 4; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dailyMap.set(key, { date: key, revenue: 0, count: 0 });
    }
    for (const order of validOrders) {
      const key = order.createdAt.slice(0, 10);
      if (dailyMap.has(key)) {
        const entry = dailyMap.get(key);
        entry.revenue += order.totalAmount;
        entry.count += 1;
      }
    }

    return {
      totalRevenue,
      totalTransactions,
      activeOrders,
      topMenus,
      dailySales: [...dailyMap.values()],
    };
  },

  async getAiInsights({ simulateError = false } = {}) {
    if (simulateError) {
      throw new Error('Layanan AI sedang tidak tersedia. Menampilkan ringkasan statistik standar.');
    }
    if (!USE_MOCK) return request('/ai/insights');
    const summary = await reportApi.getDashboardSummary();
    if (summary.totalTransactions === 0) {
      return {
        summary: 'Belum ada data transaksi yang cukup untuk dianalisis.',
        recommendations: ['Catat beberapa pesanan terlebih dahulu agar AI dapat menyusun insight penjualan.'],
      };
    }
    const top = summary.topMenus[0];
    const second = summary.topMenus[1];
    return {
      summary: `Dari ${summary.totalTransactions} transaksi tercatat dengan total pendapatan Rp${summary.totalRevenue.toLocaleString('id-ID')}, menu paling diminati adalah ${top?.name || '-'} (${top?.qty || 0} porsi).`,
      recommendations: [
        top
          ? `Pastikan stok bahan baku untuk ${top.name} selalu siap menjelang jam makan siang (11.30-13.30).`
          : 'Pantau ketersediaan stok menu utama setiap pagi.',
        second
          ? `Pertimbangkan paket bundling ${top.name} + ${second.name} untuk meningkatkan nilai rata-rata transaksi.`
          : 'Tawarkan minuman dingin sebagai paket hemat bersama menu ayam.',
        summary.activeOrders > 0
          ? `Saat ini ada ${summary.activeOrders} pesanan aktif yang perlu segera diproses.`
          : 'Semua pesanan saat ini sudah terselesaikan dengan baik.',
      ],
    };
  },
};
