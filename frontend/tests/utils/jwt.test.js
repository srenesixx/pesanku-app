import test from 'node:test';
import assert from 'node:assert/strict';
import {
  JWT_TTL_SECONDS,
  createJwt,
  parseJwt,
  verifyJwt,
} from '../../src/utils/jwt.js';

test('JWT_TTL_SECONDS bernilai 86400 detik (1 hari) dan createJwt menghasilkan token 3 segmen valid', () => {
  assert.equal(JWT_TTL_SECONDS, 86400);

  const nowMs = 1764288000000;
  const token = createJwt(
    {
      sub: 'owner-1',
      email: 'pemilik@maknyus.id',
      name: 'Pemilik Warung Mak Nyus',
      role: 'owner',
    },
    { nowMs }
  );

  const segments = token.split('.');
  assert.equal(segments.length, 3);

  const parsed = parseJwt(token);
  assert.ok(parsed);
  assert.equal(parsed.header.alg, 'HS256');
  assert.equal(parsed.header.typ, 'JWT');
  assert.equal(parsed.payload.email, 'pemilik@maknyus.id');
  assert.equal(parsed.payload.iat, Math.floor(nowMs / 1000));
  assert.equal(parsed.payload.exp, Math.floor(nowMs / 1000) + 86400);

  const verified = verifyJwt(token, { nowMs: nowMs + 3600 * 1000 });
  assert.equal(verified.valid, true);
  assert.equal(verified.expired, false);
  assert.equal(verified.remainingSeconds, 82800);
});

test('verifyJwt menolak token yang melewati limit 1 hari (86400 detik), token non-JWT, atau signature dimodifikasi', () => {
  const nowMs = 1764288000000;
  const token = createJwt(
    { sub: 'owner-1', email: 'pemilik@maknyus.id', role: 'owner' },
    { nowMs }
  );

  const expiredCheck = verifyJwt(token, { nowMs: nowMs + 86400 * 1000 });
  assert.equal(expiredCheck.valid, false);
  assert.equal(expiredCheck.expired, true);

  const legacyCheck = verifyJwt('mock-owner-token', { nowMs });
  assert.equal(legacyCheck.valid, false);

  const tampered = token.slice(0, -4) + 'ABCD';
  const tamperedCheck = verifyJwt(tampered, { nowMs });
  assert.equal(tamperedCheck.valid, false);
  assert.equal(tamperedCheck.expired, false);
});
