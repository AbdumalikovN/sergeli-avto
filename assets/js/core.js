/* Sergeli Avto — core, ported from w2w.uz/assets/js/core.js:
   theme (dark by default), header & mobile sheet, language menu, glass optics (specular + refraction),
   modals, toast, copy buttons, keyboard-aware sheets, split words, reveals, counters, segmented thumbs. */
(function () {
  'use strict';
  var W = window.W2W = window.W2W || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var lang = (root.getAttribute('lang') || 'uz').slice(0, 2);
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var reduceT = window.matchMedia('(prefers-reduced-transparency: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var animate = hasGsap && !reduce;
  if (animate) { root.classList.add('anim-ready'); window.gsap.registerPlugin(window.ScrollTrigger); } else { root.classList.remove('motion'); }

  var DICT = {
    uz: { open: 'Menyuni ochish', close: 'Menyuni yopish', copied: 'Nusxalandi', dark: 'Tungi mavzu', light: 'Kunduzgi mavzu', locale: 'uz-Latn-UZ' },
    ru: { open: 'Открыть меню', close: 'Закрыть меню', copied: 'Скопировано', dark: 'Тёмная тема', light: 'Светлая тема', locale: 'ru-RU' }
  };
  var T = DICT[lang] || DICT.uz;
  W.lang = lang; W.animate = animate; W.reduce = reduce; W.fine = fine; W.T = T;
  W.ready = window.W2WBootReady || Promise.resolve();
  W.sfx = function (n) { if (window.W2WSound) window.W2WSound.play(n); };
  W.$ = $; W.$$ = $$;
  W.fmt = function (n) { return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '); };

  /* ---------- toast ---------- */
  var toastEl = $('[data-toast]'), toastT = 0;
  W.toast = function (msg) {
    if (!toastEl) return;
    toastEl.textContent = msg; toastEl.classList.add('is-on');
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2600);
  };

  /* ---------- theme ---------- */
  var metaTheme = $('meta[data-theme-color]');
  function applyTheme(t, silent) {
    root.setAttribute('data-theme', t);
    if (metaTheme) metaTheme.content = t === 'dark' ? '#08090B' : '#F2F3F5';
    $$('[data-theme-toggle]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(t === 'dark'));
      if (b.classList.contains('hd-theme')) b.setAttribute('aria-label', t === 'dark' ? T.light : T.dark);
    });
    if (!silent) document.dispatchEvent(new CustomEvent('w2w:theme', { detail: { theme: t } }));
    onScroll();
  }
  W.theme = function () { return root.getAttribute('data-theme') || 'dark'; };
  /* no striped intermediate frames: transitions are off while switching; circular reveal only on desktop with a mouse */
  function switchTheme(t, origin) {
    if (t !== 'dark' && t !== 'light') return;
    var settle = function () {
      root.classList.add('theme-switching');
      applyTheme(t);
      void root.offsetWidth;
      requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.remove('theme-switching'); }); });
    };
    var desktop = fine && window.innerWidth > 1000;
    if (origin && desktop && document.startViewTransition && !reduce) {
      var r = origin.getBoundingClientRect();
      root.style.setProperty('--vt-x', (r.left + r.width / 2) + 'px');
      root.style.setProperty('--vt-y', (r.top + r.height / 2) + 'px');
      root.classList.add('theme-vt');
      try {
        var vt = document.startViewTransition(settle);
        var done = function () { root.classList.remove('theme-vt'); };
        vt.finished.then(done, done);
        return;
      } catch (err) { root.classList.remove('theme-vt'); }
    }
    settle();
  }
  W.setTheme = switchTheme;
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-theme-toggle]');
    if (!b) return;
    var next = W.theme() === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('sa-theme', next); } catch (err) { /* ignore */ }
    switchTheme(next, b);
  });

  /* ---------- sound toggles ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-sound-toggle]');
    if (b && window.W2WSound) window.W2WSound.toggle();
  });

  /* ---------- header ---------- */
  var hd = $('[data-header]');
  var zones = [];
  W.refreshZones = function () { zones = $$('.night, .is-dark, [data-dark-zone]'); onScroll(); };
  function onScroll() {
    if (!hd) return;
    hd.classList.toggle('is-compact', window.scrollY > 30);
    var probe = 38, dark = false;
    if (W.theme() !== 'dark') {
      for (var i = 0; i < zones.length; i++) { var r = zones[i].getBoundingClientRect(); if (r.top <= probe && r.bottom >= probe) { dark = true; break; } }
    }
    hd.classList.toggle('on-dark', dark);
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* current section marker in the nav */
  var navLinks = $$('.hd-link[href^="#"]');
  if (navLinks.length && 'IntersectionObserver' in window) {
    var secs = navLinks.map(function (a) { return $(a.getAttribute('href')); }).filter(Boolean);
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (!x.isIntersecting) return;
        navLinks.forEach(function (a) { if (a.getAttribute('href') === '#' + x.target.id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    secs.forEach(function (s) { io.observe(s); });
  }

  var langBox = $('[data-lang-menu]');
  function closeLang() {
    if (!langBox || !langBox.classList.contains('is-open')) return;
    langBox.classList.remove('is-open'); $('.hd-lang-btn', langBox).setAttribute('aria-expanded', 'false');
  }
  if (langBox) {
    var lb = $('.hd-lang-btn', langBox);
    lb.addEventListener('click', function () {
      var open = !langBox.classList.contains('is-open');
      if (open) { langBox.classList.add('is-open'); lb.setAttribute('aria-expanded', 'true'); W.sfx('pop'); var cur = $('a[aria-current="true"]', langBox); if (cur && !fine) cur.focus(); }
      else closeLang();
    });
    langBox.addEventListener('focusout', function (e) { if (!langBox.contains(e.relatedTarget)) closeLang(); });
  }
  /* language: a static site, so the choice is stored and the page re-renders in the chosen language */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-lang-link]');
    if (!a) return;
    e.preventDefault();
    var l = a.getAttribute('data-lang-link');
    if (l === lang) { closeLang(); return; }
    try { localStorage.setItem('sa-lang', l); } catch (err) { /* ignore */ }
    try { sessionStorage.setItem('sa-boot', '1'); } catch (err) { /* ignore */ }
    location.reload();
  });

  var burger = $('.hd-burger'), mnav = $('#mnav');
  function setMenu(open) {
    if (!hd || !burger || !mnav) return;
    if (open === hd.classList.contains('menu-open')) return;
    hd.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? T.close : T.open);
    if (open) mnav.removeAttribute('inert'); else mnav.setAttribute('inert', '');
    document.body.classList.toggle('no-scroll', open);
    W.sfx(open ? 'whoosh' : 'tap');
  }
  W.setMenu = setMenu;
  if (burger) burger.addEventListener('click', function () { setMenu(!hd.classList.contains('menu-open')); });
  if (mnav) mnav.addEventListener('click', function (e) { if (e.target.closest('[data-mnav-close]') || e.target.closest('a[href]')) setMenu(false); });
  window.addEventListener('resize', function () { if (window.innerWidth > 1240) setMenu(false); });
  document.addEventListener('click', function (e) { if (langBox && !langBox.contains(e.target)) closeLang(); });

  /* ---------- glass optics: specular follows the pointer ---------- */
  if (fine && !reduce) {
    var sRaf = 0, sEv = null, sLast = null;
    var SPEC = '.lg, .hd-bar, .btn-glass, [data-spec]';
    var applySpec = function () {
      sRaf = 0;
      var e = sEv; if (!e || !e.target || !e.target.closest) return;
      var el = e.target.closest(SPEC);
      if (sLast && sLast !== el) { sLast.style.removeProperty('--mx'); sLast.style.removeProperty('--my'); }
      if (el) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
        el.style.setProperty('--rim-a', (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 57.2958 + 90).toFixed(0) + 'deg');
      }
      sLast = el;
    };
    document.addEventListener('pointermove', function (e) { sEv = e; if (!sRaf) sRaf = requestAnimationFrame(applySpec); }, { passive: true });
  }

  /* ---------- Liquid Glass refraction (Chromium: SVG displacement inside backdrop-filter) ---------- */
  var chromium = !!(navigator.userAgentData && navigator.userAgentData.brands && navigator.userAgentData.brands.some(function (b) { return /Chromium/i.test(b.brand); }));
  var defs = null, fid = 0;
  function dispMap(w, h, rad, bezel) {
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    var g = c.getContext('2d'), img = g.createImageData(w, h), d = img.data;
    var hw = w / 2, hh = h / 2, r = Math.min(rad, hw, hh);
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var px = x + 0.5 - hw, py = y + 0.5 - hh, ax = Math.abs(px), ay = Math.abs(py);
        var qx = ax - (hw - r), qy = ay - (hh - r), dist, nx, ny;
        if (qx > 0 && qy > 0) { var l = Math.hypot(qx, qy); dist = r - l; nx = qx / l; ny = qy / l; }
        else if (qx > qy) { dist = r - qx; nx = 1; ny = 0; } else { dist = r - qy; nx = 0; ny = 1; }
        nx *= px < 0 ? -1 : 1; ny *= py < 0 ? -1 : 1;
        var k = dist < bezel ? Math.pow(1 - Math.max(0, dist) / bezel, 2.2) : 0;
        var i = (y * w + x) * 4;
        d[i] = 128 - nx * k * 127; d[i + 1] = 128 - ny * k * 127; d[i + 2] = 128; d[i + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    return c.toDataURL();
  }
  function refract(el, prop, opt) {
    if (!chromium || reduceT || !el) return;
    opt = opt || {};
    if (!defs) {
      defs = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      defs.setAttribute('aria-hidden', 'true'); defs.setAttribute('width', '0'); defs.setAttribute('height', '0');
      defs.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
      document.body.appendChild(defs);
    }
    var id = 'lgf' + (++fid), last = '';
    var run = function () {
      var r = el.getBoundingClientRect(), w = Math.round(r.width), h = Math.round(r.height);
      if (w < 8 || h < 8) return;
      var key = w + 'x' + h; if (key === last) return; last = key;
      var rad = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 20;
      var sw = Math.min(w, 640), sh = Math.round(h * sw / w);
      var url = dispMap(sw, sh, rad * sw / w, (opt.bezel || 14) * sw / w);
      var f = document.getElementById(id);
      if (!f) {
        f = document.createElementNS('http://www.w3.org/2000/svg', 'filter'); f.id = id;
        f.setAttribute('color-interpolation-filters', 'sRGB');
        f.innerHTML = '<feImage result="m" preserveAspectRatio="none"/><feDisplacementMap in="SourceGraphic" in2="m" xChannelSelector="R" yChannelSelector="G"/>';
        defs.appendChild(f);
      }
      f.setAttribute('x', '0'); f.setAttribute('y', '0'); f.setAttribute('width', w); f.setAttribute('height', h); f.setAttribute('filterUnits', 'userSpaceOnUse');
      var im = f.firstChild; im.setAttribute('href', url); im.setAttribute('x', '0'); im.setAttribute('y', '0'); im.setAttribute('width', w); im.setAttribute('height', h);
      f.lastChild.setAttribute('scale', String(opt.scale || 26));
      el.style.setProperty(prop, 'url(#' + id + ')');
    };
    run();
    if (window.ResizeObserver) new ResizeObserver(function () { clearTimeout(el._rt); el._rt = setTimeout(run, 120); }).observe(el);
  }
  W.refract = refract;
  if (hd) refract($('.hd-bar', hd), '--hd-refract', { scale: 22, bezel: 16 });

  /* ---------- modals ---------- */
  var lastFocus = null, openBg = null, lockY = 0;
  function focusables(box) { return $$('a[href], button:not([disabled]), input:not([disabled]):not(.hp), select, textarea, [tabindex]:not([tabindex="-1"])', box).filter(function (x) { return x.offsetParent !== null; }); }
  function openModal(id, opener) {
    var bg = document.getElementById('m-' + id);
    if (!bg) return false;
    setMenu(false); closeLang();
    if (openBg && openBg !== bg) closeModals(true);
    lastFocus = opener || document.activeElement;
    bg.hidden = false; openBg = bg;
    requestAnimationFrame(function () { bg.classList.add('is-in'); });
    if (!document.body.classList.contains('no-scroll')) lockY = window.scrollY;
    document.body.classList.add('no-scroll');
    var first = $('[data-autofocus]', bg) || focusables($('.modal', bg))[1] || $('.modal', bg);
    setTimeout(function () { if (first && first.focus) first.focus({ preventScroll: true }); }, 80);
    W.sfx('pop');
    document.dispatchEvent(new CustomEvent('w2w:modal-open', { detail: { id: id } }));
    return true;
  }
  function closeModals(keepFocus) {
    if (!openBg) return;
    var bg = openBg; openBg = null;
    bg.classList.remove('is-in');
    var id = bg.id.replace(/^m-/, '');
    setTimeout(function () { if (!bg.classList.contains('is-in')) bg.hidden = true; }, 260);
    document.body.classList.remove('no-scroll');
    if (!keepFocus && Math.abs(window.scrollY - lockY) > 2) { root.style.scrollBehavior = 'auto'; window.scrollTo(0, lockY); root.style.scrollBehavior = ''; }
    if (!keepFocus && lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    document.dispatchEvent(new CustomEvent('w2w:modal-close', { detail: { id: id } }));
  }
  W.openModal = openModal; W.closeModals = closeModals;
  document.addEventListener('click', function (e) {
    var opener = e.target.closest('[data-modal]');
    if (opener) { e.preventDefault(); openModal(opener.getAttribute('data-modal'), opener); return; }
    if (e.target.closest('[data-close]')) { closeModals(); return; }
    if (e.target.classList && e.target.classList.contains('modal-bg')) closeModals();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (openBg) { closeModals(); return; }
      if (langBox && langBox.classList.contains('is-open')) { closeLang(); $('.hd-lang-btn', langBox).focus(); return; }
      setMenu(false);
    }
    if (e.key === 'Tab' && openBg) {
      var f = focusables($('.modal', openBg)); if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- on-screen keyboard: the field being filled stays in sight (iOS Safari) ---------- */
  var EDIT = 'input:not([type=range]):not([type=checkbox]):not([type=radio]):not([type=button]):not([type=submit]):not(.hp), textarea, select';
  var kbOpen = false, kbT = 0;
  function editing() { var a = document.activeElement; return a && a.matches && a.matches(EDIT) ? a : null; }
  function headerBottom() { var bar = hd && $('.hd-bar', hd); var r = bar && bar.getBoundingClientRect(); return r && r.bottom > 0 ? r.bottom + 8 : 8; }
  function revealField(el) {
    var vv = window.visualViewport;
    var top = 0, bottom = vv ? vv.height : window.innerHeight;
    var box = el.closest('.modal');
    var r = el.getBoundingClientRect(), off = vv ? vv.offsetTop : 0;
    var rTop = r.top - off, rBot = r.bottom - off;
    if (box && openBg && box.scrollHeight > box.clientHeight + 1) {
      var b = box.getBoundingClientRect();
      top = Math.max(top, b.top - off); bottom = Math.min(bottom, b.bottom - off);
      if (rTop < top + 12 || rBot > bottom - 12) box.scrollTop += (rTop + rBot) / 2 - (top + bottom) / 2;
      return;
    }
    if (openBg) return;
    top = headerBottom();
    if (rTop < top || rBot > bottom - 12) window.scrollBy({ top: Math.round((rTop + rBot) / 2 - (top + bottom) / 2), behavior: 'auto' });
  }
  function kbSync() {
    var vv = window.visualViewport;
    if (!vv) return;
    var full = Math.max(window.innerHeight, root.clientHeight);
    var el = editing();
    var open = !!el && full - vv.height > 120;
    if (open) { root.style.setProperty('--vv-top', Math.max(0, vv.offsetTop).toFixed(0) + 'px'); root.style.setProperty('--vv-h', vv.height.toFixed(0) + 'px'); }
    if (open !== kbOpen) { kbOpen = open; root.classList.toggle('kb-open', open); }
    if (el && (open || full - vv.height > 120 || openBg)) { clearTimeout(kbT); kbT = setTimeout(function () { if (editing() === el) revealField(el); }, 60); }
  }
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', kbSync);
    window.visualViewport.addEventListener('scroll', kbSync);
    document.addEventListener('focusin', function (e) { if (!e.target.matches || !e.target.matches(EDIT)) return; kbSync(); setTimeout(kbSync, 320); setTimeout(kbSync, 650); });
    document.addEventListener('focusout', function () { setTimeout(kbSync, 80); });
  }

  /* ---------- segmented controls: sliding thumb ---------- */
  function placeThumb(seg, instant) {
    var thumb = $('.seg-thumb', seg), on = $('[aria-checked="true"], [aria-selected="true"], [aria-pressed="true"]', seg);
    if (!thumb || !on) return;
    if (instant) thumb.style.transition = 'none';
    thumb.style.width = on.offsetWidth + 'px';
    thumb.style.height = on.offsetHeight + 'px'; thumb.style.bottom = 'auto';
    thumb.style.transform = 'translate(' + (on.offsetLeft - 3) + 'px,' + (on.offsetTop - 3) + 'px)';
    if (instant) { void thumb.offsetWidth; thumb.style.transition = ''; }
  }
  W.placeThumb = placeThumb;
  var segs = $$('.segmented');
  segs.forEach(function (s) { placeThumb(s, true); });
  window.addEventListener('resize', function () { segs.forEach(function (s) { placeThumb(s, true); }); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { segs.forEach(function (s) { placeThumb(s, true); }); });

  /* ---------- clocks ---------- */
  var clocks = $$('[data-tz]');
  function tick() {
    var now = new Date();
    clocks.forEach(function (el) { try { el.textContent = new Intl.DateTimeFormat(T.locale, { hour: '2-digit', minute: '2-digit', timeZone: el.getAttribute('data-tz') }).format(now); } catch (err) { el.textContent = ''; } });
  }
  if (clocks.length) { tick(); setInterval(tick, 20000); }
  /* opening hours: 09:00–19:00 Tashkent, every day */
  var openEl = $('[data-open-now]');
  if (openEl) {
    try {
      var h = +new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hour12: false, timeZone: 'Asia/Tashkent' }).format(new Date());
      var isOpen = h >= 9 && h < 19;
      openEl.textContent = openEl.getAttribute(isOpen ? 'data-open-yes' : 'data-open-no');
      openEl.classList.toggle('is-closed', !isOpen);
    } catch (err) { /* ignore */ }
  }

  /* ---------- copy buttons ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-copy]'); if (!b) return;
    var txt = b.getAttribute('data-copy');
    if (navigator.clipboard) navigator.clipboard.writeText(txt).then(function () { W.toast(T.copied); }, function () {});
  });

  /* ---------- tilt (desktop) ---------- */
  if (fine && animate) {
    $$('[data-tilt]').forEach(function (card) {
      var k = parseFloat(card.getAttribute('data-tilt')) || 5;
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        window.gsap.to(card, { rotateY: x * k, rotateX: -y * k, transformPerspective: 1000, duration: 0.6, ease: 'power3.out' });
      });
      card.addEventListener('pointerleave', function () { window.gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.9, ease: 'elastic.out(1, 0.5)' }); });
    });
  }

  /* ---------- text splitting helper ---------- */
  function splitWords(el) {
    if (el.dataset.splitDone) return $$('.w', el);
    var walk = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/([ \t\n]+)/).forEach(function (part) {
            if (!part) return;
            if (/^[ \t\n]+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var s = document.createElement('span'); s.className = 'w'; s.textContent = part; frag.appendChild(s);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR' && !n.classList.contains('w')) walk(n);
      });
    };
    walk(el);
    el.dataset.splitDone = '1'; el.classList.add('is-split');
    return $$('.w', el);
  }
  W.splitWords = splitWords;

  /* ---------- reveals & intros ---------- */
  function initMotion() {
    if (!animate) { $$('[data-count]').forEach(function (el) { el.textContent = (el.getAttribute('data-prefix') || '') + el.getAttribute('data-count') + (el.getAttribute('data-suffix') || ''); }); return; }
    var gsap = window.gsap, ST = window.ScrollTrigger;
    gsap.defaults({ ease: 'expo.out', duration: 1 });

    if ($$('[data-reveal]').length) ST.batch($$('[data-reveal]'), { start: 'top 88%', once: true, onEnter: function (b) { gsap.to(b, { opacity: 1, y: 0, duration: 1.1, stagger: 0.08, overwrite: true }); } });

    var auto = $$('.tile, .pcard, .figures > div, .flow > div, .two-lists > div, .panel, .faq, .contact-group, .cx-step, .cx-card')
      .filter(function (el) { return !el.closest('[data-reveal]') && !el.hasAttribute('data-reveal') && !el.closest('.modal-bg') && !el.closest('[data-no-auto]'); });
    if (auto.length) {
      gsap.set(auto, { opacity: 0, y: 40 });
      ST.batch(auto, { start: 'top 92%', once: true, onEnter: function (b) { gsap.to(b, { opacity: 1, y: 0, duration: 1.1, stagger: 0.07, overwrite: true, clearProps: 'transform' }); } });
    }

    $$('.section .h2, .rqs-title, .st-title').filter(function (hh) { return !hh.closest('[data-reveal]') && !hh.hasAttribute('data-reveal') && !hh.closest('[data-no-auto]'); }).forEach(function (hh) {
      var ws = splitWords(hh);
      gsap.set(ws, { opacity: 0, y: '0.3em', filter: 'blur(8px)' });
      gsap.to(ws, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, stagger: 0.04, scrollTrigger: { trigger: hh, start: 'top 88%', once: true } });
    });

    $$('[data-count]').forEach(function (el) {
      var to = +el.getAttribute('data-count'), from = el.hasAttribute('data-from') ? +el.getAttribute('data-from') : 0;
      var pre = el.getAttribute('data-prefix') || '', suf = el.getAttribute('data-suffix') || '', o = { v: from };
      el.textContent = pre + W.fmt(from) + suf;
      gsap.to(o, { v: to, duration: 2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true }, onUpdate: function () { el.textContent = pre + W.fmt(o.v) + suf; } });
    });

    window.addEventListener('load', function () { ST.refresh(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ST.refresh(); });
  }

  W.refreshZones();
  applyTheme(W.theme(), true);
  W.ready.then(initMotion);
})();
