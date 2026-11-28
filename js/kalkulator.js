/* Tab Formasi: cari formasi CPNS 2026 dan perkiraan peluang masuk SKB (dulu menu "Kalkulator formasi" dan "Strategi formasi").
   Disusun dengan teknik REA (Study -> Build -> Check): fitur situs pembanding (katalog formasi 2026 dengan saringan jurusan,
   urutan peluang, keketatan, kuota, penghasilan; simpan; simulasi nilai SKD terhadap hasil SKD tahun sebelumnya) dan tata
   letak ringkas situs pencari formasi (28 Nov 2026) dipelajari sebagai pengunjung dengan alat REA. Kode, teks, rumus, dan data di
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
  // kelompok di baris pilihan: jurusan saya, hampir cocok, semua, tersimpan, isian sendiri
  var KEL = [["ya", "S-1 Ilmu Komunikasi"], ["hampir", "Hampir cocok"], ["semua", "Semua"], ["simpan", "★ Tersimpan"], ["saya", "Isian saya"]];
  var URUT = [["peluang", "Peluang tertinggi"], ["ketat", "Paling sepi pesaing"], ["kuota", "Kuota terbanyak"], ["gaji", "Gaji tertinggi"],
    ["batas", "Batas SKD terendah"], ["az", "Nama A-Z"]];

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
  function blank() { return { skor: null, kel: "ya", cari: "", urut: "peluang", simpan: [], manual: [], buka: "" }; }
  function sane(d) {
    var b = blank();
    if (!d || typeof d !== "object") return b;
    if (d.skor && typeof d.skor === "object") {
      var s = {}, ok = true;
      ["twk", "tiu", "tkp"].forEach(function (k) { var v = Math.round(Number(d.skor[k])); if (!(v >= 0 && v <= MAKS[k])) ok = false; s[k] = v; });
      if (ok) b.skor = s;
    }
    if (KEL.some(function (x) { return x[0] === d.kel; })) b.kel = d.kel;
    else if (d.kel === "sma") b.kel = "semua"; // pilihan lama
    if (d.tersimpanSaja === true) b.kel = "simpan"; // pilihan lama
    if (URUT.some(function (x) { return x[0] === d.urut; })) b.urut = d.urut;
    if (typeof d.cari === "string") b.cari = d.cari.slice(0, 40);
    if (Array.isArray(d.simpan)) b.simpan = d.simpan.filter(function (x) { return typeof x === "string"; }).slice(0, 60);
    if (Array.isArray(d.manual)) b.manual = d.manual.filter(function (m) { return m && typeof m.j === "string" && m.j; }).slice(0, 20).map(function (m) {
      var pl = Number(m.pl);
      return { id: String(m.id || Date.now()), j: m.j.slice(0, 120), i: String(m.i || "").slice(0, 120), l: String(m.l || "").slice(0, 120),
        k: Math.max(1, Math.round(Number(m.k) || 1)), pl: m.pl === "" || m.pl == null || !isFinite(pl) || pl < 0 ? null : Math.round(pl) };
    });
    if (typeof d.buka === "string") b.buka = d.buka.slice(0, 400);
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

  // ---------- tampilan (tab Formasi) ----------
  // Teknik REA: tata letak meniru situs pencari formasi yang dipelajari sebagai pengunjung (judul pendek + satu baris angka,
  // kotak cari besar, pilihan berbentuk pil, kartu dengan kotak angka). Kode, teks, dan data milik aplikasi ini.
  var IKON_CARI = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
  var IKON_LOK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';
  function singkat(list, n) { return list.slice(0, n).join(", ") + (list.length > n ? " +" + (list.length - n) : ""); }
  function driveCatatan(h) {
    var d = baca(KEY_DRIVE);
    if (!d || !Array.isArray(d.berkas)) return null;
    var baru = d.berkas.filter(function (b) { return !b.folder && b.status !== "dibaca"; });
    return baru.length ? h("p", { class: "meta" }, baru.length + " dokumen formasi baru di Drive belum dibaca.") : null;
  }

  SKD.kalkulatorView = function (ctx) {
    var h = ctx.h, S = state(), pass = ctx.pass(), P = SKD.pindai;
    rerenderLive = ctx.rerender;
    ambilLive();
    if (P && P.otomatis) P.otomatis(ctx.rerender); // APK: pindai SSCASN otomatis bila data lebih dari 6 jam
    if (!S.skor) {
      var best = null;
      (ctx.history() || []).forEach(function (x) { if (x.kind !== "mini" && x.s && (!best || x.total > best.total)) best = x; });
      S.skor = best ? { twk: best.s.twk[0], tiu: best.s.tiu[0], tkp: best.s.tkp[0] } : { twk: 100, tiu: 115, tkp: 195 };
    }
    var K = katalog(S), REC = K.rec;
    if (S.kel === "simpan" && !S.simpan.length) S.kel = "ya";
    if (S.kel === "saya" && !S.manual.length) S.kel = "ya";

    // --- skor ---
    var totalEl = h("b", { class: "kf-total", id: "kf-total" }, String(total(S.skor)));
    var pgEl = h("span", { class: "tag", id: "kf-pg" });
    function tulisPG() {
      var ok = lulusPG(S.skor, pass), kurang = [];
      ["twk", "tiu", "tkp"].forEach(function (k) { if (S.skor[k] < pass[k]) kurang.push(k.toUpperCase() + " −" + (pass[k] - S.skor[k])); });
      pgEl.className = "tag " + (ok ? "ok" : "bad");
      pgEl.textContent = ok ? "Lulus ambang" : kurang.join(", ");
      totalEl.textContent = String(total(S.skor));
    }
    var masukan = ["twk", "tiu", "tkp"].map(function (k) {
      return h("label", { class: "kf-in" }, h("span", { class: "lbl" }, k.toUpperCase()),
        h("input", { class: "input", id: "kf-" + k, type: "number", inputmode: "numeric", min: 0, max: MAKS[k], step: 1, value: S.skor[k],
          oninput: function (e) {
            var v = Math.round(Number(e.target.value));
            if (e.target.value === "" || !(v >= 0 && v <= MAKS[k])) return;
            S.skor[k] = v; save(); tulisPG(); isi();
          } }),
        h("span", { class: "d" }, "min " + pass[k]));
    });
    var pakaiTryout = function () {
      var best = null;
      (ctx.history() || []).forEach(function (x) { if (x.kind !== "mini" && x.s && (!best || x.total > best.total)) best = x; });
      if (!best) { ctx.toast("Belum ada tryout penuh."); return; }
      S.skor = { twk: best.s.twk[0], tiu: best.s.tiu[0], tkp: best.s.tkp[0] }; save();
      ["twk", "tiu", "tkp"].forEach(function (k) { var el = document.getElementById("kf-" + k); if (el) el.value = S.skor[k]; });
      tulisPG(); isi(); ctx.toast("Skor tryout terbaik dipakai: " + best.total + ".");
    };
    var kartuSkor = h("section", { class: "card kf-skor", "aria-labelledby": "kf-skor-h" },
      h("div", { class: "row between" }, h("span", { class: "lbl", id: "kf-skor-h" }, "Skor SKD Anda"), h("div", { class: "kf-sum" }, totalEl, pgEl)),
      h("div", { class: "kf-ins" }, masukan),
      h("button", { class: "more", type: "button", id: "kf-tryout", onclick: pakaiTryout }, "Pakai skor tryout terbaik"));
    tulisPG();

    // --- cari + kelompok + urutan ---
    function diGrup(x, g) { return g === "simpan" ? S.simpan.indexOf(x.key) >= 0 : g === "semua" ? x.kel !== "saya" : x.kel === g; }
    var grupEl = h("div", { class: "pils", role: "group", "aria-label": "Kelompok formasi" });
    function isiGrup() {
      while (grupEl.firstChild) grupEl.removeChild(grupEl.firstChild);
      KEL.forEach(function (o) {
        if (o[0] === "simpan" && !S.simpan.length && S.kel !== "simpan") return;
        if (o[0] === "saya" && !S.manual.length) return;
        var n = REC.filter(function (x) { return diGrup(x, o[0]); }).length;
        grupEl.appendChild(h("button", { class: "pil", type: "button", "aria-pressed": S.kel === o[0] ? "true" : "false", onclick: function () {
          S.kel = o[0]; nTampil = 30; save(); isiGrup(); isi();
        } }, o[1], h("span", { class: "n" }, String(n))));
      });
    }
    var cari = h("label", { class: "cari" }, h("span", { class: "ico", html: IKON_CARI }),
      h("input", { id: "kf-cari", type: "search", maxlength: 40, value: S.cari, placeholder: "Cari jabatan, instansi, lokasi", "aria-label": "Cari formasi",
        oninput: function (e) { S.cari = e.target.value.slice(0, 40); nTampil = 30; save(); isi(); } }));
    var urutSel = h("select", { class: "input kf-urut", id: "kf-urut", "aria-label": "Urutkan", onchange: function (e) { S.urut = e.target.value; save(); isi(); } },
      URUT.map(function (o) { return h("option", { value: o[0], selected: o[0] === S.urut }, o[1]); }));

    // --- daftar ---
    var ringkas = h("p", { class: "meta", id: "kf-ringkas", "aria-live": "polite" });
    var daftar = h("ol", { class: "kf-list", id: "kf-list", "aria-label": "Formasi" });
    var lagi = h("div", { id: "kf-lagi" });
    var nTampil = 30;
    function chip(cls, t) { return h("span", { class: "tag " + (cls || "") }, t); }
    function kartu(o, idx) {
      var x = o.x, a = o.a, buka = S.buka === x.key, simpan = S.simpan.indexOf(x.key) >= 0;
      var t = tukin(x, x.kel === "sma");
      var pIlkom = x.p.filter(function (p) { return /^S-1 ILMU KOMUNIKASI$/i.test(p); }).length;
      var gaji = x.uang ? "Rp" + juta(x.uang.min) + (x.uang.max > x.uang.min ? "–" + juta(x.uang.max) : "") : t ? "tukin ±Rp" + juta(t.v) : "";
      var dd = function (k, v) { return v ? [h("dt", null, k), h("dd", null, v)] : null; };
      var detail = buka ? h("dl", { class: "kf-dl", id: "kf-d-" + idx },
        dd("Pelamar", a.resmi ? rp(a.pelamar) + " (SSCASN)" : "≈" + rp(a.pelamar) + " (perkiraan)"),
        dd("Keketatan", "1:" + dec(a.rasio, a.rasio < 10 ? 1 : 0) + " · " + a.ketat[1].toLowerCase()),
        dd("Batas lolos SKB", a.semuaMasuk ? "cukup lulus ambang batas" : "≈" + a.cut),
        dd("Skor Anda", a.total + " (" + (a.margin >= 0 ? "+" : "") + a.margin + ")"),
        dd("Peringkat", "≈" + rp(a.rank) + " dari " + rp(a.hadir) + " · kursi SKB " + rp(a.seats)),
        dd("Nilai SKB perlu", a.skbPerlu <= 0 ? "berapa pun" : a.skbPerlu > 100 ? "tidak cukup, naikkan SKD" : "≈" + dec(a.skbPerlu, 1) + " dari 100"),
        x.tahap ? dd("Tahapan", "SKD " + (x.tahap.skd || "CAT BKN") + " · SKB " + (x.tahap.skb || "belum diketahui")) : null,
        dd("Penghasilan", gaji ? gaji + (x.uang ? "" : " (kelas " + t.kel + ")") : ""),
        dd("Pendidikan", x.p.length ? singkat(x.p, 6) : ""),
        dd("Penempatan", x.lok && x.lok.length ? singkat(x.lok.map(function (l) { return l[0] + " " + l[1]; }), 8) : ""),
        dd("Catatan", x.cat || ""),
        dd("Tugas", x.d ? x.d.slice(0, 160) + (x.d.length > 160 ? "…" : "") : ""),
        dd("Sumber", x.sumber)) : null;
      return h("li", { class: "kf-card" + (buka ? " open" : "") },
        h("div", { class: "kf-top" },
          h("div", { class: "kf-ttl" }, h("b", null, x.j), h("span", null, x.i || "Instansi belum diisi"),
            x.l ? h("span", { class: "kf-lok" }, h("span", { class: "ico", html: IKON_LOK }), x.l) : null),
          h("button", { class: "kf-simpan", type: "button", id: "kf-simpan-" + idx, "aria-pressed": simpan ? "true" : "false", "aria-label": simpan ? "Hapus dari tersimpan" : "Simpan",
            onclick: function () {
              var i = S.simpan.indexOf(x.key); if (i >= 0) S.simpan.splice(i, 1); else S.simpan.push(x.key);
              save(); isiGrup(); isi("kf-simpan-" + idx);
            } }, simpan ? "★" : "☆")),
        h("div", { class: "sbox" },
          h("div", null, h("span", { class: "lbl" }, "Kuota"), h("b", { class: "biru" }, rp(a.k))),
          h("div", null, h("span", { class: "lbl" }, "Peluang"), h("b", { class: a.status[0] + "-t" }, persen(a.p)), h("span", { class: "d" }, a.status[1])),
          h("div", null, h("span", { class: "lbl" }, "Batas SKD"), h("b", null, a.semuaMasuk ? "311" : "≈" + a.cut), h("span", { class: "d" }, "Anda " + (a.margin >= 0 ? "+" : "") + a.margin))),
        h("div", { class: "kf-chips" },
          chip(a.ketat[0], "1:" + dec(a.rasio, a.rasio < 10 ? 1 : 0) + " " + a.ketat[1].toLowerCase()),
          gaji ? chip("", gaji) : null,
          pIlkom ? chip("ok", "S-1 Ilmu Komunikasi") : null,
          x.tahap && x.tahap.wawancara === "ya" ? chip("warn", "ada wawancara") : x.tahap && x.tahap.wawancara === "tidak" ? chip("ok", "tanpa wawancara") : null),
        h("div", { class: "row" },
          h("button", { class: "more", type: "button", id: "kf-sim-" + idx, "aria-expanded": buka ? "true" : "false", "aria-controls": "kf-d-" + idx,
            onclick: function () { S.buka = buka ? "" : x.key; save(); isi("kf-sim-" + idx); } }, buka ? "Tutup ▴" : "Detail ▾"),
          x.asal === "manual" ? h("button", { class: "more", type: "button", onclick: function () {
            S.manual = S.manual.filter(function (m) { return m.id !== x.id; });
            var i = S.simpan.indexOf(x.key); if (i >= 0) S.simpan.splice(i, 1);
            save(); ctx.rerender();
          } }, "Hapus") : null),
        detail);
    }
    function isi(fokus) {
      var q = S.cari.trim().toLowerCase();
      var L = REC.filter(function (x) {
        if (!diGrup(x, S.kel)) return false;
        if (q.length >= 2 && (x.j + " " + x.i + " " + x.l + " " + x.p.join(" ")).toLowerCase().indexOf(q) < 0) return false;
        return true;
      }).map(function (x) { return { x: x, a: analisa(x, S.skor, pass, "") }; });
      var by = {
        peluang: function (a, b) { return b.a.p - a.a.p || b.a.margin - a.a.margin || b.a.k - a.a.k; },
        ketat: function (a, b) { return a.a.rasio - b.a.rasio || b.a.p - a.a.p; },
        kuota: function (a, b) { return b.a.k - a.a.k || b.a.p - a.a.p; },
        gaji: function (a, b) { return penghasilan(b.x) - penghasilan(a.x) || b.a.p - a.a.p; },
        batas: function (a, b) { return a.a.cut - b.a.cut || b.a.p - a.a.p; },
        az: function (a, b) { return a.x.j.localeCompare(b.x.j, "id") || a.x.i.localeCompare(b.x.i, "id"); }
      };
      L.sort(by[S.urut] || by.peluang);
      var kursi = L.reduce(function (s, o) { return s + o.a.k; }, 0), aman = L.filter(function (o) { return o.a.p >= 0.8; }).length;
      while (ringkas.firstChild) ringkas.removeChild(ringkas.firstChild);
      [h("b", null, rp(L.length)), " formasi · ", h("b", null, rp(kursi)), " kursi · ", h("b", null, String(aman)), " aman"].forEach(function (k) { ringkas.appendChild(typeof k === "string" ? document.createTextNode(k) : k); });
      while (daftar.firstChild) daftar.removeChild(daftar.firstChild);
      if (!L.length) daftar.appendChild(h("li", { class: "note" }, S.kel === "simpan" ? "Belum ada yang disimpan. Tekan ☆ di kartu." : "Tidak ada formasi untuk pilihan ini."));
      L.slice(0, nTampil).forEach(function (o, i) { daftar.appendChild(kartu(o, i)); });
      while (lagi.firstChild) lagi.removeChild(lagi.firstChild);
      if (L.length > nTampil) lagi.appendChild(h("button", { class: "btn block", type: "button", onclick: function () { nTampil += 30; isi(); } }, "Tampilkan " + Math.min(30, L.length - nTampil) + " lagi"));
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
      S.kel = "saya"; save(); ctx.rerender(); ctx.toast("Formasi ditambahkan.");
    }
    var namaInst = [];
    ((SKD.skd2024 && SKD.skd2024.semua) || []).forEach(function (e) { namaInst.push(e.n); });
    REC.forEach(function (x) { if (x.i && namaInst.indexOf(x.i) < 0) namaInst.push(x.i); });
    var isian = h("details", { class: "card kf-isian" }, h("summary", null, "+ Tambah formasi sendiri"),
      h("form", { class: "kf-form", onsubmit: tambah },
        h("label", { class: "field" }, h("span", { class: "lbl" }, "Jabatan"), h("input", { class: "input wide", name: "j", maxlength: 120, placeholder: "Pranata Humas Ahli Pertama" })),
        h("label", { class: "field" }, h("span", { class: "lbl" }, "Instansi"), h("input", { class: "input wide", name: "i", list: "kf-inst-list", maxlength: 120, placeholder: "Kementerian Agama" })),
        h("datalist", { id: "kf-inst-list" }, namaInst.map(function (n) { return h("option", { value: n }); })),
        h("label", { class: "field" }, h("span", { class: "lbl" }, "Lokasi"), h("input", { class: "input wide", name: "l", maxlength: 120, placeholder: "Kanwil Banten" })),
        h("div", { class: "row" },
          h("label", { class: "field" }, h("span", { class: "lbl" }, "Kuota"), h("input", { class: "input", name: "k", type: "number", min: 1, inputmode: "numeric", placeholder: "3" })),
          h("label", { class: "field" }, h("span", { class: "lbl" }, "Pelamar"), h("input", { class: "input", name: "pl", type: "number", min: 0, inputmode: "numeric", placeholder: "boleh kosong" }))),
        h("button", { class: "btn primary", type: "submit" }, "Tambah")));

    // --- asal data ---
    var DOK = SKD.dok2026, SS = K.ss, sim = baca(KEY_DEV) || {};
    var bisaPindai = P && P.bisaPindai && P.bisaPindai();
    var asal = h("p", { class: "meta" }, "Data " + (SS ? tgl(SS.d.waktu) : DOK ? DOK.tanggal : "bawaan") + (DOK ? " · pengumuman " + DOK.instansi.length + " instansi" : "") + (SS ? " · SSCASN" : ""));
    isiGrup(); isi();
    return [
      h("div", { class: "page-head" }, h("h1", null, "Formasi 2026"), asal, ctx.sub || null),
      h("p", { class: "note ok" }, "Pendaftaran dibuka sejak 27 November 2026. Daftar hanya di ",
        h("a", { href: "https://sscasn.bkn.go.id/", target: "_blank", rel: "noopener" }, "sscasn.bkn.go.id"), "."),
      bisaPindai ? h("div", { class: "row" },
        h("button", { class: "btn sm", type: "button", id: "fm-pindai-btn", onclick: function () { P.mulai(); } }, "Perbarui dari SSCASN"),
        sim.galat ? h("span", { class: "meta bad-t" }, "Pindai terakhir gagal.") : null) : null,
      driveCatatan(h),
      kartuSkor,
      h("div", { class: "stack tight" }, cari, grupEl, h("div", { class: "row between" }, ringkas, urutSel)),
      daftar, lagi, isian,
      h("p", { class: "fine" }, "Peluang dan batas adalah perkiraan dari data SKD 2024, bukan rumus resmi BKN.")
    ];
  };

  SKD.kalkulator = { analisa: analisa, katalog: katalog, rincianKuota: rincianKuota, ketat: ketat, phi: phi, uang: uang };
})();
