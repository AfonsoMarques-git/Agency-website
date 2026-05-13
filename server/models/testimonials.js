'use strict';

const db = require('../db');

const Testimonials = {
  all({ activeOnly = false } = {}) {
    const sql =
      'SELECT * FROM testimonials' +
      (activeOnly ? ' WHERE active = 1' : '') +
      ' ORDER BY sort_order ASC, id ASC';
    return db.prepare(sql).all();
  },

  find(id) {
    return db.prepare('SELECT * FROM testimonials WHERE id = ?').get(id);
  },

  create(data) {
    const result = db
      .prepare(
        `INSERT INTO testimonials (author, company, quote, sort_order, active)
         VALUES (@author, @company, @quote, @sort_order, @active)`
      )
      .run({
        author: data.author,
        company: data.company || null,
        quote: data.quote,
        sort_order: Number.isFinite(data.sort_order) ? data.sort_order : 0,
        active: data.active === false ? 0 : 1
      });
    return Testimonials.find(result.lastInsertRowid);
  },

  update(id, data) {
    const current = Testimonials.find(id);
    if (!current) return null;

    const merged = {
      author: data.author ?? current.author,
      company: data.company ?? current.company,
      quote: data.quote ?? current.quote,
      sort_order:
        data.sort_order !== undefined ? Number(data.sort_order) : current.sort_order,
      active: data.active !== undefined ? (data.active ? 1 : 0) : current.active
    };

    db.prepare(
      `UPDATE testimonials SET
         author = @author,
         company = @company,
         quote = @quote,
         sort_order = @sort_order,
         active = @active
       WHERE id = @id`
    ).run({ ...merged, id });

    return Testimonials.find(id);
  },

  remove(id) {
    return db.prepare('DELETE FROM testimonials WHERE id = ?').run(id).changes > 0;
  }
};

module.exports = Testimonials;
