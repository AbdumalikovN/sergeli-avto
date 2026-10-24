/* Sergeli Avto — home sections, ported from w2w.uz (brain-hero.js intro, home.js statement scene, calc.js configurator):
   hero intro (blur-reveal words), marquee pause control, scatter → assemble scene, installment configurator, mobile bar. */
(function () {
  'use strict';
  var W2W = window.W2W || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lang = (document.documentElement.getAttribute('lang') || 'uz').slice(0, 2);
  var ready = W2W.ready || Promise.resolve();
  var sfx = function (n) { if (W2W.sfx) W2W.sfx(n); };
  var fmt = W2W.fmt || function (n) { return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '); };
  var T = ({
    uz: { sum: 'so‘m', mo: 'oy', ask: 'Narxini so‘rang', askHint: 'Labo bo‘yicha shartlar so‘rov bo‘yicha: banksiz, 0%, jarimalarsiz.', task: 'Kalkulyatordan: {m}, bosh to‘lov {d}% ({dv} so‘m), oyiga {mv} so‘m, {n} oy.', bonus: 'ta bonus', pause: 'To‘xtatish', play: 'Davom ettirish' },
    ru: { sum: 'сум', mo: 'мес.', ask: 'Узнать цену', askHint: 'Условия по Labo — по запросу: без банка, 0%, без штрафов.', task: 'Из калькулятора: {m}, первый взнос {d}% ({dv} сум), {mv} сум в месяц, {n} мес.', bonus: 'бонусов', pause: 'Пауза', play: 'Продолжить' }
  })[lang] || {};

  /* ---------- installment plans: the published Sergeli Avto terms (bonuses included) ---------- */
  var PLANS = {
    damas: { name: 'Chevrolet Damas', months: 30, bonuses: 5, downs: { 30: [33400000, 2261000], 40: [41900000, 1939000], 50: [52900000, 1617000], 60: [61300000, 1293000] } },
    cobaltStyle: { name: 'Chevrolet Cobalt Style MCM', months: 24, bonuses: 10, downs: { 50: [82500000, 3252000] } },
    cobaltMidnight: { name: 'Chevrolet Cobalt Midnight MCM', months: 24, bonuses: 10, downs: { 50: [87000000, 3441000] } },
    labo: { name: 'Chevrolet Labo', ask: true }
  };
  W2W.PLANS = PLANS;

  ready.then(function () {
    var g = window.gsap, ST = window.ScrollTrigger, anim = !!(g && ST && W2W.animate);

    /* ---------- hero intro: words reveal from blur, then the rest ---------- */
    var hero = $('[data-hh]');
    if (hero) {
      var copy = $('[data-hh-copy]', hero), stage = $('[data-hh-stage]', hero), title = $('.hh-title', hero);
      if (anim) {
        var words = W2W.splitWords ? W2W.splitWords(title) : [title];
        g.set(words, { opacity: 0, y: '0.4em', filter: 'blur(12px)' });
        var rest = [$('.hh-lead', copy), $('.hh-cta', copy), $('.hh-meta', copy)].filter(Boolean);
        g.set([$('.hh-pill', copy)].concat(rest), { y: 18 });
        var tl = g.timeline({ defaults: { ease: 'expo.out' } });
        tl.to($('.hh-pill', copy), { opacity: 1, y: 0, duration: 0.9 }, 0)
          .to(words, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.1, stagger: 0.08 }, 0.1)
          .to(rest, { opacity: 1, y: 0, duration: 1, stagger: 0.1 }, 0.45)
          .fromTo(stage, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 1.6 }, 0.25)
          .fromTo($$('.hh-card, .hh-status', stage), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.12 }, 0.9);
        if (window.innerWidth > 1000) {
          g.to(copy, { y: -80, opacity: 0.25, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
          g.to(stage, { y: 60, scale: 1.04, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
        }
      }
    }

    /* ---------- marquee: pause control (WCAG 2.2.2) ---------- */
    var lgRows = $('.lg-rows'), lgBtn = $('[data-lg-pause]');
    if (lgRows && lgBtn) {
      lgBtn.addEventListener('click', function () {
        var on = lgRows.classList.toggle('is-paused');
        lgBtn.setAttribute('aria-pressed', String(on));
        $('span', lgBtn).textContent = on ? T.play : T.pause;
        sfx('tick');
      });
    }

    /* ---------- statement: bank paperwork → one passport ---------- */
    var st = $('[data-st]');
    if (st) {
      var cards = $$('.st-card', st), brain = $('.st-brain', st), nEl = $('[data-st-n]', st);
      if (anim) {
        cards.forEach(function (c) {
          var cs = getComputedStyle(c);
          g.set(c, { xPercent: -50, yPercent: -50, x: parseFloat(cs.getPropertyValue('--x')) || 0, y: parseFloat(cs.getPropertyValue('--y')) || 0, rotation: parseFloat(cs.getPropertyValue('--r')) || 0 });
        });
        g.set(brain, { opacity: 0, scale: 0.55, filter: 'blur(10px)' });
        var build = function (tl) {
          tl.to(cards, { x: function (i) { return '+=' + ((i % 2 ? -1 : 1) * 18); }, y: function (i) { return '+=' + ((i % 3 - 1) * 12); }, rotation: function (i) { return '+=' + (i % 2 ? 5 : -5); }, duration: 0.3, ease: 'sine.inOut' }, 0)
            .to(cards, { x: 0, y: 0, rotation: 0, scale: 0.35, opacity: 0, filter: 'blur(6px)', duration: 0.45, stagger: 0.035, ease: 'power3.in' }, 0.3)
            .to(brain, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.4, ease: 'back.out(1.4)' }, 0.72)
            .fromTo({ n: 8 }, { n: 8 }, { n: 0, duration: 0.45, ease: 'none', onUpdate: function () { if (nEl) nEl.textContent = Math.round(this.targets()[0].n); } }, 0.3);
          return tl;
        };
        var mm = g.matchMedia();
        mm.add('(min-width: 1001px)', function () {
          var stPin = $('[data-st-pin]', st);
          build(g.timeline({ scrollTrigger: { trigger: stPin, start: function () { return stPin.offsetHeight > window.innerHeight ? 'top top' : 'center center'; }, end: '+=110%', pin: true, scrub: 0.7, anticipatePin: 1, invalidateOnRefresh: true } }));
        });
        mm.add('(max-width: 1000px)', function () {
          var tl = build(g.timeline({ paused: true, defaults: { ease: 'power2.inOut' } }));
          tl.timeScale(0.45);
          ST.create({ trigger: $('.st-scene', st), start: 'top 70%', once: true, onEnter: function () { tl.play(); } });
        });
      } else {
        /* reduced motion / no GSAP: the assembled state, cards hidden */
        cards.forEach(function (c) { c.style.opacity = '0'; });
        if (nEl) nEl.textContent = '0';
      }
    }

    /* ---------- configurator ---------- */
    var cx = $('[data-cx]');
    if (cx) {
      var state = { model: 'damas', down: 30 }, shown = 0;
      var out = function (k) { return $('[data-out="' + k + '"]', cx); };
      var card = $('.cx-card', cx), askBox = $('[data-cx-ask]', cx), sumBox = $('[data-cx-sum]', cx);
      var bar = $('[data-cx-bar]'), barOut = bar && $('[data-out="bar"]', bar);
      var downSeg = $('[data-group="down"]', cx);
      function sync() {
        $$('[data-group="model"] [data-value]', cx).forEach(function (b) { b.setAttribute('aria-checked', String(b.getAttribute('data-value') === state.model)); });
        var plan = PLANS[state.model];
        $$('[data-value]', downSeg).forEach(function (b) {
          var v = +b.getAttribute('data-value'), ok = !plan.ask && !!plan.downs[v];
          b.disabled = !ok; b.setAttribute('aria-checked', String(v === state.down && ok));
        });
        if (W2W.placeThumb) W2W.placeThumb(downSeg);
      }
      function tween(el, to, suffix) {
        if (!el) return;
        var from = shown;
        if (reduce || !window.gsap || !from) { el.textContent = fmt(to); return; }
        var o = { v: from };
        window.gsap.to(o, { v: to, duration: 0.7, ease: 'expo.out', overwrite: true, onUpdate: function () { el.textContent = fmt(o.v); } });
      }
      function render() {
        var plan = PLANS[state.model];
        if (plan.ask) {
          if (askBox) askBox.hidden = false; if (sumBox) sumBox.hidden = true;
          if (barOut) barOut.textContent = T.ask;
          $('[data-out="down-val"]', cx).textContent = '—';
          return;
        }
        if (askBox) askBox.hidden = true; if (sumBox) sumBox.hidden = false;
        if (!plan.downs[state.down]) state.down = +Object.keys(plan.downs)[0];
        var d = plan.downs[state.down], down = d[0], monthly = d[1], total = down + monthly * plan.months;
        tween(out('monthly'), monthly); shown = monthly;
        out('down').textContent = fmt(down) + ' ' + T.sum;
        out('term').textContent = plan.months + ' ' + T.mo;
        out('total').textContent = fmt(total) + ' ' + T.sum;
        out('bonus').textContent = plan.bonuses + ' ' + T.bonus;
        out('model').textContent = plan.name;
        $('[data-out="down-val"]', cx).textContent = state.down + '%';
        $('[data-cx-meter]', cx).style.transform = 'scaleX(' + (down / total).toFixed(3) + ')';
        if (barOut) barOut.textContent = fmt(monthly) + ' ' + T.sum;
        if (card) { card.classList.remove('is-bump'); void card.offsetWidth; card.classList.add('is-bump'); }
        sync();
      }
      cx.addEventListener('click', function (e) {
        var b = e.target.closest('[data-value]'); if (!b || b.disabled) return;
        var grp = b.closest('[data-group]').getAttribute('data-group');
        if (grp === 'model') state.model = b.getAttribute('data-value'); else state.down = +b.getAttribute('data-value');
        sfx('tick'); render();
      });
      /* keyboard for radio groups */
      $$('[role="radiogroup"]', cx).forEach(function (grp) {
        grp.addEventListener('keydown', function (e) {
          var d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]; if (!d) return;
          var items = $$('[role="radio"]:not([disabled])', grp), i = items.indexOf(document.activeElement); if (i < 0) return;
          e.preventDefault(); var n = items[(i + d + items.length) % items.length]; n.focus(); n.click();
        });
      });
      /* model cards elsewhere on the page pre-select a plan */
      document.addEventListener('click', function (e) {
        var a = e.target.closest('[data-cx-pick]'); if (!a) return;
        state.model = a.getAttribute('data-cx-pick'); render();
      });
      /* hand the terms to the request form */
      $$('[data-cx-apply]', cx.parentNode).concat(bar ? $$('[data-cx-apply]', bar) : []).forEach(function (b) {
        b.addEventListener('click', function () {
          var plan = PLANS[state.model], d = plan.ask ? null : plan.downs[state.down];
          var detail = { model: plan.name, down: d ? state.down + '%' : '', monthly: d ? fmt(d[1]) + ' ' + T.sum : '' };
          detail.task = d ? T.task.replace('{m}', plan.name).replace('{d}', state.down).replace('{dv}', fmt(d[0])).replace('{mv}', fmt(d[1])).replace('{n}', plan.months) : plan.name + ' — ' + T.ask;
          document.dispatchEvent(new CustomEvent('w2w:prefill', { detail: detail }));
          if (W2W.openModal) W2W.openModal('request', b);
        });
      });
      sync(); render();
      /* mobile bar follows the calculator */
      if (bar && 'IntersectionObserver' in window) {
        new IntersectionObserver(function (en) { bar.classList.toggle('is-on', en[en.length - 1].isIntersecting); }, { threshold: 0.05 }).observe(cx);
      }
      document.addEventListener('w2w:modal-open', function () { if (bar) bar.classList.remove('is-on'); });
    }
  });
})();
