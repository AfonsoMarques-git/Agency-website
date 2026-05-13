/**
 * WEMOV Agency — Express server
 *
 * Serves:
 *   - The public website (EJS views + /public assets)
 *   - The admin SPA at /admin (cookie-protected)
 *   - The admin REST API at /api/*
 *   - User uploads at /uploads
 */

'use strict';

require('dotenv').config();

const path = require('path');
const fs = require('fs');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const Settings = require('./models/settings');
const Projects = require('./models/projects');
const Services = require('./models/services');
const Team = require('./models/team');
const Testimonials = require('./models/testimonials');
const Episodes = require('./models/episodes');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/public');

const { requireAuthPage } = require('./middleware/authMiddleware');

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const IS_PROD = process.env.NODE_ENV === 'production';

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

// -------------------------------------------------------------
// View engine
// -------------------------------------------------------------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

// -------------------------------------------------------------
// Security headers (helmet) + Permissions-Policy
// -------------------------------------------------------------
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "https://fonts.googleapis.com",
          "https://cdn.jsdelivr.net",
          "https://unpkg.com",
          "'sha256-PeeSNRezZOFIakZ5MIOSPEwYlQYSy57m0xBB6ZRhVrY='"
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com"
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com", 'data:'],
        imgSrc: ["'self'", 'data:', 'blob:'],
        connectSrc: ["'self'"],
        frameAncestors: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"]
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'same-site' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts: IS_PROD
      ? { maxAge: 31536000, includeSubDomains: true, preload: true }
      : false
  })
);

app.use((req, res, next) => {
  res.setHeader(
    'Permissions-Policy',
    'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()'
  );
  next();
});

// -------------------------------------------------------------
// Core middleware
// -------------------------------------------------------------
app.use(compression());
app.use(express.json({ limit: '256kb' }));
app.use(express.urlencoded({ extended: true, limit: '256kb' }));
app.use(cookieParser());

// Allow multiple comma-separated origins (useful during local dev across devices)
const rawOrigin = process.env.PUBLIC_ORIGIN || '';
const allowedOrigins = rawOrigin
  ? rawOrigin.split(',').map(o => o.trim()).filter(Boolean)
  : null;
const origin = !allowedOrigins || allowedOrigins.length === 0
  ? true
  : (incoming, cb) => {
      if (!incoming || allowedOrigins.includes(incoming)) return cb(null, true);
      cb(new Error(`CORS: origin ${incoming} not allowed`));
    };
app.use(cors({ origin, credentials: true }));

// API rate limiter — 100 req / 15 min per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados pedidos. Tente novamente em instantes.' }
});
app.use('/api/', apiLimiter);

// -------------------------------------------------------------
// Static files
// -------------------------------------------------------------
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
const ADMIN_DIR = path.join(__dirname, '..', 'admin');

app.use(
  express.static(PUBLIC_DIR, {
    maxAge: IS_PROD ? '7d' : 0,
    etag: true
  })
);

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Uploads — restrict to image responses & disable directory listing.
app.use(
  '/uploads',
  express.static(UPLOAD_DIR, {
    fallthrough: false,
    setHeaders: (res) => {
      res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
      res.setHeader('X-Content-Type-Options', 'nosniff');
    }
  })
);

// -------------------------------------------------------------
// PUBLIC PAGE ROUTES (EJS)
// -------------------------------------------------------------
function baseData() {
  return {
    settings: Settings.all(),
    year: new Date().getFullYear()
  };
}

app.get(['/', '/index'], (req, res) => {
  const data = baseData();
  data.featuredProjects = Projects.all({ activeOnly: true, featuredOnly: true }).slice(0, 6);
  data.testimonials = Testimonials.all({ activeOnly: true });
  res.render('index', { data, page: 'home' });
});

app.get('/sobre', (req, res) => {
  const data = baseData();
  data.team = Team.all({ activeOnly: true });
  res.render('sobre', { data, page: 'sobre' });
});

app.get('/servicos', (req, res) => {
  const data = baseData();
  data.services = Services.all({ activeOnly: true });
  data.testimonials = Testimonials.all({ activeOnly: true });
  res.render('servicos', { data, page: 'servicos' });
});

