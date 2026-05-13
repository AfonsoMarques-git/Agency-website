'use strict';

const express = require('express');
const path = require('path');
const fs = require('fs');
const { body, param, validationResult } = require('express-validator');

const Projects = require('../models/projects');
const Services = require('../models/services');
const Team = require('../models/team');
const Testimonials = require('../models/testimonials');
const Episodes = require('../models/episodes');
const Media = require('../models/media');
const Settings = require('../models/settings');

const { requireAuthAPI } = require('../middleware/authMiddleware');
const { upload, UPLOAD_DIR } = require('../middleware/upload');

const router = express.Router();
router.use(requireAuthAPI);

// -------------------------------------------------------------
// Helpers
// -------------------------------------------------------------
function checkValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: errors.array()[0].msg, details: errors.array() });
    return false;
  }
  return true;
}

const idParam = param('id').isInt({ min: 1 }).withMessage('ID inválido.');

// -------------------------------------------------------------
// PROJECTS
// -------------------------------------------------------------
router.get('/projects', (req, res) => res.json(Projects.all()));
router.get('/projects/:id', [idParam], (req, res) => {
  if (!checkValidation(req, res)) return;
  const row = Projects.find(req.params.id);
  if (!row) return res.status(404).json({ error: 'Projeto não encontrado.' });
  res.json(row);
});

const projectValidators = [
  body('title').isString().trim().isLength({ min: 1, max: 200 }),
  body('subtitle').optional({ nullable: true }).isString().isLength({ max: 300 }),
  body('category').optional({ nullable: true }).isString().isLength({ max: 50 }),
  body('year').optional({ nullable: true }).isInt({ min: 1900, max: 2100 }),
  body('description').optional({ nullable: true }).isString().isLength({ max: 5000 }),
  body('tags').optional({ nullable: true }).isArray({ max: 20 }),
  body('image').optional({ nullable: true }).isString().isLength({ max: 300 }),
  body('size').optional({ nullable: true }).isIn(['normal', 'wide', 'lg']),
  body('featured').optional().toBoolean(),
  body('active').optional().toBoolean(),
  body('sort_order').optional().isInt()
];

router.post('/projects', projectValidators, (req, res) => {
  if (!checkValidation(req, res)) return;
  res.status(201).json(Projects.create(req.body));
});

router.put('/projects/:id', [idParam, ...projectValidators], (req, res) => {
  if (!checkValidation(req, res)) return;
  const row = Projects.update(req.params.id, req.body);
  if (!row) return res.status(404).json({ error: 'Projeto não encontrado.' });
  res.json(row);
});

router.delete('/projects/:id', [idParam], (req, res) => {
  if (!checkValidation(req, res)) return;
  Projects.remove(req.params.id);
  res.json({ ok: true });
});

router.post(
  '/projects/reorder',
  [body('ids').isArray({ min: 1 })],
  (req, res) => {
    if (!checkValidation(req, res)) return;
    res.json(Projects.reorder(req.body.ids));
  }
);

router.patch('/projects/:id', [idParam, body('active').isBoolean()], (req, res) => {
  if (!checkValidation(req, res)) return;
  const row = Projects.update(req.params.id, req.body);
  if (!row) return res.status(404).json({ error: 'Projeto não encontrado.' });
  res.json(row);
});

// -------------------------------------------------------------
// SERVICES
// -------------------------------------------------------------
router.get('/services', (req, res) => res.json(Services.all()));
router.get('/services/:id', [idParam], (req, res) => {
  if (!checkValidation(req, res)) return;
  const row = Services.find(req.params.id);
  if (!row) return res.status(404).json({ error: 'Serviço não encontrado.' });
  res.json(row);
});

const serviceValidators = [
  body('number').optional({ nullable: true }).isString().isLength({ max: 10 }),
  body('title').isString().trim().isLength({ min: 1, max: 200 }),
  body('description').optional({ nullable: true }).isString().isLength({ max: 5000 }),
  body('tags').optional({ nullable: true }).isArray({ max: 20 }),
  body('active').optional().toBoolean(),
  body('sort_order').optional().isInt()
];

router.post('/services', serviceValidators, (req, res) => {
  if (!checkValidation(req, res)) return;
  res.status(201).json(Services.create(req.body));
});

