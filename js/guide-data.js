/* Struttura della guida "Bologna in 3 giorni" — indipendente dalla lingua.
   I testi (nomi, descrizioni, consigli, orari) stanno in js/guide-i18n.js,
   indicizzati per chiave `k`. Qui: ordine, indirizzi, telefoni e immagini
   (gli indici img → assets/img/guide/gNN.jpg). */
window.GUIDE_DATA = {
  days: [
    { title: "d1_title", groups: [
      { h: "h_morning_walk", places: [
        { k: "jewish", imgs: [] },
        { k: "finestrella", imgs: [1, 2], tip: true },
        { k: "piazza", imgs: [3, 4], tip: true }
      ]},
      { h: "h_breakfast", places: [
        { k: "risto", imgs: [], addr: "Via Irnerio, 17a, 40124 Bologna BO", phone: "+39 051 5872536", tel: "+390515872536", hours: true },
        { k: "pappare", imgs: [5, 6], addr: "Via de' Giudei, 2d, 40126 Bologna BO", phone: "+39 051 0954088", tel: "+390510954088", hours: true, tip: true, alt: true }
      ]},
      { h: "h_lunch", places: [
        { k: "bottega", imgs: [7, 8], addr: "P.za di Porta Ravegnana, 2b, 40126 Bologna BO", phone: "+39 051 2964231", tel: "+390512964231", hours: true, tip: true }
      ]},
      { h: "h_dinner", places: [
        { k: "vamola", imgs: [9, 10], addr: "Via delle Moline, 3a, 40126 Bologna BO", phone: "+39 051 237201", tel: "+39051237201", hours: true, tip: true }
      ]}
    ]},
    { title: "d2_title", groups: [
      { h: "h_morning", places: [
        { k: "sanluca", imgs: [11, 12], tip: true, besttime: true }
      ]},
      { h: "h_afternoon_shopping", places: [
        { k: "indipendenza", imgs: [13] },
        { k: "cavour", imgs: [14], tip: true }
      ]},
      { h: "h_breakfast", places: [
        { k: "corner", imgs: [15, 16], addr: "Via Saragozza, 37a, 40123 Bologna BO", phone: "+39 388 8186606", tel: "+393888186606", hours: true }
      ]},
      { h: "h_lunch", places: [
        { k: "altero", imgs: [17, 18], addr: "Via dell'Indipendenza, 33c, 40121 Bologna BO", phone: "+39 051 234758", tel: "+39051234758", hours: true, tip: true }
      ]},
      { h: "h_aperitivo", places: [
        { k: "donzelle", imgs: [19, 20], addr: "Via delle Donzelle, 4/3, 40126 Bologna BO", phone: "+39 051 264525", tel: "+39051264525", hours: true, tip: true }
      ]}
    ]},
    { title: "d3_title", groups: [
      { h: "h_morning_walk", places: [
        { k: "isolani", imgs: [21, 22], tip: true },
        { k: "santostefano", imgs: [23], tip: true }
      ]},
      { h: "h_afternoon", places: [
        { k: "giardini", imgs: [24] },
        { k: "serre", imgs: [] }
      ]},
      { h: "h_breakfast", places: [
        { k: "roxy", imgs: [25, 26], addr: "Via Rizzoli, 9, 40125 Bologna BO", phone: "+39 051 5060498", tel: "+390515060498", hours: true, tip: true }
      ]}
    ]}
  ],
  daytrips: [
    { k: "riviera", imgs: [27] },
    { k: "florence", imgs: [] }
  ],
  vintage: { k: "vintage", imgs: [28], addr: "P.le Camillo Baldi, 40126 Bologna BO", open: true, tip: true }
};
