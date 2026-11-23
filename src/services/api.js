import { calculateOrderTotals, validateOrderItems } from '../utils/format.js';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const USE_MOCK = !API_BASE_URL;

const STORAGE_KEYS = {
  MENUS: 'pesanku_menus_v1',
  ORDERS: 'pesanku_orders_v1',
  SESSION: 'pesanku_session_v1',
};

const SEED_MENUS = [
  {
    id: 'm1',
    name: 'Nasi Ayam Geprek Original',
    category: 'Makanan',
    price: 15000,
    available: true,
    description: 'Ayam crispy digeprek sambal bawang pedas, nasi hangat, lalapan.',
  },
  {
    id: 'm2',
    name: 'Nasi Ayam Bakar Madu',
    category: 'Makanan',
    price: 18000,
    available: true,
    description: 'Ayam ungkep dibakar bumbu madu kecap manis, sambal terasi.',
  },
  {
    id: 'm3',
    name: 'Nasi Ayam Goreng Kremes',
    category: 'Makanan',
    price: 16000,
    available: true,
    description: 'Ayam goreng gurih dengan taburan kremesan renyah.',
  },
  {
    id: 'm4',
    name: 'Paket Geprek Komplit + Es Teh',
    category: 'Paket',
    price: 19000,
    available: true,
    description: 'Nasi Ayam Geprek, tahu tempe goreng, dan Es Teh Manis.',
  },
  {
    id: 'm5',
    name: 'Es Teh Manis',
    category: 'Minuman',
    price: 5000,
    available: true,
    description: 'Teh melati segar diseduh manis dengan es batu.',
  },
  {
    id: 'm6',
    name: 'Es Jeruk Peras',
    category: 'Minuman',
    price: 7000,
    available: true,
    description: 'Perasan jeruk asli tanpa sirup buatan.',
  },
  {
    id: 'm7',
    name: 'Tahu & Tempe Goreng (4 pcs)',
    category: 'Tambahan',
    price: 6000,
    available: true,
    description: 'Lauk pendamping hangat dengan bumbu ketumbar.',
  },
];

function daysAgoIso(days, hour = 12, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

const SEED_ORDERS = [
  {
    id: 'ord-1001',
    code: 'PK-1001',
    customerName: 'Budi Santoso',
    notes: 'Sambal sedang, tidak pakai timun',
    status: 'Selesai',
    createdAt: daysAgoIso(3, 12, 15),
    items: [
      { menuId: 'm1', name: 'Nasi Ayam Geprek Original', price: 15000, qty: 2, subtotal: 30000 },
      { menuId: 'm5', name: 'Es Teh Manis', price: 5000, qty: 2, subtotal: 10000 },
    ],
    totalItems: 4,
    totalAmount: 40000,
  },
  {
    id: 'ord-1002',
    code: 'PK-1002',
    customerName: 'Rina Wijaya',
    notes: 'Bungkus terpisah',
    status: 'Selesai',
    createdAt: daysAgoIso(2, 13, 5),
    items: [
      { menuId: 'm4', name: 'Paket Geprek Komplit + Es Teh', price: 19000, qty: 3, subtotal: 57000 },
    ],
    totalItems: 3,
    totalAmount: 57000,
  },
  {
    id: 'ord-1003',
    code: 'PK-1003',
    customerName: 'Dimas Pratama',
    notes: 'Pedas banget',
    status: 'Selesai',
    createdAt: daysAgoIso(1, 18, 30),
    items: [
      { menuId: 'm2', name: 'Nasi Ayam Bakar Madu', price: 18000, qty: 2, subtotal: 36000 },
      { menuId: 'm6', name: 'Es Jeruk Peras', price: 7000, qty: 2, subtotal: 14000 },
    ],
    totalItems: 4,
    totalAmount: 50000,
  },
  {
    id: 'ord-1004',
    code: 'PK-1004',
    customerName: 'Siti Aminah',
    notes: 'Makan di tempat meja 3',
    status: 'Selesai',
    createdAt: daysAgoIso(0, 11, 45),
    items: [
      { menuId: 'm1', name: 'Nasi Ayam Geprek Original', price: 15000, qty: 2, subtotal: 30000 },
      { menuId: 'm7', name: 'Tahu & Tempe Goreng (4 pcs)', price: 6000, qty: 1, subtotal: 6000 },
    ],
    totalItems: 3,
    totalAmount: 36000,
  },
  {
    id: 'ord-1005',
    code: 'PK-1005',
    customerName: 'Andi Kurniawan',
    notes: 'Kremesan dipisah',
    status: 'Diproses',
    createdAt: daysAgoIso(0, 12, 20),
    items: [
      { menuId: 'm3', name: 'Nasi Ayam Goreng Kremes', price: 16000, qty: 2, subtotal: 32000 },
      { menuId: 'm5', name: 'Es Teh Manis', price: 5000, qty: 2, subtotal: 10000 },
    ],
    totalItems: 4,
    totalAmount: 42000,
  },
  {
    id: 'ord-1006',
    code: 'PK-1006',
    customerName: 'Nadia Putri',
    notes: 'Sambal pisah',
    status: 'Menunggu',
    createdAt: daysAgoIso(0, 12, 40),
    items: [
      { menuId: 'm4', name: 'Paket Geprek Komplit + Es Teh', price: 19000, qty: 1, subtotal: 19000 },
      { menuId: 'm1', name: 'Nasi Ayam Geprek Original', price: 15000, qty: 1, subtotal: 15000 },
    ],
    totalItems: 2,
    totalAmount: 34000,
  },
];

function loadStore(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return structuredClone(fallback);
    }
    return JSON.parse(raw);
  } catch {
    return structuredClone(fallback);
  }
}

