/**
 * WEMOV Agency — Database (SQLite via better-sqlite3)
 *
 * - Creates the SQLite file at  data/wemov.db
 * - Initializes the full schema on first run
 * - Seeds real WEMOV content (settings, services, projects, team,
 *   testimonials, podcast episodes) and a default admin user
 *
 * Run standalone with `node server/db.js --seed` to (re)seed.
 */

'use strict';

require('dotenv').config();

const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_FILE = path.join(DATA_DIR, 'wemov.db');
const db = new Database(DB_FILE);

// Pragmas — performance + integrity
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('synchronous = NORMAL');

// -------------------------------------------------------------
// SCHEMA
// -------------------------------------------------------------
const SCHEMA = `
CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  subtitle    TEXT,
  category    TEXT,
  year        INTEGER,
  description TEXT,
  tags        TEXT,
  image       TEXT,
  size        TEXT DEFAULT 'normal',  -- normal | wide | lg
  featured    INTEGER DEFAULT 0,
  sort_order  INTEGER DEFAULT 0,
  active      INTEGER DEFAULT 1,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  number      TEXT,
  title       TEXT NOT NULL,
  description TEXT,
  tags        TEXT,
  sort_order  INTEGER DEFAULT 0,
  active      INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS team (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  role       TEXT,
  image      TEXT,
  sort_order INTEGER DEFAULT 0,
  active     INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS testimonials (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  author  TEXT NOT NULL,
  company TEXT,
  quote   TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  active  INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS episodes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  number      TEXT,
  title       TEXT NOT NULL,
  subtitle    TEXT,
  description TEXT,
  tags        TEXT,
  image       TEXT,
  size        TEXT DEFAULT 'normal',
  sort_order  INTEGER DEFAULT 0,
  active      INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS media (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  filename      TEXT NOT NULL,
  original_name TEXT,
  mimetype      TEXT,
  size          INTEGER,
  url           TEXT,
  uploaded_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_users (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  username        TEXT UNIQUE NOT NULL,
  password_hash   TEXT NOT NULL,
  failed_attempts INTEGER DEFAULT 0,
  locked_until    DATETIME,
  last_login_at   DATETIME,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_projects_active     ON projects(active, sort_order);
CREATE INDEX IF NOT EXISTS idx_projects_featured   ON projects(featured, sort_order);
CREATE INDEX IF NOT EXISTS idx_services_active     ON services(active, sort_order);
CREATE INDEX IF NOT EXISTS idx_team_active         ON team(active, sort_order);
CREATE INDEX IF NOT EXISTS idx_episodes_active     ON episodes(active, sort_order);
CREATE INDEX IF NOT EXISTS idx_testimonials_active ON testimonials(active, sort_order);
`;

db.exec(SCHEMA);

// -------------------------------------------------------------
// SEED — only inserts rows when tables are empty
// -------------------------------------------------------------
function isEmpty(table) {
  return db.prepare(`SELECT COUNT(*) AS c FROM ${table}`).get().c === 0;
}

