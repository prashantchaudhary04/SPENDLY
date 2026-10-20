import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { createDefaultCategories } from '../utils/defaultCategories.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  REFRESH_COOKIE,
  refreshCookieOptions,
} from '../utils/tokens.js';

// Creates both tokens, saves the refresh hash, sets the cookie, returns the access token
async function issueSession(user, res) {
  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  await User.updateOne(
    { _id: user._id },
    { refreshTokenHash: hashToken(refreshToken) }
  );

  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions());
  return accessToken;
}

export async function register(req, res) {
  const { name, email, password } = req.body;

  if (await User.exists({ email })) {
    throw new ApiError(409, 'Email already registered');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash });

  // Give every new user a ready-to-use set of categories
  await createDefaultCategories(user._id);

  const accessToken = await issueSession(user, res);

  res.status(201).json({
    user: { id: user._id, name: user.name, email: user.email, currency: user.currency },
    accessToken,
  });
}

export async function login(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+passwordHash');
  const passwordOk = user && (await bcrypt.compare(password, user.passwordHash));

  if (!passwordOk) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const accessToken = await issueSession(user, res);

  res.json({
    user: { id: user._id, name: user.name, email: user.email, currency: user.currency },
    accessToken,
  });
}

export async function refresh(req, res) {
  const token = req.cookies[REFRESH_COOKIE];
  if (!token) {
    return res.status(401).json({ message: 'No refresh token' });
  }

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    return res.status(401).json({ message: 'Refresh token invalid or expired' });
  }

  const user = await User.findById(payload.sub).select('+refreshTokenHash');
  if (!user || user.refreshTokenHash !== hashToken(token)) {
    res.clearCookie(REFRESH_COOKIE, refreshCookieOptions());
    return res.status(401).json({ message: 'Refresh token revoked' });
  }

  // Rotation: a brand-new pair is issued and the old refresh token stops working
  const accessToken = await issueSession(user, res);

  res.json({
    user: { id: user._id, name: user.name, email: user.email, currency: user.currency },
    accessToken,
  });
}

export async function logout(req, res) {
  const token = req.cookies[REFRESH_COOKIE];

  if (token) {
    try {
      const { sub } = verifyRefreshToken(token);
      await User.updateOne({ _id: sub }, { $unset: { refreshTokenHash: 1 } });
    } catch {
      // token was already invalid, nothing to revoke
    }
  }

  res.clearCookie(REFRESH_COOKIE, refreshCookieOptions());
  res.json({ message: 'Logged out' });
}

export function me(req, res) {
  const { _id, name, email, currency } = req.user;
  res.json({ user: { id: _id, name, email, currency } });
}
