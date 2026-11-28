/* Tab Formasi > Gaji: perkiraan penghasilan bulanan CPNS/PNS per instansi pusat dan instansi dengan tukin tertinggi
   untuk kelas jabatan yang dipilih (gaji pokok PP 5/2024, tukin menurut Perpres tiap instansi).
   Teknik REA: fitur dipelajari dari situs pembanding sebagai pengunjung; kode, teks, dan tampilan ditulis sendiri, angka
   diambil ulang dari dokumen resmi (data/tunjangan.js). Pilihan pengguna disimpan di localStorage perangkat ini saja. */
(function () {
  "use strict";
  var SKD = (window.SKD = window.SKD || {});
  var KEY = "skd.gaji.v1";
  var LAIN = "_lain";

  function rp(n) {
    var s = String(Math.round(n)), out = "";
    while (s.length > 3) { out = "." + s.slice(-3) + out; s = s.slice(0, -3); }
    return "Rp" + s + out;
  }
  function juta(n) { return "Rp" + (Math.round(n / 100000) / 10).toString().replace(".", ",") + " jt"; }
  function roman(gol) { return gol.split("/")[0]; }
  function num(v, lo, hi, def) { var n = Math.round(Number(v)); return isFinite(n) && n >= lo && n <= hi ? n : def; }

  function load(T) {
    var d = {};
    try { d = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { d = {}; }
    var pend = T.awal.filter(function (a) { return a.p === d.pend; })[0] || T.awal[2];
    var s = {
      inst: typeof d.inst === "string" ? d.inst.slice(0, 60) : "Kemendiktisaintek",
      pend: pend.p,
      gol: T.gapok[d.gol] ? d.gol : pend.g,
      mkg: num(d.mkg, 0, 33, 0),
      kelas: num(d.kelas, 1, 18, pend.k),
      status: d.status === "pns" ? "pns" : "cpns",
      persen: num(d.persen, 0, 100, Math.round(T.komponen.tukinCpns * 100)),
      jab: d.jab === "fungsional" ? "fungsional" : "umum",
      tjf: num(d.tjf, 0, 10000000, 0),
      manual: num(d.manual, 0, 100000000, 0),
      nikah: d.nikah === true,
      anak: num(d.anak, 0, 9, 0),
      hari: num(d.hari, 0, 23, T.komponen.hari),
      lihatGol: T.gapok[d.lihatGol] ? d.lihatGol : "III/a"
    };
    if (s.inst !== LAIN && !T.instansi.some(function (i) { return i.s === s.inst; })) s.inst = "Kemendiktisaintek";
    return s;
  }

  // gaji pokok menurut golongan dan MKG: MKG yang tidak tercantum memakai baris terdekat di bawahnya (kenaikan berkala tiap 2 tahun)
  function gajiPokok(T, gol, mkg) {
    var rows = T.gapok[gol], v = rows[0][1];
    rows.forEach(function (r) { if (r[0] <= mkg) v = r[1]; });
    return v;
  }
  function tukinKelas(T, inst, kelas) {
    if (!inst) return null;
    if (inst.x && inst.x[kelas]) return inst.x[kelas];
    var p = T.pola[inst.p];
    return kelas >= 1 && kelas <= p.length ? p[kelas - 1] : null;
  }
  function hitung(T, s, inst) {
    var K = T.komponen, cpns = s.status === "cpns", gp100 = gajiPokok(T, s.gol, s.mkg);
    var gp = cpns ? gp100 * K.cpns : gp100;
    var anak = Math.min(s.anak, K.maksAnak);
    var r = [];
    r.push({ k: "Gaji pokok", v: gp, d: s.gol + ", MKG " + s.mkg + (cpns ? " (80% dari " + rp(gp100) + " selama CPNS)" : "") });
    if (s.nikah) r.push({ k: "Tunjangan suami/istri", v: gp * K.pasangan, d: "10% gaji pokok" });
    if (anak) r.push({ k: "Tunjangan anak", v: gp * K.anak * anak, d: anak + " anak × 2% gaji pokok" + (s.anak > K.maksAnak ? " (paling banyak 2 anak)" : "") });
    r.push({ k: "Tunjangan pangan (beras)", v: K.pangan * (1 + (s.nikah ? 1 : 0) + anak), d: (1 + (s.nikah ? 1 : 0) + anak) + " jiwa × " + rp(K.pangan) });
    if (s.jab === "umum") r.push({ k: "Tunjangan umum", v: K.umum[roman(s.gol)], d: "pelaksana, golongan " + roman(s.gol) });
    else r.push({ k: "Tunjangan jabatan fungsional", v: s.tjf, d: s.tjf ? "isian Anda" : "isi nominal sesuai Perpres jabatan fungsional Anda" });
    r.push({ k: "Uang makan", v: K.makan[roman(s.gol)] * s.hari, d: rp(K.makan[roman(s.gol)]) + " × " + s.hari + " hari hadir" });
    var tk = inst ? tukinKelas(T, inst, s.kelas) : s.manual, pct = cpns ? s.persen / 100 : 1;
    if (tk != null) r.push({ k: "Tunjangan kinerja", v: tk * pct, d: (inst ? "kelas " + s.kelas + ", " + rp(tk) : "isian Anda") + (cpns ? " × " + s.persen + "% (CPNS)" : "") + ", sebelum potongan kehadiran" });
    var total = r.reduce(function (a, x) { return a + x.v; }, 0);
    return { rows: r, total: total, tukin: tk, dasar: total - (tk != null ? tk * pct : 0) };
  }

  SKD.gajiView = function (ctx) {
    var h = ctx.h, T = SKD.tunjangan;
    if (!T) return [h("p", null, "Data gaji dan tunjangan belum dimuat.")];
    var S = load(T);
    var save = function () { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
    var instOf = function (s) { return T.instansi.filter(function (i) { return i.s === s; })[0] || null; };
    var urut = T.instansi.slice().sort(function (a, b) { return a.n < b.n ? -1 : 1; });
    var isi = function (el, kids) { while (el.firstChild) el.removeChild(el.firstChild); kids.forEach(function (k) { if (k) el.appendChild(k); }); };

    var hasil = h("div", { class: "stack", id: "gj-hasil" }), peringkat = h("div", { class: "stack", id: "gj-peringkat" });
    var kelasSel, golSel, semuaPeringkat = false;

    function hitungUlang() {
      save();
      var inst = S.inst === LAIN ? null : instOf(S.inst), H = hitung(T, S, inst);
      isi(hasil, [
        h("div", { class: "gj-total" }, h("span", { class: "lbl" }, "Per bulan" + (S.status === "cpns" ? " selama CPNS" : " sebagai PNS")),
          h("b", { id: "gj-total" }, rp(H.total)),
          h("span", { class: "meta" }, (inst ? inst.s : "Instansi lain") + " · sebelum pajak dan potongan")),
        h("ul", { class: "gj-rinci" }, H.rows.map(function (x) {
          return h("li", null, h("span", null, x.k), h("span", { class: "gj-v" }, rp(x.v)));
        })),
        inst ? h("p", { class: "meta" }, h("a", { href: inst.u, target: "_blank", rel: "noopener" }, "Dasar tukin: " + inst.r + " ↗")) : null
      ]);
      isiPeringkat(H);
    }

    function isiPeringkat(H) {
      var cpns = S.status === "cpns", pct = cpns ? S.persen / 100 : 1;
      var L = T.instansi.map(function (i) { var t = tukinKelas(T, i, S.kelas); return { i: i, t: t == null ? 0 : t * pct }; })
        .sort(function (a, b) { return b.t - a.t || (a.i.n < b.i.n ? -1 : 1); });
      var tampil = semuaPeringkat ? L : L.slice(0, 10);
      isi(peringkat, [
        h("p", { class: "meta" }, "Kelas jabatan " + S.kelas + (cpns ? " · CPNS" : " · PNS")),
        h("ol", { class: "gj-rank" }, tampil.map(function (x) {
          return h("li", { class: x.i.s === S.inst ? "on" : null },
            h("span", null, h("b", null, x.i.s), " ", h("span", { class: "small muted" }, x.i.n)),
            h("span", { class: "gj-v" }, juta(H.dasar + x.t)));
        })),
        L.length > 10 ? h("button", { class: "more", type: "button", onclick: function () { semuaPeringkat = !semuaPeringkat; isiPeringkat(H); } },
          semuaPeringkat ? "Ringkas ▴" : "Semua " + L.length + " instansi ▾") : null
      ]);
    }

    function setPend(p) {
      var a = T.awal.filter(function (x) { return x.p === p; })[0];
      S.pend = a.p; S.gol = a.g; S.kelas = a.k;
      if (golSel) golSel.value = S.gol;
      if (kelasSel) kelasSel.value = String(S.kelas);
      hitungUlang();
    }

    var seg = function (name, opts, cur, on) {
      return h("div", { class: "seg", role: "group", "aria-label": name }, opts.map(function (o) {
        return h("button", { type: "button", "aria-pressed": cur === o[0] ? "true" : "false", onclick: function (e) {
          Array.prototype.forEach.call(e.currentTarget.parentNode.children, function (b) { b.setAttribute("aria-pressed", "false"); });
          e.currentTarget.setAttribute("aria-pressed", "true"); on(o[0]);
        } }, o[1]);
      }));
    };
    var angka = function (id, label, nilai, lo, hi, on) {
      return h("label", { class: "field" }, h("span", { class: "lbl" }, label),
        h("input", { class: "input", id: id, type: "number", min: lo, max: hi, inputmode: "numeric", value: nilai,
          oninput: function (e) { var v = num(e.target.value, lo, hi, -1); if (v >= 0) on(v); } }));
    };
    var golList = Object.keys(T.gapok);

    kelasSel = h("select", { class: "input wide", id: "gj-kelas", onchange: function (e) { S.kelas = num(e.target.value, 1, 18, 8); hitungUlang(); } },
      (function () { var o = []; for (var k = 18; k >= 1; k--) o.push(h("option", { value: String(k), selected: S.kelas === k }, "Kelas " + k + (k === 8 ? " (ahli pertama)" : k === 7 ? " (pelaksana S-1)" : k === 6 ? " (terampil D-III)" : k === 5 ? " (pelaksana SLTA)" : ""))); return o; })());
    golSel = h("select", { class: "input wide", id: "gj-gol", onchange: function (e) { S.gol = e.target.value; hitungUlang(); } },
      golList.map(function (g) { return h("option", { value: g, selected: S.gol === g }, g); }));
    var manualField = h("label", { class: "field", hidden: S.inst !== LAIN }, h("span", { class: "lbl" }, "Tukin per bulan"),
      h("input", { class: "input wide", id: "gj-manual", inputmode: "numeric", value: S.manual || "", placeholder: "4595150",
        oninput: function (e) { S.manual = num(String(e.target.value).replace(/\D/g, ""), 0, 100000000, 0); hitungUlang(); } }));
    var tjfField = h("label", { class: "field", hidden: S.jab !== "fungsional" }, h("span", { class: "lbl" }, "Tunjangan fungsional"),
      h("input", { class: "input wide", id: "gj-tjf", inputmode: "numeric", value: S.tjf || "", placeholder: "540000",
        oninput: function (e) { S.tjf = num(String(e.target.value).replace(/\D/g, ""), 0, 10000000, 0); hitungUlang(); } }));
    var persenField = angka("gj-persen", "Tukin CPNS (%)", S.persen, 0, 100, function (v) { S.persen = v; hitungUlang(); });
    persenField.hidden = S.status !== "cpns";

    var kalk = h("section", { class: "card stack", "aria-label": "Hitung penghasilan" },
      h("div", { class: "fm-form" },
        h("label", { class: "field grow" }, h("span", { class: "lbl" }, "Instansi"),
          h("select", { class: "input wide", id: "gj-inst", onchange: function (e) { S.inst = e.target.value; manualField.hidden = S.inst !== LAIN; hitungUlang(); } },
            urut.map(function (i) { return h("option", { value: i.s, selected: S.inst === i.s }, i.s + " · " + i.n); })
              .concat([h("option", { value: LAIN, selected: S.inst === LAIN }, "Instansi lain (isi tukin)")]))),
        manualField,
        h("label", { class: "field grow" }, h("span", { class: "lbl" }, "Pendidikan"),
          h("select", { class: "input wide", id: "gj-pend", onchange: function (e) { setPend(e.target.value); } },
            T.awal.map(function (a) { return h("option", { value: a.p, selected: S.pend === a.p }, a.p + " → " + a.g); })))),
      h("div", { class: "row" },
        seg("Status", [["cpns", "CPNS"], ["pns", "PNS"]], S.status, function (v) { S.status = v; persenField.hidden = v !== "cpns"; hitungUlang(); }),
        h("label", { class: "check" }, h("input", { type: "checkbox", id: "gj-nikah", checked: S.nikah, onchange: function (e) { S.nikah = e.target.checked; hitungUlang(); } }),
          h("span", null, "Menikah"))),
      h("details", { class: "gj-lain" }, h("summary", null, "Rincian lain"),
        h("div", { class: "fm-form" },
          angka("gj-anak", "Anak", S.anak, 0, 9, function (v) { S.anak = v; hitungUlang(); }),
          h("label", { class: "field" }, h("span", { class: "lbl" }, "Golongan"), golSel),
          angka("gj-mkg", "MKG (tahun)", S.mkg, 0, 33, function (v) { S.mkg = v; hitungUlang(); }),
          h("label", { class: "field grow" }, h("span", { class: "lbl" }, "Kelas jabatan"), kelasSel),
          persenField,
          angka("gj-hari", "Hari hadir", S.hari, 0, 23, function (v) { S.hari = v; hitungUlang(); })),
        h("div", { class: "field" }, h("span", { class: "lbl" }, "Tunjangan jabatan"),
          seg("Tunjangan jabatan", [["umum", "Umum"], ["fungsional", "Fungsional"]], S.jab, function (v) { S.jab = v; tjfField.hidden = v !== "fungsional"; hitungUlang(); })),
        tjfField),
      hasil);

    var page = [
      h("div", { class: "page-head" }, h("h1", null, "Gaji & tunjangan"),
        h("p", { class: "meta" }, h("b", null, String(T.instansi.length)), " instansi pusat · data " + T.tanggal), ctx.sub || null),
      kalk,
      h("section", { class: "card", "aria-labelledby": "gj-rank-h" }, h("h2", { id: "gj-rank-h" }, "Penghasilan tertinggi"), peringkat),
      h("p", { class: "fine" }, "Perkiraan bruto. Sumber: PP 5/2024 (gaji pokok) dan Perpres tukin tiap instansi.")
    ];
    hitungUlang();
    return page;
  };
})();