function seedSettings() {
  if (!isEmpty('settings')) return;

  const data = {
    // Brand
    brand_name: 'WEMOV Agency',
    brand_tagline: 'Beyond Stories',
    brand_location: 'EST. BRAGA',

    // Hero (home)
    hero_pill: 'Agora a aceitar projetos — 2026',
    hero_line_1: 'A sua',
    hero_line_2: 'narrativa é <em>autêntica</em>.',
    hero_line_3: 'Beyond <span class="hero__title-cyan">Stories</span>.',
    hero_lede:
      'Somos a WEMOV Agency — criadores de experiências audiovisuais. Contamos histórias que vão além do vídeo, da fotografia e do conteúdo multimedia, conectando marcas e pessoas com relações verdadeiras e inesquecíveis.',

    // Stats (home)
    stat_projects: '120',
    stat_projects_label: 'Projetos<br/>entregues',
    stat_brands: '48',
    stat_brands_label: 'Marcas<br/>parceiras',
    stat_years: '9',
    stat_years_label: 'Anos a contar<br/>histórias',
    stat_ideas_label: 'Ideias por<br/>contar',

    // Home about teaser
    home_about_lede:
      'Somos a <em>WEMOV Agency</em> — criadores de experiências audiovisuais. Acreditamos que as melhores histórias são aquelas que <span class="hl">desenvolvem vínculos reais</span>, conectam marcas e pessoas, e criam relações verdadeiras e inesquecíveis.',
    home_about_para:
      'A nossa cultura é guiada pela inovação e pela procura incessante de novas formas de comunicar, impactar e surpreender. O nosso objetivo é claro: usar a experiência para alavancar o seu sucesso, com conteúdos relevantes, eficazes e que tragam resultados reais para o seu negócio — mais visibilidade, autoridade e um elo emocional com o seu público.',

    // Sobre page
    sobre_title_line_1: 'Somos',
    sobre_title_line_2: 'a <em>WEMOV</em>.',
    sobre_lede:
      'We live beyond stories. Uma equipa criativa a contar histórias que respiram, param o tempo e despertam emoções — em vídeo, fotografia, branding e som.',
    sobre_about_lede:
      'Somos a <em>WEMOV Agency</em> — criadores de experiências audiovisuais. Contamos histórias que vão além do vídeo, da fotografia e do conteúdo multimedia. Acreditamos que as melhores histórias são aquelas que desenvolvem <span class="hl">vínculos reais</span>, conectam marcas e pessoas, criando relações verdadeiras e inesquecíveis.',
    sobre_about_para_1:
      'A nossa cultura é guiada pela inovação e pela procura incessante de novas formas de comunicar, impactar e surpreender. O nosso objetivo é claro: usar a nossa experiência para alavancar o seu sucesso, com conteúdos relevantes, eficazes e que, acima de tudo, tragam resultados reais para o seu negócio — mais visibilidade, autoridade e um elo emocional com o seu público.',
    sobre_about_para_2:
      'Existimos para criar histórias que respiram, que param o tempo e despertam emoções. Uma marca transcende o desenho visual: é uma narrativa viva, uma memória que permanece. A nossa abordagem é visceral e elegante, espontânea e precisa — e cada projeto começa com uma pergunta: <em>qual é a verdade desta história?</em>',
    sobre_pillar_1_title: 'Autenticidade',
    sobre_pillar_1_desc:
      'Cada narrativa nasce da identidade real da marca. Sem filtros artificiais, sem fórmulas vazias — a sua narrativa é autêntica.',
    sobre_pillar_2_title: 'Inovação',
    sobre_pillar_2_desc:
      'Procura incessante por novas linguagens, formatos e tecnologias que elevam o impacto e surpreendem o público.',
    sobre_pillar_3_title: 'Resultado',
    sobre_pillar_3_desc:
      'Conteúdo que se mede em visibilidade, autoridade e ligação emocional — com resultados reais para o seu negócio.',
    sobre_manifesto:
      '“Além das histórias, <em>criamos movimentos.</em> A nossa essência é uma paixão ardente por conexão — cada projeto carrega intenção transformadora.”',
    sobre_manifesto_sig: '— Manifesto WEMOV · Beyond Stories',

    // Serviços page
    servicos_title_line_1: 'O que',
    servicos_title_line_2: '<em>fazemos</em>.',
    servicos_lede:
      'Da ideia ao master final. Da estratégia à publicação. Um ecossistema completo de criação audiovisual e de marca — com tudo a acontecer em casa.',

    // Projetos page
    projetos_title_line_1: 'We create',
    projetos_title_line_2: 'experiences <em>beyond stories</em>.',
    projetos_lede:
      'Criamos projetos autênticos de fotografia, vídeo, branding, consultoria e podcast — com experiências imersivas e estratégias que vivenciam a sua narrativa única.',

    // Podcast / Estúdio
    podcast_title_line_1: 'WETALK',
    podcast_title_line_2: '<em>Let&#39;s talk!</em>',
    podcast_lede:
      'O nosso momento de conversar sobre tudo — sem filtros. Histórias criam momentos, conversas tornam-se partilha e nós criamos o seu podcast. Estúdio próprio em Braga com mais de 30 m², cenários personalizados e tecnologia avançada.',
    podcast_studio_title_1: 'Damos <em>voz</em>',
    podcast_studio_title_2: 'à sua marca.',
    podcast_studio_lede:
      'Gravamos, montamos e distribuímos o seu podcast em áudio e vídeo — pronto para Spotify, YouTube e plataformas sociais. Mais de 30 m² de estúdio próprio em Braga, com cenografia personalizável, identidade visual integrada e workflow editorial preparado para temporadas inteiras.',
    podcast_feature_1: 'Estúdio próprio com mais de 30 m² no Parque Industrial das Sete Fontes',
    podcast_feature_2: 'Captação áudio multi-canal com vários convidados',
    podcast_feature_3: 'Vídeo multi-câmara com switcher ao vivo',
    podcast_feature_4: 'Cenografia personalizada à identidade da marca',
    podcast_feature_5: 'Edição, motion, thumbnails e distribuição multi-plataforma',
    podcast_feature_6: 'Tratamento acústico profissional e tecnologia avançada',

    // Contacto
    contacto_title_line_1: 'We&#39;re',
    contacto_title_line_2: 'here for',
    contacto_title_line_3: '<em>you.</em>',
    contacto_lede:
      'Chegou o momento de nos enviar uma mensagem e descobrirmos juntos o que podemos fazer de incrível para a sua marca. Sem bots, apenas humanos — prometido.',

    // Contact info
    contact_email: 'geral@wemovagency.com',
    contact_phone_label: '(+351) 913 702 044',
    contact_phone_tel: '+351913702044',
    contact_address: 'Parque Industrial das Sete Fontes 16<br/>4710-594 Braga, Portugal',
    contact_hours: 'Segunda a sexta · 09h00 — 19h00',

    // Socials
    social_instagram: 'https://www.instagram.com/wemovagency/',
    social_youtube: 'https://www.youtube.com/@wemovagency',
    social_tiktok: 'https://www.tiktok.com/@wemovagency',
    social_facebook: 'https://www.facebook.com/wemovcreativeagency/',

    // Footer
    footer_copyright: '© 2026 WEMOV Agency.',
    footer_rights: 'Todos os direitos reservados.',
    footer_credits: 'Feito em Braga — com café e som a 24fps.',

    // Hero corners (cinematic HUD)
    hero_corner_tl: '[ N 41.5454° · W 8.4265° ]',
    hero_corner_bl: 'FILE // WEMOV_2026_REEL.MOV',
    hero_corner_br: 'ISO 800 · 24fps',

    // Clients marquee (pipe-separated)
    clients_list:
      'Torre de Gomariz|SMC-THC|PremiumEnergy|Chromolite|GMS Transport|JLS|Wine & Spa Hotel|WETALK Podcast'
  };

  const stmt = db.prepare(
    'INSERT INTO settings (key, value) VALUES (@key, @value)'
  );
  const tx = db.transaction((entries) => {
    for (const [key, value] of entries) stmt.run({ key, value });
  });
  tx(Object.entries(data));
}

