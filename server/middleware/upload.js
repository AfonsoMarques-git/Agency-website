'use strict';

const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { v4: uuid } = require('uuid');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const MAX_BYTES = Number(process.env.UPLOAD_MAX_BYTES || 8 * 1024 * 1024);

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml'
]);

const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.svg']);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ALLOWED_EXT.has(ext) ? ext : '.bin';
    cb(null, `${uuid()}${safeExt}`);
  }
});

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_MIME.has(file.mimetype) || !ALLOWED_EXT.has(ext)) {
    return cb(
      new Error('Tipo de ficheiro não permitido (apenas JPEG, PNG, WebP, SVG).')
    );
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_BYTES, files: 1 }
});

module.exports = { upload, UPLOAD_DIR, MAX_BYTES };
