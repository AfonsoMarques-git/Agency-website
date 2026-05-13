/* =========================================================
   WEMOV AGENCY — main.js
   Global interactions that survive page transitions.
   - WeMov.bootShell()   : runs ONCE on first hard load
   - WeMov.initPage()    : runs on every page enter
   - WeMov.destroyPage() : runs on every page leave
   ========================================================= */

(function () {
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch      = window.matchMedia('(hover: none)').matches;

  const state = {
    lenis:          null,
    rafId:          null,
    cursorRafId:    null,
    gsapTickerFn:   null,
    pageObservers:  [],
    pageMutObs:     [],
    pageListeners:  [],
    clockInterval:  null,
    cursorBound:    false,
    shellBound:     false,
  };

  /* ============================================================
     SCRIPT LOADER
     ============================================================ */
  function loadScript(src) {
    return new Promise((res, rej) => {
      if ([...document.scripts].some(s => s.src === src)) { res(); return; }
      const s = document.createElement('script');
      s.src = src; s.async = false;
      s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  /* ============================================================
     SHELL — runs once
     ============================================================ */
  function bootShell() {
    if (state.shellBound) return;
    state.shellBound = true;

    /* Custom cursor */
    const cursor = $('.cursor');
    const cursorLabel = cursor ? $('[data-cursor-label]', cursor) : null;
    if (cursor && !isTouch) {
      let cx = window.innerWidth / 2, cy = window.innerHeight / 2;
      let tx = cx, ty = cy;
      const lerp = (a, b, n) => a + (b - a) * n;

      window.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
      window.addEventListener('mousedown', () => cursor.classList.add('is-down'));
      window.addEventListener('mouseup',   () => cursor.classList.remove('is-down'));

      const render = () => {
        cx = lerp(cx, tx, 0.22);
        cy = lerp(cy, ty, 0.22);
        cursor.style.transform = `translate(${cx}px,${cy}px)`;
        state.cursorRafId = requestAnimationFrame(render);
      };
      render();
      state.cursorBound = true;
      window.__wemovCursor = { cursor, cursorLabel };
    }

    /* Nav scroll state */
    const nav = $('#nav');
    const onScroll = () => nav && nav.classList.toggle('is-scrolled', (window.scrollY || window.pageYOffset) > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* Mobile menu */
    const burger = $('#burger');
    burger?.addEventListener('click', () => document.body.classList.toggle('is-open'));
    document.addEventListener('click', e => {
      if (e.target.closest('.mobile-menu a')) document.body.classList.remove('is-open');
    });

    /* Magnetic on persistent nav elements */
    if (!isTouch && !reduceMotion) bindMagnetic($$('.nav .nav__cta, .nav__logo'));

    updateActiveNavLink();
  }

  function bindMagnetic(els) {
    els.forEach(btn => {
      if (btn.dataset.magBound) return;
      btn.dataset.magBound = '1';
      const str = 0.18;
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        btn.style.transform = `translate(${(e.clientX - r.left - r.width  / 2) * str}px,${(e.clientY - r.top  - r.height / 2) * str}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  function updateActiveNavLink() {
    const path = (location.pathname.split('/').pop() || '').toLowerCase();
    $$('.nav__links a, .mobile-menu nav a').forEach(a => {
      const href = (a.getAttribute('href') || '').toLowerCase().replace(/^\//, '');
      const isMatch = href === path || (path === '' && (href === '' || href === 'index.html'));
      a.classList.toggle('is-active', isMatch);
    });
  }

  /* ============================================================
     GSAP + SCROLLTRIGGER
     ============================================================ */
  function loadGSAP() {
    if (reduceMotion) return Promise.resolve();
    return loadScript('https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js')
      .then(() => loadScript('https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js'))
      .then(() => { if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger); })
      .catch(() => {});
  }

  /* ============================================================
     LENIS — smooth scroll
     ============================================================ */
  function initLenis() {
    if (reduceMotion || isTouch) return Promise.resolve();
    return loadScript('https://unpkg.com/lenis@1.1.20/dist/lenis.min.js').then(() => {
      if (!window.Lenis) return;
      destroyLenis();

      state.lenis = new window.Lenis({
        duration: 1.15,
        easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        smoothTouch: false,
        wheelMultiplier: 1.0,
      });

      if (window.gsap && window.ScrollTrigger) {
        /* Drive Lenis via GSAP ticker → ScrollTrigger stays in sync */
        state.lenis.on('scroll', ScrollTrigger.update);
        state.gsapTickerFn = time => { if (state.lenis) state.lenis.raf(time * 1000); };
        gsap.ticker.add(state.gsapTickerFn);
        gsap.ticker.lagSmoothing(0);
      } else {
        const raf = time => {
          if (!state.lenis) return;
          state.lenis.raf(time);
          state.rafId = requestAnimationFrame(raf);
        };
        state.rafId = requestAnimationFrame(raf);
      }

      /* Anchor-link intercept */
      $$('a[href^="#"]', $('[data-barba="container"]') || document).forEach(a => {
        a.addEventListener('click', e => {
          const id = a.getAttribute('href');
          if (id && id.length > 1) {
            const target = document.querySelector(id);
            if (target) { e.preventDefault(); state.lenis.scrollTo(target, { offset: -60, duration: 1.4 }); }
          }
        });
      });
    }).catch(() => {});
  }

  function destroyLenis() {
    if (state.rafId) { cancelAnimationFrame(state.rafId); state.rafId = null; }
    if (state.gsapTickerFn && window.gsap) { gsap.ticker.remove(state.gsapTickerFn); state.gsapTickerFn = null; }
    if (state.lenis) {
      try { state.lenis.off?.('scroll', window.ScrollTrigger?.update); } catch (_) {}
      try { state.lenis.destroy(); } catch (_) {}
      state.lenis = null;
    }
  }

  /* ============================================================
     SCROLL ANIMATIONS — GSAP ScrollTrigger
     ============================================================ */
  function initScrollAnimations(container) {
    if (reduceMotion) return;

    /* Fallback to IntersectionObserver if GSAP unavailable */
    if (!window.gsap || !window.ScrollTrigger) {
      _ioFallback(container);
      return;
    }

    const root = container || document;
    const ST   = ScrollTrigger;

    /* Kill any existing STs before re-initialising */
    ST.getAll().forEach(t => { try { t.kill(true); } catch (_) {} });

    /* ---- LINE REVEALS (masked overflow text) ---- */
    const lineRevealEls = $$('.line', root)
      .map(l => l.querySelector('.reveal'))
      .filter(Boolean);

    if (lineRevealEls.length) {
      gsap.set(lineRevealEls, { y: '115%', skewY: 1.5, opacity: 0, filter: 'blur(5px)' });
      lineRevealEls.forEach((reveal, i) => {
        ST.create({
          trigger: reveal.parentElement,
          start: 'top 91%',
          once: true,
          onEnter: () => gsap.to(reveal, {
            y: 0, skewY: 0, opacity: 1, filter: 'blur(0px)',
            duration: 1.15, ease: 'expo.out',
            delay: (i % 4) * 0.06,
          }),
        });
      });
    }

    /* ---- GENERIC FADES ---- */
    const fades = $$('.reveal', root).filter(el => !el.parentElement?.classList.contains('line'));
    if (fades.length) {
      gsap.set(fades, { y: 26, opacity: 0 });
      ST.batch(fades, {
        start: 'top 91%', once: true,
        onEnter: batch => gsap.to(batch, { y: 0, opacity: 1, duration: .9, ease: 'power2.out', stagger: .07 }),
      });
    }

    /* ---- REVEAL-TEXT (about lede mask) ---- */
    $$('.reveal-text', root).forEach(el => {
      ST.create({
        trigger: el, start: 'top 89%', once: true,
        onEnter: () => el.classList.add('is-revealed'),
      });
    });

    /* ---- STAGGER CARD GROUPS ---- */
    [
      { sel: '.services__list .service', y: 22,  dur: .65, stagger: .045 },
      { sel: '.work__grid .project',     y: 40,  dur: .9,  stagger: .07  },
      { sel: '.press__grid .quote',      y: 32,  dur: .8,  stagger: .08  },
      { sel: '.about__pillars .pillar',  y: 28,  dur: .75, stagger: .09  },
      { sel: '.hero__stats .stat',       y: 18,  dur: .7,  stagger: .07  },
      { sel: '.contact__info > div',     y: 18,  dur: .65, stagger: .06  },
      { sel: '.studio__list li',         y: 14,  dur: .6,  stagger: .05  },
      { sel: '.team__grid .member',      y: 36,  dur: .85, stagger: .09  },
    ].forEach(({ sel, y, dur, stagger }) => {
      const els = $$(sel, root);
      if (!els.length) return;
      gsap.set(els, { y, opacity: 0 });
      ST.batch(els, {
        start: 'top 90%', once: true, interval: .08,
        onEnter: batch => gsap.to(batch, { y: 0, opacity: 1, duration: dur, ease: 'power2.out', stagger }),
      });
    });

    /* ---- PARALLAX on project visuals ---- */
    if (!isTouch) {
      $$('.project__visual', root).forEach(visual => {
        const card = visual.closest('.project');
        if (!card) return;
        gsap.fromTo(visual,
          { y: '6%' },
          { y: '-6%', ease: 'none',
            scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: 1.5 },
          }
        );
      });
    }

    /* ---- COUNTERS ---- */
    $$('[data-count]', root).forEach(el => {
      const target = parseInt(el.getAttribute('data-count'), 10);
      if (isNaN(target)) return;
      const obj = { val: 0 };
      ST.create({
        trigger: el, start: 'top 88%', once: true,
        onEnter: () => gsap.to(obj, {
          val: target, duration: 1.8, ease: 'power2.out',
          onUpdate: () => { el.textContent = Math.floor(obj.val); },
          onComplete: () => { el.textContent = target; },
        }),
      });
    });

    /* ---- SUB-PAGE TITLES ---- */
    $$('[data-page-title]', root).forEach(title => {
      const reveals = $$('.reveal', title);
      if (!reveals.length) return;
      gsap.set(reveals, { y: '110%', opacity: 0, filter: 'blur(4px)' });
      gsap.to(reveals, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.1, ease: 'expo.out', stagger: .1, delay: .25 });
    });

    ST.refresh();
  }

  /* IntersectionObserver fallback when GSAP unavailable */
  function _ioFallback(container) {
    const root = container || document;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-revealed'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    state.pageObservers.push(io);

    $$('.line, .reveal, .reveal-text', root).forEach(el => {
      if (el.classList.contains('reveal') && el.parentElement?.classList.contains('line')) return;
      io.observe(el);
    });

    [
      { sel: '.services__list .service', delay: 80 },
      { sel: '.work__grid .project',     delay: 100 },
      { sel: '.press__grid .quote',      delay: 90  },
      { sel: '.about__pillars .pillar',  delay: 80  },
      { sel: '.hero__stats .stat',       delay: 70  },
      { sel: '.contact__info > div',     delay: 70  },
      { sel: '.studio__list li',         delay: 60  },
    ].forEach(({ sel, delay }) => {
      $$(sel, root).forEach((el, i) => {
        el.style.transition = `transform .85s var(--easing) ${i * delay}ms, opacity .85s ease ${i * delay}ms`;
        el.style.transform  = 'translateY(40px)';
        el.style.opacity    = '0';
        io.observe(el);
      });
    });

    const lift = new MutationObserver(muts => {
      muts.forEach(m => {
        if (m.attributeName === 'class' && m.target.classList.contains('is-revealed')) {
          m.target.style.transform = 'translateY(0)';
          m.target.style.opacity   = '1';
        }
      });
    });
    $$('.service, .project, .quote, .pillar, .stat, .contact__info > div, .studio__list li', root)
      .forEach(el => lift.observe(el, { attributes: true }));
    state.pageMutObs.push(lift);
  }

  /* ============================================================
     PAGE-ENTER ANIMATION
     ============================================================ */
  function playPageEnter(container) {
    if (!container) return;

    /* Hero above-fold lines (ScrollTrigger onEnter fires for in-viewport elements on refresh,
       but we also animate immediately here for the very first paint) */
    if (!reduceMotion && window.gsap) {
      $$('.line .reveal', container).forEach((reveal, i) => {
        const r = reveal.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.9) {
          gsap.to(reveal, { y: 0, skewY: 0, opacity: 1, filter: 'blur(0px)',
            duration: 1.15, ease: 'expo.out', delay: .1 + i * 0.06 });
        }
      });
    }

    /* data-page-cascade stagger */
    const cascade = $$('[data-page-cascade] > *', container);
    if (!cascade.length) return;
    if (window.gsap) {
      gsap.from(cascade, { y: 28, opacity: 0, duration: .85, ease: 'power2.out', stagger: .09, delay: .15 });
    } else {
      cascade.forEach((el, i) => {
        el.style.opacity    = '0';
        el.style.transform  = 'translateY(28px)';
        el.style.transition = `opacity .8s var(--easing) ${120 + i * 90}ms, transform .9s var(--easing) ${120 + i * 90}ms`;
        requestAnimationFrame(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; });
      });
    }
  }

  /* ============================================================
     CLOCK
     ============================================================ */
  function initClock(container) {
    if (state.clockInterval) { clearInterval(state.clockInterval); state.clockInterval = null; }
    const clock = $('#clock', container || document);
    if (!clock) return;
    const pad = n => String(n).padStart(2, '0');
    const tick = () => {
      const d = new Date();
      clock.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    };
    tick();
    state.clockInterval = setInterval(tick, 1000);
  }

  /* ============================================================
     FORM
     ============================================================ */
  function initForm(container) {
    const form = $('#contactForm', container || document);
    if (!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!form.checkValidity()) {
        $$('.field input, .field textarea', form).forEach(f => {
          if (!f.checkValidity()) {
            f.style.borderColor = '#ff6b86';
            f.addEventListener('input', () => { f.style.borderColor = ''; }, { once: true });
          }
        });
        return;
      }
      form.classList.add('is-sent');
      setTimeout(() => { form.reset(); form.classList.remove('is-sent'); }, 3500);
    });
  }

  /* ============================================================
     PROJECT FILTER (projetos list page)
     ============================================================ */
  function initProjectFilter(container) {
    const root = container || document;
    const btns = $$('[data-filter]', root);
    const cards = $$('.work__grid [data-category]', root);
    if (!btns.length || !cards.length) return;

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        btns.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');

        cards.forEach((card, i) => {
          const show = filter === 'all' || card.dataset.category === filter;
          if (show) {
            card.style.display = '';
            if (window.gsap) {
              gsap.fromTo(card,
                { opacity: 0, y: 18 },
                { opacity: 1, y: 0, duration: .55, ease: 'power2.out', delay: i * .025 }
              );
            }
          } else {
            card.style.display = 'none';
          }
        });

        if (window.ScrollTrigger) ScrollTrigger.refresh();
      });
    });
  }

  /* ============================================================
     SERVICE TILT
     ============================================================ */
  function initServiceTilt(container) {
    if (reduceMotion || isTouch) return;
    $$('.service', container || document).forEach(s => {
      s.addEventListener('mousemove', e => {
        const r = s.getBoundingClientRect();
        s.style.setProperty('--tilt', `${((e.clientY - r.top) / r.height - .5) * 4}deg`);
      });
    });
  }

  /* ============================================================
     CURSOR TARGETS
     ============================================================ */
  function bindCursorTargets(container) {
    if (isTouch) return;
    const obj = window.__wemovCursor;
    if (!obj?.cursor) return;
    const { cursor, cursorLabel } = obj;

    $$('[data-cursor]', container || document).forEach(el => {
      if (el.dataset.cursorBound) return;
      el.dataset.cursorBound = '1';
      const label = el.getAttribute('data-cursor-label');
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('is-pointer');
        if (label) { cursor.classList.add('is-label'); if (cursorLabel) cursorLabel.textContent = label; }
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('is-pointer', 'is-label');
        if (cursorLabel) cursorLabel.textContent = '';
      });
    });
  }

  /* ============================================================
     PER-PAGE LIFECYCLE
     ============================================================ */
  function initPage(container) {
    container = container || $('[data-barba="container"]');

    /* Immediate UI (no async deps needed) */
    bindCursorTargets(container);
    initClock(container);
    initForm(container);
    initServiceTilt(container);
    if (!isTouch && !reduceMotion) bindMagnetic($$('.btn, [data-magnetic]', container));
    initProjectFilter(container);
    updateActiveNavLink();
    window.scrollTo(0, 0);
    if (state.lenis) try { state.lenis.scrollTo(0, { immediate: true }); } catch (_) {}

    /* Load GSAP first → then Lenis (so it integrates with GSAP ticker) → then animations */
    loadGSAP()
      .then(() => initLenis())
      .then(() => {
        initScrollAnimations(container);
        playPageEnter(container);
      });
  }

  function destroyPage() {
    state.pageObservers.forEach(o => { try { o.disconnect(); } catch (_) {} });
    state.pageObservers = [];
    state.pageMutObs.forEach(o => { try { o.disconnect(); } catch (_) {} });
    state.pageMutObs = [];
    state.pageListeners.forEach(({ target, type, fn, opts }) => {
      try { target.removeEventListener(type, fn, opts); } catch (_) {}
    });
    state.pageListeners = [];
    if (state.clockInterval) { clearInterval(state.clockInterval); state.clockInterval = null; }

    /* Kill all ScrollTrigger instances */
    if (window.ScrollTrigger) ScrollTrigger.getAll().forEach(t => { try { t.kill(true); } catch (_) {} });

    destroyLenis();
  }

  /* ============================================================
     LOADER
     ============================================================ */
  function runLoader(onComplete) {
    const loader    = $('#loader');
    const loadCount = $('.loader__count');
    if (!loader) { onComplete?.(); return; }

    let pct = 0;
    const tick = () => {
      pct = Math.min(100, pct + Math.random() * 14 + 6);
      if (loadCount) loadCount.textContent = String(Math.floor(pct)).padStart(3, '0');
      if (pct < 100) setTimeout(tick, 90);
      else {
        setTimeout(() => {
          loader.classList.add('is-done');
          document.body.classList.add('is-loaded');
          onComplete?.();
        }, 350);
      }
    };
    setTimeout(tick, 80);
  }

  /* ============================================================
     EXPORT
     ============================================================ */
  window.WeMov = { bootShell, initPage, destroyPage, runLoader, state };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootShell);
  } else {
    bootShell();
  }
})();
