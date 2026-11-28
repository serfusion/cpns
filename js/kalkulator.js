/* Kalkulator formasi CPNS 2026 (menu "Kalkulator formasi").
   Disusun dengan teknik REA (Study -> Build -> Check): fitur situs pembanding (katalog formasi 2026 dengan saringan jurusan,
   instansi, lokasi, dan jalur; urutan peluang, keketatan, kuota, penghasilan; simpan; bandingkan sampai tiga formasi; simulasi
   nilai SKD terhadap hasil SKD tahun sebelumnya) dipelajari sebagai pengunjung dengan alat REA. Kode, teks, rumus, dan data di
   sini milik aplikasi ini: formasi dari pengumuman resmi (data/dok2026.js) dan pindai SSCASN (js/pindai.js), pembanding dari
   laporan SKD 2024 (data/skd2024.js). Tidak ada kode, data, atau merek situs pembanding yang dipakai.

   Rumus perkiraan (sama dengan model di data/skd2024.js): batas lolos SKB naik sekitar 93 poin setiap pelamar per kursi naik
   10 kali lipat. Batas 2026 = batas instansi 2024 + 93 x log10(rasio 2026 / rasio 2024), paling rendah 311. Peringkat Anda
   = 3 x kuota x 10^((batas - skor) / 93). Peluang masuk SKB = sebaran normal dari selisih skor dengan batas. */
