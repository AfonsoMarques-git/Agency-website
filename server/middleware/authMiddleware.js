'use strict';

const jwt = require('jsonwebtoken');

const COOKIE = process.env.SESSION_COOKIE_NAME || 'wemov_admin';
const SECRET = process.env.JWT_SECRET || 'change-me';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

function setAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie(COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    path: '/',
    maxAge: 8 * 60 * 60 * 1000 // 8h
  });
}

function clearAuthCookie(res) {
  res.clearCookie(COOKIE, { path: '/' });
}

/**
 * API middleware — returns 401 JSON if no/invalid token.
 */
function requireAuthAPI(req, res, next) {
  const token = req.cookies?.[COOKIE];
  if (!token) return res.status(401).json({ error: 'Não autenticado.' });
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;

    // Refresh rotation — issue a fresh token on each authenticated request.
    const refreshed = signToken({ id: decoded.id, username: decoded.username });
    setAuthCookie(res, refreshed);

    next();
  } catch {
    clearAuthCookie(res);
    return res.status(401).json({ error: 'Sessão inválida ou expirada.' });
  }
}

/**
 * Page middleware — redirects to the admin login page when missing/invalid.
 */
function requireAuthPage(req, res, next) {
  const token = req.cookies?.[COOKIE];
  if (!token) return res.redirect('/admin/login');
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    clearAuthCookie(res);
    return res.redirect('/admin/login');
  }
}

module.exports = {
  signToken,
  setAuthCookie,
  clearAuthCookie,
  requireAuthAPI,
  requireAuthPage,
  COOKIE
};
