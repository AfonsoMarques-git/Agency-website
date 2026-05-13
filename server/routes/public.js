'use strict';

const express = require('express');

const Projects = require('../models/projects');
const Services = require('../models/services');
const Team = require('../models/team');
const Testimonials = require('../models/testimonials');
const Episodes = require('../models/episodes');
const Settings = require('../models/settings');

const router = express.Router();

router.get('/health', (req, res) => res.json({ ok: true, uptime: process.uptime() }));

router.get('/settings', (req, res) => res.json(Settings.all()));
router.get('/projects', (req, res) =>
  res.json(
    Projects.all({
      activeOnly: true,
      featuredOnly: req.query.featured === '1'
    })
  )
);
router.get('/services', (req, res) =>
  res.json(Services.all({ activeOnly: true }))
);
router.get('/team', (req, res) => res.json(Team.all({ activeOnly: true })));
router.get('/testimonials', (req, res) =>
  res.json(Testimonials.all({ activeOnly: true }))
);
router.get('/episodes', (req, res) => res.json(Episodes.all({ activeOnly: true })));

router.post('/contact', (req, res) => {
  // Submission endpoint — currently a stub (no DB row needed).
  // Validation is intentionally light because the public form already
  // does client-side checks; we just acknowledge receipt.
  res.json({ ok: true });
});

module.exports = router;
