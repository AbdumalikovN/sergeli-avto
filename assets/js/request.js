/* Sergeli Avto — multi-step request form (.rq), ported from w2w.uz/assets/js/request.js:
   contacts → details (optional) → done, live % progress, step transitions (blur-slide), confetti check.
   No form endpoint: the prepared message is copied to the clipboard and handed to a call / Instagram DM. */
(function () {
  'use strict';
  var W = window.W2W || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var lang = (document.documentElement.getAttribute('lang') || 'uz').slice(0, 2);
  var D = {
    uz: { err1: 'Bog‘lanishimiz uchun ism va telefonni to‘ldiring.', errPhone: 'Telefon raqamini tekshiring.', title: 'Sergeli Avto saytidan ariza', name: 'Ism', phone: 'Telefon', model: 'Model', down: 'Bosh to‘lov', monthly: 'Oylik', note: 'Izoh', page: 'Sahifa', copied: 'Xabar nusxalandi — DM’ga joylashtiring' },
    ru: { err1: 'Заполните имя и телефон, чтобы мы могли связаться с вами.', errPhone: 'Проверьте номер телефона.', title: 'Заявка с сайта Sergeli Avto', name: 'Имя', phone: 'Телефон', model: 'Модель', down: 'Первый взнос', monthly: 'В месяц', note: 'Комментарий', page: 'Страница', copied: 'Сообщение скопировано — вставьте в DM' }
  };
  var T = D[lang] || D.uz;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var sfx = function (n) { if (window.W2WSound) window.W2WSound.play(n); };

  function init(form) {
    var stage = $('[data-rq-stage]', form);
    var steps = $$('.rq-step', form);
    var fill = $('[data-rq-fill]', form), pctEl = $('[data-rq-pct]', form), meter = $('.rq-meter', form);
    var dots = $$('.rq-steps li', form);
    var count = $('[data-rq-count]', form), task = form.elements.task;
    var state = { step: 1, model: '', down: '', monthly: '', pct: 0, shown: 0 };

    function calc() {
      var p = 0;
      ['name', 'phone'].forEach(function (n) { if (valid(n)) p += 30; });
      if (task && task.value.trim().length > 3) p += 10;
      if (state.model) p += 15;
      if (state.down) p += 15;
      if (state.step === 3) p = 100;
      return p;
    }
    function paint() {
      var p = calc();
      state.pct = p;
      if (fill) fill.style.transform = 'scaleX(' + (p / 100) + ')';
      if (meter) meter.setAttribute('aria-valuenow', String(p));
      var from = state.shown, t0 = performance.now();
      var run = function (now) {
        var k = Math.min(1, (now - t0) / 450); k = 1 - Math.pow(1 - k, 3);
        var v = Math.round(from + (p - from) * k);
        if (pctEl) pctEl.textContent = v + '%';
        if (k < 1) requestAnimationFrame(run); else state.shown = p;
      };
      if (reduce) { if (pctEl) pctEl.textContent = p + '%'; state.shown = p; } else requestAnimationFrame(run);
    }
    function valid(n) {
      var el = form.elements[n]; if (!el) return false;
      var v = el.value.trim();
      if (n === 'phone') return v.replace(/\D/g, '').length >= 7;
      return v.length >= 2;
    }
    ['name', 'phone'].forEach(function (n) {
      var el = form.elements[n]; if (!el) return;
      el.addEventListener('input', function () {
        var ok = valid(n);
        el.closest('.rq-field').classList.toggle('is-ok', ok);
        if (ok) el.closest('.rq-field').classList.remove('is-invalid');
        paint();
      });
      el.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); next(); } });
    });
    if (task) task.addEventListener('input', function () { if (count) count.textContent = task.value.length + ' / 400'; paint(); });

    function show(n, dir) {
      var cur = steps[state.step - 1], nxt = steps[n - 1];
      state.step = n;
      dots.forEach(function (d, i) { d.classList.toggle('is-on', i < n); d.classList.toggle('is-cur', i === n - 1); });
      form.classList.toggle('is-done', n === 3);
      paint();
      if (cur === nxt) return;
      var h0 = stage.offsetHeight;
      if (reduce || !window.gsap) { cur.hidden = true; nxt.hidden = false; focusStep(nxt); return; }
      var g = window.gsap;
      g.to(cur, { x: -40 * dir, opacity: 0, filter: 'blur(8px)', duration: 0.28, ease: 'power2.in', onComplete: function () {
        cur.hidden = true; g.set(cur, { clearProps: 'all' });
        nxt.hidden = false;
        var h1 = nxt.offsetHeight;
        g.fromTo(stage, { height: h0 }, { height: h1, duration: 0.45, ease: 'expo.out', clearProps: 'height' });
        g.fromTo(nxt, { x: 40 * dir, opacity: 0, filter: 'blur(8px)' }, { x: 0, opacity: 1, filter: 'blur(0px)', duration: 0.55, ease: 'expo.out', clearProps: 'all' });
        g.fromTo($$('.rq-field, .rq-group, .rq-actions, .rq-check, .rq-done-title, .rq-done-text, .rq-msg', nxt), { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: 'expo.out', delay: 0.05, clearProps: 'all' });
        focusStep(nxt);
      } });
    }
    function focusStep(el) {
      var f = el.getAttribute('tabindex') === '-1' ? el : $('input:not(.hp), textarea, button', el);
      if (f) setTimeout(function () { f.focus({ preventScroll: true }); }, 60);
    }
    function shake(el) { el.classList.remove('is-shake'); void el.offsetWidth; el.classList.add('is-shake'); }
    function next() {
      var bad = ['name', 'phone'].filter(function (n) { return !valid(n); });
      var err = $('[data-rq-error]', form);
      if (bad.length) {
        bad.forEach(function (n) { var f = form.elements[n].closest('.rq-field'); f.classList.add('is-invalid'); shake(f); });
        if (err) { err.textContent = bad.length === 1 && bad[0] === 'phone' && form.elements.phone.value.trim() ? T.errPhone : T.err1; err.hidden = false; }
        form.elements[bad[0]].focus();
        sfx('error');
        return;
      }
      if (err) err.hidden = true;
      sfx('whoosh');
      show(2, 1);
    }
    $('[data-rq-next]', form).addEventListener('click', next);
    var back = $('[data-rq-back]', form); if (back) back.addEventListener('click', function () { show(1, -1); });
    var skip = $('[data-rq-skip]', form); if (skip) skip.addEventListener('click', function () { submit(true); });
    var again = $('[data-rq-again]', form); if (again) again.addEventListener('click', function () {
      form.reset(); state.model = ''; state.down = ''; state.monthly = '';
      $$('.chip', form).forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
      $$('.rq-field', form).forEach(function (f) { f.classList.remove('is-ok', 'is-invalid'); });
      show(1, -1);
    });

    /* model & down payment: single-choice chip groups */
    function pick(group, v) {
      $$('.chip', group).forEach(function (c) { c.setAttribute('aria-pressed', String(c.getAttribute('data-v') === v)); });
    }
    var gModel = $('[data-rq-models]', form), gDown = $('[data-rq-down]', form);
    if (gModel) gModel.addEventListener('click', function (e) { var c = e.target.closest('.chip'); if (!c) return; var v = c.getAttribute('data-v'); state.model = state.model === v ? '' : v; pick(gModel, state.model); paint(); });
    if (gDown) gDown.addEventListener('click', function (e) { var c = e.target.closest('.chip'); if (!c) return; var v = c.getAttribute('data-v'); state.down = state.down === v ? '' : v; pick(gDown, state.down); paint(); });

    function confetti() {
      if (reduce) return;
      var box = $('.rq-check', form); if (!box) return;
      for (var i = 0; i < 22; i++) {
        var s = document.createElement('i'); s.className = 'rq-spark';
        var a = Math.random() * Math.PI * 2, d = 60 + Math.random() * 90;
        s.style.setProperty('--dx', (Math.cos(a) * d).toFixed(0) + 'px'); s.style.setProperty('--dy', (Math.sin(a) * d).toFixed(0) + 'px');
        s.style.setProperty('--c', ['#e3112a', '#ffb020', '#ff5a3c', '#ffffff'][i % 4]);
        s.style.animationDelay = (Math.random() * 0.12).toFixed(2) + 's';
        box.appendChild(s);
        setTimeout(function (el) { return function () { el.remove(); }; }(s), 1400);
      }
    }
    function message(data) {
      var rows = [[T.name, data.name], [T.phone, data.phone], [T.model, data.model], [T.down, data.down], [T.monthly, data.monthly], [T.note, data.task]];
      return T.title + '\n' + rows.filter(function (r) { return r[1]; }).map(function (r) { return r[0] + ': ' + r[1]; }).join('\n') + '\n' + T.page + ': sergeliauto.uz';
    }
    function submit(skipped) {
      if (form.classList.contains('is-sending')) return;
      if (form.elements.website && form.elements.website.value) return;
      var data = {
        name: form.elements.name.value.trim(), phone: form.elements.phone.value.trim(),
        model: skipped ? '' : state.model, down: skipped ? '' : state.down, monthly: skipped ? '' : state.monthly,
        task: skipped ? '' : (task ? task.value.trim() : '')
      };
      var text = message(data);
      form.classList.add('is-sending');
      var msgEl = $('[data-rq-msg]', form); if (msgEl) msgEl.textContent = text;
      var copied = $('[data-rq-copied]', form);
      var done = function () {
        form.classList.remove('is-sending');
        show(3, 1); sfx('success'); setTimeout(confetti, 380);
        document.dispatchEvent(new CustomEvent('w2w:request-sent', { detail: data }));
      };
      var finishCopy = function (ok) { if (copied) copied.hidden = !ok; if (ok && W.toast) W.toast(T.copied); done(); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { finishCopy(true); }, function () { finishCopy(false); });
      else finishCopy(false);
      $$('[data-copy-msg]', form).forEach(function (b) { b.setAttribute('data-copy', text); });
    }
    form.addEventListener('submit', function (e) { e.preventDefault(); if (state.step === 1) next(); else submit(false); });

    /* prefill from the calculator */
    document.addEventListener('w2w:prefill', function (e) {
      var d = e.detail || {};
      if (d.model && gModel) { state.model = d.model; pick(gModel, d.model); }
      if (d.down && gDown) { state.down = d.down; pick(gDown, d.down); }
      if (d.monthly) state.monthly = d.monthly;
      if (task && d.task) { task.value = d.task.slice(0, 400); task.dispatchEvent(new Event('input')); }
      paint();
    });
    paint();
  }
  $$('form[data-rq]').forEach(init);
})();