function seedServices() {
  if (!isEmpty('services')) return;

  const rows = [
    {
      number: '01',
      title: 'Produção Audiovisual',
      description:
        'Concebemos e produzimos filmes corporativos, anúncios, documentais e conteúdo de campanha. Equipa, equipamento e direção criativa — tudo em casa.',
      tags: ['Direção', 'Realização', 'Pós-produção', 'Som', 'Cor']
    },
    {
      number: '02',
      title: 'Vídeo & Filmagem Profissional',
      description:
        'Eventos, institucionais, casamentos premium e reportagem. Captação 4K/6K com câmara cinema, gimbals, drones e iluminação cinematográfica.',
      tags: ['4K / 6K', 'Drone', 'Gimbal', 'Live Multi-Cam']
    },
    {
      number: '03',
      title: 'Fotografia',
      description:
        'Imagem comercial, retrato corporativo, produto e lifestyle. Tratamento de cor refinado, com identidade visual coerente em todos os formatos.',
      tags: ['Produto', 'Lifestyle', 'Corporativo', 'Editorial']
    },
    {
      number: '04',
      title: 'Criação de Conteúdo',
      description:
        'Reels, formatos curtos, social-first e pacotes mensais de conteúdo. Estratégia editorial que transforma marcas em criadores consistentes.',
      tags: ['Social', 'Reels', 'UGC', 'Calendário editorial']
    },
    {
      number: '05',
      title: 'Estúdio de Podcast',
      description:
        'Estúdio próprio em Braga, equipado para podcast em áudio e vídeo. Tratamento acústico, multi-câmara, edição e distribuição multi-plataforma.',
      tags: ['Áudio', 'Vídeo', 'Edição', 'Distribuição']
    },
    {
      number: '06',
      title: 'Branding',
      description:
        'Identidade visual com profundidade estratégica. Naming, logótipo, sistema de design, manual de marca e ativação visual — tudo construído para durar.',
      tags: ['Naming', 'Identidade', 'Design System', 'Aplicações']
    },
    {
      number: '07',
      title: 'Marketing Digital',
      description:
        'Estratégia, performance e gestão de campanhas. Tráfego pago, SEO e analítica — sempre integrados ao conteúdo que produzimos.',
      tags: ['Performance', 'SEO', 'Social Ads', 'Analytics']
    },
    {
      number: '08',
      title: 'Consultoria Criativa',
      description:
        'Acompanhamos marcas e equipas internas no posicionamento, narrativa e direção criativa. Pensamos com vocês — antes de filmar uma única cena.',
      tags: ['Estratégia', 'Narrativa', 'Direção criativa']
    }
  ];

  const stmt = db.prepare(
    `INSERT INTO services (number, title, description, tags, sort_order, active)
     VALUES (@number, @title, @description, @tags, @sort_order, 1)`
  );
  const tx = db.transaction((items) => {
    items.forEach((r, i) =>
      stmt.run({
        number: r.number,
        title: r.title,
        description: r.description,
        tags: JSON.stringify(r.tags),
        sort_order: i
      })
    );
  });
  tx(rows);
}

