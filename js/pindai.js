/* Pindai formasi SSCASN untuk S-1 Ilmu Komunikasi (menu Formasi).
   - Di APK: "Pindai sekarang" (atau otomatis, paling sering tiap 6 jam) membuka halaman resmi SSCASN di layar terpisah
     (ScanActivity). Fungsi SCANNER di bawah berjalan di halaman itu seperti pengunjung biasa: mengetik "KOMUNIKASI" di filter
     Nama Pendidikan, memilih tiap pilihan yang muncul, menekan CARI, lalu membuka detail tiap kartu dengan jeda. Tidak memanggil
     API langsung, tidak mengubah header, tidak login, tidak menembus captcha. Hasil mentah dikembalikan ke aplikasi dan
     diolah di sini (parse), lalu disimpan di perangkat.
   - Di peramban biasa: tampil hasil pindai bawaan (data/sscasn2026.js) dan tautan ke SSCASN.
   Data tahapan seleksi tiap instansi (CAT, non-CAT, wawancara) diambil dari pengumuman resmi dan ada di data/sscasn2026.js. */
(function () {
  "use strict";
  var SKD = (window.SKD = window.SKD || {});
  var KEY = "skd.pindai.v1", ENAM_JAM = 6 * 3600 * 1000;

  // ---------- berjalan di halaman SSCASN (di-stringify, jadi harus mandiri) ----------
  function SCANNER() {
    if (window.__pindaiSkd) return;
    window.__pindaiSkd = 1;
    var B = window.PindaiBridge || { kemajuan: function () {}, selesai: function (s) { window.__hasilPindai = s; } };
    var KATA = "KOMUNIKASI";
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
    function liCocok() {
      return Array.prototype.slice.call(document.querySelectorAll("li")).filter(function (l) {
        var s = (l.innerText || "").trim(); return s.toUpperCase().indexOf(KATA) >= 0 && s.length < 600 && l.offsetParent !== null;
      });
    }
    // buka daftar pilihan filter: ketik dulu; bila belum terbuka, klik kotaknya lalu ketik ulang
    async function bukaOpsi() {
      for (var t = 0; t < 4; t++) {
        var inp = masukan(); if (!inp) return [];
        isi(inp, KATA); await tidur(900);
        var L = liCocok(); if (L.length) return L;
        klik(inp); await tidur(600);
        L = liCocok(); if (L.length) return L;
      }
      return [];
    }
    async function muatLagi() { var k = kartu(); if (k.length) k[k.length - 1].scrollIntoView({ block: "end" }); window.scrollBy(0, 1600); await tidur(900); }
    async function bacaSemua(opsi, out) {
      var i = 0, macet = 0;
      while (i < 3000) {
        var hs = kartu();
        if (i >= hs.length) {
          if (!/Memuat formasi lainnya/.test(teks()) && macet >= 1) break;
          await muatLagi(); macet++;
          if (macet > 4) break;
          continue;
        }
        macet = 0;
        var h = hs[i], c = wadah(h), judul = (h.innerText || "").trim(), kt = c ? c.innerText : judul;
        // panel detail dianggap sudah berganti bila memuat judul, lokasi, dan jumlah kebutuhan kartu ini
        var kl = kt.split("\n").map(function (x) { return x.trim(); }).filter(Boolean), lok = kl[2] || "", kb = ((kl[kl.length - 1] || "").match(/(\d+)/) || [])[1] || "";
        h.scrollIntoView({ block: "center" }); klik(h);
        var det = "";
        for (var w = 0; w < 25; w++) {
          await tidur(200);
          var t = teks(), a = t.lastIndexOf("Daftar Sekarang"), d = a < 0 ? "" : t.slice(Math.max(0, a - 400));
          if (d && d.indexOf(judul) >= 0 && (!lok || d.indexOf(lok) >= 0) && (!kb || d.indexOf(kb + " orang") >= 0)) { det = d; break; }
        }
        out.push({ kartu: kt, detail: det, opsi: opsi });
        var kb = tombol("KEMBALI");
        if (kb) { klik(kb); await tidur(600); }
        i++;
        B.kemajuan("Membaca formasi " + i + (opsi ? " · " + opsi.slice(0, 60) : ""));
      }
    }
    async function jalan() {
      B.kemajuan("Menunggu daftar formasi SSCASN…");
      for (var i = 0; i < 90 && !total(); i++) await tidur(1000);
      var T = total();
      if (!T) { B.selesai(JSON.stringify({ galat: "Daftar formasi tidak tampil (mungkin halaman sedang sibuk atau berubah).", waktu: new Date().toISOString() })); return; }
      var out = [], opsiList = [], inp = masukan(), lewat = [];
      if (inp) {
        (await bukaOpsi()).forEach(function (li) { var s = (li.innerText || "").trim(); if (opsiList.indexOf(s) < 0) opsiList.push(s); });
        for (var k = 0; k < opsiList.length; k++) {
          B.kemajuan("Filter pendidikan " + (k + 1) + "/" + opsiList.length);
          var rs = tombol("RESET"); if (rs) { klik(rs); await tidur(900); }
          var li = (await bukaOpsi()).filter(function (l) { return (l.innerText || "").trim() === opsiList[k]; })[0];
          if (!li) { lewat.push(opsiList[k]); continue; }
          klik(li); await tidur(500);
          var cari = tombol("CARI"); if (cari) klik(cari);
          await tidur(1800);
          await bacaSemua(opsiList[k], out);
        }
      } else if (T <= 400) {
        await bacaSemua("", out);
      } else {
        B.selesai(JSON.stringify({ galat: "Filter Nama Pendidikan tidak ditemukan; tampilan SSCASN mungkin berubah.", waktu: new Date().toISOString(), total: T }));
        return;
      }
      B.selesai(JSON.stringify({ waktu: new Date().toISOString(), total: T, kata: KATA, filter: !!inp, opsi: opsiList, lewat: lewat, data: out }));
    }
    jalan().catch(function (e) { B.selesai(JSON.stringify({ galat: String((e && e.message) || e), waktu: new Date().toISOString() })); });
  }

  // ---------- olah hasil mentah menjadi catatan formasi ----------
  var LABEL = ["KEBUTUHAN", "JENIS FORMASI", "RENTANG USIA", "ESTIMASI GAJI", "LOKASI PENEMPATAN", "KUALIFIKASI PENDIDIKAN", "DESKRIPSI PEKERJAAN", "PERSYARATAN ADMINISTRASI"];
  function baris(s) { return String(s || "").split("\n").map(function (x) { return x.trim(); }).filter(Boolean); }
  function parse(r) {
    var k = baris(r.kartu), L = baris(r.detail), i = L.indexOf("Daftar Sekarang");
    var head = i >= 0 ? L.slice(Math.max(0, i - 4), i) : [];
    if (i >= 0) L = L.slice(i + 1);
    var U = L.map(function (x) { return x.toUpperCase(); });
    function after(lbl) { var j = U.indexOf(lbl), out = []; if (j < 0) return out; for (j++; j < L.length && LABEL.indexOf(U[j]) < 0; j++) out.push(L[j]); return out; }
    var kb = (k[k.length - 1] || "").match(/(\d+)\s*kebutuhan/);
    var p = after("KUALIFIKASI PENDIDIKAN").join(" | ").split("|").map(function (x) { return x.trim(); }).filter(Boolean);
    return {
      j: k[0] || "", i: k[1] || "", l: after("LOKASI PENEMPATAN").join(" ") || k[2] || "", s: k[3] || "", jp: k[4] || "",
      jf: after("JENIS FORMASI")[0] || k[5] || "", k: kb ? Number(kb[1]) : Number((after("KEBUTUHAN")[0] || "").replace(/\D/g, "")) || 0,
      u: after("RENTANG USIA").join(" "), g: after("ESTIMASI GAJI").join(" "), p: p, d: after("DESKRIPSI PEKERJAAN").join(" ").slice(0, 600),
      ragu: !L.length || (head.length && head[0] !== k[0]) ? 1 : 0
    };
  }
  // ya: S-1 ILMU KOMUNIKASI tercantum; mirip: prodi S-1/D-IV lain bernama komunikasi; jenjang: hanya D-III/SMA dsb.
  function cocok(rec) {
    var P = rec.p.map(function (x) { return x.toUpperCase(); });
    if (P.some(function (x) { return /^S-1 ILMU KOMUNIKASI$/.test(x); })) return "ya";
    if (P.some(function (x) { return /^(S-1|D-IV)\b/.test(x) && x.indexOf("KOMUNIKASI") >= 0; })) return "mirip";
    if (P.some(function (x) { return x.indexOf("KOMUNIKASI") >= 0; })) return "jenjang";
    return null;
  }
  function olah(raw) {
    var seen = {}, out = [];
    (raw.data || []).forEach(function (r) {
      var x = parse(r), key = [x.j, x.i, x.l, x.jf, x.p.join("|")].join("~");
      if (!x.j || seen[key]) return;
      seen[key] = 1; out.push(x);
    });
    return { waktu: raw.waktu, total: raw.total || 0, filter: raw.filter, opsi: raw.opsi || [], formasi: out };
  }

  function bacaSimpan() { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { return null; } }
  function simpan(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }
  function apk() { return !!(window.AndroidBridge && typeof window.AndroidBridge.pindaiSscasn === "function"); }
  function mulai() { if (apk()) window.AndroidBridge.pindaiSscasn("(" + SCANNER.toString() + ")();"); }
  function tgl(iso) {
    var d = new Date(iso); if (isNaN(d)) return String(iso || "");
    var w = new Date(d.getTime() + 7 * 3600 * 1000), B = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    var p = function (n) { return (n < 10 ? "0" : "") + n; };
    return w.getUTCDate() + " " + B[w.getUTCMonth()] + " " + w.getUTCFullYear() + ", " + p(w.getUTCHours()) + "." + p(w.getUTCMinutes()) + " WIB";
  }

  // terima hasil dari ScanActivity
  window.addEventListener("pindai-selesai", function () {
    if (!apk() || typeof window.AndroidBridge.hasilPindai !== "function") return;
    var s = window.AndroidBridge.hasilPindai(), raw;
    try { raw = JSON.parse(s); } catch (e) { raw = null; }
    if (!raw) return;
    if (raw.galat) { var lama = bacaSimpan() || {}; lama.galat = raw.galat; lama.galatWaktu = raw.waktu || new Date().toISOString(); simpan(lama); }
    else { var o = olah(raw), s0 = bacaSimpan() || {}; o.sumber = "perangkat"; if (s0.otomatis === false) o.otomatis = false; simpan(o); }
    if (SKD.pindai && SKD.pindai._rerender) SKD.pindai._rerender();
  });

  // ---------- bagian di halaman Formasi ----------
  function section(ctx) {
    var h = ctx.h, D = SKD.sscasn2026 || null, sim = bacaSimpan(), pakai = null, asal = "";
    SKD.pindai._rerender = ctx.rerender;
    if (sim && sim.formasi && (!D || new Date(sim.waktu) >= new Date(D.waktuIso))) { pakai = sim; asal = "pindai di perangkat ini"; }
    else if (D) { pakai = D; asal = "pindai bawaan aplikasi"; }
    var otomatis = !sim || sim.otomatis !== false;
    if (apk() && otomatis && !sessionStorage.getItem("skd.pindai.dicoba")) {
      var umur = sim && sim.waktu ? Date.now() - new Date(sim.waktu).getTime() : Infinity;
      if (umur > ENAM_JAM) { try { sessionStorage.setItem("skd.pindai.dicoba", "1"); } catch (e) {} setTimeout(mulai, 900); }
    }
    var INST = {}; (D ? D.instansi : []).forEach(function (x) { INST[x.n] = x; });
    var F = pakai ? pakai.formasi : [];
    var ya = F.filter(function (x) { return cocok(x) === "ya"; }), mirip = F.filter(function (x) { return cocok(x) === "mirip"; }), jen = F.filter(function (x) { return cocok(x) === "jenjang"; });
    var kursi = ya.reduce(function (a, x) { return a + x.k; }, 0);
    var instYa = []; ya.forEach(function (x) { if (instYa.indexOf(x.i) < 0) instYa.push(x.i); });
    var tagW = function (I) {
      if (!I) return h("span", { class: "tag" }, "tahapan seleksi belum dibaca");
      return I.wawancara === "ya" ? h("span", { class: "tag warn" }, "ada wawancara") : I.wawancara === "tidak" ? h("span", { class: "tag ok" }, "tanpa wawancara") : h("span", { class: "tag" }, "wawancara belum diketahui");
    };
    var kartuF = function (x, catatan) {
      var I = INST[x.i];
      return h("li", null,
        h("div", { class: "row" }, h("b", null, x.j), h("span", { class: "tag accent" }, x.k + " kursi"), h("span", { class: "tag" }, x.jf || "–"), tagW(I)),
        h("span", { class: "nilai" }, x.i + " · " + x.l),
        h("span", { class: "small" }, [x.g ? "Estimasi gaji " + x.g : "", x.u ? "usia " + x.u : ""].filter(Boolean).join(" · ")),
        h("span", { class: "small" }, h("b", null, "Pendidikan: "), x.p.join(", ")),
        x.d ? h("span", { class: "small muted" }, "Tugas: " + x.d.slice(0, 260) + (x.d.length > 260 ? "…" : "")) : null,
        I ? h("span", { class: "small" }, h("b", null, "Seleksi: "), "SKD " + I.skd + ". SKB " + I.skb + ".") : null,
        catatan ? h("span", { class: "small muted" }, catatan) : null,
        x.ragu ? h("span", { class: "small muted" }, "Detail formasi ini kurang lengkap terbaca; cek ulang di SSCASN.") : null);
    };
    var status = pakai
      ? "Hasil " + asal + ": " + tgl(pakai.waktu) + ". SSCASN menampilkan " + (pakai.total || 0) + " formasi saat itu."
      : "Belum ada hasil pindai.";
    var tombolPindai = apk()
      ? h("button", { class: "btn primary", type: "button", id: "fm-pindai-btn", onclick: function () { mulai(); } }, "Pindai sekarang dari SSCASN")
      : null;
    return h("section", { class: "panel", "aria-labelledby": "fm-pindai" },
      h("h2", { id: "fm-pindai" }, "Pindai SSCASN: formasi untuk S-1 Ilmu Komunikasi"),
      h("p", { class: "small" }, status + (sim && sim.galat ? " Pindai terakhir gagal (" + tgl(sim.galatWaktu) + "): " + sim.galat : "")),
      h("div", { class: "row" }, tombolPindai, h("a", { class: "btn", href: "https://sscasn.bkn.go.id/daftar-formasi/", target: "_blank", rel: "noopener" }, "Buka daftar formasi SSCASN")),
      apk() ? h("label", { class: "check" }, h("input", { type: "checkbox", id: "fm-pindai-oto", checked: otomatis, onchange: function (e) { var s = bacaSimpan() || {}; s.otomatis = e.target.checked; simpan(s); } }),
        h("span", null, "Pindai otomatis saat halaman ini dibuka, paling sering tiap 6 jam. Halaman resmi SSCASN terbuka di layar pindai; tekan Tutup untuk membatalkan.")) :
        h("p", { class: "small muted" }, "Pindai otomatis berjalan di APK: aplikasi membuka halaman resmi SSCASN di HP Anda, memakai filter Nama Pendidikan \"KOMUNIKASI\", lalu membaca detail tiap formasi. Di peramban, yang tampil adalah hasil pindai bawaan."),
      h("div", { class: "tiles" },
        h("div", { class: "tile" }, h("span", { class: "v", id: "fm-pindai-n" }, String(ya.length)), h("span", { class: "l" }, "formasi mencantumkan S-1 Ilmu Komunikasi"), h("span", { class: "d" }, kursi + " kursi")),
        h("div", { class: "tile" }, h("span", { class: "v" }, String(instYa.length)), h("span", { class: "l" }, "instansi"), h("span", { class: "d" }, instYa.join(", ") || "belum ada"))),
      ya.length ? h("ul", { class: "fm-inst", id: "fm-pindai-list" }, ya.sort(function (a, b) { return b.k - a.k; }).map(function (x) { return kartuF(x); })) :
        h("p", { class: "note" }, "Belum ada formasi yang mencantumkan S-1 Ilmu Komunikasi di SSCASN saat dipindai."),
      mirip.length ? [h("h3", null, "Prodi komunikasi dengan nama lain"),
        h("p", { class: "small muted" }, "Nama prodi di ijazah harus sama persis dengan yang tercantum. Cek apakah ijazah Anda tertulis seperti ini."),
        h("ul", { class: "fm-inst" }, mirip.map(function (x) { return kartuF(x); }))] : null,
      jen.length ? [h("h3", null, "Komunikasi jenjang lain (bukan S-1)"),
        h("ul", { class: "fm-inst" }, jen.map(function (x) { return kartuF(x, "Hanya untuk jenjang yang tercantum; lulusan S-1 tidak bisa melamar formasi ini."); }))] : null,
      D ? [h("h3", null, "Instansi yang sudah mengumumkan seleksi"),
        h("ul", { class: "fm-inst", id: "fm-pindai-inst" }, D.instansi.map(function (I) {
          var t = I.ilkom === "ya" ? ["ok", "menerima S-1 Ilmu Komunikasi"] : I.ilkom === "tidak" ? ["bad", "tidak untuk S-1 Ilmu Komunikasi"] : ["", "belum diketahui"];
          return h("li", null,
            h("div", { class: "row" }, h("b", null, I.n), h("span", { class: "tag " + t[0] }, t[1]), tagW(I), h("span", { class: "tag" }, I.tampil ? "formasi tampil di SSCASN" : "formasi belum tampil di SSCASN")),
            h("span", { class: "small" }, I.ringkas),
            h("span", { class: "small" }, h("b", null, "SKD: "), I.skd + ". ", h("b", null, "SKB: "), I.skb + "."),
            I.syarat ? h("span", { class: "small muted" }, "Syarat penting: " + I.syarat + ".") : null,
            I.jadwal ? h("span", { class: "small muted" }, "Jadwal: " + I.jadwal + ".") : null,
            h("span", { class: "small" }, I.sumber.map(function (s, j) { return [j ? " · " : "", h("a", { href: s.u, target: "_blank", rel: "noopener" }, s.t)]; })));
        })),
        h("p", { class: "small muted" }, D.catatan)] : null);
  }

  SKD.pindai = { SCANNER: SCANNER, parse: parse, olah: olah, cocok: cocok, section: section, _rerender: null };
})();
