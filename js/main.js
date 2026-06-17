(function () {
  "use strict";

  /* ============================================================
     DATI SPECIFICI DELL'ALLOGGIO.
     I testi tradotti stanno in js/i18n.js (window.I18N).
     Qui restano solo gli elementi non testuali: file foto,
     classi della griglia, icone dei servizi e della posizione.
     ============================================================ */
  var PHOTO_SRC = [
    { src: "assets/img/photo-07.jpg", cls: "g-big" },
    { src: "assets/img/photo-08.jpg" },
    { src: "assets/img/photo-04.jpg", cls: "g-wide" },
    { src: "assets/img/photo-09.jpg" },
    { src: "assets/img/photo-02.jpg" },
    { src: "assets/img/photo-03.jpg" },
    { src: "assets/img/photo-06.jpg", cls: "g-wide" },
    { src: "assets/img/photo-10.jpg" },
    { src: "assets/img/photo-11.jpg" },
    { src: "assets/img/photo-05.jpg" },
    { src: "assets/img/photo-01.jpg" }
  ];

  var AMENITY_ICONS = ["📶","❄️","🔥","📺","🛗","🍳","🍽️","🧺","🌀","💼","🛁","🧴","🔑","🅿️","🔌","🧯"];
  var LOC_ICONS = ["🚉","🏛️","🍝","🚗","🚆"];

  /* ---------- I18N CORE ---------- */
  var I18N = window.I18N || { it: {} };
  var STORE_KEY = "m89_lang";
  function pickLang() {
    var saved = null;
    try { saved = localStorage.getItem(STORE_KEY); } catch (e) {}
    if (saved && I18N[saved]) return saved;
    var nav = (navigator.language || "it").slice(0, 2).toLowerCase();
    return I18N[nav] ? nav : "it";
  }
  var LANG = pickLang();
  function t(key) {
    var d = I18N[LANG] || I18N.it;
    return (key in d) ? d[key] : (I18N.it[key] !== undefined ? I18N.it[key] : "");
  }
  function capOf(i) { var p = t("photos"); return (p && p[i]) || ""; }

  // Caricamento disponibilità dal file gestito dal pannello /admin.
  fetch("availability.json", { cache: "no-store" })
    .then(function (r) { return r.ok ? r.json() : null; })
    .catch(function () { return null; })
    .then(function (data) {
      boot(data || { booked: [], contactEmail: "" });
    });

  function boot(cfg) {
  /* ---------- HELPERS ---------- */
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var pad = function (n) { return n < 10 ? "0" + n : "" + n; };
  var ymd = function (d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
  var parseD = function (s) { var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); };

  var today = new Date(); today.setHours(0, 0, 0, 0);

  var busy = {};
  (cfg.booked || []).forEach(function (r) {
    var d = parseD(r.from), end = parseD(r.to);
    while (d <= end) { busy[ymd(d)] = true; d = new Date(d.getTime() + 86400000); }
  });
  var isBusy = function (d) { return !!busy[ymd(d)]; };
  var isPast = function (d) { return d < today; };

  /* ---------- GALLERY ---------- */
  var grid = $("#galleryGrid");
  function buildGallery() {
    if (!grid) return;
    grid.innerHTML = "";
    PHOTO_SRC.forEach(function (p, i) {
      var fig = document.createElement("figure");
      if (p.cls) fig.className = p.cls;
      fig.dataset.index = i;
      var img = document.createElement("img");
      img.src = p.src; img.alt = capOf(i); img.loading = "lazy";
      fig.appendChild(img);
      grid.appendChild(fig);
    });
  }

  /* ---------- LIGHTBOX ---------- */
  var lb = $("#lightbox"), lbImg = $("#lbImg"), cur = 0;
  function openLb(i) { cur = i; lbImg.src = PHOTO_SRC[i].src; lbImg.alt = capOf(i); lb.hidden = false; document.body.style.overflow = "hidden"; }
  function closeLb() { lb.hidden = true; document.body.style.overflow = ""; }
  function step(n) { cur = (cur + n + PHOTO_SRC.length) % PHOTO_SRC.length; lbImg.src = PHOTO_SRC[cur].src; lbImg.alt = capOf(cur); }
  if (grid && lb) {
    grid.addEventListener("click", function (e) {
      var fig = e.target.closest("figure"); if (fig) openLb(+fig.dataset.index);
    });
    $("#lbClose").addEventListener("click", closeLb);
    $("#lbPrev").addEventListener("click", function () { step(-1); });
    $("#lbNext").addEventListener("click", function () { step(1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener("keydown", function (e) {
      if (lb.hidden) return;
      if (e.key === "Escape") closeLb();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    });
  }

  /* ---------- AMENITIES ---------- */
  var aGrid = $("#amenitiesGrid");
  function buildAmenities() {
    if (!aGrid) return;
    aGrid.innerHTML = "";
    var labels = t("amenities") || [];
    AMENITY_ICONS.forEach(function (ic, i) {
      var li = document.createElement("li");
      li.innerHTML = '<span class="ic">' + ic + '</span><span></span>';
      li.lastChild.textContent = labels[i] || "";
      aGrid.appendChild(li);
    });
  }

  /* ---------- LOCATION POINTS ---------- */
  var locList = $("#locationList");
  function buildLocation() {
    if (!locList) return;
    locList.innerHTML = "";
    var pts = t("locpoints") || [];
    LOC_ICONS.forEach(function (ic, i) {
      var li = document.createElement("li");
      li.innerHTML = '<span>' + ic + '</span> <span></span>';
      li.lastChild.textContent = pts[i] || "";
      locList.appendChild(li);
    });
  }

  /* ---------- CALENDAR ---------- */
  var view = new Date(today.getFullYear(), today.getMonth(), 1);
  var selStart = null, selEnd = null;

  function buildMonth(base) {
    var WD = t("weekdays");
    var wrap = document.createElement("div");
    wrap.className = "cal-grid";
    var week = document.createElement("div");
    week.className = "cal-week";
    WD.forEach(function (w) { var s = document.createElement("span"); s.textContent = w; week.appendChild(s); });
    wrap.appendChild(week);

    var days = document.createElement("div");
    days.className = "cal-days";
    var first = new Date(base.getFullYear(), base.getMonth(), 1);
    var startDow = (first.getDay() + 6) % 7;
    var total = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();

    for (var i = 0; i < startDow; i++) {
      var e = document.createElement("div"); e.className = "cal-day empty"; days.appendChild(e);
    }
    for (var dnum = 1; dnum <= total; dnum++) {
      var d = new Date(base.getFullYear(), base.getMonth(), dnum);
      var cell = document.createElement("div");
      cell.className = "cal-day";
      cell.textContent = dnum;
      var ds = ymd(d);
      if (isPast(d)) cell.classList.add("past");
      else if (isBusy(d)) cell.classList.add("busy");
      else {
        cell.classList.add("free");
        cell.dataset.date = ds;
        if (selStart && ds === selStart) cell.classList.add("sel");
        if (selEnd && ds === selEnd) cell.classList.add("sel");
        if (selStart && selEnd && ds > selStart && ds < selEnd) cell.classList.add("inrange");
      }
      days.appendChild(cell);
    }
    wrap.appendChild(days);
    return wrap;
  }

  function rangeHasBusy(a, b) {
    var d = parseD(a), end = parseD(b);
    while (d < end) { if (isBusy(d)) return true; d = new Date(d.getTime() + 86400000); }
    return false;
  }

  function fmt(s) {
    var MO = t("months");
    var d = parseD(s);
    return d.getDate() + " " + MO[d.getMonth()].slice(0, 3).toLowerCase() + " " + d.getFullYear();
  }

  function render() {
    if (!$("#calGrids")) return;
    var MO = t("months");
    var months = $("#calMonths");
    var m2 = new Date(view.getFullYear(), view.getMonth() + 1, 1);
    months.innerHTML = "<span>" + MO[view.getMonth()] + " " + view.getFullYear() +
      "</span><span>" + MO[m2.getMonth()] + " " + m2.getFullYear() + "</span>";

    var grids = $("#calGrids");
    grids.innerHTML = "";
    grids.appendChild(buildMonth(view));
    grids.appendChild(buildMonth(m2));

    var sel = $("#calSelection");
    if (selStart && selEnd) {
      var n = Math.round((parseD(selEnd) - parseD(selStart)) / 86400000);
      var unit = n === 1 ? t("night") : t("nights");
      sel.textContent = t("cal_range")
        .replace("{from}", fmt(selStart)).replace("{to}", fmt(selEnd))
        .replace("{n}", n).replace("{unit}", unit);
    } else if (selStart) {
      sel.textContent = t("cal_prompt").replace("{d}", fmt(selStart));
    } else {
      sel.textContent = t("cal_none");
    }
  }

  if ($("#calGrids")) {
    $("#calGrids").addEventListener("click", function (e) {
      var cell = e.target.closest(".cal-day.free");
      if (!cell || !cell.dataset.date) return;
      var ds = cell.dataset.date;
      if (!selStart || (selStart && selEnd)) { selStart = ds; selEnd = null; }
      else if (ds <= selStart) { selStart = ds; selEnd = null; }
      else if (rangeHasBusy(selStart, ds)) { selStart = ds; selEnd = null; }
      else { selEnd = ds; }
      if (selStart) { var i = $("#fIn"); if (i) i.value = selStart; }
      if (selEnd) { var o = $("#fOut"); if (o) o.value = selEnd; }
      render();
    });
    $("#calPrev").addEventListener("click", function () {
      var m = new Date(view.getFullYear(), view.getMonth() - 1, 1);
      var floor = new Date(today.getFullYear(), today.getMonth(), 1);
      if (m >= floor) { view = m; render(); }
    });
    $("#calNext").addEventListener("click", function () {
      view = new Date(view.getFullYear(), view.getMonth() + 1, 1); render();
    });
  }

  /* ---------- FORM (mailto) ---------- */
  var form = $("#bookForm");
  if (form) form.addEventListener("submit", function (e) {
    e.preventDefault();
    var f = e.target;
    var body =
      t("form_name") + ": " + f.name.value + "\n" +
      t("form_email") + ": " + f.email.value + "\n" +
      t("form_in") + ": " + (f.checkin.value || "—") + "\n" +
      t("form_out") + ": " + (f.checkout.value || "—") + "\n" +
      t("form_guests") + ": " + f.guests.value + "\n\n" +
      t("form_msg") + ":\n" + (f.message.value || "—");
    window.location.href = "mailto:" + (cfg.contactEmail || "") +
      "?subject=" + encodeURIComponent(t("mail_subject")) + "&body=" + encodeURIComponent(body);
    if ($("#bookNote")) $("#bookNote").textContent = t("form_note");
  });

  /* ---------- APPLICA TRADUZIONI ---------- */
  function applyI18n() {
    var d = I18N[LANG] || I18N.it;
    document.documentElement.lang = LANG;
    document.documentElement.dir = d._dir || "ltr";
    $$("[data-i18n]").forEach(function (el) {
      var v = t(el.getAttribute("data-i18n"));
      if (typeof v === "string") el.textContent = v;
    });
    $$("[data-i18n-ph]").forEach(function (el) {
      var v = t(el.getAttribute("data-i18n-ph"));
      if (typeof v === "string") el.setAttribute("placeholder", v);
    });
    buildGallery();
    buildAmenities();
    buildLocation();
    render();
  }

  /* ---------- SELETTORE LINGUA ---------- */
  var sel = $("#langSelect");
  if (sel) {
    Object.keys(I18N).forEach(function (code) {
      var o = document.createElement("option");
      o.value = code; o.textContent = I18N[code]._label || code.toUpperCase();
      sel.appendChild(o);
    });
    sel.value = LANG;
    sel.addEventListener("change", function () {
      LANG = I18N[sel.value] ? sel.value : "it";
      try { localStorage.setItem(STORE_KEY, LANG); } catch (e) {}
      applyI18n();
    });
  }

  /* ---------- MISC ---------- */
  if ($("#year")) $("#year").textContent = new Date().getFullYear();

  applyI18n();
  } // end boot
})();