function seedProjects() {
  if (!isEmpty('projects')) return;

  const rows = [
    {
      title: 'Torre de Gomariz — <em>Wine & Spa Hotel</em>',
      subtitle: 'Conteúdo audiovisual · Foto · Vídeo · Gestão de marca',
      category: 'video',
      year: 2025,
      description:
        'Conteúdo audiovisual completo, foto, vídeo e gestão de marca para o Torre de Gomariz Wine & Spa Hotel.',
      tags: ['Foto', 'Vídeo', 'Social'],
      image: 'proj-gomariz.jpg',
      size: 'lg',
      featured: 1
    },
    {
      title: 'SMC-THC<br/>— <em>Setor Farmacêutico</em>',
      subtitle: 'Produção audiovisual · Gestão social · E-mail marketing',
      category: 'video',
      year: 2025,
      description:
        'Produção audiovisual, gestão social e e-mail marketing para o setor farmacêutico, com atenção total às peculiaridades do setor.',
      tags: ['Vídeo', 'Social', 'Consultoria'],
      image: 'proj-bs-178.jpg',
      size: 'normal',
      featured: 1
    },
    {
      title: 'WETALK<br/>— <em>Let&#39;s Talk!</em>',
      subtitle: 'Podcast em vídeo · Estúdio próprio · Multi-câmara',
      category: 'podcast',
      year: 2025,
      description:
        'Podcast em vídeo gravado no estúdio próprio com multi-câmara e workflow editorial completo.',
      tags: ['Podcast', 'Vídeo'],
      image: 'podcast-studio.jpg',
      size: 'normal',
      featured: 1
    },
    {
      title: 'PremiumEnergy — <em>Rebranding</em>',
      subtitle: 'Direção criativa · Identidade · Ativação de marca',
      category: 'branding',
      year: 2025,
      description:
        'Rebranding de excelência: direção criativa, identidade e ativação de marca para a PremiumEnergy.',
      tags: ['Branding', 'Identidade', 'Estratégia'],
      image: 'proj-bs-110.jpg',
      size: 'wide',
      featured: 1
    },
    {
      title: 'Editorial Rayane<br/>— <em>Marinho</em>',
      subtitle: 'Editorial · Direção de fotografia',
      category: 'foto',
      year: 2024,
      description: 'Editorial fotográfico com direção de fotografia.',
      tags: ['Foto', 'Editorial'],
      image: 'editorial-rayane.jpg',
      size: 'normal',
      featured: 0
    },
    {
      title: 'Chromolite<br/>— <em>Identidade Audiovisual</em>',
      subtitle: 'Identidade audiovisual · Narrativa de marca',
      category: 'branding',
      year: 2024,
      description:
        'Identidade audiovisual única e narrativa de marca, com conexão autêntica para além da relação comercial.',
      tags: ['Branding', 'Vídeo'],
      image: 'proj-bs-50.jpg',
      size: 'normal',
      featured: 0
    },
    {
      title: 'ABODE — <em>Long Island</em>',
      subtitle: 'Produção internacional · Filme · Fotografia',
      category: 'video',
      year: 2025,
      description:
        'Produção internacional: filme e fotografia em Long Island.',
      tags: ['Filme', 'Foto', '4K'],
      image: 'abode-long-island.jpg',
      size: 'wide',
      featured: 1
    },
    {
      title: 'GMS Transport<br/>— <em>Sénégal · Portugal</em>',
      subtitle: 'Filme corporativo · Direção criativa',
      category: 'video',
      year: 2024,
      description:
        'Filme corporativo entre Sénégal e Portugal com direção criativa.',
      tags: ['Filme', 'Corporate'],
      image: 'proj-bs-67.jpg',
      size: 'normal',
      featured: 0
    },
    {
      title: 'JLS<br/>— <em>Institucional</em>',
      subtitle: 'Comunicação interna · Vídeo · Reportagem',
      category: 'video',
      year: 2024,
      description:
        'Comunicação interna em formato de vídeo e reportagem.',
      tags: ['Vídeo', 'Reportagem'],
      image: 'proj-bs-170.jpg',
      size: 'normal',
      featured: 0
    },
    {
      title: 'DGS — <em>Natal · Maria & Pedro</em>',
      subtitle: 'Campanha sazonal · Direção · Pós-produção',
      category: 'video',
      year: 2024,
      description:
        'Campanha sazonal com direção criativa e pós-produção.',
      tags: ['Campanha', 'Filme'],
      image: 'proj-bs-253.jpg',
      size: 'lg',
      featured: 1
    }
  ];

  const stmt = db.prepare(
    `INSERT INTO projects (title, subtitle, category, year, description, tags, image, size, featured, sort_order, active)
     VALUES (@title, @subtitle, @category, @year, @description, @tags, @image, @size, @featured, @sort_order, 1)`
  );
  const tx = db.transaction((items) => {
    items.forEach((r, i) =>
      stmt.run({
        title: r.title,
        subtitle: r.subtitle,
        category: r.category,
        year: r.year,
        description: r.description,
        tags: JSON.stringify(r.tags),
        image: r.image,
        size: r.size,
        featured: r.featured,
        sort_order: i
      })
    );
  });
  tx(rows);
}

