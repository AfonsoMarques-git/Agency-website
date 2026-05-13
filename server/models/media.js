'use strict';

const db = require('../db');

const Media = {
  all() {
    return db
      .prepare('SELECT * FROM media ORDER BY uploaded_at DESC')
      .all();
  },

  find(id) {
    return db.prepare('SELECT * FROM media WHERE id = ?').get(id);
  },

  create(data) {
    const result = db
      .prepare(
        `INSERT INTO media (filename, original_name, mimetype, size, url)
         VALUES (@filename, @original_name, @mimetype, @size, @url)`
      )
      .run({
        filename: data.filename,
        original_name: data.original_name || null,
        mimetype: data.mimetype || null,
        size: data.size || 0,
        url: data.url
      });
    return Media.find(result.lastInsertRowid);
  },

  remove(id) {
    const file = Media.find(id);
    if (!file) return null;
    db.prepare('DELETE FROM media WHERE id = ?').run(id);
    return file;
  }
};

module.exports = Media;
