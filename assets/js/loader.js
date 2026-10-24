/* Sergeli Avto — boot loader, ported from w2w.uz/assets/js/loader.js.
   Once per browser session (sessionStorage 'sa-boot'), ≈5 s, 0–100 %.
   Particles stream in from the edges → spell «0%» → assemble into the SA mark → portal reveal.
   Progress keyframes, HUD log, ring/ticks, exit mask and the calm reduced-motion version are the w2w originals. */
(function () {
  'use strict';
  var h = document.documentElement;
  var el = document.getElementById('boot');
  var resolveBoot;
  window.W2WBootReady = new Promise(function (r) { resolveBoot = r; });
  function bootDone() { if (resolveBoot) { resolveBoot(); resolveBoot = null; } }
  if (!el) { bootDone(); return; }
  if (!h.classList.contains('boot')) { el.parentNode.removeChild(el); bootDone(); return; }
  try { sessionStorage.setItem('sa-boot', '1'); } catch (e) { /* private mode */ }

  var lang = (h.getAttribute('lang') || 'uz').slice(0, 2);
  var DICT = {
    uz: ['Sergeli Avto ishga tushmoqda', 'Modellar yuklanmoqda: Damas · Cobalt · Labo', 'Rassrochka shartlari tekshirilmoqda: 0% · banksiz', 'Bonuslar ro‘yxati tayyorlanmoqda', 'Hujjatlar: 1 pasport — yetarli', 'Yetkazib berish: 12 viloyat', 'Kalit tayyor'],
    ru: ['Запускаем Sergeli Avto', 'Загружаем модели: Damas · Cobalt · Labo', 'Проверяем условия рассрочки: 0% · без банка', 'Готовим список бонусов', 'Документы: 1 паспорт — достаточно', 'Доставка: 12 областей', 'Ключи готовы']
  };
  var LOG = DICT[lang] || DICT.uz;
  var LOG_AT = [0, 10, 26, 45, 62, 78, 97];

  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cv = el.querySelector('canvas');
  var ctx = cv && cv.getContext ? cv.getContext('2d') : null;
  var numEl = el.querySelector('[data-boot-num]');
  var barEl = el.querySelector('[data-boot-bar]');
  var logEl = el.querySelector('[data-boot-log]');
  var stat = {};
  Array.prototype.forEach.call(el.querySelectorAll('[data-boot-stat]'), function (s) { stat[s.getAttribute('data-boot-stat')] = s; });
  var skipBtn = el.querySelector('[data-boot-skip]');

  var W = 0, H = 0, DPR = Math.min(2, window.devicePixelRatio || 1);
  var small = Math.min(window.innerWidth, window.innerHeight) < 640;
  var N = small ? 1100 : 2000;
  var P = [];
  var t0 = performance.now(), prog = 0, logged = 0, exiting = false, exitStart = 0, finished = false, skip = false;
  var fmt = function (n) { return String(Math.floor(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); };
  var clamp = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var eOut = function (t) { return 1 - Math.pow(1 - t, 3); };
  var eIO = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };

  /* progress keyframes: [seconds, percent] — plateaus make it feel like real work */
  var KF = [[0, 0], [0.35, 4], [0.9, 17], [1.35, 24], [1.75, 38], [2.25, 49], [2.7, 57], [3.2, 70], [3.6, 79], [4.05, 90], [4.4, 96], [4.7, 100]];
  function timeline(t) {
    if (t >= KF[KF.length - 1][0]) return 100;
    for (var i = 1; i < KF.length; i++) {
      if (t < KF[i][0]) { var a = KF[i - 1], b = KF[i], k = (t - a[0]) / (b[0] - a[0]); k = k * k * (3 - 2 * k); return a[1] + (b[1] - a[1]) * k; }
    }
    return 100;
  }
  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    if (!cv) return;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
  }

  /* ---------- geometry: sample text from an offscreen canvas (normalized: x in [-0.5, 0.5]) ---------- */
  function sampleText(txt, font, w, hgt, step) {
    var pts = [];
    try {
      var oc = document.createElement('canvas'), o = oc.getContext('2d');
      oc.width = w; oc.height = hgt;
      o.font = font; o.textAlign = 'center'; o.textBaseline = 'middle'; o.fillStyle = '#fff';
      o.fillText(txt, oc.width / 2, oc.height / 2 + 8);
      var d = o.getImageData(0, 0, oc.width, oc.height).data, minX = oc.width, maxX = 0, minY = oc.height, maxY = 0;
      for (var y = 0; y < oc.height; y += step) for (var x = 0; x < oc.width; x += step) {
        if (d[(y * oc.width + x) * 4 + 3] > 120) { pts.push([x, y]); if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
      }
      var tw = Math.max(1, maxX - minX), mx = (minX + maxX) / 2, my = (minY + maxY) / 2;
      pts = pts.map(function (q) { return [(q[0] - mx) / tw, (q[1] - my) / tw]; });
    } catch (e) { /* no canvas text: fall back to a line */ }
    if (!pts.length) for (var i = 0; i < 300; i++) pts.push([i / 300 - 0.5, 0]);
    return pts;
  }
  var AI_RAD = 0.6, SA_RAD = 0.6;
  function radius(pts) { var r = 0.01; pts.forEach(function (q) { var d = Math.hypot(q[0], q[1]); if (d > r) r = d; }); return r; }
  /* the SA mark: a rounded square with the letters cut out — sampled as a filled square minus the glyphs */
  function sampleMark() {
    var pts = [];
    try {
      var oc = document.createElement('canvas'), o = oc.getContext('2d'), S = 260, R = 64;
      oc.width = S; oc.height = S;
      o.fillStyle = '#fff'; o.beginPath();
      o.moveTo(R, 0); o.lineTo(S - R, 0); o.quadraticCurveTo(S, 0, S, R); o.lineTo(S, S - R); o.quadraticCurveTo(S, S, S - R, S); o.lineTo(R, S); o.quadraticCurveTo(0, S, 0, S - R); o.lineTo(0, R); o.quadraticCurveTo(0, 0, R, 0); o.fill();
      o.globalCompositeOperation = 'destination-out';
      o.font = '800 128px Onest, "SF Pro Display", Inter, system-ui, sans-serif'; o.textAlign = 'center'; o.textBaseline = 'middle';
      o.fillText('SA', S / 2, S / 2 + 6);
      var d = o.getImageData(0, 0, S, S).data;
      for (var y = 0; y < S; y += 3) for (var x = 0; x < S; x += 3) if (d[(y * S + x) * 4 + 3] > 120) pts.push([x / S - 0.5, y / S - 0.5]);
    } catch (e) { /* fall back to a ring */ }
    if (!pts.length) for (var i = 0; i < 400; i++) { var a = i / 400 * Math.PI * 2; pts.push([Math.cos(a) * 0.4, Math.sin(a) * 0.4]); }
    return pts;
  }

  function build() {
    var ap = sampleText('0%', '800 220px Onest, "SF Pro Display", Inter, system-ui, sans-serif', 620, 260, 3), mp = sampleMark();
    AI_RAD = radius(ap); SA_RAD = radius(mp);
    for (var i = ap.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = ap[i]; ap[i] = ap[j]; ap[j] = t; }
    for (i = mp.length - 1; i > 0; i--) { var j2 = Math.floor(Math.random() * (i + 1)); var t2 = mp[i]; mp[i] = mp[j2]; mp[j2] = t2; }
    var diag = Math.hypot(W, H);
    for (i = 0; i < N; i++) {
      var ang = Math.random() * Math.PI * 2, dist = diag * (0.55 + Math.random() * 0.25);
      var a = ap[i % ap.length], m = mp[i % mp.length];
      P.push({
        a: [a[0] + (Math.random() - 0.5) * 0.01, a[1] + (Math.random() - 0.5) * 0.01],
        m: [m[0] + (Math.random() - 0.5) * 0.012, m[1] + (Math.random() - 0.5) * 0.012],
        sx: Math.cos(ang) * dist, sy: Math.sin(ang) * dist,
        d: Math.random() * 0.55, md: Math.random() * 0.35, c: i % 5 === 0 ? 1 : 0, x: 0, y: 0
      });
    }
  }

  /* ---------- HUD ---------- */
  function addLog(i, t) {
    if (!logEl) return;
    var prev = logEl.lastElementChild;
    if (prev) prev.classList.add('is-ok');
    var li = document.createElement('li');
    var ts = document.createElement('span'); ts.className = 'bl-t'; ts.textContent = '[' + t.toFixed(2).padStart(5, '0') + ']';
    var m = document.createElement('span'); m.className = 'bl-m'; m.textContent = LOG[i];
    var ok = document.createElement('span'); ok.className = 'bl-s'; ok.textContent = 'OK';
    li.appendChild(ts); li.appendChild(m); li.appendChild(ok);
    logEl.appendChild(li);
    while (logEl.children.length > 4) logEl.removeChild(logEl.firstElementChild);
    if (i === LOG.length - 1) li.classList.add('is-ok');
  }
  function hud(p, t) {
    if (numEl) numEl.textContent = Math.floor(p);
    if (barEl) barEl.style.transform = 'scaleX(' + (p / 100).toFixed(4) + ')';
    if (stat.foiz) stat.foiz.textContent = '0%';
    if (stat.viloyat) stat.viloyat.textContent = Math.min(12, Math.floor(p / 100 * 12.9));
    if (stat.pasport) stat.pasport.textContent = Math.min(1, Math.floor(p / 50));
    while (logged < LOG.length && p >= LOG_AT[logged]) { addLog(logged, t); logged++; }
  }

  /* ---------- render ---------- */
  function draw(t, p) {
    if (!ctx) return;
    var cx = W / 2, cy = H * (small ? 0.42 : 0.46), R = Math.min(W * 0.21, H * 0.2, 250);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';

    /* phases: fly-in → «0%» (a) → the SA mark (m) */
    var a = clamp(p / 0.3), m = clamp((p - 0.62) / 0.3);
    var Asz = R * 1.62 * 0.86 / AI_RAD, Msz = R * 1.62 * 0.78 / SA_RAD;

    var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.9);
    var gi = 0.1 + 0.16 * a + 0.35 * m;
    g.addColorStop(0, 'rgba(227,17,42,' + (gi * 0.55).toFixed(3) + ')');
    g.addColorStop(0.45, 'rgba(255,176,32,' + (gi * 0.14).toFixed(3) + ')');
    g.addColorStop(1, 'rgba(227,17,42,0)');
    ctx.fillStyle = g; ctx.fillRect(cx - R * 2, cy - R * 2, R * 4, R * 4);

    for (var i = 0; i < N; i++) {
      var o = P[i];
      var ta = eOut(clamp((a * 1.55 - o.d) / 1));
      var ax = cx + o.a[0] * Asz, ay = cy + o.a[1] * Asz;
      var px = lerp(cx + o.sx, ax, ta), py = lerp(cy + o.sy, ay, ta);
      var tm = eIO(clamp(m * 1.4 - o.md));
      o.x = lerp(px, cx + o.m[0] * Msz, tm);
      o.y = lerp(py, cy + o.m[1] * Msz, tm);
      o.k = Math.min(1, a * 1.4);
    }
    for (var pass = 0; pass < 2; pass++) {
      ctx.fillStyle = pass ? '#ffb020' : '#ff4d5e';
      for (i = 0; i < N; i++) {
        var q = P[i]; if (q.c !== pass) continue;
        ctx.globalAlpha = 0.9 * (0.35 + 0.65 * q.k);
        ctx.fillRect(q.x - 0.6, q.y - 0.6, 1.2, 1.2);
      }
    }
    ctx.globalAlpha = 1;

    /* progress arc + orbit */
    var ringR = R * 1.62;
    ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.beginPath(); ctx.arc(cx, cy, ringR, 0, 6.2832); ctx.stroke();
    var endA = -Math.PI / 2 + p * Math.PI * 2;
    var grad = ctx.createLinearGradient(cx - ringR, cy - ringR, cx + ringR, cy + ringR);
    grad.addColorStop(0, '#e3112a'); grad.addColorStop(0.55, '#ff5a3c'); grad.addColorStop(1, '#ffb020');
    ctx.strokeStyle = grad; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(cx, cy, ringR, -Math.PI / 2, endA); ctx.stroke();
    var hx = cx + Math.cos(endA) * ringR, hy = cy + Math.sin(endA) * ringR;
    var hg = ctx.createRadialGradient(hx, hy, 0, hx, hy, 16);
    hg.addColorStop(0, 'rgba(255,200,180,0.95)'); hg.addColorStop(1, 'rgba(227,17,42,0)');
    ctx.fillStyle = hg; ctx.fillRect(hx - 16, hy - 16, 32, 32);
    ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1;
    ctx.beginPath();
    for (var tk = 0; tk < 60; tk++) {
      var ang = tk / 60 * Math.PI * 2 + t * 0.05, r1 = ringR + 10, r2 = ringR + (tk % 5 === 0 ? 18 : 14);
      ctx.moveTo(cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1); ctx.lineTo(cx + Math.cos(ang) * r2, cy + Math.sin(ang) * r2);
    }
    ctx.stroke();
    if (m > 0.75) {
      var f = clamp((m - 0.75) / 0.25);
      var fg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.4);
      fg.addColorStop(0, 'rgba(255,120,110,' + (0.28 * f).toFixed(3) + ')'); fg.addColorStop(1, 'rgba(227,17,42,0)');
      ctx.fillStyle = fg; ctx.fillRect(cx - R * 1.5, cy - R * 1.5, R * 3, R * 3);
    }
  }

  function exitFrame(now) {
    var e = clamp((now - exitStart) / 950), k = eIO(e);
    var r = k * Math.hypot(W, H) * 0.75;
    var cy = small ? 42 : 46;
    var mask = 'radial-gradient(circle at 50% ' + cy + '%, transparent ' + r.toFixed(1) + 'px, #000 ' + (r + 90).toFixed(1) + 'px)';
    el.style.webkitMaskImage = mask; el.style.maskImage = mask;
    if (cv) cv.style.transform = 'scale(' + (1 + k * 0.35).toFixed(4) + ')';
    if (e >= 1) finish();
  }
  function startExit(now) {
    if (exiting) return;
    exiting = true; exitStart = now;
    el.classList.add('is-exit'); h.classList.add('boot-exit');
    document.dispatchEvent(new CustomEvent('w2w:boot-exit'));
    bootDone();
  }
  function finish() {
    if (finished) return;
    finished = true;
    h.classList.remove('boot', 'boot-exit');
    if (el.parentNode) el.parentNode.removeChild(el);
    window.removeEventListener('resize', resize);
    document.removeEventListener('keydown', onKey);
    bootDone();
    document.dispatchEvent(new CustomEvent('w2w:boot-done'));
  }
  function onKey(e) { if (e.key === 'Escape') skip = true; }
  if (skipBtn) skipBtn.addEventListener('click', function () { skip = true; });
  document.addEventListener('keydown', onKey);
  setTimeout(function () { if (!finished) finish(); }, 9000); /* failsafe: never block the site */

  if (reduce || !ctx) {
    var tr0 = performance.now();
    (function tick(now) {
      var p = Math.min(100, (now - tr0) / 12);
      hud(p, (now - tr0) / 1000);
      if (p < 100 && !skip) { requestAnimationFrame(tick); return; }
      el.classList.add('is-fade'); h.classList.add('boot-exit'); bootDone();
      setTimeout(finish, 350);
    })(tr0);
    return;
  }

  resize();
  window.addEventListener('resize', resize);
  build();
  function frame(now) {
    if (finished) return;
    var t = (now - t0) / 1000;
    var target = skip ? 100 : timeline(t);
    prog += (target - prog) * (skip ? 0.35 : 0.22);
    if (target >= 100 && prog > 99.6) prog = 100;
    draw(t, prog / 100);
    hud(prog, t);
    if (prog >= 100 && !exiting) { if (!el._holdAt) el._holdAt = now; if (skip || now - el._holdAt > 320) startExit(now); }
    if (exiting) exitFrame(now);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
