import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export function signAccessToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: '15m',
    jwtid: crypto.randomUUID(),
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
}

export function signRefreshToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
    jwtid: crypto.randomUUID(),
  });
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

// Refresh tokens are long random strings, so a fast hash (SHA-256) is enough.
export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export const REFRESH_COOKIE = 'refreshToken';

export function refreshCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/api/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}