function seedTeam() {
  if (!isEmpty('team')) return;

  const rows = [
    { name: 'Diogo Gaspar', role: 'CEO · Direção Criativa', image: 'team-diogo.jpg' },
    { name: 'Cátia Vieira', role: 'Creative Creator', image: 'team-catia.jpg' },
    { name: 'Roberta Meirelles', role: 'Creative Creator', image: 'team-roberta.jpg' }
  ];

  const stmt = db.prepare(
    `INSERT INTO team (name, role, image, sort_order, active)
     VALUES (@name, @role, @image, @sort_order, 1)`
  );
  const tx = db.transaction((items) => {
    items.forEach((r, i) => stmt.run({ ...r, sort_order: i }));
  });
  tx(rows);
}

function seedTestimonials() {
  if (!isEmpty('testimonials')) return;

  const rows = [
    {
      author: 'Nelson Matos',
      company: 'Diretor · Torre de Gomariz Wine & Spa Hotel',
      quote:
        'Contar a história do Torre de Gomariz Wine & Spa Hotel com autenticidade e criatividade é essencial — e a WEMOV Agency faz isso com excelência e competência. Cada post, foto e vídeo reflete exatamente quem somos e tudo o que queremos transmitir. É um trabalho cuidado, inspirador e que valoriza a nossa marca todos os dias.'
    },
    {
      author: 'Carla Cunha',
      company: 'SMC-THC',
      quote:
        'A WEMOV Agency tem sido uma parceira valiosa para a SMC-THC, oferecendo serviços de produção de conteúdo audiovisual, gestão de redes sociais, e-mail marketing e consultoria de marketing com grande atenção aos detalhes e peculiaridades do setor farmacêutico.'
    },
    {
      author: 'José Abreu',
      company: 'Diretor · PremiumEnergy',
      quote:
        'O rebranding de excelência pela WEMOV levou a PremiumEnergy a um novo nível, fortalecendo a presença e gerando conexões mais profundas com clientes e parceiros.'
    },
    {
      author: 'Tânia Fernandes',
      company: 'Diretora Financeira · Chromolite',
      quote:
        'A criação de uma identidade audiovisual única foi um marco transformador, revelando uma conexão autêntica que vai muito além de uma relação comercial.'
    },
    {
      author: 'Paulo Araújo',
      company: 'Diretor de Segurança',
      quote:
        'Na minha campanha autárquica, cumpre-me destacar o excelente profissionalismo da WEMOV, que tem assegurado acompanhamento rigoroso e visão estratégica, bem como um apoio determinante nas filmagens.'
    },
    {
      author: 'Helena Pacheco',
      company: 'Dep. Administrativo · JLS',
      quote:
        'Quando queremos aliar profissionais, qualidade e boa disposição, a opção só pode ser a WEMOV.'
    }
  ];

  const stmt = db.prepare(
    `INSERT INTO testimonials (author, company, quote, sort_order, active)
     VALUES (@author, @company, @quote, @sort_order, 1)`
  );
  const tx = db.transaction((items) => {
    items.forEach((r, i) => stmt.run({ ...r, sort_order: i }));
  });
  tx(rows);
}