app.get('/projetos', (req, res) => {
  const data = baseData();
  data.projects = Projects.all({ activeOnly: true });
  res.render('projetos', { data, page: 'projetos' });
});

app.get('/podcast', (req, res) => {
  const data = baseData();
  data.episodes = Episodes.all({ activeOnly: true });
  res.render('podcast', { data, page: 'podcast' });
});

app.get('/contacto', (req, res) => {
  const data = baseData();
  res.render('contacto', { data, page: 'contacto' });
});

app.get('/privacidade', (req, res) => {
  const data = baseData();
  res.render('privacidade', { data, page: '' });
});

// Individual project detail page
app.get('/projetos/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.redirect(301, '/projetos');
  const data = baseData();
  const project = Projects.find(id);
  if (!project || !project.active) return res.status(404).render('404', { data });
  data.project = project;
  data.relatedProjects = Projects.all({ activeOnly: true })
    .filter(p => p.id !== project.id && p.category === project.category)
    .slice(0, 3);
  res.render('projeto', { data, page: 'projetos' });
});

// Individual service detail page
app.get('/servicos/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.redirect(301, '/servicos');
  const data = baseData();
  const service = Services.find(id);
  if (!service || !service.active) return res.status(404).render('404', { data });
  // Derive project category from service title keywords
  const t = (service.title || '').toLowerCase();
  let cat = null;
  if      (t.includes('foto'))                                  cat = 'foto';
  else if (t.includes('podcast') || t.includes('est'))         cat = 'podcast';
  else if (t.includes('branding'))                             cat = 'branding';
  else if (t.includes('consultoria'))                          cat = 'consultoria';
  else if (t.includes('video') || t.includes('vídeo') || t.includes('audiovisual') || t.includes('filmagem')) cat = 'video';
  const allProjects = Projects.all({ activeOnly: true });
  data.service       = service;
  data.serviceProjects = cat ? allProjects.filter(p => p.category === cat) : allProjects.slice(0, 6);
  data.otherServices = Services.all({ activeOnly: true }).filter(s => s.id !== service.id);
  res.render('servico', { data, page: 'servicos' });
});

// Legacy .html → clean URL redirects (so old links keep working).
const legacy = {
  '/index.html': '/',
  '/sobre.html': '/sobre',
  '/servicos.html': '/servicos',
  '/projetos.html': '/projetos',
  '/podcast.html': '/podcast',
  '/contacto.html': '/contacto'
};
for (const [from, to] of Object.entries(legacy)) {
  app.get(from, (req, res) => res.redirect(301, to));
}

// -------------------------------------------------------------
// ADMIN — login page (public), SPA (protected)
// -------------------------------------------------------------
app.get('/admin/login', (req, res) => {
  res.sendFile(path.join(ADMIN_DIR, 'login.html'));
});

// Static admin assets (CSS, JS) — public, no auth required to load.
app.use(
  '/admin/assets',
  express.static(path.join(ADMIN_DIR, 'assets'), {
    maxAge: IS_PROD ? '7d' : 0
  })
);

app.get('/admin', requireAuthPage, (req, res) => {
  res.sendFile(path.join(ADMIN_DIR, 'index.html'));
});
app.get('/admin/*', requireAuthPage, (req, res) => {
  res.sendFile(path.join(ADMIN_DIR, 'index.html'));
});

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);

// -------------------------------------------------------------
// Error handling
// -------------------------------------------------------------
app.use((req, res) => {
  if (req.accepts('html')) return res.status(404).render('404', { data: baseData() });
  res.status(404).json({ error: 'Not found.' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  console.error('[server] error:', err);
  const status = err.status || 500;
  if (req.accepts('html') && !req.path.startsWith('/api')) {
    return res.status(status).render('500', { data: baseData(), message: err.message });
  }
  res.status(status).json({ error: err.message || 'Erro interno.' });
});

// -------------------------------------------------------------
// Start
// -------------------------------------------------------------
app.listen(PORT, HOST, () => {
  console.log(`\nWEMOV Agency — ready`);
  console.log(`  Site:  http://localhost:${PORT}`);
  console.log(`  Admin: http://localhost:${PORT}/admin/login\n`);
});