(function () {
  "use strict";
  var SKD = (window.SKD = window.SKD || {});
  var KEY = "skd.kalk.v1", KEY_LIVE = "skd.pindai.live", KEY_DEV = "skd.pindai.v1", KEY_DRIVE = "skd.drive.live";
  var HADIR = 0.66;      // bagian pendaftar yang hadir SKD (Kemhan 2024: 28.680 hadir dari 43.505 pendaftar)
  var RASIO_NAS = 14;    // pendaftar per kursi nasional 2024
  var MAKS = { twk: 150, tiu: 175, tkp: 225 };
  var KEL = [["ya", "S-1 Ilmu Komunikasi"], ["hampir", "Hampir cocok"], ["sma", "SMA/SMK"], ["semua", "Semua"], ["saya", "Isian saya"]];
  var URUT = [["peluang", "Peluang tertinggi"], ["ketat", "Keketatan terendah"], ["kuota", "Kuota terbanyak"], ["gaji", "Penghasilan tertinggi"],
    ["batas", "Batas SKD terendah"], ["az", "Nama jabatan A-Z"]];
  var JALUR = [["umum", "Umum"], ["cumlaude", "Cumlaude"], ["disabilitas", "Disabilitas"], ["papua", "Papua"], ["kalimantan", "Kalimantan"], ["diaspora", "Diaspora"]];

  // ---------- util ----------
  function baca(k) { try { return JSON.parse(localStorage.getItem(k)) || null; } catch (e) { return null; } }
  function tulis(k, o) { try { localStorage.setItem(k, JSON.stringify(o)); } catch (e) { /* mode privat */ } }
  function rp(n) { var s = String(Math.round(Math.abs(n))), o = ""; while (s.length > 3) { o = "." + s.slice(-3) + o; s = s.slice(0, -3); } return (n < 0 ? "-" : "") + s + o; }
  function dec(n, d) { return (Math.round(n * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d).replace(".", ","); }
  function lg(x) { return Math.log(x) / Math.LN10; }
  function erf(x) {
    var s = x < 0 ? -1 : 1, a = Math.abs(x), t = 1 / (1 + 0.3275911 * a);
    var y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-a * a);
    return s * y;
  }
  function phi(z) { return 0.5 * (1 + erf(z / Math.SQRT2)); }
  function online() { return /^https?:$/.test(location.protocol) && /\/tools\/pejuang-nip\//.test(location.pathname); }
  function tgl(iso) {
    var d = new Date(iso); if (isNaN(d)) return String(iso || "");
    var w = new Date(d.getTime() + 7 * 3600 * 1000), B = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    var p = function (n) { return (n < 10 ? "0" : "") + n; };
    return w.getUTCDate() + " " + B[w.getUTCMonth()] + " " + w.getUTCFullYear() + ", " + p(w.getUTCHours()) + "." + p(w.getUTCMinutes()) + " WIB";
  }
  function uang(g) {
    var m = String(g || "").replace(/\./g, "").match(/\d{6,}/g);
    if (!m) return null;
    var v = m.map(Number).filter(function (x) { return x >= 1000000 && x < 1e9; });
    return v.length ? { min: Math.min.apply(null, v), max: Math.max.apply(null, v) } : null;
  }
  function juta(n) { return dec(n / 1e6, n % 1e6 ? 1 : 0).replace(/,0$/, "") + " jt"; }

  // ---------- keadaan (localStorage perangkat ini) ----------
  function blank() { return { skor: null, kel: "ya", inst: "", jalur: "", cari: "", urut: "peluang", simpan: [], banding: [], manual: [], buka: "", tersimpanSaja: false }; }
  function sane(d) {
    var b = blank();
    if (!d || typeof d !== "object") return b;
    if (d.skor && typeof d.skor === "object") {
      var s = {}, ok = true;
      ["twk", "tiu", "tkp"].forEach(function (k) { var v = Math.round(Number(d.skor[k])); if (!(v >= 0 && v <= MAKS[k])) ok = false; s[k] = v; });
      if (ok) b.skor = s;
    }
    if (KEL.some(function (x) { return x[0] === d.kel; })) b.kel = d.kel;
    if (URUT.some(function (x) { return x[0] === d.urut; })) b.urut = d.urut;
    if (typeof d.inst === "string") b.inst = d.inst.slice(0, 120);
    if (JALUR.some(function (x) { return x[0] === d.jalur; })) b.jalur = d.jalur;
    if (typeof d.cari === "string") b.cari = d.cari.slice(0, 40);
    ["simpan", "banding"].forEach(function (k) { if (Array.isArray(d[k])) b[k] = d[k].filter(function (x) { return typeof x === "string"; }).slice(0, k === "banding" ? 3 : 60); });
    if (Array.isArray(d.manual)) b.manual = d.manual.filter(function (m) { return m && typeof m.j === "string" && m.j; }).slice(0, 20).map(function (m) {
      var pl = Number(m.pl);
      return { id: String(m.id || Date.now()), j: m.j.slice(0, 120), i: String(m.i || "").slice(0, 120), l: String(m.l || "").slice(0, 120),
        k: Math.max(1, Math.round(Number(m.k) || 1)), pl: m.pl === "" || m.pl == null || !isFinite(pl) || pl < 0 ? null : Math.round(pl) };
    });
    if (typeof d.buka === "string") b.buka = d.buka.slice(0, 400);
    b.tersimpanSaja = d.tersimpanSaja === true;
    return b;
  }
  var st = null;
  function state() { if (!st) st = sane(baca(KEY)); return st; }
  function save() { tulis(KEY, st); }

  // ---------- data live dari VPS (pindai SSCASN dan daftar dokumen Drive), sekali per buka halaman ----------
  var liveDiambil = false, rerenderLive = null;
  function ambilLive() {
    if (liveDiambil || !online() || !window.fetch) return;
    liveDiambil = true;
    var ambil = function (file, key) {
      return fetch("live/" + file, { cache: "no-store", credentials: "same-origin" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
        if (!d) return false;
        var lama = baca(key);
        if (lama && lama.waktu === d.waktu) return false;
        tulis(key, d);
        return true;
      }).catch(function () { return false; });
    };
    Promise.all([ambil("pindai.json", KEY_LIVE), ambil("drive.json", KEY_DRIVE)]).then(function (r) {
      if ((r[0] || r[1]) && rerenderLive) rerenderLive();
    });
  }

  // ---------- katalog formasi: pengumuman resmi + pindai SSCASN + isian sendiri ----------
  function jalurDari(s) {
    var t = String(s || "").toUpperCase();
    if (/CUMLAUDE|CUM LAUDE|LULUSAN TERBAIK/.test(t)) return "cumlaude";
    if (/DISABILITAS/.test(t)) return "disabilitas";
    if (/PAPUA/.test(t)) return "papua";
    if (/KALIMANTAN/.test(t)) return "kalimantan";
    if (/DIASPORA/.test(t)) return "diaspora";
    if (/UMUM/.test(t)) return "umum";
    return "";
  }
  /** "umum 123, cumlaude 3, disabilitas 4, Orang Asli Papua 4" -> { umum: 123, cumlaude: 3, ... } */
  function rincianKuota(kh) {
    var out = {}, ada = false;
    String(kh || "").split(/[,;]/).forEach(function (bag) {
      var m = bag.match(/(\d[\d.]*)/), j = jalurDari(bag);
      if (m && j) { out[j] = (out[j] || 0) + Number(m[1].replace(/\./g, "")); ada = true; }
    });
    return ada ? out : null;
  }
  function sumberSscasn() {
    var D = SKD.sscasn2026 || null, live = baca(KEY_LIVE), dev = baca(KEY_DEV) || {}, c = [];
    if (live && live.formasi) c.push([live, "pindai VPS tiap 6 jam"]);
    if (dev.formasi) c.push([dev, "pindai di perangkat ini"]);
    if (D) c.push([D, "pindai bawaan aplikasi"]);
    c.sort(function (a, b) { return new Date(b[0].waktu) - new Date(a[0].waktu); });
    return c.length ? { d: c[0][0], asal: c[0][1] } : null;
  }
  function katalog(S) {
    var P = SKD.pindai, DOK = SKD.dok2026 || null, SS = sumberSscasn(), D = SKD.sscasn2026 || null, rec = [];
    if (!P) return { rec: rec, ss: SS };
    var INST = (DOK ? DOK.instansi : []).concat((D ? D.instansi : []).filter(function (I) { return !DOK || !P.cari(DOK.instansi, I.n); }));
    if (DOK) DOK.instansi.forEach(function (I) {
      I.formasi.forEach(function (f) {
        rec.push({ j: f.j, i: I.n, l: f.l, k: f.k, rinci: rincianKuota(f.kh), kh: f.kh || "", jf: "", p: f.p, d: f.d || "", g: f.g || "", lok: f.lok || null,
          cat: f.cat || "", c: f.c || "", pl: null, asal: "dok", sumber: I.dok || "pengumuman resmi", pb: I.pembanding || "" });
      });
    });
    if (SS) SS.d.formasi.filter(function (x) { return !DOK || !P.cari(DOK.instansi, x.i); }).forEach(function (x) {
      rec.push({ j: x.j, i: x.i, l: x.l, k: x.k || 1, rinci: null, kh: "", jf: x.jf || "", p: x.p || [], d: x.d || "", g: x.g || "", lok: x.lok || null,
        cat: x.cat || "", c: x.c || "", pl: x.pl == null ? null : x.pl, asal: "sscasn", sumber: "SSCASN (" + SS.asal + ", " + tgl(SS.d.waktu) + ")", pb: x.pb || "" });
    });
    S.manual.forEach(function (m) {
      rec.push({ j: m.j, i: m.i, l: m.l, k: m.k, rinci: null, kh: "", jf: "", p: [], d: "", g: "", lok: null, cat: "", c: "", pl: m.pl,
        asal: "manual", sumber: "isian Anda", pb: "", id: m.id });
    });
    rec.forEach(function (x) {
      x.key = x.asal === "manual" ? "manual~" + x.id : x.asal + "~" + P.kunci(x);
      x.kel = x.asal === "manual" ? "saya" : (function (c) { return c === "ya" ? "ya" : c === "sma" ? "sma" : c ? "hampir" : "lain"; })(P.cocok(x));
      x.jalur = x.rinci ? Object.keys(x.rinci) : [jalurDari(x.jf) || "umum"];
      x.tahap = P.cari(INST, x.i);
      x.uang = uang(x.g);
    });
    return { rec: rec, ss: SS };
  }

  // ---------- perhitungan ----------
  function total(s) { return s.twk + s.tiu + s.tkp; }
  function lulusPG(s, pass) { return s.twk >= pass.twk && s.tiu >= pass.tiu && s.tkp >= pass.tkp; }
  function ketat(r) {
    if (r <= 5) return ["ok", "Sepi peminat"];
    if (r <= 15) return ["ok", "Rendah"];
    if (r <= 40) return ["warn", "Sedang"];
    return ["bad", "Tinggi"];
  }
  function kuotaAnalisis(x, jalur) {
    if (x.rinci) {
      if (jalur && x.rinci[jalur]) return [x.rinci[jalur], jalur];
      if (x.rinci.umum) return [x.rinci.umum, "umum"];
    }
    return [Math.max(1, x.k), x.jalur[0] || "umum"];
  }
  function pembanding(x) {
    var S24 = SKD.skd2024, P = SKD.pindai;
    var e = S24 && S24.semua && P && x.pb !== "nasional" && x.i ? P.cari(S24.semua, x.i) : null;
    var r24 = e && e.p && e.f ? e.p / e.f : RASIO_NAS;
    var cut24 = e ? e.v[2] : [Math.max(311, Math.round(275 + 93 * lg(RASIO_NAS))), 30];
    return { e: e, r24: r24, cut24: cut24 };
  }
  /** Analisis satu formasi untuk skor s (TWK/TIU/TKP) dan ambang batas pass. */
  function analisa(x, s, pass, jalur) {
    var b = pembanding(x), kq = kuotaAnalisis(x, jalur), k = Math.max(1, kq[0]), seats = 3 * k;
    var resmi = x.pl != null, pelamar = resmi ? x.pl : Math.round(k * b.r24), rasio = pelamar / k;
    var hadir = Math.round(pelamar * HADIR), semuaMasuk = hadir <= seats;
    var cut = semuaMasuk ? 311 : Math.max(311, Math.round(b.cut24[0] + 93 * lg(Math.max(0.5, rasio) / b.r24)));
    var x0 = total(s), pg = lulusPG(s, pass), margin = x0 - cut;
    var sd = Math.sqrt(Math.pow(b.cut24[1] || 0, 2) + 144) + (k <= 2 ? 8 : 0);
    var p = !pg ? 0 : semuaMasuk ? 0.97 : phi(margin / sd);
    var rank = Math.max(1, Math.round(seats * Math.pow(10, (cut - x0) / 93)));
    if (hadir > 0) rank = Math.min(rank, hadir);
    var status = !pg ? ["bad", "Belum lolos ambang batas"] : p >= 0.8 ? ["ok", "Aman"] : p >= 0.5 ? ["accent", "Bersaing"] : p >= 0.2 ? ["warn", "Berat"] : ["bad", "Sangat berat"];
    var akhirMin = b.e ? b.e.v[5] : [67, 5], skd100 = x0 / 5.5, skbPerlu = (akhirMin[0] - 0.4 * skd100) / 0.6;
    return { k: k, jalurK: kq[1], seats: seats, pelamar: pelamar, resmi: resmi, rasio: rasio, ketat: ketat(rasio), hadir: hadir, semuaMasuk: semuaMasuk,
      cut: cut, cut24: b.cut24, e: b.e, r24: b.r24, total: x0, pg: pg, margin: margin, p: p, rank: rank, status: status,
      akhirMin: akhirMin, skd100: skd100, skbPerlu: skbPerlu };
  }
  function persen(p) { return p <= 0 ? "0%" : p < 0.01 ? "<1%" : p > 0.99 ? ">99%" : Math.round(p * 100) + "%"; }
  function nilaiTeks(z) { return z ? (z[1] ? "≈" + z[0] + " (±" + z[1] + ")" : String(z[0])) : "–"; }
  function tukin(x, kelSma) {
    var T = SKD.tunjangan, P = SKD.pindai;
    if (!T || !P || !x.i) return null;
    var t = P.cari(T.instansi, x.i);
    if (!t) return null;
    var pola = T.pola[t.p], kel = kelSma ? 5 : 8;
    return pola ? { v: pola[kel - 1], kel: kel } : null;
  }
  function penghasilan(x) {
    if (x.uang) return x.uang.max;
    var t = tukin(x, x.kel === "sma");
    return t ? t.v : 0;
  }

  // ---------- tampilan ----------
  SKD.kalkulatorView = function (ctx) {
    var h = ctx.h, S = state(), pass = ctx.pass();
    rerenderLive = ctx.rerender;
    ambilLive();
    if (!S.skor) {
      var best = null;
      (ctx.history() || []).forEach(function (x) { if (x.kind !== "mini" && x.s && (!best || x.total > best.total)) best = x; });
      S.skor = best ? { twk: best.s.twk[0], tiu: best.s.tiu[0], tkp: best.s.tkp[0] } : { twk: 100, tiu: 115, tkp: 195 };
    }
    var K = katalog(S), REC = K.rec;
    var instList = []; REC.forEach(function (x) { if (x.i && instList.indexOf(x.i) < 0) instList.push(x.i); }); instList.sort();
    if (S.inst && instList.indexOf(S.inst) < 0) S.inst = "";

    // --- kartu skor ---
    var totalEl = h("b", { class: "kf-total", id: "kf-total" }, String(total(S.skor)));
    var pgEl = h("span", { class: "tag", id: "kf-pg" });
    function tulisPG() {
      var ok = lulusPG(S.skor, pass), kurang = [];
      ["twk", "tiu", "tkp"].forEach(function (k) { if (S.skor[k] < pass[k]) kurang.push(k.toUpperCase() + " kurang " + (pass[k] - S.skor[k])); });
      pgEl.className = "tag " + (ok ? "ok" : "bad");
      pgEl.textContent = ok ? "Lulus ambang batas" : kurang.join(", ");
      totalEl.textContent = String(total(S.skor));
    }
    var masukan = ["twk", "tiu", "tkp"].map(function (k) {
      return h("label", { class: "kf-in" }, h("span", { class: "l" }, k.toUpperCase()),
        h("input", { class: "input", id: "kf-" + k, type: "number", inputmode: "numeric", min: 0, max: MAKS[k], step: 1, value: S.skor[k],
          oninput: function (e) {
            var v = Math.round(Number(e.target.value));
            if (e.target.value === "" || !(v >= 0 && v <= MAKS[k])) return;
            S.skor[k] = v; save(); tulisPG(); isi();
          } }),
        h("span", { class: "d" }, "ambang " + pass[k] + " · maks " + MAKS[k]));
    });
    var pakaiTryout = function () {
      var best = null;
      (ctx.history() || []).forEach(function (x) { if (x.kind !== "mini" && x.s && (!best || x.total > best.total)) best = x; });
      if (!best) { ctx.toast("Belum ada tryout penuh. Kerjakan satu tryout dulu."); return; }
      S.skor = { twk: best.s.twk[0], tiu: best.s.tiu[0], tkp: best.s.tkp[0] }; save();
      ["twk", "tiu", "tkp"].forEach(function (k) { var el = document.getElementById("kf-" + k); if (el) el.value = S.skor[k]; });
      tulisPG(); isi(); ctx.toast("Skor tryout terbaik dipakai: " + best.total + ".");
    };
    var kartuSkor = h("section", { class: "panel kf-skor", "aria-labelledby": "kf-skor-h" },
      h("div", { class: "row between" }, h("h2", { id: "kf-skor-h" }, "Skor SKD Anda"), h("div", { class: "kf-sum" }, h("span", null, "Total"), totalEl, pgEl)),
      h("div", { class: "kf-ins" }, masukan),
      h("div", { class: "row" }, h("button", { class: "btn sm", type: "button", id: "kf-tryout", onclick: pakaiTryout }, "Pakai skor tryout terbaik"),
        h("span", { class: "small muted" }, "Isi nilai SKD lama atau skor tryout. Tersimpan di perangkat ini saja.")));
    tulisPG();

    // --- saringan ---
    var sel = function (id, label, opsi, nilai, onch) {
      return h("label", { class: "field kf-f" }, h("span", { class: "label" }, label),
        h("select", { class: "input wide", id: id, onchange: onch }, opsi.map(function (o) { return h("option", { value: o[0], selected: o[0] === nilai }, o[1]); })));
    };
    var hitungKel = function (id) { return REC.filter(function (x) { return id === "semua" ? x.kel !== "saya" : x.kel === id; }).length; };
    var saringan = h("section", { class: "panel kf-filter", "aria-label": "Saringan formasi" },
      h("div", { class: "seg kf-kel", role: "group", "aria-label": "Kelompok pendidikan" }, KEL.map(function (o) {
        return h("button", { type: "button", "aria-pressed": S.kel === o[0] ? "true" : "false", onclick: function (ev) {
          S.kel = o[0]; save();
          Array.prototype.forEach.call(ev.currentTarget.parentNode.children, function (b) { b.setAttribute("aria-pressed", "false"); });
          ev.currentTarget.setAttribute("aria-pressed", "true"); isi();
        } }, o[1] + " (" + hitungKel(o[0]) + ")");
      })),
      h("div", { class: "kf-fgrid" },
        h("label", { class: "field kf-f kf-cari" }, h("span", { class: "label" }, "Cari jabatan, lokasi, atau prodi"),
          h("input", { class: "input wide", id: "kf-cari", type: "search", maxlength: 40, value: S.cari, placeholder: "humas, Jakarta, hukum",
            oninput: function (e) { S.cari = e.target.value.slice(0, 40); save(); isi(); } })),
        sel("kf-inst", "Instansi", [["", "Semua instansi"]].concat(instList.map(function (n) { return [n, n]; })), S.inst, function (e) { S.inst = e.target.value; save(); isi(); }),
        sel("kf-jalur", "Jalur formasi", [["", "Semua jalur"]].concat(JALUR), S.jalur, function (e) { S.jalur = e.target.value; save(); isi(); }),
        sel("kf-urut", "Urutkan", URUT, S.urut, function (e) { S.urut = e.target.value; save(); isi(); })),
      h("div", { class: "row" },
        h("button", { class: "btn sm", type: "button", id: "kf-tersimpan", "aria-pressed": S.tersimpanSaja ? "true" : "false", onclick: function (e) {
          S.tersimpanSaja = !S.tersimpanSaja; save(); e.currentTarget.setAttribute("aria-pressed", S.tersimpanSaja ? "true" : "false"); isi();
        } }, h("span", null, "★ Tersimpan saja (", h("span", { id: "kf-n-simpan" }, String(S.simpan.length)), ")"))));

    // --- daftar + bandingkan ---
    var ringkas = h("div", { class: "kf-ringkas", id: "kf-ringkas", "aria-live": "polite" });
    var banding = h("div", { id: "kf-banding" });
    var daftar = h("ol", { class: "kf-list", id: "kf-list", "aria-label": "Formasi" });
    var lagi = h("div", { id: "kf-lagi" });
    var nTampil = 30;

    function toggle(arr, key, maks) {
      var i = arr.indexOf(key);
      if (i >= 0) { arr.splice(i, 1); return false; }
      if (maks && arr.length >= maks) { ctx.toast("Paling banyak " + maks + " formasi untuk dibandingkan."); return null; }
      arr.push(key); return true;
    }
    function chip(cls, t) { return h("span", { class: "chip " + (cls || "") }, t); }
    function kartu(o, idx) {
      var x = o.x, a = o.a, buka = S.buka === x.key, simpan = S.simpan.indexOf(x.key) >= 0, bd = S.banding.indexOf(x.key) >= 0;
      var t = tukin(x, x.kel === "sma");
      var pIlkom = x.p.filter(function (p) { return /^S-1 ILMU KOMUNIKASI$/i.test(p); }).length;
      var prodi = x.p.length ? (pIlkom ? "S-1 Ilmu Komunikasi" : x.p[0]) + (x.p.length > 1 ? " +" + (x.p.length - 1) : "") : "";
      var detail = buka ? h("div", { class: "kf-detail", id: "kf-d-" + idx },
        h("dl", { class: "kf-dl" },
          h("dt", null, "Skor SKD Anda"), h("dd", null, a.total + " (TWK " + S.skor.twk + " · TIU " + S.skor.tiu + " · TKP " + S.skor.tkp + "): " + (a.pg ? "lulus ambang batas" : "belum lulus ambang batas")),
          h("dt", null, "Kuota dihitung"), h("dd", null, rp(a.k) + " kursi jalur " + a.jalurK + (x.kh ? " (rincian: " + x.kh + ")" : "") + " → kursi SKB 3 × kuota = " + rp(a.seats)),
          h("dt", null, "Pelamar"), h("dd", null, a.resmi ? rp(a.pelamar) + " orang (SSCASN)" : "≈" + rp(a.pelamar) + " (perkiraan: " + dec(a.r24, 1) + " pelamar per kursi seperti " + (a.e ? "instansi ini" : "rata-rata nasional") + " 2024)"),
          h("dt", null, "Keketatan"), h("dd", null, "1 : " + dec(a.rasio, a.rasio < 10 ? 1 : 0) + " (" + a.ketat[1].toLowerCase() + "); perkiraan hadir SKD ≈" + rp(a.hadir) + " orang"),
          h("dt", null, "Batas lolos SKB"), h("dd", null, a.semuaMasuk ? "≈311: peserta lebih sedikit dari kursi SKB, jadi yang lulus ambang batas ikut SKB" :
            "≈" + a.cut + (a.e ? " (instansi ini 2024: " + nilaiTeks(a.cut24) + ", " + dec(a.r24, 1) + " pelamar per kursi)" : " (rumus nasional)")),
          h("dt", null, "Selisih skor Anda"), h("dd", { class: a.margin >= 0 ? "ok-t" : "bad-t" }, (a.margin >= 0 ? "+" : "") + a.margin),
          h("dt", null, "Perkiraan peringkat"), h("dd", null, "sekitar ke-" + rp(a.rank) + " dari ≈" + rp(a.hadir) + " peserta (kursi SKB sampai peringkat " + rp(a.seats) + ")"),
          h("dt", null, "Peluang masuk SKB"), h("dd", null, h("b", null, persen(a.p) + " · " + a.status[1])),
          h("dt", null, "Nilai akhir"), h("dd", null, "SKD " + a.total + " = " + dec(a.skd100, 1) + " (skala 100), menyumbang " + dec(a.skd100 * 0.4, 1) + ". Agar setara nilai akhir terendah yang lulus 2024 (" + nilaiTeks(a.akhirMin) + "), SKB perlu ≈" +
            (a.skbPerlu <= 0 ? "berapa pun" : dec(Math.min(100, a.skbPerlu), 1)) + " (skala 100)" + (a.skbPerlu > 100 ? ": tidak mungkin dicapai, naikkan skor SKD" : "")),
          x.tahap ? [h("dt", null, "Tahapan seleksi"), h("dd", null, "SKD " + (x.tahap.skd || "CAT BKN") + ". SKB " + (x.tahap.skb || "belum dibaca") + ".")] : null,
          x.uang || t ? [h("dt", null, "Penghasilan"), h("dd", null, x.uang ? "Rp" + rp(x.uang.min) + (x.uang.max > x.uang.min ? " – Rp" + rp(x.uang.max) : "") + " (estimasi di SSCASN/pengumuman)" :
            "tukin kelas " + t.kel + " Rp" + rp(t.v) + " sebelum potongan (lihat menu Gaji & tunjangan)")] : null,
          x.p.length ? [h("dt", null, "Pendidikan"), h("dd", null, x.p.join(", "))] : null,
          x.lok && x.lok.length ? [h("dt", null, "Penempatan"), h("dd", null, x.lok.slice(0, 40).map(function (l) { return l[0] + " " + l[1]; }).join(" · ") + (x.lok.length > 40 ? " · …" : ""))] : null,
          x.cat ? [h("dt", null, "Catatan"), h("dd", null, x.cat)] : null,
          x.d ? [h("dt", null, "Tugas"), h("dd", null, x.d.slice(0, 300) + (x.d.length > 300 ? "…" : ""))] : null,
          h("dt", null, "Sumber"), h("dd", null, x.sumber)),
        h("p", { class: "small muted" }, "Perkiraan, bukan kepastian: pesaing di formasi ini bisa lebih kuat atau lebih lemah dari rata-rata instansinya.")) : null;
      return h("li", { class: "kf-card" + (buka ? " open" : "") },
        h("div", { class: "kf-top" },
          h("div", { class: "kf-ttl" }, h("b", null, x.j), h("span", null, x.i || "Instansi belum diisi"), x.l ? h("span", { class: "muted" }, x.l) : null),
          h("div", { class: "kf-peluang " + a.status[0], title: "Peluang masuk SKB" }, h("span", { class: "v" }, persen(a.p)), h("span", { class: "l" }, a.status[1]))),
        h("div", { class: "kf-chips" },
          chip("", "Kuota " + rp(a.k) + (x.rinci || x.jf ? " " + a.jalurK : "")),
          chip(a.ketat[0], "1:" + dec(a.rasio, a.rasio < 10 ? 1 : 0) + " · " + a.ketat[1] + (a.resmi ? "" : " (perkiraan)")),
          chip("", "Batas ≈" + a.cut),
          x.uang ? chip("", "Rp" + juta(x.uang.min) + (x.uang.max > x.uang.min ? "–" + juta(x.uang.max) : "")) : null,
          prodi ? chip(pIlkom ? "ok" : "", prodi) : null,
          x.tahap && x.tahap.wawancara === "ya" ? chip("warn", "ada wawancara") : x.tahap && x.tahap.wawancara === "tidak" ? chip("ok", "tanpa wawancara") : null),
        h("div", { class: "kf-bar", role: "img", "aria-label": "Peluang " + persen(a.p) }, h("i", { class: a.status[0], style: "width:" + Math.max(2, Math.round(a.p * 100)) + "%" })),
        h("div", { class: "kf-act" },
          h("button", { class: "btn sm" + (buka ? " primary" : ""), type: "button", id: "kf-sim-" + idx, "aria-expanded": buka ? "true" : "false", "aria-controls": "kf-d-" + idx,
            onclick: function () { S.buka = buka ? "" : x.key; save(); isi("kf-sim-" + idx); } }, buka ? "Tutup simulasi" : "Simulasikan"),
          h("button", { class: "btn sm ghost", type: "button", id: "kf-simpan-" + idx, "aria-pressed": simpan ? "true" : "false",
            onclick: function () { toggle(S.simpan, x.key, 0); save(); isi("kf-simpan-" + idx); } }, simpan ? "★ Tersimpan" : "☆ Simpan"),
          h("button", { class: "btn sm ghost", type: "button", id: "kf-bd-" + idx, "aria-pressed": bd ? "true" : "false",
            onclick: function () { if (toggle(S.banding, x.key, 3) !== null) { save(); isi("kf-bd-" + idx); } } }, bd ? "✓ Dibandingkan" : "+ Bandingkan"),
          x.asal === "manual" ? h("button", { class: "btn sm ghost", type: "button", onclick: function () {
            S.manual = S.manual.filter(function (m) { return m.id !== x.id; });
            [S.simpan, S.banding].forEach(function (arr) { var i = arr.indexOf(x.key); if (i >= 0) arr.splice(i, 1); });
            save(); ctx.rerender();
          } }, "Hapus") : null),
        detail);
    }
    function tabelBanding(list) {
      if (!list.length) return null;
      var th = function (t) { return h("th", { scope: "row" }, t); };
      var baris = [
        ["Instansi", function (o) { return o.x.i || "–"; }],
        ["Lokasi", function (o) { return o.x.l || "–"; }],
        ["Kuota (jalur)", function (o) { return rp(o.a.k) + " " + o.a.jalurK; }],
        ["Pelamar", function (o) { return (o.a.resmi ? "" : "≈") + rp(o.a.pelamar); }],
        ["Keketatan", function (o) { return "1:" + dec(o.a.rasio, o.a.rasio < 10 ? 1 : 0) + " " + o.a.ketat[1].toLowerCase(); }],
        ["Batas lolos SKB", function (o) { return "≈" + o.a.cut; }],
        ["Selisih skor Anda", function (o) { return (o.a.margin >= 0 ? "+" : "") + o.a.margin; }],
        ["Perkiraan peringkat", function (o) { return "≈" + rp(o.a.rank) + " / " + rp(o.a.hadir); }],
        ["Peluang masuk SKB", function (o) { return persen(o.a.p) + " · " + o.a.status[1]; }],
        ["SKB perlu (skala 100)", function (o) { return o.a.skbPerlu <= 0 ? "bebas" : o.a.skbPerlu > 100 ? ">100" : "≈" + dec(o.a.skbPerlu, 1); }],
        ["Penghasilan", function (o) { var t = tukin(o.x, o.x.kel === "sma"); return o.x.uang ? "Rp" + juta(o.x.uang.min) + (o.x.uang.max > o.x.uang.min ? "–" + juta(o.x.uang.max) : "") : t ? "tukin kelas " + t.kel + " Rp" + juta(t.v) : "–"; }],
        ["Wawancara", function (o) { return o.x.tahap ? (o.x.tahap.wawancara === "ya" ? "ada" : o.x.tahap.wawancara === "tidak" ? "tidak ada" : "belum diketahui") : "–"; }],
        ["Pendidikan", function (o) { return o.x.p.length ? o.x.p.length + " prodi" : "–"; }]
      ];
      return h("section", { class: "panel kf-bd", "aria-labelledby": "kf-bd-h" },
        h("div", { class: "row between" }, h("h2", { id: "kf-bd-h" }, "Bandingkan " + list.length + " formasi"),
          h("button", { class: "btn sm ghost", type: "button", onclick: function () { S.banding = []; save(); isi(); } }, "Kosongkan")),
        h("div", { class: "qtable kf-bdt" }, h("table", null,
          h("thead", null, h("tr", null, h("th", { scope: "col" }, ""), list.map(function (o) { return h("th", { scope: "col" }, o.x.j); }))),
          h("tbody", null, baris.map(function (b) { return h("tr", null, th(b[0]), list.map(function (o) { return h("td", null, b[1](o)); })); })))),
        list.length < 2 ? h("p", { class: "small muted" }, "Tambahkan formasi lain dengan tombol + Bandingkan (paling banyak 3).") : null);
    }
    function isi(fokus) {
      var q = S.cari.trim().toLowerCase();
      var L = REC.filter(function (x) {
        if (S.tersimpanSaja) { if (S.simpan.indexOf(x.key) < 0) return false; }
        else if (S.kel === "semua" ? x.kel === "saya" : x.kel !== S.kel) return false;
        if (S.inst && x.i !== S.inst) return false;
        if (S.jalur && x.jalur.indexOf(S.jalur) < 0) return false;
        if (q.length >= 2 && (x.j + " " + x.i + " " + x.l + " " + x.p.join(" ")).toLowerCase().indexOf(q) < 0) return false;
        return true;
      }).map(function (x) { return { x: x, a: analisa(x, S.skor, pass, S.jalur) }; });
      var by = {
        peluang: function (a, b) { return b.a.p - a.a.p || b.a.margin - a.a.margin || b.a.k - a.a.k; },
        ketat: function (a, b) { return a.a.rasio - b.a.rasio || b.a.p - a.a.p; },
        kuota: function (a, b) { return b.a.k - a.a.k || b.a.p - a.a.p; },
        gaji: function (a, b) { return penghasilan(b.x) - penghasilan(a.x) || b.a.p - a.a.p; },
        batas: function (a, b) { return a.a.cut - b.a.cut || b.a.p - a.a.p; },
        az: function (a, b) { return a.x.j.localeCompare(b.x.j, "id") || a.x.i.localeCompare(b.x.i, "id"); }
      };
      L.sort(by[S.urut] || by.peluang);
      // ringkasan
      while (ringkas.firstChild) ringkas.removeChild(ringkas.firstChild);
      var kursi = L.reduce(function (s, o) { return s + o.a.k; }, 0), aman = L.filter(function (o) { return o.a.p >= 0.8; }).length;
      var best = L.length ? L.slice().sort(by.peluang)[0] : null;
      ringkas.appendChild(h("div", { class: "tiles" },
        h("div", { class: "tile" }, h("span", { class: "v" }, String(L.length)), h("span", { class: "l" }, "formasi"), h("span", { class: "d" }, rp(kursi) + " kursi")),
        h("div", { class: "tile" }, h("span", { class: "v" }, String(aman)), h("span", { class: "l" }, "peluang aman"), h("span", { class: "d" }, "≥80% masuk SKB")),
        h("div", { class: "tile" }, h("span", { class: "v" }, best ? persen(best.a.p) : "–"), h("span", { class: "l" }, "peluang terbaik"), h("span", { class: "d" }, best ? best.x.j : "–"))));
      // daftar
      while (daftar.firstChild) daftar.removeChild(daftar.firstChild);
      if (!L.length) daftar.appendChild(h("li", { class: "note" }, S.tersimpanSaja ? "Belum ada formasi tersimpan. Tekan ☆ Simpan di kartu formasi." :
        S.kel === "saya" ? "Belum ada isian. Tambahkan formasi lain di bawah." : "Tidak ada formasi untuk saringan ini."));
      L.slice(0, nTampil).forEach(function (o, i) { daftar.appendChild(kartu(o, i)); });
      while (lagi.firstChild) lagi.removeChild(lagi.firstChild);
      if (L.length > nTampil) lagi.appendChild(h("button", { class: "btn block", type: "button", onclick: function () { nTampil += 30; isi(); } }, "Tampilkan " + Math.min(30, L.length - nTampil) + " lagi"));
      // bandingkan (dari seluruh katalog, bukan hanya hasil saringan)
      while (banding.firstChild) banding.removeChild(banding.firstChild);
      var bl = S.banding.map(function (k) { for (var i = 0; i < REC.length; i++) if (REC[i].key === k) return REC[i]; return null; }).filter(Boolean)
        .map(function (x) { return { x: x, a: analisa(x, S.skor, pass, S.jalur) }; });
      var tb = tabelBanding(bl); if (tb) banding.appendChild(tb);
      var ns = document.getElementById("kf-n-simpan"); if (ns) ns.textContent = String(S.simpan.length);
      if (fokus) { var f = document.getElementById(fokus); if (f) f.focus(); }
    }

    // --- isian sendiri ---
    function tambah(e) {
      e.preventDefault();
      var f = e.target, j = f.elements.j.value.trim(), k = Math.round(Number(f.elements.k.value)), plS = f.elements.pl.value.trim(), pl = Number(plS);
      if (!j) { ctx.toast("Isi nama jabatan."); return; }
      if (!(k >= 1)) { ctx.toast("Isi kuota (minimal 1)."); return; }
      if (plS && !(pl >= 0)) { ctx.toast("Jumlah pelamar harus angka."); return; }
      S.manual.push({ id: String(Date.now()), j: j.slice(0, 120), i: f.elements.i.value.trim().slice(0, 120), l: f.elements.l.value.trim().slice(0, 120), k: k, pl: plS ? Math.round(pl) : null });
      S.kel = "saya"; S.tersimpanSaja = false; save(); ctx.rerender(); ctx.toast("Formasi ditambahkan ke Isian saya.");
    }
    var namaInst = [];
    ((SKD.skd2024 && SKD.skd2024.semua) || []).forEach(function (e) { namaInst.push(e.n); });
    instList.forEach(function (n) { if (namaInst.indexOf(n) < 0) namaInst.push(n); });
    var isian = h("details", { class: "panel kf-isian" }, h("summary", null, h("b", null, "Formasi lain? Isi sendiri"), h("span", { class: "small muted" }, " (dari SSCASN atau pengumuman yang belum ada di data)")),
      h("form", { class: "kf-form", onsubmit: tambah },
        h("label", { class: "field" }, h("span", { class: "label" }, "Jabatan"), h("input", { class: "input wide", name: "j", maxlength: 120, placeholder: "Pranata Hubungan Masyarakat Ahli Pertama" })),
        h("label", { class: "field" }, h("span", { class: "label" }, "Instansi (untuk data pembanding 2024)"), h("input", { class: "input wide", name: "i", list: "kf-inst-list", maxlength: 120, placeholder: "Kementerian Agama" })),
        h("datalist", { id: "kf-inst-list" }, namaInst.map(function (n) { return h("option", { value: n }); })),
        h("label", { class: "field" }, h("span", { class: "label" }, "Lokasi"), h("input", { class: "input wide", name: "l", maxlength: 120, placeholder: "Kanwil Banten" })),
        h("div", { class: "row" },
          h("label", { class: "field" }, h("span", { class: "label" }, "Kuota"), h("input", { class: "input", name: "k", type: "number", min: 1, inputmode: "numeric", placeholder: "3" })),
          h("label", { class: "field" }, h("span", { class: "label" }, "Pelamar (kosongkan bila belum ada)"), h("input", { class: "input", name: "pl", type: "number", min: 0, inputmode: "numeric", placeholder: "120" }))),
        h("button", { class: "btn primary", type: "submit" }, "Tambah dan simulasikan")));

    var metode = h("details", { class: "panel kf-metode", id: "kf-metode" }, h("summary", null, h("b", null, "Cara menghitung")),
      h("ul", { class: "plain-list small" },
        h("li", null, h("b", null, "Kursi SKB: "), "paling banyak 3 × kuota jabatan (aturan 2024 dan 2026), dari peserta yang lulus ambang batas tiap subtes."),
        h("li", null, h("b", null, "Pelamar: "), "angka SSCASN bila sudah tampil; selama pendaftaran belum ada, jadi dipakai pelamar per kursi instansi itu pada 2024 (atau rata-rata nasional 14). Sekitar 66% pelamar hadir SKD."),
        h("li", null, h("b", null, "Keketatan: "), "pelamar per kursi. Sampai 5 sepi peminat, sampai 15 rendah, sampai 40 sedang, di atasnya tinggi."),
        h("li", null, h("b", null, "Batas lolos SKB: "), "nilai SKD terendah yang masuk SKB di instansi itu pada 2024 (resmi atau perkiraan ±), digeser 93 poin untuk setiap 10 kali lipat perubahan pelamar per kursi; paling rendah 311. Bila peserta lebih sedikit dari kursi SKB, cukup lulus ambang batas."),
        h("li", null, h("b", null, "Peringkat dan peluang: "), "peringkat ≈ 3 × kuota × 10^((batas − skor) / 93). Peluang masuk SKB dari selisih skor dengan batas, dengan ketidakpastian ±12 poin ditambah rentang data 2024 (formasi 1–2 kursi lebih tidak pasti)."),
        h("li", null, h("b", null, "Nilai akhir: "), "40% SKD (skala 100, yaitu SKD ÷ 5,5) + 60% SKB (skala 100). SKB yang perlu dihitung dari nilai akhir terendah yang lulus di instansi itu pada 2024."),
        h("li", null, "Semua angka adalah perkiraan untuk memilih formasi, bukan rumus resmi BKN. Selalu cek pengumuman resmi instansi.")));

    var DOK = SKD.dok2026, SS = K.ss;
    var status = (DOK ? "Pengumuman resmi " + DOK.instansi.length + " instansi (dibaca " + DOK.tanggal + ")" : "") +
      (SS ? (DOK ? " + " : "") + "SSCASN (" + SS.asal + ", " + tgl(SS.d.waktu) + ")" : "") + ".";
    isi();
    return [
      h("div", { class: "page-head" }, h("h1", null, "Kalkulator formasi CPNS 2026"),
        h("p", { class: "lede" }, "Masukkan skor SKD Anda, saring formasi, lalu lihat perkiraan batas lolos SKB, peringkat, dan peluang masuk SKB di tiap formasi. Simpan yang menarik dan bandingkan sampai tiga formasi."),
        h("p", { class: "small muted" }, "Data: " + status + " Pembanding: laporan SKD 2024 per instansi."),
        h("div", { class: "row" }, h("a", { class: "btn sm", href: "#formasi" }, "Strategi formasi"), h("a", { class: "btn sm", href: "#gaji" }, "Gaji & tunjangan"),
          h("button", { class: "btn sm ghost", type: "button", onclick: function () { var m = document.getElementById("kf-metode"); if (m) { m.open = true; m.scrollIntoView({ behavior: "smooth", block: "start" }); } } }, "Cara menghitung"))),
      SKD.driveBox ? SKD.driveBox(h) : null,
      kartuSkor, saringan, ringkas, banding, daftar, lagi, isian, metode
    ];
  };

  // ---------- kotak dokumen Google Drive (dibaca VPS tiap 6 jam; hanya versi online) ----------
  SKD.driveBox = function (h) {
    var d = baca(KEY_DRIVE);
    if (!d || !Array.isArray(d.berkas)) return null;
    var baru = d.berkas.filter(function (b) { return !b.folder && b.status !== "dibaca"; });
    var file = d.berkas.filter(function (b) { return !b.folder; });
    return h("section", { class: "panel drive-box", "aria-labelledby": "drive-h" },
      h("div", { class: "row between" }, h("h2", { id: "drive-h" }, "Dokumen formasi di Google Drive"),
        h("span", { class: "tag " + (baru.length ? "warn" : "ok") }, baru.length ? baru.length + " belum dibaca teliti" : "semua sudah dibaca")),
      h("p", { class: "small muted" }, "Dicek otomatis di VPS " + tgl(d.waktu) + ": " + file.length + " berkas." +
        (baru.length ? " Angka formasi dari berkas baru masuk ke aplikasi setelah dibaca teliti (jadwal pengecekan Claude)." : "")),
      baru.length ? h("ul", { class: "plain-list small" }, baru.map(function (b) {
        var pt = b.petunjuk;
        return h("li", null, h("b", null, b.jalur || b.judul), b.status === "berubah" ? " (berubah)" : " (baru)",
          pt ? ": " + (pt.ilkom ? "\"Ilmu Komunikasi\" tertulis " + pt.ilkom + " kali (halaman " + pt.halIlkom.slice(0, 8).join(", ") + (pt.halIlkom.length > 8 ? ", …" : "") + ")" : "tidak ada teks \"Ilmu Komunikasi\"" + (pt.tanpaTeks ? " (" + pt.tanpaTeks + " halaman hasil scan belum terbaca)" : "")) + "." : "");
      })) : null);
  };

  SKD.kalkulator = { analisa: analisa, katalog: katalog, rincianKuota: rincianKuota, ketat: ketat, phi: phi, uang: uang };
})();