router.put('/services/:id', [idParam, ...serviceValidators], (req, res) => {
  if (!checkValidation(req, res)) return;
  const row = Services.update(req.params.id, req.body);
  if (!row) return res.status(404).json({ error: 'Serviço não encontrado.' });
  res.json(row);
});

router.delete('/services/:id', [idParam], (req, res) => {
  if (!checkValidation(req, res)) return;
  Services.remove(req.params.id);
  res.json({ ok: true });
});

router.post('/services/reorder', [body('ids').isArray({ min: 1 })], (req, res) => {
  if (!checkValidation(req, res)) return;
  res.json(Services.reorder(req.body.ids));
});

router.patch('/services/:id', [idParam, body('active').isBoolean()], (req, res) => {
  if (!checkValidation(req, res)) return;
  const row = Services.update(req.params.id, req.body);
  if (!row) return res.status(404).json({ error: 'Serviço não encontrado.' });
  res.json(row);
});

// -------------------------------------------------------------
// TEAM
// -------------------------------------------------------------
router.get('/team', (req, res) => res.json(Team.all()));
router.get('/team/:id', [idParam], (req, res) => {
  if (!checkValidation(req, res)) return;
  const row = Team.find(req.params.id);
  if (!row) return res.status(404).json({ error: 'Membro não encontrado.' });
  res.json(row);
});

const teamValidators = [
  body('name').isString().trim().isLength({ min: 1, max: 120 }),
  body('role').optional({ nullable: true }).isString().isLength({ max: 200 }),
  body('image').optional({ nullable: true }).isString().isLength({ max: 300 }),
  body('active').optional().toBoolean(),
  body('sort_order').optional().isInt()
];

router.post('/team', teamValidators, (req, res) => {
  if (!checkValidation(req, res)) return;
  res.status(201).json(Team.create(req.body));
});

router.put('/team/:id', [idParam, ...teamValidators], (req, res) => {
  if (!checkValidation(req, res)) return;
  const row = Team.update(req.params.id, req.body);
  if (!row) return res.status(404).json({ error: 'Membro não encontrado.' });
  res.json(row);
});

router.delete('/team/:id', [idParam], (req, res) => {
  if (!checkValidation(req, res)) return;
  Team.remove(req.params.id);
  res.json({ ok: true });
});

router.post('/team/reorder', [body('ids').isArray({ min: 1 })], (req, res) => {
  if (!checkValidation(req, res)) return;
  res.json(Team.reorder(req.body.ids));
});

router.patch('/team/:id', [idParam, body('active').isBoolean()], (req, res) => {
  if (!checkValidation(req, res)) return;
  const row = Team.update(req.params.id, req.body);
  if (!row) return res.status(404).json({ error: 'Membro não encontrado.' });
  res.json(row);
});

// -------------------------------------------------------------
// TESTIMONIALS
// -------------------------------------------------------------
router.get('/testimonials', (req, res) => res.json(Testimonials.all()));
router.get('/testimonials/:id', [idParam], (req, res) => {
  if (!checkValidation(req, res)) return;
  const row = Testimonials.find(req.params.id);
  if (!row) return res.status(404).json({ error: 'Testemunho não encontrado.' });
  res.json(row);
});

const testimonialValidators = [
  body('author').isString().trim().isLength({ min: 1, max: 120 }),
  body('company').optional({ nullable: true }).isString().isLength({ max: 200 }),
  body('quote').isString().trim().isLength({ min: 1, max: 2000 }),
  body('active').optional().toBoolean(),
  body('sort_order').optional().isInt()
];

router.post('/testimonials', testimonialValidators, (req, res) => {
  if (!checkValidation(req, res)) return;
  res.status(201).json(Testimonials.create(req.body));
});

router.put('/testimonials/:id', [idParam, ...testimonialValidators], (req, res) => {
  if (!checkValidation(req, res)) return;
  const row = Testimonials.update(req.params.id, req.body);
  if (!row) return res.status(404).json({ error: 'Testemunho não encontrado.' });
  res.json(row);
});

router.delete('/testimonials/:id', [idParam], (req, res) => {
  if (!checkValidation(req, res)) return;
  Testimonials.remove(req.params.id);
  res.json({ ok: true });
});

