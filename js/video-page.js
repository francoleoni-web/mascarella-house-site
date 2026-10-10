/* Instruction-video pages: hero translation + player.

   The five video cards are each labelled in their own language, but the
   heading above them was Italian only, so a guest who reads none of it
   landed on a wall of text they could not place. The hero now follows a
   language picker, pre-selected from the browser's own language.

   The markup ships the Italian copy, so the page still reads correctly if
   this script never runs. */
(function () {
  "use strict";

  var STORE = "m89_lang"; // shared with the main site's language selector

  var LANGS = ["it", "en", "es", "fr", "zh"];
  var LABELS = {
    it: "Italiano",
    en: "English",
    es: "Español",
    fr: "Français",
    zh: "中文",
  };

  var T = {
    keybox: {
      it: {
        title: "Come prendere le chiavi",
        sub: "Il video mostra dove si trova la cassetta delle chiavi all'ingresso, come inserire il codice e come riporre le chiavi alla partenza.",
      },
      en: {
        title: "How to collect the keys",
        sub: "The video shows where the key box is at the entrance, how to enter the code, and where to put the keys back when you leave.",
      },
      es: {
        title: "Cómo recoger las llaves",
        sub: "El vídeo muestra dónde está la caja de llaves en la entrada, cómo introducir el código y dónde dejar las llaves al marcharte.",
      },
      fr: {
        title: "Comment récupérer les clés",
        sub: "La vidéo montre où se trouve la boîte à clés à l'entrée, comment saisir le code et où ranger les clés au moment du départ.",
      },
      zh: {
        title: "如何取钥匙",
        sub: "视频介绍钥匙盒在入口的位置、如何输入密码，以及离开时如何把钥匙放回原处。",
      },
    },
    apt1: {
      it: {
        title: "Appartamento 1 — come arrivare",
        sub: "Il video mostra il percorso dal portone di strada fino alla porta dell'appartamento 1, piano per piano.",
      },
      en: {
        title: "Apartment 1 — how to get there",
        sub: "The video shows the way from the street door up to the door of apartment 1, floor by floor.",
      },
      es: {
        title: "Apartamento 1 — cómo llegar",
        sub: "El vídeo muestra el recorrido desde el portal de la calle hasta la puerta del apartamento 1, piso a piso.",
      },
      fr: {
        title: "Appartement 1 — comment y accéder",
        sub: "La vidéo montre le trajet depuis la porte de la rue jusqu'à la porte de l'appartement 1, étage par étage.",
      },
      zh: {
        title: "1 号公寓 — 如何前往",
        sub: "视频展示从临街大门到 1 号公寓门口的路线，逐层指引。",
      },
    },
    apt2: {
      it: {
        title: "Appartamento 2 — come arrivare",
        sub: "Il video mostra il percorso dal portone di strada fino alla porta dell'appartamento 2, piano per piano.",
      },
      en: {
        title: "Apartment 2 — how to get there",
        sub: "The video shows the way from the street door up to the door of apartment 2, floor by floor.",
      },
      es: {
        title: "Apartamento 2 — cómo llegar",
        sub: "El vídeo muestra el recorrido desde el portal de la calle hasta la puerta del apartamento 2, piso a piso.",
      },
      fr: {
        title: "Appartement 2 — comment y accéder",
        sub: "La vidéo montre le trajet depuis la porte de la rue jusqu'à la porte de l'appartement 2, étage par étage.",
      },
      zh: {
        title: "2 号公寓 — 如何前往",
        sub: "视频展示从临街大门到 2 号公寓门口的路线，逐层指引。",
      },
    },
  };

  var UI = {
    it: {
      pick: "Scegli la tua lingua",
      fallback: "Se il video non parte,", open: "aprilo qui", close: "Chiudi",
      guide_title: "Bologna in 3 giorni",
      guide_sub: "Consigli, sapori e tesori nascosti dai tuoi host del posto.",
      guide_meta: "PDF · circa 3 MB",
    },
    en: {
      pick: "Choose your language",
      fallback: "If the video does not start,", open: "open it here", close: "Close",
      guide_title: "Bologna in 3 days",
      guide_sub: "Tips, food and hidden treasures from your local hosts.",
      guide_meta: "PDF · about 3 MB",
    },
    es: {
      pick: "Elige tu idioma",
      fallback: "Si el vídeo no se reproduce,", open: "ábrelo aquí", close: "Cerrar",
      guide_title: "Bolonia en 3 días",
      guide_sub: "Consejos, sabores y tesoros escondidos de tus anfitriones locales.",
      guide_meta: "PDF · unos 3 MB",
    },
    fr: {
      pick: "Choisissez votre langue",
      fallback: "Si la vidéo ne démarre pas,", open: "ouvrez-la ici", close: "Fermer",
      guide_title: "Bologne en 3 jours",
      guide_sub: "Conseils, saveurs et trésors cachés de vos hôtes sur place.",
      guide_meta: "PDF · environ 3 Mo",
    },
    zh: {
      pick: "选择您的语言",
      fallback: "如果视频无法播放，", open: "点此打开", close: "关闭",
      guide_title: "博洛尼亚三日游",
      guide_sub: "来自本地房东的建议、美食与隐藏的宝藏。",
      guide_meta: "PDF · 约 3 MB",
    },
  };

  var root = document.querySelector("[data-topic]");
  var topic = root ? root.getAttribute("data-topic") : null;
  var dict = topic && T[topic];

  // ---- language -----------------------------------------------------------

  function initialLang() {
    var saved = null;
    try { saved = localStorage.getItem(STORE); } catch (e) {}
    if (saved && dict && dict[saved]) return saved;
    var nav = (navigator.language || "it").slice(0, 2).toLowerCase();
    return dict && dict[nav] ? nav : "it";
  }

  function apply(lang) {
    if (!dict || !dict[lang]) return;
    var titleEl = document.querySelector("[data-vt='title']");
    var subEl = document.querySelector("[data-vt='sub']");
    if (titleEl) titleEl.textContent = dict[lang].title;
    if (subEl) subEl.textContent = dict[lang].sub;

    var ui = UI[lang] || UI.it;
    var pickEl = document.querySelector("[data-vt='pick']");
    if (pickEl) pickEl.textContent = ui.pick;
    var fbEl = document.querySelector("[data-vt='fallback']");
    if (fbEl) fbEl.textContent = ui.fallback + " ";
    var openEl = document.getElementById("vfallback");
    if (openEl) openEl.textContent = ui.open;
    var closeEl = document.getElementById("vclose");
    if (closeEl) closeEl.setAttribute("aria-label", ui.close);

    // Bologna guide card — present on the apartment pages only.
    ["guide_title", "guide_sub", "guide_meta"].forEach(function (k) {
      var el = document.querySelector("[data-vt='" + k + "']");
      if (el && ui[k]) el.textContent = ui[k];
    });
    // Point the guest at their own PDF without hiding the other four.
    Array.prototype.forEach.call(
      document.querySelectorAll("[data-glang]"),
      function (a) {
        a.classList.toggle("is-on", a.getAttribute("data-glang") === lang);
      }
    );

    // The page keeps its Italian lang attribute only until we know better;
    // screen readers need the right one to pronounce the heading.
    document.documentElement.setAttribute("lang", lang);

    Array.prototype.forEach.call(
      document.querySelectorAll("[data-lang]"),
      function (b) {
        var on = b.getAttribute("data-lang") === lang;
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      }
    );
    try { localStorage.setItem(STORE, lang); } catch (e) {}
  }

  var picker = document.getElementById("vlangs");
  if (picker && dict) {
    LANGS.forEach(function (code) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "vlang";
      b.setAttribute("data-lang", code);
      b.textContent = LABELS[code];
      b.addEventListener("click", function () { apply(code); });
      picker.appendChild(b);
    });
    apply(initialLang());
  }

  // ---- player -------------------------------------------------------------

  var modal = document.getElementById("vmodal");
  var video = document.getElementById("vplayer");
  var closeBtn = document.getElementById("vclose");
  var fallback = document.getElementById("vfallback");
  if (!modal || !video) return;

  var lastFocused = null;

  function open(src, label) {
    lastFocused = document.activeElement;
    video.src = src;
    video.setAttribute("aria-label", label || "");
    if (fallback) fallback.href = src;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    // Autoplay can be refused (iOS low-power mode, data saver); the native
    // controls are visible either way, so a rejected promise is harmless.
    var p = video.play();
    if (p && typeof p.catch === "function") p.catch(function () {});
    if (closeBtn) closeBtn.focus();
  }

  function close() {
    video.pause();
    // Drop the source so a half-buffered clip stops downloading in the
    // background — guests are often on mobile data.
    video.removeAttribute("src");
    video.load();
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  Array.prototype.forEach.call(
    document.querySelectorAll("[data-video]"),
    function (btn) {
      btn.addEventListener("click", function () {
        open(btn.getAttribute("data-video"), btn.getAttribute("data-label"));
      });
    }
  );

  if (closeBtn) closeBtn.addEventListener("click", close);
  modal.addEventListener("click", function (e) {
    if (e.target === modal) close();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.hidden) close();
  });
})();
