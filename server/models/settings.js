'use strict';

const db = require('../db');

const Settings = {
  /**
   * Returns all settings as a flat object { key: value }.
   */
  all() {
    const rows = db.prepare('SELECT key, value FROM settings').all();
    const out = Object.create(null);
    for (const r of rows) out[r.key] = r.value;
    return out;
  },

  get(key) {
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
    return row ? row.value : null;
  },

  /**
   * Inserts or updates a single setting.
   */
  set(key, value) {
    db.prepare(
      `INSERT INTO settings (key, value, updated_at)
       VALUES (?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(key) DO UPDATE SET
         value = excluded.value,
         updated_at = CURRENT_TIMESTAMP`
    ).run(key, value);
    return { key, value };
  },

  /**
   * Bulk update from a plain object.
   */
  setMany(map) {
    const stmt = db.prepare(
      `INSERT INTO settings (key, value, updated_at)
       VALUES (@key, @value, CURRENT_TIMESTAMP)
       ON CONFLICT(key) DO UPDATE SET
         value = excluded.value,
         updated_at = CURRENT_TIMESTAMP`
    );
    const tx = db.transaction((entries) => {
      for (const [key, value] of entries) {
        if (typeof value === 'string') stmt.run({ key, value });
      }
    });
    tx(Object.entries(map));
    return Settings.all();
  }
};

module.exports = Settings;
