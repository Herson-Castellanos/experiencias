/* ==========================================================================
   m3.js · Comportamiento de la interfaz Material Design 3
   Sin dependencias. El HTML de cada página funciona por sí solo; este archivo añade:
   preferencias (tema, animaciones, tamaño de texto), cajón de navegación, ondas (ripple),
   pestañas, avisos, cuenta regresiva, videos de YouTube, avance de pasos y criterios,
   formularios, "en esta página" y aparición suave al desplazarse.
   ========================================================================== */
(function () {
  'use strict';
  window.__m3 = true;

  const root = document.documentElement;
  const embedded = root.classList.contains('is-embedded');
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) { n.className = cls; } if (html != null) { n.innerHTML = html; } return n; };
  const icon = (name, extra) => '<i class="icon i-' + name + (extra ? ' ' + extra : '') + '"></i>';

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* sin almacenamiento */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* sin almacenamiento */ } }
  };
  const reduceMQ = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  const wideMQ = window.matchMedia ? matchMedia('(min-width: 1100px)') : { matches: true };
  const motionOn = () => root.classList.contains('motion');
  const page = (location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '') || 'index';

  /* ---------------------------------------------------------------- Altura para quien incruste el sitio en un iframe */
  let heightRaf = 0;
  let lastH = 0;
  function postHeight() {
    if (window.parent === window) { return; }
    cancelAnimationFrame(heightRaf);
    heightRaf = requestAnimationFrame(() => {
      const h = document.documentElement.scrollHeight;
      if (h !== lastH) { lastH = h; window.parent.postMessage({ iframeHeight: h }, '*'); }
    });
  }

  /* ---------------------------------------------------------------- Elementos de interfaz que se añaden por script */
  (function injectChrome() {
    const actions = $('.app-bar__actions');
    const bar = $('.app-bar');
    if (actions) {
      const theme = el('button', 'icon-btn theme-toggle', icon('light_mode', 'icon--sun') + icon('dark_mode', 'icon--moon'));
      theme.type = 'button';
      theme.setAttribute('data-theme-toggle', '');
      theme.setAttribute('aria-pressed', 'false');
      theme.setAttribute('aria-label', 'Cambiar tema');
      const prefs = el('button', 'icon-btn', icon('settings'));
      prefs.type = 'button';
      prefs.setAttribute('data-dialog-open', 'prefs');
      prefs.setAttribute('aria-label', 'Preferencias de visualización');
      prefs.title = 'Preferencias';
      actions.append(theme, prefs);
    }
    if (bar) {
      bar.append(el('div', 'app-bar__progress', '<span></span>'));
      const seg = (name, items) => '<div class="segmented" role="radiogroup" aria-labelledby="pref-' + name + '-l" data-pref="' + name + '">' +
        items.map((i) => '<button type="button" class="segmented__btn" role="radio" aria-checked="false" data-value="' + i[0] + '">' + (i[2] ? icon(i[2]) : '') + i[1] + '</button>').join('') + '</div>';
      const dlg = el('dialog', 'dialog',
        '<div class="dialog__inner"><h2 class="dialog__title" id="prefs-t">Preferencias</h2>' +
        '<div class="pref"><p class="title-s" id="pref-theme-l">Tema</p>' + seg('theme', [['light', 'Claro', 'light_mode'], ['dark', 'Oscuro', 'dark_mode'], ['system', 'Sistema', 'brightness_auto']]) + '</div>' +
        '<div class="pref"><p class="title-s" id="pref-motion-l">Animaciones</p>' + seg('motion', [['full', 'Activadas'], ['reduced', 'Reducidas'], ['system', 'Sistema']]) +
        '<p class="dialog__body" id="pref-motion-note" hidden>Tu sistema tiene las animaciones reducidas, por eso no se muestran. Elige «Activadas» para verlas solo en este sitio.</p></div>' +
        '<div class="pref"><p class="title-s" id="pref-text-l">Tamaño del texto</p>' + seg('text', [['normal', 'Normal'], ['large', 'Grande'], ['xlarge', 'Muy grande']]) + '</div>' +
        '<div class="dialog__actions"><button type="button" class="btn btn--text" data-dialog-close><span class="btn__label">Cerrar</span></button></div></div>');
      dlg.id = 'prefs';
      dlg.setAttribute('aria-labelledby', 'prefs-t');
      dlg.setAttribute('data-inline-embedded', '');
      bar.append(dlg);
    }
    const snack = el('div', 'snackbar',
      '<span class="snackbar__text"></span><button type="button" class="btn btn--text snackbar__action" hidden></button>' +
      '<button type="button" class="icon-btn snackbar__close" aria-label="Cerrar aviso">' + icon('close') + '</button>');
    snack.id = 'snackbar';
    snack.setAttribute('role', 'status');
    snack.setAttribute('aria-live', 'polite');
    document.body.append(snack);
    const top = el('button', 'fab fab--sm fab-top', icon('arrow_upward'));
    top.type = 'button';
    top.setAttribute('aria-label', 'Volver arriba');
    top.title = 'Volver arriba';
    document.body.append(top);

    /* "En esta página": chips (pantallas angostas) y lista lateral (pantallas muy anchas) */
    const secs = $$('main section[data-toc]');
    const layout = $('.page-layout');
    const col = $('.page-col');
    if (secs.length > 1 && layout && col) {
      const label = (s) => s.getAttribute('data-toc') || ($('.section__title', s) || {}).textContent || s.id;
      const nav = el('nav', 'section-nav', secs.map((s) => '<a class="chip chip--pill" href="#' + s.id + '">' + label(s) + '</a>').join(''));
      nav.setAttribute('aria-label', 'En esta página');
      col.insertBefore(nav, col.firstChild);
      const toc = el('aside', 'toc', '<p class="toc__title">En esta página</p><ul class="toc__list">' + secs.map((s) => '<li><a class="toc__link" href="#' + s.id + '">' + label(s) + '</a></li>').join('') + '</ul>');
      toc.setAttribute('aria-label', 'En esta página');
      layout.append(toc);
    }
    /* Navegación horizontal cuando la página va dentro de un iframe */
    const prim = $('.nav-primary');
    if (embedded && prim && bar) {
      const nav = el('nav', 'embed-nav', $$('.nav-primary__item', prim).map((a) => '<a class="chip chip--pill" href="' + a.getAttribute('href') + '"' + (a.getAttribute('aria-current') ? ' aria-current="page"' : '') + '>' + a.querySelector('.icon').outerHTML + a.querySelector('.nav-primary__label').textContent + '</a>').join(''));
      bar.insertAdjacentElement('afterend', nav);
    }
  })();

  /* ---------------------------------------------------------------- Aviso (snackbar) */
  let snackTimer;
  function toast(message, opts) {
    opts = opts || {};
    if (embedded) {
      const anchor = opts.anchor;
      if (!anchor || !anchor.parentNode) { return; }
      const old = anchor.parentNode.querySelector('.toast-inline');
      if (old) { old.remove(); }
      const t = el('span', 'toast-inline');
      t.setAttribute('role', 'status');
      t.textContent = message;
      anchor.insertAdjacentElement('afterend', t);
      setTimeout(() => t.remove(), opts.duration || 3200);
      return;
    }
    const bar = $('#snackbar');
    if (!bar) { return; }
    const text = $('.snackbar__text', bar);
    const action = $('.snackbar__action', bar);
    const hide = () => bar.classList.remove('is-open');
    text.textContent = message;
    action.hidden = !opts.action;
    action.onclick = null;
    if (opts.action) {
      action.textContent = opts.action.label;
      action.onclick = () => { opts.action.run(); hide(); };
    }
    clearTimeout(snackTimer);
    bar.classList.add('is-open');
    snackTimer = setTimeout(hide, opts.duration || (opts.action ? 9000 : 3600));
  }
  $('.snackbar__close') && $('.snackbar__close').addEventListener('click', () => { clearTimeout(snackTimer); $('#snackbar').classList.remove('is-open'); });

  /* ---------------------------------------------------------------- Tema, animaciones y tamaño de texto */
  const effectiveDark = () => {
    const t = root.getAttribute('data-theme');
    if (t) { return t === 'dark'; }
    return !!(window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
  };
  function syncThemeMeta() {
    const dark = effectiveDark();
    $$('meta[name="theme-color"]').forEach((m) => { m.removeAttribute('media'); m.setAttribute('content', dark ? '#101415' : '#ffffff'); });
    $$('[data-theme-toggle]').forEach((b) => {
      b.setAttribute('aria-pressed', dark ? 'true' : 'false');
      b.setAttribute('aria-label', dark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro');
      b.title = dark ? 'Tema claro' : 'Tema oscuro';
    });
  }
  function syncPrefs() {
    const cur = { theme: root.getAttribute('data-theme') || 'system', motion: root.getAttribute('data-motion') || 'system', text: root.getAttribute('data-text') || 'normal' };
    $$('[data-pref]').forEach((g) => {
      const name = g.getAttribute('data-pref');
      $$('[role="radio"]', g).forEach((b) => b.setAttribute('aria-checked', b.getAttribute('data-value') === cur[name] ? 'true' : 'false'));
    });
    const note = $('#pref-motion-note');
    if (note) { note.hidden = !(reduceMQ.matches && cur.motion === 'system'); }
  }
  function setTheme(value, origin) {
    const apply = () => {
      if (value === 'light' || value === 'dark') { root.setAttribute('data-theme', value); store.set('dava-tema', value); }
      else { root.removeAttribute('data-theme'); store.del('dava-tema'); }
      syncThemeMeta();
      syncPrefs();
    };
    if (document.startViewTransition && motionOn() && !embedded) {
      const r = origin || { x: innerWidth - 40, y: 32 };
      const radius = Math.hypot(Math.max(r.x, innerWidth - r.x), Math.max(r.y, innerHeight - r.y));
      root.style.setProperty('--vt-x', r.x + 'px');
      root.style.setProperty('--vt-y', r.y + 'px');
      root.style.setProperty('--vt-r', radius + 'px');
      root.classList.add('vt-theme');
      const done = () => root.classList.remove('vt-theme');
      document.startViewTransition(apply).finished.then(done, done);
    } else { apply(); }
  }
  function setMotion(value) {
    if (value === 'full' || value === 'reduced') { root.setAttribute('data-motion', value); store.set('dava-movimiento', value); }
    else { root.removeAttribute('data-motion'); store.del('dava-movimiento'); }
    const on = value === 'full' || (value !== 'reduced' && !reduceMQ.matches);
    root.classList.toggle('motion', on);
    syncPrefs();
    setupReveal(true);
  }
  function setTextSize(value) {
    if (value === 'large' || value === 'xlarge') { root.setAttribute('data-text', value); store.set('dava-texto', value); }
    else { root.removeAttribute('data-text'); store.del('dava-texto'); }
    syncPrefs();
    postHeight();
  }
  syncThemeMeta();
  $$('[data-theme-toggle]').forEach((b) => b.addEventListener('click', () => {
    const r = b.getBoundingClientRect();
    setTheme(effectiveDark() ? 'light' : 'dark', { x: r.left + r.width / 2, y: r.top + r.height / 2 });
  }));
  if (window.matchMedia) { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', syncThemeMeta); }
  $$('[data-pref]').forEach((g) => {
    const name = g.getAttribute('data-pref');
    $$('[role="radio"]', g).forEach((b) => b.addEventListener('click', () => {
      const v = b.getAttribute('data-value');
      if (name === 'theme') { const r = b.getBoundingClientRect(); setTheme(v === 'system' ? null : v, { x: r.left + r.width / 2, y: r.top + r.height / 2 }); }
      if (name === 'motion') { setMotion(v === 'system' ? null : v); }
      if (name === 'text') { setTextSize(v === 'normal' ? null : v); }
    }));
  });
  syncPrefs();
  reduceMQ.addEventListener && reduceMQ.addEventListener('change', () => { if (!root.getAttribute('data-motion')) { setMotion(null); } });

  /* ---------------------------------------------------------------- Diálogos */
  (function initDialogs() {
    const openDialog = (d, trigger) => {
      if (!d || d.open) { return; }
      d._trigger = trigger || document.activeElement;
      if (d.hasAttribute('data-inline') || (embedded && d.hasAttribute('data-inline-embedded'))) { d.show(); } else { d.showModal(); }
    };
    document.addEventListener('click', (e) => {
      const op = e.target.closest('[data-dialog-open]');
      if (op) { if (embedded && op.hasAttribute('data-skip-embedded')) { return; } e.preventDefault(); openDialog(document.getElementById(op.getAttribute('data-dialog-open')), op); return; }
      const cl = e.target.closest('[data-dialog-close]');
      if (cl) { const d = cl.closest('dialog'); if (d) { d.close(); } return; }
      const dlg = e.target.closest('dialog');
      if (dlg && e.target === dlg && !(embedded && dlg.hasAttribute('data-inline-embedded'))) {
        const r = dlg.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) { dlg.close(); }
      }
    });
    $$('dialog').forEach((d) => {
      d.addEventListener('close', () => { if (d._trigger && d._trigger.focus) { d._trigger.focus({ preventScroll: true }); } });
      if (embedded && d.hasAttribute('data-inline-embedded')) {
        document.addEventListener('click', (e) => { if (d.open && !d.contains(e.target) && !e.target.closest('[data-dialog-open]')) { d.close(); } });
        d.addEventListener('keydown', (e) => { if (e.key === 'Escape') { d.close(); } });
      }
    });
  })();

  /* ---------------------------------------------------------------- Ondas (ripple) */
  (function initRipple() {
    const SEL = '.btn, .icon-btn, a.chip, button.chip, .fab, .tab, .nav-item, .card--interactive, .doc, .list-item--link, .acc__summary, .pager__link, .check-row, .step__toggle, .segmented__btn';
    document.addEventListener('pointerdown', (e) => {
      if (!motionOn() || (e.pointerType === 'mouse' && e.button !== 0)) { return; }
      const host = e.target.closest(SEL);
      if (!host || host.matches('[disabled],[aria-disabled="true"]')) { return; }
      const rect = host.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      const span = el('span', 'ripple');
      span.style.width = span.style.height = size + 'px';
      span.style.left = (e.clientX - rect.left - size / 2) + 'px';
      span.style.top = (e.clientY - rect.top - size / 2) + 'px';
      host.appendChild(span);
      let done = false;
      const finish = () => { if (done) { return; } done = true; span.classList.add('is-leaving'); setTimeout(() => span.remove(), 320); };
      span.addEventListener('animationend', (ev) => { if (ev.animationName === 'ripple') { finish(); } });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach((n) => host.addEventListener(n, finish, { once: true }));
    }, { passive: true });
  })();

  /* ---------------------------------------------------------------- Barra superior, volver arriba y cajón de navegación */
  (function initChrome() {
    const bar = $('.app-bar');
    const fab = $('.fab-top');
    let ticking = false;
    const onScroll = () => {
      ticking = false;
      const y = window.pageYOffset || 0;
      if (bar && !embedded) {
        bar.classList.toggle('is-scrolled', y > 8);
        const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        bar.style.setProperty('--read', Math.min(1, y / max).toFixed(4));
      }
      if (fab) { fab.classList.toggle('is-visible', y > 640); }
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    onScroll();
    fab && fab.addEventListener('click', () => window.scrollTo({ top: 0, behavior: motionOn() ? 'smooth' : 'auto' }));

    const drawer = $('#nav-drawer');
    const scrim = $('.scrim');
    const toggles = $$('[data-nav-toggle]');
    if (!drawer) { return; }
    let lastFocus = null;
    const focusables = () => $$('a[href], button:not([disabled])', drawer).filter((n) => n.offsetParent !== null || n === document.activeElement);
    const open = () => {
      if (wideMQ.matches || drawer.classList.contains('is-open')) { return; }
      lastFocus = document.activeElement;
      drawer.classList.add('is-open');
      scrim && scrim.classList.add('is-visible');
      toggles.forEach((t) => t.setAttribute('aria-expanded', 'true'));
      document.body.style.overflow = 'hidden';
      const current = $('[aria-current="page"]', drawer) || focusables()[0];
      setTimeout(() => { if (current) { current.focus({ preventScroll: true }); current.scrollIntoView && current.scrollIntoView({ block: 'center' }); } }, 60);
    };
    const close = (restore) => {
      if (!drawer.classList.contains('is-open')) { return; }
      drawer.classList.remove('is-open');
      scrim && scrim.classList.remove('is-visible');
      toggles.forEach((t) => t.setAttribute('aria-expanded', 'false'));
      document.body.style.overflow = '';
      if (restore !== false && lastFocus && lastFocus.focus) { lastFocus.focus({ preventScroll: true }); }
    };
    /* Pantalla expandida: el cajón permanente se puede ocultar y volver a mostrar */
    const root = document.documentElement;
    const collapse = (hide) => {
      root.classList.toggle('nav-collapsed', hide);
      toggles.forEach((t) => t.setAttribute('aria-expanded', hide ? 'false' : 'true'));
      try { localStorage.setItem('dava-menu', hide ? 'hidden' : 'shown'); } catch (e) { /* sin almacenamiento */ }
    };
    if (wideMQ.matches) { toggles.forEach((t) => t.setAttribute('aria-expanded', root.classList.contains('nav-collapsed') ? 'false' : 'true')); }
    $$('[data-nav-collapse]', drawer).forEach((b) => b.addEventListener('click', () => {
      collapse(true);
      const menuBtn = toggles[0];
      if (menuBtn) { menuBtn.focus({ preventScroll: true }); }
    }));
    toggles.forEach((t) => t.addEventListener('click', () => {
      if (wideMQ.matches) { collapse(false); const link = $('[aria-current="page"]', drawer) || focusables()[0]; link && link.focus({ preventScroll: true }); return; }
      drawer.classList.contains('is-open') ? close() : open();
    }));
    scrim && scrim.addEventListener('click', () => close());
    $$('[data-nav-close]', drawer).forEach((b) => b.addEventListener('click', () => close()));
    drawer.addEventListener('click', (e) => { if (e.target.closest('a[href]')) { close(false); } });
    document.addEventListener('keydown', (e) => {
      if (!drawer.classList.contains('is-open')) { return; }
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key === 'Tab') {
        const f = focusables();
        if (!f.length) { return; }
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    wideMQ.addEventListener && wideMQ.addEventListener('change', () => { if (wideMQ.matches) { close(false); } });
  })();

  /* ---------------------------------------------------------------- Pestañas */
  (function initTabs() {
    $$('.tabs').forEach((tabs) => {
      const list = $('.tabs__list', tabs);
      const indicator = $('.tabs__indicator', tabs);
      const tabBtns = $$('[role="tab"]', tabs);
      const panels = $$('[role="tabpanel"]', tabs);
      const place = () => {
        const active = tabBtns.filter((t) => t.getAttribute('aria-selected') === 'true')[0];
        if (!active || !indicator) { return; }
        const label = $('.tab__label', active) || active;
        const lr = label.getBoundingClientRect();
        const pr = list.getBoundingClientRect();
        indicator.style.setProperty('--ind-w', Math.max(24, lr.width) + 'px');
        indicator.style.setProperty('--ind-x', (lr.left - pr.left + list.scrollLeft) + 'px');
      };
      const select = (tab, focus) => {
        const idx = tabBtns.indexOf(tab);
        tabBtns.forEach((t, i) => { t.setAttribute('aria-selected', i === idx ? 'true' : 'false'); t.tabIndex = i === idx ? 0 : -1; });
        panels.forEach((p, i) => {
          if (i === idx) {
            if (p.hidden) { p.hidden = false; if (motionOn()) { p.classList.remove('is-entering'); void p.offsetWidth; p.classList.add('is-entering'); } }
          } else { p.hidden = true; p.classList.remove('is-entering'); }
        });
        place();
        if (list.scrollWidth > list.clientWidth) { tab.scrollIntoView({ inline: 'center', block: 'nearest', behavior: motionOn() ? 'smooth' : 'auto' }); }
        if (focus) { tab.focus(); }
        postHeight();
      };
      tabBtns.forEach((t) => {
        t.addEventListener('click', () => select(t));
        t.addEventListener('keydown', (e) => {
          const i = tabBtns.indexOf(t);
          const n = tabBtns.length;
          let next = null;
          if (e.key === 'ArrowRight') { next = tabBtns[(i + 1) % n]; }
          else if (e.key === 'ArrowLeft') { next = tabBtns[(i - 1 + n) % n]; }
          else if (e.key === 'Home') { next = tabBtns[0]; }
          else if (e.key === 'End') { next = tabBtns[n - 1]; }
          if (next) { e.preventDefault(); select(next, true); }
        });
      });
      tabs._select = select;
      const start = tabBtns.filter((t) => t.getAttribute('aria-selected') === 'true')[0] || tabBtns[0];
      panels.forEach((p) => { p.hidden = true; });
      start && select(start);
      window.addEventListener('resize', place);
      document.fonts && document.fonts.ready && document.fonts.ready.then(place);
      list && list.addEventListener('scroll', place, { passive: true });
    });
  })();

  /* ---------------------------------------------------------------- Copiar al portapapeles */
  (function initCopy() {
    const copyText = (text) => {
      if (navigator.clipboard && window.isSecureContext) { return navigator.clipboard.writeText(text); }
      return new Promise((resolve, reject) => {
        const ta = el('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy') ? resolve() : reject(new Error('copy')); } catch (e) { reject(e); } finally { ta.remove(); }
      });
    };
    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-copy]');
      if (!b) { return; }
      e.preventDefault();
      let text = b.getAttribute('data-copy');
      if (text === 'page') { text = location.href.split('#')[0]; }
      else if (text.charAt(0) === '#') { const src = $(text); text = src ? src.textContent.trim().replace(/\s+/g, ' ') : ''; }
      copyText(text).then(() => {
        toast(b.getAttribute('data-copy-msg') || 'Enlace copiado', { anchor: b });
        const ic = $('.icon', b);
        if (ic) { const old = ic.className; ic.className = 'icon i-check'; setTimeout(() => { ic.className = old; }, 1800); }
      }, () => toast('No se pudo copiar. Selecciona el texto y cópialo manualmente.', { anchor: b }));
    });
  })();

  /* ---------------------------------------------------------------- Cuenta regresiva (rodillos de dígitos) */
  (function initCountdown() {
    $$('[data-deadline]').forEach((box) => {
      const m = String(box.getAttribute('data-deadline')).match(/(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/);
      if (!m) { return; }
      const target = new Date(+m[1], +m[2] - 1, +m[3], 0, 0, 0).getTime();
      const units = { d: [3, 'días'], h: [2, 'horas'], m: [2, 'min'], s: [2, 'seg'] };
      const head = $('.deadline__head', box) || box;
      const status = el('span', 'chip chip--pill deadline__status', icon('schedule') + '<span></span>');
      head.append(status);
      const counter = el('div', 'countdown', Object.keys(units).map((u) => '<div class="cd-unit" data-unit="' + u + '"><span class="cd-digits" aria-hidden="true"></span><span class="cd-label">' + units[u][1] + '</span></div>').join(''));
      counter.setAttribute('role', 'timer');
      box.append(counter);
      const hasPenalty = !!$('#entrega');
      const note = el('p', 'deadline__note', 'El plazo ya terminó. ' + (hasPenalty ? 'Todavía puedes entregarla, pero puede aplicarse una penalización: consulta <a href="#entrega">¿Qué sucede si no entrego esta actividad en la semana indicada?</a>' : ''));
      note.hidden = true;
      box.append(note);
      const digits = {};
      Object.keys(units).forEach((u) => {
        const holder = $('[data-unit="' + u + '"] .cd-digits', counter);
        digits[u] = [];
        for (let i = 0; i < units[u][0]; i++) {
          const d = el('span', 'cd-digit');
          const strip = el('span', 'cd-digit__strip', Array.from({ length: 10 }, (_, n) => '<span>' + n + '</span>').join(''));
          d.append(strip);
          holder.append(d);
          digits[u].push(strip);
        }
      });
      const set = (u, value) => {
        const str = String(value).padStart(units[u][0], '0');
        digits[u].forEach((strip, i) => strip.style.setProperty('--n', str.charAt(i)));
      };
      const tick = () => {
        const diff = target - Date.now();
        const expired = diff <= 0;
        const abs = expired ? 0 : diff;
        const d = Math.min(999, Math.floor(abs / 864e5));
        const h = Math.floor(abs % 864e5 / 36e5);
        const mi = Math.floor(abs % 36e5 / 6e4);
        const s = Math.floor(abs % 6e4 / 1e3);
        set('d', d); set('h', h); set('m', mi); set('s', s);
        box.classList.toggle('is-expired', expired);
        note.hidden = !expired;
        let cls = 'chip chip--pill deadline__status ';
        let txt;
        let ic = 'schedule';
        if (expired) { txt = 'Plazo vencido'; cls += 'chip--tertiary'; ic = 'event_busy'; }
        else if (d >= 1) { txt = 'Faltan ' + d + (d === 1 ? ' día' : ' días'); cls += d > 7 ? 'chip--success' : 'chip--primary'; }
        else if (h >= 1) { txt = 'Faltan ' + h + (h === 1 ? ' hora' : ' horas'); cls += 'chip--tertiary'; }
        else { txt = 'Faltan ' + mi + ' min'; cls += 'chip--error'; }
        status.className = cls;
        $('span', status).textContent = txt;
        $('.icon', status).className = 'icon i-' + ic;
        counter.setAttribute('aria-label', expired ? 'Plazo vencido' : 'Quedan ' + d + ' días, ' + h + ' horas, ' + mi + ' minutos y ' + s + ' segundos');
        return expired;
      };
      if (!tick()) {
        const timer = setInterval(() => { if (!document.hidden && tick()) { clearInterval(timer); } }, 1000);
        document.addEventListener('visibilitychange', () => { if (!document.hidden) { tick(); } });
      }
    });
  })();

  /* ---------------------------------------------------------------- Video de YouTube (el reproductor se carga al pulsar) */
  (function initVideos() {
    $$('.video[data-video]').forEach((box) => {
      const id = box.getAttribute('data-video');
      const title = box.getAttribute('data-title') || 'Video de YouTube';
      box.textContent = '';
      const btn = el('button', 'video__btn',
        '<img class="video__thumb" src="https://i.ytimg.com/vi/' + encodeURIComponent(id) + '/hqdefault.jpg" alt="" width="480" height="360" loading="lazy" decoding="async">' +
        '<span class="video__play">' + icon('play_arrow') + '</span><span class="video__label"></span>');
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Reproducir video: ' + title);
      $('.video__label', btn).textContent = title;
      const thumb = $('.video__thumb', btn);
      thumb.addEventListener('error', () => { thumb.style.display = 'none'; });
      box.append(btn);
      btn.addEventListener('click', () => {
        const ifr = el('iframe');
        ifr.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0&modestbranding=1&playsinline=1';
        ifr.title = title;
        ifr.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen';
        ifr.setAttribute('allowfullscreen', '');
        ifr.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
        box.append(ifr);
        box.classList.add('is-playing');
        btn.remove();
        ifr.focus();
      });
    });
  })();

  /* ---------------------------------------------------------------- Marcos externos (mapa, encuesta) */
  (function initEmbeds() {
    const els = $$('.embed[data-src]');
    if (!els.length) { return; }
    const load = (box) => {
      if (box._loaded) { return; }
      box._loaded = true;
      const f = el('iframe');
      f.src = box.getAttribute('data-src');
      f.title = box.getAttribute('data-title') || 'Contenido incrustado';
      f.loading = 'lazy';
      f.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
      f.addEventListener('load', () => { box.classList.add('is-ready'); postHeight(); });
      box.append(f);
    };
    if (!('IntersectionObserver' in window)) { els.forEach(load); return; }
    const io = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { load(en.target); io.unobserve(en.target); } }), { rootMargin: '600px 0px' });
    els.forEach((b) => io.observe(b));
  })();

  /* ---------------------------------------------------------------- Imágenes con aparición suave */
  $$('main img').forEach((img) => {
    if (img.complete && img.naturalWidth) { return; }
    img.setAttribute('data-fade', '');
    const done = () => img.classList.add('is-loaded');
    img.addEventListener('load', done, { once: true });
    img.addEventListener('error', done, { once: true });
  });

  /* ---------------------------------------------------------------- Procedimiento: pasos con avance guardado */
  (function initSteps() {
    const list = $('ol[data-steps]');
    if (!list) { return; }
    const steps = $$('li.step', list);
    steps.forEach((li) => {
      const n = li.getAttribute('data-n') || '';
      const title = $('.step__title', li);
      const body = $('.step__body', li);
      const main = el('div', 'step__main');
      title && main.append(title);
      body && main.append(body);
      const num = el('span', 'step__num', '<b>' + n + '</b>' + icon('check'));
      const done = el('label', 'step__done', '<input type="checkbox" data-step><span class="step__toggle">' + icon('check_circle') + '</span><span class="visually-hidden">Marcar el paso ' + n + ' como hecho</span>');
      li.textContent = '';
      li.append(num, main, done);
    });
    const boxes = $$('input[data-step]', list);
    const panel = el('div', 'steps-progress',
      '<div class="steps-progress__row">' + icon('checklist') + '<div class="steps-progress__text"><span data-steps-count></span><small data-steps-msg></small></div>' +
      '<button type="button" class="btn btn--text" data-steps-reset hidden><span class="btn__label">Reiniciar</span></button></div>' +
      '<div class="progress progress--thick" role="progressbar" aria-label="Avance del procedimiento" aria-valuemin="0" aria-valuemax="' + boxes.length + '" aria-valuenow="0"><div class="progress__bar" data-steps-bar></div></div>');
    list.parentNode.insertBefore(panel, list);
    const key = 'dava:' + page + ':pasos';
    let saved = [];
    try { saved = JSON.parse(store.get(key) || '[]'); } catch (e) { saved = []; }
    const bar = $('[data-steps-bar]', panel);
    const txt = $('[data-steps-count]', panel);
    const msg = $('[data-steps-msg]', panel);
    const reset = $('[data-steps-reset]', panel);
    const paint = (silent) => {
      const done = boxes.filter((b) => b.checked).length;
      boxes.forEach((b) => b.closest('.step').classList.toggle('is-done', b.checked));
      bar.style.width = (boxes.length ? done / boxes.length * 100 : 0) + '%';
      bar.parentNode.setAttribute('aria-valuenow', done);
      txt.textContent = done + ' de ' + boxes.length + ' pasos';
      msg.textContent = done === 0 ? 'Marca cada paso cuando lo termines; tu avance se guarda en este navegador.' : (done === boxes.length ? '¡Completaste el procedimiento!' : 'Sigue así: te faltan ' + (boxes.length - done) + '.');
      reset.hidden = done === 0;
      if (!silent) { store.set(key, JSON.stringify(boxes.map((b, i) => (b.checked ? i : -1)).filter((i) => i >= 0))); }
    };
    boxes.forEach((b, i) => { b.checked = saved.indexOf(i) !== -1; b.addEventListener('change', () => paint()); });
    reset.addEventListener('click', () => { boxes.forEach((b) => { b.checked = false; }); paint(); toast('Avance reiniciado', { anchor: reset }); });
    paint(true);
  })();

  /* ---------------------------------------------------------------- Instrumento: lista de cotejo con autorrevisión guardada */
  (function initCriteria() {
    const wrap = $('[data-criteria]');
    if (!wrap) { return; }
    const groups = $$('.criteria-group', wrap);
    let total = 0;
    groups.forEach((g) => {
      const pts = +g.getAttribute('data-points') || 0;
      total += pts;
      const title = $('.criteria-group__title', g);
      const head = el('div', 'criteria-group__head', '<span class="points"><b>' + pts + '</b><small>' + (pts === 1 ? 'punto' : 'puntos') + '</small></span>');
      title.replaceWith(head);
      head.append(title, el('span', 'criteria-group__count'));
      $$('.criteria-group__list > li', g).forEach((li) => {
        const label = el('label', 'check-row', '<input type="checkbox" data-crit><span class="check-row__box"></span><span class="check-row__text">' + li.innerHTML + '</span>');
        li.textContent = '';
        li.append(label);
      });
    });
    const boxes = $$('input[data-crit]', wrap);
    const panel = el('div', 'criteria-summary',
      '<div class="criteria-summary__row"><div class="criteria-summary__total"><span>' + total + '</span><small>puntos posibles</small></div>' +
      '<p class="criteria-summary__text" data-crit-count></p><button type="button" class="btn btn--text" data-crit-reset hidden><span class="btn__label">Reiniciar</span></button></div>' +
      '<div class="progress progress--thick" role="progressbar" aria-label="Criterios cumplidos" aria-valuemin="0" aria-valuemax="' + boxes.length + '" aria-valuenow="0"><div class="progress__bar" data-crit-bar></div></div>');
    wrap.insertBefore(panel, wrap.firstChild);
    const key = 'dava:' + page + ':criterios';
    let saved = [];
    try { saved = JSON.parse(store.get(key) || '[]'); } catch (e) { saved = []; }
    const bar = $('[data-crit-bar]', panel);
    const txt = $('[data-crit-count]', panel);
    const reset = $('[data-crit-reset]', panel);
    const paint = (silent) => {
      const done = boxes.filter((b) => b.checked).length;
      groups.forEach((g) => {
        const inputs = $$('input[data-crit]', g);
        const n = inputs.filter((b) => b.checked).length;
        g.classList.toggle('is-complete', n === inputs.length && n > 0);
        $('.criteria-group__count', g).textContent = n + '/' + inputs.length;
      });
      bar.style.width = (boxes.length ? done / boxes.length * 100 : 0) + '%';
      bar.parentNode.setAttribute('aria-valuenow', done);
      txt.textContent = done + ' de ' + boxes.length + ' criterios cumplidos';
      reset.hidden = done === 0;
      if (!silent) { store.set(key, JSON.stringify(boxes.map((b, i) => (b.checked ? i : -1)).filter((i) => i >= 0))); }
    };
    boxes.forEach((b, i) => { b.checked = saved.indexOf(i) !== -1; b.addEventListener('change', () => paint()); });
    reset.addEventListener('click', () => { boxes.forEach((b) => { b.checked = false; }); paint(); toast('Revisión reiniciada', { anchor: reset }); });
    paint(true);
  })();

  /* ---------------------------------------------------------------- Formularios (Formoid) */
  (function initForms() {
    $$('textarea.field__input').forEach((ta) => {
      const fit = () => { ta.style.height = 'auto'; ta.style.height = Math.max(ta.scrollHeight + 2, 112) + 'px'; };
      ta.addEventListener('input', () => { fit(); postHeight(); });
      setTimeout(fit, 0);
    });
    $$('form[data-formoid]').forEach((form) => {
      const status = $('.form__status', form);
      const submit = $('[type="submit"]', form);
      const label = submit && $('.btn__label', submit);
      const say = (kind, text) => {
        if (!status) { return; }
        status.innerHTML = '<div class="callout callout--' + (kind === 'ok' ? 'ok' : 'warn') + '" role="' + (kind === 'ok' ? 'status' : 'alert') + '">' + icon(kind === 'ok' ? 'check_circle' : 'error') + '<div class="callout__body"><p></p></div></div>';
        $('p', status).textContent = text;
        postHeight();
        status.scrollIntoView && status.scrollIntoView({ block: 'nearest', behavior: motionOn() ? 'smooth' : 'auto' });
      };
      form.setAttribute('novalidate', '');
      form.addEventListener('input', (e) => {
        const f = e.target.closest('.field');
        if (f) { f.classList.remove('is-invalid'); const s = $('.field__support', f); if (s && s.dataset.err) { s.textContent = s.dataset.hint || ''; delete s.dataset.err; } }
        const fs = e.target.closest('fieldset[data-required]');
        if (fs) { fs.classList.remove('is-invalid'); const er = $('.choice-error', fs); if (er) { er.hidden = true; } }
      });
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (submit.classList.contains('is-loading')) { return; }
        let first = null;
        $$('.field', form).forEach((f) => {
          const inp = $('.field__input', f);
          const s = $('.field__support', f);
          let bad = inp.hasAttribute('required') && !inp.value.trim();
          if (s && !s.dataset.hint) { s.dataset.hint = s.textContent; }
          if (!bad && inp.type === 'email' && inp.value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(inp.value.trim())) { bad = true; if (s) { s.dataset.err = '1'; s.textContent = 'Escribe un correo válido.'; } }
          else if (bad && s) { s.dataset.err = '1'; s.textContent = 'Este campo es obligatorio.'; }
          f.classList.toggle('is-invalid', bad);
          if (bad && !first) { first = inp; }
        });
        $$('fieldset[data-required]', form).forEach((fs) => {
          const ok = $$('input[type="radio"]', fs).some((r) => r.checked);
          fs.classList.toggle('is-invalid', !ok);
          const er = $('.choice-error', fs);
          if (er) { er.hidden = ok; }
          if (!ok && !first) { first = $('input', fs); }
        });
        if (first) { first.focus(); say('err', 'Revisa los campos marcados antes de enviar.'); return; }
        const data = [];
        $$('[data-field]', form).forEach((n) => {
          const name = n.getAttribute('data-field');
          if (n.type === 'radio') { if (n.checked) { data.push([name, n.value]); } }
          else if (n.type === 'checkbox') { data.push([name, n.checked ? n.value : 'No']); }
          else { data.push([name, n.value]); }
        });
        submit.classList.add('is-loading');
        submit.setAttribute('aria-disabled', 'true');
        if (label) { label.dataset.t = label.textContent; label.textContent = 'Enviando…'; }
        const payload = JSON.stringify({ email: form.getAttribute('data-email'), form: { title: form.getAttribute('data-title'), data } });
        fetch('https://formoid.net/api/push', { method: 'POST', body: payload })
          .then((r) => { if (!r.ok) { throw new Error('http'); } return r.text(); })
          .then((t) => { let j; try { j = JSON.parse(t); } catch (err) { throw new Error('json'); } if (j.error) { throw new Error(j.error); } return j; })
          .then(() => {
            form.reset();
            $$('textarea.field__input', form).forEach((ta) => { ta.style.height = ''; });
            say('ok', form.getAttribute('data-ok') || 'Gracias. Tu respuesta se envió correctamente.');
            toast(form.getAttribute('data-ok') || 'Enviado', { anchor: submit });
          })
          .catch((err) => {
            const off = navigator.onLine === false;
            say('err', off ? 'No hay conexión a Internet. Revisa tu red e inténtalo de nuevo.' : 'No se pudo enviar el formulario (' + (err && err.message && err.message.length < 60 ? err.message : 'error del servidor') + '). Tus respuestas siguen aquí; inténtalo otra vez en unos minutos.');
          })
          .then(() => {
            submit.classList.remove('is-loading');
            submit.removeAttribute('aria-disabled');
            if (label && label.dataset.t) { label.textContent = label.dataset.t; }
          });
      });
    });
  })();

  /* ---------------------------------------------------------------- Aparición suave al desplazarse */
  const AUTO_REVEAL = ['.page > section > *', '.hub-grid > *', '.grid > *', '.agenda__item', '.criteria-grid > *', '.scale > *', '.video-grid > *', '.tech-grid > *', '.req > *', '.pager > *', '.weights', '.platform-list > *'];
  let revealIO = null;
  function setupReveal(force) {
    const items = $$(AUTO_REVEAL.join(','), $('main') || document).filter((n) => !n.closest('.hero') && !n.closest('dialog'));
    items.forEach((n) => { if (!n.hasAttribute('data-reveal')) { n.setAttribute('data-reveal', ''); } });
    const all = $$('[data-reveal]');
    const byParent = new Map();
    all.forEach((n) => { const k = n.parentNode; byParent.set(k, (byParent.get(k) || 0) + 1); n.style.setProperty('--i', Math.min(byParent.get(k) - 1, 7)); });
    if (revealIO) { revealIO.disconnect(); revealIO = null; }
    if (!('IntersectionObserver' in window) || !motionOn() || force === true) { all.forEach((n) => n.classList.add('in')); return; }
    revealIO = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (!en.isIntersecting) { return; }
      en.target.classList.add('in');
      revealIO.unobserve(en.target);
    }), { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    all.forEach((n) => { if (!n.classList.contains('in')) { revealIO.observe(n); } });
    setTimeout(() => all.forEach((n) => n.classList.add('in')), 8000);
  }
  setupReveal(false);

  /* ---------------------------------------------------------------- "En esta página": sección activa */
  (function initSpy() {
    const secs = $$('main section[data-toc]');
    const links = $$('.toc__link, .section-nav .chip');
    if (!secs.length || !links.length || !('IntersectionObserver' in window)) { return; }
    const byId = {};
    links.forEach((a) => { const id = (a.getAttribute('href') || '').replace('#', ''); (byId[id] = byId[id] || []).push(a); });
    let current = null;
    const mark = (id) => {
      if (id === current) { return; }
      current = id;
      links.forEach((a) => { a.removeAttribute('aria-current'); a.classList.remove('is-active'); });
      (byId[id] || []).forEach((a) => {
        if (a.classList.contains('chip')) {
          a.classList.add('is-active');
          const sc = a.parentNode;
          if (sc && sc.scrollWidth > sc.clientWidth) { sc.scrollTo({ left: a.offsetLeft - sc.clientWidth / 2 + a.offsetWidth / 2, behavior: motionOn() ? 'smooth' : 'auto' }); }
        } else { a.setAttribute('aria-current', 'true'); }
      });
    };
    const io = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { mark(en.target.id); } }), { rootMargin: '-25% 0px -65% 0px' });
    secs.forEach((s) => io.observe(s));
    /* Al llegar al final de la página, la última sección nunca alcanza la franja del observador: se marca a mano */
    const last = secs[secs.length - 1];
    window.addEventListener('scroll', () => {
      const atEnd = window.innerHeight + (window.pageYOffset || 0) >= document.documentElement.scrollHeight - 8;
      if (atEnd && last.getBoundingClientRect().top < window.innerHeight) { mark(last.id); }
    }, { passive: true });
  })();

  /* ---------------------------------------------------------------- Enlaces internos hacia contenido plegado */
  (function initHash() {
    const reveal = (target) => {
      const d = target.closest('details');
      if (d && !d.open) { d.open = true; }
      const panel = target.closest('[role="tabpanel"]');
      if (panel) { const tabs = panel.closest('.tabs'); const tab = tabs && $('[aria-controls="' + panel.id + '"]', tabs); if (tab && tabs._select) { tabs._select(tab); } }
    };
    const go = (hash, flash) => {
      if (!hash || hash.length < 2) { return; }
      let id;
      try { id = decodeURIComponent(hash.slice(1)); } catch (e) { id = hash.slice(1); }
      const target = document.getElementById(id);
      if (!target) { return; }
      reveal(target);
      if (flash) {
        const t = $('.section__title, h2, h3', target) || target;
        t.classList.remove('flash-target');
        void t.offsetWidth;
        t.classList.add('flash-target');
      }
    };
    window.addEventListener('hashchange', () => go(location.hash, true));
    document.addEventListener('click', (e) => { const a = e.target.closest('a[href^="#"]'); if (a) { setTimeout(() => go(a.getAttribute('href'), true), 0); } });
    document.addEventListener('toggle', postHeight, true);
    go(location.hash, false);
    if (location.hash && !embedded) { setTimeout(() => { const t = document.getElementById(decodeURIComponent(location.hash.slice(1))); t && t.scrollIntoView({ block: 'start' }); }, 120); }
  })();

  /* ---------------------------------------------------------------- Aviso cuando el sistema reduce las animaciones */
  (function initMotionHint() {
    if (embedded || !reduceMQ.matches || store.get('dava-movimiento') || store.get('dava-hint-mov')) { return; }
    setTimeout(() => {
      toast('Tu sistema tiene las animaciones reducidas, así que verás el sitio sin movimiento.', {
        duration: 12000,
        action: { label: 'Activar animaciones', run: () => { setMotion('full'); toast('Animaciones activadas. Puedes cambiarlo en Preferencias.'); } }
      });
      store.set('dava-hint-mov', '1');
    }, 1400);
  })();

  /* ---------------------------------------------------------------- Avisar la altura al iframe contenedor (si lo hay) */
  if (window.parent !== window) {
    window.addEventListener('load', postHeight);
    window.addEventListener('resize', postHeight);
    document.fonts && document.fonts.ready && document.fonts.ready.then(postHeight);
    if ('ResizeObserver' in window) { new ResizeObserver(postHeight).observe(document.body); }
    document.addEventListener('transitionend', postHeight);
    postHeight();
  }
})();
