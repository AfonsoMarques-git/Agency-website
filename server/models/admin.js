'use strict';

const db = require('../db');
const bcrypt = require('bcryptjs');

const BCRYPT_COST = 12;
const LOCKOUT_AFTER = 5;            // failed attempts
const LOCKOUT_MINUTES = 30;

const Admin = {
  findByUsername(username) {
    return db
      .prepare('SELECT * FROM admin_users WHERE username = ?')
      .get(username);
  },

  findById(id) {
    return db.prepare('SELECT * FROM admin_users WHERE id = ?').get(id);
  },

  /**
   * Verify a username + password.
   * Returns:
   *   { ok: true,  user }
   *   { ok: false, reason: 'not_found' | 'locked' | 'invalid' }
   */
  verify(username, password) {
    const user = Admin.findByUsername(username);
    if (!user) return { ok: false, reason: 'not_found' };

    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return { ok: false, reason: 'locked', lockedUntil: user.locked_until };
    }

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
      const attempts = (user.failed_attempts || 0) + 1;
      let locked_until = null;
      if (attempts >= LOCKOUT_AFTER) {
        const until = new Date(Date.now() + LOCKOUT_MINUTES * 60_000);
        locked_until = until.toISOString();
      }
      db.prepare(
        `UPDATE admin_users
            SET failed_attempts = ?, locked_until = ?
          WHERE id = ?`
      ).run(attempts, locked_until, user.id);
      return { ok: false, reason: 'invalid', attempts };
    }

    db.prepare(
      `UPDATE admin_users
          SET failed_attempts = 0,
              locked_until = NULL,
              last_login_at = CURRENT_TIMESTAMP
        WHERE id = ?`
    ).run(user.id);

    return { ok: true, user };
  },

  changePassword(id, newPassword) {
    const hash = bcrypt.hashSync(newPassword, BCRYPT_COST);
    db.prepare(
      `UPDATE admin_users
          SET password_hash = ?, failed_attempts = 0, locked_until = NULL
        WHERE id = ?`
    ).run(hash, id);
    return true;
  }
};

module.exports = Admin;
