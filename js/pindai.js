/* Pindai formasi SSCASN dan perkiraan peluang (menu Formasi, bagian "Pindai SSCASN").
   Sumber data, urutan prioritas:
   1. Data live dari VPS: bila aplikasi dibuka dari superfal-dev.com/tools/pejuang-nip/ (web atau APK mode online), berkas
      live/pindai.json ditulis pemindai terjadwal di VPS (repo portofolio, projects/pejuang-nip/pindai) setiap 6 jam.
   2. Pindai di HP (APK): layar ScanActivity membuka halaman resmi SSCASN lalu menjalankan SCANNER.
   3. Hasil pindai bawaan (data/sscasn2026.js).
   SCANNER berjalan di halaman SSCASN seperti pengunjung biasa: filter Nama Pendidikan per kata kunci, CARI, lalu membaca kartu
   dan detail dengan jeda. Tidak memanggil API langsung, tidak mengubah header, tidak login, tidak menembus captcha.
   Perkiraan peluang dihitung di perangkat dari profil lokal (skor tryout, keahlian); tidak ada data pribadi yang dikirim. */
(function () {
  "use strict";
  var SKD = (window.SKD = window.SKD || {});
  var KEY = "skd.pindai.v1", KEY_LIVE = "skd.pindai.live", KEY_PROF = "skd.pindai.profil", ENAM_JAM = 6 * 3600 * 1000;

  // ---------- berjalan di halaman SSCASN (di-stringify, jadi harus mandiri) ----------
  function SCANNER() {
    if (window.__pindaiSkd) return;
    window.__pindaiSkd = 1;
    var B = window.PindaiBridge || { kemajuan: function () {}, selesai: function (s) { window.__hasilPindai = s; } };
    var CFG = window.__pindaiCfg || {};
    var KATA = CFG.kata || ["KOMUNIKASI"];                 // kata kunci filter Nama Pendidikan
    var SELALU = CFG.selaluDetail || ["KOMUNIKASI"];       // pilihan yang memuat kata ini selalu dibaca detailnya
    var DETAIL_MAKS = CFG.detailMaks == null ? 1e9 : CFG.detailMaks;   // di atas ini kartu per pilihan: baca kartu saja
    var MAKS_KARTU = CFG.maksKartu || 3000;
    function tidur(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
    function teks() { return document.body ? document.body.innerText : ""; }
    function total() { var m = teks().match(/Total ([\d.]+) formasi/); return m ? Number(m[1].replace(/\./g, "")) : 0; }
    function wadah(h) { var c = h; for (var i = 0; i < 7 && c; i++) { if (/\d+\s*kebutuhan/.test(c.innerText || "")) return c; c = c.parentElement; } return null; }
    function kartu() { return Array.prototype.slice.call(document.querySelectorAll("h3")).filter(function (h) { var c = wadah(h); return c && c.innerText.length < 700; }); }
    function klik(el) {
      ["pointerdown", "mousedown", "pointerup", "mouseup", "click"].forEach(function (t) {
        var E = /pointer/.test(t) && window.PointerEvent ? PointerEvent : MouseEvent;
        el.dispatchEvent(new E(t, { bubbles: true, cancelable: true, view: window }));
      });
    }
    // ketik seperti pengguna: fokus ulang (daftar pilihan terbuka saat fokus), kosongkan, lalu isi kata kunci
    function isi(inp, v) {
      var set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
      inp.blur(); inp.focus();
      inp.dispatchEvent(new FocusEvent("focus")); inp.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
      set.call(inp, ""); inp.dispatchEvent(new Event("input", { bubbles: true }));
      set.call(inp, v); inp.dispatchEvent(new Event("input", { bubbles: true }));
    }
    function tombol(t) { return Array.prototype.slice.call(document.querySelectorAll("button")).filter(function (b) { return (b.innerText || "").trim().toUpperCase() === t && b.offsetParent !== null; })[0]; }
    function masukan() { return document.getElementById("filter-nama-pendidikan") || document.querySelector("input[placeholder*='Pendidikan']"); }
    function liCocok(kata) {
      return Array.prototype.slice.call(document.querySelectorAll("li")).filter(function (l) {
        var s = (l.innerText || "").trim(); return s.toUpperCase().indexOf(kata) >= 0 && s.length < 600 && l.offsetParent !== null;
      });
    }
    async function bukaOpsi(kata) {
      for (var t = 0; t < 4; t++) {
        var inp = masukan(); if (!inp) return [];
        isi(inp, kata); await tidur(900);
        var L = liCocok(kata); if (L.length) return L;
        klik(inp); await tidur(600);
        L = liCocok(kata); if (L.length) return L;
      }
      return [];
    }
    async function muatLagi() { var k = kartu(); if (k.length) k[k.length - 1].scrollIntoView({ block: "end" }); window.scrollBy(0, 1600); await tidur(900); }
    // muat semua kartu hasil filter (daftar dimuat bertahap saat digulir), kembalikan jumlahnya
    async function muatSemua() {
      var n = -1, sama = 0;
      for (var i = 0; i < 400 && sama < 2; i++) {
        var m = kartu().length;
        if (m >= MAKS_KARTU) break;
        if (m === n) sama++; else { sama = 0; n = m; }
        if (!/Memuat formasi lainnya/.test(teks()) && sama >= 1) break;
        await muatLagi();
      }
      window.scrollTo(0, 0);
      return kartu().length;
    }
    async function bacaSemua(opsi, out, denganDetail) {
      var i = 0, macet = 0;
      while (i < MAKS_KARTU) {
        var hs = kartu();
        if (i >= hs.length) {
          if (!/Memuat formasi lainnya/.test(teks()) && macet >= 1) break;
          await muatLagi(); macet++;
          if (macet > 4) break;
          continue;
        }
        macet = 0;
        var h = hs[i], c = wadah(h), judul = (h.innerText || "").trim(), kt = c ? c.innerText : judul;
        if (!denganDetail) { out.push({ kartu: kt, detail: "", opsi: opsi }); i++; if (i % 50 === 0) B.kemajuan("Membaca kartu " + i + " · " + opsi.slice(0, 50)); continue; }
        // panel detail dianggap sudah berganti bila memuat judul, lokasi, dan jumlah kebutuhan kartu ini
        var kl = kt.split("\n").map(function (x) { return x.trim(); }).filter(Boolean), lok = kl[2] || "", keb = ((kl[kl.length - 1] || "").match(/(\d+)/) || [])[1] || "";
        h.scrollIntoView({ block: "center" }); klik(h);
        var det = "";
        for (var w = 0; w < 25; w++) {
          await tidur(200);
          // label KEBUTUHAN ada di panel detail apa pun status pendaftarannya (Daftar Sekarang / Pendaftaran Telah Selesai)
          var t = teks(), a = t.lastIndexOf("\nKEBUTUHAN\n"), d = a < 0 ? "" : t.slice(Math.max(0, a - 500));
          if (d && d.indexOf(judul) >= 0 && (!lok || d.indexOf(lok) >= 0) && (!keb || d.indexOf(keb + " orang") >= 0)) { det = d; break; }
        }
        out.push({ kartu: kt, detail: det, opsi: opsi });
        var kembali = tombol("KEMBALI");
        if (kembali) { klik(kembali); await tidur(600); }
        i++;
        B.kemajuan("Membaca formasi " + i + (opsi ? " · " + opsi.slice(0, 60) : ""));
      }
    }
    async function jalan() {
      B.kemajuan("Menunggu daftar formasi SSCASN…");
      for (var i = 0; i < 90 && !total(); i++) await tidur(1000);
      var T = total();
      if (!T) { B.selesai(JSON.stringify({ galat: "Daftar formasi tidak tampil (mungkin halaman sedang sibuk atau berubah).", waktu: new Date().toISOString() })); return; }
      var out = [], pasang = [], opsiList = [], lewat = [], inp = masukan();
      if (!inp) {
        if (T > 400) { B.selesai(JSON.stringify({ galat: "Filter Nama Pendidikan tidak ditemukan; tampilan SSCASN mungkin berubah.", waktu: new Date().toISOString(), total: T })); return; }
        await bacaSemua("", out, true);
      } else {
        for (var q = 0; q < KATA.length; q++) {
          var rs0 = tombol("RESET"); if (rs0) { klik(rs0); await tidur(700); }
          (await bukaOpsi(KATA[q])).forEach(function (li) { var s = (li.innerText || "").trim(); if (opsiList.indexOf(s) < 0) { opsiList.push(s); pasang.push([s, KATA[q]]); } });
        }
        for (var k = 0; k < pasang.length; k++) {
          B.kemajuan("Filter pendidikan " + (k + 1) + "/" + pasang.length);
          var rs = tombol("RESET"); if (rs) { klik(rs); await tidur(900); }
          var li = (await bukaOpsi(pasang[k][1])).filter(function (l) { return (l.innerText || "").trim() === pasang[k][0]; })[0];
          if (!li) { lewat.push(pasang[k][0]); continue; }
          klik(li); await tidur(500);
          var cari = tombol("CARI"); if (cari) klik(cari);
          await tidur(1800);
          var opsiU = pasang[k][0].toUpperCase();
          var wajib = SELALU.some(function (s) { return opsiU.indexOf(s) >= 0; });
          var n = wajib && DETAIL_MAKS >= 1e9 ? 0 : await muatSemua();
          await bacaSemua(pasang[k][0], out, wajib || n <= DETAIL_MAKS);
        }
      }
      B.selesai(JSON.stringify({ waktu: new Date().toISOString(), total: T, kata: KATA, filter: !!inp, opsi: opsiList, lewat: lewat, data: out }));
    }
    jalan().catch(function (e) { B.selesai(JSON.stringify({ galat: String((e && e.message) || e), waktu: new Date().toISOString() })); });
  }

  // ---------- olah hasil mentah menjadi catatan formasi ----------
  var LABEL = ["KEBUTUHAN", "JENIS FORMASI", "RENTANG USIA", "ESTIMASI GAJI", "LOKASI PENEMPATAN", "KUALIFIKASI PENDIDIKAN", "DESKRIPSI PEKERJAAN",
    "PERSYARATAN ADMINISTRASI", "JUMLAH PELAMAR", "PELAMAR", "JUMLAH PENDAFTAR", "PENDAFTAR"];
  function baris(s) { return String(s || "").split("\n").map(function (x) { return x.trim(); }).filter(Boolean); }
  function angka(s) { var m = String(s || "").match(/\d[\d.]*/); return m ? Number(m[0].replace(/\./g, "")) : null; }
  function parse(r) {
    var k = baris(r.kartu), L = baris(r.detail), i = -1, st = "";
    ["Daftar Sekarang", "Pendaftaran Telah Selesai", "Pendaftaran Belum Dibuka", "Pendaftaran Ditutup"].some(function (s) {
      i = L.indexOf(s); if (i >= 0 && s !== "Daftar Sekarang") st = "ditutup"; return i >= 0;
    });
    if (i < 0) { var kb0 = L.map(function (x) { return x.toUpperCase(); }).indexOf("KEBUTUHAN"); if (kb0 > 0) i = kb0 - 1; }
    var head = i >= 0 ? L.slice(Math.max(0, i - 4), i) : [];
    if (i >= 0) L = L.slice(i + 1);
    var U = L.map(function (x) { return x.toUpperCase(); });
    function after(lbl) { var j = U.indexOf(lbl), out = []; if (j < 0) return out; for (j++; j < L.length && LABEL.indexOf(U[j]) < 0; j++) out.push(L[j]); return out; }
    var kb = (k[k.length - 1] || "").match(/(\d+)\s*kebutuhan/);
    var p = after("KUALIFIKASI PENDIDIKAN").join(" | ");
    if (!p && r.opsi) p = r.opsi;                     // kartu tanpa detail: pendidikan dari pilihan filter yang dipakai
    p = p.split("|").map(function (x) { return x.trim(); }).filter(Boolean);
    // jumlah pelamar: dicatat bila SSCASN menampilkannya (di kartu atau detail)
    var semua = r.kartu + "\n" + (r.detail || ""), pl = null;
    ["JUMLAH PELAMAR", "PELAMAR", "JUMLAH PENDAFTAR", "PENDAFTAR"].some(function (lb) { var v = angka(after(lb)[0]); if (v != null) { pl = v; return true; } return false; });
    if (pl == null) { var m = semua.match(/(\d[\d.]*)\s*(?:orang\s*)?(?:pelamar|pendaftar)/i) || semua.match(/(?:pelamar|pendaftar)\s*:?\s*(\d[\d.]*)/i); if (m) pl = Number(m[1].replace(/\./g, "")); }
    return {
      j: k[0] || "", i: k[1] || "", l: after("LOKASI PENEMPATAN").join(" ") || k[2] || "", s: k[3] || "", jp: k[4] || "",
      jf: after("JENIS FORMASI")[0] || k[5] || "", k: kb ? Number(kb[1]) : angka(after("KEBUTUHAN")[0]) || 0,
      u: after("RENTANG USIA").join(" "), g: after("ESTIMASI GAJI").join(" "), p: p, d: after("DESKRIPSI PEKERJAAN").join(" ").slice(0, 600),
      pl: pl, det: r.detail ? 1 : 0, ragu: r.detail && (!L.length || (head.length && head[0] !== k[0])) ? 1 : 0, st: st
    };
  }
  // ya: S-1 ILMU KOMUNIKASI; mirip: prodi S-1/D-IV lain bernama komunikasi; sma: SMA/SMK/sederajat; jenjang: komunikasi jenjang lain
  var RE_SMA = /(^|[^A-Z])(SMA|SMK|SLTA|SMU|STM|SMEA|MADRASAH ALIYAH|SEKOLAH MENENGAH|PAKET C)([^A-Z]|$)/;
  function cocok(rec) {
    if (rec.c === "tidak") return "hampir";            // dari dokumen: nama prodi mirip, tetapi bukan Ilmu Komunikasi
    var P = rec.p.map(function (x) { return x.toUpperCase(); });
    if (P.some(function (x) { return /^S-1 ILMU KOMUNIKASI$/.test(x); })) return "ya";
    if (P.some(function (x) { return /^(S-1|D-IV)\b/.test(x) && x.indexOf("KOMUNIKASI") >= 0; })) return "mirip";
    if (P.some(function (x) { return RE_SMA.test(x); })) return "sma";
    if (P.some(function (x) { return x.indexOf("KOMUNIKASI") >= 0; })) return "jenjang";
    return null;
  }
  function kunci(x) { return [x.j, x.i, x.l, x.jf, x.p.join("|")].join("~"); }
  function olah(raw) {
    var seen = {}, out = [];
    (raw.data || []).forEach(function (r) {
      var x = parse(r), key = kunci(x);
      if (!x.j) return;
      if (seen[key] != null) { var lama = out[seen[key]]; if (!lama.det && x.det) out[seen[key]] = x; return; }
      seen[key] = out.length; out.push(x);
    });
    return { waktu: raw.waktu, total: raw.total || 0, filter: raw.filter, opsi: raw.opsi || [], formasi: out };
  }

  // ---------- pencocokan nama instansi SSCASN dengan data pembanding ----------
  var ALIAS = {
    "KEMENTERIAN HUKUM": "KEMENKUMHAM", "KEMENTERIAN IMIGRASI DAN PEMASYARAKATAN": "KEMENKUMHAM", "KEMENTERIAN HAK ASASI MANUSIA": "KEMENKUMHAM",
    "KEJAKSAAN REPUBLIK INDONESIA": "KEJAKSAAN AGUNG", "KEJAKSAAN": "KEJAKSAAN AGUNG",
    "KEMENTERIAN PENDIDIKAN DASAR DAN MENENGAH": "KEMENDIKBUDRISTEK", "KEMENTERIAN PENDIDIKAN TINGGI SAINS DAN TEKNOLOGI": "KEMENDIKBUDRISTEK",
    "KEMENTERIAN KEBUDAYAAN": "KEMENDIKBUDRISTEK", "KEMENTERIAN KEHUTANAN": "KEMENTERIAN LHK", "KEMENTERIAN LINGKUNGAN HIDUP": "KEMENTERIAN LHK",
    "KEMENTERIAN KOMUNIKASI DAN DIGITAL": "KEMENTERIAN KOMINFO", "KEMENTERIAN KOPERASI": "KEMENTERIAN KOPERASI DAN UKM",
    "KEMENTERIAN USAHA MIKRO KECIL DAN MENENGAH": "KEMENTERIAN KOPERASI DAN UKM", "KEMENTERIAN PEKERJAAN UMUM": "KEMENTERIAN PUPR",
    "KEMENTERIAN KEPENDUDUKAN DAN PEMBANGUNAN KELUARGA": "BKKBN", "BADAN SIBER DAN SANDI NEGARA": "BSSN",
    "BADAN PENGAWASAN KEUANGAN DAN PEMBANGUNAN": "BPKP", "BADAN PENGAWAS OBAT DAN MAKANAN": "BPOM", "BADAN RISET DAN INOVASI NASIONAL": "BRIN",
    "BADAN METEOROLOGI KLIMATOLOGI DAN GEOFISIKA": "BMKG", "BADAN KEPEGAWAIAN NEGARA": "BADAN KEPEGAWAIAN NEGARA",
    "BADAN PEMBINAAN IDEOLOGI PANCASILA": "BPIP", "BADAN NASIONAL PENANGGULANGAN TERORISME": "BNPT"
  };
  function norm(s) {
    return String(s || "").toUpperCase().replace(/\([^)]*\)/g, " ").replace(/[^A-Z0-9 ]+/g, " ")
      .replace(/\b(REPUBLIK INDONESIA|RI|SEKRETARIAT JENDERAL|SETJEN)\b/g, " ").replace(/\s+/g, " ").trim();
  }
  function cari(list, nama, kunciNama) {
    if (!list || !nama) return null;
    var n = norm(nama), a = ALIAS[n] || n, best = null, nilai = 0;
    var kata = function (s) { return s.split(" ").filter(function (w) { return w.length > 2 && ["DAN", "KEMENTERIAN", "BADAN"].indexOf(w) < 0; }); };
    for (var i = 0; i < list.length; i++) {
      var e = list[i], m = norm(e[kunciNama || "n"]), s = norm(e.s || "");
      if (m === n || m === a || (s && (s === n || s === a))) return e;
      var A = kata(a), M = kata(m), sama = A.filter(function (w) { return M.indexOf(w) >= 0; }).length;
      var j = A.length && M.length ? sama / Math.max(A.length, M.length) : 0;
      if (j > nilai) { nilai = j; best = e; }
    }
    return nilai >= 0.6 ? best : null;
  }

  // ---------- profil lokal dan perkiraan peluang ----------
  var KEAHLIAN = [
    { id: "komputer", t: "Komputer dan perangkat lunak", kata: ["komputer", "sistem informasi", "teknologi informasi", "aplikasi", "jaringan", "perangkat", "digital", "elektronik"] },
    { id: "coding", t: "Vibe coding, AI, membuat aplikasi/web", kata: ["aplikasi", "sistem", "digital", "otomasi", "teknologi", "pengembang", "website", "situs", "data"] },
    { id: "data", t: "Data dan pelaporan (PDDikti)", kata: ["data", "informasi", "statistik", "pelaporan", "laporan", "basis data", "verifikasi", "validasi", "akademik"] },
    { id: "media", t: "Media sosial, desain, foto, video", kata: ["media", "publikasi", "konten", "desain", "multimedia", "video", "foto", "kehumasan", "hubungan masyarakat"] },
    { id: "menulis", t: "Menulis dan komunikasi", kata: ["naskah", "menulis", "rilis", "berita", "komunikasi", "publikasi", "informasi publik"] },
    { id: "inggris", t: "Bahasa Inggris", kata: ["internasional", "luar negeri", "bahasa inggris", "kerja sama", "diplomasi"] },
    { id: "arsip", t: "Administrasi dan arsip", kata: ["arsip", "administrasi", "dokumen", "persuratan", "tata usaha", "kepegawaian"] }
  ];
  var LISAN = ["keprotokolan", "protokol", "penyuluh", "pelayanan langsung", "front office", "resepsionis", "pemandu", "fasilitator", "penyiar", "pengamanan", "penjaga"];
  function profil(ctx) {
    var d = {};
    try { d = JSON.parse(localStorage.getItem(KEY_PROF)) || {}; } catch (e) { d = {}; }
    var best = 0;
    try { (ctx && ctx.history ? ctx.history() : []).forEach(function (x) { if (x.kind !== "mini" && x.total > best) best = x.total; }); } catch (e) {}
    var sk = Number(d.skor);
    return {
      skor: isFinite(sk) && sk > 0 && sk <= 550 ? Math.round(sk) : (best || 410), dariTryout: !(isFinite(sk) && sk > 0) && !!best,
      skorManual: isFinite(sk) && sk > 0 && sk <= 550 ? Math.round(sk) : null,
      keahlian: Array.isArray(d.keahlian) ? d.keahlian.filter(function (x) { return KEAHLIAN.some(function (k) { return k.id === x; }); }) : ["komputer", "coding", "data", "media"],
      nonverbal: d.nonverbal !== false
    };
  }
  function simpanProfil(p) { try { localStorage.setItem(KEY_PROF, JSON.stringify({ skor: p.skorManual || null, keahlian: p.keahlian, nonverbal: p.nonverbal })); } catch (e) {} }
  function batas(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function peluang(x, P, tahap) {
    // pb "nasional": data instansi 2024 tidak sebanding (mis. Kemenkumham 2024 = gabungan tiga kementerian sekarang)
    var S24 = SKD.skd2024, e = S24 && S24.semua && x.pb !== "nasional" ? cari(S24.semua, x.i) : null;
    var rasio, rasioDari;
    if (x.pl != null && x.k) { rasio = x.pl / x.k; rasioDari = "resmi"; }
    else if (e && e.p && e.f) { rasio = e.p / e.f; rasioDari = "pendaftar per formasi instansi ini 2024"; }
    else { rasio = 14; rasioDari = x.pb === "nasional" ? "rata-rata nasional 2024, karena data instansi 2024 tidak sebanding" : "rata-rata nasional 2024"; }
    var sPes = rasio <= 3 ? 100 : rasio <= 6 ? 85 : rasio <= 12 ? 70 : rasio <= 25 ? 55 : rasio <= 50 ? 40 : rasio <= 100 ? 25 : 12;
    var cut = e ? e.v[2] : [383, 30], margin = P.skor - cut[0];
    var sSkd = batas(Math.round(60 + margin * 1.25), 5, 100);
    var t = (x.j + " " + x.d).toLowerCase(), cocokK = [];
    KEAHLIAN.forEach(function (k) { if (P.keahlian.indexOf(k.id) >= 0 && k.kata.some(function (w) { return t.indexOf(w) >= 0; })) cocokK.push(k.t.split(/[,(]/)[0].trim().toLowerCase()); });
    var lisan = LISAN.some(function (w) { return t.indexOf(w) >= 0; });
    var sKea = batas(40 + 20 * Math.min(3, cocokK.length) - (lisan && P.nonverbal ? 15 : 0), 10, 100);
    var sSkb = !tahap ? 70 : tahap.wawancara === "ya" ? 60 : tahap.wawancara === "tidak" ? 85 : 70;
    var total = Math.round(0.35 * sPes + 0.35 * sSkd + 0.2 * sKea + 0.1 * sSkb);
    return { total: total, label: total >= 75 ? "tinggi" : total >= 55 ? "sedang" : "rendah", rasio: rasio, rasioDari: rasioDari,
      cut: cut, margin: margin, cocokK: cocokK, lisan: lisan, e: e };
  }

  // ---------- penyimpanan ----------
  function baca(k) { try { return JSON.parse(localStorage.getItem(k)) || null; } catch (e) { return null; } }
  function tulis(k, o) { try { localStorage.setItem(k, JSON.stringify(o)); } catch (e) {} }
  function apk() { return !!(window.AndroidBridge && typeof window.AndroidBridge.pindaiSscasn === "function"); }
  function mulai() { if (apk()) window.AndroidBridge.pindaiSscasn("(" + SCANNER.toString() + ")();"); }
  function online() { return /^https?:$/.test(location.protocol) && /\/tools\/pejuang-nip\//.test(location.pathname); }
  function tgl(iso) {
    var d = new Date(iso); if (isNaN(d)) return String(iso || "");
    var w = new Date(d.getTime() + 7 * 3600 * 1000), B = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    var p = function (n) { return (n < 10 ? "0" : "") + n; };
    return w.getUTCDate() + " " + B[w.getUTCMonth()] + " " + w.getUTCFullYear() + ", " + p(w.getUTCHours()) + "." + p(w.getUTCMinutes()) + " WIB";
  }
  function rp(n) { var s = String(Math.round(n)), o = ""; while (s.length > 3) { o = "." + s.slice(-3) + o; s = s.slice(0, -3); } return s + o; }

  // hasil dari ScanActivity
  window.addEventListener("pindai-selesai", function () {
    if (!apk() || typeof window.AndroidBridge.hasilPindai !== "function") return;
    var raw; try { raw = JSON.parse(window.AndroidBridge.hasilPindai()); } catch (e) { raw = null; }
    if (!raw) return;
    var lama = baca(KEY) || {};
    if (raw.galat) { lama.galat = raw.galat; lama.galatWaktu = raw.waktu || new Date().toISOString(); tulis(KEY, lama); }
    else { var o = olah(raw); o.sumber = "perangkat"; if (lama.otomatis === false) o.otomatis = false; tulis(KEY, o); }
    if (SKD.pindai && SKD.pindai._rerender) SKD.pindai._rerender();
  });
  // data live dari VPS (sekali per buka halaman)
  var liveDiambil = false;
  function ambilLive() {
    if (liveDiambil || !online() || !window.fetch) return;
    liveDiambil = true;
    fetch("live/pindai.json", { cache: "no-store", credentials: "same-origin" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
      if (!d || !d.formasi) return;
      var lama = baca(KEY_LIVE);
      if (!lama || lama.waktu !== d.waktu) { tulis(KEY_LIVE, d); if (SKD.pindai._rerender) SKD.pindai._rerender(); }
    }).catch(function () {});
  }

  // ---------- bagian di halaman Formasi ----------
  var ui = { kel: "ya", cari: "", n: 40 };
  function section(ctx) {
    var h = ctx.h, D = SKD.sscasn2026 || null, sim = baca(KEY) || {}, live = baca(KEY_LIVE), pakai = null, asal = "";
    SKD.pindai._rerender = ctx.rerender;
    ambilLive();
    var kandidat = [];
    if (live && live.formasi) kandidat.push([live, "data live dari VPS (pindai otomatis tiap 6 jam)"]);
    if (sim.formasi) kandidat.push([sim, "pindai di perangkat ini"]);
    if (D) kandidat.push([D, "pindai bawaan aplikasi"]);
    kandidat.sort(function (a, b) { return new Date(b[0].waktu) - new Date(a[0].waktu); });
    if (kandidat.length) { pakai = kandidat[0][0]; asal = kandidat[0][1]; }
    var otomatis = sim.otomatis !== false;
    if (apk() && !online() && otomatis && !sessionStorage.getItem("skd.pindai.dicoba")) {
      var umur = pakai && pakai.waktu ? Date.now() - new Date(pakai.waktu).getTime() : Infinity;
      if (umur > ENAM_JAM) { try { sessionStorage.setItem("skd.pindai.dicoba", "1"); } catch (e) {} setTimeout(mulai, 900); }
    }
    var P = profil(ctx), DOK = SKD.dok2026 || null;
    // instansi: data pengumuman resmi lebih dulu, lalu instansi yang hanya ada di hasil pindai SSCASN
    var INST = (DOK ? DOK.instansi : []).concat((D ? D.instansi : []).filter(function (I) { return !DOK || !cari(DOK.instansi, I.n); }));
    var rec = [];
    if (DOK) DOK.instansi.forEach(function (I) {
      I.formasi.forEach(function (f) {
        rec.push({ j: f.j, i: I.n, l: f.l, k: f.k, jf: f.kh || "", u: "", g: f.g || "", p: f.p, d: f.d || "", pl: null, ragu: 0,
          lok: f.lok || null, cat: f.cat || "", c: f.c || "", dok: I.dok, asal: "dok", pb: I.pembanding || "" });
      });
    });
    var sscasnF = pakai ? pakai.formasi : [];
    // formasi SSCASN dari instansi yang belum ada di data pengumuman tetap ditampilkan (mis. instansi yang baru muncul)
    rec = rec.concat(sscasnF.filter(function (x) { return !DOK || !cari(DOK.instansi, x.i); }));
    var F = rec.map(function (x) {
      var tahap = cari(INST, x.i);
      return { x: x, c: cocok(x), tahap: tahap, pel: peluang(x, P, tahap), tk: SKD.tunjangan ? cari(SKD.tunjangan.instansi, x.i) : null };
    });
    var sscasnYa = sscasnF.filter(function (x) { return cocok(x) === "ya"; });
    var grup = { ya: [], sma: [], lain: [] };
    F.forEach(function (o) { if (o.c === "ya") grup.ya.push(o); else if (o.c === "sma") grup.sma.push(o); else if (o.c) grup.lain.push(o); });
    var baru = {}; (pakai && pakai.baru || []).forEach(function (k) { baru[k] = 1; });
    var hitungKursi = function (L) { return L.reduce(function (a, o) { return a + o.x.k; }, 0); };
    var hitungInst = function (L) { var m = {}; L.forEach(function (o) { m[o.x.i] = 1; }); return Object.keys(m).length; };
    var tagW = function (I) {
      if (!I) return h("span", { class: "tag" }, "tahapan belum dibaca");
      return I.wawancara === "ya" ? h("span", { class: "tag warn" }, "ada wawancara") : I.wawancara === "tidak" ? h("span", { class: "tag ok" }, "tanpa wawancara") : h("span", { class: "tag" }, "wawancara belum diketahui");
    };
    var nilai = function (z, d) { return z ? (z[1] ? "≈" + (d ? z[0].toFixed(d).replace(".", ",") : z[0]) : (d ? z[0].toFixed(d).replace(".", ",") : z[0])) : "–"; };
    var kartuF = function (o) {
      var x = o.x, I = o.tahap, pl = o.pel, e = pl.e, sma = o.c === "sma";
      var tkKelas = o.tk && SKD.tunjangan ? (function () { var p = SKD.tunjangan.pola[o.tk.p]; var kel = sma ? 5 : 8; return p ? "tukin kelas " + kel + " Rp" + rp(p[kel - 1]) + " (" + o.tk.r + ")" : ""; })() : "";
      return h("li", null,
        h("div", { class: "row" }, h("b", null, x.j), h("span", { class: "tag " + (pl.label === "tinggi" ? "ok" : pl.label === "sedang" ? "accent" : "warn") }, "Peluang " + pl.total + " · " + pl.label),
          h("span", { class: "tag" }, x.k + " kursi"), x.jf ? h("span", { class: "tag" }, x.jf) : null, tagW(I), baru[kunci(x)] ? h("span", { class: "tag hot" }, "baru") : null,
          x.st === "ditutup" ? h("span", { class: "tag bad" }, "pendaftaran ditutup") : null),
        h("span", { class: "nilai" }, x.i + " · " + x.l),
        x.pl != null ? h("span", { class: "small" }, h("b", null, "Pelamar: "), rp(x.pl) + " orang (" + (Math.round(pl.rasio * 10) / 10).toString().replace(".", ",") + " per kursi, dari SSCASN)") :
          h("span", { class: "small" }, h("b", null, "Pesaing: "), "≈" + (Math.round(pl.rasio * 10) / 10).toString().replace(".", ",") + " per kursi (perkiraan dari " + pl.rasioDari + "; SSCASN belum menampilkan jumlah pelamar)"),
        h("span", { class: "small" }, h("b", null, "SKD: "), "skor Anda " + P.skor + " vs batas lolos SKB " + nilai(pl.cut) + (pl.cut[1] ? " (±" + pl.cut[1] + ")" : "") + " → " + (pl.margin >= 0 ? "+" : "") + pl.margin +
          (e ? ". Instansi ini 2024: tertinggi " + nilai(e.v[0]) + ", rata-rata peserta " + nilai(e.v[1]) + "; SKB tertinggi " + nilai(e.v[3], 1) + ", rata-rata " + nilai(e.v[4], 1) : "")),
        h("span", { class: "small" }, h("b", null, "Keahlian: "), pl.cocokK.length ? "cocok dengan " + pl.cocokK.join(", ") : "tidak ada kata tugas yang cocok dengan keahlian Anda", pl.lisan ? " · tugas cukup banyak bicara" : ""),
        x.g || x.u || tkKelas ? h("span", { class: "small muted" }, [x.g ? "Estimasi gaji " + x.g : "", x.u ? "usia " + x.u : "", tkKelas].filter(Boolean).join(" · ")) : null,
        x.lok && x.lok.length ? h("details", { class: "fm-lok" }, h("summary", null, "Rincian " + x.lok.length + " lokasi penempatan"),
          h("ul", { class: "plain-list small" }, x.lok.map(function (l) { return h("li", null, l[0] + ": " + l[1] + " kursi" + (l[2] === "disabilitas" ? " (khusus disabilitas)" : "")); }))) : null,
        x.p.length > 8 ? h("details", { class: "fm-lok" }, h("summary", null, "Pendidikan: " + x.p.length + " prodi" + (o.c === "ya" ? ", termasuk S-1 Ilmu Komunikasi" : "")),
          h("p", { class: "small muted" }, x.p.join(", "))) :
          h("span", { class: "small muted" }, "Pendidikan: " + x.p.join(", ") + (sma ? ". Lulusan S-1 umumnya boleh melamar dengan ijazah SMA/SMK; pastikan di pengumuman instansi." : "")),
        x.cat ? h("span", { class: "small" }, h("b", null, "Catatan: "), x.cat) : null,
        I ? h("span", { class: "small muted" }, "Seleksi: SKD " + I.skd + ". SKB " + I.skb + ".") : null,
        x.d ? h("span", { class: "small muted" }, "Tugas: " + x.d.slice(0, 220) + (x.d.length > 220 ? "…" : "")) : null,
        x.ragu ? h("span", { class: "small muted" }, "Detail formasi ini kurang lengkap terbaca; cek ulang di SSCASN.") : null,
        x.asal === "dok" ? h("span", { class: "small muted" }, "Sumber: " + x.dok + ".") : h("span", { class: "small muted" }, "Sumber: SSCASN."));
    };
    var daftar = h("div", { class: "stack", id: "fm-pindai-isi" });
    function isiDaftar() {
      var L = (grup[ui.kel] || []).slice(), q = ui.cari.trim().toLowerCase();
      if (q.length >= 2) L = L.filter(function (o) { return (o.x.j + " " + o.x.i + " " + o.x.l + " " + o.x.p.join(" ")).toLowerCase().indexOf(q) >= 0; });
      L.sort(function (a, b) { return b.pel.total - a.pel.total || b.x.k - a.x.k; });
      while (daftar.firstChild) daftar.removeChild(daftar.firstChild);
      if (!L.length) { daftar.appendChild(h("p", { class: "note" }, ui.kel === "ya" ? "Belum ada formasi yang mencantumkan S-1 Ilmu Komunikasi." : "Tidak ada formasi di kelompok ini.")); return; }
      daftar.appendChild(h("p", { class: "small muted" }, L.length + " formasi, " + rp(hitungKursi(L)) + " kursi, diurutkan dari peluang tertinggi."));
      daftar.appendChild(h("ul", { class: "fm-inst", id: "fm-pindai-list" }, L.slice(0, ui.n).map(kartuF)));
      if (L.length > ui.n) daftar.appendChild(h("button", { class: "btn", type: "button", onclick: function () { ui.n += 40; isiDaftar(); } }, "Tampilkan 40 lagi"));
    }
    isiDaftar();
    var status = (DOK ? "Data pengumuman resmi " + DOK.instansi.length + " instansi, dibaca " + DOK.tanggal + ". " : "") +
      (pakai ? "Hasil " + asal + ": " + tgl(pakai.waktu) + ", SSCASN menampilkan " + rp(pakai.total || 0) + " formasi di seleksi nasional saat itu." : "Belum ada hasil pindai SSCASN.");
    var segBtn = function (id, t) {
      return h("button", { type: "button", "aria-pressed": ui.kel === id ? "true" : "false", onclick: function (ev) {
        ui.kel = id; ui.n = 40;
        Array.prototype.forEach.call(ev.currentTarget.parentNode.children, function (b) { b.setAttribute("aria-pressed", "false"); });
        ev.currentTarget.setAttribute("aria-pressed", "true"); isiDaftar();
      } }, t);
    };
    var simpanP = function () { simpanProfil(P); F.forEach(function (o) { o.pel = peluang(o.x, P, o.tahap); }); isiDaftar(); };
    return h("section", { class: "panel", "aria-labelledby": "fm-pindai" },
      h("h2", { id: "fm-pindai" }, "Formasi CPNS 2026 untuk Anda"),
      h("p", { class: "small" }, status + (sim.galat ? " Pindai terakhir di HP gagal (" + tgl(sim.galatWaktu) + "): " + sim.galat : "")),
      h("div", { class: "row" },
        apk() && !online() ? h("button", { class: "btn primary", type: "button", id: "fm-pindai-btn", onclick: function () { mulai(); } }, "Pindai sekarang dari SSCASN") : null,
        h("a", { class: "btn", href: "https://sscasn.bkn.go.id/daftar-formasi/", target: "_blank", rel: "noopener" }, "Buka daftar formasi SSCASN")),
      online() ? h("p", { class: "small muted" }, "Versi online: pemindai di VPS membuka SSCASN seperti pengunjung biasa setiap 6 jam (S-1 Ilmu Komunikasi dan SMA/SMK) dan halaman ini selalu memakai hasil terbarunya.") :
        apk() ? h("label", { class: "check" }, h("input", { type: "checkbox", id: "fm-pindai-oto", checked: otomatis, onchange: function (e) { var s = baca(KEY) || {}; s.otomatis = e.target.checked; tulis(KEY, s); } }),
          h("span", null, "Pindai otomatis saat halaman ini dibuka, paling sering tiap 6 jam. Halaman resmi SSCASN terbuka di layar pindai; tekan Tutup untuk membatalkan.")) :
        h("p", { class: "small muted" }, "Data terbaru tersedia di versi online (Latihan Soal Pejuang NIP di superfal-dev.com) dan di APK."),
      h("div", { class: "tiles" },
        h("div", { class: "tile" }, h("span", { class: "v", id: "fm-pindai-n" }, rp(hitungKursi(grup.ya))), h("span", { class: "l" }, "kursi S-1 Ilmu Komunikasi"), h("span", { class: "d" }, grup.ya.length + " formasi di " + hitungInst(grup.ya) + " instansi")),
        h("div", { class: "tile" }, h("span", { class: "v", id: "fm-pindai-sma" }, rp(hitungKursi(grup.sma))), h("span", { class: "l" }, "kursi SMA/SMK"), h("span", { class: "d" }, grup.sma.length + " formasi di " + hitungInst(grup.sma) + " instansi")),
        h("div", { class: "tile" }, h("span", { class: "v", id: "fm-pindai-ss" }, rp(sscasnYa.reduce(function (a, x) { return a + x.k; }, 0))), h("span", { class: "l" }, "kursi Ilmu Komunikasi yang sudah tampil di SSCASN"), h("span", { class: "d" }, sscasnYa.length + " formasi; sisanya menyusul"))),
      h("details", { class: "fm-prof" }, h("summary", null, "Profil untuk perkiraan peluang (skor " + P.skor + ", " + P.keahlian.length + " keahlian)"),
        h("div", { class: "fm-form" },
          h("label", { class: "field" }, h("span", { class: "label" }, "Skor SKD Anda" + (P.dariTryout ? " (dari tryout terbaik)" : "")),
            h("input", { class: "input", id: "fm-pindai-skor", type: "number", min: 0, max: 550, inputmode: "numeric", value: P.skor,
              oninput: function (e) { var v = Math.round(Number(e.target.value)); if (v > 0 && v <= 550) { P.skor = v; P.skorManual = v; simpanP(); } } }))),
        h("div", { class: "fm-keahlian" }, KEAHLIAN.map(function (k) {
          return h("label", { class: "check" }, h("input", { type: "checkbox", value: k.id, checked: P.keahlian.indexOf(k.id) >= 0, onchange: function (e) {
            var i = P.keahlian.indexOf(k.id); if (e.target.checked && i < 0) P.keahlian.push(k.id); if (!e.target.checked && i >= 0) P.keahlian.splice(i, 1); simpanP();
          } }), h("span", null, k.t));
        })),
        h("label", { class: "check" }, h("input", { type: "checkbox", checked: P.nonverbal, onchange: function (e) { P.nonverbal = e.target.checked; simpanP(); } }), h("span", null, "Kurangi nilai jabatan yang tugasnya banyak bicara")),
        h("p", { class: "small muted" }, "Peluang = 35% persaingan (pelamar per kursi; perkiraan 2024 bila SSCASN belum menampilkan jumlah pelamar) + 35% selisih skor SKD Anda dengan batas lolos SKB instansi itu (data 2024, resmi atau perkiraan) + 20% kecocokan tugas dengan keahlian + 10% tahapan SKB (wawancara mengurangi). Gambaran kasar, bukan jaminan.")),
      h("div", { class: "seg", role: "group", "aria-label": "Kelompok formasi" },
        segBtn("ya", "S-1 Ilmu Komunikasi (" + grup.ya.length + ")"), segBtn("sma", "SMA/SMK (" + grup.sma.length + ")"), segBtn("lain", "Hampir cocok (" + grup.lain.length + ")")),
      h("label", { class: "field" }, h("span", { class: "label" }, "Cari jabatan, instansi, atau lokasi"),
        h("input", { class: "input wide", id: "fm-pindai-cari", type: "search", maxlength: 40, value: ui.cari, placeholder: "humas, Jakarta, BPK",
          oninput: function (e) { ui.cari = e.target.value.slice(0, 40); ui.n = 40; isiDaftar(); } })),
      daftar,
      INST.length ? [h("h3", null, "Instansi yang sudah mengumumkan seleksi"),
        h("ul", { class: "fm-inst", id: "fm-pindai-inst" }, INST.map(function (I) {
          var t = I.ilkom === "ya" ? ["ok", "menerima S-1 Ilmu Komunikasi" + (I.ilkomKursi ? ": " + rp(I.ilkomKursi) + " kursi" : "")] : I.ilkom === "tidak" ? ["bad", "tidak untuk S-1 Ilmu Komunikasi"] : ["", "Ilmu Komunikasi belum diketahui"];
          return h("li", null,
            h("div", { class: "row" }, h("b", null, I.n), h("span", { class: "tag " + t[0] }, t[1]), I.smaKursi ? h("span", { class: "tag" }, "SMA/SMK " + rp(I.smaKursi) + " kursi") : null, tagW(I)),
            I.dok ? h("span", { class: "small muted" }, I.dok) : null,
            h("span", { class: "small" }, I.ringkas),
            h("span", { class: "small" }, h("b", null, "SKD: "), I.skd + ". ", h("b", null, "SKB: "), I.skb + "."),
            I.syarat ? h("span", { class: "small muted" }, "Syarat penting: " + I.syarat + ".") : null,
            I.jadwal ? h("span", { class: "small muted" }, "Jadwal: " + I.jadwal + ".") : null,
            h("span", { class: "small" }, I.sumber.map(function (s, j) { return [j ? " · " : "", h("a", { href: s.u, target: "_blank", rel: "noopener" }, s.t)]; })));
        })),
        DOK && DOK.lain ? h("ul", { class: "plain-list small", id: "fm-pindai-lain" }, DOK.lain.map(function (x) { return h("li", null, h("b", null, x.n + ": "), x.t); })) : null,
        DOK && DOK.belum ? [h("h3", null, "Belum menerbitkan rincian formasi"), h("p", { class: "small" }, DOK.belum.join(", ") + "."), h("p", { class: "small muted" }, DOK.belumCatatan)] : null,
        h("p", { class: "small muted" }, DOK ? DOK.catatan : D.catatan)] : null);
  }

  SKD.pindai = { SCANNER: SCANNER, parse: parse, olah: olah, cocok: cocok, cari: cari, peluang: peluang, kunci: kunci, section: section, _rerender: null };
})();
