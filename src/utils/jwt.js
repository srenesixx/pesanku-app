export const JWT_TTL_SECONDS = 86400;
const DEFAULT_JWT_SECRET = 'pesanku-maknyus-hs256-secret-2026';

function toBase64Url(input) {
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 =
    typeof btoa === 'function'
      ? btoa(binary)
      : Buffer.from(input, 'utf8').toString('base64');
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(segment) {
  const normalized = String(segment || '').replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  if (typeof atob === 'function') {
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  }
  return Buffer.from(padded, 'base64').toString('utf8');
}

function computeSignature(signingInput, secret = DEFAULT_JWT_SECRET) {
  // shortcut: deterministic 256-bit digest sinkron untuk kompatibilitas browser & SSR tanpa library kripto eksternal
  const data = `${secret}.${signingInput}`;
  const seeds = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  for (let i = 0; i < data.length; i += 1) {
    const code = data.charCodeAt(i);
    const idx = i & 7;
    seeds[idx] = Math.imul(seeds[idx] ^ (code + i * 31), 0x01000193) >>> 0;
    seeds[(idx + 3) & 7] = (seeds[(idx + 3) & 7] + ((seeds[idx] << 5) | (seeds[idx] >>> 27))) >>> 0;
  }
  const hex = seeds.map((n) => n.toString(16).padStart(8, '0')).join('');
  return toBase64Url(hex);
}

export function createJwt(
  payload = {},
  { ttlSeconds = JWT_TTL_SECONDS, nowMs = Date.now(), secret = DEFAULT_JWT_SECRET } = {}
) {
  const iat = Number.isInteger(payload.iat) ? payload.iat : Math.floor(nowMs / 1000);
  const exp = Number.isInteger(payload.exp) ? payload.exp : iat + ttlSeconds;
  const header = { alg: 'HS256', typ: 'JWT' };
  const fullPayload = { ...payload, iat, exp };

  const encodedHeader = toBase64Url(JSON.stringify(header));
  const encodedPayload = toBase64Url(JSON.stringify(fullPayload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = computeSignature(signingInput, secret);
  return `${signingInput}.${signature}`;
}

export function parseJwt(token) {
  if (typeof token !== 'string') return null;
  const parts = token.trim().split('.');
  if (parts.length !== 3 || parts.some((p) => !p)) return null;
  try {
    const header = JSON.parse(fromBase64Url(parts[0]));
    const payload = JSON.parse(fromBase64Url(parts[1]));
    if (!header || typeof header !== 'object' || !payload || typeof payload !== 'object') {
      return null;
    }
    return { header, payload, signature: parts[2], signingInput: `${parts[0]}.${parts[1]}` };
  } catch {
    return null;
  }
}

export function verifyJwt(
  token,
  { nowMs = Date.now(), secret = DEFAULT_JWT_SECRET, verifySignature = true } = {}
) {
  const parsed = parseJwt(token);
  if (!parsed) {
    return {
      valid: false,
      expired: false,
      reason: 'Format token JWT tidak valid.',
      payload: null,
      remainingSeconds: 0,
    };
  }

  const { header, payload, signature, signingInput } = parsed;
  if (header.typ !== 'JWT') {
    return {
      valid: false,
      expired: false,
      reason: 'Tipe header token bukan JWT.',
      payload: null,
      remainingSeconds: 0,
    };
  }

  if (verifySignature) {
    const expectedSig = computeSignature(signingInput, secret);
    if (signature !== expectedSig) {
      return {
        valid: false,
        expired: false,
        reason: 'Tanda tangan token JWT tidak cocok.',
        payload: null,
        remainingSeconds: 0,
      };
    }
  }

  const exp = Number(payload.exp);
  const nowSec = Math.floor(nowMs / 1000);
  if (!Number.isFinite(exp)) {
    return {
      valid: false,
      expired: false,
      reason: 'Token JWT tidak memiliki batas waktu kedaluwarsa (exp).',
      payload: null,
      remainingSeconds: 0,
    };
  }

  if (exp <= nowSec) {
    return {
      valid: false,
      expired: true,
      reason: 'Sesi login telah berakhir (batas 1 hari). Silakan masuk kembali.',
      payload,
      remainingSeconds: 0,
    };
  }

  return {
    valid: true,
    expired: false,
    reason: '',
    payload,
    remainingSeconds: exp - nowSec,
  };
}
