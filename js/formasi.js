/* Halaman Formasi: strategi pemilihan formasi CPNS 2026 + cek profil + skor dokumen riset + kalkulator.
   Data ada di data/formasi.js. Isian pengguna disimpan di localStorage perangkat ini saja.
   Rumus skor mengikuti dokumen riset pengguna: rasio 35, jumlah kursi 20, kecocokan tugas 20,
   lokasi 10, syarat dan risiko 15 (total 100). Matriks kedua dari dokumen strategi Pemda pengguna:
   pendidikan 25, jumlah formasi 20, jabatan/unit baru 20, persaingan 15, mekanisme seleksi 10, kesiapan SKB 10
   (tiap kriteria 1–5, nilai = jumlah skor/5 x bobot). Keduanya alat bantu, bukan rumus resmi BKN. */
(function () {
  "use strict";
  var SKD = (window.SKD = window.SKD || {});
  var KEY = "skd.formasi.v1";
  var AKR = [
    { v: "A", t: "A / Unggul" },
    { v: "B", t: "B / Baik Sekali" },
    { v: "C", t: "C / Baik" },
    { v: "?", t: "Belum tahu" }
  ];
  var LOK = [
    { v: "jabo", t: "Jabodetabek saja" },
    { v: "jabo-nasional", t: "Jabodetabek dulu, siap nasional" },
    { v: "nasional", t: "Di mana saja" }
  ];
  var SAING = { rendah: ["ok", "Persaingan rendah"], sedang: ["warn", "Persaingan sedang"], tinggi: ["bad", "Persaingan tinggi"] };
  var COCOK = { tinggi: "Cocok minat IT/digital", sedang: "Cukup cocok" };
  var LISAN = { rendah: ["ok", "Sedikit bicara"], sedang: ["warn", "Sebagian tugas lisan"], tinggi: ["bad", "Banyak bicara"] };
  var KAT = { layak: ["accent", "Layak, tunggu data 2026"], cadangan: ["warn", "Cadangan"], keluar: ["bad", "Keluar: tugas inti lisan"] };

  // ---------- rumus skor dokumen riset ----------
  var RASIO = [[5, 35], [10, 30], [20, 24], [30, 18], [50, 12], [100, 6]]; // di atas 100 pelamar per kursi: 2
  var SYARAT = {
    aman: ["Semua syarat terpenuhi", 15],
    catatan: ["Ada catatan (SKB wawancara, sertifikat menyusul)", 8],
    gugur: ["Syarat wajib tidak terpenuhi", 0]
  };
  var LOKF = [{ v: "jabo", t: "Jabodetabek" }, { v: "luar", t: "Luar Jabodetabek" }];
  function skorRasio(r) { for (var i = 0; i < RASIO.length; i++) if (r <= RASIO[i][0]) return RASIO[i][1]; return 2; }
  function skorKursi(k) { return k >= 10 ? 20 : k >= 4 ? 16 : k >= 2 ? 12 : 8; }
  function skorLokasi(lok, pref) { if (lok === "jabo" || pref === "nasional") return 10; return pref === "jabo" ? 0 : 6; }
  function kategori(total, gugur) {
    if (gugur) return ["bad", "Gugur"];
    if (total >= 75) return ["ok", "Sangat layak diteliti"];
    if (total >= 60) return ["accent", "Layak"];
    return ["warn", "Cadangan"];
  }
  // ---------- matriks dokumen strategi Pemda ----------
  var BARU = { resmi: ["Ada bukti resmi (SOTK, unit baru)", 5], indikasi: ["Ada indikasi, belum resmi", 3], tidak: ["Tidak ada atau belum dicek", 1] };
  var MEKAN = { cat: ["SKB CAT saja (aturan 2026)", 5], jelas: ["Ada tes non-CAT, aturan jelas", 3], belum: ["Belum jelas", 1] };
  var BOBOT = { pendidikan: 25, jumlah: 20, baru: 20, persaingan: 15, mekanisme: 10, skb: 10 };
  function skala(v, batas) { for (var i = 0; i < batas.length; i++) if (v <= batas[i]) return 5 - i; return 1; }
  /** Skor 1–5 per kriteria dan nilai akhir 0–100 (aturan gugur: pendidikan tidak cocok). */
  function matriks(k, a, j) {
    var gugur = k.syarat === "gugur";
    var s = {
      pendidikan: gugur ? 0 : k.syarat === "aman" ? 5 : 4,
      jumlah: a.kursi > 5 ? 5 : a.kursi >= 4 ? 4 : a.kursi,
      baru: (BARU[k.baru] || BARU.tidak)[1],
      persaingan: skala(a.rasio, [5, 10, 20, 50]),
      mekanisme: (MEKAN[k.mek] || MEKAN.cat)[1],
      skb: k.bidang === "pendidikan" ? 5 : j && j.skor ? j.skor.tugas / 5 + 1 : 3 // tugas 20/15/10/5/0 -> 5/4/3/2/1; bidang pendidikan = 5
    };
    var total = 0;
    for (var key in BOBOT) total += (s[key] / 5) * BOBOT[key];
    return { s: s, total: gugur ? 0 : Math.round(total), gugur: gugur };
  }

  function pre(j) { return j && j.skor ? j.skor.jumlah + j.skor.tugas + j.skor.lokasi + j.skor.syarat : null; }
  function jabById(id) {
    var D = SKD.formasi;
    if (!D || !id) return null;
    for (var i = 0; i < D.jabatan.length; i++) if (D.jabatan[i].id === id) return D.jabatan[i];
    return null;
  }

  function blank() { return { profil: { ipk: "", akr: "B", usia: "", lokasi: "jabo-nasional", nonverbal: true }, kandidat: [], cek: {}, urut: "pemda" }; }
  function numOr(v, d) { var n = Number(String(v).replace(",", ".")); return isFinite(n) && n > 0 ? n : d; }
  function sane(d) {
    var b = blank();
    if (!d || typeof d !== "object") return b;
    var p = d.profil || {};
    b.profil.ipk = typeof p.ipk === "string" ? p.ipk.slice(0, 5) : "";
    b.profil.usia = typeof p.usia === "string" ? p.usia.slice(0, 3) : "";
    if (AKR.some(function (a) { return a.v === p.akr; })) b.profil.akr = p.akr;
    if (LOK.some(function (a) { return a.v === p.lokasi; })) b.profil.lokasi = p.lokasi;
    if (p.nonverbal === false) b.profil.nonverbal = false;
    if (Array.isArray(d.kandidat)) {
      b.kandidat = d.kandidat.filter(function (k) { return k && typeof k.nama === "string"; }).slice(0, 40).map(function (k) {
        return {
          id: String(k.id || Math.random()), nama: k.nama.slice(0, 160), kursi: numOr(k.kursi, 1), pelamar: numOr(k.pelamar, 0), sejenis: numOr(k.sejenis, 0),
          jab: typeof k.jab === "string" ? k.jab.slice(0, 40) : "",
          lok: k.lok === "jabo" ? "jabo" : "luar",
          syarat: SYARAT[k.syarat] ? k.syarat : "catatan",
          baru: BARU[k.baru] ? k.baru : "tidak",
          mek: MEKAN[k.mek] ? k.mek : "cat"
        };
      });
    }
    if (d.cek && typeof d.cek === "object") for (var c in d.cek) if (d.cek[c] === true) b.cek[c] = true;
    if (d.urut === "dok") b.urut = "dok";
    var sk = Number(d.skor24);
    if (isFinite(sk) && sk > 0 && sk <= 550) b.skor24 = Math.round(sk);
    if (typeof d.cari24 === "string") b.cari24 = d.cari24.slice(0, 40);
    if (typeof d.cariInst === "string") b.cariInst = d.cariInst.slice(0, 40);
    return b;
  }
  var st = null;
  function state() {
    if (!st) {
      var raw = null;
      try { raw = JSON.parse(window.localStorage.getItem(KEY) || "null"); } catch (e) { raw = null; }
      st = sane(raw);
    }
    return st;
  }
  function save() { try { window.localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* mode privat: abaikan */ } }

  function fmt(n, dig) {
    var s = (Math.round(n * Math.pow(10, dig || 0)) / Math.pow(10, dig || 0)).toFixed(dig || 0);
    var parts = s.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return parts.join(",");
  }

  /** Analisis satu kandidat formasi: rasio, kursi SKB (3x kursi), posisi yang harus dicapai di SKD,
      dan skor rumus dokumen riset (pref = preferensi lokasi di Cek profil). */
  function analisis(k, pref) {
    var kursi = Math.max(1, Math.round(k.kursi)), n = Math.max(0, Math.round(k.pelamar)), skb = kursi * 3;
    var rasio = n / kursi, lev = rasio <= 10 ? "rendah" : rasio <= 30 ? "sedang" : "tinggi";
    var posisi = n <= skb ? "Cukup lulus ambang batas untuk ikut SKB" : "Masuk " + fmt(skb) + " besar dari " + fmt(n) + " (" + fmt((skb / n) * 100, skb / n < 0.1 ? 1 : 0) + "% teratas)";
    var j = jabById(k.jab), sy = SYARAT[k.syarat] || SYARAT.catatan;
    // Bidang pendidikan: pengalaman pemilik mengelola data akademik dan PDDikti membuat tugas paling cocok (20).
    var tugas = k.bidang === "pendidikan" ? 20 : j && j.skor ? j.skor.tugas : 10;
    var parts = { rasio: skorRasio(rasio), kursi: skorKursi(kursi), tugas: tugas, lokasi: skorLokasi(k.lok, pref || "jabo-nasional"), syarat: sy[1] };
    var gugur = k.syarat === "gugur", total = gugur ? 0 : parts.rasio + parts.kursi + parts.tugas + parts.lokasi + parts.syarat;
    var res = { kursi: kursi, n: n, skb: skb, rasio: rasio, lev: lev, posisi: posisi, parts: parts, total: total, kat: kategori(total, gugur) };
    res.pemda = matriks(k, res, j);
    return res;
  }
  SKD.formasiAnalisis = analisis; // untuk pengujian

  /** Skor kandidat hasil pemindaian otomatis. Bila jumlah pelamar belum ada, komponen persaingan/rasio
      tidak dihitung dan skor diskalakan ke 100 ("tanpa rasio"), sesuai prinsip dokumen riset. */
  var PRI = { P1: 1, P2: 2, P3: 3 };
  function skorKandidat(c, pref) {
    var k = { kursi: Math.max(1, Number(c.kursi) || 1), pelamar: c.pelamar == null ? 0 : Number(c.pelamar) || 0, jab: c.jab || "",
      lok: c.jabo ? "jabo" : "luar", syarat: SYARAT[c.syarat] ? c.syarat : "catatan", baru: BARU[c.baru] ? c.baru : "tidak", mek: MEKAN[c.mek] ? c.mek : "cat",
      bidang: c.bidang === "pendidikan" ? "pendidikan" : "" };
    var a = analisis(k, pref);
    if (c.pelamar != null && isFinite(Number(c.pelamar))) return { a: a.total, b: a.pemda.total, kat: a.kat, tanpaRasio: false, an: a };
    var p = a.parts, gugur = k.syarat === "gugur";
    var aPre = gugur ? 0 : Math.round(((p.kursi + p.tugas + p.lokasi + p.syarat) / 65) * 100);
    var bs = a.pemda.s, bPre = 0;
    ["pendidikan", "jumlah", "baru", "mekanisme", "skb"].forEach(function (key) { bPre += (bs[key] / 5) * BOBOT[key]; });
    bPre = gugur ? 0 : Math.round((bPre / 85) * 100);
    return { a: aPre, b: bPre, kat: kategori(bPre, gugur), tanpaRasio: true, an: a };
  }
  function urutKandidat(list, pref) {
    return list.map(function (c) { return { c: c, s: skorKandidat(c, pref) }; }).sort(function (x, y) {
      return y.s.b - x.s.b || y.s.a - x.s.a || (PRI[x.c.prioritas] || 9) - (PRI[y.c.prioritas] || 9);
    });
  }
  SKD.formasiKandidat = { skor: skorKandidat, urut: urutKandidat };
  SKD.formasiSkor = { rasio: skorRasio, kursi: skorKursi, lokasi: skorLokasi, kategori: kategori, pre: pre, matriks: matriks };

  SKD.formasiView = function (ctx) {
    var h = ctx.h, D = SKD.formasi, S = state(), P = S.profil;
    if (!D) return h("p", null, "Data formasi belum dimuat.");

    function set(path, v) { P[path] = v; save(); ctx.rerender(); }
    function scrollTo(id) {
      var el = document.getElementById(id);
      if (el && el.scrollIntoView) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    // ---------- cek profil ----------
    function checks() {
      var out = [], ipk = numOr(P.ipk, 0), usia = numOr(P.usia, 0), hist = ctx.history(), best = null;
      if (!ipk) out.push(["", "Isi IPK untuk mengecek syarat nilai."]);
      else if (ipk >= 3) out.push(["ok", "IPK " + P.ipk + " memenuhi syarat umum instansi pusat (biasanya minimal 3,00)."]);
      else if (ipk >= 2.75) out.push(["warn", "IPK di bawah 3,00: pilih instansi yang mensyaratkan 2,75 (misalnya Bawaslu 2024)."]);
      else out.push(["bad", "IPK di bawah 2,75: sebagian besar formasi S-1 tertutup."]);
      if (P.akr === "A") out.push(["ok", "Akreditasi A/Unggul pada tahun lulus: formasi umum terbuka; formasi cumlaude juga terbuka bila ijazah berpredikat dengan pujian."]);
      else if (P.akr === "B") out.push(["warn", "Akreditasi B/Baik Sekali pada tahun lulus: formasi umum terbuka, tetapi formasi cumlaude dan formasi yang mensyaratkan A/Unggul tertutup. Akreditasi yang dipakai adalah yang berlaku saat lulus, bukan akreditasi sekarang."]);
      else if (P.akr === "C") out.push(["bad", "Akreditasi C/Baik pada tahun lulus: banyak instansi pusat mensyaratkan minimal B. Saring formasinya dengan teliti."]);
      else out.push(["", "Cari SK akreditasi prodi dan kampus yang berlaku pada tanggal kelulusan di ijazah (BAN-PT atau kampus)."]);
      if (!usia) out.push(["", "Isi usia saat pendaftaran ditutup."]);
      else if (usia <= 35) out.push(["ok", "Usia " + P.usia + " tahun masih di dalam batas umum 18–35 tahun."]);
      else out.push(["bad", "Usia di atas 35 tahun: tidak memenuhi batas umum CPNS (kecuali jabatan tertentu)."]);
      if (P.nonverbal) out.push(["ok", "Filter aktif: jabatan yang tugas intinya bicara di depan orang (protokol, fasilitator, penyuluh, penggerak masyarakat, instruktur, edukator) disembunyikan."]);
      if (P.lokasi === "jabo") out.push(["warn", "Hanya Jabodetabek berarti hanya formasi yang paling ramai. Di kalkulator, formasi luar Jabodetabek mendapat 0 poin lokasi."]);
      else out.push(["ok", "Siap ditempatkan di luar Jabodetabek: Tier 1 di bawah terbuka untuk Anda."]);
      hist.forEach(function (x) { if (x.kind !== "mini" && (!best || x.total > best.total)) best = x; });
      if (!best) out.push(["", "Belum ada simulasi penuh 110 soal. Kerjakan satu untuk mengukur posisi Anda."]);
      else out.push([best.pass ? (best.total >= 400 ? "ok" : "warn") : "bad", "Simulasi penuh terbaik: " + best.total + (best.pass ? " (lulus ambang batas" + (best.total >= 400 ? ", sudah di atas target 400)." : "). Kejar 400 atau lebih supaya aman di formasi yang ramai.") : " (belum lulus ambang batas tiap subtes).")]);
      return out;
    }

    var profil = h("section", { class: "panel", "aria-labelledby": "fm-profil" },
      h("h2", { id: "fm-profil" }, "Cek profil"),
      h("p", { class: "small muted" }, "Jurusan: " + D.jurusan + ". Isian ini hanya tersimpan di perangkat ini."),
      h("div", { class: "row fm-fields" },
        h("label", { class: "field" }, h("span", { class: "label" }, "IPK"),
          h("input", { class: "input", id: "fm-ipk", inputmode: "decimal", placeholder: "3,25", value: P.ipk, onchange: function (e) { set("ipk", e.target.value.trim().slice(0, 5)); } })),
        h("label", { class: "field" }, h("span", { class: "label" }, "Usia saat pendaftaran ditutup"),
          h("input", { class: "input", id: "fm-usia", inputmode: "numeric", placeholder: "30", value: P.usia, onchange: function (e) { set("usia", e.target.value.trim().slice(0, 3)); } })),
        h("label", { class: "field" }, h("span", { class: "label" }, "Akreditasi prodi pada tahun lulus"),
          h("select", { class: "input wide", id: "fm-akr", onchange: function (e) { set("akr", e.target.value); } },
            AKR.map(function (a) { return h("option", { value: a.v, selected: P.akr === a.v }, a.t); })))),
      h("label", { class: "check" }, h("input", { type: "checkbox", id: "fm-nonverbal", checked: P.nonverbal, onchange: function (e) { set("nonverbal", e.target.checked); } }),
        h("span", null, h("b", null, "Hindari jabatan yang banyak bicara di depan orang. "), "Prioritas pada kerja belakang layar: arsip, data, dokumen, media.")),
      h("div", { class: "field" }, h("span", { class: "label" }, "Penempatan"),
        h("div", { class: "seg", role: "group", "aria-label": "Penempatan" }, LOK.map(function (l) {
          return h("button", { type: "button", "aria-pressed": P.lokasi === l.v ? "true" : "false", onclick: function () { set("lokasi", l.v); } }, l.t);
        }))),
      h("ul", { class: "fm-checks" }, checks().map(function (c) {
        return h("li", null, h("span", { class: "tag " + (c[0] || "") }, c[0] === "ok" ? "Aman" : c[0] === "warn" ? "Perhatikan" : c[0] === "bad" ? "Kendala" : "Isi"), h("span", null, c[1]));
      })));

    // ---------- kandidat formasi 2026 (pemindaian otomatis) ----------
    function isiKalkulator(c) {
      var f = document.querySelector(".fm-form");
      if (!f) return;
      f.elements.nama.value = [c.nama, c.instansi, c.lokasi].filter(Boolean).join(", ").slice(0, 160);
      if (c.jab && jabById(c.jab)) f.elements.jab.value = c.jab; else f.elements.jab.value = "";
      f.elements.kursi.value = String(c.kursi || 1);
      f.elements.pelamar.value = c.pelamar == null ? "" : String(c.pelamar);
      f.elements.lok.value = c.jabo ? "jabo" : "luar";
      f.elements.syarat.value = SYARAT[c.syarat] ? c.syarat : "catatan";
      f.elements.baru.value = BARU[c.baru] ? c.baru : "tidak";
      f.elements.mek.value = MEKAN[c.mek] ? c.mek : "cat";
      f.elements.bidang.value = c.bidang === "pendidikan" ? "pendidikan" : "";
      scrollTo("fm-kalk");
      f.elements.pelamar.focus();
      ctx.toast(c.pelamar == null ? "Data terisi. Isi jumlah pelamar (perkiraan boleh), lalu tekan Tambah." : "Data terisi. Tekan Tambah.");
    }
    // ---------- fokus pendidikan (pemda tidak membuka formasi) ----------
    var E = D.pendidikan;
    var pendidikanSec = E ? h("section", { class: "stack", "aria-labelledby": "fm-didik" },
      h("h2", { id: "fm-didik" }, "Fokus pendidikan 2026: paling cocok untuk Anda"),
      h("p", { class: "small" }, E.ringkas),
      h("p", { class: "note info" }, E.hitung),
      h("div", { class: "fm-tiers" }, E.target.map(function (t) {
        return h("article", { class: "panel fm-tier " + t.kelas },
          h("div", { class: "row between" }, h("h3", null, t.no + ". " + t.nama), h("span", { class: "tag " + t.kelas }, t.label)),
          h("p", { class: "small" }, h("b", null, "Peluang: "), t.peluang),
          h("p", { class: "small" }, t.isi),
          h("p", { class: "small" }, h("b", null, "Lokasi: "), t.lokasi),
          h("p", { class: "small" }, h("b", null, "Yang cocok: "), t.cocok),
          h("p", { class: "small muted" }, h("b", null, "Dasar perkiraan: "), t.alasan));
      })),
      h("div", { class: "panel" }, h("h3", null, "Tidak bisa dilamar dengan S-1 Ilmu Komunikasi"),
        h("ul", { class: "plain-list small" }, E.tidakCocok.map(function (t) { return h("li", null, t); }))),
      h("div", { class: "panel" }, h("h3", null, "Yang dicek begitu lampiran terbit"),
        h("ul", { class: "plain-list small" }, E.cek.map(function (t) { return h("li", null, t); })),
        h("ul", { class: "plain-list small" }, E.sumber.map(function (x) { return h("li", null, h("a", { href: x.u, target: "_blank", rel: "noopener" }, x.t)); })))) : null;
    var K = D.kandidat2026 || { list: [] }, kList = urutKandidat(K.list || [], P.lokasi);
    var kandidat = h("section", { class: "panel", "aria-labelledby": "fm-kandidat" },
      h("div", { class: "row between" }, h("h2", { id: "fm-kandidat" }, "Kandidat formasi 2026"),
        h("span", { class: "tag " + (K.status === "terbit" ? "ok" : K.status === "ditutup" ? "" : "warn") }, K.status === "terbit" ? "Formasi terbit" : K.status === "ditutup" ? "Pendaftaran ditutup" : "Menunggu formasi")),
      h("p", { class: "small muted" }, (K.catatan || "") + (K.tanggal ? " Pemindaian terakhir: " + K.tanggal + "." : "") + (K.jadwal ? " Jadwal pemantauan: " + K.jadwal + "." : "")),
      kList.length ? h("ol", { class: "fm-cands", "aria-label": "Kandidat formasi, peringkat tertinggi lebih dulu" }, kList.map(function (x, i) {
        var c = x.c, sk = x.s, j = jabById(c.jab);
        return h("li", { class: "fm-cand" },
          h("span", { class: "rk" }, i + 1),
          h("div", { class: "bd" },
            h("div", { class: "row between" }, h("span", { class: "nm" }, c.nama), h("span", { class: "tag " + sk.kat[0] + " fm-skor" }, sk.b + "/100")),
            h("span", { class: "small" }, [c.instansi, c.lokasi].filter(Boolean).join(" · ")),
            h("div", { class: "row" },
              c.bidang === "pendidikan" ? h("span", { class: "tag ok" }, "Bidang pendidikan") : null,
              c.prioritas ? h("span", { class: "tag accent" }, c.prioritas === "P1" ? "P1 jabatan/unit baru" : c.prioritas === "P2" ? "P2 kantor pusat di Kota Tangerang/Jabodetabek" : "P3 daerah sepi") : null,
              h("span", { class: "tag " + sk.kat[0] }, sk.kat[1]),
              sk.tanpaRasio ? h("span", { class: "tag" }, "tanpa rasio") : null,
              j && j.lisan === "tinggi" ? h("span", { class: "tag bad" }, "banyak bicara") : null),
            h("span", { class: "mt" }, "Matriks Pemda " + sk.b + " · Rumus dokumen riset " + sk.a + " · " + fmt(Number(c.kursi) || 1) + " kursi · " + (c.pelamar == null ? "pelamar belum ada" : fmt(Number(c.pelamar)) + " pelamar")),
            c.pendidikan ? h("span", { class: "small muted" }, "Pendidikan: " + c.pendidikan) : null,
            c.catatan ? h("span", { class: "small" }, c.catatan) : null,
            h("div", { class: "row" },
              c.url ? h("a", { class: "btn sm", href: c.url, target: "_blank", rel: "noopener" }, "Pengumuman resmi") : null,
              h("button", { class: "btn sm ghost", type: "button", onclick: function () { isiKalkulator(c); } }, "Masukkan ke kalkulator"))));
      })) : h("p", { class: "note info" }, "Belum ada kandidat. Begitu formasi resmi terbit (pendaftaran mulai 27 November), pemantau otomatis mengisi daftar ini lalu aplikasi mengurutkannya: Matriks Pemda lebih dulu, lalu rumus dokumen riset, lalu prioritas. Formasi bidang pendidikan mendapat nilai tugas dan kesiapan SKB tertinggi karena sesuai pengalaman Anda. Pemda tidak membuka formasi 2026–2027. Jabatan yang banyak bicara dan formasi yang tidak menerima S-1 Ilmu Komunikasi tidak dimasukkan."),
      (K.sumber || []).length ? h("ul", { class: "plain-list small" }, K.sumber.map(function (x) { return h("li", null, h("a", { href: x.u, target: "_blank", rel: "noopener" }, x.t)); })) : null);

    // ---------- skor sementara (rumus dokumen riset, tanpa rasio) ----------
    var berskor = D.jabatan.filter(function (j) { return j.skor; }).map(function (j) { return { j: j, s: pre(j) }; })
      .sort(function (a, b) { return b.s - a.s; });
    var urut = berskor.filter(function (x) { return !P.nonverbal || x.j.lisan !== "tinggi"; });
    var keluar = berskor.filter(function (x) { return urut.indexOf(x) < 0; });
    var skor = h("section", { class: "panel", "aria-labelledby": "fm-skor" },
      h("h2", { id: "fm-skor" }, "Skor sementara per jabatan"),
      h("p", { class: "small muted" }, "Rumus dokumen riset Anda: rasio 35 + jumlah formasi 20 + kecocokan tugas 20 + lokasi 10 + syarat dan risiko 15. Rasio pelamar 2026 belum tersedia, jadi skor di bawah dari 65 poin dan memakai data 2024. Gunakan untuk menentukan formasi mana yang dicek lebih dulu, bukan sebagai peluang lolos."),
      h("ol", { class: "fm-cands", "aria-label": "Jabatan, skor sementara tertinggi lebih dulu" }, urut.map(function (x, i) {
        var k = KAT[x.j.kat] || ["", ""], s = x.j.skor;
        if (x.j.lisan === "tinggi") k = KAT.keluar;
        return h("li", { class: "fm-cand" },
          h("span", { class: "rk" }, i + 1),
          h("div", { class: "bd" },
            h("div", { class: "row between" }, h("span", { class: "nm" }, x.j.nama), h("span", { class: "tag accent fm-skor" }, x.s + "/65")),
            h("span", { class: "mt" }, "Jumlah " + s.jumlah + " · Tugas " + s.tugas + " · Lokasi " + s.lokasi + " · Syarat " + s.syarat + " · Rasio: belum tersedia"),
            x.j.n ? h("span", { class: "small muted" }, "2024: " + fmt(x.j.n.kursi) + " kursi, " + fmt(x.j.n.formasi) + " formasi, S-1 Ilmu Komunikasi tercantum di " + fmt(x.j.n.ilkom) + " formasi") : null,
            h("div", { class: "row" }, h("span", { class: "tag " + k[0] }, k[1]), h("span", { class: "tag " + (SAING[x.j.saing] || [""])[0] }, (SAING[x.j.saing] || ["", ""])[1] + " (2024)"))));
      })),
      keluar.length ? h("p", { class: "note" }, h("b", null, "Keluar karena tugas inti lisan: "),
        keluar.map(function (x) { return x.j.nama + " (" + x.s + "/65)"; }).join(", ") + ". Skornya tidak rendah karena kursinya banyak, tetapi tugas intinya bicara di depan orang.") : null,
      h("p", { class: "note info" }, D.gugur),
      h("details", { class: "fm-rumus" }, h("summary", null, "Cara menghitung skor"),
        h("ul", { class: "plain-list small" },
          h("li", null, h("b", null, "Jumlah formasi (20): "), "formasi 2024 yang mencantumkan S-1 Ilmu Komunikasi. 500 atau lebih = 20, 250–499 = 16, 100–249 = 12, 50–99 = 8, di bawah 50 = 4. Di kalkulator diganti kursi formasi itu: 10 atau lebih = 20, 4–9 = 16, 2–3 = 12, 1 = 8."),
          h("li", null, h("b", null, "Kecocokan tugas (20): "), "20 kerja digital, data, atau arsip hampir tanpa bicara; 15 dokumen atau konten dengan sedikit tugas lisan; 10 sebagian tugas lisan; 5 koordinasi atau pendampingan tatap muka; 0 tugas inti bicara di depan orang."),
          h("li", null, h("b", null, "Lokasi (10): "), "10 banyak formasi di Jakarta dan daerah; 8 ada di Jakarta tetapi sedikit; 7 sebagian besar di daerah; 4 hampir semua di daerah. Di kalkulator: Jabodetabek 10, luar Jabodetabek 6 (0 bila Anda memilih Jabodetabek saja)."),
          h("li", null, h("b", null, "Syarat dan risiko (15): "), "15 Ilmu Komunikasi hampir selalu tercantum; 12 sering tercantum dengan catatan; 10 sekitar 1 dari 4 formasi atau ada SKB praktik; 8 sekitar 1 dari 10 formasi atau tes khusus; 5 jarang tercantum. Di kalkulator: semua syarat terpenuhi 15, ada catatan 8, syarat wajib tidak terpenuhi = gugur."),
          h("li", null, h("b", null, "Rasio (35): "), "diisi di kalkulator saat data 2026 ada. 5 pelamar per kursi atau kurang = 35, 10 = 30, 20 = 24, 30 = 18, 50 = 12, 100 = 6, di atas 100 = 2."),
          h("li", null, h("b", null, "Kategori akhir: "), "75 atau lebih = Sangat layak diteliti, 60–74 = Layak, di bawah 60 = Cadangan, syarat wajib tidak terpenuhi = Gugur."))));

    // ---------- prioritas Pemda (dokumen strategi Pemda) ----------
    var PD = D.pemda;
    var pemda = PD ? h("section", { class: "stack", "aria-labelledby": "fm-pemda" },
      h("h2", { id: "fm-pemda" }, "Prioritas Pemda: jabatan baru, Kota Tangerang, daerah sepi"),
      h("p", { class: "lede" }, "Urutan dari dokumen strategi Pemda Anda. Status per " + PD.tanggal + ":"),
      h("ul", { class: "plain-list small" }, PD.status.map(function (t) { return h("li", null, t); })),
      h("div", { class: "fm-tiers" }, PD.prioritas.map(function (x) {
        return h("article", { class: "panel fm-tier " + x.kelas },
          h("div", { class: "row between" }, h("h3", null, "Prioritas " + x.no + ": " + x.judul)),
          h("p", { class: "small" }, x.ringkas),
          h("ul", { class: "plain-list small" }, x.isi.map(function (t) { return h("li", null, t); })));
      })),
      h("p", { class: "small muted" }, PD.catatanData + " Di kalkulator, pilih \"Matriks Pemda\" untuk menghitung nilai tiap formasi dengan bobot dokumen ini (pendidikan 25, jumlah formasi 20, jabatan/unit baru 20, persaingan 15, mekanisme 10, kesiapan SKB 10).")) : null;

    // ---------- target ----------
    var target = h("section", { class: "stack", "aria-labelledby": "fm-target" },
      h("h2", { id: "fm-target" }, "Peringkat target untuk Anda"),
      h("p", { class: "lede" }, "Prioritas: peluang lolos lebih dulu, kerja belakang layar, instansi populer tidak wajib. Urutan ini disusun dari pola formasi dan hasil seleksi 2024, jadi cocokkan dengan formasi 2026 begitu terbit."),
      h("div", { class: "fm-tiers" }, D.target.map(function (t) {
        var dim = P.lokasi === "jabo" && t.tier !== "3";
        return h("article", { class: "panel fm-tier " + t.kelas + (dim ? " dim" : "") },
          h("div", { class: "row between" }, h("h3", null, "Tier " + t.tier), dim ? h("span", { class: "tag" }, "di luar Jabodetabek") : null),
          h("p", { class: "label" }, t.judul),
          h("ul", { class: "plain-list small" }, t.isi.map(function (x) { return h("li", null, x); })));
      })),
      h("div", { class: "note" }, h("b", null, "Hindari bila tujuan utama Anda peluang lolos: "),
        h("ul", { class: "plain-list" }, D.hindari.map(function (x) { return h("li", null, x); }))));

    // ---------- instansi dipantau ----------
    var pantau = h("section", { class: "stack", "aria-labelledby": "fm-pantau" },
      h("h2", { id: "fm-pantau" }, "Instansi yang dipantau untuk 2026"),
      h("p", { class: "lede" }, "Sinyal resmi 2026 dicocokkan dengan jejak formasi Ilmu Komunikasi 2024. Begitu SSCASN terbit, cek urutan ini lebih dulu."),
      h("div", { class: "fm-tiers" }, D.pantau.map(function (x) {
        return h("article", { class: "panel fm-tier " + (x.kelas || "") },
          h("h3", null, x.nama),
          h("p", { class: "small" }, h("b", null, "Sinyal 2026: "), x.sinyal),
          h("p", { class: "small" }, h("b", null, "Jejak 2024: "), x.jejak),
          h("p", { class: "small muted" }, h("b", null, "Saran: "), x.saran));
      })));

    // ---------- jabatan ----------
    var tampil = D.jabatan.filter(function (j) { return !P.nonverbal || j.lisan !== "tinggi"; });
    var sembunyi = D.jabatan.filter(function (j) { return tampil.indexOf(j) < 0; });
    var jabatan = h("section", { class: "stack", "aria-labelledby": "fm-jab" },
      h("h2", { id: "fm-jab" }, "Jabatan yang menerima " + D.jurusan),
      h("p", { class: "lede" }, "Rincian bukti per jabatan dari pengumuman resmi dan data formasi 2024. Nama jabatan saja tidak cukup: di satu instansi Pranata Humas menerima Ilmu Komunikasi, di instansi lain tidak."),
      h("div", { class: "peta-grid" }, tampil.map(function (j) {
        var sg = SAING[j.saing] || ["", j.saing], ls = LISAN[j.lisan] || ["", ""], sp = pre(j);
        return h("article", { class: "peta-card" },
          h("h3", null, j.nama),
          h("div", { class: "row" }, h("span", { class: "tag " + sg[0] }, sg[1]), h("span", { class: "tag " + ls[0] }, ls[1]), h("span", { class: "tag accent" }, COCOK[j.cocok] || ""),
            sp !== null ? h("span", { class: "tag" }, "Skor sementara " + sp + "/65") : null),
          h("p", { class: "small" }, j.tugas),
          h("ul", null, j.bukti.map(function (b) { return h("li", null, b); })),
          h("p", { class: "small muted" }, j.catatan));
      })),
      sembunyi.length ? h("p", { class: "note" }, h("b", null, "Disembunyikan karena banyak bicara di depan orang: "),
        sembunyi.map(function (j) { return j.nama; }).join(", ") + ". Semuanya menerima Ilmu Komunikasi pada 2024; matikan filter di Cek profil untuk melihat rinciannya.") : null,
      h("p", { class: "note info" }, D.tidakBisa));


    // ---------- data CPNS 2024 sebagai pembanding (data/skd2024.js) ----------
    var R24 = SKD.skd2024, riwayat = null;
    if (R24) {
      var semuaBaris = [];
      Object.keys(R24.rows).forEach(function (id) {
        R24.rows[id].forEach(function (r) { semuaBaris.push({ inst: id, jab: R24.jab[r[0]], jen: R24.jen[r[1]], kursi: r[2], hadir: r[3], pg: r[4], max: r[5], cut: r[6], skb: r[7], akhir: r[8] }); });
      });
      var namaInst = {}; R24.instansi.forEach(function (I) { namaInst[I.id] = I.nama; });
      var best24 = 0; ctx.history().forEach(function (x) { if (x.kind !== "mini" && x.total > best24) best24 = x.total; });
      if (!S.skor24) S.skor24 = best24 || 410;
      var pct = function (a, b) { return b ? Math.round((a / b) * 100) + "%" : "–"; };
      var th = function (t) { return h("th", { scope: "col" }, t); };
      var isi = function (el, kids) { while (el.firstChild) el.removeChild(el.firstChild); kids.forEach(function (k) { if (k) el.appendChild(k); }); };
      var hasilSkor = h("div", { class: "stack", id: "fm24-hasil" }), hasilCari = h("div", { class: "stack", id: "fm24-cari" });
      var hitungSkor = function () {
        var x = Number(S.skor24) || 0;
        isi(hasilSkor, [
          h("div", { class: "qtable fm-tbl" }, h("table", null,
            h("thead", null, h("tr", null, th("Instansi (2024)"), th("Formasi yang terjangkau"), th("Kursi yang terjangkau"))),
            h("tbody", null, R24.instansi.map(function (I) {
              var rs = R24.rows[I.id].filter(function (r) { return r[6]; }), nF = 0, kT = 0, kA = 0;
              rs.forEach(function (r) { kA += r[2]; if (x >= r[6]) { nF++; kT += r[2]; } });
              return h("tr", null, h("td", null, I.nama), h("td", null, nF + " dari " + rs.length + " (" + pct(nF, rs.length) + ")"), h("td", null, fmt(kT) + " dari " + fmt(kA) + " (" + pct(kT, kA) + ")"));
            })))),
          h("p", { class: "small muted" }, "\"Terjangkau\" berarti skor " + x + " sama dengan atau di atas nilai SKD terendah yang lolos ke SKB pada formasi itu di 2024 (peringkat sampai tiga kali jumlah kursi). Aturan 2026 sama: paling banyak tiga kali kebutuhan jabatan.")
        ]);
      };
      var cariJab = function () {
        var q = (S.cari24 || "").trim().toUpperCase(), x = Number(S.skor24) || 0;
        if (q.length < 3) { isi(hasilCari, [h("p", { class: "small muted" }, "Ketik minimal 3 huruf, misalnya arsiparis, hubungan masyarakat, pengembang teknologi, analis kebijakan, atau pranata komputer.")]); return; }
        var g = {};
        semuaBaris.forEach(function (b) { if (b.jab.indexOf(q) < 0) return; var k = b.inst + "|" + b.jab + "|" + b.jen; (g[k] = g[k] || { b: b, list: [] }).list.push(b); });
        var items = Object.keys(g).map(function (k) {
          var L = g[k].list, kursi = 0, hadir = 0, adaH = false, cuts = [], mx = 0, skb = 0, akh = [];
          L.forEach(function (b) { kursi += b.kursi; if (b.hadir != null) { hadir += b.hadir; adaH = true; } if (b.cut) cuts.push(b.cut); if (b.max > mx) mx = b.max; if (b.skb > skb) skb = b.skb; if (b.akhir) akh.push(b.akhir); });
          cuts.sort(function (a, c) { return a - c; }); akh.sort(function (a, c) { return a - c; });
          return { b: g[k].b, n: L.length, kursi: kursi, hadir: adaH ? hadir : null, max: mx, cuts: cuts, med: cuts.length ? cuts[Math.floor(cuts.length / 2)] : null,
            skb: skb || null, akhir: akh.length ? akh[Math.floor(akh.length / 2)] : null };
        }).sort(function (a, c) { return (a.med || 999) - (c.med || 999); });
        if (!items.length) { isi(hasilCari, [h("p", { class: "small muted" }, "Tidak ada jabatan \"" + S.cari24 + "\" di data kelima instansi ini.")]); return; }
        isi(hasilCari, [h("ul", { class: "fm-checks" }, items.slice(0, 40).map(function (it) {
          var c = it.cuts, lo = c[0], hi = c[c.length - 1], tag;
          if (!c.length) tag = h("span", { class: "tag" }, "tanpa data");
          else if (x >= hi) tag = h("span", { class: "tag ok" }, "terjangkau");
          else if (x >= lo) tag = h("span", { class: "tag accent" }, "sebagian");
          else tag = h("span", { class: "tag warn" }, "kurang " + (lo - x));
          var rentang = !c.length ? "tidak ada peserta lolos" : lo === hi ? String(lo) : lo + "–" + hi + " (median " + it.med + ")";
          return h("li", null, tag, h("span", null, h("b", null, it.b.jab), " · " + namaInst[it.b.inst] + " · " + it.b.jen.toLowerCase() + ". " +
            (it.n > 1 ? it.n + " formasi, " : "") + it.kursi + " kursi" + (it.hadir != null ? ", " + fmt(it.hadir) + " peserta hadir (" + fmt(it.hadir / it.kursi, 1) + " per kursi)" : "") +
            ". SKD tertinggi " + (it.max || "–") + "; SKD terendah yang lolos SKB " + rentang + "." +
            (it.skb ? " SKB tertinggi " + fmt(it.skb, 1) + (it.akhir ? "; nilai akhir terendah yang lulus " + fmt(it.akhir, 2) : "") + " (skala 100)." : "")));
        }))].concat(items.length > 40 ? [h("p", { class: "small muted" }, "Menampilkan 40 dari " + items.length + " hasil. Perjelas kata kuncinya.")] : []));
      };
      // semua kementerian/lembaga pusat 2024: angka resmi bila ada, selebihnya perkiraan dengan rentang (R24.model)
      var nilaiTeks = function (z, d) { return z[1] ? "≈" + fmt(z[0], d) + " (±" + z[1] + ")" : fmt(z[0], d); };
      var hasilSemua = h("div", { class: "stack", id: "fm24-semua" });
      var isiSemua = function () {
        if (!R24.semua) return;
        var q = (S.cariInst || "").trim().toLowerCase(), x = Number(S.skor24) || 0;
        var L = R24.semua.filter(function (e) { return !q || (e.n + " " + (e.g || "")).toLowerCase().indexOf(q) >= 0; })
          .sort(function (a, b) { return a.v[2][0] - b.v[2][0] || (a.n < b.n ? -1 : 1); });
        if (!L.length) { isi(hasilSemua, [h("p", { class: "small muted" }, "Tidak ada instansi \"" + S.cariInst + "\" di daftar ini.")]); return; }
        isi(hasilSemua, [h("p", { class: "small muted" }, L.length + " instansi, diurutkan dari batas lolos SKB terendah. Tanda skor memakai skor " + x + " dari bagian Bandingkan skor SKD Anda."),
          h("ul", { class: "fm-inst" }, L.map(function (e) {
            var nRes = e.v.filter(function (z) { return !z[1]; }).length, c = e.v[2], tagSkor;
            if (x >= c[0] + c[1]) tagSkor = h("span", { class: "tag ok" }, "skor " + x + " di atas batas");
            else if (x >= c[0] - c[1]) tagSkor = h("span", { class: "tag accent" }, "skor " + x + " di rentang batas");
            else tagSkor = h("span", { class: "tag warn" }, "kurang " + (c[0] - c[1] - x));
            var info = [];
            if (e.f) info.push(fmt(e.f) + " formasi" + (e.p ? " · " + fmt(e.p) + " pendaftar (" + fmt(e.p / e.f, 1) + " per formasi)" : ""));
            if (e.g) info.push("Kelompok 2026: " + e.g);
            if (e.c) info.push(e.c);
            return h("li", null,
              h("div", { class: "row" }, h("b", null, e.n), nRes === 6 ? h("span", { class: "tag ok" }, "resmi") : nRes ? h("span", { class: "tag accent" }, "sebagian resmi") : h("span", { class: "tag" }, "perkiraan"), tagSkor),
              h("span", { class: "nilai" }, "SKD tertinggi " + nilaiTeks(e.v[0]) + " · terendah lolos SKB " + nilaiTeks(e.v[2]) + " · rata-rata SKD semua peserta " + nilaiTeks(e.v[1])),
              h("span", { class: "nilai" }, "SKB tertinggi " + nilaiTeks(e.v[3], 1) + " · rata-rata SKB " + nilaiTeks(e.v[4], 1) + " · nilai akhir terendah lulus " + nilaiTeks(e.v[5], 1) + " (skala 100)"),
              info.length ? h("span", { class: "small muted" }, info.map(function (t) { return t.replace(/\.$/, ""); }).join(". ") + ".") : null,
              (e.lain || []).map(function (t) { return h("span", { class: "small muted" }, t); }));
          }))]);
      };
      riwayat = h("section", { class: "panel", "aria-labelledby": "fm-2024" },
        h("h2", { id: "fm-2024" }, "Data CPNS 2024 dan tahun sebelumnya: pembanding kementerian"),
        h("p", { class: "small" }, "Formasi 2026 hanya dari instansi pusat, jadi data 2024 instansi pusat menjadi pembanding terdekat. Gunakan untuk memperkirakan instansi dan jabatan yang sepi, lalu cocokkan dengan jumlah pelamar 2026 yang tampil di SSCASN."),
        h("div", { class: "tiles" }, R24.nasional.map(function (a) { return h("div", { class: "tile" }, h("span", { class: "v" }, a.v), h("span", { class: "l" }, a.l), h("span", { class: "d" }, a.d)); })),
        h("h3", null, "Pendaftar per formasi 2024 (instansi pusat)"),
        h("div", { class: "qtable fm-tbl" }, h("table", null,
          h("thead", null, h("tr", null, th("Instansi"), th("Pendaftar per formasi"))),
          h("tbody", null, R24.pelamar.slice().sort(function (a, b) { return a.p / a.f - b.p / b.f; }).map(function (r) {
            var rasio = r.p / r.f, c = rasio <= 10 ? "ok-t" : rasio >= 30 ? "bad-t" : "";
            return h("tr", null, h("td", null, h("b", null, r.n), h("br"), h("span", { class: "small muted" }, fmt(r.f) + " formasi · " + fmt(r.p) + " pendaftar" + (r.g ? " · 2026: " + r.g : ""))),
              h("td", { class: c }, h("b", null, fmt(rasio, 1))));
          })))),
        h("p", { class: "small muted" }, "Data BKN per " + R24.pelamarTanggal + " Pendaftar belum tentu memenuhi syarat atau hadir; pesaing nyata di SKD lebih sedikit (contoh: Wantannas 900 pendaftar, 661 peserta hadir untuk 62 kursi; Kemhan 43.505 pendaftar, 28.680 hadir)."),
        h("h3", null, "Nilai SKD 2024 per instansi (laporan resmi SSCASN)"),
        h("div", { class: "qtable fm-tbl" }, h("table", null,
          h("thead", null, h("tr", null, th("Instansi"), th("SKD tertinggi"), th("SKD terendah lolos SKB (median)"))),
          h("tbody", null, R24.instansi.map(function (I) {
            var rinci = [fmt(I.kursi) + " kursi"];
            if (I.hadir) rinci.push(fmt(I.hadir / (I.kursiSkd || I.kursi), 1) + " peserta SKD per kursi", "lulus ambang batas " + pct(I.pg, I.hadir), "rata-rata SKD semua peserta " + fmt(I.skdRata, 1));
            if (I.skdRataSkb) rinci.push("rata-rata SKD peserta SKB " + fmt(I.skdRataSkb, 1));
            return h("tr", null, h("td", null, h("b", null, I.nama), h("br"), h("span", { class: "small muted" }, rinci.join(" · "))), h("td", null, I.skdMax), h("td", null, h("b", null, I.cutMed || "–")));
          })))),
        h("h3", null, "Nilai SKB dan nilai akhir 2024 (skala 100)"),
        h("div", { class: "qtable fm-tbl" }, h("table", null,
          h("thead", null, h("tr", null, th("Instansi"), th("SKB tertinggi"), th("Akhir terendah lulus (median)"))),
          h("tbody", null, R24.instansi.filter(function (I) { return I.skbMax; }).map(function (I) {
            var rinci = ["rata-rata SKB " + fmt(I.skbRata, 1), "nilai akhir tertinggi " + fmt(I.akhirMax, 2), "rata-rata nilai akhir yang lulus " + fmt(I.akhirRata, 2), fmt(I.lulus) + " lulus"];
            if (I.catMax) rinci.push("CAT SKB tertinggi " + I.catMax + " dari 500, rata-rata " + fmt(I.catRata, 1));
            return h("tr", null, h("td", null, h("b", null, I.nama), h("br"), h("span", { class: "small muted" }, rinci.join(" · "))), h("td", null, fmt(I.skbMax, 1)), h("td", null, h("b", null, fmt(I.akhirMinMed, 2))));
          })))),
        h("p", { class: "small muted" }, "Nilai akhir = 40% SKD (skala 100, yaitu SKD ÷ 5,5) + 60% SKB (skala 100). Contoh: SKD 410 bernilai 74,5 pada skala 100, jadi menyumbang 29,8; sisanya dari SKB. SKB tertinggi nasional 2024 (CAT, dari 500): " +
          R24.tertinggiSkb.map(function (t) { return t[0] + " " + t[1]; }).join(", ") + "."),
        h("p", { class: "small muted" }, "Median ditimbang per kursi. Di Mahkamah Agung banyak formasi besar (misalnya Dokumentalis Hukum, 2.949 kursi) kekurangan peserta yang lulus ambang batas, sehingga semua yang lulus ambang batas masuk SKB. Jumlah peserta hadir dan rata-rata SKD semua peserta hanya ada bila instansi menerbitkan laporan hasil SKD. Nilai SKD tertinggi nasional 2024: " +
          R24.tertinggi.map(function (t) { return t[0] + " " + t[1]; }).join(", ") + "."),
        R24.semua ? [
          h("h3", { id: "fm24-semua-h" }, "Semua kementerian dan lembaga: angka resmi dan perkiraan"),
          h("p", { class: "small" }, "Nilai 2024 untuk " + R24.semua.length + " instansi pusat. Angka tanpa tanda ≈ berasal dari laporan resmi; angka bertanda ≈ adalah perkiraan dengan rentang ±, karena laporan instansi itu tidak bisa diunduh. Untuk 2021 dan 2023 (skala dan ambang batas sama) pakai angka yang sama dengan selisih kira-kira ±10; sebelum 2021 skalanya 500 sehingga tidak sebanding."),
          h("label", { class: "field" }, h("span", { class: "label" }, "Cari instansi atau kelompok formasi 2026"),
            h("input", { class: "input wide", id: "fm24-inst", type: "search", maxlength: 40, placeholder: "kesehatan, hukum, keuangan", value: S.cariInst || "",
              oninput: function (e) { S.cariInst = e.target.value.slice(0, 40); save(); isiSemua(); } })),
          hasilSemua,
          h("p", { class: "note info" }, h("b", null, "Cara perkiraan. "), R24.model)
        ] : null,
        R24.riwayatResmi ? [
          h("h3", null, "Riwayat resmi lintas tahun"),
          h("p", { class: "small" }, "Instansi yang laporan resminya untuk beberapa tahun bisa diunduh. Nilai akhir memakai skala 100."),
          h("ul", { class: "fm-inst", id: "fm24-riwayat" }, R24.riwayatResmi.map(function (o) {
            var rinci = [fmt(o.kursi) + " kursi"];
            if (o.hadir) rinci.push(fmt(o.hadir) + " peserta SKD", "lulus ambang batas " + pct(o.pg, o.hadir), "rata-rata SKD semua peserta " + fmt(o.skdRata, 1));
            if (o.skbPeserta) rinci.push(fmt(o.skbPeserta) + " peserta SKB");
            return h("li", null,
              h("div", { class: "row" }, h("b", null, o.n + " · " + o.th), h("span", { class: "tag" + (o.skala === 500 ? " warn" : "") }, "skala " + o.skala)),
              h("span", { class: "nilai" }, "SKD tertinggi " + o.skdMax + " · terendah lolos SKB ", h("b", null, o.cut), " (median) · rata-rata SKD peserta SKB " + fmt(o.skdRataSkb, 1)),
              h("span", { class: "nilai" }, "SKB tertinggi " + fmt(o.skbMax, 1) + " · rata-rata SKB " + fmt(o.skbRata, 1) + " · nilai akhir terendah lulus ", h("b", null, fmt(o.akhirMin, 2)), " (median), tertinggi " + fmt(o.akhirMax, 2)),
              h("span", { class: "small muted" }, rinci.join(" · ") + "."));
          })),
          h("p", { class: "small muted" }, "2019 memakai skala 500 (TWK 175, TIU 150, TKP 175), jadi tidak bisa dibandingkan langsung dengan 2021 ke atas (skala 550). Batas Mahkamah Agung 2024 turun ke 313 karena formasi besar kekurangan peserta yang lulus ambang batas; pada 2021 dan 2023, dengan kursi lebih sedikit, batasnya 382 dan 378. PPATK 2023 menunjukkan instansi kecil yang favorit bisa mencapai batas 444.")
        ] : null,
        R24.tahunan ? [
          h("h3", null, "Riwayat nasional sejak 2000-an"),
          h("ul", { class: "fm-inst", id: "fm24-nasional" }, R24.tahunan.map(function (t) {
            var ada = t.max !== "–", rinci = [];
            if (t.lulus !== "–") rinci.push("Lulus ambang batas: " + t.lulus);
            if (t.rata !== "–") rinci.push("Rata-rata SKD: " + t.rata);
            if (t.skb !== "–") rinci.push("SKB: " + t.skb);
            var tg = { resmi: h("span", { class: "tag ok" }, "resmi"), sementara: h("span", { class: "tag accent" }, "angka saat tes"), perkiraan: h("span", { class: "tag" }, "ada perkiraan") }[t.st] || null;
            return h("li", null,
              h("div", { class: "row" }, h("b", null, t.th), tg),
              h("span", { class: ada ? "nilai" : "small muted" }, ada ? "SKD tertinggi: " + t.max : t.skala),
              ada ? h("span", { class: "nilai" }, "Ambang batas: " + t.ambang) : null,
              ada ? h("span", { class: "small muted" }, [t.skala].concat(rinci).map(function (x) { return x.replace(/\.$/, ""); }).join(". ") + ".") : null);
          })),
          h("p", { class: "small muted" }, "Angka \"per tanggal\" adalah nilai tertinggi yang diumumkan saat tes masih berjalan; angka akhirnya bisa sedikit lebih tinggi. Rata-rata nasional tidak pernah diumumkan; angka perkiraan di atas disusun dari tingkat kelulusan ambang batas dan data resmi instansi.")
        ] : null,
        h("h3", null, "Bandingkan skor SKD Anda"),
        h("label", { class: "field" }, h("span", { class: "label" }, "Skor SKD (hasil tryout penuh terbaik Anda" + (best24 ? ": " + best24 : "") + ")"),
          h("input", { class: "input", id: "fm24-skor", type: "number", inputmode: "numeric", min: 0, max: 550, value: S.skor24,
            oninput: function (e) { var v = Math.round(Number(e.target.value)); if (v > 0 && v <= 550) { S.skor24 = v; save(); hitungSkor(); cariJab(); isiSemua(); } } })),
        hasilSkor,
        h("h3", null, "Cari jabatan"),
        h("label", { class: "field" }, h("span", { class: "label" }, "Nama jabatan"),
          h("input", { class: "input wide", id: "fm24-cari-in", type: "search", maxlength: 40, placeholder: "arsiparis", value: S.cari24 || "",
            oninput: function (e) { S.cari24 = e.target.value.slice(0, 40); save(); cariJab(); } })),
        hasilCari,
        h("p", { class: "note info" }, "Data 2024 hanya pembanding. Formasi, lokasi, dan jumlah pelamar 2026 berbeda; skor aman tetap bergantung pada pesaing di formasi yang Anda pilih. Data per formasi berasal dari " + R24.instansi.length + " instansi yang laporannya dapat diunduh langsung dari situs resminya; laporan BPS, Kemenag, Komdigi, BKN, Bappenas, Kemenkes, Kemenkop, BSSN, BPK, dan Setjen DPR menolak akses dari server pembuat data."),
        h("ul", { class: "plain-list small" }, R24.sumber.map(function (x) { return h("li", null, h("a", { href: x.u, target: "_blank", rel: "noopener" }, x.t)); })));
      hitungSkor(); cariJab(); isiSemua();
    }

    // ---------- validasi dokumen riset ----------
    var V = D.validasi;
    var validasi = h("section", { class: "panel", "aria-labelledby": "fm-validasi" },
      h("h2", { id: "fm-validasi" }, "Validasi dokumen riset Anda"),
      h("p", { class: "small muted" }, "Angka di bagian 5 dokumen riset dicocokkan dengan data formasi 2024 (olahan MisiPNS atas data BKN, pihak ketiga) dan pengumuman resmi instansi."),
      h("h3", null, "Jumlah formasi per jabatan (5.1)"),
      h("div", { class: "qtable fm-tbl" }, h("table", null,
        h("thead", null, h("tr", null, h("th", { scope: "col" }, "Jabatan"), h("th", { scope: "col" }, "Dokumen"), h("th", { scope: "col" }, "Data 2024"), h("th", { scope: "col" }, "Selisih"))),
        h("tbody", null, V.jabatan.map(function (r) {
          return h("tr", null, h("td", null, r.nama), h("td", null, fmt(r.md)), h("td", null, fmt(r.ilkom)), h("td", null, "+" + fmt(((r.ilkom - r.md) / r.md) * 100) + "%"));
        })))),
      h("p", { class: "small" }, h("b", null, "Hasil: "), V.jabatanHasil),
      h("h3", null, "Instansi dengan rasio rendah (5.2)"),
      h("ul", { class: "fm-checks" }, V.instansi.map(function (r) {
        var c = r.hasil === "Gugur" ? "bad" : r.hasil === "Belum jelas" ? "" : "warn";
        return h("li", null, h("span", { class: "tag " + c }, r.hasil), h("span", null, h("b", null, r.nama + " "), "(" + r.md + "): " + r.isi + "."));
      })),
      h("p", { class: "note" }, V.instansiHasil));

    // ---------- aturan ----------
    var aturan = h("section", { class: "panel", "aria-labelledby": "fm-aturan" },
      h("h2", { id: "fm-aturan" }, "Aturan memilih formasi"),
      h("ol", { class: "plain-list fm-rules" }, D.aturan.map(function (a) { return h("li", null, h("b", null, a.t + ". "), a.d); })));

    // ---------- kalkulator ----------
    function addKandidat(e) {
      e.preventDefault();
      var f = e.target, nama = f.elements.nama.value.trim(), kursi = numOr(f.elements.kursi.value, 0), pel = Number(String(f.elements.pelamar.value).replace(",", "."));
      if (!nama) { ctx.toast("Isi nama formasi."); return; }
      if (!kursi) { ctx.toast("Isi jumlah kursi (minimal 1)."); return; }
      if (!isFinite(pel) || pel < 0 || f.elements.pelamar.value.trim() === "") { ctx.toast("Isi jumlah pelamar (perkiraan boleh)."); return; }
      S.kandidat.push({
        id: String(Date.now()), nama: nama.slice(0, 160), kursi: kursi, pelamar: pel, sejenis: numOr(f.elements.sejenis.value, 0),
        jab: f.elements.jab.value, lok: f.elements.lok.value === "jabo" ? "jabo" : "luar", syarat: SYARAT[f.elements.syarat.value] ? f.elements.syarat.value : "catatan",
        baru: BARU[f.elements.baru.value] ? f.elements.baru.value : "tidak", mek: MEKAN[f.elements.mek.value] ? f.elements.mek.value : "cat",
        bidang: f.elements.bidang.value === "pendidikan" ? "pendidikan" : ""
      });
      save();
      ctx.rerender();
      ctx.toast("Kandidat ditambahkan.");
    }
    var pakaiPemda = S.urut !== "dok";
    var rows = S.kandidat.map(function (k) { return { k: k, a: analisis(k, P.lokasi) }; })
      .sort(function (x, y) { return (pakaiPemda ? y.a.pemda.total - x.a.pemda.total : y.a.total - x.a.total) || x.a.rasio - y.a.rasio; });
    var kalk = h("section", { class: "panel", "aria-labelledby": "fm-kalk" },
      h("h2", { id: "fm-kalk" }, "Kalkulator peluang"),
      h("p", { class: "small muted" }, "Masukkan formasi kandidat dari SSCASN. Skor dihitung dengan rumus dokumen riset Anda (rasio 35, kursi 20, tugas 20, lokasi 10, syarat 15). Selama pendaftaran, jumlah pelamar per formasi biasanya belum ditampilkan, jadi isi perkiraan; setelah seleksi administrasi, ganti dengan jumlah pesaing yang memenuhi syarat. Peserta dengan nilai SKD tertinggi sampai 3 kali jumlah kursi lanjut ke SKB."),
      h("form", { class: "fm-form", onsubmit: addKandidat },
        h("label", { class: "field grow" }, h("span", { class: "label" }, "Formasi (jabatan, instansi, lokasi)"), h("input", { class: "input wide", name: "nama", placeholder: "Arsiparis Ahli Pertama, PTN X" })),
        h("label", { class: "field sel" }, h("span", { class: "label" }, "Jabatan"),
          h("select", { class: "input wide", name: "jab" },
            D.jabatan.filter(function (j) { return j.skor; }).map(function (j) { return h("option", { value: j.id }, j.nama); })
              .concat([h("option", { value: "" }, "Jabatan lain (tugas dinilai 10)")]))),
        h("label", { class: "field" }, h("span", { class: "label" }, "Kursi"), h("input", { class: "input", name: "kursi", inputmode: "numeric", placeholder: "1" })),
        h("label", { class: "field" }, h("span", { class: "label" }, "Pelamar"), h("input", { class: "input", name: "pelamar", inputmode: "numeric", placeholder: "40" })),
        h("label", { class: "field" }, h("span", { class: "label" }, "Lokasi sejenis"), h("input", { class: "input", name: "sejenis", inputmode: "numeric", placeholder: "opsional" })),
        h("label", { class: "field sel" }, h("span", { class: "label" }, "Lokasi"),
          h("select", { class: "input wide", name: "lok" }, LOKF.map(function (l) { return h("option", { value: l.v }, l.t); }))),
        h("label", { class: "field sel" }, h("span", { class: "label" }, "Syarat"),
          h("select", { class: "input wide", name: "syarat" }, ["aman", "catatan", "gugur"].map(function (v) { return h("option", { value: v }, SYARAT[v][0]); }))),
        h("label", { class: "field sel" }, h("span", { class: "label" }, "Jabatan/unit baru"),
          h("select", { class: "input wide", name: "baru" }, ["tidak", "indikasi", "resmi"].map(function (v) { return h("option", { value: v }, BARU[v][0]); }))),
        h("label", { class: "field sel" }, h("span", { class: "label" }, "Tahapan seleksi"),
          h("select", { class: "input wide", name: "mek" }, ["cat", "jelas", "belum"].map(function (v) { return h("option", { value: v }, MEKAN[v][0]); }))),
        h("label", { class: "field sel" }, h("span", { class: "label" }, "Bidang"),
          h("select", { class: "input wide", name: "bidang" }, [h("option", { value: "" }, "Umum"), h("option", { value: "pendidikan" }, "Pendidikan (sesuai pengalaman data akademik)")])),
        h("button", { class: "btn primary", type: "submit" }, "Tambah")),
      rows.length ? h("div", { class: "field" }, h("span", { class: "label" }, "Urutkan dengan"),
        h("div", { class: "seg", role: "group", "aria-label": "Urutkan dengan" }, [["pemda", "Matriks Pemda"], ["dok", "Rumus dokumen riset"]].map(function (o) {
          return h("button", { type: "button", "aria-pressed": (o[0] === "pemda") === pakaiPemda ? "true" : "false", onclick: function () { S.urut = o[0]; save(); ctx.rerender(); } }, o[1]);
        }))) : null,
      rows.length ? h("ol", { class: "fm-cands", "aria-label": "Kandidat, skor tertinggi lebih dulu" }, rows.map(function (r, i) {
        var sg = SAING[r.a.lev], p = r.a.parts, j = jabById(r.k.jab);
        var kat = pakaiPemda ? kategori(r.a.pemda.total, r.a.pemda.gugur) : r.a.kat, nilai = pakaiPemda ? r.a.pemda.total : r.a.total;
        return h("li", { class: "fm-cand" },
          h("span", { class: "rk" }, i + 1),
          h("div", { class: "bd" },
            h("div", { class: "row between" }, h("span", { class: "nm" }, r.k.nama),
              h("span", { class: "tag " + kat[0] + " fm-skor" }, nilai + "/100")),
            h("div", { class: "row" }, h("span", { class: "tag " + kat[0] }, kat[1]),
              h("span", { class: "tag " + sg[0] }, fmt(r.a.rasio, r.a.rasio < 10 ? 1 : 0) + " per kursi")),
            h("span", { class: "mt" }, "Matriks Pemda " + r.a.pemda.total + "/100: pendidikan " + r.a.pemda.s.pendidikan + " · jumlah " + r.a.pemda.s.jumlah + " · baru " + r.a.pemda.s.baru + " · persaingan " + r.a.pemda.s.persaingan + " · mekanisme " + r.a.pemda.s.mekanisme + " · SKB " + r.a.pemda.s.skb + " (skala 1–5)"),
            h("span", { class: "mt" }, "Rumus dokumen riset " + r.a.total + "/100: rasio " + p.rasio + " · kursi " + p.kursi + " · tugas " + p.tugas + " · lokasi " + p.lokasi + " · syarat " + p.syarat),
            h("span", { class: "mt" }, (j ? j.nama + " · " : "") + fmt(r.a.kursi) + " kursi · " + fmt(r.a.n) + " pelamar · " + fmt(r.a.skb) + " kursi SKB"),
            h("span", { class: "small" }, h("b", null, "Syarat ikut SKB: "), r.a.posisi),
            r.k.sejenis > 1 ? h("span", { class: "small muted" }, "Jabatan sama di " + fmt(r.k.sejenis) + " lokasi dalam instansi ini: ada peluang optimalisasi.") : null),
          h("button", { class: "btn sm ghost", type: "button", "aria-label": "Hapus " + r.k.nama, onclick: function () {
            S.kandidat = S.kandidat.filter(function (x) { return x.id !== r.k.id; }); save(); ctx.rerender();
          } }, "Hapus"));
      })) : h("p", { class: "muted small" }, "Belum ada kandidat. Rincian formasi 2026 kini ditargetkan terbit 23–29 November 2026."),
      rows.length ? h("p", { class: "small muted" }, "Urutan teratas = nilai tertinggi menurut pilihan di atas. Kedua skor adalah alat bantu dari dokumen Anda, bukan rumus resmi BKN dan bukan peluang lolos. Formasi yang tidak menerima ijazah Anda gugur di kedua rumus.") : null);

    // ---------- langkah ----------
    var done = D.langkah.filter(function (l) { return S.cek[l.id]; }).length;
    var langkah = h("section", { class: "panel", "aria-labelledby": "fm-langkah" },
      h("div", { class: "row between" }, h("h2", { id: "fm-langkah" }, "Langkah berikutnya"), h("span", { class: "tag " + (done === D.langkah.length ? "ok" : "") }, done + " / " + D.langkah.length)),
      h("div", { class: "stack" }, D.langkah.map(function (l) {
        return h("label", { class: "check" }, h("input", { type: "checkbox", checked: !!S.cek[l.id], onchange: function (e) {
          if (e.target.checked) S.cek[l.id] = true; else delete S.cek[l.id];
          save(); ctx.rerender();
        } }), h("span", null, l.t));
      })));

    // ---------- jalur lain ----------
    var lain = h("section", { class: "stack", "aria-labelledby": "fm-lain" },
      h("h2", { id: "fm-lain" }, "Jalur lain yang berhubungan dengan pemerintahan"),
      h("div", { class: "peta-grid" }, D.jalurLain.map(function (j) {
        return h("article", { class: "peta-card" },
          h("div", { class: "row between" }, h("h3", null, j.t), h("span", { class: "tag" }, j.s)),
          h("p", { class: "small" }, j.d));
      })));

    var sumber = h("section", { class: "panel", "aria-labelledby": "fm-sumber" },
      h("h2", { id: "fm-sumber" }, "Sumber"),
      h("p", { class: "small muted" }, "Angka 2024 berasal dari pengumuman resmi, rekap hasil BKN, dan olahan pihak ketiga atas data BKN. Skor, penilaian persaingan, dan perkiraan 2026 adalah analisis, bukan data resmi."),
      h("ul", { class: "plain-list" }, D.sumber.map(function (s) { return h("li", null, h("a", { href: s.u, target: "_blank", rel: "noopener" }, s.t)); })));

    return [
      h("div", { class: "stack" }, h("h1", null, "Strategi formasi CPNS 2026"),
        h("p", { class: "lede" }, "Pemindaian untuk lulusan " + D.jurusan + " dengan rumus dokumen riset Anda, difokuskan ke bidang pendidikan sesuai pengalaman Anda. Formasi 2026–2027 hanya dari instansi pusat (pemda tidak membuka). Pendaftaran di SSCASN dibuka 27 November sampai awal Desember 2026; rincian jabatan, kualifikasi, dan lokasi ada di sana."),
        h("div", { class: "row" }, h("a", { class: "btn primary", href: "#kalkulator" }, "Kalkulator formasi"),
          h("a", { class: "btn", href: "https://sscasn.bkn.go.id/daftar-formasi/", target: "_blank", rel: "noopener" }, "Daftar formasi SSCASN"),
          SKD.pindai ? h("button", { class: "btn", type: "button", onclick: function () { scrollTo("fm-pindai"); } }, "Pindai SSCASN") : null,
          h("button", { class: "btn", type: "button", onclick: function () { scrollTo("fm-kalk"); } }, "Ke kalkulator"),
          D.pendidikan ? h("button", { class: "btn", type: "button", onclick: function () { scrollTo("fm-didik"); } }, "Fokus pendidikan") : null,
          SKD.skd2024 ? h("button", { class: "btn", type: "button", onclick: function () { scrollTo("fm-2024"); } }, "Data 2024") : null,
          PD ? h("button", { class: "btn", type: "button", onclick: function () { scrollTo("fm-pemda"); } }, "Prioritas Pemda") : null,
          SKD.tunjangan ? h("a", { class: "btn", href: "#gaji" }, "Gaji & tunjangan") : null,
          D.dokumen ? h("a", { class: "btn", href: D.dokumen, target: "_blank", rel: "noopener" }, "Dokumen PDF") : null)),
      h("section", { class: "panel", "aria-labelledby": "fm-status" }, h("h2", { id: "fm-status" }, "Status per " + D.tanggal), h("ul", { class: "plain-list" }, D.status.map(function (t) { return h("li", null, t); }))),
      h("div", { class: "tiles" }, D.angka.map(function (a) { return h("div", { class: "tile" }, h("span", { class: "v" }, a.v), h("span", { class: "l" }, a.l), h("span", { class: "d" }, a.d)); })),
      SKD.driveBox ? SKD.driveBox(h) : null,
      SKD.pindai ? SKD.pindai.section(ctx) : null,
      pendidikanSec, riwayat, kandidat, pemda, profil, skor, target, pantau, jabatan, validasi, aturan, kalk, langkah, lain, sumber
    ];
  };
})();
