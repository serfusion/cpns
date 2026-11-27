/* Halaman "Gaji & tunjangan": perkiraan penghasilan bulanan CPNS/PNS per instansi pusat, peringkat instansi untuk profil
   yang dipilih, tabel tunjangan kinerja per kelas jabatan, dan tabel gaji pokok PP 5/2024.
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
    var th = function (t) { return h("th", { scope: "col" }, t); };
    var isi = function (el, kids) { while (el.firstChild) el.removeChild(el.firstChild); kids.forEach(function (k) { if (k) el.appendChild(k); }); };

    var hasil = h("div", { class: "stack", id: "gj-hasil" }), peringkat = h("div", { class: "stack", id: "gj-peringkat" });
    var tabelTukin = h("div", { class: "stack", id: "gj-tukin" }), tabelGapok = h("div", { class: "stack", id: "gj-gapok" });
    var kelasSel, golSel;

    function hitungUlang() {
      save();
      var inst = S.inst === LAIN ? null : instOf(S.inst), H = hitung(T, S, inst);
      isi(hasil, [
        h("div", { class: "tile gj-total" }, h("span", { class: "l" }, "Perkiraan penghasilan per bulan" + (S.status === "cpns" ? " selama CPNS" : " sebagai PNS")),
          h("span", { class: "v", id: "gj-total" }, rp(H.total)),
          h("span", { class: "d" }, (inst ? inst.n : "Instansi lain (tukin isian)") + " · sebelum pajak dan potongan")),
        h("ul", { class: "gj-rinci" }, H.rows.map(function (x) {
          return h("li", null, h("span", null, h("b", null, x.k), h("br"), h("span", { class: "small muted" }, x.d)), h("span", { class: "gj-v" }, rp(x.v)));
        })),
        inst && inst.rentang ? h("p", { class: "note warn" }, "Tabel tukin " + inst.s + " dicocokkan dari rentang yang diumumkan Setkab untuk " + inst.r + "; salinan Perpres-nya belum bisa dibaca langsung.") : null,
        inst ? h("p", { class: "small muted" }, "Dasar tukin: " + inst.r + ". ", h("a", { href: inst.u, target: "_blank", rel: "noopener" }, inst.rentang ? "Berita Setkab" : "Salinan Perpres")) : null
      ]);
      isiPeringkat(H);
      isiTukin(inst);
    }

    function isiPeringkat(H) {
      var cpns = S.status === "cpns", pct = cpns ? S.persen / 100 : 1;
      var L = T.instansi.map(function (i) { var t = tukinKelas(T, i, S.kelas); return { i: i, t: t == null ? 0 : t * pct }; })
        .sort(function (a, b) { return b.t - a.t || (a.i.n < b.i.n ? -1 : 1); });
      isi(peringkat, [
        h("p", { class: "small muted" }, "Kelas jabatan " + S.kelas + ", " + S.gol + (cpns ? ", status CPNS (tukin " + S.persen + "%)" : ", status PNS") + ". Komponen selain tukin sama di semua instansi: " + rp(H.dasar) + " per bulan."),
        h("ol", { class: "gj-rank" }, L.map(function (x) {
          return h("li", { class: x.i.s === S.inst ? "on" : null },
            h("span", null, h("b", null, x.i.s), " ", h("span", { class: "small muted" }, x.i.n + (x.i.rentang ? " (dari rentang Setkab)" : ""))),
            h("span", { class: "gj-v" }, juta(H.dasar + x.t)), h("span", { class: "small muted gj-sub" }, "tukin " + rp(x.t)));
        }))
      ]);
    }

    function isiTukin(inst) {
      var p = inst ? T.pola[inst.p] : null;
      if (!p) { isi(tabelTukin, [h("p", { class: "small muted" }, "Pilih instansi untuk melihat tabel tunjangan kinerjanya.")]); return; }
      var rows = [];
      if (inst.x) Object.keys(inst.x).forEach(function (k) { rows.push([Number(k), inst.x[k]]); });
      for (var k = p.length; k >= 1; k--) rows.push([k, p[k - 1]]);
      isi(tabelTukin, [
        h("p", { class: "small" }, h("b", null, inst.n), " · " + inst.r + " · pola " + inst.p + (inst.c ? ". " + inst.c : "")),
        h("div", { class: "qtable fm-tbl" }, h("table", null,
          h("thead", null, h("tr", null, th("Kelas"), th("Tukin penuh"), th("80% (CPNS)"))),
          h("tbody", null, rows.map(function (r) {
            return h("tr", { class: r[0] === S.kelas ? "gj-on" : null }, h("td", null, String(r[0])), h("td", null, rp(r[1])), h("td", null, rp(r[1] * 0.8)));
          }))))
      ]);
    }

    function isiGapok() {
      var rows = T.gapok[S.lihatGol];
      isi(tabelGapok, [h("div", { class: "qtable fm-tbl" }, h("table", null,
        h("thead", null, h("tr", null, th("MKG (tahun)"), th("Gaji pokok PNS"), th("CPNS (80%)"))),
        h("tbody", null, rows.map(function (r) { return h("tr", null, h("td", null, String(r[0])), h("td", null, rp(r[1])), h("td", null, rp(r[1] * 0.8))); }))))]);
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
    var golList = Object.keys(T.gapok);
    var kelasMax = 18;

    kelasSel = h("select", { class: "input wide", id: "gj-kelas", onchange: function (e) { S.kelas = num(e.target.value, 1, 18, 8); hitungUlang(); } },
      (function () { var o = []; for (var k = kelasMax; k >= 1; k--) o.push(h("option", { value: String(k), selected: S.kelas === k }, "Kelas " + k + (k === 8 ? " (ahli pertama)" : k === 7 ? " (pelaksana S-1)" : k === 6 ? " (terampil D-III)" : k === 5 ? " (pelaksana SLTA)" : ""))); return o; })());
    golSel = h("select", { class: "input wide", id: "gj-gol", onchange: function (e) { S.gol = e.target.value; hitungUlang(); } },
      golList.map(function (g) { return h("option", { value: g, selected: S.gol === g }, g); }));
    var manualField = h("label", { class: "field", hidden: S.inst !== LAIN }, h("span", { class: "label" }, "Tukin per bulan (isi sendiri)"),
      h("input", { class: "input", id: "gj-manual", inputmode: "numeric", value: S.manual || "", placeholder: "4595150",
        oninput: function (e) { S.manual = num(String(e.target.value).replace(/\D/g, ""), 0, 100000000, 0); hitungUlang(); } }));
    var tjfField = h("label", { class: "field", hidden: S.jab !== "fungsional" }, h("span", { class: "label" }, "Tunjangan jabatan fungsional per bulan"),
      h("input", { class: "input", id: "gj-tjf", inputmode: "numeric", value: S.tjf || "", placeholder: "540000",
        oninput: function (e) { S.tjf = num(String(e.target.value).replace(/\D/g, ""), 0, 10000000, 0); hitungUlang(); } }));
    var persenField = h("label", { class: "field", hidden: S.status !== "cpns" }, h("span", { class: "label" }, "Tukin CPNS (%)"),
      h("input", { class: "input", id: "gj-persen", type: "number", min: 0, max: 100, inputmode: "numeric", value: S.persen,
        oninput: function (e) { var v = num(e.target.value, 0, 100, -1); if (v >= 0) { S.persen = v; hitungUlang(); } } }));

    var kalk = h("section", { class: "panel", "aria-labelledby": "gj-kalk" },
      h("h2", { id: "gj-kalk" }, "Kalkulator penghasilan"),
      h("div", { class: "fm-form" },
        h("label", { class: "field grow" }, h("span", { class: "label" }, "Instansi"),
          h("select", { class: "input wide", id: "gj-inst", onchange: function (e) { S.inst = e.target.value; manualField.hidden = S.inst !== LAIN; hitungUlang(); } },
            urut.map(function (i) { return h("option", { value: i.s, selected: S.inst === i.s }, i.s + " · " + i.n); })
              .concat([h("option", { value: LAIN, selected: S.inst === LAIN }, "Instansi lain (isi tukin sendiri)")]))),
        manualField,
        h("label", { class: "field grow" }, h("span", { class: "label" }, "Pendidikan (golongan awal)"),
          h("select", { class: "input wide", id: "gj-pend", onchange: function (e) { setPend(e.target.value); } },
            T.awal.map(function (a) { return h("option", { value: a.p, selected: S.pend === a.p }, a.p + " → " + a.g); }))),
        h("label", { class: "field" }, h("span", { class: "label" }, "Golongan"), golSel),
        h("label", { class: "field" }, h("span", { class: "label" }, "MKG (tahun)"),
          h("input", { class: "input", id: "gj-mkg", type: "number", min: 0, max: 33, inputmode: "numeric", value: S.mkg,
            oninput: function (e) { var v = num(e.target.value, 0, 33, -1); if (v >= 0) { S.mkg = v; hitungUlang(); } } })),
        h("label", { class: "field grow" }, h("span", { class: "label" }, "Kelas jabatan"), kelasSel)),
      h("div", { class: "field" }, h("span", { class: "label" }, "Status"),
        seg("Status", [["cpns", "CPNS (tahun pertama)"], ["pns", "PNS"]], S.status, function (v) { S.status = v; persenField.hidden = v !== "cpns"; hitungUlang(); })),
      h("div", { class: "fm-form" }, persenField,
        h("label", { class: "field" }, h("span", { class: "label" }, "Hari hadir"),
          h("input", { class: "input", id: "gj-hari", type: "number", min: 0, max: 23, inputmode: "numeric", value: S.hari,
            oninput: function (e) { var v = num(e.target.value, 0, 23, -1); if (v >= 0) { S.hari = v; hitungUlang(); } } })),
        h("label", { class: "field" }, h("span", { class: "label" }, "Jumlah anak"),
          h("input", { class: "input", id: "gj-anak", type: "number", min: 0, max: 9, inputmode: "numeric", value: S.anak,
            oninput: function (e) { var v = num(e.target.value, 0, 9, -1); if (v >= 0) { S.anak = v; hitungUlang(); } } }))),
      h("label", { class: "check" }, h("input", { type: "checkbox", id: "gj-nikah", checked: S.nikah, onchange: function (e) { S.nikah = e.target.checked; hitungUlang(); } }),
        h("span", null, "Sudah menikah (tunjangan suami/istri)")),
      h("div", { class: "field" }, h("span", { class: "label" }, "Tunjangan jabatan"),
        seg("Tunjangan jabatan", [["umum", "Tunjangan umum (pelaksana)"], ["fungsional", "Jabatan fungsional"]], S.jab, function (v) { S.jab = v; tjfField.hidden = v !== "fungsional"; hitungUlang(); })),
      tjfField,
      hasil,
      h("p", { class: "note info" }, "Perkiraan bruto sebelum pajak, iuran BPJS Kesehatan, dan iuran pensiun. Tukin yang benar-benar dibayar mengikuti capaian kinerja dan kehadiran. Selama CPNS gaji pokok dibayar 80%; persentase tukin CPNS diatur tiap instansi (contoh: BRIN 80%), jadi ubah bila aturan instansi Anda berbeda. Tunjangan jabatan fungsional baru diterima setelah diangkat dalam jabatan fungsional; isi nominalnya dari Perpres jabatan tersebut."));

    var lihatGolSel = h("select", { class: "input wide", id: "gj-lihat-gol", onchange: function (e) { S.lihatGol = e.target.value; save(); isiGapok(); } },
      golList.map(function (g) { return h("option", { value: g, selected: S.lihatGol === g }, g); }));

    var daftar = h("section", { class: "panel", "aria-labelledby": "gj-daftar" },
      h("h2", { id: "gj-daftar" }, "Sumber tukin per instansi"),
      h("p", { class: "small" }, T.instansi.length + " instansi dengan tabel tukin per kelas jabatan. Empat pola angka dipakai berulang: A Rp2,53 jt–Rp33,24 jt, B Rp2,58 jt–Rp41,55 jt, C Rp1,97 jt–Rp29,09 jt, D Rp1,77 jt–Rp24,93 jt."),
      h("ul", { class: "fm-inst" }, ["A", "B", "C", "D"].map(function (p) {
        var L = urut.filter(function (i) { return i.p === p; });
        return h("li", null, h("div", { class: "row" }, h("b", null, "Pola " + p), h("span", { class: "tag" }, "kelas 8: " + rp(T.pola[p][7])), h("span", { class: "tag" }, L.length + " instansi")),
          h("span", { class: "small" }, L.map(function (i, j) {
            return [j ? ", " : "", h("a", { href: i.u, target: "_blank", rel: "noopener" }, i.s + " (" + i.r.replace("Perpres ", "") + ")"), i.rentang ? "*" : ""];
          })));
      })),
      h("p", { class: "small muted" }, "* Tabel dicocokkan dari rentang yang diumumkan Setkab. Belum terbaca dari salinan Perpres (isi tukin sendiri di kalkulator): " +
        T.belum.map(function (b) { return b.n + (b.r !== "–" ? " (" + b.r + ")" : ""); }).join("; ") + "."));

    var page = [
      h("div", { class: "stack" }, h("h1", null, "Gaji & tunjangan PNS"),
        h("p", { class: "lede" }, "Perkiraan penghasilan bulanan di instansi pusat: gaji pokok PP 5/2024, tunjangan keluarga, pangan, umum, uang makan, dan tunjangan kinerja menurut Perpres tiap instansi. Angka diambil dari salinan dokumen resmi per " + T.tanggal + "."),
        h("div", { class: "row" },
          h("button", { class: "btn primary", type: "button", onclick: function () { var el = document.getElementById("gj-kalk"); if (el) el.scrollIntoView(); } }, "Kalkulator"),
          h("button", { class: "btn", type: "button", onclick: function () { var el = document.getElementById("gj-rank-h"); if (el) el.scrollIntoView(); } }, "Peringkat instansi"),
          h("button", { class: "btn", type: "button", onclick: function () { var el = document.getElementById("gj-gapok-h"); if (el) el.scrollIntoView(); } }, "Tabel gaji pokok"),
          h("a", { class: "btn", href: "#formasi" }, "Strategi formasi"))),
      kalk,
      h("section", { class: "panel", "aria-labelledby": "gj-rank-h" }, h("h2", { id: "gj-rank-h" }, "Peringkat instansi untuk profil Anda"), peringkat),
      h("section", { class: "panel", "aria-labelledby": "gj-tukin-h" }, h("h2", { id: "gj-tukin-h" }, "Tabel tunjangan kinerja instansi terpilih"), tabelTukin),
      h("section", { class: "panel", "aria-labelledby": "gj-gapok-h" }, h("h2", { id: "gj-gapok-h" }, "Tabel gaji pokok PNS (PP 5/2024)"),
        h("p", { class: "small" }, "Gaji pokok naik setiap 2 tahun masa kerja golongan (kenaikan gaji berkala). Golongan awal: SMA/SMK II/a, D-III II/c, S-1/D-IV III/a, S-2 III/b, S-3 III/c. Untuk I/b–I/d dan II/b–II/d tabel dimulai dari MKG 3; pegawai baru di golongan itu memakai baris pertama. Belum ada PP gaji baru per " + T.tanggal + "."),
        h("label", { class: "field" }, h("span", { class: "label" }, "Golongan"), lihatGolSel), tabelGapok),
      daftar,
      h("section", { class: "panel", "aria-labelledby": "gj-sumber" }, h("h2", { id: "gj-sumber" }, "Sumber"),
        h("p", { class: "small muted" }, "Disusun dengan teknik REA: fitur situs pembanding dipelajari sebagai pengunjung, lalu kode, teks, dan angka dibuat sendiri dari dokumen resmi. Komponen nasional: tunjangan suami/istri 10% dan anak 2% gaji pokok (paling banyak 2 anak), beras 10 kg × Rp7.242 per jiwa, tunjangan umum Rp175.000–Rp190.000 (Perpres 12/2006), uang makan Rp35.000–Rp41.000 per hari (PMK 32/2025)."),
        h("ul", { class: "plain-list small" }, T.sumber.map(function (x) { return h("li", null, h("a", { href: x.u, target: "_blank", rel: "noopener" }, x.t)); })))
    ];
    hitungUlang(); isiGapok();
    return page;
  };
})();
