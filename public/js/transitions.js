/* =========================================================
   WEMOV AGENCY — transitions.js
   Cinematic page transitions powered by Barba.js + GSAP.
   - Curtain wipe (ice cyan -> dark) on leave
   - Curtain retracts on enter
   - Page content fades + slides
   - Shell elements (cursor, grain, nav, footer) persist
   Initialised AFTER /js/main.js so WeMov.* is available.
   ========================================================= */

(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Inject curtain DOM (lives outside any Barba container so it persists)
  function ensureCurtain() {
    if (document.getElementById('pageCurtain')) return document.getElementById('pageCurtain');
    const wrap = document.createElement('div');
    wrap.id = 'pageCurtain';
    wrap.className = 'page-curtain';
    wrap.setAttribute('aria-hidden', 'true');
    wrap.innerHTML = `
      <div class="page-curtain__panel page-curtain__panel--1">
        <span class="page-curtain__word">We</span>
      </div>
      <div class="page-curtain__panel page-curtain__panel--2">
        <span class="page-curtain__word">Mov</span>
      </div>
      <div class="page-curtain__panel page-curtain__panel--3">
        <span class="page-curtain__word">Agency</span>
      </div>
    `;
    document.body.appendChild(wrap);
    return wrap;
  }

  /* =====================================================
     Transition implementations — gracefully degrade.
     We use GSAP if available, otherwise fall back to CSS classes.
     ===================================================== */

  // Wait helper
  const wait = (ms) => new Promise(r => setTimeout(r, ms));

  function leaveTransition(container) {
    const curtain = ensureCurtain();
    curtain.classList.remove('is-leaving', 'is-entering');
    // force reflow so animation re-fires
    void curtain.offsetWidth;
    curtain.classList.add('is-leaving');

    // Content slides up + fades
    if (container) {
      container.style.willChange = 'transform, opacity, filter';
      container.style.transition = 'transform .55s cubic-bezier(.7,0,.2,1), opacity .45s ease, filter .55s ease';
      container.style.transform  = 'translateY(-24px)';
      container.style.opacity    = '0';
      container.style.filter     = 'blur(4px)';
    }

    // Total leave duration matches the longest panel sweep (see CSS)
    return wait(reduceMotion ? 0 : 760);
  }

  function enterTransition(container) {
    const curtain = ensureCurtain();
    curtain.classList.remove('is-leaving');
    void curtain.offsetWidth;
    curtain.classList.add('is-entering');

    if (container) {
      container.style.willChange = 'transform, opacity, filter';
      container.style.transition = 'none';
      container.style.transform  = 'translateY(24px)';
      container.style.opacity    = '0';
      container.style.filter     = 'blur(6px)';
      // next frame -> animate in
      requestAnimationFrame(() => {
        container.style.transition = 'transform .8s cubic-bezier(.7,0,.2,1) .12s, opacity .7s ease .12s, filter .9s ease .12s';
        container.style.transform  = 'translateY(0)';
        container.style.opacity    = '1';
        container.style.filter     = 'blur(0)';
      });
    }

    // Schedule curtain class cleanup so next transition is clean
    setTimeout(() => {
      curtain.classList.remove('is-entering');
    }, reduceMotion ? 50 : 900);

    return wait(reduceMotion ? 0 : 820);
  }

  /* =====================================================
     Bind Barba once script loads
     ===================================================== */
  function bindBarba() {
    if (!window.barba) return;

    window.barba.init({
      // Don't transition if user holds modifier keys, opens in new tab, or links to mailto/tel/anchor
      prevent: ({ el, event }) => {
        if (!el) return false;
        const href = el.getAttribute('href') || '';
        if (href.startsWith('mailto:') || href.startsWith('tel:')) return true;
        if (href.startsWith('#')) return true;          // on-page anchor
        if (el.target === '_blank') return true;
        if (el.hasAttribute('data-barba-prevent')) return true;
        return false;
      },

      transitions: [{
        name: 'wemov-cinematic',
        async leave(data) {
          // Cleanup previous page (observers, lenis, listeners)
          if (window.WeMov && WeMov.destroyPage) WeMov.destroyPage();
          await leaveTransition(data.current.container);
        },
        async enter(data) {
          await enterTransition(data.next.container);
        },
        async once(data) {
          // First load: skip enter animation if loader is handling it
          // but still initialize the page
        }
      }]
    });

    // After every page is swapped in, re-init JS
    window.barba.hooks.after(() => {
      if (window.WeMov && WeMov.initPage) {
        WeMov.initPage(document.querySelector('[data-barba="container"]'));
      }
    });

    // Update document title properly
    window.barba.hooks.afterEnter((data) => {
      const next = data.next.html.match(/<title>([\s\S]*?)<\/title>/i);
      if (next && next[1]) document.title = next[1].trim();
    });
  }

  /* =====================================================
     Load Barba + GSAP from CDN, then bind
     ===================================================== */
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if ([...document.scripts].some(s => s.src === src)) { resolve(); return; }
      const s = document.createElement('script');
      s.src = src; s.async = false;
      s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function boot() {
    // Curtain DOM ready ASAP so it never flashes
    ensureCurtain();

    // GSAP is optional — we mainly drive with CSS classes; keep available globally
    const tasks = [
      loadScript('https://cdn.jsdelivr.net/npm/@barba/core@2.10.3/dist/barba.umd.min.js')
    ];
    Promise.all(tasks)
      .then(bindBarba)
      .catch(() => {
        // Fallback: degrade to normal navigation. Curtain still injected for first-load enter anim.
      });

    // First-page enter choreography (after loader hides)
    // The loader on home invokes WeMov.runLoader; on other pages we kickoff manually.
    if (window.WeMov) {
      const startPage = () => {
        WeMov.initPage(document.querySelector('[data-barba="container"]'));
      };

      const loader = document.getElementById('loader');
      if (loader && !loader.classList.contains('is-done')) {
        WeMov.runLoader(startPage);
      } else {
        // No loader present (sub-pages) — just enter directly with a soft curtain retract
        const curtain = ensureCurtain();
        curtain.classList.add('is-entering');
        setTimeout(() => curtain.classList.remove('is-entering'), 820);
        startPage();
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
