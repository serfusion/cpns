/* Mode Hafalan (menu "Hafalan kalimat"): kartu soal dengan kalimat jawaban terbaik dan pembahasannya, untuk dihafal.
   Dua versi, sesuai permintaan pemilik:
   - Ringkas: soal pendek dari bank lama (mudah dihafal kalimatnya);
   - Persis CAT: soal setara CAT (data/setara.js), kasus panjang dengan opsi seimbang.
   Prioritas TWK dan TKP; TIU hanya materi tanpa hitungan. Soal yang sudah ditandai hafal disimpan di perangkat ini. */
(function () {
  "use strict";
  var SKD = (window.SKD = window.SKD || {});
  var KEY = "skd.hafalan.v1";
  var TIU_LUNAK = ["sil", "ind", "anl", "der"];
  var LET = ["A", "B", "C", "D", "E"];

  function baca() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function tulis(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { /* mode privat */ } }
  function keadaan() {
    var d = baca();
    return {
      versi: d.versi === "persis" ? "persis" : "ringkas",
      sec: ["twk", "tkp", "tiu"].indexOf(d.sec) >= 0 ? d.sec : "twk",
      m: typeof d.m === "string" ? d.m.slice(0, 20) : "",
      buka: d.buka === true, sembunyi: d.sembunyi !== false, daftar: d.daftar === true,
      i: Math.max(0, Math.round(Number(d.i) || 0)),
      hafal: d.hafal && typeof d.hafal === "object" ? d.hafal : {}
    };
  }

  SKD.hafalanView = function (ctx) {
    var h = ctx.h, E = SKD.engine, CFG = SKD.config, S = keadaan();
    function simpan() { tulis(S); }
    var bank = E.bank().filter(function (q) {
      if (q.sec !== S.sec || !Array.isArray(q.o) || q.tb) return false;
      if (S.sec === "tiu" && TIU_LUNAK.indexOf(q.m) < 0) return false;
      if (S.versi === "persis" ? !q.setara : q.setara) return false;
      var m = E.materi(q.m);
      return !(m && m.lama) && (!S.m || q.m === S.m);
    });
    // urutan: sangat sering keluar dulu, lalu sering, lalu sisanya (urutan bank)
    bank = bank.map(function (q, i) { return { q: q, i: i, w: q.sangat ? 0 : q.hot ? 1 : 2 }; })
      .sort(function (a, b) { return a.w - b.w || a.i - b.i; }).map(function (x) { return x.q; });
    var semua = bank.length, nHafal = bank.filter(function (q) { return S.hafal[q.id]; }).length;
    var L = S.sembunyi ? bank.filter(function (q) { return !S.hafal[q.id]; }) : bank;
    if (S.i >= L.length) S.i = 0;
    var materiSec = CFG.materi.filter(function (m) { return m.sec === S.sec && !m.lama && (S.sec !== "tiu" || TIU_LUNAK.indexOf(m.id) >= 0); });

    function jawaban(q) {
      var tkp = q.sec === "tkp", best = tkp ? 0 : q.a || 0;
      return h("div", { class: "hf-jawab" },
        h("p", { class: "hf-kunci" }, h("span", { class: "tag ok" }, tkp ? "Nilai 5" : "Jawaban benar"), " ", q.o[best]),
        tkp ? h("ol", { class: "hf-urut", start: 2 }, [1, 2, 3, 4].map(function (k) {
          return h("li", null, h("span", { class: "tag" }, "Nilai " + (5 - k)), " ", q.o[k]);
        })) : null,
        q.x ? h("p", { class: "hf-x" }, h("b", null, "Kalimat kunci: "), q.x) : null);
    }
    function kartu(q, no) {
      var m = E.materi(q.m), terbuka = S.buka || S.daftar;
      var tombolBuka = h("button", { class: "btn sm", type: "button", "aria-expanded": "false", onclick: function (e) {
        var box = e.currentTarget.parentNode.querySelector(".hf-jawab-wadah");
        var buka = box.hidden; box.hidden = !buka;
        e.currentTarget.setAttribute("aria-expanded", buka ? "true" : "false"); e.currentTarget.textContent = buka ? "Tutup jawaban" : "Lihat jawaban";
      } }, "Lihat jawaban");
      return h("article", { class: "card hf-card" },
        h("div", { class: "row between" }, h("span", { class: "small muted" }, (no != null ? no + " · " : "") + (m ? m.name : "")),
          h("span", { class: "row tight" }, q.sangat ? h("span", { class: "tag hot" }, "sangat sering keluar") : q.hot ? h("span", { class: "tag warn" }, "sering keluar") : null,
            S.hafal[q.id] ? h("span", { class: "tag ok" }, "sudah hafal") : null)),
        q.p && SKD.passages[q.p] ? h("div", { class: "passage" }, SKD.passages[q.p]) : null,
        h("p", { class: "hf-soal" }, q.q),
        terbuka ? null : tombolBuka,
        h("div", { class: "hf-jawab-wadah", hidden: !terbuka }, jawaban(q)),
        h("div", { class: "row" }, h("button", { class: "btn sm ghost", type: "button", "aria-pressed": S.hafal[q.id] ? "true" : "false", onclick: function () {
          if (S.hafal[q.id]) delete S.hafal[q.id]; else S.hafal[q.id] = 1;
          simpan(); ctx.rerender();
        } }, S.hafal[q.id] ? "✓ Sudah hafal" : "Tandai sudah hafal")));
    }
    var seg = function (key, opsi) {
      return h("div", { class: "seg", role: "group" }, opsi.map(function (o) {
        return h("button", { type: "button", "aria-pressed": S[key] === o[0] ? "true" : "false", onclick: function () { S[key] = o[0]; S.i = 0; if (key === "sec") S.m = ""; simpan(); ctx.rerender(); } }, o[1]);
      }));
    };
    var isi;
    if (!L.length) isi = h("p", { class: "note" }, semua ? "Semua kartu di pilihan ini sudah ditandai hafal. Matikan \"Sembunyikan yang sudah hafal\" untuk mengulang." : "Belum ada soal untuk pilihan ini.");
    else if (S.daftar) isi = h("div", { class: "stack" }, L.map(function (q, i) { return kartu(q, i + 1); }));
    else isi = h("div", { class: "stack" },
      kartu(L[S.i], (S.i + 1) + " / " + L.length),
      h("div", { class: "row between hf-nav" },
        h("button", { class: "btn", type: "button", disabled: S.i <= 0, onclick: function () { S.i--; simpan(); ctx.rerender(); } }, "‹ Sebelumnya"),
        h("button", { class: "btn primary", type: "button", id: "hf-lanjut", onclick: function () { S.i = (S.i + 1) % L.length; simpan(); ctx.rerender(); } }, "Berikutnya ›")));
    return [
      h("div", { class: "page-head" }, h("h1", null, "Hafalan kalimat"),
        h("p", { class: "lede" }, "Kartu soal dengan kalimat jawaban terbaik dan pembahasannya. Versi Ringkas: soal pendek yang mudah dihafal. Versi Persis CAT: kasus panjang seperti di CAT BKN. Prioritas TWK dan TKP.")),
      h("section", { class: "card stack" },
        h("div", { class: "field" }, h("span", { class: "label" }, "Versi"), seg("versi", [["ringkas", "Ringkas (hafalan)"], ["persis", "Persis CAT BKN"]])),
        h("div", { class: "field" }, h("span", { class: "label" }, "Subtes"), seg("sec", [["twk", "TWK"], ["tkp", "TKP"], ["tiu", "TIU tanpa hitungan"]])),
        h("label", { class: "field" }, h("span", { class: "label" }, "Materi"),
          h("select", { class: "input wide", id: "hf-materi", onchange: function (e) { S.m = e.target.value; S.i = 0; simpan(); ctx.rerender(); } },
            [h("option", { value: "" }, "Semua materi")].concat(materiSec.map(function (m) { return h("option", { value: m.id, selected: S.m === m.id }, m.name); })))),
        h("div", { class: "row" },
          h("label", { class: "check" }, h("input", { type: "checkbox", checked: S.buka, onchange: function (e) { S.buka = e.target.checked; simpan(); ctx.rerender(); } }), h("span", null, "Jawaban langsung terbuka")),
          h("label", { class: "check" }, h("input", { type: "checkbox", checked: S.sembunyi, onchange: function (e) { S.sembunyi = e.target.checked; S.i = 0; simpan(); ctx.rerender(); } }), h("span", null, "Sembunyikan yang sudah hafal")),
          h("label", { class: "check" }, h("input", { type: "checkbox", checked: S.daftar, onchange: function (e) { S.daftar = e.target.checked; simpan(); ctx.rerender(); } }), h("span", null, "Tampilkan sebagai daftar"))),
        h("p", { class: "small muted" }, semua + " kartu · " + nHafal + " sudah hafal · sangat sering keluar ditampilkan lebih dulu.")),
      isi
    ];
  };
})();
