/* Mesin kuis: normalisasi bank soal, pengacakan, pembangkit deret angka,
   penyusunan paket latihan/simulasi, dan penilaian. Tidak menyentuh DOM. */
(function () {
  "use strict";
  var SKD = (window.SKD = window.SKD || {});
  var CFG = SKD.config;

  // ---------- acak ----------
  function makeRng(seed) {
    var s = seed >>> 0;
    function next() {
      s = (s + 0x6d2b79f5) >>> 0;
      var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    return {
      next: next,
      int: function (a, b) { return a + Math.floor(next() * (b - a + 1)); },
      pick: function (arr) { return arr[Math.floor(next() * arr.length)]; },
      chance: function (p) { return next() < p; },
      shuffle: function (arr) {
        var a = arr.slice();
        for (var i = a.length - 1; i > 0; i--) {
          var j = Math.floor(next() * (i + 1)), t = a[i];
          a[i] = a[j];
          a[j] = t;
        }
        return a;
      }
    };
  }
  var RNG = makeRng((Date.now() ^ (Math.random() * 4294967296)) >>> 0);

  function hash(str) {
    var h = 0x811c9dc5;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return (h >>> 0).toString(36);
  }

  // ---------- bank ----------
  var cache = null, byId = {}, byMateri = {}, materiById = {}, sectionById = {};
  CFG.materi.forEach(function (m) { materiById[m.id] = m; });
  CFG.sections.forEach(function (s) { sectionById[s.id] = s; });

  function bank() {
    if (cache) return cache;
    cache = [];
    byId = {};
    byMateri = {};
    SKD.bankRaw.forEach(function (r) {
      var q = {
        id: hash(r.sec + "|" + (r.p || "") + "|" + r.q),
        sec: r.sec, m: r.m, q: r.q, o: r.o, a: r.a || 0, fix: !!r.fix,
        x: r.x || "", p: r.p || null, tb: r.tb || null, hot: !!r.h, sangat: (r.h || 0) >= 2, baru: !!r.b, k26: !!r.k26, setara: !!r.v, pk: r.v ? (r.pk || 1) : 0
      };
      cache.push(q);
      byId[q.id] = q;
      (byMateri[q.m] = byMateri[q.m] || []).push(q);
    });
    return cache;
  }
  function poolOf(materi) { bank(); return byMateri[materi] || []; }

  // ---------- pembangkit deret angka ----------
  function numOpts(ans, cands) {
    var out = [ans], seen = {};
    seen[ans] = 1;
    cands.forEach(function (c) {
      if (out.length < 5 && c > 0 && isFinite(c) && !seen[c]) { seen[c] = 1; out.push(c); }
    });
    for (var k = 1; out.length < 5; k++) {
      [ans + k, ans - k].forEach(function (c) {
        if (out.length < 5 && c > 0 && !seen[c]) { seen[c] = 1; out.push(c); }
      });
    }
    return out.map(String);
  }
  function plus(n) { return (n < 0 ? "−" : "+") + Math.abs(n); }
  var DERET = [
    function tingkat(R) {
      var a = R.int(1, 12), d = R.int(1, 6), dd = R.int(1, 4), t = [a], diffs = [], diff = d;
      for (var i = 1; i <= 6; i++) { t.push(t[i - 1] + diff); diffs.push(diff); diff += dd; }
      var ans = t[6], last = diffs[5];
      return {
        shown: t.slice(0, 6), opts: numOpts(ans, [t[5] + diffs[4], ans + dd, ans - 1, ans + 1, ans + 2 * dd, ans - 2]),
        expl: "Selisih antarsuku bertambah " + dd + ": +" + diffs.slice(0, 5).join(", +") + ". Selisih berikutnya +" + last + ", sehingga " + t[5] + " + " + last + " = " + ans + "."
      };
    },
    function selang(R) {
      var a = R.int(2, 15), p = R.int(2, 7), b = R.int(30, 60), q = R.pick([-6, -5, -4, -3, -2, 3, 4, 5, 8, 9].filter(function (x) { return x !== p; }));
      var A = [], B = [], shown = [], i;
      for (i = 0; i < 5; i++) { A.push(a + i * p); B.push(b + i * q); }
      for (i = 0; i < 4; i++) shown.push(A[i], B[i]);
      var ans = A[4] + ", " + B[4];
      var cands = [A[4] + ", " + B[3], A[4] + p + ", " + B[4], B[4] + ", " + A[4], A[4] + 1 + ", " + (B[4] - 1), A[4] + ", " + (B[4] + q), A[4] - 1 + ", " + B[4], A[3] + ", " + B[4]];
      var out = [ans], seen = {};
      seen[ans] = 1;
      R.shuffle(cands).forEach(function (c) { if (out.length < 5 && !seen[c]) { seen[c] = 1; out.push(c); } });
      return {
        shown: shown, two: true, opts: out,
        expl: "Ada dua deret yang berselang. Suku ganjil: " + A.slice(0, 4).join(", ") + " (pola " + plus(p) + "). Suku genap: " + B.slice(0, 4).join(", ") +
          " (pola " + plus(q) + "). Dua suku berikutnya adalah " + A[4] + " dan " + B[4] + "."
      };
    },
    function kaliTambah(R) {
      var m = R.pick([2, 2, 3]), c = R.pick([-2, -1, 1, 2, 3]), a = R.int(2, 5);
      if (a * m + c <= a) a += 2;
      var n = m === 2 ? 6 : 5, t = [a];
      for (var i = 1; i <= n; i++) t.push(t[i - 1] * m + c);
      var ans = t[n], last = t[n - 1];
      return {
        shown: t.slice(0, n), opts: numOpts(ans, [last * m, last * m - c, ans + c, ans - 1, ans + 1, last + (last - t[n - 2])]),
        expl: "Setiap suku adalah suku sebelumnya dikali " + m + " lalu " + (c > 0 ? "ditambah " + c : "dikurangi " + -c) + ". " + last + " × " + m + " " + plus(c).replace(/([+−])/, "$1 ") + " = " + ans + "."
      };
    },
    function opSelang(R) {
      var v = R.int(0, 2), t, i, d1, d2, expl, a;
      if (v === 0) {
        a = R.int(1, 4); var p = R.int(1, 5); t = [a];
        for (i = 1; i <= 7; i++) t.push(i % 2 ? t[i - 1] + p : t[i - 1] * 2);
        d1 = "+" + p; d2 = "×2";
      } else if (v === 1) {
        a = R.int(5, 20); var p2 = R.int(4, 9), q2 = R.int(1, 3); t = [a];
        for (i = 1; i <= 7; i++) t.push(i % 2 ? t[i - 1] + p2 : t[i - 1] - q2);
        d1 = "+" + p2; d2 = "−" + q2;
      } else {
        a = R.int(4, 7); var q3 = R.int(1, 3); t = [a];
        for (i = 1; i <= 7; i++) t.push(i % 2 ? t[i - 1] * 2 : t[i - 1] - q3);
        d1 = "×2"; d2 = "−" + q3;
      }
      var ans = t[7], last = t[6];
      expl = "Polanya berselang: " + d1 + ", " + d2 + ", " + d1 + ", " + d2 + ", dan seterusnya. Langkah berikutnya adalah " + d1 + ", sehingga " + last + " " + d1.replace(/^(.)/, "$1 ") + " = " + ans + ".";
      return { shown: t.slice(0, 7), opts: numOpts(ans, [last + (last - t[5]), last * 2, last + 1, ans + 1, ans - 1, ans + 2, last + (t[5] - t[4])]), expl: expl };
    },
    function fibo(R) {
      var a = R.int(1, 5), b = R.int(a, a + 4), t = [a, b];
      for (var i = 2; i <= 7; i++) t.push(t[i - 1] + t[i - 2]);
      var ans = t[7];
      return {
        shown: t.slice(0, 7), opts: numOpts(ans, [t[6] + t[4], t[6] * 2, ans - 1, ans + 1, t[6] + (t[6] - t[5]) + 1, ans + 2]),
        expl: "Setiap suku adalah jumlah dua suku sebelumnya: " + t[5] + " + " + t[6] + " = " + ans + "."
      };
    },
    function kuadrat(R) {
      var k = R.int(2, 4), c = R.int(-1, 6), t = [];
      for (var i = 0; i <= 6; i++) t.push((k + i) * (k + i) + c);
      var ans = t[6], n = k + 6;
      return {
        shown: t.slice(0, 6), opts: numOpts(ans, [t[5] + (t[5] - t[4]), ans - 2, ans + 2, n * n, ans + 1, ans - 1, (n + 1) * (n + 1) + c]),
        expl: "Polanya bilangan kuadrat berurutan" + (c ? (c > 0 ? " ditambah " + c : " dikurangi " + -c) : "") + ": " + k + "², " + (k + 1) + "², " + (k + 2) + "², dan seterusnya. Suku berikutnya " + n + "² " +
          (c ? plus(c).replace(/([+−])/, "$1 ") + " " : "") + "= " + ans + "."
      };
    },
    function geo(R) {
      var t, i, ans, expl;
      if (R.chance(0.3)) {
        var e = R.int(1, 5) * 2 + 1; t = [e * 64];
        for (i = 1; i <= 5; i++) t.push(t[i - 1] / 2);
        ans = t[5];
        return { shown: t.slice(0, 5), opts: numOpts(ans, [ans * 2 - e, ans + e, ans - e, t[4] - (t[3] - t[4]) + e, ans + 2, ans - 2]), expl: "Setiap suku adalah setengah dari suku sebelumnya: " + t[4] + " ÷ 2 = " + ans + "." };
      }
      var a = R.int(1, 6), r = R.pick([2, 3]), n = r === 2 ? 6 : 5;
      t = [a];
      for (i = 1; i <= n; i++) t.push(t[i - 1] * r);
      ans = t[n];
      expl = "Setiap suku adalah suku sebelumnya dikali " + r + ": " + t[n - 1] + " × " + r + " = " + ans + ".";
      return { shown: t.slice(0, n), opts: numOpts(ans, [t[n - 1] + (t[n - 1] - t[n - 2]), ans - a, ans + a, t[n - 1] * (r + 1), ans + r, ans - r]), expl: expl };
    },
    function selisihKali(R) {
      var a = R.int(1, 9), d = R.int(1, 3), t = [a], diff = d, diffs = [];
      for (var i = 1; i <= 6; i++) { t.push(t[i - 1] + diff); diffs.push(diff); diff *= 2; }
      var ans = t[6];
      return {
        shown: t.slice(0, 6), opts: numOpts(ans, [t[5] + diffs[4], t[5] + diffs[4] + d, ans - d, ans + d, t[5] * 2, ans + 1, ans - 1]),
        expl: "Selisih antarsuku selalu dikali 2: +" + diffs.slice(0, 5).join(", +") + ". Selisih berikutnya +" + diffs[5] + ", sehingga " + t[5] + " + " + diffs[5] + " = " + ans + "."
      };
    }
  ];
  function genDeret(R) {
    for (var tries = 0; tries < 20; tries++) {
      var g = R.pick(DERET)(R), seen = {}, ok = g.opts.length === 5;
      g.opts.forEach(function (o) { if (seen[o]) ok = false; seen[o] = 1; });
      if (ok) {
        return {
          text: "Tentukan " + (g.two ? "dua suku" : "suku") + " berikutnya dari deret:\n" + g.shown.join(", ") + ", ...",
          opts: g.opts, expl: g.expl
        };
      }
    }
    return null;
  }

  // ---------- soal siap tampil ----------
  function present(q, R) {
    R = R || RNG;
    var order = q.fix ? [0, 1, 2, 3, 4] : R.shuffle([0, 1, 2, 3, 4]), isTkp = q.sec === "tkp", best = 0;
    var opts = order.map(function (oi, i) {
      var pts = isTkp ? 5 - oi : oi === q.a ? 5 : 0;
      if (pts === 5) best = i;
      return { t: q.o[oi], pts: pts };
    });
    return {
      id: q.id, sec: q.sec, m: q.m, hot: q.hot, sangat: q.sangat, baru: q.baru, text: q.q, passage: q.p ? SKD.passages[q.p] || null : null,
      table: q.tb, stem: null, opts: opts, best: best, expl: q.x
    };
  }
  /** Soal yang dibangkitkan otomatis. opt.sangat: hanya jenis yang sangat sering keluar. */
  function generate(materi, R, opt) {
    R = R || RNG;
    opt = opt || {};
    var order = R.shuffle([0, 1, 2, 3, 4]), best = 0, g, opts, mt = materiById[materi];
    if (materi.indexOf("fig-") === 0) {
      g = SKD.fig.generate(materi, R, !!opt.sangat);
      opts = order.map(function (oi, i) {
        if (oi === 0) best = i;
        var o = g.opts[oi];
        return typeof o === "string" ? { t: o, pts: oi === 0 ? 5 : 0 } : { fig: o, pts: oi === 0 ? 5 : 0 };
      });
      return {
        id: null, gen: materi, sec: "tiu", m: materi, hot: true, sangat: g.layout === "matriks", text: g.text, passage: null, table: null,
        stem: g.figs.length ? { layout: g.layout, figs: g.figs } : null, opts: opts, best: best, expl: g.expl
      };
    }
    if (SKD.acak && SKD.acak.punya(materi)) {
      g = SKD.acak.generate(materi, R, opt);
      if (g) {
        if (g.fix) order = [0, 1, 2, 3, 4];
        var kunci = g.fix ? g.a : 0;
        opts = order.map(function (oi, i) { if (oi === kunci) best = i; return { t: g.opts[oi], pts: oi === kunci ? 5 : 0 }; });
        return {
          id: null, gen: materi, acak: true, fix: !!g.fix, sec: mt ? mt.sec : "twk", m: materi, hot: true, sangat: !!g.sangat,
          text: g.text, passage: null, table: null, stem: null, opts: opts, best: best, expl: g.expl
        };
      }
    }
    g = genDeret(R);
    opts = order.map(function (oi, i) { if (oi === 0) best = i; return { t: g.opts[oi], pts: oi === 0 ? 5 : 0 }; });
    return { id: null, gen: materi, sec: "tiu", m: materi, hot: true, sangat: true, text: g.text, passage: null, table: null, stem: null, opts: opts, best: best, expl: g.expl };
  }

  // ---------- pemilihan ----------
  function needsReview(sec, st) { return sec === "tkp" ? st[4] <= 3 : st[4] < 5; }
  function tierOf(q, stats) {
    var st = stats[q.id];
    if (!st) return 0;
    if (needsReview(q.sec, st)) return 1;
    return st[2] < 2 ? 2 : 3;
  }
  function lolos(q, opt) { return (!opt.hot || q.hot) && (!opt.sangat || q.sangat) && (!opt.baru || q.baru) && (!opt.k26 || q.k26) && (!opt.setara || q.setara) && (!opt.pk || q.pk === opt.pk); }
  /** Apakah materi ini bisa diisi soal bangkitan untuk filter opt. */
  function canGen(m, opt) {
    if (!m.gen || opt.baru || opt.k26 || opt.setara) return false;
    if (!opt.sangat) return true;
    if (m.id === "fig-mat" || m.id === "der") return true; // penalaran matriks (pola 9 kotak); deret angka (4 laporan)
    return !!(SKD.acak && SKD.acak.bisa(m.id, opt));
  }
  function pickBank(materi, n, R, stats, opt) {
    var pool = poolOf(materi).filter(function (q) { return lolos(q, opt) && !(opt.exclude && opt.exclude[q.id]); });
    var sh = R.shuffle(pool).map(function (q) { return { q: q, t: tierOf(q, stats) }; });
    sh.sort(function (a, b) { return a.t - b.t; });
    return sh.slice(0, n).map(function (x) { return x.q; });
  }
  function capacity(m, opt) {
    if (canGen(m, opt)) return Infinity;
    if (opt.acak) return 0;
    return poolOf(m.id).filter(function (q) { return lolos(q, opt) && !(opt.exclude && opt.exclude[q.id]); }).length;
  }
  /** Bagi n soal ke beberapa materi sebanding kuotanya (metode D'Hondt), dibatasi stok soal. */
  function allocate(n, mats, opt) {
    var alloc = {}, cap = {};
    mats.forEach(function (m) { alloc[m.id] = 0; cap[m.id] = capacity(m, opt); });
    for (var i = 0; i < n; i++) {
      var bestM = null, bestV = -1;
      mats.forEach(function (m) {
        if (alloc[m.id] >= cap[m.id]) return;
        var v = m.quota / (alloc[m.id] + 1);
        if (v > bestV) { bestV = v; bestM = m; }
      });
      if (!bestM) break;
      alloc[bestM.id]++;
    }
    return alloc;
  }
  function itemsFor(m, n, R, stats, opt) {
    var out = [], nGen = 0, i;
    if (canGen(m, opt)) {
      nGen = m.gen >= 1 || opt.acak ? n : Math.round(n * m.gen);
      var avail = poolOf(m.id).filter(function (q) { return lolos(q, opt); }).length;
      if (n - nGen > avail) nGen = n - avail;
    }
    pickBank(m.id, n - nGen, R, stats, opt).forEach(function (q) { out.push(present(q, R)); });
    for (i = 0; i < nGen; i++) out.push(generate(m.id, R, opt));
    return out;
  }
  function wrap(pq) { return { pq: pq, chosen: null, pts: null, done: false, retry: false }; }

  /** opts: { materi: [id], n, hot, sangat, baru, acak, k26 (hanya soal tambahan kisi-kisi 2026) } */
  function buildPractice(opts, stats, R) {
    R = R || RNG;
    var mats = opts.materi.map(function (id) { return materiById[id]; }).filter(Boolean);
    var alloc = allocate(opts.n, mats, opts), out = [];
    CFG.sections.forEach(function (s) {
      var part = [];
      mats.forEach(function (m) {
        if (m.sec === s.id && alloc[m.id]) part = part.concat(itemsFor(m, alloc[m.id], R, stats, opts));
      });
      out = out.concat(R.shuffle(part));
    });
    return out.map(wrap);
  }
  /** scale: "full" (110 soal) | "mini" (55 soal) */
  function buildSimulation(scale, stats, R) {
    R = R || RNG;
    var out = [];
    CFG.sections.forEach(function (s) {
      var mats = CFG.materi.filter(function (m) { return m.sec === s.id; });
      var n = scale === "mini" ? simCount(s, "mini") : s.count;
      var alloc = allocate(n, mats, {}), part = [];
      mats.forEach(function (m) { if (alloc[m.id]) part = part.concat(itemsFor(m, alloc[m.id], R, stats, {})); });
      out = out.concat(R.shuffle(part));
    });
    return out.map(wrap);
  }
  /** Paket tryout tetap: soal, urutan, dan pilihan selalu sama untuk nomor paket yang sama. */
  function buildPackage(no, scale) {
    return buildSimulation(scale || "full", {}, makeRng(7919 * no + (scale === "mini" ? 104729 : 0)));
  }
  /** Tryout setara CAT paket no: TWK dan TKP dari soal berpilihan seimbang paket itu (data/setara*.js, v: 1, pk: no).
      TIU memakai materi tiuIds (mis. hanya materi tanpa hitungan berat) atau semua materi TIU bila tiuIds kosong.
      Bila stok paket itu kurang, sisanya diisi soal setara paket lain, lalu soal biasa, agar jumlah tetap 30/35/45. */
  function buildSetara(no, scale, tiuIds) {
    var R = makeRng(104723 * (no || 1) + (scale === "mini" ? 7 : 0)), out = [];
    CFG.sections.forEach(function (s) {
      var mats = CFG.materi.filter(function (m) { return m.sec === s.id && (s.id !== "tiu" || !tiuIds || tiuIds.indexOf(m.id) >= 0); });
      var n = scale === "mini" ? simCount(s, "mini") : s.count, part = [];
      if (s.id === "tiu") {
        var a0 = allocate(n, mats, {});
        mats.forEach(function (m) { if (a0[m.id]) part = part.concat(itemsFor(m, a0[m.id], R, {}, {})); });
      } else {
        var opt = { setara: true, pk: no || 1 }, alloc = allocate(n, mats, opt), dapat = 0;
        mats.forEach(function (m) { if (alloc[m.id]) { var got = itemsFor(m, alloc[m.id], R, {}, opt); part = part.concat(got); dapat += got.length; } });
        if (dapat < n) {
          var pakai = {}; part.forEach(function (pq) { if (pq.id) pakai[pq.id] = 1; });
          [{ setara: true, exclude: pakai }, { exclude: pakai }].forEach(function (o2) {
            if (dapat >= n) return;
            var sisa = allocate(n - dapat, mats, o2);
            mats.forEach(function (m) {
              if (!sisa[m.id]) return;
              var got = itemsFor(m, sisa[m.id], R, {}, o2);
              got.forEach(function (pq) { if (pq.id) pakai[pq.id] = 1; });
              part = part.concat(got); dapat += got.length;
            });
          });
        }
      }
      out = out.concat(R.shuffle(part));
    });
    return out.map(wrap);
  }
  /** Nomor paket tryout setara CAT yang tersedia di bank soal, urut naik. */
  function setaraPaket() {
    bank();
    var ada = {};
    cache.forEach(function (q) { if (q.setara && q.sec !== "tiu") ada[q.pk] = 1; });
    return Object.keys(ada).map(Number).sort(function (a, b) { return a - b; });
  }
  function simCount(sec, scale) {
    if (scale !== "mini") return sec.count;
    return { twk: 15, tiu: 18, tkp: 22 }[sec.id];
  }
  function buildFromIds(ids, R) {
    R = R || RNG;
    bank();
    var qs = ids.map(function (id) { return byId[id]; }).filter(Boolean);
    var out = [];
    CFG.sections.forEach(function (s) {
      out = out.concat(R.shuffle(qs.filter(function (q) { return q.sec === s.id; })).map(function (q) { return present(q, R); }));
    });
    return out.map(wrap);
  }
  /** Soal yang sama, opsi diacak ulang (untuk ulangan dalam sesi). */
  function again(pq, R) {
    R = R || RNG;
    if (pq.id && byId[pq.id]) return present(byId[pq.id], R);
    var copy = JSON.parse(JSON.stringify(pq)), bestOpt = copy.opts[copy.best];
    if (copy.fix) return copy;
    copy.opts = R.shuffle(copy.opts);
    copy.best = copy.opts.indexOf(bestOpt);
    return copy;
  }

  // ---------- penilaian ----------
  function score(items) {
    var res = { sec: {}, materi: {}, total: 0, max: 0, answered: 0, count: 0 };
    CFG.sections.forEach(function (s) { res.sec[s.id] = { pts: 0, max: 0, n: 0, answered: 0, right: 0 }; });
    items.forEach(function (it) {
      if (it.retry) return;
      var s = res.sec[it.pq.sec], m = (res.materi[it.pq.m] = res.materi[it.pq.m] || { pts: 0, max: 0, n: 0, answered: 0, right: 0 });
      [s, m].forEach(function (b) {
        b.n++;
        b.max += 5;
        if (it.chosen != null) {
          b.answered++;
          b.pts += it.pts;
          if (it.pts === 5) b.right++;
        }
      });
      res.count++;
      res.max += 5;
      if (it.chosen != null) { res.answered++; res.total += it.pts; }
    });
    return res;
  }

  SKD.engine = {
    rng: makeRng, RNG: RNG, hash: hash, bank: bank, poolOf: poolOf,
    byId: function (id) { bank(); return byId[id]; },
    materi: function (id) { return materiById[id]; },
    section: function (id) { return sectionById[id]; },
    present: present, generate: generate, genDeret: genDeret, again: again,
    buildPractice: buildPractice, buildSimulation: buildSimulation, buildPackage: buildPackage, buildFromIds: buildFromIds, buildSetara: buildSetara, setaraPaket: setaraPaket,
    simCount: simCount, allocate: allocate, needsReview: needsReview, score: score, canGen: canGen, lolos: lolos,
    reset: function () { cache = null; }
  };
})();
