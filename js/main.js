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

  // Disponibilità: i periodi occupati arrivano in diretta dal check-in
  // (endpoint pubblico, solo date — nessun dato personale), con fallback su
  // availability.json (che fornisce comunque minNights e contactEmail).
  var API = "https://checkin.mascarella89.com";
  var AVAIL_FEED = API + "/api/availability";
  // No price feed is loaded here: prices are asked for one stay at a time,
  // only after the visitor has chosen dates.
  Promise.all([
    fetch("availability.json", { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; }),
    fetch(AVAIL_FEED, { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; }),
    Promise.resolve(null)
  ]).then(function (res) {
    var cfg = res[0] || { booked: [], contactEmail: "" };
    var feed = res[1];
    if (feed && (Array.isArray(feed.sopra) || Array.isArray(feed.sotto))) {
      cfg.sopra = feed.sopra || [];
      cfg.sotto = feed.sotto || [];
    } else if (feed && Array.isArray(feed.booked)) {
      cfg.booked = feed.booked;
    }
    boot(cfg);
  });

  function boot(cfg) {
  /* ---------- HELPERS ---------- */
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var pad = function (n) { return n < 10 ? "0" + n : "" + n; };
  var ymd = function (d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
  var parseD = function (s) { var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); };

  var today = new Date(); today.setHours(0, 0, 0, 0);

  // Occupancy count per date: 0 = free, 1 = one apartment taken (partial),
  // 2 = both taken / whole house (full). If the live feed gives per-apartment
  // ranges (sopra/sotto) we derive the three states; otherwise a flat booked
  // list (fallback availability.json) is treated as fully occupied.
  function expandInto(ranges, map) {
    (ranges || []).forEach(function (r) {
      var d = parseD(r.from), end = parseD(r.to);
      while (d <= end) { map[ymd(d)] = true; d = new Date(d.getTime() + 86400000); }
    });
  }
  var occ = {};
  if (cfg.sopra || cfg.sotto) {
    var mA = {}, mB = {};
    expandInto(cfg.sopra, mA);
    expandInto(cfg.sotto, mB);
    Object.keys(mA).forEach(function (k) { occ[k] = (occ[k] || 0) + 1; });
    Object.keys(mB).forEach(function (k) { occ[k] = (occ[k] || 0) + 1; });
  } else {
    var mAll = {};
    expandInto(cfg.booked, mAll);
    Object.keys(mAll).forEach(function (k) { occ[k] = 2; });
  }
  // Deliberately no price on the calendar itself. A visitor browsing the
  // months sees only what is free; the price appears once they pick dates
  // and ask, which is also when it means something — a nightly rate on
  // its own says nothing about cleaning, length-of-stay discounts or the
  // tourist tax.
  var UNIT_KEYS = ["TUTTO", "SOTTO", "SOPRA"];

  var isFull = function (d) { return (occ[ymd(d)] || 0) >= 2; };
  var isPartial = function (d) { return (occ[ymd(d)] || 0) === 1; };
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
      else if (isFull(d)) cell.classList.add("busy");
      else {
        cell.classList.add("free");
        if (isPartial(d)) cell.classList.add("partial");
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
    while (d < end) { if (isFull(d)) return true; d = new Date(d.getTime() + 86400000); }
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

  /* ---------- PREVENTIVO ---------- */
  // The totals are asked of the server, never recomputed here. Airbnb's
  // rules have corners — the long-stay discount skips the cleaning fee,
  // the tourist tax stops after five nights and is capped per person —
  // and a second copy of that arithmetic in the browser would drift from
  // the first the day one of them changed.
  var UNIT_LABEL = { TUTTO: "stays_whole_t", SOTTO: "stays_first_t", SOPRA: "stays_second_t" };
  var quoteSeq = 0;

  function money(n) {
    return "€" + n.toFixed(2).replace(".", ",");
  }

  // The quote box is self-contained: dates from the calendar, guests and
  // an optional code right here, one button. Asking for a price should
  // not mean filling in a name and an email first — those come later,
  // when the visitor has seen the number and wants to go ahead.
  var quoteGuests = 2;
  var quoteCoupon = "";
  var couponOpen = false;

  function money(n) {
    return "€" + n.toFixed(2).replace(".", ",");
  }

  function maxGuestsOverall() { return 5; }

  function controlsHtml(busy) {
    var opts = "";
    for (var g = 1; g <= maxGuestsOverall(); g++) {
      opts += '<option value="' + g + '"' + (g === quoteGuests ? " selected" : "") + ">" + g + "</option>";
    }
    var html =
      '<div class="cal-quote__ask">' +
      '<label class="cal-quote__lbl" for="qGuests">' + t("form_guests") + "</label>" +
      '<select id="qGuests" class="cal-quote__sel">' + opts + "</select>" +
      '<button type="button" id="qGo" class="btn btn--sm"' + (busy ? " disabled" : "") + ">" +
      (busy ? t("price_loading") : t("price_show")) + "</button>" +
      "</div>";
    if (couponOpen) {
      html +=
        '<div class="cal-quote__ask"><input id="qCoupon" class="cal-quote__code" type="text" ' +
        'autocomplete="off" value="' + quoteCoupon.replace(/"/g, "&quot;") + '" placeholder="' +
        t("form_coupon") + '" /></div>';
    } else {
      html += '<button type="button" id="qCouponOpen" class="cal-quote__link">' +
        t("price_have_coupon") + "</button>";
    }
    return html;
  }

  function wireControls() {
    var sel = $("#qGuests");
    if (sel) sel.addEventListener("change", function () {
      quoteGuests = Number(sel.value) || 2;
      var f = $("#fGuests"); if (f) f.value = String(quoteGuests);
    });
    var go = $("#qGo");
    if (go) go.addEventListener("click", askQuote);
    var open = $("#qCouponOpen");
    if (open) open.addEventListener("click", function () {
      couponOpen = true; showPrompt();
      var c = $("#qCoupon"); if (c) c.focus();
    });
    var code = $("#qCoupon");
    if (code) code.addEventListener("input", function () { quoteCoupon = code.value.trim(); });
  }

  /** Before anything is asked: the controls alone, no price. */
  function showPrompt(busy) {
    var box = $("#calQuote");
    if (!box) return;
    if (!selStart || !selEnd) { box.hidden = true; box.innerHTML = ""; return; }
    box.innerHTML = controlsHtml(Boolean(busy));
    box.hidden = false;
    wireControls();
  }

  function renderQuotes(results, coupon) {
    var box = $("#calQuote");
    if (!box) return;
    var bookable = results.filter(function (r) { return r && r.ok; });
    var html = controlsHtml(false);
    if (coupon && coupon.entered && !coupon.valid) {
      html += '<p class="cal-quote__bad">' + t("price_coupon_bad") + "</p>";
    }
    if (!bookable.length) {
      html += '<p class="cal-quote__none">' + t("price_none") + " " + t("price_ask") + "</p>";
      box.innerHTML = html;
      box.hidden = false;
      wireControls();
      return;
    }
    html += '<p class="cal-quote__title">' + t("price_title") + "</p>";
    bookable
      .sort(function (a, b) { return a.quote.total - b.quote.total; })
      .forEach(function (r) {
        var q = r.quote;
        var nightsLabel = q.nights === 1
          ? t("price_night1")
          : t("price_nights").replace("{n}", q.nights);
        var lines = [nightsLabel + " " + money(q.nightsTotal)];
        if (q.extraGuestTotal > 0) lines.push("+ " + money(q.extraGuestTotal));
        if (q.discount > 0) lines.push(t("price_discount") + " −" + money(q.discount));
        if (q.couponDiscount > 0) lines.push(q.couponCode + " −" + money(q.couponDiscount));
        lines.push(t("price_cleaning") + " " + money(q.cleaningFee));
        lines.push(t("price_tax") + " " + money(q.tax));
        html +=
          '<div class="cal-quote__row"><span class="cal-quote__unit">' +
          t(UNIT_LABEL[r.unit]) +
          '</span><span class="cal-quote__tot">' + money(q.total) + "</span>" +
          '<span class="cal-quote__det">' + lines.join(" · ") + "</span></div>";
      });
    html += '<button type="button" id="qBook" class="btn btn--block btn--sm">' +
      t("price_request") + "</button>";
    box.innerHTML = html;
    box.hidden = false;
    wireControls();
    var book = $("#qBook");
    if (book) book.addEventListener("click", function () {
      // Only now are the personal details asked for, with the dates, the
      // guests and any code already carried over.
      var f = $("#fGuests"); if (f) f.value = String(quoteGuests);
      var c = $("#fCoupon"); if (c && quoteCoupon) c.value = quoteCoupon;
      var i = $("#fIn"); if (i) i.value = selStart;
      var o = $("#fOut"); if (o) o.value = selEnd;
      var book2 = document.getElementById("book");
      if (book2) book2.scrollIntoView({ behavior: "smooth", block: "start" });
      var name = $("#fName"); if (name) setTimeout(function () { name.focus(); }, 400);
    });
  }

  function askQuote() {
    if (!selStart || !selEnd) return;
    var seq = ++quoteSeq;
    showPrompt(true);
    Promise.all(UNIT_KEYS.map(function (u) {
      var url = API + "/api/quote?unit=" + u + "&from=" + selStart + "&to=" + selEnd +
        "&guests=" + encodeURIComponent(quoteGuests) +
        (quoteCoupon ? "&coupon=" + encodeURIComponent(quoteCoupon) : "");
      return fetch(url, { cache: "no-store" })
        .then(function (r) { return r.ok ? r.json() : null; })
        .catch(function () { return null; });
    })).then(function (results) {
      // A slower answer to an older selection must not overwrite a newer
      // one: the visitor clicks faster than the network replies.
      if (seq !== quoteSeq) return;
      var withUnit = results.map(function (r, i) {
        return r ? Object.assign({ unit: UNIT_KEYS[i] }, r) : null;
      });
      var cp = null;
      withUnit.forEach(function (r) { if (r && r.coupon) cp = r.coupon; });
      renderQuotes(withUnit, cp);
    });
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
      // Choosing dates offers the price; it does not fetch it. One click
      // more, three requests fewer while the visitor is still picking.
      showPrompt();
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

  /* ---------- RECENSIONI ---------- */
  // Vengono dagli annunci Airbnb e sono gia' pubbliche la', con il solo
  // nome di battesimo. Se la chiamata fallisce la sezione resta nascosta:
  // una sezione "Cosa dicono gli ospiti" vuota dice la cosa sbagliata.
  var UNIT_SHORT = { TUTTO: "stays_whole_t", SOTTO: "stays_first_t", SOPRA: "stays_second_t" };

  function escapeHtml(x) {
    return String(x).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function buildReviews(data) {
    var section = document.getElementById("reviews");
    var list = $("#revList");
    if (!section || !list || !data || !data.reviews || !data.reviews.length) return;
    var all = data.reviews;
    var STEP = 6;
    var shown = STEP;

    // Il voto in cima alla pagina: e' la prima cosa che convince, e qui
    // e' un numero vero, non una grafica. Se le recensioni non arrivano
    // resta nascosto.
    var hero = document.getElementById("heroRating");
    if (hero && data.average) {
      hero.innerHTML =
        '<span class="hero__rating-num">★ ' +
        data.average.toFixed(2).replace(".", ",") +
        '</span><span class="hero__rating-sub">' + t("rev_outof") + "</span>";
      hero.hidden = false;
    }

    var sub = $("#revSub");
    if (sub) {
      sub.textContent =
        (data.average ? data.average.toFixed(2).replace(".", ",") + " ★ · " : "") +
        all.length + " " + t("rev_sub");
    }

    function stars(n) {
      if (!n) return "";
      // Stelle piene e vuote, piu' il numero: le stelle si leggono di
      // colpo, il numero toglie ogni dubbio su quante siano.
      var full = "";
      for (var i = 1; i <= 5; i++) full += i <= n ? "★" : "☆";
      return '<span class="review__stars" aria-label="' + n + '/5">' + full +
        '<span class="review__score">' + n + "</span></span>";
    }

    function draw() {
      list.innerHTML = all.slice(0, shown).map(function (r) {
        var unit = r.unit && UNIT_SHORT[r.unit] ? t(UNIT_SHORT[r.unit]) : "";
        return '<figure class="review">' +
          stars(r.rating) +
          '<blockquote class="review__text">' + escapeHtml(r.body) + "</blockquote>" +
          '<figcaption class="review__by">' +
          "<strong>" + escapeHtml(r.author) + "</strong>" +
          (r.when ? ' <span class="review__when">' + escapeHtml(r.when) + "</span>" : "") +
          (unit ? ' <span class="review__unit">' + escapeHtml(unit) + "</span>" : "") +
          "</figcaption></figure>";
      }).join("");
    }

    draw();
    section.hidden = false;
    var more = $("#revMore");
    if (more) {
      // Sostituito invece di riusato: ricaricando in un'altra lingua il
      // vecchio ascoltatore punterebbe alla lista precedente.
      var fresh = more.cloneNode(true);
      more.parentNode.replaceChild(fresh, more);
      fresh.textContent = t("rev_all");
      // Sei alla volta, non tutte in blocco: trenta schede aperte di
      // colpo spingono il resto della pagina fuori dalla vista.
      fresh.addEventListener("click", function () {
        shown = Math.min(shown + STEP, all.length);
        draw();
        fresh.hidden = shown >= all.length;
      });
      fresh.hidden = shown >= all.length;
    }
  }

  // Le recensioni arrivano gia' tradotte nella lingua scelta: la
  // traduzione e' fatta una volta all'importazione, non qui, cosi' il
  // visitatore non aspetta nessun traduttore.
  function loadReviews() {
    fetch(API + "/api/reviews?lang=" + encodeURIComponent(LANG), { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(buildReviews)
      .catch(function () { /* sezione nascosta */ });
  }
  window.__reloadReviews = loadReviews;
  loadReviews();

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
      t("form_guests") + ": " + f.guests.value + "\n" +
      // Mostra da quale messaggio arriva chi scrive: il codice e' l'unico
      // modo per sapere se un messaggio post-soggiorno ha funzionato.
      t("form_coupon") + ": " + (f.coupon && f.coupon.value ? f.coupon.value : "—") + "\n\n" +
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
      // Le recensioni non sono testo del sito: vanno richieste di nuovo,
      // perche' la loro traduzione vive sul server.
      if (window.__reloadReviews) window.__reloadReviews();
    });
  }

  /* ---------- MISC ---------- */
  if ($("#year")) $("#year").textContent = new Date().getFullYear();

  applyI18n();
  } // end boot
})();
