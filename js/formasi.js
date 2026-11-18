/* Halaman Formasi: strategi pemilihan formasi CPNS 2026 + cek profil + kalkulator peluang.
   Data ada di data/formasi.js. Isian pengguna disimpan di localStorage perangkat ini saja. */
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

  function blank() { return { profil: { ipk: "", akr: "B", usia: "", lokasi: "jabo-nasional", nonverbal: true }, kandidat: [], cek: {} }; }
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
        return { id: String(k.id || Math.random()), nama: k.nama.slice(0, 160), kursi: numOr(k.kursi, 1), pelamar: numOr(k.pelamar, 0), sejenis: numOr(k.sejenis, 0) };
      });
    }
    if (d.cek && typeof d.cek === "object") for (var c in d.cek) if (d.cek[c] === true) b.cek[c] = true;
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

  /** Analisis satu kandidat formasi: rasio, kursi SKB (3x kursi), dan posisi yang harus dicapai di SKD. */
  function analisis(k) {
    var kursi = Math.max(1, Math.round(k.kursi)), n = Math.max(0, Math.round(k.pelamar)), skb = kursi * 3;
    var rasio = n / kursi, lev = rasio <= 10 ? "rendah" : rasio <= 30 ? "sedang" : "tinggi";
    var posisi = n <= skb ? "Cukup lulus ambang batas untuk ikut SKB" : "Masuk " + fmt(skb) + " besar dari " + fmt(n) + " (" + fmt((skb / n) * 100, skb / n < 0.1 ? 1 : 0) + "% teratas)";
    return { kursi: kursi, n: n, skb: skb, rasio: rasio, lev: lev, posisi: posisi };
  }
  SKD.formasiAnalisis = analisis; // untuk pengujian

  SKD.formasiView = function (ctx) {
    var h = ctx.h, D = SKD.formasi, S = state(), P = S.profil;
    if (!D) return h("p", null, "Data formasi belum dimuat.");

    function set(path, v) { P[path] = v; save(); ctx.rerender(); }

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
      if (P.nonverbal) out.push(["ok", "Filter aktif: jabatan yang tugas intinya bicara di depan orang (protokol, instruktur, penggerak masyarakat, fasilitator, edukator) disembunyikan."]);
      if (P.lokasi === "jabo") out.push(["warn", "Hanya Jabodetabek berarti hanya formasi yang paling ramai. Pertimbangkan Tier 1 di luar Jabodetabek bila peluang lebih penting."]);
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

    // ---------- jabatan ----------
    var tampil = D.jabatan.filter(function (j) { return !P.nonverbal || j.lisan !== "tinggi"; });
    var sembunyi = D.jabatan.filter(function (j) { return tampil.indexOf(j) < 0; });
    var jabatan = h("section", { class: "stack", "aria-labelledby": "fm-jab" },
      h("h2", { id: "fm-jab" }, "Jabatan yang menerima " + D.jurusan),
      h("p", { class: "lede" }, "Urut dari yang paling cocok: sedikit bicara, persaingan rendah, dekat minat IT. Semua contoh diambil dari pengumuman dan rekap hasil CPNS 2024. Nama jabatan saja tidak cukup: di satu instansi Pranata Humas menerima Ilmu Komunikasi, di instansi lain tidak."),
      h("div", { class: "peta-grid" }, tampil.map(function (j) {
        var sg = SAING[j.saing] || ["", j.saing], ls = LISAN[j.lisan] || ["", ""];
        return h("article", { class: "peta-card" },
          h("h3", null, j.nama),
          h("div", { class: "row" }, h("span", { class: "tag " + sg[0] }, sg[1]), h("span", { class: "tag " + ls[0] }, ls[1]), h("span", { class: "tag accent" }, COCOK[j.cocok] || "")),
          h("p", { class: "small" }, j.tugas),
          h("ul", null, j.bukti.map(function (b) { return h("li", null, b); })),
          h("p", { class: "small muted" }, j.catatan));
      })),
      sembunyi.length ? h("p", { class: "note" }, h("b", null, "Disembunyikan karena banyak bicara di depan orang: "),
        sembunyi.map(function (j) { return j.nama; }).join(", ") + ". Semuanya menerima Ilmu Komunikasi pada 2024; matikan filter di Cek profil untuk melihat rinciannya.") : null,
      h("p", { class: "note info" }, D.tidakBisa));

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
      S.kandidat.push({ id: String(Date.now()), nama: nama.slice(0, 160), kursi: kursi, pelamar: pel, sejenis: numOr(f.elements.sejenis.value, 0) });
      save();
      ctx.rerender();
      ctx.toast("Kandidat ditambahkan.");
    }
    var rows = S.kandidat.map(function (k) { return { k: k, a: analisis(k) }; }).sort(function (x, y) { return x.a.rasio - y.a.rasio; });
    var kalk = h("section", { class: "panel", "aria-labelledby": "fm-kalk" },
      h("h2", { id: "fm-kalk" }, "Kalkulator peluang"),
      h("p", { class: "small muted" }, "Masukkan formasi kandidat dari SSCASN. Selama pendaftaran, jumlah pelamar per formasi biasanya belum ditampilkan, jadi isi perkiraan (pakai rasio instansi dari rilis BKN). Setelah seleksi administrasi, ganti dengan jumlah pesaing yang memenuhi syarat. Peserta dengan nilai SKD tertinggi sampai 3 kali jumlah kursi lanjut ke SKB."),
      h("form", { class: "fm-form", onsubmit: addKandidat },
        h("label", { class: "field grow" }, h("span", { class: "label" }, "Formasi (jabatan, instansi, lokasi)"), h("input", { class: "input wide", name: "nama", placeholder: "Arsiparis Ahli Pertama, PTN X" })),
        h("label", { class: "field" }, h("span", { class: "label" }, "Kursi"), h("input", { class: "input", name: "kursi", inputmode: "numeric", placeholder: "1" })),
        h("label", { class: "field" }, h("span", { class: "label" }, "Pelamar"), h("input", { class: "input", name: "pelamar", inputmode: "numeric", placeholder: "40" })),
        h("label", { class: "field" }, h("span", { class: "label" }, "Lokasi sejenis"), h("input", { class: "input", name: "sejenis", inputmode: "numeric", placeholder: "opsional" })),
        h("button", { class: "btn primary", type: "submit" }, "Tambah")),
      rows.length ? h("ol", { class: "fm-cands", "aria-label": "Kandidat, rasio terendah lebih dulu" }, rows.map(function (r, i) {
        var sg = SAING[r.a.lev];
        return h("li", { class: "fm-cand" },
          h("span", { class: "rk" }, i + 1),
          h("div", { class: "bd" },
            h("div", { class: "row between" }, h("span", { class: "nm" }, r.k.nama),
              h("span", { class: "tag " + sg[0] }, fmt(r.a.rasio, r.a.rasio < 10 ? 1 : 0) + " per kursi")),
            h("span", { class: "mt" }, fmt(r.a.kursi) + " kursi · " + fmt(r.a.n) + " pelamar · " + fmt(r.a.skb) + " kursi SKB"),
            h("span", { class: "small" }, h("b", null, "Syarat ikut SKB: "), r.a.posisi),
            r.k.sejenis > 1 ? h("span", { class: "small muted" }, "Jabatan sama di " + fmt(r.k.sejenis) + " lokasi dalam instansi ini: ada peluang optimalisasi.") : null),
          h("button", { class: "btn sm ghost", type: "button", "aria-label": "Hapus " + r.k.nama, onclick: function () {
            S.kandidat = S.kandidat.filter(function (x) { return x.id !== r.k.id; }); save(); ctx.rerender();
          } }, "Hapus"));
      })) : h("p", { class: "muted small" }, "Belum ada kandidat. Rincian formasi 2026 diperkirakan terbit 20–23 November 2026."),
      rows.length ? h("p", { class: "small muted" }, "Urutan teratas = rasio terendah. Rendah: ≤10 pelamar per kursi, sedang: ≤30, tinggi: di atas 30.") : null);

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
      h("p", { class: "small muted" }, "Angka 2024 berasal dari pengumuman resmi dan rekap hasil BKN. Penilaian persaingan dan perkiraan 2026 adalah analisis, bukan data resmi."),
      h("ul", { class: "plain-list" }, D.sumber.map(function (s) { return h("li", null, h("a", { href: s.u, target: "_blank", rel: "noopener" }, s.t)); })));

    return [
      h("div", { class: "stack" }, h("h1", null, "Strategi formasi CPNS 2026"),
        h("p", { class: "lede" }, "Pemindaian untuk lulusan " + D.jurusan + ": jabatan yang benar-benar menerima jurusan ini, peta persaingan, dan kalkulator peluang. Rincian formasi 2026 belum terbit per " + D.tanggal + "; begitu terbit, pindai di SSCASN lalu masukkan kandidat ke kalkulator."),
        h("div", { class: "row" }, h("a", { class: "btn primary", href: "https://sscasn.bkn.go.id/", target: "_blank", rel: "noopener" }, "Buka SSCASN"),
          h("button", { class: "btn", type: "button", onclick: function () {
            var el = document.getElementById("fm-kalk");
            if (el && el.scrollIntoView) el.scrollIntoView({ behavior: "smooth", block: "start" });
          } }, "Ke kalkulator"))),
      h("section", { class: "panel", "aria-labelledby": "fm-status" }, h("h2", { id: "fm-status" }, "Status per " + D.tanggal), h("ul", { class: "plain-list" }, D.status.map(function (t) { return h("li", null, t); }))),
      h("div", { class: "tiles" }, D.angka.map(function (a) { return h("div", { class: "tile" }, h("span", { class: "v" }, a.v), h("span", { class: "l" }, a.l), h("span", { class: "d" }, a.d)); })),
      profil, target, jabatan, aturan, kalk, langkah, lain, sumber
    ];
  };
})();
