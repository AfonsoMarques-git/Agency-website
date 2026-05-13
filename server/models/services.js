'use strict';

const db = require('../db');

function parseTags(row) {
  if (!row) return row;
  try {
    row.tags = row.tags ? JSON.parse(row.tags) : [];
  } catch {
    row.tags = [];
  }
  return row;
}

const Services = {
  all({ activeOnly = false } = {}) {
    const sql =
      'SELECT * FROM services' +
      (activeOnly ? ' WHERE active = 1' : '') +
      ' ORDER BY sort_order ASC, id ASC';
    return db.prepare(sql).all().map(parseTags);
  },

  find(id) {
    return parseTags(db.prepare('SELECT * FROM services WHERE id = ?').get(id));
  },

  create(data) {
    const result = db
      .prepare(
        `INSERT INTO services (number, title, description, tags, sort_order, active)
         VALUES (@number, @title, @description, @tags, @sort_order, @active)`
      )
      .run({
        number: data.number || null,
        title: data.title,
        description: data.description || null,
        tags: JSON.stringify(Array.isArray(data.tags) ? data.tags : []),
        sort_order: Number.isFinite(data.sort_order) ? data.sort_order : 0,
        active: data.active === false ? 0 : 1
      });
    return Services.find(result.lastInsertRowid);
  },

  update(id, data) {
    const current = Services.find(id);
    if (!current) return null;

    const merged = {
      number: data.number ?? current.number,
      title: data.title ?? current.title,
      description: data.description ?? current.description,
      tags: JSON.stringify(
        Array.isArray(data.tags) ? data.tags : current.tags || []
      ),
      sort_order:
        data.sort_order !== undefined ? Number(data.sort_order) : current.sort_order,
      active: data.active !== undefined ? (data.active ? 1 : 0) : current.active
    };

    db.prepare(
      `UPDATE services SET
         number = @number,
         title = @title,
         description = @description,
         tags = @tags,
         sort_order = @sort_order,
         active = @active
       WHERE id = @id`
    ).run({ ...merged, id });

    return Services.find(id);
  },

  remove(id) {
    return db.prepare('DELETE FROM services WHERE id = ?').run(id).changes > 0;
  },

  reorder(ids) {
    const stmt = db.prepare('UPDATE services SET sort_order = ? WHERE id = ?');
    const tx = db.transaction((items) => {
      items.forEach((id, i) => stmt.run(i, id));
    });
    tx(ids.map(Number));
    return Services.all();
  }
};

module.exports = Services;
