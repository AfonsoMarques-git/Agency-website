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

const Episodes = {
  all({ activeOnly = false } = {}) {
    const sql =
      'SELECT * FROM episodes' +
      (activeOnly ? ' WHERE active = 1' : '') +
      ' ORDER BY sort_order ASC, id ASC';
    return db.prepare(sql).all().map(parseTags);
  },

  find(id) {
    return parseTags(db.prepare('SELECT * FROM episodes WHERE id = ?').get(id));
  },

  create(data) {
    const result = db
      .prepare(
        `INSERT INTO episodes
           (number, title, subtitle, description, tags, image, size, sort_order, active)
         VALUES (@number, @title, @subtitle, @description, @tags, @image, @size, @sort_order, @active)`
      )
      .run({
        number: data.number || null,
        title: data.title,
        subtitle: data.subtitle || null,
        description: data.description || null,
        tags: JSON.stringify(Array.isArray(data.tags) ? data.tags : []),
        image: data.image || null,
        size: data.size || 'normal',
        sort_order: Number.isFinite(data.sort_order) ? data.sort_order : 0,
        active: data.active === false ? 0 : 1
      });
    return Episodes.find(result.lastInsertRowid);
  },

  update(id, data) {
    const current = Episodes.find(id);
    if (!current) return null;

    const merged = {
      number: data.number ?? current.number,
      title: data.title ?? current.title,
      subtitle: data.subtitle ?? current.subtitle,
      description: data.description ?? current.description,
      tags: JSON.stringify(
        Array.isArray(data.tags) ? data.tags : current.tags || []
      ),
      image: data.image ?? current.image,
      size: data.size ?? current.size,
      sort_order:
        data.sort_order !== undefined ? Number(data.sort_order) : current.sort_order,
      active: data.active !== undefined ? (data.active ? 1 : 0) : current.active
    };

    db.prepare(
      `UPDATE episodes SET
         number = @number,
         title = @title,
         subtitle = @subtitle,
         description = @description,
         tags = @tags,
         image = @image,
         size = @size,
         sort_order = @sort_order,
         active = @active
       WHERE id = @id`
    ).run({ ...merged, id });

    return Episodes.find(id);
  },

  remove(id) {
    return db.prepare('DELETE FROM episodes WHERE id = ?').run(id).changes > 0;
  },

  reorder(ids) {
    const stmt = db.prepare('UPDATE episodes SET sort_order = ? WHERE id = ?');
    const tx = db.transaction((items) => {
      items.forEach((id, i) => stmt.run(i, id));
    });
    tx(ids.map(Number));
    return Episodes.all();
  }
};

module.exports = Episodes;
