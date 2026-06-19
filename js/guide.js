(function () {
  "use strict";
  var I18N = window.I18N || {};
  var GUIDE = window.GUIDE_I18N || {};
  var DATA = window.GUIDE_DATA || { days: [], daytrips: [], vintage: null };
  var STORE = "m89_lang";

  function pickLang() {
    var s = null; try { s = localStorage.getItem(STORE); } catch (e) {}
    if (s && GUIDE[s]) return s;
    var n = (navigator.language || "it").slice(0, 2).toLowerCase();
    return GUIDE[n] ? n : "it";
  }
  var LANG = pickLang();

  function t(k) {
    var d = GUIDE[LANG] || GUIDE.en || GUIDE.it || {};
    if (k in d) return d[k];
    if (GUIDE.en && k in GUIDE.en) return GUIDE.en[k];
    return k;
  }
  function img(n) { return "assets/img/guide/g" + (n < 10 ? "0" + n : n) + ".jpg"; }
  function esc(s) { return (s == null ? "" : String(s)).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  var allImgs = [];

  function renderPlace(p) {
    var frag = document.createDocumentFragment();
    if (p.alt) frag.appendChild(el("div", "place__alt", "<span>" + esc(t("lbl_or")) + "</span>"));
    var card = el("article", "place");
    if (p.imgs && p.imgs.length) {
      var g = el("div", "place__imgs");
      p.imgs.forEach(function (n) {
        var fig = el("figure");
        var idx = allImgs.length; allImgs.push(img(n)); fig.dataset.lb = idx;
        var im = el("img"); im.src = img(n); im.loading = "lazy"; im.alt = t(p.k + "_name");
        fig.appendChild(im); g.appendChild(fig);
      });
      card.appendChild(g);
    }
    var body = el("div", "place__body");
    body.appendChild(el("h3", "place__name", esc(t(p.k + "_name"))));
    if (p.addr || p.phone) {
      var info = el("div", "place__info");
      if (p.addr) info.appendChild(el("span", null, "📍 " + esc(p.addr)));
      if (p.phone) info.appendChild(el("span", null, '📞 <a href="tel:' + esc(p.tel || p.phone) + '">' + esc(p.phone) + "</a>"));
      body.appendChild(info);
    }
    body.appendChild(el("p", "place__desc", esc(t(p.k + "_desc"))));
    if (p.hours) body.appendChild(el("p", "place__hours", "🕒 " + esc(t(p.k + "_hours"))));
    if (p.open) body.appendChild(el("p", "place__hours", "🕒 " + esc(t("lbl_open")) + ": " + esc(t(p.k + "_open"))));
    if (p.besttime) body.appendChild(el("p", "place__best", "🌅 " + esc(t("lbl_besttime")) + ": " + esc(t(p.k + "_besttime"))));
    if (p.tip) body.appendChild(el("div", "place__tip", "💡 " + esc(t(p.k + "_tip"))));
    card.appendChild(body);
    frag.appendChild(card);
    return frag;
  }

  function render() {
    var root = document.getElementById("guideRoot"); if (!root) return;
    allImgs = []; root.innerHTML = "";
    DATA.days.forEach(function (day) {
      var sec = el("section", "day");
      sec.appendChild(el("h2", "day__title", esc(t(day.title))));
      day.groups.forEach(function (grp) {
        var g = el("div", "grp");
        g.appendChild(el("h3", "grp__h", esc(t(grp.h))));
        grp.places.forEach(function (p) { g.appendChild(renderPlace(p)); });
        sec.appendChild(g);
      });
      root.appendChild(sec);
    });
    if (DATA.daytrips && DATA.daytrips.length) {
      var dt = el("section", "day");
      dt.appendChild(el("h2", "day__title", "🚆 " + esc(t("daytrips_title"))));
      var grid = el("div", "guide-trips");
      DATA.daytrips.forEach(function (p) { grid.appendChild(renderPlace(p)); });
      dt.appendChild(grid);
      root.appendChild(dt);
    }
    var ex = el("section", "day");
    ex.appendChild(el("h2", "day__title", "✨ " + esc(t("extra_title"))));
    if (DATA.vintage) ex.appendChild(renderPlace(DATA.vintage));
    ex.appendChild(el("h3", "grp__h", esc(t("usefultips_title"))));
    var tips = t("usefultips"); var ul = el("ul", "usefultips");
    (Array.isArray(tips) ? tips : []).forEach(function (x) { ul.appendChild(el("li", null, esc(x))); });
    ex.appendChild(ul);
    root.appendChild(ex);
  }

  function applyStatic() {
    document.documentElement.lang = LANG;
    document.documentElement.dir = (I18N[LANG] && I18N[LANG]._dir) || "ltr";
    document.title = t("intro_title") + " — Mascarella 89";
    Array.prototype.forEach.call(document.querySelectorAll("[data-g]"), function (e) {
      var v = t(e.getAttribute("data-g")); if (typeof v === "string") e.textContent = v;
    });
  }

  /* lightbox (shared markup with the homepage) */
  var lb, lbImg, cur = 0;
  function openLb(i) { cur = i; lbImg.src = allImgs[i]; lb.hidden = false; document.body.style.overflow = "hidden"; }
  function closeLb() { lb.hidden = true; document.body.style.overflow = ""; }
  function step(n) { if (!allImgs.length) return; cur = (cur + n + allImgs.length) % allImgs.length; lbImg.src = allImgs[cur]; }

  function buildSwitcher() {
    var sel = document.getElementById("langSelect"); if (!sel) return;
    Object.keys(I18N).filter(function (c) { return GUIDE[c]; }).forEach(function (code) {
      var o = document.createElement("option"); o.value = code;
      o.textContent = (I18N[code] && I18N[code]._label) || code.toUpperCase();
      sel.appendChild(o);
    });
    sel.value = LANG;
    sel.addEventListener("change", function () {
      LANG = GUIDE[sel.value] ? sel.value : "it";
      try { localStorage.setItem(STORE, LANG); } catch (e) {}
      applyStatic(); render();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    lb = document.getElementById("lightbox"); lbImg = document.getElementById("lbImg");
    if (lb) {
      document.getElementById("lbClose").addEventListener("click", closeLb);
      document.getElementById("lbPrev").addEventListener("click", function () { step(-1); });
      document.getElementById("lbNext").addEventListener("click", function () { step(1); });
      lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
      document.addEventListener("keydown", function (e) {
        if (lb.hidden) return;
        if (e.key === "Escape") closeLb();
        if (e.key === "ArrowLeft") step(-1);
        if (e.key === "ArrowRight") step(1);
      });
    }
    var root = document.getElementById("guideRoot");
    if (root) root.addEventListener("click", function (e) {
      var fig = e.target.closest("[data-lb]"); if (fig) openLb(+fig.dataset.lb);
    });
    buildSwitcher();
    applyStatic();
    render();
  });
})();
