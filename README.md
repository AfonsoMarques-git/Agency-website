This project is a full-stack website and content management platform for a creative studio.

It includes:
- A public website rendered with EJS templates
- A protected admin panel for content operations
- A REST API for admin and public data access
- SQLite persistence with automatic bootstrap seed
- Media upload support for project and team assets

## Highlights

- Full content management for projects, services, team, testimonials, episodes, and global settings
- Secure admin authentication with JWT in HTTP-only cookies
- Login and API rate limiting
- Security middleware with Helmet, CORS controls, and hardened static delivery
- Built-in data seed for first run (site content + default admin user)
- Clean URL pages with legacy HTML redirects
- Upload library with file metadata tracking

## Tech Stack

- Backend: Node.js, Express
- Views: EJS
- Database: SQLite via better-sqlite3
- Auth/Security: JWT, bcryptjs, helmet, express-rate-limit, cookie-parser
- Validation/Uploads: express-validator, multer
- Utility: compression, dotenv, uuid

## Project Structure

```text
Project Name/
├── admin/                 # Admin UI (login + SPA shell + assets)
├── data/                  # SQLite database file (created at runtime)
├── public/                # Public static assets (CSS/JS/images)
├── server/
│   ├── index.js           # App bootstrap and route mounting
│   ├── db.js              # SQLite schema + seed logic
│   ├── middleware/        # Auth/upload middleware
│   ├── models/            # Data access layer
│   └── routes/            # Auth, admin API, public API
├── uploads/               # Uploaded media files
├── views/                 # Public EJS pages
├── instructions.md        # Operational manager manual (PT)
└── package.json
```

## Requirements

- Node.js 18+
- npm

Recommended for production:
- PM2 (or another process manager)
- Reverse proxy with HTTPS (Nginx/Caddy)

## Quick Start

1. Install dependencies

```bash
npm install
```

2. Create environment file

```bash
cp .env.example .env
```

PowerShell alternative:

```powershell
Copy-Item .env.example .env
```

3. Update required values in .env

- JWT_SECRET
- PUBLIC_ORIGIN
- DEFAULT_ADMIN_USERNAME
- DEFAULT_ADMIN_PASSWORD

4. Start the app

```bash
npm start
```

Server defaults:
- Site: http://localhost:3000
- Admin login: http://localhost:3000/admin/login

## Environment Variables

Main variables from .env.example:

- PORT: HTTP server port (default 3000)
- HOST: bind host (default 0.0.0.0)
- NODE_ENV: development or production
- PUBLIC_ORIGIN: allowed browser origin(s) for CORS/cookies
- JWT_SECRET: required secret for signing admin tokens
- JWT_EXPIRES_IN: token lifetime (example: 8h)
- SESSION_COOKIE_NAME: auth cookie name
- ADMIN_SETUP_KEY: optional setup/reset key
- DEFAULT_ADMIN_USERNAME: seeded admin username
- DEFAULT_ADMIN_PASSWORD: seeded admin password
- UPLOAD_MAX_BYTES: max upload size in bytes

## Available Scripts

- npm start: start the production server
- npm run dev: start with Node watch mode
- npm run seed: run database seed flow directly

## Public Website Routes

- /, /index
- /sobre
- /servicos
- /projetos
- /podcast
- /contacto
- /privacidade
- /projetos/:id
- /servicos/:id

Legacy redirect support:
- /index.html -> /
- /sobre.html -> /sobre
- /servicos.html -> /servicos
- /projetos.html -> /projetos
- /podcast.html -> /podcast
- /contacto.html -> /contacto

## API Overview

### Auth API

Base: /api/auth

- POST /login
- POST /logout
- GET /me
- POST /change-password

### Admin API (authenticated)

Base: /api/admin

CRUD + status/reorder endpoints for:
- projects
- services
- team
- testimonials
- episodes
- settings (bulk update)
- media (upload/list/delete)

### Public API

Base: /api/public

- GET /health
- GET /settings
- GET /projects
- GET /services
- GET /team
- GET /testimonials
- GET /episodes
- POST /contact

## Data and Seeding

On first run, the app initializes:
- SQLite database at data/wemov.db
- Required tables and indexes
- Default content for site sections
- Default admin user from environment values

The seed is idempotent per table: it only inserts when target tables are empty.

## Security Notes

- Helmet is enabled with a strict CSP baseline
- API and auth login are rate limited
- Admin session uses HTTP-only cookies
- Upload directory is isolated and served with safe headers
- Production cookies require HTTPS when NODE_ENV=production
- Passwords are hashed with bcrypt

## Uploads and Media

- Accepted formats (configured in upload middleware): common image types including JPEG/PNG/WebP/SVG
- Files are saved in uploads/
- Metadata is tracked in the media table
- Admin can upload, browse, and remove files from the panel

## Deployment

Typical production flow:

1. Install dependencies in server environment
2. Set NODE_ENV=production and a strong JWT_SECRET
3. Run with PM2 (or equivalent)
4. Place behind HTTPS reverse proxy

Example PM2 command:

```bash
pm2 start server/index.js --name wemov
```

## Backups

Backup both:
- data/wemov.db
- uploads/

These two locations contain persistent application state and uploaded content.

## Notes for Maintainers

- The admin panel lives under admin/ and is served at /admin
- Public pages are server-rendered from views/
- The operational manual in Portuguese is available at instructions.md

## License

This repository currently has no license file.
If you plan to distribute or open-source the project, add a LICENSE file to define usage terms.
