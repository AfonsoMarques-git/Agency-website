'use strict';

const express = require('express');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

const Admin = require('../models/admin');
const {
  signToken,
  setAuthCookie,
  clearAuthCookie,
  requireAuthAPI
} = require('../middleware/authMiddleware');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas tentativas. Tente novamente em 15 minutos.' }
});

router.post(
  '/login',
  loginLimiter,
  [
    body('username')
      .isString()
      .trim()
      .isLength({ min: 1, max: 80 })
      .withMessage('Username inválido.'),
    body('password')
      .isString()
      .isLength({ min: 1, max: 200 })
      .withMessage('Password inválida.')
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { username, password } = req.body;
    const result = Admin.verify(username, password);

    if (!result.ok) {
      if (result.reason === 'locked') {
        return res.status(423).json({
          error:
            'Conta bloqueada por excesso de tentativas. Tente novamente mais tarde.'
        });
      }
      // Generic message to avoid user enumeration.
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const token = signToken({ id: result.user.id, username: result.user.username });
    setAuthCookie(res, token);

    return res.json({
      ok: true,
      user: { id: result.user.id, username: result.user.username }
    });
  }
);

router.post('/logout', (req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

router.get('/me', requireAuthAPI, (req, res) => {
  res.json({ ok: true, user: req.user });
});

router.post(
  '/change-password',
  requireAuthAPI,
  [
    body('currentPassword').isString().isLength({ min: 1, max: 200 }),
    body('newPassword')
      .isString()
      .isLength({ min: 10, max: 200 })
      .withMessage('A nova password deve ter pelo menos 10 caracteres.')
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { currentPassword, newPassword } = req.body;
    const verify = Admin.verify(req.user.username, currentPassword);
    if (!verify.ok) {
      return res.status(401).json({ error: 'Password atual incorreta.' });
    }

    Admin.changePassword(req.user.id, newPassword);
    res.json({ ok: true });
  }
);

module.exports = router;
