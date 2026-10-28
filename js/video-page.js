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

  // Order and labels follow js/i18n.js so these pages read like the rest
  // of the site. Arabic is the only right-to-left entry.
  var LANGS = ["it", "en", "de", "es", "fr", "pt", "ro", "ru", "zh", "el", "ar", "ja"];
  var LABELS = {
    it: "Italiano",
    en: "English",
    de: "Deutsch",
    es: "Español",
    fr: "Français",
    pt: "Português",
    ro: "Română",
    ru: "Русский",
    zh: "中文",
    el: "Ελληνικά",
    ar: "العربية",
    ja: "日本語",
  };
  var RTL = { ar: true };

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
      de: {
        title: "So holen Sie die Schlüssel ab",
        sub: "Das Video zeigt, wo der Schlüsselkasten am Eingang hängt, wie Sie den Code eingeben und wohin die Schlüssel bei der Abreise zurückkommen.",
      },
      pt: {
        title: "Como pegar as chaves",
        sub: "O vídeo mostra onde fica a caixa das chaves na entrada, como inserir o código e onde devolver as chaves na partida.",
      },
      ro: {
        title: "Cum se ridică cheile",
        sub: "Videoclipul arată unde se află cutia de chei la intrare, cum se introduce codul și unde se pun cheile la plecare.",
      },
      ru: {
        title: "Как забрать ключи",
        sub: "В видео показано, где у входа находится ящик с ключами, как ввести код и куда положить ключи при отъезде.",
      },
      el: {
        title: "Πώς να παραλάβετε τα κλειδιά",
        sub: "Το βίντεο δείχνει πού βρίσκεται το κουτί κλειδιών στην είσοδο, πώς να εισαγάγετε τον κωδικό και πού αφήνετε τα κλειδιά κατά την αναχώρηση.",
      },
      ar: {
        title: "كيفية استلام المفاتيح",
        sub: "يوضح الفيديو مكان صندوق المفاتيح عند المدخل، وكيفية إدخال الرمز، وأين تُعيد المفاتيح عند المغادرة.",
      },
      ja: {
        title: "鍵の受け取り方",
        sub: "入口のキーボックスの場所、暗証番号の入力方法、チェックアウト時の鍵の返却場所を動画で説明します。",
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
      de: {
        title: "Wohnung 1 — so finden Sie sie",
        sub: "Das Video zeigt den Weg von der Haustür bis zur Tür von Wohnung 1, Stockwerk für Stockwerk.",
      },
      pt: {
        title: "Apartamento 1 — como chegar",
        sub: "O vídeo mostra o percurso desde a porta da rua até à porta do apartamento 1, andar a andar.",
      },
      ro: {
        title: "Apartamentul 1 — cum se ajunge",
        sub: "Videoclipul arată drumul de la poarta de la stradă până la ușa apartamentului 1, etaj cu etaj.",
      },
      ru: {
        title: "Квартира 1 — как добраться",
        sub: "В видео показан путь от входной двери до двери квартиры 1, этаж за этажом.",
      },
      el: {
        title: "Διαμέρισμα 1 — πώς θα φτάσετε",
        sub: "Το βίντεο δείχνει τη διαδρομή από την εξώπορτα μέχρι την πόρτα του διαμερίσματος 1, όροφο προς όροφο.",
      },
      ar: {
        title: "الشقة 1 — كيفية الوصول",
        sub: "يوضح الفيديو الطريق من باب الشارع حتى باب الشقة 1، طابقًا بطابق.",
      },
      ja: {
        title: "アパート 1 への行き方",
        sub: "通りの入口から 1 号室のドアまでの道順を、階ごとに動画で案内します。",
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
      de: {
        title: "Wohnung 2 — so finden Sie sie",
        sub: "Das Video zeigt den Weg von der Haustür bis zur Tür von Wohnung 2, Stockwerk für Stockwerk.",
      },
      pt: {
        title: "Apartamento 2 — como chegar",
        sub: "O vídeo mostra o percurso desde a porta da rua até à porta do apartamento 2, andar a andar.",
      },
      ro: {
        title: "Apartamentul 2 — cum se ajunge",
        sub: "Videoclipul arată drumul de la poarta de la stradă până la ușa apartamentului 2, etaj cu etaj.",
      },
      ru: {
        title: "Квартира 2 — как добраться",
        sub: "В видео показан путь от входной двери до двери квартиры 2, этаж за этажом.",
      },
      el: {
        title: "Διαμέρισμα 2 — πώς θα φτάσετε",
        sub: "Το βίντεο δείχνει τη διαδρομή από την εξώπορτα μέχρι την πόρτα του διαμερίσματος 2, όροφο προς όροφο.",
      },
      ar: {
        title: "الشقة 2 — كيفية الوصول",
        sub: "يوضح الفيديو الطريق من باب الشارع حتى باب الشقة 2، طابقًا بطابق.",
      },
      ja: {
        title: "アパート 2 への行き方",
        sub: "通りの入口から 2 号室のドアまでの道順を、階ごとに動画で案内します。",
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
    de: {
      pick: "Wählen Sie Ihre Sprache",
      fallback: "Wenn das Video nicht startet,", open: "hier öffnen", close: "Schließen",
      guide_title: "Bologna in 3 Tagen",
      guide_sub: "Tipps, Essen und versteckte Schätze von Ihren Gastgebern vor Ort.",
      guide_meta: "PDF · ca. 3 MB",
    },
    pt: {
      pick: "Escolha o seu idioma",
      fallback: "Se o vídeo não iniciar,", open: "abra aqui", close: "Fechar",
      guide_title: "Bolonha em 3 dias",
      guide_sub: "Dicas, sabores e tesouros escondidos dos seus anfitriões locais.",
      guide_meta: "PDF · cerca de 3 MB",
    },
    ru: {
      pick: "Выберите язык",
      fallback: "Если видео не воспроизводится,", open: "откройте здесь", close: "Закрыть",
      guide_title: "Болонья за 3 дня",
      guide_sub: "Советы, еда и скрытые сокровища от ваших местных хозяев.",
      guide_meta: "PDF · около 3 МБ",
    },
    el: {
      pick: "Επιλέξτε τη γλώσσα σας",
      fallback: "Αν το βίντεο δεν ξεκινήσει,", open: "ανοίξτε το εδώ", close: "Κλείσιμο",
      guide_title: "Η Μπολόνια σε 3 ημέρες",
      guide_sub: "Συμβουλές, γεύσεις και κρυμμένοι θησαυροί από τους τοπικούς οικοδεσπότες σας.",
      guide_meta: "PDF · περίπου 3 MB",
    },
    ar: {
      pick: "اختر لغتك",
      fallback: "إذا لم يبدأ الفيديو،", open: "افتحه هنا", close: "إغلاق",
      guide_title: "بولونيا في 3 أيام",
      guide_sub: "نصائح ومأكولات وكنوز خفية من مضيفيك المحليين.",
      guide_meta: "PDF · نحو 3 ميغابايت",
    },
    ja: {
      pick: "言語を選択してください",
      fallback: "動画が再生されない場合は、", open: "こちらから開く", close: "閉じる",
      guide_title: "ボローニャ 3 日間",
      guide_sub: "地元ホストからのおすすめ、グルメ、隠れた名所。",
      guide_meta: "PDF · 約 3 MB",
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
    // Arabic reads right-to-left: flip the document so the cards, the play
    // badges and the guide row mirror instead of reading backwards.
    document.documentElement.setAttribute("dir", RTL[lang] ? "rtl" : "ltr");

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
