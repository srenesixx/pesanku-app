import { MENU_CATEGORIES } from '../constants/domain.js';
import { validateOrderItems } from './format.js';

export const VALID_MENU_CATEGORIES = MENU_CATEGORIES;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TRACK_CODE_PATTERN = /^PK-\d{3,6}$/;
const ALPHANUMERIC_PATTERN = /[a-zA-Z0-9]/;

function buildResult(errors, fallbackMessage = '') {
  const firstError = fallbackMessage || Object.values(errors)[0] || '';
  return {
    valid: Object.keys(errors).length === 0,
    errors,
    message: firstError,
  };
}

export function validateLoginInput({ email = '', password = '' } = {}) {
  const cleanEmail = String(email || '').trim();
  const rawPassword = String(password || '');
  const errors = {};

  if (!cleanEmail && !rawPassword.trim()) {
    errors.email = 'Email pemilik wajib diisi.';
    errors.password = 'Kata sandi wajib diisi.';
    return buildResult(errors, 'Email dan kata sandi wajib diisi.');
  }

  if (!cleanEmail) {
    errors.email = 'Email pemilik wajib diisi.';
  } else if (!EMAIL_PATTERN.test(cleanEmail)) {
    errors.email = 'Format email tidak valid (contoh: pemilik@maknyus.id).';
  }

  if (!rawPassword.trim()) {
    errors.password = 'Kata sandi wajib diisi.';
  } else if (rawPassword.trim().length < 6) {
    errors.password = 'Kata sandi minimal 6 karakter.';
  }

  return buildResult(errors);
}

export function validateCustomerOrderInput({ customerName = '', notes = '', items = [] } = {}) {
  const cleanName = String(customerName || '').trim();
  const cleanNotes = String(notes || '').trim();
  const errors = {};

  if (!cleanName) {
    errors.customerName = 'Nama pemesan wajib diisi.';
  } else if (cleanName.length < 2 || cleanName.length > 60) {
    errors.customerName = 'Nama pemesan harus antara 2 hingga 60 karakter.';
  } else if (!ALPHANUMERIC_PATTERN.test(cleanName)) {
    errors.customerName = 'Nama pemesan harus mengandung huruf atau angka.';
  }

  if (cleanNotes.length > 200) {
    errors.notes = 'Catatan pesanan maksimal 200 karakter.';
  }

  const itemError = validateOrderItems(items);
  if (itemError) {
    errors.items = itemError;
  }

  return buildResult(errors);
}

export function validateTrackCode(code = '') {
  const normalizedCode = String(code || '').trim().toUpperCase();
  const errors = {};

  if (!normalizedCode) {
    errors.trackCode = 'Masukkan kode pesanan terlebih dahulu.';
  } else if (!TRACK_CODE_PATTERN.test(normalizedCode)) {
    errors.trackCode = 'Format kode pesanan tidak valid. Gunakan format PK-XXXX (contoh: PK-1005).';
  }

  return {
    ...buildResult(errors),
    normalizedCode,
  };
}

export function validateMenuInput(payload = {}, { isPartial = false } = {}) {
  const errors = {};

  if (!isPartial || payload.name !== undefined) {
    const cleanName = String(payload.name ?? '').trim();
    if (!cleanName) {
      errors.name = isPartial ? 'Nama menu tidak boleh kosong.' : 'Nama menu wajib diisi.';
    } else if (cleanName.length < 3 || cleanName.length > 80) {
      errors.name = 'Nama menu harus antara 3 hingga 80 karakter.';
    }
  }

  if (!isPartial || payload.category !== undefined) {
    const category = payload.category || 'Makanan';
    if (!VALID_MENU_CATEGORIES.includes(category)) {
      errors.category = 'Kategori menu tidak valid.';
    }
  }

  if (!isPartial || payload.price !== undefined) {
    const rawPrice = payload.price;
    const price = Number(rawPrice);
    if (rawPrice === '' || rawPrice === null || !Number.isFinite(price) || price <= 0) {
      errors.price = 'Harga menu harus lebih dari Rp0.';
    } else if (price < 500 || price > 1000000) {
      errors.price = 'Harga menu harus antara Rp500 hingga Rp1.000.000.';
    } else if (!Number.isInteger(price)) {
      errors.price = 'Harga menu harus berupa angka bulat.';
    }
  }

  if (payload.description !== undefined) {
    const desc = String(payload.description || '').trim();
    if (desc.length > 240) {
      errors.description = 'Deskripsi menu maksimal 240 karakter.';
    }
  }

  return buildResult(errors);
}

export function validateReportDateRange({ startDate = '', endDate = '' } = {}) {
  const errors = {};
  if (startDate && endDate && endDate < startDate) {
    errors.dateRange = 'Tanggal akhir tidak boleh lebih awal dari tanggal mulai.';
  }
  return buildResult(errors);
}