function saveStore(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
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
  getSession() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  async login(email, password) {
    if (!email?.trim() || !password?.trim()) {
      throw new Error('Email dan kata sandi wajib diisi.');
    }
    if (!USE_MOCK) {
      const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      saveStore(STORAGE_KEYS.SESSION, data);
      return data;
    }
    // shortcut: kredensial demo lokal untuk pengujian MVP, ganti dengan JWT backend saat integrasi
    if (email.trim().toLowerCase() === 'pemilik@maknyus.id' && password === 'maknyus2026') {
      const session = {
        token: 'mock-owner-token',
        user: {
          name: 'Pemilik Warung Mak Nyus',
          email: 'pemilik@maknyus.id',
          role: 'owner',
        },
      };
      saveStore(STORAGE_KEYS.SESSION, session);
      return session;
    }
    throw new Error('Email atau kata sandi salah. Periksa kembali akun pemilik Anda.');
  },

  logout() {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  },
};

export const menuApi = {
  async list() {
    if (!USE_MOCK) return request('/menus');
    return loadStore(STORAGE_KEYS.MENUS, SEED_MENUS);
  },

  async create(payload) {
    const name = payload.name?.trim();
    const price = Number(payload.price);
    if (!name) throw new Error('Nama menu wajib diisi.');
    if (!Number.isFinite(price) || price <= 0) throw new Error('Harga menu harus lebih dari Rp0.');

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
    if (patch.name !== undefined && !patch.name.trim()) {
      throw new Error('Nama menu tidak boleh kosong.');
    }
    if (patch.price !== undefined && (!Number.isFinite(Number(patch.price)) || Number(patch.price) <= 0)) {
      throw new Error('Harga menu harus lebih dari Rp0.');
    }
    if (!USE_MOCK) {
      return request(`/menus/${id}`, { method: 'PUT', body: JSON.stringify(patch) });
    }
    const menus = loadStore(STORAGE_KEYS.MENUS, SEED_MENUS);
    const next = menus.map((m) =>
      m.id === id ? { ...m, ...patch, price: patch.price !== undefined ? Number(patch.price) : m.price } : m
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
    const clean = (code || '').trim().toUpperCase();
    if (!clean) throw new Error('Masukkan kode pesanan terlebih dahulu.');
    if (!USE_MOCK) return request(`/orders/code/${encodeURIComponent(clean)}`);
    const orders = loadStore(STORAGE_KEYS.ORDERS, SEED_ORDERS);
    const found = orders.find((o) => o.code.toUpperCase() === clean);
    if (!found) throw new Error(`Pesanan dengan kode ${clean} tidak ditemukan.`);
    return found;
  },

  async create({ customerName, notes = '', items }) {
    if (!customerName?.trim()) {
      throw new Error('Nama pemesan wajib diisi.');
    }
    const itemError = validateOrderItems(items);
    if (itemError) throw new Error(itemError);

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
          ? `Pastikan stok bahan baku untuk ${top.name} selalu siap menjelang jam makan siang (11.30–13.30).`
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
