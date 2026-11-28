export const STORAGE_KEYS = {
  MENUS: 'pesanku_menus_v1',
  ORDERS: 'pesanku_orders_v1',
  SESSION: 'pesanku_session_v1',
  JWT_TOKEN: 'pesanku_jwt_token_v1',
};

export function getSessionStore() {
  if (typeof sessionStorage !== 'undefined' && sessionStorage) return sessionStorage;
  if (typeof localStorage !== 'undefined' && localStorage) return localStorage;
  return null;
}

export function loadStore(key, fallback) {
  try {
    if (typeof localStorage === 'undefined' || !localStorage) {
      return structuredClone(fallback);
    }
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

export function saveStore(key, value) {
  try {
    if (typeof localStorage !== 'undefined' && localStorage) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch {
    // Ignore storage quota or SSR access errors.
  }
}

export function clearLegacyLocalSession() {
  try {
    if (typeof localStorage !== 'undefined' && localStorage) {
      localStorage.removeItem(STORAGE_KEYS.JWT_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    }
  } catch {
    // Ignore SSR access errors.
  }
}

export function clearAllSessionStores() {
  try {
    if (typeof sessionStorage !== 'undefined' && sessionStorage) {
      sessionStorage.removeItem(STORAGE_KEYS.JWT_TOKEN);
      sessionStorage.removeItem(STORAGE_KEYS.SESSION);
    }
    clearLegacyLocalSession();
  } catch {
    // Ignore SSR access errors.
  }
}
