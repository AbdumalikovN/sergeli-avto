/* Sergeli Avto — interactions. v4
   GSAP 3.12.5 + ScrollTrigger, Lenis 1.1.18 — all optional, the page is complete without them. */
(function () {
  "use strict";

  var doc = document, root = doc.documentElement;
  var motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
  var reduceMotion = motionMq.matches;
  var hasGsap = typeof window.gsap !== "undefined";
  var hasST = hasGsap && typeof window.ScrollTrigger !== "undefined";
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var gsap = window.gsap;

  /* ------------------------------------------------------------------
     Offers — only numbers published by Sergeli Avto
  ------------------------------------------------------------------ */
  var OFFERS = {
    damas: { key: "m.damas", term: 30, bonuses: 5, rows: { 30: { down: 33400000, monthly: 2261000 }, 40: { down: 41900000, monthly: 1939000 }, 50: { down: 52900000, monthly: 1617000 }, 60: { down: 61300000, monthly: 1293000 } } },
    cobaltStyle: { key: "m.cobaltStyle", term: 24, bonuses: 10, rows: { 50: { down: 82500000, monthly: 3252000 } } },
    cobaltMidnight: { key: "m.cobaltMidnight", term: 24, bonuses: 10, rows: { 50: { down: 87000000, monthly: 3441000 } } },
    labo: { key: "m.labo", term: 0, bonuses: 0, rows: null }
  };
  function fmt(n) { return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " "); }

  /* ------------------------------------------------------------------
     i18n
  ------------------------------------------------------------------ */
  var DICT = window.SA_I18N || {};
  var lang = root.getAttribute("lang") === "ru" ? "ru" : "uz";
  function t(key, vars) {
    var s = (DICT[lang] && DICT[lang][key]) || (DICT.uz && DICT.uz[key]) || "";
    if (vars) Object.keys(vars).forEach(function (k) { s = s.split("{" + k + "}").join(vars[k]); });
    return s;
  }
  function applyLang(next, animate) {
    lang = DICT[next] ? next : "uz";
    try { localStorage.setItem("sa_lang", lang); } catch (e) {}
    root.setAttribute("lang", lang);
    $$("[data-i18n]").forEach(function (el) { var v = t(el.getAttribute("data-i18n")); if (v) el.textContent = v; });
    $$("[data-i18n-ph]").forEach(function (el) { var v = t(el.getAttribute("data-i18n-ph")); if (v) el.setAttribute("placeholder", v); });
    $$("[data-i18n-aria]").forEach(function (el) { var v = t(el.getAttribute("data-i18n-aria")); if (v) el.setAttribute("aria-label", v); });
    $$("[data-i18n-alt]").forEach(function (el) { var v = t(el.getAttribute("data-i18n-alt")); if (v) el.setAttribute("alt", v); });
    $$("[data-lang]").forEach(function (b) { var on = b.getAttribute("data-lang") === lang; b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", on ? "true" : "false"); });
    doc.title = t("meta.title");
    var md = $('meta[name="description"]'); if (md) md.setAttribute("content", t("meta.desc"));
    syncMarqLabel(); syncBurgerLabel(); syncThemeLabel(); syncOpen();
    renderCalc(false); updateSummary();
    requestAnimationFrame(function () { $$(".seg").forEach(placeThumb); if (hasST) window.ScrollTrigger.refresh(); });
  }
  $$("[data-lang]").forEach(function (b) { b.addEventListener("click", function () { if (b.getAttribute("data-lang") !== lang) applyLang(b.getAttribute("data-lang"), true); }); });

  /* ------------------------------------------------------------------
     Segmented controls: sliding thumb
  ------------------------------------------------------------------ */
  function placeThumb(seg) {
    var thumb = $(".seg-thumb", seg), on = $(".seg-btn.is-active", seg);
    if (!thumb || !on) return;
    var sr = seg.getBoundingClientRect(), br = on.getBoundingClientRect();
    thumb.style.width = br.width + "px";
    thumb.style.height = br.height + "px";
    thumb.style.transform = "translate(" + (br.left - sr.left - 3) + "px," + (br.top - sr.top - 3) + "px)";
    seg.classList.add("has-thumb");
  }
  function setSegActive(seg, btn, attr) {
    $$(".seg-btn", seg).forEach(function (b) {
      var on = b === btn;
      b.classList.toggle("is-active", on);
      if (b.hasAttribute(attr)) b.setAttribute(attr, on ? "true" : "false");
    });
    placeThumb(seg);
  }
  $$(".seg").forEach(placeThumb);
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { $$(".seg").forEach(placeThumb); });
  var rsT = 0;
  window.addEventListener("resize", function () { clearTimeout(rsT); rsT = setTimeout(function () { $$(".seg").forEach(placeThumb); }, 120); });

  /* ------------------------------------------------------------------
     Theme toggle with circular reveal (View Transitions API, graceful fallback)
  ------------------------------------------------------------------ */
  var themeBtn = $("#themeBtn");
  function currentTheme() { return root.getAttribute("data-theme") === "dark" ? "dark" : "light"; }
  function syncThemeLabel() { if (themeBtn) themeBtn.setAttribute("aria-label", t(currentTheme() === "dark" ? "theme.light" : "theme.dark")); }
  function setTheme(next) {
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("sa_theme", next); } catch (e) {}
    syncThemeLabel();
  }
  if (themeBtn) {
    themeBtn.addEventListener("click", function (e) {
      var next = currentTheme() === "dark" ? "light" : "dark";
      var r = themeBtn.getBoundingClientRect();
      root.style.setProperty("--vt-x", (r.left + r.width / 2) + "px");
      root.style.setProperty("--vt-y", (r.top + r.height / 2) + "px");
      if (doc.startViewTransition && !reduceMotion) doc.startViewTransition(function () { setTheme(next); });
      else setTheme(next);
    });
  }
  syncThemeLabel();

  /* ------------------------------------------------------------------
     Header: scroll state, burger, current section
  ------------------------------------------------------------------ */
  var hd = $("#hd"), burger = $("#navBurger"), menu = $("#navMenu"), menuOpen = false;
  function onScrollNav(y) { hd.classList.toggle("is-scrolled", y > 24); }
  onScrollNav(window.scrollY || 0);
  function syncBurgerLabel() { if (burger) burger.setAttribute("aria-label", t(menuOpen ? "nav.menuClose" : "nav.menu")); }
  function setMenu(open, restoreFocus) {
    if (!burger || !menu || open === menuOpen) return;
    menuOpen = open; menu.hidden = !open; hd.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", open ? "true" : "false"); syncBurgerLabel();
    if (open && hasGsap && !reduceMotion) gsap.fromTo(menu, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out", clearProps: "all" });
    if (!open && restoreFocus) burger.focus();
  }
  if (burger && menu) {
    burger.addEventListener("click", function () { setMenu(!menuOpen, false); });
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape" && menuOpen) setMenu(false, true); });
    doc.addEventListener("click", function (e) { if (menuOpen && !hd.contains(e.target)) setMenu(false, false); });
    window.matchMedia("(min-width: 1200px)").addEventListener("change", function (e) { if (e.matches) setMenu(false, false); });
  }
  var sectionLinks = $$('.hd-nav a[href^="#"], .hd-menu-links a[href^="#"]');
  if ("IntersectionObserver" in window && sectionLinks.length) {
    var byId = {}; sectionLinks.forEach(function (a) { var id = a.getAttribute("href").slice(1); (byId[id] = byId[id] || []).push(a); });
    var current = null;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) current = en.target.id; });
      Object.keys(byId).forEach(function (id) { byId[id].forEach(function (a) { var on = id === current; a.classList.toggle("is-current", on); if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); }); });
    }, { rootMargin: "-40% 0px -55% 0px", threshold: 0 });
    Object.keys(byId).forEach(function (id) { var s = doc.getElementById(id); if (s) io.observe(s); });
  }

  /* ------------------------------------------------------------------
     Smooth scroll (Lenis, desktop pointer only) + anchors
  ------------------------------------------------------------------ */
  var lenis = null;
  if (!reduceMotion && typeof window.Lenis !== "undefined" && finePointer) {
    lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
    if (hasST) {
      lenis.on("scroll", function (e) { window.ScrollTrigger.update(); onScrollNav(e.scroll); });
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      lenis.on("scroll", function (e) { onScrollNav(e.scroll); });
      (function raf(time) { lenis.raf(time); requestAnimationFrame(raf); })(0);
    }
  } else {
    window.addEventListener("scroll", function () { onScrollNav(window.scrollY); }, { passive: true });
  }
  function navOffset() { return -(parseInt(getComputedStyle(root).getPropertyValue("--header-h"), 10) || 64) - 28; }
  function scrollToEl(target) {
    if (!target) return;
    var offset = navOffset();
    if (lenis) lenis.scrollTo(target, { offset: offset, duration: 1.1 });
    else { var y = target.getBoundingClientRect().top + window.scrollY + offset; window.scrollTo({ top: y, behavior: reduceMotion ? "auto" : "smooth" }); }
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    try { target.focus({ preventScroll: true }); } catch (e) { target.focus(); }
  }
  doc.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest('a[href^="#"]'); if (!a) return;
    var id = a.getAttribute("href"); if (id.length < 2) return;
    var target = $(id); if (!target) return;
    e.preventDefault();
    if (a.hasAttribute("data-lead")) { calcModel = a.getAttribute("data-lead"); if (!OFFERS[calcModel]) calcModel = "damas"; renderCalc(false); }
    setMenu(false, false);
    scrollToEl(target);
    if (history.replaceState) history.replaceState(null, "", id);
  });

  /* ------------------------------------------------------------------
     Marquee pause (WCAG 2.2.2)
  ------------------------------------------------------------------ */
  var marq = $("#trust"), marqBtn = $("#marqPause");
  function syncMarqLabel() { if (!marqBtn) return; var p = marq.classList.contains("is-paused"); marqBtn.setAttribute("aria-pressed", p ? "true" : "false"); marqBtn.setAttribute("aria-label", t(p ? "trust.play" : "trust.pause")); }
  if (marqBtn) marqBtn.addEventListener("click", function () { marq.classList.toggle("is-paused"); syncMarqLabel(); });

  /* ------------------------------------------------------------------
     Open-now indicator (Tashkent, UTC+5, 09:00–19:00 daily)
  ------------------------------------------------------------------ */
  function syncOpen() {
    var now = new Date();
    var h = (now.getUTCHours() + 5) % 24;
    var open = h >= 9 && h < 19;
    $$(".dot-live").forEach(function (d) { d.classList.toggle("is-open", open); });
    var txt = $("#openText"); if (txt) txt.textContent = t(open ? "open.now" : "open.closed");
  }
  syncOpen(); setInterval(syncOpen, 60000);

  /* ------------------------------------------------------------------
     Cobalt trim switch (Style / Midnight)
  ------------------------------------------------------------------ */
  var trimSeg = $("#trimSeg");
  if (trimSeg) {
    $$(".seg-btn", trimSeg).forEach(function (b) {
      b.addEventListener("click", function () {
        var trim = b.getAttribute("data-trim"), id = trim === "midnight" ? "cobaltMidnight" : "cobaltStyle";
        setSegActive(trimSeg, b, "aria-checked");
        $$(".model-img").forEach(function (p) {
          var on = p.getAttribute("data-trim") === trim;
          p.classList.toggle("is-leaving", !on && p.classList.contains("is-active"));
          p.classList.toggle("is-active", on);
        });
        var row = OFFERS[id].rows[50];
        $("#cobaltMonthly").textContent = fmt(row.monthly);
        $("#cobaltDown").textContent = fmt(row.down);
        $("#cobaltCalcBtn").setAttribute("data-calc", id);
        $("#cobaltLeadBtn").setAttribute("data-lead", id);
      });
    });
  }

  /* ------------------------------------------------------------------
     Calculator
  ------------------------------------------------------------------ */
  var calcModel = "damas", calcDown = 30;
  var modelSeg = $("#calcModelSeg"), downSeg = $("#calcDownSeg");
  var downBtns = $$(".seg-btn", downSeg), modelBtns = $$(".seg-btn", modelSeg);
  var rDown = $("#rDown"), rMonthly = $("#rMonthly"), rTerm = $("#rTerm"), rTotal = $("#rTotal"), rPct = $("#rDownPct");
  var calcHint = $("#calcHint"), calcLive = $("#calcLive"), calcResult = $("#calcResult"), calcAsk = $("#calcAsk"), downField = $("#calcDownField");
  var leadModel = $("#leadModel"), leadDown = $("#leadDown"), leadSummary = $("#leadSummary");
  var displayed = { down: 33400000, monthly: 2261000, term: 30, total: 101230000 };
  var liveTimer = 0;

  function tweenNumber(el, key, to) {
    var from = displayed[key]; displayed[key] = to;
    if (!hasGsap || reduceMotion || from === to) { el.textContent = fmt(to); return; }
    var o = { v: from };
    gsap.to(o, { v: to, duration: 0.8, ease: "power3.out", onUpdate: function () { el.textContent = fmt(o.v); } });
  }
  function offerRow(model, down) {
    var offer = OFFERS[model]; if (!offer.rows) return null;
    var keys = Object.keys(offer.rows).map(Number);
    if (keys.indexOf(down) === -1) down = keys[0];
    var r = offer.rows[down];
    return { down: r.down, monthly: r.monthly, pct: down, term: offer.term, total: r.down + r.monthly * offer.term };
  }
  function renderCalc(animate) {
    var offer = OFFERS[calcModel];
    modelBtns.forEach(function (b) { var on = b.getAttribute("data-calc-model") === calcModel; b.classList.toggle("is-active", on); b.setAttribute("aria-checked", on ? "true" : "false"); });
    placeThumb(modelSeg);
    var isLabo = !offer.rows;
    if (calcResult) calcResult.hidden = isLabo;
    if (calcAsk) calcAsk.hidden = !isLabo;
    if (downField) downField.style.display = isLabo ? "none" : "";
    if (leadModel) leadModel.value = calcModel;
    if (leadDown) leadDown.disabled = isLabo;
    if (isLabo) { if (leadDown) leadDown.value = "50"; updateSummary(); return; }

    var available = Object.keys(offer.rows).map(Number);
    if (available.indexOf(calcDown) === -1) calcDown = available[0];
    downBtns.forEach(function (b) { var v = Number(b.getAttribute("data-down")); var ok = available.indexOf(v) !== -1; b.disabled = !ok; var on = v === calcDown; b.classList.toggle("is-active", on); b.setAttribute("aria-checked", on ? "true" : "false"); });
    placeThumb(downSeg);
    if (calcHint) calcHint.hidden = available.length > 1;
    var row = offerRow(calcModel, calcDown);
    $("#calcModelName").textContent = t(offer.key);
    $("#calcBonusN").textContent = offer.bonuses;
    rPct.textContent = calcDown + "%";
    if (animate === false) {
      rDown.textContent = fmt(row.down); rMonthly.textContent = fmt(row.monthly); rTerm.textContent = row.term; rTotal.textContent = fmt(row.total);
      displayed = { down: row.down, monthly: row.monthly, term: row.term, total: row.total };
    } else {
      tweenNumber(rDown, "down", row.down); tweenNumber(rMonthly, "monthly", row.monthly); tweenNumber(rTerm, "term", row.term); tweenNumber(rTotal, "total", row.total);
      if (!reduceMotion) { calcResult.classList.remove("is-bumping"); void calcResult.offsetWidth; calcResult.classList.add("is-bumping"); }
      clearTimeout(liveTimer);
      liveTimer = setTimeout(function () { if (calcLive) calcLive.textContent = t("calc.live", { model: t(offer.key), down: fmt(row.down), pct: calcDown + "%", term: row.term, monthly: fmt(row.monthly), total: fmt(row.total) }); }, 900);
    }
    if (leadDown) { leadDown.querySelectorAll("option").forEach(function (o) { o.disabled = available.indexOf(Number(o.value)) === -1; }); leadDown.value = String(calcDown); }
    updateSummary();
  }
  function updateSummary() {
    if (!leadSummary || !leadModel) return;
    var m = leadModel.value, offer = OFFERS[m];
    if (!offer || !offer.rows) { leadSummary.textContent = t("lead.summary.labo"); return; }
    var row = offerRow(m, Number(leadDown.value));
    leadSummary.textContent = t("lead.summary", { model: t(offer.key), pct: row.pct + "%", monthly: fmt(row.monthly), term: row.term });
  }
  downBtns.forEach(function (b) { b.addEventListener("click", function () { calcDown = Number(b.getAttribute("data-down")); renderCalc(true); }); });
  modelBtns.forEach(function (b) { b.addEventListener("click", function () { calcModel = b.getAttribute("data-calc-model"); renderCalc(true); }); });
  $$("[data-calc]").forEach(function (b) { b.addEventListener("click", function () { calcModel = b.getAttribute("data-calc"); renderCalc(false); scrollToEl($("#calc")); }); });
  // Form → calculator (two-way sync)
  if (leadModel) leadModel.addEventListener("change", function () { calcModel = leadModel.value; renderCalc(true); });
  if (leadDown) leadDown.addEventListener("change", function () { calcDown = Number(leadDown.value); renderCalc(true); });
  renderCalc(false);
  syncMarqLabel(); syncBurgerLabel();
  if (lang !== "uz") applyLang(lang, false);

  /* ------------------------------------------------------------------
     Boot screen
  ------------------------------------------------------------------ */
  var boot = $("#boot"), bootBar = $("#bootBar");
  if (root.classList.contains("boot") && boot) {
    var started = performance.now();
    if (bootBar) requestAnimationFrame(function () { bootBar.style.width = "70%"; });
    var finish = function () {
      if (bootBar) bootBar.style.width = "100%";
      var wait = Math.max(0, 900 - (performance.now() - started));
      setTimeout(function () {
        boot.classList.add("is-out");
        root.classList.remove("boot");
        try { sessionStorage.setItem("sa_boot", "1"); } catch (e) {}
        setTimeout(function () { boot.remove(); if (hasST) window.ScrollTrigger.refresh(); }, 650);
      }, wait + 250);
    };
    if (doc.readyState === "complete") finish(); else window.addEventListener("load", finish);
    setTimeout(finish, 2600); // never block on slow CDNs
  } else if (boot) { boot.remove(); }

  /* ------------------------------------------------------------------
     Request form (no backend): validate inline, compose message, copy, success + sparks
  ------------------------------------------------------------------ */
  var form = $("#leadForm"), success = $("#leadSuccess"), errBox = $("#leadError");
  var typeSeg = $("#leadTypeSeg"), whenField = $("#leadWhenField"), leadType = "call";
  if (typeSeg) $$(".seg-btn", typeSeg).forEach(function (b) {
    b.addEventListener("click", function () {
      leadType = b.getAttribute("data-type"); setSegActive(typeSeg, b, "aria-checked");
      whenField.hidden = leadType !== "visit";
      if (hasST) window.ScrollTrigger.refresh();
    });
  });
  var fields = {
    name: { input: form.name, err: $("#leadNameErr"), ok: function (v) { return v.trim().length >= 2; } },
    phone: { input: form.phone, err: $("#leadPhoneErr"), ok: function (v) { return /^\+?[0-9\s\-()]{9,}$/.test(v.trim()); } }
  };
  function setFieldState(f, valid, showOk) {
    f.input.setAttribute("aria-invalid", valid ? "false" : "true");
    f.err.hidden = valid;
    f.input.closest(".rq-field").classList.toggle("is-ok", !!(valid && showOk && f.input.value.trim()));
  }
  function validateField(f) { var ok = f.ok(f.input.value); setFieldState(f, ok, true); return ok; }
  Object.keys(fields).forEach(function (k) {
    var f = fields[k];
    f.input.addEventListener("blur", function () { if (f.input.value.trim()) validateField(f); });
    f.input.addEventListener("input", function () {
      var ok = f.ok(f.input.value);
      if (f.input.getAttribute("aria-invalid") === "true" && ok) setFieldState(f, true, true);
      else f.input.closest(".rq-field").classList.toggle("is-ok", ok);
      if (!errBox.hidden && fields.name.ok(fields.name.input.value) && fields.phone.ok(fields.phone.input.value)) errBox.hidden = true;
    });
  });
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return legacyCopy(text); });
    return Promise.resolve(legacyCopy(text));
  }
  function legacyCopy(text) {
    try { var ta = doc.createElement("textarea"); ta.value = text; ta.setAttribute("readonly", ""); ta.style.cssText = "position:fixed;opacity:0"; doc.body.appendChild(ta); ta.select(); var ok = doc.execCommand("copy"); doc.body.removeChild(ta); return ok; } catch (e) { return false; }
  }
  function sparks() {
    var host = $("#sparks"); if (!host || reduceMotion) return;
    host.innerHTML = "";
    var colors = ["#E3112A", "#FF4D5E", "#FFB3BA", "#232325", "#ffffff"];
    for (var i = 0; i < 22; i++) {
      var s = doc.createElement("i"); s.className = "rq-spark";
      var a = Math.random() * Math.PI * 2, d = 60 + Math.random() * 110;
      s.style.setProperty("--c", colors[i % colors.length]);
      s.style.setProperty("--dx", Math.cos(a) * d + "px");
      s.style.setProperty("--dy", Math.sin(a) * d - 30 + "px");
      s.style.animationDelay = (Math.random() * 0.12) + "s";
      host.appendChild(s);
    }
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var nameOk = validateField(fields.name), phoneOk = validateField(fields.phone);
    if (!nameOk || !phoneOk) { errBox.hidden = false; (nameOk ? fields.phone : fields.name).input.focus(); return; }
    errBox.hidden = true;
    var m = form.model.value, offer = OFFERS[m], row = offer.rows ? offerRow(m, Number(form.down.value)) : null;
    var whenSel = $("#leadWhen"), whenTxt = whenSel ? whenSel.options[whenSel.selectedIndex].textContent : "";
    var msg = t("lead.msg", {
      name: form.name.value.trim(),
      type: leadType === "visit" ? t("lead.msg.visit", { when: whenTxt.toLowerCase() }) : t("lead.msg.call"),
      model: t(offer.key),
      terms: row ? t("lead.msg.terms", { pct: row.pct + "%", down: fmt(row.down), monthly: fmt(row.monthly), term: row.term }) : t("lead.msg.termsLabo"),
      phone: form.phone.value.trim()
    });
    $("#leadMsg").textContent = msg;
    var okText = $("#leadOkText");
    copyText(msg).then(function (copied) {
      okText.setAttribute("data-i18n", copied ? "lead.ok.text" : "lead.ok.text.nocopy");
      okText.textContent = t(copied ? "lead.ok.text" : "lead.ok.text.nocopy");
      form.hidden = true; success.hidden = false;
      sparks();
      if (hasGsap && !reduceMotion) gsap.fromTo(success, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", clearProps: "all" });
      success.focus();
      if (hasST) window.ScrollTrigger.refresh();
    });
  });
  $("#leadAgain").addEventListener("click", function () {
    success.hidden = true; form.hidden = false; form.name.value = ""; form.phone.value = "";
    setFieldState(fields.name, true, false); setFieldState(fields.phone, true, false);
    form.name.focus(); if (hasST) window.ScrollTrigger.refresh();
  });

  /* ------------------------------------------------------------------
     Motion (GSAP). Decoration only; everything above works without it.
  ------------------------------------------------------------------ */
  function settleStatic() { $$("[data-count]").forEach(function (el) { el.textContent = el.getAttribute("data-count") + (el.getAttribute("data-suffix") || ""); }); }
  if (!hasGsap || reduceMotion) { settleStatic(); return; }
  root.classList.add("motion");
  if (hasST) gsap.registerPlugin(window.ScrollTrigger);

  motionMq.addEventListener("change", function (e) {
    if (!e.matches) return;
    reduceMotion = true;
    if (hasST) window.ScrollTrigger.getAll().forEach(function (st) { st.kill(); });
    gsap.globalTimeline.clear();
    gsap.set("[data-reveal], .hero-title .hl > *, .hero-lead, .hero-cta, .hero-proof, .hero-visual, .hero-photo, .orb, .hero-badge, [data-magnetic], [data-tilt]", { clearProps: "all" });
    root.classList.remove("motion");
    if (lenis) { lenis.destroy(); lenis = null; window.addEventListener("scroll", function () { onScrollNav(window.scrollY); }, { passive: true }); }
    settleStatic();
  });

  // Hero entrance — one authored moment
  var heroTl = gsap.timeline({ defaults: { ease: "expo.out" }, delay: root.classList.contains("boot") ? 0.9 : 0.1 });
  heroTl
    .from(".hero-title .hl > *", { yPercent: 110, duration: 1.1, stagger: 0.09 }, 0)
    .from(".hero-lead, .hero-cta, .hero-proof", { y: 24, opacity: 0, duration: 0.9, stagger: 0.1 }, 0.35)
    .from(".hero-photo", { y: 40, opacity: 0, scale: 0.96, duration: 1.3 }, 0.2)
    .from(".orb", { scale: 0.4, opacity: 0, duration: 1, ease: "back.out(1.6)" }, 0.8)
    .from(".hero-badge", { y: 20, opacity: 0, duration: 0.8 }, 0.95)
    .from(".hd-bar", { y: -16, opacity: 0, duration: 0.8, clearProps: "all" }, 0.3);

  // Magnetic buttons (desktop pointer only)
  if (finePointer) {
    $$("[data-magnetic]").forEach(function (el) {
      var qx = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" }), qy = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });
      el.addEventListener("pointermove", function (e) { if (reduceMotion) return; var r = el.getBoundingClientRect(); qx((e.clientX - r.left - r.width / 2) * 0.22); qy((e.clientY - r.top - r.height / 2) * 0.3); });
      el.addEventListener("pointerleave", function () { qx(0); qy(0); });
    });
    // Tilt on photo cards
    $$("[data-tilt]").forEach(function (el) {
      var rx = gsap.quickTo(el, "rotationX", { duration: 0.6, ease: "power3" }), ry = gsap.quickTo(el, "rotationY", { duration: 0.6, ease: "power3" });
      gsap.set(el, { transformPerspective: 900 });
      el.addEventListener("pointermove", function (e) { if (reduceMotion) return; var r = el.getBoundingClientRect(); ry(((e.clientX - r.left) / r.width - 0.5) * 8); rx(-((e.clientY - r.top) / r.height - 0.5) * 8); });
      el.addEventListener("pointerleave", function () { rx(0); ry(0); });
    });
  }

  if (!hasST) { settleStatic(); return; }
  var ST = window.ScrollTrigger;

  // Hero parallax (created first: page order)
  gsap.timeline({ scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true } })
    .to(".hero-copy", { y: -60, opacity: 0.35, ease: "none" }, 0)
    .to(".hero-visual", { y: 50, ease: "none" }, 0)
    .to(".orb", { y: -40, ease: "none" }, 0);

  // Section reveals: single pattern, batched
  ST.batch("[data-reveal]", {
    start: "top 88%", once: true,
    onEnter: function (batch) {
      gsap.fromTo(batch, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.9, ease: "expo.out", stagger: 0.08, overwrite: true, clearProps: "transform",
        onComplete: function () { batch.forEach(function (el) { el.classList.add("is-in"); }); } });
    }
  });

  // Counters (real numbers only)
  $$("[data-count]").forEach(function (el) {
    var target = Number(el.getAttribute("data-count")), suffix = el.getAttribute("data-suffix") || "", o = { v: 0 };
    ST.create({
      trigger: el, start: "top 90%", once: true,
      onEnter: function () { gsap.to(o, { v: target, duration: 1.4, ease: "power3.out", onUpdate: function () { el.textContent = Math.round(o.v) + suffix; } }); }
    });
  });

  // Fonts/images late → recalc
  window.addEventListener("load", function () { ST.refresh(); });
})();