router.patch('/testimonials/:id', [idParam, body('active').isBoolean()], (req, res) => {
  if (!checkValidation(req, res)) return;
  const row = Testimonials.update(req.params.id, req.body);
  if (!row) return res.status(404).json({ error: 'Testemunho não encontrado.' });
  res.json(row);
});

// -------------------------------------------------------------
// EPISODES (WETALK)
// -------------------------------------------------------------
router.get('/episodes', (req, res) => res.json(Episodes.all()));
router.get('/episodes/:id', [idParam], (req, res) => {
  if (!checkValidation(req, res)) return;
  const row = Episodes.find(req.params.id);
  if (!row) return res.status(404).json({ error: 'Episódio não encontrado.' });
  res.json(row);
});

const episodeValidators = [
  body('number').optional({ nullable: true }).isString().isLength({ max: 20 }),
  body('title').isString().trim().isLength({ min: 1, max: 200 }),
  body('subtitle').optional({ nullable: true }).isString().isLength({ max: 300 }),
  body('description').optional({ nullable: true }).isString().isLength({ max: 5000 }),
  body('tags').optional({ nullable: true }).isArray({ max: 20 }),
  body('image').optional({ nullable: true }).isString().isLength({ max: 300 }),
  body('size').optional({ nullable: true }).isIn(['normal', 'wide', 'lg']),
  body('active').optional().toBoolean(),
  body('sort_order').optional().isInt()
];

router.post('/episodes', episodeValidators, (req, res) => {
  if (!checkValidation(req, res)) return;
  res.status(201).json(Episodes.create(req.body));
});

router.put('/episodes/:id', [idParam, ...episodeValidators], (req, res) => {
  if (!checkValidation(req, res)) return;
  const row = Episodes.update(req.params.id, req.body);
  if (!row) return res.status(404).json({ error: 'Episódio não encontrado.' });
  res.json(row);
});

router.delete('/episodes/:id', [idParam], (req, res) => {
  if (!checkValidation(req, res)) return;
  Episodes.remove(req.params.id);
  res.json({ ok: true });
});

router.post('/episodes/reorder', [body('ids').isArray({ min: 1 })], (req, res) => {
  if (!checkValidation(req, res)) return;
  res.json(Episodes.reorder(req.body.ids));
});

router.patch('/episodes/:id', [idParam, body('active').isBoolean()], (req, res) => {
  if (!checkValidation(req, res)) return;
  const row = Episodes.update(req.params.id, req.body);
  if (!row) return res.status(404).json({ error: 'Episódio não encontrado.' });
  res.json(row);
});

// -------------------------------------------------------------
// SETTINGS
// -------------------------------------------------------------
router.get('/settings', (req, res) => res.json(Settings.all()));

router.put(
  '/settings',
  [body().isObject({ min: 1 })],
  (req, res) => {
    if (!checkValidation(req, res)) return;
    // Hard cap on values to prevent abuse.
    for (const [k, v] of Object.entries(req.body)) {
      if (typeof k !== 'string' || k.length > 80) {
        return res.status(400).json({ error: `Chave inválida: ${k}` });
      }
      if (typeof v !== 'string' || v.length > 10000) {
        return res.status(400).json({ error: `Valor inválido para "${k}".` });
      }
    }
    res.json(Settings.setMany(req.body));
  }
);

// -------------------------------------------------------------
// MEDIA
// -------------------------------------------------------------
router.get('/media', (req, res) => res.json(Media.all()));

router.post('/media', (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'Falha no upload.' });
    }
    if (!req.file) return res.status(400).json({ error: 'Nenhum ficheiro recebido.' });

    const url = `/uploads/${req.file.filename}`;
    const row = Media.create({
      filename: req.file.filename,
      original_name: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url
    });
    res.status(201).json(row);
  });
});

router.delete('/media/:id', [idParam], (req, res) => {
  if (!checkValidation(req, res)) return;
  const removed = Media.remove(req.params.id);
  if (!removed) return res.status(404).json({ error: 'Ficheiro não encontrado.' });

  // Only delete physical file if it lives in uploads/ (not in public/assets/ static files).
  if (removed.url && removed.url.startsWith('/uploads/')) {
    const safe = path.basename(removed.filename);
    const filePath = path.join(UPLOAD_DIR, safe);
    if (filePath.startsWith(UPLOAD_DIR) && fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch { /* ignore */ }
    }
  }
  res.json({ ok: true });
});

module.exports = router;
