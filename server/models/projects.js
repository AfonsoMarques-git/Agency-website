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

const Projects = {
  all({ activeOnly = false, featuredOnly = false } = {}) {
    const where = [];
    if (activeOnly) where.push('active = 1');
    if (featuredOnly) where.push('featured = 1');
    const sql =
      'SELECT * FROM projects' +
      (where.length ? ' WHERE ' + where.join(' AND ') : '') +
      ' ORDER BY sort_order ASC, id ASC';
    return db.prepare(sql).all().map(parseTags);
  },

  find(id) {
    return parseTags(db.prepare('SELECT * FROM projects WHERE id = ?').get(id));
  },

  create(data) {
    const result = db
      .prepare(
        `INSERT INTO projects
           (title, subtitle, category, year, description, tags, image, size, featured, sort_order, active)
         VALUES (@title, @subtitle, @category, @year, @description, @tags, @image, @size, @featured, @sort_order, @active)`
      )
      .run({
        title: data.title,
        subtitle: data.subtitle || null,
        category: data.category || null,
        year: data.year ? Number(data.year) : null,
        description: data.description || null,
        tags: JSON.stringify(Array.isArray(data.tags) ? data.tags : []),
        image: data.image || null,
        size: data.size || 'normal',
        featured: data.featured ? 1 : 0,
        sort_order: Number.isFinite(data.sort_order) ? data.sort_order : 0,
        active: data.active === false ? 0 : 1
      });
    return Projects.find(result.lastInsertRowid);
  },

  update(id, data) {
    const current = Projects.find(id);
    if (!current) return null;

    const merged = {
      title: data.title ?? current.title,
      subtitle: data.subtitle ?? current.subtitle,
      category: data.category ?? current.category,
      year: data.year !== undefined ? (data.year ? Number(data.year) : null) : current.year,
      description: data.description ?? current.description,
      tags: JSON.stringify(
        Array.isArray(data.tags) ? data.tags : current.tags || []
      ),
      image: data.image ?? current.image,
      size: data.size ?? current.size,
      featured: data.featured !== undefined ? (data.featured ? 1 : 0) : current.featured,
      sort_order:
        data.sort_order !== undefined ? Number(data.sort_order) : current.sort_order,
      active: data.active !== undefined ? (data.active ? 1 : 0) : current.active
    };

    db.prepare(
      `UPDATE projects SET
         title = @title,
         subtitle = @subtitle,
         category = @category,
         year = @year,
         description = @description,
         tags = @tags,
         image = @image,
         size = @size,
         featured = @featured,
         sort_order = @sort_order,
         active = @active
       WHERE id = @id`
    ).run({ ...merged, id });

    return Projects.find(id);
  },

  remove(id) {
    return db.prepare('DELETE FROM projects WHERE id = ?').run(id).changes > 0;
  },

  reorder(ids) {
    const stmt = db.prepare('UPDATE projects SET sort_order = ? WHERE id = ?');
    const tx = db.transaction((items) => {
      items.forEach((id, i) => stmt.run(i, id));
    });
    tx(ids.map(Number));
    return Projects.all();
  }
};

module.exports = Projects;
