/* Sergeli Avto — interactions. v5. Vanilla JS, no dependencies. */
(function () {
  "use strict";
  var doc = document, root = doc.documentElement;
  var motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
  var reduce = motionMq.matches;
  motionMq.addEventListener("change", function (e) { reduce = e.matches; });
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };

  /* Offers — only numbers published by Sergeli Avto */
  var OFFERS = {
    damas: { key: "m.damas", term: 30, bonuses: 5, rows: { 30: { down: 33400000, monthly: 2261000 }, 40: { down: 41900000, monthly: 1939000 }, 50: { down: 52900000, monthly: 1617000 }, 60: { down: 61300000, monthly: 1293000 } } },
    cobaltStyle: { key: "m.cobaltStyle", term: 24, bonuses: 10, rows: { 50: { down: 82500000, monthly: 3252000 } } },
    cobaltMidnight: { key: "m.cobaltMidnight", term: 24, bonuses: 10, rows: { 50: { down: 87000000, monthly: 3441000 } } },
    labo: { key: "m.labo", term: 0, bonuses: 0, rows: null }
  };
  function fmt(n) { return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " "); }
  function easeOut(t) { return 1 - Math.pow(1 - t, 4); }
  function tween(from, to, dur, step) {
    if (reduce || from === to) { step(to); return; }
    var t0 = performance.now();
    (function frame(now) {
      var p = Math.min(1, (now - t0) / dur);
      step(from + (to - from) * easeOut(p));
      if (p < 1) requestAnimationFrame(frame);
    })(t0);
  }

  /* i18n */
  var DICT = window.SA_I18N || {};
  var lang = root.getAttribute("lang") === "ru" ? "ru" : "uz";
  function t(key, vars) {
    var s = (DICT[lang] && DICT[lang][key]) || (DICT.uz && DICT.uz[key]) || "";
    if (vars) Object.keys(vars).forEach(function (k) { s = s.split("{" + k + "}").join(vars[k]); });
    return s;
  }
  function applyLang(next) {
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
    syncOpen(); renderCalc(false); updateSummary();
  }
  $$("[data-lang]").forEach(function (b) { b.addEventListener("click", function () { if (b.getAttribute("data-lang") !== lang) applyLang(b.getAttribute("data-lang")); }); });

  /* Open-now (Tashkent UTC+5, 09:00–19:00 daily) */
  function syncOpen() {
    var h = (new Date().getUTCHours() + 5) % 24, open = h >= 9 && h < 19;
    $$(".live").forEach(function (l) { l.classList.toggle("is-open", open); });
    $$("[data-live]").forEach(function (el) { el.textContent = t(open ? "open.now" : "open.closed"); });
  }
  syncOpen(); setInterval(syncOpen, 60000);

  /* Hero: 24% -> 0% countdown (the one authored moment) */
  var nol = $("#nolNum");
  if (nol) {
    if (reduce) nol.textContent = "0";
    else setTimeout(function () { tween(24, 0, 1300, function (v) { nol.textContent = Math.round(v); }); }, 200);
  }

  /* Smooth anchors with header offset */
  function scrollToEl(target) {
    if (!target) return;
    var y = target.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    try { target.focus({ preventScroll: true }); } catch (e) {}
  }
  doc.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest('a[href^="#"]'); if (!a) return;
    var id = a.getAttribute("href"); if (id.length < 2) return;
    var target = $(id); if (!target) return;
    e.preventDefault();
    if (a.hasAttribute("data-calc")) { calcModel = a.getAttribute("data-calc"); if (!OFFERS[calcModel]) calcModel = "damas"; renderCalc(false); }
    if (a.hasAttribute("data-lead")) { var m = a.getAttribute("data-lead"); if (OFFERS[m]) { calcModel = m; renderCalc(false); } }
    scrollToEl(target);
    if (history.replaceState) history.replaceState(null, "", id);
  });

  /* Current section in nav */
  var navLinks = $$('.hd-nav a[href^="#"]');
  if ("IntersectionObserver" in window && navLinks.length) {
    var byId = {}; navLinks.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    var cur = null;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) cur = en.target.id; });
      Object.keys(byId).forEach(function (id) { var on = id === cur; byId[id].classList.toggle("is-current", on); if (on) byId[id].setAttribute("aria-current", "true"); else byId[id].removeAttribute("aria-current"); });
    }, { rootMargin: "-35% 0px -55% 0px" });
    Object.keys(byId).forEach(function (id) { var s = doc.getElementById(id); if (s) io.observe(s); });
  }

  /* Scroll reveals */
  var reveals = $$("[data-reveal]");
  if (!("IntersectionObserver" in window) || reduce) root.classList.add("no-reveal");
  else {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); ro.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    reveals.forEach(function (el) { ro.observe(el); });
    setTimeout(function () { reveals.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-in"); }); }, 60);
  }

  /* Sticky bar hides over the lead form (its own CTA is there) */
  var bar = $(".bar"), contact = $("#contact");
  if (bar && contact && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) { bar.classList.toggle("is-hidden", entries[0].isIntersecting); }, { rootMargin: "0px 0px -30% 0px", threshold: 0.15 }).observe(contact);
  }

  /* Cobalt trim toggle (Style / Midnight) */
  var trimSeg = $("#trimSeg");
  if (trimSeg) {
    var shownCobalt = { monthly: 3252000, down: 82500000 };
    $$(".trim-btn", trimSeg).forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-trim");
        $$(".trim-btn", trimSeg).forEach(function (x) { var on = x === b; x.classList.toggle("is-active", on); x.setAttribute("aria-checked", on ? "true" : "false"); });
        $$(".model-img picture").forEach(function (p) { p.classList.toggle("is-active", p.getAttribute("data-trim") === id); });
        var row = OFFERS[id].rows[50], mEl = $("#cobaltMonthly"), dEl = $("#cobaltDown");
        tween(shownCobalt.monthly, row.monthly, 700, function (v) { mEl.textContent = fmt(v); });
        tween(shownCobalt.down, row.down, 700, function (v) { dEl.textContent = fmt(v); });
        shownCobalt = { monthly: row.monthly, down: row.down };
        $("#cobaltCalcBtn").setAttribute("data-calc", id);
      });
    });
  }

  /* Calculator */
  var calcModel = "damas", calcDown = 30;
  var modelBtns = $$("#calcModelSeg .chip"), downBtns = $$("#calcDownSeg .chip");
  var rDown = $("#rDown"), rMonthly = $("#rMonthly"), rTerm = $("#rTerm"), rTotal = $("#rTotal"), rPct = $("#rDownPct");
  var calcHint = $("#calcHint"), calcLive = $("#calcLive"), calcResult = $("#calcResult"), calcAsk = $("#calcAsk"), downField = $("#calcDownField");
  var leadModel = $("#leadModel"), leadDown = $("#leadDown"), leadSummary = $("#leadSummary");
  var shown = { down: 33400000, monthly: 2261000, term: 30, total: 101230000 };
  var liveTimer = 0;

  function offerRow(model, down) {
    var offer = OFFERS[model]; if (!offer.rows) return null;
    var keys = Object.keys(offer.rows).map(Number);
    if (keys.indexOf(down) === -1) down = keys[0];
    var r = offer.rows[down];
    return { down: r.down, monthly: r.monthly, pct: down, term: offer.term, total: r.down + r.monthly * offer.term };
  }
  function renderCalc(animate) {
    var offer = OFFERS[calcModel], isLabo = !offer.rows;
    modelBtns.forEach(function (b) { var on = b.getAttribute("data-calc-model") === calcModel; b.classList.toggle("is-active", on); b.setAttribute("aria-checked", on ? "true" : "false"); });
    if (calcResult) calcResult.hidden = isLabo;
    if (calcAsk) calcAsk.hidden = !isLabo;
    if (downField) downField.hidden = isLabo;
    if (leadModel) leadModel.value = calcModel;
    if (leadDown) leadDown.disabled = isLabo;
    if (isLabo) { updateSummary(); return; }

    var available = Object.keys(offer.rows).map(Number);
    if (available.indexOf(calcDown) === -1) calcDown = available[0];
    downBtns.forEach(function (b) { var v = Number(b.getAttribute("data-down")), ok = available.indexOf(v) !== -1, on = v === calcDown; b.disabled = !ok; b.classList.toggle("is-active", on); b.setAttribute("aria-checked", on ? "true" : "false"); });
    if (calcHint) calcHint.hidden = available.length > 1;
    var row = offerRow(calcModel, calcDown);
    $("#calcModelName").textContent = t(offer.key);
    $("#calcBonusN").textContent = offer.bonuses;
    rPct.textContent = calcDown + "%";
    if (animate) {
      tween(shown.down, row.down, 800, function (v) { rDown.textContent = fmt(v); });
      tween(shown.monthly, row.monthly, 800, function (v) { rMonthly.textContent = fmt(v); });
      tween(shown.term, row.term, 500, function (v) { rTerm.textContent = Math.round(v); });
      tween(shown.total, row.total, 800, function (v) { rTotal.textContent = fmt(v); });
      if (!reduce) { calcResult.classList.remove("is-bump"); void calcResult.offsetWidth; calcResult.classList.add("is-bump"); }
      clearTimeout(liveTimer);
      liveTimer = setTimeout(function () { if (calcLive) calcLive.textContent = t("calc.live", { model: t(offer.key), down: fmt(row.down), pct: calcDown + "%", term: row.term, monthly: fmt(row.monthly), total: fmt(row.total) }); }, 900);
    } else {
      rDown.textContent = fmt(row.down); rMonthly.textContent = fmt(row.monthly); rTerm.textContent = row.term; rTotal.textContent = fmt(row.total);
    }
    shown = { down: row.down, monthly: row.monthly, term: row.term, total: row.total };
    if (leadDown) { $$("option", leadDown).forEach(function (o) { o.disabled = available.indexOf(Number(o.value)) === -1; }); leadDown.value = String(calcDown); }
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
  if (leadModel) leadModel.addEventListener("change", function () { calcModel = leadModel.value; renderCalc(false); });
  if (leadDown) leadDown.addEventListener("change", function () { calcDown = Number(leadDown.value); renderCalc(false); });
  renderCalc(false);
  if (lang !== "uz") applyLang(lang);

  /* Lead form (no backend): validate, compose, copy, success */
  var form = $("#leadForm"), success = $("#leadSuccess");
  if (form) {
    var fields = {
      name: { input: form.name, err: $("#leadNameErr"), ok: function (v) { return v.trim().length >= 2; } },
      phone: { input: form.phone, err: $("#leadPhoneErr"), ok: function (v) { return /^\+?[0-9\s\-()]{9,}$/.test(v.trim()); } }
    };
    function setState(f, valid) { f.input.setAttribute("aria-invalid", valid ? "false" : "true"); f.err.hidden = valid; }
    Object.keys(fields).forEach(function (k) {
      var f = fields[k];
      f.input.addEventListener("blur", function () { if (f.input.value.trim()) setState(f, f.ok(f.input.value)); });
      f.input.addEventListener("input", function () { if (f.input.getAttribute("aria-invalid") === "true" && f.ok(f.input.value)) setState(f, true); });
    });
    function copyText(text) {
      if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return legacyCopy(text); });
      return Promise.resolve(legacyCopy(text));
    }
    function legacyCopy(text) {
      try { var ta = doc.createElement("textarea"); ta.value = text; ta.setAttribute("readonly", ""); ta.style.cssText = "position:fixed;opacity:0"; doc.body.appendChild(ta); ta.select(); var ok = doc.execCommand("copy"); doc.body.removeChild(ta); return ok; } catch (e) { return false; }
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var nameOk = fields.name.ok(fields.name.input.value), phoneOk = fields.phone.ok(fields.phone.input.value);
      setState(fields.name, nameOk); setState(fields.phone, phoneOk);
      if (!nameOk || !phoneOk) { (nameOk ? fields.phone : fields.name).input.focus(); return; }
      var m = form.model.value, offer = OFFERS[m] || OFFERS.damas, row = offer.rows ? offerRow(m, Number(form.down.value)) : null;
      var msg = t("lead.msg", {
        name: form.name.value.trim(), model: t(offer.key),
        terms: row ? t("lead.msg.terms", { pct: row.pct + "%", down: fmt(row.down), monthly: fmt(row.monthly), term: row.term }) : t("lead.msg.termsLabo"),
        phone: form.phone.value.trim()
      });
      $("#leadMsg").textContent = msg;
      copyText(msg).then(function (copied) {
        var ok = $("#leadOkText"); ok.setAttribute("data-i18n", copied ? "lead.ok.text" : "lead.ok.text.nocopy"); ok.textContent = t(copied ? "lead.ok.text" : "lead.ok.text.nocopy");
        form.hidden = true; success.hidden = false; success.focus();
      });
    });
    $("#leadAgain").addEventListener("click", function () {
      success.hidden = true; form.hidden = false; form.name.value = ""; form.phone.value = "";
      setState(fields.name, true); setState(fields.phone, true); form.name.focus();
    });
  }
})();
