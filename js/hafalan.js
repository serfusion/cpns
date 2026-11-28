/* Tab Hafalan: Hafalan cepat (versi 3). Daftar singkat "kunci = jawaban" per bagian, seperti catatan notepad pemilik.
   Data: data/cepat.js (SKD.cepatData); bagian "Kata baku" diambil dari data/fakta.js.
   "Tutup jawaban" mengaburkan jawaban sampai baris diketuk (latihan mengingat). Pilihan disimpan di perangkat ini. */
(function () {
  "use strict";
  var SKD = (window.SKD = window.SKD || {});
  var KEY = "skd.cepat.v1";

  function baca() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function tulis(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { /* mode privat */ } }
  function bagian() {
    var F = SKD.fakta;
    return (SKD.cepatData || []).map(function (b) {
      if (b.dari) return { id: b.id, t: b.t, sep: "→", r: F && Array.isArray(F[b.dari]) ? F[b.dari].map(function (p) { return [p[1], p[0]]; }) : [] };
      return b;
    }).filter(function (b) { return b.r && b.r.length; });
  }
  SKD.cepat = { jumlah: function () { return bagian().reduce(function (a, b) { return a + b.r.length; }, 0); } };

  SKD.hafalanView = function (ctx) {
    var h = ctx.h, B = bagian(), S = baca();
    if (!B.length) return [h("p", null, "Data hafalan belum dimuat.")];
    var pilih = B.filter(function (b) { return b.id === S.b; })[0] || B[0], tutup = S.tutup === true;
    function simpan() { tulis({ b: pilih.id, tutup: tutup }); }
    function buka(e) { e.currentTarget.classList.toggle("buka"); }
    var lanjut = B[B.indexOf(pilih) + 1] || null; // urut bagian demi bagian, seperti alur catatan
    var daftar = h("ul", { class: "cepat" + (tutup ? " tutup" : "") + (pilih.sep === "→" ? " baku" : ""), id: "cp-list" }, pilih.r.map(function (r) {
      return h("li", tutup ? { tabindex: 0, role: "button", "aria-label": r[0], onclick: buka,
        onkeydown: function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); buka(e); } } } : null,
        h("b", { class: "cp-k" }, r[0]), h("span", { class: "cp-s", "aria-hidden": "true" }, " " + (pilih.sep || "=") + " "), h("span", { class: "cp-j" }, r[1]));
    }));
    var pils = h("div", { class: "pils", role: "group", "aria-label": "Bagian" }, B.map(function (b) {
      return h("button", { class: "pil", type: "button", "aria-pressed": b === pilih ? "true" : "false", onclick: function () { pilih = b; simpan(); ctx.rerender(); } },
        b.t, h("span", { class: "n" }, String(b.r.length)));
    }));
    setTimeout(function () { // pil yang aktif selalu terlihat di baris yang bisa digeser
      var a = pils.querySelector('[aria-pressed="true"]');
      if (a) pils.scrollLeft = Math.max(0, a.offsetLeft - pils.offsetLeft - 16);
    }, 0);
    return [
      h("div", { class: "page-head" }, h("h1", null, "Hafalan cepat"),
        h("p", { class: "meta" }, h("b", null, String(SKD.cepat.jumlah())), " baris · ", h("b", null, String(B.length)), " bagian")),
      pils,
      h("label", { class: "check" }, h("input", { type: "checkbox", id: "cp-tutup", checked: tutup, onchange: function (e) { tutup = e.target.checked; simpan(); ctx.rerender(); } }),
        h("span", null, "Tutup jawaban · ketuk untuk buka")),
      h("section", { class: "card", "aria-label": pilih.t }, h("p", { class: "lbl" }, pilih.t), daftar,
        lanjut ? h("button", { class: "btn block", type: "button", id: "cp-lanjut", onclick: function () { pilih = lanjut; simpan(); ctx.rerender(); window.scrollTo(0, 0); } },
          "Berikutnya: " + lanjut.t + " ›") : null),
      h("p", { class: "meta center" }, h("a", { href: "https://github.com/serfusion/cpns/releases?q=Audio+Hafalan", target: "_blank", rel: "noopener" }, "Audio hafalan (MP3) ↗"))
    ];
  };
})();
