/* Pindai formasi SSCASN (data untuk tab Formasi; peluang dihitung js/kalkulator.js).
   Sumber data, urutan prioritas:
   1. Data live dari VPS: bila aplikasi dibuka dari superfal-dev.com/tools/pejuang-nip/ (web atau APK mode online), berkas
      live/pindai.json ditulis pemindai terjadwal di VPS (repo portofolio, projects/pejuang-nip/pindai) setiap 6 jam.
   2. Pindai di HP (APK): layar ScanActivity membuka halaman resmi SSCASN lalu menjalankan SCANNER.
   3. Hasil pindai bawaan (data/sscasn2026.js).
   SCANNER berjalan di halaman SSCASN seperti pengunjung biasa: filter Nama Pendidikan per kata kunci, CARI, lalu membaca kartu
   dan detail dengan jeda. Tidak memanggil API langsung, tidak mengubah header, tidak login, tidak menembus captcha.
   Tidak ada data pribadi yang dikirim. */
(function () {
  "use strict";
  var SKD = (window.SKD = window.SKD || {});
  var KEY = "skd.pindai.v1", KEY_LIVE = "skd.pindai.live", ENAM_JAM = 6 * 3600 * 1000;

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

  // ---------- penyimpanan ----------
  function baca(k) { try { return JSON.parse(localStorage.getItem(k)) || null; } catch (e) { return null; } }
  function tulis(k, o) { try { localStorage.setItem(k, JSON.stringify(o)); } catch (e) {} }
  function apk() { return !!(window.AndroidBridge && typeof window.AndroidBridge.pindaiSscasn === "function"); }
  function mulai() { if (apk()) window.AndroidBridge.pindaiSscasn("(" + SCANNER.toString() + ")();"); }
  function online() { return /^https?:$/.test(location.protocol) && /\/tools\/pejuang-nip\//.test(location.pathname); }

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

  // ---------- dipakai tab Formasi dan Pengaturan ----------
  function bisaPindai() { return apk() && !online(); }
  function otomatisAktif() { return (baca(KEY) || {}).otomatis !== false; }
  function aturOtomatis(v) { var s = baca(KEY) || {}; s.otomatis = !!v; tulis(KEY, s); }
  /** APK (salinan bawaan): pindai SSCASN otomatis sekali per buka aplikasi bila data terbaru lebih dari 6 jam. */
  function otomatis(rerender) {
    SKD.pindai._rerender = rerender;
    if (!bisaPindai() || !otomatisAktif()) return;
    try { if (sessionStorage.getItem("skd.pindai.dicoba")) return; sessionStorage.setItem("skd.pindai.dicoba", "1"); } catch (e) { return; }
    var w = [];
    [baca(KEY_LIVE), baca(KEY), SKD.sscasn2026 || null].forEach(function (d) { if (d && d.formasi && d.waktu) w.push(new Date(d.waktu).getTime()); });
    var umur = w.length ? Date.now() - Math.max.apply(null, w) : Infinity;
    if (umur > ENAM_JAM) setTimeout(mulai, 900);
  }

  SKD.pindai = { SCANNER: SCANNER, parse: parse, olah: olah, cocok: cocok, cari: cari, kunci: kunci, _rerender: null,
    bisaPindai: bisaPindai, mulai: mulai, otomatis: otomatis, otomatisAktif: otomatisAktif, aturOtomatis: aturOtomatis };
})();
