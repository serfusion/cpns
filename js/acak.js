/* Pembangkit soal acak dari tabel fakta (data/fakta.js) dan pola logika.
   TWK: kasus sila, butir Pancasila, wewenang lembaga negara, pasal UUD (kasus, bunyi, isi), sejarah, hari nasional, kata baku.
   TIU: silogisme. Setiap kesimpulan silogisme dibuktikan dengan memeriksa semua kemungkinan (model) sehingga hanya satu
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

  // ===================== pendaftaran =====================
  /* [fungsi, bobot, sangat sering keluar?] — "sangat" mengikuti pola yang dilaporkan di 3 laporan peserta atau lebih. */
  var JENIS = {
    pilar: [[silaKasus, 4, 1], [silaButir, 1, 1], [lembaga, 4, 1], [sejarahPilar, 2, 1], [pasalKasus, 2, 0], [pasalBunyi, 1, 0], [pasalIsi, 1, 0]],
    nas: [[sejarahNas, 3, 1], [hari, 2, 0]],
    bind: [[baku, 1, 0]],
    sil: [[silogisme, 1, 1]]
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
      sejarahPilar: sejarahPilar, sejarahNas: sejarahNas, hari: hari, baku: baku, silKategoris: silKategoris, silProposisi: silProposisi }
  };
})();