function seedEpisodes() {
  if (!isEmpty('episodes')) return;

  const rows = [
    {
      number: 'EP. 01',
      title: 'Óscar de Barros — <em>Medicina, Música e Autenticidade</em>',
      subtitle: 'Médico, músico e autêntico · inspirações que transcendem o lugar comum',
      description:
        'Médico, músico e autêntico — inspirações que transcendem o lugar comum.',
      tags: ['WETALK', 'S01'],
      image: 'proj-bs-67.jpg',
      size: 'lg'
    },
    {
      number: 'EP. 02',
      title: 'Zé Gusto<br/>— <em>DJ, Amizade e Love Boat</em>',
      subtitle: 'DJ e criador de conexões humanas · nascido em França, português de coração',
      description:
        'DJ e criador de conexões humanas — nascido em França, português de coração.',
      tags: ['WETALK'],
      image: 'proj-bs-110.jpg',
      size: 'normal'
    },
    {
      number: 'EP. 03',
      title: 'Aleksandra em Portugal<br/>— <em>Influencer, Russa e Verdadeira</em>',
      subtitle:
        'Divertida, extrovertida e corajosa · recentemente instalada em Portugal',
      description:
        'Divertida, extrovertida e corajosa — recentemente instalada em Portugal.',
      tags: ['WETALK'],
      image: 'proj-bs-148.jpg',
      size: 'normal'
    },
    {
      number: 'EP. 04',
      title: 'Isa Campos — <em>Mobilidade, Fisioterapia e Sinceridade</em>',
      subtitle:
        'Especialista em mobilidade · pioneira em trazer conhecimento às redes sociais',
      description:
        'Especialista em mobilidade — pioneira em trazer conhecimento às redes sociais.',
      tags: ['WETALK', 'Saúde'],
      image: 'proj-bs-178.jpg',
      size: 'wide'
    }
  ];

  const stmt = db.prepare(
    `INSERT INTO episodes (number, title, subtitle, description, tags, image, size, sort_order, active)
     VALUES (@number, @title, @subtitle, @description, @tags, @image, @size, @sort_order, 1)`
  );
  const tx = db.transaction((items) => {
    items.forEach((r, i) =>
      stmt.run({
        number: r.number,
        title: r.title,
        subtitle: r.subtitle,
        description: r.description,
        tags: JSON.stringify(r.tags),
        image: r.image,
        size: r.size,
        sort_order: i
      })
    );
  });
  tx(rows);
}

