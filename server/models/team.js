'use strict';

const db = require('../db');

const Team = {
  all({ activeOnly = false } = {}) {
    const sql =
      'SELECT * FROM team' +
      (activeOnly ? ' WHERE active = 1' : '') +
      ' ORDER BY sort_order ASC, id ASC';
    return db.prepare(sql).all();
  },

  find(id) {
    return db.prepare('SELECT * FROM team WHERE id = ?').get(id);
  },

  create(data) {
    const result = db
      .prepare(
        `INSERT INTO team (name, role, image, sort_order, active)
         VALUES (@name, @role, @image, @sort_order, @active)`
      )
      .run({
        name: data.name,
        role: data.role || null,
        image: data.image || null,
        sort_order: Number.isFinite(data.sort_order) ? data.sort_order : 0,
        active: data.active === false ? 0 : 1
      });
    return Team.find(result.lastInsertRowid);
  },

  update(id, data) {
    const current = Team.find(id);
    if (!current) return null;

    const merged = {
      name: data.name ?? current.name,
      role: data.role ?? current.role,
      image: data.image ?? current.image,
      sort_order:
        data.sort_order !== undefined ? Number(data.sort_order) : current.sort_order,
      active: data.active !== undefined ? (data.active ? 1 : 0) : current.active
    };

    db.prepare(
      `UPDATE team SET
         name = @name,
         role = @role,
         image = @image,
         sort_order = @sort_order,
         active = @active
       WHERE id = @id`
    ).run({ ...merged, id });

    return Team.find(id);
  },

  remove(id) {
    return db.prepare('DELETE FROM team WHERE id = ?').run(id).changes > 0;
  },

  reorder(ids) {
    const stmt = db.prepare('UPDATE team SET sort_order = ? WHERE id = ?');
    const tx = db.transaction((items) => {
      items.forEach((id, i) => stmt.run(i, id));
    });
    tx(ids.map(Number));
    return Team.all();
  }
};

module.exports = Team;
