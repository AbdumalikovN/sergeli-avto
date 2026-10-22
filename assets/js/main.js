/* Sergeli Avto — interactions
   GSAP 3.12.5 + ScrollTrigger, Lenis 1.1.18 (all optional: page works without them) */
(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  var motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
  var reduceMotion = motionMq.matches;
  var hasGsap = typeof window.gsap !== "undefined";
  var hasST = hasGsap && typeof window.ScrollTrigger !== "undefined";
  var isTouch = window.matchMedia("(hover: none)").matches;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };

  /* ------------------------------------------------------------------
     Data (only numbers published by Sergeli Avto)
  ------------------------------------------------------------------ */
  var OFFERS = {
    damas: {
      name: "Chevrolet Damas",
      bonusKey: "calc.bonus5",
      term: 30,
      rows: { 30: { down: 33400000, monthly: 2261000 }, 40: { down: 41900000, monthly: 1939000 }, 50: { down: 52900000, monthly: 1617000 }, 60: { down: 61300000, monthly: 1293000 } }
    },
    cobalt: {
      name: "Chevrolet Cobalt Style MCM",
      bonusKey: "calc.bonus10",
      term: 24,
      rows: { 50: { down: 82500000, monthly: 3252000 } }
    }
  };

  /* ------------------------------------------------------------------
     i18n
  ------------------------------------------------------------------ */
  var DICT = window.SA_I18N || {};
  var lang = "uz";
  try { lang = localStorage.getItem("sa_lang") || "uz"; } catch (e) {}
  if (!DICT[lang]) lang = "uz";

  function t(key, vars) {
    var s = (DICT[lang] && DICT[lang][key]) || (DICT.uz && DICT.uz[key]) || "";
    if (vars) Object.keys(vars).forEach(function (k) { s = s.replace("{" + k + "}", vars[k]); });
    return s;
  }

  function applyLang(next) {
    lang = DICT[next] ? next : "uz";
    try { localStorage.setItem("sa_lang", lang); } catch (e) {}
    root.setAttribute("lang", lang);
    $$("[data-i18n]").forEach(function (el) {
      var v = t(el.getAttribute("data-i18n"));
      if (v) el.textContent = v;
    });
    $$("[data-i18n-ph]").forEach(function (el) {
      var v = t(el.getAttribute("data-i18n-ph"));
      if (v) el.setAttribute("placeholder", v);
    });
    $$("[data-i18n-aria]").forEach(function (el) {
      var v = t(el.getAttribute("data-i18n-aria"));
      if (v) el.setAttribute("aria-label", v);
    });
    $$(".lang__btn").forEach(function (b) {
      var on = b.getAttribute("data-lang") === lang;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    doc.title = t("meta.title");
    var md = $('meta[name="description"]');
    if (md) md.setAttribute("content", t("meta.desc"));
    syncTickerLabel();
    syncBurgerLabel();
    renderCalc(false);
    if (hasST) window.ScrollTrigger.refresh();
  }

  $$(".lang__btn").forEach(function (b) {
    b.addEventListener("click", function () { applyLang(b.getAttribute("data-lang")); });
  });

  /* ------------------------------------------------------------------
     Nav: scroll state, burger menu, current section
  ------------------------------------------------------------------ */
  var nav = $("#nav");
  var burger = $("#navBurger");
  var menu = $("#navMenu");
  var menuOpen = false;

  function onScrollNav(y) { nav.classList.toggle("is-scrolled", y > 24); }
  onScrollNav(window.scrollY || 0);

  function syncBurgerLabel() {
    if (!burger) return;
    burger.setAttribute("aria-label", t(menuOpen ? "nav.menuClose" : "nav.menu"));
  }
  function setMenu(open, restoreFocus) {
    if (!burger || !menu || open === menuOpen) return;
    menuOpen = open;
    menu.hidden = !open;
    nav.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    syncBurgerLabel();
    if (!open && restoreFocus) burger.focus();
  }
  if (burger && menu) {
    burger.addEventListener("click", function () { setMenu(!menuOpen, false); });
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape" && menuOpen) setMenu(false, true); });
    doc.addEventListener("click", function (e) { if (menuOpen && !nav.contains(e.target)) setMenu(false, false); });
    window.matchMedia("(min-width: 1200px)").addEventListener("change", function (e) { if (e.matches) setMenu(false, false); });
  }

  // Current-section highlight (recognition over recall; works without GSAP)
  var sectionLinks = $$('.nav__links a[href^="#"], .nav__menu-links a[href^="#"]');
  if ("IntersectionObserver" in window && sectionLinks.length) {
    var byId = {};
    sectionLinks.forEach(function (a) { var id = a.getAttribute("href").slice(1); (byId[id] = byId[id] || []).push(a); });
    var current = null;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) current = en.target.id; });
      Object.keys(byId).forEach(function (id) {
        byId[id].forEach(function (a) {
          var on = id === current;
          a.classList.toggle("is-current", on);
          if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    Object.keys(byId).forEach(function (id) { var s = doc.getElementById(id); if (s) io.observe(s); });
  }

  /* ------------------------------------------------------------------
     Smooth scroll (Lenis) + anchors
  ------------------------------------------------------------------ */
  var lenis = null;
  if (!reduceMotion && typeof window.Lenis !== "undefined" && !isTouch) {
    lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
    if (hasST) {
      lenis.on("scroll", function (e) { window.ScrollTrigger.update(); onScrollNav(e.scroll); });
      window.gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      window.gsap.ticker.lagSmoothing(0);
    } else {
      lenis.on("scroll", function (e) { onScrollNav(e.scroll); });
      (function raf(time) { lenis.raf(time); requestAnimationFrame(raf); })(0);
    }
  } else {
    window.addEventListener("scroll", function () { onScrollNav(window.scrollY); }, { passive: true });
  }

  function navOffset() { return -(parseInt(getComputedStyle(root).getPropertyValue("--nav-h"), 10) || 72) - 12; }

  function scrollToEl(target) {
    if (!target) return;
    var offset = navOffset();
    if (lenis) lenis.scrollTo(target, { offset: offset, duration: 1.2 });
    else {
      var y = target.getBoundingClientRect().top + window.scrollY + offset;
      window.scrollTo({ top: y, behavior: reduceMotion ? "auto" : "smooth" });
    }
    // Move keyboard/screen-reader focus with the viewport (WCAG 2.4.3)
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    try { target.focus({ preventScroll: true }); } catch (e) { target.focus(); }
  }

  doc.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute("href");
    if (id.length < 2) return;
    var target = $(id);
    if (!target) return;
    e.preventDefault();
    if (a.hasAttribute("data-lead")) { var sel = $("#leadModel"); if (sel) sel.value = a.getAttribute("data-lead"); }
    setMenu(false, false);
    scrollToEl(target);
    if (history.replaceState) history.replaceState(null, "", id);
  });

  /* ------------------------------------------------------------------
     Trust ticker: pause control (WCAG 2.2.2)
  ------------------------------------------------------------------ */
  var ticker = $("#trust");
  var tickerBtn = $("#tickerPause");
  function syncTickerLabel() {
    if (!tickerBtn) return;
    var paused = ticker.classList.contains("is-paused");
    tickerBtn.setAttribute("aria-pressed", paused ? "true" : "false");
    tickerBtn.setAttribute("aria-label", t(paused ? "trust.play" : "trust.pause"));
  }
  if (tickerBtn) {
    tickerBtn.addEventListener("click", function () {
      ticker.classList.toggle("is-paused");
      syncTickerLabel();
    });
  }

  /* ------------------------------------------------------------------
     Garage tabs (models)
  ------------------------------------------------------------------ */
  var tabs = $$(".garage__tab");
  var cars = $$(".garage__car");
  var panels = $$(".garage__panel");
  var currentModel = "damas";

  function showModel(model, focusTab) {
    if (model === currentModel) return;
    var order = ["damas", "cobalt", "labo"];
    var dir = order.indexOf(model) > order.indexOf(currentModel) ? 1 : -1;
    currentModel = model;
    tabs.forEach(function (tb) {
      var on = tb.getAttribute("data-model") === model;
      tb.classList.toggle("is-active", on);
      tb.setAttribute("aria-selected", on ? "true" : "false");
      tb.setAttribute("tabindex", on ? "0" : "-1");
      if (on && focusTab) tb.focus();
    });
    cars.forEach(function (c) {
      var on = c.getAttribute("data-model") === model;
      c.classList.remove("is-leaving");
      if (!on && c.classList.contains("is-active")) {
        c.classList.remove("is-active");
        if (dir === 1) c.classList.add("is-leaving");
      }
      if (on) {
        if (!reduceMotion) {
          c.style.transform = dir === 1 ? "translateX(14%)" : "translateX(-14%)";
          void c.offsetWidth; // flush so the entrance direction applies
          c.style.transform = "";
        }
        c.classList.add("is-active");
      }
    });
    panels.forEach(function (p) {
      var on = p.getAttribute("data-model") === model;
      p.hidden = !on;
      p.classList.toggle("is-active", on);
      if (on && hasGsap && !reduceMotion) {
        window.gsap.fromTo(p, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out", clearProps: "all" });
      }
    });
    if (hasST) window.ScrollTrigger.refresh();
  }

  tabs.forEach(function (tb, i) {
    tb.addEventListener("click", function () { showModel(tb.getAttribute("data-model"), false); });
    tb.addEventListener("keydown", function (e) {
      var ni = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : -1;
      if (ni < 0 || ni >= tabs.length) return;
      e.preventDefault();
      showModel(tabs[ni].getAttribute("data-model"), true);
    });
  });

  /* ------------------------------------------------------------------
     Calculator
  ------------------------------------------------------------------ */
  var calcModel = "damas";
  var calcDown = 30;
  var downBtns = $$("#calcDown .seg__btn");
  var modelBtns = $$("[data-calc-model]");
  var rDown = $("#rDown"), rMonthly = $("#rMonthly"), rTerm = $("#rTerm"), rPct = $("#rDownPct");
  var calcHint = $("#calcHint");
  var calcLive = $("#calcLive");
  var liveTimer = 0;
  var displayed = { down: 33400000, monthly: 2261000, term: 30 };

  function fmt(n) { return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " "); }

  function tweenNumber(el, key, to) {
    var from = displayed[key];
    displayed[key] = to;
    if (!hasGsap || reduceMotion || from === to) { el.textContent = fmt(to); return; }
    var o = { v: from };
    window.gsap.to(o, { v: to, duration: 0.7, ease: "power3.out", onUpdate: function () { el.textContent = fmt(o.v); } });
  }

  function announceCalc(offer, row) {
    if (!calcLive) return;
    // One calm announcement per change, after the number tween, instead of a live region re-reading every frame.
    clearTimeout(liveTimer);
    liveTimer = setTimeout(function () {
      calcLive.textContent = t("calc.live", { model: offer.name, down: fmt(row.down), pct: calcDown + "%", term: offer.term, monthly: fmt(row.monthly) });
    }, 800);
  }

  function renderCalc(animate) {
    var offer = OFFERS[calcModel];
    var available = Object.keys(offer.rows).map(Number);
    if (available.indexOf(calcDown) === -1) calcDown = available[0];
    downBtns.forEach(function (b) {
      var v = Number(b.getAttribute("data-down"));
      var ok = available.indexOf(v) !== -1;
      b.disabled = !ok;
      var on = v === calcDown;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-checked", on ? "true" : "false");
    });
    modelBtns.forEach(function (b) {
      var on = b.getAttribute("data-calc-model") === calcModel;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-checked", on ? "true" : "false");
    });
    if (calcHint) calcHint.hidden = available.length > 1;
    var row = offer.rows[calcDown];
    $("#calcModelName").textContent = offer.name;
    var bonus = $("#calcBonus");
    bonus.setAttribute("data-i18n", offer.bonusKey);
    bonus.textContent = t(offer.bonusKey);
    rPct.textContent = calcDown + "%";
    if (animate === false) {
      rDown.textContent = fmt(row.down); rMonthly.textContent = fmt(row.monthly); rTerm.textContent = offer.term;
      displayed = { down: row.down, monthly: row.monthly, term: offer.term };
    } else {
      tweenNumber(rDown, "down", row.down);
      tweenNumber(rMonthly, "monthly", row.monthly);
      tweenNumber(rTerm, "term", offer.term);
      announceCalc(offer, row);
    }
    // sync lead form defaults
    var lm = $("#leadModel"), ld = $("#leadDown");
    if (lm) lm.value = calcModel === "damas" ? "Damas" : "Cobalt";
    if (ld) ld.value = String(calcDown);
  }

  downBtns.forEach(function (b) {
    b.addEventListener("click", function () { calcDown = Number(b.getAttribute("data-down")); renderCalc(true); pulse(); });
  });
  modelBtns.forEach(function (b) {
    b.addEventListener("click", function () { calcModel = b.getAttribute("data-calc-model"); renderCalc(true); pulse(); });
  });
  $$("[data-calc]").forEach(function (b) {
    b.addEventListener("click", function () {
      calcModel = b.getAttribute("data-calc");
      renderCalc(false);
      scrollToEl($("#calc"));
    });
  });
  function pulse() {
    if (!hasGsap || reduceMotion) return;
    window.gsap.fromTo(".calc__cell--main", { scale: 0.985 }, { scale: 1, duration: 0.6, ease: "power3.out", clearProps: "scale" });
  }
  renderCalc(false);
  syncTickerLabel();
  syncBurgerLabel();
  if (lang !== "uz") applyLang(lang);

  /* ------------------------------------------------------------------
     Lead form (no backend): validate inline, compose message, copy, show success
  ------------------------------------------------------------------ */
  var form = $("#leadForm");
  var success = $("#leadSuccess");
  var errBox = $("#leadError");
  var fields = {
    name: { input: form.name, err: $("#leadNameErr"), ok: function (v) { return v.trim().length >= 2; } },
    phone: { input: form.phone, err: $("#leadPhoneErr"), ok: function (v) { return /^\+?[0-9\s\-()]{9,}$/.test(v.trim()); } }
  };

  function setFieldState(f, valid) {
    f.input.setAttribute("aria-invalid", valid ? "false" : "true");
    f.err.hidden = valid;
  }
  function validateField(f) { var ok = f.ok(f.input.value); setFieldState(f, ok); return ok; }
  Object.keys(fields).forEach(function (k) {
    var f = fields[k];
    f.input.addEventListener("blur", function () { if (f.input.value.trim()) validateField(f); });
    f.input.addEventListener("input", function () {
      if (f.input.getAttribute("aria-invalid") === "true" && f.ok(f.input.value)) setFieldState(f, true);
      if (!errBox.hidden && fields.name.ok(fields.name.input.value) && fields.phone.ok(fields.phone.input.value)) errBox.hidden = true;
    });
  });

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return legacyCopy(text); });
    }
    return Promise.resolve(legacyCopy(text));
  }
  function legacyCopy(text) {
    try {
      var ta = doc.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      doc.body.appendChild(ta); ta.select();
      var ok = doc.execCommand("copy");
      doc.body.removeChild(ta);
      return ok;
    } catch (e) { return false; }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var nameOk = validateField(fields.name);
    var phoneOk = validateField(fields.phone);
    if (!nameOk || !phoneOk) {
      errBox.hidden = false;
      (nameOk ? fields.phone : fields.name).input.focus();
      return;
    }
    errBox.hidden = true;
    var name = form.name.value.trim();
    var phone = form.phone.value.trim();
    var msg = t("lead.msg", { name: name, model: form.model.value, down: form.down.value, phone: phone });
    $("#leadMsg").textContent = msg;
    var okText = $("#leadSuccess p[data-i18n]");
    copyText(msg).then(function (copied) {
      okText.setAttribute("data-i18n", copied ? "lead.ok.text" : "lead.ok.text.nocopy");
      okText.textContent = t(copied ? "lead.ok.text" : "lead.ok.text.nocopy");
      form.hidden = true;
      success.hidden = false;
      if (hasGsap && !reduceMotion) window.gsap.fromTo(success, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", clearProps: "all" });
      success.focus();
      if (hasST) window.ScrollTrigger.refresh();
    });
  });
  $("#leadAgain").addEventListener("click", function () {
    success.hidden = true; form.hidden = false; form.name.value = ""; form.phone.value = "";
    setFieldState(fields.name, true); setFieldState(fields.phone, true);
    form.name.focus();
    if (hasST) window.ScrollTrigger.refresh();
  });

  /* ------------------------------------------------------------------
     Motion (GSAP). Everything below is decoration; page is complete without it.
  ------------------------------------------------------------------ */
  function settleStatic() {
    $$("[data-count]").forEach(function (el) { el.textContent = el.getAttribute("data-count") + (el.getAttribute("data-suffix") || ""); });
  }
  if (!hasGsap || reduceMotion) { settleStatic(); return; }

  var gsap = window.gsap;
  if (hasST) gsap.registerPlugin(window.ScrollTrigger);
  root.classList.add("js");

  // If the user switches on "reduce motion" mid-session, strip Tier-1 motion live (no reload needed).
  motionMq.addEventListener("change", function (e) {
    if (!e.matches) return;
    reduceMotion = true;
    if (hasST) window.ScrollTrigger.getAll().forEach(function (st) { st.kill(); });
    gsap.globalTimeline.clear();
    gsap.set("[data-reveal], .hero__car, .car--hero, .hero__content, .hero__glow, .nav, .streaks, .hero__title .line > span, .hero__lead, .hero__cta, .hero__meta, .garage__stage, [data-magnetic]", { clearProps: "all" });
    root.classList.remove("js");
    if (lenis) { lenis.destroy(); lenis = null; window.addEventListener("scroll", function () { onScrollNav(window.scrollY); }, { passive: true }); }
    settleStatic();
  });

  // Wheels spin everywhere
  $$("[data-wheel]").forEach(function (w) {
    gsap.to(w, { rotation: 360, duration: 0.9, ease: "none", repeat: -1, transformOrigin: "50% 50%" });
  });

  // Hero: one orchestrated entrance
  var heroTl = gsap.timeline({ defaults: { ease: "expo.out" } });
  heroTl
    .from(".hero__car", { xPercent: -60, opacity: 0, duration: 1.6 }, 0)
    .from(".hero__title .line > span", { yPercent: 110, duration: 1.1, stagger: 0.09 }, 0.25)
    .from(".hero__lead, .hero__cta, .hero__meta", { y: 24, opacity: 0, duration: 0.9, stagger: 0.1 }, 0.7)
    .from(".streaks", { opacity: 0, duration: 1.2 }, 0.3)
    .from(".nav", { y: -20, opacity: 0, duration: 0.8, clearProps: "transform" }, 0.4);

  // Idle: gentle road bob
  gsap.to(".hero__car .car__body", { y: 1.6, duration: 0.42, yoyo: true, repeat: -1, ease: "sine.inOut" });
  gsap.to(".hero__car .car__beam", { opacity: 0.55, duration: 1.4, yoyo: true, repeat: -1, ease: "sine.inOut" });

  // Cursor parallax (desktop pointer only)
  if (!isTouch) {
    var scene = $(".hero__scene");
    var qx = gsap.quickTo(".hero__car", "x", { duration: 0.8, ease: "power3" });
    var qy = gsap.quickTo(".hero__car", "y", { duration: 0.8, ease: "power3" });
    var qr = gsap.quickTo(".hero__car", "rotation", { duration: 0.8, ease: "power3" });
    var sx = gsap.quickTo(".streaks", "y", { duration: 1.2, ease: "power3" });
    var gx = gsap.quickTo(".hero__glow", "x", { duration: 1.4, ease: "power3" });
    $("#hero").addEventListener("pointermove", function (e) {
      if (reduceMotion) return;
      var r = scene.getBoundingClientRect();
      var nx = (e.clientX - r.left) / r.width - 0.5;
      var ny = (e.clientY - r.top) / r.height - 0.5;
      qx(nx * 36); qy(ny * 14); qr(nx * 1.6);
      sx(ny * -24); gx(nx * 80);
    });
  }

  if (!hasST) return;
  var ST = window.ScrollTrigger;

  // ScrollTriggers are created in page order (hero → models → …) so refresh order matches layout order.
  // Hero scrub: the car drives off as you scroll, the copy lifts
  gsap.timeline({ scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true } })
    .to(".car--hero", { xPercent: 120, ease: "power1.in" }, 0)
    .to(".hero__content", { y: -80, opacity: 0.2, ease: "none" }, 0)
    .to(".hero__glow", { opacity: 0, ease: "none" }, 0);

  // Garage car drifts slightly with scroll (stage is excluded from reveals so transforms never fight)
  gsap.to(".garage__stage", { y: -30, ease: "none", scrollTrigger: { trigger: ".models", start: "top bottom", end: "bottom top", scrub: true } });

  // Section reveals: headings and key blocks (one pattern, used sparingly)
  var revealSets = [
    ".models .section__head", ".garage__tabs", ".garage__panels",
    ".calc .section__head", ".calc__box",
    ".bonus .section__head", ".bonus__col",
    ".steps .section__head", ".step",
    ".owners .section__head", ".owners__stats", ".owner", ".owners .link-arrow",
    ".contacts__info", ".lead"
  ];
  revealSets.forEach(function (sel) {
    var els = $$(sel);
    if (!els.length) return;
    ST.batch(els, {
      start: "top 88%",
      once: true,
      onEnter: function (batch) {
        gsap.fromTo(batch, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.9, ease: "expo.out", stagger: 0.08, overwrite: true, clearProps: "transform" });
      }
    });
    els.forEach(function (el) { el.setAttribute("data-reveal", ""); });
  });

  // Counters (real numbers only)
  $$("[data-count]").forEach(function (el) {
    var target = Number(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var o = { v: 0 };
    el.textContent = "0" + suffix;
    ST.create({
      trigger: el, start: "top 90%", once: true,
      onEnter: function () {
        gsap.to(o, { v: target, duration: 1.6, ease: "power3.out", onUpdate: function () { el.textContent = Math.round(o.v) + suffix; } });
      }
    });
  });

  // Magnetic buttons (pointer devices)
  if (!isTouch) {
    $$("[data-magnetic]").forEach(function (btn) {
      var mx = gsap.quickTo(btn, "x", { duration: 0.5, ease: "power3" });
      var my = gsap.quickTo(btn, "y", { duration: 0.5, ease: "power3" });
      btn.addEventListener("pointermove", function (e) {
        if (reduceMotion) return;
        var r = btn.getBoundingClientRect();
        mx((e.clientX - (r.left + r.width / 2)) * 0.28);
        my((e.clientY - (r.top + r.height / 2)) * 0.28);
      });
      btn.addEventListener("pointerleave", function () { mx(0); my(0); });
    });
  }

  // Positions depend on web fonts and late layout: refresh once fonts settle and on full load.
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { ST.refresh(); });
  window.addEventListener("load", function () { ST.refresh(); });
})();