function seedAdmin() {
  if (!isEmpty('admin_users')) return;

  const username = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
  const password = process.env.DEFAULT_ADMIN_PASSWORD || 'WeMov2026!';
  const hash = bcrypt.hashSync(password, 12);

  db.prepare(
    'INSERT INTO admin_users (username, password_hash) VALUES (?, ?)'
  ).run(username, hash);

  console.log(`[seed] Default admin created → username: "${username}"`);
}

function seedAll() {
  seedSettings();
  seedServices();
  seedProjects();
  seedTeam();
  seedTestimonials();
  seedEpisodes();
  seedAdmin();
}

seedAll();

// -------------------------------------------------------------
// AUTO-IMPORT static assets from public/assets/ into media table
// Runs on every startup — idempotent (skips already-imported URLs)
// -------------------------------------------------------------
function importStaticAssets() {
  const ASSETS_DIR = path.join(__dirname, '..', 'public', 'assets');
  if (!fs.existsSync(ASSETS_DIR)) return;

  const MIME = {
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png':  'image/png',
    '.webp': 'image/webp',
    '.svg':  'image/svg+xml',
  };

  const existing = new Set(
    db.prepare('SELECT url FROM media').all().map(r => r.url)
  );

  const insert = db.prepare(
    'INSERT INTO media (filename, original_name, mimetype, size, url) VALUES (?, ?, ?, ?, ?)'
  );

  const tx = db.transaction((files) => {
    let count = 0;
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (!MIME[ext]) continue;
      const url = `/assets/${file}`;
      if (existing.has(url)) continue;
      const filePath = path.join(ASSETS_DIR, file);
      let size = 0;
      try { size = fs.statSync(filePath).size; } catch { continue; }
      insert.run(file, file, MIME[ext], size, url);
      count++;
    }
    return count;
  });

  try {
    const files = fs.readdirSync(ASSETS_DIR);
    const added = tx(files);
    if (added > 0) console.log(`[media] Imported ${added} static asset(s) into media library.`);
  } catch (e) {
    console.warn('[media] Could not import static assets:', e.message);
  }
}

importStaticAssets();

// CLI: `node server/db.js --seed`
if (require.main === module && process.argv.includes('--seed')) {
  console.log('[db] Seed complete. Database is ready at:', DB_FILE);
}

module.exports = db;
