/* Pembangkit soal acak dari tabel fakta (data/fakta.js) dan pola logika.
   TWK: kasus sila, butir Pancasila, wewenang lembaga negara, pasal UUD (kasus, bunyi, isi), sejarah, hari nasional, kata baku.
   TIU: silogisme, analogi kata, dan analitis (susunan duduk dan antrean). Setiap kesimpulan silogisme dibuktikan dengan memeriksa semua kemungkinan (model) sehingga hanya satu
   pilihan yang pasti benar; pengecoh yang ternyata ikut benar dibuang otomatis.
   Keluaran generate(): { text, opts (opts[0] benar, atau opts[a] bila fix), expl, sangat, fix, a }. */
(function () {
  "use strict";
  var SKD = window.SKD, F = SKD.fakta;

  var NAMA = ["Andi", "Bima", "Citra", "Dewi", "Eko", "Gita", "Hasan", "Intan", "Joko", "Kadek", "Lina", "Maria", "Nanda", "Oki", "Putu",
    "Rudi", "Sari", "Tono", "Wayan", "Yohana", "Zahra", "Agus", "Melati", "Rahmat", "Daniel", "Ayu"];
  var DAERAH = ["Kota Tangerang", "Kota Ambon", "Kabupaten Lembata", "Kota Medan", "Kota Makassar", "Kabupaten Sumbawa Barat", "Kota Pontianak",
    "Kota Kupang", "Kota Padang", "Kabupaten Lebong", "Kota Ternate", "Kabupaten Aceh Tenggara", "Kota Palu", "Kota Bandung", "Kota Manado"];
  var URUT = ["pertama", "kedua", "ketiga", "keempat", "kelima"];

  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function isi(t, R) { var n = R.pick(NAMA), k = R.pick(DAERAH); return t.replace(/\{n\}/g, n).replace(/\{k\}/g, k); }
  /** n pengecoh berbeda dari pool (pool tidak memuat jawaban). */
  function ambil(R, pool, n) {
    var seen = {}, out = [];
    R.shuffle(pool).forEach(function (x) { if (out.length < n && !seen[x]) { seen[x] = 1; out.push(x); } });
    return out;
  }
  function silaOpts() { return F.sila.map(function (s, i) { return "Sila " + URUT[i] + ": " + s; }); }

  // ===================== TWK =====================
  function silaKasus(R) {
    var c = R.pick(F.silaKasus);
    return {
      text: isi(c.t, R) + (c.neg ? " Perbuatan tersebut paling bertentangan dengan Pancasila ..." : " Sikap tersebut paling mencerminkan pengamalan Pancasila ..."),
      opts: silaOpts(), fix: true, a: c.s - 1,
      expl: "Butir pengamalan sila " + URUT[c.s - 1] + " (TAP MPR No. I/MPR/2003): \"" + F.butir[c.s - 1][c.b] + "\"" +
        (c.neg ? " Perbuatan dalam soal justru melanggar butir itu." : " Perbuatan dalam soal adalah contoh penerapannya.")
    };
  }
  function silaButir(R) {
    var s = R.int(0, 4), b = R.int(0, F.butir[s].length - 1);
    return {
      text: "Butir pengamalan Pancasila \"" + F.butir[s][b] + "\" merupakan penjabaran dari ...",
      opts: silaOpts(), fix: true, a: s,
      expl: "Butir itu termasuk " + F.butir[s].length + " butir pengamalan sila " + URUT[s] + ", " + F.sila[s] + " (TAP MPR No. I/MPR/2003; seluruhnya 45 butir)."
    };
  }
  var LEMBAGA_ID = Object.keys(F.lembaga);
  function lembaga(R) {
    var w = R.pick(F.wewenang), ans = F.lembaga[w.l], excl = (w.x || []).concat([w.l]);
    var pool = LEMBAGA_ID.filter(function (id) { return excl.indexOf(id) < 0; }).map(function (id) { return F.lembaga[id]; });
    return {
      text: R.chance(0.65) ? w.k : "Menurut UUD NRI 1945, lembaga negara yang " + w.w + " adalah ...",
      opts: [ans].concat(ambil(R, pool, 4)),
      expl: w.p + " UUD NRI 1945: " + ans + " " + w.w + "."
    };
  }
  function pasalPool(e) {
    var excl = e.x || [];
    return F.pasal.filter(function (o) { return o.g !== e.g && excl.indexOf(o.p) < 0; });
  }
  function pasalKasus(R) {
    var e = R.pick(F.pasal.filter(function (o) { return o.k; }));
    return {
      text: e.k + " Hal tersebut paling sesuai dengan ketentuan UUD NRI 1945 ...",
      opts: [e.p].concat(ambil(R, pasalPool(e).map(function (o) { return o.p; }), 4)),
      expl: e.p + " berbunyi: \"" + e.isi + "\""
    };
  }
  function pasalBunyi(R) {
    var e = R.pick(F.pasal);
    return {
      text: "Ketentuan \"" + e.isi + "\" terdapat dalam UUD NRI 1945 ...",
      opts: [e.p].concat(ambil(R, pasalPool(e).map(function (o) { return o.p; }), 4)),
      expl: "Bunyi itu adalah " + e.p + " UUD NRI 1945, yang mengatur " + e.t + "."
    };
  }
  function pasalIsi(R) {
    var e = R.pick(F.pasal);
    return {
      text: e.p + " UUD NRI 1945 mengatur tentang ...",
      opts: [cap(e.t)].concat(ambil(R, pasalPool(e).map(function (o) { return cap(o.t); }), 4)),
      expl: e.p + " berbunyi: \"" + e.isi + "\""
    };
  }
  function pasalPenerapan(R) {
    var e = R.pick(F.pasal.filter(function (o) { return o.k; }));
    var pool = pasalPool(e).filter(function (o) { return o.k; }), pick = ambil(R, pool.map(function (o) { return o.k; }), 4);
    var asal = pick.map(function (k) { return pool.filter(function (o) { return o.k === k; })[0].p; });
    return {
      text: e.p + " UUD NRI 1945 berbunyi, \"" + e.isi + "\" Contoh penerapan pasal tersebut adalah ...",
      opts: [e.k].concat(pick),
      expl: "Contoh itu sesuai isi " + e.p + ". Pilihan lain menerapkan pasal yang berbeda: " + asal.join(", ") + "."
    };
  }
  function sejarahDari(R, m) {
    var e = R.pick(F.sejarah.filter(function (o) { return o.m === m; })), excl = e.x || [];
    var pool = F.sejarah.filter(function (o) { return o.j === e.j && o.a !== e.a && excl.indexOf(o.a) < 0; })
      .map(function (o) { return o.a; }).concat((F.sejarahTambahan[e.j] || []).filter(function (a) { return excl.indexOf(a) < 0; }));
    var fakta = e.q.replace(/\s*\.\.\.\s*$/, " " + e.a + ".");
    if (e.j === "tgl") {
      // pengecoh tanggal diambil dari tahun yang paling dekat agar tidak mudah ditebak
      var th = function (t) { var m = String(t).match(/(\d{4})/); return m ? +m[1] : 0; }, y = th(e.a), seen = {};
      pool = pool.filter(function (t) { if (seen[t]) return false; seen[t] = 1; return true; })
        .sort(function (a, b) { return Math.abs(th(a) - y) - Math.abs(th(b) - y); }).slice(0, 7);
    }
    return { text: e.q, opts: [e.a].concat(ambil(R, pool, 4)), expl: "Fakta: " + fakta };
  }
  function sejarahPilar(R) { return sejarahDari(R, "pilar"); }
  function sejarahNas(R) { return sejarahDari(R, "nas"); }
  function hari(R) {
    var e = R.pick(F.hari), v = R.int(0, 2), others = F.hari.filter(function (o) { return o !== e; }), text, ans, pool;
    if (v === 0) { text = "Tanggal " + e.tgl + " diperingati sebagai ..."; ans = e.nama; pool = others.map(function (o) { return o.nama; }); }
    else if (v === 1) { text = e.nama + " diperingati setiap tanggal ..."; ans = e.tgl; pool = others.map(function (o) { return o.tgl; }); }
    else { text = "Peringatan " + e.nama + " setiap " + e.tgl + " berkaitan dengan ..."; ans = cap(e.asal); pool = others.map(function (o) { return cap(o.asal); }); }
    return { text: text, opts: [ans].concat(ambil(R, pool, 4)), expl: e.nama + " diperingati setiap " + e.tgl + " untuk mengenang " + e.asal + "." };
  }
  function baku(R) {
    var p = R.shuffle(F.baku).slice(0, 5);
    if (R.chance(0.5)) {
      return {
        text: "Penulisan kata yang baku menurut KBBI terdapat pada pilihan ...",
        opts: [p[0][0], p[1][1], p[2][1], p[3][1], p[4][1]],
        expl: "Bentuk baku: " + p[0][0] + ". Pilihan lain tidak baku; bentuk bakunya: " +
          p.slice(1).map(function (x) { return x[0] + " (bukan " + x[1] + ")"; }).join(", ") + "."
      };
    }
    return {
      text: "Kata yang tidak baku menurut KBBI adalah ...",
      opts: [p[0][1], p[1][0], p[2][0], p[3][0], p[4][0]],
      expl: p[0][1] + " tidak baku; bentuk bakunya " + p[0][0] + ". Keempat kata lainnya sudah baku."
    };
  }

  // ===================== TIU: silogisme =====================
  var KAT_TEMA = [
    { A: "pegawai Dinas Kominfo", E: "pegawai Dinas Kesehatan", B: "aparatur sipil negara", C: "warga negara Indonesia", D: "lulusan ilmu komunikasi", N: "warga negara asing" },
    { A: "burung merpati", E: "burung kakatua", B: "unggas", C: "hewan bertulang belakang", D: "hewan peliharaan warga", N: "mamalia" },
    { A: "dokter spesialis", E: "dokter gigi", B: "dokter", C: "lulusan pendidikan kedokteran", D: "pegawai rumah sakit daerah", N: "tenaga nonmedis" },
    { A: "novel sejarah", E: "kumpulan puisi", B: "karya sastra", C: "karya tulis", D: "koleksi perpustakaan daerah", N: "dokumen anggaran" },
    { A: "mobil listrik", E: "sepeda motor", B: "kendaraan bermotor", C: "alat transportasi", D: "kendaraan dinas", N: "sepeda kayuh" },
    { A: "pohon jati", E: "pohon mahoni", B: "tanaman keras", C: "tumbuhan", D: "tanaman di halaman kantor", N: "tanaman semusim" },
    { A: "pelari maraton", E: "pemain sepak bola", B: "atlet", C: "orang yang rutin berlatih fisik", D: "pegawai kecamatan", N: "orang yang tidak pernah berolahraga" },
    { A: "peraturan daerah", E: "peraturan menteri", B: "peraturan perundang-undangan", C: "produk hukum", D: "dokumen di laman JDIH", N: "surat pribadi" },
    { A: "museum", E: "planetarium", B: "tempat wisata edukasi", C: "tempat yang terbuka untuk umum", D: "bangunan cagar budaya", N: "rumah pribadi" },
    { A: "kopi arabika", E: "kopi robusta", B: "kopi", C: "komoditas perkebunan", D: "produk ekspor daerah", N: "hasil tambang" },
    { A: "guru penggerak", E: "guru honorer", B: "guru", C: "pendidik", D: "peserta pelatihan daring", N: "siswa" },
    { A: "aplikasi layanan publik", E: "aplikasi perpajakan daring", B: "perangkat lunak", C: "produk teknologi informasi", D: "karya mahasiswa magang", N: "perangkat keras" }
  ];
  var PROP_TEMA = [
    { P: "hujan turun deras", nP: "hujan tidak turun deras", Q: "jalan di depan kantor tergenang", nQ: "jalan di depan kantor tidak tergenang", R: "apel pagi dipindahkan ke aula", nR: "apel pagi tidak dipindahkan ke aula" },
    { P: "Dina lulus SKD", nP: "Dina tidak lulus SKD", Q: "Dina mengikuti SKB", nQ: "Dina tidak mengikuti SKB", R: "Dina menyiapkan portofolio", nR: "Dina tidak menyiapkan portofolio" },
    { P: "listrik padam", nP: "listrik tidak padam", Q: "server kantor beralih ke genset", nQ: "server kantor tidak beralih ke genset", R: "layanan daring berjalan normal", nR: "layanan daring tidak berjalan normal" },
    { P: "harga cabai naik", nP: "harga cabai tidak naik", Q: "pedagang menaikkan harga sambal", nQ: "pedagang tidak menaikkan harga sambal", R: "pembeli mengurangi pembelian", nR: "pembeli tidak mengurangi pembelian" },
    { P: "Rudi berolahraga rutin", nP: "Rudi tidak berolahraga rutin", Q: "Rudi tidur nyenyak", nQ: "Rudi tidak tidur nyenyak", R: "Rudi bangun dengan segar", nR: "Rudi tidak bangun dengan segar" },
    { P: "laporan selesai hari ini", nP: "laporan tidak selesai hari ini", Q: "atasan memeriksa laporan besok", nQ: "atasan tidak memeriksa laporan besok", R: "anggaran dicairkan pekan ini", nR: "anggaran tidak dicairkan pekan ini" },
    { P: "aplikasi diperbarui", nP: "aplikasi tidak diperbarui", Q: "data pengguna terlindungi", nQ: "data pengguna tidak terlindungi", R: "kepercayaan warga meningkat", nR: "kepercayaan warga tidak meningkat" },
    { P: "Sari rajin berlatih soal", nP: "Sari tidak rajin berlatih soal", Q: "nilai tryout Sari naik", nQ: "nilai tryout Sari tidak naik", R: "Sari percaya diri menghadapi ujian", nR: "Sari tidak percaya diri menghadapi ujian" }
  ];
  var TIDAK_PASTI = "Tidak dapat ditarik kesimpulan yang pasti";

  // ---- logika kategoris: A (semua), I (sebagian), E (tidak ada), O (sebagian bukan); semua istilah dianggap tidak kosong ----
  function S(t, x, y) { return { t: t, x: x, y: y }; }
  function katTeks(s, T) {
    var x = T[s.x], y = T[s.y];
    return s.t === "A" ? "Semua " + x + " adalah " + y : s.t === "I" ? "Sebagian " + x + " adalah " + y :
      s.t === "E" ? "Tidak ada " + x + " yang merupakan " + y : "Sebagian " + x + " bukan " + y;
  }
  function katKey(s) { return s.t + s.x + s.y; }
  /** Kembalikan fungsi entail(s): true bila s benar di semua model yang memenuhi premis. */
  function katModel(premis, istilah) {
    var nT = istilah.length, nR = 1 << nT, bit = {}, i, r;
    istilah.forEach(function (k, j) { bit[k] = 1 << j; });
    function mask(fn) { var m = 0; for (r = 1; r < nR; r++) if (fn(r)) m |= 1 << r; return m; }
    function cond(s) {
      var X = bit[s.x], Y = bit[s.y];
      if (s.t === "A") { var mA = mask(function (q) { return (q & X) && !(q & Y); }); return function (M) { return (M & mA) === 0; }; }
      if (s.t === "E") { var mE = mask(function (q) { return (q & X) && (q & Y); }); return function (M) { return (M & mE) === 0; }; }
      if (s.t === "I") { var mI = mask(function (q) { return (q & X) && (q & Y); }); return function (M) { return (M & mI) !== 0; }; }
      var mO = mask(function (q) { return (q & X) && !(q & Y); });
      return function (M) { return (M & mO) !== 0; };
    }
    var ada = istilah.map(function (k) { var m = mask(function (q) { return q & bit[k]; }); return function (M) { return (M & m) !== 0; }; });
    var pc = premis.map(cond), models = [];
    for (var M = 0; M < (1 << nR); M++) {
      if (M & 1) continue; // daerah kosong (di luar semua istilah) tidak berpengaruh
      var ok = true;
      for (i = 0; ok && i < ada.length; i++) ok = ada[i](M);
      for (i = 0; ok && i < pc.length; i++) ok = pc[i](M);
      if (ok) models.push(M);
    }
    return {
      konsisten: models.length > 0,
      entail: function (s) { var c = cond(s); for (var j = 0; j < models.length; j++) if (!c(models[j])) return false; return true; }
    };
  }
  var KAT_BENTUK = [
    { id: "barbara", p: [S("A", "A", "B"), S("A", "B", "C")], c: S("A", "A", "C"),
      x: "Semua {A} termasuk {B}, dan semua {B} termasuk {C}. Jadi semua {A} pasti termasuk {C}. Kebalikannya (semua {C} adalah {A}) tidak pasti." },
    { id: "darii", p: [S("A", "A", "B"), S("I", "D", "A")], c: S("I", "D", "B"),
      x: "Sebagian {D} adalah {A}, dan setiap {A} pasti {B}. Jadi sebagian {D} itu pasti juga {B}. Tidak bisa disimpulkan semua {D} adalah {B}." },
    { id: "celarent", p: [S("E", "B", "N"), S("A", "A", "B")], c: S("E", "A", "N"),
      x: "Semua {A} termasuk {B}, sedangkan tidak ada {B} yang merupakan {N}. Jadi tidak ada {A} yang merupakan {N}." },
    { id: "ferio", p: [S("E", "B", "N"), S("I", "D", "B")], c: S("O", "D", "N"),
      x: "Sebagian {D} adalah {B}, dan tidak ada {B} yang merupakan {N}. Jadi sebagian {D} (yang termasuk {B}) pasti bukan {N}. Sisanya tidak diketahui." },
    { id: "camestres", p: [S("A", "A", "B"), S("E", "N", "B")], c: S("E", "N", "A"),
      x: "Semua {A} termasuk {B}, sedangkan tidak ada {N} yang termasuk {B}. Jadi tidak ada {N} yang merupakan {A}." },
    { id: "tiga", p: [S("A", "A", "B"), S("A", "B", "C"), S("I", "D", "A")], c: S("I", "D", "C"),
      x: "Rantai tiga premis: sebagian {D} adalah {A}; semua {A} adalah {B}; semua {B} adalah {C}. Jadi sebagian {D} pasti {C}." },
    { id: "tiga-e", p: [S("I", "D", "A"), S("A", "A", "B"), S("E", "B", "N")], c: S("O", "D", "N"),
      x: "Sebagian {D} adalah {A}; semua {A} adalah {B}; tidak ada {B} yang merupakan {N}. Jadi sebagian {D} (yang termasuk {A}) pasti bukan {N}." },
    { id: "tiga-celarent", p: [S("A", "A", "B"), S("A", "B", "C"), S("E", "C", "N")], c: S("E", "A", "N"),
      x: "Semua {A} adalah {B}, semua {B} adalah {C}, dan tidak ada {C} yang merupakan {N}. Jadi tidak ada {A} yang merupakan {N}." },
    { id: "tengah", p: [S("A", "A", "B"), S("A", "E", "B")], c: null, tanya: ["A", "E"],
      x: "{A} dan {E} sama-sama termasuk {B}, tetapi premis tidak menjelaskan hubungan {A} dengan {E}: bisa beririsan, bisa terpisah, bisa juga sama. Jadi tidak ada kesimpulan pasti tentang keduanya." }
  ];
  function ganti(t, T) { return t.replace(/\{([A-Z])\}/g, function (_, k) { return T[k]; }); }
  function silKategoris(R) {
    var T = R.pick(KAT_TEMA), B = R.pick(KAT_BENTUK);
    var istilah = [];
    B.p.forEach(function (s) { [s.x, s.y].forEach(function (k) { if (istilah.indexOf(k) < 0) istilah.push(k); }); });
    var md = katModel(B.p, istilah);
    if (!md.konsisten || (B.c && !md.entail(B.c))) throw new Error("silogisme tidak sahih: " + B.id);
    var cand = [];
    var pasangan = B.c ? [[B.c.x, B.c.y], [B.c.y, B.c.x]] : [[B.tanya[0], B.tanya[1]], [B.tanya[1], B.tanya[0]]];
    var semua = [];
    istilah.forEach(function (x) { istilah.forEach(function (y) { if (x !== y) semua.push([x, y]); }); });
    function tambah(list, pr) { ["A", "I", "E", "O"].forEach(function (t) { list.push(S(t, pr[0], pr[1])); }); }
    var dekat = [], jauh = [];
    pasangan.forEach(function (pr) { tambah(dekat, pr); });
    if (B.c) semua.forEach(function (pr) { if (!(pr[0] === B.c.x && pr[1] === B.c.y) && !(pr[0] === B.c.y && pr[1] === B.c.x)) tambah(jauh, pr); });
    var benar = B.c ? katKey(B.c) : null;
    function pengecoh(list) { return list.filter(function (s) { return katKey(s) !== benar && !md.entail(s); }); }
    dekat = R.shuffle(pengecoh(dekat));
    jauh = R.shuffle(pengecoh(jauh));
    cand = dekat.slice(0, 3).concat(jauh).concat(dekat.slice(3)).slice(0, 4);
    if (cand.length < 4) return null;
    if (B.c && R.chance(0.25)) cand = cand.slice(0, 3); // pengecoh "tidak dapat disimpulkan" saat ada kesimpulan pasti
    var opts = [B.c ? cap(katTeks(B.c, T)) : TIDAK_PASTI].concat(cand.map(function (s) { return cap(katTeks(s, T)); }));
    if (opts.length === 4) opts.push(TIDAK_PASTI);
    var text = B.p.map(function (s) { return cap(katTeks(s, T)) + "."; }).join("\n") + "\n" +
      (B.c ? "Kesimpulan yang pasti benar adalah ..." : "Kesimpulan yang tepat tentang hubungan " + T[B.tanya[0]] + " dan " + T[B.tanya[1]] + " adalah ...");
    return {
      text: text, opts: opts, expl: ganti(B.x, T),
      _cek: { jenis: "kat", premis: B.p, benar: B.c, opsi: cand, tidakPasti: !B.c, istilah: istilah }
    };
  }

  // ---- logika proposisi: L(v, neg), IMP(a, b), OR(a, b), AND(a, b) ----
  function L(v, neg) { return { t: "L", v: v, n: !!neg }; }
  function IMP(a, b) { return { t: "IMP", a: a, b: b }; }
  function OR(a, b) { return { t: "OR", a: a, b: b }; }
  function AND(a, b) { return { t: "AND", a: a, b: b }; }
  function propTeks(s, T) {
    if (s.t === "L") return T[(s.n ? "n" : "") + s.v];
    if (s.t === "IMP") return "jika " + propTeks(s.a, T) + ", maka " + propTeks(s.b, T);
    return propTeks(s.a, T) + (s.t === "OR" ? " atau " : " dan ") + propTeks(s.b, T);
  }
  function propKey(s) { return s.t === "L" ? (s.n ? "~" : "") + s.v : s.t + "(" + propKey(s.a) + "," + propKey(s.b) + ")"; }
  function nilai(s, v) {
    if (s.t === "L") return s.n ? !v[s.v] : !!v[s.v];
    var a = nilai(s.a, v), b = nilai(s.b, v);
    return s.t === "IMP" ? !a || b : s.t === "OR" ? a || b : a && b;
  }
  function propModel(premis) {
    var models = [];
    for (var m = 0; m < 8; m++) {
      var v = { P: !!(m & 1), Q: !!(m & 2), R: !!(m & 4) };
      if (premis.every(function (s) { return nilai(s, v); })) models.push(v);
    }
    return {
      konsisten: models.length > 0,
      entail: function (s) { return models.every(function (v) { return nilai(s, v); }); }
    };
  }
  var PROP_BENTUK = [
    { id: "ponens", p: [IMP(L("P"), L("Q")), L("P")], c: L("Q"), x: "Modus ponens: jika {P}, maka {Q}. Ternyata {P}, maka pasti {Q}." },
    { id: "tollens", p: [IMP(L("P"), L("Q")), L("Q", 1)], c: L("P", 1), x: "Modus tollens: jika {P}, maka {Q}. Ternyata {nQ}, maka pasti {nP}." },
    { id: "hipotetis", p: [IMP(L("P"), L("Q")), IMP(L("Q"), L("R"))], c: IMP(L("P"), L("R")),
      x: "Silogisme hipotetis: jika {P} maka {Q}, dan jika {Q} maka {R}. Jadi jika {P}, maka {R} (setara dengan: jika {nR}, maka {nP})." },
    { id: "hipotetis-k", p: [IMP(L("P"), L("Q")), IMP(L("Q"), L("R"))], c: IMP(L("R", 1), L("P", 1)),
      x: "Dari jika {P} maka {Q} dan jika {Q} maka {R} diperoleh jika {P} maka {R}. Bentuk yang setara (kontraposisi): jika {nR}, maka {nP}." },
    { id: "disjungtif", p: [OR(L("P"), L("Q")), L("P", 1)], c: L("Q"), x: "Silogisme disjungtif: {P} atau {Q}. Ternyata {nP}, maka pasti {Q}." },
    { id: "rantai-t", p: [IMP(L("P"), L("Q")), IMP(L("Q"), L("R")), L("R", 1)], c: L("P", 1),
      x: "Telusuri mundur: {nR}, maka {nQ} (modus tollens), lalu {nP}." },
    { id: "rantai-p", p: [IMP(L("P"), L("Q")), IMP(L("Q"), L("R")), L("P")], c: L("R"),
      x: "Telusuri maju: {P}, maka {Q}, lalu {R}." },
    { id: "dilema", p: [OR(L("P"), L("Q")), IMP(L("P"), L("R")), IMP(L("Q"), L("R"))], c: L("R"),
      x: "Dilema: {P} atau {Q}. Jika {P}, maka {R}; jika {Q}, maka {R} juga. Kemungkinan mana pun yang terjadi, hasilnya {R}." },
    { id: "disjungtif-t", p: [OR(L("P"), L("Q")), IMP(L("P"), L("R")), L("R", 1)], c: L("Q"),
      x: "Diketahui {nR}, maka {nP} (modus tollens). Dari premis {P} atau {Q}, sedangkan {nP}, maka pasti {Q}." },
    { id: "tollens-dan", p: [IMP(L("P"), AND(L("Q"), L("R"))), L("Q", 1)], c: L("P", 1),
      x: "Jika {P}, maka {Q} dan {R} sekaligus. Ternyata {nQ}, jadi \"{Q} dan {R}\" tidak terpenuhi, sehingga pasti {nP}." },
    { id: "akibat", p: [IMP(L("P"), L("Q")), L("Q")], c: null,
      x: "Jika {P} maka {Q}. Ternyata {Q}, tetapi {Q} bisa terjadi karena sebab lain, jadi belum pasti {P}. Menyimpulkan {P} dari {Q} adalah kesalahan menalar." }
  ];
  function propPengecoh(vars) {
    var lits = [];
    vars.forEach(function (v) { lits.push(L(v), L(v, 1)); });
    var out = lits.slice();
    lits.forEach(function (a) { lits.forEach(function (b) { if (a.v !== b.v) { out.push(IMP(a, b)); if (propKey(a) < propKey(b)) { out.push(AND(a, b)); out.push(OR(a, b)); } } }); });
    return out;
  }
  function silProposisi(R) {
    var T = R.pick(PROP_TEMA), B = R.pick(PROP_BENTUK), vars = [];
    function kumpul(s) { if (s.t === "L") { if (vars.indexOf(s.v) < 0) vars.push(s.v); } else { kumpul(s.a); kumpul(s.b); } }
    B.p.forEach(kumpul);
    var md = propModel(B.p);
    if (!md.konsisten || (B.c && !md.entail(B.c))) throw new Error("silogisme tidak sahih: " + B.id);
    var benar = B.c ? propKey(B.c) : null;
    var all = propPengecoh(vars).filter(function (s) { return propKey(s) !== benar && !md.entail(s); });
    var dekat = R.shuffle(all.filter(function (s) { return s.t === "L" || s.t === "IMP"; }));
    var lain = R.shuffle(all.filter(function (s) { return s.t !== "L" && s.t !== "IMP"; }));
    var cand = dekat.slice(0, 3).concat(lain).concat(dekat.slice(3)).slice(0, 4);
    if (cand.length < 4) return null;
    if (B.c && R.chance(0.2)) cand = cand.slice(0, 3);
    var opts = [B.c ? cap(propTeks(B.c, T)) : TIDAK_PASTI].concat(cand.map(function (s) { return cap(propTeks(s, T)); }));
    if (opts.length === 4) opts.push(TIDAK_PASTI);
    var text = B.p.map(function (s) { return cap(propTeks(s, T)) + "."; }).join("\n") + "\nKesimpulan yang tepat adalah ...";
    return {
      text: text, opts: opts, expl: B.x.replace(/\{(n?[PQR])\}/g, function (_, k) { return T[k]; }),
      _cek: { jenis: "prop", premis: B.p, benar: B.c, opsi: cand, tidakPasti: !B.c }
    };
  }
  function silogisme(R) { return R.chance(0.55) ? silKategoris(R) : silProposisi(R); }

  // ===================== TIU: analogi kata =====================
  function rel(f, a, b) { return cap(f.h.replace("{A}", a).replace("{B}", b)); }
  function analogi(R) {
    var fam = R.pick(F.analogi), ps = R.shuffle(fam.p), st = ps[0], ans = ps[1], rev = null;
    var lain = R.shuffle(F.analogi.filter(function (f) { return f !== fam && (fam.bentrok || []).indexOf(f.id) < 0; }));
    var dis = lain.slice(0, 4).map(function (f) { return R.pick(f.p); });
    if (!fam.sim && ps.length > 2 && R.chance(0.35)) { rev = [ps[2][1], ps[2][0]]; dis[3] = rev; }
    var teks = function (x) { return x[0] + " : " + x[1]; };
    return {
      text: st[0].toUpperCase() + " : " + st[1].toUpperCase() + " = ... : ...",
      opts: [teks(ans)].concat(dis.map(teks)),
      expl: "Hubungannya: " + rel(fam, st[0], st[1]) + ". Pasangan dengan hubungan yang sama: " + rel(fam, ans[0], ans[1]) + "." +
        (rev ? " Pilihan " + teks(rev) + " memakai hubungan yang sama tetapi urutannya terbalik, jadi salah." : ""),
      _cek: { jenis: "ana", fam: fam.id, st: st, ans: ans, dis: dis, rev: rev }
    };
  }

  // ===================== TIU: analitis (susunan duduk dan antrean) =====================
  /* Petunjuk dibuat dari susunan rahasia, lalu ditambah satu per satu sampai jawabannya tunggal di antara SEMUA susunan
     yang mungkin (5! = 120 untuk baris dan antrean, 6! = 720 untuk meja bundar). Petunjuk yang tidak perlu dibuang. */
  var ORANG = ["Ani", "Budi", "Citra", "Dedi", "Eka", "Fani", "Gilang", "Hana", "Indra", "Joko"];
  var PERM = {};
  function semuaSusunan(n) {
    if (PERM[n]) return PERM[n];
    var out = [], a = [];
    (function rek(used) {
      if (a.length === n) { out.push(a.slice()); return; }
      for (var i = 0; i < n; i++) if (!(used & (1 << i))) { a.push(i); rek(used | (1 << i)); a.pop(); }
    })(0);
    return (PERM[n] = out);
  }
  function posOf(at) { var p = []; for (var i = 0; i < at.length; i++) p[at[i]] = i; return p; }
  function benarDi(c, p, n) {
    var d;
    switch (c.t) {
      case "pos": return p[c.a] === c.k;
      case "end": return (p[c.a] === 0 || p[c.a] === n - 1) === c.v;
      case "adj": return (Math.abs(p[c.a] - p[c.b]) === 1) === c.v;
      case "next": return p[c.a] === p[c.b] + 1;
      case "before": return p[c.a] < p[c.b];
      case "gap": return Math.abs(p[c.a] - p[c.b]) === c.d + 1;
      case "betw": return Math.abs(p[c.a] - p[c.b]) === 1 && Math.abs(p[c.a] - p[c.c]) === 1;
      case "opp": return (p[c.a] - p[c.b] + 6) % 6 === 3;
      case "adjC": d = (p[c.a] - p[c.b] + 6) % 6; return (d === 1 || d === 5) === c.v;
      case "betwC":
        var d1 = (p[c.a] - p[c.b] + 6) % 6, d2 = (p[c.a] - p[c.c] + 6) % 6;
        return (d1 === 1 || d1 === 5) && (d2 === 1 || d2 === 5);
    }
    return false;
  }
  function semuaPetunjuk(jenis, n) {
    var out = [], a, b, c, k;
    for (a = 0; a < n; a++) for (b = 0; b < n; b++) {
      if (a === b) continue;
      if (jenis === "bundar") {
        if (a < b) { out.push({ t: "opp", a: a, b: b }, { t: "adjC", a: a, b: b, v: true }, { t: "adjC", a: a, b: b, v: false }); }
        for (c = b + 1; c < n; c++) if (c !== a) out.push({ t: "betwC", a: a, b: b, c: c });
      } else {
        out.push({ t: "next", a: a, b: b }, { t: "before", a: a, b: b });
        if (a < b) out.push({ t: "adj", a: a, b: b, v: true }, { t: "adj", a: a, b: b, v: false }, { t: "gap", a: a, b: b, d: 1 }, { t: "gap", a: a, b: b, d: 2 });
        for (c = b + 1; c < n; c++) if (c !== a) out.push({ t: "betw", a: a, b: b, c: c });
      }
    }
    if (jenis !== "bundar") for (a = 0; a < n; a++) {
      out.push({ t: "end", a: a, v: true }, { t: "end", a: a, v: false });
      for (k = 0; k < n; k++) out.push({ t: "pos", a: a, k: k });
    }
    return out;
  }
  function teksPetunjuk(c, jenis, nm, opsi) {
    var A = nm[c.a], B = nm[c.b], C = nm[c.c];
    if (jenis === "bundar") {
      if (c.t === "opp") return A + " duduk berhadapan dengan " + B + ".";
      if (c.t === "adjC") return A + (c.v ? " duduk bersebelahan dengan " : " tidak duduk bersebelahan dengan ") + B + ".";
      return A + " duduk tepat di antara " + B + " dan " + C + ".";
    }
    var baris = jenis === "baris";
    switch (c.t) {
      case "pos": return baris ? A + " duduk di kursi nomor " + (c.k + 1) + "." : A + " berada di urutan ke-" + (c.k + 1) + " dari depan.";
      case "end": return baris ? A + (c.v ? " duduk di salah satu kursi paling ujung." : " tidak duduk di kursi paling ujung.")
        : A + (c.v ? " berada di urutan paling depan atau paling belakang." : " tidak berada di urutan paling depan maupun paling belakang.");
      case "adj": return baris ? A + (c.v ? " duduk bersebelahan dengan " : " tidak duduk bersebelahan dengan ") + B + "."
        : A + (c.v ? " berdiri tepat di depan atau tepat di belakang " : " tidak berdiri tepat di depan maupun tepat di belakang ") + B + ".";
      case "next": return baris ? A + " duduk tepat di sebelah kanan " + B + "." : A + " berdiri tepat di belakang " + B + ".";
      case "before": return opsi ? (baris ? A + " duduk di sebelah kiri " + B + "." : A + " berada di depan " + B + ".")
        : baris ? A + " duduk di sebelah kiri " + B + ", tetapi belum tentu bersebelahan." : A + " berada di depan " + B + ", tetapi belum tentu tepat di depannya.";
      case "gap": return "Ada tepat " + (c.d === 1 ? "satu" : "dua") + " orang di antara " + A + " dan " + B + ".";
      case "betw": return A + (baris ? " duduk" : " berdiri") + " tepat di antara " + B + " dan " + C + ".";
    }
    return "";
  }
  function urutanTeks(at, jenis, nm) {
    var x = at.map(function (i) { return nm[i]; }).join(", ");
    return jenis === "baris" ? "kursi 1 sampai " + at.length + ": " + x : jenis === "antre" ? "dari depan: " + x : "searah jarum jam: " + x;
  }
  function analitis(R) {
    for (var coba = 0; coba < 60; coba++) {
      var jenis = R.pick(["baris", "baris", "antre", "bundar"]), n = jenis === "bundar" ? 6 : 5;
      var nm = R.shuffle(ORANG).slice(0, n).sort(), P = semuaSusunan(n), at = R.pick(P), p = posOf(at), q;
      if (jenis === "bundar") { var x = R.int(0, n - 1); q = { t: "opp", x: x, ans: at[(p[x] + 3) % 6] }; }
      else if (R.chance(0.7)) { var k = R.int(0, n - 1); q = { t: "posk", k: k, ans: at[k] }; }
      else q = { t: "benar" };
      var jawab = function (s) {
        if (q.t === "posk") return s[q.k];
        var ps = posOf(s);
        return s[(ps[q.x] + 3) % 6];
      };
      var tunggal = function (C) {
        if (q.t === "benar") return C.length === 1;
        for (var i = 1; i < C.length; i++) if (jawab(C[i]) !== jawab(C[0])) return false;
        return C.length > 0;
      };
      var cand = R.shuffle(semuaPetunjuk(jenis, n).filter(function (c) {
        if (!benarDi(c, p, n)) return false;
        if (q.t === "posk" && c.t === "pos" && (c.k === q.k || c.a === q.ans)) return false;
        if (q.t === "opp" && c.t === "opp") return false;
        return true;
      }));
      var C = P, pilih = [], adaPos = false;
      for (var i = 0; i < cand.length && !tunggal(C); i++) {
        var c = cand[i];
        if (c.t === "pos" && adaPos) continue;
        var C2 = C.filter(function (s) { return benarDi(c, posOf(s), n); });
        if (C2.length < C.length) { pilih.push(c); C = C2; if (c.t === "pos") adaPos = true; }
      }
      if (!tunggal(C)) continue;
      R.shuffle(pilih.slice()).forEach(function (c) {
        var sisa = pilih.filter(function (y) { return y !== c; });
        var C3 = P.filter(function (s) { var ps = posOf(s); return sisa.every(function (y) { return benarDi(y, ps, n); }); });
        if (tunggal(C3)) { pilih = sisa; C = C3; }
      });
      if (pilih.length < 3 || pilih.length > 6) continue;
      var pembuka = jenis === "baris" ? "Lima orang, yaitu " + nm.join(", ") + ", duduk berjajar pada lima kursi bernomor 1 sampai 5 dari kiri ke kanan. Arah kanan berarti ke kursi bernomor lebih besar."
        : jenis === "antre" ? "Lima orang, yaitu " + nm.join(", ") + ", mengantre di depan loket. Urutan pertama adalah yang paling depan."
          : "Enam orang, yaitu " + nm.join(", ") + ", duduk mengelilingi meja bundar dengan jarak yang sama dan menghadap ke tengah meja.";
      var badan = pilih.map(function (c) { return teksPetunjuk(c, jenis, nm); }).join("\n");
      var opts, tanya, cekOpsi = null;
      if (q.t === "benar") {
        var kunci = pilih.map(function (c) { return JSON.stringify(c); });
        var cs = semuaPetunjuk(jenis, n).filter(function (c) { return c.t === "pos" || c.t === "adj" || c.t === "before" || c.t === "next"; });
        var tepat = R.shuffle(cs.filter(function (c) { return benarDi(c, p, n) && kunci.indexOf(JSON.stringify(c)) < 0 && !(c.t === "adj" && !c.v); }));
        var salah = R.shuffle(cs.filter(function (c) { return !benarDi(c, p, n) && !(c.t === "adj" && !c.v); }));
        if (!tepat.length || salah.length < 4) continue;
        cekOpsi = [tepat[0]].concat(salah.slice(0, 4));
        opts = cekOpsi.map(function (c) { return teksPetunjuk(c, jenis, nm, true).replace(/\.$/, ""); });
        tanya = "Pernyataan yang pasti benar adalah ...";
      } else if (q.t === "posk") {
        opts = [nm[q.ans]].concat(nm.filter(function (_, i) { return i !== q.ans; }));
        tanya = jenis === "baris" ? (q.k === 0 ? "Siapa yang duduk di kursi paling kiri?" : q.k === n - 1 ? "Siapa yang duduk di kursi paling kanan?" : "Siapa yang duduk di kursi nomor " + (q.k + 1) + "?")
          : (q.k === 0 ? "Siapa yang berada di urutan paling depan?" : q.k === n - 1 ? "Siapa yang berada di urutan paling belakang?" : "Siapa yang berada di urutan ke-" + (q.k + 1) + " dari depan?");
      } else {
        opts = [nm[q.ans]].concat(R.shuffle(nm.filter(function (_, i) { return i !== q.ans && i !== q.x; })).slice(0, 4));
        tanya = "Siapa yang duduk berhadapan dengan " + nm[q.x] + "?";
      }
      var contoh = C.slice(0, jenis === "bundar" ? 1 : 3).map(function (s) { return urutanTeks(s, jenis, nm); });
      var expl = (jenis === "bundar"
        ? "Salah satu susunan yang memenuhi semua syarat (" + contoh[0] + "). Susunan lain yang memenuhi hanyalah hasil memutar atau mencerminkan meja, sehingga "
          + nm[q.x] + " selalu berhadapan dengan " + nm[q.ans] + "."
        : (C.length === 1 ? "Hanya ada satu susunan yang memenuhi semua syarat (" + contoh[0] + ")."
          : "Ada " + C.length + " susunan yang memenuhi semua syarat (" + contoh.join("; ") + (C.length > 3 ? "; dan lainnya" : "") + ").")
          + (q.t === "posk" ? " Pada setiap susunan itu, " + (jenis === "baris" ? "kursi nomor " + (q.k + 1) : "urutan ke-" + (q.k + 1)) + " ditempati " + nm[q.ans] + "."
            : " Jadi yang pasti benar: " + opts[0] + "."));
      return {
        text: pembuka + "\n" + badan + "\n" + tanya, opts: opts, expl: expl,
        _cek: { jenis: "anl", tipe: jenis, n: n, petunjuk: pilih, q: q, opsi: cekOpsi }
      };
    }
    return null;
  }

  // ===================== TIU: analitis kombinasi (memilih anggota tim dengan syarat dan batasan) =====================
  /* Kisi-kisi 2026: analitis = "menyusun atau mengevaluasi kombinasi keputusan yang valid berdasarkan seperangkat syarat
     dan batasan". Semua kemungkinan tim diperiksa (C(6,3) = 20 atau C(6,4) = 15), jadi kunci selalu terbukti. */
  var KOMB_KONTEKS = [
    { tim: "tim verifikasi berkas", bag: ["bagian data", "bagian layanan"] },
    { tim: "panitia seleksi pegawai kontrak", bag: ["bagian kepegawaian", "bagian umum"] },
    { tim: "tim penyusun laporan tahunan", bag: ["bagian perencanaan", "bagian keuangan"] },
    { tim: "tim layanan keliling", bag: ["kantor kecamatan", "kantor kelurahan"] },
    { tim: "tim digitalisasi arsip", bag: ["bagian arsip", "bagian teknologi informasi"] },
    { tim: "delegasi rapat koordinasi", bag: ["unit humas", "unit hukum"] }
  ];
  var ANGKA_KATA = { 3: "tiga", 4: "empat" };
  function bitDi(s, i) { return (s >> i) & 1; }
  function jumlahBit(s) { var c = 0; while (s) { c += s & 1; s >>= 1; } return c; }
  function kombBenar(c, s) {
    if (c.t === "bagian") return (s & c.m1) !== 0 && (s & c.m2) !== 0;
    var a = bitDi(s, c.a), b = c.b == null ? 0 : bitDi(s, c.b);
    switch (c.t) {
      case "pisah": return !(a && b);
      case "jika": return !a || !!b;
      case "salah1": return !!(a || b);
      case "bareng": return a === b;
      case "wajib": return !!a;
    }
    return false;
  }
  function kombTeks(c, nm, bag) {
    var A = nm[c.a], B = c.b == null ? "" : nm[c.b];
    switch (c.t) {
      case "pisah": return A + " dan " + B + " tidak boleh dipilih bersama.";
      case "jika": return "Jika " + A + " dipilih, " + B + " juga harus dipilih.";
      case "salah1": return "Paling sedikit satu dari " + A + " dan " + B + " harus dipilih.";
      case "bareng": return A + " dan " + B + " dipilih bersama-sama atau tidak dipilih sama sekali.";
      case "wajib": return A + " pasti dipilih.";
      case "bagian": return "Tim memuat paling sedikit satu orang dari " + bag[0] + " dan satu orang dari " + bag[1] + ".";
    }
    return "";
  }
  function timTeks(s, nm) { var o = []; for (var i = 0; i < nm.length; i++) if (bitDi(s, i)) o.push(nm[i]); return o.join(", "); }
  function daftarDan(list) { return list.length < 2 ? list.join("") : list.slice(0, -1).join(", ") + ", dan " + list[list.length - 1]; }
  function kombValid(C, n, k) {
    var out = [];
    for (var s = 0; s < (1 << n); s++) if (jumlahBit(s) === k && C.every(function (c) { return kombBenar(c, s); })) out.push(s);
    return out;
  }
  function kombinasi(R) {
    var n = 6;
    for (var coba = 0; coba < 150; coba++) {
      var k = R.chance(0.6) ? 3 : 4, K = R.pick(KOMB_KONTEKS), nm = R.shuffle(ORANG).slice(0, n).sort(), i, x;
      var semua = kombValid([], n, k), valid = semua.slice(), C = [], dipakai = {}, bagian = null;
      if (R.chance(0.35)) {
        var u = R.shuffle([0, 1, 2, 3, 4, 5]), m1 = (1 << u[0]) | (1 << u[1]) | (1 << u[2]);
        bagian = { t: "bagian", m1: m1, m2: 63 ^ m1 };
        valid = valid.filter(function (t) { return kombBenar(bagian, t); });
      }
      var pool = [];
      for (var a = 0; a < n; a++) {
        pool.push({ t: "wajib", a: a });
        for (var b = 0; b < n; b++) if (a !== b) {
          pool.push({ t: "jika", a: a, b: b }, { t: "jika", a: a, b: b });
          if (a < b) pool.push({ t: "pisah", a: a, b: b }, { t: "salah1", a: a, b: b }, { t: "bareng", a: a, b: b });
        }
      }
      pool = R.shuffle(pool);
      var target = R.int(3, 4);
      for (i = 0; i < pool.length && C.length < target; i++) {
        var c = pool[i], kunci = c.t === "wajib" ? "w" : Math.min(c.a, c.b) + "-" + Math.max(c.a, c.b);
        if (dipakai[kunci]) continue;
        var v2 = valid.filter(function (t) { return kombBenar(c, t); });
        if (v2.length === valid.length || v2.length === 0) continue;
        C.push(c); valid = v2; dipakai[kunci] = 1;
      }
      var D = (bagian ? [bagian] : []).concat(C);
      for (i = D.length - 1; i >= 0; i--) {
        var tanpa = D.slice(0, i).concat(D.slice(i + 1));
        if (kombValid(tanpa, n, k).length === valid.length) D = tanpa;
      }
      if (D.length < 3 || valid.length < 1 || valid.length > 6) continue;
      if (bagian && D.indexOf(bagian) < 0) bagian = null;
      var tipe = R.pick(["valid", "valid", "pasti", "mustahil", "jumlah"]), opts, tanya, expl, cek, fix = false, kunciIdx = 0;
      var daftarValid = valid.map(function (t) { return timTeks(t, nm); }).join("; ");
      if (tipe === "valid") {
        var jaw = R.pick(valid);
        var info = semua.filter(function (t) { return valid.indexOf(t) < 0; }).map(function (t) {
          return { s: t, v: D.map(function (c, j) { return kombBenar(c, t) ? -1 : j; }).filter(function (j) { return j >= 0; }) };
        });
        info = R.shuffle(info).sort(function (p, q) { return p.v.length - q.v.length; });
        var pilih = [], pakaiV = {};
        info.forEach(function (it) { if (pilih.length < 4 && !pakaiV[it.v[0]]) { pilih.push(it); pakaiV[it.v[0]] = 1; } });
        info.forEach(function (it) { if (pilih.length < 4 && pilih.indexOf(it) < 0) pilih.push(it); });
        if (pilih.length < 4) continue;
        opts = [timTeks(jaw, nm)].concat(pilih.map(function (it) { return timTeks(it.s, nm); }));
        tanya = "Susunan " + K.tim + " yang memenuhi semua syarat adalah ...";
        expl = "Di antara pilihan, hanya " + opts[0] + " yang memenuhi semua syarat. " +
          pilih.map(function (it) { return opts[pilih.indexOf(it) + 1] + " melanggar syarat (" + (it.v[0] + 1) + ")"; }).join("; ") + ".";
        cek = { tipe: "valid", jaw: jaw, salah: pilih.map(function (it) { return it.s; }) };
      } else if (tipe === "pasti") {
        var calon = [];
        for (x = 0; x < n; x++) {
          var vx = valid.filter(function (t) { return bitDi(t, x); });
          if (!vx.length || vx.length === valid.length && valid.length === 1) continue;
          var irisan = vx.reduce(function (acc, t) { return acc & t; }, 63) & ~(1 << x);
          if (jumlahBit(irisan) !== 1) continue;
          var y = 0; while (!bitDi(irisan, y)) y++;
          // jangan pakai jawaban yang tertulis langsung di syarat (jika x maka y, x dan y bersama, atau y wajib)
          var langsung = D.some(function (c) {
            return (c.t === "jika" && c.a === x && c.b === y) || (c.t === "bareng" && (c.a === x && c.b === y || c.a === y && c.b === x)) || (c.t === "wajib" && c.a === y);
          });
          if (!langsung) calon.push({ x: x, y: y, vx: vx });
        }
        if (!calon.length) continue;
        var cc = R.pick(calon);
        opts = [nm[cc.y]].concat(nm.filter(function (_, j) { return j !== cc.x && j !== cc.y; }));
        tanya = "Jika " + nm[cc.x] + " dipilih, siapa yang pasti ikut dipilih?";
        expl = "Susunan yang memuat " + nm[cc.x] + " dan memenuhi semua syarat: " + cc.vx.map(function (t) { return timTeks(t, nm); }).join("; ") + ". " +
          nm[cc.y] + " ada di setiap susunan itu, sedangkan pilihan lain tidak selalu ikut.";
        cek = { tipe: "pasti", x: cc.x, y: cc.y };
      } else if (tipe === "mustahil") {
        var tidak = [], bisa = [];
        for (x = 0; x < n; x++) (valid.some(function (t) { return bitDi(t, x); }) ? bisa : tidak).push(x);
        if (tidak.length !== 1 || bisa.length < 4) continue;
        opts = [nm[tidak[0]]].concat(R.shuffle(bisa).slice(0, 4).map(function (j) { return nm[j]; }));
        tanya = "Siapa yang tidak mungkin menjadi anggota " + K.tim + "?";
        expl = "Susunan yang memenuhi semua syarat hanyalah: " + daftarValid + ". " + nm[tidak[0]] + " tidak ada di satu pun susunan itu.";
        cek = { tipe: "mustahil", z: tidak[0] };
      } else {
        var nv = valid.length, angka = [nv];
        [nv + 1, nv - 1, nv + 2, nv - 2, nv + 3, nv + 4].forEach(function (v) { if (v >= 1 && angka.length < 5) angka.push(v); });
        angka.sort(function (p, q) { return p - q; });
        opts = angka.map(String); fix = true; kunciIdx = angka.indexOf(nv);
        tanya = "Banyak susunan " + K.tim + " yang memenuhi semua syarat adalah ...";
        expl = "Ada " + nv + " susunan yang memenuhi semua syarat: " + daftarValid + ".";
        cek = { tipe: "jumlah", nv: nv };
      }
      var anggota = function (m) { return daftarDan(nm.filter(function (_, j) { return bitDi(m, j); })); };
      var pembuka = "Dari enam pegawai, yaitu " + daftarDan(nm) + ", akan dipilih tepat " + ANGKA_KATA[k] + " orang untuk " + K.tim + "." +
        (bagian ? " " + anggota(bagian.m1) + " berasal dari " + K.bag[0] + ", sedangkan " + anggota(bagian.m2) + " dari " + K.bag[1] + "." : "") + " Syaratnya:";
      var badan = D.map(function (c, j) { return "(" + (j + 1) + ") " + kombTeks(c, nm, K.bag); }).join("\n");
      var g = { text: pembuka + "\n" + badan + "\n" + tanya, opts: opts, expl: expl, _cek: { jenis: "komb", n: n, k: k, syarat: D, cek: cek } };
      if (fix) { g.fix = true; g.a = kunciIdx; }
      return g;
    }
    return null;
  }

  // ===================== pendaftaran =====================
  /* [fungsi, bobot, sangat sering keluar?] — "sangat" mengikuti pola yang dilaporkan di 3 laporan peserta atau lebih. */
  var JENIS = {
    pilar: [[silaKasus, 4, 1], [silaButir, 1, 1], [lembaga, 4, 1], [sejarahPilar, 2, 1], [pasalKasus, 2, 1], [pasalPenerapan, 2, 1], [pasalBunyi, 1, 0], [pasalIsi, 1, 0]],
    nas: [[sejarahNas, 3, 1], [hari, 2, 0]],
    bind: [[baku, 1, 0]],
    sil: [[silogisme, 1, 1]],
    ana: [[analogi, 1, 0]], // analogi kata tidak lagi tercantum di kisi-kisi 2026
    anl: [[analitis, 1, 1], [kombinasi, 1, 1]] // kombinasi: rumusan analitis kisi-kisi 2026
  };
  function unik(opts) {
    if (!opts || opts.length !== 5) return false;
    var seen = {};
    for (var i = 0; i < 5; i++) {
      var k = String(opts[i]).toLowerCase();
      if (!opts[i] || seen[k]) return false;
      seen[k] = 1;
    }
    return true;
  }
  SKD.acak = {
    punya: function (materi) { return !!JENIS[materi]; },
    bisa: function (materi, opt) { return (JENIS[materi] || []).some(function (j) { return !(opt && opt.sangat) || j[2]; }); },
    generate: function (materi, R, opt) {
      var list = (JENIS[materi] || []).filter(function (j) { return !(opt && opt.sangat) || j[2]; });
      if (!list.length) return null;
      var tot = list.reduce(function (a, j) { return a + j[1]; }, 0);
      for (var tries = 0; tries < 30; tries++) {
        var x = R.next() * tot, j = list[0];
        for (var i = 0; i < list.length; i++) { x -= list[i][1]; if (x < 0) { j = list[i]; break; } }
        var g = j[0](R);
        if (g && unik(g.opts)) { g.sangat = !!j[2]; g.jenis = j[0].name || ""; return g; }
      }
      return null;
    },
    _jenis: JENIS,
    _kat: { model: katModel, teks: katTeks, S: S, bentuk: KAT_BENTUK, tema: KAT_TEMA },
    _prop: { model: propModel, teks: propTeks, bentuk: PROP_BENTUK, tema: PROP_TEMA },
    _fn: { silaKasus: silaKasus, silaButir: silaButir, lembaga: lembaga, pasalKasus: pasalKasus, pasalBunyi: pasalBunyi, pasalIsi: pasalIsi,
      pasalPenerapan: pasalPenerapan, sejarahPilar: sejarahPilar, sejarahNas: sejarahNas, hari: hari, baku: baku,
      silKategoris: silKategoris, silProposisi: silProposisi, analogi: analogi, analitis: analitis, kombinasi: kombinasi },
    _anl: { susunan: semuaSusunan, benar: benarDi, pos: posOf },
    _komb: { benar: kombBenar, valid: kombValid, bit: bitDi }
  };
})();
