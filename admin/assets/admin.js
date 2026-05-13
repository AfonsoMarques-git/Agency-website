/**
 * WEMOV Agency — Admin SPA (vanilla JS, no framework)
 *
 * Hash-routed sections:
 *   #/dashboard  #/projects  #/services  #/team
 *   #/testimonials  #/episodes  #/content  #/contact
 *   #/media  #/settings
 */

(function () {
  'use strict';

  // ============================================================
  // CONSTANTS
  // ============================================================
  const ROUTES = [
    'dashboard',
    'projects',
    'services',
    'team',
    'testimonials',
    'episodes',
    'content',
    'contact',
    'media',
    'settings'
  ];

  const TITLES = {
    dashboard:    { crumb: 'Visão geral',  title: 'Painel WEMOV' },
    projects:     { crumb: 'Projetos',     title: 'Portfólio de projetos' },
    services:     { crumb: 'Serviços',     title: 'Serviços oferecidos' },
    team:         { crumb: 'Equipa',       title: 'Equipa criativa' },
    testimonials: { crumb: 'Testemunhos',  title: 'Testemunhos de clientes' },
    episodes:     { crumb: 'Episódios',    title: 'Episódios WETALK' },
    content:      { crumb: 'Conteúdo',     title: 'Texto e conteúdo do site' },
    contact:      { crumb: 'Contacto',     title: 'Contactos e redes sociais' },
    media:        { crumb: 'Media',        title: 'Biblioteca de imagens' },
    settings:     { crumb: 'Definições',   title: 'Conta e palavra-passe' }
  };

  const CONTENT_GROUPS = [
    {
      title: 'Homepage — hero',
      fields: [
        { key: 'hero_pill',          label: 'Pill (eyebrow)',        type: 'text' },
        { key: 'hero_line_1',        label: 'Título — linha 1',       type: 'text' },
        { key: 'hero_line_2',        label: 'Título — linha 2',       type: 'text' },
        { key: 'hero_line_3',        label: 'Título — linha 3',       type: 'text' },
        { key: 'hero_lede',          label: 'Parágrafo principal',    type: 'textarea' }
      ]
    },
    {
      title: 'Homepage — estatísticas',
      fields: [
        { key: 'stat_projects',       label: 'Projetos (número)',     type: 'text' },
        { key: 'stat_projects_label', label: 'Projetos (legenda)',    type: 'text' },
        { key: 'stat_brands',         label: 'Marcas (número)',       type: 'text' },
        { key: 'stat_brands_label',   label: 'Marcas (legenda)',      type: 'text' },
        { key: 'stat_years',          label: 'Anos (número)',         type: 'text' },
        { key: 'stat_years_label',    label: 'Anos (legenda)',        type: 'text' },
        { key: 'stat_ideas_label',    label: 'Ideias (legenda)',      type: 'text' }
      ]
    },
    {
      title: 'Homepage — sobre (teaser)',
      fields: [
        { key: 'home_about_lede', label: 'Lede (com <em> permitido)', type: 'textarea' },
        { key: 'home_about_para', label: 'Parágrafo extra',           type: 'textarea' }
      ]
    },
    {
      title: 'Página /sobre',
      fields: [
        { key: 'sobre_title_line_1',  label: 'Título — linha 1',         type: 'text' },
        { key: 'sobre_title_line_2',  label: 'Título — linha 2',         type: 'text' },
        { key: 'sobre_lede',          label: 'Lede',                     type: 'textarea' },
        { key: 'sobre_about_lede',    label: 'Manifesto — lede',         type: 'textarea' },
        { key: 'sobre_about_para_1',  label: 'Manifesto — parágrafo 1',  type: 'textarea' },
        { key: 'sobre_about_para_2',  label: 'Manifesto — parágrafo 2',  type: 'textarea' },
        { key: 'sobre_pillar_1_title', label: 'Pilar 1 — título',        type: 'text' },
        { key: 'sobre_pillar_1_desc',  label: 'Pilar 1 — descrição',     type: 'textarea' },
        { key: 'sobre_pillar_2_title', label: 'Pilar 2 — título',        type: 'text' },
        { key: 'sobre_pillar_2_desc',  label: 'Pilar 2 — descrição',     type: 'textarea' },
        { key: 'sobre_pillar_3_title', label: 'Pilar 3 — título',        type: 'text' },
        { key: 'sobre_pillar_3_desc',  label: 'Pilar 3 — descrição',     type: 'textarea' },
        { key: 'sobre_manifesto',     label: 'Citação manifesto',        type: 'textarea' },
        { key: 'sobre_manifesto_sig', label: 'Assinatura',               type: 'text' }
      ]
    },
    {
      title: 'Página /servicos',
      fields: [
        { key: 'servicos_title_line_1', label: 'Título — linha 1',  type: 'text' },
        { key: 'servicos_title_line_2', label: 'Título — linha 2',  type: 'text' },
        { key: 'servicos_lede',          label: 'Lede',             type: 'textarea' }
      ]
    },
    {
      title: 'Página /projetos',
      fields: [
        { key: 'projetos_title_line_1', label: 'Título — linha 1',  type: 'text' },
        { key: 'projetos_title_line_2', label: 'Título — linha 2',  type: 'text' },
        { key: 'projetos_lede',          label: 'Lede',             type: 'textarea' }
      ]
    },
    {
      title: 'Página /podcast',
      fields: [
        { key: 'podcast_title_line_1',   label: 'Título — linha 1',     type: 'text' },
        { key: 'podcast_title_line_2',   label: 'Título — linha 2',     type: 'text' },
        { key: 'podcast_lede',           label: 'Lede',                 type: 'textarea' },
        { key: 'podcast_studio_title_1', label: 'Estúdio — título 1',   type: 'text' },
        { key: 'podcast_studio_title_2', label: 'Estúdio — título 2',   type: 'text' },
        { key: 'podcast_studio_lede',    label: 'Estúdio — lede',       type: 'textarea' },
        { key: 'podcast_feature_1',      label: 'Feature 1',            type: 'text' },
        { key: 'podcast_feature_2',      label: 'Feature 2',            type: 'text' },
        { key: 'podcast_feature_3',      label: 'Feature 3',            type: 'text' },
        { key: 'podcast_feature_4',      label: 'Feature 4',            type: 'text' },
        { key: 'podcast_feature_5',      label: 'Feature 5',            type: 'text' },
        { key: 'podcast_feature_6',      label: 'Feature 6',            type: 'text' }
      ]
    },
    {
      title: 'Página /contacto',
      fields: [
        { key: 'contacto_title_line_1', label: 'Título — linha 1', type: 'text' },
        { key: 'contacto_title_line_2', label: 'Título — linha 2', type: 'text' },
        { key: 'contacto_title_line_3', label: 'Título — linha 3', type: 'text' },
        { key: 'contacto_lede',         label: 'Lede',             type: 'textarea' }
      ]
    },
    {
      title: 'Marca / Rodapé',
      fields: [
        { key: 'brand_tagline',     label: 'Tagline',             type: 'text' },
        { key: 'brand_location',    label: 'Localização',         type: 'text' },
        { key: 'clients_list',      label: 'Clientes (separados por |)', type: 'textarea' },
        { key: 'footer_copyright',  label: 'Footer — copyright',  type: 'text' },
        { key: 'footer_rights',     label: 'Footer — rights',     type: 'text' },
        { key: 'footer_credits',    label: 'Footer — créditos',   type: 'text' },
        { key: 'hero_corner_tl',    label: 'Hero corner — TL',    type: 'text' },
        { key: 'hero_corner_bl',    label: 'Hero corner — BL',    type: 'text' },
        { key: 'hero_corner_br',    label: 'Hero corner — BR',    type: 'text' }
      ]
    }
  ];

  const CONTACT_FIELDS = [
    { key: 'contact_email',       label: 'Email',                type: 'text' },
    { key: 'contact_phone_label', label: 'Telefone (visível)',   type: 'text' },
    { key: 'contact_phone_tel',   label: 'Telefone (tel:)',      type: 'text' },
    { key: 'contact_address',     label: 'Morada (HTML permitido)', type: 'textarea' },
    { key: 'contact_hours',       label: 'Horário',              type: 'text' },
    { key: 'social_instagram',    label: 'Instagram URL',        type: 'url' },
    { key: 'social_youtube',      label: 'YouTube URL',          type: 'url' },
    { key: 'social_tiktok',       label: 'TikTok URL',           type: 'url' },
    { key: 'social_facebook',     label: 'Facebook URL',         type: 'url' }
  ];

  // ============================================================
  // API helper
  // ============================================================
  async function api(method, path, body) {
    const opts = {
      method,
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' }
    };
    if (body !== undefined) opts.body = JSON.stringify(body);

    const r = await fetch(path, opts);

    if (r.status === 401) {
      window.location.href = '/admin/login';
      throw new Error('Não autenticado.');
    }

    const ct = r.headers.get('content-type') || '';
    const data = ct.includes('application/json') ? await r.json().catch(() => ({})) : null;
    if (!r.ok) {
      const msg = (data && data.error) || `Erro ${r.status}`;
      throw new Error(msg);
    }
    return data;
  }

  async function uploadFile(file) {
    const fd = new FormData();
    fd.append('file', file);
    const r = await fetch('/api/admin/media', {
      method: 'POST',
      body: fd,
      credentials: 'same-origin'
    });
    if (r.status === 401) {
      window.location.href = '/admin/login';
      throw new Error('Não autenticado.');
    }
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error || 'Falha no upload.');
    return data;
  }

  // ============================================================
  // DOM helpers
  // ============================================================
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === 'class') node.className = v;
      else if (k === 'html') node.innerHTML = v;
      else if (k === 'dataset') Object.assign(node.dataset, v);
      else if (k.startsWith('on') && typeof v === 'function') {
        node.addEventListener(k.slice(2).toLowerCase(), v);
      } else if (v === false || v == null) {
        // skip
      } else if (v === true) {
        node.setAttribute(k, '');
      } else {
        node.setAttribute(k, v);
      }
    }
    for (const c of children.flat()) {
      if (c == null || c === false) continue;
      node.appendChild(c.nodeType ? c : document.createTextNode(c));
    }
    return node;
  }

  function escape(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ============================================================
  // Toast / Confirm
  // ============================================================
  function toast(msg, kind) {
    const root = $('#toasts');
    const t = el('div', { class: 'toast ' + (kind ? 'toast--' + kind : '') }, msg);
    root.appendChild(t);
    setTimeout(() => {
      t.classList.add('is-leaving');
      setTimeout(() => t.remove(), 280);
    }, 3000);
  }

  function confirmModal({ title, message, danger }) {
    return new Promise((resolve) => {
      const root = $('#confirm');
      $('#confirmTitle').textContent = title || 'Confirmar?';
      $('#confirmMsg').textContent = message || 'Esta ação não pode ser desfeita.';
      const ok = $('#confirmOk');
      ok.className = 'btn ' + (danger === false ? 'btn--primary' : 'btn--danger');
      root.setAttribute('aria-hidden', 'false');

      const close = (result) => {
        root.setAttribute('aria-hidden', 'true');
        ok.removeEventListener('click', onOk);
        $$('[data-confirm-close]', root).forEach((b) =>
          b.removeEventListener('click', onCancel)
        );
        resolve(result);
      };
      const onOk = () => close(true);
      const onCancel = () => close(false);

      ok.addEventListener('click', onOk);
      $$('[data-confirm-close]', root).forEach((b) =>
        b.addEventListener('click', onCancel)
      );
    });
  }

  // ============================================================
  // DRAWER
  // ============================================================
  const drawer = {
    open(title, body, onSave) {
      $('#drawerTitle').textContent = title;
      const wrap = $('#drawerBody');
      wrap.innerHTML = '';
      wrap.appendChild(body);
      const root = $('#drawer');
      root.setAttribute('aria-hidden', 'false');

      const save = $('#drawerSave');
      const handler = async () => {
        save.disabled = true;
        try {
          await onSave();
          drawer.close();
        } catch (e) {
          toast(e.message || 'Erro a guardar.', 'error');
        } finally {
          save.disabled = false;
        }
      };
      save.onclick = handler;
    },
    close() {
      $('#drawer').setAttribute('aria-hidden', 'true');
      $('#drawerSave').onclick = null;
    }
  };

  $$('#drawer [data-close]').forEach((b) =>
    b.addEventListener('click', () => drawer.close())
  );

  // ============================================================
  // ROUTING
  // ============================================================
  function currentRoute() {
    const hash = (location.hash || '#/dashboard').replace(/^#\//, '');
    const [name] = hash.split('/');
    return ROUTES.includes(name) ? name : 'dashboard';
  }

  function setActive(route) {
    $$('.side__link').forEach((a) =>
      a.classList.toggle('is-active', a.dataset.route === route)
    );
    const meta = TITLES[route] || TITLES.dashboard;
    $('#crumb').textContent = meta.crumb;
    $('#pageTitle').textContent = meta.title;
    $('#topbarActions').innerHTML = '';
  }

  async function render() {
    const route = currentRoute();
    setActive(route);
    const view = $('#view');
    view.innerHTML = '<div class="loading">A carregar…</div>';
    try {
      await VIEWS[route](view);
    } catch (e) {
      view.innerHTML = `<div class="empty"><h3>Erro</h3><p>${escape(
        e.message
      )}</p></div>`;
    }
  }

  window.addEventListener('hashchange', render);

  // ============================================================
  // VIEWS
  // ============================================================
  const VIEWS = {};

  // ---- Dashboard --------------------------------------------
  VIEWS.dashboard = async function (view) {
    const [projects, services, team, testimonials, episodes, media] =
      await Promise.all([
        api('GET', '/api/admin/projects'),
        api('GET', '/api/admin/services'),
        api('GET', '/api/admin/team'),
        api('GET', '/api/admin/testimonials'),
        api('GET', '/api/admin/episodes'),
        api('GET', '/api/admin/media')
      ]);

    view.innerHTML = `
      <div class="grid-cards">
        <div class="stat-card">
          <span class="stat-label">Projetos</span>
          <span class="stat-value">${projects.length}</span>
          <p class="stat-meta">${projects.filter((p) => p.featured).length} em destaque</p>
        </div>
        <div class="stat-card">
          <span class="stat-label">Serviços</span>
          <span class="stat-value">${services.length}</span>
          <p class="stat-meta">${services.filter((s) => s.active).length} ativos</p>
        </div>
        <div class="stat-card">
          <span class="stat-label">Equipa</span>
          <span class="stat-value">${team.length}</span>
          <p class="stat-meta">${team.filter((t) => t.active).length} ativos</p>
        </div>
        <div class="stat-card">
          <span class="stat-label">Testemunhos</span>
          <span class="stat-value">${testimonials.length}</span>
          <p class="stat-meta">${testimonials.filter((t) => t.active).length} ativos</p>
        </div>
        <div class="stat-card">
          <span class="stat-label">Episódios</span>
          <span class="stat-value">${episodes.length}</span>
          <p class="stat-meta">WETALK</p>
        </div>
        <div class="stat-card">
          <span class="stat-label">Media</span>
          <span class="stat-value">${media.length}</span>
          <p class="stat-meta">imagens no servidor</p>
        </div>
      </div>

      <div class="card" style="margin-top:1.4rem">
        <h3 style="margin:0 0 0.6rem; font-family: var(--font-serif); font-weight: 500;">
          Bem-vindo de volta.
        </h3>
        <p style="color: var(--text-dim); margin: 0;">
          Este é o painel da WEMOV Agency. Edite o conteúdo, gira o portfólio, faça upload de imagens e atualize o site em segundos &mdash; sem mexer em código.
        </p>
      </div>
    `;
  };

  // ---- Generic CRUD list helpers ----------------------------
  function rowItem({ id, title, sub, thumb, badges = [], active = true, draggable = true, onEdit, onDelete, onToggle }) {
    const item = el('div', {
      class: 'list__item' + (active ? '' : ' is-inactive'),
      dataset: { id },
      draggable: draggable ? 'true' : 'false'
    });
    const thumbBox = el('div', {
      class: 'list__thumb',
      style: thumb ? `background-image:url('${thumb}')` : ''
    });
    if (!thumb) thumbBox.textContent = 'IMG';
    item.appendChild(thumbBox);

    const body = el('div', {});
    body.innerHTML = `<h4 class="list__title">${title || ''}</h4>` +
      (sub ? `<p class="list__sub">${sub}</p>` : '') +
      (badges.length
        ? `<div class="list__tags">${badges
            .map((b) => `<span class="tag ${b.mute ? 'tag--mute' : ''}">${escape(b.text)}</span>`)
            .join('')}</div>`
        : '');
    item.appendChild(body);

    const actions = el('div', { class: 'list__actions' });
    if (onToggle) {
      const toggle = el('button', {
        class: 'icon-btn',
        title: active ? 'Desativar' : 'Ativar',
        'aria-label': active ? 'Desativar' : 'Ativar',
        onclick: () => onToggle(id, !active)
      });
      toggle.innerHTML = active
        ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'
        : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10 10 0 0 1 12 20c-7 0-11-8-11-8a18.4 18.4 0 0 1 4.18-5.18M9.9 4.24A10 10 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22"/></svg>';
      actions.appendChild(toggle);
    }
    if (onEdit) {
      const editBtn = el('button', {
        class: 'icon-btn', title: 'Editar', 'aria-label': 'Editar',
        onclick: () => onEdit(id)
      });
      editBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4z"/></svg>';
      actions.appendChild(editBtn);
    }
    if (onDelete) {
      const delBtn = el('button', {
        class: 'icon-btn icon-btn--danger', title: 'Eliminar', 'aria-label': 'Eliminar',
        onclick: () => onDelete(id)
      });
      delBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14"/></svg>';
      actions.appendChild(delBtn);
    }
    if (draggable) {
      const handle = el('span', { class: 'handle', title: 'Arrastar para reordenar' }, '⋮⋮');
      actions.appendChild(handle);
    }
    item.appendChild(actions);
    return item;
  }

  function attachReorder(container, onReorder) {
    let dragging = null;
    container.addEventListener('dragstart', (e) => {
      const item = e.target.closest('.list__item');
      if (!item) return;
      dragging = item;
      item.classList.add('is-dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    container.addEventListener('dragend', () => {
      $$('.list__item', container).forEach((i) => i.classList.remove('is-dragging', 'is-drop-target'));
      dragging = null;
    });
    container.addEventListener('dragover', (e) => {
      e.preventDefault();
      const target = e.target.closest('.list__item');
      if (!target || target === dragging) return;
      const rect = target.getBoundingClientRect();
      const before = (e.clientY - rect.top) / rect.height < 0.5;
      container.insertBefore(dragging, before ? target : target.nextSibling);
    });
    container.addEventListener('drop', (e) => {
      e.preventDefault();
      const ids = $$('.list__item', container).map((i) => Number(i.dataset.id));
      onReorder(ids);
    });
  }

  // ---- Field helpers ----------------------------------------
  function fieldText(label, name, value, opts = {}) {
    const f = el('div', { class: 'field' });
    f.appendChild(el('label', { for: name }, label));
    const input = el('input', {
      id: name,
      name,
      type: opts.type || 'text',
      value: value == null ? '' : value,
      placeholder: opts.placeholder || ''
    });
    if (opts.maxLength) input.setAttribute('maxlength', opts.maxLength);
    f.appendChild(input);
    return f;
  }

  function fieldTextarea(label, name, value, opts = {}) {
    const f = el('div', { class: 'field field--full' });
    f.appendChild(el('label', { for: name }, label));
    const ta = el('textarea', {
      id: name,
      name,
      rows: opts.rows || 4,
      placeholder: opts.placeholder || ''
    });
    ta.value = value == null ? '' : value;
    if (opts.maxLength) ta.setAttribute('maxlength', opts.maxLength);
    f.appendChild(ta);
    return f;
  }

  function fieldCheck(label, name, value) {
    const wrap = el('div', { class: 'field field--row' });
    const label2 = el('label', { class: 'check' });
    const cb = el('input', { type: 'checkbox', name });
    cb.checked = !!value;
    label2.appendChild(cb);
    label2.appendChild(el('span', {}, label));
    wrap.appendChild(label2);
    return wrap;
  }

  function fieldSelect(label, name, value, options) {
    const f = el('div', { class: 'field' });
    f.appendChild(el('label', { for: name }, label));
    const sel = el('select', { id: name, name });
    for (const o of options) {
      const opt = el('option', { value: o.value }, o.label);
      if (o.value === value) opt.selected = true;
      sel.appendChild(opt);
    }
    f.appendChild(sel);
    return f;
  }

  function fieldImage(label, name, value) {
    const f = el('div', { class: 'field' });
    f.appendChild(el('label', {}, label));
    const wrap = el('div', { class: 'media-pick' });
    const preview = el('div', {
      class: 'media-pick__preview',
      style: value ? `background-image:url('${resolveImage(value)}')` : ''
    });
    const info = el('div', { class: 'media-pick__info' }, value || 'Sem imagem');
    const hidden = el('input', { type: 'hidden', name, value: value || '' });
    const file = el('input', { type: 'file', accept: 'image/*', style: 'display:none' });

    const upBtn = el('button', { type: 'button', class: 'btn btn--ghost btn--sm' }, 'Upload');
    upBtn.addEventListener('click', () => file.click());
    file.addEventListener('change', async () => {
      const f0 = file.files[0]; if (!f0) return;
      try {
        toast('A enviar imagem…');
        const m = await uploadFile(f0);
        hidden.value = m.url;
        preview.style.backgroundImage = `url('${m.url}')`;
        info.textContent = m.url;
        toast('Imagem enviada.', 'ok');
      } catch (e) {
        toast(e.message, 'error');
      }
    });
    const pickBtn = el('button', { type: 'button', class: 'btn btn--ghost btn--sm' }, 'Biblioteca');
    pickBtn.addEventListener('click', async () => {
      const list = await api('GET', '/api/admin/media');
      if (!list.length) return toast('Biblioteca vazia. Faça upload primeiro.', 'error');
      pickFromLibrary(list, (item) => {
        hidden.value = item.url;
        preview.style.backgroundImage = `url('${item.url}')`;
        info.textContent = item.url;
      });
    });
    const clearBtn = el('button', { type: 'button', class: 'btn btn--ghost btn--sm' }, 'Limpar');
    clearBtn.addEventListener('click', () => {
      hidden.value = '';
      preview.style.backgroundImage = '';
      info.textContent = 'Sem imagem';
    });

    wrap.appendChild(preview);
    wrap.appendChild(info);
    const btns = el('div', { style: 'display:flex; gap:0.3rem; flex-wrap:wrap;' }, upBtn, pickBtn, clearBtn);
    wrap.appendChild(btns);
    wrap.appendChild(file);
    wrap.appendChild(hidden);
    f.appendChild(wrap);
    return f;
  }

  function resolveImage(src) {
    if (!src) return '';
    if (src.startsWith('http') || src.startsWith('/')) return src;
    return '/assets/' + src;
  }

  function pickFromLibrary(list, onPick) {
    const grid = el('div', { class: 'media-grid' });
    list.forEach((m) => {
      const tile = el('div', {
        class: 'media-tile',
        style: `background-image:url('${m.url}')`,
        onclick: () => { onPick(m); drawer.close(); }
      });
      grid.appendChild(tile);
    });
    drawer.open('Escolher imagem', grid, async () => {});
    $('#drawerSave').style.display = 'none';
    setTimeout(() => { $('#drawerSave').style.display = ''; }, 0);
  }

  function fieldTagList(label, name, value) {
    const f = el('div', { class: 'field field--full' });
    f.appendChild(el('label', { for: name }, label + ' (separe por vírgulas)'));
    const input = el('input', {
      id: name,
      name,
      type: 'text',
      value: Array.isArray(value) ? value.join(', ') : (value || '')
    });
    f.appendChild(input);
    return f;
  }

  function readForm(form) {
    const fd = new FormData(form);
    const out = {};
    for (const [k, v] of fd.entries()) out[k] = v;
    // Checkboxes that aren't checked don't appear — read them manually:
    $$('input[type="checkbox"]', form).forEach((cb) => { out[cb.name] = cb.checked; });
    return out;
  }

  // ---- Projects ----------------------------------------------
  VIEWS.projects = async function (view) {
    const items = await api('GET', '/api/admin/projects');

    const actions = $('#topbarActions');
    actions.appendChild(el('button', {
      class: 'btn btn--primary btn--sm',
      onclick: () => editProject(null)
    }, '+ Novo projeto'));

    view.innerHTML = '';
    if (!items.length) {
      view.appendChild(emptyState('Sem projetos ainda', 'Crie o primeiro projeto para começar.'));
      return;
    }

    const list = el('div', { class: 'list' });
    items.forEach((p) => {
      const row = rowItem({
        id: p.id,
        title: stripHtml(p.title),
        sub: [p.year, p.category, p.subtitle].filter(Boolean).join(' · '),
        thumb: resolveImage(p.image),
        active: !!p.active,
        badges: [
          ...(p.featured ? [{ text: 'Destaque' }] : []),
          ...(p.size && p.size !== 'normal' ? [{ text: p.size, mute: true }] : []),
          ...((p.tags || []).slice(0, 3).map((t) => ({ text: t, mute: true })))
        ],
        onEdit: () => editProject(p.id),
        onDelete: () => removeRow('projects', p.id),
        onToggle: (id, next) => toggleActive('projects', id, next)
      });
      list.appendChild(row);
    });
    view.appendChild(list);
    attachReorder(list, (ids) =>
      api('POST', '/api/admin/projects/reorder', { ids })
        .then(() => toast('Ordem guardada.', 'ok'))
        .catch((e) => toast(e.message, 'error'))
    );
  };

  async function editProject(id) {
    const data = id
      ? await api('GET', '/api/admin/projects/' + id)
      : { active: true, featured: false, size: 'normal', tags: [] };

    const form = el('form', {});
    form.appendChild(fieldText('Título (HTML permitido)', 'title', data.title));
    form.appendChild(fieldText('Subtítulo', 'subtitle', data.subtitle));
    form.appendChild(fieldText('Ano', 'year', data.year || '', { type: 'number' }));
    form.appendChild(fieldSelect('Categoria', 'category', data.category || 'video', [
      { value: 'video', label: 'Vídeo' },
      { value: 'foto', label: 'Fotografia' },
      { value: 'branding', label: 'Branding' },
      { value: 'podcast', label: 'Podcast' },
      { value: 'consultoria', label: 'Consultoria' }
    ]));
    form.appendChild(fieldSelect('Tamanho da card', 'size', data.size || 'normal', [
      { value: 'normal', label: 'Normal' },
      { value: 'wide', label: 'Wide (2 colunas)' },
      { value: 'lg', label: 'Large (destaque)' }
    ]));
    form.appendChild(fieldTextarea('Descrição', 'description', data.description));
    form.appendChild(fieldTagList('Tags', 'tags', data.tags));
    form.appendChild(fieldImage('Imagem', 'image', data.image));
    form.appendChild(fieldCheck('Em destaque (Homepage)', 'featured', !!data.featured));
    form.appendChild(fieldCheck('Ativo (visível no site)', 'active', !!data.active || id == null));

    drawer.open(id ? 'Editar projeto' : 'Novo projeto', form, async () => {
      const payload = readForm(form);
      payload.tags = (payload.tags || '').split(',').map((s) => s.trim()).filter(Boolean);
      if (payload.year) payload.year = Number(payload.year);
      if (id) {
        await api('PUT', '/api/admin/projects/' + id, payload);
        toast('Projeto atualizado.', 'ok');
      } else {
        await api('POST', '/api/admin/projects', payload);
        toast('Projeto criado.', 'ok');
      }
      render();
    });
  }

  // ---- Services ----------------------------------------------
  VIEWS.services = async function (view) {
    const items = await api('GET', '/api/admin/services');

    $('#topbarActions').appendChild(el('button', {
      class: 'btn btn--primary btn--sm',
      onclick: () => editService(null)
    }, '+ Novo serviço'));

    view.innerHTML = '';
    if (!items.length) {
      view.appendChild(emptyState('Sem serviços', 'Crie os serviços oferecidos pela agência.'));
      return;
    }

    const list = el('div', { class: 'list' });
    items.forEach((s) => {
      list.appendChild(rowItem({
        id: s.id,
        title: `${s.number || ''} ${stripHtml(s.title)}`.trim(),
        sub: s.description,
        active: !!s.active,
        badges: (s.tags || []).slice(0, 5).map((t) => ({ text: t, mute: true })),
        onEdit: () => editService(s.id),
        onDelete: () => removeRow('services', s.id),
        onToggle: (id, next) => toggleActive('services', id, next)
      }));
    });
    view.appendChild(list);
    attachReorder(list, (ids) =>
      api('POST', '/api/admin/services/reorder', { ids })
        .then(() => toast('Ordem guardada.', 'ok'))
        .catch((e) => toast(e.message, 'error'))
    );
  };

  async function editService(id) {
    const data = id
      ? await api('GET', '/api/admin/services/' + id)
      : { active: true, tags: [] };

    const form = el('form', {});
    form.appendChild(fieldText('Número (ex. "01")', 'number', data.number));
    form.appendChild(fieldText('Título', 'title', data.title));
    form.appendChild(fieldTextarea('Descrição', 'description', data.description));
    form.appendChild(fieldTagList('Tags', 'tags', data.tags));
    form.appendChild(fieldCheck('Ativo', 'active', !!data.active || id == null));

    drawer.open(id ? 'Editar serviço' : 'Novo serviço', form, async () => {
      const payload = readForm(form);
      payload.tags = (payload.tags || '').split(',').map((s) => s.trim()).filter(Boolean);
      if (id) {
        await api('PUT', '/api/admin/services/' + id, payload);
        toast('Serviço atualizado.', 'ok');
      } else {
        await api('POST', '/api/admin/services', payload);
        toast('Serviço criado.', 'ok');
      }
      render();
    });
  }

  // ---- Team --------------------------------------------------
  VIEWS.team = async function (view) {
    const items = await api('GET', '/api/admin/team');
    $('#topbarActions').appendChild(el('button', {
      class: 'btn btn--primary btn--sm',
      onclick: () => editMember(null)
    }, '+ Novo membro'));

    view.innerHTML = '';
    if (!items.length) {
      view.appendChild(emptyState('Sem membros', 'Adicione a equipa criativa.'));
      return;
    }
    const list = el('div', { class: 'list' });
    items.forEach((m) => {
      list.appendChild(rowItem({
        id: m.id,
        title: m.name,
        sub: m.role,
        thumb: resolveImage(m.image),
        active: !!m.active,
        onEdit: () => editMember(m.id),
        onDelete: () => removeRow('team', m.id),
        onToggle: (id, next) => toggleActive('team', id, next)
      }));
    });
    view.appendChild(list);
    attachReorder(list, (ids) =>
      api('POST', '/api/admin/team/reorder', { ids })
        .then(() => toast('Ordem guardada.', 'ok'))
        .catch((e) => toast(e.message, 'error'))
    );
  };

  async function editMember(id) {
    const data = id ? await api('GET', '/api/admin/team/' + id) : { active: true };
    const form = el('form', {});
    form.appendChild(fieldText('Nome', 'name', data.name));
    form.appendChild(fieldText('Função', 'role', data.role));
    form.appendChild(fieldImage('Foto', 'image', data.image));
    form.appendChild(fieldCheck('Ativo', 'active', !!data.active || id == null));

    drawer.open(id ? 'Editar membro' : 'Novo membro', form, async () => {
      const payload = readForm(form);
      if (id) {
        await api('PUT', '/api/admin/team/' + id, payload);
        toast('Membro atualizado.', 'ok');
      } else {
        await api('POST', '/api/admin/team', payload);
        toast('Membro criado.', 'ok');
      }
      render();
    });
  }

  // ---- Testimonials -----------------------------------------
  VIEWS.testimonials = async function (view) {
    const items = await api('GET', '/api/admin/testimonials');
    $('#topbarActions').appendChild(el('button', {
      class: 'btn btn--primary btn--sm',
      onclick: () => editTestimonial(null)
    }, '+ Novo testemunho'));

    view.innerHTML = '';
    if (!items.length) {
      view.appendChild(emptyState('Sem testemunhos', 'Adicione testemunhos de clientes.'));
      return;
    }
    const list = el('div', { class: 'list' });
    items.forEach((t) => {
      list.appendChild(rowItem({
        id: t.id,
        title: t.author,
        sub: (t.company ? t.company + ' · ' : '') + truncate(t.quote, 120),
        active: !!t.active,
        draggable: false,
        onEdit: () => editTestimonial(t.id),
        onDelete: () => removeRow('testimonials', t.id),
        onToggle: (id, next) => toggleActive('testimonials', id, next)
      }));
    });
    view.appendChild(list);
  };

  async function editTestimonial(id) {
    const data = id ? await api('GET', '/api/admin/testimonials/' + id) : { active: true };
    const form = el('form', {});
    form.appendChild(fieldText('Autor', 'author', data.author));
    form.appendChild(fieldText('Empresa / cargo', 'company', data.company));
    form.appendChild(fieldTextarea('Citação', 'quote', data.quote, { rows: 6 }));
    form.appendChild(fieldCheck('Ativo', 'active', !!data.active || id == null));

    drawer.open(id ? 'Editar testemunho' : 'Novo testemunho', form, async () => {
      const payload = readForm(form);
      if (id) {
        await api('PUT', '/api/admin/testimonials/' + id, payload);
        toast('Testemunho atualizado.', 'ok');
      } else {
        await api('POST', '/api/admin/testimonials', payload);
        toast('Testemunho criado.', 'ok');
      }
      render();
    });
  }

  // ---- Episodes ----------------------------------------------
  VIEWS.episodes = async function (view) {
    const items = await api('GET', '/api/admin/episodes');
    $('#topbarActions').appendChild(el('button', {
      class: 'btn btn--primary btn--sm',
      onclick: () => editEpisode(null)
    }, '+ Novo episódio'));

    view.innerHTML = '';
    if (!items.length) {
      view.appendChild(emptyState('Sem episódios', 'Crie os episódios do WETALK.'));
      return;
    }
    const list = el('div', { class: 'list' });
    items.forEach((e) => {
      list.appendChild(rowItem({
        id: e.id,
        title: `${e.number || ''} — ${stripHtml(e.title)}`,
        sub: e.subtitle,
        thumb: resolveImage(e.image),
        active: !!e.active,
        badges: (e.tags || []).map((t) => ({ text: t, mute: true })),
        onEdit: () => editEpisode(e.id),
        onDelete: () => removeRow('episodes', e.id),
        onToggle: (id, next) => toggleActive('episodes', id, next)
      }));
    });
    view.appendChild(list);
    attachReorder(list, (ids) =>
      api('POST', '/api/admin/episodes/reorder', { ids })
        .then(() => toast('Ordem guardada.', 'ok'))
        .catch((e) => toast(e.message, 'error'))
    );
  };

  async function editEpisode(id) {
    const data = id ? await api('GET', '/api/admin/episodes/' + id) : { active: true, size: 'normal', tags: [] };
    const form = el('form', {});
    form.appendChild(fieldText('Número (ex. "EP. 01")', 'number', data.number));
    form.appendChild(fieldText('Título (HTML permitido)', 'title', data.title));
    form.appendChild(fieldText('Subtítulo', 'subtitle', data.subtitle));
    form.appendChild(fieldTextarea('Descrição', 'description', data.description));
    form.appendChild(fieldTagList('Tags', 'tags', data.tags));
    form.appendChild(fieldSelect('Tamanho', 'size', data.size || 'normal', [
      { value: 'normal', label: 'Normal' },
      { value: 'wide', label: 'Wide' },
      { value: 'lg', label: 'Large' }
    ]));
    form.appendChild(fieldImage('Imagem', 'image', data.image));
    form.appendChild(fieldCheck('Ativo', 'active', !!data.active || id == null));

    drawer.open(id ? 'Editar episódio' : 'Novo episódio', form, async () => {
      const payload = readForm(form);
      payload.tags = (payload.tags || '').split(',').map((s) => s.trim()).filter(Boolean);
      if (id) {
        await api('PUT', '/api/admin/episodes/' + id, payload);
        toast('Episódio atualizado.', 'ok');
      } else {
        await api('POST', '/api/admin/episodes', payload);
        toast('Episódio criado.', 'ok');
      }
      render();
    });
  }

  // ---- Content (settings groups) -----------------------------
  VIEWS.content = async function (view) {
    const all = await api('GET', '/api/admin/settings');
    const form = el('form', { class: 'settings-form' });

    CONTENT_GROUPS.forEach((group) => {
      const section = el('div', { class: 'form-section' });
      section.appendChild(el('h4', {}, group.title));
      const grid = el('div', { class: 'field-grid' });
      group.fields.forEach((f) => {
        const val = all[f.key] || '';
        const fld = f.type === 'textarea'
          ? fieldTextarea(f.label, f.key, val, { rows: 3 })
          : fieldText(f.label, f.key, val, { type: f.type });
        grid.appendChild(fld);
      });
      section.appendChild(grid);
      form.appendChild(section);
    });

    const save = el('button', { class: 'btn btn--primary', type: 'button' }, 'Guardar alterações');
    save.addEventListener('click', async () => {
      const payload = readForm(form);
      try {
        await api('PUT', '/api/admin/settings', payload);
        toast('Conteúdo atualizado.', 'ok');
      } catch (e) {
        toast(e.message, 'error');
      }
    });

    view.innerHTML = '';
    view.appendChild(form);
    view.appendChild(el('div', { style: 'margin-top:1.4rem; display:flex; justify-content:flex-end;' }, save));
  };

  // ---- Contact ------------------------------------------------
  VIEWS.contact = async function (view) {
    const all = await api('GET', '/api/admin/settings');
    const form = el('form', { class: 'settings-form' });
    const grid = el('div', { class: 'field-grid' });
    CONTACT_FIELDS.forEach((f) => {
      const val = all[f.key] || '';
      const fld = f.type === 'textarea'
        ? fieldTextarea(f.label, f.key, val, { rows: 3 })
        : fieldText(f.label, f.key, val, { type: f.type });
      grid.appendChild(fld);
    });
    form.appendChild(grid);

    const save = el('button', { class: 'btn btn--primary', type: 'button' }, 'Guardar alterações');
    save.addEventListener('click', async () => {
      const payload = readForm(form);
      try {
        await api('PUT', '/api/admin/settings', payload);
        toast('Contactos atualizados.', 'ok');
      } catch (e) {
        toast(e.message, 'error');
      }
    });

    view.innerHTML = '';
    view.appendChild(form);
    view.appendChild(el('div', { style: 'margin-top:1.4rem; display:flex; justify-content:flex-end;' }, save));
  };

  // ---- Media library -----------------------------------------
  VIEWS.media = async function (view) {
    view.innerHTML = '';
    const uploader = el('label', { class: 'uploader' }, el('p', { html: '<strong>Clique para carregar</strong> ou arraste imagens aqui.<br/>JPEG · PNG · WebP · SVG · até 8 MB.' }));
    const fileInput = el('input', { type: 'file', accept: 'image/*', multiple: true, style: 'display:none' });
    uploader.appendChild(fileInput);
    uploader.addEventListener('dragover', (e) => { e.preventDefault(); uploader.classList.add('is-drag'); });
    uploader.addEventListener('dragleave', () => uploader.classList.remove('is-drag'));
    uploader.addEventListener('drop', async (e) => {
      e.preventDefault();
      uploader.classList.remove('is-drag');
      await handleFiles(e.dataTransfer.files);
    });
    fileInput.addEventListener('change', () => handleFiles(fileInput.files));
    view.appendChild(uploader);

    const grid = el('div', { class: 'media-grid' });
    view.appendChild(grid);

    async function refresh() {
      const list = await api('GET', '/api/admin/media');
      grid.innerHTML = '';
      if (!list.length) {
        grid.appendChild(emptyState('Biblioteca vazia', 'Faça upload de imagens.'));
        return;
      }
      list.forEach((m) => {
        const tile = el('div', { class: 'media-tile', style: `background-image:url('${m.url}')`, title: m.original_name || m.filename });
        const del = el('button', {
          class: 'media-tile__delete',
          title: 'Eliminar',
          onclick: async (e) => {
            e.stopPropagation();
            const ok = await confirmModal({ title: 'Eliminar imagem?', message: 'Esta ação remove o ficheiro permanentemente.' });
            if (!ok) return;
            try {
              await api('DELETE', '/api/admin/media/' + m.id);
              toast('Imagem eliminada.', 'ok');
              refresh();
            } catch (e2) { toast(e2.message, 'error'); }
          }
        }, '×');
        tile.appendChild(del);
        grid.appendChild(tile);
      });
    }

    async function handleFiles(files) {
      for (const f of files) {
        try {
          toast(`A enviar ${f.name}…`);
          await uploadFile(f);
        } catch (e) { toast(e.message, 'error'); }
      }
      toast('Upload concluído.', 'ok');
      refresh();
    }

    refresh();
  };

  // ---- Settings (account) ------------------------------------
  VIEWS.settings = async function (view) {
    view.innerHTML = '';
    const card = el('div', { class: 'card' });
    card.appendChild(el('h3', { style: 'margin:0 0 0.4rem; font-family: var(--font-serif); font-weight:500;' }, 'Mudar palavra-passe'));
    card.appendChild(el('p', { style: 'color: var(--text-dim); margin: 0 0 1.2rem;' },
      'Recomendamos no mínimo 10 caracteres com letras, números e símbolos.'));

    const form = el('form', {});
    form.appendChild(fieldText('Password atual', 'currentPassword', '', { type: 'password' }));
    form.appendChild(fieldText('Nova password', 'newPassword', '', { type: 'password' }));
    form.appendChild(fieldText('Confirmar nova password', 'confirmPassword', '', { type: 'password' }));
    card.appendChild(form);

    const btn = el('button', { class: 'btn btn--primary', type: 'button' }, 'Atualizar password');
    btn.addEventListener('click', async () => {
      const payload = readForm(form);
      if (payload.newPassword !== payload.confirmPassword) {
        toast('As passwords novas não coincidem.', 'error');
        return;
      }
      if ((payload.newPassword || '').length < 10) {
        toast('A nova password deve ter pelo menos 10 caracteres.', 'error');
        return;
      }
      try {
        await api('POST', '/api/auth/change-password', {
          currentPassword: payload.currentPassword,
          newPassword: payload.newPassword
        });
        toast('Password atualizada com sucesso.', 'ok');
        form.reset();
      } catch (e) {
        toast(e.message, 'error');
      }
    });
    card.appendChild(el('div', { style: 'margin-top:1rem; display:flex; justify-content:flex-end;' }, btn));
    view.appendChild(card);
  };

  // ============================================================
  // Helpers
  // ============================================================
  function emptyState(title, message) {
    return el('div', { class: 'empty' }, el('h3', {}, title), el('p', {}, message));
  }

  function stripHtml(s) {
    return String(s || '').replace(/<[^>]+>/g, '').replace(/&[a-z#0-9]+;/gi, '');
  }
  function truncate(s, n) {
    const c = String(s || '');
    return c.length > n ? c.slice(0, n - 1) + '…' : c;
  }

  async function removeRow(resource, id) {
    const ok = await confirmModal({
      title: 'Eliminar item?',
      message: 'Esta ação remove o item permanentemente.'
    });
    if (!ok) return;
    try {
      await api('DELETE', `/api/admin/${resource}/${id}`);
      toast('Item eliminado.', 'ok');
      render();
    } catch (e) { toast(e.message, 'error'); }
  }

  async function toggleActive(resource, id, next) {
    try {
      await api('PATCH', `/api/admin/${resource}/${id}`, { active: next });
      toast(next ? 'Item ativado.' : 'Item desativado.', 'ok');
      render();
    } catch (e) { toast(e.message, 'error'); }
  }

  // ============================================================
  // Logout
  // ============================================================
  $('#logoutBtn').addEventListener('click', async () => {
    try {
      await api('POST', '/api/auth/logout');
    } catch { /* ignore */ }
    window.location.href = '/admin/login';
  });

  // ============================================================
  // Boot
  // ============================================================
  if (!location.hash) location.hash = '#/dashboard';
  render();

})();
